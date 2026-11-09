/* Formularz wspólny: automatyczna wysyłka po konfiguracji Turnstile + Resend; bezpieczny tryb mailto w przeciwnym razie. */
(() => {
 "use strict";
 const services = ["Szkody górnicze","Świadczenie wspierające","Renty powypadkowe","Kredyt w PLN / SKD","Służebność przesyłu","Wypadek komunikacyjny","Wypadek przy pracy","Wypadek w rolnictwie","Szkoda na nieruchomości","Odszkodowanie za hałas","Pomoc w sprawie karnej","Nieudany urlop","Inna sprawa"];
 const current = document.currentScript?.getAttribute("data-service") || "";
 const hosts = document.querySelectorAll("[data-contact-form]");
 const siteKey = document.querySelector('meta[name="turnstile-site-key"]')?.content?.trim() || "";
 const automatic = /^[A-Za-z0-9_-]{10,}$/.test(siteKey);
 if(automatic && !document.querySelector('script[data-turnstile-sdk]')){const sdk=document.createElement("script");sdk.src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";sdk.async=true;sdk.defer=true;sdk.dataset.turnstileSdk="";document.head.append(sdk);}

 for (const host of hosts) {
  const form = document.createElement("form"); form.className = "contact-form";
  const heading = document.createElement("h3"); heading.textContent = "Przygotuj zapytanie"; form.append(heading);
  const note = document.createElement("p"); note.textContent = automatic ? "Wyślij zgłoszenie bezpośrednio z tej strony. Nie podawaj PESEL, informacji medycznych ani danych dokumentów." : "Formularz przygotuje wiadomość w Twojej aplikacji e-mail. Aby zgłoszenie dotarło, musisz ją następnie wysłać. Nie wpisuj danych wrażliwych."; form.append(note);
  function field(labelText,type,required,limit,auto) {
   const id = "cf-"+(auto||type)+"-"+Math.random().toString(36).slice(2,8);
   const label=document.createElement("label"); label.htmlFor=id;label.textContent=labelText;
   const input=document.createElement("input"); input.id=id;input.type=type;input.required=required;input.maxLength=limit;if(auto)input.autocomplete=auto;
   form.append(label,input);return input;
  }
  const label=document.createElement("label");label.textContent="Wybór usługi";const select=document.createElement("select");select.required=true;select.id="cf-service-"+Math.random().toString(36).slice(2,8);label.htmlFor=select.id;const empty=document.createElement("option");empty.value="";empty.textContent="Wybierz usługę";select.append(empty);
  for(const name of services){const option=document.createElement("option");option.value=name;option.textContent=name;if(name===current)option.selected=true;select.append(option);}
  form.append(label,select);
  const people=document.createElement("p");people.className="contact-people";people.innerHTML='Kontakt telefoniczny: <a href="tel:+48796441345">Wojciech Obiegło — 796 441 345</a> · <a href="tel:+48500171531">Paulina Chandrała — 500 171 531</a>';form.append(people);
  const advisor=document.createElement("div");advisor.className="contact-advisor";advisor.setAttribute("aria-live","polite");form.append(advisor);
  const updateAdvisor=()=>{const paulina=["Świadczenie wspierające","Renty powypadkowe","Kredyt w PLN / SKD"].includes(select.value);advisor.replaceChildren();const title=document.createElement("strong");title.textContent=paulina?"Twoja osoba do kontaktu: Paulina Chandrała":"Twoja osoba do kontaktu: Wojciech Obiegło";const info=document.createElement("span");info.textContent=paulina?"Świadczenia, renty i SKD":"Szkody górnicze i pozostałe sprawy";const call=document.createElement("a");call.href=paulina?"tel:+48500171531":"tel:+48796441345";call.textContent=paulina?"Zadzwoń: 500 171 531":"Zadzwoń: 796 441 345";advisor.append(title,info,call);};select.addEventListener("change",updateAdvisor);updateAdvisor();
  const name=field("Imię","text",true,80,"given-name");
  const city=field("Miasto lub miejscowość","text",true,100,"address-level2");
  const phone=field("Telefon kontaktowy","tel",true,30,"tel");phone.pattern="[+0-9()\\s-]{7,30}";phone.title="Podaj numer telefonu (co najmniej 7 znaków)";
  const email=field("Adres e-mail","email",true,150,"email");
  const msgLabel=document.createElement("label");msgLabel.textContent="Treść wiadomości (opcjonalnie)";const msg=document.createElement("textarea");msg.id="cf-message-"+Math.random().toString(36).slice(2,8);msgLabel.htmlFor=msg.id;msg.rows=4;msg.maxLength=1200;msg.placeholder="Opisz sprawę ogólnie, bez numeru PESEL, informacji medycznych i danych dokumentów.";form.append(msgLabel,msg);
  const ackLabel=document.createElement("label");ackLabel.className="check";const ack=document.createElement("input");ack.type="checkbox";ack.required=true;ackLabel.append(ack,document.createTextNode(automatic ? " Zapoznałem/am się z informacjami o prywatności i proszę o kontakt w sprawie mojego zgłoszenia." : " Rozumiem, że wiadomość nie zostanie wysłana automatycznie. Zapoznałem/am się z informacjami o prywatności."));form.append(ackLabel);
  const privacy=document.createElement("a");privacy.href="/v2/polityka-prywatnosci.html";privacy.textContent="Informacje o prywatności";form.append(privacy);
  const button=document.createElement("button");button.className="btn";button.type="submit";button.textContent=automatic?"Wyślij zgłoszenie":"Przygotuj wiadomość e-mail";form.append(button);
  const status=document.createElement("p");status.setAttribute("role","status");status.setAttribute("aria-live","polite");form.append(status);
  let turnstileId=null;const challenge=document.createElement("div");if(automatic){challenge.className="turnstile-container";form.insertBefore(challenge,button);let attempts=0;const mount=()=>{if(window.turnstile&&typeof window.turnstile.render==="function"){turnstileId=window.turnstile.render(challenge,{sitekey:siteKey,theme:"light"});}else if(++attempts<40) window.setTimeout(mount,300);else status.textContent="Weryfikacja antyspamowa nie załadowała się. Odśwież stronę lub skontaktuj się telefonicznie.";};mount();}
  form.addEventListener("submit",async event=>{
   event.preventDefault();if(!form.reportValidity())return;
   if(automatic){
    const token=turnstileId!==null&&window.turnstile?window.turnstile.getResponse(turnstileId):"";
    if(!token){status.textContent="Potwierdź weryfikację antyspamową przed wysłaniem.";return;}
    button.disabled=true;button.textContent="Wysyłanie…";status.textContent="Przesyłam zgłoszenie…";
    try{const response=await fetch("/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({service:select.value,name:name.value.trim(),location:city.value.trim(),phone:phone.value.trim(),email:email.value.trim(),message:msg.value.trim(),privacyAcknowledged:ack.checked,turnstileToken:token,website:""})});const result=await response.json();if(!response.ok||result.ok!==true)throw Error("delivery");status.textContent="Zgłoszenie zostało przekazane. Skontaktujemy się z Tobą po zapoznaniu się ze sprawą.";form.reset();updateAdvisor();}catch{status.textContent="Nie udało się potwierdzić wysyłki. Spróbuj ponownie albo zadzwoń do nas. Dane formularza pozostały na stronie.";}finally{button.disabled=false;button.textContent="Wyślij zgłoszenie";if(turnstileId!==null&&window.turnstile)window.turnstile.reset(turnstileId);}return;
   }
   const subject="Zapytanie Twoja Sprawa: "+select.value;
   const body=["Dzień dobry,","", "Usługa: "+select.value,"Imię: "+name.value.trim(),"Miejscowość: "+city.value.trim(),"Telefon: "+phone.value.trim(),"E-mail: "+email.value.trim(),"","Opis sprawy:",""+(msg.value.trim()||"Proszę o kontakt."),"","Proszę o odpowiedź na wskazany adres e-mail lub telefon."].join("\n");
   status.textContent="Otwieram aplikację pocztową. Sprawdź przygotowaną wiadomość i wyślij ją samodzielnie.";
   window.location.href="mailto:twojasprawa_votum@outlook.com?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);
  });
  host.replaceChildren(form);
 }
})();
