#!/usr/bin/env node
/** First-party branding regression tests — no external calls. */
import assert from "node:assert/strict";
import {readdir,readFile} from "node:fs/promises";
import {join} from "node:path";
import {withNetworkBrand} from "./network-brand.mjs";
const sourceRoot="v2";
let tested=0,legacy=0;
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
    tested++;
  }
}
await walk(sourceRoot);
assert.ok(tested>=35,"Expected full-site coverage");
console.log("OK:",tested,"pages with one accessible persistent logo pair; removed",legacy,"legacy bars; repeatable builds.");
