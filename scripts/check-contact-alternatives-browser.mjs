#!/usr/bin/env node
/**
 * Real Chromium smoke test for Twoja Sprawa direct-contact fallback.
 * Read-only: no submitting forms and no customer data.
 */
import assert from "node:assert/strict";
import {mkdir} from "node:fs/promises";
import {chromium} from "playwright";
const origin="https://twoja-sprawa.pages.dev";
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,locale:"pl-PL",isMobile:true,hasTouch:true});
const page=await context.newPage();
let sent=0;
page.on("request",r=>{if(r.method()==="POST"&&r.url().includes("web3forms.com"))sent++});
try {
 await mkdir("screenshots",{recursive:true});
 for(const {path,service,mail,phone,file} of [
  {path:"/uslugi/swiadczenie-wspierajace",service:"Świadczenie wspierające",mail:"paulina.chandrala@votum-ds.pl",phone:"tel:+48500171531",file:"contact-backup-support-mobile.png"},
  {path:"/kampanie/skd",service:"Kredyt w PLN / SKD",mail:"wojciech.obieglo@votum-ds.pl",phone:"tel:+48796441345",file:"contact-backup-skd-mobile.png"}
 ]){
  await page.goto(origin+path,{waitUntil:"domcontentloaded",timeout:35000});
  const form=page.locator("form.contact-form").first();
  await form.waitFor({state:"visible",timeout:18000});
  assert.equal(await form.locator("select[required]").first().inputValue(),service,"Incorrect initial service "+path);
  const details=form.locator("details.contact-direct-alternatives");
  await details.waitFor({state:"visible",timeout:10000});
  await details.locator("summary").click();
  assert.equal(await details.locator(".contact-direct-call").getAttribute("href"),phone,"Wrong phone "+path);
  assert.ok((await details.locator(".contact-direct-email").getAttribute("href")).startsWith("mailto:"+mail+"?subject="),"Wrong recipient "+path);
  const callBox=await details.boundingBox();
  assert.ok(callBox && callBox.width>=280,"Direct contact must fit the mobile viewport");
  await details.screenshot({path:"screenshots/"+file});
  console.log("MOBILE_DIRECT_CONTACT_OK "+JSON.stringify({path,service,phone,email:mail,screenshot:file}));
 }
 await page.goto(origin+"/kontakt",{waitUntil:"domcontentloaded",timeout:35000});
 const form=page.locator("form.contact-form").first();
 await form.waitFor({state:"visible",timeout:18000});
 const select=form.locator("select[required]").first();
 const details=form.locator("details.contact-direct-alternatives");
 await details.locator("summary").click();
 await select.selectOption("Świadczenie wspierające");
 assert.equal(await details.locator(".contact-direct-call").getAttribute("href"),"tel:+48500171531");
 await select.selectOption("Kredyt w PLN / SKD");
 assert.equal(await details.locator(".contact-direct-call").getAttribute("href"),"tel:+48796441345");
 assert.ok((await details.locator(".contact-direct-email").getAttribute("href")).startsWith("mailto:wojciech.obieglo@votum-ds.pl?subject="));

 // Real mobile-browser check without JavaScript: static fallback must remain visible.
 const noJs=await browser.newContext({viewport:{width:390,height:844},locale:"pl-PL",javaScriptEnabled:false});
 const noJsPage=await noJs.newPage();
 for(const item of [
  {path:"/uslugi/szkody-gornicze",phone:"tel:+48796441345",email:"wojciech.obieglo@votum-ds.pl"},
  {path:"/uslugi/swiadczenie-wspierajace",phone:"tel:+48500171531",email:"paulina.chandrala@votum-ds.pl"},
  {path:"/uslugi/renty-powypadkowe",phone:"tel:+48500171531",email:"paulina.chandrala@votum-ds.pl"},
  {path:"/uslugi/kredyty-frankowe",phone:"tel:+48796441345",email:"wojciech.obieglo@votum-ds.pl"},
  {path:"/uslugi/sluzebnosc-przesylu",phone:"tel:+48796441345",email:"wojciech.obieglo@votum-ds.pl"},
  {path:"/kampanie/skd",phone:"tel:+48796441345",email:"wojciech.obieglo@votum-ds.pl"}
 ]){
  await noJsPage.goto(origin+item.path,{waitUntil:"domcontentloaded",timeout:30000});
  const mount=noJsPage.locator("[data-contact-form]").first();
  const fallback=mount.locator(".contact-load-fallback");
  await fallback.waitFor({state:"visible",timeout:10000});
  assert.equal(await mount.locator("form.contact-form").count(),0,"No JS must not show dynamic form");
  assert.equal(await fallback.locator('a[href="'+item.phone+'"]').count(),1,"Missing no-JS telephone "+item.path);
  assert.equal(await fallback.locator('a[href^="mailto:'+item.email+'?subject="]').count(),1,"Missing no-JS email "+item.path);
  console.log("NO_JS_CONTACT_OK "+item.path);
 }
 await noJs.close();
 assert.equal(sent,0,"A read-only contact test must never submit a lead");
 console.log("DYNAMIC_ROUTING_OK: contact route switches to Paulina then Wojciech; 0 submissions");
} catch(error) {
 console.error("BROWSER_CHECK_FAILED "+String(error.stack||error).slice(0,1300));
 process.exitCode=1;
} finally {
 await browser.close();
}
