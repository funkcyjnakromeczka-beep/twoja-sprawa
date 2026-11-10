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
  ["kampania-szkody-telefon","/kampanie/szkody-gornicze.html",390,844],
  ["kampania-swiadczenie-telefon","/kampanie/swiadczenie-wspierajace.html",390,844],
  ["usluga-szkody-telefon","/uslugi/szkody-gornicze.html",390,844],
  ["usluga-swiadczenie-telefon","/uslugi/swiadczenie-wspierajace.html",390,844],
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
  if(["/uslugi/szkody-gornicze.html","/uslugi/swiadczenie-wspierajace.html","/kampanie/szkody-gornicze.html","/kampanie/swiadczenie-wspierajace.html"].includes(path)&&(measured.personaImages.length!==1||!measured.personaImages[0].loaded))throw Error("Contact portrait not loaded on "+path+": "+JSON.stringify(measured));
  if(path==="/kontakt.html"&&(measured.personaImages.length!==2||measured.personaImages.some(x=>!x.loaded)))throw Error("Both contact portraits missing "+name+": "+JSON.stringify(measured));
  if(measured.barCount!==1||measured.images.length!==2||!measured.sticky||measured.oldDuplicate)throw Error("Partner logo bar failed "+name+": "+JSON.stringify(measured));
  if(measured.images[0].alt!=="Votum Network"||measured.images[1].alt!=="Votum Scale Agency")throw Error("Wrong logos "+name);
  if(measured.images.some(img=>!(img.loaded&&img.logoVisible)&&!img.fallbackVisible))throw Error("Logo and fallback both invisible "+name);
  if(["/","/kampanie/szkody-gornicze.html","/kampanie/swiadczenie-wspierajace.html","/uslugi/szkody-gornicze.html","/uslugi/swiadczenie-wspierajace.html"].includes(path)&&!measured.hasForm)throw Error("Lead form missing "+name);
  if(measured.documentHeight>height+200){
    await page.evaluate(()=>window.scrollTo(0,600));
    await page.waitForTimeout(140);
    const top=await logo.evaluate(el=>el.getBoundingClientRect().top);
    if(Math.abs(top)>2)throw Error("Partner strip not sticky after scroll: "+name+" top "+top);
  }
  console.log("VISUAL_OK",name,JSON.stringify(measured));
  checks.push({name,...measured});
  await page.close();
 }
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
 // Global search — 60 local records and deep linking into the relevant expanded FAQ.
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
 console.log("GLOBAL_SEARCH_OK",JSON.stringify({sourceCount:60,cracks:found,faqDeepLink:true,wzon:true,reset:afterReset}));
 await searchPage.close();
 console.log("SUCCESS",checks.length,"visual routes, sticky logos, chatbot and navigator funnels. No real leads sent.");
}finally{
 if(browser)await browser.close();
 server.kill("SIGTERM");
}
