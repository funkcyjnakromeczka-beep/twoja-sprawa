#!/usr/bin/env node
/* Contact page: two direct, accessible phone links before long sections. No requests. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const html=await readFile("v2/kontakt.html","utf8");
const css=await readFile("v2/contact-hub.css","utf8");
const nav=html.match(/<nav class="contact-direct-call"[\s\S]*?<\/nav>/)?.[0]||"";
assert.ok(nav.includes('aria-label="Bezpośredni kontakt telefoniczny z przedstawicielem"'));
const links=[...nav.matchAll(/<a href="(tel:[^"]+)" data-call-person="([^"]+)"/g)]
  .map(([,href,person])=>({href,person}));
assert.deepEqual(links,[
  {href:"tel:+48796441345",person:"wojciech"},
  {href:"tel:+48500171531",person:"paulina"}
]);
for(const number of ["796 441 345","500 171 531"])
 assert.ok(nav.includes(number),"Missing visible telephone: "+number);
assert.ok(nav.includes("Szkody górnicze")&&nav.includes("Świadczenie wspierające"),
  "Both contact areas must be visible");
assert.ok(nav.includes("SKD")&&nav.includes("renty powypadkowe"),
  "Advisor roles must be clear without reading the entire contact page");
assert.ok(nav.includes('aria-label="Zadzwoń do Wojciecha')&&
 nav.includes('aria-label="Zadzwoń do Pauliny'),"Each call requires descriptive accessible name");
assert.ok(html.indexOf('class="contact-direct-call"')>html.indexOf("<h1>")&&
 html.indexOf('class="contact-direct-call"')<html.indexOf('class="contact-route-links"')&&
 html.indexOf('class="contact-route-links"')<html.indexOf('id="formularz"'),
 "Call actions must precede complex navigation and form");
assert.ok(css.includes(".theme-contact .contact-direct-call>a:focus-visible"),
 "Keyboard users require a visible focus indicator");
assert.ok(css.includes(".theme-contact .contact-direct-call>a{")&&
 css.includes("min-height:112px")&&css.includes("@media(max-width:680px)")&&
 css.includes("grid-template-columns:minmax(0,1fr)"),
 "The buttons must be large and adapt to narrow mobile devices");
assert.ok(nav.indexOf("tel:+48796441345")<nav.indexOf("tel:+48500171531"),
 "Keep specialist ordering stable");
assert.ok(!nav.includes("<form")&&!nav.includes("onclick=")&&!nav.includes("mailto:"),
 "Call actions must be native telephone links, not forms or hidden scripts");
console.log("CONTACT_DIRECT_CALL_OK: both advisors, roles, accessible call buttons, no JS dependency.");
