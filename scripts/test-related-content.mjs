#!/usr/bin/env node
/** Release gate: every suggested next page must be published, approved and useful. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {PAGE_PATHS,enhancePageNavigation} from "./page-navigation.mjs";
import {shouldIndexRoute} from "./seo-policy.mjs";
import {improveContentLinks} from "./content-anchors.mjs";
import {appendRelatedContent,RELATED_GROUPS,RELATED_REFS} from "./related-content.mjs";

const all=new Set(PAGE_PATHS), links=[], panels=[];
assert.equal(new Set(Object.keys(RELATED_GROUPS)).size,Object.keys(RELATED_GROUPS).length);
for(const [group,targets] of Object.entries(RELATED_REFS)){
 assert.ok(targets.length>=3,group+" lacks meaningful choice of further reading");
 assert.equal(new Set(targets).size,targets.length,"Duplicate curated item in "+group);
 for(const dest of targets){
  assert.ok(all.has(dest),"Unknown related content: "+dest);
  assert.equal(shouldIndexRoute("/"+dest),true,"Do not promote a draft or noindex page: "+dest);
 }
}
for(const path of PAGE_PATHS){
 const original=await readFile("v2/"+path,"utf8");
 const labelled=enhancePageNavigation(original,path).html;
 const prepared=improveContentLinks(labelled,path).html;
 const result=appendRelatedContent(prepared,path),html=result.html;
 const repeat=appendRelatedContent(html,path);
 assert.equal(repeat.html,html,"Must not duplicate related links during rebuild: "+path);
 assert.equal(repeat.changes.length,0,"Idempotency should report zero changes: "+path);
 const isEditorial=Object.hasOwn(RELATED_GROUPS,path);
 assert.equal(result.changes.length>0,isEditorial,"Unexpected panel presence: "+path);
 if(!isEditorial){
  assert.ok(!html.includes('class="related-content-links"'),"Added unrelated links on "+path);
  continue;
 }
 assert.equal((html.match(/class="related-content-links"/g)||[]).length,1,"Duplicate section: "+path);
 assert.ok(html.includes('href="/v2/related-content.css"'),"Missing related-content CSS: "+path);
 assert.ok(html.includes('aria-label="Powiązane zatwierdzone materiały"'),"Related resources lack a label: "+path);
 assert.ok(html.indexOf('class="related-content-links"')>html.indexOf("<main"),"Panel must be within main");
 assert.ok(html.indexOf('class="related-content-links"')<html.indexOf("</main>"),"Panel escaped main");
 const block=html.split('<aside class="related-content-links"')[1].split("</aside>")[0];
 const targets=[...block.matchAll(/<a href="\/v2\/([^"]+)">/g)].map(m=>m[1]);
 assert.ok(targets.length>=2&&targets.length<=4,"Avoid excessive related links: "+path);
 assert.equal(new Set(targets).size,targets.length,"Repeated destination: "+path);
 assert.ok(!targets.includes(path),"A page cannot recommend itself: "+path);
 for(const dest of targets){
  assert.ok(all.has(dest),"Broken related page: "+path+" -> "+dest);
  assert.ok(shouldIndexRoute("/"+dest),"Noindex guide promoted: "+path+" -> "+dest);
  links.push({from:path,to:dest});
 }
 assert.ok(!block.includes('href="https://'),"Related links must be safe same-origin references");
 assert.equal((html.match(/<h1\b/g)||[]).length,(original.match(/<h1\b/g)||[]).length,"H1 changed: "+path);
 assert.equal((html.match(/data-contact-form/g)||[]).length,(original.match(/data-contact-form/g)||[]).length,"Lead forms changed: "+path);
 panels.push(path);
}
const css=await readFile("v2/related-content.css","utf8");
for(const token of ['grid-template-columns:repeat(2','@media(max-width:680px)',':focus-visible','min-height:48px','@media print'])
 assert.ok(css.includes(token),"Related links need responsive, touch and focus styles: "+token);
assert.ok(panels.length>=25,"Too few actionable related-content panels");
assert.ok(links.length>=60,"Too few genuine related internal links");
console.log("RELATED_CONTENT_RESULT "+JSON.stringify({panels:panels.length,links:links.length,approvedDestinations:[...new Set(links.map(x=>x.to))].length,zeroUnreviewedTargets:true}));
if(process.argv.includes("--manifest"))for(const [i,link] of links.entries())
 console.log("RELATED_LINK",i+1,link.from,"->",link.to);
