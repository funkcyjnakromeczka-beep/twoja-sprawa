#!/usr/bin/env node
/** Strict source-only release readiness checks: does not deploy or send any leads. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {shouldIndexRoute} from "./seo-policy.mjs";
const read=path=>readFile(path,"utf8");
const [builder,preview,home,contact,about,policy,hub,llms]=await Promise.all([
 read("scripts/build.mjs"),read("scripts/preview.mjs"),read("v2/index.html"),
 read("v2/contact.js"),read("v2/o-nas.html"),read("v2/polityka-prywatnosci.html"),
 read("v2/wiedza/index.html"),read("v2/llms.txt")
]);
for(const marker of ["LEGAL_APPROVED","CONTENT_APPROVED","FORM_APPROVED","RELEASE","SITE_URL"]){
 assert.ok(builder.includes(marker),"Release gate missing: "+marker);
}
for(const marker of ['await fetchPortraits();','localizePortraits(html)','robots.txt','sitemap.xml','shouldIndexRoute(route)']){
 assert.ok(builder.includes(marker),"Release builder missing: "+marker);
}
assert.ok(preview.includes("noindex,nofollow"));
assert.ok(preview.includes("Disallow: /"));
assert.equal(shouldIndexRoute("/404.html"),false);
assert.equal(shouldIndexRoute("/wiedza/"),true);
assert.equal(shouldIndexRoute("/wiedza/drobne-pekniecia-szkody-gornicze.html"),true);
assert.equal(shouldIndexRoute("/wiedza/swiadczenie-wspierajace-2026-wzon-zus.html"),true);
assert.equal(shouldIndexRoute("/kampanie/szkody-gornicze.html"),false);
assert.equal(shouldIndexRoute("/kampanie/swiadczenie-wspierajace.html"),false);
for(const marker of ['id="zespol"','id="uslugi"','id="kontakt"','class="hub-all-link"']){
 assert.ok(home.includes(marker),"Homepage conversion/SEO link missing: "+marker);
}
for(const path of ["drobne-pekniecia-szkody-gornicze.html","swiadczenie-wspierajace-2026-wzon-zus.html"]){
 assert.ok(hub.includes(path),"Library hub article not linked: "+path);
}
for(const marker of ["data-contact-form","telefon","Web3Forms"]){
 // Contact code and privacy must remain inspectable by a reviewer.
 assert.ok(contact.includes(marker)||policy.includes(marker),"Required contact phrase missing: "+marker);
}
for(const person of ["Wojciech Obiegło","Paulina Chandrała"]){
 assert.ok(about.includes(person),"Profile missing: "+person);
 assert.ok(llms.includes(person),"AI contact directory missing: "+person);
}
assert.ok(policy.includes("Web3Forms"),"Policy must identify form processor");
assert.ok(home.includes("SuccessTree"),"Independent agency must be identified");
console.log("OK: release gates, noindex preview, approved routes, images, contact, safety and two flagship services. No deployment performed.");
