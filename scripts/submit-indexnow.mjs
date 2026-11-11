#!/usr/bin/env node
/** IndexNow submission of live, public canonical sitemap URLs.
 * No cookies, credentials, analytics or user information. Never submits preview URLs.
 * GitHub Actions explicit opt-in: INDEXNOW_SUBMIT=1, GITHUB_REF=refs/heads/main.
 */
import assert from "node:assert/strict";
import {readdir,readFile} from "node:fs/promises";
const origin="https://twoja-sprawa.pages.dev";
const host="twoja-sprawa.pages.dev";
if(process.env.INDEXNOW_SUBMIT!=="1"||process.env.GITHUB_REF!=="refs/heads/main"){
 throw Error("IndexNow submission blocked unless explicitly triggered on production main branch.");
}
const files=(await readdir("v2")).filter(name=>/^[0-9a-f]{40}\.txt$/.test(name));
assert.equal(files.length,1,"Exactly one public IndexNow ownership file required");
const key=files[0].slice(0,-4);
const contents=(await readFile("v2/"+files[0],"utf8")).trim();
assert.equal(contents,key,"IndexNow key filename and content differ");
const get=async path=>{
 const response=await fetch(origin+path,{headers:{"Cache-Control":"no-cache"}});
 if(!response.ok)throw Error("Live "+path+" returned HTTP "+response.status);
 return response.text();
};
let sitemap,seen;
for(let attempt=1;attempt<=16;attempt++){
 try{
  const [liveKey,robots,marker,xml]=await Promise.all([
   get("/"+files[0]),get("/robots.txt"),get("/deployment-mode.txt"),get("/sitemap.xml")
  ]);
  assert.equal(liveKey.trim(),key,"Ownership file not yet published");
  assert.ok(robots.includes("Allow: /")&&!robots.includes("Disallow: /"),"Robots blocks production indexing");
  assert.ok(marker.includes("Cloudflare Pages production branch main"),"Production mode not active");
  assert.ok(xml.includes("<urlset")&&xml.includes("</urlset>"),"Live sitemap not ready");
  sitemap=xml;
  seen=true;
  console.log("INDEXNOW_LIVE_READY after check "+attempt);
  break;
 }catch(error){
  if(attempt===16)throw Error("Live production/IndexNow ownership not ready after 16 checks: "+error.message);
  await new Promise(resolve=>setTimeout(resolve,15000));
 }
}
assert.ok(seen);
const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1].replaceAll("&amp;","&"));
assert.equal(urls.length,36,"Expected 36 approved indexable pages, got "+urls.length);
assert.equal(new Set(urls).size,urls.length,"Duplicate URLs in live sitemap");
for(const uri of urls){
 const url=new URL(uri);
 assert.equal(url.origin,origin,"Out-of-domain IndexNow URL");
 assert.ok(!url.search&&!url.hash&&!uri.endsWith(".html"),"Uncanonical IndexNow URL");
 assert.ok(!/^\/(?:szukaj|404|kampanie|narzedzia|polityka-prywatnosci)/.test(url.pathname),"Nonindex route in sitemap");
}
const request={host,key,keyLocation:origin+"/"+files[0],urlList:urls};
const response=await fetch("https://api.indexnow.org/indexnow",{
 method:"POST",
 headers:{"Content-Type":"application/json; charset=utf-8","Accept":"application/json"},
 body:JSON.stringify(request)
});
const returned=(await response.text()).slice(0,350);
if(response.status!==200&&response.status!==202){
 throw Error("IndexNow rejected "+urls.length+" URLs with HTTP "+response.status+": "+returned);
}
console.log("INDEXNOW_SUBMITTED: HTTP "+response.status+"; "+urls.length+" live canonical URLs, production ownership verified. Receipt does not imply indexing.");
