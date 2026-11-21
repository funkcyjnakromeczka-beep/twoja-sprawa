#!/usr/bin/env node
/** Mocked Pages Function regression: social scrapers do not execute brochure-view.js. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const source=await readFile("functions/plan-dzialania.js","utf8");
const {BROCHURE_PREVIEWS,brochureKeyFromUrl,rewriteBrochurePreview,onRequestGet}=
 await import("data:text/javascript;base64,"+Buffer.from(source).toString("base64"));
const origin="https://twoja-sprawa.pages.dev";
const page=await readFile("dist/plan-dzialania.html","utf8");
assert.ok(page.includes('data-brochure-root'),"Production brochure markup not available");
const meta=(html,attr,key)=>(html.match(new RegExp('<meta\\b(?=[^>]*\\b'+attr+'="'+key+'")[^>]*>','i'))?.[0]||"")
 .match(/\bcontent="([^"]*)"/i)?.[1]||"";
const specs=[
 ["szkody-gornicze","Szkody górnicze"],
 ["swiadczenie-wspierajace","Świadczenie wspierające"],
 ["renty-powypadkowe","Renty powypadkowe"],
 ["skd","Sankcja kredytu darmowego"],
 ["kredyty-frankowe","Kredyty frankowe"],
 ["sluzebnosc-przesylu","Służebność przesyłu"]
];
assert.deepEqual(Object.keys(BROCHURE_PREVIEWS),specs.map(([slug])=>slug));
const titles=new Set();
for(const [slug,topic] of specs){
 const url=origin+"/plan-dzialania?broszura="+slug;
 assert.equal(brochureKeyFromUrl(url),slug);
 const clean=rewriteBrochurePreview(page,slug);
 assert.equal(meta(clean,"name","robots"),"noindex,follow");
 assert.equal((clean.match(/<title>/gi)||[]).length,1);
 assert.equal((clean.match(/<link rel="canonical"/g)||[]).length,1);
 assert.ok(clean.includes('<link rel="canonical" href="'+origin+'/plan-dzialania">'));
 const title=clean.match(/<title>([^<]+)<\/title>/)?.[1];
 assert.ok(title.includes(topic),"Wrong OG topic for "+slug);
 assert.equal(meta(clean,"property","og:title"),title);
 assert.equal(meta(clean,"name","twitter:title"),title);
 assert.ok(meta(clean,"property","og:description").length>80,"Too short preview description: "+slug);
 assert.equal(meta(clean,"name","description"),meta(clean,"property","og:description"));
 assert.equal(meta(clean,"property","og:url"),url);
 assert.equal(meta(clean,"property","og:image"),origin+"/assets/og-twoja-sprawa-metallic-v1.jpg");
 assert.equal(meta(clean,"name","twitter:image"),meta(clean,"property","og:image"));
 assert.ok(clean.includes('data-brochure-root'),"Share metadata must not replace working brochure UI: "+slug);
 assert.equal((clean.match(/property="og:title"/g)||[]).length,1,"Duplicate OG title: "+slug);
 assert.equal((clean.match(/property="og:description"/g)||[]).length,1,"Duplicate OG description: "+slug);
 assert.equal((clean.match(/property="og:url"/g)||[]).length,1,"Duplicate OG URL: "+slug);
 titles.add(title);
 let calls=0;
 const response=await onRequestGet({
  request:new Request(url),
  next:async()=>{calls++;return new Response(page,{status:200,headers:{
   "content-type":"text/html","content-length":String(page.length),"etag":"old-etag"
  }});}
 });
 assert.equal(calls,1,"Pages Function should invoke static asset once");
 assert.equal(response.status,200);
 assert.equal(response.headers.get("etag"),null,"Modified content must not retain stale ETag");
 assert.equal(response.headers.get("content-length"),null,"Modified content must not retain stale byte length");
 assert.equal(meta(await response.text(),"property","og:title"),title);
}
assert.equal(titles.size,6,"Six brochure previews require distinct titles");
for(const url of [
 origin+"/plan-dzialania",
 origin+"/plan-dzialania?broszura=nieznana",
 origin+"/plan-dzialania?broszura=skd&broszura=skd",
 origin+"/plan-dzialania?broszura=%3Cscript%3E"
]){
 assert.equal(brochureKeyFromUrl(url),null);
 let served=0;
 const response=await onRequestGet({request:new Request(url),next:async()=>{served++;return new Response("ORIGINAL",{status:200});}});
 assert.equal(served,1);
 assert.equal(await response.text(),"ORIGINAL","Unknown/duplicate brochure must use untouched static page");
}
const failure=await onRequestGet({request:new Request(origin+"/plan-dzialania?broszura=skd"),
 next:async()=>new Response("NOT FOUND",{status:404,headers:{"content-type":"text/html"}})});
assert.equal(failure.status,404);
assert.equal(await failure.text(),"NOT FOUND");
console.log("BROCHURE_SOCIAL_PREVIEWS_OK: 6 distinct server-rendered share cards, noindex canonical, no personal data or new indexable pages.");
