#!/usr/bin/env node
/** First-party branding regression tests — no external calls. */
import assert from "node:assert/strict";
import {readdir,readFile} from "node:fs/promises";
import {join} from "node:path";
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
