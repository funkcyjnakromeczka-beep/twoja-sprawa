/* Guide actions: print and share; no analytics, cookies or external requests. */
(() => {
 "use strict";
 const article=document.querySelector(".guide-article");
 if(!article)return;
 const controls=document.createElement("div");
 controls.className="guide-tools";
 controls.setAttribute("role","group");
 controls.setAttribute("aria-label","Narzędzia poradnika");
 const printButton=document.createElement("button");
 printButton.type="button";
 printButton.className="btn secondary";
 printButton.textContent="Wydrukuj / zapisz jako PDF";
 printButton.addEventListener("click",()=>window.print());
 controls.append(printButton);
 const shareButton=document.createElement("button");
 shareButton.type="button";
 shareButton.className="btn secondary";
 shareButton.textContent="Kopiuj link do poradnika";
 const message=document.createElement("span");
 message.className="guide-copy-status";
 message.setAttribute("role","status");
 message.setAttribute("aria-live","polite");
 shareButton.addEventListener("click",async()=>{
  const link=window.location.origin+window.location.pathname;
  try{
   if(!navigator.clipboard?.writeText)throw Error("clipboard-unavailable");
   await navigator.clipboard.writeText(link);
   message.textContent="Link skopiowany. Możesz go wkleić do wiadomości lub posta.";
  }catch{
   message.replaceChildren();
   const label=document.createElement("label");
   label.textContent="Skopiuj ten adres:";
   const input=document.createElement("input");
   input.type="text";input.readOnly=true;input.value=link;
   input.setAttribute("aria-label","Adres poradnika do skopiowania");
   label.append(input);message.append(label);
   input.focus();input.select();
  }
 });
 controls.append(shareButton,message);
 const heading=article.querySelector("h1");
 if(heading)heading.insertAdjacentElement("afterend",controls);
})();
