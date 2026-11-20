#!/usr/bin/env node
/** Mobilny pasek kontaktu — test bez przeglądarki, cookies, połączeń i wysyłki leadów. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {runInNewContext} from "node:vm";
const js=await readFile("v2/mobile-service-cta.js","utf8");
const css=await readFile("v2/mobile-service-cta.css","utf8");
class Element{
 constructor(tag){this.tag=tag;this.children=[];this.attrs={};this.textContent="";this.hidden=false;this.events={};
  this.classNames=new Set();
  this.classList={toggle:(name,on)=>{if(on)this.classNames.add(name);else this.classNames.delete(name);},
   contains:name=>this.classNames.has(name)};
 }
 append(...items){this.children.push(...items);}
 setAttribute(k,v){this.attrs[k]=v;}
 contains(node){return node===this||this.children.some(child=>child.contains?.(node));}
}
for(const [variant,phone,person] of [["szkody","+48796441345","Wojciecha"],["swiadczenie","+48500171531","Pauliny"],["renty","+48500171531","Pauliny"],["skd","+48796441345","Wojciecha"]]){
 const documentEvents={};
 let focused=null;const scheduled=[];
 const body=new Element("body"),form=new Element("form"),target=new Element("section");
 target.append(form);
 const document={
  currentScript:{getAttribute:k=>k==="data-service"?variant:null},
  querySelector:sel=>sel==="#formularz [data-contact-form]"?form:null,
  getElementById:id=>id==="formularz"?target:null,
  createElement:tag=>new Element(tag),
  body,
  addEventListener:(type,cb)=>{documentEvents[type]=cb;},
  get activeElement(){return focused;}
 };
 let observerCallback=null;let observed=null;
 const viewportCallbacks={};
 const visualViewport={height:800,addEventListener:(name,fn)=>viewportCallbacks[name]=fn};
 class IntersectionObserver{
  constructor(cb,options){observerCallback=cb;assert.equal(options.threshold,0);}
  observe(el){observed=el;}
 }
 runInNewContext(js,{document,window:{IntersectionObserver,innerHeight:800,visualViewport},IntersectionObserver,setTimeout:cb=>scheduled.push(cb)});
 assert.equal(body.children.length,1,variant+" should add one mobile navigation");
 const nav=body.children[0];
 assert.equal(nav.tag,"nav");
 assert.equal(nav.attrs["aria-label"],"Szybki kontakt w sprawie wybranej usługi");
 assert.equal(nav.className,"mobile-service-cta");
 assert.equal(nav.children.length,2);
 const [call,lead]=nav.children;
 assert.equal(variant==="skd"?call.href.startsWith("mailto:wojciech.obieglo@votum-ds.pl?subject="):call.href==="tel:"+phone,true);
 if(variant==="skd")assert.ok(decodeURIComponent(call.href).includes("Mój numer telefonu: [wpisz numer]"));
 assert.ok(call.attrs["aria-label"].includes(person));
 assert.equal(lead.href,"#formularz");
 assert.equal(lead.textContent,variant==="skd"?"Zostaw numer telefonu":"Zostaw zgłoszenie");
 assert.equal(observed,target);
 observerCallback([{isIntersecting:true}]);assert.equal(nav.hidden,true);
 assert.equal(body.classList.contains("has-visible-mobile-service-cta"),false);
 observerCallback([{isIntersecting:false}]);assert.equal(nav.hidden,false);
 assert.equal(body.classList.contains("has-visible-mobile-service-cta"),true);
 // Chat guide and contact bar must never cover each other.
 assert.equal(typeof documentEvents["twoja-sprawa:chat-visibility"],"function");
 documentEvents["twoja-sprawa:chat-visibility"]({detail:{open:true}});
 assert.equal(nav.hidden,true,"Open guide must hide bar: "+variant);
 assert.equal(body.classList.contains("has-visible-mobile-service-cta"),false,"Hidden CTA must free space");
 observerCallback([{isIntersecting:false}]);
 assert.equal(nav.hidden,true,"Offscreen form must not restore bar over guide: "+variant);
 documentEvents["twoja-sprawa:chat-visibility"]({detail:{open:false}});
 assert.equal(nav.hidden,false,"Closing guide must restore bar: "+variant);
 assert.equal(body.classList.contains("has-visible-mobile-service-cta"),true);
 visualViewport.height=360;viewportCallbacks.resize();
 assert.equal(nav.hidden,true,"Android keyboard must hide the CTA before observer updates");
 assert.equal(body.classList.contains("has-visible-mobile-service-cta"),false,"Keyboard must not reserve CTA space");
 visualViewport.height=800;viewportCallbacks.resize();
 assert.equal(nav.hidden,false,"CTA returns after virtual keyboard closes");
 focused=form;documentEvents.focusin({target:form});assert.equal(nav.hidden,true);
 assert.equal(body.classList.contains("has-visible-mobile-service-cta"),false,"Focused form frees bottom space");
 documentEvents.focusout({target:form});focused=null;scheduled.shift()();assert.equal(nav.hidden,false,"Bar must reappear after leaving the form");
 observerCallback([{isIntersecting:true}]);assert.equal(nav.hidden,true,"Visible form keeps bar hidden");
 observerCallback([{isIntersecting:false}]);assert.equal(nav.hidden,false);
}
// Older Android browsers without IntersectionObserver should still hide this
// bar when the form is visible, so it cannot cover form actions.
{
 const listeners={};
 const body=new Element("body"),form=new Element("form"),target=new Element("section");
 target.append(form);
 let rect={top:930,bottom:1450},focused=null;
 target.getBoundingClientRect=()=>rect;
 const document={
  currentScript:{getAttribute:key=>key==="data-service"?"swiadczenie":null},
  querySelector:sel=>sel==="#formularz [data-contact-form]"?form:null,
  getElementById:id=>id==="formularz"?target:null,
  createElement:tag=>new Element(tag),
  body,
  addEventListener:(key,fn)=>{listeners["document:"+key]=fn;},
  get activeElement(){return focused;}
 };
 const window={innerHeight:780,addEventListener:(key,fn)=>{listeners[key]=fn;}};
 runInNewContext(js,{document,window,setTimeout:fn=>fn()});
 const bar=body.children[0];
 assert.ok(bar,"A fallback browser must receive the contact bar");
 assert.equal(bar.hidden,false);
 assert.equal(bar.children[0].href,"tel:+48500171531","Support phone must reach Paulina");
 assert.equal(typeof listeners.scroll,"function");
 assert.equal(typeof listeners.resize,"function");
 rect={top:260,bottom:740};listeners.scroll();
 assert.equal(bar.hidden,true,"The form must not be covered");
 rect={top:-900,bottom:-150};listeners.resize();
 assert.equal(bar.hidden,false,"The bar should return past the form");
 assert.equal(body.classList.contains("has-visible-mobile-service-cta"),true,
  "Older Android needs explicit footer spacing");
 assert.equal(typeof listeners["document:twoja-sprawa:chat-visibility"],"function");
 listeners["document:twoja-sprawa:chat-visibility"]({detail:{open:true}});
 assert.equal(bar.hidden,true,"Older Android must hide CTA under open guide");
 listeners.resize();
 assert.equal(bar.hidden,true,"Resize must not restore CTA over open guide");
 listeners["document:twoja-sprawa:chat-visibility"]({detail:{open:false}});
 assert.equal(bar.hidden,false,"Older Android should restore CTA after guide closes");
 focused=form;listeners["document:focusin"]({target:form});
 assert.equal(bar.hidden,true);
 focused=null;listeners["document:focusout"]({target:form});
 assert.equal(bar.hidden,false);
}
// SKD has its own existing mobile quickbar on the service page and a separate
// campaign action bar. Do not stack another fixed bar over their controls.
for(const [path,selector] of [["v2/uslugi/kredyty-pln.html","skd-mobile-quickbar"],["v2/kampanie/skd.html","campaign-mobile-actions"]]){
 const html=await readFile(path,"utf8");
 assert.ok(html.includes(selector),"Existing SKD mobile action bar missing: "+path);
 assert.ok(!html.includes('data-service="skd" defer'),"Duplicated SKD sticky CTA: "+path);
}
const body=new Element("body");
runInNewContext(js,{document:{currentScript:{getAttribute:()=>"inny"},querySelector:()=>null,body,createElement:tag=>new Element(tag)},window:{}});
assert.equal(body.children.length,0,"Nonflagship pages must not receive the bar");
assert.ok(css.includes("@media(max-width:650px)")&&css.includes("env(safe-area-inset-bottom)"));
assert.ok(css.includes(".mobile-service-cta[hidden]{display:none!important}"));
assert.ok(css.includes("body:has(.chat-assistant.is-open) .mobile-service-cta"));
assert.ok(css.includes("body.has-visible-mobile-service-cta"),"Old Android CSS fallback missing");
assert.ok(!/fetch\s*\(|localStorage|sessionStorage|sendBeacon/.test(js));
for(const [path,kind] of [["v2/uslugi/szkody-gornicze.html","szkody"],["v2/uslugi/swiadczenie-wspierajace.html","swiadczenie"],["v2/uslugi/renty-powypadkowe.html","renty"]]){
 const h=await readFile(path,"utf8");
 assert.ok(h.includes('src="/v2/mobile-service-cta.js" data-service="'+kind+'"'));
 assert.ok(h.includes('href="/v2/mobile-service-cta.css"'));
}
console.log("MOBILE_SERVICE_CTA_OK: 3 podstrony z jednolitym paskiem, bez dublowania SKD, poprawne przywracanie paska, brak śledzenia");

// Public pages must not misdirect SKD to support and rent queries to mining contacts.
const about=await readFile("v2/o-nas.html","utf8");
const contact=await readFile("v2/kontakt.html","utf8");
const rents=await readFile("v2/uslugi/renty-powypadkowe.html","utf8");
for(const page of [about,contact]){
 assert.ok(page.includes("wojciech.obieglo@votum-ds.pl")&&page.includes("paulina.chandrala@votum-ds.pl"),"Both direct advisor addresses missing");
}
const person=about.slice(about.indexOf('<article id="paulina"'),about.indexOf('</article>',about.indexOf('<article id="paulina"')));
assert.ok(!person.includes("SKD")&&!person.includes("PLN"),"About page assigned SKD to the support adviser");
const paulina=contact.slice(contact.indexOf('data-persona="support"'),contact.indexOf('</article>',contact.indexOf('data-persona="support"')));
assert.ok(!paulina.includes("SKD")&&!paulina.includes("PLN"),"Contact page assigned SKD to the support adviser");
assert.ok(rents.includes('href="tel:+48500171531"')&&!rents.includes('href="tel:+48796441345"'),"Rent conversion CTAs must use Paulina's number");
assert.ok(rents.includes('href="mailto:paulina.chandrala@votum-ds.pl?subject='),"Rent email must go to Paulina");
