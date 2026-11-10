#!/usr/bin/env node
/** Free local-site Chromium QA and screenshots; no lead submissions, no TinyFish. */
import {spawn} from "node:child_process";
import {mkdir} from "node:fs/promises";
import {chromium} from "playwright";
const origin="http://127.0.0.1:4173";
const server=spawn("python3",["-m","http.server","4173","--bind","127.0.0.1","--directory","dist-preview"],{stdio:"ignore"});
const wait=async()=>{
 for(let i=0;i<70;i++){
  try{const response=await fetch(origin+"/");if(response.ok)return;}catch{}
  await new Promise(resolve=>setTimeout(resolve,200));
 }
 throw Error("Preview server unavailable");
};
let browser;
const checks=[];
try{
 await wait();
 await mkdir("screenshots",{recursive:true});
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const pages=[
  ["telefon-360","/",360,800],
  ["telefon-390","/",390,844],
  ["tablet-768","/",768,1024],
  ["desktop-1440","/",1440,900],
  ["kampania-szkody-telefon","/kampanie/szkody-gornicze.html",390,844],
  ["kampania-swiadczenie-telefon","/kampanie/swiadczenie-wspierajace.html",390,844],
  ["usluga-szkody-telefon","/uslugi/szkody-gornicze.html",390,844],
  ["usluga-swiadczenie-telefon","/uslugi/swiadczenie-wspierajace.html",390,844],
  ["poradnik-telefon","/poradniki/checklista-szkody-gorniczej.html",390,844],
  ["zespol-o-nas-telefon","/o-nas.html",390,844],
  ["wiedza-szkody-telefon","/wiedza/drobne-pekniecia-szkody-gornicze.html",390,844],
  ["wiedza-swiadczenie-telefon","/wiedza/swiadczenie-wspierajace-2026-wzon-zus.html",390,844],
  ["blad-404-telefon","/404.html",390,844]
 ];
 for(const [name,path,width,height] of pages){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  const response=await page.goto(origin+path,{waitUntil:"domcontentloaded",timeout:30000});
  if(!response?.ok())throw Error("HTTP error on "+path);
  const logo=page.locator(".network-brand-bar");
  await logo.waitFor({state:"visible",timeout:10000});
  // Prioritise the real logos, but text fallbacks must remain legible on slow/offline devices.
  await page.waitForFunction(()=>[...document.querySelectorAll(".network-brand-logos img")].every(img=>img.complete&&img.naturalWidth>0),undefined,{timeout:5000}).catch(()=>{});
  await page.screenshot({path:"screenshots/"+name+".png",fullPage:true,animations:"disabled"});
  const measured=await page.evaluate(()=>{
    const bar=document.querySelector(".network-brand-bar");
    const imgs=[...document.querySelectorAll(".network-brand-logos img")];
    return{
      viewport:document.documentElement.clientWidth,
      scrollWidth:document.documentElement.scrollWidth,
      barCount:document.querySelectorAll(".network-brand-bar").length,
      images:imgs.map(x=>({
        alt:x.alt,loaded:x.complete&&x.naturalWidth>0,
        fallbackVisible:getComputedStyle(x.parentElement.querySelector(".network-brand-fallback")).visibility==="visible",
        logoVisible:getComputedStyle(x).visibility==="visible"
      })),
      sticky:getComputedStyle(bar).position==="sticky",
      oldDuplicate:document.querySelectorAll(".agency-logos-bar").length,
      hasMain:!!document.querySelector("main"),
      hasForm:!!document.querySelector(".contact-form"),
      formChoice:document.querySelector(".contact-form select")?.value||"",
      teamImages:[...document.querySelectorAll(".team-spotlight img,.team-portrait-grid img")].map(img=>({alt:img.alt,loaded:img.complete&&img.naturalWidth>0})),
      documentHeight:document.documentElement.scrollHeight
    };
  });
  if(measured.scrollWidth>measured.viewport+2)throw Error("Horizontal overflow "+name+": "+JSON.stringify(measured));
  if(["/","/o-nas.html"].includes(path)&&measured.teamImages.length!==2)throw Error("Two authentic profile images missing on "+path+": "+JSON.stringify(measured));
  if(measured.barCount!==1||measured.images.length!==2||!measured.sticky||measured.oldDuplicate)throw Error("Partner logo bar failed "+name+": "+JSON.stringify(measured));
  if(measured.images[0].alt!=="Votum Network"||measured.images[1].alt!=="Votum Scale Agency")throw Error("Wrong logos "+name);
  if(measured.images.some(img=>!(img.loaded&&img.logoVisible)&&!img.fallbackVisible))throw Error("Logo and fallback both invisible "+name);
  if(["/","/kampanie/szkody-gornicze.html","/kampanie/swiadczenie-wspierajace.html","/uslugi/szkody-gornicze.html","/uslugi/swiadczenie-wspierajace.html"].includes(path)&&!measured.hasForm)throw Error("Lead form missing "+name);
  if(measured.documentHeight>height+200){
    await page.evaluate(()=>window.scrollTo(0,600));
    await page.waitForTimeout(140);
    const top=await logo.evaluate(el=>el.getBoundingClientRect().top);
    if(Math.abs(top)>2)throw Error("Partner strip not sticky after scroll: "+name+" top "+top);
  }
  console.log("VISUAL_OK",name,JSON.stringify(measured));
  checks.push({name,...measured});
  await page.close();
 }
 // Playwright interaction verification: chatbot maps scenario to corresponding form.
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto(origin+"/uslugi/szkody-gornicze.html?utm_source=facebook&utm_medium=grupa&utm_campaign=lokalna",{waitUntil:"domcontentloaded"});
 await page.locator(".chat-toggle").click();
 await page.locator('[data-topic="szkody"]').click();
 await page.locator(".chat-stage-choice",{hasText:"Mam propozycję ugody"}).click();
 const href=await page.locator(".chat-reply-contact").getAttribute("href");
 const chosen=new URL(href,origin);
 if(chosen.searchParams.get("etap")!=="ugoda"||chosen.searchParams.get("utm_medium")!=="grupa"||chosen.searchParams.get("lead_path")!=="chatbot")throw Error("Chatbot conversion link lost case stage or campaign medium: "+href);
 await page.goto(origin+chosen.pathname+chosen.search,{waitUntil:"domcontentloaded"});
 const picked=await page.locator('.contact-form select[id^="cf-stage-"]').inputValue();
 if(picked!=="Otrzymałem/am propozycję ugody")throw Error("Form stage was not preselected: "+picked);
 console.log("FUNNEL_OK",JSON.stringify({url:chosen.pathname+chosen.search,stage:picked}));
 await page.close();
 console.log("SUCCESS",checks.length,"visual routes, sticky partner logos and one chatbot lead funnel. No real leads sent.");
}finally{
 if(browser)await browser.close();
 server.kill("SIGTERM");
}
