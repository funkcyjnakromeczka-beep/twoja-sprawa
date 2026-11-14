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
 // Spójność metadanych: duplikaty mogą dawać sprzeczne podglądy linków.
 const head=html.slice(0,html.indexOf("</head>"));
 const metaItems=[...head.matchAll(/<meta\b[^>]*>/gi)].map(m=>m[0]);
 for(const key of ["description","og:description","og:title","og:url","robots","twitter:card"]){
  const matches=metaItems.filter(tag=>tag.includes('name="'+key+'"')||tag.includes('property="'+key+'"'));
  if(matches.length>1)warn(page+": powielony znacznik "+key+" ("+matches.length+" szt.)");
 }
 const focusPages=new Set(["v2/index.html","v2/uslugi/szkody-gornicze.html","v2/uslugi/swiadczenie-wspierajace.html"]);
 if(focusPages.has(page)){
  const title=html.match(/<title>([^<]*)<\/title>/i)?.[1]||"";
  const description=head.match(/<meta name="description" content="([^"]*)"/i)?.[1]||"";
  if(title.length<30||title.length>60)warn(page+": tytuł SEO poza przyjętym zakresem 30–60 znaków: "+title.length);
  if(description.length<70||description.length>160)warn(page+": opis SEO poza przyjętym zakresem 70–160 znaków: "+description.length);
 }

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

const mobileNavLabels=[
 'aria-label="Szkody górnicze — zgłoś uszkodzenia do wstępnej analizy"',
 'aria-label="Świadczenie wspierające — sprawy WZON i ZUS, przejdź do zgłoszenia"',
 'Świadczenie wspierające</a>'
];
for(const label of mobileNavLabels){
 if(!home.includes(label))warn("Strona główna: niepełna dostępna nazwa przycisku mobilnego: "+label);
}
const stickyCtaCss=read("v2/mobile-service-cta.css");
if(!stickyCtaCss.includes('body:has(.mobile-service-cta:not([hidden])){padding-bottom:')||
 !stickyCtaCss.includes('body.premium-subpage:has(.mobile-service-cta:not([hidden])) .chat-assistant')){
 warn("Mobilny pasek kontaktu: po ukryciu pozostaje zbędne miejsce lub przesunięcie chatbota");
}

// Source HTML also needs reliable contact metadata if published directly,
// even though the normal production compiler regenerates the SEO graph.
if(!home.includes('<link rel="canonical" href="https://twoja-sprawa.pages.dev/">'))
 warn("Strona glowna: brak zrodłowego canonical");
const homeGraphs=[...home.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
 .map(match=>{try{return JSON.parse(match[1]);}catch{return {};}});
const homeAgency=homeGraphs.flatMap(graph=>graph["@graph"]||[])
 .find(item=>item["@type"]==="Organization"&&item.name==="SuccessTree OBIEGŁO WOJCIECH");
if(!homeAgency||!Array.isArray(homeAgency.contactPoint)||
 !homeAgency.contactPoint.some(item=>item.telephone==="+48 796 441 345"&&item.email==="wojciech.obieglo@votum-ds.pl")||
 !homeAgency.contactPoint.some(item=>item.telephone==="+48 500 171 531"&&item.email==="paulina.chandrala@votum-ds.pl"))
 warn("Strona glowna: brak zgodnych danych strukturalnych obu doradcow");
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


const diagnostic = read("v2/narzedzia/test-formularzy.html");
if(!diagnostic.includes('["Szkody — zmiana z karty","/kampanie/szkody-gornicze",false,"","szkody"]')||
   !diagnostic.includes('["Świadczenie — zmiana z karty","/kampanie/swiadczenie-wspierajace",false,"","swiadczenie"]')||
   !diagnostic.includes('directEmail.getAttribute("href")||"").startsWith("mailto:"+emailAddress+"?")'))
 warn("Diagnostyka: brakuje testu przełączenia doradcy z kart kampanii");
if(!diagnostic.includes('["Świadczenie — kontakt do Pauliny","/kampanie/swiadczenie-wspierajace",false,"Świadczenie wspierające"]')||
   !diagnostic.includes('a[href^="mailto:paulina.chandrala@votum-ds.pl"]')||
   !diagnostic.includes('a[href="tel:+48500171531"]'))
 warn("Diagnostyka: brak bezpiecznej kontroli konsultantki w formularzu świadczenia wspierającego");

if(!diagnostic.includes('["SKD — walidacja numeru","/kampanie/skd",true,"","","skd-phone"]')||
   !diagnostic.includes('["Szkody — e-mail bez telefonu","/kampanie/szkody-gornicze",false,"","","email-only"]')||
   !diagnostic.includes('const acceptsValid=tel.checkValidity();')||
   !diagnostic.includes('const good=!tel.required&&tel.checkValidity()&&email.checkValidity();'))
 warn("Diagnostyka: brak walidacji numeru SKD lub sprawy z samym adresem e-mail");

const campaignQuickBar=read("v2/campaign-mobile-actions.js");
if(!campaignQuickBar.includes('const formHasFocus=formRegion.contains(document.activeElement);')||
   !campaignQuickBar.includes('bar.hidden=overlapsForm||formHasFocus;'))
 warn("Kampanie: dolny pasek kontaktu może zasłaniać aktywny formularz");
const campaignStyles=read("v2/styles.css");
if(!campaignStyles.includes(".campaign-mobile-actions[hidden]{display:none!important}")||
   !campaignStyles.includes(".campaign-page:has(.campaign-mobile-actions:not([hidden]))"))
 warn("Kampanie: dolny pasek kontaktowy nie zwalnia miejsca, gdy jest ukryty");
for(const path of [
 "v2/kampanie/szkody-gornicze.html",
 "v2/kampanie/swiadczenie-wspierajace.html",
 "v2/kampanie/skd.html"
]){
 if(!read(path).includes('<script src="/v2/campaign-mobile-actions.js" defer></script>'))
  warn(path+": brak kontrolera mobilnego paska kontaktowego");
}
const contact = read("v2/contact.js");
if(!contact.includes('isSKD||prefer==="Telefon"'))
 warn("Formularz: brak wymogu telefonu dla SKD");
if(!contact.includes("wojciech.obieglo@votum-ds.pl") || !contact.includes("paulina.chandrala@votum-ds.pl"))
 warn("Formularz: brak przypisanych adresów doradców");

if(!contact.includes("let refreshDirectContact=()=>{};")||
   !contact.includes("refreshDirectContact=updateDirect;updateDirect();")||
   !contact.includes("form.reset();updateAdvisor();updatePeople();refreshDirectContact();"))
 warn("Formularz: po resecie zgłoszenia awaryjny telefon/e-mail mogą wskazywać niewłaściwego doradcę");

if(!contact.includes('select.value="Szkody górnicze";updateAdvisor();updatePeople();refreshDirectContact();')||
   !contact.includes('select.value="Świadczenie wspierające";')||
   !contact.includes('updateAdvisor();updatePeople();refreshDirectContact();updateGuide();updateStage();updateDamageArea();syncContactPreference();'))
 warn("Formularz: po wyborze z karty kampanii awaryjny kontakt może wskazywać inną osobę");
if(!contact.includes('const callbackNumber=entered&&validPhoneNumber(entered)?entered:"[wpisz numer]";')||
   !contact.includes('directMail.addEventListener("click",()=>{'))
 warn("Formularz SKD: bezpośredni e-mail nie wykorzystuje zweryfikowanego numeru telefonu");
if(!contact.includes("updateDamageArea();damageArea.value=choice;syncCityQuick();")||
   !contact.includes("syncCityQuick();\n    if(stageWrap.hidden)return;"))
 warn("Formularz: karty kampanii nie aktualizują wyboru miejscowości przy zmianie usługi");
if(!contact.includes("phoneFieldLabel.textContent=isSKD||prefer")||
   !contact.includes('emailFieldLabel.textContent=prefer==="E-mail"'))
 warn("Formularz: brak aktualizacji etykiet wymaganych pól telefonu i e-maila");

if(!contact.includes('routingNote.className="contact-routing-note"')||
   !contact.includes('directMail.className="contact-advisor-direct-email"')||
   !contact.includes("advisor_email jest metadana")||
   !contact.includes("nie oznacza automatycznego doręczenia wiadomości bezpośrednio do doradcy"))
 warn("Formularz: myląca informacja o bezpośrednim doręczeniu do doradcy zamiast na skrzynkę Web3Forms");
const contactStyles=read("v2/styles.css");
if(!contactStyles.includes(".contact-advisor .contact-routing-note"))
 warn("Formularz: brakuje czytelnego opisu sposobu kierowania wiadomości");
if(!contact.includes("api.web3forms.com/submit"))
 warn("Formularz: brak połączenia z aktualnym operatorem zgłoszeń");

// SKD has a dedicated contract/callback landing. Both guides must use it
// rather than sending a qualified visitor to the generic contact page.
const navigatorJS = read("v2/service-navigator.js");
const chatbotJS = read("v2/chat-assistant.js");
const skdPage = read("v2/kampanie/skd.html");
if(!navigatorJS.includes('service:"kredyty-pln.html",landing:"kampanie/skd.html"'))
 warn("Przewodnik: SKD nie kieruje do dedykowanej strony przesylania umowy");
if(!chatbotJS.includes('form:"kampanie/skd.html"+params,alias:"skd"'))
 warn("Chatbot: SKD nie kieruje do dedykowanej strony przesylania umowy");
if(!skdPage.includes('id="formularz"')||!skdPage.includes('data-service="Kredyt w PLN / SKD"'))
 warn("Kampania SKD: brak celu formularza lub wyboru uslugi");

console.log("Twoja Sprawa: "+jsCount+" plików JS, "+critical.length+" stron, "+inlineCount+" skryptów inline/JSON-LD, "+checkedLinks+" odnośników lokalnych.");
if(errors.length){
 for(const error of errors)console.error("✖ "+error);
 console.error("Niepowodzenie: "+errors.length+" błędów.");
 process.exitCode=1;
}else console.log("✓ Kontrola plików projektu zakończona bez błędów.");
