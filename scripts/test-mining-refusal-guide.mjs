#!/usr/bin/env node
/** Regression for verified refusal guidance; no network calls or personal data. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const read=path=>readFile(path,"utf8");
const guide=await read("v2/wiedza/ugoda-z-kopalnia-co-sprawdzic.html");
const section=guide.match(/<section id="odmowa-kopalni" aria-labelledby="odmowa-kopalni-title">([\s\S]*?)<\/section>/)?.[1];
assert.ok(section,"Refusal content must have a working target anchor");
assert.ok(section.includes('<h2 id="odmowa-kopalni-title">'),"Visible accessible heading");
assert.equal((section.match(/<li>/g)||[]).length,5,"Exactly five practical refusal steps");
for(const legal of ["art. 151 ust. 1–2","Art. 149","30 dni","pięcioletni","nie jest gwarancja","Nie każda odmowa"]){
 const normalized=section.toLowerCase();
 assert.ok(normalized.includes(legal.toLowerCase())||legal==="nie jest gwarancja"&&normalized.includes("nie gwarancja"),"Missing key caveat: "+legal);
}
assert.ok(section.includes("https://eli.gov.pl/eli/DU/2026/69/ogl"),"Only official verified current statute as legal source");
assert.ok(section.includes('href="/v2/uslugi/szkody-gornicze.html?etap=odmowa#formularz"'),"Lead must preselect safe known refusal stage");
const service=await read("v2/uslugi/szkody-gornicze.html");
assert.ok(service.includes('href="/v2/wiedza/ugoda-z-kopalnia-co-sprawdzic.html#odmowa-kopalni"'),"Service must route to the anchored guide");
assert.ok(service.includes('href="/v2/uslugi/szkody-gornicze.html?etap=odmowa#formularz"'),"Service must let visitor preselect denial stage");
const contact=await read("v2/contact.js");
assert.ok(contact.includes('odmowa:"Kopalnia odmówiła"'),"Known enumerated denial stage");
for(const slug of ["lubin","polkowice"]){
 const local=await read("v2/lokalnie/szkody-gornicze-"+slug+".html");
 assert.ok(local.includes('href="/v2/wiedza/ugoda-z-kopalnia-co-sprawdzic.html#odmowa-kopalni"'),"Missing location link: "+slug);
 assert.ok(local.includes('href="#formularz"'),"Existing local contact route must survive: "+slug);
}
assert.ok(!/gwarantuj(e|emy)|100% odszkodowania|wygran(a|ą) pewna/i.test(section),"No guaranteed legal outcomes");
console.log("MINING_REFUSAL_GUIDE_OK: five steps, official articles, three internal entrypoints, safe prefilled contact.");
