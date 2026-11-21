/* Twoja Sprawa: lokalny plan pierwszych kroków — bez cookies, storage i żądań sieciowych. */
(()=>{"use strict";
const root=document.querySelector("[data-plan-root]");
if(!root)return;
const kinds=[...root.querySelectorAll("[data-plan-service]")];
const stageContainer=root.querySelector("[data-plan-stage-container]");
const stageSelect=root.querySelector("[data-plan-stage-select]");
const title=root.querySelector("[data-plan-title]");
const intro=root.querySelector("[data-plan-intro]");
const checklist=root.querySelector("[data-plan-checklist]");
const progress=root.querySelector("[data-plan-progress]");
const printButton=root.querySelector("[data-plan-print]");
const shareButton=root.querySelector("[data-plan-share]");
const shareStatus=root.querySelector("[data-plan-share-status]");
const shareFallback=root.querySelector("[data-plan-share-fallback]");
const shareText=root.querySelector("[data-plan-share-text]");
const resetButton=root.querySelector("[data-plan-reset]");
const contact=root.querySelector("[data-plan-contact]");
const phoneLink=root.querySelector("[data-plan-call]");
const emailLink=root.querySelector("[data-plan-email]");
const emailHint=root.querySelector("[data-plan-email-hint]");
const detailsLink=root.querySelector("[data-plan-service-link]");
if(!kinds.length||!stageSelect||!checklist||!progress||!contact)return;
const DATA={
 szkody:{
  title:"Szkody górnicze",intro:"Nawet drobne pęknięcia mogą wymagać udokumentowania, ale sama lokalizacja nieruchomości i rodzaj rysy nie przesądzają o przyczynie szkody.",
  phone:"796 441 345",tel:"+48796441345",
  steps:[
   "Wykonaj zdjęcia uszkodzeń z bliska i z szerszej perspektywy; zachowaj oryginały.",
   "Zapisz miejscowość, miejsce występowania uszkodzeń oraz przybliżoną datę ich zauważenia.",
   "Zbierz wcześniejsze zgłoszenia, odpowiedzi kopalni, dokumenty napraw i wykonane pomiary, jeśli je posiadasz.",
   "Przed ugodą, naprawą albo kolejnym zgłoszeniem ustal, jak zachować dowody i jakie dalsze kroki są możliwe."
  ],
  stages:{
   uszkodzenia:["Zauważyłem/am uszkodzenia","Na razie zanotuj daty, wykonaj fotografie i porównaj zmiany z wcześniejszym stanem, jeśli masz takie zdjęcia."],
   zgloszona:["Szkoda jest już zgłoszona","Zachowaj kopię zgłoszenia, datę złożenia i odpowiedzi przedsiębiorcy. Sprawdź, czy dokumentują cały zakres problemu."],
   ugoda:["Otrzymałem/am propozycję ugody","Przed podpisaniem oceń, jakie szkody obejmuje ugoda, czy określa wszystkie koszty i jakie może mieć skutki dla dalszych roszczeń."],
   odmowa:["Kopalnia odmówiła","Zachowaj odmowę z uzasadnieniem oraz dokumentację zdjęciową. Rozważ indywidualną analizę przyczyn odmowy i dostępnych dowodów."]
  },
  links:"/v2/uslugi/szkody-gornicze.html"
 },
 swiadczenie:{
  title:"Świadczenie wspierające",intro:"WZON ustala poziom potrzeby wsparcia, a ZUS rozstrzyga o przyznaniu świadczenia. O wyniku decydują ustawowe warunki, nie sama diagnoza.",
  phone:"500 171 531",tel:"+48500171531",
  steps:[
   "Ustal, czy posiadasz wymagane orzeczenie oraz czy złożono wniosek o ustalenie poziomu potrzeby wsparcia do WZON.",
   "Zachowaj potwierdzenia złożenia wniosków i wszystkie pisma; zanotuj datę doręczenia decyzji.",
   "Sprawdź ostateczność decyzji WZON i pouczenie o ewentualnym ponownym rozpatrzeniu sprawy.",
   "Po ostatecznej decyzji WZON sprawdź warunki i termin elektronicznego wniosku do ZUS, w szczególności znaczenie 3 miesięcy dla wyrównania."
  ],
  stages:{
   wniosek:["Dopiero planuję wniosek","Przygotuj podstawowe informacje o codziennym funkcjonowaniu i sprawdź, jakie orzeczenie jest potrzebne przed postępowaniem WZON."],
   oczekiwanie:["Czekam na decyzję WZON","Zachowaj potwierdzenie wniosku i korespondencję. Nie wpisuj diagnoz ani dokumentacji medycznej na tej stronie."],
   decyzja:["Mam decyzję WZON","Sprawdź liczbę punktów, treść pouczenia, datę doręczenia i czy decyzja jest już ostateczna."],
   zus:["Mam sprawę w ZUS","Zachowaj datę złożenia wniosku elektronicznego i sprawdź korespondencję w eZUS/PUE."],
   odwolanie:["Rozważam odwołanie","Sprawdź pouczenie i datę doręczenia. Tryb i termin wniosku o ponowne rozpatrzenie sprawy trzeba ocenić na podstawie konkretnej decyzji."]
  },
  links:"/v2/uslugi/swiadczenie-wspierajace.html"
 },
 renty:{
  title:"Renta powypadkowa",intro:"Możliwość dochodzenia renty lub jej zmiany zależy od okoliczności wypadku, odpowiedzialności właściwego podmiotu i udokumentowanych skutków.",
  phone:"500 171 531",tel:"+48500171531",
  steps:[
   "Zachowaj podstawowe dokumenty dotyczące wypadku i dotychczasowej sprawy.",
   "Zbierz informacje o utracie zarobków, zwiększonych potrzebach i dotychczasowych wypłatach.",
   "Sprawdź, kiedy i na jakiej podstawie określono aktualną wysokość renty.",
   "Przygotuj pytania do indywidualnej analizy możliwości jej ustalenia lub zmiany."
  ],
  links:"/v2/uslugi/renty-powypadkowe.html"
 },
 skd:{
  title:"Kredyt konsumencki PLN / SKD",intro:"Możliwość zastosowania sankcji kredytu darmowego zależy od rodzaju umowy, jej treści, kosztów i ustawowych terminów.",
  phone:"796 441 345",tel:"+48796441345",
  steps:[
   "Zachowaj umowę kredytową oraz wszystkie aneksy i załączniki.",
   "Zbierz harmonogram, zestawienie spłat oraz informacje o prowizjach i opłatach.",
   "Sprawdź daty zawarcia umowy, spłaty i korespondencji z kredytodawcą.",
   "Przekaż dokumenty do indywidualnej weryfikacji — sam kredyt w PLN nie oznacza automatycznej podstawy SKD."
  ],
  links:"/v2/uslugi/kredyty-pln.html"
 },

 franki:{
  title:"Kredyty frankowe CHF",intro:"Aktywna lub spłacona umowa kredytu powiązana z CHF wymaga indywidualnego sprawdzenia dokumentów, rozliczeń i ewentualnych wcześniejszych ugód. Nie każdy kredyt daje podstawy do roszczenia.",
  phone:"796 441 345",tel:"+48796441345",
  steps:[
   "Zachowaj umowę kredytu CHF wraz z regulaminem, załącznikami i wszystkimi aneksami.",
   "Zapisz nazwę banku, rok zawarcia umowy oraz czy kredyt jest nadal spłacany, czy już spłacony.",
   "Zbierz posiadane harmonogramy, historię spłat i korespondencję z bankiem, w tym propozycje ugód.",
   "Jeżeli otrzymano propozycję ugody lub trwa postępowanie, zanotuj daty i ustal znaczenie dokumentów oraz terminów przed podjęciem decyzji."
  ],
  stages:{
   aktywny:["Nadal spłacam kredyt","Przygotuj aktualne saldo, ostatni harmonogram rat i podstawowe informacje o dotychczasowej spłacie."],
   splacony:["Kredyt został spłacony","Zachowaj potwierdzenie całkowitej spłaty i historię rozliczeń; sama spłata nie zastępuje analizy roszczeń i terminów."],
   ugoda:["Bank proponuje ugodę","Zachowaj pełną propozycję ugody i nie pomijaj postanowień o zrzeczeniu się roszczeń; przeanalizuj możliwe skutki przed podpisaniem."],
   postepowanie:["Sprawa jest już prowadzona","Zbierz informacje o stanie sprawy, dotychczasowych pismach, pełnomocniku oraz ewentualnych terminach; nie udostępniaj dokumentacji w tym narzędziu."]
  },
  links:"/v2/uslugi/kredyty-frankowe.html"
 },
 przesyl:{
  title:"Służebność przesyłu",intro:"Urządzenia na działce nie oznaczają automatycznie prawa do wynagrodzenia. Trzeba sprawdzić stan prawny i historię korzystania z nieruchomości.",
  phone:"796 441 345",tel:"+48796441345",
  steps:[
   "Zidentyfikuj urządzenia przesyłowe i zanotuj numer działki oraz miejscowość.",
   "Zrób zdjęcia pokazujące urządzenia i ich przebieg przez nieruchomość.",
   "Sprawdź księgę wieczystą i zachowaj posiadane umowy lub pisma przedsiębiorstwa.",
   "Ustal, kto i od kiedy korzysta z gruntu oraz czy istnieje tytuł prawny do urządzeń."
  ],
  links:"/v2/uslugi/sluzebnosc-przesylu.html"
 }
};
const allowedSources=new Set(["facebook","instagram","tiktok","google","chatgpt.com","perplexity.ai","claude.ai","gemini.google.com","copilot.microsoft.com","grok.com","ulotka","plakat","qr","polecenie","organiczne","strona","inne","broszura"]);
const incoming=new URLSearchParams(window.location.search);
 const inferredAIReferrer=(()=>{
  try {
    const host=new URL(document.referrer).hostname.toLowerCase();
    // Exact hostname matching: never infer visits from lookalikes or arbitrary URLs.
    const trusted={
      "chatgpt.com":"chatgpt.com","www.chatgpt.com":"chatgpt.com","chat.openai.com":"chatgpt.com",
      "perplexity.ai":"perplexity.ai","www.perplexity.ai":"perplexity.ai",
      "claude.ai":"claude.ai","www.claude.ai":"claude.ai",
      "gemini.google.com":"gemini.google.com",
      "copilot.microsoft.com":"copilot.microsoft.com",
      "grok.com":"grok.com","www.grok.com":"grok.com"
    };
    return Object.prototype.hasOwnProperty.call(trusted,host)?trusted[host]:"";
  } catch { return ""; }
 })();
const sanitize=value=>/^[a-z0-9_-]{1,40}$/.test(value);
const source=(incoming.get("utm_source")||"").toLowerCase().trim();
const attribution={utm_source:allowedSources.has(source)?source:(!source&&inferredAIReferrer?inferredAIReferrer:"strona"),utm_medium:"narzedzie",utm_campaign:"plan_pierwszych_krokow"};
for(const field of ["utm_medium","utm_campaign","utm_content"]){
 const val=(incoming.get(field)||"").toLowerCase().trim();
 if(sanitize(val))attribution[field]=val;
}
let key="",stage="";
const resetShare=()=>{
 if(shareStatus)shareStatus.textContent="";
 if(shareFallback)shareFallback.hidden=true;
 if(shareText)shareText.value="";
};
const getPlanText=()=>{
 const data=DATA[key];
 if(!data)return "";
 const current=data.stages?.[stage];
 const steps=current?[current[1],...data.steps]:data.steps;
 const checked=[...checklist.querySelectorAll('input[type="checkbox"]')];
 const lines=steps.map((step,i)=>(checked[i]?.checked?"[x] ":"[ ] ")+(i+1)+". "+step);
 const url=new URL(data.links.replace(/^\/v2\//,"/").replace(/\.html$/,""),window.location.origin);
 return ["Twoja Sprawa — plan pierwszych kroków","Temat: "+data.title,
  ...(current?["Etap: "+current[0]]:[]),"",...lines,"",
  "Więcej: "+url.href,"Kontakt: "+data.phone,
  "Materiał informacyjny. Każda sprawa wymaga indywidualnej analizy."].join("\n");
};
const sharePlan=async()=>{
 if(!key||!shareButton||shareButton.disabled)return;
 const data=DATA[key],content=getPlanText();
 if(!content)return;
 resetShare();
 const url=new URL(data.links.replace(/^\/v2\//,"/").replace(/\.html$/,""),window.location.origin);
 try{
  if(typeof window.navigator?.share==="function"){
   await window.navigator.share({title:"Plan pierwszych kroków — "+data.title,text:content,url:url.href});
   if(shareStatus)shareStatus.textContent="Uruchomiono udostępnianie planu.";
   return;
  }
  if(typeof window.navigator?.clipboard?.writeText==="function"){
   await window.navigator.clipboard.writeText(content);
   if(shareStatus)shareStatus.textContent="Lista skopiowana. Możesz wkleić ją do wiadomości.";
   return;
  }
 }catch(error){
  if(error?.name==="AbortError"){
   if(shareStatus)shareStatus.textContent="Anulowano udostępnianie.";
   return;
  }
 }
 if(shareFallback&&shareText){
  shareText.value=content;
  shareFallback.hidden=false;
  shareText.focus();
  shareText.select();
  if(shareStatus)shareStatus.textContent="Automatyczne kopiowanie niedostępne. Skopiuj zaznaczony tekst ręcznie.";
 }else if(shareStatus)shareStatus.textContent="Nie udało się skopiować. Możesz wydrukować listę.";
};

const resetProgress=()=>{
 const checks=[...checklist.querySelectorAll('input[type="checkbox"]')];
 const completed=checks.filter(input=>input.checked).length;
 progress.textContent=completed+" z "+checks.length;
 checklist.classList.toggle("plan-complete",checks.length>0&&completed===checks.length);
};
const makeLink=(type,selectedStage)=>{
 const url=new URL("/v2/kontakt.html",window.location.origin);
 url.searchParams.set("usluga",type);
 if(selectedStage)url.searchParams.set("etap",selectedStage);
 url.searchParams.set("lead_path","plan");
 for(const [field,value] of Object.entries(attribution))url.searchParams.set(field,value);
 url.hash="formularz";
 return url.pathname+url.search+url.hash;
};
const render=()=>{
 const data=DATA[key];
 kinds.forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.planService===key)));
 if(!data){
  title.textContent="Wybierz temat po lewej stronie";
  intro.textContent="Przygotujemy praktyczną listę pierwszych kroków do rozmowy. Nie oceniamy tutaj uprawnienia do świadczenia ani podstaw roszczenia.";
  const empty=document.createElement("li");empty.className="plan-placeholder";empty.textContent="Po wybraniu tematu pojawi się tutaj lista czynności.";
  checklist.replaceChildren(empty);stageContainer.hidden=true;
  progress.textContent="0 z 0";printButton.disabled=true;resetButton.disabled=true;
  if(shareButton)shareButton.disabled=true;resetShare();
  contact.href="/v2/kontakt.html";contact.textContent="Przejdź do formularza →";if(phoneLink)phoneLink.hidden=true;if(detailsLink)detailsLink.hidden=true;if(emailLink)emailLink.hidden=true;if(emailHint)emailHint.hidden=true;return;
 }
 title.textContent=data.title;
 intro.textContent=data.intro;
 const selected=data.stages?.[stage];
 const steps=selected?[selected[1],...data.steps]:data.steps;
 checklist.replaceChildren();
 for(const [index,description] of steps.entries()){
  const item=document.createElement("li");
  const label=document.createElement("label");
  const checkbox=document.createElement("input");
  checkbox.type="checkbox";checkbox.dataset.planCheck=String(index);
  checkbox.addEventListener("change",resetProgress);
  const text=document.createElement("span");text.textContent=description;
  label.append(checkbox,text);item.append(label);checklist.append(item);
 }
 resetProgress();printButton.disabled=false;resetButton.disabled=false;
 if(shareButton)shareButton.disabled=false;resetShare();
 contact.href=makeLink(key,stage);
 contact.textContent=key==="skd"?"Zostaw numer telefonu →":"Przejdź do formularza →";
 if(emailLink){
  emailLink.hidden=key!=="skd";
  if(key==="skd"){
   emailLink.href="mailto:wojciech.obieglo@votum-ds.pl?subject="+encodeURIComponent("Umowa kredytowa do analizy SKD")+
    "&body="+encodeURIComponent("Dzień dobry,\nProszę o wstępną analizę umowy kredytowej pod kątem SKD.\nMój numer telefonu: [wpisz numer]\n\n[Dołącz umowę kredytową jako załącznik]\n\nPozdrawiam");
  }
 }
 if(emailHint)emailHint.hidden=key!=="skd";
 if(detailsLink){detailsLink.href=data.links;detailsLink.hidden=false;}
 if(phoneLink){phoneLink.hidden=false;phoneLink.href="tel:"+data.tel;phoneLink.textContent="Zadzwoń: "+data.phone;}
 stageContainer.hidden=!data.stages;
};
const choose=(value,initialStage="")=>{
 if(!Object.hasOwn(DATA,value))return;
 key=value;stage="";
 stageSelect.replaceChildren();
 const prompt=document.createElement("option");prompt.value="";prompt.textContent="Wybierz etap (opcjonalnie)";stageSelect.append(prompt);
 const stages=DATA[key].stages||{};
 for(const [code,value] of Object.entries(stages)){
  const option=document.createElement("option");option.value=code;option.textContent=value[0];stageSelect.append(option);
 }
 if(Object.hasOwn(stages,initialStage)){stage=initialStage;stageSelect.value=stage;}
 render();
};
for(const button of kinds)button.addEventListener("click",()=>choose(button.dataset.planService));
stageSelect.addEventListener("change",()=>{
 const next=stageSelect.value;
 stage=Object.hasOwn(DATA[key]?.stages||{},next)?next:"";
 render();
});
printButton.addEventListener("click",()=>window.print());
shareButton?.addEventListener("click",sharePlan);
resetButton.addEventListener("click",()=>{
 key="";stage="";stageSelect.value="";render();
 kinds[0]?.focus();
});
const initial=(incoming.get("usluga")||"").toLowerCase().trim();
const initialStage=(incoming.get("etap")||"").toLowerCase().trim();
if(Object.hasOwn(DATA,initial))choose(initial,initialStage);else render();
})();
