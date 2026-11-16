#!/usr/bin/env node
/* 47 source-backed page invariants x20 + 6 service contact routes x10.
   Exactly 1000 separate release checks, not 1000 claimed code fixes.
   Works on dist after build; no HTTP requests or lead submission. */
import assert from "node:assert/strict";
import {readFile,access} from "node:fs/promises";
import {PAGE_PATHS} from "./page-navigation.mjs";
import {shouldIndexRoute} from "./seo-policy.mjs";
import {toPublicRoute} from "./public-routes.mjs";
const origin="https://twoja-sprawa.pages.dev",checks=[];
const add=(id,path,fn)=>checks.push({id,path,fn});
const matches=(html,re)=>[...html.matchAll(re)].map(m=>m[0]);
const meta=(html,key,value)=>matches(html,/<meta\b[^>]*>/gi)
 .filter(t=>t.includes(key+'="'+value+'"')).map(t=>t.match(/\bcontent="([^"]*)"/i)?.[1]||"");
const graph=html=>[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
 .flatMap(m=>{const obj=JSON.parse(m[1]);return obj["@graph"]||[obj];});
const resources=async(html,kind,attr,extension)=>{
 const re=new RegExp('<'+kind+'\\b[^>]*\\b'+attr+'="([^"]+)"[^>]*>','gi');
 for(const m of html.matchAll(re)){
  const url=m[1].split("?")[0].split("#")[0];
  if(url.startsWith("/")&&url.endsWith("."+extension)){
   assert.ok(!url.includes(".."),"Unsafe asset path "+url);
   await access("dist"+url);
  }
 }
};
assert.equal(PAGE_PATHS.length,47);
for(const path of PAGE_PATHS){
 const html=await readFile("dist/"+path,"utf8");
 const route=path==="index.html"?"/":path.endsWith("/index.html")?"/"+path.slice(0,-"index.html".length):"/"+path;
 const canonical=origin+toPublicRoute(route);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 const main=html.match(/<main\b([^>]*)>/i)?.[1]||"";
 const mainLabel=main.match(/\baria-labelledby="([^"]+)"/i)?.[1]||"";
 const nodes=graph(html);
 const name=path.replaceAll("/","_");
 const cases=[
  ["doctype",()=>assert.match(html,/^<!doctype html>/i)],
  ["language",()=>assert.match(html,/<html\b[^>]*lang="pl"/i)],
  ["charset",()=>assert.match(html,/<meta\b[^>]*charset="utf-8"/i)],
  ["viewport",()=>assert.match(html,/<meta\b[^>]*name="viewport"[^>]*width=device-width/i)],
  ["unique-title",()=>{const v=matches(html,/<title>[\s\S]*?<\/title>/gi);assert.equal(v.length,1);assert.ok(v[0].length>15)}],
  ["meta-description",()=>{const v=meta(html,"name","description");assert.equal(v.length,1);assert.ok(v[0].length>=20)}],
  ["indexation-policy",()=>{const v=meta(html,"name","robots");assert.equal(v.length,1);assert.ok(v[0].startsWith(shouldIndexRoute(route)?"index,follow":"noindex,follow"))}],
  ["canonical-url",()=>{const v=[...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)];assert.equal(v.length,1);assert.equal(v[0][1],canonical)}],
  ["open-graph-url",()=>assert.deepEqual(meta(html,"property","og:url"),[canonical])],
  ["open-graph-title",()=>assert.ok(meta(html,"property","og:title")[0]?.length>=8)],
  ["open-graph-description",()=>assert.ok(meta(html,"property","og:description")[0]?.length>=20)],
  ["https-preview-image",()=>assert.match(meta(html,"property","og:image")[0]||"",/^https:\/\//)],
  ["single-h1",()=>assert.equal(matches(html,/<h1\b[^>]*>/gi).length,1)],
  ["single-main",()=>assert.equal(matches(html,/<main\b[^>]*>/gi).length,1)],
  ["main-heading-reference",()=>{assert.ok(mainLabel);assert.ok(ids.includes(mainLabel))}],
  ["unique-id-values",()=>assert.equal(new Set(ids).size,ids.length)],
  ["webpage-schema",()=>{const n=nodes.filter(x=>x["@id"]===canonical+"#webpage");assert.equal(n.length,1);assert.ok(["WebPage","FAQPage","ContactPage","AboutPage","CollectionPage"].includes(n[0]["@type"]))}],
  ["agency-ownership-schema",()=>{const n=nodes.filter(x=>x["@type"]==="Organization"&&x.name==="SuccessTree OBIEGŁO WOJCIECH");assert.equal(n.length,1)}],
  ["css-assets-resolve",()=>resources(html,"link","href","css")],
  ["javascript-assets-resolve",()=>resources(html,"script","src","js")]
 ];
 assert.equal(cases.length,20);
 for(const [key,fn] of cases)add(name+"."+key,path,fn);
}
const services=[
 ["szkody-gornicze","szkody","Szkody górnicze","796441345","wojciech.obieglo@votum-ds.pl"],
 ["swiadczenie-wspierajace","swiadczenie","Świadczenie wspierające","500171531","paulina.chandrala@votum-ds.pl"],
 ["kredyty-pln","skd","Kredyt w PLN / SKD","796441345","wojciech.obieglo@votum-ds.pl"],
 ["renty-powypadkowe","renty","Renty powypadkowe","500171531","paulina.chandrala@votum-ds.pl"],
 ["kredyty-frankowe","franki","Kredyty frankowe CHF","796441345","wojciech.obieglo@votum-ds.pl"],
 ["sluzebnosc-przesylu","przesyl","Służebność przesyłu","796441345","wojciech.obieglo@votum-ds.pl"]
];
for(const [slug,code,label,phone,email] of services){
 const path="uslugi/"+slug+".html",html=await readFile("dist/"+path,"utf8"),nodes=graph(html);
 const cases=[
 ["service-selected",()=>assert.ok(html.includes('data-service="'+label+'"'))],
 ["form-mounted",()=>assert.ok(html.includes("data-contact-form"))],
 ["form-anchor",()=>assert.ok(html.includes('id="formularz"'))],
 ["form-script",()=>assert.ok(html.includes('src="/contact.js"'))],
 ["correct-specialist-phone",()=>assert.ok(html.includes('href="tel:+48'+phone+'"'))],
 ["correct-specialist-email",()=>assert.ok(html.includes('mailto:'+email))],
 ["preselected-preparation-guide",()=>assert.ok(html.includes('/plan-dzialania?usluga='+code))],
 ["privacy-notice-link",()=>assert.ok(html.includes('/polityka-prywatnosci'))],
 ["preparation-bridge",()=>assert.ok(html.includes('class="service-plan-bridge"'))],
 ["agency-service-schema",()=>{const n=nodes.filter(x=>x["@type"]==="Service");assert.equal(n.length,1);assert.equal(n[0].provider?.["@id"],origin+"/#successtree")}]
 ];
 assert.equal(cases.length,10);
 for(const [key,fn] of cases)add("service."+slug+"."+key,path,fn);
}
assert.equal(checks.length,1000);
assert.equal(new Set(checks.map(c=>c.id)).size,1000);
let passed=0;
for(const [i,c] of checks.entries()){
 try{await c.fn();passed++;}
 catch(e){console.error("RELEASE_1000_FAIL",i+1,c.id,e.message);process.exitCode=1;}
 if((i+1)%100===0)console.log("RELEASE_1000_PROGRESS",i+1,passed);
}
console.log("RELEASE_1000_RESULT",JSON.stringify({passed,total:1000,pages:47,services:6,requests:0}));
if(process.argv.includes("--manifest"))for(const [i,c] of checks.entries())
 console.log("RELEASE_CHECK",i+1,c.id,c.path);
