/* Ręczna notatka przekazania do CRM, wyłącznie metadane sprawy.
   Brak cookies, storage, zapytań sieciowych i danych osobowych. */
(function(root){
 "use strict";
 const services=Object.freeze({
  szkody:{name:"Szkody górnicze",advisor:"Wojciech Obiegło"},
  swiadczenie:{name:"Świadczenie wspierające",advisor:"Paulina Chandrała"},
  renty:{name:"Renty powypadkowe",advisor:"Paulina Chandrała"},
  skd:{name:"Kredyt w PLN / SKD",advisor:"Wojciech Obiegło"},
  franki:{name:"Kredyty frankowe CHF",advisor:"Wojciech Obiegło"},
  przesyl:{name:"Służebność przesyłu",advisor:"Wojciech Obiegło"}
 });
 const sources=Object.freeze(["facebook","instagram","tiktok","google","chatgpt.com","perplexity.ai",
  "claude.ai","gemini.google.com","copilot.microsoft.com","grok.com","ulotka","plakat","qr",
  "polecenie","organiczne","strona","inne","nieoznaczone"]);
 const statuses=Object.freeze({
  nowe:"Nowe zgłoszenie — do weryfikacji",
  kontakt:"Kontakt nawiązany",
  dokumenty:"Oczekiwanie na dokumenty",
  analiza:"Wstępna analiza",
  przekazane:"Przekazane do VOTUM — wymaga potwierdzenia",
  umowa:"Umowa podpisana — wymaga potwierdzenia",
  zamkniete:"Sprawa zamknięta"
 });
 const refPattern=/^TS-\d{8}-[A-F0-9]{12}$/;
 const codePattern=/^[a-z0-9_-]{1,40}$/;
 function prepare(input){
  const ref=String(input.ref||"").trim().toUpperCase();
  if(!refPattern.test(ref))throw Error("Podaj pełny kod zgłoszenia zaczynający się od TS-, zgodny z potwierdzeniem.");
  const service=String(input.service||"");
  if(!Object.prototype.hasOwnProperty.call(services,service))throw Error("Wybierz jedną z sześciu usług.");
  const source=String(input.source||"");
  if(!sources.includes(source))throw Error("Wybierz źródło lub Nieoznaczone.");
  const campaign=String(input.campaign||"").trim().toLowerCase()||"brak";
  if(!codePattern.test(campaign))throw Error("Kampania może zawierać tylko 1–40 znaków a-z, 0-9, _ i -. Nie wpisuj danych klienta.");
  const status=String(input.status||"");
  if(!Object.prototype.hasOwnProperty.call(statuses,status))throw Error("Wybierz bieżący status sprawy.");
  return {ref,service:services[service].name,advisor:services[service].advisor,source,campaign,status:statuses[status]};
 }
 function note(input){
  const item=prepare(input);
  return [
   "TWOJA SPRAWA — NOTATKA ROBOCZA DO CRM",
   "Kod zgłoszenia: "+item.ref,
   "Usługa: "+item.service,
   "Opiekun: "+item.advisor,
   "Źródło kontaktu: "+item.source,
   "Kampania UTM: "+item.campaign,
   "Etap obsługi (deklarowany): "+item.status,
   "Weryfikacja: sprawdź e-mail Web3Forms i istniejącą kartę w CRM przed utworzeniem nowej.",
   "Uwaga: notatka nie potwierdza dostarczenia e-maila, podpisania umowy ani przekazania sprawy."
  ].join("\n");
 }
 root.TwojaSprawaCrmHandoff=Object.freeze({services,sources,statuses,prepare,note});
})(window);
