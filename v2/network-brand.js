/* Partner logo progressive enhancement — show accessible text until the real logos load. */
(()=>{
 "use strict";
 const images=document.querySelectorAll(".network-brand-logos img");
 for(const image of images){
  const sync=()=>{
   const ok=image.complete && image.naturalWidth>0;
   image.parentElement?.classList.toggle("network-logo-ready",ok);
  };
  image.addEventListener("load",sync);
  image.addEventListener("error",sync);
  sync();
 }

// Votum Wsparcie may be slow rather than fully failed. Show the readable
// text immediately while pending; restore the official image if it loads.
for(const card of document.querySelectorAll(".vws-service-brand")){
 const img=card.querySelector("img");
 if(!img)continue;
 const syncSupport=()=>{
  const loaded=img.complete && img.naturalWidth>0;
  img.hidden=!loaded;
  card.classList.toggle("brand-fallback-active",!loaded);
 };
 img.addEventListener("load",syncSupport);
 img.addEventListener("error",syncSupport);
 syncSupport();
}

// Zewnętrzny obraz partnera może zostać zablokowany przez sieć lub przeglądarkę.
// Wtedy zachowujemy link do spółki i pokazujemy jej nazwę zamiast pustego pola.
// Pasek górny i VOTUM Wsparcie mają już niezależne mechanizmy zapasowe.
const otherLogos=document.querySelectorAll('img[src^="https://votum-sa.pl/wp-content/uploads/"]');
for(const img of otherLogos){
 if(img.closest(".network-brand-logos, .vws-service-brand"))continue;
 const link=img.closest("a");
 if(!link)continue;
 const src=img.getAttribute("src")||"";
 const label=/votum-scale-agency/i.test(src)?"VOTUM Scale Agency":
  /logo-votum-network/i.test(src)?"VOTUM Network":
  /logo_VOTUM_SA/i.test(src)?"VOTUM S.A.":null;
 if(!label)continue;
 img.classList.add("external-partner-logo-remote");
 const alreadyLabeled=[...link.children].some(node=>node!==img&&Boolean(node.textContent?.trim()));
 const fallback=alreadyLabeled?null:document.createElement("span");
 if(fallback){
  fallback.className="external-partner-logo-fallback";
  fallback.textContent=label;
  fallback.hidden=true;
  link.appendChild(fallback);
 }
 const syncOther=()=>{
  const failed=img.complete&&img.naturalWidth===0;
  img.hidden=failed;
  if(fallback)fallback.hidden=!failed;
 };
 img.addEventListener("load",syncOther);
 img.addEventListener("error",syncOther);
 syncOther();
}
})();
