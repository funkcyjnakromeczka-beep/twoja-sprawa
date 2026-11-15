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
 const links=[...region.matchAll(/<a href="([^"]+)" target="_blank" rel="noopener noreferrer" aria-label="([^"]+)">/g)];
 assert.deepEqual(links.map(x=>x[1]),expected,"Wrong social destination on "+path);
 for(const m of links){
  assert.ok(m[2].includes("nowej karcie"),"External link must indicate opening a new tab on "+path);
  assert.ok(m[1].startsWith("https://"),"Social destination must be HTTPS");
  assert.ok(!m[1].includes("?"),"Keep social links free of campaign/tracking query strings");
 }
 for(const url of allUrls.filter(x=>!expected.includes(x))){
  assert.ok(!region.includes(url),"Unrelated social account appears in "+path);
 }
 assert.ok(!region.includes("<iframe")&&!region.includes("<script"),"Social section must not embed third-party scripts");
 if(path==="v2/index.html"){
  assert.ok(html.indexOf(region)>html.indexOf("<footer>"),"Home group link should be in footer, not clutter the hero or forms");
 }else{
  assert.ok(html.indexOf(region)<html.indexOf("</main>"),"Social navigation should be in main content");
 }
}
const css=await readFile("v2/premium-v2.css","utf8");
const baseCss=await readFile("v2/styles.css","utf8");
assert.ok(!baseCss.includes("SOCIAL_COMMUNITY_CHANNELS_20261115"),"Keep social styling out of performance-critical base CSS");
for(const token of ["SOCIAL_COMMUNITY_CHANNELS_20261115",".social-community-links a:focus-visible","@media(max-width:750px)"]){
 assert.ok(css.includes(token),"Missing mobile/accessibility social UI: "+token);
}
console.log("SOCIAL_CHANNELS_OK: 8 page placements, five approved destinations, correct topics, accessible external links and no tracking.");
