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
 style:{value:"educational"},
 destination:{value:"formularz"}
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
const facebookDebugger={href:""};
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
const supportPresetStatus={textContent:""};
const makeSupportPreset=code=>({
  events:{},getAttribute:key=>key==="data-support-preset"?code:null,
  addEventListener(name,fn){this.events[name]=fn;}
});
const supportPresetControls={
 "start-2026":makeSupportPreset("start-2026"),
 "wzon-zus":makeSupportPreset("wzon-zus"),
 decyzja:makeSupportPreset("decyzja"),
 "niskie-punkty":makeSupportPreset("niskie-punkty")
};
const makePlatformPreset=code=>({
 events:{},getAttribute:key=>key==="data-platform-preset"?code:null,
 addEventListener(name,fn){this.events[name]=fn;}
});
const platformControls={
 "tiktok-szkody":makePlatformPreset("tiktok-szkody"),
 "instagram-szkody":makePlatformPreset("instagram-szkody"),
 "instagram-skd":makePlatformPreset("instagram-skd"),
 "tiktok-swiadczenie":makePlatformPreset("tiktok-swiadczenie"),
 "instagram-swiadczenie":makePlatformPreset("instagram-swiadczenie"),
 "tiktok-renty":makePlatformPreset("tiktok-renty"),
 "instagram-renty":makePlatformPreset("instagram-renty")
};
const platformNote={textContent:"",hidden:true};
const linkConfirmation={checked:false,events:{},addEventListener(name,fn){this.events[name]=fn}};
const linkConfirmationWrap={hidden:true};
const platformStatus={textContent:""};
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
 "[data-facebook-debugger]":facebookDebugger,
 "[data-community-preset-status]":presetStatus,
  "[data-support-preset-status]":supportPresetStatus,
 "[data-platform-note]":platformNote,
 "[data-profile-link-confirmed]":linkConfirmation,
 "[data-profile-confirm-wrap]":linkConfirmationWrap,
 "[data-platform-preset-status]":platformStatus
};
const document={querySelector:sel=>nodes[sel],querySelectorAll:sel=>sel==="[data-community-preset]"?Object.values(presetControls):sel==="[data-support-preset]"?Object.values(supportPresetControls):sel==="[data-platform-preset]"?Object.values(platformControls):[]};
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
 const debuggerURL=new URL(facebookDebugger.href);
 assert.equal(debuggerURL.origin,"https://developers.facebook.com");
 assert.equal(debuggerURL.pathname,"/tools/debug/");
 assert.equal(debuggerURL.searchParams.get("q"),url.origin+url.pathname,
  "Facebook debugger must open canonical URL of selected campaign without UTM or fragment");
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
assert.equal(new URL(facebookDebugger.href).searchParams.get("q"),
 cityLink.origin+cityLink.pathname,"Local Meta debugger must point to Lubin without tracking");
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
// Support-benefit campaign variants must stay organic, distinct and private.
for(const [preset,channelName,variant,phrase] of [
  ["start-2026","facebook_strona","wspierajace_70_77_2026","70–77 punktów"],
  ["wzon-zus","facebook_grupa","wzon_zus_kolejnosc","Najpierw postępowanie przed WZON"],
  ["decyzja","facebook_strona","decyzja_wzon_3_miesiace","3 miesięcy"],
  ["niskie-punkty","facebook_strona","analiza_decyzji_wzon_14dni","14 dni"]
]){
  assert.ok(generatorGuide.includes('data-support-preset="'+preset+'"'),"Support preset button exists");
  supportPresetControls[preset].events.click();
  const linkUrl=new URL(link.value);
  assert.equal(linkUrl.pathname,"/kampanie/swiadczenie-wspierajace");
  assert.equal(linkUrl.searchParams.get("utm_source"),"facebook");
  assert.equal(linkUrl.searchParams.get("utm_medium"),channelName==="facebook_strona"?"post":"grupa");
  assert.equal(linkUrl.searchParams.get("utm_campaign"),"swiadczenie_wspierajace_2026");
  assert.equal(linkUrl.searchParams.get("utm_content"),variant);
  assert.equal(values.service.value,"swiadczenie");
  assert.ok(post.value.includes(phrase)&&post.value.includes("500 171 531")&&post.value.includes("Bez obietnic wyniku"));
  assert.ok(post.value.includes(link.value)&&!post.value.includes("796 441 345"));
  assert.ok(!link.value.includes("PESEL")&&!link.value.includes("email="));
  assert.ok(supportPresetStatus.textContent.includes("Nic nie zostało wysłane do Facebooka"));
}
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
// Instagram/TikTok organic descriptions must never assume caption links
// are clickable. Keep tagged profile/Story links separate from the caption.
for(const [preset,serviceName,channelName,variant,path,phone] of [
 ["tiktok-szkody","szkody","tiktok","wideo_1","/kampanie/szkody-gornicze","796 441 345"],
 ["instagram-szkody","szkody","instagram","rolka_1","/kampanie/szkody-gornicze","796 441 345"],
 ["instagram-skd","skd","instagram","rolka_1","/kampanie/skd","796 441 345"],
 ["tiktok-swiadczenie","swiadczenie","tiktok","wideo_1","/kampanie/swiadczenie-wspierajace","500 171 531"],
 ["instagram-swiadczenie","swiadczenie","instagram","rolka_1","/kampanie/swiadczenie-wspierajace","500 171 531"],
 ["tiktok-renty","renty","tiktok","wideo_1","/kampanie/renty-powypadkowe","500 171 531"],
 ["instagram-renty","renty","instagram","rolka_1","/kampanie/renty-powypadkowe","500 171 531"]
]){
 assert.ok(generatorGuide.includes('data-platform-preset="'+preset+'"'),"Missing organic preset button");
 platformControls[preset].events.click();
 const campaignLink=new URL(link.value);
 assert.equal(values.service.value,serviceName);
 assert.equal(values.channel.value,channelName);
 assert.equal(values.style.value,"short");
 assert.equal(campaignLink.pathname,path);
 assert.equal(campaignLink.searchParams.get("utm_source"),channelName);
 assert.equal(campaignLink.searchParams.get("utm_medium"),"social");
 assert.equal(campaignLink.searchParams.get("utm_campaign"),channelName+"_"+serviceName);
 assert.equal(campaignLink.searchParams.get("utm_content"),variant);
 assert.ok(link.value.includes("utm_"),"The separate link must retain attribution");
 assert.ok(!post.value.includes(link.value),"Captions should not mislead users with full non-clickable UTM links");
 assert.ok(post.value.includes("twoja-sprawa.pages.dev")&&post.value.includes("wpisz adres w przeglądarce"));
 assert.ok(post.value.includes(phone),"Correct advisor telephone in post");
 if(serviceName==="swiadczenie"||serviceName==="renty"){
  assert.ok(!post.value.includes("796 441 345"),"Paulina's publications should not include Wojciech's number");
  assert.ok(post.value.includes(serviceName==="renty"?"Bez gwarancji podwyższenia":"Bez obietnic wyniku"),
    "Sensitive financial/benefit claims must carry a clear non-guarantee");
  assert.ok(!post.value.includes("PESEL"),"No unnecessary reference to sensitive identifiers in the public description");
 }
 assert.equal(platformNote.hidden,false);
 assert.ok(platformNote.textContent.includes(channelName==="instagram"?"Instagram":"TikTok"));
 assert.ok(platformNote.textContent.includes("UTM"),"Warn of lost attribution for manual entry");
 assert.ok(platformStatus.textContent.includes("Niczego nie opublikowano"));
 assert.equal(linkConfirmationWrap.hidden,false,"Reel channels reveal profile-link verification");
 assert.equal(linkConfirmation.checked,false,"No automatic assumption that campaign URL is in the profile");
 assert.ok(!post.value.includes("link w profilu"),"Do not claim bio link before confirming placement");
 linkConfirmation.checked=true;
 linkConfirmation.events.change();
 assert.ok(post.value.includes("przejdź przez link w profilu"),"Verified exact link enables profile CTA");
 assert.ok(platformNote.textContent.includes("Twojego potwierdzenia"),"Make the conditional claim explicit");
 assert.ok(!post.value.includes(campaignLink.href),"Do not put long URLs in captions");
 values.content.value=variant+"_nowy";
 listeners.input();
 assert.equal(linkConfirmation.checked,false,"Changing UTM must invalidate stale confirmation");
 assert.ok(!post.value.includes("link w profilu"),"Changed URL must restore honest manual fallback");
 values.content.value=variant;listeners.change();
 assert.equal(open.href,link.value,"Public destination remains openable");
}
assert.ok(generatorGuide.includes("data-profile-link-confirmed")&&generatorGuide.includes("dokładnie ten wygenerowany link UTM"),
 "Manual profile-link confirmation must be explicit and precise");
assert.ok(generatorGuide.includes("data-platform-note")&&generatorGuide.includes("link UTM"),
 "Generator must explain the separate clickable-link workflow");
values.channel.value="facebook_grupa";
listeners.change();
assert.equal(platformNote.hidden,true,"No Instagram/TikTok warning for Facebook");
assert.equal(linkConfirmationWrap.hidden,true,"Facebook needs no profile verification");
assert.equal(linkConfirmation.checked,false,"Profile verification resets outside reel channels");
assert.ok(post.value.includes(link.value),"Facebook retains clickable campaign-link caption");
assert.equal(Object.keys(platformControls).length,7,"Seven mobile social presets must be covered");
console.log("LOCAL_CAMPAIGN_LINKS_OK: 6 services, 2 city campaigns, group UTMs, city messages, Google Business Profile and no telemetry.");

// Article campaign links: fixed public anchors, six services, safe fallback for print and GBP.
values.destination.value="poradnik";values.channel.value="facebook_grupa";values.region.value="ogolnie";values.content.value="";
for(const [key,path,hash,variant,phone] of [["szkody","/wiedza/drobne-pekniecia-szkody-gornicze","zabezpieczony-dom","pekniecia_po_remoncie","796 441 345"],["swiadczenie","/wiedza/swiadczenie-wspierajace-2026-wzon-zus","po-decyzji-wzon","decyzja_wzon","500 171 531"],["skd","/wiedza/kredyt-pln-dokumenty-skd","wczesniejsza-splata-skd","splata_i_skd","796 441 345"],["renty","/wiedza/renta-powypadkowa-dokumenty","renta-od-lat","renta_od_lat","500 171 531"],["franki","/uslugi/kredyty-frankowe","ugoda-chf","ugoda_chf","796 441 345"],["przesyl","/wiedza/sluzebnosc-przesylu-slup-na-dzialce","","slup_na_dzialce","796 441 345"]]){
 values.service.value=key;listeners.change();const target=new URL(link.value);
 assert.equal(target.pathname,path);assert.equal(target.hash,hash?"#"+hash:"");assert.equal(target.searchParams.get("utm_content"),variant);assert.equal(target.searchParams.get("utm_source"),"facebook");assert.ok(post.value.includes(phone)&&post.value.includes(link.value));
 assert.equal(new URL(facebookDebugger.href).searchParams.get("q"),target.origin+target.pathname,"Article debugger must point to current canonical topic");assert.ok(previewTitle.textContent&&previewDescription.textContent);
}
values.service.value="szkody";values.region.value="lubin";listeners.change();assert.equal(new URL(link.value).pathname,"/lokalnie/szkody-gornicze-lubin");
values.region.value="ogolnie";values.channel.value="ulotka";listeners.change();assert.equal(new URL(link.value).pathname,"/kampanie/szkody-gornicze");assert.equal(new URL(link.value).hash,"");
values.channel.value="google_wizytowka";listeners.change();assert.equal(new URL(link.value).pathname,"/");
console.log("EDUCATIONAL_CAMPAIGNS_OK: six verified topic routes and print/local/GBP fallback");
