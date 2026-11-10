#!/usr/bin/env node
/* Test lokalnej bazy FAQ: wyszukiwanie po polsku, sześć filtrów, reset i brak danych sieciowych. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {runInNewContext} from "node:vm";
const js=await readFile("v2/faq.js","utf8");
const html=await readFile("v2/faq.html","utf8");
class MockNode{
 constructor(textContent="",data={}){this.textContent=textContent;this.dataset=data;this.events={};this.attrs={};this.value="";this.hidden=false;}
 addEventListener(k,fn){this.events[k]=fn;}
 setAttribute(k,v){this.attrs[k]=v;}
 focus(){this.focused=true;}
}
const cards=[
 new MockNode("Szkody: pęknięcia ścian i elewacji",{faqCategory:"szkody"}),
 new MockNode("Świadczenie: decyzja WZON i ZUS, 70 punktów",{faqCategory:"swiadczenie"}),
 new MockNode("Renta powypadkowa — waloryzacja",{faqCategory:"renty"}),
 new MockNode("Kredyt PLN i SKD",{faqCategory:"skd"}),
 new MockNode("Służebność przesyłu na działce",{faqCategory:"przesyl"}),
 new MockNode("Kontakt i bezpieczeństwo danych",{faqCategory:"kontakt"})
];
const categories=["all","szkody","swiadczenie","renty","skd","przesyl","kontakt"];
const filters=categories.map(k=>new MockNode(k,{faqFilter:k}));
const search=new MockNode(),count=new MockNode(),empty=new MockNode(),reset=new MockNode();
const selectors={"#faq-search":search,"[data-faq-count]":count,"[data-faq-empty]":empty,"[data-faq-reset]":reset};
const root={querySelector:s=>selectors[s],querySelectorAll:s=>s==="[data-faq-filter]"?filters:s==="[data-faq-category]"?cards:[]};
runInNewContext(js,{document:{querySelector:s=>s==="[data-faq-hub]"?root:null},window:{location:{search:"?temat=all"}},String,URLSearchParams});
assert.equal(count.textContent,"Widoczne: 6 pytań");
assert.equal(reset.hidden,true);
filters.find(x=>x.dataset.faqFilter==="szkody").events.click();
assert.equal(cards.filter(x=>!x.hidden).length,1);
assert.equal(cards[0].hidden,false);
assert.equal(filters[1].attrs["aria-pressed"],"true");
search.value="PEKNIECIA";search.events.input();
assert.equal(cards.filter(x=>!x.hidden).length,1,"Polish diacritic normalization must work");
search.value="987654-no-match";search.events.input();
assert.equal(cards.every(x=>x.hidden),true);
assert.equal(empty.hidden,false);
assert.equal(reset.hidden,false);
reset.events.click();
assert.equal(search.value,"");
assert.equal(search.focused,true);
assert.equal(cards.filter(x=>!x.hidden).length,6);
assert.equal(filters[0].attrs["aria-pressed"],"true");
assert.equal(count.textContent,"Widoczne: 6 pytań");
assert.equal((html.match(/class="faq-card"/g)||[]).length,24);
assert.equal((html.match(/data-faq-filter="/g)||[]).length,7);
assert.ok(html.includes('aria-live="polite"'));
assert.ok(html.includes('data-faq-reset hidden'));
assert.ok(js.includes('replaceAll("ł","l")'));
assert.ok(!/\bfetch\s*\(|localStorage|sessionStorage|XMLHttpRequest/.test(js));
console.log("FAQ_OK: 24 pytania, 6 filtrów, usuwanie polskich znaków, brak wyników, reset i zero śledzenia.");
