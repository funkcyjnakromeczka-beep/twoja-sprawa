#!/usr/bin/env node
/* Zero-cost source checks for the static Twoja Sprawa site.
   No network requests, no packages, no client or Web3Forms data. */
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "v2");
const errors = [];
let jsCount = 0;
let inlineCount = 0;
let checkedLinks = 0;
const warn = message => errors.push(message);
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const exists = relative => fs.existsSync(path.join(root, relative));
const walk = directory => fs.readdirSync(directory, {withFileTypes: true}).flatMap(item => {
 const location = path.join(directory, item.name);
 return item.isDirectory() ? walk(location) : [location];
});

if(!fs.existsSync(output)){
 console.error("Brak katalogu publikacji v2/");
 process.exit(1);
}
for(const filename of walk(output)){
 if(!filename.endsWith(".js")) continue;
 try {
  new vm.Script(fs.readFileSync(filename,"utf8"), {filename});
  jsCount++;
 } catch(error) {
  warn("Błąd składni JS: "+path.relative(root,filename)+": "+error.message);
 }
}

const critical = [
 "v2/index.html",
 "v2/kontakt.html",
 "v2/faq.html",
 "v2/o-nas.html",
 "v2/uslugi/szkody-gornicze.html",
 "v2/uslugi/swiadczenie-wspierajace.html",
 "v2/uslugi/kredyty-pln.html",
 "v2/uslugi/kredyty-frankowe.html",
 "v2/kampanie/skd.html",
 "v2/kampanie/szkody-gornicze.html",
 "v2/kampanie/swiadczenie-wspierajace.html",
 "v2/lokalnie/szkody-gornicze-lubin.html",
 "v2/lokalnie/szkody-gornicze-polkowice.html",
 "v2/narzedzia/test-formularzy.html"
];

for(const page of critical){
 if(!exists(page)) {warn("Brak strony: "+page);continue;}
 const html = read(page);
 const h1 = [...html.matchAll(/<h1\b/gi)].length;
 if(h1 !== 1) warn(page+": wymagana dokładnie jedna etykieta H1 (znaleziono "+h1+")");
 if(!/<html[^>]+lang="pl"/i.test(html)) warn(page+": brak lang=pl");
 const internalLinks = [...html.matchAll(/\b(?:href|src)=["'](\/v2\/[^"']+)["']/gi)];
 for(const match of internalLinks){
  const clean = match[1].replace(/&amp;/g,"&").split(/[?#]/)[0];
  let relative;
  try{relative=decodeURIComponent(clean).slice(1);}catch{warn(page+": niepoprawny URL "+clean);continue;}
  if(relative.endsWith("/")) relative += "index.html";
  if(!exists(relative)) warn(page+": brak zasobu "+clean);
  checkedLinks++;
 }
 for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
  const attrs = match[1];
  if(/\bsrc\s*=/.test(attrs))continue;
  try{
   if(/\btype=["']application\/ld\+json["']/i.test(attrs)) JSON.parse(match[2]);
   else if(!/\btype=["']module["']/i.test(attrs))new vm.Script(match[2],{filename:page+" (inline)"});
   inlineCount++;
  }catch(error){warn(page+": niepoprawny skrypt inline/JSON-LD: "+error.message)}
 }
}

const home = read("v2/index.html");
const primary = [...home.matchAll(/class="card primary-card (mining-featured|support-featured|skd-featured)"/g)].map(m=>m[1]);
if(primary.join(",") !== "mining-featured,support-featured,skd-featured")
 warn("Na stronie głównej kolejność głównych usług musi być: szkody, świadczenie, SKD. Jest: "+primary.join(","));

const faq = read("v2/faq.html");
const questions = [...faq.matchAll(/<article class="faq-card" data-faq-category="([^"]+)"/g)].map(m=>m[1]);
if(questions.length !== 24)warn("FAQ: oczekiwano 24 pytań; znaleziono "+questions.length);
const sequence = [...new Set(questions)];
if(sequence.join(",") !== "szkody,swiadczenie,skd,renty,przesyl,kontakt")
 warn("FAQ: nieprawidłowa kolejność kategorii "+sequence.join(","));
for(const asset of ["/v2/faq.js","/v2/faq.css","/v2/faq-share-v1.js","/v2/faq-share-v1.css"]){
 if(!faq.includes('="'+asset+'"'))warn("FAQ nie podłącza "+asset);
}

const contact = read("v2/contact.js");
if(!contact.includes('isSKD||prefer==="Telefon"'))
 warn("Formularz: brak wymogu telefonu dla SKD");
if(!contact.includes("wojciech.obieglo@votum-ds.pl") || !contact.includes("paulina.chandrala@votum-ds.pl"))
 warn("Formularz: brak przypisanych adresów doradców");
if(!contact.includes("api.web3forms.com/submit"))
 warn("Formularz: brak połączenia z aktualnym operatorem zgłoszeń");

console.log("Twoja Sprawa: "+jsCount+" plików JS, "+critical.length+" stron, "+inlineCount+" skryptów inline/JSON-LD, "+checkedLinks+" odnośników lokalnych.");
if(errors.length){
 for(const error of errors)console.error("✖ "+error);
 console.error("Niepowodzenie: "+errors.length+" błędów.");
 process.exitCode=1;
}else console.log("✓ Kontrola plików projektu zakończona bez błędów.");
