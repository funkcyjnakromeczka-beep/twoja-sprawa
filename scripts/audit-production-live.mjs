#!/usr/bin/env node
/** Verify real Cloudflare production (read-only). Does not touch leads or credentials. */
import assert from "node:assert/strict";
import {collectIndexableRoutes} from "./indexnow-routes.mjs";
const root="https://twoja-sprawa.pages.dev";
const get=async(path)=>{
 const response=await fetch(root+path,{signal:AbortSignal.timeout(20000),headers:{"Accept":"text/html,application/xml,text/plain;q=0.9,*/*;q=0.8"}});
 assert.ok(response.ok,"Live "+path+" HTTP "+response.status);
 return {response,body:await response.text()};
};
const [robots,sitemap,home,mining,support,faq,search,marker,portraitA,portraitB,mobileJS,mobileCSS,frank,frankGuide,contrastCSS,skd,homeFlow,navigatorJS,leaflet,leafletCSS,shareJS,brandCSS,chatJS,leadJS,miningLanding,personaCSS,supportLanding]=await Promise.all([
 get("/robots.txt"),get("/sitemap.xml"),get("/"),get("/uslugi/szkody-gornicze"),
 get("/uslugi/swiadczenie-wspierajace"),get("/faq"),get("/szukaj"),get("/deployment-mode.txt"),
 get("/assets/wojciech-obieglo.jpg"),get("/assets/paulina-chandrala.jpg"),get("/mobile-service-cta.js"),get("/mobile-service-cta.css"),get("/uslugi/kredyty-frankowe"),get("/poradniki/frankowicze-lista-kontrolna"),get("/visual-contrast.css"),get("/uslugi/kredyty-pln"),get("/home-flow.css"),get("/service-navigator.js"),get("/start"),get("/ulotka-start.css"),get("/share-page.js"),get("/network-brand.css"),get("/chat-assistant.js"),get("/contact.js"),get("/kampanie/szkody-gornicze"),get("/lead-persona.css"),get("/kampanie/swiadczenie-wspierajace")
]);
assert.ok(robots.body.includes("Allow: /")&&!robots.body.includes("Disallow: /"),"Production robots unexpectedly blocked");
assert.ok(robots.body.includes("OAI-SearchBot"),"OAI-SearchBot directive missing");
assert.ok(marker.body.includes("Cloudflare Pages production branch main"),"Release marker unexpected");
const urls=[...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
const expectedRoutes=await collectIndexableRoutes("v2");
assert.equal(urls.length,expectedRoutes.length,"Live sitemap is missing new published pages");
assert.deepEqual(urls.map(u=>new URL(u).pathname).sort(),expectedRoutes,"Live sitemap routes differ from approved source pages");
assert.equal(new Set(urls).size,urls.length,"Duplicate URLs in sitemap");
for(const url of urls){assert.ok(url.startsWith(root+"/")&&!url.endsWith(".html"),"Noncanonical sitemap URL: "+url);}
for(const route of ["/","/uslugi/szkody-gornicze","/uslugi/swiadczenie-wspierajace","/faq"]){
 const hit={"/":home,"/uslugi/szkody-gornicze":mining,"/uslugi/swiadczenie-wspierajace":support,"/faq":faq}[route].body;
 assert.ok(hit.includes('name="robots" content="index,follow"'),"Indexability blocked: "+route);
 assert.ok(hit.includes('rel="canonical" href="'+root+route+'"'),"Canonical missing/mismatched: "+route);
}
assert.ok(search.body.includes('name="robots" content="noindex,follow"'),"Internal search must remain noindex");
assert.ok(leaflet.body.includes('name="robots" content="noindex,follow"'),"Flyer entry should be noindex");
assert.ok(leaflet.body.includes('rel="canonical" href="'+root+'/start"'),"Flyer entry canonical missing");
assert.ok(!urls.includes(root+"/start"),"Flyer entry must not appear in SEO sitemap");
assert.ok(leaflet.body.includes('href="/kampanie/swiadczenie-wspierajace?utm_source=ulotka'),"Flyer support link broken");
assert.ok(leaflet.body.includes('href="/kampanie/szkody-gornicze?utm_source=ulotka'),"Flyer mining link broken");
assert.ok(leaflet.body.includes('href="tel:+48500171531"')&&leaflet.body.includes('href="tel:+48796441345"'),"Flyer phone numbers mismatch");
assert.ok(leafletCSS.body.includes(".leaflet-option-support")&&leafletCSS.body.includes("@media(max-width:730px)"),"Flyer mobile layout missing");
assert.ok(frank.body.includes('name="robots" content="index,follow"'),"CHF page is not indexable");
assert.ok(frank.body.includes('href="/poradniki/frankowicze-lista-kontrolna"'),"CHF checklist link missing");
assert.ok(frank.body.includes('data-service="Kredyty frankowe CHF"'),"CHF form should select correct service");
assert.ok(frankGuide.body.includes("checklist-item")&&frankGuide.body.includes("Kredyt frankowy CHF"),"CHF preparation guide missing");
assert.ok(skd.body.includes("Sankcja Kredytu Darmowego"),"Full SKD title missing");
assert.ok(support.body.includes("Votum-Wsparcie-poziom_zielone.png"),"Official Votum Wsparcie logo missing");
assert.ok(contrastCSS.body.includes(".interactive-checklist")&&contrastCSS.body.includes(".contact-form"),"Contrast protection missing");

const homeStructure=['<section id="uslugi"','<details id="dobierz-pomoc"','<section class="wrap team-spotlight','<section id="kontakt"'];
let last=-1;
for(const tag of homeStructure){
 const pos=home.body.indexOf(tag);
 assert.ok(pos>last,"Homepage order not deployed: "+tag);
 last=pos;
}
assert.ok(home.body.includes("home-flow.css"),"Homepage layout stylesheet not deployed");
assert.ok(homeFlow.body.includes("repeat(12,minmax(0,1fr))"),"Homepage grid not deployed");
assert.ok(navigatorJS.body.includes("openFromAnchor"),"Deep-link navigator not deployed");
const graphs=[...faq.body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
const faqObj=graphs.flatMap(g=>g["@graph"]||[]).find(item=>item["@type"]==="FAQPage");
assert.ok(faqObj&&faqObj.mainEntity?.length===24,"Live FAQ schema missing or incomplete");
for(const item of faqObj.mainEntity){
 assert.equal(item["@type"],"Question");
 assert.equal(item.acceptedAnswer?.["@type"],"Answer");
}
assert.ok(portraitA.response.headers.get("content-type")?.startsWith("image/"),"Wojciech portrait not an image");
assert.ok(portraitB.response.headers.get("content-type")?.startsWith("image/"),"Paulina portrait not an image");
for(const [page,kind] of [[mining.body,"szkody"],[support.body,"swiadczenie"]]){
 assert.ok(page.includes('src="/mobile-service-cta.js" data-service="'+kind+'"'),"Mobile CTA script not deployed for "+kind);
 assert.ok(page.includes('href="/mobile-service-cta.css"'),"Mobile CTA stylesheet not deployed for "+kind);
}
assert.ok(mobileJS.body.includes("mobile-service-cta")&&mobileJS.body.includes("+48796441345")&&mobileJS.body.includes("+48500171531"),"Mobile CTA source outdated");
assert.ok(mobileCSS.body.includes(".mobile-service-cta")&&mobileCSS.body.includes("chat-assistant"),"Mobile CTA CSS missing chat overlap protection");
// Revision VII: make deployment drift visible. The preview/release-candidate jobs
// do not push files to Cloudflare; only the public HTTP responses prove deployment.
const ogTag=(page,key)=>page.match(new RegExp('<meta\\s+property="'+key+'"\\s+content="([^"]+)"','i'))?.[1]||"";
for(const [page,portrait,label] of [
 [home.body,"wojciech-obieglo.jpg","Home"],
 [mining.body,"wojciech-obieglo.jpg","Mining"],
 [support.body,"paulina-chandrala.jpg","Support"],
 [frank.body,"wojciech-obieglo.jpg","CHF"]
]){
 const expected=root+"/assets/"+portrait;
 assert.equal(ogTag(page,"og:image"),expected,label+" social image is not deployed");
 assert.ok(page.includes('<meta name="twitter:image" content="'+expected+'">'),label+" social preview for Twitter is missing");
 assert.ok(page.includes('property="og:image:alt"'),label+" social image alt missing");
}
assert.ok(home.body.includes('class="mobile-form-link" href="#kontakt"'),"New mobile form shortcut is not live");
assert.ok(homeFlow.body.includes("grid-template-columns:repeat(3,minmax(0,1fr))"),"Three-option mobile footer CSS is not live");
assert.ok(home.body.includes("data-share-page")&&home.body.includes("data-share-feedback"),"Homepage sharing widget not live");
assert.ok(home.body.includes('src="/share-page.js"'),"Homepage share script tag not live");
assert.ok(shareJS.body.includes("navigator.share")&&shareJS.body.includes('url.search=""'),"No-tracking sharing script missing/stale");

assert.ok(brandCSS.body.includes('body.premium-v2:has(.network-brand-bar) .site-header{top:0!important}'),"Mobile header white-space fix not live");
assert.ok(contrastCSS.body.includes('.vws-service-brand img[hidden]')||contrastCSS.body.includes('.vws-service-brand img[hidden],'),"Support image fallback styling not live");
assert.ok(homeFlow.body.includes("chat-assistant.is-hero-area:not(.is-open)"),"Mobile hero chat suppression not live");
assert.ok(chatJS.body.includes('is-hero-area'),"Chatbot hero visibility update not live");

// Stage VIII: test the actual published click-to-qualify lead flow without submitting.
assert.ok(leadJS.body.includes('className="contact-damage-area"'),"Mining damage selector not present on the published form");
assert.ok(leadJS.body.includes("damage_area:damageArea.value"),"Mining damage category is not sent by the published contact script");
assert.ok(leadJS.body.includes('querySelectorAll("[data-damage-option]")'),"Quick campaign card handoff is missing");
for(const category of ["Ściany i elewacja","Kostka i ogrodzenie","Drzwi i okna"]){
 assert.ok(miningLanding.body.includes('data-damage-option="'+category+'"'),"Mining campaign quick link missing: "+category);
}
assert.ok(personaCSS.body.includes(".campaign-damage-pick"),"Campaign category buttons are unstyled in production");
assert.ok(contrastCSS.body.includes(".contact-damage-area:not([hidden])"),"Damage qualifier contrast rules not deployed");

// Stage IX: support campaign cards must select known WZON stages, no health data.
for(const stage of ["wniosek","oczekiwanie","decyzja"]){
 assert.ok(supportLanding.body.includes('data-stage-option="'+stage+'"'),"Support stage shortcut not live: "+stage);
}
assert.ok(leadJS.body.includes('querySelectorAll("[data-stage-option]")'),"WZON stage handoff missing in contact script");
assert.ok(leadJS.body.includes('hasOwnProperty.call(stages,code)'),"WZON stage code validation missing");
assert.ok(personaCSS.body.includes(".campaign-stage-pick"),"WZON stage buttons not styled on live page");

// Stage X: guard against duplicate lead sends and empty/whitespace-only names.
assert.ok(leadJS.body.includes("if(sending)return;"),"In-flight duplicate-submit guard has not reached Cloudflare");
assert.ok(leadJS.body.includes("sending=true;button.disabled=true"),"Live form does not disable repeat submission");
assert.ok(leadJS.body.includes("finally{sending=false;button.disabled=false"),"Live form does not unlock after network failure");
assert.ok(leadJS.body.includes("Boolean(name.value.trim())"),"Live form accepts whitespace-only names");
assert.ok(leadJS.body.includes('name.setCustomValidity("")'),"Live form does not clear name validation after success");

// Stage XI: public CDN updates can briefly lag after a GitHub push.
// Re-read the *real* contact script for up to 30 seconds before reporting a
// publication problem. This checks deployment, never submits a lead.
const readyPhoneValidation=body=>
 body.includes("const validPhoneNumber=value=>")&&
 body.includes("digits.length>=7&&digits.length<=15")&&
 body.includes("if(!checkContact())return;")&&
 body.includes('phone.setAttribute("aria-describedby",phoneHint.id)');
let currentLead=leadJS.body;
for(let attempt=0;attempt<6&&!readyPhoneValidation(currentLead);attempt++){
 await new Promise(resolve=>setTimeout(resolve,5000));
 currentLead=(await get("/contact.js")).body;
}
assert.ok(currentLead.includes("const validPhoneNumber=value=>"),"Live contact form lacks phone validation");
assert.ok(currentLead.includes("digits.length>=7&&digits.length<=15"),"Live contact form does not check phone digit count");
assert.ok(currentLead.includes("if(!checkContact())return;"),"Phone/contact validation is not applied at submit");
assert.ok(currentLead.includes('phone.setAttribute("aria-describedby",phoneHint.id)'),"Phone guidance is not connected for screen readers");

// Stage XII: check the *public* homepage and script together. Cloudflare
// can take a moment to publish after push; make that lag observable.
const readyHomeShortcut=(html,css,js)=>
 html.includes('data-contact-shortcut="szkody"')&&
 html.includes('data-contact-shortcut="swiadczenie"')&&
 html.includes("data-contact-shortcut-status")&&
 css.includes("contact-shortcuts-actions")&&
 js.includes('querySelectorAll("[data-contact-shortcut]")');
let liveHome=home.body,liveHomeCSS=homeFlow.body,liveContactJS=currentLead;
for(let attempt=0;attempt<8&&!readyHomeShortcut(liveHome,liveHomeCSS,liveContactJS);attempt++){
 await new Promise(resolve=>setTimeout(resolve,5000));
 [liveHome,liveHomeCSS,liveContactJS]=await Promise.all([
  get("/").then(x=>x.body),get("/home-flow.css").then(x=>x.body),get("/contact.js").then(x=>x.body)
 ]);
}
assert.ok(readyHomeShortcut(liveHome,liveHomeCSS,liveContactJS),"Two flagship homepage contact shortcuts have not reached Cloudflare");
assert.equal((liveHome.match(/data-contact-shortcut="/g)||[]).length,2,"Homepage flagship shortcut count mismatch");
assert.ok(liveContactJS.includes("updateAdvisor();updateGuide();updateStage();updateDamageArea();updateContextNotice();"),"Home shortcut not wired to all form state updates");
assert.ok(liveHomeCSS.includes('data-selected="true"'),"Flagship choice state styling not published");

// Stage XII follow-up: reset consistency and reduced-motion behaviour.
assert.ok(liveContactJS.includes("refreshShortcutState=syncShortcuts;"),"Homepage form reset does not update selected shortcut state");
assert.ok(liveContactJS.includes("refreshShortcutState();"),"Form success does not clear shortcut feedback");
assert.ok(liveContactJS.includes('host.scrollIntoView?.({behavior:"instant",block:"start"})'),"Home shortcut must use stable nonanimated form scroll");
assert.ok(liveHomeCSS.includes("#kontakt [data-contact-form]{scroll-margin-top:"),"Actual form scroll target may hide below sticky partner header");

// Stage XIV: secondary service cards keep a short, accessible mobile layout.
const compactServiceLayout=css=>css.includes("Homepage mobile density:")&&
 css.includes("min-height:136px")&&css.includes("justify-content:center")&&
 css.includes(".primary-card:not(.support-featured):not(.mining-featured) h3");
let compactCSS=liveHomeCSS;
for(let attempt=0;attempt<8&&!compactServiceLayout(compactCSS);attempt++){
 await new Promise(resolve=>setTimeout(resolve,5000));
 compactCSS=(await get("/home-flow.css")).body;
}
assert.ok(compactServiceLayout(compactCSS),"Compact mobile layout for four secondary services has not reached Cloudflare");

// Stage XV: preselected defects are safe, bounded codes; never collect extra details.
const readyGuidedDamage=(chat,lead)=>
 chat.includes('["sciany","kostka"].includes(damageCode)')&&
 chat.includes('address.searchParams.set("uszkodzenie",damageCode)')&&
 lead.includes('const damageFromLink={sciany:"Ściany i elewacja",kostka:"Kostka i ogrodzenie"}')&&
 lead.includes('Object.prototype.hasOwnProperty.call(damageFromLink,requestedDamage)');
let publishedChat=chatJS.body,publishedLead=currentLead;
for(let attempt=0;attempt<8&&!readyGuidedDamage(publishedChat,publishedLead);attempt++){
 await new Promise(resolve=>setTimeout(resolve,5000));
 [publishedChat,publishedLead]=await Promise.all([
  get("/chat-assistant.js").then(x=>x.body),
  get("/contact.js").then(x=>x.body)
 ]);
}
assert.ok(readyGuidedDamage(publishedChat,publishedLead),"Safe chatbot mining-category preselection has not reached public Cloudflare");

// Stage XVI: external reading must leave an in-progress lead form in its tab.
const safeReadingLinks=body=>
 body.includes('guideLink.target="_blank";guideLink.rel="noopener noreferrer"')&&
 body.includes('privacy.target="_blank";privacy.rel="noopener noreferrer"')&&
 body.includes('privacy.textContent="Informacje o prywatności (nowa karta)"');
let readLinksJS=publishedLead;
for(let attempt=0;attempt<8&&!safeReadingLinks(readLinksJS);attempt++){
 await new Promise(resolve=>setTimeout(resolve,5000));
 readLinksJS=(await get("/contact.js")).body;
}
assert.ok(safeReadingLinks(readLinksJS),"Checklist and privacy links may still replace a partially completed lead form");

// Stage XVII: homepage should not fetch long-article CSS. Editorial and FAQ
// components retain the same rules in existing home-flow.css instead.
const leanHomepage=(html,css)=>
 !html.includes('href="/knowledge-articles.css"')&&
 css.includes(".premium-v2 .editorial-reading")&&
 css.includes(".premium-v2 .hub-all-link")&&
 css.includes(".premium-v2 .faq-explore-all");
let leanHTML=liveHome,leanCSS=compactCSS;
for(let attempt=0;attempt<8&&!leanHomepage(leanHTML,leanCSS);attempt++){
 await new Promise(resolve=>setTimeout(resolve,5000));
 [leanHTML,leanCSS]=await Promise.all([get("/").then(x=>x.body),get("/home-flow.css").then(x=>x.body)]);
}
assert.ok(leanHomepage(leanHTML,leanCSS),"Homepage still loads article CSS or has lost editorial/FAQ styling");
const article=(await get("/wiedza/drobne-pekniecia-szkody-gornicze")).body;
assert.ok(article.includes('href="/knowledge-articles.css"'),"Long-form article must retain its dedicated stylesheet");

// Stage XVIII: verify public JSON-LD describes this agency's own pages,
// not the affiliated capital group and not fictitious offices or outcomes.
const getSchema=markup=>[...markup.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
 .flatMap(match=>{try{return JSON.parse(match[1])["@graph"]||[];}catch{return [];}});
const schemaRoutes=[
 ["/kontakt","ContactPage"],
 ["/o-nas","AboutPage"],
 ["/wiedza/","CollectionPage"]
];
const typedPages=await Promise.all(schemaRoutes.map(async([path,type])=>{
 let last=[];
 for(let attempt=0;attempt<8;attempt++){
  last=getSchema((await get(path)).body);
  const page=last.find(node=>node["@type"]===type);
  if(page)return {path,type,page,graph:last};
  if(attempt!==7)await new Promise(resolve=>setTimeout(resolve,5000));
 }
 throw new Error("Schema.org page type not deployed: "+path+" ("+type+")");
}));
for(const {path,type,page,graph} of typedPages){
 const agency=graph.find(node=>node["@type"]==="Organization");
 assert.ok(agency?.name==="SuccessTree OBIEGŁO WOJCIECH","Agency publisher mismatch: "+path);
 assert.ok(page.isPartOf?.["@id"]===root+"/#website","Site linkage missing: "+path);
 if(type==="ContactPage")assert.equal(page.mainEntity?.["@id"],agency["@id"],"ContactPage should identify SuccessTree, not VOTUM");
 if(type==="AboutPage")assert.equal(page.about?.length,2,"AboutPage should describe the two named contacts");
}

// Stage XIX: SKD stays the third featured service and can receive a contract
// by email while separately taking a callback number. Read-only production check.
const isSKDPublished=(h,page,css,lead,chat,nav,skdStyles)=>{
 const pos=[h.indexOf('class="card primary-card support-featured"'),h.indexOf('class="card primary-card mining-featured"'),h.indexOf('class="card primary-card skd-featured"'),h.indexOf('href="/uslugi/renty-powypadkowe"')];
 return pos.every(n=>n>0)&&pos.every((v,i)=>i===0||v>pos[i-1])&&
  h.includes("Trzy wyróżnione usługi:")&&
  h.includes('class="nav-skd-priority" href="/uslugi/kredyty-pln"')&&
  css.includes(".nav-skd-priority")&&
  css.includes("SKD: third highlighted service")&&
  css.includes("grid-column:span 12!important")&&
  page.includes('id="skd-document-title"')&&
  page.includes("mailto:wojciech.obieglo@votum-ds.pl?subject=")&&
  page.includes("Zostaw numer telefonu w formularzu")&&
  page.includes('class="skd-mobile-quickbar"')&&
  page.includes('class="skd-mobile-phone" href="#formularz"')&&
  page.includes('class="skd-mobile-mail" href="mailto:wojciech.obieglo@votum-ds.pl?subject=')&&
  page.includes("bez zasłaniania danych")&&
  lead.includes("bez zasłaniania danych")&&
  chat.includes("bez zasłaniania danych")&&
  nav.includes("bez zasłaniania danych")&&
  page.includes('href="/skd-contact.css"')&&
  skdStyles.includes(".skd-document-actions")&&
  skdStyles.includes("Persistent, mobile-only SKD conversion route")&&
  skdStyles.includes("body.premium-subpage.theme-skd .chat-assistant:not(.is-open)")&&
  skdStyles.includes(".chat-assistant")&&
  skdStyles.includes("env(safe-area-inset-bottom)")&&
  lead.includes('emailLink.href="mailto:wojciech.obieglo@votum-ds.pl?subject=')&&
  chat.includes('key:"skd"')&&chat.includes('phone:"796 441 345",tel:"+48796441345"')&&
  nav.includes('service:"kredyty-pln.html",phone:"796 441 345",tel:"+48796441345"');
};
let skdPublished={h:home.body,page:skd.body,css:homeFlow.body,lead:leadJS.body,chat:chatJS.body,nav:navigatorJS.body,skdStyles:""};
for(let attempt=0;attempt<8;attempt++){
 if(attempt>0)await new Promise(resolve=>setTimeout(resolve,5000));
 const [newHome,newSKD,newHomeFlow,newLead,newChat,newNav,newStyles]=await Promise.all([
  get("/").then(x=>x.body),get("/uslugi/kredyty-pln").then(x=>x.body),
  get("/home-flow.css").then(x=>x.body),get("/contact.js").then(x=>x.body),
  get("/chat-assistant.js").then(x=>x.body),get("/service-navigator.js").then(x=>x.body),
  fetch(root+"/skd-contact.css").then(async res=>res.ok?res.text():"").catch(()=>"")
 ]);
 skdPublished={h:newHome,page:newSKD,css:newHomeFlow,lead:newLead,chat:newChat,nav:newNav,skdStyles:newStyles};
 if(isSKDPublished(...Object.values(skdPublished)))break;
}
assert.ok(isSKDPublished(...Object.values(skdPublished)),"New SKD featured card, contract email, callback and consistent advisor have not reached Cloudflare");

const getCompleteContractPages=async()=>{
 const [checklist,guide]=await Promise.all([
  get("/poradniki/skd-kredyt-pln-lista-kontrolna").then(x=>x.body),
  get("/wiedza/kredyt-pln-dokumenty-skd").then(x=>x.body)
 ]);
 return {checklist,guide};
};
let completeContractPages;
for(let attempt=0;attempt<8;attempt++){
 completeContractPages=await getCompleteContractPages();
 if(completeContractPages.checklist.includes("bez zasłaniania danych")&&
    completeContractPages.guide.includes("bez zasłaniania danych")&&
    completeContractPages.checklist.includes("tel:+48796441345"))break;
 if(attempt!==7)await new Promise(resolve=>setTimeout(resolve,5000));
}
assert.ok(completeContractPages.checklist.includes("bez zasłaniania danych"),"SKD checklist still suggests hiding data on the agreement");
assert.ok(completeContractPages.guide.includes("bez zasłaniania danych"),"SKD article has not published the complete-contract instructions");
assert.ok(completeContractPages.checklist.includes("tel:+48796441345"),"SKD checklist lacks Wojciech callback number");
for(const [name,body] of [["SKD page",skdPublished.page],["chatbot",skdPublished.chat],["navigator",skdPublished.nav],["checklist",completeContractPages.checklist],["guide",completeContractPages.guide]]){
 assert.ok(!/(?:Przed wysyłką zasłoń|Zasłoń zbędne dane|usuń z kopii zbędne dane|zasłonięciu PESEL)/i.test(body),"Obsolete masking instruction still published: "+name);
}


// Stage XXI: all service-team portraits must be first-party assets.
// If an old Lovable project is disabled, no client-facing portrait should vanish.
const portraitRoutes=[
 ["/",["wojciech-obieglo.jpg","paulina-chandrala.jpg"]],
 ["/kontakt",["wojciech-obieglo.jpg","paulina-chandrala.jpg"]],
 ["/o-nas",["wojciech-obieglo.jpg","paulina-chandrala.jpg"]],
 ["/uslugi/szkody-gornicze",["wojciech-obieglo.jpg"]],
 ["/uslugi/swiadczenie-wspierajace",["paulina-chandrala.jpg"]],
 ["/kampanie/szkody-gornicze",["wojciech-obieglo.jpg"]],
 ["/kampanie/swiadczenie-wspierajace",["paulina-chandrala.jpg"]]
];
let portraitStatus=[];
for(let attempt=0;attempt<8;attempt++){
 portraitStatus=await Promise.all(portraitRoutes.map(async([route,expected])=>{
  const html=(await get(route)).body;
  const own=expected.every(filename=>html.includes('src="/assets/'+filename+'"'));
  return {route,own,noOldLovable:!html.includes("twojasprawa-votum.lovable.app/assets/")};
 }));
 if(portraitStatus.every(status=>status.own&&status.noOldLovable))break;
 if(attempt!==7)await new Promise(resolve=>setTimeout(resolve,5000));
}
for(const item of portraitStatus){
 assert.ok(item.own,"First-party specialist portrait missing on production: "+item.route);
 assert.ok(item.noOldLovable,"Old Lovable-hosted portrait still in production: "+item.route);
}
assert.ok(portraitA.response.headers.get("content-type")?.startsWith("image/"),"Local Wojciech photo not served as an image");
assert.ok(portraitB.response.headers.get("content-type")?.startsWith("image/"),"Local Paulina photo not served as an image");

const verified=27;
console.log("LIVE_PRODUCTION_OK: "+verified+" resources, "+urls.length+" sitemap URLs, 24 real FAQ Q&A, QR flyer /start and correct phones, agency-specific ContactPage/AboutPage/CollectionPage schemas, lean homepage stylesheet loading, draft-preserving checklist/privacy links, chatbot-guided damage categorization, validated contact phone numbers, compact secondary mobile services and two-step flagship homepage lead choices, safe form submission, quick mining damage qualification and WZON stage choice, verified OG photos, seven locally hosted portrait pages and sharing, homepage 2+1+3 SKD featured layout, open navigator, CHF page/checklist, Votum Wsparcie logo, contrast, mobile CTA, indexable services, noindex internal search, images, search-bot access.");
