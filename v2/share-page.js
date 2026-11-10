/* Twoja Sprawa — udostępnianie publicznego linku. Brak analityki, kont i wysyłania danych. */
(() => {
 "use strict";
 const controls=document.querySelectorAll("[data-share-page]");
 if(!controls.length)return;
 for(const button of controls){
  const feedback=button.parentElement?.querySelector("[data-share-feedback]");
  const initial=button.textContent;
  const say=(message)=>{if(feedback)feedback.textContent=message;};
  button.addEventListener("click",async()=>{
   const url=new URL(window.location.href);
   url.search="";url.hash=""; // nie udostępniaj parametrów kampanii ani śladów nawigacji
   const title=document.title.replace(/\s*[|—]\s*Twoja Sprawa.*$/,"");
   try{
    if(typeof navigator.share==="function"){
     await navigator.share({title,text:"Przydatne informacje — Twoja Sprawa",url:url.href});
     say("Link udostępniony z wykorzystaniem wybranej aplikacji.");
    }else if(navigator.clipboard?.writeText){
     await navigator.clipboard.writeText(url.href);
     say("Skopiowano adres strony. Możesz wkleić go w wiadomości.");
     button.textContent="✓ Skopiowano link";
     window.setTimeout(()=>{button.textContent=initial;},2500);
    }else{
     say("Skopiuj adres strony z paska przeglądarki, aby go udostępnić.");
    }
   }catch(error){
    if(error?.name==="AbortError")return;
    say("Nie udało się automatycznie udostępnić. Skopiuj adres strony z przeglądarki.");
   }
  });
 }
})();
