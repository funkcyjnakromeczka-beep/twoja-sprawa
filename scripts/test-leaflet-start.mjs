#!/usr/bin/env node
/** Jedna, działająca ścieżka z drukowanej ulotki do właściwych formularzy. */
import assert from "node:assert/strict";
import {readFile,access} from "node:fs/promises";
import {shouldIndexRoute} from "./seo-policy.mjs";
import {toPublicRoute} from "./public-routes.mjs";
const read=path=>readFile(path,"utf8");
const html=await read("v2/start.html");
const css=await read("v2/ulotka-start.css");
assert.equal(toPublicRoute("/start.html"),"/start");
assert.equal(shouldIndexRoute("/start.html"),false,"Print funnel should not compete with organic SEO");
assert.ok(html.includes('name="robots" content="noindex,follow"'));
assert.equal((html.match(/<h1\b/g)||[]).length,1,"Exactly one accessible H1");
assert.ok(html.includes('id="main"')&&html.includes('href="#main"'),"Skip link must target main");
assert.ok(!html.includes("data-contact-form")&&!html.includes("api.web3forms"),"Use proven forms rather than a duplicate submission");
assert.ok(!/<script\b/i.test(html),"Print landing must not load external tracking JS");
assert.ok(html.includes("nie oficjalna strona VOTUM"),"Agency disclaimer missing");
assert.ok(html.includes("Nie wpisuj do otwartego formularza numeru PESEL"),"Data minimization notice missing");
assert.ok(html.includes('href="/v2/ulotka-start.css"'));
assert.ok(css.includes(".leaflet-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))"));
assert.ok(css.includes("@media(max-width:730px)"));
const expected=[
 {service:"swiadczenie-wspierajace",phone:"+48500171531",content:"swiadczenie"},
 {service:"szkody-gornicze",phone:"+48796441345",content:"szkody"}
];
for(const e of expected){
 const target="/v2/kampanie/"+e.service+".html";
 await access("v2/kampanie/"+e.service+".html");
 assert.ok(html.includes('href="'+target+'?utm_source=ulotka&amp;utm_medium=druk&amp;utm_campaign=ulotki_2026&amp;utm_content='+e.content+'#formularz"'),"Wrong or untracked CTA: "+e.service);
 assert.ok(html.includes('href="tel:'+e.phone+'"'),"Wrong phone: "+e.service);
 const landing=await read("v2/kampanie/"+e.service+".html");
 assert.ok(landing.includes('id="formularz"')&&landing.includes("data-contact-form"),"Missing actual form: "+e.service);
}
const skdTarget="/v2/kampanie/skd.html";
await access("v2/kampanie/skd.html");
assert.ok(html.includes('href="'+skdTarget+'?utm_source=ulotka&amp;utm_medium=druk&amp;utm_campaign=ulotki_2026&amp;utm_content=skd#formularz"'),"SKD flagship callback missing");
assert.ok(html.includes('href="mailto:wojciech.obieglo@votum-ds.pl?subject='),"SKD flagship contract email missing");
const skdLanding=await read("v2/kampanie/skd.html");
assert.ok(skdLanding.includes('id="formularz"')&&skdLanding.includes("data-contact-form"),"SKD campaign callback form missing");
assert.ok(html.indexOf('leaflet-option-support')<html.indexOf('leaflet-option-mining')&&html.indexOf('leaflet-option-mining')<html.indexOf('leaflet-option-skd'),"Three flagship services must be ordered: benefits, mining, SKD");
for(const slug of ["renty-powypadkowe","kredyty-frankowe","sluzebnosc-przesylu"]){
 assert.ok(html.includes('/v2/uslugi/'+slug+'.html?utm_source=ulotka'),"Secondary service missing "+slug);
 await access("v2/uslugi/"+slug+".html");
}
const allowedDomains=[...html.matchAll(/https?:\/\/[^\s"'<>]+/g)].map(x=>x[0]);
assert.equal(allowedDomains.length,0,"Print landing should not depend on an external domain");
console.log("LEAFLET_ENTRY_OK: /start, 3 flagship paths, SKD agreement email+callback, 3 secondary services, 2 correct phone numbers, noindex, privacy, no duplicate form.");
