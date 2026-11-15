#!/usr/bin/env node
/** Offline regression for SKD email-draft callback on campaign and service pages. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {runInNewContext} from "node:vm";

const source=await readFile("v2/skd-copy-email.js","utf8");
const campaign=await readFile("v2/kampanie/skd.html","utf8");
const service=await readFile("v2/uslugi/kredyty-pln.html","utf8");
for(const [name,html] of [["campaign",campaign],["service",service]]){
 assert.ok(html.includes('src="/v2/skd-copy-email.js" defer'),name+": shared draft helper missing");
 assert.ok(html.includes('data-contact-form'),name+": callback form missing");
}
assert.ok(campaign.includes('class="btn campaign-skd-email"'));
assert.ok(campaign.includes('class="campaign-mobile-primary" href="mailto:'));
for(const marker of [
 'class="skd-email-action"',
 'class="skd-mobile-mail"',
 'class="service-hero-actions"',
 'class="service-cta"',
 'id="kontakt"'
])assert.ok(service.includes(marker),"Service page missing mailto location: "+marker);
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
const selectorChecks=[
 ".campaign-skd-email",
 ".campaign-skd .campaign-mobile-actions .campaign-mobile-primary",
 ".premium-subpage.theme-skd .service-hero-actions",
 ".premium-subpage.theme-skd .skd-document-actions .skd-email-action",
 ".premium-subpage.theme-skd #kontakt .actions",
 ".premium-subpage.theme-skd .service-cta .actions",
 ".premium-subpage.theme-skd .skd-mobile-quickbar .skd-mobile-mail"
];
const links=selectorChecks.map(()=>new Link());
const button={hidden:true,events:{},addEventListener(type,fn){this.events[type]=fn;}};
const status={textContent:""};
const phoneInput={value:""};
const timers=[];
let copied=null,observedQuery="";
const document={
 querySelector(sel){
  if(sel==="[data-skd-copy-email]")return button;
  if(sel==="[data-skd-copy-status]")return status;
  if(sel==='#formularz .contact-form input[autocomplete="tel"]')return phoneInput;
  return null;
 },
 querySelectorAll(sel){observedQuery=sel;return links;}
};
const navigator={clipboard:{writeText:async(value)=>{copied=value;}}};
const window={setTimeout:cb=>timers.push(cb)};
runInNewContext(source,{document,navigator,window,encodeURIComponent});
for(const selector of selectorChecks)assert.ok(observedQuery.includes(selector),"Missing click handler for "+selector);
assert.equal(button.hidden,false,"Copy button should be visible when clipboard works");
await button.events.click();
assert.equal(copied,mailbox);
assert.match(status.textContent,/pełną umowę/);
for(const [i,link] of links.entries())assert.ok(link.events.click,"Email CTA "+i+" needs a click handler");
const initial=links[0].href;
phoneInput.value="+48 796 441 345";
for(const [i,link] of links.entries()){
 link.events.click();
 const draft=decodeURIComponent(link.href);
 assert.ok(draft.includes("Mój numer telefonu: +48 796 441 345"),"Callback missing from mailto "+i);
 assert.ok(draft.includes("Pełną umowę dołączę jako załącznik."));
 assert.ok(link.href.startsWith("mailto:"+mailbox+"?"));
 assert.equal(timers.length,1);
 timers.shift()();
 assert.equal(link.href,initial,"Phone must not persist in DOM after email action "+i);
}
assert.equal(phoneInput.value,"+48 796 441 345","Building an email draft must not reset the form");
phoneInput.value="++xyz";
links[1].events.click();
let draft=decodeURIComponent(links[1].href);
assert.ok(draft.includes("Mój numer telefonu: [wpisz numer]"),"Invalid phone must never enter the draft");
timers.shift()();
phoneInput.value="123456";
links[3].events.click();
draft=decodeURIComponent(links[3].href);
assert.ok(draft.includes("[wpisz numer]"),"Short phone must be rejected");
timers.shift()();
phoneInput.value="(49) 123 456 789";
links[6].events.click();
draft=decodeURIComponent(links[6].href);
assert.ok(draft.includes("Mój numer telefonu: (49) 123 456 789"),"International phone should work");
timers.shift()();
phoneInput.value="";
links[4].events.click();
draft=decodeURIComponent(links[4].href);
assert.ok(draft.includes("Mój numer telefonu: [wpisz numer]"),"Empty callback should be requested");
timers.shift()();
assert.equal(timers.length,0);

// On the full SKD service page there is no campaign copy-email button.
// The draft enhancement must remain available even without a clipboard API.
{
 const isolated=new Link();
 const doc={
  querySelector:()=>null,
  querySelectorAll:()=>[isolated]
 };
 const deferred=[];
 runInNewContext(source,{document:doc,navigator:{},window:{setTimeout:fn=>deferred.push(fn)},encodeURIComponent});
 assert.ok(isolated.events.click,"Email CTA should work without a copy button or clipboard support");
 isolated.events.click();
 assert.ok(decodeURIComponent(isolated.href).includes("[wpisz numer]"));
 deferred.shift()();
 assert.equal(isolated.href,initial);
}
console.log("SKD_MAILTO_OK: two campaign and five service actions, private callback on click, native fallback preserved.");
