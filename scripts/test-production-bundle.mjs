#!/usr/bin/env node
/** Read-only smoke test for a local production candidate. Does NOT deploy. */
import assert from "node:assert/strict";
import {readFile,stat,readdir} from "node:fs/promises";
const origin="https://twoja-sprawa.pages.dev";
const read=path=>readFile("dist/"+path,"utf8");
const home=await read("index.html");
assert.ok(home.includes("data-share-page")&&home.includes("data-share-feedback")&&home.includes('src="/share-page.js"'),"privacy-safe share control missing on published homepage");
const robots=await read("robots.txt");
const sitemap=await read("sitemap.xml");
const headers=await read("_headers");
const privacyDisclosure=await read("polityka-prywatnosci.html");
assert.ok(privacyDisclosure.includes('href="https://web3forms.com/dpa"')&&privacyDisclosure.includes("poza Europejskim Obszarem Gospodarczym")&&privacyDisclosure.includes("maksymalnie przez trzy lata"),"Privacy page must link the current Web3Forms DPA and explain international processing and operator retention");

assert.ok(robots.includes("Allow: /")&&!robots.includes("Disallow: /"),"production robots not enabled");
assert.ok(robots.includes("Sitemap: "+origin+"/sitemap.xml"),"production sitemap not announced");
assert.ok(sitemap.includes("<urlset")&&sitemap.includes("<loc>"+origin+"/</loc>"),"sitemap invalid");
for(const route of ["/uslugi/szkody-gornicze","/uslugi/swiadczenie-wspierajace","/uslugi/kredyty-frankowe","/wiedza/","/faq","/plan-dzialania"]){
 assert.ok(sitemap.includes("<loc>"+origin+route+"</loc>"),"required SEO route missing: "+route);
}
for(const route of ["/404","/szukaj","/kampanie/szkody-gornicze","/kampanie/swiadczenie-wspierajace","/kampanie/skd","/polityka-prywatnosci","/start"]){
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
for(const path of ["404.html","szukaj.html","polityka-prywatnosci.html","kampanie/szkody-gornicze.html","kampanie/swiadczenie-wspierajace.html","kampanie/skd.html","start.html"]){
 const html=await read(path);
 assert.ok(html.includes('name="robots" content="noindex,follow"'),"excluded page accidentally indexable: "+path);
}
// Build-level regression: the UTM module must never attach twice.
for(const target of ["index.html","kontakt.html","faq.html","uslugi/szkody-gornicze.html","uslugi/swiadczenie-wspierajace.html","kampanie/skd.html"]){
 const html=await read(target);
 const modules=[...html.matchAll(/<script\\b[^>]*\\bsrc="\\/attribution\\.js"/g)];
 assert.equal(modules.length,1,"Duplicated or missing campaign attribution: "+target);
}
for(const target of [
 "wiedza/drobne-pekniecia-szkody-gornicze.html",
 "wiedza/swiadczenie-wspierajace-2026-wzon-zus.html"
]){
 const html=await read(target);
 assert.ok(html.includes('name="robots" content="index,follow"'),"Approved guide should be indexable: "+target);
 assert.ok(sitemap.includes("<loc>"+origin+"/"+target.slice(0,-5)+"</loc>"),"Approved guide missing in sitemap: "+target);
}
// Do not accidentally publish draft guides or lead checklists as SEO pages.
for(const target of [
 "wiedza/kredyt-pln-dokumenty-skd.html",
 "wiedza/ugoda-z-kopalnia-co-sprawdzic.html",
 "wiedza/szkody-gornicze-drobne-pekniecia.html",
 "poradniki/checklista-szkody-gorniczej.html",
 "poradniki/frankowicze-lista-kontrolna.html",
 "poradniki/skd-kredyt-pln-lista-kontrolna.html"
]){
 const html=await read(target);
 assert.ok(html.includes('name="robots" content="noindex,follow"'),"Draft/checklist unexpectedly indexable: "+target);
 assert.ok(!sitemap.includes("<loc>"+origin+"/"+target.slice(0,-5)+"</loc>"),"Draft/checklist leaked into sitemap: "+target);
}
for(const target of ["index.html","uslugi/szkody-gornicze.html","uslugi/swiadczenie-wspierajace.html"]){
 const html=await read(target);
 assert.ok(html.includes('<meta name="twitter:card" content="summary_large_image">'),"Large social preview missing: "+target);
}

// Every shared URL should have a specific title, accessible same-origin photo,
// and a description sourced from its own page rather than a generic homepage.
for(const [page,photo] of [
  ["index.html","wojciech-obieglo.jpg"],
  ["uslugi/swiadczenie-wspierajace.html","paulina-chandrala.jpg"],
  ["uslugi/szkody-gornicze.html","wojciech-obieglo.jpg"],
  ["uslugi/renty-powypadkowe.html","paulina-chandrala.jpg"],
  ["uslugi/kredyty-frankowe.html","wojciech-obieglo.jpg"]
]){
  const html=await read(page);
  const title=html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description=html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  assert.ok(title&&description,"missing social metadata source: "+page);
  assert.ok(html.includes('<meta property="og:title" content="'+title+'">'),"social title not page-specific: "+page);
  assert.ok(html.includes('<meta name="twitter:title" content="'+title+'">'),"Twitter title not page-specific: "+page);
  assert.ok(html.includes('<meta property="og:description" content="'+description+'">'),"social description not page-specific: "+page);
  assert.ok(html.includes('<meta property="og:image" content="'+origin+'/assets/'+photo+'">'),"social portrait incorrect: "+page);
  assert.ok(html.includes('<meta name="twitter:image" content="'+origin+'/assets/'+photo+'">'),"Twitter portrait incorrect: "+page);
  assert.ok(html.includes('<meta property="og:image:alt" content="'),"missing accessible preview label: "+page);
}

const skdLanding=await read("kampanie/skd.html");
assert.ok(skdLanding.includes('src="/contact.js" data-service="Kredyt w PLN / SKD"'),"SKD lead form must be selected");
assert.ok(skdLanding.includes("mailto:wojciech.obieglo@votum-ds.pl?subject="),"SKD contract email missing");
assert.ok(skdLanding.includes("M%C3%B3j%20numer%20telefonu"),"SKD email must request phone");
assert.ok(skdLanding.includes('href="tel:+48796441345"'),"SKD campaign phone missing");
assert.ok(!skdLanding.includes('href="tel:+48500171531"'),"SKD landing must not link to benefits number");
assert.ok(skdLanding.includes('class="network-brand-bar"'),"SKD landing partner logos missing");
assert.ok(skdLanding.includes('href="/skd-campaign.css"'),"SKD landing CSS missing");
const skdCss=await read("skd-campaign.css");
assert.ok(skdCss.includes(".campaign-skd"),"SKD campaign styles not built");
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
// Structured data matches each page's actual purpose, without inventing
// ratings, results, office addresses or affiliation with VOTUM as the publisher.
for(const [path,type] of [
 ["kontakt.html","ContactPage"],
 ["o-nas.html","AboutPage"],
 ["wiedza/index.html","CollectionPage"]
]){
 const html=await read(path);
 const scripts=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
 const graphs=scripts.map(x=>JSON.parse(x[1])).flatMap(x=>x["@graph"]||[]);
 const page=graphs.find(x=>x["@type"]===type);
 assert.ok(page,"Expected Schema.org "+type+" on "+path);
 assert.ok(page["@id"]?.endsWith("#webpage")&&page.isPartOf?.["@id"]===origin+"/#website","Invalid structured page reference: "+path);
 const agency=graphs.find(x=>x["@type"]==="Organization");
 assert.ok(agency&&agency.name==="SuccessTree OBIEGŁO WOJCIECH","Agency ownership incorrectly represented on "+path);
 if(type==="ContactPage")assert.equal(page.mainEntity?.["@id"],agency["@id"],"ContactPage must refer to agency, not VOTUM");
 if(type==="AboutPage")assert.equal(page.about?.length,2,"About page must identify actual two contact people");
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
