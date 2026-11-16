#!/usr/bin/env node
/** Structured BreadcrumbList must match actual visible breadcrumbs on 47 built pages. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {PAGE_PATHS,NO_BREADCRUMBS} from "./page-navigation.mjs";
const origin="https://twoja-sprawa.pages.dev";
const decode=s=>s.replaceAll("&amp;","&").replaceAll("&quot;",'"').replaceAll("&lt;","<").replaceAll("&gt;",">").trim();
let matched=0,omitted=0;
for(const path of PAGE_PATHS){
 const html=await readFile("dist/"+path,"utf8");
 const nav=html.match(/<nav class="site-breadcrumbs" aria-label="Ścieżka nawigacji">([\s\S]*?)<\/nav>/)?.[1]||"";
 const scripts=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(m=>JSON.parse(m[1]));
 const graph=scripts.flatMap(s=>s["@graph"]||[]);
 const crumbs=graph.filter(x=>x["@type"]==="BreadcrumbList");
 const page=graph.find(x=>typeof x["@type"]==="string"&&x["@id"]?.endsWith("#webpage"));
 if(NO_BREADCRUMBS.includes(path)){
  assert.equal(nav,"","Focused landing page should not display breadcrumbs: "+path);
  assert.equal(crumbs.length,0,"No JSON-LD breadcrumbs should be invented for "+path);
  omitted++;continue;
 }
 assert.ok(nav,"Missing visible breadcrumb navigation: "+path);
 assert.equal(crumbs.length,1,"Exactly one BreadcrumbList needed: "+path);
 const links=[...nav.matchAll(/<a href="([^"]+)">([^<]+)<\/a>/g)].map(m=>({name:decode(m[2]),item:new URL(m[1],origin).href}));
 const current=nav.match(/<span aria-current="page">([^<]+)<\/span>/);
 assert.ok(current,"Breadcrumb must identify the current page: "+path);
 const canonical=html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
 assert.ok(canonical?.startsWith(origin),"Canonical URL missing: "+path);
 const expected=[...links,{name:decode(current[1]),item:canonical}];
 const actual=crumbs[0].itemListElement;
 assert.equal(actual.length,expected.length,"Structured and visible hierarchy differs on "+path);
 for(const [idx,element] of actual.entries()){
  assert.equal(element["@type"],"ListItem");
  assert.equal(element.position,idx+1);
  assert.equal(element.name,expected[idx].name,"Breadcrumb title mismatch at "+path);
  assert.equal(element.item,expected[idx].item,"Breadcrumb link mismatch at "+path);
 }
 assert.equal(page?.breadcrumb?.["@id"],crumbs[0]["@id"],"Page must reference own breadcrumb graph: "+path);
 matched++;
}
assert.equal(matched,40);
assert.equal(omitted,7);
console.log("VISIBLE_BREADCRUMB_SCHEMA_OK",JSON.stringify({aligned:matched,excluded:omitted,serviceHierarchyVerified:true}));
