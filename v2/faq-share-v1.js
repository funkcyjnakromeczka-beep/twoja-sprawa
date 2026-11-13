/* Twoja Sprawa FAQ: samodzielny moduł udostępniania bez analityki i bez cookies. */
(()=>{
 "use strict";
 const root=document.getElementById("faq-list");
 if(!root)return;
 const cards=[...root.querySelectorAll(".faq-card[id^='pytanie-']")];
 for(const card of cards){
  // Współistnieje ze starszym i nowszym faq.js — nigdy nie dubluje przycisków.
  if(card.querySelector(".faq-share-tools"))continue;
  if(!/^pytanie-[0-9]+-[a-z0-9-]+$/.test(card.id))continue;
  const panel=document.createElement("div");
  panel.className="faq-share-tools";
  const action=document.createElement("button");
  action.type="button";
  action.className="faq-share-button";
  action.textContent="Udostępnij odpowiedź";
  const feedback=document.createElement("span");
  feedback.className="faq-share-feedback";
  feedback.setAttribute("role","status");
  feedback.setAttribute("aria-live","polite");
  panel.append(action,feedback);
  card.append(panel);
  action.addEventListener("click",async()=>{
   // Adres bazowy bez UTM, numerów telefonu ani zapytań z wyszukiwarki.
   const link=new URL(window.location.pathname,window.location.origin);
   link.hash=card.id;
   const url=link.href;
   const title=card.querySelector("summary")?.textContent?.trim()||"Twoja Sprawa — odpowiedź";
   feedback.replaceChildren();
   if(typeof navigator.share==="function"){
    try{
     await navigator.share({title,url});
     feedback.textContent="Udostępnianie zakończone.";
     return;
    }catch(error){if(error?.name==="AbortError")return;}
   }
   if(navigator.clipboard?.writeText){
    try{
     await navigator.clipboard.writeText(url);
     feedback.textContent="Skopiowano link do odpowiedzi.";
     return;
    }catch{}
   }
   const field=document.createElement("input");
   field.type="text";
   field.className="faq-share-copy";
   field.readOnly=true;
   field.value=url;
   field.setAttribute("aria-label","Adres odpowiedzi do ręcznego skopiowania");
   feedback.textContent="Skopiuj zaznaczony adres:";
   feedback.append(field);
   field.focus();
   field.select();
  });
 }
})();
