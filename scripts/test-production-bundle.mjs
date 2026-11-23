#!/usr/bin/env node
/** Read-only smoke test for a local production candidate. Does NOT deploy. */
import assert from "node:assert/strict";
import {readFile,stat,readdir} from "node:fs/promises";
import {pruneHomepageRules,pruneSubpageRules} from "./homepage-css-prune.mjs";
import {collectIndexableRoutes} from "./indexnow-routes.mjs";
import {feedArticlePaths} from "./verified-articles-feed.mjs";
import {PAGE_PATHS} from "./page-navigation.mjs";
import {legacyPageRedirects} from "./legacy-page-redirects.mjs";
import {enhanceKeyboardNavigation} from "./keyboard-navigation.mjs";
const origin="https://twoja-sprawa.pages.dev";
const read=path=>readFile("dist/"+path,"utf8");
const releaseInfo=JSON.parse(await read("release-info.json"));
assert.equal(releaseInfo.schemaVersion,1,"Unexpected release manifest schema");
assert.equal(releaseInfo.site,origin,"Release fingerprint points to wrong website");
assert.equal(releaseInfo.sourceDirectory,"v2","Unexpected source directory in fingerprint");
assert.equal(releaseInfo.buildScript,"scripts/build.mjs","Unknown production build script");
assert.ok(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(releaseInfo.builtAt),
 "Release fingerprint has invalid UTC build timestamp");
assert.ok(releaseInfo.commit===null||/^[0-9a-f]{40}$/.test(releaseInfo.commit),
 "Release fingerprint has invalid commit SHA");
const expectedCommit=process.env.CF_PAGES_COMMIT_SHA||process.env.GITHUB_SHA;
if(expectedCommit)assert.equal(releaseInfo.commit,expectedCommit.toLowerCase(),
 "Release fingerprint does not match CI commit");
// OpenSEO and the existing GitHub IndexNow workflow use separate public ownership keys.
// Both must be served from the Cloudflare Pages root; this is not a secret.
for(const ownershipKey of ["f66d80be29094b29ae5d941ae2cc2296","cdc63afe4c9cf8e5dade3a9fe8168c328ac5cf74"]){
 const liveFile=await read(ownershipKey+".txt");
 assert.equal(liveFile.trim(),ownershipKey,"IndexNow ownership file missing or incorrect: "+ownershipKey);
}
console.log("INDEXNOW_DUAL_KEYS_OK: OpenSEO and existing CI workflow have correctly formed public root files.");

const home=await read("index.html");
const recruitmentRelease=await read("rekrutacja.html");
// Production output strips authoring-only /v2/ paths and .html from
// the three topical guide shortcuts on the indexed homepage.
const heroGuideStart=home.indexOf('<nav class="hero-reading-shortcuts"');
const heroGuideEnd=home.indexOf("</nav>",heroGuideStart);
const heroGuidePart=heroGuideStart>=0&&heroGuideEnd>heroGuideStart?home.slice(heroGuideStart,heroGuideEnd+6):"";
for(const url of [
 "/wiedza/drobne-pekniecia-szkody-gornicze",
 "/wiedza/swiadczenie-wspierajace-2026-wzon-zus",
 "/wiedza/ugoda-z-kopalnia-co-sprawdzic"
]){
 assert.ok(heroGuidePart.includes('href="'+url+'"'),"Missing canonical first-screen guide link "+url);
}
assert.equal(heroGuidePart.split("<a ").length-1,3,"Only verified guide routes allowed in the first-screen shortcuts");
assert.ok(!heroGuidePart.includes("/v2/")&&!heroGuidePart.includes(".html"),
 "First-screen guide destinations should be clean canonical URLs");
console.log("HERO_GUIDE_DISCOVERY_OK: three verified guides reachable from indexed home first screen.");
// On mobile, the first screen offers two primary actions, while the brochure
// remains reachable without JavaScript in the existing native details panel.
const heroActionsStart=home.indexOf('<div class="hero-action-row"');
const heroActionsEnd=home.indexOf("</div>",heroActionsStart);
const heroActions=heroActionsStart>=0&&heroActionsEnd>heroActionsStart
 ?home.slice(heroActionsStart,heroActionsEnd+6):"";
assert.equal((heroActions.match(/<a\b/g)||[]).length,2,
 "Exactly two primary first-screen actions; resources belong in a secondary section");
assert.ok(heroActions.includes('href="#uslugi"')&&heroActions.includes('href="#kontakt"'),
 "The two primary actions must retain service selection and contact");
const resourceStart=home.indexOf('<details class="hero-resource-disclosure"');
const resourceEnd=home.indexOf("</details>",resourceStart);
const resources=resourceStart>=0&&resourceEnd>resourceStart
 ?home.slice(resourceStart,resourceEnd+10):"";
assert.ok(resources.includes('class="hero-resource-brochure"'),
 "The resource disclosure must link to the printable brochure library");
assert.ok(resources.includes('href="/plan-dzialania#brochure-library-heading"'),
 "The brochure link must use its canonical production path");
assert.ok(!heroActions.includes("brochure-library-heading"),
 "Brochure must no longer compete with the two primary CTAs");
assert.ok(home.includes('class="hero-local-shortcuts"'),
 "Indexable Lubin and Polkowice shortcuts must remain independently visible");
console.log("HERO_FOCUS_OK: two primary actions, brochure still accessible, local links preserved.");

const heroContactStart=home.indexOf('<nav class="hero-direct-contacts"');
const heroContactEnd=home.indexOf("</nav>",heroContactStart);
const heroContact=heroContactStart>=0&&heroContactEnd>heroContactStart?home.slice(heroContactStart,heroContactEnd+6):"";
assert.ok(heroContactStart>0&&heroContactStart<home.indexOf('class="hero-skd-third"'),
 "Service-specific telephone contact must be available early on the home page");
assert.equal((heroContact.match(/<a\b/g)||[]).length,2,"Exactly two first-screen adviser shortcuts");
assert.ok(!/<a\b[^>]*\baria-label\s*=/.test(heroContact),
 "Visible adviser names and numbers must also form the accessible link names");
for(const [number,name,context] of [
 ["+48796441345","Wojciech","Szkody górnicze"],
 ["+48500171531","Paulina","Świadczenie wspierające"]
]){
 assert.ok(heroContact.includes('href="tel:'+number+'"'),"Missing direct adviser dial link: "+name);
 assert.ok(heroContact.includes(name)&&heroContact.includes(context),"Wrong adviser or service label: "+name);
}
const heroStyles=await read("home-bundle.css");
assert.ok(heroStyles.includes(".hero-direct-contacts"),"Home CSS must style the new phone shortcuts");
console.log("HERO_DIRECT_CONTACT_OK: two tappable, service-specific phone links, no JS required.");


// Two public business contacts can be saved without submitting personal data.
const vCardHeaders=await read("_headers");
const contactCards=[
 ["wojciech-obieglo","Wojciech Obiegło","Obiegło;Wojciech;;;","+48796441345","wojciech.obieglo@votum-ds.pl"],
 ["paulina-chandrala","Paulina Chandrała","Chandrała;Paulina;;;","+48500171531","paulina.chandrala@votum-ds.pl"]
];
const contactPageWithVcards=await read("kontakt.html");
for(const [slug,fullName,nField,phone,email] of contactCards){
 const vcardFile="kontakty/"+slug+".vcf";
 const original=await readFile("v2/"+vcardFile,"utf8");
 const published=await read(vcardFile);
 assert.equal(published,original,"Published vCard must retain source bytes, no hidden mutation: "+slug);
 assert.ok(original.startsWith("BEGIN:VCARD\r\nVERSION:4.0\r\n"),
  "vCard 4.0 and UTF-8 CRLF delimiters required: "+slug);
 const lines=original.split("\r\n");
 assert.equal(lines.at(-2),"END:VCARD","vCard must have one END marker: "+slug);
 for(const line of lines)assert.ok(Buffer.byteLength(line,"utf8")<=75,"Unfolded vCard line too long: "+slug);
 for(const value of ["FN:"+fullName,"N:"+nField,"ORG:SuccessTree",
  "TEL;VALUE=uri;TYPE=cell:tel:"+phone,"EMAIL;TYPE=work:"+email,
  "URL:https://twoja-sprawa.pages.dev/"]){
  assert.ok(lines.includes(value),"vCard missing a grounded business field: "+slug+" "+value);
 }
 const href='href="/'+vcardFile+'" download="'+slug+'.vcf"';
 assert.equal(contactPageWithVcards.split(href).length-1,1,"Contact directory must link to exactly one file: "+slug);
 assert.ok(vCardHeaders.includes("/"+vcardFile+"\n  Content-Type: text/vcard; charset=utf-8"),
  "Content type for public contact card missing: "+slug);
 assert.ok(!original.includes("ADR:")&&!original.includes("PHOTO:")&&!original.includes("REV:"),
  "No private address, external asset or invented edit date in vCard");
}
for(const [service,slug] of [
 ["szkody-gornicze","wojciech-obieglo"],
 ["swiadczenie-wspierajace","paulina-chandrala"],
 ["renty-powypadkowe","paulina-chandrala"]
]){
 const html=await read("uslugi/"+service+".html");
 const link='href="/kontakty/'+slug+'.vcf" download="'+slug+'.vcf"';
 assert.equal(html.split(link).length-1,1,"Wrong or missing specialist vCard on service: "+service);
}
assert.ok(!(await read("sitemap.xml")).includes("<loc>"+origin+"/kontakty/"),
 "Contact files must not enter the SEO URL sitemap");
console.log("VCARD_CONTACTS_OK: two public business vCards, 3 service links, correct format, no lead transmission.");


// RSS: only explicitly reviewed and indexable canonical guides.
const rss=await read("feed.xml");
const rssHeaders=await read("_headers");
const rssSitemap=await read("sitemap.xml");
assert.ok(rss.startsWith('<?xml version="1.0" encoding="UTF-8"?>'),"RSS XML declaration missing");
assert.ok(rss.includes('<rss version="2.0"')&&rss.includes('xmlns:atom=')&&rss.includes('xmlns:dc='),"RSS namespaces missing");
assert.ok(rss.includes('<language>pl-PL</language>'),"RSS language missing");
assert.ok(rss.includes('<atom:link href="'+origin+'/feed.xml" rel="self" type="application/rss+xml"/>'),"RSS self reference wrong");
const rssItems=rss.split("<item>").slice(1).map(item=>item.split("</item>")[0]);
assert.equal(rssItems.length,feedArticlePaths.length,"RSS should match the approved guide allowlist");
// Each editorial revision changes RSS order; validate the stable source-backed
// sorting rule instead of freezing the dates/order of a previous release.
const expectedRSS=(await Promise.all(feedArticlePaths.map(async relative=>{
 const authored=await readFile("v2/"+relative,"utf8");
 const modified=authored.match(/"dateModified":"(\d{4}-\d{2}-\d{2})"/)?.[1];
 assert.ok(modified,"Reviewed Article JSON-LD must include dateModified: "+relative);
 return {modified,canonical:origin+"/"+relative.replace(/\.html$/,"")};
}))).sort((a,b)=>b.modified.localeCompare(a.modified)||a.canonical.localeCompare(b.canonical))
 .map(item=>item.canonical);
const rssUris=rssItems.map(item=>item.split('<guid isPermaLink="true">')[1]?.split("</guid>")[0]);
assert.deepEqual(rssUris,expectedRSS,"RSS dates/order/canonicals changed unexpectedly");
for(const [i,item] of rssItems.entries()){
 assert.ok(item.includes("<link>"+rssUris[i]+"</link>"),"RSS link disagrees with canonical");
 assert.ok(item.includes("<title>")&&item.includes("<description>")&&item.includes("<dc:date>"),"RSS item metadata missing");
 assert.ok(rssSitemap.includes("<loc>"+rssUris[i]+"</loc>"),"RSS item not present in SEO sitemap");
 assert.ok(!item.includes("/v2/")&&!item.includes(".html"),"RSS must not emit legacy URLs");
}
for(const fragment of ["wiedza/szkody-gornicze-drobne-pekniecia","/poradniki/","PESEL","<script"]){
 assert.ok(!rss.includes(fragment),"RSS must not publish draft or sensitive source: "+fragment);
}
for(const page of [home,await read("wiedza/index.html")]){
 assert.ok(page.includes('rel="alternate" type="application/rss+xml"')&&page.includes('href="/feed.xml"'),
  "RSS autodiscovery missing on home or guide index");
}
assert.ok(rssHeaders.includes("/feed.xml")&&rssHeaders.includes("Content-Type: application/rss+xml; charset=utf-8"),
 "Production RSS Content-Type header missing");
console.log("VERIFIED_RSS_OK: reviewed guide allowlist, date-only updates, clean URLs, autodiscovery, no unpublished drafts.");

assert.equal((recruitmentRelease.match(/class="network-brand-bar"/g)||[]).length,1,
 "Recruitment release must have one persistent VOTUM partner bar");
assert.ok(!recruitmentRelease.includes('class="partner-identity-bar"'),
 "Duplicate VOTUM partner bar must be removed from recruitment page");
assert.ok(recruitmentRelease.includes("Serwis przedstawiciela, nie oficjalna witryna spółek VOTUM"),
 "Keep agency relationship notice in the shared brand bar");


// No-JavaScript contact is part of the release contract, not an optional
// JavaScript widget. Keep both adviser phones and e-mails visible in markup.
for(const page of ["index.html","kontakt.html"]){
 const html=await read(page);
 const fallback=html.match(/<p class="contact-load-fallback">([\s\S]*?)<\/p>/)?.[1]||"";
 for(const expected of [
  'href="tel:+48796441345"','href="tel:+48500171531"',
  'href="mailto:wojciech.obieglo@votum-ds.pl"',
  'href="mailto:paulina.chandrala@votum-ds.pl"'
 ]){
  assert.ok(fallback.includes(expected),
   "No-JavaScript fallback missing "+expected+" in "+page);
 }
 assert.ok(fallback.includes("skrypty")||fallback.includes("JavaScript"),
  "Fallback must explain unavailable JavaScript in "+page);
}


// Indexed guides must remain contactable without JavaScript. These fallbacks
// are replaced by the real form when it initializes successfully.
for(const [page,telephone,email] of [
 ["wiedza/drobne-pekniecia-szkody-gornicze.html","+48796441345","wojciech.obieglo@votum-ds.pl"],
 ["wiedza/swiadczenie-wspierajace-2026-wzon-zus.html","+48500171531","paulina.chandrala@votum-ds.pl"],
 ["wiedza/renta-powypadkowa-dokumenty.html","+48500171531","paulina.chandrala@votum-ds.pl"]
]){
 const html=await read(page);
 const region=html.match(/<div data-contact-form>([\s\S]*?)<\/div>/)?.[1]||"";
 assert.ok(region.includes('class="contact-load-fallback"'),"Guide missing fallback after no-JS: "+page);
 assert.ok(region.includes('href="tel:'+telephone+'"'),"Guide wrong fallback phone: "+page);
 assert.ok(region.includes('href="mailto:'+email+'"'),"Guide wrong fallback e-mail: "+page);
 assert.ok(region.includes("Wiadomość e-mail trzeba wysłać samodzielnie"),"Guide must explain mailto is not sending: "+page);
}
console.log("GUIDE_NOJS_FALLBACK_OK: published client guides retain working phone/e-mail if the form fails.");



const homeBundle=await read("home-bundle.css");
const pruningSample=pruneSubpageRules(
 ".premium-subpage .x{color:red}.premium-v2 .x{color:blue}"+
 "@media(min-width:800px){.premium-subpage .y{display:block}.premium-v2 .y{display:grid}}"+
 ".premium-subpage .a,.premium-v2 .a{padding:2px}"
);
assert.equal(pruningSample.removed,2,"Only guaranteed subpage-only rules may be discarded");
assert.ok(!pruningSample.css.includes("color:red")&&!pruningSample.css.includes("display:block"),
 "Homepage must exclude rules that cannot match its body class");
assert.ok(pruningSample.css.includes("color:blue")&&pruningSample.css.includes("display:grid")&&
 pruningSample.css.includes(".premium-subpage .a,.premium-v2 .a"),
 "Shared, mixed and media-query styles must survive in their original order");
// The old partner strip is removed from production markup in favor of the
// shared VOTUM bar; its authoring-only CSS must not inflate the release.
assert.ok(!homeBundle.includes(".premium-v2 .homepage-partner-strip"),
 "Removed partner strip must not ship unused styles in the production homepage");

// Build-only comment stripping reduces transfer bytes while preserving every
// original stylesheet for editing and retaining the exact CSS cascade order.
const homeSourceSheets=[
 "styles.css","premium-v2.css","portrait-upgrade.css","journey.css",
 "home-flow.css","network-brand.css","visual-contrast.css"
];
const sourceStyles=await Promise.all(homeSourceSheets.map(file=>readFile("v2/"+file,"utf8")));
const sourceBytes=Buffer.byteLength(sourceStyles.join("\n"),"utf8");
const bundleBytes=Buffer.byteLength(homeBundle,"utf8");
assert.ok(sourceBytes-bundleBytes>60000,
 "Production homepage CSS should save at least 60 KB through source and subpage pruning");
assert.ok(bundleBytes<320000,
 "Production homepage CSS should remain below the 320 KB decoded budget after pruning");
console.log("HOME_CSS_BUDGET "+JSON.stringify({sourceBytes,bundleBytes,savedBytes:sourceBytes-bundleBytes}));

let independentStylesSaved=0;
for(let i=0;i<homeSourceSheets.length;i++){
 const file=homeSourceSheets[i];
 const served=await read(file);
 const originalBytes=Buffer.byteLength(sourceStyles[i],"utf8");
 const servedBytes=Buffer.byteLength(served,"utf8");
 assert.ok(servedBytes<originalBytes,
  "Production CSS should omit non-runtime comments from "+file);
 independentStylesSaved+=originalBytes-servedBytes;
}
assert.ok(independentStylesSaved>12000,
 "Standalone service CSS resources must also remove at least 12 KB of non-runtime comments");
console.log("SERVICE_CSS_BUDGET "+JSON.stringify({sourceStyles:homeSourceSheets.length,independentStylesSaved}));


assert.ok(home.includes('href="/home-bundle.css"')&&
 (home.match(/<link rel="stylesheet"/g)||[]).length===1,
 "Production homepage should load one combined stylesheet");
for(const selector of [".mobile-quick-nav",".network-brand-bar",".contact-advisor",
 ".hero-priority-grid",".primary-services"]){
 assert.ok(homeBundle.includes(selector),
  "Homepage bundle lacks styles for "+selector);
}
assert.ok(!home.includes('href="/premium-v2.css"'),
 "Homepage must not request individual premium CSS after bundling");


const stickyCtaStyles=await read("mobile-service-cta.css");
assert.ok(stickyCtaStyles.includes('body:has(.mobile-service-cta:not([hidden])){padding-bottom:'),
 "Hidden mobile CTA must not reserve bottom space");
assert.ok(stickyCtaStyles.includes('body.premium-subpage:has(.mobile-service-cta:not([hidden])) .chat-assistant'),
 "Chatbot bottom offset must follow the visible mobile CTA");

assert.equal((home.match(/class="network-brand-bar"/g)||[]).length,1,"Production homepage must show one sticky partner bar");
assert.ok(!home.includes('class="homepage-partner-strip"'),"Duplicate source partner bar leaked into production homepage");
// Search-engine metadata must match the direct mailboxes displayed to clients.
const homeSchema=home.split('<script type="application/ld+json">').slice(1)
  .map(part=>JSON.parse(part.split("</script>")[0]))
  .flatMap(data=>data["@graph"]||[]);
assert.equal(homeSchema.filter(item=>item["@type"]==="Organization").length,1,
 "Production homepage must contain exactly one Organization schema node");
assert.equal(homeSchema.filter(item=>item["@type"]==="WebSite").length,1,
 "Production homepage must contain exactly one WebSite schema node");
const agencySchema=homeSchema.find(item=>item["@type"]==="Organization"&&Array.isArray(item.contactPoint));
assert.ok(agencySchema,"SuccessTree contact schema missing");
assert.equal(agencySchema.email,"wojciech.obieglo@votum-ds.pl","Organization email must match direct contact");
assert.ok(agencySchema.contactPoint.some(point=>point.email==="wojciech.obieglo@votum-ds.pl"&&point.telephone==="+48 796 441 345"),"Wojciech contact point missing");
assert.ok(agencySchema.contactPoint.some(point=>point.email==="paulina.chandrala@votum-ds.pl"&&point.telephone==="+48 500 171 531"),"Paulina contact point missing");
assert.ok(home.includes("data-share-page")&&home.includes("data-share-feedback")&&home.includes('src="/share-page.js"'),"privacy-safe share control missing on published homepage");
const robots=await read("robots.txt");
const sitemap=await read("sitemap.xml");
const textSitemap=await read("sitemap.txt");
const headers=await read("_headers");
const privacyDisclosure=await read("polityka-prywatnosci.html");
assert.ok(privacyDisclosure.includes('href="https://web3forms.com/dpa"')&&privacyDisclosure.includes("poza Europejskim Obszarem Gospodarczym")&&privacyDisclosure.includes("maksymalnie przez trzy lata"),"Privacy page must link the current Web3Forms DPA and explain international processing and operator retention");

assert.ok(robots.includes("Allow: /")&&!robots.includes("Disallow: /"),"production robots not enabled");
assert.ok(robots.includes("Sitemap: "+origin+"/sitemap.xml"),"production sitemap not announced");
const announcedSitemaps=robots.split(/\r?\n/).filter(line=>line.startsWith("Sitemap: "));
assert.deepEqual(announcedSitemaps,[
 "Sitemap: "+origin+"/sitemap.xml",
 "Sitemap: "+origin+"/sitemap.txt"
],"robots.txt must announce exactly the 2 published canonical sitemap formats");
assert.ok(!robots.includes("Disallow: /"),"Do not block publicly indexable routes");

assert.ok(sitemap.includes("<urlset")&&sitemap.includes("<loc>"+origin+"/</loc>"),"sitemap invalid");
const xmlUrls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1].replaceAll("&amp;","&"));
const textUrls=textSitemap.trimEnd().split(/\r?\n/);
assert.deepEqual(textUrls,xmlUrls,"Google's text sitemap and the XML sitemap must contain the same canonical URLs");
assert.deepEqual(textUrls,(await collectIndexableRoutes("v2")).map(route=>origin+route),
 "The text sitemap must include only the current, indexable, extensionless pages");
assert.ok(textUrls.length>=20&&textUrls.length<=200,"Unexpected text sitemap count");
assert.equal(new Set(textUrls).size,textUrls.length,"Text sitemap has duplicate URLs");
assert.ok(textSitemap.endsWith("\n")&&!textSitemap.includes("<url"),
 "Text sitemap must contain only one absolute URL per line");
console.log("TEXT_SITEMAP_MATCH_OK: "+textUrls.length+" canonical URLs in identical XML and TXT maps.");

// Public AI-oriented directory is an editorial aide, not a ranking signal.
// Verify every curated link resolves to an actual release page and valid fragment.
// No unknown URLs, misspelled anchors, /v2 paths, or accidental indexing claims.
const aiDirectory=await read("llms.txt");
assert.equal(aiDirectory,await readFile("v2/llms.txt","utf8"),
 "Published AI directory must match the reviewed source");
assert.ok(aiDirectory.includes("nie jest oficjalnym serwisem VOTUM")
 &&aiDirectory.includes("nie oznacza zaindeksowania")
 &&aiDirectory.includes("noindex"),
 "AI directory must preserve agency identity and honest indexing limitations");
const aiDirectoryLinks=[...aiDirectory.matchAll(/\]\((https:\/\/twoja-sprawa\.pages\.dev\/[^)\s]+)\)/g)]
 .map(match=>match[1]);
assert.ok(aiDirectoryLinks.length>=20,"Too few editorial links in AI directory");
const targetCache=new Map();
let aiDeepLinks=0;
for(const href of aiDirectoryLinks){
 const target=new URL(href);
 assert.equal(target.origin,origin,"AI directory cannot redirect users to a different domain");
 assert.ok(!target.search&& !target.pathname.includes("/v2/")&&!target.pathname.endsWith(".html"),
  "AI directory must use clean canonical site paths: "+href);
 const path=target.pathname==="/"?"index.html":
  target.pathname.endsWith("/")?target.pathname.slice(1)+"index.html":target.pathname.slice(1)+".html";
 let markup=targetCache.get(path);
 if(markup===undefined){markup=await read(path);targetCache.set(path,markup);}
 assert.ok(markup.includes("<main")||markup.includes("<body"),
  "AI directory target must be a published HTML page: "+href);
 const indexed=textUrls.includes(origin+target.pathname);
 assert.ok(markup.includes('name="robots" content="'+(indexed?"index,follow":"noindex,follow")+'"'),
  "AI directory target indexing status disagrees with sitemap: "+href);
 if(target.hash){
  const id=decodeURIComponent(target.hash.slice(1));
  assert.ok(markup.includes('id="'+id+'"')||markup.includes("id='"+id+"'"),
   "AI directory points to missing section anchor: "+href);
  aiDeepLinks++;
 }
}
assert.ok(aiDeepLinks>=7,"Keep verified links to high-value explanatory sections");
console.log("AI_DIRECTORY_OK: "+aiDirectoryLinks.length+" validated links, "
 +targetCache.size+" existing HTML pages, "+aiDeepLinks+" verified section anchors.");

// Local landing page visitors must be able to switch towns immediately,
// without searching through the article or sending a form to the wrong route.
for(const [route,neighbor] of [
 ["lokalnie/szkody-gornicze-lubin.html","polkowice"],
 ["lokalnie/szkody-gornicze-polkowice.html","lubin"]
]){
 const page=await read(route);
 const hero=page.split('<section class="local-hero"')[1]?.split("</section>")[0]||"";
 const nav=hero.split('<nav class="local-area-switch"')[1]?.split("</nav>")[0]||"";
 assert.ok(nav,"Local hero needs a visible no-JS area switcher: "+route);
 assert.ok(nav.includes('href="/lokalnie/szkody-gornicze-'+neighbor+'"'),
  "Switch link must use the canonical nearby-city URL: "+route);
 assert.ok(nav.includes('href="/uslugi/szkody-gornicze"'),
  "Local page must link back to the main canonical mining service: "+route);
 assert.equal((nav.match(/<a\b/g)||[]).length,2,
  "Local hero must contain two unambiguous nearby links: "+route);
 assert.ok(hero.indexOf("local-area-switch")>hero.indexOf("local-disclaimer"),
  "Caution about mine attribution must remain immediately after contact actions: "+route);
 assert.ok(hero.includes('href="#formularz"')&&hero.includes('href="tel:+48796441345"'),
  "Early local lead paths and Wojciech contact must remain intact: "+route);
}
const localAreaCSS=await read("local-mining.css");
assert.ok(localAreaCSS.includes(".local-mining-page .local-area-switch")
 &&localAreaCSS.includes(".local-area-switch>a:focus-visible")
 &&localAreaCSS.includes("min-height:44px"),
 "Published local CSS must style keyboard and touch area switching");
console.log("LOCAL_AREA_SWITCH_OK: Lubin ↔ Polkowice and main service reachable without JS.");


for(const route of ["/uslugi/szkody-gornicze","/uslugi/swiadczenie-wspierajace","/uslugi/kredyty-frankowe","/wiedza/","/faq","/plan-dzialania"]){
 assert.ok(sitemap.includes("<loc>"+origin+route+"</loc>"),"required SEO route missing: "+route);
}
for(const route of ["/404","/szukaj","/kampanie/szkody-gornicze","/kampanie/swiadczenie-wspierajace","/kampanie/renty-powypadkowe","/kampanie/skd","/polityka-prywatnosci","/start"]){
 assert.ok(!sitemap.includes("<loc>"+origin+route+"</loc>"),"nonindex route leaked into sitemap: "+route);
}
assert.ok(!headers.includes("X-Robots-Tag: noindex"),"preview response headers leaked");
assert.ok(headers.includes("X-Frame-Options: SAMEORIGIN"),"Own diagnostics must be allowed to frame same-origin forms");
assert.ok(headers.includes("/release-info.json")&&headers.includes("Cache-Control: no-cache, no-store, must-revalidate"),"Release fingerprint must not be served from a stale cache");
assert.ok(headers.includes("/layers-*.css")&&headers.includes("Cache-Control: public, max-age=31536000, immutable"),
 "Content-addressed CSS should be safely cached between visits without stale styling");
assert.ok(headers.includes("Content-Security-Policy: frame-ancestors 'self'"),"External sites must not frame the contact forms");
assert.ok(!headers.includes("X-Frame-Options: DENY"),"DENY would block same-origin form diagnostics");
for(const path of ["index.html","uslugi/szkody-gornicze.html","uslugi/swiadczenie-wspierajace.html","uslugi/kredyty-frankowe.html","uslugi/kredyty-pln.html","wiedza/index.html","faq.html","plan-dzialania.html"]){
 const html=await read(path);
 assert.ok(html.includes('name="robots" content="index,follow"'),"still noindex: "+path);
 assert.ok(html.includes('rel="canonical" href="'+origin),"missing canonical: "+path);
 assert.ok(html.includes('type="application/ld+json"'),"missing structured data: "+path);
 assert.ok(html.includes('class="network-brand-bar"'),"missing agency branding: "+path);
 assert.ok(!html.includes('href="/v2/')&&!html.includes('src="/v2/'),"source path leaked into HTML: "+path);
}
for(const path of ["404.html","szukaj.html","polityka-prywatnosci.html","kampanie/szkody-gornicze.html","kampanie/swiadczenie-wspierajace.html","kampanie/renty-powypadkowe.html","kampanie/skd.html","start.html"]){
 const html=await read(path);
 assert.ok(html.includes('name="robots" content="noindex,follow"'),"excluded page accidentally indexable: "+path);
}
// Validate *published* breadcrumbs, which the build derives from visible
// navigation in @graph. Source-authored BreadcrumbLists are intentionally
// stripped to avoid duplicate schemas.
for(const [slug,label] of [
 ["szkody-gornicze","Szkody górnicze"],
 ["swiadczenie-wspierajace","Świadczenie wspierające"],
 ["renty-powypadkowe","Renty powypadkowe"],
 ["kredyty-pln","Sankcja kredytu darmowego"],
 ["kredyty-frankowe","Kredyty frankowe"],
 ["sluzebnosc-przesylu","Służebność przesyłu"]
]){
 const path="uslugi/"+slug+".html";
 const html=await read(path);
 const canonical=origin+"/uslugi/"+slug;
 const head=html.slice(0,html.indexOf("</head>"));
 assert.ok(head.includes('rel="canonical" href="'+canonical+'"'),"Canonical mismatch for "+path);
 const nodes=head.split('<script type="application/ld+json">').slice(1)
  .map(chunk=>JSON.parse(chunk.split("</script>")[0]))
  .flatMap(schema=>schema["@graph"]||[schema]);
 const crumbs=nodes.filter(item=>item["@type"]==="BreadcrumbList");
 assert.equal(crumbs.length,1,"Exactly one *published* breadcrumb expected for "+path);
 const items=crumbs[0].itemListElement;
 assert.equal(items.length,3,"Breadcrumb path should contain start, services and current page: "+path);
 assert.equal(items[0].item,origin+"/","Breadcrumb home URL mismatch: "+path);
 assert.equal(items[1].item,origin+"/#uslugi","Breadcrumb services URL mismatch: "+path);
 assert.equal(items[2].item,canonical,"Breadcrumb URL mismatch: "+path);
 assert.equal(items[2].name,label,"Breadcrumb label must match visible navigation: "+path);
 assert.ok(html.includes('name="robots" content="index,follow'),"Primary service must remain indexable: "+path);
}
const homeSeoTitle=home.split("<title>")[1]?.split("</title>")[0]||"";
const miningSeoTitle=(await read("uslugi/szkody-gornicze.html")).split("<title>")[1]?.split("</title>")[0]||"";
assert.notEqual(homeSeoTitle,miningSeoTitle,"Homepage and mining service require distinct descriptive titles");
assert.ok(homeSeoTitle.includes("świadczenie wspierające"),"Homepage must describe both flagship services");
console.log("SERVICE_BREADCRUMBS_OK: six generated canonical trails, unique homepage title, indexable service pages.");

// Build-level regression: the UTM module must never attach twice.
for(const target of ["index.html","kontakt.html","faq.html","uslugi/szkody-gornicze.html","uslugi/swiadczenie-wspierajace.html","kampanie/renty-powypadkowe.html","kampanie/skd.html"]){
 const html=await read(target);
 const modules=[...html.matchAll(/<script\b[^>]*\bsrc="\/attribution\.js"/g)];
 assert.equal(modules.length,1,"Duplicated or missing campaign attribution: "+target);
}
for(const target of [
 "wiedza/drobne-pekniecia-szkody-gornicze.html",
 "wiedza/ugoda-z-kopalnia-co-sprawdzic.html",
 "wiedza/swiadczenie-wspierajace-2026-wzon-zus.html",
 "wiedza/renta-powypadkowa-dokumenty.html",
 "wiedza/swiadczenie-wspierajace-dokumenty.html",
 "wiedza/kredyt-pln-dokumenty-skd.html",
 "wiedza/sluzebnosc-przesylu-slup-na-dzialce.html",
 "wiedza/wypadek-przy-pracy-pierwsze-kroki.html"
]){
 const html=await read(target);
 assert.ok(html.includes('name="robots" content="index,follow"'),"Approved guide should be indexable: "+target);
 assert.ok(sitemap.includes("<loc>"+origin+"/"+target.slice(0,-5)+"</loc>"),"Approved guide missing in sitemap: "+target);
}
// Do not accidentally publish draft guides or lead checklists as SEO pages.
for(const target of [
 "wiedza/szkody-gornicze-drobne-pekniecia.html",
 "poradniki/checklista-szkody-gorniczej.html",
 "poradniki/frankowicze-lista-kontrolna.html",
 "poradniki/skd-kredyt-pln-lista-kontrolna.html"
]){
 const html=await read(target);
 assert.ok(html.includes('name="robots" content="noindex,follow"'),"Draft/checklist unexpectedly indexable: "+target);
 assert.ok(!sitemap.includes("<loc>"+origin+"/"+target.slice(0,-5)+"</loc>"),"Draft/checklist leaked into sitemap: "+target);
}
for(const target of ["index.html","uslugi/szkody-gornicze.html","uslugi/swiadczenie-wspierajace.html"]){
 const html=await read(target);
 assert.ok(html.includes('<meta name="twitter:card" content="summary_large_image">'),"Large social preview missing: "+target);
}

// Prevent contradictory social descriptions even after the builder enriches HTML.
for(const target of ["index.html","uslugi/szkody-gornicze.html","uslugi/swiadczenie-wspierajace.html"]){
 const html=await read(target);
 const head=html.slice(0,html.indexOf("</head>"));
 const ogDescription=[...head.matchAll(/<meta\s+property="og:description"\s+content="[^"]*">/g)];
 assert.equal(ogDescription.length,1,"Open Graph description must be unique: "+target);
 const title=html.match(/<title>([^<]+)<\/title>/i)?.[1]||"";
 const desc=head.match(/<meta name="description" content="([^"]*)"/i)?.[1]||"";
 assert.ok(title.length>=30&&title.length<=60,"Unexpected SEO title length: "+target);
 assert.ok(desc.length>=70&&desc.length<=160,"Unexpected SEO description length: "+target);
}

// Images exposed in generated Facebook links must be topic-specific,
 // local to the Cloudflare domain, and the same for Open Graph and X.
const previewCases=[
 ["index.html","og-twoja-sprawa-metallic-v1.jpg",1536,803],
 ["kampanie/szkody-gornicze.html","og-szkody-gornicze.jpg",1200,630],
 ["kampanie/swiadczenie-wspierajace.html","og-swiadczenie-wspierajace.jpg",1200,630],
 ["kampanie/skd.html","og-skd.jpg",1200,630],
 ["kampanie/renty-powypadkowe.html","og-renty-powypadkowe.jpg",1200,630],
 ["uslugi/szkody-gornicze.html","og-szkody-gornicze.jpg",1200,630],
 ["uslugi/swiadczenie-wspierajace.html","og-swiadczenie-wspierajace.jpg",1200,630],
 ["uslugi/kredyty-pln.html","og-skd.jpg",1200,630],
 ["uslugi/renty-powypadkowe.html","og-renty-powypadkowe.jpg",1200,630],
 ["uslugi/kredyty-frankowe.html","og-kredyty-frankowe.jpg",1200,630],
 ["uslugi/sluzebnosc-przesylu.html","og-sluzebnosc-przesylu.jpg",1200,630],
 ["wiedza/kredyt-pln-dokumenty-skd.html","og-skd-dokumenty.jpg",1200,630],
 ["wiedza/drobne-pekniecia-szkody-gornicze.html","og-szkody-gornicze.jpg",1200,630],
 ["wiedza/swiadczenie-wspierajace-2026-wzon-zus.html","og-swiadczenie-wspierajace.jpg",1200,630],
 ["wiedza/renta-powypadkowa-dokumenty.html","og-renty-powypadkowe.jpg",1200,630],
 ["lokalnie/szkody-gornicze-lubin.html","og-szkody-lubin.jpg",1200,630],
 ["lokalnie/szkody-gornicze-polkowice.html","og-szkody-polkowice.jpg",1200,630]
];
for(const [page,file,width,height] of previewCases){
 const markup=await read(page),head=markup.slice(0,markup.indexOf("</head>"));
 const title=markup.match(/<title>([^<]+)<\/title>/)?.[1];
 const desc=head.match(/<meta name="description" content="([^"]+)"/)?.[1];
 assert.ok(title&&desc,"Missing social source content "+page);
 for(const [field,key,val] of [
  ["property","og:title",title],["property","og:description",desc],
  ["property","og:image",origin+"/assets/"+file],
  ["property","og:image:secure_url",origin+"/assets/"+file],
  ["property","og:image:type","image/jpeg"],
  ["property","og:image:width",String(width)],
  ["property","og:image:height",String(height)],
  ["name","twitter:image",origin+"/assets/"+file],
  ["name","twitter:card","summary_large_image"]
 ]){
  assert.ok(head.includes('<meta '+field+'="'+key+'" content="'+val+'">'),
   "Unexpected "+key+" on "+page);
 }
 assert.equal((head.match(/<meta property="og:image" /g)||[]).length,1,
  "Facebook OG images must be unique: "+page);
 assert.ok(head.includes('<meta property="og:image:alt" content="'),"Missing image description "+page);
 if(file!=="og-twoja-sprawa-metallic-v1.jpg"){
  const size=(await stat("dist/assets/"+file)).size;
  assert.ok(size>50000&&size<700000,"Preview missing or oversized: "+file);
 }
}
const campaignPage=await read("narzedzia/linki-kampanii.html");
const campaignScript=await read("campaign-links.js");
assert.ok(campaignPage.includes('src="/assets/og-swiadczenie-wspierajace.jpg"'),"Generator preview needs first Facebook campaign support-benefit image");
assert.ok(campaignScript.includes('return "og-skd-dokumenty.jpg"')&&
 campaignScript.includes('previewImage.src=src'),"Generator must choose article SKD image");
assert.ok(campaignPage.includes('data-facebook-debugger')&&
 campaignScript.includes('facebookDebugger.href="https://developers.facebook.com/tools/debug/?q="+encodeURIComponent(canonical)'),
 "Generator must prefill Meta Sharing Debugger with the selected canonical page");
console.log("THEMATIC_OG_IMAGES_OK: 17 routes, 9 optimized thematic assets, aligned previews.");

// The search page must degrade gracefully if scripts or its local index fail.
// No-JavaScript users should see real service links instead of inert controls.
const searchHtml=await read("szukaj.html");
const searchJs=await read("site-search.js");
const searchCss=await read("site-search.css");
assert.ok(searchHtml.includes("data-search-fallback")&&
 searchHtml.includes("data-search-interactive")&&
 searchJs.includes('host.dataset.searchReady="true"')&&
 searchJs.includes("staticFallback.hidden=true")&&
 searchCss.includes('[data-site-search]:not([data-search-ready="true"]) [data-search-interactive]'),
 "Search must show static destinations until local results initialize");
for(const href of [
 "/uslugi/szkody-gornicze","/uslugi/swiadczenie-wspierajace",
 "/uslugi/kredyty-pln","/uslugi/renty-powypadkowe",
 "/uslugi/kredyty-frankowe","/uslugi/sluzebnosc-przesylu"
]){
 assert.ok(searchHtml.includes('href="'+href+'"'),
  "Missing indexable service link in fallback search: "+href);
}

const contactFormJS=await read("contact.js");
assert.ok(contactFormJS.includes("let refreshDirectContact=()=>{};")&&
 contactFormJS.includes("refreshDirectContact=updateDirect;updateDirect();")&&
 contactFormJS.includes("form.reset();updateAdvisor();updatePeople();refreshDirectContact();"),
 "After submission and reset, direct contact must point to the currently selected adviser");
assert.ok(contactFormJS.includes("phoneFieldLabel.textContent=isSKD||prefer")&&
 contactFormJS.includes('emailFieldLabel.textContent=prefer==="E-mail"'),
 "Phone/email required-label hints must update with selected service and contact preference");
assert.ok(contactFormJS.includes("updateDamageArea();damageArea.value=choice;syncCityQuick();")&&
 contactFormJS.includes("syncCityQuick();\n    if(stageWrap.hidden)return;"),
 "Campaign cards must keep the locality choices synchronized with the chosen service");



assert.ok(contactFormJS.includes('select.value="Szkody górnicze";updateAdvisor();updatePeople();refreshDirectContact();')&&
 contactFormJS.includes('updateAdvisor();updatePeople();refreshDirectContact();updateGuide();updateStage();updateDamageArea();syncContactPreference();'),
 "Changing service through campaign cards must also update direct advisor links");
assert.ok(contactFormJS.includes('directMail.addEventListener("click",()=>{')&&
 contactFormJS.includes('const callbackNumber=entered&&validPhoneNumber(entered)?entered:"[wpisz numer]";'),
 "SKD direct email should include a verified entered callback number, without URL tracking");
const contactCss=await read("styles.css");
assert.ok(contactFormJS.includes('routingNote.className="contact-routing-note"')&&
 contactFormJS.includes('directMail.className="contact-advisor-direct-email"')&&
 contactFormJS.includes("advisor_email jest metadana")&&
 contactFormJS.includes("nie oznacza automatycznego doręczenia wiadomości bezpośrednio do doradcy"),
 "Web3Forms access_key selects recipient; form must disclose routing and offer direct advisor email");
assert.ok(contactCss.includes(".contact-advisor .contact-routing-note"),
 "Form must show a legible routing disclosure");

assert.ok(contactFormJS.includes('copyButton.className="contact-advisor-copy-button"')&&
 contactFormJS.includes("await navigator.clipboard.writeText(advisorEmail);")&&
 contactFormJS.includes('emailAddress.textContent=advisorEmail;'),
 "Copy button must copy the currently selected adviser's public email");
assert.ok(contactCss.includes(".contact-advisor .contact-advisor-copy-address")&&
 contactCss.includes(".contact-advisor .contact-advisor-copy-status"),
 "Adviser copy UI requires readable address and status styles");

assert.ok(contactFormJS.includes('copyDraft.className="contact-draft-copy"')&&
 contactFormJS.includes('await navigator.clipboard.writeText(makeDraft());')&&
 contactFormJS.includes('fallback.href=safeHref+"&body="+encodeURIComponent(makeDraft());')&&
 contactFormJS.includes('window.setTimeout(updateFallback,0);')&&
 contactFormJS.includes('navigator.onLine===false'),
 "Failed Web3Forms request must offer a privacy-aware copy of the current lead and recipient");
assert.ok(contactCss.includes(".contact-form .contact-draft-copy")&&
 contactCss.includes(".contact-form .contact-draft-feedback"),
 "Failed lead copy action requires accessible mobile styling");

const diagnosticTool=await read("narzedzia/test-formularzy.html");
assert.ok(diagnosticTool.includes('["SKD — walidacja numeru","/kampanie/skd",true,"","","skd-phone"]')&&
 diagnosticTool.includes('["Szkody — e-mail bez telefonu","/kampanie/szkody-gornicze",false,"","","email-only"]')&&
 diagnosticTool.includes('const acceptsValid=tel.checkValidity();')&&
 diagnosticTool.includes('const good=!tel.required&&tel.checkValidity()&&email.checkValidity();'),
 "Public browser diagnostics must safely check SKD phone validation and email-only cases");

assert.ok(diagnosticTool.includes('["Szkody — zmiana z karty","/kampanie/szkody-gornicze",false,"","szkody"]')&&
 diagnosticTool.includes('["Świadczenie — zmiana z karty","/kampanie/swiadczenie-wspierajace",false,"","swiadczenie"]')&&
 diagnosticTool.includes('directEmail.getAttribute("href")||"").startsWith("mailto:"+emailAddress+"?")'),
 "Diagnostics must cover campaign-card adviser switching without submitting data");
assert.ok(diagnosticTool.includes('["Świadczenie — kontakt do Pauliny","/kampanie/swiadczenie-wspierajace",false,"Świadczenie wspierające"]')&&
 diagnosticTool.includes('a[href^="mailto:paulina.chandrala@votum-ds.pl"]')&&
 diagnosticTool.includes('a[href="tel:+48500171531"]'),
 "Diagnostic tool must check the dynamically selected benefit advisor without submitting forms");
const skdNavigator=await read("service-navigator.js");

const guideLinksJS=await read("service-navigator.js");
const assistantLinksJS=await read("chat-assistant.js");
for(const [name,script] of [["Przewodnik",guideLinksJS],["Chatbot",assistantLinksJS]]){
 assert.ok(script.includes('window.location.pathname.startsWith("/"+"v2/")')&&
           script.includes(String.raw`replace(/\.html$/,"")`),
  name+": production build must keep extensionless URLs without changing the preview detector");
 assert.ok(!script.includes('window.location.pathname.startsWith("/")'),
  name+": production builder replaced the preview detector and broke clean links");
}

const skdChatbot=await read("chat-assistant.js");
assert.ok(skdNavigator.includes('service:"kredyty-pln.html",landing:"kampanie/skd.html"'),
 "Navigator must offer dedicated SKD campaign form");
assert.ok(skdChatbot.includes('form:"kampanie/skd.html"+params,alias:"skd"'),
 "Chatbot must offer dedicated SKD campaign form");
const mobileFourNav=home.split('<nav class="mobile-quick-nav"')[1]?.split('</nav>')[0]||"";
assert.ok(mobileFourNav,"Homepage must have the four-service mobile navigation");
for(const token of ["mobile-mining-priority","mobile-support-priority","mobile-skd-priority","mobile-rents-priority"]){
 assert.ok(mobileFourNav.includes(token),"Mobile navigation missing priority "+token);
}
assert.ok(mobileFourNav.indexOf("mobile-rents-priority")>mobileFourNav.indexOf("mobile-skd-priority"),
 "Rents must follow the three original flagship projects");
// All four primary service routes must be the real, indexable destinations.
// Do not turn the organic menu into a set of noindex campaign landing pages.
for(const [cls,path] of [
 ["mobile-mining-priority","/uslugi/szkody-gornicze"],
 ["mobile-support-priority","/uslugi/swiadczenie-wspierajace"],
 ["mobile-skd-priority","/uslugi/kredyty-pln"],
 ["mobile-rents-priority","/uslugi/renty-powypadkowe"]
]){
 assert.ok(mobileFourNav.includes('class="'+cls+'" href="'+path+'"'),
  "Mobile navigation has noncanonical service URL: "+path);
 assert.ok(sitemap.includes("<loc>"+origin+path+"</loc>"),
  "Mobile service destination not listed in indexable XML sitemap: "+path);
}
assert.ok(!mobileFourNav.includes('href="/kampanie/'),
 "The organic homepage must not send its primary mobile visitors to noindex landing pages");
const safeFallbackSearch=await read("szukaj.html");
const directFallback=safeFallbackSearch.split('<nav class="search-fallback-links"')[1]?.split("</nav>")[0]||"";
assert.ok(directFallback,"No-JS search must retain direct service links");
for(const path of ["/uslugi/szkody-gornicze","/uslugi/swiadczenie-wspierajace","/uslugi/kredyty-pln"]){
 assert.ok(directFallback.includes('href="'+path+'"'),"Static search must prioritize indexable service: "+path);
}
assert.ok(!directFallback.includes('href="/kampanie/'),
 "No-JS search navigation must not funnel visitors to noindex campaigns");
console.log("ORGANIC_MOBILE_SERVICE_PATHS_OK: 4 homepage and 6 fallback routes lead to indexable service pages.");
const homeFlowCss=await read("home-flow.css");
// Production builder removes comments to reduce CSS bytes. Assert the actual
// mobile layout rule, never the discarded authoring comment.
assert.ok(/@media\(max-width:760px\)\s*\{\s*\.premium-v2 \.hero-priority-grid\s*\{\s*display:none\s*\}/.test(homeFlowCss),
 "Mobile hero cards must not duplicate quick navigation on 601-760px screens");
assert.ok(homeFlowCss.includes("@media(max-width:420px)")&&
 homeFlowCss.includes(".premium-v2 .mobile-quick-nav>a.mobile-skd-priority{grid-column:1 / -1}"),
 "On narrow phones SKD must remain visible, readable and third");
assert.ok(homeFlowCss.includes("mobile-rents-priority")&&
 homeFlowCss.includes("grid-template-columns:repeat(2,minmax(0,1fr))"),
 "Four mobile projects should use readable two-column layout");
assert.ok(homeFlowCss.includes(".mobile-quick-nav>a.mobile-rents-priority")&&
 homeFlowCss.includes("grid-column:1 / -1"),
 "On very narrow phones rents should not be compressed into a half-empty row");
assert.ok(homeFlowCss.includes(".premium-v2 .hero-skd-third{display:none}"),
 "SKD hero CTA must not duplicate its mobile nav button");

const campaignQuickBar=await read("campaign-mobile-actions.js");
assert.ok(campaignQuickBar.includes('const formHasFocus=formRegion.contains(document.activeElement);')&&
 campaignQuickBar.includes('bar.hidden=overlapsForm||formHasFocus;'),
 "Campaign bottom CTA must hide when the contact form is visible or focused");
const campaignStyles=await read("styles.css");
// Shared contact form must remain usable on narrow 320px phones without
// clipping fields, browser auto-zoom or undersized submit controls.
assert.ok(campaignStyles.includes(".contact-form>button[type=submit]")&&
 campaignStyles.includes("justify-self:stretch;width:100%;min-height:52px"),
 "Mobile submit button must remain full width and easy to tap");
assert.ok(campaignStyles.includes(".contact-form{box-sizing:border-box;width:100%;max-width:100%;min-width:0")&&
 campaignStyles.includes("max-width:100%;min-height:48px;font-size:16px"),
 "Narrow mobile forms must not overflow and must avoid input auto-zoom");
assert.ok(campaignStyles.includes(".contact-form .check input{width:22px;height:22px"),
 "Mobile contact consent checkbox must have a readable tap target");
assert.ok(campaignStyles.includes(".campaign-mobile-actions[hidden]{display:none!important}")&&
 campaignStyles.includes(".campaign-page:has(.campaign-mobile-actions:not([hidden]))"),
 "Hidden campaign bar must not leave extra mobile bottom space");
for(const path of [
 "kampanie/szkody-gornicze.html",
 "kampanie/swiadczenie-wspierajace.html",
 "kampanie/skd.html"
]){
 const html=await read(path);
 assert.ok(html.includes('<script src="/campaign-mobile-actions.js" defer></script>'),
  "Campaign missing its mobile quick bar visibility controller: "+path);
}
const skdLanding=await read("kampanie/skd.html");
assert.ok(skdLanding.includes('src="/contact.js" data-service="Kredyt w PLN / SKD"'),"SKD lead form must be selected");
assert.ok(skdLanding.includes("mailto:wojciech.obieglo@votum-ds.pl?subject="),"SKD contract email missing");
assert.ok(skdLanding.includes("M%C3%B3j%20numer%20telefonu"),"SKD email must request phone");
assert.ok(skdLanding.includes('href="tel:+48796441345"'),"SKD campaign phone missing");
assert.ok(!skdLanding.includes('href="tel:+48500171531"'),"SKD landing must not link to benefits number");
assert.ok(skdLanding.includes('class="network-brand-bar"'),"SKD landing partner logos missing");
const skdLayer=skdLanding.match(/href="\/(layers-[a-f0-9]{16}\.css)"/)?.[1];
assert.ok(skdLayer,"SKD landing merged CSS missing");
assert.ok((await read(skdLayer)).includes(".campaign-skd .campaign-hero"),"SKD-specific visual rules missing from bundle");

assert.ok(skdLanding.includes('class="campaign-mobile-call" href="#formularz" aria-label="Zostaw numer telefonu do analizy SKD"'),
 "SKD mobile callback action should reach the phone form");
assert.ok(skdLanding.includes('class="campaign-mobile-primary" href="mailto:wojciech.obieglo@votum-ds.pl'),
 "SKD mobile contract action must still email Wojciech");
const skdCss=await read("skd-campaign.css");
assert.ok(skdCss.includes(".campaign-skd"),"SKD campaign styles not built");
const leaflet=await read("start.html");
assert.ok(leaflet.includes('name="robots" content="noindex,follow"'),"Flyer entry must not compete with public service SEO");
assert.ok(leaflet.includes('rel="canonical" href="'+origin+'/start"'),"Flyer entry missing stable canonical");
assert.ok(leaflet.includes('href="/kampanie/swiadczenie-wspierajace?utm_source=ulotka'),"Support CTA missing from printed QR destination");
assert.ok(leaflet.includes('href="/kampanie/szkody-gornicze?utm_source=ulotka'),"Mining CTA missing from printed QR destination");
const flyerLayer=leaflet.match(/href="\/(layers-[a-f0-9]{16}\.css)"/)?.[1];
assert.ok(flyerLayer||leaflet.includes('href="/ulotka-start.css"'),"Responsive flyer CSS missing");
const flyerStyles=await read(flyerLayer||"ulotka-start.css");
assert.ok(flyerStyles.includes(".leaflet-"),"Responsive flyer visual rules missing from CSS");
assert.ok(leaflet.includes('class="network-brand-bar"'),"Agency branding missing from flyer entry");
assert.ok(!leaflet.includes('href="/v2/'),"Source paths leaked into flyer entry");
const flyerCSS=await read("ulotka-start.css");
assert.ok(flyerCSS.includes("@media(max-width:730px)"),"Mobile styles missing on flyer entry");
const assets=["assets/wojciech-obieglo.jpg","assets/paulina-chandrala.jpg"];
for(const path of assets){
 const file=await readFile("dist/"+path);
 assert.ok(file.length>=10000&&file.length<=8000000&&file[0]===0xff&&file[1]===0xd8,"portrait missing/invalid: "+path);
 const archived=await readFile("v2/"+path);
 assert.equal(Buffer.compare(file,archived),0,"Portrait output must exactly match archived source: "+path);
}
assert.ok(home.includes("/assets/wojciech-obieglo.jpg")&&home.includes("/assets/paulina-chandrala.jpg"),"portraits not localized");
for(const file of ["search-pages-1.js","search-pages-2.js","search-faq-data.js"]){
 const src=await read(file);
 assert.ok(!src.includes('"/v2/'),"old source links in production search index: "+file);
}
// Structured data matches each page's actual purpose, without inventing
// ratings, results, office addresses or affiliation with VOTUM as the publisher.
for(const [path,type] of [
 ["kontakt.html","ContactPage"],
 ["o-nas.html","AboutPage"],
 ["wiedza/index.html","CollectionPage"]
]){
 const html=await read(path);
 const scripts=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
 const graphs=scripts.map(x=>JSON.parse(x[1])).flatMap(x=>x["@graph"]||[]);
 const page=graphs.find(x=>x["@type"]===type);
 assert.ok(page,"Expected Schema.org "+type+" on "+path);
 assert.ok(page["@id"]?.endsWith("#webpage")&&page.isPartOf?.["@id"]===origin+"/#website","Invalid structured page reference: "+path);
 const agency=graphs.find(x=>x["@type"]==="Organization");
 assert.ok(agency&&agency.name==="SuccessTree OBIEGŁO WOJCIECH","Agency ownership incorrectly represented on "+path);
 if(type==="ContactPage")assert.equal(page.mainEntity?.["@id"],agency["@id"],"ContactPage must refer to agency, not VOTUM");
 if(type==="AboutPage")assert.equal(page.about?.length,2,"About page must identify actual two contact people");
}

const faqPage=await read("faq.html");
const faqScripts=[...faqPage.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
const faqGraphs=faqScripts.map(([,raw])=>JSON.parse(raw));
const faqSchema=faqGraphs.flatMap(g=>g["@graph"]||[]).find(item=>item["@type"]==="FAQPage");
assert.ok(faqSchema,"missing structured FAQPage on published FAQ");
assert.equal(faqSchema.mainEntity.length,29,"FAQ schema must cover 29 visible questions");
for(const item of faqSchema.mainEntity){
 assert.equal(item["@type"],"Question");
 assert.equal(item.acceptedAnswer?.["@type"],"Answer");
 assert.ok(item.name.length>15&&item.acceptedAnswer.text.length>60);
 assert.ok(faqPage.includes("<summary>"+item.name.replaceAll("&","&amp;")+"</summary>")||faqPage.includes("<summary>"+item.name+"</summary>"),"structured question not visible: "+item.name);
}
const frank=await read("uslugi/kredyty-frankowe.html");
assert.ok(frank.includes('src="/contact.js" data-service="Kredyty frankowe CHF"'),"CHF conversion form missing or not selected");
assert.ok(frank.includes('href="/poradniki/frankowicze-lista-kontrolna"'),"CHF checklist link missing");
assert.ok(frank.includes("Pomoc frankowiczom"),"Frankowicz service missing visible heading");
// Verify the real service region, including town and municipality without a fictional office.
const localArea=city=>[{"@type":"City",name:city},{"@type":"AdministrativeArea",name:"gmina "+city,containedInPlace:{"@type":"AdministrativeArea",name:"województwo dolnośląskie"}}];
for(const [file,area] of [
 ["uslugi/szkody-gornicze.html","Lubin, Polkowice i okolice"],
 ["lokalnie/szkody-gornicze-lubin.html",localArea("Lubin")],
 ["lokalnie/szkody-gornicze-polkowice.html",localArea("Polkowice")],
 ["uslugi/swiadczenie-wspierajace.html","Polska"]
]){
 const html=await read(file);
 const graphs=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
   .flatMap(([,raw])=>JSON.parse(raw)["@graph"]||[]);
 const service=graphs.find(item=>item["@type"]==="Service");
 assert.ok(service,"Missing Service schema: "+file);
 assert.deepEqual(service.areaServed,area,"Inaccurate SEO service area: "+file);
}
const miningPage=await read("uslugi/szkody-gornicze.html");
assert.ok(!miningPage.includes('"@type":"FAQPage"'),"FAQ schema should not be duplicated on other routes");

// Strong discovery paths to the two distinct, reviewed local mining articles.
// The reader sees these immediately after the three first steps, without JS.
const firstSteps=miningPage.split('<section class="wrap service-first-steps"')[1]?.split("</section>")[0]||"";
const regionLinks=firstSteps.split('<nav class="service-mining-regions"')[1]?.split("</nav>")[0]||"";
assert.ok(regionLinks,"Local mining entry points must be visible near the start of the service");
assert.equal((regionLinks.match(/<a\b/g)||[]).length,2,
 "Keep exactly two genuine regional destinations");
for(const [path,label] of [
 ["/lokalnie/szkody-gornicze-lubin","Lubin i gmina Lubin"],
 ["/lokalnie/szkody-gornicze-polkowice","Polkowice i gmina Polkowice"]
]){
 assert.ok(regionLinks.includes('href="'+path+'"')&&regionLinks.includes(label),
  "First steps must point to the indexed canonical local service: "+path);
 assert.ok(sitemap.includes("<loc>"+origin+path+"</loc>"),
  "Local destination must appear in the published sitemap: "+path);
}
assert.ok(firstSteps.indexOf("service-mining-regions")>firstSteps.indexOf("</ol>"),
 "Regional navigation must follow, not interrupt, the three steps");
const serviceStyles=await read("seo-answers.css");
assert.ok(serviceStyles.includes(".service-mining-regions")&&
 serviceStyles.includes(".service-mining-regions>a:focus-visible")&&
 serviceStyles.includes("min-height:64px"),"Local nav lacks accessible styles");
console.log("SERVICE_EARLY_REGIONS_OK: two direct local routes below first steps, no JS required.");

// Rent conversion path must be reachable before lengthy legal explanation.
// Keep all four defined stages and provide an information-only option.
const rentLanding=await read("uslugi/renty-powypadkowe.html");
const rentStepsStart=rentLanding.indexOf('<section class="wrap service-first-steps"');
const rentChooserStart=rentLanding.indexOf('<section class="rent-journey wrap"');
const rentArticleStart=rentLanding.indexOf('<article class="wrap article"');
assert.ok(rentStepsStart>=0&&rentStepsStart<rentChooserStart&&rentChooserStart<rentArticleStart,
 "Visitors must see the existing four-option rent chooser before the lengthy article");
assert.equal((rentLanding.match(/class="rent-journey wrap"/g)||[]).length,1,
 "Moving rent chooser must not duplicate it");
const rentChooser=rentLanding.slice(rentChooserStart,rentLanding.indexOf("</section>",rentChooserStart)+10);
const rentStages=["nowa","podwyzszenie","odmowa","ugoda"];
assert.equal((rentChooser.match(/class="rent-journey-card"/g)||[]).length,4,
 "Rent guidance must retain the four existing case choices");
for(const stageName of rentStages){
 assert.ok(rentChooser.includes('/uslugi/renty-powypadkowe?etap='+stageName+'#formularz'),
  "Rent chooser has an invalid canonical stage route: "+stageName);
}
assert.ok(rentLanding.includes('href="#wybierz-sytuacje-renty"'),
 "The rent hero should provide an immediate route to its stage chooser");
assert.ok(rentChooser.includes('href="/wiedza/renta-powypadkowa-dokumenty#renta-lista"'),
 "Offer a no-contact document checklist before form selection");
const rentDocumentGuide=await read("wiedza/renta-powypadkowa-dokumenty.html");
assert.ok(rentDocumentGuide.includes('id="renta-lista"'),
 "Rent document guide target does not exist");
const rentFormScript=await read("contact.js");
for(const stageName of rentStages){
 assert.ok(rentFormScript.includes(stageName+':"'),
  "Rent contact form must recognize journey stage: "+stageName);
}
const rentJourneyCSS=await read("rent-journey.css");
assert.ok(rentJourneyCSS.includes(".rent-journey-guide a:focus-visible"),
 "Document checklist link needs visible keyboard focus");
console.log("RENT_EARLY_CHOOSER_OK: four existing case stages and privacy-safe checklist before article.");


// First-time WZON applicants and people with a decision need different guides.
// Place both directly after the introductory steps, and validate canonical
// destinations and the deep link, without introducing duplicate SEO pages.
const supportServicePage=await read("uslugi/swiadczenie-wspierajace.html");
const supportIntro=supportServicePage.split('<section class="wrap service-first-steps"')[1]?.split("</section>")[0]||"";
const supportPaths=supportIntro.split('<nav class="support-stage-paths"')[1]?.split("</nav>")[0]||"";
assert.ok(supportPaths,"Support service must expose two WZON pathways early");
assert.equal((supportPaths.match(/<a\b/g)||[]).length,2,"WZON needs exactly two editorial guidance choices");
for(const [route,label] of [
 ["/wiedza/swiadczenie-wspierajace-dokumenty","Przygotowuję dokumenty"],
 ["/wiedza/swiadczenie-wspierajace-2026-wzon-zus#po-decyzji-wzon","Mam decyzję WZON"]
]){
 assert.ok(supportPaths.includes('href="'+route+'"')&&supportPaths.includes(label),
  "WZON pathway must use a real canonical guide: "+route);
 assert.ok(sitemap.includes("<loc>"+origin+route.split("#")[0]+"</loc>"),
  "WZON guidance must be indexable and listed in sitemap: "+route);
}
assert.ok(supportIntro.indexOf("support-stage-paths")>supportIntro.indexOf("</ol>"),
 "WZON guidance should follow the introductory three steps");
const wzDecisionGuide=await read("wiedza/swiadczenie-wspierajace-2026-wzon-zus.html");
assert.ok(wzDecisionGuide.includes('id="po-decyzji-wzon"'),
 "Decision guide deep link must target an existing section");
const wzStyles=await read("seo-answers.css");
assert.ok(wzStyles.includes(".support-stage-paths>a:focus-visible")&&
 wzStyles.includes("min-height:72px"),"WZON pathways must support keyboard and touch");
console.log("SUPPORT_EARLY_PATHS_OK: two verified WZON routes, including decision anchor.");

const searchPage=await read("szukaj.html");
assert.ok(searchPage.includes('name="robots" content="noindex,follow"')&&searchPage.includes('src="/search-core.js"'),"search release unexpected");
const urlTags=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
const expectedIndexable=await collectIndexableRoutes("v2");
assert.ok(urlTags.length>=15,"too few indexed pages");
assert.deepEqual(urlTags.map(uri=>new URL(uri).pathname).sort(),expectedIndexable,"sitemap does not match approved SEO policy");
assert.equal(new Set(urlTags).size,urlTags.length,"duplicate sitemap URLs");
console.log("PRODUCTION_CANDIDATE_OK:",urlTags.length,"indexable URLs; robots, sitemap, canonical, schemas, local portraits, search and exclusions valid. NOT DEPLOYED.");

// Only complete homepage-only selector lists may disappear from standalone CSS.
const pruneFixture='.premium-v2 .a{color:red}body.premium-v2 .x,.premium-v2 .y{color:blue}.premium-v2 .a,.premium-subpage .a{color:green}@media(max-width:600px){.premium-v2 .b{display:none}.premium-subpage .b{display:block}}@keyframes pulse{from{opacity:0}to{opacity:1}}.generic:has(.premium-v2 .a){color:black}.generic{content:"{;}";background:url("data:image/svg+xml,a,b")}';
const fixtureResult=pruneHomepageRules(pruneFixture);
assert.equal(fixtureResult.removed,3);
assert.ok(fixtureResult.css.includes('.premium-v2 .a,.premium-subpage .a{color:green}'));
assert.ok(fixtureResult.css.includes('@media(max-width:600px){.premium-subpage .b{display:block}}'));
assert.ok(fixtureResult.css.includes('@keyframes pulse{from{opacity:0}to{opacity:1}}'));
assert.ok(fixtureResult.css.includes('.generic:has(.premium-v2 .a){color:black}'));
assert.ok(fixtureResult.css.includes('.generic{content:"{;}";background:url("data:image/svg+xml,a,b")}'));
const standalonePremium=await read("premium-v2.css");
assert.ok(homeBundle.includes(".premium-v2 .hero-glamour")&&homeBundle.includes(".premium-v2 .hero-priority-grid"));
assert.ok(standalonePremium.includes(".premium-subpage")&&standalonePremium.includes(".chat-assistant .chat-panel"));
console.log("PREMIUM_SUBPAGE_CSS_BYTES "+Buffer.byteLength(standalonePremium));

// Keep original local photographs and preview graphics cacheable without immutable claims.
for(const name of ["wojciech-obieglo.jpg","paulina-chandrala.jpg","og-broszura-szkody-gornicze.jpg","og-broszura-swiadczenie-wspierajace.jpg","og-broszura-renty-powypadkowe.jpg","og-broszura-skd.jpg","og-broszura-kredyty-frankowe.jpg","og-broszura-sluzebnosc-przesylu.jpg"]){
 assert.ok(headers.includes("/assets/"+name+"\n  Cache-Control: public, max-age=86400"),"Missing one-day cache policy: "+name);
}
assert.ok(!homeBundle.includes("images.unsplash.com"),"No optional remote decorative photography in homepage CSS");
assert.ok(!(await read("premium-v2.css")).includes("images.unsplash.com"),"No optional remote decorative photography on service pages");
console.log("LOCAL_MEDIA_CACHE_OK: eight existing photographs and brochure preview assets keep their original files with one-day cache policy.");


// Legacy shared brochure URLs must resolve to the canonical production planner.
const brochureRedirects=await read("_redirects");
for(const route of ["/v2/plan-dzialania.html","/v2/plan-dzialania","/v2/plan-dzialania/","/broszury","/broszury/","/broszury-graficzne"]){
 assert.ok(brochureRedirects.split(/\r?\n/).includes(route+" /plan-dzialania 301"),"Missing legacy brochure redirect: "+route);
}
const brochurePlanner=await read("plan-dzialania.html");
assert.ok(brochurePlanner.includes('id="brochure-library-heading"'));
for(const slug of ["szkody-gornicze","swiadczenie-wspierajace","renty-powypadkowe","skd","kredyty-frankowe","sluzebnosc-przesylu"]){
 assert.ok(brochurePlanner.includes('?broszura='+slug+'#broszura'),"Missing brochure: "+slug);
}
assert.ok((await read("404.html")).includes('href="/plan-dzialania#brochure-library-heading"'),"Missing 404 brochure recovery");
console.log("BROCHURE_ROUTES_OK: six brochure topics, legacy redirects and recovery link.");


// Release-wide accessibility and route recovery: assert actual generated files,
// not just the existence of a new source stylesheet or a theoretical test count.
const releaseNavigationPages=[...PAGE_PATHS,"kampanie/renty-powypadkowe.html"];
const releaseRedirectRules=(await read("_redirects")).split(/\r?\n/);
const expectedLegacyRules=legacyPageRedirects(releaseNavigationPages);
const redirectSources=new Set();
for(const rule of expectedLegacyRules){
 assert.ok(releaseRedirectRules.includes(rule),"Missing legacy page recovery: "+rule);
 const [source,destination]=rule.split(" ");
 assert.ok(!redirectSources.has(source),"Duplicate legacy source: "+source);
 redirectSources.add(source);
 assert.ok(!destination.startsWith("/v2"),"Legacy redirect would loop: "+rule);
}
for(const path of releaseNavigationPages){
 const html=await read(path);
 const main=html.match(/<main\b[^>]*>/i)?.[0]||"";
 assert.match(main,/\btabindex="-1"/,"Keyboard skip focus target missing: "+path);
 const repeated=enhanceKeyboardNavigation(html,path);
 assert.equal(repeated.changes.length,0,"Final navigation pass must be idempotent: "+path);
 assert.equal(repeated.html,html,"Final HTML still requires navigation reconciliation: "+path);
}
console.log("SITEWIDE_NAVIGATION_OK",JSON.stringify({pages:releaseNavigationPages.length,legacyRules:expectedLegacyRules.length}));


// Campaign journeys should retain one visible lead form while allowing a safe
// secondary reading path. Navigation always targets existing same-page IDs.
for(const [campaign,service,person,resource] of [
 ["szkody-gornicze","Szkody górnicze","Wojciech Obiegło","szkody-gornicze"],
 ["swiadczenie-wspierajace","Świadczenie wspierające","Paulina Chandrała","swiadczenie-wspierajace"],
 ["skd","Kredyt w PLN / SKD","Wojciech Obiegło","skd"],
 ["renty-powypadkowe","Renty powypadkowe","Paulina Chandrała","renty-powypadkowe"]
]){
 const html=await read("kampanie/"+campaign+".html");
 const nav=html.match(/<nav class="campaign-reader-path wrap"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
 assert.ok(nav,"Missing compact campaign navigation: "+campaign);
 const anchors=[...nav.matchAll(/href="#([^"]+)"/g)].map(m=>m[1]);
 assert.equal(anchors.length,3,"Exactly three secondary reading links required: "+campaign);
 for(const id of anchors)assert.ok(html.includes('id="'+id+'"'),"Missing reading destination: "+campaign+" #"+id);
 assert.equal((html.match(/data-contact-form/g)||[]).length,1,"Campaign gained multiple lead forms: "+campaign);
 assert.ok(html.includes('data-service="'+service+'"'),"Campaign service changed: "+campaign);
 assert.ok(html.includes("Osoba do kontaktu: "+person),"Campaign adviser changed: "+campaign);
 assert.ok(html.includes('href="/plan-dzialania?broszura='+resource+'#broszura"'),
  "Missing direct printable brochure: "+campaign);
 assert.ok(html.includes('href="/faq?temat='+(campaign==="szkody-gornicze"?"szkody":campaign==="swiadczenie-wspierajace"?"swiadczenie":campaign==="renty-powypadkowe"?"renty":"skd")+'#faq-hub-title"'),
  "Missing topic FAQ: "+campaign);
}
console.log("CAMPAIGN_READING_PATHS_OK: four landings, 12 validated reading anchors, four brochures and unchanged advisers.");


const campaignVisualCSS=await read("lead-persona.css");
for(const asset of ["project-mining.svg","project-support.svg","project-rents.svg","project-credit.svg"])
 assert.ok(campaignVisualCSS.includes("/assets/"+asset),"Campaign visual motif missing from production style: "+asset);
for(const selector of [".premium-campaign .campaign-reader-path",".premium-campaign .campaign-copy h1",
 ".premium-campaign .campaign-steps article",".premium-campaign .campaign-form .contact-form"])
 assert.ok(campaignVisualCSS.includes(selector),"Missing campaign visual identity rule: "+selector);
console.log("CAMPAIGN_VISUAL_IDENTITY_OK: all four categories use local art and consistent reading/lead styles.");


// Mobile performance regression: do not force a full hero image download on
// small screens where the mobile service shortcuts replace the large visual.
const heroPreload=home.match(/<link rel="preload" as="image"[^>]*>/)?.[0]||"";
assert.ok(heroPreload.includes('media="(min-width: 961px)"')&&heroPreload.includes('fetchpriority="high"'),
 "The hero preloader must respect narrow screens while retaining desktop priority");
const heroImage=home.match(/<img class="hero-metallic-art"[^>]*>/)?.[0]||"";
assert.ok(heroImage.includes('loading="lazy"')&&heroImage.includes('width="1536"')&&heroImage.includes('height="803"'),
 "Keep the original hero art and its aspect ratio without unconditional eager loading");
for(const filename of ["logo_VOTUM_SA_rgb-480x71.png","logo-votum-network-przedstawiciel-400x284-1.jpg","votum-scale-agency-.png"]){
 const tag=[...home.matchAll(/<img\b[^>]*>/g)].map(x=>x[0]).find(x=>x.includes(filename)&&x.includes('loading="lazy"')&&x.includes('fetchpriority="low"'));
 assert.ok(tag,"A secondary homepage logo still competes with the main image: "+filename);
}
const homepageMobileCSS=await read("home-bundle.css");
assert.ok(homepageMobileCSS.includes('max-height:70dvh')&&homepageMobileCSS.includes('orientation:landscape'),
 "Responsive menu and landscape contact safety must reach the homepage release");
const campaignMobileCSS=await read("lead-persona.css");
assert.ok(campaignMobileCSS.includes('CAMPAIGN-MOBILE-STABILITY-20261122')===false&&campaignMobileCSS.includes('campaign-mobile-actions{display:none!important}'),
 "Campaign mobile form safety missing from production CSS");
console.log("MOBILE_LOADING_GUARDS_OK: desktop hero retained, narrow-screen preload gated, three secondary logos deferred.");

/* Form-rendering checks from measured Lighthouse findings (2026-11-22):
   campaign forms are built before first paint; the default preparation
   link is a crawlable URL even while the topic picker is unset. */
const measuredContactScript=await read("contact.js");
assert.ok(measuredContactScript.includes('document.body.classList.contains("campaign-page")?"h2":"h3"'),
 "Campaign form must use a sequential h2, preserving h3 on other pages");
assert.ok(/guideLink\.href="\/(?:v2\/)?plan-dzialania(?:\.html)?"/.test(measuredContactScript),
 "Default guide anchor must have a valid href before topic selection");
for(const slug of ["szkody-gornicze","swiadczenie-wspierajace","skd","renty-powypadkowe"]){
 const markup=await read("kampanie/"+slug+".html");
 assert.ok(/<script\b[^>]*src="\/contact\.js"[^>]*><\/script>/.test(markup),
  "Campaign must build the form at parse end before first paint: "+slug);
 assert.ok(!/<script\b[^>]*src="\/contact\.js"[^>]*\bdefer\b/.test(markup),
  "Campaign form should not shift after initial paint: "+slug);
}
console.log("MEASURED_LIGHTHOUSE_FIXES_OK: native href, semantic form heading, parse-end campaign forms");

// Confirmed callback information is public and never adds lead PII to the URL.
assert.ok(measuredContactScript.includes("const preparation=guidePaths[select.value]")&&
 measuredContactScript.includes('next.className="contact-success-preparation"')&&
 measuredContactScript.includes("checklist.href=preparation[0]")&&
 measuredContactScript.includes('checklist.rel="noopener noreferrer"'),
 "Successful submissions need a safe service-specific preparation route");
const confirmedStyles=await read("styles.css");
assert.ok(confirmedStyles.includes(".contact-success-preparation a:focus-visible"),
 "Preparation link must have focus visibility");
console.log("CONTACT_CONFIRMATION_GUIDE_OK: public checklist only after success.");
