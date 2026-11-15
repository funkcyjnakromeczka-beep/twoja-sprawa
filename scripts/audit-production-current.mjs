#!/usr/bin/env node
/**
 * Publiczna kontrola aktualnej wersji Twoja Sprawa.
 * Tylko odczyt stron i zasobow. Nie wysyla formularzy ani danych osobowych.
 * Uzycie: node scripts/audit-production-current.mjs
 */
import assert from "node:assert/strict";

const origin="https://twoja-sprawa.pages.dev";
const targets=[
  "/","/robots.txt","/sitemap.xml","/release-info.json","/home-bundle.css","/home-flow.css","/styles.css","/network-brand.css","/mobile-service-cta.css",
  "/contact.js","/campaign-mobile-actions.js","/chat-assistant.js","/service-navigator.js","/kontakt","/faq",
  "/uslugi/szkody-gornicze","/uslugi/swiadczenie-wspierajace",
  "/uslugi/kredyty-pln","/kampanie/skd","/kampanie/szkody-gornicze","/kampanie/swiadczenie-wspierajace","/narzedzia/test-formularzy"
];
const textResponse=async path=>{
  let lastError;
  for(let attempt=0;attempt<3;attempt++){
    try{
      const response=await fetch(origin+path,{
        signal:AbortSignal.timeout(12000),
        headers:{Accept:"text/html,text/css,application/javascript,application/xml,text/plain;q=0.9"}
      });
      if(response.ok){
        const body=await response.text();
        assert.ok(body.length>30,"Pusty zasob "+path);
        return body;
      }
      lastError=new Error("HTTP "+response.status+" "+path);
      if(![429,500,502,503,504].includes(response.status))break;
    }catch(error){lastError=error;}
    if(attempt<2)await new Promise(resolve=>setTimeout(resolve,1000*(attempt+1)));
  }
  throw new Error("Nie mozna pobrac "+path+": "+(lastError?.message||"blad sieci"));
};

const responses=await Promise.all(targets.map(textResponse));
const data=Object.fromEntries(targets.map((path,index)=>[path,responses[index]]));
const home=data["/"], css=data["/home-flow.css"], contact=data["/contact.js"];
assert.ok(data["/mobile-service-cta.css"].includes('body:has(.mobile-service-cta:not([hidden])){padding-bottom:'),
 "Po ukryciu mobilnego CTA nadal jest rezerwowane miejsce");
assert.ok(data["/mobile-service-cta.css"].includes('body.premium-subpage:has(.mobile-service-cta:not([hidden])) .chat-assistant'),
 "Mobilny chatbot jest przesuwany nawet bez aktywnego CTA");


const campaignQuickBar=data["/campaign-mobile-actions.js"];
assert.ok(campaignQuickBar.includes('bar.hidden=overlapsForm||formHasFocus;'),
 "Mobilny pasek kampanii nie ukrywa sie po przejsciu do formularza");
assert.ok(data["/styles.css"].includes(".campaign-mobile-actions[hidden]{display:none!important}")&&
 data["/styles.css"].includes(".campaign-page:has(.campaign-mobile-actions:not([hidden]))"),
 "Ukryty pasek kampanii nadal zajmuje miejsce na telefonie");
for(const path of [
 "/kampanie/szkody-gornicze",
 "/kampanie/swiadczenie-wspierajace",
 "/kampanie/skd"
]){
 assert.ok(data[path].includes('<script src="/campaign-mobile-actions.js" defer></script>'),
  "Kampania bez logiki widocznosci dolnego paska: "+path);
}
const releaseInfo=JSON.parse(data["/release-info.json"]);
assert.equal(releaseInfo.schemaVersion,1,"Nieznana struktura release-info.json");
assert.equal(releaseInfo.site,origin,"Wdrozenie wskazuje inna domene");
assert.equal(releaseInfo.buildScript,"scripts/build.mjs","Brak znacznika poprawnego procesu wdrozenia");
assert.ok(/^\d{4}-\d\d-\d\dT/.test(releaseInfo.builtAt),"Brak daty kompilacji produkcji");
assert.ok(releaseInfo.commit===null||/^[a-f0-9]{40}$/.test(releaseInfo.commit),
 "Nieprawidlowy hash commita wdrozenia");

const must=(condition,message)=>assert.ok(condition,message);
const count=(html,text)=>html.split(text).length-1;
const primary=[
  'class="card primary-card mining-featured"',
  'class="card primary-card support-featured"',
  'class="card primary-card skd-featured"'
];
const positions=primary.map(value=>home.indexOf(value));
must(positions.every(pos=>pos>=0)&&positions.every((pos,index)=>index===0||pos>positions[index-1]),
  "Glowna kolejnosc uslug musi byc: szkody, swiadczenie, SKD");
must(count(home,'class="network-brand-bar"')===1,"Oczekiwano jednej belki partnerow VOTUM");
must(count(home,'class="homepage-partner-strip"')===0,"Wersja produkcyjna zawiera zdublowane logotypy");
for(const topic of ["szkody","swiadczenie","skd"]){
  must(home.includes('data-contact-shortcut="'+topic+'"'),"Brak skrotu formularza "+topic);
}
must(count(home,'data-contact-shortcut="')===3,"Strona glowna powinna miec trzy skroty kontaktu");
must(home.includes('class="mobile-quick-nav"')&&home.includes('data-contact-form'),
  "Brak nawigacji mobilnej lub formularza");
must(css.includes("Mobilna hierarchia 2026-11")&&css.includes(".hero-priority-grid{display:none}"),
  "Najnowsze uproszczenie mobilne nie jest opublikowane");
must(css.includes("Mobilna hierarchia 2026-11: jedno, niepowielone menu trzech głównych usług. */\n@media(max-width:760px)")&&
     css.includes(".premium-v2 .hero-skd-third{display:none}"),
  "Mobilna nawigacja na szerokich telefonach/tabletach nie jest poprawnie wdrozona");
must(css.includes("@media(max-width:420px)")&&
     css.includes(".premium-v2 .mobile-quick-nav>a.mobile-skd-priority{grid-column:1 / -1}"),
  "Niewlasciwy uklad 3 uslug na bardzo waskich ekranach");
must(home.includes('href="/home-bundle.css"')&&
     (home.match(/<link rel="stylesheet"/g)||[]).length===1,
  "Strona glowna powinna korzystac z jednego arkusza CSS");
for(const selector of [".mobile-quick-nav",".network-brand-bar",".contact-advisor",".hero-priority-grid"]){
 must(data["/home-bundle.css"].includes(selector),"Brak stylow w pakiecie: "+selector);
}

const graphs=Array.from(home.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
  match=>JSON.parse(match[1]));
const organizations=graphs.flatMap(graph=>graph["@graph"]||[])
  .filter(item=>item["@type"]==="Organization"&&Array.isArray(item.contactPoint));
must(organizations.length===1,"Brak aktualnych danych strukturalnych SuccessTree");
const company=organizations[0];
must(company.name==="SuccessTree OBIEGŁO WOJCIECH"&&company.email==="wojciech.obieglo@votum-ds.pl",
  "Nieprawidlowe dane firmy w SEO");
for(const [phone,email] of [
  ["+48 796 441 345","wojciech.obieglo@votum-ds.pl"],
  ["+48 500 171 531","paulina.chandrala@votum-ds.pl"]
]){
  must(company.contactPoint.some(person=>person.telephone===phone&&person.email===email),
    "Nieprawidlowy kontakt w danych SEO: "+phone);
}

// Kontrola zgodnosci danych geograficznych uslug z trescia witryny.
for(const [route,expectedArea] of [
 ["/uslugi/szkody-gornicze","Lubin, Polkowice i okolice"],
 ["/uslugi/swiadczenie-wspierajace","Polska"]
]){
 const nodes=[...data[route].matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
   .flatMap(([,raw])=>JSON.parse(raw)["@graph"]||[]);
 const service=nodes.find(node=>node["@type"]==="Service");
 must(service?.areaServed===expectedArea,"Niespojny zasieg Service SEO: "+route);
}

for(const path of ["/","/kontakt","/uslugi/szkody-gornicze","/uslugi/swiadczenie-wspierajace","/uslugi/kredyty-pln","/faq"]){
  const html=data[path];
  const canonical=origin+path;
  must(html.includes('rel="canonical" href="'+canonical+'"'),"Nieprawidlowy canonical: "+path);
  must(html.includes('name="robots" content="index,follow"'),"Strona powinna byc indeksowana: "+path);
  must(html.includes('class="network-brand-bar"'),"Brak partnerow w "+path);
  must(!html.includes('href="/v2/')&&!html.includes('src="/v2/'),"Niepoprawne sciezki /v2/ w "+path);
}
must(data["/kampanie/skd"].includes('name="robots" content="noindex,follow"'),
  "Formularz kampanii SKD powinien byc poza indeksem");
must(data["/kampanie/skd"].includes('mailto:wojciech.obieglo@votum-ds.pl?subject=')&&
     data["/kampanie/skd"].includes('data-contact-form'),
  "Brak kontaktu mailowego i formularza SKD");
must(data["/uslugi/swiadczenie-wspierajace"].includes("Votum-Wsparcie-poziom_zielone.png"),
  "Brak logotypu Votum Wsparcie");
must(data["/kontakt"].includes("paulina.chandrala@votum-ds.pl")&&
     data["/kontakt"].includes("wojciech.obieglo@votum-ds.pl"),
  "Strona kontaktowa nie pokazuje obu doradcow");


must(data["/narzedzia/test-formularzy"].includes('["Szkody — zmiana z karty","/kampanie/szkody-gornicze",false,"","szkody"]')&&
 data["/narzedzia/test-formularzy"].includes('["Świadczenie — zmiana z karty","/kampanie/swiadczenie-wspierajace",false,"","swiadczenie"]'),
 "Diagnostyka produkcyjna nie testuje przelaczania doradcy z kart kampanii");
must(data["/narzedzia/test-formularzy"].includes('["Świadczenie — kontakt do Pauliny","/kampanie/swiadczenie-wspierajace",false,"Świadczenie wspierające"]'),
 "Publiczna diagnostyka nie kontroluje formularza swiadczenia wspierajacego");

must(data["/narzedzia/test-formularzy"].includes('["SKD — walidacja numeru","/kampanie/skd",true,"","","skd-phone"]')&&
     data["/narzedzia/test-formularzy"].includes('["Szkody — e-mail bez telefonu","/kampanie/szkody-gornicze",false,"","","email-only"]'),
 "Publiczna diagnostyka nie zawiera testow numeru SKD i formularza bez telefonu");


must(contact.includes('routingNote.className="contact-routing-note"')&&
     contact.includes('directMail.className="contact-advisor-direct-email"')&&
     contact.includes("advisor_email jest metadana"),
  "Formularz nie odroznia metadanych doradcy od odbiorcy Web3Forms");
must(data["/styles.css"].includes(".contact-advisor .contact-routing-note"),
  "Brak czytelnego objasnienia odbiorcy Web3Forms");
must(contact.includes("api.web3forms.com/submit")&&contact.includes("if(sending)return;"),
  "Wdrozenie formularza jest niekompletne");


must(contact.includes('select.value="Szkody górnicze";updateAdvisor();updatePeople();refreshDirectContact();')&&
     contact.includes('updateAdvisor();updatePeople();refreshDirectContact();updateGuide();updateStage();updateDamageArea();syncContactPreference();'),
  "Przyciski kart kampanii nie odswiezaja danych doradcy");
must(contact.includes('directMail.addEventListener("click",()=>{')&&
     contact.includes('const callbackNumber=entered&&validPhoneNumber(entered)?entered:"[wpisz numer]";'),
  "SKD nie dolacza poprawnego numeru kontaktowego do nowej wiadomosci");
must(contact.includes("form.reset();updateAdvisor();updatePeople();refreshDirectContact();")&&
     contact.includes("refreshDirectContact=updateDirect;updateDirect();"),
  "Po wyslaniu formularza dane doradcy w awaryjnym kontakcie sa nieaktualne");
must(contact.includes("updateDamageArea();damageArea.value=choice;syncCityQuick();")&&
     contact.includes("syncCityQuick();\n    if(stageWrap.hidden)return;"),
  "Karty kampanii nie aktualizuja wyboru miejscowosci");
must(contact.includes("phoneFieldLabel.textContent=isSKD||prefer")&&
     contact.includes('emailFieldLabel.textContent=prefer==="E-mail"'),
  "Brak komunikacji wymaganych danych kontaktowych przy zmianie uslugi");
must(contact.includes('querySelectorAll("[data-contact-shortcut]")'),
  "Przyciski skrotow do formularza nie sa obslugiwane");
must(data["/service-navigator.js"].includes('service:"kredyty-pln.html",landing:"kampanie/skd.html"'),
  "Przewodnik nie prowadzi SKD do dedykowanego formularza");
must(data["/chat-assistant.js"].includes('form:"kampanie/skd.html"+params,alias:"skd"'),
  "Chatbot nie prowadzi SKD do dedykowanego formularza");
must(data["/chat-assistant.js"].includes('key:"skd"'),
  "Asystent nie rozpoznaje SKD");
must(data["/robots.txt"].includes("OAI-SearchBot")&&
     data["/robots.txt"].includes("Sitemap: "+origin+"/sitemap.xml"),
  "Nieprawidlowy robots.txt");

must(data["/kampanie/skd"].includes('class="campaign-mobile-call" href="#formularz" aria-label="Zostaw numer telefonu do analizy SKD"')&&
     data["/kampanie/skd"].includes('class="campaign-mobile-primary" href="mailto:wojciech.obieglo@votum-ds.pl'),
  "Na mobilnej kampanii SKD brakuje dzialania wysylki umowy lub pozostawienia telefonu");
const routes=[...data["/sitemap.xml"].matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]);
for(const route of ["/","/uslugi/szkody-gornicze","/uslugi/swiadczenie-wspierajace",
  "/uslugi/kredyty-pln","/faq"]){
  must(routes.includes(origin+route),"Brak podstrony w sitemap: "+route);
}
must(new Set(routes).size===routes.length,"Duplikaty w sitemap.xml");
must(!routes.includes(origin+"/kampanie/skd"),"Kampania SKD nie moze byc w sitemap");
const faqGraphs=[...data["/faq"].matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
  .flatMap(match=>JSON.parse(match[1])["@graph"]||[]);
const faq=faqGraphs.find(item=>item["@type"]==="FAQPage");
must(faq?.mainEntity?.length===24,"FAQ nie zawiera 24 pytan w danych strukturalnych");

console.log("PRODUCTION_FINGERPRINT:",releaseInfo.commit||"commit niedostepny",releaseInfo.builtAt);
console.log("LIVE_AUDIT_OK: "+targets.length+" zasobow, "+routes.length+
  " stron sitemap, jedna belka VOTUM, prawidlowe 3 uslugi i 3 sciezki formularza.");
