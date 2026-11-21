#!/usr/bin/env node
/**
 * Regression checks for hand-edited metadata on the highest-intent pages.
 * Read-only. Run after: SITE_URL=https://twoja-sprawa.pages.dev RELEASE=1 node scripts/build.mjs
 */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const cases = [
  ["kontakt.html", "Kontakt: Wojciech Obiegło i Paulina Chandrała", true],
  ["rekrutacja.html", "Współpraca i rekrutacja przedstawicieli | Twoja Sprawa", true],
  ["plan-dzialania.html", "Plan pierwszych kroków — 6 rodzajów spraw | Twoja Sprawa", true],
  ["szukaj.html", "Wyszukiwarka informacji | Twoja Sprawa", false],
  ["uslugi/renty-powypadkowe.html", "Renty powypadkowe — analiza i podwyższenie | Twoja Sprawa", true],
  ["uslugi/sluzebnosc-przesylu.html", "Służebność przesyłu — słup na działce | Twoja Sprawa", true],
  ["lokalnie/szkody-gornicze-lubin.html", "Szkody górnicze Lubin — pęknięcia ścian | Twoja Sprawa", true],
  ["lokalnie/szkody-gornicze-polkowice.html", "Szkody górnicze Polkowice — szkody posesji | Twoja Sprawa", true],
  ["uslugi/odszkodowanie-za-halas.html", "Hałas i roszczenia właściciela | Twoja Sprawa", true],
  ["uslugi/pomoc-w-sprawach-karnych.html", "Sprawa karna — zakres pomocy | Twoja Sprawa", true],
  ["uslugi/szkody-na-nieruchomosci.html", "Szkody na nieruchomości — analiza | Twoja Sprawa", true],
  ["uslugi/wypadki-komunikacyjne.html", "Wypadki komunikacyjne — roszczenia | Twoja Sprawa", true],
  ["uslugi/wypadki-przy-pracy.html", "Wypadek przy pracy — dokumenty | Twoja Sprawa", true],
  ["uslugi/wypadki-w-rolnictwie.html", "Wypadek w rolnictwie — dokumenty | Twoja Sprawa", true],
  ["wiedza/drobne-pekniecia-szkody-gornicze.html", "Drobne pęknięcia a szkody górnicze — Lubin i Polkowice", true],
  ["wiedza/swiadczenie-wspierajace-2026-wzon-zus.html", "Świadczenie wspierające 2026 — WZON i ZUS", true],
  ["wiedza/renta-powypadkowa-dokumenty.html", "Renta powypadkowa: dokumenty i podwyższenie | Twoja Sprawa", true]
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
const recruit=await readFile("v2/rekrutacja.html","utf8");
assert.ok(recruit.includes('class="recruitment-page"'),"Recruitment responsive styling hook missing");
const contrastCss=await readFile("v2/visual-contrast.css","utf8");
assert.ok(contrastCss.includes("body.recruitment-page .subhero h1"),
 "Recruitment heading must use an explicit responsive typography rule");
const recruitHero=recruit.split('<section class="subhero">')[1]?.split("</section>")[0]||"";
assert.ok(recruitHero.includes('aria-label="Kontakt w sprawie współpracy"'),
 "Recruitment must offer directly accessible contact actions in the hero");
assert.ok(recruitHero.includes('mailto:wojciech.obieglo@votum-ds.pl?subject=') &&
 recruitHero.includes('href="tel:+48796441345"'),
 "Recruitment first-screen CTAs must lead to the verified contact details");
const recruitFaq=recruit.split('<section aria-labelledby="rekrutacja-faq">')[1]?.split("</section>")[0]||"";
assert.equal((recruitFaq.match(/<details>/g)||[]).length,4,
 "Recruitment page must answer four real collaboration questions");
for(const term of ["własnym samochodem","wojciech.obieglo@votum-ds.pl","przedstawiciela","gwarancji wynagrodzenia"]){
 assert.ok(recruit.includes(term),"Recruitment trust/access information missing: "+term);
}
console.log("CORE_METADATA_AND_CHF_FORM_OK: "+cases.length+" pages, CHF service lists and recruitment FAQ verified");
