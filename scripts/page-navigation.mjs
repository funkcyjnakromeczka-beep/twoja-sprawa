/**
 * Sitewide source-to-production navigation enhancement.
 * 47 individually named main landmarks, 40 contextual breadcrumbs and
 * 12 missing skip links. No user information, network calls or trackers.
 */
export const PAGE_PATHS=Object.freeze([
 "404.html","faq.html","index.html",
 "kampanie/skd.html","kampanie/swiadczenie-wspierajace.html","kampanie/szkody-gornicze.html",
 "kontakt.html","lokalnie/szkody-gornicze-lubin.html","lokalnie/szkody-gornicze-polkowice.html",
 "narzedzia/linki-kampanii.html","narzedzia/test-formularzy.html",
 "o-nas.html","plan-dzialania.html","polityka-prywatnosci.html",
 "poradniki/checklista-szkody-gorniczej.html","poradniki/frankowicze-lista-kontrolna.html",
 "poradniki/renta-powypadkowa-dokumenty.html","poradniki/skd-kredyt-pln-lista-kontrolna.html",
 "poradniki/sluzebnosc-przesylu-dzialka.html","poradniki/swiadczenie-wspierajace-pierwsze-kroki.html",
 "rekrutacja.html","start.html","szukaj.html",
 "uslugi/kredyty-frankowe.html","uslugi/kredyty-pln.html","uslugi/nieudany-urlop.html",
 "uslugi/odszkodowanie-za-halas.html","uslugi/pomoc-w-sprawach-karnych.html",
 "uslugi/renty-powypadkowe.html","uslugi/sluzebnosc-przesylu.html",
 "uslugi/swiadczenie-wspierajace.html","uslugi/szkody-gornicze.html",
 "uslugi/szkody-na-nieruchomosci.html","uslugi/wypadki-komunikacyjne.html",
 "uslugi/wypadki-przy-pracy.html","uslugi/wypadki-w-rolnictwie.html",
 "wiedza/drobne-pekniecia-szkody-gornicze.html","wiedza/index.html",
 "wiedza/kredyt-pln-dokumenty-skd.html","wiedza/renta-powypadkowa-dokumenty.html",
 "wiedza/sluzebnosc-przesylu-slup-na-dzialce.html",
 "wiedza/swiadczenie-wspierajace-2026-wzon-zus.html",
 "wiedza/swiadczenie-wspierajace-dokumenty.html",
 "wiedza/swiadczenie-wspierajace-wzon-zus.html",
 "wiedza/szkody-gornicze-drobne-pekniecia.html",
 "wiedza/ugoda-z-kopalnia-co-sprawdzic.html",
 "wiedza/wypadek-przy-pracy-pierwsze-kroki.html"
]);

// Conversion-focused landing pages and diagnostic/404 screens intentionally
// omit breadcrumbs so the primary action remains prominent.
export const NO_BREADCRUMBS=Object.freeze([
 "index.html","404.html","start.html","narzedzia/test-formularzy.html",
 "kampanie/skd.html","kampanie/swiadczenie-wspierajace.html",
 "kampanie/szkody-gornicze.html"
]);

// /start already has its own fully functional leaflet-skip link.
export const MISSING_SKIP_LINKS=Object.freeze([
 "o-nas.html","rekrutacja.html","polityka-prywatnosci.html",
 "narzedzia/test-formularzy.html",
 "wiedza/kredyt-pln-dokumenty-skd.html",
 "wiedza/renta-powypadkowa-dokumenty.html",
 "wiedza/sluzebnosc-przesylu-slup-na-dzialce.html",
 "wiedza/swiadczenie-wspierajace-dokumenty.html",
 "wiedza/swiadczenie-wspierajace-wzon-zus.html",
 "wiedza/szkody-gornicze-drobne-pekniecia.html",
 "wiedza/ugoda-z-kopalnia-co-sprawdzic.html",
 "wiedza/wypadek-przy-pracy-pierwsze-kroki.html"
]);

const breadcrumbLabels={
 "faq.html":"Najczęstsze pytania",
 "kontakt.html":"Kontakt",
 "lokalnie/szkody-gornicze-lubin.html":"Szkody górnicze — Lubin",
 "lokalnie/szkody-gornicze-polkowice.html":"Szkody górnicze — Polkowice",
 "narzedzia/linki-kampanii.html":"Generator linków kampanii",
 "o-nas.html":"O nas",
 "plan-dzialania.html":"Plan pierwszych kroków",
 "polityka-prywatnosci.html":"Prywatność",
 "poradniki/checklista-szkody-gorniczej.html":"Lista szkód górniczych",
 "poradniki/frankowicze-lista-kontrolna.html":"Dokumenty kredytu CHF",
 "poradniki/renta-powypadkowa-dokumenty.html":"Dokumenty do renty",
 "poradniki/skd-kredyt-pln-lista-kontrolna.html":"Dokumenty do SKD",
 "poradniki/sluzebnosc-przesylu-dzialka.html":"Urządzenia na działce",
 "poradniki/swiadczenie-wspierajace-pierwsze-kroki.html":"Pierwsze kroki WZON/ZUS",
 "rekrutacja.html":"Współpraca",
 "szukaj.html":"Wyszukiwarka",
 "uslugi/kredyty-frankowe.html":"Kredyty frankowe",
 "uslugi/kredyty-pln.html":"Sankcja kredytu darmowego",
 "uslugi/nieudany-urlop.html":"Nieudany urlop",
 "uslugi/odszkodowanie-za-halas.html":"Odszkodowanie za hałas",
 "uslugi/pomoc-w-sprawach-karnych.html":"Sprawy karne",
 "uslugi/renty-powypadkowe.html":"Renty powypadkowe",
 "uslugi/sluzebnosc-przesylu.html":"Służebność przesyłu",
 "uslugi/swiadczenie-wspierajace.html":"Świadczenie wspierające",
 "uslugi/szkody-gornicze.html":"Szkody górnicze",
 "uslugi/szkody-na-nieruchomosci.html":"Szkody na nieruchomości",
 "uslugi/wypadki-komunikacyjne.html":"Wypadki komunikacyjne",
 "uslugi/wypadki-przy-pracy.html":"Wypadki przy pracy",
 "uslugi/wypadki-w-rolnictwie.html":"Wypadki w rolnictwie",
 "wiedza/drobne-pekniecia-szkody-gornicze.html":"Drobne pęknięcia",
 "wiedza/index.html":"Biblioteka poradników",
 "wiedza/kredyt-pln-dokumenty-skd.html":"Dokumenty do kredytu PLN",
 "wiedza/renta-powypadkowa-dokumenty.html":"Renta powypadkowa",
 "wiedza/sluzebnosc-przesylu-slup-na-dzialce.html":"Słup na działce",
 "wiedza/swiadczenie-wspierajace-2026-wzon-zus.html":"Świadczenie wspierające — WZON i ZUS",
 "wiedza/swiadczenie-wspierajace-dokumenty.html":"Przygotowanie do oceny WZON",
 "wiedza/swiadczenie-wspierajace-wzon-zus.html":"WZON i ZUS",
 "wiedza/szkody-gornicze-drobne-pekniecia.html":"Drobne szkody górnicze",
 "wiedza/ugoda-z-kopalnia-co-sprawdzic.html":"Ugoda z kopalnią",
 "wiedza/wypadek-przy-pracy-pierwsze-kroki.html":"Wypadek przy pracy"
};
export const BREADCRUMB_LABELS=Object.freeze(breadcrumbLabels);

const escapeMarkup=value=>value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const pageGroup=path=>{
 if(path.startsWith("uslugi/"))return ['<a href="/v2/#uslugi">Usługi</a>'];
 if(path.startsWith("lokalnie/"))return ['<a href="/v2/uslugi/szkody-gornicze.html">Szkody górnicze</a>'];
 if(path.startsWith("poradniki/"))return ['<a href="/v2/wiedza/">Poradniki</a>'];
 if(path.startsWith("wiedza/")&&path!=="wiedza/index.html")return ['<a href="/v2/wiedza/">Poradniki</a>'];
 if(path.startsWith("narzedzia/"))return ['<span>Narzędzia</span>'];
 return [];
};

export function enhancePageNavigation(markup,path){
 if(!PAGE_PATHS.includes(path))return {html:markup,changes:[]};
 const changes=[];let html=markup;
 const main=/<main\b[^>]*>/i.exec(html);
 if(!main)throw new Error("Missing main landmark: "+path);
 const close=html.indexOf("</main>",main.index);
 const h1=/<h1\b[^>]*>/i.exec(html.slice(main.index+main[0].length,close));
 if(!h1)throw new Error("Missing page H1 within main landmark: "+path);
 const h1Id=h1[0].match(/\bid=(["'])([^"']+)\1/i)?.[2]||"page-main-heading";
 if(!/\bid=(["'])/.test(h1[0])){
  const headingIndex=main.index+main[0].length+h1.index;
  html=html.slice(0,headingIndex)+h1[0].replace(/>$/,' id="'+h1Id+'">')+html.slice(headingIndex+h1[0].length);
 }
 const refreshedMain=/<main\b[^>]*>/i.exec(html);
 if(!/\baria-labelledby=/.test(refreshedMain[0])){
  html=html.slice(0,refreshedMain.index)+refreshedMain[0].replace(/>$/,' aria-labelledby="'+h1Id+'">')+html.slice(refreshedMain.index+refreshedMain[0].length);
  changes.push("main-label");
 }
 if(MISSING_SKIP_LINKS.includes(path)){
  const opening=/<main\b[^>]*>/i.exec(html);
  if(!/\bid="main"/i.test(opening[0])){
   html=html.slice(0,opening.index)+opening[0].replace(/>$/,' id="main">')+html.slice(opening.index+opening[0].length);
  }
  if(/<a\b[^>]*href="#main"/i.test(html))throw new Error("Duplicate skip navigation: "+path);
  const body=/<body\b[^>]*>/i.exec(html);
  if(!body)throw new Error("No body: "+path);
  html=html.slice(0,body.index+body[0].length)+'<a class="skip-link page-nav-skip" href="#main">Przejdź do treści</a>'+html.slice(body.index+body[0].length);
  changes.push("missing-skip");
 }
 if(!NO_BREADCRUMBS.includes(path)){
  const name=breadcrumbLabels[path];
  if(!name)throw new Error("Missing curated breadcrumb label: "+path);
  if(/<nav\b[^>]*aria-label="Ścieżka nawigacji"/.test(html))throw new Error("Duplicate breadcrumb: "+path);
  const bits=['<a href="/v2/">Start</a>',...pageGroup(path),'<span aria-current="page">'+escapeMarkup(name)+'</span>'];
  const nav='<nav class="site-breadcrumbs" aria-label="Ścieżka nawigacji">'+
   bits.join('<span class="site-breadcrumb-separator" aria-hidden="true">/</span>')+'</nav>';
  const target=/<main\b[^>]*>/i.exec(html);
  html=html.slice(0,target.index+target[0].length)+nav+html.slice(target.index+target[0].length);
  changes.push("breadcrumbs");
 }
 if(changes.includes("missing-skip")||changes.includes("breadcrumbs")){
  if(!html.includes('href="/v2/page-navigation.css"')){
   html=html.replace("</head>",'<link rel="stylesheet" href="/v2/page-navigation.css"></head>');
  }
 }
 return {html,changes};
}
