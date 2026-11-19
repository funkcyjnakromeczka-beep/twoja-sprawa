#!/usr/bin/env node
/** Rent funnel legal and navigation checks, offline; no lead submission. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const html=await readFile("v2/uslugi/renty-powypadkowe.html","utf8");
const css=await readFile("v2/rent-journey.css","utf8");
const guide=await readFile("v2/poradniki/renta-powypadkowa-dokumenty.html","utf8");
const source=await readFile("v2/contact.js","utf8");
assert.ok(html.includes('href="/v2/rent-journey.css"'),"Rent-specific styles must be loaded");
const section=html.match(/<section class="rent-journey wrap" id="wybierz-sytuacje-renty"[\s\S]*?<\/section>/)?.[0];
assert.ok(section,"Rent funnel and accessible section required");
const links=[...section.matchAll(/href="\/v2\/uslugi\/renty-powypadkowe\.html\?etap=([a-z]+)#formularz"/g)].map(m=>m[1]);
assert.deepEqual(links,["nowa","podwyzszenie","odmowa","ugoda"],"Exactly four documented stages");
assert.equal((section.match(/class="rent-journey-card"/g)||[]).length,4);
for(const code of links)assert.ok(source.includes(code+':"'),"Rent stage whitelist missing "+code);
assert.ok(source.includes('select.value==="Renty powypadkowe"?"Na jakim etapie jest sprawa renty?"'),"Accessible rent stage label required");
assert.ok(html.includes('id="formularz"')&&html.includes('data-service="Renty powypadkowe"'),"Links must open existing preselected form");
assert.ok(html.includes('href="tel:+48500171531"'),"Correct advisor");
assert.ok(guide.includes("etap=podwyzszenie#formularz"),"Document checklist leads to correct stage");
assert.ok(css.includes(":focus-visible")&&css.includes("@media(max-width:660px)"),"Accessible mobile cards required");
const legal=html.match(/<section class="focus-detail" aria-labelledby="rent-legal-heading"[\s\S]*?<\/section>/)?.[0]||"";
for(const value of ["Art. 444 § 2","Art. 907 § 2","Dz.U. 2026 poz. 795","https://eli.gov.pl/eli/DU/2026/795/ogl","https://rf.gov.pl/edukacja/","nie następuje automatycznie","zmiana stosunków"]){
 assert.ok(legal.toLowerCase().includes(value.toLowerCase()),"Official source/caveat missing "+value);
}
assert.ok(!/gwarantujemy rentę|gwarantujemy podwyższenie|100% sukcesu/i.test(section+legal),"Never promise award");
assert.ok(!/localStorage|sessionStorage|document\.cookie|fetch\(/.test(css),"No tracking in styling");
console.log("RENT_JOURNEY_OK: four legal intake routes, verified official sources, no automatic award and responsive keyboard-accessible UI.");
