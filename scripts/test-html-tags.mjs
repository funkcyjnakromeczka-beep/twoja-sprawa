#!/usr/bin/env node
/** Markup regression for eight pages featuring social links.
 *  Validates HTML nesting, aria references, safe external links, SEO metadata,
 *  canonical URLs and JSON-LD graph consistency without third-party requests.
 *  Run after preview build: node scripts/test-html-tags.mjs */
import assert from "node:assert/strict";
import {readFile,readdir} from "node:fs/promises";
import {join} from "node:path";
import {toPublicRoute} from "./public-routes.mjs";

const origin="https://twoja-sprawa.pages.dev";
const routes=[
 ["index.html",["https://www.facebook.com/groups/4385749378342889/","https://www.facebook.com/groups/twojasprawa.swiadczenia.renty","https://www.facebook.com/szkodygornicze.pomoc/","https://www.tiktok.com/@w.o.votum"],true],
 ["uslugi/szkody-gornicze.html",["https://www.tiktok.com/@w.o.votum","https://www.facebook.com/szkodygornicze.pomoc/"],true],
 ["kampanie/szkody-gornicze.html",["https://www.tiktok.com/@w.o.votum","https://www.facebook.com/szkodygornicze.pomoc/"],false],
 ["uslugi/swiadczenie-wspierajace.html",["https://www.facebook.com/groups/twojasprawa.swiadczenia.renty"],true],
 ["kampanie/swiadczenie-wspierajace.html",["https://www.facebook.com/groups/twojasprawa.swiadczenia.renty"],false],
 ["uslugi/renty-powypadkowe.html",["https://www.facebook.com/groups/twojasprawa.swiadczenia.renty"],true],
 ["uslugi/kredyty-pln.html",["https://www.facebook.com/w.bieglo/"],true],
 ["kampanie/skd.html",["https://www.facebook.com/w.bieglo/"],false]
];
const voidTags=new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]);
const getHead=html=>html.match(/<head>([\s\S]*?)<\/head>/)?.[1]||"";
const tags=html=>html.replace(/<!--[\s\S]*?-->/g,"")
 .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"")
 .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,"");
const openTags=html=>[...html.matchAll(/<(\/?)([a-z][a-z0-9:-]*)(?:\s(?:[^>"']|"[^"]*"|'[^']*')*)?\s*(\/?)>/gi)];
function verifyBalanced(html,path){
 const stack=[];
 for(const m of openTags(tags(html))){
  const name=m[2].toLowerCase();
  if(voidTags.has(name))continue;
  if(!m[1])stack.push(name);
  else{
   const top=stack.pop();
   assert.equal(top,name,path+": closing </"+name+"> mismatches <"+(top||"none")+"> at "+m.index);
  }
 }
 assert.deepEqual(stack,[],path+": unclosed HTML elements");
}
function verifyAria(html,path){
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(new Set(ids).size,ids.length,path+": duplicate id attributes");
 for(const m of html.matchAll(/\baria-(?:labelledby|describedby|controls)="([^"]+)"/g)){
  for(const id of m[1].split(/\s+/)){
   assert.ok(ids.includes(id),path+": ARIA reference to unknown #"+id);
  }
 }
}
function socialLinks(html,path){
 const section=html.match(/<section class="[^"]*social-community[^"]*"[\s\S]*?<\/section>/)?.[0];
 assert.ok(section,path+": social links section missing");
 assert.ok(/<h2 id="social-[^"]+">/.test(section),path+": social section heading missing");
 assert.ok(/aria-labelledby="social-[^"]+"/.test(section),path+": social section landmark label missing");
 assert.ok(!/<(?:script|iframe)\b/i.test(section),path+": external social embed/script not allowed");
 const links=[...section.matchAll(/<a href="([^"]+)" target="_blank" rel="([^"]+)"(?: aria-description="[^"]+")?>([\s\S]*?)<\/a>/g)];
 for(const link of links){
  assert.ok(link[2].split(/\s+/).includes("noopener")&&link[2].split(/\s+/).includes("noreferrer"),path+": missing safe target=_blank rel");
  assert.ok(link[3].includes('class="social-community-sr"')&&link[3].includes("otworzy się w nowej karcie"),
   path+": screen readers need a new-tab hint without hiding the visible link name");
  assert.ok(!link[0].includes('aria-label='),path+": overriding accessible label breaks WCAG label-in-name");
 }
 return links.map(l=>l[1]);
}
let checked=0,graphs=0;
for(const [path,expected,indexable] of routes){
 const original=await readFile("v2/"+path,"utf8");
 const html=await readFile("dist/"+path,"utf8");
 verifyBalanced(original,"v2/"+path);
 verifyAria(original,"v2/"+path);
 assert.deepEqual(socialLinks(original,"v2/"+path),expected,path+": wrong source social destinations");
 verifyAria(html,"dist/"+path);
 assert.deepEqual(socialLinks(html,"dist/"+path),expected,path+": wrong published social destinations");
 const head=getHead(html);
 assert.ok(head,"dist/"+path+": <head> missing");
 const canonical=origin+(path==="index.html"?"/":"/"+path.slice(0,-".html".length));
 const metas=[...head.matchAll(/<meta\b[^>]*>/gi)].map(x=>x[0]);
 const links=[...head.matchAll(/<link\b[^>]*>/gi)].map(x=>x[0]);
 const one=(matches,description)=>assert.equal(matches.length,1,path+": expected exactly one "+description);
 one(links.filter(x=>/rel="canonical"/i.test(x)),"canonical link");
 assert.ok(links.some(x=>x.includes('rel="canonical" href="'+canonical+'"')),path+": wrong canonical URL");
 one(metas.filter(x=>/name="robots"/i.test(x)),"robots tag");
 assert.ok(metas.some(x=>x.includes('name="robots" content="'+(indexable?"index,follow":"noindex,follow")+'"')),
  path+": unexpected robots policy");
 one(metas.filter(x=>/name="description"/i.test(x)),"description");
 one(metas.filter(x=>/property="og:url"/i.test(x)),"Open Graph URL");
 one(metas.filter(x=>/property="og:title"/i.test(x)),"Open Graph title");
 one(metas.filter(x=>/property="og:description"/i.test(x)),"Open Graph description");
 assert.ok(metas.some(x=>x.includes('property="og:url" content="'+canonical+'"')),path+": og:url must be canonical");
 assert.ok(metas.some(x=>/name="twitter:card"\s+content="summary_large_image"/.test(x)),path+": Twitter/X card missing");
 const title=head.match(/<title>([^<]+)<\/title>/)?.[1];
 assert.ok(title&&title.length>15,path+": page title missing");
 assert.equal((html.match(/<h1\b/gi)||[]).length,1,path+": multiple or missing H1");
 const jsonLd=[...head.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(m=>JSON.parse(m[1]));
 assert.ok(jsonLd.length>=1,path+": JSON-LD missing");
 graphs+=jsonLd.length;
 const graph=jsonLd.flatMap(data=>data["@graph"]||[]);
 const pageNodes=graph.filter(node=>(node["@id"]||"")===canonical+"#webpage");
 assert.equal(pageNodes.length,1,path+": expected one canonical WebPage schema node");
 assert.equal(pageNodes[0].url,canonical,path+": structured URL differs from canonical");
 assert.deepEqual(pageNodes[0].relatedLink,expected,path+": schema links do not match the visible social links");
 // The support groups and marketing channels are not separate identities
 // of SuccessTree. relatedLink is accurate; sameAs would be misleading.
 assert.equal(pageNodes[0].sameAs,undefined,path+": do not identify social groups as the website owner");
 checked++;
}
// Audit every generated page, not only the eight updated social routes.
const allHtml=[];
async function walk(dir,prefix=""){
 for(const item of await readdir(dir,{withFileTypes:true})){
  const rel=prefix+item.name;
  if(item.isDirectory())await walk(join(dir,item.name),rel+"/");
  else if(item.name.endsWith(".html"))allHtml.push(rel);
 }
}
await walk("dist");
assert.ok(allHtml.length>=35,"The release contains unexpectedly few HTML pages");
for(const path of allHtml){
 const html=await readFile("dist/"+path,"utf8");
 const head=getHead(html);
 assert.ok(head,"Missing <head> on "+path);
 const route=path==="index.html"?"/":path.endsWith("/index.html")?"/"+path.slice(0,-"index.html".length):"/"+path;
 const canonical=origin+toPublicRoute(route);
 const count=pattern=>[...head.matchAll(pattern)].length;
 assert.equal(count(/<link\b[^>]*rel="canonical"[^>]*>/g),1,"Duplicate/missing canonical on "+path);
 assert.ok(head.includes('rel="canonical" href="'+canonical+'"'),"Incorrect canonical on "+path);
 assert.equal(count(/<meta\b[^>]*name="robots"[^>]*>/g),1,"Duplicate/missing robots on "+path);
 assert.equal(count(/<meta\b[^>]*property="og:url"[^>]*>/g),1,"Duplicate/missing og:url on "+path);
 assert.ok(head.includes('property="og:url" content="'+canonical+'"'),"OG URL disagrees with canonical on "+path);
 assert.equal(count(/<meta\b[^>]*property="og:title"[^>]*>/g),1,"Duplicate/missing og:title on "+path);
 const schemas=[...head.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(m=>JSON.parse(m[1]));
 const pages=schemas.flatMap(obj=>obj["@graph"]||[])
  .filter(node=>node["@id"]===canonical+"#webpage");
 assert.equal(pages.length,1,"Missing or duplicate canonical WebPage schema on "+path);
 assert.equal(pages[0].url,canonical,"WebPage schema URL disagreement on "+path);
}
console.log("HTML_TAGS_SEO_OK: "+checked+" focused pages, "+allHtml.length+" release pages, "+graphs+" focused JSON-LD blocks, consistent canonical/OG/ARIA/social metadata.");
