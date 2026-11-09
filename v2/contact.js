/* Formularz: Web3Forms po aktywacji klucza i polityki prywatności; wcześniej mailto. */
(() => {
 "use strict";
 const services = ["Szkody górnicze","Świadczenie wspierające","Renty powypadkowe","Kredyt w PLN / SKD","Służebność przesyłu","Wypadek komunikacyjny","Wypadek przy pracy","Wypadek w rolnictwie","Szkoda na nieruchomości","Odszkodowanie za hałas","Pomoc w sprawie karnej","Nieudany urlop","Inna sprawa"];
 const current = document.currentScript?.getAttribute("data-service") || "";
 const hosts = document.querySelectorAll("[data-contact-form]");
 const accessKey="80a28b90-b5ac-406e-8512-3d3c1615b73c"; // Publiczny identyfikator formularza Web3Forms, nie hasło.
 const automatic=/^[a-f0-9-]{30,40}$/i.test(accessKey);
 const campaignParams=new URLSearchParams(window.location.search);
 const sourceAllowed=new Set(["facebook","instagram","tiktok","google","ulotka","plakat","qr","polecenie","organiczne","inne"]);
 const campaignSource=(campaignParams.get("utm_source")||"").toLowerCase().trim();
 const source=sourceAllowed.has(campaignSource)?campaignSource:"nieoznaczone";
 const campaign=(campaignParams.get("utm_campaign")||"").toLowerCase().trim();
 const safeCampaign=/^[a-z0-9_-]{1,40}$/.test(campaign)?campaign:"";

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
  const serviceAlias={"szkody":"Szkody górnicze","swiadczenie":"Świadczenie wspierające","renty":"Renty powypadkowe","skd":"Kredyt w PLN / SKD","przesyl":"Służebność przesyłu"};
  const serviceFromLink=serviceAlias[(campaignParams.get("usluga")||"").toLowerCase()]||"";
  for(const name of services){const option=document.createElement("option");option.value=name;option.textContent=name;if(name===(serviceFromLink||current))option.selected=true;select.append(option);}
  form.append(label,select);
  const people=document.createElement("p");people.className="contact-people";people.innerHTML='Kontakt telefoniczny: <a href="tel:+48796441345">Wojciech Obiegło — 796 441 345</a> · <a href="tel:+48500171531">Paulina Chandrała — 500 171 531</a>';form.append(people);
  const advisor=document.createElement("div");advisor.className="contact-advisor";advisor.setAttribute("aria-live","polite");form.append(advisor);
  const updateAdvisor=()=>{const paulina=["Świadczenie wspierające","Renty powypadkowe","Kredyt w PLN / SKD"].includes(select.value);advisor.replaceChildren();const title=document.createElement("strong");title.textContent=paulina?"Twoja osoba do kontaktu: Paulina Chandrała":"Twoja osoba do kontaktu: Wojciech Obiegło";const info=document.createElement("span");info.textContent=paulina?"Świadczenia, renty i SKD":"Szkody górnicze i pozostałe sprawy";const call=document.createElement("a");call.href=paulina?"tel:+48500171531":"tel:+48796441345";call.textContent=paulina?"Zadzwoń: 500 171 531":"Zadzwoń: 796 441 345";advisor.append(title,info,call);};select.addEventListener("change",updateAdvisor);updateAdvisor();
  const stageWrap=document.createElement("div");stageWrap.className="contact-stage";const stageLabel=document.createElement("label");const stage=document.createElement("select");stage.id="cf-stage-"+Math.random().toString(36).slice(2,8);stageLabel.htmlFor=stage.id;stageWrap.append(stageLabel,stage);form.append(stageWrap);
  const stageOptions={
   "Szkody górnicze":["Wybierz etap sprawy","Zauważyłem/am uszkodzenia","Zgłosiłem/am szkodę do kopalni","Otrzymałem/am propozycję ugody","Kopalnia odmówiła","Inna sytuacja"],
   "Świadczenie wspierające":["Wybierz etap sprawy","Dopiero planuję wniosek do WZON","Czekam na decyzję WZON","Mam decyzję WZON","Chcę przeanalizować decyzję lub odwołanie","Mam sprawę w ZUS","Inna sytuacja"]
  };
  const updateStage=()=>{const options=stageOptions[select.value];stage.replaceChildren();stageWrap.hidden=!options;if(!options)return;stageLabel.textContent=select.value==="Szkody górnicze"?"Na jakim etapie jest sprawa szkody?":"Na jakim etapie jest sprawa świadczenia?";for(let i=0;i<options.length;i++){const option=document.createElement("option");option.value=i===0?"":options[i];option.textContent=options[i];stage.append(option);}stage.required=false;};select.addEventListener("change",updateStage);updateStage();
  const name=field("Imię","text",true,80,"given-name");
  const city=field("Miasto lub miejscowość","text",true,100,"address-level2");
  const phone=field("Telefon kontaktowy","tel",true,30,"tel");phone.pattern="[+0-9()\\s-]{7,30}";phone.title="Podaj numer telefonu (co najmniej 7 znaków)";
  const email=field("Adres e-mail","email",true,150,"email");
  const methodLabel=document.createElement("label");methodLabel.textContent="Preferowany sposób kontaktu";const method=document.createElement("select");method.id="cf-method-"+Math.random().toString(36).slice(2,8);methodLabel.htmlFor=method.id;for(const [value,title] of [["Telefon","Telefon"],["E-mail","E-mail"],["Dowolny","Dowolny"]]){const option=document.createElement("option");option.value=value;option.textContent=title;method.append(option);}form.append(methodLabel,method);
  const msgLabel=document.createElement("label");msgLabel.textContent="Treść wiadomości (opcjonalnie)";const msg=document.createElement("textarea");msg.id="cf-message-"+Math.random().toString(36).slice(2,8);msgLabel.htmlFor=msg.id;msg.rows=4;msg.maxLength=1200;msg.placeholder="Opisz sprawę ogólnie, bez numeru PESEL, informacji medycznych i danych dokumentów.";form.append(msgLabel,msg);
  const ackLabel=document.createElement("label");ackLabel.className="check";const ack=document.createElement("input");ack.type="checkbox";ack.required=true;ackLabel.append(ack,document.createTextNode(automatic ? " Zapoznałem/am się z informacjami o prywatności i proszę o kontakt w sprawie mojego zgłoszenia." : " Rozumiem, że wiadomość nie zostanie wysłana automatycznie. Zapoznałem/am się z informacjami o prywatności."));form.append(ackLabel);
  const privacy=document.createElement("a");privacy.href="/v2/polityka-prywatnosci.html";privacy.textContent="Informacje o prywatności";form.append(privacy);
  const button=document.createElement("button");button.className="btn";button.type="submit";button.textContent=automatic?"Wyślij zgłoszenie":"Przygotuj wiadomość e-mail";form.append(button);
  const status=document.createElement("p");status.setAttribute("role","status");status.setAttribute("aria-live","polite");form.append(status);
  const honeypot=document.createElement("input");honeypot.type="text";honeypot.name="botcheck";honeypot.tabIndex=-1;honeypot.autocomplete="off";honeypot.setAttribute("aria-hidden","true");honeypot.style.cssText="position:absolute;left:-10000px;width:1px;height:1px;opacity:0";form.append(honeypot);
  form.addEventListener("submit",async event=>{
   event.preventDefault();if(!form.reportValidity())return;
   if(automatic){
    if(honeypot.value){status.textContent="Nie udało się zweryfikować formularza.";return;}
    button.disabled=true;button.textContent="Wysyłanie…";status.className="";status.textContent="Przesyłam zgłoszenie…";
    const payload={access_key:accessKey,subject:"Twoja Sprawa: "+select.value,from_name:"Formularz Twoja Sprawa",name:name.value.trim(),email:email.value.trim(),phone:phone.value.trim(),location:city.value.trim(),service:select.value,contact_preference:method.value,case_stage:stageWrap.hidden?"nie dotyczy":stage.value||"nie podano",campaign_source:source,campaign_name:safeCampaign||"brak",message:msg.value.trim()||"Prośba o kontakt.",replyto:email.value.trim(),botcheck:""};
    try{const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),12000);let response;try{response=await fetch("https://api.web3forms.com/submit",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify(payload),signal:controller.signal});}finally{window.clearTimeout(timeout);}const result=await response.json();if(!response.ok||result.success!==true)throw Error("delivery");status.className="contact-status-success";status.textContent="Dziękujemy! Zgłoszenie zostało przyjęte. Odpowiemy na podane dane kontaktowe po zapoznaniu się ze sprawą.";form.reset();updateAdvisor();updateStage();}catch{status.className="contact-status-error";status.textContent="Nie udało się potwierdzić przyjęcia zgłoszenia. Spróbuj ponownie lub zadzwoń. Wpisane dane pozostały w formularzu.";}finally{button.disabled=false;button.textContent="Wyślij zgłoszenie";}return;
   }
   const subject="Zapytanie Twoja Sprawa: "+select.value;
   const body=["Dzień dobry,","", "Usługa: "+select.value,"Imię: "+name.value.trim(),"Miejscowość: "+city.value.trim(),"Telefon: "+phone.value.trim(),"E-mail: "+email.value.trim(),"Preferowany kontakt: "+method.value,"Etap sprawy: "+(stageWrap.hidden?"nie dotyczy":stage.value||"nie podano"),"Źródło zgłoszenia: "+source,"Kampania: "+(safeCampaign||"brak"),"","Opis sprawy:",""+(msg.value.trim()||"Proszę o kontakt."),"","Proszę o odpowiedź na wskazany adres e-mail lub telefon."].join("\n");
   status.textContent="Otwieram aplikację pocztową. Sprawdź przygotowaną wiadomość i wyślij ją samodzielnie.";
   window.location.href="mailto:twojasprawa_votum@outlook.com?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);
  });
  host.replaceChildren(form);
 }
})();
