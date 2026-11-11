#!/usr/bin/env node
/** One thousand sequential regression checks for the real 62-item local site index.
 * All checks are deterministic, local, read-only and free. No lead data or network.
 * This is NOT a claim of 1000 independently deployed website improvements.
 */
import assert from "node:assert/strict";
import {readFile,access} from "node:fs/promises";
import {runInNewContext} from "node:vm";
const window={};
for(const p of ["v2/search-pages-1.js","v2/search-pages-2.js","v2/search-faq-data.js","v2/search-core.js"]){
 runInNewContext(await readFile(p,"utf8"),{window,Set,Object,String});
}
const engine=window.TwojaSprawaSearch;
const entries=engine.entries;
const categories=["szkody","swiadczenie","renty","skd","franki","przesyl","inne"];
const idSet=new Set(entries.map(e=>e.id));
const faq=await readFile("v2/faq.html","utf8");
const homepage=await readFile("v2/index.html","utf8");
const indexHtml=await readFile("v2/szukaj.html","utf8");
const tests=[];
const add=(label,fn)=>tests.push({label,fn});
for(const [idx,e] of entries.entries()){
 const prefix=String(idx+1).padStart(2,"0");
 const found=q=>engine.search(q,"all",100).some(r=>r.id===e.id);
 const tokens=engine.normalize(e.title).split(" ").filter(Boolean);
 const alternate=categories.find(c=>c!==e.category);
 add(prefix+" id",()=>assert.match(e.id,/^(?:page:v2\/|faq:)/));
 add(prefix+" safe path",()=>assert.ok(e.href.startsWith("/v2/")&&!e.href.includes("..")&&!e.href.includes("://")));
 add(prefix+" title",()=>assert.ok(e.title.trim().length>=12));
 add(prefix+" description",()=>assert.ok(e.description.trim().length>=40&&e.description.length<=250));
 add(prefix+" category",()=>assert.ok(categories.includes(e.category)));
 add(prefix+" keywords",()=>assert.ok(e.keywords.trim().length>=8));
 add(prefix+" unique id",()=>assert.ok(idSet.has(e.id)&&entries.filter(x=>x.id===e.id).length===1));
 add(prefix+" actual target",async()=>{
  if(e.id.startsWith("faq:")){
   assert.ok(faq.includes('id="'+e.id.slice(4)+'"'));
  }else{
   await access(e.id.slice(5));
  }
 });
 add(prefix+" original title lookup",()=>assert.ok(found(e.title)));
 add(prefix+" uppercase title lookup",()=>assert.ok(found(e.title.toLocaleUpperCase("pl-PL"))));
 add(prefix+" accent-free lookup",()=>assert.ok(found(engine.normalize(e.title))));
 add(prefix+" lowercase title lookup",()=>assert.ok(found(e.title.toLocaleLowerCase("pl-PL"))));
 add(prefix+" trimmed whitespace lookup",()=>assert.ok(found("  "+e.title+"   ")));
 add(prefix+" category match",()=>assert.ok(engine.search(e.title,e.category,100).some(x=>x.id===e.id)));
 add(prefix+" exclude another category",()=>assert.ok(!engine.search(e.title,alternate,100).some(x=>x.id===e.id)));
 add(prefix+" two-word lookup",()=>assert.ok(found(tokens.slice(0,2).join(" "))));
}
add("G01 62 real search records",()=>assert.equal(entries.length,62));
add("G02 38 indexed pages",()=>assert.equal(entries.filter(e=>e.id.startsWith("page:")).length,38));
add("G03 24 anchored FAQ answers",()=>assert.equal(entries.filter(e=>e.id.startsWith("faq:")).length,24));
add("G04 62 unique URLs",()=>assert.equal(new Set(entries.map(e=>e.href)).size,62));
add("G05 service grid precedes team",()=>assert.ok(homepage.indexOf('<section id="uslugi"')<homepage.indexOf('class="wrap team-spotlight')));
add("G06 six featured service links",()=>{
 const x=homepage.indexOf('class="grid primary-services"');
 const y=homepage.indexOf('<details class="service-extra"',x);
 assert.equal((homepage.slice(x,y).match(/class="card primary-card/g)||[]).length,6);
});
add("G07 CHF visible in search and homepage",()=>assert.ok(entries.some(e=>e.category==="franki")&&homepage.includes('/v2/uslugi/kredyty-frankowe.html')));
add("G08 search scripts without tracking",()=>{
 const source=window.TwojaSprawaSearch;
 assert.ok(source&&indexHtml.includes('src="/v2/search-core.js"'));
 assert.ok(!/google-analytics|gtag\(|fbq\(/i.test(indexHtml));
});
if(tests.length!==1000)throw Error("Exactly 1000 checks expected, generated "+tests.length);
let passed=0;
for(const [i,t] of tests.entries()){
 try{await t.fn();passed++;if((i+1)%50===0)console.log("REGRESSION_1000_PROGRESS "+(i+1)+"/1000");}
 catch(err){console.error("FAIL "+(i+1)+"/1000 "+t.label+": "+err.message);process.exitCode=1;}
}
console.log("REGRESSION_1000_RESULT: "+passed+"/1000; 62 entries, 16 distinct checks per entry and eight global checks; no real submissions.");
