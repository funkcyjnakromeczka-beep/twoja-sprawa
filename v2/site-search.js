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
 const reset=host.querySelector("[data-search-reset]");
 const tabs=[...host.querySelectorAll("[data-search-category]")];
 if(!input||!results||!counter||!empty||!reset||!tabs.length)return;
 const labels={szkody:"Szkody górnicze",swiadczenie:"Świadczenie wspierające",renty:"Renty i wypadki",skd:"Kredyty PLN / SKD",przesyl:"Służebność przesyłu",inne:"Pozostałe materiały"};
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
  counter.textContent="Znaleziono: "+matched.length+" "+suffix+(matched.length>visible.length?" · pokazano pierwsze "+visible.length:"");
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
