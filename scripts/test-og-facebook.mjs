#!/usr/bin/env node
/** Validate first-party Facebook images after the real build, without posting. */
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFile,stat} from "node:fs/promises";
const root="https://twoja-sprawa.pages.dev",folder=process.argv.includes("--preview")?"dist-preview":"dist";
const brandFile="og-twoja-sprawa-metallic-v1.jpg";
const jpegSize=data=>{
 let i=2;
 while(i<data.length-9){
  if(data[i]!==0xff){i++;continue;}
  const marker=data[i+1];
  if(marker===0xd9||marker===0xda)break;
  if(marker===0xff){i++;continue;}
  const len=data.readUInt16BE(i+2);
  if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb].includes(marker))
   return {height:data.readUInt16BE(i+5),width:data.readUInt16BE(i+7)};
  if(len<2)throw Error("Invalid JPEG segment");
  i+=2+len;
 }
 throw Error("JPEG dimension marker missing");
};
const original=await readFile(folder+"/assets/"+brandFile);
assert.equal(createHash("sha256").update(original).digest("hex"),
 "489f8b499f49f841c6dec3f5777a791f4007ad9d5e8c109ceeed6cc83187798c",
 "Homepage must preserve the exact original brand image");
assert.deepEqual(jpegSize(original),{width:1536,height:803});
if(process.argv.includes("--preview")){
 console.log("OG_PREVIEW_ASSET_OK: original brand image retained in private preview.");
 process.exit(0);
}
const cases=[
 ["","og-twoja-sprawa-metallic-v1.jpg",1536,803],
 ["kampanie/szkody-gornicze","og-szkody-gornicze.jpg",1200,630],
 ["kampanie/swiadczenie-wspierajace","og-swiadczenie-wspierajace.jpg",1200,630],
 ["kampanie/renty-powypadkowe","og-renty-powypadkowe.jpg",1200,630],
 ["kampanie/skd","og-skd.jpg",1200,630],
 ["uslugi/renty-powypadkowe","og-renty-powypadkowe.jpg",1200,630],
 ["uslugi/sluzebnosc-przesylu","og-sluzebnosc-przesylu.jpg",1200,630],
 ["uslugi/kredyty-frankowe","og-kredyty-frankowe.jpg",1200,630],
 ["uslugi/szkody-gornicze","og-szkody-gornicze.jpg",1200,630],
 ["uslugi/kredyty-pln","og-skd.jpg",1200,630],
 ["uslugi/swiadczenie-wspierajace","og-swiadczenie-wspierajace.jpg",1200,630],
 ["lokalnie/szkody-gornicze-lubin","og-szkody-lubin.jpg",1200,630],
 ["lokalnie/szkody-gornicze-polkowice","og-szkody-polkowice.jpg",1200,630],
 ["wiedza/kredyt-pln-dokumenty-skd","og-skd-dokumenty.jpg",1200,630],
 ["wiedza/drobne-pekniecia-szkody-gornicze","og-szkody-gornicze.jpg",1200,630],
 ["wiedza/swiadczenie-wspierajace-2026-wzon-zus","og-swiadczenie-wspierajace.jpg",1200,630],
 ["wiedza/renta-powypadkowa-dokumenty","og-renty-powypadkowe.jpg",1200,630]
];
const get=(html,key,kind="property")=>[...html.matchAll(/<meta\b[^>]*>/gi)]
 .filter(m=>m[0].includes(kind+'="'+key+'"'))
 .map(m=>m[0].match(/content="([^"]*)"/)?.[1]);
for(const [route,asset,width,height] of cases){
 const html=await readFile(folder+"/"+(route||"index")+".html","utf8");
 const url=root+"/"+route,img=root+"/assets/"+asset;
 assert.deepEqual(get(html,"og:image"),[img],"Facebook preview "+route);
 assert.deepEqual(get(html,"og:image:secure_url"),[img],"HTTPS Facebook preview "+route);
 assert.deepEqual(get(html,"og:image:type"),["image/jpeg"],"JPEG type "+route);
 assert.deepEqual(get(html,"og:image:width"),[String(width)],"OG width "+route);
 assert.deepEqual(get(html,"og:image:height"),[String(height)],"OG height "+route);
 assert.equal(get(html,"og:image:alt").length,1,"Accessible preview "+route);
 assert.deepEqual(get(html,"og:url"),[url],"Canonical URL for shared link "+route);
 assert.deepEqual(get(html,"twitter:image","name"),[img],"Twitter matches FB "+route);
 assert.deepEqual(get(html,"twitter:card","name"),["summary_large_image"],"Large preview "+route);
 assert.equal(get(html,"og:image").length,1,"Duplicate image on "+route);
}
for(const img of new Set(cases.map(x=>x[1]))){
 const bytes=await readFile(folder+"/assets/"+img);
 assert.ok(bytes.length>50000&&bytes.length<700000,"Optimized local image "+img);
 assert.equal(bytes[0],0xff);assert.equal(bytes[1],0xd8);
 const expected=img===brandFile?{width:1536,height:803}:{width:1200,height:630};
 assert.deepEqual(jpegSize(bytes),expected,"Image aspect ratio "+img);
}
const generator=await readFile("v2/narzedzia/linki-kampanii.html","utf8");
const js=await readFile("v2/campaign-links.js","utf8");
assert.ok(generator.includes('src="/assets/og-swiadczenie-wspierajace.jpg"'),"Generator first preview must reflect the selected support-benefit campaign");
assert.ok(generator.includes('<option value="swiadczenie" selected>Świadczenie wspierające</option>'),"Generator should start with support benefit as the first Facebook campaign");
assert.ok(generator.includes('<option value="facebook_strona" selected>Facebook — własna strona</option>'),"Generator should default to Facebook Page for the first campaign");
assert.ok(js.includes('return "og-skd-dokumenty.jpg"')&&js.includes('previewImage.src=src'),"Generator must switch visible preview to SKD article");
for(const key of ["og-szkody-lubin.jpg","og-szkody-polkowice.jpg","og-kredyty-frankowe.jpg","og-renty-powypadkowe.jpg","og-sluzebnosc-przesylu.jpg","og-swiadczenie-wspierajace.jpg"])
 assert.ok(js.includes(key),"Generator should recognize "+key);
const builder=await readFile("scripts/build.mjs","utf8");
assert.ok(builder.includes('const routes=[')&&builder.includes('const socialWidth=selected?"1200":"1536"'),
 "The release build must persist the chosen OG image on every deployment");
const officialBrand=await readFile("scripts/sync-approved-social-banner.mjs","utf8");
assert.ok(officialBrand.includes("489f8b499f49f841c6dec3f5777a791f4007ad9d5e8c109ceeed6cc83187798c"),
 "Keep original approved homepage graphic unchanged");
console.log("OG_FACEBOOK_OK: 17 verified topic routes, nine first-party 1200x630 previews, original homepage artwork, social metadata and generator.");
