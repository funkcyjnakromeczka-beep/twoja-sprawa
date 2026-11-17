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

console.log("OK: hub filters, accent-insensitive search, no results, reset, keyboard controls and 10 article cards.");
