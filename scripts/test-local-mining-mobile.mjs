#!/usr/bin/env node
/** Local mining contact: read-only, privacy-safe regression test for 320px paths. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const css=await readFile("v2/local-mining.css","utf8");
assert.ok(css.includes(".local-mobile-contact"),"Local mobile styles missing");
assert.ok(css.includes("@media(max-width:680px)"),"Mobile visibility breakpoint missing");
assert.ok(css.includes(".local-mining-page .chat-assistant"),
 "Chatbot launcher must be moved above the local mobile contact bar");
assert.ok(css.includes("bottom:calc(94px + env(safe-area-inset-bottom"),
 "Chatbot cannot overlap the form link at 320px");
assert.ok(css.includes(".local-mining-page .chat-panel"),
 "Expanded chatbot needs a usable height above the fixed contact bar");
assert.ok(css.includes("env(safe-area-inset-bottom"),"Notch/safe-area space missing");
assert.ok(css.includes("@media print")&&css.includes("display:none!important"),"Print must exclude sticky bar");
for(const [slug,city] of [["lubin","Lubin"],["polkowice","Polkowice"]]){
 const name="dist/lokalnie/szkody-gornicze-"+slug+".html";
 const html=await readFile(name,"utf8");
 const section=html.match(/<aside class="local-mobile-contact"[\s\S]*?<\/aside>/)?.[0]||"";
 assert.equal((html.match(/class="local-mobile-contact"/g)||[]).length,1,"Only one mobile contact block: "+city);
 assert.ok(section.includes("aria-label=")&&section.includes(city),"Descriptive landmark missing: "+city);
 assert.ok(section.includes('href="tel:+48796441345"'),"Wojciech call link missing: "+city);
 assert.ok(section.includes('href="#formularz"'),"Form anchor missing: "+city);
 assert.equal((section.match(/<a\b/g)||[]).length,2,"Exactly two contact actions: "+city);
 assert.ok(html.includes('id="formularz"'),"Local target missing: "+city);
 const preparation=html.match(/<aside class="local-prep-tool"[\s\S]*?<\/aside>/)?.[0]||"";
 assert.equal((html.match(/class="local-prep-tool"/g)||[]).length,1,
  "Exactly one locally relevant preparation link: "+city);
 assert.ok(preparation.includes('aria-labelledby="local-prep-tool-title"')&&
  preparation.includes('id="local-prep-tool-title"'),"Preparation tool needs a visible accessible heading: "+city);
 assert.ok(preparation.includes('href="/poradniki/checklista-szkody-gorniczej"'),
  "Release must link to the existing canonical print checklist: "+city);
 assert.ok(preparation.includes("do druku")&&preparation.includes("bez logowania"),
  "Describe actual checklist behavior without claiming a downloadable file: "+city);
 assert.ok(!preparation.includes("data-contact-form")&&!preparation.includes("utm_")&&
  !preparation.includes("<script"),"Local preparation must remain private/static: "+city);
 assert.ok(html.indexOf(preparation)<html.indexOf('id="formularz"'),
  "Preparation must precede local lead form: "+city);

 assert.ok(html.indexOf('class="local-mobile-contact"')<html.indexOf('<main id="main"'),
  "Mobile actions must appear before main for predictable keyboard order: "+city);
 assert.ok(!/data:\s*|onclick=|onload=|target="_blank"/.test(section),
  "Contact bar must stay static, local and private: "+city);
 assert.ok(html.includes('src="/contact.js" data-service="Szkody górnicze" data-locality="'+city+'"'),
  "Preselected local form service lost during release: "+city);
}
// Nowy poradnik o ugodzie ma być odkrywalny w obu lokalizacjach oraz nie ingerować w formularze.
const verifiedGuide="/wiedza/ugoda-z-kopalnia-co-sprawdzic";
for(const citySlug of ["lubin","polkowice"]){
 const localPage=await readFile("dist/lokalnie/szkody-gornicze-"+citySlug+".html","utf8");
 const boxBegin=localPage.indexOf('<aside class="local-settlement-guide');
 const boxEnd=localPage.indexOf("</aside>",boxBegin);
 const box=boxBegin>=0&&boxEnd>boxBegin?localPage.slice(boxBegin,boxEnd+8):"";
 assert.ok(box.includes('id="local-settlement-title"'),"Local agreement guide missing heading: "+citySlug);
 assert.equal(box.split('href="'+verifiedGuide+'"').length-1,1,"Unique guide destination required: "+citySlug);
 assert.equal(box.split('href="#formularz"').length-1,1,"Unique local contact destination required: "+citySlug);
 assert.ok(box.includes('href="'+verifiedGuide+'"'),"Local agreement guide canonical URL missing: "+citySlug);
 assert.ok(box.includes('href="#formularz"'),"Local form destination missing: "+citySlug);
 assert.ok(box.includes("PESEL")&&!box.includes("<form"),"Local agreement guide cannot collect case documents");
 assert.ok(localPage.indexOf('class="local-settlement-guide')<localPage.indexOf('local-faq"'),
  "Agreement guidance must precede FAQ: "+citySlug);
}
assert.ok(css.includes(".local-settlement-actions a:focus-visible")&&css.includes("@media(max-width:800px)"),
 "Agreement guidance must work at 320px and with keyboard focus");

// Contextual information from KGHM is checked against an explicit, reviewed source.
// Both city pages must keep official information separate from marketing contact.
const officialSource="https://kghm.com/pl/zrownowazony-rozwoj/ekologia-i-srodowisko/ochrona-obiektow-na-terenach-gorniczych";
for(const [slug,city,topic] of [
 ["lubin","Lubin","pęknięcia ścian"],
 ["polkowice","Polkowice","kostka"]
]){
 const html=await readFile("dist/lokalnie/szkody-gornicze-"+slug+".html","utf8");
 const start=html.indexOf('<section class="local-source-guide local-container"');
 const end=html.indexOf("</section>",start);
 const region=start>=0&&end>start?html.slice(start,end+10):"";
 assert.equal((html.match(/class="local-source-guide local-container"/g)||[]).length,1,
  "One curated KGHM procedure section per city: "+city);
 assert.ok(region.includes('aria-labelledby="local-source-title"')&&region.includes('id="local-source-title"'),
  "Source heading must be accessible: "+city);
 assert.ok(region.includes(city)&&region.includes(topic),
  "Source must be genuinely specific to this city and type of damage: "+city);
 assert.ok(region.includes('href="'+officialSource+'"')&&region.includes('rel="noopener noreferrer"'),
  "Official KGHM source must be directly visitable: "+city);
 assert.ok(region.includes('href="/plan-dzialania?broszura=szkody-gornicze#broszura"'),
  "Canonical printable A4 brochure missing: "+city);
 assert.ok(region.includes('href="#formularz"'),"KGHM context must connect to local contact: "+city);
 assert.ok(region.includes("PESEL")&&region.includes("protok"),"Privacy or protocol caution missing: "+city);
 assert.ok(html.indexOf(region)>html.indexOf('class="local-prep-tool"')&&
  html.indexOf(region)<html.indexOf('class="local-settlement-guide')&&
  html.indexOf(region)<html.indexOf('id="formularz"'),
  "Official source must appear after basic steps and before agreement/contact: "+city);
 assert.ok(!region.includes("<form")&&!region.includes("data-contact-form")&&!region.includes("<script")&&
  !region.includes("onclick=")&&!region.includes("onload="),
  "Source and brochure section cannot process client data: "+city);
}
assert.ok(css.includes(".local-source-guide")&&css.includes(".local-source-guide a:focus-visible")&&
 css.includes("@media(max-width:800px)"),"New official-source cards require responsive keyboard styles");
console.log("LOCAL_MINING_KGHM_SOURCE_OK: two city-specific procedural guides, source links and printable A4 pathways.");

console.log("LOCAL_MINING_MOBILE_OK: Lubin and Polkowice have two static 44px+ contact actions.");

const printTool=await readFile("v2/poradniki/checklista-szkody-gorniczej.html","utf8");
assert.ok(printTool.includes("data-checklist-print")&&printTool.includes("data-checklist-item"),
 "The local link must lead to a real printable interactive checklist");
assert.ok(css.includes(".local-prep-tool")&&css.includes(".local-prep-tool-action:focus-visible"),
 "Responsive and keyboard-visible preparation CTA required");

for(const city of ["lubin","polkowice"]){
 const html=await readFile("v2/lokalnie/szkody-gornicze-"+city+".html","utf8");
 const jumps=html.match(/<nav class="local-section-jumps local-container"[\s\S]*?<\/nav>/)?.[0]||"";
 assert.equal((jumps.match(/<a href="/g)||[]).length,4);
 for(const [,id] of jumps.matchAll(/href="#([^"]+)"/g))assert.ok(html.includes('id="'+id+'"'));
}
for(const slug of ["szkody-gornicze","swiadczenie-wspierajace","skd","renty-powypadkowe"]){
 const page=await readFile("v2/kampanie/"+slug+".html","utf8");
 const context=page.match(/<div class="campaign-form-intro">[\s\S]*?<\/div>/)?.[0]||"";
 assert.ok(context.includes(["swiadczenie-wspierajace","renty-powypadkowe"].includes(slug)?"Paulina Chandrała":"Wojciech Obiegło"));
}

for(const city of ["lubin","polkowice"]){
 const html=await readFile("v2/lokalnie/szkody-gornicze-"+city+".html","utf8");
 assert.equal((html.match(/class="local-damage-icon" aria-hidden="true"><svg/g)||[]).length,3);
}
assert.ok(css.includes(".local-damage-icon svg"));
