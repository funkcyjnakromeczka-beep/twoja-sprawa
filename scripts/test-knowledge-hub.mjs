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
 new Node("Szkody górnicze — Pęknięcia elewacji", {hubCategory:"szkody"}),
 new Node("Świadczenie wspierające WZON decyzja", {hubCategory:"swiadczenie"}),
 new Node("Kredyty PLN SKD umowa", {hubCategory:"skd"}),
 new Node("Renta powypadkowa", {hubCategory:"renty"})
];
const input=new Node(),status=new Node(),empty=new Node(),reset=new Node();
const fullSearch=[new Node(),new Node()];
const filters=["all","szkody","swiadczenie","skd","renty"].map(k=>new Node(k,{hubFilter:k}));
const hub={
 querySelector:selector=>({"#hub-search":input,"[data-hub-count]":status,"#hub-empty":empty,"[data-hub-reset]":reset})[selector]||null,
 querySelectorAll:selector=>selector==="[data-hub-filter]"?filters:selector==="[data-hub-category]"?cards:selector==="[data-hub-full-search]"?fullSearch:[]
};
runInNewContext(js,{document:{querySelector:sel=>sel==="[data-knowledge-hub]"?hub:null},String,URLSearchParams});
assert.equal(status.textContent,"Widoczne: 4 artykuły");
assert.equal(cards.filter(x=>!x.hidden).length,4);
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
assert.equal((html.match(/class="hub-card/g)||[]).length,10);
assert.equal((html.match(/data-hub-full-search/g)||[]).length,2);

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
