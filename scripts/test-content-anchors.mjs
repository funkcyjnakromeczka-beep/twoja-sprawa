#!/usr/bin/env node
/** Verify every build-time navigation/accessible-link improvement on 47 pages. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {PAGE_PATHS,enhancePageNavigation} from "./page-navigation.mjs";
import {improveMediaAndNavigation} from "./media-navigation-quality.mjs";
import {improveContentLinks} from "./content-anchors.mjs";

const improvements=[],kindTotals={},pageTotals=[];
for(const path of PAGE_PATHS){
 const source=await readFile("v2/"+path,"utf8");
 const base=improveMediaAndNavigation(enhancePageNavigation(source,path).html,path).html;
 const {html,changes}=improveContentLinks(base,path);
 const repeated=improveContentLinks(html,path);
 assert.equal(repeated.html,html,"Re-running transform must not duplicate UI: "+path);
 assert.equal(repeated.changes.length,0,"Re-running transform must report zero changes: "+path);
 const generatedIds=[...html.matchAll(/\bid="(tresc-[^"]+)"/g)].map(x=>x[1]);
 assert.equal(generatedIds.length,new Set(generatedIds).size,"Generated heading anchors must be unique: "+path);
 for(const id of generatedIds)assert.ok(/^[a-z0-9-]+$/.test(id),"Unsafe slug: "+id);
 // All actionable links state what happens, without replacing their visible
 // text, intercepting clicks or copying the visitor's data into a URL.
 const anchors=[...html.matchAll(/<a\b[^>]*>/gi)].map(m=>m[0]);
 for(const tag of anchors){
  if(/target="_blank"|href="(?:tel:|mailto:)/i.test(tag))
   assert.match(tag,/aria-description="[^"]+"/i,"Unexplained contact/new-tab action: "+path+" "+tag);
 }
 assert.equal((html.match(/<h[1-6]\b/gi)||[]).length,(source.match(/<h[1-6]\b/gi)||[]).length,
   "Headings were removed or duplicated: "+path);
 assert.equal((html.match(/<section\b/gi)||[]).length,(source.match(/<section\b/gi)||[]).length,
   "Section inventory changed unexpectedly: "+path);
 const toc=changes.filter(c=>c.kind==="content-toc-shortcut");
 const hasTOC=changes.some(c=>c.kind==="content-toc-panel");
 if(hasTOC){
  assert.ok(toc.length>=3&&toc.length<=24,"TOC size must remain practical: "+path);
  assert.equal((html.match(/class="content-toc"/g)||[]).length,1,"Duplicate TOC: "+path);
  assert.ok(html.includes('href="/v2/content-anchors.css"'),"Missing TOC stylesheet: "+path);
  for(const t of toc){
   const id=t.detail.match(/#[a-z0-9-]+/)?.[0].slice(1);
   assert.ok(id,"TOC item without target ID: "+path);
   assert.ok(html.includes('href="#'+id+'"')&&html.includes('id="'+id+'"'),
    "TOC shortcut not anchored to heading: "+path+" "+id);
  }
 }
 if(path==="index.html"){
  assert.ok(!html.includes('href="/v2/content-anchors.css"'),"Homepage CSS bundle must remain single-request");
  const start=html.indexOf('class="grid primary-services"'),end=html.indexOf('<details class="service-extra"',start);
  const block=html.slice(start,end);
  const cards=[...block.matchAll(/href="\/v2\/uslugi\/([^"]+)\.html"/g)].map(m=>m[1]);
  assert.ok(cards.indexOf("kredyty-pln")>cards.indexOf("swiadczenie-wspierajace"),"SKD priority moved ahead of support");
  assert.ok(cards.indexOf("kredyty-pln")<cards.indexOf("renty-powypadkowe"),"SKD priority lost third position");
 }
 for(const [n,c] of changes.entries()){
  improvements.push({page:path,ordinal:n+1,...c});
  kindTotals[c.kind]=(kindTotals[c.kind]||0)+1;
 }
 pageTotals.push({path,count:changes.length});
}
const list=Object.entries(kindTotals).sort((a,b)=>b[1]-a[1]);
console.log("CONTENT_ENHANCEMENTS_RESULT "+JSON.stringify({pages:PAGE_PATHS.length,total:improvements.length,kinds:Object.fromEntries(list)}));
console.log("CONTENT_ENHANCEMENTS_PER_PAGE "+JSON.stringify(pageTotals));
assert.ok(improvements.length>350,"Audit should generate meaningful coverage on all editorial pages");
for(const type of ["heading-deep-link","named-content-region","link-action-description","content-toc-shortcut","content-toc-panel"])
 assert.ok((kindTotals[type]||0)>0,"Expected actual "+type+" improvements");
const ids=new Set();
for(const i of improvements){
 const key=i.page+"|"+i.kind+"|"+i.detail;
 assert.ok(!ids.has(key),"Duplicate item in change inventory: "+key);
 ids.add(key);
}
if(process.argv.includes("--manifest"))
 for(const [i,item] of improvements.entries())console.log("CONTENT_IMPROVEMENT",i+1,JSON.stringify(item));
