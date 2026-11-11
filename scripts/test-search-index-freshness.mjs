#!/usr/bin/env node
/** Ochrona świeżości lokalnej wyszukiwarki: dane indeksu muszą odpowiadać źródłowym stronom HTML. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {runInNewContext} from "node:vm";
const window={};
for(const file of ["v2/search-pages-1.js","v2/search-pages-2.js","v2/search-faq-data.js"]){
 runInNewContext(await readFile(file,"utf8"),{window,Object,String});
}
const pages=[...(window.TwojaSprawaSearchPages1||[]),...(window.TwojaSprawaSearchPages2||[])];
const faq=window.TwojaSprawaSearchFaq||[];
assert.equal(pages.length,36);
assert.equal(faq.length,24);
let verifiedDescriptions=0;
for(const entry of pages){
 const source=entry.id.slice(5);
 const html=await readFile(source,"utf8");
 const title=(html.match(/<title>([^<]+)<\/title>/i)?.[1]||"").trim().replace(/\s*[|—]\s*Twoja Sprawa$/i,"");
 assert.equal(entry.title,title,"Index title stale in "+source);
 const meta=(html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1]||"").trim();
 if(meta.length>=45){
  assert.equal(entry.description,meta.slice(0,250),"Index description stale in "+source);
  verifiedDescriptions++;
 }
}
const html=await readFile("v2/faq.html","utf8");
for(const entry of faq){
 const id=entry.id.slice(4);
 const pattern='<article class="faq-card" data-faq-category=';
 const anchor='id="'+id+'"';
 assert.ok(html.includes(anchor),"FAQ deep-link disappeared: "+id);
 const start=html.indexOf(anchor);
 const snippet=html.slice(start,start+1400);
 const question=snippet.match(/<summary>([^<]+)<\/summary>/)?.[1];
 const answer=snippet.match(/<div class="faq-answer"><p>([^<]+)<\/p>/)?.[1];
 assert.equal(entry.title,question,"FAQ question stale: "+id);
 assert.equal(entry.description,answer?.slice(0,250),"FAQ answer stale: "+id);
}
console.log("SEARCH_INDEX_FRESHNESS_OK: 36 stron, "+verifiedDescriptions+" opisów SEO oraz 24 pytania FAQ odpowiadają aktualnemu kodowi.");
