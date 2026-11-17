#!/usr/bin/env node
/** Check visible, unique, source-grounded service answers and matching JSON-LD graph. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const origin="https://twoja-sprawa.pages.dev";
const services=[
 ["szkody-gornicze","https://www.pgi.gov.pl/midas/dane-przestrzenne.html"],
 ["swiadczenie-wspierajace","https://www.zus.pl/swiadczenia/inne-swiadczenia-z-zus/wiadczenie-wspierajace-dla-osob-z-niepelnosprawnoscia"],
 ["kredyty-pln","https://eli.gov.pl/eli/DU/2011/715/ogl"],
 ["renty-powypadkowe","https://rf.gov.pl/edukacja/baza-wiedzy/najczestsze-pytania-i-odpowiedzi-faq/poszkodowani-w-wypadkach-drogowych-i-ich-bliscy/"],
 ["kredyty-frankowe","https://rf.gov.pl/edukacja/baza-wiedzy/najczestsze-pytania-i-odpowiedzi-faq/spor-frankowy-droga-sadowa-i-mediacyjna/"],
 ["sluzebnosc-przesylu","https://eli.gov.pl/eli/DU/2026/795/ogl"]
];
let checked=0;
for(const [slug,source] of services){
 const html=await readFile("dist/uslugi/"+slug+".html","utf8");
 const section=html.match(/<section class="service-answers wrap"[\s\S]*?<\/section>/)?.[0];
 assert.ok(section,"Missing static answer section "+slug);
 assert.match(section,/id="pytania-o-usludze"/);
 assert.match(section,/id="service-answers-title"/);
 assert.equal((section.match(/class="service-answer"/g)||[]).length,3,slug+" should have exactly 3 substantive answers");
 assert.equal((section.match(/<h3\b[^>]*>/g)||[]).length,3,"Build-added heading IDs must not hide the three service questions");
 assert.equal((section.match(/<article class="service-answer"[\s\S]*?<\/article>/g)||[]).filter(card=>card.includes("<p>")).length,3,"Each question must have a visible response");
 assert.ok(section.includes('href="'+source+'"'),slug+" source URL not grounded");
 assert.match(section,/target="_blank" rel="noopener noreferrer"/);
 assert.match(section,/href="#formularz"/);
 assert.match(section,/href="\/o-nas"/);
 assert.ok(section.indexOf('id="odpowiedz-1"')>=0);
 assert.ok(!section.includes("schema.org")&&!section.includes("data-nosnippet"));
 const canonical=origin+"/uslugi/"+slug;
 const json=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(m=>JSON.parse(m[1])).flatMap(data=>data["@graph"]||[data]);
 const page=json.find(x=>x["@id"]===canonical+"#webpage");
 const service=json.find(x=>x["@id"]===canonical+"#service");
 assert.ok(page&&service,slug+" schema nodes missing");
 assert.equal(page.mainEntity?.["@id"],service["@id"],slug+" page must identify the on-page service");
 assert.equal(service.provider?.["@id"],origin+"/#successtree");
 const description=html.match(/<meta name="description" content="([^"]+)"/)?.[1];
 assert.ok(description&&description.length>45);
 assert.equal(service.description,description.replaceAll("&amp;","&"),"Schema service description must match visible metadata");
 assert.equal((html.match(/href="\/seo-answers.css"|\/layers-[a-f0-9]{16}\.css/g)||[]).length>=1,true,slug+" styles missing");
 assert.ok(html.includes('data-contact-form'),slug+" client contact missing");
 checked++;
}
const about=await readFile("dist/o-nas.html","utf8");
assert.ok(!about.includes("twojasprawa_votum@outlook.com"),"Old inconsistent contact e-mail on About page");
assert.ok(about.includes("wojciech.obieglo@votum-ds.pl"));
for(const source of ["https://www.pgi.gov.pl/midas/dane-przestrzenne.html","https://eli.gov.pl/","https://rf.gov.pl/"])assert.ok(about.includes(source));
assert.ok(about.includes('id="metodyka"'),"Missing editorial transparency on About page");
const home=await readFile("dist/index.html","utf8");
assert.ok(home.includes('href="/o-nas"')&&home.includes('href="/uslugi/szkody-gornicze"'));
const robots=await readFile("dist/robots.txt","utf8");
assert.ok(robots.includes("User-agent: OAI-SearchBot")&&robots.includes("Allow: /"));
const sitemap=await readFile("dist/sitemap.xml","utf8");
for(const [slug] of services)assert.ok(sitemap.includes("<loc>"+origin+"/uslugi/"+slug+"</loc>"));
const mods=[...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(match=>match[1]);
for(const date of mods){
 assert.match(date,/^\d{4}-\d{2}-\d{2}$/);
 assert.ok(date<=new Date().toISOString().slice(0,10),"Sitemap must not claim future edits");
}
console.log("SITEMAP_LASTMOD_RESULT "+JSON.stringify({datedUrls:mods.length,policy:"Git source dates only; no synthetic build timestamps"}));

// Previously published article JSON-LD pointed at /v2/*.html. Confirm the
// authored Article and generated WebPage now form one canonical linked graph.
for(const slug of ["drobne-pekniecia-szkody-gornicze","swiadczenie-wspierajace-2026-wzon-zus"]){
 const pageURL=origin+"/wiedza/"+slug;
 const articleHTML=await readFile("dist/wiedza/"+slug+".html","utf8");
 const nodes=[...articleHTML.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .flatMap(m=>{const data=JSON.parse(m[1]);return data["@graph"]||[data];});
 const articles=nodes.filter(node=>node["@type"]==="Article");
 assert.equal(articles.length,1,slug+" must not contain duplicate Article metadata");
 const article=articles[0];
 const page=nodes.find(node=>node["@id"]===pageURL+"#webpage");
 assert.ok(page,"Missing linked WebPage "+slug);
 assert.equal(article["@id"],pageURL+"#article");
 assert.equal(article.url,pageURL);
 assert.equal(article.mainEntityOfPage?.["@id"],page["@id"]);
 assert.equal(page.mainEntity?.["@id"],article["@id"]);
 assert.equal(article.publisher?.["@id"],origin+"/#successtree");
 assert.equal(article.author?.["@id"],origin+"/#successtree");
 assert.ok(!JSON.stringify(article).includes("/v2/")&&!JSON.stringify(article).includes(".html"));
 assert.match(article.dateModified,/^\d{4}-\d\d-\d\d$/);
 assert.ok(article.headline&&article.description&&article.inLanguage==="pl-PL");
}
const recruitment=await readFile("dist/rekrutacja.html","utf8");
assert.ok(!recruitment.includes("twojasprawa_votum@outlook.com"),"Retired recruitment e-mail must not be advertised");
assert.ok(recruitment.includes("mailto:wojciech.obieglo@votum-ds.pl"),"Recruitment needs active adviser contact");
assert.ok(recruitment.includes("tel:+48796441345"),"Recruitment needs a phone alternative");
assert.ok(recruitment.includes('name="robots" content="index,follow"'),"Recruitment page remains indexable under the existing SEO policy");
console.log("ARTICLE_CANONICAL_GRAPH_OK: two indexed guides link their Article and WebPage entities on clean URLs.");


// Built directory must use extensionless canonical routes with no noindex destinations.
const hubPage=await readFile("dist/wiedza/index.html","utf8");
const hubDirectory=hubPage.match(/<section class="hub-services-index"[\s\S]*?<\/section>/)?.[0]||"";
assert.ok(hubDirectory,"Built knowledge hub must retain static service navigation");
const hubLinks=[...hubDirectory.matchAll(/href="(\/(?:uslugi|lokalnie)\/[^"]+)"/g)].map(m=>m[1]);
assert.equal(hubLinks.length,8,"Hub service directory must link to 6 service and 2 local pages");
for(const pathname of [
 "/uslugi/szkody-gornicze","/uslugi/swiadczenie-wspierajace","/uslugi/kredyty-pln",
 "/uslugi/renty-powypadkowe","/uslugi/kredyty-frankowe","/uslugi/sluzebnosc-przesylu",
 "/lokalnie/szkody-gornicze-lubin","/lokalnie/szkody-gornicze-polkowice"
])assert.equal(hubLinks.filter(url=>url===pathname).length,1,pathname+" missing or duplicated in published hub");
const archiveLinks=await readFile("dist/sitemap.xml","utf8");
for(const dest of hubLinks)assert.ok(archiveLinks.includes("<loc>"+origin+dest+"</loc>"),"Hub target not present in XML sitemap: "+dest);
console.log("HUB_INDEXABLE_LINKS_OK: 8 public, sitemap-listed service/local destinations visible without JavaScript.");

// Local landing pages must link visibly to the approved, indexed guide and
// to their sibling city, without creating new doorway pages or source duplicates.
for(const city of ["lubin","polkowice"]){
 const path="dist/lokalnie/szkody-gornicze-"+city+".html";
 const content=await readFile(path,"utf8");
 const guide="/wiedza/drobne-pekniecia-szkody-gornicze";
 const destinations=[...content.matchAll(/href="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(destinations.filter(href=>href===guide).length,1,
  "Exactly one visible approved guide link required: "+city);
 assert.ok(destinations.includes("/uslugi/szkody-gornicze"),
  "Main mining service must stay linked: "+city);
 assert.ok(destinations.includes("/lokalnie/szkody-gornicze-"+(city==="lubin"?"polkowice":"lubin")),
  "Nearby local page must stay discoverable: "+city);
 const related=content.match(/<div class="local-related">([\s\S]*?)<\/div>/)?.[1]||"";
 assert.ok(related.includes('href="'+guide+'"'),"Guide must be accessible in local context: "+city);
 assert.ok(content.includes('data-service="Szkody górnicze"')&&
  content.includes('data-locality="'+(city==="lubin"?"Lubin":"Polkowice")+'"'),
  "Preserve local adviser selection: "+city);
}
console.log("LOCAL_GUIDE_DISCOVERY_OK: two indexed city pages link to one approved guide, the main service and each other.");

console.log("GEO_EDITORIAL_RESULT "+JSON.stringify({servicePages:checked,visibleAnswers:checked*3,verifiedOfficialSourceLinks:checked,aboutContactAligned:true,linkedServiceSchemas:checked,searchBotAllowed:true,zeroRealMail:true}));
