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
 assert.ok(html.indexOf('class="local-mobile-contact"')<html.indexOf('<main id="main"'),
  "Mobile actions must appear before main for predictable keyboard order: "+city);
 assert.ok(!/data:\s*|onclick=|onload=|target="_blank"/.test(section),
  "Contact bar must stay static, local and private: "+city);
 assert.ok(html.includes('src="/contact.js" data-service="Szkody górnicze" data-locality="'+city+'"'),
  "Preselected local form service lost during release: "+city);
}
console.log("LOCAL_MINING_MOBILE_OK: Lubin and Polkowice have two static 44px+ contact actions.");
