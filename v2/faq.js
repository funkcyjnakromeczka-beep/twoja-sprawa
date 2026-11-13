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
   // Przyciski udostępniania nie mogą wpływać na wyniki wyszukiwarki FAQ.
   const searchable=(card.querySelector("summary")?.textContent||"")+" "+(card.querySelector(".faq-answer")?.textContent||"");
   const text=!query||normalize(searchable).includes(query);
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
 // Udostępnianie pojedynczych odpowiedzi bez konta, cookies i zewnętrznego API.
 // W odnośniku pomijamy parametry UTM oraz pozostałe dane z aktualnego URL.
 for(const card of cards){
  if(!/^pytanie-[0-9]+-[a-z0-9-]+$/.test(card.id))continue;
  const share= document.createElement("button");
  share.type="button";share.className="faq-share-button";
  share.textContent="Udostępnij odpowiedź";
  const feedback=document.createElement("span");
  feedback.className="faq-share-feedback";feedback.setAttribute("role","status");
  feedback.setAttribute("aria-live","polite");
  const holder=document.createElement("div");holder.className="faq-share-tools";
  holder.append(share,feedback);card.append(holder);
  share.addEventListener("click",async()=>{
   const title=card.querySelector("summary")?.textContent?.trim()||"Pytanie — Twoja Sprawa";
   const link=new URL(window.location.pathname,window.location.origin);
   link.hash=card.id;
   const url=link.href;
   feedback.replaceChildren();
   try{
    if(typeof navigator.share==="function"){
     await navigator.share({title,url});
     feedback.textContent="Otwarto systemowe udostępnianie.";
     return;
    }
    if(navigator.clipboard?.writeText){
     await navigator.clipboard.writeText(url);
     feedback.textContent="Link do odpowiedzi skopiowany.";
     return;
    }
   }catch(error){
    if(error?.name==="AbortError")return; // Osoba anulowała systemowy arkusz.
   }
   const field=document.createElement("input");
   field.type="text";field.value=url;field.readOnly=true;
   field.className="faq-share-copy";
   field.setAttribute("aria-label","Zaznaczony adres odpowiedzi do ręcznego skopiowania");
   feedback.textContent="Zaznaczono adres. Skopiuj go z menu urządzenia: ";
   feedback.append(field);
   field.focus();field.select();
  });
 }
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
