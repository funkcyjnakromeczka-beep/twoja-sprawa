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
 let category="all";
 const params=new URLSearchParams(window.location.search);
 const initial=(params.get("q")||"").slice(0,120);
 const queryCat=(params.get("temat")||"").toLowerCase().trim();
 if(engine.categories.includes(queryCat))category=queryCat;
 input.value=initial;
 const render=()=>{
  const phrase=input.value.trim();
  const matched=engine.search(phrase,category,100);
  const visible=matched.slice(0,phrase?30:18);
  const suffix=matched.length===1?"wynik":matched.length>=2&&matched.length<=4?"wyniki":"wyników";
  counter.textContent=(matched.some(item=>item.similar)?"Podobne materiały: ":"Znaleziono: ")+matched.length+" "+suffix+(matched.length>visible.length?" · pokazano pierwsze "+visible.length:"");
  results.replaceChildren();
  for(const item of visible){
   const card=document.createElement("a");
   card.href=item.href;
   card.className="site-search-card";
   const tag=document.createElement("span");tag.className="site-search-tag";tag.textContent=item.id.startsWith("faq:")?"Pytanie i odpowiedź":labels[item.category]||"Informacje";
   const title=document.createElement("h3");title.textContent=item.title;
   const desc=document.createElement("span");desc.className="site-search-description";desc.textContent=item.description;
   const tail=document.createElement("span");tail.className="site-search-cta";tail.textContent="Otwórz materiał ↗";
   card.append(tag,title,desc,tail);
   results.append(card);
  }
  empty.hidden=matched.length!==0;
  if(emptyContact){
   emptyContact.href=contactByTopic[category]||"/v2/kontakt.html";
   emptyContact.textContent=contactByTopic[category]?"Zostaw kontakt w wybranej sprawie":"Zadaj własne pytanie";
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
})();
