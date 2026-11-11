#!/usr/bin/env node
/** Verify real Cloudflare production (read-only). Does not touch leads or credentials. */
import assert from "node:assert/strict";
import {collectIndexableRoutes} from "./indexnow-routes.mjs";
const root="https://twoja-sprawa.pages.dev";
const get=async(path)=>{
 const response=await fetch(root+path,{signal:AbortSignal.timeout(20000),headers:{"Accept":"text/html,application/xml,text/plain;q=0.9,*/*;q=0.8"}});
 assert.ok(response.ok,"Live "+path+" HTTP "+response.status);
 return {response,body:await response.text()};
};
const [robots,sitemap,home,mining,support,faq,search,marker,portraitA,portraitB,mobileJS,mobileCSS,frank,frankGuide,contrastCSS,skd,homeFlow,navigatorJS,leaflet,leafletCSS,shareJS,brandCSS,chatJS,leadJS,miningLanding,personaCSS]=await Promise.all([
 get("/robots.txt"),get("/sitemap.xml"),get("/"),get("/uslugi/szkody-gornicze"),
 get("/uslugi/swiadczenie-wspierajace"),get("/faq"),get("/szukaj"),get("/deployment-mode.txt"),
 get("/assets/wojciech-obieglo.jpg"),get("/assets/paulina-chandrala.jpg"),get("/mobile-service-cta.js"),get("/mobile-service-cta.css"),get("/uslugi/kredyty-frankowe"),get("/poradniki/frankowicze-lista-kontrolna"),get("/visual-contrast.css"),get("/uslugi/kredyty-pln"),get("/home-flow.css"),get("/service-navigator.js"),get("/start"),get("/ulotka-start.css"),get("/share-page.js"),get("/network-brand.css"),get("/chat-assistant.js"),get("/contact.js"),get("/kampanie/szkody-gornicze"),get("/lead-persona.css")
]);
assert.ok(robots.body.includes("Allow: /")&&!robots.body.includes("Disallow: /"),"Production robots unexpectedly blocked");
assert.ok(robots.body.includes("OAI-SearchBot"),"OAI-SearchBot directive missing");
assert.ok(marker.body.includes("Cloudflare Pages production branch main"),"Release marker unexpected");
const urls=[...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
const expectedRoutes=await collectIndexableRoutes("v2");
assert.equal(urls.length,expectedRoutes.length,"Live sitemap is missing new published pages");
assert.deepEqual(urls.map(u=>new URL(u).pathname).sort(),expectedRoutes,"Live sitemap routes differ from approved source pages");
assert.equal(new Set(urls).size,urls.length,"Duplicate URLs in sitemap");
for(const url of urls){assert.ok(url.startsWith(root+"/")&&!url.endsWith(".html"),"Noncanonical sitemap URL: "+url);}
for(const route of ["/","/uslugi/szkody-gornicze","/uslugi/swiadczenie-wspierajace","/faq"]){
 const hit={"/":home,"/uslugi/szkody-gornicze":mining,"/uslugi/swiadczenie-wspierajace":support,"/faq":faq}[route].body;
 assert.ok(hit.includes('name="robots" content="index,follow"'),"Indexability blocked: "+route);
 assert.ok(hit.includes('rel="canonical" href="'+root+route+'"'),"Canonical missing/mismatched: "+route);
}
assert.ok(search.body.includes('name="robots" content="noindex,follow"'),"Internal search must remain noindex");
assert.ok(leaflet.body.includes('name="robots" content="noindex,follow"'),"Flyer entry should be noindex");
assert.ok(leaflet.body.includes('rel="canonical" href="'+root+'/start"'),"Flyer entry canonical missing");
assert.ok(!urls.includes(root+"/start"),"Flyer entry must not appear in SEO sitemap");
assert.ok(leaflet.body.includes('href="/kampanie/swiadczenie-wspierajace?utm_source=ulotka'),"Flyer support link broken");
assert.ok(leaflet.body.includes('href="/kampanie/szkody-gornicze?utm_source=ulotka'),"Flyer mining link broken");
assert.ok(leaflet.body.includes('href="tel:+48500171531"')&&leaflet.body.includes('href="tel:+48796441345"'),"Flyer phone numbers mismatch");
assert.ok(leafletCSS.body.includes(".leaflet-option-support")&&leafletCSS.body.includes("@media(max-width:730px)"),"Flyer mobile layout missing");
assert.ok(frank.body.includes('name="robots" content="index,follow"'),"CHF page is not indexable");
assert.ok(frank.body.includes('href="/poradniki/frankowicze-lista-kontrolna"'),"CHF checklist link missing");
assert.ok(frank.body.includes('data-service="Kredyty frankowe CHF"'),"CHF form should select correct service");
assert.ok(frankGuide.body.includes("checklist-item")&&frankGuide.body.includes("Kredyt frankowy CHF"),"CHF preparation guide missing");
assert.ok(skd.body.includes("Sankcja Kredytu Darmowego"),"Full SKD title missing");
assert.ok(support.body.includes("Votum-Wsparcie-poziom_zielone.png"),"Official Votum Wsparcie logo missing");
assert.ok(contrastCSS.body.includes(".interactive-checklist")&&contrastCSS.body.includes(".contact-form"),"Contrast protection missing");

const homeStructure=['<section id="uslugi"','<details id="dobierz-pomoc"','<section class="wrap team-spotlight','<section id="kontakt"'];
let last=-1;
for(const tag of homeStructure){
 const pos=home.body.indexOf(tag);
 assert.ok(pos>last,"Homepage order not deployed: "+tag);
 last=pos;
}
assert.ok(home.body.includes("home-flow.css"),"Homepage layout stylesheet not deployed");
assert.ok(homeFlow.body.includes("repeat(12,minmax(0,1fr))")&&homeFlow.body.includes("grid-column:span 3"),"Symmetric 2+4 desktop grid not deployed");
assert.ok(navigatorJS.body.includes("openFromAnchor"),"Deep-link navigator not deployed");
const graphs=[...faq.body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
const faqObj=graphs.flatMap(g=>g["@graph"]||[]).find(item=>item["@type"]==="FAQPage");
assert.ok(faqObj&&faqObj.mainEntity?.length===24,"Live FAQ schema missing or incomplete");
for(const item of faqObj.mainEntity){
 assert.equal(item["@type"],"Question");
 assert.equal(item.acceptedAnswer?.["@type"],"Answer");
}
assert.ok(portraitA.response.headers.get("content-type")?.startsWith("image/"),"Wojciech portrait not an image");
assert.ok(portraitB.response.headers.get("content-type")?.startsWith("image/"),"Paulina portrait not an image");
for(const [page,kind] of [[mining.body,"szkody"],[support.body,"swiadczenie"]]){
 assert.ok(page.includes('src="/mobile-service-cta.js" data-service="'+kind+'"'),"Mobile CTA script not deployed for "+kind);
 assert.ok(page.includes('href="/mobile-service-cta.css"'),"Mobile CTA stylesheet not deployed for "+kind);
}
assert.ok(mobileJS.body.includes("mobile-service-cta")&&mobileJS.body.includes("+48796441345")&&mobileJS.body.includes("+48500171531"),"Mobile CTA source outdated");
assert.ok(mobileCSS.body.includes(".mobile-service-cta")&&mobileCSS.body.includes("chat-assistant"),"Mobile CTA CSS missing chat overlap protection");
// Revision VII: make deployment drift visible. The preview/release-candidate jobs
// do not push files to Cloudflare; only the public HTTP responses prove deployment.
const ogTag=(page,key)=>page.match(new RegExp('<meta\\s+property="'+key+'"\\s+content="([^"]+)"','i'))?.[1]||"";
for(const [page,portrait,label] of [
 [home.body,"wojciech-obieglo.jpg","Home"],
 [mining.body,"wojciech-obieglo.jpg","Mining"],
 [support.body,"paulina-chandrala.jpg","Support"],
 [frank.body,"wojciech-obieglo.jpg","CHF"]
]){
 const expected=root+"/assets/"+portrait;
 assert.equal(ogTag(page,"og:image"),expected,label+" social image is not deployed");
 assert.ok(page.includes('<meta name="twitter:image" content="'+expected+'">'),label+" social preview for Twitter is missing");
 assert.ok(page.includes('property="og:image:alt"'),label+" social image alt missing");
}
assert.ok(home.body.includes('class="mobile-form-link" href="#kontakt"'),"New mobile form shortcut is not live");
assert.ok(homeFlow.body.includes("grid-template-columns:repeat(3,minmax(0,1fr))"),"Three-option mobile footer CSS is not live");
assert.ok(home.body.includes("data-share-page")&&home.body.includes("data-share-feedback"),"Homepage sharing widget not live");
assert.ok(home.body.includes('src="/share-page.js"'),"Homepage share script tag not live");
assert.ok(shareJS.body.includes("navigator.share")&&shareJS.body.includes('url.search=""'),"No-tracking sharing script missing/stale");

assert.ok(brandCSS.body.includes('body.premium-v2:has(.network-brand-bar) .site-header{top:0!important}'),"Mobile header white-space fix not live");
assert.ok(contrastCSS.body.includes('.vws-service-brand img[hidden]')||contrastCSS.body.includes('.vws-service-brand img[hidden],'),"Support image fallback styling not live");
assert.ok(homeFlow.body.includes("chat-assistant.is-hero-area:not(.is-open)"),"Mobile hero chat suppression not live");
assert.ok(chatJS.body.includes('is-hero-area'),"Chatbot hero visibility update not live");

// Stage VIII: test the actual published click-to-qualify lead flow without submitting.
assert.ok(leadJS.body.includes('className="contact-damage-area"'),"Mining damage selector not present on the published form");
assert.ok(leadJS.body.includes("damage_area:damageArea.value"),"Mining damage category is not sent by the published contact script");
assert.ok(leadJS.body.includes('querySelectorAll("[data-damage-option]")'),"Quick campaign card handoff is missing");
for(const category of ["Ściany i elewacja","Kostka i ogrodzenie","Drzwi i okna"]){
 assert.ok(miningLanding.body.includes('data-damage-option="'+category+'"'),"Mining campaign quick link missing: "+category);
}
assert.ok(personaCSS.body.includes(".campaign-damage-pick"),"Campaign category buttons are unstyled in production");
assert.ok(contrastCSS.body.includes(".contact-damage-area:not([hidden])"),"Damage qualifier contrast rules not deployed");

const verified=26;
console.log("LIVE_PRODUCTION_OK: "+verified+" resources, "+urls.length+" sitemap URLs, 24 real FAQ Q&A, QR flyer /start and correct phones, quick mining damage qualification, verified OG photos and sharing, homepage 2+4 layout, open navigator, CHF page/checklist, Votum Wsparcie logo, contrast, mobile CTA, indexable services, noindex internal search, images, search-bot access.");
