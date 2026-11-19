#!/usr/bin/env node
/** Isolated DOM simulation: no browser, no network calls or real form submissions. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {runInNewContext} from "node:vm";

const source=await readFile("v2/campaign-links.js","utf8");
const values={
 service:{value:"szkody"},
 channel:{value:"facebook"},
 campaign:{value:"Lubiń Polkowice 2026"},
 content:{value:""},
 style:{value:"educational"}
};
const listeners={};
const form={
 querySelector: selector => values[selector.match(/\[name=(\w+)\]/)?.[1]],
 addEventListener: (name,fn) => {listeners[name]=fn;}
};
const link={value:""};
const post={value:""};
const status={textContent:""};
const open={href:""};
const noOpControl={addEventListener:()=>{}};
const nodes={
 "[data-campaign-builder]":form,
 "[data-campaign-url]":link,
 "[data-campaign-post]":post,
 "[data-campaign-status]":status,
 "[data-copy-link]":noOpControl,
 "[data-copy-post]":noOpControl,
 "[data-open-link]":open
};
const document={querySelector:sel=>nodes[sel]};
const window={location:{origin:"https://twoja-sprawa.pages.dev",hostname:"twoja-sprawa.pages.dev"},isSecureContext:true};
runInNewContext(source,{window,document,URL,console});
const check=(service,path,phone)=>{
 values.service.value=service;
 listeners.change();
 const url=new URL(link.value);
 assert.equal(url.pathname,path);
 assert.ok(!url.pathname.endsWith(".html"),"A campaign URL must use the canonical extensionless route");
 assert.equal(url.searchParams.get("utm_source"),"facebook");
 assert.equal(url.searchParams.get("utm_medium"),"social");
 assert.equal(url.searchParams.get("utm_campaign"),"lubin_polkowice_2026");
 assert.ok(post.value.includes(phone));
 assert.ok(post.value.includes(link.value));
 assert.equal(open.href,link.value);
};
check("szkody","/kampanie/szkody-gornicze","796 441 345");
check("swiadczenie","/kampanie/swiadczenie-wspierajace","500 171 531");
check("renty","/uslugi/renty-powypadkowe","500 171 531");
check("skd","/kampanie/skd","796 441 345");
assert.ok(post.value.includes("wojciech.obieglo@votum-ds.pl"),"SKD message must offer VOTUM contract mailbox");
assert.ok(post.value.includes("pełną umowę")&&post.value.includes("numer telefonu"),"Default SKD social post must explain full contract and callback");
assert.ok(!post.value.includes("500 171 531"),"SKD message must not send visitors to benefit hotline");
check("przesyl","/uslugi/sluzebnosc-przesylu","796 441 345");
// Google Business Profile requires a genuine canonical business website URL,
// not a noindex advertising landing page or an extra analytics account.
values.channel.value="google_wizytowka";
values.service.value="szkody";
values.content.value="";
values.style.value="educational";
values.campaign.value="Wizytówka Google Lubin";
listeners.change();
const gbp=new URL(link.value);
assert.equal(gbp.origin,"https://twoja-sprawa.pages.dev");
assert.equal(gbp.pathname,"/","Business Profile website field should link to the indexed home");
assert.equal(gbp.searchParams.get("utm_source"),"google");
assert.equal(gbp.searchParams.get("utm_medium"),"local");
assert.equal(gbp.searchParams.get("utm_campaign"),"wizytowka_google_lubin");
assert.equal(gbp.searchParams.get("usluga"),"szkody");
assert.equal(gbp.searchParams.get("utm_content"),null,"Do not label a listing as a social writing-style variant");
assert.ok(status.textContent.includes("Profilu Firmy")&&status.textContent.includes("wyłącznie link"));
assert.ok(status.textContent.includes("Google może usuwać parametry"),"Warn about Google stripping profile URL parameters");
const generatorGuide=await readFile("v2/narzedzia/linki-kampanii.html","utf8");
assert.ok(generatorGuide.includes("Google czasem usuwa parametry UTM")&&generatorGuide.includes("https://twoja-sprawa.pages.dev/"),"Keep a fallback to the canonical plain website URL");
assert.ok(!link.value.includes("PESEL")&&!link.value.includes("telefon")&&!link.value.includes(".html"));
assert.ok(post.value.includes(link.value),"Business Profile link should be copyable from output");
values.service.value="swiadczenie";
values.content.value="Profil podstawowy";
listeners.change();
const gbpSupport=new URL(link.value);
assert.equal(gbpSupport.pathname,"/");
assert.equal(gbpSupport.searchParams.get("usluga"),"swiadczenie");
assert.equal(gbpSupport.searchParams.get("utm_source"),"google");
assert.equal(gbpSupport.searchParams.get("utm_medium"),"local");
assert.equal(gbpSupport.searchParams.get("utm_content"),"profil_podstawowy");
assert.ok(post.value.includes("500 171 531"),"Support contact should stay with Paulina");
// Search results remain distinct from Business Profile, and regular social
// promotions must retain their existing destinations.
values.channel.value="google";values.content.value="";values.service.value="szkody";
listeners.change();
assert.equal(new URL(link.value).pathname,"/kampanie/szkody-gornicze");
assert.equal(new URL(link.value).searchParams.get("utm_medium"),"search");
values.channel.value="facebook";values.service.value="przesyl";values.campaign.value="Lubiń Polkowice 2026";
listeners.change();
const client=await readFile("v2/contact.js","utf8");
assert.ok(client.includes('"google"')&&client.includes('serviceAlias'),
 "Existing contact intake must preserve google source and topic preselection");

values.channel.value="ulotka";
values.content.value="Grupa 1";
values.style.value="short";
listeners.input();
const offline=new URL(link.value);
assert.equal(offline.searchParams.get("utm_source"),"ulotka");
assert.equal(offline.searchParams.get("utm_medium"),"print");
assert.equal(offline.searchParams.get("utm_content"),"grupa_1");
assert.ok(post.value.includes("Słupy lub linie na działce?"));
assert.equal(offline.pathname,"/uslugi/sluzebnosc-przesylu","Printed marketing URLs should not include redundant extensions");
values.style.value="hook";values.content.value="";
listeners.change();
assert.equal(new URL(link.value).searchParams.get("utm_content"),"hook");
assert.ok(post.value.includes("Czy na Twojej działce"));
assert.ok(status.textContent.includes("Darmowa domena Cloudflare Pages"));
assert.ok(!status.textContent.includes("wersji testowej"),"Cloudflare production must not be called a preview");
console.log("OK: five services, phone routing, UTM channels, variants and generated content, with no external requests.");
