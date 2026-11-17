#!/usr/bin/env node
/** Ensure the FAQ's visible service directory leads only to canonical, indexable destinations. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const root="https://twoja-sprawa.pages.dev";
const faq=await readFile("dist/faq.html","utf8");
const sitemap=await readFile("dist/sitemap.xml","utf8");
const html=faq.match(/<nav class="faq-service-directory faq-container"[\\s\\S]*?<\\/nav>/)?.[0]||"";
assert.ok(html,"FAQ must contain a server-rendered service directory");
assert.ok(html.includes('aria-labelledby="faq-service-directory-title"'),"Semantic name missing");
const urls=[...html.matchAll(/href="(\\/[^"]+)"/g)].map(x=>x[1]);
const expected=[
 "/uslugi/szkody-gornicze","/uslugi/swiadczenie-wspierajace",
 "/uslugi/kredyty-pln","/uslugi/renty-powypadkowe",
 "/uslugi/kredyty-frankowe","/uslugi/sluzebnosc-przesylu",
 "/lokalnie/szkody-gornicze-lubin","/lokalnie/szkody-gornicze-polkowice"
];
assert.deepEqual(urls,expected,"All eight service/city links must be in priority order and extensionless");
for(const route of urls){
 assert.equal((sitemap.match(new RegExp("<loc>"+root+route+"</loc>","g"))||[]).length,1,
  "FAQ link missing exactly once in XML sitemap: "+route);
 const page=await readFile("dist"+route+".html","utf8");
 assert.ok(page.includes('<meta name="robots" content="index,follow">'),"Linked page cannot be noindex: "+route);
 assert.ok(page.includes('<link rel="canonical" href="'+root+route+'">'),"Wrong canonical: "+route);
}
const css=await readFile("dist/faq.css","utf8");
assert.ok(css.includes(".faq-directory-grid"),"FAQ directory needs mobile layout");
assert.ok(css.includes("@media(max-width:650px)"),"FAQ directory needs single-column layout on phones");
assert.equal((faq.match(/class="faq-card"/g)||[]).length,24,"All FAQ items must remain available");
console.log("FAQ_DISCOVERY_LINKS_OK: eight indexable canonical service/city pages linked visibly from FAQ.");