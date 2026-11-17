#!/usr/bin/env node
/** Automated read-only audit of all 47 public pages in Chromium.
 * No lead forms are completed or submitted and no account data is accessed.
 * WCAG A/AA + responsive overflow at 390px and 1280px.
 */
import {writeFile,mkdir} from "node:fs/promises";
import {setTimeout as sleep} from "node:timers/promises";
import {chromium} from "playwright";
import axe from "axe-core";
import {PAGE_PATHS} from "./page-navigation.mjs";
import {toPublicRoute} from "./public-routes.mjs";

const localPreview=process.env.A11Y_LOCAL_PREVIEW==="1";
const origin=localPreview?"http://127.0.0.1:4187":"https://twoja-sprawa.pages.dev";
// PR previews have no production release fingerprint; main still verifies SHA.
const sha=localPreview?"":(process.env.GITHUB_SHA||"").toLowerCase();
const route=path=>{
 const source=path==="index.html"?"/":path.endsWith("/index.html")?"/"+path.slice(0,-"index.html".length):"/"+path;
 return toPublicRoute(source);
};
const work=PAGE_PATHS.map(path=>({path,route:route(path)}));
if(work.length!==47||new Set(work.map(x=>x.route)).size!==47)throw Error("Expected 47 unique canonical public pages");
const output={site:origin,mode:localPreview?"unpublished-PR-preview":"deployed-main",expectedCommit:sha||null,checked:[],failures:[],skipped:[]};
const started=Date.now();
if(sha){
 let ready=false,latest="";
 while(Date.now()-started<180000){
  try{
   const r=await fetch(origin+"/release-info.json?audit="+Date.now(),{signal:AbortSignal.timeout(15000),headers:{"Cache-Control":"no-cache"}});
   if(r.ok){
    const fingerprint=await r.json();
    latest=fingerprint.commit||"null";
    if(fingerprint.commit===sha){ready=true;break;}
   }
  }catch{}
  await sleep(4500);
 }
 if(!ready)throw new Error("Public deployment did not reach commit "+sha.slice(0,8)+", latest "+latest);
}
if(localPreview){
 // Preview branches must be nonindexable even when source pages are approved
 // for Google on main. Verify both bot-facing files before browser QA.
 const [robotsResponse,headersResponse]=await Promise.all([
  fetch(origin+"/robots.txt"),fetch(origin+"/_headers")
 ]);
 if(!robotsResponse.ok||!headersResponse.ok)throw Error("Preview bot-control files missing");
 const [robots,headers]=await Promise.all([robotsResponse.text(),headersResponse.text()]);
 if(!/^Disallow:\s*\/\s*$/m.test(robots)||!headers.includes("X-Robots-Tag: noindex, nofollow"))
  throw Error("Preview must explicitly block indexing via robots.txt and response headers");
}
const browser=await chromium.launch({headless:true});
try{
 for(const [width,height] of [[390,844],[1280,900]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:"reduce"});
  // Defensive guard: even if a diagnostic script changes, no form POST is allowed.
  await context.route("**/*",async request=>{
   if(request.request().method()!=="GET"&&request.request().method()!=="HEAD"){
    await request.abort();return;
   }
   await request.continue();
  });
  const page=await context.newPage();
  page.setDefaultTimeout(14000);
  for(const item of work){
   // The local Python preview has no Cloudflare extensionless URL rewrites.
   const browserRoute=localPreview&&item.route!=="/"&&!item.route.endsWith("/")
    ?item.route+".html":item.route;
   const url=origin+browserRoute;
   try{
    const response=await page.goto(url,{waitUntil:"domcontentloaded",timeout:20000});
    if(!response||(response.status()>=400&&!(item.path==="404.html"&&response.status()===404)))throw Error("HTTP "+(response?.status()??"unavailable"));
    if(localPreview){
     const directive=await page.locator('meta[name="robots"]').getAttribute("content");
     if(directive!=="noindex,nofollow")throw Error("Preview robot directive incorrect: "+item.route+"; "+directive);
    }
    await page.addScriptTag({content:axe.source});
    const result=await page.evaluate(async()=>{
     const data=await window.axe.run(document,{
      runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22aa"]}
     });
     const dimensions={width:window.innerWidth,content:document.documentElement.scrollWidth};
     return {
      findings:data.violations.map(v=>({rule:v.id,impact:v.impact,count:v.nodes.length,targets:v.nodes.slice(0,4).map(n=>n.target)})),
      horizontalOverflow:Math.max(0,dimensions.content-dimensions.width),
      title:document.title.slice(0,110),
      main:document.querySelectorAll("main").length
     };
    });
    const itemResult={route:item.route,viewport:width,...result};
    output.checked.push(itemResult);
    const serious=result.findings.filter(x=>x.impact==="serious"||x.impact==="critical");
    if(result.horizontalOverflow>2||result.main!==1||serious.length){
     const diagnostics=await page.evaluate(findings=>{
      const summary=[];
      for(const failure of findings){
       for(const target of failure.targets.slice(0,4)){
        const selector=target[0],el=document.querySelector(selector);
        if(!el)continue;
        const parents=[];
        let node=el;
        for(let i=0;node&&i<5;i++,node=node.parentElement){
         const st=getComputedStyle(node);
         parents.push({tag:node.tagName,className:typeof node.className==="string"?node.className.slice(0,110):"",
          color:st.color,background:st.backgroundColor,opacity:st.opacity});
        }
        summary.push({selector,parents});
       }
      }
      return summary;
     },serious);
     output.failures.push({...itemResult,serious,diagnostics});
     console.error("A11Y_DIAG "+JSON.stringify({route:item.route,viewport:width,diagnostics}));
    }
    console.log("A11Y_PAGE "+JSON.stringify({route:item.route,viewport:width,violations:result.findings.length,serious:serious.length,overflow:result.horizontalOverflow}));
   }catch(error){
    const failure={route:item.route,viewport:width,error:String(error.message).slice(0,340)};
    output.failures.push(failure);
    console.error("A11Y_PAGE_ERROR "+JSON.stringify(failure));
   }
  }
  await context.close();
 }
}finally{await browser.close();}
await mkdir("audit-artifacts",{recursive:true});
await writeFile("audit-artifacts/full-site-a11y.json",JSON.stringify(output,null,2));
console.log("FULL_SITE_A11Y_RESULT "+JSON.stringify({
 pages:work.length,viewports:2,expected:94,checked:output.checked.length,failures:output.failures.length,
 ruleCounts:Object.fromEntries([...new Set(output.checked.flatMap(p=>p.findings.map(x=>x.rule)))].map(k=>[k,output.checked.reduce((n,p)=>n+p.findings.filter(x=>x.rule===k).length,0)]))
}));
if(output.checked.length!==94||output.failures.length)process.exitCode=1;
