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
 // Count every JSON-LD block, not just the generated @graph. Legacy standalone
 // BreadcrumbList documents previously slipped through this regression test.
 const allSchemaNodes=scripts.flatMap(data=>Array.isArray(data["@graph"])?data["@graph"]:[data]);
 const crumbs=allSchemaNodes.filter(x=>x?.["@type"]==="BreadcrumbList");
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
  assert.ok(element.item.startsWith(origin+"/"),"Breadcrumb item must use the public origin: "+path);
  assert.ok(!new URL(element.item).pathname.includes("/v2/"),"Legacy /v2/ schema link found: "+path);
  assert.ok(!new URL(element.item).pathname.endsWith(".html"),"Breadcrumb points to noncanonical HTML route: "+path);
 }
 assert.equal(page?.breadcrumb?.["@id"],crumbs[0]["@id"],"Page must reference own breadcrumb graph: "+path);
 matched++;
}
assert.equal(matched,40);
assert.equal(omitted,7);
// Local mining pages used to ship one authored BreadcrumbList in addition to
// the visible-breadcrumb-derived release schema. Keep source editorially clean.
for(const slug of ["szkody-gornicze-lubin","szkody-gornicze-polkowice"]){
 const path="lokalnie/"+slug+".html";
 const raw=await readFile("v2/"+path,"utf8");
 const canonical=origin+"/lokalnie/"+slug;
 assert.ok(!raw.includes('"@type":"BreadcrumbList"'),"Duplicate source breadcrumb in "+path);
 assert.ok(raw.includes('<link rel="canonical" href="'+canonical+'">'),"Source canonical not cleaned: "+path);
 assert.ok(raw.includes('<meta property="og:url" content="'+canonical+'">'),"Source OG URL not cleaned: "+path);
 const output=await readFile("dist/"+path,"utf8");
 assert.equal((output.match(/"@type":"BreadcrumbList"/g)||[]).length,1,
  "Local route must expose exactly one BreadcrumbList: "+path);
}
console.log("VISIBLE_BREADCRUMB_SCHEMA_OK",JSON.stringify({aligned:matched,excluded:omitted,serviceHierarchyVerified:true,duplicateLocalSourcesRemoved:2,canonicalBreadcrumbTargets:true}));
