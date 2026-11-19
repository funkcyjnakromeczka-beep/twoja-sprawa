#!/usr/bin/env node
/** Statyczne zabezpieczenie ścieżek SKD, bez danych klientów lub połączeń sieciowych. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const read=path=>readFile(path,"utf8");
const html=await read("v2/uslugi/kredyty-pln.html");
const css=await read("v2/skd-journey.css");
const code=await read("v2/contact.js");
const guide=await read("v2/poradniki/skd-kredyt-pln-lista-kontrolna.html");
assert.ok(html.includes('href="/v2/skd-journey.css"'),"Karty SKD wymagają osobnych stylów");
const section=html.match(/<section class="skd-journey wrap" id="wybierz-etap-kredytu"[\s\S]*?<\/section>/)?.[0];
assert.ok(section&&section.includes('aria-labelledby="skd-journey-title"'),"Czytelny nagłówek sekcji i działający link kotwiczny");
const codes=[...section.matchAll(/href="\/v2\/uslugi\/kredyty-pln\.html\?etap=([a-z]+)#formularz"/g)].map(m=>m[1]);
assert.deepEqual(codes,["splata","splacony","wczesniejsza","odmowa"],"Cztery jawne etapy kredytu");
assert.equal((section.match(/class="skd-journey-card"/g)||[]).length,4);
for(const codeName of codes)assert.ok(code.includes(codeName+':"'),"Brak jawnego kodu w formularzu: "+codeName);
assert.ok(code.includes('select.value==="Kredyt w PLN / SKD"?"Na jakim etapie jest sprawa kredytu PLN?"'),"Formularz musi odróżniać PLN od CHF");
assert.ok(html.includes('id="formularz"')&&html.includes('data-service="Kredyt w PLN / SKD"'),"Każdy link musi wskazywać prawidłowy formularz");
assert.ok(section.includes('href="tel:+48796441345"'),"Kontakt SKD należy do Wojciecha");
assert.ok(guide.includes('href="tel:+48796441345"')&&!guide.includes('href="tel:+48500171531"'),"Nagłówek checklisty nie może kierować do Pauliny");
assert.ok(guide.includes('href="/v2/uslugi/kredyty-pln.html#wybierz-etap-kredytu"'),"Checklista kieruje do etapu SKD");
assert.ok(css.includes(":focus-visible")&&css.includes("@media(max-width:660px)"),"Karty muszą być dostępne na telefonie i z klawiatury");
assert.ok(html.includes("https://eli.gov.pl/eli/DU/2025/1362/ogl"),"Potwierdzony odnośnik do tekstu jednolitego ustawy");
assert.ok(!/gwarantujemy zwrot|gwarancja zastosowania SKD|100% skuteczności/i.test(section),"Bez obietnic wyniku");
assert.ok(!/fetch\s*\(|localStorage|sessionStorage|document\.cookie|sendBeacon/.test(css),"Brak śledzenia w arkuszu");
console.log("SKD_JOURNEY_OK: 4 ścieżki, prawidłowy numer telefonu, ELI, dostępny widok mobilny i brak danych klientów w URL.");
