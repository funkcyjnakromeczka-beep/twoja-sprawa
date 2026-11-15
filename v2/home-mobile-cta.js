/* Homepage mobile shortcuts: do not cover the contact form while it is in view.
   Native call and #kontakt links work without JS. No storage, tracking or network. */
(()=>{
 "use strict";
 const bar=document.querySelector(".mobile-contact-bar");
 const contact=document.getElementById("kontakt");
 if(!bar||!contact)return;
 let inView=false;
 const sync=()=>{
  bar.hidden=inView||contact.contains(document.activeElement);
 };
 const checkPosition=()=>{
  const rect=contact.getBoundingClientRect();
  const height=window.visualViewport?.height||window.innerHeight;
  inView=rect.top<height-88&&rect.bottom>0;
  sync();
 };
 if("IntersectionObserver" in window){
  const observer=new IntersectionObserver(entries=>{
   inView=Boolean(entries[0]?.isIntersecting);
   sync();
  },{threshold:0,rootMargin:"0px 0px -88px 0px"});
  observer.observe(contact);
 }else{
  window.addEventListener("scroll",checkPosition,{passive:true});
  window.addEventListener("resize",checkPosition,{passive:true});
  window.visualViewport?.addEventListener("resize",checkPosition,{passive:true});
  checkPosition();
 }
 document.addEventListener("focusin",event=>{
  if(contact.contains(event.target))bar.hidden=true;
 });
 document.addEventListener("focusout",event=>{
  if(contact.contains(event.target))window.setTimeout(sync,0);
 });
})();
