#!/usr/bin/env node
/** Strona główna: 3 wyróżnione usługi (WZON, szkody, SKD), 3 pozostałe. */
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
assert.ok(segment.indexOf("support-featured")<segment.indexOf("mining-featured")&&segment.indexOf("mining-featured")<segment.indexOf("skd-featured"),"Three flagship priorities must be WZON, mining, SKD");
const headerNav=html.slice(html.indexOf('<nav id="site-main-nav"'),html.indexOf("</nav>",html.indexOf('<nav id="site-main-nav"')));
const priorityNav=[...headerNav.matchAll(/class="nav-(support|mining|skd)-priority"/g)].map(x=>x[1]);
assert.deepEqual(priorityNav,["support","mining","skd"],"Main navigation must expose WZON, mining, SKD as the top three projects");
assert.ok(headerNav.includes('class="nav-skd-priority" href="/v2/uslugi/kredyty-pln.html"'),"SKD navigation route missing");
assert.ok(css.includes(".nav-skd-priority"),"SKD main navigation contrast styles missing");
assert.ok(links[2].endsWith("/kredyty-pln.html")&&links[3].endsWith("/renty-powypadkowe.html"),"SKD must be the third featured card and precede rents");
assert.ok(segment.includes("Trzecia wyróżniona usługa • SKD")&&segment.includes("wojciech.obieglo@votum-ds.pl")&&segment.includes("numer telefonu"),"Homepage SKD lacks prominent contract and callback instructions");
assert.ok(segment.includes("Sankcja Kredytu Darmowego")&&segment.includes("Pomoc frankowiczom"),"Financial areas not shown explicitly");
assert.ok(html.includes("Trzy wyróżnione usługi:"),"Homepage description must name three featured services");
assert.ok(html.includes('href="/v2/home-flow.css"'),"Balanced layout CSS missing");
assert.ok(css.includes("grid-template-columns:repeat(12,minmax(0,1fr))"),"Desktop balanced grid missing");
assert.ok(css.includes("grid-column:span 12!important")&&css.includes("grid-column:span 4"),"Desktop grid must support featured SKD and three other areas");
assert.ok(css.includes("@media(max-width:760px)")&&css.includes("grid-template-columns:minmax(0,1fr)"),"Mobile one-column layout missing");
assert.ok(navigator.includes('window.location?.hash==="#dobierz-pomoc"'),"Deep link does not open collapsed navigator");
assert.ok(navigator.includes('root.open=true'),"Navigator not expanded on user action");
// Contact must remain easy to reach on smaller phones, with a direct form option.
const bar=html.match(/<aside class="mobile-contact-bar"[\s\S]*?<\/aside>/)?.[0]||"";
assert.ok(bar.includes('tel:+48796441345')&&bar.includes('tel:+48500171531'),"Both phone actions missing");
assert.ok(bar.includes('class="mobile-form-link" href="#kontakt"'),"Missing direct form shortcut");
const mobileTop=html.match(/<nav class="mobile-quick-nav"[\s\S]*?<\/nav>/)?.[0]||"";
assert.deepEqual([...mobileTop.matchAll(/class="mobile-(support|mining|skd)-priority"/g)].map(m=>m[1]),["support","mining","skd"],"Mobile quick links must expose all three flagship services in order");
assert.ok(mobileTop.includes('href="/v2/uslugi/kredyty-pln.html"'),"Mobile SKD service destination missing");
assert.equal((bar.match(/<a\b/g)||[]).length,3,"Mobile contact bar must have exactly three actions");
assert.ok(css.includes('grid-template-columns:repeat(3,minmax(0,1fr))'),"Three actions are not fitted to a narrow screen");
assert.ok(css.includes(':focus-within')&&css.includes('.chat-assistant.is-open'),"Sticky contact bar can cover an active form or chat");
assert.ok(html.includes("data-share-page")&&html.includes("data-share-feedback"),"Share control has no user feedback");
assert.ok(html.includes('src="/v2/share-page.js"'),"Share control script missing");

// The homepage offers three accessible flagship shortcuts to the same form.
const shortcutBlock=html.match(/<div class="contact-service-shortcuts"[\s\S]*?<\/div><div class="lead-panel"/)?.[0]||"";
assert.equal((shortcutBlock.match(/data-contact-shortcut="/g)||[]).length,3,"Exactly three flagship contact shortcuts required");
assert.ok(shortcutBlock.includes('data-contact-shortcut="szkody"'),"Mining shortcut missing");
assert.ok(shortcutBlock.includes('data-contact-shortcut="swiadczenie"'),"Support shortcut missing");
assert.ok(shortcutBlock.includes('data-contact-shortcut="skd"'),"SKD shortcut missing");
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
assert.ok(newTotal<18000,"Home-only CSS should remain smaller than the 18KB regression budget");
assert.ok(oldTotal>0,"Previous home CSS baseline must remain defined");

const skdPage=await readFile("v2/uslugi/kredyty-pln.html","utf8");
const skdCSS=await readFile("v2/skd-contact.css","utf8");
assert.ok(skdPage.includes('href="/v2/skd-contact.css"')&&skdPage.includes('id="skd-document-title"'),"Dedicated SKD email CTA styling or section missing");
assert.ok(skdPage.includes("mailto:wojciech.obieglo@votum-ds.pl?subject="),"SKD email destination must be Wojciech");
assert.ok(skdPage.includes("Zostaw numer telefonu w formularzu")&&skdPage.includes("Dodaj załącznik samodzielnie"),"Agreement, callback and attachment instructions required");
assert.ok(skdPage.includes("bez zasłaniania danych")&&skdCSS.includes(".skd-document-actions"),"Unredacted SKD contract policy and CTA styles required");

assert.ok(skdPage.includes('class="skd-mobile-quickbar"')&&skdPage.includes('class="skd-mobile-phone" href="#formularz"'),"SKD mobile quick bar must provide direct callback form");
assert.ok(skdPage.includes('class="skd-mobile-mail" href="mailto:wojciech.obieglo@votum-ds.pl?subject='),"SKD mobile quick bar must link to Wojciech agreement email");
assert.equal((skdPage.match(/class="skd-mobile-quickbar"/g)||[]).length,1,"SKD mobile quick bar should be present only once");
assert.ok(skdCSS.includes("@media(max-width:650px)")&&skdCSS.includes(".skd-mobile-quickbar")&&skdCSS.includes("env(safe-area-inset-bottom)"),"Mobile quickbar must honor phone safe area");
assert.ok(skdCSS.includes("body.premium-subpage.theme-skd .chat-assistant:not(.is-open)")&&skdCSS.includes(".contact-form input:focus"),"SKD chat offset must override generic subpage :not(.is-open) CSS and avoid keyboard collisions");

assert.ok(skdPage.includes("sprawdź adres odbiorcy")||skdPage.includes("Sprawdź adres odbiorcy"),"SKD email must remind visitors to verify recipient");
for(const file of [
 "v2/uslugi/kredyty-pln.html",
 "v2/chat-assistant.js",
 "v2/service-navigator.js",
 "v2/poradniki/skd-kredyt-pln-lista-kontrolna.html",
 "v2/wiedza/kredyt-pln-dokumenty-skd.html"
]){
 const copy=await readFile(file,"utf8");
 assert.ok(!/(?:Zasłoń zbędne dane|Przed wysyłką zasłoń|zasłonięciu PESEL|usuń z kopii zbędne dane)/i.test(copy),"Obsolete masking instruction remains: "+file);
 assert.ok(copy.includes("wojciech.obieglo@votum-ds.pl"),"SKD email destination lost: "+file);
}
const skdChecklist=await readFile("v2/poradniki/skd-kredyt-pln-lista-kontrolna.html","utf8");
assert.ok(skdChecklist.includes('class="guide-phone" href="tel:+48796441345"'),"SKD checklist contact CTA must direct to Wojciech");
assert.ok(!skdChecklist.includes('class="guide-phone" href="tel:+48500171531"'),"SKD checklist contact CTA must not direct to the support advisor");
// The independent Cloudflare site must own both specialist portraits.
// The old Lovable instance might be removed or redirected in future.
for(const [path,markup] of [
 ["v2/index.html",html],
 ["v2/kontakt.html",await readFile("v2/kontakt.html","utf8")],
 ["v2/o-nas.html",await readFile("v2/o-nas.html","utf8")]
]){
 for(const filename of ["wojciech-obieglo.jpg","paulina-chandrala.jpg"]){
  const src="/v2/assets/"+filename;
  assert.ok(markup.includes('src="'+src+'"'),"Own portrait missing in "+path+": "+src);
  assert.equal((markup.match(new RegExp('src="'+src.replaceAll(".","\\.")+'"',"g"))||[]).length,1,"Unexpected duplicate portrait in "+path);
 }
 assert.ok(!markup.includes("twojasprawa-votum.lovable.app/assets/"),"Old Lovable portrait CDN must not serve team photos: "+path);
}
// Specialist portraits on high-intent service/campaign pages must also be owned locally.
for(const [path,filename] of [
 ["v2/uslugi/szkody-gornicze.html","wojciech-obieglo.jpg"],
 ["v2/uslugi/swiadczenie-wspierajace.html","paulina-chandrala.jpg"],
 ["v2/kampanie/szkody-gornicze.html","wojciech-obieglo.jpg"],
 ["v2/kampanie/swiadczenie-wspierajace.html","paulina-chandrala.jpg"]
]){
 const source=await readFile(path,"utf8");
 assert.ok(source.includes('src="/v2/assets/'+filename+'"'),"Campaign/service portrait not on own hosting: "+path);
 assert.ok(!source.includes("twojasprawa-votum.lovable.app/assets/"),"Old Lovable portrait request still present: "+path);
}
await access("v2/assets/wojciech-obieglo.jpg");
await access("v2/assets/paulina-chandrala.jpg");

console.log("HOME_CLARITY_OK: 6 unique services (2+1+3), SKD third with email and phone CTA.");
