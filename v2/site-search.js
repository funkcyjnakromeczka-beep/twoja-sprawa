/* UI wyszukiwania dla Twoja Sprawa: wyłącznie lokalne dane, zero śledzenia. */
(()=>{
 "use strict";
 const host=document.querySelector("[data-site-search]");
 const engine=window.TwojaSprawaSearch;
 if(!host||!engine)return;
 const input=host.querySelector("#site-search-input");
 const results=host.querySelector("[data-search-results]");
 const counter=host.querySelector("[data-search-count]");
 const empty=host.querySelector("[data-search-empty]");
 const emptyContact=host.querySelector("[data-search-contact]");
 const emptySuggestion=host.querySelector("[data-search-suggestion]");
 const reset=host.querySelector("[data-search-reset]");
 const tabs=[...host.querySelectorAll("[data-search-category]")];
 if(!input||!results||!counter||!empty||!reset||!tabs.length)return;
 const contactByTopic={
  szkody:"/v2/uslugi/szkody-gornicze.html#formularz",
  swiadczenie:"/v2/kampanie/swiadczenie-wspierajace.html#formularz",
  renty:"/v2/uslugi/renty-powypadkowe.html#formularz",
  skd:"/v2/kampanie/skd.html#formularz",
  franki:"/v2/uslugi/kredyty-frankowe.html#formularz",
  przesyl:"/v2/uslugi/sluzebnosc-przesylu.html#formularz"
 };
 const labels={szkody:"Szkody górnicze",swiadczenie:"Świadczenie wspierające",renty:"Renty i wypadki",skd:"Sankcja Kredytu Darmowego (SKD)",franki:"Pomoc frankowiczom — CHF",przesyl:"Służebność przesyłu",inne:"Pozostałe materiały"};
 // Conservative, local-only signposting for an otherwise empty results page.
 // Distinctive words only; ties and unknown terms never guess a service.
 const topicRoots={
  szkody:["kopaln","gornicz","zapadlisk","pekniec","peknie","osiadan","rys","kostk"],
  swiadczenie:["wzon","wspieraj","niepelnos","punktow","punktac"],
  renty:["rent","powypad","waloryzac","wypad","uszczerb"],
  skd:["skd","sankcj","rrso","gotowkow","konsumenck","pln"],
  franki:["frank","chf","walutow","indeksowan"],
  przesyl:["sluzebn","przesyl","slup","gazociag","energetyczn"]
 };
 const inferTopic=phrase=>{
  const words=engine.normalize(phrase).split(" ").filter(Boolean);
  if(!words.length)return "";
  const ranking=Object.entries(topicRoots).map(([key,roots])=>({
   key,score:words.filter(word=>roots.some(root=>word.startsWith(root))).length
  })).sort((a,b)=>b.score-a.score);
  return ranking[0].score>0&&ranking[0].score>ranking[1].score?ranking[0].key:"";
 };
 const publicHref=href=>{
  // Browser search data keeps source /v2/*.html paths to match the build.
  // Visitors should receive canonical extensionless Cloudflare Pages links.
  if(!href.startsWith("/v2/"))return href;
  return href.replace(/^\/v2(?=\/)/,"").replace(/\.html(?=$|[?#])/,"");
 };

 // Ready-to-browse six principal services when no query has been entered.
 // Use indexed pages rather than duplicating titles and descriptions in JS.
 const featuredIds=[
  "page:v2/uslugi/szkody-gornicze.html",
  "page:v2/uslugi/swiadczenie-wspierajace.html",
  "page:v2/uslugi/kredyty-pln.html",
  "page:v2/uslugi/renty-powypadkowe.html",
  "page:v2/uslugi/kredyty-frankowe.html",
  "page:v2/uslugi/sluzebnosc-przesylu.html"
 ];
 const featured=featuredIds.map(id=>engine.entries.find(entry=>entry.id===id)).filter(Boolean);
 let category="all";
 const params=new URLSearchParams(window.location.search);
 const initial=(params.get("q")||"").slice(0,120);
 const queryCat=(params.get("temat")||"").toLowerCase().trim();
 if(engine.categories.includes(queryCat))category=queryCat;
 input.value=initial;
 const render=()=>{
  const phrase=input.value.trim();
  const browsing=!phrase;
  const matched=browsing
   ?(category==="all"?featured:engine.entries.filter(entry=>entry.category===category))
   :engine.search(phrase,category,100);
  const visible=matched.slice(0,phrase?30:18);
  const suffix=matched.length===1?"wynik":matched.length>=2&&matched.length<=4?"wyniki":"wyników";
  const heading=browsing
   ?(category==="all"?"Wybierz temat: ":"Materiały w kategorii: ")
   :(matched.some(item=>item.similar)?"Podobne materiały: ":"Znaleziono: ");
  counter.textContent=heading+matched.length+" "+suffix+(matched.length>visible.length?" · pokazano pierwsze "+visible.length:"");
  results.replaceChildren();
  for(const item of visible){
   const card=document.createElement("a");
   card.href=publicHref(item.href);
   card.className="site-search-card";
   const tag=document.createElement("span");tag.className="site-search-tag";tag.textContent=item.id.startsWith("faq:")?"Pytanie i odpowiedź":labels[item.category]||"Informacje";
   const title=document.createElement("h3");title.textContent=item.title;
   const desc=document.createElement("span");desc.className="site-search-description";desc.textContent=item.description;
   const tail=document.createElement("span");tail.className="site-search-cta";tail.textContent="Otwórz materiał ↗";
   card.append(tag,title,desc,tail);
   results.append(card);
  }
  // No-results messaging is only meaningful after an actual search.
  empty.hidden=matched.length!==0||browsing;
  const inferredTopic=!browsing&&matched.length===0&&category==="all"?inferTopic(phrase):"";
  const suggestedTopic=category!=="all"?category:inferredTopic;
  const guided=Boolean(contactByTopic[suggestedTopic]);
  if(emptyContact){
   emptyContact.href=publicHref(contactByTopic[suggestedTopic]||"/v2/kontakt.html");
   emptyContact.textContent=guided?"Przejdź do kontaktu — "+labels[suggestedTopic]:"Zadaj własne pytanie";
  }
  if(emptySuggestion){
   emptySuggestion.hidden=empty.hidden||!guided;
   emptySuggestion.textContent=!guided?"":category==="all"
    ?"Wstępna podpowiedź na podstawie użytych słów: "+labels[suggestedTopic]+". To nie jest ocena Twojej sprawy ani gwarancja świadczenia."
    :"Wybrany filtr: "+labels[suggestedTopic]+". Możesz skontaktować się bezpośrednio w tym temacie.";
  }
  reset.hidden=!phrase&&category==="all";
  for(const tab of tabs)tab.setAttribute("aria-pressed",String(tab.dataset.searchCategory===category));
 };
 input.addEventListener("input",render);
 tabs.forEach(tab=>tab.addEventListener("click",()=>{
  category=tab.dataset.searchCategory;
  render();
 }));
 reset.addEventListener("click",()=>{
  category="all";input.value="";render();input.focus();
 });
 render();
 // Reveal interactive controls only after the local search engine
 // successfully populated results; otherwise show the static service links.
 host.dataset.searchReady="true";
 const staticFallback=host.querySelector("[data-search-fallback]");
 if(staticFallback)staticFallback.hidden=true;
})();
