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
})();
