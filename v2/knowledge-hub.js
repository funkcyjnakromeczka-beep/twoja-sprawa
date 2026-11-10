/* Biblioteka wiedzy — lokalna wyszukiwarka kart, zero cookies, zero API. */
(()=>{
 "use strict";
 const hub=document.querySelector("[data-knowledge-hub]");
 if(!hub)return;
 const input=hub.querySelector("#hub-search");
 const count=hub.querySelector("[data-hub-count]");
 const empty=hub.querySelector("#hub-empty");
 const clear=hub.querySelector("[data-hub-reset]");
 const buttons=[...hub.querySelectorAll("[data-hub-filter]")];
 const cards=[...hub.querySelectorAll("[data-hub-category]")];
 if(!input||!count||!empty||!cards.length)return;
 let category="all";
 const normalize=value=>String(value||"").toLocaleLowerCase("pl-PL").normalize("NFD").replace(/\p{M}/gu,"").replaceAll("ł","l");
 const update=()=>{
  const q=normalize(input.value.trim());
  let shown=0;
  for(const card of cards){
   const matchCategory=category==="all"||card.dataset.hubCategory===category;
   const matchText=!q||normalize(card.textContent).includes(q);
   card.hidden=!(matchCategory&&matchText);
   if(!card.hidden)shown++;
  }
  const form=shown===1?"artykuł":shown>=2&&shown<=4?"artykuły":"artykułów";
  count.textContent="Widoczne: "+shown+" "+form;
  empty.hidden=shown!==0;
  if(clear)clear.hidden=!input.value.trim()&&category==="all";
 };
 buttons.forEach(button=>button.addEventListener("click",()=>{
  category=button.dataset.hubFilter||"all";
  for(const other of buttons)other.setAttribute("aria-pressed",String(other===button));
  update();
 }));
 input.addEventListener("input",update);
 if(clear)clear.addEventListener("click",()=>{
  input.value="";category="all";
  for(const b of buttons)b.setAttribute("aria-pressed",String(b.dataset.hubFilter==="all"));
  update();input.focus();
 });
 update();
})();