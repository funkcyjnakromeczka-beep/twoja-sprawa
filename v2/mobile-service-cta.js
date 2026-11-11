/* Dostępny, nieśledzący pasek kontaktu dla dwóch głównych usług na telefonie. */
(()=>{
 "use strict";
 const variant=document.currentScript?.getAttribute("data-service");
 const services={
  szkody:{phone:"+48796441345",label:"Zadzwoń do Wojciecha",number:"796 441 345"},
  swiadczenie:{phone:"+48500171531",label:"Zadzwoń do Pauliny",number:"500 171 531"}
 };
 const service=services[variant];
 if(!service||!document.querySelector("#formularz [data-contact-form]"))return;
 const nav=document.createElement("nav");
 nav.className="mobile-service-cta";
 nav.setAttribute("aria-label","Szybki kontakt w sprawie wybranej usługi");
 const phone=document.createElement("a");
 phone.href="tel:"+service.phone;
 phone.className="mobile-service-call";
 phone.setAttribute("aria-label",service.label+": "+service.number);
 const callLabel=document.createElement("span");callLabel.textContent="Zadzwoń";
 const callNumber=document.createElement("strong");callNumber.textContent=service.number;
 phone.append(callLabel,callNumber);
 const lead=document.createElement("a");
 lead.className="mobile-service-lead";
 lead.href="#formularz";
 lead.textContent="Zostaw zgłoszenie";
 nav.append(phone,lead);
 document.body.append(nav);
 // Stop covering the form once it becomes visible in the viewport.
 const target=document.getElementById("formularz");
 if(target&&"IntersectionObserver" in window){
  const observer=new IntersectionObserver(entries=>{
   const near=Boolean(entries[0]?.isIntersecting);
   nav.hidden=near;
  },{threshold:0,rootMargin:"0px 0px -70px 0px"});
  observer.observe(target);
 }
 // Hide while the contact form has keyboard focus, including mobile keyboards.
 document.addEventListener("focusin",event=>{
  if(target?.contains(event.target))nav.hidden=true;
 });
})();
