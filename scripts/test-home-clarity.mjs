#!/usr/bin/env node
/** Strona główna: 2 projekty priorytetowe, 4 wtórne i widoczna pomoc w wyborze. */
import assert from "node:assert/strict";
import {readFile,access} from "node:fs/promises";
const html=await readFile("v2/index.html","utf8");
const css=await readFile("v2/home-flow.css","utf8");
const navigator=await readFile("v2/service-navigator.js","utf8");
const marks=["<section class=\"hero hero-glamour\"","<section id=\"uslugi\"","<details id=\"dobierz-pomoc\"","<section class=\"wrap team-spotlight","<section id=\"kontakt\""];
let last=-1;
for(const mark of marks){
 const i=html.indexOf(mark);
 assert.ok(i>=0&&i>last,"Homepage order/missing section: "+mark);
 last=i;
}
const beg=html.indexOf('class="grid primary-services"');
const end=html.indexOf('<details class="service-extra"',beg);
assert.ok(beg>=0&&end>beg,"Homepage services area missing");
const segment=html.slice(beg,end);
const links=[...segment.matchAll(/class="card primary-card[^"]*" href="([^"]+)"/g)].map(m=>m[1]);
assert.equal(links.length,6,"Should show six distinct service cards");
assert.equal(new Set(links).size,6,"Duplicated service links");
for(const link of links){
 assert.ok(link.startsWith("/v2/uslugi/")&&link.endsWith(".html"),"Bad service path "+link);
 await access(link.slice(1));
}
assert.ok(segment.indexOf("support-featured")<segment.indexOf("mining-featured"),"Support and mining order altered");
assert.ok(segment.includes("Sankcja Kredytu Darmowego")&&segment.includes("Pomoc frankowiczom"),"Financial areas not shown explicitly");
assert.ok(html.includes("Dwa główne projekty oraz cztery dodatkowe obszary"),"Homepage description stale");
assert.ok(html.includes('href="/v2/home-flow.css"'),"Balanced layout CSS missing");
assert.ok(css.includes("grid-template-columns:repeat(12,minmax(0,1fr))"),"Desktop balanced grid missing");
assert.ok(css.includes("grid-column:span 6")&&css.includes("grid-column:span 3"),"2+4 desktop layout missing");
assert.ok(css.includes("@media(max-width:760px)")&&css.includes("grid-template-columns:minmax(0,1fr)"),"Mobile one-column layout missing");
assert.ok(navigator.includes('window.location?.hash==="#dobierz-pomoc"'),"Deep link does not open collapsed navigator");
assert.ok(navigator.includes('root.open=true'),"Navigator not expanded on user action");
// Contact must remain easy to reach on smaller phones, with a direct form option.
const bar=html.match(/<aside class="mobile-contact-bar"[\s\S]*?<\/aside>/)?.[0]||"";
assert.ok(bar.includes('tel:+48796441345')&&bar.includes('tel:+48500171531'),"Both phone actions missing");
assert.ok(bar.includes('class="mobile-form-link" href="#kontakt"'),"Missing direct form shortcut");
assert.equal((bar.match(/<a\b/g)||[]).length,3,"Mobile contact bar must have exactly three actions");
assert.ok(css.includes('grid-template-columns:repeat(3,minmax(0,1fr))'),"Three actions are not fitted to a narrow screen");
assert.ok(css.includes(':focus-within')&&css.includes('.chat-assistant.is-open'),"Sticky contact bar can cover an active form or chat");
assert.ok(html.includes("data-share-page")&&html.includes("data-share-feedback"),"Share control has no user feedback");
assert.ok(html.includes('src="/v2/share-page.js"'),"Share control script missing");

// The homepage offers only two concise, accessible shortcuts to the same form.
const shortcutBlock=html.match(/<div class="contact-service-shortcuts"[\s\S]*?<\/div><div class="lead-panel"/)?.[0]||"";
assert.equal((shortcutBlock.match(/data-contact-shortcut="/g)||[]).length,2,"Exactly two flagship contact shortcuts required");
assert.ok(shortcutBlock.includes('data-contact-shortcut="szkody"'),"Mining shortcut missing");
assert.ok(shortcutBlock.includes('data-contact-shortcut="swiadczenie"'),"Support shortcut missing");
assert.ok(shortcutBlock.includes('role="status" aria-live="polite"'),"Selection feedback should be accessible");
assert.ok(css.includes("contact-shortcuts-actions")&&css.includes('data-selected="true"'),"Flagship selection styling missing");
assert.ok(html.includes('<div class="lead-panel"><div data-contact-form></div></div>'),"Shortcuts must reuse the existing homepage form");

// Keep the homepage CSS lean without losing its visible article/FAQ cards.
assert.ok(!html.includes('href="/v2/knowledge-articles.css"'),"Homepage still downloads long-form article CSS");
for(const [selector,name] of [
 [".premium-v2 .editorial-reading","editorial recommendations"],
 [".premium-v2 .hub-all-link","knowledge hub entry"],
 [".premium-v2 .faq-explore-all","FAQ entry"]
]){
 assert.ok(css.includes(selector),"Homepage lost "+name+" styling during CSS consolidation");
}
const articleCSS=await readFile("v2/knowledge-articles.css","utf8");
assert.ok(articleCSS.includes(".knowledge-article .knowledge-body"),"Do not remove styles needed by article pages");
const previousHomeBytes=9005,previousArticleBytes=3667;
const oldTotal=previousHomeBytes+previousArticleBytes;
const newTotal=Buffer.byteLength(css,"utf8");
assert.ok(newTotal<oldTotal,"Consolidation should decrease transfer size for homepage");

console.log("HOME_CLARITY_OK: 6 unique service cards (2+4), priority visible, keyboard-friendly navigator, balanced desktop/mobile layout.");
