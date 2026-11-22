#!/usr/bin/env node
/** Read-only smoke test for a local production candidate. Does NOT deploy. */
import assert from "node:assert/strict";
import {readFile,stat,readdir} from "node:fs/promises";
import {collectIndexableRoutes} from "./indexnow-routes.mjs";
import {feedArticlePaths} from "./verified-articles-feed.mjs";
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
assert.ok(sourceBytes-bundleBytes>12000,
 "Production homepage CSS should omit at least 12 KB of non-runtime author comments");
assert.ok(bundleBytes<285000,
 "Production homepage CSS should remain under its verified 285 KB decoded budget");
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

// Every shared URL should have a specific title, accessible same-origin photo,
// and a description sourced from its own page rather than a generic homepage.
for(const [page,photo] of [
  ["index.html","wojciech-obieglo.jpg"],
  ["uslugi/swiadczenie-wspierajace.html","paulina-chandrala.jpg"],
  ["uslugi/szkody-gornicze.html","wojciech-obieglo.jpg"],
  ["uslugi/renty-powypadkowe.html","paulina-chandrala.jpg"],
  ["uslugi/kredyty-frankowe.html","wojciech-obieglo.jpg"]
]){
  const html=await read(page);
  const title=html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description=html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  assert.ok(title&&description,"missing social metadata source: "+page);
  assert.ok(html.includes('<meta property="og:title" content="'+title+'">'),"social title not page-specific: "+page);
  assert.ok(html.includes('<meta name="twitter:title" content="'+title+'">'),"Twitter title not page-specific: "+page);
  assert.ok(html.includes('<meta property="og:description" content="'+description+'">'),"social description not page-specific: "+page);
  const socialPreview=["index.html","uslugi/szkody-gornicze.html","uslugi/swiadczenie-wspierajace.html","uslugi/renty-powypadkowe.html","uslugi/kredyty-frankowe.html"].includes(page)
    ? "og-twoja-sprawa-metallic-v1.jpg" : photo;
  assert.ok(html.includes('<meta property="og:image" content="'+origin+'/assets/'+socialPreview+'">'),"social preview incorrect: "+page);
  assert.ok(html.includes('<meta name="twitter:image" content="'+origin+'/assets/'+socialPreview+'">'),"Twitter preview incorrect: "+page);
  assert.ok(html.includes('<meta property="og:image:alt" content="'),"missing accessible preview label: "+page);
}


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
 "/kampanie/szkody-gornicze","/kampanie/swiadczenie-wspierajace",
 "/kampanie/skd","/uslugi/renty-powypadkowe",
 "/uslugi/kredyty-frankowe","/uslugi/sluzebnosc-przesylu"
]){
 assert.ok(searchHtml.includes('href="'+href+'"'),
  "Missing safe direct link in fallback search: "+href);
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
assert.ok(mobileFourNav.includes("kampanie/renty-powypadkowe"),"Rents button must lead to the verified campaign landing");
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
// Local mining SEO should describe the actual regional focus rather than all Poland.
for(const [file,area] of [
 ["uslugi/szkody-gornicze.html","Lubin, Polkowice i okolice"],
 ["lokalnie/szkody-gornicze-lubin.html","Lubin i okolice"],
 ["lokalnie/szkody-gornicze-polkowice.html","Polkowice i okolice"],
 ["uslugi/swiadczenie-wspierajace.html","Polska"]
]){
 const html=await read(file);
 const graphs=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
   .flatMap(([,raw])=>JSON.parse(raw)["@graph"]||[]);
 const service=graphs.find(item=>item["@type"]==="Service");
 assert.ok(service,"Missing Service schema: "+file);
 assert.equal(service.areaServed,area,"Inaccurate SEO service area: "+file);
}
const miningPage=await read("uslugi/szkody-gornicze.html");
assert.ok(!miningPage.includes('"@type":"FAQPage"'),"FAQ schema should not be duplicated on other routes");

const searchPage=await read("szukaj.html");
assert.ok(searchPage.includes('name="robots" content="noindex,follow"')&&searchPage.includes('src="/search-core.js"'),"search release unexpected");
const urlTags=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
const expectedIndexable=await collectIndexableRoutes("v2");
assert.ok(urlTags.length>=15,"too few indexed pages");
assert.deepEqual(urlTags.map(uri=>new URL(uri).pathname).sort(),expectedIndexable,"sitemap does not match approved SEO policy");
assert.equal(new Set(urlTags).size,urlTags.length,"duplicate sitemap URLs");
console.log("PRODUCTION_CANDIDATE_OK:",urlTags.length,"indexable URLs; robots, sitemap, canonical, schemas, local portraits, search and exclusions valid. NOT DEPLOYED.");
