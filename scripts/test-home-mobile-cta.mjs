#!/usr/bin/env node
/** Offline tests for the homepage mobile contact bar; no lead submission. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {runInNewContext} from "node:vm";

const js=await readFile("v2/home-mobile-cta.js","utf8");
const css=await readFile("v2/home-flow.css","utf8");
const html=await readFile("v2/index.html","utf8");
assert.ok(html.includes('src="/v2/home-mobile-cta.js" defer'),"Homepage must load mobile visibility script");
assert.ok(html.includes('class="mobile-contact-bar"'),"Existing native shortcuts must remain present");
assert.ok(css.includes(".premium-v2 .mobile-contact-bar[hidden]{display:none!important}"),"Hidden bar must override mobile grid");
assert.ok(!/fetch\s*\(|sendBeacon|localStorage|sessionStorage|document\.cookie/.test(js),"No tracking or requests");

{
 const callbacks={},timers=[];
 let focused=null,rect={top:1100,bottom:1670};
 const input={};
 const form={
  getBoundingClientRect:()=>rect,
  contains:node=>node===input
 };
 const bar={hidden:false};
 const document={
  querySelector:selector=>selector===".mobile-contact-bar"?bar:null,
  getElementById:id=>id==="kontakt"?form:null,
  get activeElement(){return focused;},
  addEventListener:(event,fn)=>callbacks["doc:"+event]=fn
 };
 const window={
  innerHeight:790,
  visualViewport:{height:790,addEventListener:(event,fn)=>callbacks["visual:"+event]=fn},
  addEventListener:(event,fn)=>callbacks[event]=fn,
  setTimeout:fn=>timers.push(fn)
 };
 runInNewContext(js,{document,window});
 assert.equal(bar.hidden,false,"Offscreen contact form should not obscure shortcuts");
 assert.equal(typeof callbacks.scroll,"function","Old Android scroll fallback missing");
 assert.equal(typeof callbacks.resize,"function","Old Android resize fallback missing");
 rect={top:320,bottom:1120};callbacks.scroll();
 assert.equal(bar.hidden,true,"Visible form must hide mobile bar");
 rect={top:-1200,bottom:-20};callbacks["visual:resize"]();
 assert.equal(bar.hidden,false,"Bar must return below form");
 focused=input;callbacks["doc:focusin"]({target:input});
 assert.equal(bar.hidden,true,"Keyboard focus must hide mobile bar");
 focused=null;callbacks["doc:focusout"]({target:input});
 assert.equal(timers.length,1,"Focusout should defer until active element changes");
 timers.shift()();assert.equal(bar.hidden,false,"Bar must return after leaving offscreen form");
}

{
 let observed,callback,focused=null;
 const input={};
 const contact={contains:node=>node===input};
 const bar={hidden:false},callbacks={},timers=[];
 const document={
  querySelector:selector=>selector===".mobile-contact-bar"?bar:null,
  getElementById:id=>id==="kontakt"?contact:null,
  get activeElement(){return focused;},
  addEventListener:(event,fn)=>callbacks[event]=fn
 };
 class IntersectionObserver{
  constructor(fn,opts){callback=fn;assert.equal(opts.threshold,0);assert.equal(opts.rootMargin,"0px 0px -88px 0px");}
  observe(target){observed=target;}
 }
 const window={IntersectionObserver,setTimeout:fn=>timers.push(fn)};
 runInNewContext(js,{document,window,IntersectionObserver});
 assert.equal(observed,contact);
 callback([{isIntersecting:true}]);assert.equal(bar.hidden,true,"Intersection should hide bar");
 callback([{isIntersecting:false}]);assert.equal(bar.hidden,false,"No intersection should restore bar");
 focused=input;callbacks.focusin({target:input});assert.equal(bar.hidden,true);
 callback([{isIntersecting:false}]);assert.equal(bar.hidden,true,"Focused input keeps bar hidden");
 callbacks.focusout({target:input});focused=null;
 timers.shift()();assert.equal(bar.hidden,false);
}

{
 const document={querySelector:()=>null,getElementById:()=>null};
 runInNewContext(js,{document,window:{}});
}
console.log("HOME_MOBILE_CTA_OK: form visibility, focus, old Android fallback, native links and privacy.");
