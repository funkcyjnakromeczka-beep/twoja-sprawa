#!/usr/bin/env node
/** Read-only test of indexing policy and dynamic IndexNow sitemap discovery. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {collectIndexableRoutes} from "./indexnow-routes.mjs";
const actual=await collectIndexableRoutes("v2");
assert.ok(actual.length>=10&&actual.length<=200,"Unexpected number of public routes: "+actual.length);
assert.equal(new Set(actual).size,actual.length);
for(const url of ["/","/faq","/wiedza/","/uslugi/szkody-gornicze","/uslugi/swiadczenie-wspierajace"]){
 assert.ok(actual.includes(url),"Missing required public URL "+url);
}
for(const path of actual){
 assert.ok(path.startsWith("/")&&!path.includes("?")&&!path.endsWith(".html"));
 assert.ok(!/^\/(?:szukaj|404|kampanie|narzedzia|polityka-prywatnosci)/.test(path),"Indexed excluded URL: "+path);
}
for(const path of ["/szukaj","/404","/kampanie/szkody-gornicze","/kampanie/swiadczenie-wspierajace","/polityka-prywatnosci"]){
 assert.ok(!actual.includes(path),"Should exclude "+path);
}
const workflow=await readFile(".github/workflows/indexnow.yml","utf8");
assert.ok(workflow.includes("'v2/**/*.html'")&&workflow.includes("cancel-in-progress: true"));
assert.ok(workflow.includes("node scripts/submit-indexnow.mjs"));
const submit=await readFile("scripts/submit-indexnow.mjs","utf8");
assert.ok(submit.includes("collectIndexableRoutes")&&submit.includes("assert.deepEqual(livePaths,expectedRoutes"));
assert.ok(!submit.includes("assert.equal(urls.length,36"),"No fixed count allowed");
console.log("INDEXNOW_ROUTES_OK: "+actual.length+" current canonical addresses, exclusions and dynamic sitemap verification.");
