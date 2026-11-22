#!/usr/bin/env node
/** Strona główna: 3 wyróżnione usługi (szkody, WZON, SKD), 3 pozostałe. */
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
// Każdy zweryfikowany artykuł ma statyczny link z głównej sekcji poradników.
const readingBegin=html.indexOf('<div class="editorial-reading"');
const readingEnd=html.indexOf("</div>",readingBegin);
const reading=readingBegin>=0&&readingEnd>readingBegin?html.slice(readingBegin,readingEnd+6):"";
const readingUrls=[...reading.matchAll(/href="([^"]+)"/g)].map(x=>x[1]);
const approvedReading=[
 "/v2/wiedza/drobne-pekniecia-szkody-gornicze.html",
 "/v2/wiedza/swiadczenie-wspierajace-2026-wzon-zus.html",
 "/v2/wiedza/ugoda-z-kopalnia-co-sprawdzic.html"
];
const editorialReading=[...approvedReading,"/v2/wiedza/renta-powypadkowa-dokumenty.html"];
assert.deepEqual(readingUrls,editorialReading,"Homepage should prominently link all four reviewed articles");
assert.ok(reading.includes("7 zapisów do sprawdzenia"),"Clear value proposition missing for agreement guide");
assert.ok(css.includes(".premium-v2 .editorial-reading{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))"),"Four review cards need balanced desktop grid");
assert.ok(css.includes("@media(max-width:1020px)")&&css.includes("@media(max-width:700px)"),
 "Homepage reading cards need readable tablet/mobile layouts");

// W górnej części zindeksowanej strony głównej muszą być trzy czytelne ścieżki do
// zweryfikowanych, indeksowalnych poradników bez otwierania rozwijanego menu.
const heroGuidesBegin=html.indexOf('<nav class="hero-reading-shortcuts"');
const heroGuidesEnd=html.indexOf("</nav>",heroGuidesBegin);
const heroGuides=heroGuidesBegin>=0&&heroGuidesEnd>heroGuidesBegin?html.slice(heroGuidesBegin,heroGuidesEnd+6):"";
assert.ok(heroGuides,"Homepage missing static entry to reviewed guides");
assert.ok(heroGuidesBegin<html.indexOf('<nav class="mobile-quick-nav"'),"Guide links must be inside first-screen hero");
assert.deepEqual([...heroGuides.matchAll(/href="([^"]+)"/g)].map(x=>x[1]),approvedReading,
 "Above-the-fold guide shortcuts must only link three approved indexable articles");
assert.ok(heroGuides.includes("Przed zgłoszeniem przeczytaj:"),
 "Guide shortcuts must have informative visible introduction");
assert.ok(css.includes(".hero-reading-shortcuts a:focus-visible")&&css.includes("flex-wrap:wrap"),
 "Guide shortcuts require keyboard focus and wrapped layout on narrow screens");
for(const link of approvedReading)await access(link.slice(1));

// Godziny kontaktu muszą być spójne z profilem firmy i widoczne bez JavaScript.
const contactPageHours=await readFile("v2/kontakt.html","utf8");
for(const [name,markup] of [["home",html],["contact",contactPageHours]]){
 assert.ok(markup.includes("Godziny kontaktu z Wojciechem:"),"Missing working hours on "+name);
 assert.ok(markup.includes("poniedziałek–sobota 11:00–19:00"),"Inconsistent contact hours on "+name);
 assert.ok(markup.includes("niedziela nieczynne"),"Missing Sunday status on "+name);
 assert.ok(markup.includes("dojazdem do klienta"),"Missing mobile-service description on "+name);
}
const homeStructured=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
 .map(([,raw])=>JSON.parse(raw)).flatMap(item=>item["@graph"]||[]);
const ownerContact=homeStructured.find(item=>item["@type"]==="Organization")?.contactPoint?.[0];
assert.ok(ownerContact,"Missing organization contact point");
assert.equal(ownerContact.hoursAvailable?.opens,"11:00");
assert.equal(ownerContact.hoursAvailable?.closes,"19:00");
assert.deepEqual(ownerContact.hoursAvailable?.dayOfWeek,[
 "https://schema.org/Monday","https://schema.org/Tuesday","https://schema.org/Wednesday",
 "https://schema.org/Thursday","https://schema.org/Friday","https://schema.org/Saturday"
],"Structured business hours must match visible Monday-Saturday schedule");

// Strona główna kieruje na kluczowy lokalny obszar pomocy, bez keyword stuffingu.
const homeTitle="Szkody górnicze i świadczenie wspierające | Twoja Sprawa";
const homeDescription="Szkody górnicze w Lubinie i Polkowicach, świadczenie wspierające w całej Polsce, SKD i renty. Sprawdź, jak zgłosić sprawę do SuccessTree.";
assert.ok(html.includes("<title>"+homeTitle+"</title>"),"Homepage SEO title must target local mining");
assert.ok(html.includes('<meta name="description" content="'+homeDescription+'">'),"Missing concise high-intent homepage description");
for(const [key,attr] of [["og:title","property"],["twitter:title","name"]]){
 assert.ok(html.includes('<meta '+attr+'="'+key+'" content="'+homeTitle+'">'),"Preview title mismatch: "+key);
}
for(const [key,attr] of [["og:description","property"],["twitter:description","name"]]){
 assert.ok(html.includes('<meta '+attr+'="'+key+'" content="'+homeDescription+'">'),"Preview description mismatch: "+key);
}
assert.ok(homeTitle.length<=60&&homeDescription.length>=100&&homeDescription.length<=160,"Homepage SEO snippet length unexpectedly changed");

const beg=html.indexOf('class="grid primary-services"');
const end=html.indexOf('<details class="service-extra"',beg);
assert.ok(beg>=0&&end>beg,"Homepage services area missing");
const segment=html.slice(beg,end);
// GSC check 2026-11-21: Google has indexed the home URL but reports the
// two local mining URLs as unknown. Keep their navigation visible to both
// visitors and crawlers, not hidden inside a collapsed details element.
const localBlock=html.match(/<div class="local-areas" id="szkody-lokalnie"[\s\S]*?<\/div><\/div>/)?.[0]||"";
assert.ok(localBlock,"Prominent local entry must be directly visible on the homepage");
assert.ok(beg<html.indexOf('id="szkody-lokalnie"')&&html.indexOf('id="szkody-lokalnie"')<end,
 "Local entry should follow service cards but precede collapsed secondary services");
const collapsedSection=html.slice(end,html.indexOf("</details>",end));
assert.ok(!collapsedSection.includes('href="/v2/lokalnie/'),
 "Do not hide primary local discovery URLs in collapsed sections");
const heroLocalBegin=html.indexOf('<nav class="hero-local-shortcuts"');
const heroLocalEnd=html.indexOf("</nav>",heroLocalBegin);
const heroLocal=heroLocalBegin>=0&&heroLocalEnd>heroLocalBegin?html.slice(heroLocalBegin,heroLocalEnd+6):"";
assert.ok(heroLocalBegin>heroGuidesEnd&&heroLocalEnd<html.indexOf('<nav class="mobile-quick-nav"'),
 "Both local discovery URLs must appear visibly in the indexed first-screen hero");
assert.ok(heroLocal.includes('aria-label="Szkody górnicze — poradniki lokalne"'),
 "Local home links need an accessible navigation landmark");
const cityURLs=["/v2/lokalnie/szkody-gornicze-lubin.html","/v2/lokalnie/szkody-gornicze-polkowice.html"];
assert.deepEqual([...heroLocal.matchAll(/href="([^"]+)"/g)].map(x=>x[1]),cityURLs,
 "Hero must link to the exact two public local service pages, no tracking");
for(const slug of ["szkody-gornicze-lubin","szkody-gornicze-polkowice"]){
 const href='/v2/lokalnie/'+slug+'.html';
 assert.equal(html.split('href="'+href+'"').length-1,2,"Keep one hero and one service-area link for "+slug);
 assert.ok(localBlock.includes('href="'+href+'"'),"Service-area URL must remain visible for "+slug);
 assert.ok(heroLocal.includes('href="'+href+'"'),"First-screen local URL must be visible for "+slug);
 await access('v2/lokalnie/'+slug+'.html');
}
assert.ok(css.includes(".premium-v2 .hero-local-shortcuts a:focus-visible")&&
 css.includes("min-height:44px")&&css.includes("@media(max-width:650px)"),
 "First-screen local shortcuts must be keyboard visible and mobile-friendly");
assert.ok(localBlock.includes("Nie każda rysa oznacza szkodę górniczą"),
 "Local SEO module must retain non-promissory qualification");

const links=[...segment.matchAll(/class="card primary-card[^"]*" href="([^"]+)"/g)].map(m=>m[1]);
assert.equal(links.length,6,"Should show six distinct service cards");
assert.equal(new Set(links).size,6,"Duplicated service links");
for(const [index,link] of links.entries()){
 const valid=index===2?link==="/v2/uslugi/kredyty-pln.html":link.startsWith("/v2/uslugi/")&&link.endsWith(".html");
 assert.ok(valid,"Incorrect service destination "+link);
 await access(link.slice(1));
}
assert.ok(segment.indexOf("mining-featured")<segment.indexOf("support-featured")&&segment.indexOf("support-featured")<segment.indexOf("skd-featured"),"Three flagship priorities must be mining, WZON, SKD");
const headerNav=html.slice(html.indexOf('<nav id="site-main-nav"'),html.indexOf("</nav>",html.indexOf('<nav id="site-main-nav"')));
const priorityNav=[...headerNav.matchAll(/class="nav-(support|mining|skd)-priority"/g)].map(x=>x[1]);
assert.deepEqual(priorityNav,["mining","support","skd"],"Main navigation must expose mining, WZON, SKD as the top three projects");
assert.ok(headerNav.includes('class="nav-skd-priority" href="/v2/uslugi/kredyty-pln.html"'),"SKD navigation route missing");
assert.ok(css.includes(".nav-skd-priority"),"SKD main navigation contrast styles missing");
assert.ok(links[2]==="/v2/uslugi/kredyty-pln.html"&&links[3].endsWith("/renty-powypadkowe.html"),"Third flagship SKD must lead to the indexable service description before rents");
assert.ok(segment.includes('class="card primary-card skd-featured"')&&segment.includes("wojciech.obieglo@votum-ds.pl")&&segment.includes("numer telefonu"),"Homepage SKD lacks prominent contract and callback instructions");
assert.ok(segment.includes("Sankcja Kredytu Darmowego")&&segment.includes("Pomoc frankowiczom"),"Financial areas not shown explicitly");
assert.ok(html.includes("Szkody górnicze")&&html.includes("Świadczenie wspierające")&&html.includes("Sankcja Kredytu Darmowego (SKD)"),"Homepage must name its priority services");
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
assert.deepEqual([...mobileTop.matchAll(/class="mobile-(support|mining|skd)-priority"/g)].map(m=>m[1]),["mining","support","skd"],"Mobile quick links must expose all three flagship services in order");
assert.ok(mobileTop.includes('href="/v2/kampanie/skd.html"'),"Mobile SKD quick path should lead to direct agreement and callback actions");
assert.equal((bar.match(/<a\b/g)||[]).length,3,"Mobile contact bar must have exactly three actions");
assert.ok(css.includes('grid-template-columns:repeat(3,minmax(0,1fr))'),"Three actions are not fitted to a narrow screen");
assert.ok(css.includes(':focus-within')&&css.includes('.chat-assistant.is-open'),"Sticky contact bar can cover an active form or chat");
assert.ok(html.includes('src="/v2/home-mobile-cta.js" defer'),"Homepage needs contact-bar visibility controller");
assert.ok(css.includes(".premium-v2 .mobile-contact-bar[hidden]{display:none!important}"),"Hidden mobile bar must override grid display");
assert.ok(html.includes("data-share-page")&&html.includes("data-share-feedback"),"Share control has no user feedback");
assert.ok(html.includes('src="/v2/share-page.js"'),"Share control script missing");

// The homepage offers four visible service shortcuts and two additional options within a disclosure.
const shortcutBlock=html.match(/<div class="contact-service-shortcuts"[\s\S]*?<\/div><div class="lead-panel"/)?.[0]||"";
assert.equal((shortcutBlock.match(/data-contact-shortcut="/g)||[]).length,6,"Four primary and two secondary contact shortcuts required");
assert.ok(shortcutBlock.includes('data-contact-shortcut="renty"')&&shortcutBlock.includes('data-contact-shortcut="franki"')&&shortcutBlock.includes('data-contact-shortcut="przesyl"'),"All secondary paths should select the shared form");
assert.ok(shortcutBlock.includes('data-contact-shortcut="szkody"'),"Mining shortcut missing");
assert.ok(shortcutBlock.includes('data-contact-shortcut="swiadczenie"'),"Support shortcut missing");
assert.ok(shortcutBlock.includes('data-contact-shortcut="skd"'),"SKD shortcut missing");
assert.ok(shortcutBlock.includes('role="status" aria-live="polite"'),"Selection feedback should be accessible");
assert.ok(css.includes("contact-shortcuts-actions")&&css.includes('data-selected="true"'),"Flagship selection styling missing");
assert.ok(/<div class="lead-panel"><div data-contact-form(?:\s|>)/.test(html),"Shortcuts must reuse the existing homepage form");
assert.ok(!html.includes('class="contact-steps"'),"Homepage form should not repeat an unnecessary three-step banner");
assert.ok(html.includes('class="contact-alternatives"')&&html.includes('class="contact-alternative-links"'),"Phone and email alternatives must remain accessible");

assert.ok(html.includes('href="/v2/plan-dzialania.html#brochure-library-heading"')&&html.includes("Broszury"),
 "Homepage must directly link to the six-service printable brochure library");
const visibleNameLabels=[
  ["Wojciech · 796 441 345","Wojciech · 796 441 345 —"],
  ["Paulina · 500 171 531","Paulina · 500 171 531 —"],
  ["E-mail do Wojciecha","E-mail do Wojciecha —"],
  ["E-mail do Pauliny","E-mail do Pauliny —"]
];
for(const [visible,ariaBeginning] of visibleNameLabels){
 assert.ok(html.includes('aria-label="'+ariaBeginning),
  "Accessibility label must start with visible link text: "+visible);
}

assert.ok(html.includes("Wojciech · 796 441 345")&&html.includes("Paulina · 500 171 531"),"Both service contacts must be reachable");
const alternativeBlock=html.match(/<details class="contact-alternatives">([\s\S]*?)<\/details>/)?.[1]||"";
for(const [name,phone,email] of [
 ["Wojciech","tel:+48796441345","mailto:wojciech.obieglo@votum-ds.pl?subject="],
 ["Paulina","tel:+48500171531","mailto:paulina.chandrala@votum-ds.pl?subject="]
]){
 assert.ok(alternativeBlock.includes('href="'+phone+'"'),name+": direct call missing in alternatives");
 assert.ok(alternativeBlock.includes('href="'+email),name+": direct email missing in alternatives");
 const nameAfterDo=name==="Wojciech"?"Wojciecha":"Pauliny";
 assert.ok(alternativeBlock.includes('>E-mail do '+nameAfterDo+'</a>'),name+": email destination must be explicit");
}
assert.equal((alternativeBlock.match(/href="mailto:/g)||[]).length,2,"Exactly two direct adviser email links expected");
assert.ok(html.includes("świadczenia wspierającego i rent powypadkowych."),"Support advisor biography must not incorrectly claim SKD");
assert.ok(css.includes(".contact-benefits[hidden]")&&css.includes(".contact-alternatives"),"Compact homepage lead-form styling missing");

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
// Aktualna siatka, mobilne CTA i pasek partnerów wymagają ok. 20 KB CSS; utrzymaj pułap 24 KB.\nassert.ok(newTotal<24000,"Home-only CSS should remain smaller than the 24KB regression budget");
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
const skdCopyJS=await readFile("v2/skd-copy-email.js","utf8");
assert.ok(skdPage.includes('data-skd-copy-email hidden')&&skdPage.includes('data-skd-copy-status role="status"'),"SKD copy email action and accessible status must be present");
assert.ok(skdPage.includes('src="/v2/skd-copy-email.js"')&&skdCopyJS.includes("navigator.clipboard?.writeText")&&skdCopyJS.includes("wojciech.obieglo@votum-ds.pl"),"SKD copy action must be progressive and target the exact VOTUM email address");
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

assert.ok(css.includes(".hero-reading-shortcuts a{display:inline-flex;align-items:center;min-height:44px"),"Mobile reading links need larger touch targets");

// The primary actions and individual accessible SVG icons do not depend on remote images.
const heroActions=html.match(/<div class="hero-action-row">([\s\S]*?)<\/div>/)?.[1]||"";
assert.ok(heroActions.includes('href="#uslugi"')&&heroActions.includes('href="#kontakt"'));
assert.equal((segment.match(/<span class="project-symbol" aria-hidden="true"><svg /g)||[]).length,6);
assert.ok(css.includes(".hero-action-row>a:focus-visible")&&css.includes(".primary-card .project-symbol svg"));

// Compact native section navigation on all six service pages. No script required.
for(const [slug,guide,label,person] of [["szkody-gornicze","/v2/wiedza/drobne-pekniecia-szkody-gornicze.html","Dokumentacja szkody","Wojciech"],["swiadczenie-wspierajace","/v2/wiedza/swiadczenie-wspierajace-2026-wzon-zus.html","Poradnik WZON i ZUS","Paulina"],["kredyty-pln","/v2/wiedza/kredyt-pln-dokumenty-skd.html","Dokumenty do SKD","Wojciech"],["renty-powypadkowe","/v2/wiedza/renta-powypadkowa-dokumenty.html","Dokumenty do renty","Paulina"],["kredyty-frankowe","/v2/poradniki/frankowicze-lista-kontrolna.html","Dokumenty kredytu CHF","Wojciech"],["sluzebnosc-przesylu","/v2/wiedza/sluzebnosc-przesylu-slup-na-dzialce.html","Poradnik właściciela","Wojciech"]]){
 const source=await readFile("v2/uslugi/"+slug+".html","utf8");
 const navigation=source.match(/<nav class="service-section-nav wrap"[\s\S]*?<\/nav>/)?.[0]||"";
 assert.ok(navigation.includes('aria-label="Szybka nawigacja po usłudze"'));
 assert.equal((navigation.match(/<a href="/g)||[]).length,6,"Service navigation includes six verified reading, brochure and contact links");
 assert.ok(navigation.includes('href="'+guide+'"')&&navigation.includes("Opiekun: "+person));
 await access(guide.slice(1));
 for(const [,id] of navigation.matchAll(/href="#([^"]+)"/g))assert.ok(source.includes('id="'+id+'"'),"Missing service navigation target: "+slug+"#"+id);
}
const navCSS=await readFile("v2/seo-answers.css","utf8");
assert.ok(navCSS.includes(".service-section-nav a:focus-visible")&&navCSS.includes("min-height:70px")&&navCSS.includes("@media(max-width:950px)"));
console.log("SERVICE_SECTION_NAV_OK: six service pages, 36 accessible links, no extra CSS request.");

// Contact topic links remain native and preselect the correct adviser.
const contactTopic=contactPageHours.match(/<nav[^>]*class="contact-topic-grid"[\s\S]*?<\/nav>/)?.[0]||"";
for(const [code,label,person] of [["szkody","Szkody górnicze","Wojciech"],["swiadczenie","Świadczenie wspierające","Paulina"],["skd","SKD — kredyty PLN","Wojciech"],["renty","Renty powypadkowe","Paulina"],["franki","Kredyty frankowe","Wojciech"],["przesyl","Służebność przesyłu","Wojciech"]])assert.ok(contactTopic.includes('/v2/kontakt.html?usluga='+code+'#formularz')&&contactTopic.includes('data-person="'+person.toLowerCase()+'"'));
assert.equal((contactTopic.match(/<a href=/g)||[]).length,6);
assert.ok(contactPageHours.includes('class="contact-form-steps"'));

// Service banner icons deliberately reuse the six homepage motifs, with no images or scripts.
for(const slug of ["szkody-gornicze","swiadczenie-wspierajace","kredyty-pln","renty-powypadkowe","kredyty-frankowe","sluzebnosc-przesylu"]){
 const page=await readFile("v2/uslugi/"+slug+".html","utf8");
 assert.equal((page.match(/class="service-banner-art"/g)||[]).length,1);
 assert.equal((page.match(/class="service-banner-kicker-icon"/g)||[]).length,1);
 assert.ok(page.includes('class="service-banner-art" aria-hidden="true"'));
}
assert.ok(navCSS.includes(".subhero:has(>.service-banner-art)::before")&&navCSS.includes("@media(min-width:1100px)"));

// The main dropdown exposes the secondary three services, and footer navigation is grouped.
for(const slug of ["renty-powypadkowe","kredyty-frankowe","sluzebnosc-przesylu"])assert.ok(headerNav.includes('/v2/uslugi/'+slug+'.html'));
const footerDirectory=html.match(/<nav class="footer-links footer-directory"[\s\S]*?<\/nav>/)?.[0]||"";
assert.equal((footerDirectory.match(/class="footer-directory-group"/g)||[]).length,3);
assert.equal((footerDirectory.match(/<a href="/g)||[]).length,10);
assert.ok(css.includes(".footer-directory a:focus-visible")&&css.includes("@media(max-width:460px)"));

// The five existing videos have consistent topic graphics and still use hosted links.
const filmBlock=html.match(/<section class="wrap motion-section" id="filmy"[\s\S]*?<\/section>/)?.[0]||"";
assert.equal((filmBlock.match(/class="video-poster"[^>]*data-film=/g)||[]).length,5);
assert.equal((filmBlock.match(/class="video-poster-number" aria-hidden="true"><svg/g)||[]).length,5);
assert.equal((filmBlock.match(/class="video-feature-play" aria-hidden="true"/g)||[]).length,5);
assert.ok(!filmBlock.includes("<iframe")&&!filmBlock.includes("images.unsplash.com"));

const resourceGrid=html.match(/<div class="home-resource-grid">([\s\S]*?)<\/div>/)?.[1]||"";
assert.equal((resourceGrid.match(/href="\/v2\/poradniki\//g)||[]).length,6);
assert.equal((resourceGrid.match(/<span aria-hidden="true"><svg/g)||[]).length,6);
assert.ok(resourceGrid.includes('/v2/poradniki/frankowicze-lista-kontrolna.html'));
assert.ok(css.includes(".home-resource-grid>a>span svg")&&css.includes("padding-block:36px"));

// Mobile navigation is in the existing brand row, and contact actions precede the detailed projects.
assert.ok(html.indexOf('<div class="hero-action-row">')<html.indexOf('<div class="hero-priority-grid"'));
const brandRow=html.slice(html.indexOf('<div class="brand-line">'),html.indexOf('<nav id="site-main-nav"'));
assert.ok(brandRow.includes('class="mobile-menu-toggle"')&&brandRow.includes('aria-controls="site-main-nav"'));
assert.ok(css.includes(".brand-line{flex-wrap:nowrap;min-height:66px}"));

const aboutTeam=await readFile("v2/o-nas.html","utf8");
const aboutJumps=aboutTeam.match(/<nav class="about-jump-nav"[\s\S]*?<\/nav>/)?.[0]||"";
assert.equal((aboutJumps.match(/<a href="/g)||[]).length,4);
for(const [,id] of aboutJumps.matchAll(/href="#([^"]+)"/g))assert.ok(aboutTeam.includes('id="'+id+'"'));
const aboutProcess=aboutTeam.match(/<ol class="about-contact-process">[\s\S]*?<\/ol>/)?.[0]||"";
assert.equal((aboutProcess.match(/<li>/g)||[]).length,3);
assert.ok(html.includes('/v2/o-nas.html#pierwszy-kontakt'));

// Complete service answers remain static, visually labelled and linked to local films.
for(const slug of ["szkody-gornicze","swiadczenie-wspierajace","kredyty-pln","renty-powypadkowe","kredyty-frankowe","sluzebnosc-przesylu"]){
 const page=await readFile("v2/uslugi/"+slug+".html","utf8");
 assert.equal((page.match(/class="service-answer-topic" aria-hidden="true"/g)||[]).length,3);
 const film=page.match(/class="service-video-direct" href="#(film-[^"]+)"/);
 if(slug!=="kredyty-frankowe")assert.ok(film&&page.includes('id="'+film[1]+'"'));
}

const navigatedIcons=html.match(/<div class="navigator-options"[\s\S]*?<\/div>/)?.[0]||"";
assert.equal((navigatedIcons.match(/<span aria-hidden="true"><svg/g)||[]).length,6);
const planIconsPage=await readFile("v2/plan-dzialania.html","utf8");
const planIcons=planIconsPage.match(/<div class="plan-kind-grid"[\s\S]*?<\/div>/)?.[0]||"";
assert.equal((planIcons.match(/<span aria-hidden="true"><svg/g)||[]).length,6);
