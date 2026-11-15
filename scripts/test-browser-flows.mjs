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



 // Repeatable public-site resource inspection; read-only, no visitor tracking.
 const perfPage=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
 try{
  await perfPage.goto(origin+"/",{waitUntil:"load",timeout:40000});
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
  assert.equal(perf.largest.filter(x=>x.path==="/home-bundle.css").length,1,"Homepage bundle missing");
  assert.ok(perf.initialImages.filter(x=>x.src.startsWith(origin)).every(x=>x.complete&&x.width>0),
   "A critical same-origin image did not load");
 }finally{await perfPage.close();}


 const accessibilityPage=await browser.newPage({viewport:{width:390,height:844}});
 await accessibilityPage.emulateMedia({reducedMotion:"reduce"});
 try{
  for(const route of ["/","/kontakt","/kampanie/szkody-gornicze",
    "/kampanie/swiadczenie-wspierajace","/kampanie/skd"]){
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
   assert.equal(findings.length,0,"WCAG A/AA issue(s) on "+route+": "+JSON.stringify(findings));
  }
 }finally{await accessibilityPage.close();}

}finally{
 await browser.close();
}
