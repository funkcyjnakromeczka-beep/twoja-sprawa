#!/usr/bin/env node
/** Offline regression for SKD email-draft callback: no real mail, leads or uploads. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {runInNewContext} from "node:vm";

const source=await readFile("v2/skd-copy-email.js","utf8");
const campaign=await readFile("v2/kampanie/skd.html","utf8");
assert.ok(campaign.includes('src="/v2/skd-copy-email.js" defer'));
assert.ok(campaign.includes('class="btn campaign-skd-email"'));
assert.ok(campaign.includes('class="campaign-mobile-primary" href="mailto:'));
assert.ok(!/fetch\s*\(|sendBeacon|localStorage|sessionStorage/.test(source));

const mailbox="wojciech.obieglo@votum-ds.pl";
class Link {
 constructor(){
  this.attrs={href:"mailto:"+mailbox+"?subject=Umowa%20kredytowa%20do%20analizy%20SKD"};
  this.href=this.attrs.href;
  this.events={};
 }
 getAttribute(k){return this.attrs[k]??null;}
 setAttribute(k,v){this.attrs[k]=v;if(k==="href")this.href=v;}
 addEventListener(name,fn){this.events[name]=fn;}
}
const first=new Link(),mobile=new Link(),button={hidden:true,events:{},addEventListener(type,fn){this.events[type]=fn;}};
const status={textContent:""};
const phoneInput={value:""};
const timers=[];
let copied=null;
const document={
 querySelector(sel){
  if(sel==="[data-skd-copy-email]")return button;
  if(sel==="[data-skd-copy-status]")return status;
  if(sel==='#formularz .contact-form input[autocomplete="tel"]')return phoneInput;
  return null;
 },
 querySelectorAll(sel){
  if(sel===".campaign-skd-email, .campaign-skd .campaign-mobile-actions .campaign-mobile-primary")return [first,mobile];
  return [];
 }
};
const navigator={clipboard:{writeText:async(value)=>{copied=value;}}};
const window={setTimeout:cb=>timers.push(cb)};
runInNewContext(source,{document,navigator,window,encodeURIComponent});
assert.equal(button.hidden,false,"Copy button should be visible when clipboard works");
await button.events.click();
assert.equal(copied,mailbox);
assert.match(status.textContent,/pełną umowę/);
assert.ok(first.events.click&&mobile.events.click,"Both mailto CTAs need a click handler");
const initial=first.href;
phoneInput.value="+48 796 441 345";
first.events.click();
let draft=decodeURIComponent(first.href);
assert.ok(draft.includes("Mój numer telefonu: +48 796 441 345"));
assert.ok(draft.includes("Pełną umowę dołączę jako załącznik."));
assert.ok(first.href.startsWith("mailto:"+mailbox+"?"));
assert.ok(!mobile.href.includes("+48"),"No background phone propagation to other controls");
timers.shift()();
assert.equal(first.href,initial,"Personal phone must be removed from DOM after click");

phoneInput.value="++xyz";
mobile.events.click();
draft=decodeURIComponent(mobile.href);
assert.ok(draft.includes("Mój numer telefonu: [wpisz numer]"),"Invalid phone must never enter the draft");
timers.shift()();
assert.equal(mobile.href,initial);

phoneInput.value="123456";
first.events.click();
draft=decodeURIComponent(first.href);
assert.ok(draft.includes("[wpisz numer]"),"Short phone must be rejected");
timers.shift()();

phoneInput.value="(49) 123 456 789";
first.events.click();
draft=decodeURIComponent(first.href);
assert.ok(draft.includes("Mój numer telefonu: (49) 123 456 789"),"Formatted international phone should work");
timers.shift()();
assert.equal(timers.length,0);
console.log("SKD_MAILTO_OK: valid callback copied only by click, invalid phones omitted, native fallback preserved.");
