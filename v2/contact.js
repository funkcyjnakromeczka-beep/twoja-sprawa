/* Formularz kontaktowy: Web3Forms; mailto jako wariant awaryjny. */
(() => {
 "use strict";
 const services = ["Szkody górnicze","Świadczenie wspierające","Renty powypadkowe","Kredyt w PLN / SKD","Kredyty frankowe CHF","Służebność przesyłu","Wypadek komunikacyjny","Wypadek przy pracy","Wypadek w rolnictwie","Szkoda na nieruchomości","Odszkodowanie za hałas","Pomoc w sprawie karnej","Nieudany urlop","Inna sprawa"];
 const current = document.currentScript?.getAttribute("data-service") || "";
 const hosts = document.querySelectorAll("[data-contact-form]");
 const accessKey="80a28b90-b5ac-406e-8512-3d3c1615b73c"; // Publiczny identyfikator formularza Web3Forms, nie hasło.
 const automatic=/^[a-f0-9-]{30,40}$/i.test(accessKey);
 const campaignParams=new URLSearchParams(window.location.search);
 const sourceAllowed=new Set(["facebook","instagram","tiktok","google","ulotka","plakat","qr","polecenie","organiczne","strona","inne"]);
 const campaignSource=(campaignParams.get("utm_source")||"").toLowerCase().trim();
 const source=sourceAllowed.has(campaignSource)?campaignSource:"nieoznaczone";
 const campaign=(campaignParams.get("utm_campaign")||"").toLowerCase().trim();
 const safeCampaign=/^[a-z0-9_-]{1,40}$/.test(campaign)?campaign:"";
 const medium=(campaignParams.get("utm_medium")||"").toLowerCase().trim();
 const safeMedium=/^[a-z0-9_-]{1,40}$/.test(medium)?medium:"";
 const creative=(campaignParams.get("utm_content")||"").toLowerCase().trim();
 const safeCreative=/^[a-z0-9_-]{1,40}$/.test(creative)?creative:"";

 for (const host of hosts) {
  const form = document.createElement("form"); form.className = "contact-form";
  const heading = document.createElement("h3"); heading.textContent = automatic?"Zostaw kontakt — oddzwonimy lub odpiszemy":"Przygotuj zapytanie"; form.append(heading);
  const benefits=document.createElement("div");benefits.className="contact-benefits";for(const item of ["Bez zobowiązania do zawarcia umowy","Bez wysyłania dokumentów na początek","Kontakt w wybranej formie"]){const el=document.createElement("span");el.textContent="✓ "+item;benefits.append(el);}form.append(benefits);
  const note = document.createElement("p"); note.textContent = automatic ? "Wyślij zgłoszenie bezpośrednio z tej strony. Nie podawaj PESEL, informacji medycznych ani danych dokumentów." : "Formularz przygotuje wiadomość w Twojej aplikacji e-mail. Aby zgłoszenie dotarło, musisz ją następnie wysłać. Nie wpisuj danych wrażliwych."; form.append(note);
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
  const people=document.createElement("p");people.className="contact-people";people.innerHTML='Kontakt telefoniczny: <a href="tel:+48796441345">Wojciech Obiegło — 796 441 345</a> · <a href="tel:+48500171531">Paulina Chandrała — 500 171 531</a>';form.append(people);
  const advisor=document.createElement("div");advisor.className="contact-advisor";advisor.setAttribute("aria-live","polite");form.append(advisor);
  const updateAdvisor=()=>{advisor.replaceChildren();if(!select.value){advisor.hidden=true;return;}advisor.hidden=false;const paulina=["Świadczenie wspierające","Renty powypadkowe"].includes(select.value);const title=document.createElement("strong");title.textContent=paulina?"Twoja osoba do kontaktu: Paulina Chandrała":"Twoja osoba do kontaktu: Wojciech Obiegło";const info=document.createElement("span");info.textContent=paulina?"Świadczenia i renty":select.value==="Kredyt w PLN / SKD"?"Wstępna analiza umowy kredytowej — SKD":"Szkody górnicze i pozostałe sprawy";const call=document.createElement("a");call.href=paulina?"tel:+48500171531":"tel:+48796441345";call.textContent=paulina?"Zadzwoń: 500 171 531":"Zadzwoń: 796 441 345";advisor.append(title,info,call);if(select.value==="Kredyt w PLN / SKD"){const tip=document.createElement("span");tip.textContent="Do analizy wyślij kopię umowy i podaj numer telefonu: ";const emailLink=document.createElement("a");emailLink.href="mailto:wojciech.obieglo@votum-ds.pl?subject=Analiza%20umowy%20SKD";emailLink.textContent="wojciech.obieglo@votum-ds.pl";advisor.append(tip,emailLink);}};select.addEventListener("change",updateAdvisor);updateAdvisor();
  const guideBox=document.createElement("div");guideBox.className="contact-guide-box";guideBox.setAttribute("aria-live","polite");
  const guideTitle=document.createElement("strong");guideTitle.textContent="Przygotuj się do rozmowy";
  const guideText=document.createElement("span");
  const guideLink=document.createElement("a");guideLink.textContent="Otwórz listę kontrolną (nowa karta)";guideLink.target="_blank";guideLink.rel="noopener noreferrer";
  guideBox.append(guideTitle,guideText,guideLink);form.append(guideBox);
  const guidePaths={
   "Szkody górnicze":["/v2/poradniki/checklista-szkody-gorniczej.html","Zdjęcia uszkodzeń i wcześniejsza korespondencja mogą ułatwić rozmowę."],
   "Świadczenie wspierające":["/v2/poradniki/swiadczenie-wspierajace-pierwsze-kroki.html","Przygotuj etap sprawy WZON lub ZUS oraz daty otrzymanych pism."],
   "Renty powypadkowe":["/v2/poradniki/renta-powypadkowa-dokumenty.html","Sprawdź, jakie informacje o wypadku i jego skutkach warto zebrać."],
   "Kredyt w PLN / SKD":["/v2/poradniki/skd-kredyt-pln-lista-kontrolna.html","Wyślij kopię umowy na wojciech.obieglo@votum-ds.pl i podaj numer telefonu. Nie wpisuj w formularzu danych dokumentów."],
   "Kredyty frankowe CHF":["/v2/uslugi/kredyty-frankowe.html","Przygotuj umowę CHF, aneksy i historię spłat, ale nie wysyłaj ich przez formularz."],
   "Służebność przesyłu":["/v2/poradniki/sluzebnosc-przesylu-dzialka.html","Zbierz podstawowe informacje o działce i urządzeniach przesyłowych."]
  };
  const updateGuide=()=>{const item=guidePaths[select.value];guideBox.hidden=!item;if(!item)return;guideLink.href=item[0];guideText.textContent=item[1];};
  select.addEventListener("change",updateGuide);updateGuide();
  const stageWrap=document.createElement("div");stageWrap.className="contact-stage";const stageLabel=document.createElement("label");const stage=document.createElement("select");stage.id="cf-stage-"+Math.random().toString(36).slice(2,8);stageLabel.htmlFor=stage.id;stageWrap.append(stageLabel,stage);form.append(stageWrap);
  const stageOptions={
   "Szkody górnicze":["Wybierz etap sprawy","Zauważyłem/am uszkodzenia","Zgłosiłem/am szkodę do kopalni","Otrzymałem/am propozycję ugody","Kopalnia odmówiła","Inna sytuacja"],
   "Świadczenie wspierające":["Wybierz etap sprawy","Dopiero planuję wniosek do WZON","Czekam na decyzję WZON","Mam decyzję WZON","Chcę przeanalizować decyzję lub odwołanie","Mam sprawę w ZUS","Inna sytuacja"]
  };
  // Etap pochodzi tylko ze ścisłej listy kodów, bez przyjmowania dowolnego tekstu z URL.
  const stageCodes={
    "Szkody górnicze":{
      uszkodzenia:"Zauważyłem/am uszkodzenia",
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
    }
  };
  const requestedStage=(campaignParams.get("etap")||"").toLowerCase().trim();
  let stagePrefillPending=true;
  const updateStage=()=>{
    const options=stageOptions[select.value];
    stage.replaceChildren();stageWrap.hidden=!options;
    if(!options){stagePrefillPending=false;return;}
    stageLabel.textContent=select.value==="Szkody górnicze"?"Na jakim etapie jest sprawa szkody?":"Na jakim etapie jest sprawa świadczenia?";
    for(let i=0;i<options.length;i++){
      const option=document.createElement("option");option.value=i===0?"":options[i];option.textContent=options[i];stage.append(option);
    }
    const prefill=stagePrefillPending?stageCodes[select.value]?.[requestedStage]:"";
    if(prefill&&options.includes(prefill))stage.value=prefill;
    stagePrefillPending=false;
    stage.required=false;
  };
  select.addEventListener("change",updateStage);updateStage();
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
  const requestedLeadPath=(campaignParams.get("lead_path")||"").toLowerCase().trim();   const leadPath=["chatbot","navigator","plan"].includes(requestedLeadPath)?requestedLeadPath:"formularz";
  // Dyskretny komunikat dla osób, które wybrały konkretną sytuację w przewodniku.
  const contextNotice=document.createElement("div");contextNotice.className="contact-context-notice";
  const contextLabel=document.createElement("strong");contextLabel.textContent="Twój wybór w przewodniku";
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
  const name=field("Imię","text",true,80,"given-name");
  const checkName=()=>{const valid=Boolean(name.value.trim());name.setCustomValidity(valid?"":"Wpisz imię, abyśmy mogli się do Ciebie zwrócić.");return valid;};
  name.addEventListener("input",()=>{if(name.value.trim())name.setCustomValidity("");});
  const city=field("Miejscowość (opcjonalnie)","text",false,100,"address-level2");
  const phone=field("Telefon kontaktowy (telefon lub e-mail wystarczy)","tel",false,30,"tel");phone.pattern="[+0-9()\\s-]{7,30}";phone.title="Podaj numer telefonu zawierający od 7 do 15 cyfr";phone.inputMode="tel";
  const email=field("Adres e-mail (opcjonalnie, jeśli podasz telefon)","email",false,150,"email");
  const phoneHint=document.createElement("small");phoneHint.className="contact-field-hint";phoneHint.textContent="Wystarczy telefon lub e-mail. Numer telefonu powinien zawierać 7–15 cyfr (spacje i myślniki są dozwolone). Nie wpisuj numeru PESEL ani danych dokumentów.";phoneHint.id="cf-phone-help-"+Math.random().toString(36).slice(2,8);phone.setAttribute("aria-describedby",phoneHint.id);phone.insertAdjacentElement("afterend",phoneHint);
  const methodLabel=document.createElement("label");methodLabel.textContent="Preferowany sposób kontaktu";const method=document.createElement("select");method.id="cf-method-"+Math.random().toString(36).slice(2,8);methodLabel.htmlFor=method.id;for(const [value,title] of [["Dowolny","Telefon lub e-mail"],["Telefon","Telefon"],["E-mail","E-mail"]]){const option=document.createElement("option");option.value=value;option.textContent=title;method.append(option);}form.append(methodLabel,method);
  // Nie pozwalaj, by sam znak +, myślniki albo krótki ciąg znaków zastępowały numer.
  // Obsługujemy również numery zagraniczne, bez zakładania polskiego prefiksu.
  const validPhoneNumber=value=>{
    const raw=value.trim();
    const digits=raw.replace(/\D/g,"");
    return /^(?:\+|\(\+|[0-9(])[0-9()\s-]*$/.test(raw)&&digits.length>=7&&digits.length<=15;
  };
  const syncContactPreference=()=>{
    const prefer=method.value;
    const hasPhone=Boolean(phone.value.trim());
    const hasEmail=Boolean(email.value.trim());
    phone.required=prefer==="Telefon"||(prefer==="Dowolny"&&!hasEmail);
    email.required=prefer==="E-mail"||(prefer==="Dowolny"&&!hasPhone);
    const invalidPhone=hasPhone&&!validPhoneNumber(phone.value);
    const missingBoth=!hasPhone&&!hasEmail;
    phone.setCustomValidity(invalidPhone?"Numer telefonu musi zawierać od 7 do 15 cyfr. Usuń błędne znaki.":missingBoth&&prefer!=="E-mail"?"Podaj telefon lub adres e-mail.":"");
    email.setCustomValidity(missingBoth&&prefer==="E-mail"?"Podaj adres e-mail.":"");
    phone.setAttribute("aria-required",String(phone.required));
    email.setAttribute("aria-required",String(email.required));
  };
  const checkContact=()=>{
    syncContactPreference();
    const phonePresent=Boolean(phone.value.trim()), emailPresent=Boolean(email.value.trim());
    let focus=null;
    if(phonePresent&&!validPhoneNumber(phone.value))focus=phone;
    else if(method.value==="Telefon"&&!phonePresent)focus=phone;
    else if(method.value==="E-mail"&&!emailPresent)focus=email;
    else if(!phonePresent&&!emailPresent)focus=method.value==="E-mail"?email:phone;
    if(focus){focus.reportValidity();focus.focus();return false;}
    return true;
  };
  method.addEventListener("change",syncContactPreference);phone.addEventListener("input",syncContactPreference);email.addEventListener("input",syncContactPreference);syncContactPreference();
  const callbackLabel=document.createElement("label");callbackLabel.textContent="Dogodna pora kontaktu (opcjonalnie)";const callback=document.createElement("select");callback.id="cf-time-"+Math.random().toString(36).slice(2,8);callbackLabel.htmlFor=callback.id;for(const value of ["Bez preferencji","Przed południem","Po południu","Wieczorem"]){const option=document.createElement("option");option.value=value;option.textContent=value;callback.append(option);}form.append(callbackLabel,callback);
  const callbackHint=document.createElement("small");callbackHint.className="contact-field-hint";callbackHint.textContent="To jedynie preferencja; nie jest rezerwacją terminu rozmowy.";form.append(callbackHint);
  const optionalDetails=document.createElement("details");optionalDetails.className="contact-optional-details";const optionalSummary=document.createElement("summary");optionalSummary.textContent="Dodatkowe preferencje kontaktu (opcjonalnie)";optionalDetails.append(optionalSummary,callbackLabel,callback,callbackHint);form.append(optionalDetails);
  const msgLabel=document.createElement("label");msgLabel.textContent="Treść wiadomości (opcjonalnie)";const msg=document.createElement("textarea");msg.id="cf-message-"+Math.random().toString(36).slice(2,8);msgLabel.htmlFor=msg.id;msg.rows=4;msg.maxLength=1200;msg.placeholder="Opisz sprawę ogólnie, bez numeru PESEL, informacji medycznych i danych dokumentów.";form.append(msgLabel,msg);
  // On the homepage show the minimum fields first. Optional case information stays accessible.
  if(document.body.classList.contains("premium-v2")){
    const extra=document.createElement("details");extra.className="contact-case-details";
    const summary=document.createElement("summary");summary.textContent="Dodaj opis i szczegóły sprawy (opcjonalnie)";
    extra.append(summary,stageWrap,damageWrap,city.previousElementSibling,city,methodLabel,method,optionalDetails,msgLabel,msg);
    if(stage.value && requestedStage)extra.open=true;
    form.append(extra);
  }
  const ackLabel=document.createElement("label");ackLabel.className="check";const ack=document.createElement("input");ack.type="checkbox";ack.required=true;ackLabel.append(ack,document.createTextNode(automatic ? " Zapoznałem/am się z informacjami o prywatności i proszę o kontakt w sprawie mojego zgłoszenia." : " Rozumiem, że wiadomość nie zostanie wysłana automatycznie. Zapoznałem/am się z informacjami o prywatności."));form.append(ackLabel);
  const privacy=document.createElement("a");privacy.href="/v2/polityka-prywatnosci.html";privacy.target="_blank";privacy.rel="noopener noreferrer";privacy.textContent="Informacje o prywatności (nowa karta)";form.append(privacy);
  const button=document.createElement("button");button.className="btn";button.type="submit";button.textContent=automatic?"Wyślij zgłoszenie":"Przygotuj wiadomość e-mail";form.append(button);
  const status=document.createElement("p");status.setAttribute("role","status");status.setAttribute("aria-live","polite");form.append(status);
  const honeypot=document.createElement("input");honeypot.type="text";honeypot.name="botcheck";honeypot.tabIndex=-1;honeypot.autocomplete="off";honeypot.setAttribute("aria-hidden","true");honeypot.style.cssText="position:absolute;left:-10000px;width:1px;height:1px;opacity:0";form.append(honeypot);
  let refreshShortcutState=()=>{}; // Reconcile homepage selection after form reset.
  let sending=false; // Chroni przed podwójnym wysłaniem, także przez klawisz Enter.
  form.addEventListener("submit",async event=>{
   event.preventDefault();if(sending)return;
   if(!checkName()){name.reportValidity();name.focus();return;}
   if(!checkContact())return;
   if(!form.reportValidity())return;
   if(automatic){
    if(honeypot.value){status.textContent="Nie udało się zweryfikować formularza.";return;}
    sending=true;button.disabled=true;button.textContent="Wysyłanie…";status.className="";status.textContent="Przesyłam zgłoszenie…";
    const payload={access_key:accessKey,subject:"Twoja Sprawa: "+select.value,from_name:"Formularz Twoja Sprawa",name:name.value.trim(),email:email.value.trim(),phone:phone.value.trim(),location:city.value.trim(),service:select.value,contact_preference:method.value,preferred_time:callback.value,case_stage:stageWrap.hidden?"nie dotyczy":stage.value||"nie podano",...(select.value==="Szkody górnicze"&&damageArea.value?{damage_area:damageArea.value}:{}),campaign_source:source,campaign_medium:safeMedium||"brak",campaign_name:safeCampaign||"brak",campaign_variant:safeCreative||"brak",lead_path:leadPath,message:msg.value.trim()||"Prośba o kontakt.",...(email.value.trim()?{replyto:email.value.trim()}:{}),botcheck:""};
    try{const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),12000);let response;try{response=await fetch("https://api.web3forms.com/submit",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify(payload),signal:controller.signal});}finally{window.clearTimeout(timeout);}const result=await response.json();if(!response.ok||result.success!==true)throw Error("delivery");status.className="contact-status-success";status.textContent="Operator formularza potwierdził przyjęcie zgłoszenia. Dziękujemy! Nie jest to jeszcze potwierdzenie dostarczenia wiadomości do skrzynki odbiorczej. Jeśli sprawa jest pilna, skorzystaj z kontaktu telefonicznego.";form.reset();updateAdvisor();updateGuide();updateStage();updateDamageArea();updateContextNotice();syncContactPreference();name.setCustomValidity("");refreshShortcutState();}catch{status.className="contact-status-error";status.replaceChildren();const errorText=document.createElement("span");errorText.textContent="Nie udało się potwierdzić przyjęcia zgłoszenia. Dane pozostają w formularzu. Możesz spróbować ponownie albo zadzwonić: ";const errorCall=document.createElement("a");const paulina=["Świadczenie wspierające","Renty powypadkowe"].includes(select.value);errorCall.href=paulina?"tel:+48500171531":"tel:+48796441345";errorCall.textContent=paulina?"500 171 531":"796 441 345";status.append(errorText,errorCall);const fallback=document.createElement("a");fallback.className="contact-fallback-link";fallback.href="mailto:twojasprawa_votum@outlook.com?subject="+encodeURIComponent("Zapytanie Twoja Sprawa: "+select.value)+"&body="+encodeURIComponent(["Dzień dobry,","", "Usługa: "+select.value,"Imię: "+name.value.trim(),"Miejscowość: "+city.value.trim(),"Telefon: "+phone.value.trim(),"E-mail: "+email.value.trim(),"Preferowany kontakt: "+method.value,"Dogodna pora: "+callback.value,"Etap sprawy: "+(stageWrap.hidden?"nie dotyczy":stage.value||"nie podano"),...(select.value==="Szkody górnicze"?["Obszar uszkodzeń: "+(damageArea.value||"nie podano")]:[]),"Źródło: "+source,"Kanał: "+(safeMedium||"brak"),"Kampania: "+(safeCampaign||"brak"),"Wariant: "+(safeCreative||"brak"),"Sposób przejścia: "+leadPath,"","Opis: "+(msg.value.trim()||"Proszę o kontakt.")].join("\n"));fallback.textContent="Otwórz gotową wiadomość e-mail";status.append(document.createTextNode(" · "),fallback);}finally{sending=false;button.disabled=false;button.textContent="Wyślij zgłoszenie";}return;
   }
   const subject="Zapytanie Twoja Sprawa: "+select.value;
   const body=["Dzień dobry,","", "Usługa: "+select.value,"Imię: "+name.value.trim(),"Miejscowość: "+city.value.trim(),"Telefon: "+phone.value.trim(),"E-mail: "+email.value.trim(),"Preferowany kontakt: "+method.value,"Dogodna pora: "+callback.value,"Etap sprawy: "+(stageWrap.hidden?"nie dotyczy":stage.value||"nie podano"),...(select.value==="Szkody górnicze"?["Obszar uszkodzeń: "+(damageArea.value||"nie podano")]:[]),"Źródło zgłoszenia: "+source,"Kanał: "+(safeMedium||"brak"),"Kampania: "+(safeCampaign||"brak"),"Wariant: "+(safeCreative||"brak"),"Sposób przejścia: "+leadPath,"","Opis sprawy:",""+(msg.value.trim()||"Proszę o kontakt."),"","Proszę o odpowiedź na wskazany adres e-mail lub telefon."].join("\n");
   status.textContent="Otwieram aplikację pocztową. Sprawdź przygotowaną wiadomość i wyślij ją samodzielnie.";
   window.location.href="mailto:twojasprawa_votum@outlook.com?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);
  });
  // Jedno kliknięcie z karty uszkodzenia ustawia tylko dozwoloną opcję w formularzu.
  // Link #formularz pozostaje natywnym, dostępnym odnośnikiem bez JavaScript.
  for(const trigger of document.querySelectorAll("[data-damage-option]")){
   trigger.addEventListener("click",()=>{
    const choice=trigger.getAttribute("data-damage-option");
    if(![...damageArea.children].some(option=>option.value===choice))return;
    if(select.value!=="Szkody górnicze"){
     select.value="Szkody górnicze";updateAdvisor();updateGuide();updateStage();updateContextNotice();
    }
    updateDamageArea();damageArea.value=choice;
   });
  }
  // Karty na stronie kampanii świadczenia wskazują wyłącznie jedną ze znanych
  // faz WZON. Nie przyjmujemy tekstów wejściowych ani danych medycznych z linków.
  for(const trigger of document.querySelectorAll("[data-stage-option]")){
   trigger.addEventListener("click",()=>{
    const code=trigger.getAttribute("data-stage-option");
    const stages=stageCodes["Świadczenie wspierające"];
    const chosen=Object.prototype.hasOwnProperty.call(stages,code)?stages[code]:"";
    if(!chosen)return;
    if(select.value!=="Świadczenie wspierające"){
     select.value="Świadczenie wspierające";
     updateAdvisor();updateGuide();updateStage();updateDamageArea();
    }
    if(stageWrap.hidden)return;
    stage.value=chosen;
    updateContextNotice();
   });
  }
  // Home only: prominent flagship links select the same existing form, without
  // creating duplicate lead forms or collecting data before explicit submission.
  const primaryShortcuts=[...document.querySelectorAll("[data-contact-shortcut]")];
  if(primaryShortcuts.length){
   const shortcutStatus=document.querySelectorAll("[data-contact-shortcut-status]")[0];
   const pickService=code=>["szkody","swiadczenie"].includes(code)?serviceAlias[code]:"";
   const syncShortcuts=()=>{
    let active=false;
    for(const link of primaryShortcuts){
     const chosen=pickService(link.getAttribute("data-contact-shortcut"));
     const current=Boolean(chosen&&select.value===chosen);
     link.setAttribute("data-selected",String(current));
     if(current)active=true;
    }
    if(shortcutStatus)shortcutStatus.textContent=active?"Wybrano: "+select.value+". Uzupełnij dane w formularzu poniżej.":"";
   };
   select.addEventListener("change",syncShortcuts);
   for(const link of primaryShortcuts){
    link.addEventListener("click",event=>{
     const chosen=pickService(link.getAttribute("data-contact-shortcut"));
     if(!chosen)return;
     event.preventDefault();
     select.value=chosen;
     updateAdvisor();updateGuide();updateStage();updateDamageArea();updateContextNotice();
     syncShortcuts();
     // Instant scroll avoids competing animations when visitors change topic quickly.
     // It also respects motion-sensitive users without relying on OS detection.
     host.scrollIntoView?.({behavior:"instant",block:"start"});
     select.focus?.({preventScroll:true});
    });
   }
   refreshShortcutState=syncShortcuts;
   syncShortcuts();
  }
  host.replaceChildren(form);
 }
})();
