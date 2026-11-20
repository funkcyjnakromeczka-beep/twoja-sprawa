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
 const nextSteps=Object.freeze({
  nowe:"Sprawdź potwierdzenie Web3Forms, wyszukaj kod TS w CRM i ustal preferowaną formę pierwszego kontaktu.",
  kontakt:"Zweryfikuj rodzaj sprawy i uzgodnij bezpieczny sposób przekazania dokumentów, jeśli są potrzebne.",
  dokumenty:"Sprawdź, których dokumentów brakuje, i uzgodnij termin kolejnego kontaktu bez wpisywania danych wrażliwych w notatce.",
  analiza:"Ustal, kto analizuje dokumenty, oraz jaki krok można podjąć po uzyskaniu wyniku analizy.",
  przekazane:"Sprawdź potwierdzenie przekazania do VOTUM i przypisanie osoby odpowiedzialnej za dalszy kontakt.",
  umowa:"Potwierdź podpisanie umowy w dokumentacji i wskaż kolejny krok obsługi, bez obiecywania wyniku.",
  zamkniete:"Zweryfikuj przyczynę zamknięcia sprawy i zakończ dalsze przypomnienia zgodnie z ustaleniami."
 });
 const refPattern=/^TS-\d{8}-[A-F0-9]{12}$/;
 const codePattern=/^[a-z0-9_-]{1,40}$/;
 function calendarDateFromReference(ref){
  const year=Number(ref.slice(3,7)),month=Number(ref.slice(7,9)),day=Number(ref.slice(9,11));
  const date=new Date(Date.UTC(year,month-1,day));
  return year>=2020&&year<=2100&&date.getUTCFullYear()===year&&
   date.getUTCMonth()===month-1&&date.getUTCDate()===day;
 }
 function campaignFromUrl(rawUrl,origin){
  let url,base;
  try{
   base=new URL(String(origin));
   url=new URL(String(rawUrl||""),base);
  }catch{throw Error("Nieprawidłowy link kampanii.");}
  if(!["https:","http:"].includes(base.protocol)||url.origin!==base.origin||
     !["https:","http:"].includes(url.protocol))throw Error("Wybierz link z własnej witryny Twoja Sprawa.");
  const source=(url.searchParams.get("utm_source")||"").toLowerCase().trim();
  const campaign=(url.searchParams.get("utm_campaign")||"").toLowerCase().trim();
  if(!sources.includes(source)||!codePattern.test(campaign))
   throw Error("Link nie zawiera poprawnego źródła i nazwy kampanii UTM.");
  // Import exactly two categorical tags, never unrelated URL parameters,
  // fragments, names, phones, tokens or free-form text.
  return {source,campaign};
 }
 function parseFollowUpDate(value){
  const text=String(value||"").trim();
  if(!text)return "";
  if(!/^\d{4}-\d{2}-\d{2}$/.test(text))throw Error("Podaj poprawną datę kolejnego kontaktu w formacie RRRR-MM-DD.");
  const year=Number(text.slice(0,4)),month=Number(text.slice(5,7)),day=Number(text.slice(8,10));
  const date=new Date(Date.UTC(year,month-1,day));
  if(year<2020||year>2100||date.getUTCFullYear()!==year||
     date.getUTCMonth()!==month-1||date.getUTCDate()!==day)
   throw Error("Data kolejnego kontaktu nie istnieje w kalendarzu.");
  return text;
 }
 function verification(input){
  return {
   received:input.received===true,
   checkedDuplicates:input.checkedDuplicates===true
  };
 }
 function prepare(input){
  const ref=String(input.ref||"").trim().toUpperCase();
  if(!refPattern.test(ref)||!calendarDateFromReference(ref))throw Error("Podaj pełny kod TS z prawidłową datą i 12 znakami, zgodny z potwierdzeniem.");
  const service=String(input.service||"");
  if(!Object.prototype.hasOwnProperty.call(services,service))throw Error("Wybierz jedną z sześciu usług.");
  const source=String(input.source||"");
  if(!sources.includes(source))throw Error("Wybierz źródło lub Nieoznaczone.");
  const campaign=String(input.campaign||"").trim().toLowerCase()||"brak";
  if(!codePattern.test(campaign))throw Error("Kampania może zawierać tylko 1–40 znaków a-z, 0-9, _ i -. Nie wpisuj danych klienta.");
  const status=String(input.status||"");
  if(!Object.prototype.hasOwnProperty.call(statuses,status))throw Error("Wybierz bieżący status sprawy.");
  if(["przekazane","umowa"].includes(status)&&input.confirmed!==true)
   throw Error("Przed oznaczeniem przekazania lub umowy potwierdź ten fakt w dokumentach.");
  return {ref,service:services[service].name,advisor:services[service].advisor,source,campaign,status:statuses[status],followUp:parseFollowUpDate(input.followUp),...verification(input)};
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
   "Następny krok (zalecenie wewnętrzne): "+nextSteps[String(input.status||"")],
   "Wpływ zgłoszenia zweryfikowany: "+(item.received?"TAK — zaznaczono ręcznie":"NIE — wymaga sprawdzenia"),
   "Sprawdzono duplikaty w CRM: "+(item.checkedDuplicates?"TAK — zaznaczono ręcznie":"NIE — wymaga sprawdzenia"),
   "Następny kontakt (plan wewnętrzny): "+(item.followUp||"nie ustalono"),
   "Weryfikacja: sprawdź e-mail Web3Forms i istniejącą kartę w CRM przed utworzeniem nowej.",
   "Uwaga: notatka nie potwierdza dostarczenia e-maila, podpisania umowy ani przekazania sprawy."
  ].join("\n");
 }
 root.TwojaSprawaCrmHandoff=Object.freeze({services,sources,statuses,nextSteps,prepare,note,campaignFromUrl,parseFollowUpDate});
})(window);
