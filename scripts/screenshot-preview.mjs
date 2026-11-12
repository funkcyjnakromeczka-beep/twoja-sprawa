#!/usr/bin/env node
/** Free local-site Chromium QA and screenshots; no lead submissions, no TinyFish. */
import {spawn} from "node:child_process";
import {mkdir} from "node:fs/promises";
import {chromium} from "playwright";
const origin="http://127.0.0.1:4173";
const server=spawn("python3",["-m","http.server","4173","--bind","127.0.0.1","--directory","dist-preview"],{stdio:"ignore"});
const wait=async()=>{
 for(let i=0;i<70;i++){
  try{const response=await fetch(origin+"/");if(response.ok)return;}catch{}
  await new Promise(resolve=>setTimeout(resolve,200));
 }
 throw Error("Preview server unavailable");
};
let browser;
const checks=[];
try{
 await wait();
 await mkdir("screenshots",{recursive:true});
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const pages=[
  ["telefon-360","/",360,800],
  ["telefon-390","/",390,844],
  ["tablet-768","/",768,1024],
  ["desktop-1440","/",1440,900],
  ["ulotka-start-telefon","/start.html",390,844],
  ["ulotka-start-desktop","/start.html",1440,900],
  ["kampania-szkody-telefon","/kampanie/szkody-gornicze.html",390,844],
  ["kampania-swiadczenie-telefon","/kampanie/swiadczenie-wspierajace.html",390,844],
  ["kampania-skd-telefon","/kampanie/skd.html",390,844],
  ["kampania-skd-desktop","/kampanie/skd.html",1440,900],
  ["generator-linkow-telefon","/narzedzia/linki-kampanii.html",390,844],
  ["usluga-szkody-telefon","/uslugi/szkody-gornicze.html",390,844],
  ["usluga-swiadczenie-telefon","/uslugi/swiadczenie-wspierajace.html",390,844],
  ["usluga-frankowicze-telefon","/uslugi/kredyty-frankowe.html",390,844],
  ["usluga-frankowicze-desktop","/uslugi/kredyty-frankowe.html",1440,900],
  ["checklista-frankowicze-telefon","/poradniki/frankowicze-lista-kontrolna.html",390,844],
  ["checklista-skd-telefon","/poradniki/skd-kredyt-pln-lista-kontrolna.html",390,844],
  ["poradnik-telefon","/poradniki/checklista-szkody-gorniczej.html",390,844],
  ["zespol-o-nas-telefon","/o-nas.html",390,844],
  ["kontakt-telefon","/kontakt.html",390,844],
  ["biblioteka-telefon","/wiedza/",390,844],
  ["biblioteka-desktop","/wiedza/",1440,900],
  ["plan-telefon","/plan-dzialania.html",390,844],
  ["plan-desktop","/plan-dzialania.html",1440,900],
  ["faq-telefon","/faq.html",390,844],
  ["faq-desktop","/faq.html",1440,900],
  ["wyszukiwarka-telefon","/szukaj.html",390,844],
  ["wyszukiwarka-desktop","/szukaj.html",1440,900],
  ["wiedza-szkody-telefon","/wiedza/drobne-pekniecia-szkody-gornicze.html",390,844],
  ["wiedza-swiadczenie-telefon","/wiedza/swiadczenie-wspierajace-2026-wzon-zus.html",390,844],
  ["blad-404-telefon","/404.html",390,844]
 ];
 for(const [name,path,width,height] of pages){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  const response=await page.goto(origin+path,{waitUntil:"domcontentloaded",timeout:30000});
  if(!response?.ok())throw Error("HTTP error on "+path);
  const logo=page.locator(".network-brand-bar");
  await logo.waitFor({state:"visible",timeout:10000});
  // Prioritise the real logos, but text fallbacks must remain legible on slow/offline devices.
  await page.waitForFunction(()=>[...document.querySelectorAll(".network-brand-logos img")].every(img=>img.complete&&img.naturalWidth>0),undefined,{timeout:5000}).catch(()=>{});
  // Lazy-loaded portraits may be below the fold. Ensure the browser requests them
  // before measuring image status; full-page screenshots alone are not a loading signal.
  await page.evaluate(()=>{
    for(const img of document.querySelectorAll(".team-spotlight img,.team-portrait-grid img,.service-persona img,.campaign-persona img,.contact-specialist-photo img")){
      img.loading="eager";
    }
  });
  await page.waitForFunction(()=>{
    const portraits=[...document.querySelectorAll(".team-spotlight img,.team-portrait-grid img,.service-persona img,.campaign-persona img,.contact-specialist-photo img")];
    return portraits.every(img=>img.complete&&img.naturalWidth>0);
  },undefined,{timeout:15000}).catch(()=>{});

  await page.screenshot({path:"screenshots/"+name+".png",fullPage:true,animations:"disabled"});
  const measured=await page.evaluate(()=>{
    const bar=document.querySelector(".network-brand-bar");
    const imgs=[...document.querySelectorAll(".network-brand-logos img")];
    return{
      viewport:document.documentElement.clientWidth,
      scrollWidth:document.documentElement.scrollWidth,
      barCount:document.querySelectorAll(".network-brand-bar").length,
      images:imgs.map(x=>({
        alt:x.alt,loaded:x.complete&&x.naturalWidth>0,
        fallbackVisible:getComputedStyle(x.parentElement.querySelector(".network-brand-fallback")).visibility==="visible",
        logoVisible:getComputedStyle(x).visibility==="visible"
      })),
      sticky:getComputedStyle(bar).position==="sticky",
      oldDuplicate:document.querySelectorAll(".agency-logos-bar").length,
      hasMain:!!document.querySelector("main"),
      hasForm:!!document.querySelector(".contact-form"),
      formChoice:document.querySelector(".contact-form select")?.value||"",
      teamImages:[...document.querySelectorAll(".team-spotlight img,.team-portrait-grid img")].map(img=>({alt:img.alt,loaded:img.complete&&img.naturalWidth>0})),
      personaImages:[...document.querySelectorAll(".service-persona img,.campaign-persona img,.contact-specialist-photo img")].map(img=>({alt:img.alt,loaded:img.complete&&img.naturalWidth>0})),
      documentHeight:document.documentElement.scrollHeight
    };
  });
  if(measured.scrollWidth>measured.viewport+2)throw Error("Horizontal overflow "+name+": "+JSON.stringify(measured));
  if(["/","/o-nas.html"].includes(path)&&(measured.teamImages.length!==2||measured.teamImages.some(img=>!img.loaded)))throw Error("Two authentic profile images not loaded on "+path+": "+JSON.stringify(measured));
  if(["/uslugi/szkody-gornicze.html","/uslugi/swiadczenie-wspierajace.html","/kampanie/szkody-gornicze.html","/kampanie/swiadczenie-wspierajace.html","/kampanie/skd.html"].includes(path)&&(measured.personaImages.length!==1||!measured.personaImages[0].loaded))throw Error("Contact portrait not loaded on "+path+": "+JSON.stringify(measured));
  if(path==="/kontakt.html"&&(measured.personaImages.length!==2||measured.personaImages.some(x=>!x.loaded)))throw Error("Both contact portraits missing "+name+": "+JSON.stringify(measured));
  if(measured.barCount!==1||measured.images.length!==2||!measured.sticky||measured.oldDuplicate)throw Error("Partner logo bar failed "+name+": "+JSON.stringify(measured));
  if(measured.images[0].alt!=="Votum Network"||measured.images[1].alt!=="Votum Scale Agency")throw Error("Wrong logos "+name);
  if(measured.images.some(img=>!(img.loaded&&img.logoVisible)&&!img.fallbackVisible))throw Error("Logo and fallback both invisible "+name);
  if(["/","/kampanie/szkody-gornicze.html","/kampanie/swiadczenie-wspierajace.html","/kampanie/skd.html","/uslugi/szkody-gornicze.html","/uslugi/swiadczenie-wspierajace.html"].includes(path)&&!measured.hasForm)throw Error("Lead form missing "+name);
  if(measured.documentHeight>height+200){
    await page.evaluate(()=>window.scrollTo(0,600));
    await page.waitForTimeout(140);
    const top=await logo.evaluate(el=>el.getBoundingClientRect().top);
    if(Math.abs(top)>2)throw Error("Partner strip not sticky after scroll: "+name+" top "+top);
  }
  if(path==="/"&&width<=650){
    // Earlier sticky-header test scrolls 600px; restore the initial viewport first.
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.waitForTimeout(180);
    const headerGeometry=await page.evaluate(()=>{
      const mark=document.querySelector(".network-brand-bar")?.getBoundingClientRect();
      const head=document.querySelector(".site-header")?.getBoundingClientRect();
      const bot=document.querySelector(".chat-assistant");
      return {gap:Math.round((head?.top??0)-(mark?.bottom??0)),
        headerPosition:getComputedStyle(document.querySelector(".site-header")).position,
        idleChatVisible:bot?getComputedStyle(bot).visibility!=="hidden":false,
        heroIntersecting:!!document.querySelector(".chat-assistant.is-hero-area")};
    });
    if(Math.abs(headerGeometry.gap)>3)throw Error("Mobile homepage has blank spacer under network logos: "+JSON.stringify(headerGeometry));
    if(headerGeometry.heroIntersecting&&headerGeometry.idleChatVisible)throw Error("Mobile idle chat obstructs hero CTAs: "+JSON.stringify(headerGeometry));
    console.log("MOBILE_HERO_REFINEMENT_OK",JSON.stringify(headerGeometry));
  }
  if(path==="/kampanie/swiadczenie-wspierajace.html"){
    const logoStatus=await page.locator(".vws-service-brand").evaluate(card=>{
      const img=card.querySelector("img");
      const visibleText=card.querySelector("strong");
      return {loaded:img?.complete&&img.naturalWidth>0,
        imageHidden:img?.hidden, imageDisplay:img?getComputedStyle(img).display:null,
        cardHeight:Math.round(card.getBoundingClientRect().height),
        visibleText:!!visibleText&&getComputedStyle(visibleText).display!=="none"};
    });
    if(!logoStatus.loaded && (!logoStatus.imageHidden||logoStatus.imageDisplay!=="none"||!logoStatus.visibleText||logoStatus.cardHeight>120))
      throw Error("Unavailable logo should have compact text fallback: "+JSON.stringify(logoStatus));
    console.log("SUPPORT_LOGO_FALLBACK_OK",JSON.stringify(logoStatus));
  }
  if(width<=650&&["/uslugi/szkody-gornicze.html","/uslugi/swiadczenie-wspierajace.html"].includes(path)){
    const quick=page.locator(".mobile-service-cta");
    if(!await quick.isVisible())throw Error("Mobile contact bar not visible: "+path);
    const call=await quick.locator(".mobile-service-call").getAttribute("href");
    const wanted=path.includes("swiadczenie")?"tel:+48500171531":"tel:+48796441345";
    if(call!==wanted)throw Error("Wrong service contact number on "+path+": "+call);
    const rect=await page.evaluate(()=>{
      const a=document.querySelector(".chat-assistant .chat-toggle")?.getBoundingClientRect();
      const b=document.querySelector(".mobile-service-cta")?.getBoundingClientRect();
      return {chatBottom:a?.bottom,barTop:b?.top};
    });
    if(!rect.chatBottom||!rect.barTop||rect.chatBottom>rect.barTop+2)throw Error("Mobile CTA overlaps chatbot: "+JSON.stringify(rect));
    await quick.locator(".mobile-service-lead").click();
    await page.locator("#formularz").scrollIntoViewIfNeeded();
    await quick.waitFor({state:"hidden",timeout:6000});
    console.log("MOBILE_CTA_UI_OK",JSON.stringify({path,phone:call,overlap:false,hiddenNearForm:true}));
  }
  if(path.includes("swiadczenie-wspierajace")&&path.startsWith("/uslugi/")){
    const brand=await page.locator(".vws-service-brand img").evaluate(img=>({loaded:img.complete&&img.naturalWidth>0,width:img.getBoundingClientRect().width}));
    if(!brand.loaded||brand.width<200)throw Error("Votum Wsparcie logo should be visible and at least 200px: "+JSON.stringify(brand));
    console.log("VOTUM_WSPARCIE_LOGO_OK",JSON.stringify(brand));
  }
  if(["/poradniki/skd-kredyt-pln-lista-kontrolna.html","/poradniki/frankowicze-lista-kontrolna.html","/"].includes(path)){
    const selector=path==="/"?'.contact-form .check':'.interactive-checklist .checklist-item span';
    const contrast=await page.locator(selector).first().evaluate(el=>{
     const rgb=value=>{const m=value.match(/rgba?\(([^)]+)\)/);return m?m[1].split(",").slice(0,3).map(v=>Number(v.trim())):null;};
     const lin=c=>{const x=c/255;return x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4)};
     const lum=c=>.2126*lin(c[0])+.7152*lin(c[1])+.0722*lin(c[2]);
     const fg=rgb(getComputedStyle(el).color);
     let node=el,bg=null;
     while(node&&!bg){const x=getComputedStyle(node).backgroundColor;if(x&&!x.includes("0, 0, 0, 0")&&!x.includes("0,0,0,0")&&!x.includes("transparent"))bg=rgb(x);node=node.parentElement;}
     bg=bg||[255,255,255];
     const a=lum(fg),b=lum(bg);
     return {ratio:Math.round((Math.max(a,b)+.05)/(Math.min(a,b)+.05)*100)/100,foreground:fg,background:bg};
    });
    if(contrast.ratio<4.5)throw Error("Checklist/form contrast below WCAG 4.5: "+JSON.stringify({path,contrast}));
    console.log("TEXT_CONTRAST_OK",JSON.stringify({path,...contrast}));
  }
  console.log("VISUAL_OK",name,JSON.stringify(measured));
  checks.push({name,...measured});
  await page.close();
 }
 // Leaflet entrypoint: no extra form, direct choice to two existing qualified forms.
 const flyerPage=await browser.newPage({viewport:{width:390,height:844}});
 await flyerPage.goto(origin+"/start.html",{waitUntil:"domcontentloaded"});
 if(await flyerPage.locator(".leaflet-option").count()!==2)throw Error("Leaflet page must show exactly two flagship paths");
 if(await flyerPage.locator('[data-contact-form]').count())throw Error("Leaflet page must not duplicate the lead form");
 for(const [card,service,contact] of [
  [".leaflet-option-support","swiadczenie-wspierajace","Świadczenie wspierające"],
  [".leaflet-option-mining","szkody-gornicze","Szkody górnicze"]
 ]){
  await flyerPage.goto(origin+"/start.html",{waitUntil:"domcontentloaded"});
  await flyerPage.locator(card+" .leaflet-main-btn").click();
  await flyerPage.waitForURL(new RegExp("/kampanie/"+service+"\\.html"));
  const value=await flyerPage.locator('.contact-form select[id^="cf-service-"]').inputValue();
  if(value!==contact)throw Error("Leaflet handoff must preselect contact form: "+service+" got "+value);
  const url=new URL(flyerPage.url());
  if(url.searchParams.get("utm_source")!=="ulotka"||url.searchParams.get("utm_medium")!=="druk"||url.hash!=="#formularz")throw Error("Leaflet attribution/form anchor missing: "+url.href);
 }
 console.log("LEAFLET_UI_OK: two flagship funnels, correct service in both forms, UTM ulotka/druk, no duplicate form");
 await flyerPage.close();
 // New homepage information architecture: services first, real disclosure after CTA.
 const clarityMobile=await browser.newPage({viewport:{width:390,height:844}});
 await clarityMobile.goto(origin+"/",{waitUntil:"domcontentloaded"});
 const positions=await clarityMobile.evaluate(()=>{
  const top=id=>{const el=document.querySelector(id);return el?.getBoundingClientRect().top+window.scrollY;};
  return {services:top("#uslugi"),team:top("#zespol"),contact:top("#kontakt")};
 });
 if(!(positions.services<positions.team&&positions.team<positions.contact))throw Error("Homepage sections out of expected order: "+JSON.stringify(positions));
 const disclosure=clarityMobile.locator("#dobierz-pomoc");
 if(await disclosure.evaluate(el=>el.open))throw Error("Homepage navigator initially should be compact");
 await clarityMobile.locator('a[href="#dobierz-pomoc"]').first().click();
 if(!await disclosure.evaluate(el=>el.open))throw Error("Anchor to navigator failed to open its details element");
 await clarityMobile.locator('[data-navigator="franki"]').click();
 const frankCTA=await clarityMobile.locator(".navigator-contact-cta").getAttribute("href");
 if(!frankCTA||!frankCTA.includes("usluga=franki"))throw Error("Frankowicze selection does not prefill appropriate contact: "+frankCTA);
 await clarityMobile.screenshot({path:"screenshots/home-clarity-navigator-mobile.png",fullPage:false,animations:"disabled"});
 await clarityMobile.close();
 const clarityDesktop=await browser.newPage({viewport:{width:1440,height:900}});
 await clarityDesktop.goto(origin+"/",{waitUntil:"domcontentloaded"});
 const gridGeometry=await clarityDesktop.locator("#uslugi .primary-services>.primary-card").evaluateAll(nodes=>nodes.map(el=>({top:Math.round(el.getBoundingClientRect().top),left:Math.round(el.getBoundingClientRect().left)})));
 if(gridGeometry.length!==6)throw Error("Expected 6 service cards, got "+gridGeometry.length);
 if(gridGeometry[0].top!==gridGeometry[1].top||gridGeometry[2].top<=gridGeometry[1].top||gridGeometry[3].top<=gridGeometry[2].top||gridGeometry.slice(3).some(el=>el.top!==gridGeometry[3].top))throw Error("2+1+3 homepage priority grid failed: "+JSON.stringify(gridGeometry));
 if(new Set(gridGeometry.slice(3).map(el=>el.left)).size!==3)throw Error("Three secondary services should occupy three columns");
 await clarityDesktop.screenshot({path:"screenshots/home-clarity-services-desktop.png",fullPage:false,animations:"disabled"});
 console.log("HOME_CLARITY_UI_OK",JSON.stringify({order:positions,franki:true,grid:6,layout:"2+1+3",skdThird:true}));

 // Performance cleanup: ensure the rendered home knowledge/FAQ cards retain
 // styling after dropping the unrelated article stylesheet.
 const homeStyleAudit=await clarityDesktop.evaluate(()=>{
  const editorial=document.querySelector(".editorial-reading");
  const hub=document.querySelector(".hub-all-link a");
  const faq=document.querySelector(".faq-explore-all a");
  return {
   stylesheetLinks:[...document.querySelectorAll('link[rel="stylesheet"]')].map(x=>x.getAttribute("href")),
   resources:performance.getEntriesByType("resource").filter(x=>x.name.includes("knowledge-articles.css")).length,
   editorialLayout:editorial?getComputedStyle(editorial).display:null,
   editorialColumns:editorial?getComputedStyle(editorial).gridTemplateColumns:null,
   hubButton:hub?getComputedStyle(hub).display:null,
   faqButton:faq?getComputedStyle(faq).display:null
  };
 });
 if(homeStyleAudit.stylesheetLinks.some(x=>x.includes("knowledge-articles.css"))||homeStyleAudit.resources)throw Error("Home still loads long-form article CSS: "+JSON.stringify(homeStyleAudit));
 if(homeStyleAudit.editorialLayout!=="grid"||!["inline-flex","flex"].includes(homeStyleAudit.hubButton)||!["inline-flex","flex"].includes(homeStyleAudit.faqButton))throw Error("Home editorial styling lost: "+JSON.stringify(homeStyleAudit));
 console.log("HOME_STYLE_BUDGET_OK",JSON.stringify(homeStyleAudit));


 // Ensure only the three secondary services are denser on phone screens.
 const serviceDensityPage=await browser.newPage({viewport:{width:390,height:844}});
 await serviceDensityPage.goto(origin+"/",{waitUntil:"domcontentloaded"});
 const cardDensity=await serviceDensityPage.locator("#uslugi .primary-services>.primary-card").evaluateAll(nodes=>nodes.map(node=>{
  const rect=node.getBoundingClientRect();
  const title=node.querySelector("h3")?.getBoundingClientRect();
  const action=node.querySelector(".more")?.getBoundingClientRect();
  const desc=node.querySelector("p");
  return {height:Math.round(rect.height),description:desc?getComputedStyle(desc).display:"",
   titleWithin:!!title&&title.bottom<=rect.bottom+2,actionWithin:!!action&&action.bottom<=rect.bottom+2};
 }));
 if(cardDensity.length!==6)throw Error("Mobile density should still show all six service cards");
 if(cardDensity.slice(0,3).some(x=>x.description==="none"))throw Error("One of the three flagship projects lost its description");
 if(cardDensity.slice(3).some(x=>x.description!=="none"||x.height>195||!x.titleWithin||!x.actionWithin)){
  throw Error("Secondary mobile cards are not compact and legible: "+JSON.stringify(cardDensity));
 }
 await serviceDensityPage.locator("#uslugi").screenshot({path:"screenshots/home-uslugi-zwarta-lista-telefon.png",animations:"disabled"});
 console.log("MOBILE_SERVICE_DENSITY_OK",JSON.stringify(cardDensity));
 // SKD must remain the third distinguished service and retain its full mobile summary.
 const ordered=await serviceDensityPage.locator("#uslugi .primary-services>.primary-card").evaluateAll(nodes=>nodes.map(node=>({href:node.getAttribute("href"),featured:node.classList.contains("skd-featured")})));
 if(!ordered[2]?.featured||!ordered[2].href.includes("/kampanie/skd.html"))throw Error("SKD third featured card must lead straight to the contact campaign: "+JSON.stringify(ordered));
 if(cardDensity[2].height<215)throw Error("SKD promoted card is too compact to display its full CTA");

 await serviceDensityPage.close();

 await clarityDesktop.close();
 // Playwright interaction verification: chatbot maps scenario to corresponding form.
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto(origin+"/uslugi/szkody-gornicze.html?utm_source=facebook&utm_medium=grupa&utm_campaign=lokalna",{waitUntil:"domcontentloaded"});
 await page.locator(".chat-toggle").click();
 await page.locator('[data-topic="szkody"]').click();
 await page.locator(".chat-stage-choice",{hasText:"Mam propozycję ugody"}).click();
 const href=await page.locator(".chat-reply-contact").getAttribute("href");
 const chosen=new URL(href,origin);
 if(chosen.searchParams.get("etap")!=="ugoda"||chosen.searchParams.get("utm_medium")!=="grupa"||chosen.searchParams.get("lead_path")!=="chatbot")throw Error("Chatbot conversion link lost case stage or campaign medium: "+href);
 await page.goto(origin+chosen.pathname+chosen.search,{waitUntil:"domcontentloaded"});
 const picked=await page.locator('.contact-form select[id^="cf-stage-"]').inputValue();
 if(picked!=="Otrzymałem/am propozycję ugody")throw Error("Form stage was not preselected: "+picked);
 console.log("FUNNEL_OK",JSON.stringify({url:chosen.pathname+chosen.search,stage:picked}));
 await page.close();

 // One-tap guidance for cracks vs uneven paving must reach distinct form choices.
 for(const [label,slug,expected] of [
  ["Widziałem niewielkie pęknięcia","sciany","Ściany i elewacja"],
  ["Kostka lub ogrodzenie są uszkodzone","kostka","Kostka i ogrodzenie"]
 ]){
  const guided=await browser.newPage({viewport:{width:390,height:844}});
  await guided.goto(origin+"/uslugi/szkody-gornicze.html?utm_source=ulotka&utm_medium=qr",{waitUntil:"domcontentloaded"});
  await guided.locator(".chat-toggle").click();
  await guided.locator('[data-topic="szkody"]').click();
  await guided.locator(".chat-stage-choice",{hasText:label}).click();
  const targetLink=await guided.locator(".chat-reply-contact").getAttribute("href");
  const url=new URL(targetLink,origin);
  if(url.searchParams.get("uszkodzenie")!==slug||url.searchParams.get("etap")!=="uszkodzenia")throw Error("Mining chatbot lost safe defect category: "+targetLink);
  await guided.goto(origin+url.pathname+url.search+url.hash,{waitUntil:"domcontentloaded"});
  const prefilled=await guided.locator('.contact-form select[id^="cf-damage-"]').inputValue();
  const stageFromChat=await guided.locator('.contact-form select[id^="cf-stage-"]').inputValue();
  if(prefilled!==expected||stageFromChat!=="Zauważyłem/am uszkodzenia")throw Error("Damage and stage not carried from chatbot: "+JSON.stringify({label,prefilled,stageFromChat}));
  console.log("MINING_CHAT_DAMAGE_OK",JSON.stringify({code:slug,choice:prefilled,stage:stageFromChat}));
  await guided.close();
 }

 // Verify that the standalone three-step guide really prepares the correct contact form.
 const guidePage=await browser.newPage({viewport:{width:390,height:844}});
 await guidePage.goto(origin+"/?utm_source=facebook&utm_medium=grupa&utm_campaign=szkody_lubin",{waitUntil:"domcontentloaded"});
 await guidePage.locator("#dobierz-pomoc > summary").click();
 await guidePage.locator('[data-navigator="szkody"]').click();
 await guidePage.locator('.navigator-stage-choice[data-stage="ugoda"]').click();
 const route=await guidePage.locator(".navigator-contact-cta").getAttribute("href");
 const selected=new URL(route,origin);
 if(selected.pathname!=="/kampanie/szkody-gornicze.html"||selected.searchParams.get("etap")!=="ugoda"||selected.searchParams.get("lead_path")!=="navigator"||selected.searchParams.get("utm_medium")!=="grupa")throw Error("Navigator did not pass safe stage and campaign context: "+route);
 await guidePage.locator("#dobierz-pomoc").screenshot({path:"screenshots/przewodnik-ugoda-telefon.png",animations:"disabled"});
 await guidePage.goto(origin+selected.pathname+selected.search+selected.hash,{waitUntil:"domcontentloaded"});
 const stageFromGuide=await guidePage.locator('.contact-form select[id^="cf-stage-"]').inputValue();
 if(stageFromGuide!=="Otrzymałem/am propozycję ugody")throw Error("Navigator stage not preselected in destination: "+stageFromGuide);
 const contextVisible=await guidePage.locator(".contact-context-notice").isVisible();
 if(!contextVisible)throw Error("Navigator stage confirmation missing in lead form");
 console.log("NAVIGATOR_OK",JSON.stringify({url:selected.pathname+selected.search,stage:stageFromGuide}));
 await guidePage.close();
 // Knowledge hub: category choice and a Polish text search must both work.
 const hubPage=await browser.newPage({viewport:{width:390,height:844}});
 await hubPage.goto(origin+"/wiedza/",{waitUntil:"domcontentloaded"});
 const allCount=await hubPage.locator(".hub-card:visible").count();
 if(allCount!==10)throw Error("Knowledge hub must show 10 articles, got "+allCount);
 await hubPage.locator('[data-hub-filter="szkody"]').click();
 const miningCount=await hubPage.locator(".hub-card:visible").count();
 if(miningCount!==3)throw Error("Knowledge category filter should show 3 mining articles, got "+miningCount);
 await hubPage.locator("#hub-search").fill("PEKNIECIA");
 const filtered=await hubPage.locator(".hub-card:visible").count();
 if(filtered<1||filtered>3)throw Error("Polish article search fails: "+filtered);
 await hubPage.locator("#hub-search").fill("niewystepujace_w_serwisie");
 if(!await hubPage.locator("#hub-empty").isVisible())throw Error("Knowledge hub no-results message missing");
 await hubPage.locator("[data-hub-reset]").click();
 if(await hubPage.locator(".hub-card:visible").count()!==10)throw Error("Reset search and filters should restore 10 articles");
 await hubPage.screenshot({path:"screenshots/biblioteka-filtr-telefon.png",fullPage:false,animations:"disabled"});
 console.log("KNOWLEDGE_HUB_OK",JSON.stringify({all:allCount,mining:miningCount,search:filtered,empty:true}));
 await hubPage.goto(origin+"/wiedza/drobne-pekniecia-szkody-gornicze.html",{waitUntil:"domcontentloaded"});
 const textButtons=hubPage.locator(".article-reading-tools button");
 if(await textButtons.count()!==3)throw Error("Article controls: expected 3 buttons");
 await textButtons.first().click();
 if(!await hubPage.locator("main article.article.reading-large").count())throw Error("Large text toggle did not work");
 await hubPage.screenshot({path:"screenshots/poradnik-duzy-tekst.png",fullPage:false,animations:"disabled"});
 await textButtons.first().click();
 if(await hubPage.locator("main article.article.reading-large").count())throw Error("Large text toggle did not reset");
 console.log("ARTICLE_ACCESSIBILITY_OK",JSON.stringify({controls:3,largeText:true,reset:true}));
 await hubPage.close();
 // First steps plan: prefilled mining settlement scenario, progress and form handoff.
 const planPage=await browser.newPage({viewport:{width:390,height:844}});
 await planPage.goto(origin+"/plan-dzialania.html?usluga=szkody&etap=ugoda&utm_source=facebook&utm_medium=grupa&utm_campaign=wybor",{waitUntil:"domcontentloaded"});
 if(await planPage.locator("[data-plan-title]").textContent()!=="Szkody górnicze")throw Error("Plan should start with mining topic");
 if(await planPage.locator("[data-plan-checklist] input").count()!==5)throw Error("Mining agreement plan should have five steps");
 await planPage.locator("[data-plan-checklist] input").first().check();
 if((await planPage.locator("[data-plan-progress]").textContent()).trim()!=="1 z 5")throw Error("Checklist progress incorrect");
 const planTarget=new URL(await planPage.locator("[data-plan-contact]").getAttribute("href"),origin);
 if(planTarget.pathname!=="/kontakt.html"||planTarget.searchParams.get("usluga")!=="szkody"||planTarget.searchParams.get("etap")!=="ugoda"||planTarget.searchParams.get("lead_path")!=="plan"||planTarget.searchParams.get("utm_medium")!=="grupa")throw Error("Plan handoff broken: "+planTarget);
 await planPage.screenshot({path:"screenshots/plan-szkody-ugoda-telefon.png",fullPage:true,animations:"disabled"});
 await planPage.goto(origin+planTarget.pathname+planTarget.search+planTarget.hash,{waitUntil:"domcontentloaded"});
 const planFormService=await planPage.locator('.contact-form select[id^="cf-service-"]').inputValue();
 const planFormStage=await planPage.locator('.contact-form select[id^="cf-stage-"]').inputValue();
 if(planFormService!=="Szkody górnicze"||planFormStage!=="Otrzymałem/am propozycję ugody")throw Error("Plan stage not prefilled in contact form");
 const planContextVisible=await planPage.locator(".contact-context-notice").isVisible();
 if(!planContextVisible)throw Error("Plan handoff not explained in form");
 console.log("ACTION_PLAN_OK",JSON.stringify({service:planFormService,stage:planFormStage,progress:"1 z 5",context:planContextVisible}));
 await planPage.close();
 // Searchable FAQ: ensure the Polish input, category deep link and reset work.
 const faqPage=await browser.newPage({viewport:{width:390,height:844}});
 await faqPage.goto(origin+"/faq.html?temat=szkody",{waitUntil:"domcontentloaded"});
 const faqInitial=await faqPage.locator(".faq-card:visible").count();
 if(faqInitial!==6)throw Error("Filtered mining FAQ must show six entries, got "+faqInitial);
 const preselected=await faqPage.locator('[data-faq-filter="szkody"]').getAttribute("aria-pressed");
 if(preselected!=="true")throw Error("Category deep link did not select mining");
 await faqPage.locator("#faq-search").fill("PEKNIECIE");
 const faqSearch=await faqPage.locator(".faq-card:visible").count();
 if(faqSearch!==1)throw Error("Polish diacritic search should match one FAQ about cracks: "+faqSearch);
 await faqPage.locator("#faq-search").fill("brak_odpowiedzi_123");
 if(!await faqPage.locator("[data-faq-empty]").isVisible())throw Error("FAQ missing no-results state");
 await faqPage.locator("[data-faq-reset]").click();
 if(await faqPage.locator(".faq-card:visible").count()!==24)throw Error("FAQ reset must show 24 entries");
 await faqPage.locator('[data-faq-filter="swiadczenie"]').click();
 if(await faqPage.locator(".faq-card:visible").count()!==6)throw Error("Support category should show six entries");
 await faqPage.screenshot({path:"screenshots/faq-swiadczenie-telefon.png",fullPage:false,animations:"disabled"});
 console.log("FAQ_UI_OK",JSON.stringify({total:24,mining:faqInitial,search:faqSearch,support:6}));
 await faqPage.close();
 // Global search — 62 local records and deep linking into the relevant expanded FAQ.
 const searchPage=await browser.newPage({viewport:{width:390,height:844}});
 await searchPage.goto(origin+"/szukaj.html?q=PEKNIECIE&temat=szkody",{waitUntil:"domcontentloaded"});
 const found=await searchPage.locator(".site-search-card").count();
 if(found<1)throw Error("Global search does not find crack-related content");
 const faqSearchResult=searchPage.locator('a.site-search-card[href*="/faq.html#pytanie-1-"]').first();
 if(await faqSearchResult.count()!==1)throw Error("Global search lacks question about facade cracks");
 const countLabel=await searchPage.locator("[data-search-count]").textContent();
 if(!countLabel.includes("Znaleziono:"))throw Error("Accessible search result status missing");
 await searchPage.screenshot({path:"screenshots/wyszukiwarka-pekniecia-telefon.png",fullPage:false,animations:"disabled"});
 await faqSearchResult.click();
 await searchPage.waitForURL(/faq\.html#pytanie-1-/);
 if(!await searchPage.locator('[id^="pytanie-1-"] details[open]').count())throw Error("Linked FAQ answer did not expand automatically");
 await searchPage.goto(origin+"/szukaj.html",{waitUntil:"domcontentloaded"});
 await searchPage.locator("#site-search-input").fill("WZON");
 await searchPage.locator('[data-search-category="swiadczenie"]').click();
 if(await searchPage.locator(".site-search-card").count()<1)throw Error("WZON search category should have matches");
 await searchPage.locator("[data-search-reset]").click();
 const afterReset=await searchPage.locator(".site-search-card").count();
 if(afterReset!==18)throw Error("Search reset should restore the first 18 cards: "+afterReset);
 console.log("GLOBAL_SEARCH_OK",JSON.stringify({sourceCount:62,cracks:found,faqDeepLink:true,wzon:true,reset:afterReset}));
 await searchPage.close();

 // Mining campaign: choosing an example should prepare the form, not submit a lead.
 const damagePage=await browser.newPage({viewport:{width:390,height:844}});
 await damagePage.goto(origin+"/kampanie/szkody-gornicze.html?utm_source=ulotka&utm_medium=qr",{waitUntil:"domcontentloaded"});
 const damageLinks=damagePage.locator(".campaign-damage-pick");
 if(await damageLinks.count()!==3)throw Error("Mining campaign quick selectors missing");
 await damageLinks.nth(1).click();
 const selectedDamage=await damagePage.locator('.contact-form select[id^="cf-damage-"]').inputValue();
 if(selectedDamage!=="Kostka i ogrodzenie")throw Error("Campaign category did not preselect damage type: "+selectedDamage);
 if(new URL(damagePage.url()).hash!=="#formularz")throw Error("Quick damage action did not scroll to lead form");
 const damageVisibility=await damagePage.locator(".contact-damage-area").isVisible();
 if(!damageVisibility)throw Error("Mining damage qualifier must be visible on campaign form");
 await damagePage.screenshot({path:"screenshots/szkody-szybki-wybor-telefon.png",fullPage:false,animations:"disabled"});

 const quickCities=damagePage.locator(".contact-city-options .contact-city-choice");
 if(await quickCities.count()!==2)throw Error("Mining form needs two optional city shortcuts");
 await quickCities.nth(1).click();
 const cityInput=damagePage.locator('.contact-form input[autocomplete="address-level2"]');
 if(await cityInput.inputValue()!=="Polkowice")throw Error("Polkowice quick city option did not fill location");
 if(await quickCities.nth(1).getAttribute("aria-pressed")!=="true")throw Error("Polkowice city shortcut not visibly selected");
 await cityInput.fill("Rudna");
 if(await quickCities.nth(1).getAttribute("aria-pressed")!=="false")throw Error("Manual city entry did not clear quick selection");
 await quickCities.nth(0).click();
 if(await cityInput.inputValue()!=="Lubin")throw Error("Mining city shortcut cannot be switched");
 console.log("MINING_CITY_QUICK_OK",JSON.stringify({twoChoices:true,lastCity:"Lubin",customTownAllowed:true,realMessagesSent:0}));
 console.log("MINING_DAMAGE_UI_OK",JSON.stringify({category:selectedDamage,atForm:true,visible:damageVisibility}));
 await damagePage.close();


 // Support campaign: one tap must preselect the WZON stage without sending a lead.
 const supportStagePage=await browser.newPage({viewport:{width:390,height:844}});
 await supportStagePage.goto(origin+"/kampanie/swiadczenie-wspierajace.html?utm_source=facebook&utm_medium=grupa",{waitUntil:"domcontentloaded"});
 const supportStageButtons=supportStagePage.locator(".campaign-stage-pick");
 if(await supportStageButtons.count()!==3)throw Error("Three WZON stage buttons must be visible");
 await supportStageButtons.nth(2).click();
 const supportStage=await supportStagePage.locator('.contact-form select[id^="cf-stage-"]').inputValue();
 if(supportStage!=="Mam decyzję WZON")throw Error("Support campaign did not preselect WZON decision stage: "+supportStage);
 if(new URL(supportStagePage.url()).hash!=="#formularz")throw Error("WZON stage picker must scroll to the form");
 if(!await supportStagePage.locator(".contact-stage").isVisible())throw Error("WZON stage field should be visible on campaign form");
 await supportStagePage.screenshot({path:"screenshots/swiadczenie-wybierz-etap-telefon.png",fullPage:false,animations:"disabled"});
 console.log("SUPPORT_STAGE_UI_OK",JSON.stringify({stage:supportStage,atForm:true}));
 await supportStagePage.close();

 // Homepage flagship shortcuts must work by keyboard/touch on a small phone.
 const flagshipPage=await browser.newPage({viewport:{width:390,height:844}});
 await flagshipPage.goto(origin+"/",{waitUntil:"domcontentloaded"});
 const miningShortcut=flagshipPage.locator('[data-contact-shortcut="szkody"]');
 const supportShortcut=flagshipPage.locator('[data-contact-shortcut="swiadczenie"]');
 const skdShortcut=flagshipPage.locator('[data-contact-shortcut="skd"]');
 if(await flagshipPage.locator("[data-contact-shortcut]").count()!==3)throw Error("Homepage should have three flagship shortcut buttons");
 await miningShortcut.click();
 let flagshipSelection=await flagshipPage.locator('.contact-form select[id^="cf-service-"]').inputValue();
 if(flagshipSelection!=="Szkody górnicze")throw Error("Home mining shortcut failed to select service");
 if(await miningShortcut.getAttribute("data-selected")!=="true")throw Error("Home mining shortcut not visibly selected");
 await supportShortcut.click();
 flagshipSelection=await flagshipPage.locator('.contact-form select[id^="cf-service-"]').inputValue();
 if(flagshipSelection!=="Świadczenie wspierające"){
   const state=await flagshipPage.evaluate(()=>({url:location.href,hash:location.hash,scrollY:scrollY,service:document.querySelector('#kontakt .contact-form select[id^="cf-service-"]')?.value,selected:[...document.querySelectorAll("[data-contact-shortcut]")].map(x=>({topic:x.getAttribute("data-contact-shortcut"),selected:x.getAttribute("data-selected")})),activeElement:document.activeElement?.id}));
   throw Error("Home support shortcut failed to select service: "+JSON.stringify(state));
 }
 if(await miningShortcut.getAttribute("data-selected")!=="false"||await supportShortcut.getAttribute("data-selected")!=="true")throw Error("Home shortcut state remains stale after switching");
 const message=await flagshipPage.locator("[data-contact-shortcut-status]").textContent();
 if(!message.includes("Świadczenie wspierające"))throw Error("Homepage shortcut selection lacks accessible feedback");
 await skdShortcut.click();
 flagshipSelection=await flagshipPage.locator('.contact-form select[id^="cf-service-"]').inputValue();
 if(flagshipSelection!=="Kredyt w PLN / SKD"){
  const state=await flagshipPage.evaluate(()=>({url:location.href,service:document.querySelector('#kontakt .contact-form select[id^="cf-service-"]')?.value,options:[...document.querySelector('#kontakt .contact-form select[id^="cf-service-"]')?.options||[]].map(o=>o.value),selected:[...document.querySelectorAll('[data-contact-shortcut]')].map(x=>({topic:x.getAttribute('data-contact-shortcut'),selected:x.getAttribute('data-selected')})),activeElement:document.activeElement?.outerHTML.slice(0,220),errors:document.querySelector('.contact-status-error')?.textContent}));
  throw Error("Home SKD shortcut failed: "+JSON.stringify(state));
 }
 if(await skdShortcut.getAttribute("data-selected")!=="true")throw Error("Home SKD shortcut not visibly selected");
 const skdPhoneRequired=await flagshipPage.locator('.contact-form input[type="tel"]').getAttribute("required");
 if(skdPhoneRequired===null)throw Error("SKD shortcut did not require callback phone");
 await flagshipPage.screenshot({path:"screenshots/home-trzy-wybory-formularz-telefon.png",fullPage:false,animations:"disabled"});
 console.log("HOME_SHORTCUT_UI_OK",JSON.stringify({choices:3,selection:flagshipSelection,callbackRequired:true,feedback:true}));
 await miningShortcut.click();
 const otherCityLink=flagshipPage.locator(".contact-city-other");
 if(!await otherCityLink.isVisible())throw Error("Manual location action should be visible on the mining form");
 await otherCityLink.click();
 const extraDetails=flagshipPage.locator(".contact-case-details");
 if(!await extraDetails.evaluate(el=>el.open))throw Error("Manual city action did not expand hidden homepage case details");
 const homeCity=flagshipPage.locator('.contact-form input[autocomplete="address-level2"]');
 if(!await homeCity.evaluate(el=>document.activeElement===el))throw Error("Manual town input did not receive focus");
 await homeCity.fill("Rudna");
 if(await flagshipPage.locator(".contact-city-choice[aria-pressed='true']").count()!==0)throw Error("Custom town incorrectly marked as Lubin/Polkowice");
 console.log("HOME_OTHER_TOWN_OK",JSON.stringify({expanded:true,focused:true,town:"Rudna",realMessagesSent:0}));
 await flagshipPage.close();


 // Compact homepage must show essential fields without duplicated contact summaries.
 const compactPage=await browser.newPage({viewport:{width:390,height:844}});
 await compactPage.goto(origin+"/?utm_source=facebook",{waitUntil:"domcontentloaded"});
 await compactPage.locator('[data-contact-shortcut="swiadczenie"]').click();
 if(await compactPage.locator('#kontakt .contact-benefits').isVisible())throw Error("Homepage duplicated benefit banners should be hidden");
 if(await compactPage.locator('#kontakt .contact-people').isVisible())throw Error("Homepage duplicated phone summary should be hidden");
 if(await compactPage.locator('#kontakt .contact-guide-box').isVisible())throw Error("Guidance should be behind the optional-details disclosure");
 if(!await compactPage.locator('#kontakt .contact-advisor').isVisible())throw Error("Correct specialist must remain visible");
 for(const field of ['.contact-form input[autocomplete="given-name"]','.contact-form input[autocomplete="tel"]','.contact-form input[autocomplete="email"]']){
  if(!await compactPage.locator(field).isVisible())throw Error("Essential lead field was hidden: "+field);
 }
 await compactPage.locator('#kontakt .contact-alternatives summary').click();
 if(!await compactPage.locator('#kontakt .contact-alternative-links a[href="tel:+48500171531"]').isVisible())throw Error("Optional phone fallback missing");
 await compactPage.locator('#kontakt .contact-case-details > summary').click();
 if(!await compactPage.locator('#kontakt .contact-guide-box').isVisible())throw Error("Checklist must be accessible in expanded details");
 console.log("HOME_COMPACT_LEAD_OK",JSON.stringify({essentialFields:3,duplicatePhoneHidden:true,guideOptional:true,alternativeContacts:true,leadsSent:0}));
 await compactPage.close();

 // Do not discard a partially completed lead when the visitor reads a checklist
 // or the privacy notice. Both resources must open in a separate browser tab.
 const preservedForm=await browser.newPage({viewport:{width:390,height:844}});
 await preservedForm.goto(origin+"/?utm_source=ulotka",{waitUntil:"domcontentloaded"});
 await preservedForm.locator('[data-contact-shortcut="swiadczenie"]').click();
 const savedName=preservedForm.locator('.contact-form input[autocomplete="given-name"]');
 await savedName.fill("Testowy klient");
 await preservedForm.locator(".contact-case-details summary").click();
 const guideURL=preservedForm.locator('.contact-form .contact-guide-box a');
 if(await guideURL.getAttribute("target")!=="_blank")throw Error("Checklist link must open a new tab");
 const [guidePopup]=await Promise.all([preservedForm.waitForEvent("popup"),guideURL.click()]);
 await guidePopup.waitForLoadState("domcontentloaded");
 if(!new URL(guidePopup.url()).pathname.includes("swiadczenie-wspierajace-pierwsze-kroki"))throw Error("Checklist popup goes to wrong page");
 await guidePopup.close();
 const privacyURL=preservedForm.locator('.contact-form a[href*="polityka-prywatnosci"]');
 if(await privacyURL.getAttribute("target")!=="_blank")throw Error("Privacy link must open a new tab");
 const [privacyPopup]=await Promise.all([preservedForm.waitForEvent("popup"),privacyURL.click()]);
 await privacyPopup.waitForLoadState("domcontentloaded");
 if(!new URL(privacyPopup.url()).pathname.includes("polityka-prywatnosci"))throw Error("Privacy popup goes to wrong page");
 await privacyPopup.close();
 if(await savedName.inputValue()!=="Testowy klient")throw Error("Draft contact name disappeared after opening guidance and privacy");
 if(await preservedForm.locator('.contact-form select[id^="cf-service-"]').inputValue()!=="Świadczenie wspierające")throw Error("Service choice disappeared after reading guidance");
 console.log("CONTACT_DRAFT_PRESERVED_OK",JSON.stringify({checklist:true,privacy:true,namePreserved:true,servicePreserved:true}));
 await preservedForm.close();

 // SKD email CTA and callback must work on a phone without uploading a contract into the site.
 const skdPage=await browser.newPage({viewport:{width:390,height:844}});
 await skdPage.goto(origin+"/uslugi/kredyty-pln.html",{waitUntil:"domcontentloaded"});
 const skdBox=skdPage.locator(".skd-document-cta");
 if(!await skdBox.isVisible())throw Error("SKD email/callback CTA missing");
 const emailHref=await skdBox.locator('a.skd-email-action').getAttribute("href");
 if(!emailHref?.startsWith("mailto:wojciech.obieglo@votum-ds.pl?")||!emailHref.includes("body="))throw Error("SKD email message is not ready: "+emailHref);
 const callbackHref=await skdBox.locator("a.skd-phone-action").getAttribute("href");
 if(callbackHref!=="#formularz")throw Error("SKD callback must lead to the visible form");
 const fields=skdPage.locator(".contact-form");
 if(!await fields.isVisible())throw Error("SKD contact form missing");
 const selectedService=await fields.locator('select[id^="cf-service-"]').inputValue();
 if(selectedService!=="Kredyt w PLN / SKD")throw Error("SKD service not preselected in form");
 const advisor=await fields.locator(".contact-advisor").innerText();
 if(!advisor.includes("Wojciech")||!advisor.includes("wojciech.obieglo@votum-ds.pl"))throw Error("SKD form shows inconsistent advisor: "+advisor);
 const ctaLayout=await skdBox.locator(".skd-document-actions").evaluate(el=>({width:el.getBoundingClientRect().width,links:[...el.querySelectorAll("a")].map(a=>({width:a.getBoundingClientRect().width,height:a.getBoundingClientRect().height}))}));
 if(ctaLayout.links.some(a=>a.height<44))throw Error("SKD mobile email/contact buttons too small");
 await skdBox.screenshot({path:"screenshots/skd-umowa-i-telefon-390.png",animations:"disabled"});
 console.log("SKD_CONTRACT_CONTACT_OK",JSON.stringify({service:selectedService,email:emailHref.slice(0,54),callback:true,buttons:ctaLayout.links.length}));
 await skdPage.close();

 // Team photos must be loaded from Cloudflare's own assets, not the former Lovable host.
 for(const [route,expectedCount] of [["/",2],["/kontakt.html",2],["/o-nas.html",2],["/uslugi/szkody-gornicze.html",1],["/uslugi/swiadczenie-wspierajace.html",1],["/kampanie/szkody-gornicze.html",1],["/kampanie/swiadczenie-wspierajace.html",1]]){
  const portraitsPage=await browser.newPage({viewport:{width:390,height:844}});
  await portraitsPage.goto(origin+route,{waitUntil:"domcontentloaded"});
  const portraitSelector=[
   'img[src="/assets/wojciech-obieglo.jpg"]',
   'img[src="/assets/paulina-chandrala.jpg"]'
  ].join(",");
  const images=portraitsPage.locator(portraitSelector);
  if(await images.count()!==expectedCount)throw Error("Local team portraits missing: "+route);
  await images.evaluateAll(imgs=>imgs.forEach(img=>img.loading="eager"));
  await portraitsPage.waitForFunction(()=>[
   ...document.querySelectorAll('img[src="/assets/wojciech-obieglo.jpg"],img[src="/assets/paulina-chandrala.jpg"]')
  ].every(img=>img.complete&&img.naturalWidth>0),null,{timeout:15000});
  const info=await portraitsPage.evaluate(()=>{
   const imgs=[...document.querySelectorAll('img[src="/assets/wojciech-obieglo.jpg"],img[src="/assets/paulina-chandrala.jpg"]')];
   return {
    oldLovableImages:document.querySelectorAll('img[src*="twojasprawa-votum.lovable.app"]').length,
    portraits:imgs.map(img=>({name:img.alt,src:img.currentSrc,width:img.naturalWidth,height:img.naturalHeight}))
   };
  });
  if(info.oldLovableImages!==0)throw Error("Old Lovable portraits still load: "+route);
  if(info.portraits.some(p=>!p.src.startsWith(origin+"/assets/")))throw Error("Portraits not from first-party assets: "+JSON.stringify(info));
  console.log("FIRST_PARTY_PORTRAITS_OK",JSON.stringify({route,count:info.portraits.length,widths:info.portraits.map(p=>p.width)}));
  await portraitsPage.close();
 }


 // The third flagship project gets two persistent, accessible mobile actions.
 const skdQuick=await browser.newPage({viewport:{width:390,height:844}});
 await skdQuick.goto(origin+"/uslugi/kredyty-pln.html",{waitUntil:"domcontentloaded"});
 const skdQuickBar=skdQuick.locator(".skd-mobile-quickbar");
 if(!await skdQuickBar.isVisible())throw Error("Mobile SKD sticky lead bar missing");
 const skdMail=skdQuickBar.locator(".skd-mobile-mail");
 const skdPhone=skdQuickBar.locator(".skd-mobile-phone");
 if(!(await skdMail.getAttribute("href"))?.startsWith("mailto:wojciech.obieglo@votum-ds.pl?"))throw Error("Mobile SKD contract CTA has wrong email");
 if(await skdPhone.getAttribute("href")!=="#formularz")throw Error("Mobile SKD callback CTA does not link to contact form");
 const barMetrics=await skdQuickBar.evaluate(el=>{
   const rect=el.getBoundingClientRect();
   return {bottom:Math.round(rect.bottom),height:Math.round(rect.height),
    links:[...el.querySelectorAll("a")].map(a=>Math.round(a.getBoundingClientRect().height)),
    chatBottom:Math.round(document.querySelector(".chat-toggle")?.getBoundingClientRect().bottom||0),
    viewHeight:innerHeight,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+2};
 });
 if(barMetrics.links.some(h=>h<44)||barMetrics.bottom>845||barMetrics.height>125||barMetrics.overflow)throw Error("Mobile SKD sticky bar geometry invalid: "+JSON.stringify(barMetrics));
 if(barMetrics.chatBottom>barMetrics.viewHeight-barMetrics.height+1)throw Error("SKD mobile bar overlaps chat launcher: "+JSON.stringify(barMetrics));
 await skdPhone.click();
 if(!skdQuick.url().endsWith("#formularz"))throw Error("SKD mobile callback did not reach form");
 const skdInput=skdQuick.locator('.contact-form input[type="tel"]');
 await skdInput.focus();
 if(await skdQuickBar.isVisible())throw Error("SKD sticky bar covers active phone input");
 await skdInput.evaluate(input=>input.blur());
 await skdQuick.screenshot({path:"screenshots/skd-szybki-kontakt-telefon.png",fullPage:false,animations:"disabled"});
 console.log("SKD_MOBILE_QUICKBAR_OK",JSON.stringify(barMetrics));
 await skdQuick.close();
 const skdDesktop=await browser.newPage({viewport:{width:1440,height:900}});
 await skdDesktop.goto(origin+"/uslugi/kredyty-pln.html",{waitUntil:"domcontentloaded"});
 if(await skdDesktop.locator(".skd-mobile-quickbar").isVisible())throw Error("SKD mobile quick bar should not appear on desktop");
 await skdDesktop.close();

 // The third featured service must also be reachable as the third primary nav item.
 const navMobile=await browser.newPage({viewport:{width:390,height:844}});
 await navMobile.goto(origin+"/",{waitUntil:"domcontentloaded"});
 const skdNavigation=navMobile.locator(".main-nav>a.nav-skd-priority");
 if(await skdNavigation.count()!==1)throw Error("Third SKD navigation item missing");
 await navMobile.locator(".mobile-menu-toggle").click();
 if(!await skdNavigation.isVisible())throw Error("SKD item inaccessible when mobile menu opens");
 await skdNavigation.click();
 if(!navMobile.url().includes("/uslugi/kredyty-pln.html"))throw Error("Mobile SKD menu points to wrong page");
 console.log("SKD_NAV_MOBILE_OK",JSON.stringify({menu:true,selected:"skd",visible:true}));
 await navMobile.close();
 const navDesktop=await browser.newPage({viewport:{width:1440,height:900}});
 await navDesktop.goto(origin+"/",{waitUntil:"domcontentloaded"});
 const navOverflow=await navDesktop.evaluate(()=>({width:document.documentElement.clientWidth,content:document.documentElement.scrollWidth,skd:!!document.querySelector('.main-nav>a.nav-skd-priority')}));
 if(!navOverflow.skd||navOverflow.content>navOverflow.width+2)throw Error("Desktop SKD navigation causes overflow: "+JSON.stringify(navOverflow));
 await navDesktop.close();


 // Two prominent home entry points should lead to SKD contact without the long article.
 const skdQuickEntry=await browser.newPage({viewport:{width:390,height:844}});
 await skdQuickEntry.goto(origin+"/?utm_source=facebook&utm_medium=social&utm_campaign=fb_skd",{waitUntil:"domcontentloaded"});
 await skdQuickEntry.locator(".mobile-quick-nav .mobile-skd-priority").click();
 if(!new URL(skdQuickEntry.url()).pathname.includes("/kampanie/skd.html"))throw Error("Mobile SKD entry must open dedicated campaign");
 if(new URL(skdQuickEntry.url()).searchParams.get("utm_source")!=="facebook")throw Error("SKD quick navigation lost campaign attribution");
 if(!await skdQuickEntry.locator('.contact-form input[type="tel"]').evaluate(el=>el.required))throw Error("SKD quick navigation did not require callback");
 await skdQuickEntry.goto(origin+"/",{waitUntil:"domcontentloaded"});
 await skdQuickEntry.locator("#uslugi .skd-featured").click();
 if(!new URL(skdQuickEntry.url()).pathname.includes("/kampanie/skd.html"))throw Error("Third SKD card should open dedicated campaign");
 console.log("SKD_HOME_FASTPATH_OK",JSON.stringify({mobile:true,thirdCard:true,utmPreserved:true,phoneRequired:true,leadsSent:0}));
 await skdQuickEntry.close();

 // Generated marketing links should be the same short canonical addresses printed on flyers.
 const generatorPage=await browser.newPage({viewport:{width:390,height:844}});
 await generatorPage.goto(origin+"/narzedzia/linki-kampanii.html",{waitUntil:"domcontentloaded"});
 const campaignSelector=generatorPage.locator('[data-campaign-builder] select[name="service"]');
 const resultLink=generatorPage.locator('[data-campaign-url]');
 for(const [service,expected] of [
  ["szkody","/kampanie/szkody-gornicze"],
  ["swiadczenie","/kampanie/swiadczenie-wspierajace"],
  ["skd","/kampanie/skd"],
  ["renty","/uslugi/renty-powypadkowe"],
  ["przesyl","/uslugi/sluzebnosc-przesylu"]
 ]){
  await campaignSelector.selectOption(service);
  const selected=new URL(await resultLink.inputValue());
  if(selected.pathname!==expected||selected.pathname.endsWith(".html"))throw Error("Generator canonical marketing destination is incorrect: "+service+" "+selected.href);
  if(selected.searchParams.get("utm_campaign")!=="lokalna_pomoc")throw Error("Generator dropped campaign tracking label");
  if(service==="skd"){
   const postText=await generatorPage.locator("[data-campaign-post]").inputValue();
   if(!postText.includes("wojciech.obieglo@votum-ds.pl")||!postText.includes("796 441 345")||postText.includes("500 171 531"))throw Error("SKD marketing post contacts wrong advisor");
  }
 }
 console.log("CAMPAIGN_SHORT_URLS_OK",JSON.stringify({canonical:5,skdPhone:"796 441 345",realLeadsSent:0}));
 await generatorPage.close();

 // Campaign SKD: direct agreement email and phone-required callback, no external form submission.
 const skdCampaign=await browser.newPage({viewport:{width:390,height:844}});
 await skdCampaign.goto(origin+"/kampanie/skd.html?utm_source=facebook&utm_medium=post",{waitUntil:"domcontentloaded"});
 const skdCampaignService=await skdCampaign.locator('.contact-form select[id^="cf-service-"]').inputValue();
 if(skdCampaignService!=="Kredyt w PLN / SKD")throw Error("SKD campaign form selected wrong service");
 const skdCampaignPhone=skdCampaign.locator('.contact-form input[type="tel"]');
 if(!await skdCampaignPhone.evaluate(node=>node.required))throw Error("SKD campaign callback must require phone");
 const skdCampaignMail=skdCampaign.locator(".campaign-skd-email");
 if(!(await skdCampaignMail.getAttribute("href")).startsWith("mailto:wojciech.obieglo@votum-ds.pl?subject="))throw Error("SKD landing email wrong");
 if(await skdCampaign.locator('.campaign-persona a[href="tel:+48500171531"],.campaign-mobile-actions a[href="tel:+48500171531"],.contact-people a[href="tel:+48500171531"]').count())throw Error("SKD visitor-facing phone points to benefits number");
 if(!await skdCampaign.locator(".campaign-mobile-actions").isVisible())throw Error("SKD mobile CTA missing");
 await skdCampaignPhone.focus();
 if(await skdCampaign.locator(".campaign-mobile-actions").isVisible())throw Error("SKD mobile CTA covers focused input");
 console.log("SKD_CAMPAIGN_UI_OK",JSON.stringify({phoneRequired:true,mail:"wojciech.obieglo@votum-ds.pl",formSubmissions:0}));
 await skdCampaign.close();

 // No submission: validate SKD callback phone as required, even when email is provided.
 const skdPhoneForm=await browser.newPage({viewport:{width:390,height:844}});
 await skdPhoneForm.goto(origin+"/uslugi/kredyty-pln.html",{waitUntil:"domcontentloaded"});
 const skdPhoneField=skdPhoneForm.locator('.contact-form input[type="tel"]');
 const skdEmailField=skdPhoneForm.locator('.contact-form input[type="email"]');
 const skdPref=skdPhoneForm.locator('.contact-form select[id^="cf-method-"]');
 const skdType=skdPhoneForm.locator('.contact-form select[id^="cf-service-"]');
 if(!await skdPhoneField.evaluate(el=>el.required))throw Error("SKD callback phone must be required");
 await skdEmailField.fill("test@example.com");
 await skdPref.selectOption("E-mail");
 if(!await skdPhoneField.evaluate(el=>el.required))throw Error("SKD email-only route bypassed phone requirement");
 const missingSKDPhone=await skdPhoneField.evaluate(el=>({valid:el.validity.valid,message:el.validationMessage}));
 if(missingSKDPhone.valid||!missingSKDPhone.message.includes("SKD"))throw Error("SKD required-phone guidance not shown: "+JSON.stringify(missingSKDPhone));
 await skdPhoneField.fill("796 441 345");
 if(!await skdPhoneField.evaluate(el=>el.validity.valid))throw Error("Valid callback phone rejected by SKD form");
 await skdType.selectOption("Świadczenie wspierające");
 await skdPhoneField.fill("");
 if(await skdPhoneField.evaluate(el=>el.required))throw Error("Other services must retain email-only contact option");
 console.log("SKD_CALLBACK_VALIDATION_OK",JSON.stringify({skdPhoneRequired:true,otherServicesFlexible:true,realMessagesSent:0}));
 await skdPhoneForm.close();

 // SKD-to-mining homepage selection must not retain the SKD-only phone requirement.
 const switchPage=await browser.newPage({viewport:{width:390,height:844}});
 await switchPage.goto(origin+"/",{waitUntil:"domcontentloaded"});
 const quickService=switchPage.locator('.contact-form select[id^="cf-service-"]');
 const quickPhoneField=switchPage.locator('.contact-form input[type="tel"]');
 const quickEmailField=switchPage.locator('.contact-form input[type="email"]');
 await quickEmailField.fill("test@example.com");
 await quickService.selectOption("Kredyt w PLN / SKD");
 if(!await quickPhoneField.evaluate(el=>el.required))throw Error("Home SKD did not require a callback number");
 await switchPage.locator('[data-contact-shortcut="szkody"]').click();
 if(await quickService.inputValue()!=="Szkody górnicze"||await quickPhoneField.evaluate(el=>el.required))throw Error("Mining shortcut kept stale SKD phone requirement");
 console.log("SERVICE_SWITCH_CONTACT_RULES_OK",JSON.stringify({from:"skd",to:"szkody",phoneOptionalWithEmail:true}));
 await switchPage.close();
 console.log("SUCCESS",checks.length,"visual routes, sticky logos, chatbot and navigator funnels. No real leads sent.");
}finally{
 if(browser)await browser.close();
 server.kill("SIGTERM");
}
