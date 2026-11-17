#!/usr/bin/env node
/** First-party branding regression tests — no external calls. */
import assert from "node:assert/strict";
import {readdir,readFile} from "node:fs/promises";
import {join} from "node:path";
import {runInNewContext} from "node:vm";
import {withNetworkBrand} from "./network-brand.mjs";
const sourceRoot="v2";
let tested=0,legacy=0,partnerBarsRemoved=0;
async function walk(dir){
  for(const entry of await readdir(dir,{withFileTypes:true})){
    const file=join(dir,entry.name);
    if(entry.isDirectory()){await walk(file);continue;}
    if(!entry.name.endsWith(".html"))continue;
    const original=await readFile(file,"utf8");
    const rendered=withNetworkBrand(original);
    const renderedAgain=withNetworkBrand(rendered);
    const label=file.replaceAll("\\","/");
    assert.equal(renderedAgain,rendered,label+": build helper must be idempotent");
    assert.equal((rendered.match(/class="network-brand-bar"/g)||[]).length,1,label+": exactly one persistent top strip required");
    assert.equal((rendered.match(/class="network-brand-logos"/g)||[]).length,1,label+": exactly one pair required");
    assert.ok(rendered.includes('alt="Votum Network"'),label+": Votum Network logo missing");
    assert.ok(rendered.includes('alt="Votum Scale Agency"'),label+": Votum Scale Agency logo missing");
    assert.ok(rendered.includes('/v2/network-brand.css'),label+": shared style missing");
    assert.equal((rendered.match(/class="network-brand-fallback"/g)||[]).length,2,label+": readable loading fallbacks required");
    assert.ok(rendered.includes('/v2/network-brand.js'),label+": fallback enhancement missing");
    assert.equal((rendered.match(/id="network-brand-critical"/g)||[]).length,1,
      label+": critical no-JavaScript mobile brand guard must be in the head exactly once");
    assert.ok(rendered.includes('max-width:calc(50vw - 15px)'),
      label+": external CSS outages must not cause 400px logo overflow on 320px screens");
    const firstHeader=rendered.indexOf("<header");
    const firstBrand=rendered.indexOf('class="network-brand-bar"');
    const firstMain=rendered.indexOf("<main");
    assert.ok(firstBrand>=0 && (firstHeader<0||firstBrand<firstHeader) && firstBrand<firstMain,label+": strip should appear above header and main");
    if(original.includes('class="agency-logos-bar"')){
      assert.ok(!rendered.includes('class="agency-logos-bar"'),label+": old duplicate agency strip remains");
      legacy++;
    }
    if(original.includes('class="partner-identity-bar"')){
      assert.ok(!rendered.includes('class="partner-identity-bar"'),
       label+": duplicate information-page partner bar remains");
      assert.ok(rendered.includes("Serwis przedstawiciela, nie oficjalna witryna spółek VOTUM"),
       label+": shared bar must preserve agency relationship disclosure");
      partnerBarsRemoved++;
    }
    tested++;
  }
}
await walk(sourceRoot);
assert.ok(tested>=35,"Expected full-site coverage");
assert.ok(partnerBarsRemoved>=1,"Expected information-page duplicate logo strip to be removed");
// Brand recognition must remain readable if the official external PNG is unavailable.
const supportCss=await readFile("v2/support-brand-fallback.css","utf8");
assert.ok(supportCss.includes(".vws-service-brand img[hidden]"));
assert.ok(supportCss.includes("brand-fallback-active strong"));
for(const file of ["v2/uslugi/swiadczenie-wspierajace.html","v2/kampanie/swiadczenie-wspierajace.html"]){
 const html=await readFile(file,"utf8");
 assert.ok(html.includes('href="/v2/support-brand-fallback.css"'),file+": fallback stylesheet missing");
 assert.ok(html.includes('class="vws-service-brand"'),file+": support brand missing");
 assert.ok(html.includes("votum-sa.pl/wp-content/uploads/"),file+": official image missing");
 assert.ok(html.includes("brand-fallback-active"),file+": image-error fallback missing");
 assert.ok(html.includes("<strong>Votum Wsparcie</strong>"),file+": plain text fallback missing");
}
console.log("SUPPORT_BRAND_FALLBACK_OK: official artwork kept; compact text available on image error.");
console.log("OK:",tested,"pages with one accessible persistent logo pair; removed",legacy,"legacy bars and",partnerBarsRemoved,"information-page duplicates; repeatable builds.");


// Symulacja zerwania połączenia z serwerem oficjalnych logotypów.
const makeBrandImage=(src,naturalWidth,withExistingText=false)=>{
 const listeners={};
 const host={children:[],appendChild(node){this.children.push(node);},tagName:"A"};
 if(withExistingText)host.children.push({textContent:"Grupa VOTUM"});
 const img={
  complete:true,naturalWidth,hidden:false,parentElement:host,
  classList:{classes:new Set(),add(name){this.classes.add(name);}},
  getAttribute(name){return name==="src"?src:null;},
  closest(selector){return selector==="a"?host:null;},
  addEventListener(name,fn){listeners[name]=fn;}
 };
 host.children.push(img);
 return {img,host,listeners};
};
const broken=makeBrandImage("https://votum-sa.pl/wp-content/uploads/2026/05/votum-scale-agency-.png",0);
const loaded=makeBrandImage("https://votum-sa.pl/wp-content/uploads/2024/09/logo-votum-network-przedstawiciel-400x284-1.jpg",400);
const labeled=makeBrandImage("https://votum-sa.pl/wp-content/uploads/2024/06/logo_VOTUM_SA_rgb-480x71.png",0,true);
const fakeDocument={
 querySelectorAll(selector){
  if(selector===".network-brand-logos img")return [];
  if(selector==='img[src^="https://votum-sa.pl/wp-content/uploads/"]')
   return [broken.img,loaded.img,labeled.img];
  throw Error("Unexpected image selection: "+selector);
 },
 createElement(tag){assert.equal(tag,"span");return {className:"",hidden:false,textContent:""};}
};
runInNewContext(await readFile("v2/network-brand.js","utf8"),{document:fakeDocument});
assert.equal(broken.img.hidden,true,"Blocked partner image must not leave an empty graphic");
assert.equal(broken.host.children[1].textContent,"VOTUM Scale Agency","Readable fallback required");
assert.equal(broken.host.children[1].hidden,false,"Partner name must be visible on failure");
assert.equal(loaded.img.hidden,false,"Healthy original logo must remain visible");
assert.equal(loaded.host.children[1].hidden,true,"Text fallback should not duplicate a loaded logo");
assert.equal(labeled.img.hidden,true,"Already-labeled broken image should be hidden");
assert.equal(labeled.host.children.length,2,"Existing visible company name must not be repeated");
broken.img.naturalWidth=400;broken.listeners.load();
assert.equal(broken.img.hidden,false,"Recovered image should appear after a load event");
assert.equal(broken.host.children[1].hidden,true,"Recovered image must hide the fallback");
const brandCss=await readFile("v2/network-brand.css","utf8");
assert.ok(brandCss.includes(".external-partner-logo-remote[hidden]"),"Hidden images must not override site CSS");
assert.ok(brandCss.includes(".external-partner-logo-fallback[hidden]"),"Hide inactive textual fallbacks");
console.log("EXTERNAL_PARTNER_LOGO_FALLBACK_OK: broken images, available originals and existing labels tested.");
