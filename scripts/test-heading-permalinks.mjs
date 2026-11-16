#!/usr/bin/env node
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {PAGE_PATHS} from "./page-navigation.mjs";
import {enhancePageNavigation} from "./page-navigation.mjs";
import {improveMediaAndNavigation} from "./media-navigation-quality.mjs";
import {improveContentLinks} from "./content-anchors.mjs";
import {addSectionPermalinks} from "./heading-permalinks.mjs";

const entries=[];
for(const path of PAGE_PATHS){
 const source=await readFile("v2/"+path,"utf8");
 let html=enhancePageNavigation(source,path).html;
 html=improveMediaAndNavigation(html,path).html;
 html=improveContentLinks(html,path).html;
 const result=addSectionPermalinks(html,path);
 const second=addSectionPermalinks(result.html,path);
 assert.equal(second.html,result.html,"Repeat build may not add duplicate permalink: "+path);
 assert.equal(second.changes.length,0,"Repeat build must make no changes: "+path);
 assert.equal((source.match(/<h[1-6]\b/gi)||[]).length,(result.html.match(/<h[1-6]\b/gi)||[]).length,"Heading inventory drift: "+path);
 const links=[...result.html.matchAll(/<a class="heading-permalink" href="#([^"]+)" aria-label="([^"]+)"><\/a>/g)];
 assert.equal(links.length,result.changes.length,"Every change should create exactly one permalink: "+path);
 for(const [i,match] of links.entries()){
  const id=match[1];
  assert.ok(result.html.includes('id="'+id+'"'),"Broken section target: "+path+" #"+id);
  assert.ok(match[2].startsWith("Bezpośredni link do sekcji: "),"Accessible link name is missing: "+path);
  assert.ok(result.changes[i].detail.includes("#"+id),"Change log does not identify affected heading: "+path);
  entries.push({path,kind:"heading-permalink",target:id,position:i+1});
 }
 if(links.length)assert.ok(result.html.includes('href="/v2/heading-permalinks.css"'),"CSS missing: "+path);
 else assert.ok(!result.html.includes('href="/v2/heading-permalinks.css"'),"Unnecessary CSS on page: "+path);
}
const css=await readFile("v2/heading-permalinks.css","utf8");
assert.ok(css.includes("width:44px;height:44px"),"Share link target must meet touch-size requirements");
assert.ok(css.includes(".heading-permalink:focus-visible"),"Share link must have visible keyboard focus");
assert.ok(css.includes("@media print"),"Share controls should not print");
assert.ok(entries.length>=150,"Sitewide headings should have at least 150 useful shareable links");
assert.equal(new Set(entries.map(i=>i.path+"|"+i.target)).size,entries.length,"Heading permalink targets must be unique by page");
console.log("HEADING_PERMALINKS_OK",JSON.stringify({pages:PAGE_PATHS.length,total:entries.length,untouchedHomepage:true,keyboard:true,mobile:true}));
if(process.argv.includes("--manifest"))for(const [i,e] of entries.entries())console.log("HEADING_PERMALINK",i+1,JSON.stringify(e));
