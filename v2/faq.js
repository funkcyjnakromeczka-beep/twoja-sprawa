/* FAQ SuccessTree: wyszukiwanie i filtrowanie lokalne, bez cookies / analityki / wysyłania danych. */
(()=>{
 "use strict";
 const root=document.querySelector("[data-faq-hub]");
 if(!root)return;
 const search=root.querySelector("#faq-search");
 const count=root.querySelector("[data-faq-count]");
 const empty=root.querySelector("[data-faq-empty]");
 const reset=root.querySelector("[data-faq-reset]");
 const filters=[...root.querySelectorAll("[data-faq-filter]")];
 const cards=[...root.querySelectorAll("[data-faq-category]")];
 if(!search||!count||!empty||!filters.length||!cards.length)return;
 let current="all";
 const normalize=value=>String(value||"").toLowerCase("pl-PL").normalize("NFD").replace(/\p{M}/gu,"").replaceAll("ł","l");
 const refresh=()=>{
  const query=normalize(search.value.trim());
  let visible=0;
  for(const card of cards){
   const category=current==="all"||card.dataset.faqCategory===current;
   const text=!query||normalize(card.textContent).includes(query);
   card.hidden=!(category&&text);
   if(!card.hidden)visible++;
  }
  count.textContent="Widoczne: "+visible+" "+(visible===1?"pytanie":visible>=2&&visible<=4?"pytania":"pytań");
  empty.hidden=visible>0;
  reset.hidden=current==="all"&&!search.value.trim();
 };
 const choose=category=>{
  current=category;
  for(const button of filters)button.setAttribute("aria-pressed",String(button.dataset.faqFilter===current));
  refresh();
 };
 filters.forEach(button=>button.addEventListener("click",()=>choose(button.dataset.faqFilter)));
 search.addEventListener("input",refresh);
 reset.addEventListener("click",()=>{
  search.value="";
  choose("all");
  search.focus();
 });
 const requested=(new URLSearchParams(window.location.search).get("temat")||"").toLowerCase().trim();
 const known=filters.map(button=>button.dataset.faqFilter);
 if(requested!=="all"&&known.includes(requested))choose(requested);
 else refresh();
 // Direct links from the global search open the exact answer instead of a closed accordion.
 const revealLinkedQuestion=()=>{
  const hash=(window.location.hash||"").slice(1);
  if(!/^pytanie-[0-9]+-[a-z0-9-]+$/.test(hash))return;
  const card=cards.find(item=>item.id===hash);
  if(!card)return;
  if(card.hidden)choose(card.dataset.faqCategory);
  const details=card.querySelector?.("details");
  if(details)details.open=true;
 };
 window.addEventListener?.("hashchange",revealLinkedQuestion);
 revealLinkedQuestion();
})();
