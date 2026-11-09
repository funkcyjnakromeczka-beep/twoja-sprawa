/* Formularz wspólny: wersja bez backendu. Klient wysyła e-mail samodzielnie. */
(() => {
 "use strict";
 const services = ["Szkody górnicze","Świadczenie wspierające","Renty powypadkowe","Kredyt w PLN / SKD","Służebność przesyłu","Wypadek komunikacyjny","Wypadek przy pracy","Wypadek w rolnictwie","Szkoda na nieruchomości","Odszkodowanie za hałas","Pomoc w sprawie karnej","Nieudany urlop","Inna sprawa"];
 const current = document.currentScript?.getAttribute("data-service") || "";
 const hosts = document.querySelectorAll("[data-contact-form]");
 for (const host of hosts) {
  const form = document.createElement("form"); form.className = "contact-form";
  const heading = document.createElement("h3"); heading.textContent = "Wyślij zapytanie"; form.append(heading);
  const note = document.createElement("p"); note.textContent = "Formularz przygotuje wiadomość w Twojej aplikacji e-mail. Aby zgłoszenie dotarło, musisz ją następnie wysłać. Nie wpisuj danych wrażliwych."; form.append(note);
  function field(labelText,type,required,limit,auto) {
   const id = "cf-"+(auto||type)+"-"+Math.random().toString(36).slice(2,8);
   const label=document.createElement("label"); label.htmlFor=id;label.textContent=labelText;
   const input=document.createElement("input"); input.id=id;input.type=type;input.required=required;input.maxLength=limit;if(auto)input.autocomplete=auto;
   form.append(label,input);return input;
  }
  const label=document.createElement("label");label.textContent="Wybór usługi";const select=document.createElement("select");select.required=true;select.setAttribute("aria-label","Wybór usługi");const empty=document.createElement("option");empty.value="";empty.textContent="Wybierz usługę";select.append(empty);
  for(const name of services){const option=document.createElement("option");option.value=name;option.textContent=name;if(name===current)option.selected=true;select.append(option);}
  form.append(label,select);
  const name=field("Imię","text",true,80,"given-name");
  const city=field("Miasto lub miejscowość","text",true,100,"address-level2");
  const phone=field("Telefon kontaktowy","tel",true,30,"tel");phone.pattern="[+0-9()\\s-]{7,30}";phone.title="Podaj numer telefonu (co najmniej 7 znaków)";
  const email=field("Adres e-mail","email",true,150,"email");
  const msgLabel=document.createElement("label");msgLabel.textContent="Treść wiadomości (opcjonalnie)";const msg=document.createElement("textarea");msg.rows=4;msg.maxLength=1500;msg.placeholder="Opisz sprawę ogólnie, bez numeru PESEL, informacji medycznych i danych dokumentów.";form.append(msgLabel,msg);
  const ackLabel=document.createElement("label");ackLabel.className="check";const ack=document.createElement("input");ack.type="checkbox";ack.required=true;ackLabel.append(ack,document.createTextNode(" Rozumiem, że wiadomość nie zostanie wysłana automatycznie. Zapoznałem/am się z informacjami o prywatności."));form.append(ackLabel);
  const privacy=document.createElement("a");privacy.href="/v2/polityka-prywatnosci.html";privacy.textContent="Informacje o prywatności";form.append(privacy);
  const button=document.createElement("button");button.className="btn";button.type="submit";button.textContent="Przygotuj wiadomość e-mail";form.append(button);
  const status=document.createElement("p");status.setAttribute("role","status");status.setAttribute("aria-live","polite");form.append(status);
  form.addEventListener("submit",event=>{
   event.preventDefault();if(!form.reportValidity())return;
   const subject="Zapytanie Twoja Sprawa: "+select.value;
   const body=["Dzień dobry,","", "Usługa: "+select.value,"Imię: "+name.value.trim(),"Miejscowość: "+city.value.trim(),"Telefon: "+phone.value.trim(),"E-mail: "+email.value.trim(),"","Opis sprawy:",""+(msg.value.trim()||"Proszę o kontakt."),"","Proszę o odpowiedź na wskazany adres e-mail lub telefon."].join("\n");
   status.textContent="Otwieram aplikację pocztową. Sprawdź przygotowaną wiadomość i wyślij ją samodzielnie.";
   window.location.href="mailto:twojasprawa_votum@outlook.com?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);
  });
  host.replaceChildren(form);
 }
})();
