#!/usr/bin/env node
/** Six public service referral links: static no-JS option, client-only share. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const slugs=["szkody-gornicze","swiadczenie-wspierajace","kredyty-pln",
 "renty-powypadkowe","kredyty-frankowe","sluzebnosc-przesylu"];
for(const slug of slugs){
 const html=await readFile("dist/uslugi/"+slug+".html","utf8");
 const url="https://twoja-sprawa.pages.dev/uslugi/"+slug;
 assert.equal((html.match(/class="service-share-card wrap"/g)||[]).length,1,slug);
 assert.ok(html.includes('href="'+url+'"'),slug+" no static public link");
 assert.ok(html.includes('data-share-url="'+url+'"'),slug+" no safe share target");
 assert.ok(html.includes('data-share-manual'),slug+" no manual fallback");
 assert.ok(html.includes('data-share-page'),slug+" no share enhancement");
 assert.ok(html.includes('src="/share-page.js"'),slug+" missing share behavior");
 assert.ok(html.includes("service-share.css")||/layers-[a-f0-9]{16}\.css/.test(html),slug+" CSS missing");
 assert.ok(html.indexOf('class="service-share-card wrap"')<html.indexOf('id="formularz"'),slug);
 const block=html.match(/<aside class="service-share-card wrap"[\s\S]*?<\/aside>/)?.[0]||"";
 assert.ok(block.includes('target="_blank"')&&block.includes('rel="noopener noreferrer"'),slug);
 assert.ok(!block.includes("utm_")&&!block.includes("access_key"),slug);
 assert.ok(html.includes("data-contact-form"),slug+" form missing");
}
console.log("SERVICE_SHARE_TEST_OK: six distinct canonical, privacy-safe share panels and forms intact.");
