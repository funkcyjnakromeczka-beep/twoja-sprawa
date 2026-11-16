#!/usr/bin/env node
/* Read-only: test content-addressed subpage CSS and real release pages. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import {PAGE_PATHS} from "./page-navigation.mjs";
import {bundleSubpageCss} from "./subpage-css-bundles.mjs";
const link='<link rel="stylesheet" href="/';
const html=s=>'<html><head>'+s+'</head><body><main>Test</main></body></html>';
const source=['styles.css','premium-v2.css','alpha.css','beta.css','gamma.css'];
const elements=source.map(s=>link+s+'">').join("");
const css=new Map(source.map(s=>[s,'.'+s.replaceAll('.','-')+'{color:#123456}']));
const wrote=new Map();
const bundle=await bundleSubpageCss(html(elements),n=>css.get(n),
 async (name,content)=>{wrote.set(name,content);});
assert.equal(bundle.bundled,true);
assert.equal(bundle.requestsSaved,2);
const linkMatches=[...bundle.html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(x=>x[1]);
assert.deepEqual(linkMatches,['/styles.css','/premium-v2.css','/'+bundle.filename]);
assert.equal(wrote.get(bundle.filename),['alpha.css','beta.css','gamma.css'].map(n=>css.get(n)).join("\n"));
assert.equal((await bundleSubpageCss(html(elements+'<style>h1{color:red}</style>'),n=>css.get(n),()=>{})).bundled,false);
assert.equal((await bundleSubpageCss(html(elements.replace(link+'beta.css">', '<link rel="stylesheet" media="print" href="/beta.css">')),n=>css.get(n),()=>{})).bundled,false);
const paths=PAGE_PATHS;assert.equal(paths.length,47);
const digest=content=>createHash("sha256").update(content,"utf8").digest("hex").slice(0,16);
const verified=new Set(), bundledPages=[];
for(const path of paths){
 const markup=await readFile("dist/"+path,"utf8");
 const refs=[...markup.matchAll(/<link rel="stylesheet" href="\/([^"]+)">/g)].map(m=>m[1]);
 const layerRefs=refs.filter(f=>/^layers-[a-f0-9]{16}\.css$/.test(f));
 assert.ok(layerRefs.length<=1,path+": repeated layers");
 if(!layerRefs.length)continue;
 bundledPages.push(path);
 const file=layerRefs[0];
 if(!verified.has(file)){
  const content=await readFile("dist/"+file,"utf8");
  assert.equal(file,"layers-"+digest(content)+".css","Bundled CSS fingerprint mismatch: "+file);
  assert.ok(content.length>100&&content.length<120000,"Unexpected layer bundle size: "+file);
  verified.add(file);
 }
 assert.ok(refs.length<=3,"Too many CSS requests on "+path+": "+refs.join(", "));
}
const keyRoutes=[
 "uslugi/szkody-gornicze.html","uslugi/swiadczenie-wspierajace.html",
 "uslugi/kredyty-pln.html","uslugi/renty-powypadkowe.html",
 "uslugi/kredyty-frankowe.html","uslugi/sluzebnosc-przesylu.html"
];
for(const path of keyRoutes)assert.ok(bundledPages.includes(path),"Unoptimized key service: "+path);
assert.ok(bundledPages.length>=12,"Expected at least 12 pages to benefit from request reduction");
console.log("CSS_LAYER_RESULT "+JSON.stringify({pages:paths.length,optimized:bundledPages.length,uniqueLayers:verified.size,allSixServices:true}));
