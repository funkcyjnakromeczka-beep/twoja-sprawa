#!/usr/bin/env node
/** Read-only smoke test for a local production candidate. Does NOT deploy. */
import assert from "node:assert/strict";
import {readFile,stat,readdir} from "node:fs/promises";
const origin="https://twoja-sprawa.pages.dev";
const read=path=>readFile("dist/"+path,"utf8");
const home=await read("index.html");
const robots=await read("robots.txt");
const sitemap=await read("sitemap.xml");
const headers=await read("_headers");
assert.ok(robots.includes("Allow: /")&&!robots.includes("Disallow: /"),"production robots not enabled");
assert.ok(robots.includes("Sitemap: "+origin+"/sitemap.xml"),"production sitemap not announced");
assert.ok(sitemap.includes("<urlset")&&sitemap.includes("<loc>"+origin+"/</loc>"),"sitemap invalid");
for(const route of ["/uslugi/szkody-gornicze","/uslugi/swiadczenie-wspierajace","/uslugi/kredyty-frankowe","/wiedza/","/faq","/plan-dzialania"]){
 assert.ok(sitemap.includes("<loc>"+origin+route+"</loc>"),"required SEO route missing: "+route);
}
for(const route of ["/404","/szukaj","/kampanie/szkody-gornicze","/kampanie/swiadczenie-wspierajace","/polityka-prywatnosci","/start"]){
 assert.ok(!sitemap.includes("<loc>"+origin+route+"</loc>"),"nonindex route leaked into sitemap: "+route);
}
assert.ok(!headers.includes("X-Robots-Tag: noindex"),"preview response headers leaked");
for(const path of ["index.html","uslugi/szkody-gornicze.html","uslugi/swiadczenie-wspierajace.html","uslugi/kredyty-frankowe.html","uslugi/kredyty-pln.html","wiedza/index.html","faq.html","plan-dzialania.html"]){
 const html=await read(path);
 assert.ok(html.includes('name="robots" content="index,follow"'),"still noindex: "+path);
 assert.ok(html.includes('rel="canonical" href="'+origin),"missing canonical: "+path);
 assert.ok(html.includes('type="application/ld+json"'),"missing structured data: "+path);
 assert.ok(html.includes('class="network-brand-bar"'),"missing agency branding: "+path);
 assert.ok(!html.includes('href="/v2/')&&!html.includes('src="/v2/'),"source path leaked into HTML: "+path);
}
for(const path of ["404.html","szukaj.html","polityka-prywatnosci.html","kampanie/szkody-gornicze.html","kampanie/swiadczenie-wspierajace.html","start.html"]){
 const html=await read(path);
 assert.ok(html.includes('name="robots" content="noindex,follow"'),"excluded page accidentally indexable: "+path);
}
const leaflet=await read("start.html");
assert.ok(leaflet.includes('name="robots" content="noindex,follow"'),"Flyer entry must not compete with public service SEO");
assert.ok(leaflet.includes('rel="canonical" href="'+origin+'/start"'),"Flyer entry missing stable canonical");
assert.ok(leaflet.includes('href="/kampanie/swiadczenie-wspierajace?utm_source=ulotka'),"Support CTA missing from printed QR destination");
assert.ok(leaflet.includes('href="/kampanie/szkody-gornicze?utm_source=ulotka'),"Mining CTA missing from printed QR destination");
assert.ok(leaflet.includes('href="/ulotka-start.css'),"Responsive flyer CSS missing");
assert.ok(leaflet.includes('class="network-brand-bar"'),"Agency branding missing from flyer entry");
assert.ok(!leaflet.includes('href="/v2/'),"Source paths leaked into flyer entry");
const flyerCSS=await read("ulotka-start.css");
assert.ok(flyerCSS.includes("@media(max-width:730px)"),"Mobile styles missing on flyer entry");
const assets=["assets/wojciech-obieglo.jpg","assets/paulina-chandrala.jpg"];
for(const path of assets){
 const file=await readFile("dist/"+path);
 assert.ok(file.length>=10000&&file.length<=8000000&&file[0]===0xff&&file[1]===0xd8,"portrait missing/invalid: "+path);
 const archived=await readFile("v2/"+path);
 assert.equal(Buffer.compare(file,archived),0,"Portrait output must exactly match archived source: "+path);
}
assert.ok(home.includes("/assets/wojciech-obieglo.jpg")&&home.includes("/assets/paulina-chandrala.jpg"),"portraits not localized");
for(const file of ["search-pages-1.js","search-pages-2.js","search-faq-data.js"]){
 const src=await read(file);
 assert.ok(!src.includes('"/v2/'),"old source links in production search index: "+file);
}
const faqPage=await read("faq.html");
const faqScripts=[...faqPage.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
const faqGraphs=faqScripts.map(([,raw])=>JSON.parse(raw));
const faqSchema=faqGraphs.flatMap(g=>g["@graph"]||[]).find(item=>item["@type"]==="FAQPage");
assert.ok(faqSchema,"missing structured FAQPage on published FAQ");
assert.equal(faqSchema.mainEntity.length,24,"FAQ schema must cover 24 visible questions");
for(const item of faqSchema.mainEntity){
 assert.equal(item["@type"],"Question");
 assert.equal(item.acceptedAnswer?.["@type"],"Answer");
 assert.ok(item.name.length>15&&item.acceptedAnswer.text.length>60);
 assert.ok(faqPage.includes("<summary>"+item.name.replaceAll("&","&amp;")+"</summary>")||faqPage.includes("<summary>"+item.name+"</summary>"),"structured question not visible: "+item.name);
}
const frank=await read("uslugi/kredyty-frankowe.html");
assert.ok(frank.includes('src="/contact.js" data-service="Kredyty frankowe CHF"'),"CHF conversion form missing or not selected");
assert.ok(frank.includes('href="/poradniki/frankowicze-lista-kontrolna"'),"CHF checklist link missing");
assert.ok(frank.includes("Pomoc frankowiczom"),"Frankowicz service missing visible heading");
const miningPage=await read("uslugi/szkody-gornicze.html");
assert.ok(!miningPage.includes('"@type":"FAQPage"'),"FAQ schema should not be duplicated on other routes");

const searchPage=await read("szukaj.html");
assert.ok(searchPage.includes('name="robots" content="noindex,follow"')&&searchPage.includes('src="/search-core.js"'),"search release unexpected");
const urlTags=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
assert.ok(urlTags.length>=25,"too few indexed pages");
assert.equal(new Set(urlTags).size,urlTags.length,"duplicate sitemap URLs");
console.log("PRODUCTION_CANDIDATE_OK:",urlTags.length,"indexable URLs; robots, sitemap, canonical, schemas, local portraits, search and exclusions valid. NOT DEPLOYED.");
