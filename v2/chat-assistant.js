/* Twoja Sprawa — bezpłatny przewodnik po usługach, bez gromadzenia danych i bez pozorowania rozmowy AI. */
(() => {
  "use strict";
  const script=document.currentScript;
  const base=script?.getAttribute("data-base")||"/v2/";
  const params="?utm_source=strona&utm_medium=chatbot&utm_campaign=wybor_uslugi";
  const topics=[
    {
      key:"swiadczenie",name:"Świadczenie wspierające",short:"WZON, decyzje, ZUS",phone:"500 171 531",tel:"+48500171531",
      service:"swiadczenie-wspierajace.html",checklist:"swiadczenie-wspierajace-pierwsze-kroki.html",form:"kampanie/swiadczenie-wspierajace.html"+params,
      intro:"Pomagamy uporządkować etap sprawy przed WZON lub ZUS. O uprawnieniu do świadczenia rozstrzygają właściwe organy, nie chatbot.",
      stages:[
        ["Dopiero planuję wniosek","Zacznij od ustalenia etapu postępowania i informacji o codziennym funkcjonowaniu. Nie przesyłaj w czacie diagnoz ani dokumentacji medycznej."],
        ["Czekam na decyzję WZON","Zachowaj potwierdzenie złożenia wniosku i przychodzącą korespondencję. W razie otrzymania decyzji zanotuj datę jej doręczenia."],
        ["Mam decyzję WZON","Sprawdź liczbę punktów oraz pouczenie o dostępnych działaniach i terminach. Sam wynik nie przesądza automatycznie o wypłacie świadczenia."],
        ["Mam sprawę w ZUS","Warto ustalić, czy wniosek został złożony i jakie pisma już otrzymano. Ewentualne wyrównanie zależy od przepisów, terminów i sytuacji."],
        ["Chcę sprawdzić odwołanie","Zachowaj decyzję wraz z pouczeniem i dokładną datę doręczenia. Dalszy tryb i termin trzeba sprawdzić w konkretnej sprawie."]
      ]
    },
    {
      key:"szkody",name:"Szkody górnicze",short:"Lubin, Polkowice i okolice",phone:"796 441 345",tel:"+48796441345",
      service:"szkody-gornicze.html",checklist:"checklista-szkody-gorniczej.html",form:"kampanie/szkody-gornicze.html"+params,
      intro:"Analizujemy m.in. pęknięcia ścian, elewacji i nierówności kostki w rejonie Lubina i Polkowic. Sama lokalizacja nie przesądza o przyczynie uszkodzeń.",
      stages:[
        ["Widziałem niewielkie pęknięcia","Zrób zdjęcie z bliska i ujęcie całej ściany. Zapisz, kiedy po raz pierwszy zauważono uszkodzenie."],
        ["Kostka lub ogrodzenie są uszkodzone","Zrób fotografie nierówności, ogrodzenia i otoczenia oraz zanotuj, czy zmiany postępują."],
        ["Zgłosiłem szkodę do kopalni","Zachowaj zgłoszenie, potwierdzenie i odpowiedzi przedsiębiorcy górniczego. Przydadzą się do indywidualnej analizy."],
        ["Mam propozycję ugody","Nie zakładaj, że propozycja obejmuje wszystkie szkody. Przed podpisaniem warto dokładnie przeanalizować jej zakres i skutki."],
        ["Otrzymałem odmowę","Zachowaj treść odmowy, wcześniejszą korespondencję i zdjęcia. Można przeanalizować argumentację oraz dostępne możliwości działania."]
      ]
    },
    {
      key:"renty",name:"Renty powypadkowe",short:"Wysokość renty i waloryzacja",phone:"500 171 531",tel:"+48500171531",
      service:"renty-powypadkowe.html",checklist:"renta-powypadkowa-dokumenty.html",alias:"renty",
      intro:"Można przeanalizować wysokość renty wypłacanej przez ubezpieczyciela i zmiany potrzeb lub możliwości zarobkowych. Nie obiecujemy podwyższenia świadczenia.",
      stages:[
        ["Mam już rentę","Przygotuj informacje o obecnej wysokości renty, wcześniejszych decyzjach i zmianach kosztów lub dochodów."],
        ["Po wypadku straciłem dochody","Zapisz datę zdarzenia oraz ogólne informacje o skutkach dla możliwości pracy. Zakres dowodów ustalimy w rozmowie."]
      ]
    },
    {
      key:"skd",name:"Kredyty PLN / SKD",short:"Sprawdzenie umowy kredytowej",phone:"500 171 531",tel:"+48500171531",
      service:"kredyty-pln.html",checklist:"skd-kredyt-pln-lista-kontrolna.html",alias:"skd",
      intro:"Analiza może dotyczyć wybranych umów kredytu konsumenckiego w PLN. Nie każdy kredyt podlega sankcji kredytu darmowego.",
      stages:[
        ["Mam umowę kredytu","Zachowaj umowę, aneksy i harmonogram. Istotne mogą być rodzaj kredytu, koszty i daty."],
        ["Kredyt został spłacony","Zachowaj umowę i potwierdzenia spłaty. Możliwości działania zależą od rodzaju umowy i obowiązujących terminów."]
      ]
    },
    {
      key:"przesyl",name:"Służebność przesyłu",short:"Urządzenia na działce",phone:"796 441 345",tel:"+48796441345",
      service:"sluzebnosc-przesylu.html",checklist:"sluzebnosc-przesylu-dzialka.html",alias:"przesyl",
      intro:"Pomoc zaczyna się od sprawdzenia, z jakiej podstawy przedsiębiorca korzysta z nieruchomości. Obecność urządzeń nie oznacza automatycznie należnego wynagrodzenia.",
      stages:[
        ["Na działce stoi słup lub przebiega linia","Zachowaj numer działki i zdjęcia urządzeń. Sprawdź, czy istnieją umowy albo wpisy w księdze wieczystej."],
        ["Mam dokumenty lub umowę","Przygotuj informacje o rodzaju urządzeń i dostępnych dokumentach. Można przeanalizować ich znaczenie."]
      ]
    }
  ];
  const root=document.createElement("aside");
  root.className="chat-assistant";
  root.setAttribute("aria-label","Automatyczny przewodnik po usługach Twoja Sprawa");
  const toggle=document.createElement("button");
  toggle.type="button";toggle.className="chat-toggle";
  toggle.textContent="✦ Pomoc w wyborze";
  toggle.setAttribute("aria-expanded","false");
  toggle.setAttribute("aria-controls","ts-help-panel");
  const panel=document.createElement("div");
  panel.id="ts-help-panel";panel.className="chat-panel";
  panel.setAttribute("role","region");
  panel.setAttribute("aria-label","Przewodnik po usługach");
  panel.hidden=true;
  const header=document.createElement("div");header.className="chat-header";
  const title=document.createElement("strong");title.textContent="Wybierz właściwą pomoc";
  const close=document.createElement("button");close.className="chat-close";close.type="button";
  close.textContent="×";close.setAttribute("aria-label","Zamknij przewodnik");
  header.append(title,close);
  const content=document.createElement("div");content.className="chat-content";
  const intro=document.createElement("p");intro.className="chat-intro";
  intro.textContent="Automatyczny przewodnik, nie czat na żywo. Nie wpisujesz tu danych osobowych — wybierz temat i etap sprawy.";
  const label=document.createElement("strong");label.className="chat-choose-label";label.textContent="1. Czego dotyczy Twoja sprawa?";
  const buttons=document.createElement("div");buttons.className="chat-choices";
  const reply=document.createElement("div");reply.className="chat-reply";reply.setAttribute("aria-live","polite");
  content.append(intro,label,buttons,reply);
  const actions=document.createElement("div");actions.className="chat-actions";
  const phone=document.createElement("a");phone.href="tel:+48796441345";phone.textContent="☎ Zadzwoń: 796 441 345";
  const contact=document.createElement("a");contact.href=base+"kontakt.html#formularz";contact.textContent="✉ Zostaw kontakt";
  actions.append(phone,contact);
  panel.append(header,content,actions);
  root.append(toggle,panel);
  document.body.append(root);
  const setOpen=(open,focus=true)=>{
    panel.hidden=!open;root.classList.toggle("is-open",open);
    toggle.setAttribute("aria-expanded",String(open));
    if(focus){if(open)close.focus();else toggle.focus();}
  };
  toggle.addEventListener("click",()=>setOpen(panel.hidden));
  close.addEventListener("click",()=>setOpen(false));
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!panel.hidden)setOpen(false);});
  document.addEventListener("pointerdown",e=>{if(!panel.hidden&&!root.contains(e.target))setOpen(false,false);});
  const mk=(tag,className,text)=>{
    const el=document.createElement(tag);if(className)el.className=className;
    if(text)el.textContent=text;return el;
  };
  const destination=topic=>base+(topic.form||"?usluga="+encodeURIComponent(topic.alias||topic.key)+
    "&utm_source=strona&utm_medium=chatbot&utm_campaign=wybor_uslugi#kontakt");
  const choose=topic=>{
    for(const b of buttons.querySelectorAll("button"))b.setAttribute("aria-pressed",String(b.dataset.topic===topic.key));
    reply.replaceChildren();
    const heading=mk("h3","chat-reply-title",topic.name);
    const summary=mk("p","chat-topic-intro",topic.intro);
    const prompt=mk("strong","chat-followup-title","2. Na jakim etapie jesteś?");
    const stages=mk("div","chat-stage-choices");
    const answer=mk("p","chat-stage-answer","Wybierz sytuację, aby zobaczyć ogólną wskazówkę.");
    answer.setAttribute("role","status");
    for(const [question,text] of topic.stages){
      const btn=mk("button","chat-stage-choice",question);btn.type="button";
      btn.setAttribute("aria-pressed","false");
      btn.addEventListener("click",()=>{
        for(const item of stages.querySelectorAll("button"))item.setAttribute("aria-pressed",String(item===btn));
        answer.textContent=text;
        answer.scrollIntoView({block:"nearest",behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
      });
      stages.append(btn);
    }
    const links=mk("div","chat-reply-links");
    const form=mk("a","chat-reply-contact","Zostaw kontakt ↗");form.href=destination(topic);
    const details=mk("a","chat-reply-detail","Przeczytaj o usłudze");details.href=base+"uslugi/"+topic.service;
    const checklist=mk("a","chat-reply-checklist","Lista kroków przed rozmową");checklist.href=base+"poradniki/"+topic.checklist;
    links.append(form,details,checklist);
    const caution=mk("small","chat-caution","Wybór odpowiedzi w tym przewodniku niczego nie wysyła. Wskazówki nie zastępują analizy dokumentów ani nie gwarantują wyniku.");
    reply.append(heading,summary,prompt,stages,answer,links,caution);
    phone.href="tel:"+topic.tel;phone.textContent="☎ Zadzwoń: "+topic.phone;
    contact.href=destination(topic);contact.textContent="✉ Zostaw kontakt";
  };
  for(const topic of topics){
    const btn=mk("button",topics.indexOf(topic)<2?"chat-choice-featured":"",topic.name);
    btn.type="button";btn.dataset.topic=topic.key;
    btn.setAttribute("aria-pressed","false");
    btn.title=topic.short;
    btn.addEventListener("click",()=>choose(topic));
    buttons.append(btn);
  }
  const url=window.location.pathname;
  if(url.includes("swiadczenie-wspierajace"))choose(topics[0]);
  else if(url.includes("szkody-gornicze"))choose(topics[1]);
  // On narrow screens, the form should remain unobstructed while the assistant is closed.
  const contactArea=document.getElementById("formularz")||document.getElementById("kontakt");
  const videoArea=document.getElementById("filmy");
  for(const [target,className] of [[contactArea,"is-contact-area"],[videoArea,"is-video-area"]]){
    if(!target||!("IntersectionObserver" in window))continue;
    const observer=new IntersectionObserver(entries=>{
      root.classList.toggle(className,Boolean(entries[0]?.isIntersecting));
    },{threshold:0,rootMargin:"0px 0px -50px 0px"});
    observer.observe(target);
  }
})();
