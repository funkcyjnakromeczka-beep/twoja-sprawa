#!/usr/bin/env node
/** Verify approved Facebook and TikTok links on all relevant pages.
 *  Read-only check: no external network calls, tracking or real social actions. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const facebookMining="https://www.facebook.com/szkodygornicze.pomoc/";
const tiktokMining="https://www.tiktok.com/@w.o.votum";
const facebookGroup="https://www.facebook.com/groups/4385749378342889/";
const supportGroup="https://www.facebook.com/groups/1774654267299204/";
const skdProfile="https://www.facebook.com/w.bieglo/";
const cases=[
 ["v2/index.html",[facebookGroup],"social-home-community"],
 ["v2/uslugi/szkody-gornicze.html",[tiktokMining,facebookMining],"social-szkody"],
 ["v2/kampanie/szkody-gornicze.html",[tiktokMining,facebookMining],"social-szkody"],
 ["v2/uslugi/swiadczenie-wspierajace.html",[supportGroup],"social-swiadczenie"],
 ["v2/kampanie/swiadczenie-wspierajace.html",[supportGroup],"social-swiadczenie"],
 ["v2/uslugi/renty-powypadkowe.html",[supportGroup],"social-renty"],
 ["v2/uslugi/kredyty-pln.html",[skdProfile],"social-skd"],
 ["v2/kampanie/skd.html",[skdProfile],"social-skd"]
];
const allUrls=[facebookMining,tiktokMining,facebookGroup,supportGroup,skdProfile];
for(const [path,expected,id] of cases){
 const html=await readFile(path,"utf8");
 const region=html.match(/<section class="[^"]*social-community[^"]*" aria-labelledby="([^"]+)">[\s\S]*?<\/section>/)?.[0];
 assert.ok(region,"Social community section missing on "+path);
 assert.ok(region.includes('<h2 id="'+id+'">'),"Social section needs an accessible heading on "+path);
 assert.ok(region.includes('aria-labelledby="'+id+'"'),"Social section label missing on "+path);
 const links=[...region.matchAll(/<a href="([^"]+)" target="_blank" rel="noopener noreferrer">([\s\S]*?)<\/a>/g)];
 assert.deepEqual(links.map(x=>x[1]),expected,"Wrong social destination on "+path);
 for(const m of links){
  assert.ok(m[2].includes('class="social-community-sr"')&&m[2].includes("otworzy się w nowej karcie"),
   "Accessible name must contain visible text and announce new tab on "+path);
  assert.ok(!m[0].includes("aria-label="),"Do not override the visible label; WCAG 2.5.3 on "+path);
  assert.ok(m[1].startsWith("https://"),"Social destination must be HTTPS");
  assert.ok(!m[1].includes("?"),"Keep social links free of campaign/tracking query strings");
 }
 for(const url of allUrls.filter(x=>!expected.includes(x))){
  assert.ok(!region.includes(url),"Unrelated social account appears in "+path);
 }
 assert.ok(!region.includes("<iframe")&&!region.includes("<script"),"Social section must not embed third-party scripts");
 // Never direct visitors to post confidential case details in social comments.
 const privacy=region.match(/<p class="social-community-privacy">([\s\S]*?)<\/p>/)?.[1]||"";
 assert.ok(privacy.includes("Ochrona danych:"),"Missing public-comment privacy guidance on "+path);
 const form=path==="v2/index.html"?"#kontakt":"#formularz";
 assert.ok(privacy.includes('href="'+form+'"'),"Privacy notice must lead to the page's existing contact form: "+path);
 assert.ok(html.includes('id="'+form.slice(1)+'"'),"Privacy note points to a missing contact section on "+path);
 assert.ok(!privacy.includes("facebook.com")&&!privacy.includes("tiktok.com"),"Privacy link must stay on-site, not take visitors back to social networks");
 if(path.includes("swiadczenie"))assert.ok(privacy.includes("PESEL")&&privacy.includes("WZON"),"Support group must warn against sharing sensitive decision data");
 if(path.includes("renty"))assert.ok(privacy.includes("dokumentacji medycznej"),"Rents must warn about medical documents");
 if(path.includes("kredyty-pln")||path.includes("kampanie/skd"))assert.ok(privacy.includes("umowy kredytowej"),"SKD must warn against posting loan documents");
 if(path==="v2/index.html"){
  assert.ok(html.indexOf(region)>html.indexOf("<footer>"),"Home group link should be in footer, not clutter the hero or forms");
 }else{
  assert.ok(html.indexOf(region)<html.indexOf("</main>"),"Social navigation should be in main content");
 }
}
const css=await readFile("v2/premium-v2.css","utf8");
const baseCss=await readFile("v2/styles.css","utf8");
assert.ok(!baseCss.includes("SOCIAL_COMMUNITY_CHANNELS_20261115"),"Keep social styling out of performance-critical base CSS");
for(const token of ["SOCIAL_COMMUNITY_CHANNELS_20261115",".social-community-links a:focus-visible",".social-community-privacy a:focus-visible",".social-community .social-community-sr","@media(max-width:750px)"]){
 assert.ok(css.includes(token),"Missing mobile/accessibility social UI: "+token);
}
console.log("SOCIAL_CHANNELS_OK: 8 page placements, five destinations, accessible external links, private on-site hand-off, data safety and no tracking.");
