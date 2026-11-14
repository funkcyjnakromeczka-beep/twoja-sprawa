/* Mobile campaign quick bar: never cover the contact form or mobile keyboard. */
(()=>{
 "use strict";
 const bar=document.querySelector(".campaign-mobile-actions");
 const formRegion=document.getElementById("formularz");
 if(!bar||!formRegion)return;
 let overlapsForm=false;
 const sync=()=>{
  const formHasFocus=formRegion.contains(document.activeElement);
  bar.hidden=overlapsForm||formHasFocus;
 };
 const fallback=()=>{
  const rect=formRegion.getBoundingClientRect();
  overlapsForm=rect.top<window.innerHeight-82&&rect.bottom>0;
  sync();
 };
 // Native anchor links to #formularz remain functional without this script.
 if("IntersectionObserver" in window){
  const observer=new IntersectionObserver(entries=>{
   overlapsForm=Boolean(entries[0]?.isIntersecting);
   sync();
  },{rootMargin:"0px 0px -82px 0px",threshold:0});
  observer.observe(formRegion);
 }else{
  window.addEventListener("scroll",fallback,{passive:true});
  window.addEventListener("resize",fallback,{passive:true});
  fallback();
 }
 document.addEventListener("focusin",event=>{
  if(formRegion.contains(event.target))bar.hidden=true;
 });
 document.addEventListener("focusout",event=>{
  if(formRegion.contains(event.target)){
   window.setTimeout(sync,0);
  }
 });
})();
