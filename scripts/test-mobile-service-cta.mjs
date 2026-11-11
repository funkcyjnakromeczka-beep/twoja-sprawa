#!/usr/bin/env node
/** Mobilny pasek kontaktu — test bez przeglądarki, cookies, połączeń i wysyłki leadów. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {runInNewContext} from "node:vm";
const js=await readFile("v2/mobile-service-cta.js","utf8");
const css=await readFile("v2/mobile-service-cta.css","utf8");
class Element{
 constructor(tag){this.tag=tag;this.children=[];this.attrs={};this.textContent="";this.hidden=false;this.events={};}
 append(...items){this.children.push(...items);}
 setAttribute(k,v){this.attrs[k]=v;}
 contains(node){return node===this||this.children.some(child=>child.contains?.(node));}
}
for(const [variant,phone,person] of [["szkody","+48796441345","Wojciecha"],["swiadczenie","+48500171531","Pauliny"]]){
 const documentEvents={};
 const body=new Element("body"),form=new Element("form"),target=new Element("section");
 target.append(form);
 const document={
  currentScript:{getAttribute:k=>k==="data-service"?variant:null},
  querySelector:sel=>sel==="#formularz [data-contact-form]"?form:null,
  getElementById:id=>id==="formularz"?target:null,
  createElement:tag=>new Element(tag),
  body,
  addEventListener:(type,cb)=>{documentEvents[type]=cb;}
 };
 let observerCallback=null;let observed=null;
 class IntersectionObserver{
  constructor(cb,options){observerCallback=cb;assert.equal(options.threshold,0);}
  observe(el){observed=el;}
 }
 runInNewContext(js,{document,window:{IntersectionObserver},IntersectionObserver});
 assert.equal(body.children.length,1,variant+" should add one mobile navigation");
 const nav=body.children[0];
 assert.equal(nav.tag,"nav");
 assert.equal(nav.attrs["aria-label"],"Szybki kontakt w sprawie wybranej usługi");
 assert.equal(nav.className,"mobile-service-cta");
 assert.equal(nav.children.length,2);
 const [call,lead]=nav.children;
 assert.equal(call.href,"tel:"+phone);
 assert.ok(call.attrs["aria-label"].includes(person));
 assert.equal(lead.href,"#formularz");
 assert.equal(lead.textContent,"Zostaw zgłoszenie");
 assert.equal(observed,target);
 observerCallback([{isIntersecting:true}]);assert.equal(nav.hidden,true);
 observerCallback([{isIntersecting:false}]);assert.equal(nav.hidden,false);
 documentEvents.focusin({target:form});assert.equal(nav.hidden,true);
}
const body=new Element("body");
runInNewContext(js,{document:{currentScript:{getAttribute:()=>"inny"},querySelector:()=>null,body,createElement:tag=>new Element(tag)},window:{}});
assert.equal(body.children.length,0,"Nonflagship pages must not receive the bar");
assert.ok(css.includes("@media(max-width:650px)")&&css.includes("env(safe-area-inset-bottom)"));
assert.ok(css.includes(".mobile-service-cta[hidden]{display:none!important}"));
assert.ok(css.includes("body:has(.chat-assistant.is-open) .mobile-service-cta"));
assert.ok(!/fetch\s*\(|localStorage|sessionStorage|sendBeacon/.test(js));
for(const [path,kind] of [["v2/uslugi/szkody-gornicze.html","szkody"],["v2/uslugi/swiadczenie-wspierajace.html","swiadczenie"]]){
 const h=await readFile(path,"utf8");
 assert.ok(h.includes('src="/v2/mobile-service-cta.js" data-service="'+kind+'"'));
 assert.ok(h.includes('href="/v2/mobile-service-cta.css"'));
}
console.log("MOBILE_SERVICE_CTA_OK: 2 numery, dopasowanie usługi, formularz, ukrywanie, chatbot, brak śledzenia");
