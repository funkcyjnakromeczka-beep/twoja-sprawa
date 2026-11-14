#!/usr/bin/env node
/** Test statycznego kontaktu bez JavaScript; żadnych połączeń sieciowych ani zgłoszeń. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const cases=[
  {
    "path": "v2/uslugi/szkody-gornicze.html",
    "email": "wojciech.obieglo@votum-ds.pl",
    "phone": "tel:+48796441345"
  },
  {
    "path": "v2/uslugi/swiadczenie-wspierajace.html",
    "email": "paulina.chandrala@votum-ds.pl",
    "phone": "tel:+48500171531"
  },
  {
    "path": "v2/uslugi/kredyty-pln.html",
    "email": "wojciech.obieglo@votum-ds.pl",
    "phone": "tel:+48796441345"
  },
  {
    "path": "v2/uslugi/renty-powypadkowe.html",
    "email": "paulina.chandrala@votum-ds.pl",
    "phone": "tel:+48500171531"
  },
  {
    "path": "v2/uslugi/kredyty-frankowe.html",
    "email": "wojciech.obieglo@votum-ds.pl",
    "phone": "tel:+48796441345"
  },
  {
    "path": "v2/uslugi/sluzebnosc-przesylu.html",
    "email": "wojciech.obieglo@votum-ds.pl",
    "phone": "tel:+48796441345"
  },
  {
    "path": "v2/uslugi/wypadki-komunikacyjne.html",
    "email": "wojciech.obieglo@votum-ds.pl",
    "phone": "tel:+48796441345"
  },
  {
    "path": "v2/uslugi/wypadki-przy-pracy.html",
    "email": "wojciech.obieglo@votum-ds.pl",
    "phone": "tel:+48796441345"
  },
  {
    "path": "v2/uslugi/wypadki-w-rolnictwie.html",
    "email": "wojciech.obieglo@votum-ds.pl",
    "phone": "tel:+48796441345"
  },
  {
    "path": "v2/uslugi/szkody-na-nieruchomosci.html",
    "email": "wojciech.obieglo@votum-ds.pl",
    "phone": "tel:+48796441345"
  },
  {
    "path": "v2/uslugi/odszkodowanie-za-halas.html",
    "email": "wojciech.obieglo@votum-ds.pl",
    "phone": "tel:+48796441345"
  },
  {
    "path": "v2/uslugi/pomoc-w-sprawach-karnych.html",
    "email": "wojciech.obieglo@votum-ds.pl",
    "phone": "tel:+48796441345"
  },
  {
    "path": "v2/uslugi/nieudany-urlop.html",
    "email": "wojciech.obieglo@votum-ds.pl",
    "phone": "tel:+48796441345"
  },
  {
    "path": "v2/kampanie/skd.html",
    "email": "wojciech.obieglo@votum-ds.pl",
    "phone": "tel:+48796441345"
  },
  {
    "path": "v2/kampanie/szkody-gornicze.html",
    "email": "wojciech.obieglo@votum-ds.pl",
    "phone": "tel:+48796441345"
  },
  {
    "path": "v2/kampanie/swiadczenie-wspierajace.html",
    "email": "paulina.chandrala@votum-ds.pl",
    "phone": "tel:+48500171531"
  }
];
for(const item of cases){
 const html=await readFile(item.path,"utf8");
 const mounts=[...html.matchAll(/<div\s+data-contact-form>([\s\S]*?)<\/div>/g)];
 assert.equal(mounts.length,1,item.path+": brak pojedynczego kontenera formularza");
 const fallback=mounts[0][1];
 assert.ok(fallback.includes('class="contact-load-fallback"'),item.path+": nie wyświetla komunikatu bez JS");
 assert.ok(fallback.includes('href="'+item.phone+'"'),item.path+": nie zawiera telefonu bez JS");
 assert.ok(fallback.includes('href="mailto:'+item.email+'?subject='),item.path+": nie zawiera adresu doradcy bez JS");
 assert.ok(!html.includes("twojasprawa_votum@outlook.com"),item.path+": zawiera przestarzałą ogólną skrzynkę");
}
const home=await readFile("v2/index.html","utf8");
assert.ok(home.includes('href="mailto:wojciech.obieglo@votum-ds.pl'),"Strona główna: brak e-maila Wojciecha");
assert.ok(home.includes('href="mailto:paulina.chandrala@votum-ds.pl'),"Strona główna: brak e-maila Pauliny");
assert.ok(!home.includes("twojasprawa_votum@outlook.com"),"Strona główna: przestarzała ogólna skrzynka");
console.log("FALLBACK_CONTACT_OK: "+cases.length+" podstron ma bezpośredni telefon i e-mail bez JS; główna zawiera oba kontakty.");
