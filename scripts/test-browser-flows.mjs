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
}finally{
 await browser.close();
}
