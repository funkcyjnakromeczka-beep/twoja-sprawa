#!/usr/bin/env node
/** Isolated DOM simulation: no browser, no network calls or real form submissions. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {runInNewContext} from "node:vm";

const source=await readFile("v2/campaign-links.js","utf8");
const values={
 service:{value:"szkody"},
 region:{value:"ogolnie"},
 channel:{value:"facebook"},
 campaign:{value:"Lubiń Polkowice 2026"},
 content:{value:""},
 style:{value:"educational"}
};
const listeners={};
const regionControl={hidden:true};
const form={
 querySelector: selector => selector==="[data-campaign-region]"?regionControl:values[selector.match(/\[name=(\w+)\]/)?.[1]],
 addEventListener: (name,fn) => {listeners[name]=fn;}
};
const link={value:""};
const post={value:""};
const status={textContent:""};
const open={href:""};
const previewTitle={textContent:""};
const previewDescription={textContent:""};
const previewHost={textContent:""};
const noOpControl={addEventListener:()=>{}};
const makePreset=code=>({
 events:{},getAttribute:key=>key==="data-community-preset"?code:null,
 addEventListener(name,fn){this.events[name]=fn;}
});
const presetControls={
 swiadczenie:makePreset("swiadczenie"),
 renty:makePreset("renty")
};
const presetStatus={textContent:""};
const nodes={
 "[data-campaign-builder]":form,
 "[data-campaign-url]":link,
 "[data-campaign-post]":post,
 "[data-campaign-status]":status,
 "[data-copy-link]":noOpControl,
 "[data-copy-post]":noOpControl,
 "[data-open-link]":open,
 "[data-preview-title]":previewTitle,
 "[data-preview-description]":previewDescription,
 "[data-preview-host]":previewHost,
 "[data-community-preset-status]":presetStatus
};
const document={querySelector:sel=>nodes[sel],querySelectorAll:sel=>sel==="[data-community-preset]"?Object.values(presetControls):[]};
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
assert.equal(regionControl.hidden,false,"Mining regional selector should be visible");
assert.ok(previewTitle.textContent.includes("Szkody górnicze Lubin i Polkowice"));
assert.equal(previewHost.textContent,"twoja-sprawa.pages.dev");
values.region.value="lubin";
values.channel.value="facebook_grupa";
values.content.value="grupa_osiedle";
listeners.change();
let cityLink=new URL(link.value);
assert.equal(cityLink.pathname,"/lokalnie/szkody-gornicze-lubin","City Facebook campaign must land on the indexed Lubin page");
assert.equal(cityLink.searchParams.get("utm_source"),"facebook");
assert.equal(cityLink.searchParams.get("utm_medium"),"grupa");
assert.equal(cityLink.searchParams.get("utm_campaign"),"lubin_polkowice_2026");
assert.equal(cityLink.searchParams.get("utm_content"),"grupa_osiedle");
assert.ok(post.value.includes("Lubin i gmina Lubin")&&post.value.includes("796 441 345"));
assert.ok(!post.value.includes("Polkowice i gmina Polkowice"),"City-specific message must not name the other city");
assert.equal(open.href,link.value);
assert.ok(previewTitle.textContent.includes("Lubin — pęknięcia ścian"));
assert.ok(previewDescription.textContent.includes("Lubin i gmina Lubin"));
values.style.value="hook";listeners.change();
assert.ok(post.value.startsWith("Mieszkasz w Lubinie"),"The hook should be specific to Lubin");
values.region.value="polkowice";values.style.value="short";listeners.change();
cityLink=new URL(link.value);
assert.equal(cityLink.pathname,"/lokalnie/szkody-gornicze-polkowice","Polkowice campaign must land on its city page");
assert.ok(post.value.includes("Polkowice i gmina Polkowice")&&!post.value.includes("Lubin i gmina Lubin"));
assert.ok(previewTitle.textContent.includes("Polkowice — szkody posesji"));
assert.ok(previewDescription.textContent.includes("Polkowice i gmina Polkowice"));
assert.equal(cityLink.searchParams.get("utm_medium"),"grupa");
assert.ok(!cityLink.searchParams.has("etap")&&!cityLink.searchParams.has("telefon"),"Public campaign URL carries no case data");
values.region.value="ogolnie";values.channel.value="facebook";values.content.value="";values.style.value="educational";
listeners.change();
assert.equal(new URL(link.value).pathname,"/kampanie/szkody-gornicze","All-region default remains intact");
check("swiadczenie","/kampanie/swiadczenie-wspierajace","500 171 531");
assert.equal(regionControl.hidden,true,"Region selector must hide for unrelated benefit services");
check("renty","/kampanie/renty-powypadkowe","500 171 531");
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
const homepage=await readFile("v2/index.html","utf8");
const publishedTitle=homepage.split("<title>")[1]?.split("</title>")[0]||"";
assert.equal(previewTitle.textContent,publishedTitle,"GBP preview must match current homepage title");
assert.equal(gbp.searchParams.get("utm_source"),"google");
assert.equal(gbp.searchParams.get("utm_medium"),"local");
assert.equal(gbp.searchParams.get("utm_campaign"),"wizytowka_google_lubin");
assert.equal(gbp.searchParams.get("usluga"),"szkody");
assert.equal(gbp.searchParams.get("utm_content"),null,"Do not label a listing as a social writing-style variant");
assert.ok(status.textContent.includes("Profilu Firmy")&&status.textContent.includes("wyłącznie link"));
assert.ok(status.textContent.includes("Google może usuwać parametry"),"Warn about Google stripping profile URL parameters");
const generatorGuide=await readFile("v2/narzedzia/linki-kampanii.html","utf8");
assert.ok(generatorGuide.includes("Google czasem usuwa parametry UTM")&&generatorGuide.includes("https://twoja-sprawa.pages.dev/"),"Keep a fallback to the canonical plain website URL");
assert.ok(generatorGuide.includes('name="region"')&&generatorGuide.includes('data-campaign-region'),"Generator must offer a labeled regional selector");
assert.ok(generatorGuide.includes("Facebook i lokalne grupy:"),"Explain city-specific group links without promising leads");
assert.ok(generatorGuide.includes("campaign-link-preview-card")&&generatorGuide.includes("data-preview-title"),"Actual preview UI must exist");
assert.ok(generatorGuide.includes("Facebook Sharing Debugger")&&generatorGuide.includes("Scrape Again"),"Cache-refresh help must be offered");
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
// Two owned-group presets set category-only UTM, never publish a post.
assert.ok(generatorGuide.includes('data-community-preset="swiadczenie"'));
assert.ok(generatorGuide.includes('data-community-preset="renty"'));
assert.ok(generatorGuide.includes('href="https://www.facebook.com/groups/twojasprawa.swiadczenia.renty"'));
assert.ok(generatorGuide.includes("nie nastąpi automatyczna publikacja"),"Manual posting must be explicit");
for(const [code,path,variant] of [
 ["swiadczenie","/kampanie/swiadczenie-wspierajace","wspierajace_post"],
 ["renty","/kampanie/renty-powypadkowe","renty_post"]
]){
 presetControls[code].events.click();
 const presetUrl=new URL(link.value);
 assert.equal(values.service.value,code,"Preset selects correct service");
 assert.equal(values.channel.value,"facebook_grupa","Preset must use organic group channel");
 assert.equal(values.campaign.value,"grupa_swiadczenia_renty");
 assert.equal(values.content.value,variant,"Distinct attribution for each topic");
 assert.equal(presetUrl.pathname,path,"Preset must lead to the correct public form");
 assert.equal(presetUrl.searchParams.get("utm_source"),"facebook");
 assert.equal(presetUrl.searchParams.get("utm_medium"),"grupa");
 assert.equal(presetUrl.searchParams.get("utm_campaign"),"grupa_swiadczenia_renty");
 assert.equal(presetUrl.searchParams.get("utm_content"),variant);
 assert.ok(post.value.includes(presetUrl.href)&&post.value.includes("500 171 531"),
   "Ready post includes own URL and Paulina phone");
 assert.ok(!link.value.includes("PESEL")&&!link.value.includes("email="),
   "Campaign URL must not carry customer data");
 assert.ok(presetStatus.textContent.includes("Nic nie zostało wysłane do Facebooka"));
}
console.log("LOCAL_CAMPAIGN_LINKS_OK: 6 services, 2 city campaigns, group UTMs, city messages, Google Business Profile and no telemetry.");
