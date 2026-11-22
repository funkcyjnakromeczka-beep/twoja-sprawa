/* Formularz kontaktowy: Web3Forms; mailto jako wariant awaryjny. */
(() => {
 "use strict";

 // Narrow data-minimization guard: only 11-digit values with a valid PESEL
 // checksum and an actual date. This is not a full sensitive-data detector.
 const peselWeights=[1,3,7,9,1,3,7,9,1,3];
 const isLikelyPesel=digits=>{
  if(!/^\d{11}$/.test(digits))return false;
  const sum=peselWeights.reduce((total,weight,index)=>total+weight*Number(digits[index]),0);
  if((10-sum%10)%10!==Number(digits[10]))return false;
  const monthEncoded=Number(digits.slice(2,4)), day=Number(digits.slice(4,6));
  let century=0, month=0;
  for(const [offset,base] of [[0,1900],[20,2000],[40,2100],[60,2200],[80,1800]]){
   if(monthEncoded>offset&&monthEncoded<=offset+12){century=base;month=monthEncoded-offset;break;}
  }
  if(!century||day<1||day>31)return false;
  const year=century+Number(digits.slice(0,2));
  const date=new Date(Date.UTC(year,month-1,day));
  return date.getUTCFullYear()===year&&date.getUTCMonth()===month-1&&date.getUTCDate()===day;
 };
 const peselPattern=/(?<!\d)\d{11}(?!\d)/g;
 const hasPesel=text=>[...String(text||"").matchAll(peselPattern)].some(match=>isLikelyPesel(match[0]));
 // Anonymous lead reference; UTC date and 48 random bits.
 const makeLeadRef=()=>{
  const date=new Date().toISOString().slice(0,10).replaceAll("-","");
  const bytes=new Uint8Array(6);
  if(globalThis.crypto?.getRandomValues)globalThis.crypto.getRandomValues(bytes);
  else for(let i=0;i<bytes.length;i++)bytes[i]=Math.floor(Math.random()*256);
  return "TS-"+date+"-"+Array.from(bytes,v=>v.toString(16).padStart(2,"0")).join("").toUpperCase();
 };
 const services = ["Szkody górnicze","Świadczenie wspierające","Kredyt w PLN / SKD","Renty powypadkowe","Kredyty frankowe CHF","Służebność przesyłu","Wypadek komunikacyjny","Wypadek przy pracy","Wypadek w rolnictwie","Szkoda na nieruchomości","Odszkodowanie za hałas","Pomoc w sprawie karnej","Nieudany urlop","Inna sprawa"];
 const current = document.currentScript?.getAttribute("data-service") || "";
 const localCity = document.currentScript?.getAttribute("data-locality") || "";
 const suggestedCity = ["Lubin","Polkowice"].includes(localCity) ? localCity : "";
 const hosts = document.querySelectorAll("[data-contact-form]");
 const accessKey="80a28b90-b5ac-406e-8512-3d3c1615b73c"; // Publiczny identyfikator formularza Web3Forms, nie hasło.
 const automatic=/^[a-f0-9-]{30,40}$/i.test(accessKey);
 const campaignParams=new URLSearchParams(window.location.search);
 const inferredAIReferrer=(()=>{
  try {
    const host=new URL(document.referrer).hostname.toLowerCase();
    // Exact hostname matching: never infer visits from lookalikes or arbitrary URLs.
    const trusted={
      // Google references are a generic source, not proof of Search vs Maps or paid vs organic.
      "google.com":"google","www.google.com":"google","google.pl":"google","www.google.pl":"google","maps.google.com":"google","maps.google.pl":"google",
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
 const sourceAllowed=new Set(["facebook","instagram","tiktok","google","chatgpt.com","perplexity.ai","claude.ai","gemini.google.com","copilot.microsoft.com","grok.com","ulotka","plakat","qr","polecenie","organiczne","strona","inne","broszura"]);
 const campaignSource=(campaignParams.get("utm_source")||"").toLowerCase().trim();
 const source=sourceAllowed.has(campaignSource)?campaignSource:(!campaignSource&&inferredAIReferrer?inferredAIReferrer:"nieoznaczone");
 const campaign=(campaignParams.get("utm_campaign")||"").toLowerCase().trim();
 const safeCampaign=/^[a-z0-9_-]{1,40}$/.test(campaign)?campaign:"";
 const medium=(campaignParams.get("utm_medium")||"").toLowerCase().trim();
 const safeMedium=/^[a-z0-9_-]{1,40}$/.test(medium)?medium:"";
 const creative=(campaignParams.get("utm_content")||"").toLowerCase().trim();
 const safeCreative=/^[a-z0-9_-]{1,40}$/.test(creative)?creative:"";

 for (const host of hosts) {
  const compactHome=document.body.classList.contains("premium-v2");
  const form = document.createElement("form"); form.className = "contact-form";
  const heading = document.createElement("h3"); heading.textContent = automatic?"Zostaw kontakt — oddzwonimy lub odpiszemy":"Przygotuj zapytanie"; form.append(heading);
  const benefits=document.createElement("div");benefits.className="contact-benefits";const benefitNodes=[];for(const item of ["Bez zobowiązania do zawarcia umowy","Bez wysyłania dokumentów na początek","Kontakt w wybranej formie"]){const el=document.createElement("span");el.textContent="✓ "+item;benefitNodes.push(el);benefits.append(el);}form.append(benefits);if(compactHome)benefits.hidden=true;
  const note = document.createElement("p"); note.textContent = automatic ? (compactHome?"Na początek wystarczą dane kontaktowe. Nie wpisuj PESEL ani szczegółowych danych medycznych.":"Wyślij zgłoszenie bezpośrednio z tej strony. Nie podawaj PESEL, informacji medycznych ani danych dokumentów.") : "Formularz przygotuje wiadomość w Twojej aplikacji e-mail. Aby zgłoszenie dotarło, musisz ją następnie wysłać. Nie wpisuj danych wrażliwych."; form.append(note);
  // Native browser validation still controls submission. A concise message
  // also makes failures discoverable to screen readers on small devices.
  const validationNotice=document.createElement("p");
  validationNotice.className="contact-validation-notice";
  validationNotice.setAttribute("role","alert");
  validationNotice.hidden=true;
  form.append(validationNotice);
  function field(labelText,type,required,limit,auto) {
   const id = "cf-"+(auto||type)+"-"+Math.random().toString(36).slice(2,8);
   const label=document.createElement("label"); label.htmlFor=id;label.textContent=labelText;
   const input=document.createElement("input"); input.id=id;input.type=type;input.required=required;input.maxLength=limit;if(auto)input.autocomplete=auto;
   form.append(label,input);return input;
  }
  const label=document.createElement("label");label.textContent="Wybór usługi";const select=document.createElement("select");select.required=true;select.id="cf-service-"+Math.random().toString(36).slice(2,8);label.htmlFor=select.id;const empty=document.createElement("option");empty.value="";empty.textContent="Wybierz usługę";select.append(empty);
  const serviceAlias={"szkody":"Szkody górnicze","swiadczenie":"Świadczenie wspierające","renty":"Renty powypadkowe","skd":"Kredyt w PLN / SKD","franki":"Kredyty frankowe CHF","przesyl":"Służebność przesyłu"};
  const serviceFromLink=serviceAlias[(campaignParams.get("usluga")||"").toLowerCase()]||"";
  for(const name of services){const option=document.createElement("option");option.value=name;option.textContent=name==="Kredyt w PLN / SKD"?"Sankcja Kredytu Darmowego (SKD) — kredyt PLN":name;if(name===(current||serviceFromLink))option.selected=true;select.append(option);}
  form.append(label,select);
  // The full service forms offer helpful preparation guidance first, but a
  // visitor should be able to skip optional guides and leave contact promptly.
  // No fields, disclosures, validation or consent are bypassed.
  let jumpToContact=null;
  if(!compactHome){
   jumpToContact=document.createElement("a");
   jumpToContact.className="contact-fast-track";
   jumpToContact.textContent="Przejdź do danych kontaktowych";
   form.append(jumpToContact);
  }
  const people=document.createElement("p");people.className="contact-people";if(compactHome)people.hidden=true;form.append(people);
  const updatePeople=()=>{
   people.replaceChildren();
   if(!select.value){people.textContent="Wybierz usługę, aby zobaczyć właściwy numer telefonu.";return;}
   const paulina=["Świadczenie wspierające","Renty powypadkowe"].includes(select.value);
   people.textContent="Telefon w tej sprawie: ";
   const link=document.createElement("a");
   link.href=paulina?"tel:+48500171531":"tel:+48796441345";
   link.textContent=paulina?"Paulina Chandrała — 500 171 531":"Wojciech Obiegło — 796 441 345";
   people.append(link);
  };
  select.addEventListener("change",updatePeople);updatePeople();
  const advisor=document.createElement("div");advisor.className="contact-advisor";advisor.setAttribute("aria-live","polite");form.append(advisor);
  const updateAdvisor=()=>{
   advisor.replaceChildren();
   benefitNodes[1].textContent=select.value==="Kredyt w PLN / SKD"
    ?"✓ Możesz przesłać pełną umowę e-mailem":"✓ Bez wysyłania dokumentów na początek";
   if(!select.value){advisor.hidden=true;return;}
   advisor.hidden=false;
   const paulina=["Świadczenie wspierające","Renty powypadkowe"].includes(select.value);
   const isSKD=select.value==="Kredyt w PLN / SKD";
   const advisorEmail=paulina?"paulina.chandrala@votum-ds.pl":"wojciech.obieglo@votum-ds.pl";
   const title=document.createElement("strong");
   title.textContent=paulina?"Twoja osoba do kontaktu: Paulina Chandrała":"Twoja osoba do kontaktu: Wojciech Obiegło";
   const info=document.createElement("span");
   info.textContent=paulina?"Świadczenia i renty":isSKD?"Wstępna analiza umowy kredytowej — SKD":"Szkody górnicze i pozostałe sprawy";
   const call=document.createElement("a");
   call.href=paulina?"tel:+48500171531":"tel:+48796441345";
   call.textContent=paulina?"Zadzwoń: 500 171 531":"Zadzwoń: 796 441 345";
   const directMail=document.createElement("a");
   directMail.className="contact-advisor-direct-email";
   directMail.href="mailto:"+advisorEmail+"?subject="+encodeURIComponent(isSKD?"Umowa kredytowa do analizy SKD":"Zapytanie Twoja Sprawa: "+select.value)
    +(isSKD?"&body="+encodeURIComponent("Dzień dobry,\nProszę o wstępną analizę pełnej umowy kredytu w PLN pod kątem SKD.\nMój numer telefonu: [wpisz numer]\nUmowę dołączę jako załącznik."):"");
   directMail.textContent=paulina?"Napisz bezpośrednio do Pauliny":isSKD?"Wyślij umowę bezpośrednio do Wojciecha":"Napisz bezpośrednio do Wojciecha";
   if(isSKD){
    // Wpisany numer wstawiamy do kopii roboczej dopiero po kliknięciu przez klienta.
    // Nie przenosimy numeru do adresu URL strony ani do śledzenia.
    directMail.addEventListener("click",()=>{
     const entered=phone.value.trim();
     const callbackNumber=entered&&validPhoneNumber(entered)?entered:"[wpisz numer]";
     directMail.href="mailto:"+advisorEmail+"?subject="+encodeURIComponent("Umowa kredytowa do analizy SKD")+
      "&body="+encodeURIComponent("Dzień dobry,\nProszę o wstępną analizę pełnej umowy kredytu w PLN pod kątem SKD.\nMój numer telefonu: "+callbackNumber+"\nUmowę dołączę jako załącznik.");
    });
   }
   advisor.append(title,info,call,directMail);
   // Direct-copy option for visitors whose device has no default mail application.
   // Only public adviser addresses are copied; no visitor input is stored or tracked.
   const emailCopy=document.createElement("div");
   emailCopy.className="contact-advisor-copy";
   const emailAddress=document.createElement("span");
   emailAddress.className="contact-advisor-copy-address";
   emailAddress.textContent=advisorEmail;
   emailCopy.append(emailAddress);
   if(navigator.clipboard?.writeText){
    const copyButton=document.createElement("button");
    copyButton.type="button";
    copyButton.className="contact-advisor-copy-button";
    copyButton.textContent="Skopiuj e-mail";
    const copyFeedback=document.createElement("small");
    copyFeedback.className="contact-advisor-copy-status";
    copyFeedback.setAttribute("role","status");
    copyFeedback.setAttribute("aria-live","polite");
    copyButton.addEventListener("click",async()=>{
     try{
      await navigator.clipboard.writeText(advisorEmail);
      copyFeedback.textContent="Skopiowano adres e-mail. Możesz wkleić go w swojej poczcie.";
     }catch{
      copyFeedback.textContent="Kopiowanie jest niedostępne. Zaznacz adres e-mail widoczny obok przycisku.";
     }
    });
    emailCopy.append(copyButton,copyFeedback);
   }
   advisor.append(emailCopy);
   if(isSKD){
    const tip=document.createElement("span");
    tip.textContent="Do analizy dołącz pełną umowę kredytową do wiadomości e-mail i podaj numer telefonu. Formularz na stronie nie przesyła załączników.";
    advisor.append(tip);
   }
   const routingNote=document.createElement("small");
   routingNote.className="contact-routing-note";
   routingNote.textContent="Wiadomość z formularza trafia do skrzynki obsługiwanej przez Web3Forms — wybór doradcy nie powoduje automatycznego wysłania wiadomości bezpośrednio na jego adres. Aby napisać wprost do tej osoby, użyj odnośnika „Napisz…” lub skopiuj adres e-mail powyżej.";
   advisor.append(routingNote);
  };
  select.addEventListener("change",updateAdvisor);updateAdvisor();
  const guideBox=document.createElement("div");guideBox.className="contact-guide-box";guideBox.setAttribute("aria-live","polite");
  const guideTitle=document.createElement("strong");guideTitle.textContent="Przygotuj się do rozmowy";
  const guideText=document.createElement("span");
  const guideLink=document.createElement("a");guideLink.textContent="Otwórz listę kontrolną (nowa karta)";guideLink.target="_blank";guideLink.rel="noopener noreferrer";
  const guidePlanLink=document.createElement("a");guidePlanLink.className="contact-guide-plan-link";
  guidePlanLink.textContent="Ułóż plan pierwszych kroków (nowa karta)";
  guidePlanLink.target="_blank";guidePlanLink.rel="noopener noreferrer";
  guidePlanLink.hidden=true;
  guideBox.append(guideTitle,guideText,guideLink,guidePlanLink);form.append(guideBox);
  const guidePaths={
   "Szkody górnicze":["/v2/poradniki/checklista-szkody-gorniczej.html","Zdjęcia uszkodzeń i wcześniejsza korespondencja mogą ułatwić rozmowę."],
   "Świadczenie wspierające":["/v2/poradniki/swiadczenie-wspierajace-pierwsze-kroki.html","Przygotuj etap sprawy WZON lub ZUS oraz daty otrzymanych pism."],
   "Renty powypadkowe":["/v2/poradniki/renta-powypadkowa-dokumenty.html","Sprawdź, jakie informacje o wypadku i jego skutkach warto zebrać."],
   "Kredyt w PLN / SKD":["/v2/poradniki/skd-kredyt-pln-lista-kontrolna.html","Wyślij pełną umowę kredytową bez zasłaniania danych na wojciech.obieglo@votum-ds.pl i podaj numer telefonu. Nie dołączaj dokumentów do formularza internetowego."],
   "Kredyty frankowe CHF":["/v2/poradniki/frankowicze-lista-kontrolna.html","Przygotuj umowę CHF, aneksy i historię spłat, ale nie wysyłaj ich przez formularz."],
   "Służebność przesyłu":["/v2/poradniki/sluzebnosc-przesylu-dzialka.html","Zbierz podstawowe informacje o działce i urządzeniach przesyłowych."]
  };
  const updateGuide=()=>{const item=guidePaths[select.value];guideBox.hidden=!item;if(!item)return;guideLink.href=item[0];guideText.textContent=item[1];};
  select.addEventListener("change",updateGuide);updateGuide();
  const stageWrap=document.createElement("div");stageWrap.className="contact-stage";const stageLabel=document.createElement("label");const stage=document.createElement("select");stage.id="cf-stage-"+Math.random().toString(36).slice(2,8);stageLabel.htmlFor=stage.id;stageWrap.append(stageLabel,stage);form.append(stageWrap);
  const stageOptions={
   "Szkody górnicze":["Wybierz etap sprawy","Zauważyłem/am uszkodzenia","Pojawiły się szkody mimo wcześniejszych zabezpieczeń lub napraw","Zgłosiłem/am szkodę do kopalni","Otrzymałem/am propozycję ugody","Kopalnia odmówiła","Inna sytuacja"],
   "Świadczenie wspierające":["Wybierz etap sprawy","Dopiero planuję wniosek do WZON","Czekam na decyzję WZON","Mam decyzję WZON","Chcę przeanalizować decyzję lub odwołanie","Mam sprawę w ZUS","Inna sytuacja"],
   "Kredyt w PLN / SKD":["Wybierz etap sprawy","Nadal spłacam kredyt konsumencki w PLN","Kredyt konsumencki został już spłacony","Spłaciłem/am kredyt przed terminem","Kredytodawca odmówił uznania SKD","Inna sytuacja"],
    "Kredyty frankowe CHF":["Wybierz etap sprawy","Nadal spłacam kredyt CHF","Kredyt CHF został spłacony","Bank proponuje ugodę dotyczącą kredytu CHF","Sprawa kredytu CHF jest już prowadzona","Inna sytuacja"],
   "Służebność przesyłu":["Wybierz etap sprawy","Mam urządzenia przesyłowe na działce","Chcę sprawdzić dokumenty lub tytuł prawny operatora","Operator przedstawił propozycję umowy","Operator odmówił lub kwestionuje moje roszczenia","Inna sytuacja"],
   "Renty powypadkowe":["Wybierz etap sprawy","Nie otrzymuję jeszcze renty","Mam rentę i chcę sprawdzić jej podwyższenie","Ubezpieczyciel odmówił ustalenia lub zmiany renty","Otrzymałem/am propozycję ugody lub kapitalizacji","Inna sytuacja"]
  };
  // Etap pochodzi tylko ze ścisłej listy kodów, bez przyjmowania dowolnego tekstu z URL.
  const stageCodes={
    "Szkody górnicze":{
      uszkodzenia:"Zauważyłem/am uszkodzenia",
      zabezpieczenia:"Pojawiły się szkody mimo wcześniejszych zabezpieczeń lub napraw",
      zgloszona:"Zgłosiłem/am szkodę do kopalni",
      ugoda:"Otrzymałem/am propozycję ugody",
      odmowa:"Kopalnia odmówiła"
    },
    "Świadczenie wspierające":{
      wniosek:"Dopiero planuję wniosek do WZON",
      oczekiwanie:"Czekam na decyzję WZON",
      decyzja:"Mam decyzję WZON",
      zus:"Mam sprawę w ZUS",
      odwolanie:"Chcę przeanalizować decyzję lub odwołanie"
    },
    "Renty powypadkowe":{
      nowa:"Nie otrzymuję jeszcze renty",
      podwyzszenie:"Mam rentę i chcę sprawdzić jej podwyższenie",
      odmowa:"Ubezpieczyciel odmówił ustalenia lub zmiany renty",
      ugoda:"Otrzymałem/am propozycję ugody lub kapitalizacji"
    },
    "Kredyt w PLN / SKD":{
      splata:"Nadal spłacam kredyt konsumencki w PLN",
      splacony:"Kredyt konsumencki został już spłacony",
      wczesniejsza:"Spłaciłem/am kredyt przed terminem",
      odmowa:"Kredytodawca odmówił uznania SKD"
    },
    "Służebność przesyłu":{"urzadzenia":"Mam urządzenia przesyłowe na działce","dokumenty":"Chcę sprawdzić dokumenty lub tytuł prawny operatora","propozycja":"Operator przedstawił propozycję umowy","odmowa":"Operator odmówił lub kwestionuje moje roszczenia"},
    "Kredyty frankowe CHF":{
      aktywny:"Nadal spłacam kredyt CHF",
      splacony:"Kredyt CHF został spłacony",
      ugoda:"Bank proponuje ugodę dotyczącą kredytu CHF",
      postepowanie:"Sprawa kredytu CHF jest już prowadzona"
    }
  };
  const requestedStage=(campaignParams.get("etap")||"").toLowerCase().trim();
  let stagePrefillPending=true;
  const updateStage=()=>{
    const options=stageOptions[select.value];
    stage.replaceChildren();stageWrap.hidden=!options;
    if(!options){stagePrefillPending=false;return;}
    stageLabel.textContent=select.value==="Szkody górnicze"?"Na jakim etapie jest sprawa szkody?":select.value==="Świadczenie wspierające"?"Na jakim etapie jest sprawa świadczenia?":select.value==="Renty powypadkowe"?"Na jakim etapie jest sprawa renty?":select.value==="Kredyt w PLN / SKD"?"Na jakim etapie jest sprawa kredytu PLN?":select.value==="Służebność przesyłu"?"Na jakim etapie jest sprawa działki i urządzeń przesyłowych?":"Na jakim etapie jest sprawa kredytu CHF?";
    for(let i=0;i<options.length;i++){
      const option=document.createElement("option");option.value=i===0?"":options[i];option.textContent=options[i];stage.append(option);
    }
    const prefill=stagePrefillPending?stageCodes[select.value]?.[requestedStage]:"";
    if(prefill&&options.includes(prefill))stage.value=prefill;
    stagePrefillPending=false;
    stage.required=false;
  };
  select.addEventListener("change",updateStage);updateStage();
  // Dodatkowa droga do planu, zachowująca tylko sprawdzoną usługę i kod etapu.
  // Nie przenosi danych wpisanych w formularzu (imię, telefon, e-mail, wiadomość).
  const guidePlanServices={
   "Szkody górnicze":"szkody",
   "Świadczenie wspierające":"swiadczenie",
   "Kredyt w PLN / SKD":"skd",
   "Renty powypadkowe":"renty",
   "Kredyty frankowe CHF":"franki",
   "Służebność przesyłu":"przesyl"
  };
  const updateGuidePlan=()=>{
   const service=guidePlanServices[select.value];
   guidePlanLink.hidden=!service;
   if(!service){guidePlanLink.href="/v2/plan-dzialania.html";return;}
   const params=new URLSearchParams();
   params.set("usluga",service);
   // Dobieramy kod na podstawie jawnej, lokalnej listy etapów.
   const code=Object.entries(stageCodes[select.value]||{}).find(([,label])=>label===stage.value)?.[0];
   if(code)params.set("etap",code);
   guidePlanLink.href="/v2/plan-dzialania.html?"+params.toString();
  };
  select.addEventListener("change",updateGuidePlan);
  stage.addEventListener("change",updateGuidePlan);
  updateGuidePlan();
  // Szybkie, opcjonalne rozpoznanie rodzaju uszkodzeń bez podawania danych wrażliwych.
  // Są to obserwacje klienta, a nie potwierdzenie górniczej przyczyny szkody.
  const damageWrap=document.createElement("div");damageWrap.className="contact-damage-area";
  const damageLabel=document.createElement("label");damageLabel.textContent="Co zostało uszkodzone? (opcjonalnie)";
  const damageArea=document.createElement("select");damageArea.id="cf-damage-"+Math.random().toString(36).slice(2,8);damageLabel.htmlFor=damageArea.id;
  for(const [value,title] of [
    ["","Wybierz obszar uszkodzeń"],
    ["Ściany i elewacja","Ściany, sufity lub elewacja — pęknięcia i rysy"],
    ["Podłogi i wnętrza","Podłogi, płytki, posadzki lub inne wnętrza"],
    ["Kostka i ogrodzenie","Kostka brukowa, podjazd, chodnik lub ogrodzenie"],
    ["Drzwi i okna","Drzwi lub okna, które się zacinają"],
    ["Kilka miejsc lub inne","Kilka miejsc lub inny rodzaj uszkodzeń"]
  ]){const option=document.createElement("option");option.value=value;option.textContent=title;damageArea.append(option);}
  const damageHint=document.createElement("small");damageHint.className="contact-field-hint";
  damageHint.textContent="Sam wygląd uszkodzenia nie przesądza o jego przyczynie. Na początek nie przesyłaj zdjęć ani dokumentów.";
  damageWrap.append(damageLabel,damageArea,damageHint);form.append(damageWrap);
  const updateDamageArea=()=>{damageWrap.hidden=select.value!=="Szkody górnicze";if(damageWrap.hidden)damageArea.value="";};
  select.addEventListener("change",updateDamageArea);updateDamageArea();
  // Only two enumerated property conditions may be preselected from a link.
  // Never use arbitrary text from the URL as a value or as user-provided evidence.
  const requestedDamage=(campaignParams.get("uszkodzenie")||"").toLowerCase().trim();
  const damageFromLink={sciany:"Ściany i elewacja",kostka:"Kostka i ogrodzenie"};
  if(select.value==="Szkody górnicze"&&Object.prototype.hasOwnProperty.call(damageFromLink,requestedDamage)){
   damageArea.value=damageFromLink[requestedDamage];
  }
  const requestedLeadPath=(campaignParams.get("lead_path")||"").toLowerCase().trim();   const leadPath=["chatbot","navigator","plan","broszura"].includes(requestedLeadPath)?requestedLeadPath:"formularz";
  // Dyskretny komunikat dla osób, które wybrały konkretną sytuację w przewodniku.
  const contextNotice=document.createElement("div");contextNotice.className="contact-context-notice";
  const contextLabel=document.createElement("strong");contextLabel.textContent=leadPath==="plan"?"Twój wybór w planie przygotowań":"Twój wybór w przewodniku";
  const contextValue=document.createElement("span");
  const contextChange=document.createElement("button");contextChange.type="button";contextChange.textContent="Zmień etap";
  contextNotice.append(contextLabel,contextValue,contextChange);
  form.append(contextNotice);
  const updateContextNotice=()=>{
    contextNotice.hidden=!((leadPath==="chatbot"||leadPath==="navigator"||leadPath==="plan")&&stage.value&&!stageWrap.hidden);
    contextValue.textContent=stage.value;
  };
  stage.addEventListener("change",updateContextNotice);
  select.addEventListener("change",updateContextNotice);
  contextChange.addEventListener("click",()=>{
    const disclosure=stage.closest("details");if(disclosure)disclosure.open=true;
    stage.focus();stage.scrollIntoView({block:"nearest",behavior:"auto"});
  });
  updateContextNotice();
  const name=field("Imię","text",true,80,"given-name");name.enterKeyHint="next";
  if(jumpToContact){
   jumpToContact.href="#"+name.id;
   jumpToContact.addEventListener("click",event=>{
    event.preventDefault();
    name.focus();
    name.scrollIntoView?.({block:"nearest",behavior:"auto"});
   });
  }
  const checkName=()=>{const valid=Boolean(name.value.trim());name.setCustomValidity(valid?"":"Wpisz imię, abyśmy mogli się do Ciebie zwrócić.");return valid;};
  name.addEventListener("input",()=>{if(name.value.trim())name.setCustomValidity("");});
  const city=field("Miejscowość (opcjonalnie)","text",false,100,"address-level2");city.enterKeyHint="next";
  // Podstrona lokalna sugeruje miasto, ale mieszkaniec może je dowolnie zmienić.
  if(select.value==="Szkody górnicze" && suggestedCity){city.value=suggestedCity;city.defaultValue=suggestedCity;}
  // Szybkie podanie miasta tylko dla szkód górniczych; inne miejscowości pozostają w zwykłym polu.
  const cityQuick=document.createElement("div");cityQuick.className="contact-city-quick";
  cityQuick.setAttribute("role","group");cityQuick.setAttribute("aria-label","Szybki wybór miejscowości dla szkód górniczych");
  const cityQuickTitle=document.createElement("strong");cityQuickTitle.textContent="Miejscowość — wybierz jednym kliknięciem:";
  const cityOptions=document.createElement("div");cityOptions.className="contact-city-options";
  const cityButtons=[];
  const syncCityQuick=()=>{
   cityQuick.hidden=select.value!=="Szkody górnicze";
   for(const button of cityButtons){
    const selected=!cityQuick.hidden&&city.value.trim().toLocaleLowerCase("pl-PL")===button.textContent.toLocaleLowerCase("pl-PL");
    button.setAttribute("aria-pressed",String(selected));
   }
  };
  for(const place of ["Lubin","Polkowice"]){
   const button=document.createElement("button");button.type="button";button.className="contact-city-choice";
   button.textContent=place;button.setAttribute("aria-pressed","false");
   button.addEventListener("click",()=>{city.value=place;syncCityQuick();});
   cityOptions.append(button);cityButtons.push(button);
  }
  const cityOther=document.createElement("button");cityOther.type="button";cityOther.className="contact-city-other";
  cityOther.textContent="Inna miejscowość — wpisz samodzielnie";
  cityOther.addEventListener("click",()=>{
   // On the homepage city is kept inside optional case details; reveal it without wiping other fields.
   const details=city.closest?.("details.contact-case-details");if(details)details.open=true;
   city.focus();city.scrollIntoView?.({block:"nearest",behavior:"auto"});
  });
  const cityHint=document.createElement("small");cityHint.textContent="Wpisz dowolną miejscowość w okolicy. Lokalizacja nie przesądza o przyczynie uszkodzeń.";
  cityQuick.append(cityQuickTitle,cityOptions,cityOther,cityHint);form.append(cityQuick);
  city.addEventListener("input",syncCityQuick);select.addEventListener("change",syncCityQuick);syncCityQuick();
  const phone=field("Telefon kontaktowy","tel",false,30,"tel");phone.title="Podaj numer telefonu zawierający od 7 do 15 cyfr";phone.inputMode="tel";phone.enterKeyHint="next";
  const email=field("Adres e-mail (opcjonalnie, jeśli podasz telefon)","email",false,150,"email");email.inputMode="email";email.enterKeyHint="next";
  const phoneFieldLabel=form.querySelector('label[for="'+phone.id+'"]');
  const emailFieldLabel=form.querySelector('label[for="'+email.id+'"]');
  const phoneHint=document.createElement("small");phoneHint.className="contact-field-hint";phoneHint.textContent="Wystarczy telefon lub e-mail. Numer telefonu powinien zawierać 7–15 cyfr (spacje i myślniki są dozwolone). Nie wpisuj numeru PESEL ani danych dokumentów.";phoneHint.id="cf-phone-help-"+Math.random().toString(36).slice(2,8);phone.setAttribute("aria-describedby",phoneHint.id);phone.insertAdjacentElement("afterend",phoneHint);
  const methodLabel=document.createElement("label");methodLabel.textContent="Preferowany sposób kontaktu";const method=document.createElement("select");method.id="cf-method-"+Math.random().toString(36).slice(2,8);methodLabel.htmlFor=method.id;for(const [value,title] of [["Dowolny","Telefon lub e-mail"],["Telefon","Telefon"],["E-mail","E-mail"]]){const option=document.createElement("option");option.value=value;option.textContent=title;method.append(option);}form.append(methodLabel,method);
  // Nie pozwalaj, by sam znak +, myślniki albo krótki ciąg znaków zastępowały numer.
  // Obsługujemy również numery zagraniczne, bez zakładania polskiego prefiksu.
  const validPhoneNumber=value=>{
    const raw=value.trim();
    const digits=raw.replace(/\D/g,"");
    // Reject misplaced plus signs and unmatched parentheses. HTML's pattern
    // uses modern Unicode-v rules; rely on this explicit checked validator.
    if(!/^(?:\+?\d|\(\+?\d)[0-9()\s-]*$/.test(raw))return false;
    let opened=false;
    for(const c of raw){
      if(c==="("){if(opened)return false;opened=true;}
      if(c===")"){if(!opened)return false;opened=false;}
    }
    return !opened&&digits.length>=7&&digits.length<=15;
  };
  const syncContactPreference=()=>{
    const prefer=method.value;
    const hasPhone=Boolean(phone.value.trim());
    const hasEmail=Boolean(email.value.trim());
    const isSKD=select.value==="Kredyt w PLN / SKD";
    // SKD requires a callback number; all other services still accept email-only enquiries.
    phone.required=isSKD||prefer==="Telefon"||(prefer==="Dowolny"&&!hasEmail);
    email.required=prefer==="E-mail"||(!isSKD&&prefer==="Dowolny"&&!hasPhone);
    // Wskazówki przy samych polach odpowiadają wybranej usłudze i preferencji.
    // SKD zawsze wymaga numeru telefonu, natomiast przy innych sprawach wystarczy jeden kontakt.
    phoneFieldLabel.textContent=isSKD||prefer==="Telefon"?"Telefon kontaktowy (wymagany)":hasEmail?"Telefon kontaktowy (opcjonalnie)":"Telefon kontaktowy (lub e-mail)";
    emailFieldLabel.textContent=prefer==="E-mail"?"Adres e-mail (wymagany)":isSKD||hasPhone?"Adres e-mail (opcjonalnie)":"Adres e-mail (lub telefon)";
    phoneHint.textContent=isSKD
     ?"W sprawie SKD pozostaw numer telefonu do kontaktu (7–15 cyfr). Adres e-mail możesz dodać opcjonalnie. Nie wpisuj numeru PESEL ani danych dokumentów."
     :"Wystarczy telefon lub e-mail. Numer telefonu powinien zawierać 7–15 cyfr (spacje i myślniki są dozwolone). Nie wpisuj numeru PESEL ani danych dokumentów.";
    const invalidPhone=hasPhone&&!validPhoneNumber(phone.value);
    const missingBoth=!hasPhone&&!hasEmail;
    phone.setCustomValidity(invalidPhone?"Numer telefonu musi zawierać od 7 do 15 cyfr. Usuń błędne znaki.":isSKD&&!hasPhone?"W sprawie SKD podaj numer telefonu do kontaktu.":missingBoth&&prefer!=="E-mail"?"Podaj telefon lub adres e-mail.":"");
    email.setCustomValidity(missingBoth&&prefer==="E-mail"?"Podaj adres e-mail.":"");
    phone.setAttribute("aria-required",String(phone.required));
    email.setAttribute("aria-required",String(email.required));
  };
  const checkContact=()=>{
    syncContactPreference();
    const phonePresent=Boolean(phone.value.trim()), emailPresent=Boolean(email.value.trim());
    let focus=null;
    if(phonePresent&&!validPhoneNumber(phone.value))focus=phone;
    else if((method.value==="Telefon"||select.value==="Kredyt w PLN / SKD")&&!phonePresent)focus=phone;
    else if(method.value==="E-mail"&&!emailPresent)focus=email;
    else if(!phonePresent&&!emailPresent)focus=method.value==="E-mail"?email:phone;
    if(focus){focus.focus();focus.reportValidity();return false;}
    return true;
  };
  method.addEventListener("change",syncContactPreference);select.addEventListener("change",syncContactPreference);phone.addEventListener("input",syncContactPreference);email.addEventListener("input",syncContactPreference);syncContactPreference();
  const callbackLabel=document.createElement("label");callbackLabel.textContent="Dogodna pora kontaktu (opcjonalnie)";const callback=document.createElement("select");callback.id="cf-time-"+Math.random().toString(36).slice(2,8);callbackLabel.htmlFor=callback.id;for(const value of ["Bez preferencji","Przed południem","Po południu","Wieczorem"]){const option=document.createElement("option");option.value=value;option.textContent=value;callback.append(option);}form.append(callbackLabel,callback);
  const callbackHint=document.createElement("small");callbackHint.className="contact-field-hint";callbackHint.textContent="To jedynie preferencja; nie jest rezerwacją terminu rozmowy.";form.append(callbackHint);
  const optionalDetails=document.createElement("details");optionalDetails.className="contact-optional-details";const optionalSummary=document.createElement("summary");optionalSummary.textContent="Dodatkowe preferencje kontaktu (opcjonalnie)";optionalDetails.append(optionalSummary,callbackLabel,callback,callbackHint);form.append(optionalDetails);
  // Dobrowolna deklaracja źródła bez zastępowania istniejących UTM i bez cookies.
  const discoveryDetails=document.createElement("details");
  discoveryDetails.className="contact-optional-details contact-source-details";
  const discoverySummary=document.createElement("summary");
  discoverySummary.textContent="Skąd dowiedziałeś się o nas? (opcjonalnie)";
  const discoveryLabel=document.createElement("label");
  discoveryLabel.textContent="Źródło wskazane przez Ciebie";
  const discoveryChoice=document.createElement("select");
  discoveryChoice.id="cf-discovery-"+Math.random().toString(36).slice(2,8);
  discoveryLabel.htmlFor=discoveryChoice.id;
  for(const [value,title] of [
    ["","Nie podaję"],["Facebook","Facebook"],["Instagram","Instagram"],
    ["TikTok","TikTok"],["Wyszukiwarka Google","Wyszukiwarka Google"],
    ["Mapy Google","Mapy Google"],["Polecenie","Polecenie znajomej osoby"],
    ["Ulotka lub plakat","Ulotka lub plakat"],
    ["Asystent AI","ChatGPT lub inny asystent AI"],
    ["Inne","Inne źródło"],["Nie pamiętam","Nie pamiętam"]
  ]){
    const option=document.createElement("option");option.value=value;option.textContent=title;
    discoveryChoice.append(option);
  }
  const discoveryAllowed=new Set(["Facebook","Instagram","TikTok","Wyszukiwarka Google","Mapy Google","Polecenie","Ulotka lub plakat","Asystent AI","Inne","Nie pamiętam"]);
  const reportedSource=()=>discoveryAllowed.has(discoveryChoice.value)?discoveryChoice.value:"nie podano";
  const discoveryHint=document.createElement("small");
  discoveryHint.className="contact-field-hint";
  discoveryHint.textContent="Dobrowolna informacja o źródle kontaktu. Oznaczenia kampanii z linku są zapisywane oddzielnie i nie zastępują Twojej odpowiedzi. Nie podawaj tu danych osobowych.";
  discoveryDetails.append(discoverySummary,discoveryLabel,discoveryChoice,discoveryHint);
  form.append(discoveryDetails);
  const msgLabel=document.createElement("label");msgLabel.textContent="Treść wiadomości (opcjonalnie)";const msg=document.createElement("textarea");msg.id="cf-message-"+Math.random().toString(36).slice(2,8);msgLabel.htmlFor=msg.id;msg.rows=4;msg.maxLength=1200;msg.enterKeyHint="done";msg.placeholder="Opisz sprawę ogólnie, bez numeru PESEL, informacji medycznych i danych dokumentów.";form.append(msgLabel,msg);
  // On the homepage show the minimum fields first. Optional case information stays accessible.
  if(compactHome){
    const extra=document.createElement("details");extra.className="contact-case-details";
    const summary=document.createElement("summary");summary.textContent="Dodaj opis i szczegóły sprawy (opcjonalnie)";
    extra.append(summary,guideBox,stageWrap,damageWrap,city.previousElementSibling,city,methodLabel,method,optionalDetails,msgLabel,msg);
    if(stage.value && requestedStage)extra.open=true;
    form.append(extra);
  }
  // Edytowalny szkic, bez wysyłania i bez nadpisywania treści użytkownika.
  if(!compactHome){
    const tools=document.createElement("div");tools.className="contact-example-tools";
    const example=document.createElement("button");example.type="button";example.className="contact-message-example";
    example.textContent="Wstaw przykładowy opis sprawy";
    // Własne wykończenie przycisku bez powiększania współdzielonego styles.css.
    example.style.cssText="background:#eef5f5;color:#15394c;border:1px solid #799ca8;border-radius:10px;cursor:pointer";
    const feedback=document.createElement("p");feedback.className="contact-example-feedback";
    feedback.setAttribute("aria-live","polite");
    feedback.style.cssText="margin:0 0 8px;color:#294957;font-size:.89rem";
    const samples={
      "Szkody górnicze":"Proszę o kontakt w sprawie możliwych uszkodzeń nieruchomości. Chcę omówić, jakie zdjęcia i informacje przygotować do wstępnej analizy.",
      "Świadczenie wspierające":"Proszę o kontakt w sprawie świadczenia wspierającego. Chcę ustalić kolejne kroki dotyczące WZON lub wniosku do ZUS.",
      "Kredyt w PLN / SKD":"Proszę o kontakt w sprawie analizy umowy kredytu konsumenckiego w PLN pod kątem sankcji kredytu darmowego. Mogę przesłać umowę na wskazany adres e-mail.",
      "Renty powypadkowe":"Proszę o kontakt w sprawie renty powypadkowej. Chcę dowiedzieć się, jakie dokumenty przygotować do oceny jej wysokości lub możliwości podwyższenia.",
      "Kredyty frankowe CHF":"Proszę o kontakt w sprawie analizy umowy kredytu frankowego CHF i możliwych dalszych kroków. Chcę ustalić, jakie dokumenty będą potrzebne.",
      "Służebność przesyłu":"Proszę o kontakt w sprawie urządzeń przesyłowych na działce. Chcę ustalić, jakie dokumenty są potrzebne do indywidualnej analizy sytuacji nieruchomości."
    };
    example.addEventListener("click",()=>{
      if(msg.value.trim()){
        feedback.textContent="Zachowano Twój opis — nie nadpisuję wpisanej wiadomości.";
        msg.focus();return;
      }
      if(!select.value){
        feedback.textContent="Najpierw wybierz rodzaj sprawy.";
        select.focus();return;
      }
      let proposed=samples[select.value]||"Proszę o kontakt w celu omówienia mojej sprawy i dalszych kroków.";
      if(select.value==="Szkody górnicze"&&["Lubin","Polkowice"].includes(localCity))
        proposed="Dotyczy nieruchomości w miejscowości "+localCity+". "+proposed;
      msg.value=proposed;
      msg.dispatchEvent?.(new Event("input",{bubbles:true}));
      feedback.textContent="Wstawiono szkic. Dostosuj opis do swojej sytuacji przed wysłaniem.";
      msg.focus();
    });
    tools.append(example,feedback);form.append(tools);
  }
  const ackLabel=document.createElement("label");ackLabel.className="check";const ack=document.createElement("input");ack.type="checkbox";ack.required=true;ackLabel.append(ack,document.createTextNode(automatic ? " Zapoznałem/am się z informacjami o prywatności i proszę o kontakt w sprawie mojego zgłoszenia." : " Rozumiem, że wiadomość nie zostanie wysłana automatycznie. Zapoznałem/am się z informacjami o prywatności."));form.append(ackLabel);
  const privacy=document.createElement("a");privacy.href="/v2/polityka-prywatnosci.html";privacy.target="_blank";privacy.rel="noopener noreferrer";privacy.textContent="Informacje o prywatności (nowa karta)";form.append(privacy);
  // Optional messages are not necessary to make initial contact. A visitor
  // may accidentally paste a PESEL despite the explanatory warning.
  // No input is logged, stored, submitted or sent for this local check.
  const sensitiveWarning=document.createElement("p");
  sensitiveWarning.className="contact-sensitive-warning";
  sensitiveWarning.id="cf-sensitive-warning-"+Math.random().toString(36).slice(2,8);
  sensitiveWarning.setAttribute("role","alert");
  sensitiveWarning.hidden=true;
  const sensitiveRemove=document.createElement("button");
  sensitiveRemove.type="button";
  sensitiveRemove.className="contact-sensitive-remove";
  sensitiveRemove.textContent="Usuń numer PESEL z opisu";
  sensitiveRemove.hidden=true;
  form.append(sensitiveWarning,sensitiveRemove);
  const updateSensitiveWarning=()=>{
   const inCity=hasPesel(city.value),inMessage=hasPesel(msg.value);
   const detected=inCity||inMessage;
   sensitiveWarning.hidden=!detected;
   sensitiveRemove.hidden=!inMessage;
   sensitiveWarning.textContent=detected
    ?(inCity
      ?"W polu miejscowości wykryto numer wyglądający jak poprawny PESEL. Usuń go przed wysłaniem zgłoszenia."
      :"W opisie wykryto numer wyglądający jak poprawny PESEL. Usuń go przed wysłaniem. Wystarczy ogólny opis sprawy.")
    :"";
   return detected;
  };
  city.addEventListener("input",updateSensitiveWarning);
  msg.addEventListener("input",updateSensitiveWarning);
  sensitiveRemove.addEventListener("click",()=>{
   msg.value=msg.value.replace(peselPattern,candidate=>isLikelyPesel(candidate)?"[numer usunięty]":candidate);
   updateSensitiveWarning();
   const details=msg.closest?.("details");
   if(details)details.open=true;
   msg.focus();
  });
  const checkSensitiveWarning=()=>{
   if(!updateSensitiveWarning())return true;
   const target=hasPesel(city.value)?city:msg;
   if(target===msg){
    const disclosure=msg.closest?.("details");
    if(disclosure)disclosure.open=true;
   }
   target.focus();
   return false;
  };
  msg.setAttribute("aria-describedby",sensitiveWarning.id);
  city.setAttribute("aria-describedby",sensitiveWarning.id);
  const button=document.createElement("button");button.className="btn";button.type="submit";button.textContent=automatic?"Wyślij zgłoszenie":"Przygotuj wiadomość e-mail";form.append(button);
  const status=document.createElement("p");status.setAttribute("role","status");status.setAttribute("aria-live","polite");form.append(status);
  // After a confirmed Web3Forms acknowledgement, show only the anonymous
  // reference code. No name, phone, email, case details or UTM in clipboard.
  const refPanel=document.createElement("div");refPanel.className="contact-ref-panel";refPanel.hidden=true;
  const refLabel=document.createElement("strong");refLabel.textContent="Kod zgłoszenia";
  const refValue=document.createElement("span");refValue.className="contact-ref-code";
  const refButton=document.createElement("button");refButton.type="button";refButton.className="contact-ref-copy";refButton.textContent="Skopiuj kod";
  const refFeedback=document.createElement("small");refFeedback.className="contact-ref-feedback";
  refFeedback.setAttribute("role","status");refFeedback.setAttribute("aria-live","polite");
  refPanel.append(refLabel,refValue,refButton,refFeedback);form.append(refPanel);
  let confirmedRef="";
  refButton.hidden=!navigator.clipboard?.writeText;
  refButton.addEventListener("click",async()=>{
    if(!confirmedRef||!/^TS-\d{8}-[A-F0-9]{12}$/.test(confirmedRef))return;
    if(!navigator.clipboard?.writeText){
      refFeedback.textContent="Zaznacz kod widoczny powyżej i skopiuj ręcznie.";
      return;
    }
    try{
      await navigator.clipboard.writeText(confirmedRef);
      refFeedback.textContent="Skopiowano wyłącznie kod zgłoszenia.";
    }catch{
      refFeedback.textContent="Kopiowanie niedostępne. Zaznacz kod widoczny powyżej.";
    }
  });
  const clearRefPanel=()=>{confirmedRef="";refPanel.hidden=true;refValue.textContent="";refFeedback.textContent="";};

  // Alternatywny kontakt dostępny bez wysyłania formularza i niezależny od Web3Forms.
  let refreshDirectContact=()=>{}; // Synchronizacja przycisków również po resecie formularza.
  // Na stronie głównej już istnieje osobny panel telefonów i e-maili.
  if(!compactHome){
   const direct=document.createElement("details");direct.className="contact-direct-alternatives";
   const directSummary=document.createElement("summary");directSummary.textContent="Wolisz telefon lub e-mail zamiast formularza?";
   const directActions=document.createElement("div");directActions.className="contact-direct-actions";
   const directCall=document.createElement("a");directCall.className="contact-direct-call";
   const directEmail=document.createElement("a");directEmail.className="contact-direct-email";
   directActions.append(directCall,directEmail);direct.append(directSummary,directActions);form.append(direct);
   const updateDirect=()=>{
    const paulina=["Świadczenie wspierające","Renty powypadkowe"].includes(select.value);
    const person=paulina?"Pauliny":"Wojciecha";
    directCall.href=paulina?"tel:+48500171531":"tel:+48796441345";
    directCall.textContent="Zadzwoń: "+(paulina?"500 171 531":"796 441 345");
    directCall.setAttribute("aria-label","Zadzwoń do "+person+": "+(paulina?"500 171 531":"796 441 345"));
    directEmail.href="mailto:"+(paulina?"paulina.chandrala@votum-ds.pl":"wojciech.obieglo@votum-ds.pl")+"?subject="+encodeURIComponent("Zapytanie Twoja Sprawa: "+(select.value||"Wstępna rozmowa"));
    directEmail.textContent="Napisz do "+person+" e-mail";
   };
   select.addEventListener("change",updateDirect);refreshDirectContact=updateDirect;updateDirect();
  }
  const honeypot=document.createElement("input");honeypot.type="text";honeypot.name="botcheck";honeypot.tabIndex=-1;honeypot.autocomplete="off";honeypot.setAttribute("aria-hidden","true");honeypot.style.cssText="position:absolute;left:-10000px;width:1px;height:1px;opacity:0";form.append(honeypot);
  let refreshShortcutState=()=>{}; // Reconcile homepage selection after form reset.
  let sending=false; // Chroni przed podwójnym wysłaniem, także przez klawisz Enter.
  let pendingRef=""; // Stable for retries after unconfirmed attempts.
  // Keep the visible fallback telephone and email in sync if a client
  // changes the selected service after an unsuccessful Web3Forms attempt.
  let synchronizeFailureLinks=()=>{};
  select.addEventListener("change",()=>synchronizeFailureLinks());
  // Browser-generated invalid events fire even when the native constraint
  // validation prevents 'submit'. Do not log or echo any entered values.
  const explainInvalid=field=>{
   if(field===select)return "Wybierz rodzaj sprawy.";
   if(field===name)return "Wpisz imię.";
   if(field===phone)return "Sprawdź telefon: 7–15 cyfr. W sprawach SKD numer jest wymagany.";
   if(field===email)return "Sprawdź poprawność adresu e-mail lub wybierz kontakt telefoniczny.";
   return "Sprawdź zaznaczone pole i popraw wskazaną informację.";
  };
  let highlightedInvalidField=null;
  form.addEventListener("invalid",event=>{
   const field=event.target;
   if(!field||field===honeypot)return;
   // Preserve the first native validation error; other fields can be edited
   // without losing the instruction for the field that still needs attention.
   if(!validationNotice.hidden)return;
   if(highlightedInvalidField&&highlightedInvalidField!==field)
    highlightedInvalidField.setAttribute?.("aria-invalid","false");
   highlightedInvalidField=field;
   // No client-entered content appears in the error message.
   validationNotice.textContent="Popraw formularz przed wysłaniem. "+explainInvalid(field);
   validationNotice.hidden=false;
   field.setAttribute?.("aria-invalid","true");
  },true);
  const dismissInvalid=event=>{
   const field=event.target;
   // Editing an unrelated field must not hide the first unresolved error.
   if(!field||field!==highlightedInvalidField)return;
   field.setAttribute?.("aria-invalid","false");
   highlightedInvalidField=null;
   validationNotice.hidden=true;
   validationNotice.textContent="";
  };
  form.addEventListener("input",dismissInvalid);
  form.addEventListener("change",dismissInvalid);
  form.addEventListener("submit",async event=>{
   event.preventDefault();if(sending)return;
   if(!checkName()){name.focus();name.reportValidity();return;}
   if(!checkContact())return;
   if(!checkSensitiveWarning())return;
   if(!form.reportValidity())return;
   const advisorIsPaulina=["Świadczenie wspierające","Renty powypadkowe"].includes(select.value);
   const advisorName=advisorIsPaulina?"Paulina Chandrała":"Wojciech Obiegło";
   const mailRecipient=advisorIsPaulina?"paulina.chandrala@votum-ds.pl":"wojciech.obieglo@votum-ds.pl";
   if(automatic){
    if(honeypot.value){status.textContent="Nie udało się zweryfikować formularza.";return;}
    const ref=pendingRef||(pendingRef=makeLeadRef());
    sending=true;button.disabled=true;button.textContent="Wysyłanie…";status.className="";status.textContent="Przesyłam zgłoszenie…";clearRefPanel();synchronizeFailureLinks=()=>{};
    // Web3Forms kieruje wiadomosc do odbiorcy przypisanego do access_key.
    // advisor_email jest metadana w tresci zgłoszenia, nie zmienia odbiorcy.
    const payload={access_key:accessKey,reference_code:ref,subject:"Nowe zgłoszenie Twoja Sprawa ["+ref+"] — "+(advisorIsPaulina?"Paulina":"Wojciech")+" — "+select.value,from_name:"Formularz Twoja Sprawa",advisor:advisorName,advisor_email:mailRecipient,name:name.value.trim(),...(email.value.trim()?{email:email.value.trim()}:{}),phone:phone.value.trim(),location:city.value.trim(),service:select.value,contact_preference:method.value,preferred_time:callback.value,case_stage:stageWrap.hidden?"nie dotyczy":stage.value||"nie podano",...(select.value==="Szkody górnicze"&&damageArea.value?{damage_area:damageArea.value}:{}),campaign_source:source,reported_source:reportedSource(),campaign_medium:safeMedium||(!campaignSource&&inferredAIReferrer?"referral":"brak"),campaign_name:safeCampaign||"brak",campaign_variant:safeCreative||"brak",lead_path:leadPath,message:msg.value.trim()||"Prośba o kontakt.",...(email.value.trim()?{replyto:email.value.trim()}:{}),botcheck:""};
    try{const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),12000);let response;try{response=await fetch("https://api.web3forms.com/submit",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify(payload),signal:controller.signal});}finally{window.clearTimeout(timeout);}const result=await response.json();if(!response.ok||result.success!==true)throw Error("delivery");synchronizeFailureLinks=()=>{};confirmedRef=ref;refValue.textContent=ref;refPanel.hidden=false;status.className="contact-status-success";status.textContent="Operator formularza potwierdził przyjęcie zgłoszenia. Zgłoszenie zawiera informację o wybranej osobie do kontaktu, ale to nie oznacza automatycznego doręczenia wiadomości bezpośrednio do doradcy ani potwierdzenia dostarczenia e-maila. Kod zgłoszenia: "+ref+". Zachowaj kod, aby móc odszukać wiadomość. W pilnej sprawie skorzystaj z telefonu lub bezpośredniej wiadomości e-mail.";pendingRef="";form.reset();updateAdvisor();updatePeople();refreshDirectContact();updateGuide();updateStage();updateDamageArea();updateContextNotice();syncContactPreference();syncCityQuick();updateSensitiveWarning();name.setCustomValidity("");refreshShortcutState();}catch{
     status.className="contact-status-error";
     status.replaceChildren();
     const errorText=document.createElement("span");
     errorText.textContent=navigator.onLine===false
      ?"Brak połączenia z internetem — zgłoszenie nie zostało potwierdzone. Dane pozostają w formularzu. Możesz przygotować wiadomość do wysłania po przywróceniu łączności lub skontaktować się telefonicznie: "
      :"Nie otrzymaliśmy potwierdzenia przyjęcia zgłoszenia. Wiadomość mogła jednak zostać przetworzona. Dane pozostają w formularzu — nie klikaj wielokrotnie „Wyślij”. Aby upewnić się, skontaktuj się telefonicznie lub wyślij e-mail: ";
     const currentRecipient=()=>["Świadczenie wspierające","Renty powypadkowe"].includes(select.value)
      ?"paulina.chandrala@votum-ds.pl":"wojciech.obieglo@votum-ds.pl";
     const errorCall=document.createElement("a");
     const updateErrorCall=()=>{
      const support=currentRecipient().startsWith("paulina.");
      errorCall.href="tel:"+(support?"+48500171531":"+48796441345");
      errorCall.textContent=support?"500 171 531":"796 441 345";
     };
     updateErrorCall();
     const makeDraft=()=>[
      "Dzień dobry,","",
      "Kod próby: "+ref,
      "Usługa: "+select.value,
      "Imię: "+name.value.trim(),
      "Miejscowość: "+city.value.trim(),
      "Telefon: "+phone.value.trim(),
      "E-mail: "+email.value.trim(),
      "Preferowany kontakt: "+method.value,
      "Dogodna pora: "+callback.value,
      "Etap sprawy: "+(stageWrap.hidden?"nie dotyczy":stage.value||"nie podano"),
      ...(select.value==="Szkody górnicze"?["Obszar uszkodzeń: "+(damageArea.value||"nie podano")]:[]),
      "Źródło z linku: "+source,
      "Źródło wskazane przez klienta: "+(reportedSource()),
      "Kanał: "+(safeMedium||"brak"),
      "Kampania: "+(safeCampaign||"brak"),
      "Wariant: "+(safeCreative||"brak"),
      "Sposób przejścia: "+leadPath,"",
      "Opis: "+(msg.value.trim()||"Proszę o kontakt.")
     ].join("\n");
     const refNotice=document.createElement("span");
     refNotice.textContent=" Kod próby: "+ref+" (nie jest potwierdzeniem dostarczenia). ";
     status.append(refNotice,errorText,errorCall);
     const fallback=document.createElement("a");
     fallback.className="contact-fallback-link";
     fallback.textContent="Otwórz gotową wiadomość e-mail";
     // Keep only the recipient and service in the dormant mailto link.
     // Customer details belong in the message draft only after a deliberate
     // click; do not leave a name, phone or case summary in a DOM URL.
     const updateFallback=()=>{
      fallback.href="mailto:"+currentRecipient()
       +"?subject="+encodeURIComponent("Zapytanie Twoja Sprawa ["+ref+"]: "+select.value);
     };
     updateFallback();
     fallback.addEventListener("click",()=>{
      const safeHref=fallback.href;
      fallback.href=safeHref+"&body="+encodeURIComponent(makeDraft());
      // Native mailto navigation reads href after the click event.
      // Restore the privacy-safe address in the next task, never persisting
      // the personal draft in the document or browser history.
      window.setTimeout(updateFallback,0);
     });
     synchronizeFailureLinks=()=>{updateErrorCall();updateFallback();};
     status.append(document.createTextNode(" · "),fallback);
     // The request body is only copied following a deliberate user click.
     // No local storage, automatic background transmission or PII in page URLs.
     if(navigator.clipboard?.writeText){
      const copyDraft=document.createElement("button");
      copyDraft.type="button";
      copyDraft.className="contact-draft-copy";
      copyDraft.textContent="Skopiuj treść zgłoszenia";
      const copyFeedback=document.createElement("small");
      copyFeedback.className="contact-draft-feedback";
      copyDraft.addEventListener("click",async()=>{
       try{
        await navigator.clipboard.writeText(makeDraft());
        copyFeedback.textContent="Skopiowano treść. Wklej ją do własnej wiadomości i wyślij do "+currentRecipient()+". Schowek urządzenia może być dostępny dla innych aplikacji.";
       }catch{
        copyFeedback.textContent="Nie udało się skopiować treści. Skorzystaj z linku e-mail lub telefonu.";
       }
      });
      status.append(copyDraft,copyFeedback);
     }
    }finally{sending=false;button.disabled=false;button.textContent="Wyślij zgłoszenie";}return;
   }
   const subject="Zapytanie Twoja Sprawa: "+select.value;
   const body=["Dzień dobry,","", "Usługa: "+select.value,"Imię: "+name.value.trim(),"Miejscowość: "+city.value.trim(),"Telefon: "+phone.value.trim(),"E-mail: "+email.value.trim(),"Preferowany kontakt: "+method.value,"Dogodna pora: "+callback.value,"Etap sprawy: "+(stageWrap.hidden?"nie dotyczy":stage.value||"nie podano"),...(select.value==="Szkody górnicze"?["Obszar uszkodzeń: "+(damageArea.value||"nie podano")]:[]),"Źródło zgłoszenia z linku: "+source,"Źródło wskazane przez klienta: "+(reportedSource()),"Kanał: "+(safeMedium||"brak"),"Kampania: "+(safeCampaign||"brak"),"Wariant: "+(safeCreative||"brak"),"Sposób przejścia: "+leadPath,"","Opis sprawy:",""+(msg.value.trim()||"Proszę o kontakt."),"","Proszę o odpowiedź na wskazany adres e-mail lub telefon."].join("\n");
   status.textContent="Otwieram aplikację pocztową. Sprawdź przygotowaną wiadomość i wyślij ją samodzielnie.";
   window.location.href="mailto:"+mailRecipient+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);
  });
  // Jedno kliknięcie z karty uszkodzenia ustawia tylko dozwoloną opcję w formularzu.
  // Link #formularz pozostaje natywnym, dostępnym odnośnikiem bez JavaScript.
  for(const trigger of document.querySelectorAll("[data-damage-option]")){
   trigger.addEventListener("click",()=>{
    const choice=trigger.getAttribute("data-damage-option");
    if(![...damageArea.children].some(option=>option.value===choice))return;
    if(select.value!=="Szkody górnicze"){
     select.value="Szkody górnicze";updateAdvisor();updatePeople();refreshDirectContact();updateGuide();updateStage();updateContextNotice();syncContactPreference();
    }
    updateDamageArea();damageArea.value=choice;syncCityQuick();
   });
  }
  // Landing pages use a closed stage-code map: only support or accident-rent cases.
  // URL and link attributes never contain client documents or arbitrary input.
  for(const trigger of document.querySelectorAll("[data-stage-option]")){
   trigger.addEventListener("click",()=>{
    const code=trigger.getAttribute("data-stage-option");
    const requested=trigger.getAttribute("data-stage-service");
    const service=requested==="renty"?"Renty powypadkowe":"Świadczenie wspierające";
    const stages=stageCodes[service];
    const chosen=Object.prototype.hasOwnProperty.call(stages,code)?stages[code]:"";
    if(!chosen)return;
    if(select.value!==service){
     select.value=service;
     updateAdvisor();updatePeople();refreshDirectContact();updateGuide();updateStage();updateDamageArea();syncContactPreference();
    }
    syncCityQuick();
    if(stageWrap.hidden)return;
    stage.value=chosen;
    updateContextNotice();
    updateGuidePlan();
   });
  }
  // Home only: four priority plus two expandable topics select one existing form, without
  // creating duplicate lead forms or collecting data before explicit submission.
  const primaryShortcuts=[...document.querySelectorAll("[data-contact-shortcut]")];
  if(primaryShortcuts.length){
   const shortcutStatus=document.querySelectorAll("[data-contact-shortcut-status]")[0];
   const pickService=code=>["szkody","swiadczenie","skd","renty","franki","przesyl"].includes(code)?serviceAlias[code]:"";
   const syncShortcuts=()=>{
    let active=false;
    for(const link of primaryShortcuts){
     const chosen=pickService(link.getAttribute("data-contact-shortcut"));
     const current=Boolean(chosen&&select.value===chosen);
     link.setAttribute("data-selected",String(current));
     link.setAttribute("aria-current",current?"true":"false");
     if(current)active=true;
    }
    if(shortcutStatus)shortcutStatus.textContent=active?"Wybrano: "+select.value+". Uzupełnij dane w formularzu poniżej.":"";
   };
   select.addEventListener("change",syncShortcuts);
   const activateShortcut=chosen=>{
    if(select.value!==chosen){
     select.value=chosen;
     updateAdvisor();updatePeople();updateGuide();updateStage();updateDamageArea();updateContextNotice();syncContactPreference();syncCityQuick();
     // A shortcut sets select.value programmatically, so native "change"
     // listeners do not run. Keep error recovery links pointed at the
     // newly chosen adviser even after a failed provider submission.
     refreshDirectContact();synchronizeFailureLinks();
    }
    syncShortcuts();
   };
   for(const link of primaryShortcuts){
    const getChosen=()=>pickService(link.getAttribute("data-contact-shortcut"));
    if(!getChosen())continue;
    // Resolve the current validated service on each action. An unknown or
    // changed link must not hijack navigation or retain an outdated selection.
    // Pointer selection safeguards rapid changes during the previous scroll.
    link.addEventListener("pointerdown",event=>{
     const chosen=getChosen();
     if(chosen&&event.isPrimary&&event.pointerType==="mouse"&&event.button===0)activateShortcut(chosen);
    });
    link.addEventListener("pointerup",event=>{
     const chosen=getChosen();
     if(chosen&&event.isPrimary&&(event.pointerType==="touch"||event.pointerType==="pen"))activateShortcut(chosen);
    });
    link.addEventListener("click",event=>{
     const chosen=getChosen();
     if(!chosen)return;
     event.preventDefault();
     activateShortcut(chosen);
     // Topic has already been chosen: jump directly to the first real
     // contact field instead of making visitors tab through the service select.
     host.scrollIntoView?.({behavior:"auto",block:"start"});
     name.scrollIntoView?.({behavior:"auto",block:"nearest"});
     name.focus?.({preventScroll:true});
    });
   }
   refreshShortcutState=syncShortcuts;
   syncShortcuts();
  }
  host.replaceChildren(form);
 }
})();
