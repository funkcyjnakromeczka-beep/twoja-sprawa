#!/usr/bin/env node
/**
 * Regression checks for hand-edited metadata on the highest-intent pages.
 * Read-only. Run after: SITE_URL=https://twoja-sprawa.pages.dev RELEASE=1 node scripts/build.mjs
 */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const cases = [
  ["kontakt.html", "Kontakt: Wojciech Obiegło i Paulina Chandrała", true],
  ["plan-dzialania.html", "Plan pierwszych kroków — 6 rodzajów spraw | Twoja Sprawa", true],
  ["szukaj.html", "Wyszukiwarka informacji | Twoja Sprawa", false],
  ["uslugi/renty-powypadkowe.html", "Renty powypadkowe i waloryzacja | Twoja Sprawa", true],
  ["uslugi/sluzebnosc-przesylu.html", "Służebność przesyłu — analiza działki | Twoja Sprawa", true]
];
const meta = (html, field, key) => {
  const tag = html.match(new RegExp('<meta\\b(?=[^>]*\\b'+field+'="'+key+'")[^>]*>',"i"))?.[0] || "";
  return tag.match(/\bcontent="([^"]*)"/i)?.[1] || "";
};
for (const [file, expectedTitle, shouldIndex] of cases) {
  const html = await readFile("dist/"+file,"utf8");
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1] || "";
  const description = meta(html,"name","description");
  assert.equal(title,expectedTitle,"Unexpected SEO title: "+file);
  assert.ok(description.length>=70 && description.length<=160,
    "Description should be 70-160 characters: "+file+" ("+description.length+")");
  assert.ok(title.length<=64, "Long title: "+file);
  assert.equal(meta(html,"property","og:title"),title,"OG title differs: "+file);
  assert.equal(meta(html,"property","og:description"),description,"OG description differs: "+file);
  assert.equal(meta(html,"name","twitter:title"),title,"Twitter title differs: "+file);
  const robots=meta(html,"name","robots");
  assert.equal(robots,shouldIndex?"index,follow":"noindex,follow","Wrong robots policy: "+file);
  const route="/"+file.replace(/\.html$/,"");
  assert.ok(html.includes('<link rel="canonical" href="https://twoja-sprawa.pages.dev'+route+'">'),
    "Unexpected canonical: "+file);
}
const formSource=await readFile("v2/contact.js","utf8");
const backendSource=await readFile("functions/api/contact.js","utf8");
assert.ok(formSource.includes('"Kredyty frankowe CHF"'),"CHF missing from client form");
assert.ok(backendSource.includes('"Kredyty frankowe CHF"'),"CHF missing from backend allowlist");
console.log("CORE_METADATA_AND_CHF_FORM_OK: "+cases.length+" pages and two service lists verified");
