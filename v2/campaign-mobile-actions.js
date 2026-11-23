/* Mobile campaign quick bar: do not obstruct contact forms or the virtual keyboard.
   The two native links continue working without JavaScript or cookies. */
(()=>{
 "use strict";
 const bar=document.querySelector(".campaign-mobile-actions");
 const formRegion=document.getElementById("formularz");
 if(!bar||!formRegion)return;
 let overlapsForm=false;
 const keyboardOpen=()=>{
  // On supported Android browsers the visual viewport contracts while the
  // layout viewport stays larger. The threshold ignores address-bar resizing.
  const visualHeight=window.visualViewport?.height;
  return typeof visualHeight==="number"&&window.innerHeight-visualHeight>140;
 };
 const sync=()=>{
  const formHasFocus=formRegion.contains(document.activeElement);
  bar.hidden=overlapsForm||formHasFocus||keyboardOpen();
 };
 const fallback=()=>{
  const rect=formRegion.getBoundingClientRect();
  const height=window.visualViewport?.height||window.innerHeight;
  overlapsForm=rect.top<height-82&&rect.bottom>0;
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
 window.visualViewport?.addEventListener("resize",()=>{
  if("IntersectionObserver" in window)sync();
  else fallback();
 },{passive:true});
 document.addEventListener("focusin",event=>{
  if(formRegion.contains(event.target))bar.hidden=true;
 });
 document.addEventListener("focusout",event=>{
  if(formRegion.contains(event.target))window.setTimeout(sync,0);
 });
 sync();
})();