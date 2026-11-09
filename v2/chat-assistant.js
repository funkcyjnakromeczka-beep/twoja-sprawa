/* Twoja Sprawa — lokalny asystent nawigacyjny. Nie zbiera danych i nie udaje AI. */
(() => {
  "use strict";
  const script = document.currentScript;
  const base = script?.getAttribute("data-base") || "/v2/";
  const liveUrl = script?.getAttribute("data-live-chat-url") || "";
  const topics = [
    ["Szkody górnicze","szkody-gornicze","Pęknięcia, elewacja, kostka lub ogrodzenie? Dojeżdżamy do klientów m.in. w gminie Lubin i gminie Polkowice. Przygotuj miejscowość, datę zauważenia i zdjęcia szkód. Opłata początkowa w projekcie: 1 zł; pozostałe warunki określa umowa."],
    ["Świadczenie wspierające","swiadczenie-wspierajace","Analizujemy decyzje WZON i ZUS, punktację oraz możliwe wyrównanie. Wyrównanie za cały okres oczekiwania nie jest automatyczne. Kontakt w tej sprawie: 500 171 531."],
    ["Renty powypadkowe","renty-powypadkowe","Sprawdzamy podstawy zmiany wysokości renty od ubezpieczyciela, w tym wzrost kosztów opieki, leczenia i rehabilitacji."],
    ["Kredyty PLN / SKD","kredyty-pln","Analizujemy umowy kredytu konsumenckiego w PLN pod kątem sankcji kredytu darmowego. Nie każda umowa kwalifikuje się do SKD."],
    ["Służebność przesyłu","sluzebnosc-przesylu","Masz słup, linię lub gazociąg na działce? Sprawdźmy dokumenty i podstawę korzystania z nieruchomości."]
  ];
  const root = document.createElement("aside");
  root.className = "chat-assistant";
  root.setAttribute("aria-label","Asystent strony Twoja Sprawa");
  const toggle = document.createElement("button");
  toggle.className = "chat-toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-expanded","false");
  toggle.textContent = "Pomoc na stronie";
  const panel = document.createElement("div");
  panel.className = "chat-panel";
  panel.hidden = true;
  const header = document.createElement("div");
  header.className = "chat-header";
  const title = document.createElement("strong");
  title.textContent = "Asystent Twoja Sprawa";
  const close = document.createElement("button");
  close.type = "button";
  close.className = "chat-close";
  close.setAttribute("aria-label","Zamknij asystenta");
  close.textContent = "×";
  header.append(title,close);
  const content = document.createElement("div");
  content.className = "chat-content";
  const buttons = document.createElement("div");
  buttons.className = "chat-choices";
  const intro = document.createElement("p");
  intro.textContent = "Wybierz temat. To automatyczny przewodnik po stronie, nie rozmowa z konsultantem. Nie wpisuj danych osobowych ani medycznych.";
  const reply = document.createElement("div");
  reply.className = "chat-reply";
  reply.setAttribute("aria-live","polite");
  content.append(intro,buttons,reply);
  const actions = document.createElement("div");
  actions.className = "chat-actions";
  const phone = document.createElement("a");
  phone.href = "tel:+48796441345";
  phone.textContent = "Zadzwoń: 796 441 345";
  const email = document.createElement("a");
  email.href = base+"#kontakt";
  email.textContent = "Przygotuj wiadomość";
  actions.append(phone,email);
  const live = document.createElement("button");
  live.type = "button";
  live.textContent = "Porozmawiaj z konsultantem";
  live.addEventListener("click",()=>{
    if (window.Tawk_API?.maximize) { window.Tawk_API.maximize(); return; }
    if (liveUrl && /^https:\/\//.test(liveUrl)) { window.open(liveUrl,"_blank","noopener,noreferrer"); return; }
    reply.textContent = "Czat na żywo nie jest jeszcze uruchomiony. Skorzystaj z telefonu lub przygotuj wiadomość — nie informujemy o dostępności konsultanta bez potwierdzenia.";
  });
  actions.append(live);
  panel.append(header,content,actions);
  root.append(toggle,panel);
  document.body.append(root);
  const show = (open) => {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded",String(open));
    if (open) close.focus();
    else toggle.focus();
  };
  toggle.addEventListener("click",()=>show(panel.hidden));
  close.addEventListener("click",()=>show(false));
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!panel.hidden)show(false);});
  for(const [name,slug,answer] of topics){
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = name;
    b.addEventListener("click",()=>{
      reply.replaceChildren();
      const p=document.createElement("p");
      p.textContent=answer;
      const a=document.createElement("a");
      a.href=base+"uslugi/"+slug+".html";
      a.textContent="Przeczytaj o usłudze";
      reply.append(p,a);
    });
    buttons.append(b);
  }
})();
