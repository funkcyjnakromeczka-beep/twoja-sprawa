/* Twoja Sprawa — drukowalne broszury dla 6 usług, bez przechowywania lub wysyłania danych. */
(()=>{
 "use strict";
 const root=document.querySelector("[data-brochure-root]");
 if(!root)return;
 const wojciech={name:"Wojciech Obiegło",agent:"A020664",phone:"796 441 345",dial:"+48796441345",email:"wojciech.obieglo@votum-ds.pl"};
 const paulina={name:"Paulina Chandrała",agent:"A021065",phone:"500 171 531",dial:"+48500171531",email:"paulina.chandrala@votum-ds.pl"};
 const DATA={
 "szkody-gornicze":{
  title:"Szkoda górnicza",sub:"Jakie dokumenty i zdjęcia przygotować?",area:"Lubin • Polkowice • okolice",icon:"⌂",advisor:wojciech,
  intro:"Praktyczny poradnik dla właścicieli nieruchomości. Nie każda rysa oznacza szkodę górniczą.",
  transfer:"Zacznij od zdjęć i krótkiego opisu. Przekazuj materiały bezpiecznym, uzgodnionym kanałem i zachowuj oryginały.",
  rules:[["Najpierw dokumentuj","Zrób zdjęcia przed naprawą, o ile nie zagraża to bezpieczeństwu."],["Zachowaj korespondencję","Pisma kopalni, protokoły, potwierdzenia i rachunki przechowuj razem."],["Sprawdź ugodę","Przed podpisaniem sprawdź, jakie szkody i okres obejmuje rozliczenie."],["Nie czekaj na komplet","Już pierwsze zdjęcia i podstawowe dokumenty pomogą rozpocząć rozmowę."]],
  panels:[
   ["NIERUCHOMOŚĆ","Budynek i dokumenty",[["Stan prawny","Akt notarialny lub dane księgi wieczystej","Umowa zakupu nieruchomości, jeśli istnieje"],["Dokumentacja budynku","Projekt budowlany i opis fundamentów","Pozwolenie na budowę lub użytkowanie","Dziennik budowy i wcześniejsze ekspertyzy"],["Przeglądy","Protokoły okresowych przeglądów","W bloku: protokoły części wspólnych"]],"Dokumenty pomagają odtworzyć historię i stan budynku."],
   ["KOPALNIA","Pisma i naprawy",[["Postępowanie","Zgłoszenie szkody i dowód nadania","Pisma, e-maile oraz protokoły oględzin","Propozycje ugody, odmowy i wcześniejsze ugody"],["Naprawy i rozliczenia","Faktury za wcześniejsze naprawy","Umowy z wykonawcami i kosztorysy","Wcześniejsze wyceny i wypłaty"]],"Zapisuj daty i ustalenia rozmów z kopalnią."],
   ["OBSERWACJE","Zdjęcia, daty, świadkowie",[["Przed szkodą","Starsze zdjęcia domu i posesji","Archiwalne fotografie lub ogłoszenia"],["Stan obecny","Każde uszkodzenie: ogólnie i z bliska","Oryginały zdjęć bez filtrów","Dziennik szkód: data, miejsce, numer zdjęcia"],["Dodatkowe informacje","Notatki po wstrząsach","Dane świadków zachowane prywatnie"]],"Sama fotografia nie dowodzi przyczyny górniczej."]
  ],service:"/uslugi/szkody-gornicze",social:"facebook.com/szkodygornicze.pomoc",
  note:"Opracowano na podstawie udostępnionej broszury dotyczącej szkód górniczych."
 },
 "swiadczenie-wspierajace":{
  title:"Świadczenie wspierające",sub:"Co przygotować do rozmowy o WZON i ZUS?",area:"Cała Polska • pomoc w formalnościach",icon:"✦",advisor:paulina,
  intro:"Dla osób dorosłych i bliskich pomagających im w formalnościach.",
  transfer:"Na początek wystarczy informacja, czy sprawa jest przed WZON, po decyzji WZON czy w ZUS. Nie przesyłaj publicznie dokumentacji medycznej.",
  rules:[["Najpierw WZON","Do ZUS wniosek składa się po uzyskaniu ostatecznej decyzji WZON."],["Zapisz daty","Zachowuj pouczenia, potwierdzenia i daty doręczenia decyzji."],["Opisz codzienność","Przygotuj prawdziwe przykłady potrzebnego wsparcia."],["Chroń prywatność","Nie publikuj PESEL ani diagnoz w komentarzach i grupach."]],
  panels:[
   ["WZON","Orzeczenia i decyzje",[["Dokumenty","Orzeczenie o niepełnosprawności, jeśli je masz","Wniosek o ustalenie poziomu potrzeby wsparcia","Potwierdzenie złożenia wniosku"],["Po decyzji","Decyzja WZON, punktacja i pouczenie","Data doręczenia decyzji","Odwołania i odpowiedzi, jeśli były"]],"Nie każdy klient ma wszystkie wymienione dokumenty."],
   ["ZUS","Wniosek i korespondencja",[["Wniosek","Numer ostatecznej decyzji WZON","Kopia wniosku i potwierdzenie wysłania","Korespondencja na eZUS / PUE ZUS"],["Dalszy etap","Wezwania ZUS do uzupełnień","Informacja lub decyzja ZUS","Historia wypłat, jeśli dotyczy"]],"Decyzji WZON nie trzeba dołączać do wniosku ZUS."],
   ["FUNKCJONOWANIE","Codzienne potrzeby",[["Przykłady","Poruszanie się i samoobsługa","Komunikowanie się i sprawy codzienne","Czynności wymagające pomocy"],["Częstotliwość","Jak często i na jak długo potrzebna jest pomoc","Wsparcie innych osób i używany sprzęt","Przykłady z ostatnich tygodni"]],"Punktację ustala WZON; wynik nie jest gwarantowany."]
  ],service:"/uslugi/swiadczenie-wspierajace",social:"facebook.com/groups/twojasprawa.swiadczenia.renty",
  note:"ZUS: samodzielne złożenie wniosku o świadczenie wspierające jest bezpłatne."
 },
 "renty-powypadkowe":{
  title:"Renta powypadkowa",sub:"Dokumenty do analizy i możliwego podwyższenia",area:"Renty od ubezpieczycieli • cała Polska",icon:"↗",advisor:paulina,
  intro:"Dotyczy przede wszystkim rent od ubezpieczycieli, a nie rent wypłacanych przez ZUS lub KRUS.",
  transfer:"Wystarczy informacja, kiedy był wypadek, kto wypłaca rentę i co zmieniło się w Twojej sytuacji. Dokumenty zdrowotne przekaż bezpiecznie.",
  rules:[["Zachowaj decyzje","Przygotuj decyzje, ugody i wyroki stanowiące podstawę renty."],["Dokumentuj koszty","Zbieraj rachunki za opiekę, leczenie i rehabilitację."],["Porównaj dochody","Zachowaj dowody zarobków sprzed wypadku i po wypadku."],["Uważaj na ugody","Sprawdź skutki kapitalizacji lub jednorazowego rozliczenia."]],
  panels:[
   ["WYPADEK","Zdarzenie i odpowiedzialność",[["Okoliczności","Data i opis wypadku","Notatka policji lub protokół powypadkowy","Numer szkody i dane ubezpieczyciela"],["Rozstrzygnięcia","Decyzje o odpowiedzialności","Ugody, wyroki i pisma pełnomocnika"]],"Dokumenty zależą od rodzaju zdarzenia."],
   ["POTRZEBY","Leczenie i wydatki",[["Stan zdrowia","Dokumenty leczenia i rehabilitacji","Zalecenia i potrzeba opieki","Zmiany po ustaleniu renty"],["Koszty","Rachunki za leki, sprzęt i rehabilitację","Koszty dojazdów i pomocy osób trzecich","Miesięczne zestawienie wydatków"]],"Dokumentów zdrowotnych nie publikuj w komentarzach."],
   ["ROZLICZENIA","Dochody i wypłaty",[["Praca","PIT, paski płacowe, zaświadczenia","Informacje o ograniczeniach pracy"],["Renta","Decyzja ustalająca wysokość świadczenia","Historia wypłat i podwyżek","Odmowy podwyższenia lub ugody"]],"Zmiana wysokości renty wymaga oceny konkretnej sprawy."]
  ],service:"/uslugi/renty-powypadkowe",social:"facebook.com/groups/twojasprawa.swiadczenia.renty",
  note:"Informacje ogólne: Rzecznik Finansowy, materiały dla poszkodowanych."
 },
 "skd":{
  title:"Sankcja kredytu darmowego",sub:"Co przygotować do analizy kredytu konsumenckiego?",area:"Kredyty konsumenckie PLN • cała Polska",icon:"§",advisor:wojciech,
  intro:"Nie każda umowa kredytowa daje podstawę do skorzystania z SKD.",
  transfer:"Wstępnie podaj rodzaj umowy i numer telefonu. Nie publikuj umowy kredytowej ani danych dostępu do banku w grupach.",
  rules:[["Przygotuj całą umowę","Dołącz załączniki, aneksy, regulamin i warunki kosztów."],["Zbierz spłaty","Historia wpłat i harmonogram pozwalają odtworzyć rozliczenia."],["Sprawdź daty","Ważne mogą być zawarcie i wykonanie umowy oraz terminy oświadczeń."],["Nie zakładaj wyniku","Możliwość zastosowania sankcji wymaga analizy konkretnej umowy."]],
  panels:[
   ["UMOWA","Dokumenty kredytowe",[["Umowa","Podpisana umowa z załącznikami","Regulamin i formularz informacyjny","Aneksy i dodatkowe porozumienia"],["Koszty","Dokumenty prowizji i ubezpieczeń","Warunki dodatkowych produktów"]],"Nigdy nie przekazuj haseł ani kodów autoryzacyjnych."],
   ["SPŁATA","Harmonogram i historia",[["Płatności","Pierwotny i aktualny harmonogram","Historia spłat, odsetek i opłat","Potwierdzenia wcześniejszej spłaty"],["Rozliczenia","Potwierdzenia prowizji","Zaświadczenia i zestawienia bankowe"]],"Przydatne są informacje z całego okresu kredytu."],
   ["BANK","Korespondencja i terminy",[["Pisma","Reklamacje i odpowiedzi banku","Wezwania i pisma dotyczące umowy","Ewentualne oświadczenia o SKD"],["Chronologia","Daty zawarcia i wykonania umowy","Daty wysłania i doręczenia pism"]],"Analiza nie gwarantuje odzyskania kosztów kredytu."]
  ],service:"/uslugi/kredyty-pln",social:"facebook.com/w.bieglo",
  note:"Informacje ogólne: UOKiK, ustawa o kredycie konsumenckim."
 },
 "kredyty-frankowe":{
  title:"Kredyt frankowy",sub:"Co przygotować do analizy umowy CHF?",area:"Kredyt aktywny lub spłacony • cała Polska",icon:"CHF",advisor:wojciech,
  intro:"Dokumenty umożliwiają ocenę umowy i historii rozliczeń z bankiem.",
  transfer:"Na pierwszą rozmowę wystarczą: bank, rok umowy, informacja o spłacie i kontakt. Pełne dokumenty przekaż bezpiecznie.",
  rules:[["Zachowaj umowę","Przygotuj regulamin, aneksy i dokumenty wypłaty środków."],["Zbierz historię spłat","Ważne są raty w PLN, CHF i przewalutowania."],["Sprawdź propozycję ugody","Przed podpisaniem poznaj skutki rozliczeń z bankiem."],["Zachowuj pisma","Reklamacje, potwierdzenia, wyroki i rozliczenia trzymaj razem."]],
  panels:[
   ["UMOWA","Kredyt i jego warunki",[["Podstawowe","Umowa, regulamin i tabela opłat","Wszystkie aneksy i załączniki","Dokumenty uruchomienia kredytu"],["Zmiany","Przewalutowania, oprocentowanie","Ugody i refinansowanie"]],"Część dokumentów może pochodzić sprzed wielu lat."],
   ["HISTORIA","Spłaty i rozliczenia",[["Przepływy","Zaświadczenie o historii spłat","Daty i kwoty rat w PLN / CHF","Kursy przeliczeń, jeśli je masz"],["Koszty","Prowizje i opłaty dodatkowe","Potwierdzenie całkowitej spłaty","Dowody nadpłat, jeśli istnieją"]],"Nie trzeba samodzielnie wyliczać roszczeń."],
   ["SPÓR","Bank i stan sprawy",[["Korespondencja","Reklamacje, wezwania, odpowiedzi","Propozycje ugód i aneksy","Pisma pełnomocników"],["Postępowanie","Pozew i pisma procesowe, jeśli są","Wyroki, terminy i sygnatura"]],"Możliwe działania zależą od umowy i chronologii."]
  ],service:"/uslugi/kredyty-frankowe",social:"",
  note:"Zestawienie pomocnicze; podstawy roszczeń wymagają indywidualnej oceny."
 },
 "sluzebnosc-przesylu":{
  title:"Służebność przesyłu",sub:"Jak przygotować dokumenty dotyczące działki?",area:"Nieruchomości i infrastruktura • cała Polska",icon:"⌁",advisor:wojciech,
  intro:"Dotyczy m.in. słupów, linii, rur i innych urządzeń przesyłowych.",
  transfer:"Podaj ogólny rodzaj urządzenia i miejscowość. Dane nieruchomości i dokumenty własności przekazuj wyłącznie uzgodnionym kanałem.",
  rules:[["Ustal stan działki","Przygotuj księgę wieczystą, mapy i dokument nabycia."],["Zrób zdjęcia","Pokaż położenie urządzeń i ich otoczenie."],["Zachowuj pisma","Dawne zgody i korespondencja mogą być ważne."],["Zadbaj o bezpieczeństwo","Nie dotykaj urządzeń i nie wchodź do obiektów technicznych."]],
  panels:[
   ["DZIAŁKA","Własność i mapy",[["Dokumenty","Księga wieczysta, dokument nabycia","Wypis z rejestru gruntów, jeśli masz","Mapa ewidencyjna lub zasadnicza"],["Historia","Dawne projekty i plany","Informacje o wcześniejszych właścicielach"]],"Potrzebna jest weryfikacja stanu prawnego."],
   ["URZĄDZENIA","Położenie i ograniczenia",[["Co znajduje się na działce","Zdjęcia linii, słupów, rur lub kabli","Mapa lub szkic położenia","Orientacyjna data powstania instalacji"],["Korzystanie z gruntu","Miejsca utrudnionego użytkowania","Informacje o pracach serwisowych"]],"Nie wykonuj pomiarów w sposób niebezpieczny."],
   ["PISMA","Przedsiębiorca i rozliczenia",[["Korespondencja","Pisma operatora i poprzednie uzgodnienia","Ewentualne zgody na budowę lub wstęp","Umowy służebności"],["Dotychczasowe działania","Propozycje wynagrodzenia i wyceny","Wnioski i odpowiedzi","Dokumenty postępowania, jeśli są"]],"Sama obecność urządzenia nie przesądza roszczenia."]
  ],service:"/uslugi/sluzebnosc-przesylu",social:"",
  note:"Praktyczna lista do przygotowania dokumentów; bez gwarancji wyniku."
 }
 };
 const q=new URLSearchParams(location.search);
 const key=(q.get("broszura")||"").toLowerCase();
 if(!Object.prototype.hasOwnProperty.call(DATA,key))return;
 const d=DATA[key];root.hidden=false;document.body.classList.add("brochure-active");
 document.title=d.title+" — broszura do druku | Twoja Sprawa";
 const make=(tag,cls,content)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=content;return e;};
 const front=make("div","ts-brochure-spread ts-brochure-front");
 const rules=make("article","ts-brochure-panel ts-brochure-rules");
 rules.append(make("span","ts-brochure-overline","ZANIM ZACZNIESZ"),make("h3","", "Cztery zasady"));
 d.rules.forEach(([head,body],i)=>{
  const row=make("div","ts-brochure-rule");
  row.append(make("strong","ts-brochure-num",String(i+1)));
  const copy=make("div","");
  copy.append(make("h4","",head),make("p","",body));row.append(copy);rules.append(row);
 });
 rules.append(make("p","ts-brochure-signature","TWOJA SPRAWA  •  SuccessTree"));
 const contacts=make("article","ts-brochure-panel ts-brochure-contact");
 contacts.append(make("span","ts-brochure-overline","JAK PRZEKAZAĆ MATERIAŁY"),make("h3","", "Prześlij to, co już masz"),make("p","ts-brochure-intro",d.transfer),make("span","ts-brochure-overline","TWÓJ KONTAKT"),make("h4","ts-brochure-advisor",d.advisor.name),make("p","ts-brochure-agent","Przedstawiciel współpracujący z VOTUM • "+d.advisor.agent));
 const details=[["TELEFON",d.advisor.phone,"tel:"+d.advisor.dial],["E-MAIL",d.advisor.email,"mailto:"+d.advisor.email],["STRONA WWW","twoja-sprawa.pages.dev","https://twoja-sprawa.pages.dev/"]];
 if(d.social)details.push(["KANAŁ SPOŁECZNOŚCIOWY",d.social,"https://"+d.social]);
 for(const [lab,value,href] of details){
  const item=make("div","ts-brochure-detail");item.append(make("b","",lab));
  const link=make("a","",value);link.href=href;if(href.startsWith("https:")){link.target="_blank";link.rel="noopener noreferrer";}item.append(link);contacts.append(item);
 }
 contacts.append(make("p","ts-brochure-endnote","Nie podawaj danych wrażliwych w publicznych komentarzach. Oryginały dokumentów zachowaj u siebie."));
 const cover=make("article","ts-brochure-panel ts-brochure-cover");
 const coverTop=make("div","");
 coverTop.append(make("span","ts-brochure-overline","PORADNIK DLA KLIENTÓW"),make("h3","",d.title),make("h4","",d.sub),make("p","",d.intro));
 const emblem=make("div","ts-brochure-emblem",d.icon);emblem.setAttribute("aria-hidden","true");
 const bottom=make("div","ts-brochure-cover-bottom");
 bottom.append(make("strong","","Nie musisz mieć wszystkiego."),make("p","","Wystarczy zacząć od tego, co już posiadasz."),make("small","","TWOJA SPRAWA  •  SuccessTree / VOTUM"));
 cover.append(coverTop,emblem,bottom);front.append(rules,contacts,cover);
 const back=make("div","ts-brochure-spread ts-brochure-back");
 d.panels.forEach(([kicker,title,groups,note],i)=>{
  const panel=make("article","ts-brochure-panel ts-brochure-document");
  panel.append(make("span","ts-brochure-overline",String(i+1)+"  •  "+kicker),make("h3","",title));
  groups.forEach(([group,...items])=>{
   panel.append(make("h4","",group));
   const ul=make("ul","");items.forEach(text=>ul.append(make("li","",text)));panel.append(ul);
  });
  panel.append(make("p","ts-brochure-footnote",note));back.append(panel);
 });
 const head=make("div","ts-brochure-control");
 const info=make("div","");info.append(make("span","ts-brochure-overline","DOKUMENT DLA KLIENTA"),make("h2","",d.title+" — wersja graficzna"),make("p","", "Dwie strony w formacie A4 poziomo. Drukuj lub wybierz w oknie wydruku „Zapisz jako PDF”. Pola do odhaczania nie są potrzebne."));
 const actions=make("div","ts-brochure-actions");
 const print=make("button","ts-brochure-print","Drukuj / Zapisz PDF");print.type="button";print.addEventListener("click",()=>window.print());
 const link=make("a","ts-brochure-service-link","Przejdź do usługi");link.href=d.service;
 actions.append(print,link);head.append(info,actions);
 const note=make("p","ts-brochure-caveat",d.note+" Materiał informacyjny; nie zastępuje indywidualnej analizy. Dalsza współpraca jest dobrowolna i na zasadach przedstawionych przed podpisaniem umowy.");
 root.replaceChildren(head,front,back,note);
 document.body.classList.add("ts-brochure-ready");
})();