#!/usr/bin/env node
/** Offline regression: a zero-result search offers only a cautious relevant adviser route.
 *  No network, Web3Forms posts, storage, geolocation or client data exposure. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {runInNewContext} from "node:vm";

const ui=await readFile("v2/site-search.js","utf8");
const page=await readFile("v2/szukaj.html","utf8");
const style=await readFile("v2/site-search.css","utf8");
assert.ok(page.includes('data-search-suggestion hidden'),"Search no-result suggestion placeholder missing");
assert.ok(page.includes('data-search-direct hidden'),"Search no-result direct contact container missing");
assert.ok(page.includes('data-search-direct-phone')&&page.includes('data-search-direct-email'),"Direct adviser phone and email links missing");
assert.ok(style.includes(".search-page .search-topic-suggestion[hidden]"),"Hidden search suggestion must remain hidden");
assert.ok(style.includes(".search-page .search-topic-direct[hidden]"),"Direct adviser actions must respect hidden state");
assert.ok(ui.includes('contactByTopic[suggestedTopic]'),"Search contact must use the selected or inferred category");
assert.ok(!/\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon/.test(ui),"The search assistant must not track or transmit search phrases");

class MockNode{
 constructor(){this.dataset={};this.events={};this.attributes={};this.children=[];this.value="";this.hidden=false;this.textContent="";this.href="";}
 addEventListener(name,fn){this.events[name]=fn;}
 setAttribute(name,value){this.attributes[name]=value;}
 replaceChildren(...items){this.children=[...items];}
 append(...items){this.children.push(...items);}
 focus(){this.focused=true;}
}
const tabs=["all","szkody","swiadczenie","renty","skd","franki","przesyl","inne"].map(category=>{
 const node=new MockNode();node.dataset.searchCategory=category;return node;
});
const input=new MockNode(),results=new MockNode(),counter=new MockNode(),
 empty=new MockNode(),suggestion=new MockNode(),contact=new MockNode(),
 direct=new MockNode(),call=new MockNode(),email=new MockNode(),
 reset=new MockNode(),fallback=new MockNode();
const selectorMap={
 "#site-search-input":input,"[data-search-results]":results,
 "[data-search-count]":counter,"[data-search-empty]":empty,
 "[data-search-suggestion]":suggestion,"[data-search-contact]":contact,
 "[data-search-direct]":direct,"[data-search-direct-phone]":call,
 "[data-search-direct-email]":email,
 "[data-search-reset]":reset,"[data-search-fallback]":fallback
};
const host=new MockNode();
host.querySelector=selector=>selectorMap[selector]||null;
host.querySelectorAll=selector=>selector==="[data-search-category]"?tabs:[];
const normalize=value=>String(value||"").toLocaleLowerCase("pl-PL").normalize("NFD").replace(/\p{M}/gu,"").replaceAll("ł","l").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
const engine={
 normalize,entries:[],categories:tabs.map(x=>x.dataset.searchCategory),
 search:()=>[]
};
const window={location:{search:""},TwojaSprawaSearch:engine};
const document={querySelector:selector=>selector==="[data-site-search]"?host:null,createElement:()=>new MockNode()};
runInNewContext(ui,{window,document,URLSearchParams,String,Object,Boolean});

assert.equal(host.dataset.searchReady,"true","Local search must initialize without real requests");
assert.equal(fallback.hidden,true,"Interactive search replaces the no-script fallback");
assert.equal(empty.hidden,true,"No-results message should not appear before a query");
assert.equal(suggestion.hidden,true,"Suggestion must not appear before any query");
assert.equal(direct.hidden,true,"Adviser shortcuts must not appear before a query");
assert.equal(contact.href,"/kontakt");

const check=(phrase,contactPath,topic,recipient="",phone="")=>{
 input.value=phrase;input.events.input();
 assert.equal(empty.hidden,false,"Unmatched phrase should display no-results message: "+phrase);
 assert.equal(contact.href,contactPath,"No-results contact sent visitor to wrong adviser: "+phrase);
 assert.equal(suggestion.hidden,!topic,"Unexpected suggestion visibility: "+phrase);
 if(topic)assert.ok(suggestion.textContent.includes(topic),"Suggested topic not explained: "+phrase);
 assert.ok(!contact.href.includes("?q="),"Customer phrase must not travel in a contact URL");
 assert.equal(direct.hidden,!topic,"Direct adviser actions must only appear for a known topic");
 if(topic){
  assert.equal(call.href,"tel:"+phone,"Incorrect adviser phone for "+phrase);
  assert.ok(email.href.startsWith("mailto:"+recipient+"?subject="),"Incorrect adviser email for "+phrase);
  assert.ok(!decodeURIComponent(email.href).includes(phrase),"Raw search phrase must not be copied into email links");
  assert.ok(!email.href.includes("&body="),"An empty enquiry must not preload search text as private email body");
 }
};
for(const [phrase,path,label,recipient,phone] of [
 ["kopalnia zapadlisko xyzz99","/uslugi/szkody-gornicze#formularz","Szkody górnicze","wojciech.obieglo@votum-ds.pl","+48796441345"],
 ["mam 65 punktów ośrodek xxy9","/kampanie/swiadczenie-wspierajace#formularz","Świadczenie wspierające","paulina.chandrala@votum-ds.pl","+48500171531"],
 ["waloryzacja po wypadku xyz012","/uslugi/renty-powypadkowe#formularz","Renty i wypadki","paulina.chandrala@votum-ds.pl","+48500171531"],
 ["kredyt gotówkowy RRSO xyz012","/kampanie/skd#formularz","Sankcja Kredytu Darmowego","wojciech.obieglo@votum-ds.pl","+48796441345"],
 ["frankowicz CHF xyz012","/uslugi/kredyty-frankowe#formularz","CHF","wojciech.obieglo@votum-ds.pl","+48796441345"],
 ["gazociąg służebność xyz012","/uslugi/sluzebnosc-przesylu#formularz","Służebność przesyłu","wojciech.obieglo@votum-ds.pl","+48796441345"],
 ["nieznany temat xyz012","/kontakt","","",""]
 ])check(phrase,path,label,recipient,phone);

// Ambiguous terms cannot be treated as a confident classification.
check("frankowicz skd xyz012","/kontakt","");
assert.equal(suggestion.textContent,"","Ambiguous service hint should be cleared");
assert.equal(direct.hidden,true,"Ambiguous query must not imply an adviser");
const rentTab=tabs.find(tab=>tab.dataset.searchCategory==="renty");
rentTab.events.click();
assert.equal(rentTab.attributes["aria-pressed"],"true");
assert.equal(contact.href,"/uslugi/renty-powypadkowe#formularz","Explicit visitor filter must override a vague phrase");
assert.equal(direct.hidden,false,"Explicit service filter should offer a direct call");
assert.equal(call.href,"tel:+48500171531","Rents filter must contact Paulina");
assert.ok(suggestion.textContent.startsWith("Wybrany filtr:"),"Explicit category must be labeled as selected, not guessed");
reset.events.click();
assert.equal(input.value,"");
assert.equal(input.focused,true,"Reset should return keyboard focus to the search input");
assert.equal(empty.hidden,true);
assert.equal(suggestion.hidden,true);
assert.equal(direct.hidden,true,"Reset must hide specialist phone and email");
assert.equal(contact.href,"/kontakt","Reset must clear specialist targeting");
assert.equal(tabs[0].attributes["aria-pressed"],"true");
console.log("SEARCH_CONTACT_GUIDE_OK: 6 direct phone/email contacts, unknown/ambiguous fallback, explicit filters, privacy and reset.");
