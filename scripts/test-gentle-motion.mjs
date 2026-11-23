#!/usr/bin/env node
/** Gentle site motion: source guardrails, accessibility and deployment safety. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const home=await readFile("v2/home-flow.css","utf8");
const campaign=await readFile("v2/styles.css","utf8");
const campaignLayer=await readFile("v2/lead-persona.css","utf8");
assert.ok(!campaignLayer.includes("GENTLE-MOTION-20261123"),
 "Sitewide base CSS must own the 537-byte animation, not the 80 KB service layer");
const homeHtml=await readFile("v2/index.html","utf8");
const benefit=await readFile("v2/kampanie/swiadczenie-wspierajace.html","utf8");
const segment=(css)=>css.slice(css.lastIndexOf("/* GENTLE-MOTION-20261123"));
const a=segment(home),b=segment(campaign);
assert.ok(a.startsWith("/* GENTLE-MOTION-20261123")&&b.startsWith("/* GENTLE-MOTION-20261123"),
 "Both motion enhancements must remain scoped and at the end of existing CSS files");
assert.ok(homeHtml.includes('class="wrap motion-section"')&&
 homeHtml.includes('src="/v2/motion.js"'),
 "Reuse existing homepage scroll observer, do not add another tracking or animation script");
assert.ok(benefit.includes('class="campaign-hero"')&&
 benefit.includes('class="campaign-copy"')&&benefit.includes('id="formularz" class="campaign-form"'),
 "Animated campaign content must exist and the form must retain its accessible anchor");
assert.ok(homeHtml.includes('href="/v2/uslugi/swiadczenie-wspierajace.html"')&&
 benefit.includes('href="tel:+48500171531"'),
 "The animation must not alter the primary conversion routes");
for(const [name,css] of [["home",a],["campaign",b]]){
 assert.ok(css.includes("prefers-reduced-motion:no-preference"),
  name+": animation must be opt-in for motion-friendly devices");
 assert.ok(css.includes("prefers-reduced-motion:reduce"),
  name+": always provide reduced-motion override");
 if(name==="home")assert.ok(css.includes("(hover:hover) and (pointer:fine)"),
  "Homepage hover lifting must not simulate a sticky mobile hover");
 assert.ok(!/\binfinite\b|requestAnimationFrame|setInterval|@import|url\(/i.test(css),
  name+": no perpetual animation, extra requests, timers or animation scripts");
 assert.ok(!/height\s*:|width\s*:|margin\s*:|padding\s*:/i.test(css),
  name+": motion must not change layout geometry");
 if(name==="home")assert.ok(/transition:\s*(?:transform|opacity)/i.test(css),
  "Homepage transition must affect only transform and opacity");
}
assert.ok(a.includes("translate3d(0,10px,0)")&&a.includes("transition:opacity .44s"),
 "Homepage scroll effects must be gentler than the old 26px/650ms reveal");
assert.ok(b.includes("@keyframes support-gentle-enter")&&
 b.includes("translateY(6px)")&&
 b.includes("animation:support-gentle-enter .42s")&&
 b.includes("animation:support-gentle-enter .46s"),
 "Support campaign entrance must be short, subtle and one-time");
assert.ok(!/@keyframes[^\{]*\{[^}]*opacity/i.test(b),
 "Campaign text must never begin invisible, even for slow devices or screenshots");
assert.ok(Buffer.byteLength(b,"utf8")<600,
 "Support campaign motion must fit the strict 80 KB merged CSS budget");
assert.ok(!b.includes(" .contact-form{")&&!b.includes(" .contact-form input"),
 "Never move or animate a form control while a visitor types");
assert.ok(a.includes("transition:none!important")&&b.includes("animation:none!important"),
 "System motion accessibility setting must take precedence");
console.log("GENTLE_MOTION_OK: homepage 10px/440ms; support 6px/420-460ms; reduced motion; no extra assets.");
