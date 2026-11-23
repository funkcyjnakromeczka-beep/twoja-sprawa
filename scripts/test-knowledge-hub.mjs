#!/usr/bin/env node
/* Test biblioteki wiedzy, bez sieci i bez rzeczywistych użytkowników. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {runInNewContext} from "node:vm";
const js=await readFile("v2/knowledge-hub.js","utf8");
const html=await readFile("v2/wiedza/index.html","utf8");
class Node{
 constructor(textContent="",dataset={}){this.textContent=textContent;this.dataset=dataset;this.events={};this.attrs={};this.value="";this.hidden=false;}
 addEventListener(type,fn){this.events[type]=fn;}
 setAttribute(key,val){this.attrs[key]=val;}
 focus(){this.focused=true;}
}
const cards=[
 new Node("Szkody górnicze — Pęknięcia elewacji", {hubCategory:"szkody",hubKeywords:"kostka brukowa"}),
 new Node("Świadczenie wspierające WZON decyzja", {hubCategory:"swiadczenie",hubKeywords:"kwestionariusz WZON"}),
 new Node("Kredyty PLN SKD umowa", {hubCategory:"skd"}),
 new Node("Renta powypadkowa", {hubCategory:"renty",hubKeywords:"waloryzacja renty"})
];
const input=new Node(),status=new Node(),empty=new Node(),reset=new Node();
const fullSearch=[new Node(),new Node()];
const filters=["all","szkody","swiadczenie","skd","renty"].map(k=>new Node(k,{hubFilter:k}));
const quickTopics=["pęknięcia","ugoda","decyzja WZON","renta","dokumenty SKD","słup"].map(q=>new Node(q,{hubQuickQuery:q}));
const hub={
 querySelector:selector=>({"#hub-search":input,"[data-hub-count]":status,"#hub-empty":empty,"[data-hub-reset]":reset})[selector]||null,
 querySelectorAll:selector=>selector==="[data-hub-filter]"?filters:selector==="[data-hub-category]"?cards:selector==="[data-hub-full-search]"?fullSearch:selector==="[data-hub-quick-query]"?quickTopics:[]
};
runInNewContext(js,{document:{querySelector:sel=>sel==="[data-knowledge-hub]"?hub:null},String,URLSearchParams});
assert.equal(status.textContent,"Widoczne: 4 artykuły");
assert.equal(cards.filter(x=>!x.hidden).length,4);
// Suggested topics narrow the article list, without routing users to a form.
let prevented=false;
quickTopics[0].events.click({button:0,preventDefault(){prevented=true;}});
assert.equal(prevented,true);
assert.equal(input.value,"pęknięcia");
assert.equal(input.focused,true);
assert.equal(status.textContent,"Widoczne: 1 artykuł");
assert.equal(quickTopics[0].attrs["data-active"],"true");
assert.equal(filters[0].attrs["aria-pressed"],"true");
quickTopics[1].events.click({button:0,ctrlKey:true,preventDefault(){throw Error("Modified click intercepted");}});
reset.events.click();
assert.equal(status.textContent,"Widoczne: 4 artykuły");
// Everyday-language aliases map to the right reviewed guide, not to random pages.
for(const [query,index] of [["kostka brukowa",0],["kwestionariusz WZON",1],["waloryzacja renty",3]]){
 input.value=query;input.events.input();
 assert.equal(cards.filter(x=>!x.hidden).length,1,"Alias should return one guide: "+query);
 assert.equal(cards[index].hidden,false,"Alias routed to wrong guide: "+query);
}
reset.events.click();
filters.find(x=>x.dataset.hubFilter==="szkody").events.click();
assert.equal(status.textContent,"Widoczne: 1 artykuł");
assert.equal(cards[0].hidden,false);
assert.equal(cards[1].hidden,true);
input.value="PEKNIECIA";
input.events.input();
assert.equal(cards[0].hidden,false,"Searching without Polish accents should match");
input.value="elewacji pekniecia";
input.events.input();
assert.equal(cards[0].hidden,false,"Search should match reversed words without accents");
input.value="NIE MA";
input.events.input();
assert.equal(cards.every(x=>x.hidden),true);
assert.equal(empty.hidden,false);
assert.ok(fullSearch.every(x=>x.href.includes("q=NIE+MA")&&x.href.includes("temat=szkody")),"No-match fallback should carry original question and selected topic");
assert.equal(reset.hidden,false);
reset.events.click();
assert.equal(input.value,"");
assert.equal(input.focused,true);
assert.equal(cards.filter(x=>!x.hidden).length,4);
assert.equal(filters[0].attrs["aria-pressed"],"true");
assert.ok(fullSearch.every(x=>x.href==="/v2/szukaj.html"),"Reset should clear carried query and category");
input.value="";
input.events.input();
filters[0].events.click();
assert.equal(cards.filter(x=>!x.hidden).length,4);
assert.ok(html.includes('role="status" aria-live="polite"'));
assert.ok(html.includes('aria-controls="hub-results"'));
assert.equal((html.match(/<a class="hub-card(?:\s|")/g)||[]).length,10);
assert.equal((html.match(/data-hub-full-search/g)||[]).length,2);
const allAliases=[...html.matchAll(/<a class="hub-card[^>]*data-hub-keywords="([^"]+)"/g)].map(x=>x[1]);
assert.equal(allAliases.length,10,"All article cards need curated plain-language synonyms");
assert.ok(allAliases.every(x=>x.length<170),"Search aliases should stay concise");
assert.ok(html.includes('class="hub-search-hint"'),"Guide search aliases must be discoverable");
const quickMarkup=html.match(/<div class="hub-quick-topics"[\s\S]*?<\/div>/)?.[0]||"";
assert.equal((quickMarkup.match(/data-hub-quick-query=/g)||[]).length,6,"Six popular-topic links must exist");
assert.equal((quickMarkup.match(/href="\/v2\/wiedza\//g)||[]).length,6,"Each suggested topic must work without JS");
assert.ok(quickMarkup.includes('aria-label="Wyszukaj popularny temat w poradnikach"'));
assert.ok((await readFile("v2/knowledge-hub.css","utf8")).includes(".hub-quick-topics a:focus-visible"),
 "Quick links need visible keyboard focus");

// The directory must stay distinct from the client-filterable 10-article hub
// and use real, indexable service and local mining URLs.
const directory=html.match(/<section class="hub-services-index"[\s\S]*?<\/section>/)?.[0]||"";
assert.ok(directory.includes('id="hub-services-index-title"'),"Visible service directory title missing");
assert.equal((directory.match(/class="hub-service-directory"/g)||[]).length,1);
assert.equal((directory.match(/class="hub-local-directory"/g)||[]).length,1);
const canonicalTargets=[
 "uslugi/szkody-gornicze",
 "uslugi/swiadczenie-wspierajace",
 "uslugi/kredyty-pln",
 "uslugi/renty-powypadkowe",
 "uslugi/kredyty-frankowe",
 "uslugi/sluzebnosc-przesylu",
 "lokalnie/szkody-gornicze-lubin",
 "lokalnie/szkody-gornicze-polkowice"
];
const links=[...directory.matchAll(/href="(\/v2\/[^"]+)"/g)].map(m=>m[1]);
assert.equal(links.length,8,"Exactly six services and two local mining routes must appear");
for(const slug of canonicalTargets){
 assert.equal(links.filter(x=>x==="/v2/"+slug+".html").length,1,slug+" absent or duplicated");
}
assert.ok(!directory.includes("schema.org")&&!directory.includes("utm_")&&!directory.includes("access_key"));
assert.ok(html.indexOf('class="hub-services-index"')<html.indexOf('data-knowledge-hub'),
 "Service directory should precede article search and stay visible independent of filters");


const readingPaths=html.match(/<section class="hub-reading-paths"[\s\S]*?<\/section>/)?.[0]||"";
assert.ok(readingPaths.includes('aria-labelledby="hub-reading-paths-title"'),"Reading paths need an accessible heading");
assert.equal((readingPaths.match(/class="hub-reading-card"/g)||[]).length,6,"Six thematic reading paths required");
assert.equal((readingPaths.match(/<ol>/g)||[]).length,6,"Each path needs an ordered, practical checklist");
const readingHrefs=[...readingPaths.matchAll(/href="([^"]+)"/g)].map(([,url])=>url.replaceAll("&amp;","&"));
assert.equal(readingHrefs.length,12,"Each path should offer two working destinations");
for(const dest of [
"/v2/wiedza/drobne-pekniecia-szkody-gornicze.html",
"/v2/uslugi/szkody-gornicze.html",
"/v2/wiedza/swiadczenie-wspierajace-2026-wzon-zus.html",
"/v2/uslugi/swiadczenie-wspierajace.html",
"/v2/uslugi/kredyty-pln.html",
"/v2/plan-dzialania.html?usluga=skd",
"/v2/wiedza/renta-powypadkowa-dokumenty.html",
"/v2/uslugi/renty-powypadkowe.html",
"/v2/poradniki/frankowicze-lista-kontrolna.html",
"/v2/uslugi/kredyty-frankowe.html#ugoda-chf",
"/v2/wiedza/sluzebnosc-przesylu-slup-na-dzialce.html",
"/v2/uslugi/sluzebnosc-przesylu.html"
])assert.equal(readingHrefs.filter(x=>x===dest).length,1,"Missing or duplicate first-step link: "+dest);
assert.ok(html.indexOf('class="hub-services-index"')<html.indexOf('class="hub-reading-paths"')&&
 html.indexOf('class="hub-reading-paths"')<html.indexOf('data-knowledge-hub'),
 "First-step cards must remain visible before search filters, without JavaScript");
assert.ok(!readingPaths.includes("<form")&&!readingPaths.includes("type=\"submit\"")&&!readingPaths.includes("data-contact-form"),
 "Reading paths must not collect sensitive information");
const pathCss=await readFile("v2/knowledge-hub.css","utf8");
assert.ok(pathCss.includes(".hub-reading-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))")&&pathCss.includes("@media(max-width:950px)")&&
 pathCss.includes(".hub-reading-actions a:focus-visible"),
 "First-step cards need responsive layout and visible keyboard focus");

console.log("OK: hub filters, accent-insensitive search, no results, reset, keyboard controls and 10 article cards.");

// Three direct jump links and the same six visual topics as the homepage.
const jumps=html.match(/<nav class="hub-jump-links"[\s\S]*?<\/nav>/)?.[0]||"";
assert.equal((jumps.match(/<a href="#/g)||[]).length,3);
for(const [,id] of jumps.matchAll(/href="#([^"]+)"/g))assert.ok(html.includes('id="'+id+'"'));
assert.equal((directory.match(/class="hub-topic-icon"/g)||[]).length,6);
assert.equal((html.match(/class="hub-article-top"/g)||[]).length,10);
assert.ok(pathCss.includes(".hub-jump-links a:focus-visible")&&pathCss.includes(".hub-article-top"));
console.log("HUB_VISUAL_NAV_OK: 3 jump links, 6 topic icons, 10 article icons.");
