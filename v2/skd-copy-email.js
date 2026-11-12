/* Opcjonalne kopiowanie adresu do SKD, bez zapisu danych i śledzenia. */
(()=>{
 "use strict";
 const button=document.querySelector("[data-skd-copy-email]");
 const status=document.querySelector("[data-skd-copy-status]");
 if(!button||!status||!navigator.clipboard?.writeText)return;
 button.hidden=false;
 button.addEventListener("click",async()=>{
  try{
   await navigator.clipboard.writeText("wojciech.obieglo@votum-ds.pl");
   status.textContent="Adres skopiowany. Wyślij pełną umowę jako załącznik i wpisz numer telefonu w treści wiadomości.";
  }catch{
   status.textContent="Nie udało się skopiować adresu. Możesz zaznaczyć adres e-mail podany nad przyciskami.";
  }
 });
})();
