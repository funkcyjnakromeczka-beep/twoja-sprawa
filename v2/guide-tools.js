/* Lightweight print action for educational guides. No tracking or external requests. */
(() => {
 "use strict";
 const article=document.querySelector(".guide-article");
 if(!article || !window.print)return;
 const controls=document.createElement("div");
 controls.className="guide-tools";
 const printButton=document.createElement("button");
 printButton.type="button";
 printButton.className="btn secondary";
 printButton.textContent="Wydrukuj / zapisz jako PDF";
 printButton.setAttribute("aria-label","Wydrukuj poradnik lub zapisz go jako plik PDF");
 printButton.addEventListener("click",()=>window.print());
 controls.append(printButton);
 const heading=article.querySelector("h1");
 if(heading)heading.insertAdjacentElement("afterend",controls);
})();
