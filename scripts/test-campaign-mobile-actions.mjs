#!/usr/bin/env node
/** Mobile campaign quick bar: no lead sends, no tracking, no browser required. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {runInNewContext} from "node:vm";
const source=await readFile("v2/campaign-mobile-actions.js","utf8");
const homepage=await readFile("v2/index.html","utf8");
const support=await readFile("v2/kampanie/swiadczenie-wspierajace.html","utf8");
const css=await readFile("v2/styles.css","utf8");
const homepageNav=homepage.match(/<nav class="mobile-quick-nav"[\s\S]*?<\/nav>/)?.[0]||"";
assert.ok(homepageNav.includes("SKD — analiza umowy</a>"),
 "Mobile SKD must not imply upload through a basic contact form");
assert.ok(homepageNav.includes('aria-label="SKD — analiza umowy,'),
 "The SKD accessible name must include the visible link text");
assert.ok(homepageNav.includes('href="/v2/uslugi/kredyty-pln.html"'),
 "The mobile SKD link must lead to the information and contact page");
const supportBar=support.match(/<aside class="campaign-mobile-actions"[\s\S]*?<\/aside>/)?.[0]||"";
assert.ok(supportBar.includes('<a class="campaign-mobile-primary" href="#formularz">Zostaw kontakt</a>'));
assert.ok(supportBar.includes('<a class="campaign-mobile-call" href="tel:+48500171531">Zadzwoń do Pauliny</a>'));
assert.ok(!supportBar.includes("Zgłoś sprawę"),
 "Do not suggest the contact form submits an official WZON or ZUS request");
assert.ok(css.includes(".campaign-mobile-actions[hidden]{display:none!important}"),
 "The sticky bar must obey the script's hidden state");
assert.ok(!/\bfetch\s*\(|sendBeacon|localStorage|sessionStorage|document\.cookie/.test(source),
 "The visual-viewport guard must not collect visitor data");
{
 const callbacks={},timers=[];
 let observerCallback,observed,focused=null;
 const field={};
 const region={contains:node=>node===field};
 const bar={hidden:false};
 const document={
  querySelector:selector=>selector===".campaign-mobile-actions"?bar:null,
  getElementById:id=>id==="formularz"?region:null,
  get activeElement(){return focused;},
  addEventListener:(key,fn)=>callbacks["doc:"+key]=fn
 };
 class IntersectionObserver{
  constructor(fn,opts){observerCallback=fn;assert.equal(opts.rootMargin,"0px 0px -82px 0px");assert.equal(opts.threshold,0);}
  observe(node){observed=node;}
 }
 const visualViewport={height:790,addEventListener:(event,fn)=>callbacks["visual:"+event]=fn};
 const window={innerHeight:790,visualViewport,IntersectionObserver,
  setTimeout:fn=>timers.push(fn)};
 runInNewContext(source,{document,window,IntersectionObserver});
 assert.equal(observed,region);
 assert.equal(bar.hidden,false);
 observerCallback([{isIntersecting:true}]);assert.equal(bar.hidden,true,"Visible form hides bar");
 observerCallback([{isIntersecting:false}]);assert.equal(bar.hidden,false,"Bar returns offscreen");
 visualViewport.height=360;callbacks["visual:resize"]();
 assert.equal(bar.hidden,true,"Android virtual keyboard must hide campaign CTA");
 visualViewport.height=790;callbacks["visual:resize"]();
 assert.equal(bar.hidden,false,"CTA returns when keyboard closes");
 focused=field;callbacks["doc:focusin"]({target:field});
 assert.equal(bar.hidden,true,"Focused contact field hides the CTA");
 focused=null;callbacks["doc:focusout"]({target:field});
 assert.equal(timers.length,1);
 timers.shift()();assert.equal(bar.hidden,false);
}
{
 const callbacks={},timers=[];
 let rect={top:1200,bottom:1600},focused=null;
 const field={};
 const region={contains:node=>node===field,getBoundingClientRect:()=>rect};
 const bar={hidden:false};
 const document={
  querySelector:s=>s===".campaign-mobile-actions"?bar:null,
  getElementById:id=>id==="formularz"?region:null,
  get activeElement(){return focused;},
  addEventListener:(key,fn)=>callbacks["doc:"+key]=fn
 };
 const visualViewport={height:780,addEventListener:(key,fn)=>callbacks["visual:"+key]=fn};
 const window={innerHeight:780,visualViewport,
  addEventListener:(key,fn)=>callbacks[key]=fn,setTimeout:fn=>timers.push(fn)};
 runInNewContext(source,{document,window});
 assert.equal(bar.hidden,false,"Older Android requires native-link fallback");
 assert.equal(typeof callbacks.scroll,"function");
 rect={top:240,bottom:800};callbacks.scroll();
 assert.equal(bar.hidden,true,"Visible form must hide bar on old Android");
 rect={top:-1000,bottom:-200};callbacks.resize();
 assert.equal(bar.hidden,false,"CTA returns after scrolling past form");
 visualViewport.height=350;callbacks["visual:resize"]();
 assert.equal(bar.hidden,true,"Keyboard shrinks old Android viewport");
 visualViewport.height=780;callbacks["visual:resize"]();
 assert.equal(bar.hidden,false,"CTA returns after keyboard closes");
 focused=field;callbacks["doc:focusin"]({target:field});
 assert.equal(bar.hidden,true);
 focused=null;callbacks["doc:focusout"]({target:field});
 timers.shift()();assert.equal(bar.hidden,false);
}
console.log("CAMPAIGN_MOBILE_ACTIONS_OK: clear support CTA, safe SKD wording and old/new Android keyboard guard.");
