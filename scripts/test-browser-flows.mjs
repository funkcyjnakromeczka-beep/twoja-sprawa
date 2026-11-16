#!/usr/bin/env node
/**
 * Real-browser read-only smoke test for the publicly deployed Twoja Sprawa.
 * Does not fill/send lead forms or call the Web3Forms submit endpoint.
 * Run in CI after installing the "playwright" package and Chromium.
 */
import assert from "node:assert/strict";
import {setTimeout as sleep} from "node:timers/promises";
import {chromium} from "playwright";
import axe from "axe-core";

const origin="https://twoja-sprawa.pages.dev";
const expectedCommit=(process.env.GITHUB_SHA||"").trim().toLowerCase();
if(expectedCommit&&!/^[a-f0-9]{40}$/.test(expectedCommit)){
 throw new Error("Unexpected GitHub commit SHA");
}
const deploymentWaitMs=180000;
const deploymentStarted=Date.now();
async function waitForCurrentDeployment(){
 let lastSeen="unknown";
 do{
  try{
   const response=await fetch(origin+"/release-info.json?browser_smoke="+Date.now(),{
    headers:{"Cache-Control":"no-cache"},signal:AbortSignal.timeout(15000)
   });
   if(response.ok){
    const release=await response.json();
    if(release.site!==origin)throw new Error("Wrong Cloudflare Pages origin");
    lastSeen=release.commit||"not reported";
    if(!expectedCommit||release.commit===expectedCommit){
     console.log("DEPLOYMENT "+JSON.stringify({commit:release.commit,builtAt:release.builtAt}));
     return release;
    }
   }else lastSeen="HTTP "+response.status;
  }catch(error){
   lastSeen=error?.message||String(error);
  }
  console.log("Waiting for Cloudflare Pages deployment; latest="+lastSeen);
  await sleep(9000);
 }while(Date.now()-deploymentStarted<deploymentWaitMs);
 throw new Error("Cloudflare deployment is not yet the checked commit. Expected="+expectedCommit+" actual="+lastSeen);
}

await waitForCurrentDeployment();
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
 const errors=[];
 page.on("pageerror",error=>errors.push(error.message));
 // Do not let an accidental Web3Forms POST leave this test browser.
 await page.route("https://api.web3forms.com/submit",route=>{
  errors.push("Blocked unexpected Web3Forms submission");
  return route.abort();
 });
 await page.goto(origin+"/narzedzia/test-formularzy",{waitUntil:"domcontentloaded",timeout:40000});
 await page.getByRole("button",{name:"Uruchom kontrolę"}).click();
 await page.waitForFunction(()=>{
  const message=document.querySelector("#status")?.textContent||"";
  return message.includes("Nie wysłano żadnego zgłoszenia.")||
   message.includes("Kontrola napotkała błąd.");
 },null,{timeout:120000});
 const report=await page.evaluate(()=>{
  const rows=id=>[...document.querySelectorAll(id+" tr")].map(tr=>
   [...tr.querySelectorAll("td")].map(td=>td.textContent.trim()));
  return {
   status:document.querySelector("#status")?.textContent?.trim()||"",
   deploymentStatus:document.querySelector("#deploy-status")?.textContent?.trim()||"",
   files:rows("#results"),
   faq:rows("#deploy-results"),
   forms:rows("#form-results")
  };
 });
 console.log("BROWSER_TEST_REPORT "+JSON.stringify(report,null,2));
 assert.match(report.status,/Nie wysłano żadnego zgłoszenia\./,
  "Browser diagnostics did not complete safely");
 assert.equal(report.files.length,13,"Expected 10 pages and 3 SEO files");
 assert.equal(report.faq.length,3,"Expected 3 published FAQ assets");
 assert.equal(report.forms.length,7,"Expected 7 contact-form scenarios");
 for(const [name,http,details] of report.files){
  assert.equal(http,"HTTP 200","Page/SEO asset failed: "+name+"; "+details);
  assert.ok(!/Brak |Nieprawidłow|niedostępn|Błąd/i.test(details),
   "Page content validation failed: "+name+"; "+details);
 }
 for(const [name,http,details] of report.faq){
  assert.equal(http,"HTTP 200","FAQ asset failed: "+name+"; "+details);
  assert.match(details,/Wymagane informacje obecne/,"FAQ marker missing: "+name);
 }
 for(const [name,result,details] of report.forms){
  assert.equal(result,"OK","Browser form scenario failed: "+name+"; "+details);
 }
 assert.equal(errors.length,0,"Browser errors: "+errors.join("; "));
 console.log("PASS: 13 page/SEO resources, 3 FAQ assets and 7 form scenarios.");

 // Resilience test: JS may be unavailable on older phones, slow networks or
 // hardened browsers. Every conversion page must still show real adviser links.
 // This context has JavaScript completely disabled, and sends no form data.
 const noJsContext=await browser.newContext({
  javaScriptEnabled:false,viewport:{width:320,height:740}
 });
 try{
  const noJsPage=await noJsContext.newPage();
  const routes=[
   ["/","both"],["/kontakt","both"],
   ["/kampanie/szkody-gornicze","wojciech"],
   ["/kampanie/swiadczenie-wspierajace","paulina"],
   ["/kampanie/skd","wojciech"],
   ["/uslugi/szkody-gornicze","wojciech"],
   ["/uslugi/swiadczenie-wspierajace","paulina"],
   ["/uslugi/kredyty-pln","wojciech"],
   ["/uslugi/renty-powypadkowe","paulina"],
   ["/uslugi/kredyty-frankowe","wojciech"],
   ["/uslugi/sluzebnosc-przesylu","wojciech"]
  ];
  const noJsOverflow=[];
  for(const [route,advisor] of routes){
   const response=await noJsPage.goto(origin+route,{
    waitUntil:"load",timeout:40000
   });
   assert.equal(response?.status(),200,"No-JavaScript fallback route unavailable: "+route);
   const host=noJsPage.locator("[data-contact-form]");
   assert.equal(await host.count(),1,"Missing fallback contact host on "+route);
   const fallback=host.locator(".contact-load-fallback");
   assert.equal(await fallback.isVisible(),true,"No-JavaScript contact fallback hidden: "+route);
   assert.equal(await host.locator("form").count(),0,
    "Unexpected dynamically rendered form without JavaScript on "+route);
   const links=await fallback.locator("a").evaluateAll(nodes=>nodes.map(a=>a.href));
   const requirePerson=(email,phone)=>{
    assert.ok(links.some(h=>h.startsWith("mailto:"+email)),
     "Missing direct contact e-mail "+email+" on "+route);
    assert.ok(links.some(h=>h==="tel:"+phone),
     "Missing direct contact phone "+phone+" on "+route);
   };
   if(advisor==="both"||advisor==="wojciech")
    requirePerson("wojciech.obieglo@votum-ds.pl","+48796441345");
   if(advisor==="both"||advisor==="paulina")
    requirePerson("paulina.chandrala@votum-ds.pl","+48500171531");
   // Without JS, DOMContentLoaded can precede the responsive stylesheet.
   // The load event above is required before measuring widths.
   const geometry=await noJsPage.evaluate(()=>{
    const overflow=document.documentElement.scrollWidth-window.innerWidth;
    const offenders=[...document.querySelectorAll("body *")].filter(el=>{
     const r=el.getBoundingClientRect(),st=getComputedStyle(el);
     return st.display!=="none"&&r.width>0&&r.height>0&&(r.right>window.innerWidth+2||r.left< -2);
    }).map(el=>{
     const r=el.getBoundingClientRect(),st=getComputedStyle(el);
     return {element:el.tagName.toLowerCase(),className:typeof el.className==="string"?el.className.slice(0,100):"",
      text:(el.textContent||"").trim().slice(0,65),left:Math.round(r.left),right:Math.round(r.right),
      width:Math.round(r.width),whiteSpace:st.whiteSpace,overflowWrap:st.overflowWrap};
    }).sort((a,b)=>b.right-a.right).slice(0,18);
    return {overflow,offenders};
   });
   if(geometry.overflow>2){
    noJsOverflow.push({route,geometry});
    console.log("NO_JS_OVERFLOW_REPORT "+JSON.stringify({route,...geometry}));
   }
  }
  assert.deepEqual(noJsOverflow,[],"No-JavaScript mobile horizontal overflow: "+JSON.stringify(noJsOverflow));
  console.log("PASS: 11 core routes retain direct adviser phone/e-mail at 320px with JavaScript disabled.");

  // Search page has no dynamic result list when scripts are disabled. Preserve
  // direct self-service links rather than displaying an unusable search box.
  const searchNoJs=await noJsPage.goto(origin+"/szukaj",{waitUntil:"load",timeout:40000});
  assert.equal(searchNoJs?.status(),200,"No-JavaScript search fallback unavailable");
  const noJsSearch=noJsPage.locator("[data-site-search]");
  assert.equal(await noJsSearch.locator("[data-search-fallback]").isVisible(),true,
   "Search must show six service paths when scripts are disabled");
  assert.equal(await noJsSearch.locator(".search-fallback-links a").count(),6,
   "Search fallback must retain all six core service links");
  assert.equal(await noJsSearch.locator("[data-search-interactive]").isVisible(),false,
   "Inactive search field must be hidden without JavaScript");
  const noJsDestinations=await noJsSearch.locator(".search-fallback-links a").evaluateAll(nodes=>
   nodes.map(link=>new URL(link.href).pathname));
  assert.deepEqual(noJsDestinations,[
   "/kampanie/szkody-gornicze","/kampanie/swiadczenie-wspierajace",
   "/kampanie/skd","/uslugi/renty-powypadkowe",
   "/uslugi/kredyty-frankowe","/uslugi/sluzebnosc-przesylu"
  ],"Fallback service order and direct public paths must remain stable");
  assert.ok(await noJsPage.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)<=2,
   "Search fallback overflows a 320px no-JavaScript viewport");
  console.log("PASS: no-JavaScript search page shows six service links, not an unusable input.");

 }finally{
  await noJsContext.close();
 }




 // Browser-level search: an actual local query should populate results and
 // hide the bootstrap fallback. A blocked main script must do the opposite.
 const searchPage=await browser.newPage({viewport:{width:320,height:740}});
 try{
  await searchPage.goto(origin+"/szukaj?q=skd",{waitUntil:"load",timeout:40000});
  await searchPage.locator('[data-site-search][data-search-ready="true"]').waitFor({timeout:8000});
  assert.equal(await searchPage.locator("[data-search-fallback]").isVisible(),false);
  assert.equal(await searchPage.locator("[data-search-interactive]").isVisible(),true);
  assert.equal(await searchPage.locator("#site-search-input").inputValue(),"skd");
  assert.ok(await searchPage.locator(".site-search-card").count()>0,
   "Local SKD search should show relevant pages");
  const resultBefore=await searchPage.locator(".site-search-card").count();
  await searchPage.locator('button[data-search-category="skd"]').click();
  assert.equal(await searchPage.locator('button[data-search-category="skd"]').getAttribute("aria-pressed"),"true");
  assert.ok(await searchPage.locator(".site-search-card").count()>0,
   "SKD filter must still retain SKD pages");
  await searchPage.locator("[data-search-reset]").click();
  assert.equal(await searchPage.locator("#site-search-input").inputValue(),"");
  assert.equal(await searchPage.locator('button[data-search-category="all"]').getAttribute("aria-pressed"),"true");
  assert.ok(resultBefore>0);
  assert.equal(await searchPage.locator(".site-search-card").count(),6,
   "Reset with no query should show six featured service cards");
  assert.equal(await searchPage.locator("[data-search-empty]").isVisible(),false,
   "Empty query must not be described as an unsuccessful search");
  assert.match(await searchPage.locator("[data-search-count]").textContent(),/Wybierz temat: 6/);
  const featuredOrder=await searchPage.locator(".site-search-card").evaluateAll(cards=>
   cards.map(card=>new URL(card.href).pathname));
  assert.deepEqual(featuredOrder,[
   "/uslugi/szkody-gornicze","/uslugi/swiadczenie-wspierajace",
   "/uslugi/kredyty-pln","/uslugi/renty-powypadkowe",
   "/uslugi/kredyty-frankowe","/uslugi/sluzebnosc-przesylu"
  ],"Default topic browse should retain the exact six priorities");
  await searchPage.locator('button[data-search-category="franki"]').click();
  assert.ok(await searchPage.locator(".site-search-card").count()>0,
   "Category selected with no query should display related pages");
  assert.match(await searchPage.locator("[data-search-count]").textContent(),/Materiały w kategorii:/);
  await searchPage.locator('button[data-search-category="all"]').click();
  assert.equal(await searchPage.locator(".site-search-card").count(),6);
  // A real unmatched query still shows the appropriate no-results path.
  await searchPage.locator("#site-search-input").fill("zzzxxyyqqq995");
  assert.equal(await searchPage.locator(".site-search-card").count(),0);
  assert.equal(await searchPage.locator("[data-search-empty]").isVisible(),true);
  await searchPage.locator("[data-search-reset]").click();
  assert.equal(await searchPage.locator(".site-search-card").count(),6);

  assert.ok(await searchPage.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)<=2,
   "Live local search overflows 320px");
  console.log("PASS: local search filters SKD, shows six featured services on empty input, and handles genuine no-results at 320px.");
 }finally{await searchPage.close();}

 const blockedSearch=await browser.newPage({viewport:{width:320,height:740}});
 try{
  await blockedSearch.route("**/site-search.js",route=>route.abort("blockedbyclient"));
  await blockedSearch.goto(origin+"/szukaj",{waitUntil:"load",timeout:40000});
  assert.equal(await blockedSearch.locator("[data-search-fallback]").isVisible(),true,
   "Blocked search script must keep static help links visible");
  assert.equal(await blockedSearch.locator("[data-search-interactive]").isVisible(),false,
   "Blocked search script must not expose unusable controls");
  console.log("PASS: blocked search script still exposes direct assistance without extra requests.");
 }finally{await blockedSearch.close();}

 // Direct adviser address copying on real mobile-width contact page.
 // No form data is entered or submitted; only public professional addresses.
 await page.context().grantPermissions(["clipboard-read","clipboard-write"],{origin});
 await page.goto(origin+"/kontakt",{waitUntil:"domcontentloaded",timeout:40000});
 const adviserSelector=page.locator('.contact-form select[id^="cf-service"]');
 for(const [service,email] of [
  ["Kredyt w PLN / SKD","wojciech.obieglo@votum-ds.pl"],
  ["Świadczenie wspierające","paulina.chandrala@votum-ds.pl"],
  ["Szkody górnicze","wojciech.obieglo@votum-ds.pl"],
  ["Renty powypadkowe","paulina.chandrala@votum-ds.pl"]
 ]){
  await adviserSelector.selectOption(service);
  const address=page.locator(".contact-advisor-copy-address");
  assert.equal((await address.textContent()).trim(),email,
   "Wrong adviser address displayed after selecting "+service);
  await page.locator(".contact-advisor-copy-button").click();
  const clipboard=await page.evaluate(()=>navigator.clipboard.readText());
  assert.equal(clipboard,email,"Wrong adviser address copied for "+service);
  assert.match(await page.locator(".contact-advisor-copy-status").textContent(),
   /Skopiowano adres e-mail/,"Copy action did not report success");
 }
 const contactOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
 assert.ok(contactOverflow<=2,"Contact address box causes horizontal scrolling: "+contactOverflow);
 console.log("PASS: copy e-mail switches correctly between Wojciech and Paulina for four services.");

 // Mock Web3Forms failures and success; NEVER transmit test contact data.
 // A failed request must preserve fields and offer a locally generated copy.
 const failedSubmitPage=await browser.newPage({viewport:{width:390,height:844}});
 try{
  await failedSubmitPage.context().grantPermissions(["clipboard-read","clipboard-write"],{origin});
  let intercepted=0;
  let returnSuccess=false;
  await failedSubmitPage.route("https://api.web3forms.com/submit",async route=>{
   intercepted++;
   const payload=route.request().postDataJSON();
   assert.ok(payload.service&&payload.name&&payload.phone,
    "Mocked Web3Forms payload should contain the chosen topic and callback");
   await route.fulfill({
    status:returnSuccess?200:503,
    contentType:"application/json",
    body:JSON.stringify({success:returnSuccess})
   });
  });
  await failedSubmitPage.goto(origin+"/kampanie/skd",{
   waitUntil:"domcontentloaded",timeout:40000
  });
  const contactForm=failedSubmitPage.locator(".contact-form");
  await contactForm.locator('[autocomplete="given-name"]').fill("Testowy");
  await contactForm.locator('[autocomplete="tel"]').fill("000000000");
  await contactForm.locator('input[type="checkbox"][required]').check();
  await contactForm.locator('button[type="submit"]').click();
  await contactForm.locator(".contact-status-error").waitFor({state:"visible",timeout:8000});
  assert.equal(intercepted,1,"Exactly one mocked submission expected");
  assert.equal(await contactForm.locator('[autocomplete="given-name"]').inputValue(),
   "Testowy","Failed submission cleared visitor's name");
  assert.equal(await contactForm.locator('[autocomplete="tel"]').inputValue(),
   "000000000","Failed submission cleared visitor's callback number");
  await contactForm.locator(".contact-draft-copy").click();
  const firstDraft=await failedSubmitPage.evaluate(()=>navigator.clipboard.readText());
  assert.match(firstDraft,/Usługa: Kredyt w PLN \/ SKD/);
  assert.match(firstDraft,/Imię: Testowy/);
  assert.match(firstDraft,/Telefon: 000000000/);
  assert.match(await contactForm.locator(".contact-draft-feedback").textContent(),
   /wojciech\.obieglo@votum-ds\.pl/);
  // Edits after a failed submit must update the copied draft and recipient.
  await contactForm.locator('select[id^="cf-service"]').selectOption("Świadczenie wspierające");
  await contactForm.locator('[autocomplete="given-name"]').fill("Testowe");
  await contactForm.locator(".contact-draft-copy").click();
  const secondDraft=await failedSubmitPage.evaluate(()=>navigator.clipboard.readText());
  assert.match(secondDraft,/Usługa: Świadczenie wspierające/);
  assert.match(secondDraft,/Imię: Testowe/);
  assert.match(await contactForm.locator(".contact-draft-feedback").textContent(),
   /paulina\.chandrala@votum-ds\.pl/);
  const mailtoLink=contactForm.locator(".contact-fallback-link");
  await mailtoLink.evaluate(link=>link.click());
  assert.ok((await mailtoLink.getAttribute("href")).startsWith(
    "mailto:paulina.chandrala@votum-ds.pl?"),"Fallback e-mail retained stale adviser");
  assert.equal(intercepted,1,"Copying or opening fallback must not resubmit data");
  // Explicit retry, now with a MOCKED success: no real customer message is sent.
  returnSuccess=true;
  await contactForm.locator('button[type="submit"]').click();
  await contactForm.locator(".contact-status-success").waitFor({state:"visible",timeout:8000});
  assert.equal(intercepted,2,"Expected explicit second mocked submit only");
  assert.equal(await contactForm.locator('[autocomplete="given-name"]').inputValue(),
   "","Only confirmed successful acceptance may clear entered data");
  assert.equal(await contactForm.locator(".contact-draft-copy").count(),0,
   "Previous failure copy affordance should disappear after success");
  console.log("PASS: mocked Web3Forms error preserves lead, copy drafts adapt and only success resets.");
 }finally{
  await failedSubmitPage.close();
 }


 // Check the actual six-topic lead funnel: guide -> relevant adviser and form,
 // with only validated campaign labels carried across local navigation.
 const guided=await browser.newPage({viewport:{width:1280,height:800}});
 try{
  await guided.goto(origin+"/?utm_source=facebook&utm_medium=social&utm_campaign=lead_2026",{
   waitUntil:"domcontentloaded",timeout:40000
  });
  const disclosure=guided.locator("#dobierz-pomoc");
  await disclosure.locator("summary").click();
  assert.equal(await disclosure.getAttribute("open"),"","Navigator disclosure must open");
  const choices=[
   ["szkody","/kampanie/szkody-gornicze","+48796441345"],
   ["swiadczenie","/kampanie/swiadczenie-wspierajace","+48500171531"],
   ["skd","/kampanie/skd","+48796441345"],
   ["renty","/kontakt","+48500171531"],
   ["franki","/kontakt","+48796441345"],
   ["przesyl","/kontakt","+48796441345"]
  ];
  for(const [key,route,number] of choices){
   await guided.locator('#dobierz-pomoc [data-navigator="'+key+'"]').click();
   assert.equal(await guided.locator(".navigator-direct-phone").getAttribute("href"),
    "tel:"+number,"Wrong number in navigator: "+key);
   const link=await guided.locator(".navigator-contact-cta").getAttribute("href");
   const url=new URL(link,origin);
   assert.equal(url.pathname,route,"Wrong navigator destination for "+key);
   assert.equal(url.hash,"#formularz","Navigator should open target form for "+key);
   assert.equal(url.searchParams.get("utm_source"),"facebook","Source attribution missing: "+key);
   assert.equal(url.searchParams.get("utm_campaign"),"lead_2026","Campaign label missing: "+key);
   assert.equal(url.searchParams.get("lead_path"),"navigator","Navigator lead path missing: "+key);
   if(route==="/kontakt")assert.equal(url.searchParams.get("usluga"),key,
    "Generic contact page must pre-select "+key);
  }
  // Verify that choosing a support stage actually carries that code into
  // the destination, but no personal information is attached to the URL.
  await guided.locator('#dobierz-pomoc [data-navigator="swiadczenie"]').click();
  await guided.locator('#dobierz-pomoc [data-stage="decyzja"]').click();
  let staged=new URL(await guided.locator(".navigator-contact-cta").getAttribute("href"),origin);
  assert.equal(staged.searchParams.get("etap"),"decyzja");
  assert.equal(staged.pathname,"/kampanie/swiadczenie-wspierajace");
  assert.ok(!staged.searchParams.has("phone")&&!staged.searchParams.has("email"));

  const destinationPage=await browser.newPage({viewport:{width:390,height:844}});
  try{
   const res=await destinationPage.goto(staged.href,{
    waitUntil:"domcontentloaded",timeout:40000
   });
   assert.equal(res?.status(),200,"Support deep link did not load");
   assert.equal(await destinationPage.locator(".contact-form select[id^='cf-service']").inputValue(),
    "Świadczenie wspierające","Support form did not inherit topic");
   assert.equal(await destinationPage.locator(".contact-stage select").inputValue(),
    "Mam decyzję WZON","Support form did not pre-select stage from navigator");
   assert.equal(await destinationPage.locator(".contact-advisor-copy-address").textContent(),
    "paulina.chandrala@votum-ds.pl","Support form points to wrong adviser");
  }finally{await destinationPage.close();}


  const toggle=guided.locator(".chat-assistant .chat-toggle");
  await toggle.click();
  assert.equal(await toggle.getAttribute("aria-expanded"),"true","Assistant should expand");
  const chatChoices=guided.locator(".chat-choices button[data-topic]");
  assert.equal(await chatChoices.count(),6,"Chatbot must provide six service topics");
  for(const [key,route,number] of choices){
   await guided.locator('.chat-choices button[data-topic="'+key+'"]').click();
   assert.equal(await guided.locator(".chat-actions a").first().getAttribute("href"),
    "tel:"+number,"Wrong assistant phone for "+key);
   const contactHref=await guided.locator(".chat-reply-contact").getAttribute("href");
   const contactUrl=new URL(contactHref,origin);
   assert.equal(contactUrl.pathname,route,"Wrong assistant form destination: "+key);
   assert.equal(contactUrl.hash,"#formularz","Assistant form anchor missing: "+key);
   assert.equal(contactUrl.searchParams.get("utm_source"),"facebook",
    "Assistant failed to retain original source for "+key);
   assert.equal(contactUrl.searchParams.get("lead_path"),"chatbot",
    "Assistant failed to tag its own contact path: "+key);
   if(route==="/kontakt")assert.equal(contactUrl.searchParams.get("usluga"),key,
    "Assistant generic form must pre-select "+key);
   const emailHref=await guided.locator(".chat-email-action").getAttribute("href");
   const advisor=number==="+48500171531"?
    "paulina.chandrala@votum-ds.pl":"wojciech.obieglo@votum-ds.pl";
   assert.ok(emailHref.startsWith("mailto:"+advisor+"?"),"Assistant email wrong: "+key);
  }
  await guided.locator('.chat-choices button[data-topic="szkody"]').click();
  await guided.locator(".chat-stage-choice").first().click();
  const stageUrl=new URL(await guided.locator(".chat-reply-contact").getAttribute("href"),origin);
  assert.equal(stageUrl.searchParams.get("etap"),"uszkodzenia");
  assert.equal(stageUrl.searchParams.get("uszkodzenie"),"sciany");

  const miningPage=await browser.newPage({viewport:{width:390,height:844}});
  try{
   const res=await miningPage.goto(stageUrl.href,{waitUntil:"domcontentloaded",timeout:40000});
   assert.equal(res?.status(),200,"Mining deep link did not load");
   assert.equal(await miningPage.locator(".contact-form select[id^='cf-service']").inputValue(),
    "Szkody górnicze","Mining form did not inherit topic");
   assert.equal(await miningPage.locator(".contact-stage select").inputValue(),
    "Zauważyłem/am uszkodzenia","Mining stage not selected");
   assert.equal(await miningPage.locator(".contact-damage-area select").inputValue(),
    "Ściany i elewacja","Mining form did not pre-select wall damage");
   assert.equal(await miningPage.locator(".contact-advisor-copy-address").textContent(),
    "wojciech.obieglo@votum-ds.pl","Mining deep link shows wrong adviser");
  }finally{await miningPage.close();}

  await guided.keyboard.press("Escape");
  assert.equal(await toggle.getAttribute("aria-expanded"),"false",
   "Escape must close assistant and return button to collapsed state");
  console.log("PASS: six guide and assistant lead paths, adviser routing, UTM and stage links.");
 }finally{await guided.close();}



 // Real responsive navigation: the primary three links are easy to find at phone width.
 await page.goto(origin+"/",{waitUntil:"domcontentloaded",timeout:40000});
 const quickNav=page.locator("nav.mobile-quick-nav");
 await quickNav.waitFor({state:"visible",timeout:15000});
 const mobileDestinations=await quickNav.locator("a").evaluateAll(links=>
  links.map(a=>new URL(a.href).pathname));
 assert.deepEqual(mobileDestinations,[
  "/kampanie/szkody-gornicze",
  "/kampanie/swiadczenie-wspierajace",
  "/kampanie/skd"
 ],"Mobile navigation must keep mining, support and SKD as first three priorities");
 const partnerLogos=page.locator(".network-brand-bar .network-brand-logos a");
 assert.equal(await partnerLogos.count(),2,
  "Both VOTUM partnership logos should be displayed in the shared header");
 const serviceTitles=await page.locator("#uslugi .primary-services > .primary-card h3").allTextContents();
 assert.ok(serviceTitles[0]?.includes("Szkody górnicze"),"Mining must be first");
 assert.ok(serviceTitles[1]?.includes("Świadczenie wspierające"),"Support must be second");
 assert.ok(serviceTitles[2]?.includes("Sankcja Kredytu Darmowego"),"SKD must be third");

 // Desktop should show the full hero instead of repeating the mobile priority bar.
 await page.setViewportSize({width:1280,height:800});
 await page.reload({waitUntil:"domcontentloaded",timeout:40000});
 assert.equal(await page.locator("nav.mobile-quick-nav").isVisible(),false,
  "Mobile-only priority bar must be hidden on desktop");
 await page.locator(".hero-priority-grid").waitFor({state:"visible",timeout:15000});
 console.log("PASS: mobile/desktop hero priorities, 3 service cards and 2 partner logos.");

 // Check the smallest common phone widths for scrollbars and usable tap targets.
 for(const width of [320,360,390]){
  await page.setViewportSize({width,height:740});
  await page.reload({waitUntil:"domcontentloaded",timeout:40000});
  const mobile=page.locator("nav.mobile-quick-nav");
  await mobile.waitFor({state:"visible",timeout:15000});
  const geometry=await mobile.locator("a").evaluateAll(links=>links.map(link=>{
   const rect=link.getBoundingClientRect();
   return {width:rect.width,height:rect.height,left:rect.left,right:rect.right};
  }));
  assert.equal(geometry.length,3,"Three mobile navigation options required");
  for(const [i,rect] of geometry.entries()){
   assert.ok(rect.width>=44&&rect.height>=44,
    "Mobile target "+i+" too small at "+width+"px: "+JSON.stringify(rect));
   assert.ok(rect.left>=-2&&rect.right<=width+2,
    "Mobile target "+i+" runs outside viewport "+width+"px");
  }
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  assert.ok(overflow<=2,"Homepage horizontal overflow "+overflow+"px at "+width+"px");
 }


 // A real phone-width bottom bar must lead to the correct person's number.
 await page.setViewportSize({width:390,height:844});
 for(const [path,number] of [
  ["/uslugi/szkody-gornicze","+48796441345"],
  ["/uslugi/swiadczenie-wspierajace","+48500171531"]
 ]){
  await page.goto(origin+path,{waitUntil:"domcontentloaded",timeout:40000});
  const cta=page.locator("nav.mobile-service-cta");
  await cta.waitFor({state:"visible",timeout:15000});
  assert.equal(await cta.locator("a.mobile-service-call").getAttribute("href"),
   "tel:"+number,"Mobile call link points to wrong adviser on "+path);
  assert.equal(await cta.locator("a.mobile-service-lead").getAttribute("href"),
   "#formularz","Mobile lead link misses the form on "+path);
 }
 assert.equal(errors.length,0,"Browser errors after mobile navigation: "+errors.join("; "));
 console.log("PASS: mobile sticky call buttons point to Wojciech and Paulina as intended.");

 // Campaign landing pages have their own (different) sticky contact buttons.
 // They must remain usable after scrolling, but disappear when the form appears.
 for(const [path,phoneNumber,isSKD] of [
  ["/kampanie/szkody-gornicze","+48796441345",false],
  ["/kampanie/swiadczenie-wspierajace","+48500171531",false],
  ["/kampanie/skd","+48796441345",true]
 ]){
  await page.goto(origin+path,{waitUntil:"domcontentloaded",timeout:40000});
  const bar=page.locator("aside.campaign-mobile-actions");
  assert.equal(await bar.count(),1,"Campaign must have exactly one mobile bar: "+path);
  const links=bar.locator("a");
  assert.equal(await links.count(),2,"Expected 2 campaign actions: "+path);
  const secondary=await bar.locator("a.campaign-mobile-call").getAttribute("href");
  assert.equal(secondary,isSKD?"#formularz":"tel:"+phoneNumber,
   "Wrong campaign second action: "+path);
  // SKD has a dedicated callback form; the telephone remains available in the hero.
  if(isSKD){
   assert.equal(await page.locator(".campaign-persona-copy a[href^='tel:']").getAttribute("href"),
    "tel:"+phoneNumber,"SKD must preserve the direct telephone number");
   assert.match(await bar.locator("a.campaign-mobile-call").textContent(),/Zostaw numer/);
  }
  const primary=await bar.locator("a.campaign-mobile-primary").getAttribute("href");
  assert.ok(isSKD?primary?.startsWith("mailto:wojciech.obieglo@votum-ds.pl"):
   primary==="#formularz","Wrong first campaign action: "+path);
  if(isSKD){
   // Exercise the actual second CTA, not just its href.
   await bar.locator("a.campaign-mobile-call").click();
   assert.equal(new URL(page.url()).hash,"#formularz",
    "SKD callback button must navigate to its contact form");
  }
  // The form can be long on mobile; hide the fixed bar when the form is in view.
  await page.locator("#formularz").scrollIntoViewIfNeeded();
  await bar.waitFor({state:"hidden",timeout:7000});
  // Do not cover text fields even after the user taps in the middle of the form.
  await page.locator("#formularz input[autocomplete='given-name']").focus();
  assert.equal(await bar.isVisible(),false,"Bar covers focused input on "+path);
  // Once the user moves beyond the form, the bar is available again.
  await page.evaluate(()=>{document.activeElement?.blur?.();window.scrollTo(0,document.body.scrollHeight);});
  await bar.waitFor({state:"visible",timeout:7000});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  assert.ok(overflow<=2,"Campaign creates horizontal overflow "+overflow+"px on "+path);
 }
 assert.equal(errors.length,0,"Browser errors in campaign mobile flows: "+errors.join("; "));
 console.log("PASS: three mobile campaign bars hide at form, reappear afterward and keep correct contact paths.");

 // Lowest supported practical phone viewport, including potentially long loan-email text.
 await page.setViewportSize({width:320,height:740});
 for(const path of ["/kampanie/szkody-gornicze","/kampanie/swiadczenie-wspierajace","/kampanie/skd"]){
  await page.goto(origin+path,{waitUntil:"domcontentloaded",timeout:40000});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  assert.ok(overflow<=2,"Campaign exceeds 320px viewport by "+overflow+"px on "+path);
  const actions=await page.locator("aside.campaign-mobile-actions a").evaluateAll(nodes=>
   nodes.map(el=>{const r=el.getBoundingClientRect();return {width:r.width,height:r.height};}));
  for(const [index,size] of actions.entries()){
   assert.ok(size.width>=44&&size.height>=44,
    "Too small campaign mobile touch target "+index+" on "+path);
  }
 }
 console.log("PASS: 320px campaign viewport has no horizontal overflow and touch targets meet 44px minimum.");


 // Core service pages should also remain readable and usable at narrow widths.
 for(const width of [320,390]){
  await page.setViewportSize({width,height:740});
  for(const route of [
   "/uslugi/szkody-gornicze","/uslugi/swiadczenie-wspierajace",
   "/uslugi/kredyty-pln","/uslugi/renty-powypadkowe",
   "/uslugi/kredyty-frankowe","/uslugi/sluzebnosc-przesylu"
  ]){
   const resp=await page.goto(origin+route,{waitUntil:"domcontentloaded",timeout:40000});
   assert.equal(resp?.status(),200,"Core service page not available: "+route);
   const metrics=await page.evaluate(()=>{
    const full=document.documentElement.scrollWidth-window.innerWidth;
    const bar=document.querySelector(".mobile-service-cta");
    return {overflow:full,
     barTargets:bar?[...bar.querySelectorAll("a")].map(x=>{
      const r=x.getBoundingClientRect();return {width:r.width,height:r.height};
     }):[]};
   });
   assert.ok(metrics.overflow<=2,"Horizontal overflow "+metrics.overflow+" on "+route+" at "+width+"px");
   for(const size of metrics.barTargets){
    assert.ok(size.width>=44&&size.height>=44,
     "Core service phone CTA too small on "+route+" at "+width+"px: "+JSON.stringify(size));
   }
  }
 }
 console.log("PASS: six core service pages at 320/390px have no horizontal overflow or undersized sticky contact links.");






 // Test one genuinely public, browser-executed share path for all six services.
 // We intercept only the system share / clipboard interfaces; never transmit a lead.
 const checklistPage=await browser.newPage({viewport:{width:390,height:844}});
 try{
  await checklistPage.goto(origin+"/plan-dzialania",{waitUntil:"domcontentloaded",timeout:40000});
  await checklistPage.evaluate(()=>{
   Object.defineProperty(navigator,"share",{configurable:true,value:undefined});
   Object.defineProperty(navigator,"clipboard",{configurable:true,
    value:{writeText:async content=>{window.__planCopied=content;}}});
  });
  for(const [name,expected] of [
   ["szkody","Szkody górnicze"],["swiadczenie","Świadczenie wspierające"],
   ["skd","Kredyt konsumencki PLN / SKD"],["renty","Renta powypadkowa"],
   ["franki","Kredyty frankowe CHF"],["przesyl","Służebność przesyłu"]
  ]){
   await checklistPage.locator('[data-plan-service="'+name+'"]').click();
   await checklistPage.locator("[data-plan-share]").click();
   await checklistPage.waitForFunction(()=>!!window.__planCopied);
   const result=await checklistPage.evaluate(()=>{
    const s=window.__planCopied;window.__planCopied="";
    return {text:s,status:document.querySelector("[data-plan-share-status]")?.textContent};
   });
   assert.ok(result.text.includes(expected),"Copied plan mismatched service "+name);
   assert.ok(result.text.includes("https://twoja-sprawa.pages.dev/uslugi/"),
    "Copied plan should contain canonical service link, not source route");
   assert.ok(!result.text.includes("utm_")&&!result.text.includes("PESEL"),
    "Copied plan should not expose tracking or identification");
   assert.match(result.status,/skopiowana/,"Missing copy confirmation for "+name);
  }
  await checklistPage.evaluate(()=>{
   Object.defineProperty(navigator,"clipboard",{configurable:true,value:undefined});
  });
  await checklistPage.locator('[data-plan-service="szkody"]').click();
  await checklistPage.locator("[data-plan-share]").click();
  const fallback=await checklistPage.evaluate(()=>{
   const block=document.querySelector("[data-plan-share-fallback]");
   const input=document.querySelector("[data-plan-share-text]");
   return {visible:!!block&&!block.hidden,
    focus:document.activeElement===input,
    selected:input?.selectionStart===0&&input?.selectionEnd===input.value.length,
    text:input?.value||""};
  });
  assert.ok(fallback.visible&&fallback.focus&&fallback.selected,
   "Manual sharing fallback must be visible, focused and selected");
  assert.ok(fallback.text.includes("Szkody górnicze"));
  console.log("PASS: 6 live private checklist shares and fully selected fallback.");
 }finally{await checklistPage.close();}

 // Repeatable public-site resource inspection; read-only, no visitor tracking.
 const perfPage=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
 try{
  // CSS and DOM must be ready; third-party images must not block the navigation event.
  await perfPage.goto(origin+"/",{waitUntil:"domcontentloaded",timeout:40000});
  await perfPage.waitForTimeout(1200);
  const perf=await perfPage.evaluate(()=>{
   const resources=performance.getEntriesByType("resource")
    .filter(x=>x.name.startsWith(location.origin))
    .map(x=>({path:new URL(x.name).pathname,kind:x.initiatorType,
     decoded:x.decodedBodySize,transfer:x.transferSize,duration:Math.round(x.duration)}));
   const navigation=performance.getEntriesByType("navigation")[0];
   const styles=resources.filter(x=>x.path.endsWith(".css"));
   const scripts=resources.filter(x=>x.path.endsWith(".js"));
   const images=[...document.images].filter(img=>img.loading!=="lazy")
    .map(img=>({src:img.currentSrc||img.src,complete:img.complete,width:img.naturalWidth}));
   return {domContentLoadedMs:Math.round(navigation?.domContentLoadedEventEnd||0),
    loadMs:Math.round(navigation?.loadEventEnd||0),
    styleSheets:styles.length,cssDecodedBytes:styles.reduce((n,x)=>n+x.decoded,0),
    jsFiles:scripts.length,jsDecodedBytes:scripts.reduce((n,x)=>n+x.decoded,0),
    largest:resources.sort((a,b)=>b.decoded-a.decoded).slice(0,12),
    initialImages:images};
  });
  console.log("PUBLIC_RESOURCE_REPORT "+JSON.stringify(perf,null,2));
  assert.equal(perf.styleSheets,1,"Homepage should download a single combined CSS file");
  assert.ok(perf.cssDecodedBytes>0&&perf.cssDecodedBytes<285000,
   "Homepage CSS exceeded 285 KB decoded budget: "+perf.cssDecodedBytes);
  assert.equal(perf.largest.filter(x=>x.path==="/home-bundle.css").length,1,"Homepage bundle missing");
  assert.ok(perf.initialImages.filter(x=>x.src.startsWith(origin)).every(x=>x.complete&&x.width>0),
   "A critical same-origin image did not load");
 }finally{await perfPage.close();}

 // First-load service page: independent CSS files must benefit from the same
 // production-only comment removal, without breaking the mobile contact route.
 const servicePerfPage=await browser.newPage({viewport:{width:390,height:844}});
 try{
  const response=await servicePerfPage.goto(origin+"/uslugi/szkody-gornicze",{
   waitUntil:"domcontentloaded",timeout:40000
  });
  assert.equal(response?.status(),200);
  const serviceStyles=await servicePerfPage.evaluate(()=>
   performance.getEntriesByType("resource")
    .filter(entry=>entry.name.startsWith(location.origin)&&entry.name.endsWith(".css"))
    .map(entry=>({path:new URL(entry.name).pathname,
      decoded:entry.decodedBodySize,transfer:entry.transferSize})));
  const byPath=new Map(serviceStyles.map(entry=>[entry.path,entry.decoded]));
  assert.ok((byPath.get("/styles.css")||0)>0&&(byPath.get("/styles.css")||Infinity)<63000,
   "Production base CSS should be reduced on service pages");
  assert.ok((byPath.get("/premium-v2.css")||0)>0&&(byPath.get("/premium-v2.css")||Infinity)<180000,
   "Production premium CSS should omit author comments on service pages");
  const layerStyles=serviceStyles.filter(entry=>entry.path.startsWith("/layers-")&&entry.path.endsWith(".css")&&entry.path.length===28);
  assert.equal(layerStyles.length,1,"Expected one content-addressed service layer bundle");
  assert.equal(serviceStyles.length,3,"Core service CSS should load in three requests, preserving shared caches");
  assert.ok(layerStyles[0].decoded>1000&&layerStyles[0].decoded<65000,
   "Merged service CSS layers exceed 65 KB decoded");
  const hashedCss=await servicePerfPage.request.get(origin+layerStyles[0].path);
  assert.equal(hashedCss.status(),200,"The immutable CSS asset must be retrievable");
  assert.match(hashedCss.headers()["cache-control"]||"",/immutable/i,
   "Content-addressed CSS should carry immutable Cache-Control");
  console.log("SERVICE_RESOURCE_REPORT "+JSON.stringify(serviceStyles));
 }finally{await servicePerfPage.close();}


 const accessibilityFailures=[];
 const accessibilityPage=await browser.newPage({viewport:{width:390,height:844}});
 await accessibilityPage.emulateMedia({reducedMotion:"reduce"});
 try{
  for(const route of ["/","/kontakt","/kampanie/szkody-gornicze",
    "/kampanie/swiadczenie-wspierajace","/kampanie/skd",
    "/uslugi/szkody-gornicze","/uslugi/swiadczenie-wspierajace",
    "/uslugi/kredyty-pln","/uslugi/renty-powypadkowe",
    "/uslugi/kredyty-frankowe","/uslugi/sluzebnosc-przesylu","/szukaj"]){
   await accessibilityPage.goto(origin+route,{waitUntil:"load",timeout:40000});
   await accessibilityPage.waitForTimeout(250);
   await accessibilityPage.addScriptTag({content:axe.source});
   const findings=await accessibilityPage.evaluate(async()=>{
    const result=await window.axe.run(document,{
     runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22aa"]}});
    return result.violations.map(v=>({id:v.id,impact:v.impact,
     affected:v.nodes.slice(0,4).map(n=>n.target)}));
   });
   console.log("WCAG_REPORT "+JSON.stringify({route,findings}));
   if(findings.length){
    accessibilityFailures.push({route,findings});
    const contrast=await accessibilityPage.evaluate(targets=>targets.map(selector=>{
     const el=document.querySelector(selector);
     if(!el)return {selector,missing:true};
     const ancestors=[];let node=el;
     while(node&&ancestors.length<4){
      const st=getComputedStyle(node);
      ancestors.push({tag:node.tagName,klass:typeof node.className==="string"?node.className:"",
       textColor:st.color,background:st.backgroundColor});
      node=node.parentElement;
     }
     return {selector,ancestors};
    }),findings.flatMap(f=>f.affected).filter(a=>a?.length).map(a=>a[0]));
    console.log("WCAG_COMPUTED_COLORS "+JSON.stringify({route,contrast}));
   }

   // WCAG checks on expanded interactive panels, not only their closed states.
   if(route==="/"){
    await accessibilityPage.locator("#uslugi").scrollIntoViewIfNeeded();
    const toggle=accessibilityPage.locator(".chat-toggle");
    await toggle.waitFor({state:"visible",timeout:10000});
    await toggle.click();
    assert.equal(await toggle.getAttribute("aria-expanded"),"true");
    assert.equal(await accessibilityPage.evaluate(()=>document.activeElement?.className),
     "chat-close","Open assistant must focus its close button");
    assert.equal(await accessibilityPage.locator(".chat-choices .chat-choice-featured").count(),
     3,"Mining, support and SKD must be prominently featured");
    assert.ok(await accessibilityPage.locator('.chat-choices button[data-topic="skd"]')
      .evaluate(el=>el.classList.contains("chat-choice-skd")),"SKD must be visibly third priority");
    await accessibilityPage.locator('.chat-choices button[data-topic="swiadczenie"]').click();
    await accessibilityPage.locator(".chat-stage-choice").first().focus();
    await accessibilityPage.keyboard.press("Space");
    assert.equal(await accessibilityPage.locator(".chat-stage-choice").first().getAttribute("aria-pressed"),
     "true","Space must select a stage with keyboard");
    const openViolations=await accessibilityPage.evaluate(async()=>{
     const result=await window.axe.run(document,{runOnly:{
      type:"tag",values:["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22aa"]}});
     return result.violations.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.slice(0,4).map(n=>({target:n.target,summary:n.failureSummary,html:n.html?.slice(0,300)}))}));
    });
    console.log("WCAG_OPEN_ASSISTANT "+JSON.stringify(openViolations));
    const chatGeometry=await accessibilityPage.evaluate(()=>{
      const sel=[".chat-panel",".chat-content",".chat-actions",".chat-reply-contact"];
      return sel.map(q=>{
       const el=document.querySelector(q),r=el?.getBoundingClientRect();
       return {selector:q,rect:r?{top:r.top,bottom:r.bottom,height:r.height,width:r.width}:null,
        scrollTop:el?.scrollTop,scrollHeight:el?.scrollHeight,clientHeight:el?.clientHeight,
        computedDisplay:el?getComputedStyle(el).display:null};
      });
    });
    console.log("CHAT_GEOMETRY "+JSON.stringify(chatGeometry));

    assert.equal(openViolations.length,0,"Expanded assistant violates WCAG: "+JSON.stringify(openViolations));
    await accessibilityPage.keyboard.press("Escape");
    assert.equal(await toggle.getAttribute("aria-expanded"),"false");
    assert.equal(await accessibilityPage.evaluate(()=>document.activeElement?.className),
     "chat-toggle","Escape must restore focus to the assistant opener");
    const disclosure=accessibilityPage.locator("#dobierz-pomoc");
    await disclosure.locator("summary").click();
    await disclosure.locator('[data-navigator="skd"]').click();
    const navViolations=await accessibilityPage.evaluate(async()=>{
     const result=await window.axe.run(document,{runOnly:{
      type:"tag",values:["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22aa"]}});
     return result.violations.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.slice(0,4).map(n=>({target:n.target,summary:n.failureSummary,html:n.html?.slice(0,300)}))}));
    });
    console.log("WCAG_OPEN_NAVIGATOR "+JSON.stringify(navViolations));
    assert.equal(navViolations.length,0,"Expanded navigator violates WCAG: "+JSON.stringify(navViolations));
    console.log("PASS: expanded assistant and navigator keyboard/WCAG accessibility.");
   }

  }
 }finally{await accessibilityPage.close();}
 assert.deepEqual(accessibilityFailures,[],"WCAG A/AA issues on public routes: "+JSON.stringify(accessibilityFailures));

}finally{
 await browser.close();
}
