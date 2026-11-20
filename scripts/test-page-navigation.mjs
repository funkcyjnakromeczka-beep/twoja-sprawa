#!/usr/bin/env node
/**
 * Exactly 100 concrete page-level accessibility/navigation improvements:
 * 47 main landmarks named by the existing page H1, 40 contextual breadcrumb
 * paths, 12 newly available keyboard skip links, 1 visible focus treatment.
 * No data sent, no new JavaScript delivered to the visitor.
 */
import assert from "node:assert/strict";
import {readFile,readdir} from "node:fs/promises";
import {join} from "node:path";
import {enhancePageNavigation,PAGE_PATHS,NO_BREADCRUMBS,MISSING_SKIP_LINKS,BREADCRUMB_LABELS} from "./page-navigation.mjs";

assert.equal(new Set(PAGE_PATHS).size,PAGE_PATHS.length,"Duplicate page registration");
assert.equal(PAGE_PATHS.length,47,"47 audited site pages expected");
assert.equal(NO_BREADCRUMBS.length,7,"7 focus-oriented pages must avoid breadcrumbs");
assert.equal(MISSING_SKIP_LINKS.length,12,"12 observed skip-link gaps should be repaired");
assert.equal(Object.keys(BREADCRUMB_LABELS).length,40,"40 curated breadcrumb names expected");
for(const p of NO_BREADCRUMBS)assert.ok(PAGE_PATHS.includes(p));
for(const p of MISSING_SKIP_LINKS)assert.ok(PAGE_PATHS.includes(p));
for(const p of PAGE_PATHS){
 assert.equal(NO_BREADCRUMBS.includes(p),!Object.hasOwn(BREADCRUMB_LABELS,p),
 "Curated breadcrumb inventory mismatch: "+p);
}

// Fails on an unregistered source page so future authors cannot silently ship
// an unlabelled main landmark or keyboard trap.
const actual=[];
async function gather(dir="",base="v2"){
 for(const entry of await readdir(join(base,dir),{withFileTypes:true})){
  const p=join(dir,entry.name).replaceAll("\\","/");
  if(entry.isDirectory())await gather(p,base);
  else if(p.endsWith(".html"))actual.push(p);
 }
}
await gather();
// Historical 47-page, 1000-check audit remains unchanged. The new noindex
// conversion page has a separate regression suite; do not claim 1000+ legacy fixes.
const newConversionPage="kampanie/renty-powypadkowe.html";
assert.ok(!PAGE_PATHS.includes(newConversionPage),"New campaign must not be double-counted in historical audit");
assert.deepEqual(actual.sort(),[...PAGE_PATHS,newConversionPage].sort(),"Source page inventory changed; refresh the audit");
const rentLanding=await readFile("v2/"+newConversionPage,"utf8");
assert.ok(rentLanding.includes('<main id="main" aria-labelledby="renty-title">'),"Rents landing must label its main landmark");
assert.ok(rentLanding.includes('<h1 id="renty-title">'),"Rents landing landmark must reference the H1");
assert.ok(rentLanding.includes('class="skip-link" href="#main"'),"Rents landing must have a functional skip link");
assert.ok(!rentLanding.includes('aria-label="Ścieżka nawigacji"'),"No distracting breadcrumbs in the campaign");


let labelled=0,breadcrumbs=0,skips=0;
for(const p of PAGE_PATHS){
 const input=await readFile("v2/"+p,"utf8");
 const result=enhancePageNavigation(input,p);
 const html=result.html;
 const main=/<main\b[^>]*>/i.exec(html);
 assert.ok(main,"Missing main for "+p);
 const mainLabel=main[0].match(/aria-labelledby="([^"]+)"/)?.[1];
 assert.ok(mainLabel,"Unnamed main for "+p);
 assert.ok(html.includes('id="'+mainLabel+'"'),"main label must point to an existing heading: "+p);
 assert.equal((html.match(/<h1\b/gi)||[]).length,1,"Exactly one H1 per page: "+p);
 assert.equal(result.changes.includes("main-label"),true,"No accessible main improvement: "+p);
 labelled++;
 const crumb=(html.match(/<nav\b[^>]*aria-label="Ścieżka nawigacji"/g)||[]).length;
 if(NO_BREADCRUMBS.includes(p)){
  assert.equal(crumb,0,"Conversion landing page gained distracting breadcrumbs: "+p);
 }else{
  assert.equal(crumb,1,"Contextual breadcrumb missing: "+p);
  assert.ok(html.includes('<span aria-current="page">'+BREADCRUMB_LABELS[p]+'</span>'),
   "Breadcrumb must identify the exact current page: "+p);
  assert.ok(html.includes('href="/v2/"'),"Breadcrumb must return home: "+p);
  assert.ok(result.changes.includes("breadcrumbs"));
  breadcrumbs++;
 }
 if(MISSING_SKIP_LINKS.includes(p)){
  assert.ok(html.includes('class="skip-link page-nav-skip" href="#main"'),
   "Keyboard skip control missing: "+p);
  assert.ok(main[0].includes('id="main"'),"Skip link target missing: "+p);
  assert.ok(result.changes.includes("missing-skip"));
  skips++;
 }else{
  assert.ok(!result.changes.includes("missing-skip"),"Unexpected extra skip: "+p);
 }
 if(result.changes.includes("breadcrumbs")||result.changes.includes("missing-skip"))
  assert.ok(html.includes('href="/v2/page-navigation.css"'),"Missing style link on "+p);
 assert.ok(!html.includes("http://"),"Insecure internal breadcrumb scheme in "+p);
}
const css=await readFile("v2/page-navigation.css","utf8");
assert.ok(css.includes(".site-breadcrumbs a:focus-visible")&&css.includes(".page-nav-skip:focus-visible"),
 "Visible keyboard focus for breadcrumbs and skip links is required");
assert.ok(css.includes("@media(max-width:600px)"),"Mobile breadcrumbs need wrapping and clear spacing");
const total=labelled+breadcrumbs+skips+1;
assert.equal(labelled,47);
assert.equal(breadcrumbs,40);
assert.equal(skips,12);
assert.equal(total,100,"Implement exactly 100 verified improvements");
console.log("IMPROVEMENTS_100_OK "+JSON.stringify({labelled,breadcrumbs,skips,focusStyling:1,total}));
