/**
 * Editorially curated adjacent journeys between published, indexable pages.
 * Excludes draft/noindex guides as recommended destinations. No runtime JS.
 * The category-specific links are not legal advice or eligibility assessments.
 */
import {PAGE_PATHS} from "./page-navigation.mjs";
import {shouldIndexRoute} from "./seo-policy.mjs";

const refs=Object.freeze({
 szkody:["uslugi/szkody-gornicze.html","lokalnie/szkody-gornicze-lubin.html","lokalnie/szkody-gornicze-polkowice.html","wiedza/drobne-pekniecia-szkody-gornicze.html","faq.html"],
 swiadczenie:["uslugi/swiadczenie-wspierajace.html","wiedza/swiadczenie-wspierajace-2026-wzon-zus.html","faq.html","kontakt.html"],
 skd:["uslugi/kredyty-pln.html","faq.html","kontakt.html"],
 renty:["uslugi/renty-powypadkowe.html","uslugi/wypadki-przy-pracy.html","faq.html","kontakt.html"],
 franki:["uslugi/kredyty-frankowe.html","faq.html","kontakt.html"],
 przesyl:["uslugi/sluzebnosc-przesylu.html","faq.html","kontakt.html"]
});
const groups=Object.freeze({
 "uslugi/szkody-gornicze.html":"szkody",
 "lokalnie/szkody-gornicze-lubin.html":"szkody",
 "lokalnie/szkody-gornicze-polkowice.html":"szkody",
 "wiedza/drobne-pekniecia-szkody-gornicze.html":"szkody",
 "wiedza/szkody-gornicze-drobne-pekniecia.html":"szkody",
 "wiedza/ugoda-z-kopalnia-co-sprawdzic.html":"szkody",
 "poradniki/checklista-szkody-gorniczej.html":"szkody",
 "uslugi/swiadczenie-wspierajace.html":"swiadczenie",
 "wiedza/swiadczenie-wspierajace-2026-wzon-zus.html":"swiadczenie",
 "wiedza/swiadczenie-wspierajace-dokumenty.html":"swiadczenie",
 "wiedza/swiadczenie-wspierajace-wzon-zus.html":"swiadczenie",
 "poradniki/swiadczenie-wspierajace-pierwsze-kroki.html":"swiadczenie",
 "uslugi/kredyty-pln.html":"skd",
 "wiedza/kredyt-pln-dokumenty-skd.html":"skd",
 "poradniki/skd-kredyt-pln-lista-kontrolna.html":"skd",
 "uslugi/renty-powypadkowe.html":"renty",
 "uslugi/wypadki-przy-pracy.html":"renty",
 "uslugi/wypadki-komunikacyjne.html":"renty",
 "uslugi/wypadki-w-rolnictwie.html":"renty",
 "wiedza/renta-powypadkowa-dokumenty.html":"renty",
 "wiedza/wypadek-przy-pracy-pierwsze-kroki.html":"renty",
 "poradniki/renta-powypadkowa-dokumenty.html":"renty",
 "uslugi/kredyty-frankowe.html":"franki",
 "poradniki/frankowicze-lista-kontrolna.html":"franki",
 "uslugi/sluzebnosc-przesylu.html":"przesyl",
 "wiedza/sluzebnosc-przesylu-slup-na-dzialce.html":"przesyl",
 "poradniki/sluzebnosc-przesylu-dzialka.html":"przesyl"
});
const titles=Object.freeze({
 "uslugi/szkody-gornicze.html":"Szkody górnicze — zakres pomocy",
 "lokalnie/szkody-gornicze-lubin.html":"Szkody górnicze w Lubinie",
 "lokalnie/szkody-gornicze-polkowice.html":"Szkody górnicze w Polkowicach",
 "wiedza/drobne-pekniecia-szkody-gornicze.html":"Drobne pęknięcia — co dokumentować?",
 "uslugi/swiadczenie-wspierajace.html":"Świadczenie wspierające — WZON i ZUS",
 "wiedza/swiadczenie-wspierajace-2026-wzon-zus.html":"Świadczenie wspierające w 2026 roku",
 "uslugi/kredyty-pln.html":"Kredyty PLN — analiza pod kątem SKD",
 "uslugi/renty-powypadkowe.html":"Renty powypadkowe i waloryzacja",
 "uslugi/wypadki-przy-pracy.html":"Wypadek przy pracy — informacje",
 "uslugi/kredyty-frankowe.html":"Kredyty frankowe — CHF",
 "uslugi/sluzebnosc-przesylu.html":"Służebność przesyłu — urządzenia na działce",
 "faq.html":"Najczęstsze pytania i odpowiedzi",
 "kontakt.html":"Kontakt do właściwego opiekuna sprawy"
});
const heading=Object.freeze({
 szkody:"Szkody górnicze — dalsze informacje",
 swiadczenie:"Świadczenie wspierające — dalsze informacje",
 skd:"Kredyt PLN i SKD — dalsze informacje",
 renty:"Renty i sprawy powypadkowe — dalsze informacje",
 franki:"Kredyty frankowe — dalsze informacje",
 przesyl:"Służebność przesyłu — dalsze informacje"
});
export const RELATED_GROUPS=groups;
export const RELATED_REFS=refs;
export function appendRelatedContent(markup,path){
 const group=groups[path];
 if(!group)return {html:markup,changes:[]};
 if(markup.includes('class="related-content-links"'))return {html:markup,changes:[]};
 const target=refs[group].filter(p=>p!==path).slice(0,4);
 if(target.length<2)throw new Error("Insufficient curated links: "+path);
 const changes=[];
 for(const p of target){
  if(!PAGE_PATHS.includes(p)||!shouldIndexRoute("/"+p))
   throw new Error("Draft, missing or noindex destination: "+path+" -> "+p);
  if(!titles[p])throw new Error("Missing public link label: "+p);
  changes.push({kind:"curated-related-link",detail:path+" -> "+p});
 }
 const links=target.map(p=>'<li><a href="/v2/'+p+'">'+titles[p]+' <span aria-hidden="true">↗</span></a></li>').join("");
 const panel='<aside class="related-content-links" aria-label="Powiązane zatwierdzone materiały">'+
  '<h2>'+heading[group]+'</h2>'+
  '<p>Wybierz powiązany temat lub wróć do kontaktu. Materiały służą orientacji, nie przesądzają o wyniku sprawy.</p>'+
  '<ul>'+links+'</ul></aside>';
 // Keep the return-to-top control as the last element of the main content.
 const returnTop=/<p class="content-return-top">/;
 let html=markup;
 const mainOpen=/<main\b[^>]*>/i.exec(html),mainEnd=html.indexOf("</main>",mainOpen?.index??0);
 if(!mainOpen||mainEnd<mainOpen.index)throw new Error("Missing main for "+path);
 const inMain=html.slice(mainOpen.index,mainEnd),relative=returnTop.exec(inMain);
 const insert=relative?mainOpen.index+relative.index:mainEnd;
 html=html.slice(0,insert)+panel+html.slice(insert);
 if(!html.includes('href="/v2/related-content.css"'))
  html=html.replace("</head>",'<link rel="stylesheet" href="/v2/related-content.css"></head>');
 changes.push({kind:"related-panel",detail:path+" ("+target.length+" links)"});
 return {html,changes};
}
