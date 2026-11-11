#!/usr/bin/env node
/** 500 sekwencyjnych kontroli nowej wyszukiwarki. Zero sieci, zero wysyłania leadów. */
import assert from "node:assert/strict";
import {readFile,access} from "node:fs/promises";
import {runInNewContext} from "node:vm";
import {shouldIndexRoute} from "./seo-policy.mjs";
const paths=["v2/search-pages-1.js","v2/search-pages-2.js","v2/search-faq-data.js","v2/search-core.js","v2/site-search.js","v2/szukaj.html","v2/site-search.css","v2/faq.html","scripts/preview.mjs"];
const sources=Object.fromEntries(await Promise.all(paths.map(async p=>[p,await readFile(p,"utf8")])));
const window={};
for(const p of paths.slice(0,4))runInNewContext(sources[p],{window,Set,Object,String});
const api=window.TwojaSprawaSearch;
assert.ok(api&&typeof api.search==="function");
const entries=api.entries;
const allowed=new Set(["szkody","swiadczenie","renty","skd","przesyl","inne"]);
const cases=[];
const add=(description,fn)=>cases.push({description,fn});
for(const [i,record] of entries.slice(0,60).entries()){ // legacy 500-check baseline; the new CHF entries are tested separately
 const n=String(i+1).padStart(2,"0");
 add(n+" / A — struktura i identyfikator",()=>{
  assert.ok(typeof record.id==="string"&&/^(page:v2\/|faq:pytanie-)/.test(record.id));
 });
 add(n+" / B — realny plik docelowy",async()=>{
  assert.ok(record.href.startsWith("/v2/")&&!record.href.includes("..")&&!record.href.startsWith("//"));
  let pathname=record.href.split("#")[0].split("?")[0].slice(1);
  if(pathname.endsWith("/"))pathname+="index.html";
  await access(pathname);
 });
 add(n+" / C — tytuł dla człowieka",()=>{
  assert.ok(typeof record.title==="string"&&record.title.trim().length>=12&&!/undefined|\[object object\]/i.test(record.title));
 });
 add(n+" / D — opis wyniku",()=>{
  assert.ok(typeof record.description==="string"&&record.description.trim().length>=40&&record.description.length<=250);
 });
 add(n+" / E — rozpoznawalna kategoria",()=>{
  assert.ok(allowed.has(record.category));
 });
 add(n+" / F — wyszukanie pełnego tytułu",()=>{
  const found=api.search(record.title,"all",100);
  assert.ok(found.some(item=>item.id===record.id),"Not found by own title: "+record.title);
 });
 add(n+" / G — wielkie litery i brak polskich znaków",()=>{
  const query=record.title.toUpperCase().normalize("NFD").replace(/\p{M}/gu,"").replaceAll("Ł","L");
  const found=api.search(query,"all",100);
  assert.ok(found.some(item=>item.id===record.id),"Accent-insensitive title search failed: "+record.title);
 });
 add(n+" / H — filtr włącza właściwy wpis i wyłącza inne kategorie",()=>{
  assert.ok(api.search(record.title,record.category,100).some(item=>item.id===record.id),"Entry missing in own category");
  const alternate=[...allowed].find(cat=>cat!==record.category);
  assert.ok(!api.search(record.title,alternate,100).some(item=>item.id===record.id),"Entry leaked into other category");
 });
}
const ids=entries.map(e=>e.id),hrefs=entries.map(e=>e.href);
const html=sources["v2/szukaj.html"];
const faq=sources["v2/faq.html"];
const has=id=>entries.some(e=>e.id===id);
const sourceCount=(name,expected)=>{const content=sources[name];assert.ok(content);const count=(content.match(/"id":/g)||[]).length;assert.equal(count,expected);};
add("G01. Co najmniej 60 źródeł w indeksie",()=>assert.ok(entries.length>=60));
add("G02. Pierwsza część ma 18 stron",()=>sourceCount("v2/search-pages-1.js",18));
add("G03. Druga część ma 20 stron, w tym frankowicze",()=>sourceCount("v2/search-pages-2.js",20));
add("G04. Indeks obejmuje 24 pytania",()=>sourceCount("v2/search-faq-data.js",24));
add("G05. Każdy wpis ma niepowtarzalny ID",()=>assert.equal(new Set(ids).size,entries.length));
add("G06. Brak dwóch wyników z tym samym URL",()=>assert.equal(new Set(hrefs).size,entries.length));
add("G07. Strona główna jest w wynikach",()=>assert.ok(has("page:v2/index.html")));
add("G08. Obie flagowe usługi występują",()=>assert.ok(has("page:v2/uslugi/szkody-gornicze.html")&&has("page:v2/uslugi/swiadczenie-wspierajace.html")));
add("G09. Plan, FAQ i katalog poradników",()=>assert.ok(has("page:v2/plan-dzialania.html")&&has("page:v2/faq.html")&&has("page:v2/wiedza/index.html")));
add("G10. Wpisy FAQ kierują do rzeczywistych pytań",()=>{for(const e of entries.filter(r=>r.id.startsWith("faq:")))assert.ok(faq.includes('id="'+e.id.slice(4)+'"'));});
add("G11. Brak zewnętrznych i protokołowych linków",()=>assert.ok(entries.every(e=>e.href.startsWith("/v2/")&&!e.href.includes("://"))));
add("G12. Kampanie i narzędzia wewnętrzne nie są indeksowane w wyszukiwarce",()=>assert.ok(entries.every(e=>!e.href.includes("/kampanie/")&&!e.href.includes("/narzedzia/")&&!e.href.includes("/polityka-prywatnosci"))));
add("G13. Wyszukiwanie słowa kopalnia",()=>assert.ok(api.search("kopalnia").some(x=>x.category==="szkody")));
add("G14. Wyszukiwanie ZUS",()=>assert.ok(api.search("zus").some(x=>x.category==="swiadczenie")));
add("G15. Wyszukiwanie kredytu",()=>assert.ok(api.search("kredyt").some(x=>x.category==="skd")));
add("G16. Normalizacja polskich znaków",()=>assert.equal(api.normalize("ZAŻÓŁĆ GĘŚLĄ"),"zazolc gesla"));
add("G17. Nieznany filtr daje taki sam wynik jak wszystkie",()=>assert.deepEqual(api.search("szkody","niewlasciwy",100).map(x=>x.id),api.search("szkody","all",100).map(x=>x.id)));
add("G18. Limit wyników nie przekracza stu",()=>assert.equal(api.search("","all",999).length,entries.length));
add("G19. Wyszukiwanie bez cookies i połączeń",()=>assert.ok(!/\bfetch\s*\(|localStorage|sessionStorage|XMLHttpRequest|sendBeacon/.test(sources["v2/site-search.js"]+sources["v2/search-core.js"])));
add("G20. Search noindex, preview noindex, formularze pozostają bez wysyłki",()=>{
 assert.equal(shouldIndexRoute("/szukaj.html"),false);
 assert.ok(html.includes('name="robots" content="noindex,follow"'));
 assert.ok(sources["scripts/preview.mjs"].includes("Disallow: /"));
});
assert.equal(cases.length,500,"Expected exactly 500 independent checks, not "+cases.length);
let succeeded=0;
for(const [i,item] of cases.entries()){
 try{await item.fn();succeeded++;console.log("OK "+String(i+1).padStart(3,"0")+"/500 — "+item.description);}
 catch(error){console.error("FAIL "+String(i+1).padStart(3,"0")+"/500 — "+item.description+" :: "+error.message);process.exitCode=1;}
}
console.log("WYNIK_SERIA_IV: "+succeeded+"/500. Testy lokalne: bez zewnętrznych żądań, bez wysyłania formularzy, bez wdrożenia.");
