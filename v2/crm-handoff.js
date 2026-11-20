/* Ręczny most do istniejącego CRM; żadnego wysyłania ani zapisu. */
(()=>{
 "use strict";
 const form=document.querySelector("[data-crm-handoff]");
 const api=window.TwojaSprawaCrmHandoff;
 if(!form||!api)return;
 const get=name=>form.elements.namedItem(name);
 const output=document.querySelector("[data-crm-note]");
 const status=document.querySelector("[data-crm-status]");
 const copy=document.querySelector("[data-crm-copy]");
 let prepared="";
 const resetPreview=()=>{
  prepared="";
  output.value="";
  copy.disabled=true;
  status.textContent="";
 };
 form.addEventListener("input",resetPreview);
 form.addEventListener("change",resetPreview);
 form.addEventListener("submit",event=>{
  event.preventDefault();
  try{
   prepared=api.note({
    ref:get("ref").value,service:get("service").value,
    source:get("source").value,campaign:get("campaign").value,status:get("status").value
   });
   output.value=prepared;
   copy.disabled=false;
   status.textContent="Przygotowano notatkę lokalnie. Sprawdź ją przed wklejeniem do CRM.";
  }catch(error){
   resetPreview();
   status.textContent=error.message;
  }
 });
 copy.addEventListener("click",async()=>{
  if(!prepared||output.value!==prepared)return;
  if(!navigator.clipboard?.writeText){
   output.focus();output.select();
   status.textContent="Schowek niedostępny. Zaznaczony tekst skopiuj ręcznie.";
   return;
  }
  try{
   await navigator.clipboard.writeText(prepared);
   status.textContent="Skopiowano wyłącznie kod i metadane sprawy. Wklej po sprawdzeniu istniejącego rekordu w CRM.";
  }catch{
   output.focus();output.select();
   status.textContent="Nie udało się skopiować automatycznie. Zaznaczony tekst skopiuj ręcznie.";
  }
 });
 resetPreview();
})();
