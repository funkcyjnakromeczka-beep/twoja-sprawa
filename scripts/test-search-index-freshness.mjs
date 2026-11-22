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
assert.equal(pages.length,38);
assert.equal(faq.length,29);
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
// Browser search cards must open canonical public routes, preserving anchors.
// Test the actual route-normalization function isolated from UI/DOM code.
const siteSearch=await readFile("v2/site-search.js","utf8");
const publicHrefSource=siteSearch.match(/const publicHref=href=>\{[\s\S]*?\n \};/)?.[0];
assert.ok(publicHrefSource,"Local search canonical URL helper missing");
const routeContext={};
runInNewContext(publicHrefSource+"\nthis.route=publicHref;",routeContext);
for(const [input,want] of [
 ["/v2/uslugi/szkody-gornicze.html","/uslugi/szkody-gornicze"],
 ["/v2/uslugi/swiadczenie-wspierajace.html#formularz","/uslugi/swiadczenie-wspierajace#formularz"],
 ["/v2/kampanie/skd.html?utm_source=facebook","/kampanie/skd?utm_source=facebook"],
 ["/v2/faq.html#pytanie","/faq#pytanie"],
 ["https://votum-sa.pl/","https://votum-sa.pl/"]
])assert.equal(routeContext.route(input),want,"Wrong public route for "+input);
assert.ok(siteSearch.includes("card.href=publicHref(item.href)"),"Search cards need public routes");
assert.ok(siteSearch.includes("emptyContact.href=publicHref("),"No-result contact needs a public route");
console.log("SEARCH_CANONICAL_ROUTES_OK: service cards, FAQ anchors and contact routes.");
console.log("SEARCH_INDEX_FRESHNESS_OK: 38 stron, "+verifiedDescriptions+" opisów SEO oraz 29 pytań FAQ odpowiadają aktualnemu kodowi.");

// Real questions from potential clients used to return zero results because every
// word (including question words and inflected verb forms) was mandatory.
runInNewContext(await readFile("v2/search-core.js","utf8"),{window,Set,Object,String});
const engine=window.TwojaSprawaSearch;
for(const [phrase,expected] of [
 ["Jak uzyskać świadczenie wspierające?","swiadczenie"],
 ["Co zrobić, jeśli mam pęknięcia na ścianie?","szkody"],
 ["Jak przygotować umowę do SKD?","skd"],
 ["Czy mogę dostać odszkodowanie za szkody górnicze?","szkody"],
 ["Mam decyzję WZON i nie wiem co robić","swiadczenie"],
 ["Chcę sprawdzić, czy należy mi się renta po wypadku","renty"]
]){
 const results=engine.search(phrase,"all",15);
 assert.ok(results.length>0,"Natural Polish question has no results: "+phrase);
 assert.ok(results.some(item=>item.category===expected),"Question does not surface the relevant service: "+phrase);
 assert.ok(results.some(item=>item.similar===true),"Natural question should be marked as approximate matching: "+phrase);
}
assert.equal(engine.search("zupełnie nieistniejące xxyzzq xxxpq", "all",10).length,0,"Unknown query should not fabricate relevant results");
assert.ok(engine.search("Świadczenie wspierające","swiadczenie",10).some(x=>!x.similar),"Literal search should retain its original strict behavior");
console.log("SEARCH_NATURAL_POLISH_OK: six natural client questions find domain content, no-result state and strict lookup preserved.");

// User-facing search examples must lead to actual results, not empty states.
// These six pathways are deliberately independent of the category filters.
const liveExamples=[
 ["pęknięcia ścian","szkody"],
 ["decyzja WZON","swiadczenie"],
 ["umowa kredytowa SKD","skd"],
 ["waloryzacja renty","renty"],
 ["kredyt CHF","franki"],
 ["słup na działce","przesyl"]
];
const searchPageHtml=await readFile("v2/szukaj.html","utf8");
const suggestionsHtml=searchPageHtml.match(/<div class="search-hints"[^>]*>([\s\S]*?)<\/div>/)?.[1]||"";
const suggestionLinks=[...suggestionsHtml.matchAll(/<a href="\?q=([^"]+)">([^<]+)<\/a>/g)];
assert.equal(suggestionLinks.length,6,"The search page must offer six genuine example queries");
for(const [query,category] of liveExamples){
 const url=suggestionLinks.find(m=>m[2]===query);
 assert.ok(url,"Missing search example: "+query);
 const params=new URLSearchParams("?q="+url[1]);
 assert.equal(params.get("q"),query,"Example query must survive URL encoding: "+query);
 const result=engine.search(query,"all",100);
 assert.ok(result.some(item=>item.category===category),
  "Example leads to no relevant answer: "+query+" / "+category);
}
const searchCSS=await readFile("v2/site-search.css","utf8");
assert.ok(searchCSS.includes(".search-hints a:focus-visible")&&searchCSS.includes("min-height:44px"),
 "Search example links need accessible keyboard and finger targets");
console.log("SEARCH_SIX_REAL_EXAMPLES_OK: mining, WZON, SKD, rents, CHF and transmission easement; all locally searchable.");

// Targeted editorial SEO guardrails for high-intent pages. This is a copy-quality
// test, not a guarantee of Google's displayed snippet or search position.
const prioritySourcePaths=[
 "v2/uslugi/renty-powypadkowe.html",
 "v2/uslugi/sluzebnosc-przesylu.html",
 "v2/lokalnie/szkody-gornicze-lubin.html",
 "v2/lokalnie/szkody-gornicze-polkowice.html",
 "v2/wiedza/drobne-pekniecia-szkody-gornicze.html",
 "v2/wiedza/swiadczenie-wspierajace-2026-wzon-zus.html"
];
const uniqueSeoTitles=new Set();
for(const filepath of prioritySourcePaths){
 const document=await readFile(filepath,"utf8");
 const pageTitle=document.match(/<title>([^<]+)<\/title>/i)?.[1]||"";
 const ogTitle=document.match(/<meta property="og:title" content="([^"]+)"/i)?.[1]||"";
 const description=document.match(/<meta name="description" content="([^"]+)"/i)?.[1]||"";
 const ogDesc=document.match(/<meta property="og:description" content="([^"]+)"/i)?.[1]||"";
 assert.ok(pageTitle.length>=35&&pageTitle.length<=62,"Title not concise or meaningful: "+filepath);
 assert.ok(description.length>=100&&description.length<=160,"Description out of editorial range: "+filepath);
 assert.equal(ogTitle,pageTitle.replace(/\s*[|—]\s*Twoja Sprawa$/i,""),"OG title not aligned: "+filepath);
 assert.equal(ogDesc,description,"OG description differs from page metadata: "+filepath);
 assert.ok(!uniqueSeoTitles.has(pageTitle),"SEO title duplicated: "+filepath);
 uniqueSeoTitles.add(pageTitle);
 const match=document.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)||[];
 const articles=match.map(script=>{
  try{return JSON.parse(script.match(/^<script[^>]*>([\s\S]*)<\/script>$/)?.[1]||"null");}
  catch{return null;}
 }).filter(obj=>obj&&obj["@type"]==="Article");
 if(filepath.includes("v2/wiedza/")){
  assert.equal(articles.length,1,"Indexed editorial guide must expose exactly one Article source");
  assert.equal(articles[0].headline,pageTitle,"Article headline does not match published title");
  assert.equal(articles[0].description,description,"Article summary does not match snippet");
 }
}
console.log("PRIORITY_SEO_METADATA_OK: 6 focused titles, aligned OpenGraph & 2 article JSON-LD records; search index in sync.");



