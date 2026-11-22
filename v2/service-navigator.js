/* Twoja Sprawa — bezpłatny, dwuetapowy przewodnik po usługach.
   Żadne wpisane dane nie są zapisywane ani wysyłane przez przewodnik.
   Do formularza trafiają jedynie: rodzaj sprawy, wybrany kod etapu i legalne UTM. */
(()=>{
 "use strict";
 const root=document.querySelector("#dobierz-pomoc");
 if(!root)return;
 // A deep link to a closed <details> should reveal its content, not merely scroll
 // to an unusable panel. Keep the native disclosure semantics and keyboard access.
 const openFromAnchor=()=>{
  if(window.location?.hash==="#dobierz-pomoc")root.open=true;
 };
 for(const link of document.querySelectorAll?.('a[href="#dobierz-pomoc"]')||[]){
  link.addEventListener("click",()=>{root.open=true;});
 }
 window.addEventListener?.("hashchange",openFromAnchor);
 openFromAnchor();
 const result=root.querySelector("#navigator-result");
 if(!result)return;
 const items={
  szkody:{
   title:"Szkody górnicze",short:"Lubin, Polkowice i okolice",
   desc:"Pęknięcia i nierówności mogą mieć wiele przyczyn. Na początek warto zanotować, kiedy pojawiły się uszkodzenia, i przygotować zdjęcia.",
   service:"szkody-gornicze.html",landing:"kampanie/szkody-gornicze.html",phone:"796 441 345",tel:"+48796441345",
   stages:[
    ["Dopiero zauważyłem/am uszkodzenia","uszkodzenia","Zachowaj zdjęcia z bliska i z szerszej perspektywy. Zanotuj przybliżoną datę zauważenia szkody."],
    ["Szkodę zgłosiłem/am do kopalni","zgloszona","Zachowaj zgłoszenie, potwierdzenie jego wysłania i odpowiedzi przedsiębiorcy."],
    ["Otrzymałem/am propozycję ugody","ugoda","Przed decyzją sprawdź zakres szkód objętych ugodą oraz skutki jej podpisania."],
    ["Otrzymałem/am odmowę","odmowa","Zachowaj pismo odmowne i dokumentację uszkodzeń. Warto sprawdzić powody odmowy."]
   ]
  },
  swiadczenie:{
   title:"Świadczenie wspierające",short:"WZON • ZUS • cała Polska",
   desc:"Kluczowy jest etap postępowania przed WZON i ZUS. Nie podawaj w formularzu diagnoz ani dokumentacji medycznej.",
   service:"swiadczenie-wspierajace.html",landing:"kampanie/swiadczenie-wspierajace.html",phone:"500 171 531",tel:"+48500171531",
   stages:[
    ["Dopiero planuję wniosek do WZON","wniosek","Sprawdź sposób złożenia wniosku i przygotuj podstawowe informacje o codziennym funkcjonowaniu."],
    ["Czekam na decyzję WZON","oczekiwanie","Zachowaj potwierdzenie zgłoszenia i korespondencję. Po doręczeniu decyzji zanotuj datę."],
    ["Mam decyzję WZON","decyzja","Sprawdź ustaloną liczbę punktów oraz pouczenie i datę doręczenia decyzji."],
    ["Moja sprawa jest w ZUS","zus","Sprawdź datę złożenia wniosku i otrzymane pisma. Okres wypłaty zależy od ustawowych warunków."],
    ["Chcę sprawdzić odwołanie","odwolanie","Zachowaj decyzję, pouczenie i dokładną datę doręczenia. Terminy należy ustalać indywidualnie."]
   ]
  },
  renty:{
   title:"Renty powypadkowe",short:"Wstępna analiza dokumentów",
   desc:"Można sprawdzić dotychczasową rentę, zmianę potrzeb i utratę możliwości zarobkowych. Znaczenie ma umowa, dotychczasowe rozliczenia i dokumenty.",
   service:"renty-powypadkowe.html",landing:"kampanie/renty-powypadkowe.html",phone:"500 171 531",tel:"+48500171531",
   stages:[
    ["Nie mam jeszcze ustalonej renty","nowa","Zanotuj datę wypadku, posiadane decyzje i to, czy zgłoszono już roszczenie do ubezpieczyciela."],
    ["Chcę sprawdzić podwyższenie","podwyzszenie","Zachowaj dokumenty o obecnej wysokości renty i zanotuj zmiany kosztów, potrzeb lub możliwości zarobkowania."],
    ["Otrzymałem/am odmowę","odmowa","Zachowaj decyzję odmowną, uzasadnienie, korespondencję i datę doręczenia."],
    ["Otrzymałem/am propozycję ugody","ugoda","Przed podpisaniem sprawdź zakres ugody, rozliczenie renty i wpływ na dalsze roszczenia."]
   ]
  },
  skd:{
   title:"Sankcja Kredytu Darmowego (SKD)",short:"Sprawdzenie umowy",
   desc:"Wyślij kopię umowy kredytowej na wojciech.obieglo@votum-ds.pl i zostaw numer telefonu. Możesz przesłać pełną umowę bez zasłaniania danych. Zastosowanie SKD wymaga indywidualnej analizy i oceny terminów.",
   service:"kredyty-pln.html",landing:"kampanie/skd.html",phone:"796 441 345",tel:"+48796441345",
   stages:[
    ["Nadal spłacam kredyt","splata","Zachowaj pełną umowę, aneksy, harmonogram i informacje o ponoszonych kosztach kredytu."],
    ["Kredyt został spłacony","splacony","Przygotuj datę całkowitej spłaty i historię rozliczeń. Możliwe terminy należy ocenić indywidualnie."],
    ["Spłaciłem/am kredyt przed terminem","wczesniejsza","Zachowaj potwierdzenie wcześniejszej spłaty oraz zestawienie pobranych kosztów i prowizji."],
    ["Kredytodawca odmówił uznania SKD","odmowa","Zachowaj odpowiedź kredytodawcy i dowód doręczenia wcześniejszego oświadczenia, jeśli zostało złożone."]
   ]
  },
  franki:{
   title:"Pomoc frankowiczom — kredyty CHF",short:"Aktywny lub spłacony kredyt frankowy",
   desc:"Umowy kredytów CHF można sprawdzić pod kątem zasad przeliczania, rozliczeń oraz ewentualnych ugód. Zakres roszczeń ustala się indywidualnie.",
   service:"kredyty-frankowe.html",phone:"796 441 345",tel:"+48796441345"
  },
  przesyl:{
   title:"Służebność przesyłu",short:"Urządzenia na działce",
   desc:"Przygotuj podstawowe informacje o działce i urządzeniach oraz posiadane dokumenty dotyczące korzystania z gruntu.",
   service:"sluzebnosc-przesylu.html",phone:"796 441 345",tel:"+48796441345"
  }
 };
 const sourceAllowed=new Set(["facebook","instagram","tiktok","google","chatgpt.com","perplexity.ai","claude.ai","gemini.google.com","copilot.microsoft.com","grok.com","ulotka","plakat","qr","polecenie","organiczne","strona","inne","broszura"]);
 const incoming=new URLSearchParams(window.location.search);
 const inferredAIReferrer=(()=>{
  try {
    const host=new URL(document.referrer).hostname.toLowerCase();
    // Exact hostname matching: never infer visits from lookalikes or arbitrary URLs.
    const trusted={
      // Google references are a generic source, not proof of Search vs Maps or paid vs organic.
      "google.com":"google","www.google.com":"google","google.pl":"google","www.google.pl":"google","maps.google.com":"google","maps.google.pl":"google",
      // Recognize only exact social-platform hosts, never a specific post or account.
      "facebook.com":"facebook",
      "www.facebook.com":"facebook",
      "m.facebook.com":"facebook",
      "l.facebook.com":"facebook",
      "lm.facebook.com":"facebook",
      "web.facebook.com":"facebook",
      "instagram.com":"instagram",
      "www.instagram.com":"instagram",
      "l.instagram.com":"instagram",
      "tiktok.com":"tiktok",
      "www.tiktok.com":"tiktok",
      "vm.tiktok.com":"tiktok",
      "vt.tiktok.com":"tiktok",
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
 const safe=v=>/^[a-z0-9_-]{1,40}$/.test(v);
 const source=(incoming.get("utm_source")||"").toLowerCase().trim();
 const tracking={
  utm_source:sourceAllowed.has(source)?source:(!source&&inferredAIReferrer?inferredAIReferrer:"strona"),
  utm_medium:"wybor_na_stronie",
  utm_campaign:"wybor_uslugi"
 };
 for(const field of ["utm_medium","utm_campaign","utm_content"]){
  const val=(incoming.get(field)||"").toLowerCase().trim();
  if(safe(val))tracking[field]=val;
 }
 const releasePath=url=>window.location.pathname.startsWith("/"+"v2/")?url.pathname:url.pathname.replace(/\.html$/,"");
 const createLink=(path,key,stage="")=>{
  const url=new URL("/v2/"+path,window.location.origin);
  for(const [name,value] of Object.entries(tracking))url.searchParams.set(name,value);
  url.searchParams.set("lead_path","navigator");
  if(!items[key].landing)url.searchParams.set("usluga",key);
  if(stage)url.searchParams.set("etap",stage);
  url.hash="formularz";
  return releasePath(url)+url.search+url.hash;
 };
 const planLink=(key,stage="")=>{
  const url=new URL("/v2/plan-dzialania.html",window.location.origin);
  url.searchParams.set("usluga",key);
  if(stage)url.searchParams.set("etap",stage);
  for(const [name,value] of Object.entries(tracking))url.searchParams.set(name,value);
  return releasePath(url)+url.search;
 };
 const element=(tag,className,content)=>{
  const node=document.createElement(tag);
  if(className)node.className=className;
  if(content)node.textContent=content;
  return node;
 };
 const buttons=[...root.querySelectorAll("[data-navigator]")];
 const choose=key=>{
  const data=items[key];
  if(!data)return;
  buttons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.navigator===key)));
  const heading=element("h3","navigator-result-title",data.title);
  const eyebrow=element("small","navigator-result-kicker",data.short);
  const description=element("p","navigator-result-description",data.desc);
  const tip=element("p","navigator-stage-tip","Wybrany etap pomaga przygotować dalszą rozmowę. Nie jest oceną uprawnienia do świadczenia ani odszkodowania.");
  const contact=element("a","btn navigator-contact-cta","Przejdź do krótkiego formularza");
  const details=element("a","btn secondary","Poznaj szczegóły usługi");
  details.href=releasePath(new URL("/v2/uslugi/"+data.service,window.location.origin));
  const call=element("a","navigator-direct-phone","Zadzwoń: "+data.phone);
  call.href="tel:"+data.tel;
  const plan=element("a","btn secondary navigator-plan-cta","Przygotuj plan do druku");
  plan.href=planLink(key);
  const actions=element("div","navigator-result-actions");
  actions.append(contact,plan,details);
  const stageGroup=element("div","navigator-stage-group");
  if(data.stages){
   const prompt=element("p","navigator-stage-title","Na jakim etapie jest Twoja sprawa?");
   stageGroup.append(prompt);
   const options=element("div","navigator-stage-options");
   const stageButtons=[];
   for(const [label,code,note] of data.stages){
    const b=element("button","navigator-stage-choice",label);
    b.type="button";
    b.dataset.stage=code;
    b.setAttribute("aria-pressed","false");
    b.addEventListener("click",()=>{
     stageButtons.forEach(other=>other.setAttribute("aria-pressed",String(other===b)));
     tip.textContent=note;
     contact.href=createLink(data.landing||"kontakt.html",key,code);
     contact.textContent="Przejdź do formularza z wybranym etapem";
     plan.href=planLink(key,code);
    });
    stageButtons.push(b);
    options.append(b);
   }
   stageGroup.append(options);
  }else{
   tip.textContent="Na początek wystarczy podać temat sprawy i sposób kontaktu. Dokumenty można omówić później.";
  }
  contact.href=createLink(data.landing||"kontakt.html",key);
  const note=element("small","navigator-privacy-note","Bez zapisywania danych w tym przewodniku. Nie podawaj PESEL ani informacji o zdrowiu.");
  result.replaceChildren(eyebrow,heading,description,stageGroup,tip,actions,call,note);
  if(window.matchMedia("(max-width:760px)").matches){
   requestAnimationFrame(()=>result.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"nearest"}));
  }
 };
 for(const button of buttons)button.addEventListener("click",()=>choose(button.dataset.navigator));
})();