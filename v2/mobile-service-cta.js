/* Dostępny, nieśledzący pasek kontaktu na stronach szkód, świadczeń i rent. */
(()=>{
 "use strict";
 const variant=document.currentScript?.getAttribute("data-service");
 const services={
  szkody:{phone:"+48796441345",label:"Zadzwoń do Wojciecha",number:"796 441 345"},
  swiadczenie:{phone:"+48500171531",label:"Zadzwoń do Pauliny",number:"500 171 531"},
  renty:{phone:"+48500171531",label:"Zadzwoń do Pauliny",number:"500 171 531"},
  franki:{phone:"+48796441345",label:"Zadzwoń do Wojciecha w sprawie kredytu CHF",number:"796 441 345"},
  przesyl:{phone:"+48796441345",label:"Zadzwoń do Wojciecha w sprawie służebności przesyłu",number:"796 441 345"},
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
 // The accessible name must contain the visible label and number in the same order.
 phone.setAttribute("aria-label",service.email?"Wyślij umowę E-mail do Wojciecha — "+service.email:"Zadzwoń "+service.number+" — "+service.label);
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
 let chatOpen=false;
 const syncVisibility=()=>{
  const keyboardLikeViewport=Boolean(window.visualViewport?.height&&window.innerHeight&&window.visualViewport.height<window.innerHeight*.7);
  const visible=!formVisible&&!chatOpen&&!keyboardLikeViewport&&!Boolean(target?.contains(document.activeElement));
  nav.hidden=!visible;
  // CSS :has() cannot reserve safe bottom space on older Android browsers.
  document.body.classList?.toggle("has-visible-mobile-service-cta",visible);
 };
 // Keep the mobile contact bar out of the way of the open service guide,
 // including older Android browsers without CSS :has() support.
 document.addEventListener("twoja-sprawa:chat-visibility",event=>{
  chatOpen=event.detail?.open===true;
  syncVisibility();
 });
 if(target&&"IntersectionObserver" in window){
  const observer=new IntersectionObserver(entries=>{
   const near=Boolean(entries[0]?.isIntersecting);
   formVisible=near;
   syncVisibility();
  },{threshold:0,rootMargin:"0px 0px -70px 0px"});
  observer.observe(target);
 }else if(target){
  // Older Android browsers may not expose IntersectionObserver. Keep the
  // floating buttons from obscuring the form in those browsers as well.
  const checkFormPosition=()=>{
   const rect=target.getBoundingClientRect();
   const viewportHeight=window.visualViewport?.height||window.innerHeight;
   formVisible=rect.top<viewportHeight-70&&rect.bottom>0;
   syncVisibility();
  };
  window.addEventListener("scroll",checkFormPosition,{passive:true});
  window.addEventListener("resize",checkFormPosition,{passive:true});
  window.visualViewport?.addEventListener("resize",checkFormPosition,{passive:true});
  checkFormPosition();
 }
 // The virtual keyboard changes the visual viewport on many Android browsers.
 // Hide the CTA even if an intersection callback has not arrived yet.
 if(window.visualViewport?.addEventListener){
  window.visualViewport.addEventListener("resize",syncVisibility,{passive:true});
 }
 // Hide while the contact form has keyboard focus, including mobile keyboards.
 document.addEventListener("focusin",event=>{
  if(target?.contains(event.target))syncVisibility();
 });
 document.addEventListener("focusout",event=>{
  if(!target?.contains(event.target))return;
  // Focusout fires before activeElement changes; defer until the next task.
  setTimeout(syncVisibility,0);
 });
})();
