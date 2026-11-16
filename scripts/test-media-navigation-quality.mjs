#!/usr/bin/env node
/** 100+ second-wave source improvements, disjoint from prior 100 breadcrumb/skip/main items. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {PAGE_PATHS} from "./page-navigation.mjs";
import {improveMediaAndNavigation} from "./media-navigation-quality.mjs";

const results=[];
const kindTotals={};
for(const p of PAGE_PATHS){
 const source=await readFile("v2/"+p,"utf8");
 const one=improveMediaAndNavigation(source,p);
 const two=improveMediaAndNavigation(one.html,p);
 assert.equal(two.html,one.html,"Enhancement must be idempotent on "+p);
 assert.equal(two.changes.length,0,"Second pass must make zero changes on "+p);
 assert.equal((one.html.match(/<img\b/gi)||[]).length,(source.match(/<img\b/gi)||[]).length,
  "Enhancement must not remove any image: "+p);
 assert.equal((one.html.match(/<nav\b/gi)||[]).length,(source.match(/<nav\b/gi)||[]).length,
  "Enhancement must not remove any navigation landmark: "+p);
 assert.equal((one.html.match(/<h1\b/gi)||[]).length,(source.match(/<h1\b/gi)||[]).length,
  "Enhancement must not change headings: "+p);
 const imageTags=[...one.html.matchAll(/<img\b[^>]*>/gi)].map(m=>m[0]);
 for(const tag of imageTags){
  assert.match(tag,/\bdecoding="async"/i,"Image missing async decoder: "+p);
  const src=tag.match(/\bsrc="([^"]+)"/i)?.[1]||"";
  const isThirdParty=/^https?:\/\//i.test(src)&&!src.includes("twoja-sprawa.pages.dev");
  if(isThirdParty)assert.match(tag,/\breferrerpolicy="no-referrer"/i,
   "Third-party logo image must avoid disclosing the originating site: "+p);
  if(tag.includes('class="social-brand-icon"')){
   assert.match(tag,/\bloading="lazy"/i,"Small social icon should load lazily: "+p);
   assert.match(tag,/\bfetchpriority="low"/i,"Small social icon must not compete with headline images: "+p);
  }
 }
 for(const nav of one.html.matchAll(/<nav\b[^>]*>/gi)){
  assert.match(nav[0],/\baria-label(?:ledby)?="/i,"Unnamed navigation landmark: "+p);
 }
 for(const change of one.changes){
  assert.ok(["external-image-privacy","nonblocking-image-decoding","lazy-social-icon",
   "low-priority-social-icon","named-navigation-landmark"].includes(change.kind),
   "Unexpected improvement type: "+change.kind);
  assert.ok(change.detail,"Each improvement must identify its original element");
  results.push({page:p,...change});
  kindTotals[change.kind]=(kindTotals[change.kind]||0)+1;
 }
}
const identifiers=results.map(x=>[x.page,x.kind,x.detail].join("|"));
assert.equal(new Set(identifiers).size,results.length,"Every improvement must uniquely identify an element");
assert.equal(PAGE_PATHS.length,47,"Site inventory changed");
assert.ok((kindTotals["external-image-privacy"]||0)>=55,
 "Audit expects at least 55 third-party image privacy fixes");
assert.ok((kindTotals["nonblocking-image-decoding"]||0)>=8,
 "Audit expects missing nonblocking image decode attributes");
assert.ok((kindTotals["named-navigation-landmark"]||0)>=10,
 "Audit expects missing screen-reader labels in primary nav");
assert.ok((kindTotals["lazy-social-icon"]||0)>=8,
 "Audit expects low-value decorative icons not yet lazy-loaded");
assert.ok((kindTotals["low-priority-social-icon"]||0)>=8,
 "Audit expects decorated social icons missing priority hints");
assert.ok(results.length>=100,"At least 100 individually addressable second-round improvements required");
console.log("IMPROVEMENTS_SECOND_ROUND_OK",JSON.stringify({pages:PAGE_PATHS.length,total:results.length,kindTotals}));
for(const [kind,count] of Object.entries(kindTotals))console.log("IMPROVEMENTS_KIND "+kind+" "+count);
if(process.argv.includes("--manifest"))for(const [i,item] of results.entries())
 console.log("IMPROVEMENT",i+1,JSON.stringify(item));
