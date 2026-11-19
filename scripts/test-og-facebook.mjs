#!/usr/bin/env node
/** Validate actual Facebook/OG previews after the release build; no network requests. */
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFile} from "node:fs/promises";
const root="https://twoja-sprawa.pages.dev";
const imagePath="/assets/og-twoja-sprawa-votum-odszkodowania-v2.jpg";
const preview=process.argv.includes("--preview");
const output=preview?"dist-preview":"dist";
const image=await readFile(output+imagePath);
assert.ok(image.length>15000&&image.length<600000,"Social JPEG should be optimized but readable");
assert.equal(createHash("sha256").update(image).digest("hex"),"4b3b2a11c7512d96fe218b022385abea28811fec067a5e7b5cb2874cdbc5433c","Published preview must match the exact approved original graphic (not reconstructed Canva thumbnail)");
assert.equal(image[0],0xff);assert.equal(image[1],0xd8);
const jpegSize=data=>{
 let i=2;
 while(i<data.length-9){
  if(data[i]!==0xff){i++;continue;}
  let marker=data[i+1];
  if(marker===0xd9||marker===0xda)break;
  if(marker===0xff){i++;continue;}
  const len=data.readUInt16BE(i+2);
  if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb].includes(marker)){
    return {height:data.readUInt16BE(i+5),width:data.readUInt16BE(i+7)};
  }
  if(len<2)throw Error("Invalid JPEG segment");
  i+=2+len;
 }
 throw Error("JPEG size marker not found");
};
assert.deepEqual(jpegSize(image),{width:1200,height:630});
if(preview){
 console.log("OG_PREVIEW_ASSET_OK: first-party 1200x630 image copied into the noindex preview.");
 process.exit(0);
}
const routes=[
 "kampanie/szkody-gornicze",
 "kampanie/swiadczenie-wspierajace",
 "kampanie/skd",
 "uslugi/renty-powypadkowe",
 "uslugi/sluzebnosc-przesylu",
 "uslugi/kredyty-frankowe",
 "uslugi/szkody-gornicze",
 "lokalnie/szkody-gornicze-lubin",
 "lokalnie/szkody-gornicze-polkowice"
];
const read=(path)=>readFile(output+"/"+path+".html","utf8");
const get=(html,key)=>[...html.matchAll(/<meta\b[^>]*>/gi)]
 .filter(m=>m[0].includes('property="'+key+'"'))
 .map(m=>m[0].match(/content="([^"]*)"/)?.[1]);
for(const route of routes){
 const html=await read(route);
 assert.deepEqual(get(html,"og:image"),[root+imagePath],"Incorrect OG image on "+route);
 assert.deepEqual(get(html,"og:image:secure_url"),[root+imagePath],"Secure OG image on "+route);
 assert.deepEqual(get(html,"og:image:type"),["image/jpeg"]);
 assert.deepEqual(get(html,"og:image:width"),["1200"]);
 assert.deepEqual(get(html,"og:image:height"),["630"]);
 assert.equal((get(html,"og:image:alt")||[]).length,1,"One descriptive image alt per route");
 assert.ok(html.includes('name="twitter:card" content="summary_large_image"'),"Twitter preview must be landscape");
 assert.ok(html.includes('name="twitter:image" content="'+root+imagePath+'"'),"Twitter and Facebook must use the same image");
 assert.equal(get(html,"og:image").length,1,"No duplicate og:image tags");
 assert.ok(html.includes('property="og:url" content="'+root+"/"+route+'"'),"Share card URL must be canonical, not UTM variant");
}
const builder=await readFile("scripts/build.mjs","utf8");
assert.ok(builder.includes('const brandedRoutes=new Set('),"Build must preserve social preview after every deploy");
const campaignLinks=await readFile("v2/campaign-links.js","utf8");
for(const piece of ["szkody-gornicze.html","swiadczenie-wspierajace.html","skd.html","renty-powypadkowe.html","sluzebnosc-przesylu.html","kredyty-frankowe.html"])
 assert.ok(campaignLinks.includes(piece),"Campaign generator destination not covered: "+piece);
// A normal educational guide still uses a relevant author portrait, not the
// promotional banner, and stays unchanged when the campaign builder evolves.
const guide=await read("wiedza/ugoda-z-kopalnia-co-sprawdzic");
assert.ok(!get(guide,"og:image")[0].includes("og-twoja-sprawa-votum"),"Do not change guide previews globally");
console.log("OG_FACEBOOK_OK: 1200x630 self-hosted image, 9 campaign destinations (including Lubin and Polkowice), canonical URL, consistent Open Graph/Twitter preview.");
