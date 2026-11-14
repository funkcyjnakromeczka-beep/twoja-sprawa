#!/usr/bin/env node
/**
 * One tagged Web3Forms smoke submission through a real browser.
 * The form belongs to Twoja Sprawa. Does not access or upload client files.
 * Run only as an explicit user-authorized technical check.
 */
import assert from "node:assert/strict";
import {chromium} from "playwright";

const origin="https://twoja-sprawa.pages.dev";
const testId="TEST-WEB3FORMS-"+(process.env.GITHUB_RUN_ID||"LOCAL");
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},locale:"pl-PL"});
const page=await context.newPage();
const failures=[];
page.on("requestfailed",request=>{
 if(request.url().startsWith("https://api.web3forms.com/")){
  failures.push((request.failure()?.errorText||"Network error").slice(0,140));
 }
});
let submitted=false;
try{
 // Read-only verification of the support advisor and selection on the mobile page.
 await page.goto(origin+"/uslugi/swiadczenie-wspierajace",{waitUntil:"domcontentloaded",timeout:30000});
 const support=page.locator("form.contact-form").first();
 await support.waitFor({timeout:18000});
 const supportService=await support.locator("select[required]").first().inputValue();
 assert.equal(supportService,"Świadczenie wspierające","Świadczenie service not preselected");
 const supportAdvisor=await support.locator(".contact-advisor").innerText();
 assert.ok(supportAdvisor.includes("Paulina")&&supportAdvisor.includes("500 171 531"),"Incorrect support advisor");
 console.log("SUPPORT_UI_OK: wybrana usługa i kontakt do Pauliny (bez zgłoszenia)");

 // Actual SKD path on a phone-sized viewport.
 await page.goto(origin+"/kampanie/skd",{waitUntil:"domcontentloaded",timeout:30000});
 const form=page.locator("form.contact-form").first();
 await form.waitFor({timeout:18000});
 const select=form.locator("select[required]").first();
 assert.equal(await select.inputValue(),"Kredyt w PLN / SKD","SKD not preselected");
 const phone=form.locator('input[type="tel"]').first();
 assert.ok(await phone.getAttribute("required")!==null,"SKD callback phone not mandatory");
 const contactDetails=await form.locator(".contact-advisor").innerText();
 assert.ok(contactDetails.includes("Wojciech")&&contactDetails.includes("796 441 345"),"Incorrect SKD adviser");
 const mailHref=await form.locator('a[href^="mailto:wojciech.obieglo@votum-ds.pl"]').first().getAttribute("href");
 assert.ok(mailHref?.startsWith("mailto:wojciech.obieglo@votum-ds.pl"),"Missing contract email");
 console.log("SKD_UI_OK: numer telefonu wymagany, właściwy doradca i e-mail umowy");

 // ONLY ONE deliberately identified test. Uses the owner's already-public business contact.
 await form.locator('input[autocomplete="given-name"]').fill("TEST TECHNICZNY — NIE KONTAKTOWAĆ");
 await phone.fill("796441345");
 const optional=form.locator("details.contact-optional-details");
 if(await optional.count()){
  await optional.locator("summary").click();
 }
 const message=form.locator("textarea").first();
 await message.fill(testId+" | WYŁĄCZNIE TEST TECHNICZNY — nie jest zgłoszeniem klienta, proszę nie kontaktować się.");
 const consent=form.locator('input[type="checkbox"][required]').first();
 await consent.check();
 assert.ok(await form.locator('button[type="submit"]').isEnabled(),"Submit is disabled");
 const requestCount={n:0};
 page.on("request",req=>{if(req.url().startsWith("https://api.web3forms.com/submit")&&req.method()==="POST")requestCount.n++;});
 const responsePromise=page.waitForResponse(resp=>resp.url().startsWith("https://api.web3forms.com/submit")&&resp.request().method()==="POST",{timeout:26000});
 await form.locator('button[type="submit"]').click();
 submitted=true;
 const response=await responsePromise;
 let data={};
 try{data=await response.json();}catch{}
 const ok=response.status()===200&&data.success===true;
 console.log("WEB3FORMS_API_RESULT "+JSON.stringify({
  id:testId,
  http_status:response.status(),
  accepted_by_api:ok,
  request_count:requestCount.n,
  response_message:String(data.message||data.body?.message||"").slice(0,180),
  delivery_to_mailbox_verified:false
 }));
 assert.equal(requestCount.n,1,"More than one Web3Forms form POST");
 assert.ok(ok,"Web3Forms did not accept the labeled technical submission");
 await page.getByText(/Operator formularza potwierdził przyjęcie zgłoszenia/).waitFor({timeout:8000});
 console.log("SKD_UI_CONFIRMATION_OK: operator przyjął formularz. To NIE potwierdza doręczenia e-maila.");
} catch(error){
 console.error("FORM_SMOKE_ERROR "+JSON.stringify({
  id:testId,submitted,error:String(error.message||error).slice(0,500),network_errors:failures
 }));
 process.exitCode=1;
} finally{
 await browser.close();
}
