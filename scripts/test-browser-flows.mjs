#!/usr/bin/env node
/**
 * Real-browser read-only smoke test for the publicly deployed Twoja Sprawa.
 * Does not fill/send lead forms or call the Web3Forms submit endpoint.
 * Run in CI after installing the "playwright" package and Chromium.
 */
import assert from "node:assert/strict";
import {setTimeout as sleep} from "node:timers/promises";
import {chromium} from "playwright";

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
  assert.equal(await bar.locator("a.campaign-mobile-call").getAttribute("href"),
   "tel:"+phoneNumber,"Wrong campaign phone contact: "+path);
  const primary=await bar.locator("a.campaign-mobile-primary").getAttribute("href");
  assert.ok(isSKD?primary?.startsWith("mailto:wojciech.obieglo@votum-ds.pl"):
   primary==="#formularz","Wrong first campaign action: "+path);
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
 console.log("PASS: three mobile campaign bars hide at form, reappear afterward and retain correct adviser links.");


}finally{
 await browser.close();
}
