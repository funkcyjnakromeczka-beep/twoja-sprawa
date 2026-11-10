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
}
const cards=[
 new Node("Szkody górnicze — Pęknięcia elewacji", {hubCategory:"szkody"}),
 new Node("Świadczenie wspierające WZON decyzja", {hubCategory:"swiadczenie"}),
 new Node("Kredyty PLN SKD umowa", {hubCategory:"skd"}),
 new Node("Renta powypadkowa", {hubCategory:"renty"})
];
const input=new Node(),status=new Node(),empty=new Node();
const filters=["all","szkody","swiadczenie","skd","renty"].map(k=>new Node(k,{hubFilter:k}));
const hub={
 querySelector:selector=>({"#hub-search":input,"[data-hub-count]":status,"#hub-empty":empty})[selector]||null,
 querySelectorAll:selector=>selector==="[data-hub-filter]"?filters:selector==="[data-hub-category]"?cards:[]
};
runInNewContext(js,{document:{querySelector:sel=>sel==="[data-knowledge-hub]"?hub:null},String});
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
input.value="";
input.events.input();
filters[0].events.click();
assert.equal(cards.filter(x=>!x.hidden).length,4);
assert.ok(html.includes('role="status" aria-live="polite"'));
assert.ok(html.includes('aria-controls="hub-results"'));
assert.equal((html.match(/class="hub-card/g)||[]).length,10);
console.log("OK: hub filters, accent-insensitive search, no results, reset, keyboard controls and 10 article cards.");
