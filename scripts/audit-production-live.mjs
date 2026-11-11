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
const [robots,sitemap,home,mining,support,faq,search,marker,portraitA,portraitB,mobileJS,mobileCSS,frank,frankGuide,contrastCSS,skd]=await Promise.all([
 get("/robots.txt"),get("/sitemap.xml"),get("/"),get("/uslugi/szkody-gornicze"),
 get("/uslugi/swiadczenie-wspierajace"),get("/faq"),get("/szukaj"),get("/deployment-mode.txt"),
 get("/assets/wojciech-obieglo.jpg"),get("/assets/paulina-chandrala.jpg"),get("/mobile-service-cta.js"),get("/mobile-service-cta.css"),get("/uslugi/kredyty-frankowe"),get("/poradniki/frankowicze-lista-kontrolna"),get("/visual-contrast.css"),get("/uslugi/kredyty-pln")
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
assert.ok(frank.body.includes('name="robots" content="index,follow"'),"CHF page is not indexable");
assert.ok(frank.body.includes('href="/poradniki/frankowicze-lista-kontrolna"'),"CHF checklist link missing");
assert.ok(frank.body.includes('data-service="Kredyty frankowe CHF"'),"CHF form should select correct service");
assert.ok(frankGuide.body.includes("checklist-item")&&frankGuide.body.includes("Kredyt frankowy CHF"),"CHF preparation guide missing");
assert.ok(skd.body.includes("Sankcja Kredytu Darmowego"),"Full SKD title missing");
assert.ok(support.body.includes("Votum-Wsparcie-poziom_zielone.png"),"Official Votum Wsparcie logo missing");
assert.ok(contrastCSS.body.includes(".interactive-checklist")&&contrastCSS.body.includes(".contact-form"),"Contrast protection missing");

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
const verified=16;
console.log("LIVE_PRODUCTION_OK: "+verified+" resources, "+urls.length+" sitemap URLs, 24 real FAQ Q&A, CHF page/checklist, Votum Wsparcie logo, contrast, mobile CTA, indexable services, noindex internal search, images, search-bot access.");
