#!/usr/bin/env node
/** Seria III: 50 kolejnych kontroli FAQ, nawigacji, prywatności, dostępności i SEO.
 * Czyta tylko pliki. Bez sieci, logowania i wysyłania jakichkolwiek leadów. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {shouldIndexRoute} from "./seo-policy.mjs";
import {toPublicRoute} from "./public-routes.mjs";
const source=async p=>readFile(p,"utf8");
const files=["v2/faq.html","v2/faq.js","v2/faq.css","v2/index.html","v2/wiedza/index.html",
 "v2/uslugi/szkody-gornicze.html","v2/uslugi/swiadczenie-wspierajace.html",
 "v2/plan-dzialania.html","v2/contact.js","v2/llms.txt","scripts/preview.mjs","scripts/build.mjs"];
const contents=Object.fromEntries(await Promise.all(files.map(async p=>[p,await source(p)])));
const faq=contents["v2/faq.html"],js=contents["v2/faq.js"],css=contents["v2/faq.css"],home=contents["v2/index.html"];
const library=contents["v2/wiedza/index.html"],mining=contents["v2/uslugi/szkody-gornicze.html"];
const support=contents["v2/uslugi/swiadczenie-wspierajace.html"];
const pattern=/<article class="faq-card" data-faq-category="([^"]+)" id="([^"]+)"><span class="faq-tag">([^<]+)<\/span><details><summary>([^<]+)<\/summary><div class="faq-answer"><p>([^<]+)<\/p>([\s\S]*?)<\/div><\/details><\/article>/g;
const entries=[...faq.matchAll(pattern)].map(match=>({category:match[1],id:match[2],tag:match[3],question:match[4],answer:match[5],sources:match[6]}));
assert.equal(entries.length,24,"Expected 24 real FAQ entries");
assert.equal(new Set(entries.map(item=>item.id)).size,24,"Question anchors must be unique across reordered categories");
const allowed=new Set(["szkody","swiadczenie","renty","skd","przesyl","kontakt"]);
const checks=[];
const add=(label,test)=>checks.push({label,test});
entries.forEach((item,index)=>{
 add("Pytanie "+String(index+1).padStart(2,"0")+": "+item.question,()=>{
  assert.ok(allowed.has(item.category),"unknown category");
  assert.ok(/^pytanie-[0-9]+-[a-z0-9-]+$/.test(item.id),"invalid stable question anchor");
  assert.ok(item.tag.length>5,"missing category label");
  assert.ok(item.question.length>18,"short question");
  assert.ok(item.answer.length>=73,"answer too short to be useful");
  assert.ok(!/<script|onerror\s*=|javascript:/i.test(item.answer+item.sources),"unsafe inline content");
 });
});
add("25. FAQ widoczne na stronie głównej",()=>assert.ok(home.includes('href="/v2/faq.html"')));
add("26. FAQ połączone z biblioteką poradników",()=>assert.ok(library.includes('href="/v2/faq.html"')));
add("27. Link do FAQ szkód górniczych ze strony usługi",()=>assert.ok(mining.includes('faq.html?temat=szkody')));
add("28. Link do FAQ świadczenia z właściwej podstrony",()=>assert.ok(support.includes('faq.html?temat=swiadczenie')));
add("29. Pojedynczy nagłówek H1",()=>assert.equal((faq.match(/<h1\b/g)||[]).length,1));
add("30. Stan wyników dostępny dla czytnika ekranu",()=>assert.ok(faq.includes('data-faq-count role="status" aria-live="polite"')));
add("31. Filtry o poprawnym stanie aktywności",()=>assert.ok(faq.includes('data-faq-filter="all" type="button" aria-pressed="true"')));
add("32. Dokładnie sześć kategorii pytań",()=>assert.equal(new Set(entries.map(x=>x.category)).size,6));
add("33. Siedem przycisków filtrowania",()=>assert.equal((faq.match(/data-faq-filter="/g)||[]).length,7));
add("34. Ograniczona długość wyszukiwanej frazy",()=>assert.ok(faq.includes('maxlength="100"')));
add("35. Domyślnie ukryty przycisk resetu",()=>assert.ok(faq.includes("data-faq-reset hidden")));
add("36. Układ mobilny jest jednokolumnowy",()=>assert.ok(css.includes("@media(max-width:760px)")&&css.includes("grid-template-columns:1fr")));
add("37. Widoczna klawiaturowa nawigacja focus",()=>assert.ok(css.includes(":focus-visible")));
add("38. Wyszukiwarka bez sieci i przechowywania danych",()=>assert.ok(!/\bfetch\s*\(|localStorage|sessionStorage|XMLHttpRequest|sendBeacon/.test(js)));
add("39. Rozpoznawanie polskich znaków",()=>assert.ok(js.includes('normalize("NFD")')&&js.includes('replaceAll("ł","l")')));
add("40. Lista bezpiecznych filtrów URL",()=>assert.ok(js.includes("known.includes(requested)")&&js.includes('get("temat")')));
add("41. Odnośniki do oficjalnych stron ZUS",()=>assert.ok((faq.match(/https:\/\/www\.zus\.pl\/swiadczenia/g)||[]).length>=4));
add("42. Ochrona kart zewnętrznych",()=>assert.ok(faq.includes('rel="noopener noreferrer"')));
add("43. Trzy miesiące od ostateczności decyzji WZON",()=>assert.ok(faq.includes("3 miesięcy od dnia, w którym decyzja WZON stała się ostateczna")));
add("44. Informacja o zakresie czasowym materiałów",()=>assert.ok(faq.includes("listopad 2026 r.")));
add("45. Ostrzeżenie o wrażliwych danych",()=>assert.ok(faq.includes("numeru PESEL")&&faq.includes("danych o zdrowiu")));
add("46. Transparentne przedstawienie roli SuccessTree",()=>assert.ok(faq.includes("nie oficjalna strona VOTUM ani kancelaria")));
add("47. Działający skrypt formularza na stronie kontaktowej",()=>assert.ok(contents["v2/contact.js"].includes("https://api.web3forms.com/submit")));
add("48. FAQ jest indeksowalne wyłącznie po zatwierdzonym release",()=>{
 assert.equal(shouldIndexRoute("/faq.html"),true);
 assert.equal(toPublicRoute("/faq.html"),"/faq");
 assert.ok(faq.includes('meta name="robots" content="index,follow,max-image-preview:large"'));
});
add("49. Podgląd nie udostępnia indeksacji",()=>assert.ok(contents["scripts/preview.mjs"].includes("noindex,nofollow")&&contents["scripts/preview.mjs"].includes("Disallow: /")));
add("50. Produkcyjny release wymaga trzech zatwierdzeń",()=>{
 const build=contents["scripts/build.mjs"];
 for(const x of ["LEGAL_APPROVED","CONTENT_APPROVED","FORM_APPROVED"])assert.ok(build.includes(x));
 assert.equal(shouldIndexRoute("/404.html"),false);
});
assert.equal(checks.length,50,"Need exactly 50 sequential checks");
let success=0;
for(const [index,check] of checks.entries()){
 try{await check.test();success++;console.log(String(index+1).padStart(2,"0")+" OK "+check.label);}
 catch(e){process.exitCode=1;console.error(String(index+1).padStart(2,"0")+" FAIL "+check.label+": "+e.message);}
}
console.log("SERIA_III: "+success+"/50. Kontrole nie wysłały leadów, nie włączyły indeksacji ani nie wdrożyły zmian na Cloudflare.");
