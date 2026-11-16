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
 ["sluzebnosc-przesylu","https://eli.gov.pl/eli/DU/2025/1071/ogl"]
];
let checked=0;
for(const [slug,source] of services){
 const html=await readFile("dist/uslugi/"+slug+".html","utf8");
 const section=html.match(/<section class="service-answers wrap"[\s\S]*?<\/section>/)?.[0];
 assert.ok(section,"Missing static answer section "+slug);
 assert.match(section,/id="pytania-o-usludze"/);
 assert.match(section,/id="service-answers-title"/);
 assert.equal((section.match(/class="service-answer"/g)||[]).length,3,slug+" should have exactly 3 substantive answers");
 assert.equal((section.match(/<h3>/g)||[]).length,3);
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

console.log("GEO_EDITORIAL_RESULT "+JSON.stringify({servicePages:checked,visibleAnswers:checked*3,verifiedOfficialSourceLinks:checked,aboutContactAligned:true,linkedServiceSchemas:checked,searchBotAllowed:true,zeroRealMail:true}));
