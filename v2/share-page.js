/* Twoja Sprawa: share only public URLs, never client or campaign data. */
(()=>{
 "use strict";
 for(const button of document.querySelectorAll("[data-share-page]")){
  const feedback=button.parentElement?.querySelector("[data-share-feedback]");
  const manual=button.parentElement?.querySelector("[data-share-manual]");
  const initial=button.textContent;
  const say=text=>{if(feedback)feedback.textContent=text;};
  const safeUrl=()=>{
   const specified=button.getAttribute("data-share-url");
   if(specified){
    const url=new URL(specified);
    if(url.origin!=="https://twoja-sprawa.pages.dev"||
       !/^\/(?:uslugi\/[a-z0-9-]+|lokalnie\/szkody-gornicze-(?:lubin|polkowice))?$/.test(url.pathname)||url.search||url.hash)return null;
    return url.href;
   }
   const current=new URL(window.location.href);
   current.search="";current.hash="";
   return current.href;
  };
  if(!safeUrl())continue;
  // No-JS: the button remains hidden, and the static public link still works.
  button.hidden=false;
  button.addEventListener("click",async()=>{
   if(button.disabled)return;
   button.disabled=true;
   if(manual)manual.hidden=true;
   say("");
   try{
    const url=safeUrl();
    if(!url)return;
    const title=document.title.replace(/\s*[|—]\s*Twoja Sprawa.*$/,"");
    if(typeof navigator.share==="function"){
     try{
      await navigator.share({title,text:"Przydatne informacje — Twoja Sprawa",url});
      say("Otwarto systemowe udostępnianie linku.");
      return;
     }catch(error){
      if(error?.name==="AbortError"){say("Anulowano udostępnianie.");return;}
     }
    }
    if(navigator.clipboard?.writeText){
     try{
      await navigator.clipboard.writeText(url);
      say("Skopiowano adres strony. Możesz wkleić go w wiadomości.");
      button.textContent="✓ Skopiowano link";
      window.setTimeout(()=>{button.textContent=initial;},2500);
      return;
     }catch{}
    }
    if(manual){
     manual.value=url;
     manual.hidden=false;
     manual.focus();
     manual.select();
     say("Zaznaczono link do ręcznego skopiowania. Skopiuj go i wklej do wiadomości.");
    }else say("Skopiuj adres strony z paska przeglądarki, aby go udostępnić.");
   }finally{button.disabled=false;}
  });
 }
})();
