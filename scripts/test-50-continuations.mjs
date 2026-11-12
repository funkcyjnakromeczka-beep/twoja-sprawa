#!/usr/bin/env node
/** 50 kolejnych, rzeczywistych kontroli projektu. Bez sieci i bez wysyłania leadów. */
import assert from "node:assert/strict";
import {readFile,readdir} from "node:fs/promises";
import {shouldIndexRoute} from "./seo-policy.mjs";
const get=p=>readFile(p,"utf8");
const files=[
 "v2/index.html","v2/kontakt.html","v2/uslugi/szkody-gornicze.html",
 "v2/uslugi/swiadczenie-wspierajace.html","v2/contact.js","v2/service-navigator.js",
 "v2/plan-dzialania.html","v2/plan-dzialania.js","v2/plan-dzialania.css",
 "v2/wiedza/index.html","v2/knowledge-hub.js","v2/knowledge-hub.css",
 "v2/article-accessibility.js","v2/wiedza/swiadczenie-wspierajace-2026-wzon-zus.html",
 "v2/polityka-prywatnosci.html","scripts/preview.mjs","scripts/build.mjs",
 "scripts/network-brand.mjs",".github/workflows/audit.yml"
];
const data=Object.fromEntries(await Promise.all(files.map(async p=>[p,await get(p)])));
const home=data["v2/index.html"],contactPage=data["v2/kontakt.html"],mining=data["v2/uslugi/szkody-gornicze.html"];
const support=data["v2/uslugi/swiadczenie-wspierajace.html"],form=data["v2/contact.js"];
const nav=data["v2/service-navigator.js"],plan=data["v2/plan-dzialania.js"],planPage=data["v2/plan-dzialania.html"];
const knowledge=data["v2/wiedza/index.html"],knowledgeJs=data["v2/knowledge-hub.js"];
const legalArticle=data["v2/wiedza/swiadczenie-wspierajace-2026-wzon-zus.html"];
const checks=[];
const add=(label,fn)=>checks.push({label,fn});
add("01. Dwa główne projekty w hero",()=>assert.ok(home.includes("hero-priority-grid")));
add("02. Świadczenie wspierające w hero",()=>assert.ok(home.includes('href="/v2/kampanie/swiadczenie-wspierajace.html')));
add("03. Szkody górnicze w hero",()=>assert.ok(home.includes('href="/v2/kampanie/szkody-gornicze.html')));
add("04. Priorytet świadczenia w nawigacji",()=>assert.ok(home.includes('nav-support-priority')));
add("05. Priorytet szkód w nawigacji",()=>assert.ok(home.includes('nav-mining-priority')));
add("06. Zidentyfikowana osoba Wojciech",()=>assert.ok(home.includes("Wojciech Obiegło")));
add("07. Zidentyfikowana osoba Paulina",()=>assert.ok(home.includes("Paulina Chandrała")));
add("08. Portret Wojciecha na stronie głównej",()=>assert.ok(home.includes('src="/v2/assets/wojciech-obieglo.jpg"')));
add("09. Portret Pauliny na stronie głównej",()=>assert.ok(home.includes('src="/v2/assets/paulina-chandrala.jpg"')));
add("10. Formularz na stronie głównej",()=>assert.ok(home.includes('data-contact-form')));
add("11. FAQ na stronie głównej",()=>assert.ok(home.includes('class="home-faq-grid"')));
add("12. Link do generatora planu",()=>assert.ok(home.includes('href="/v2/plan-dzialania.html"')));
add("13. Bezpośredni kontakt telefoniczny Wojciech",()=>assert.ok(home.includes("796 441 345")));
add("14. Bezpośredni kontakt telefoniczny Paulina",()=>assert.ok(home.includes("500 171 531")));
add("15. Techniczny pasek logotypów obydwu partnerów",()=>{const t=data["scripts/network-brand.mjs"];assert.ok(t.includes("Votum Network")&&t.includes("Votum Scale Agency"));});
add("16. Podstrona szkód z własnym tytułem",()=>assert.ok(mining.includes("<h1>Szkody górnicze")));
add("17. Podstrona świadczenia z własnym tytułem",()=>assert.ok(support.includes("<h1>Świadczenie wspierające")));
add("18. Plan ze strony szkód",()=>assert.ok(mining.includes("plan-dzialania.html?usluga=szkody")));
add("19. Plan ze strony świadczenia",()=>assert.ok(support.includes("plan-dzialania.html?usluga=swiadczenie")));
add("20. Formularze na obu głównych podstronach",()=>assert.ok(mining.includes("data-contact-form")&&support.includes("data-contact-form")));
add("21. Zdjęcia osób na dwóch podstronach",()=>assert.ok(mining.includes('src="/v2/assets/wojciech-obieglo.jpg"')&&support.includes('src="/v2/assets/paulina-chandrala.jpg"')));
add("22. Dwie karty kontaktu z wizerunkami",()=>assert.equal((contactPage.match(/class="contact-specialist"/g)||[]).length,2));
add("23. Rozróżnienie tematów przez formularz",()=>assert.ok(form.includes('"Szkody górnicze"')&&form.includes('"Świadczenie wspierające"')));
add("24. Formularz obsługiwany przez Web3Forms",()=>assert.ok(form.includes("https://api.web3forms.com/submit")));
add("25. Honeypot przeciw przypadkowym botom",()=>assert.ok(form.includes('honeypot.name="botcheck"')));
add("26. Ograniczenie czasu żądania formularza",()=>assert.ok(form.includes("AbortController()")&&form.includes("12000")));
add("27. Awaryjny kontakt przez e-mail",()=>assert.ok(form.includes('const mailRecipient=select.value==="Kredyt w PLN / SKD"?"wojciech.obieglo@votum-ds.pl":"twojasprawa_votum@outlook.com"')&&form.includes('fallback.href="mailto:"+mailRecipient')));
add("28. Zgoda na kontakt w formularzu",()=>assert.ok(form.includes("ack.required=true")));
add("29. Telefon lub e-mail: dynamiczny wymóg",()=>assert.ok(form.includes("syncContactPreference")));
add("30. Formularz przyjmuje wybór z planu",()=>assert.ok(form.includes('"plan"].includes(requestedLeadPath)')));
add("31. Plan ma kategorię szkód górniczych",()=>assert.ok(plan.includes("szkody:{")));
add("32. Plan ma kategorię świadczeń",()=>assert.ok(plan.includes("swiadczenie:{")));
add("33. Plan ma kategorię rent",()=>assert.ok(plan.includes("renty:{")));
add("34. Plan ma kategorię kredytów PLN",()=>assert.ok(plan.includes("skd:{")));
add("35. Plan ma kategorię przesyłu",()=>assert.ok(plan.includes("przesyl:{")));
add("36. Plan obsługuje propozycję ugody",()=>assert.ok(plan.includes("ugoda:[")));
add("37. Plan obsługuje odmowę kopalni",()=>assert.ok(plan.includes("odmowa:[")));
add("38. Plan obsługuje decyzję WZON",()=>assert.ok(plan.includes("decyzja:[")));
add("39. Plan obsługuje odwołanie",()=>assert.ok(plan.includes("odwolanie:[")));
add("40. Checklista z prawdziwym postępem",()=>assert.ok(plan.includes('checks.filter(input=>input.checked).length')));
add("41. Drukowanie planu z poziomu strony",()=>assert.ok(plan.includes('window.print()')&&planPage.includes("Wydrukuj / zapisz PDF")));
add("42. Reset planu i brak zapisanych danych",()=>assert.ok(plan.includes('resetButton.addEventListener')&&!/localStorage|sessionStorage|indexedDB/.test(plan)));
add("43. Plan nie wykonuje połączeń sieciowych",()=>assert.ok(!/\bfetch\s*\(|XMLHttpRequest|navigator\.sendBeacon/.test(plan)));
add("44. Plan przekazuje tylko rozpoznane źródła UTM",()=>assert.ok(plan.includes("allowedSources")&&plan.includes("if(sanitize(val))")));
add("45. Generator jasno informuje o prywatności",()=>assert.ok(planPage.includes("bez logowania")&&planPage.includes("Nie wpisujesz tu imienia")));
add("46. Biblioteka zawiera dziesięć kart",()=>assert.equal((knowledge.match(/class="hub-card/g)||[]).length,10));
add("47. Biblioteka ma pięć filtrów usług",()=>assert.equal((knowledge.match(/data-hub-filter="(?!all)[^"]+"/g)||[]).length,5));
add("48. Biblioteka szuka bez polskich znaków",()=>assert.ok(knowledgeJs.includes('normalize("NFD")')&&knowledgeJs.includes('replaceAll("ł","l")')));
add("49. Aktualna informacja prawna: ZUS i ostateczność decyzji",()=>assert.ok(legalArticle.includes("decyzja WZON stała się ostateczna")&&legalArticle.includes("www.zus.pl/swiadczenia")));
add("50. Bezpieczne wydanie: brak indeksacji podglądu i strony 404",()=>{assert.ok(data["scripts/preview.mjs"].includes("noindex,nofollow"));assert.ok(data["scripts/build.mjs"].includes("LEGAL_APPROVED")&&data["scripts/build.mjs"].includes("FORM_APPROVED"));assert.equal(shouldIndexRoute("/404.html"),false);});
assert.equal(checks.length,50,"Test must have exactly 50 checks");
let passed=0;
for(const {label,fn} of checks){
 try{await fn();passed++;console.log("OK "+label);}
 catch(e){console.error("FAIL "+label+": "+e.message);process.exitCode=1;}
}
console.log("WYNIK: "+passed+"/50 kontroli. Nie publikowano ani nie wysyłano rzeczywistych zgłoszeń.");
