/* Six privacy-safe organic social post templates for free client brochures.
   This tool does not publish posts, transmit data, set cookies, or create leads. */
(()=>{
 "use strict";
 const root=document.querySelector("[data-brochure-promo]");
 if(!root)return;
 const chooser=root.querySelector("[data-brochure-promo-service]");
 const channel=root.querySelector("[data-brochure-promo-channel]");
 const draft=root.querySelector("[data-brochure-promo-draft]");
 const copy=root.querySelector("[data-brochure-promo-copy]");
 const feedback=root.querySelector("[data-brochure-promo-status]");
 if(!chooser||!channel||!draft||!copy||!feedback)return;
 const DATA=Object.freeze({
  "szkody-gornicze":{
   text:"Pęknięcia ścian, rysy elewacji albo nierówna kostka w Lubinie lub Polkowicach?\n\nPrzygotowaliśmy bezpłatną broszurę: jakie zdjęcia, dokumenty i pisma zachować przed rozmową o możliwej szkodzie górniczej. Sama rysa nie przesądza o przyczynie uszkodzenia.",
   phone:"Wojciech Obiegło • 796 441 345",tags:"#SzkodyGornicze #Lubin #Polkowice"
  },
  "swiadczenie-wspierajace":{
   text:"Świadczenie wspierające — dokumenty WZON, decyzja o poziomie potrzeby wsparcia i sprawa ZUS.\n\nUdostępniamy bezpłatną broszurę o przygotowaniu do poszczególnych etapów. Punktację ustala WZON, a wynik postępowania jest indywidualny. Nie publikuj dokumentacji medycznej w komentarzach.",
   phone:"Paulina Chandrała • 500 171 531",tags:"#SwiadczenieWspierajace #WZON #ZUS"
  },
  "renty-powypadkowe":{
   text:"Renta powypadkowa od ubezpieczyciela — co warto zebrać do analizy?\n\nZapisz koszty leczenia, rehabilitacji, zwiększone potrzeby i zmiany w dochodach. Przygotowaliśmy bezpłatną broszurę z listą materiałów. Ewentualne roszczenia i wysokość renty zależą od okoliczności sprawy.",
   phone:"Paulina Chandrała • 500 171 531",tags:"#RentaPowypadkowa #Odszkodowania"
  },
  "skd":{
   text:"Masz kredyt konsumencki w PLN i chcesz sprawdzić, czy w Twojej umowie można rozważyć sankcję kredytu darmowego (SKD)?\n\nZobacz bezpłatną broszurę z listą dokumentów: umowa, aneksy, harmonogram spłat i korespondencja z bankiem. Nie każda umowa daje podstawę do zastosowania SKD.",
   phone:"Wojciech Obiegło • 796 441 345",tags:"#SKD #SankcjaKredytuDarmowego #KredytPLN"
  },
  "kredyty-frankowe":{
   text:"Kredyt frankowy — aktywny lub już spłacony?\n\nPrzed analizą warto uporządkować umowę CHF, aneksy, historię spłat i pisma z banku. Przygotowaliśmy bezpłatną broszurę z listą dokumentów. Możliwość dochodzenia roszczeń wymaga indywidualnej oceny.",
   phone:"Wojciech Obiegło • 796 441 345",tags:"#KredytyFrankowe #CHF #AnalizaUmowy"
  },
  "sluzebnosc-przesylu":{
   text:"Słup energetyczny, linia albo inne urządzenie przesyłowe na działce?\n\nZobacz bezpłatną broszurę: jakie mapy, dokumenty nieruchomości, zdjęcia i pisma mogą przydać się do analizy. Samo istnienie urządzeń nie oznacza automatycznie prawa do wynagrodzenia.",
   phone:"Wojciech Obiegło • 796 441 345",tags:"#SluzebnoscPrzesylu #Nieruchomosci"
  }
 });
 const render=()=>{
  const key=chooser.value;
  const item=Object.prototype.hasOwnProperty.call(DATA,key)?DATA[key]:null;
  if(!item){draft.value="";copy.disabled=true;feedback.textContent="Wybierz temat broszury.";return;}
  // Only an approved platform category and a fixed brochure slug.
  // No personal identifiers, cookies or per-visitor tracking are generated.
  const allowedChannels=new Set(["facebook","instagram","tiktok","inne"]);
  const source=allowedChannels.has(channel.value)?channel.value:"inne";
  const url=new URL("https://twoja-sprawa.pages.dev/plan-dzialania");
  url.searchParams.set("broszura",key);
  url.searchParams.set("utm_source",source);
  url.searchParams.set("utm_medium","social");
  url.searchParams.set("utm_campaign","broszura_"+key.replaceAll("-","_"));
  url.searchParams.set("utm_content","post_organic");
  url.hash="broszura";
  draft.value=item.text+"\n\nBroszura do wydruku: "+url.href+"\n\nKontakt: "+item.phone+"\ntwoja-sprawa.pages.dev\n"+item.tags;
  copy.disabled=false;
  feedback.textContent="";
 };
 chooser.addEventListener("change",render);
 channel.addEventListener("change",render);
 copy.addEventListener("click",async()=>{
  const content=draft.value;
  if(!content){feedback.textContent="Najpierw wybierz temat.";return;}
  try{
   if(navigator.clipboard?.writeText){
    await navigator.clipboard.writeText(content);
    feedback.textContent="Skopiowano post. Możesz wkleić go na Facebooku lub w innym serwisie.";
    return;
   }
  }catch{}
  // No false success message when access to the clipboard is denied.
  draft.focus();draft.select();
  feedback.textContent="Zaznaczono tekst posta. Skopiuj go ręcznie.";
 });
 render();
})();
