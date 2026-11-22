#!/usr/bin/env node
/**
 * Regression test: one visible brand image replaces the retired hero assets.
 * Verifies source and built production HTML without browsers or network access.
 */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {createHash} from "node:crypto";

const src=await readFile("v2/index.html","utf8");
const built=await readFile("dist/index.html","utf8");
const css=await readFile("dist/home-bundle.css","utf8");
const art=await readFile("dist/assets/og-twoja-sprawa-metallic-v1.jpg");
const headers=await readFile("dist/_headers","utf8");
const sha256=createHash("sha256").update(art).digest("hex");
assert.equal(sha256,"489f8b499f49f841c6dec3f5777a791f4007ad9d5e8c109ceeed6cc83187798c","Only the approved brand image may be published");

for (const [name,html,expectedPath] of [
  ["source",src,"/v2/assets/og-twoja-sprawa-metallic-v1.jpg"],
  ["production",built,"/assets/og-twoja-sprawa-metallic-v1.jpg"]
]) {
  const visual=html.match(/<div class="hero-visual">([\s\S]*?)<\/div>/)?.[1]||"";
  assert.ok(visual, name+" is missing the homepage hero visual");
  assert.equal((visual.match(/<img\b/g)||[]).length,1,name+" must contain exactly one meaningful image");
  assert.ok(visual.includes('src="'+expectedPath+'"'),name+" image path mismatch");
  assert.ok(visual.includes('width="1536" height="803"'),name+" missing intrinsic image dimensions");
  assert.ok(visual.includes('fetchpriority="high"'),name+" hero lacks fetch priority");
  assert.ok(visual.includes('alt="Twoja Sprawa — VOTUM Odszkodowania.'),name+" missing descriptive alt");
  for(const oldClass of ["hero-themis-figure","hero-art","hero-visual-caption"]){
    assert.ok(!visual.includes(oldClass),name+" contains obsolete visual: "+oldClass);
  }
}
assert.ok(css.includes(".premium-v2 .hero-visual .hero-metallic-art"),"Production bundle does not include responsive approved banner CSS");
assert.ok(css.includes("@media(max-width:600px)"),"Mobile media rules missing");
assert.ok(!css.includes(".premium-v2 .hero-visual .hero-themis-figure,\n"),"Obsolete hidden-image rule returned");
assert.ok(headers.includes("/assets/og-twoja-sprawa-metallic-v1.jpg\n  Cache-Control: public, max-age=604800"),"Versioned social image should have 7 day public cache");
console.log("BRAND_HERO_OK: one optimized, approved banner; no obsolete hidden images, responsive CSS and social metadata preserved.");

// The mobile homepage keeps real brand assets, not third-party decorative photography.
assert.ok(!src.includes("images.unsplash.com")&&!css.includes("images.unsplash.com"),"Decorative backgrounds must not require a connection to external photography");
assert.ok(css.includes(".premium-v2 #filmy:before{display:none}")&&css.includes(".video-poster[data-film]{background:radial-gradient")&&!css.includes("--video-poster:url("),"All film posters should use local SVG icons and network-free gradients");
