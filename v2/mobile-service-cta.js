/* Dostępny, nieśledzący pasek kontaktu na stronach szkód, świadczeń i rent. */
(()=>{
 "use strict";
 const variant=document.currentScript?.getAttribute("data-service");
 const services={
  szkody:{phone:"+48796441345",label:"Zadzwoń do Wojciecha",number:"796 441 345"},
  swiadczenie:{phone:"+48500171531",label:"Zadzwoń do Pauliny",number:"500 171 531"},
  renty:{phone:"+48500171531",label:"Zadzwoń do Pauliny",number:"500 171 531"},
  skd:{phone:"+48796441345",label:"Wyślij umowę do Wojciecha",number:"",email:"wojciech.obieglo@votum-ds.pl"}
 };
 const service=services[variant];
 if(!service||!document.querySelector("#formularz [data-contact-form]"))return;
 const nav=document.createElement("nav");
 nav.className="mobile-service-cta";
 nav.setAttribute("aria-label","Szybki kontakt w sprawie wybranej usługi");
 const phone=document.createElement("a");
 phone.href=service.email?"mailto:"+service.email+"?subject="+encodeURIComponent("Umowa kredytowa do analizy SKD")+"&body="+encodeURIComponent("Dzień dobry,\n\nW załączniku przesyłam umowę kredytową do analizy SKD.\nMój numer telefonu: [wpisz numer]\n\nPozdrawiam"):"tel:"+service.phone;
 phone.className="mobile-service-call";
 phone.setAttribute("aria-label",service.label+": "+service.number);
 const callLabel=document.createElement("span");callLabel.textContent=service.email?"Wyślij umowę":"Zadzwoń";
 const callNumber=document.createElement("strong");callNumber.textContent=service.number;
 if(service.email){callNumber.textContent="E-mail do Wojciecha";}phone.append(callLabel,callNumber);
 const lead=document.createElement("a");
 lead.className="mobile-service-lead";
 lead.href="#formularz";
 lead.textContent=service.email?"Zostaw numer telefonu":"Zostaw zgłoszenie";
 nav.append(phone,lead);
 document.body.append(nav);
 // Stop covering the form once it becomes visible in the viewport.
 const target=document.getElementById("formularz");
 let formVisible=false;
 const syncVisibility=()=>{nav.hidden=formVisible||Boolean(target?.contains(document.activeElement));};
 if(target&&"IntersectionObserver" in window){
  const observer=new IntersectionObserver(entries=>{
   const near=Boolean(entries[0]?.isIntersecting);
   formVisible=near;
   syncVisibility();
  },{threshold:0,rootMargin:"0px 0px -70px 0px"});
  observer.observe(target);
 }
 // Hide while the contact form has keyboard focus, including mobile keyboards.
 document.addEventListener("focusin",event=>{
  if(target?.contains(event.target))nav.hidden=true;
 });
 document.addEventListener("focusout",event=>{
  if(!target?.contains(event.target))return;
  // Focusout fires before activeElement changes; defer until the next task.
  setTimeout(syncVisibility,0);
 });
})();
