/* Mobile contact shortcuts: avoid covering forms, films and the open guide.
   Native telephone and section links work without JS. No storage or network. */
(()=>{
 "use strict";
 const bar=document.querySelector(".mobile-contact-bar")||document.querySelector(".local-mobile-contact");
 const contact=document.getElementById("kontakt")||document.getElementById("formularz");
 const video=document.getElementById("filmy");
 if(!bar||!contact)return;
 const targets=[contact,video].filter(Boolean);
 const visible=new Set();
 let chatOpen=false;
 const sync=()=>{
  const formFocused=contact.contains(document.activeElement);
  bar.hidden=visible.size>0||chatOpen||formFocused;
 };
 document.addEventListener("twoja-sprawa:chat-visibility",event=>{
  chatOpen=event.detail?.open===true;
  sync();
 });
 const checkPosition=()=>{
  const height=window.visualViewport?.height||window.innerHeight;
  for(const target of targets){
   const rect=target.getBoundingClientRect();
   if(rect.top<height-88&&rect.bottom>0)visible.add(target);else visible.delete(target);
  }
  sync();
 };
 if("IntersectionObserver" in window){
  const observer=new IntersectionObserver(entries=>{
   for(const entry of entries){
    if(entry.isIntersecting)visible.add(entry.target);else visible.delete(entry.target);
   }
   sync();
  },{threshold:0,rootMargin:"0px 0px -88px 0px"});
  targets.forEach(target=>observer.observe(target));
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
