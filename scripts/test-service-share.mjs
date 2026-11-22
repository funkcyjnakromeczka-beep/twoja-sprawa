#!/usr/bin/env node
/** Six public service referral links: static no-JS option, client-only share. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const slugs=["szkody-gornicze","swiadczenie-wspierajace","kredyty-pln",
 "renty-powypadkowe","kredyty-frankowe","sluzebnosc-przesylu"];
for(const slug of slugs){
 const html=await readFile("dist/uslugi/"+slug+".html","utf8");
 const url="https://twoja-sprawa.pages.dev/uslugi/"+slug;
 assert.equal((html.match(/class="service-share-card wrap"/g)||[]).length,1,slug);
 assert.ok(html.includes('href="'+url+'"'),slug+" no static public link");
 assert.ok(html.includes('data-share-url="'+url+'"'),slug+" no safe share target");
 assert.ok(html.includes('data-share-manual'),slug+" no manual fallback");
 assert.ok(html.includes('data-share-page'),slug+" no share enhancement");
 assert.ok(html.includes('src="/share-page.js"'),slug+" missing share behavior");
 assert.ok(html.includes("service-share.css")||/layers-[a-f0-9]{16}\.css/.test(html),slug+" CSS missing");
 assert.ok(html.indexOf('class="service-share-card wrap"')<html.indexOf('id="formularz"'),slug);
 const block=html.match(/<aside class="service-share-card wrap"[\s\S]*?<\/aside>/)?.[0]||"";
 assert.ok(block.includes('target="_blank"')&&block.includes('rel="noopener noreferrer"'),slug);
 assert.ok(!block.includes("utm_")&&!block.includes("access_key"),slug);
 assert.ok(html.includes("data-contact-form"),slug+" form missing");
}
for(const [slug,city] of [["lubin","Lubinie"],["polkowice","Polkowicach"]]){
 const html=await readFile("dist/lokalnie/szkody-gornicze-"+slug+".html","utf8");
 const url="https://twoja-sprawa.pages.dev/lokalnie/szkody-gornicze-"+slug;
 const section=html.match(/<section class="local-share local-container"[\s\S]*?<\/section>/)?.[0]||"";
 assert.equal((html.match(/class="local-share local-container"/g)||[]).length,1,"Missing or duplicate local referral: "+slug);
 assert.ok(section.includes('href="'+url+'"'),"No-JS static permalink missing: "+slug);
 assert.ok(section.includes('data-share-url="'+url+'"'),"Canonical share target missing: "+slug);
 assert.ok(section.includes('data-share-page')&&section.includes('data-share-feedback')&&section.includes('data-share-manual'),"Native share/fallback unavailable: "+slug);
 assert.ok(section.includes('hidden>Udostępnij'),"Share button must remain hidden when JavaScript is disabled: "+slug);
 assert.ok(section.includes("Nie wysyłaj")&&section.includes("danych innych osób"),"Privacy note missing: "+slug);
 assert.ok(html.includes('src="/share-page.js"'),"Share script not deployed: "+slug);
 assert.ok(html.indexOf(section)<html.indexOf('id="formularz"'),"Local sharing must appear before contact: "+slug);
 assert.ok(section.includes(city),"Correct locality label missing: "+slug);
 assert.ok(!section.includes("utm_")&&!section.includes("access_key")&&!section.includes("facebook.com"),"Private or tracked referral: "+slug);
}
// The support and accident-pension community has one current URL across
// its public service pages and the allowance campaign. Keep it separate
// from the general-purpose "Twoja Sprawa" Facebook group on the homepage.
const communityUrl="https://www.facebook.com/groups/twojasprawa.swiadczenia.renty";
for(const path of [
 "uslugi/swiadczenie-wspierajace.html",
 "uslugi/renty-powypadkowe.html",
 "kampanie/swiadczenie-wspierajace.html"
]){
 const html=await readFile("dist/"+path,"utf8");
 const section=html.match(/<section class="wrap social-community"[\s\S]*?<\/section>/)?.[0]||"";
 assert.ok(section,"Community section missing: "+path);
 assert.equal(section.split('href="'+communityUrl+'"').length-1,1,"Current community link must occur once: "+path);
 assert.ok(section.includes('target="_blank" rel="noopener noreferrer"'),"Community link must open safely: "+path);
 assert.ok(section.includes("świadczeniu wspierającym i rentach powypadkowych"),"Group description missing either core topic: "+path);
 assert.ok(section.includes("Ochrona danych"),"Community must caution against publishing personal records: "+path);
 assert.ok(!html.includes("1774654267299204"),"Outdated group link still exposed on "+path);
 assert.ok(!html.includes("Świadczenie Wspierające – Informacje i Pomoc"),"Outdated group name still exposed on "+path);
}
const homepage=await readFile("dist/index.html","utf8");
assert.ok(homepage.includes('href="https://www.facebook.com/groups/4385749378342889/"'),
 "General Twoja Sprawa community group should remain unchanged");
const homeCommunity=homepage.match(/<section class="social-community social-community-home"[\s\S]*?<\/section>/)?.[0]||"";
assert.ok(homeCommunity,"Homepage must visibly present both groups");
assert.equal((homeCommunity.match(/<a href="https:\/\/www\.facebook\.com\/groups\//g)||[]).length,2,
 "Homepage must include exactly two group links");
assert.ok(homeCommunity.includes('href="'+communityUrl+'"'),"Support and rents group link missing from homepage");
assert.ok(homeCommunity.includes("Twoja Sprawa — grupa ogólna")&&
 homeCommunity.includes("Świadczenie wspierające i renty powypadkowe"),
 "Home community links must distinguish their topics");
assert.ok(homeCommunity.includes("Ochrona danych"),"Protect privacy in home community section");

console.log("SOCIAL_COMMUNITY_LINK_OK: three current Facebook links, relevant labels, general group preserved.");

const shareJs=await readFile("v2/share-page.js","utf8");
assert.ok(shareJs.includes("szkody-gornicze-(?:lubin|polkowice)"),"Explicit allowlist missing for regional share URLs");
const localCss=await readFile("v2/local-mining.css","utf8");
assert.ok(localCss.includes(".local-share-actions")&&localCss.includes(".local-share-feedback"),"Local share responsiveness missing");
console.log("LOCAL_SHARE_OK: two canonical, privacy-safe, no-JS fallback referral panels.");
console.log("SERVICE_SHARE_TEST_OK: six distinct canonical, privacy-safe share panels and forms intact.");

assert.equal((homeCommunity.match(/<a href="https:\/\/www\.facebook\.com\/w\.bieglo\//g)||[]).length,1,"Public credit/SKD profile should also be reachable from home");
assert.equal((homeCommunity.match(/<div class="social-community-links">[\s\S]*?<\/div>/)?.[0].match(/<a href=/g)||[]).length,5,"Five distinct home social channels");
const homeShare=homepage.match(/<div class="footer-share-actions">[\s\S]*?<\/div>/)?.[0]||"";
assert.ok(homeShare.includes('data-share-url="https://twoja-sprawa.pages.dev/" hidden'));
assert.ok(homeShare.includes('href="https://twoja-sprawa.pages.dev/"'));
console.log("HOME_SOCIAL_DIRECTORY_OK: five topic-oriented destinations, canonical share target, static fallback.");
