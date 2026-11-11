#!/usr/bin/env node
/* Syntetyczny pomiar wydajności produkcji: to NIE są dane od prawdziwych użytkowników. */
import {chromium} from "playwright";
import {mkdir,writeFile} from "node:fs/promises";
const origin="https://twoja-sprawa.pages.dev";
const routes=["/","/uslugi/szkody-gornicze","/uslugi/swiadczenie-wspierajace","/uslugi/kredyty-pln","/uslugi/kredyty-frankowe","/start"];
const profiles=[{name:"telefon-390",width:390,height:844,mobile:true},{name:"desktop-1440",width:1440,height:900,mobile:false}];
const results=[];
let browser;
const round=value=>Number.isFinite(value)?Math.round(value):null;
const median=xs=>{const s=xs.filter(Number.isFinite).sort((a,b)=>a-b);if(!s.length)return null;return round((s[Math.floor((s.length-1)/2)]+s[Math.floor(s.length/2)])/2);};
try{
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 for(const p of profiles){
  const context=await browser.newContext({viewport:{width:p.width,height:p.height},isMobile:p.mobile,hasTouch:p.mobile,deviceScaleFactor:1,locale:"pl-PL"});
  for(const route of routes){
   const page=await context.newPage();
   await page.addInitScript(()=>{
     window.__lab={lcp:null,cls:0};
     try{new PerformanceObserver(list=>{for(const e of list.getEntries())window.__lab.lcp=e.startTime;}).observe({type:"largest-contentful-paint",buffered:true});}catch{}
     try{new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__lab.cls+=e.value;}).observe({type:"layout-shift",buffered:true});}catch{}
   });
   const response=await page.goto(origin+route,{waitUntil:"domcontentloaded",timeout:30000});
   if(!response?.ok())throw Error("HTTP "+response?.status()+" "+route);
   await page.waitForLoadState("load",{timeout:15000}).catch(()=>{});
   await page.waitForTimeout(1100);
   const data=await page.evaluate(()=>{
      const nav=performance.getEntriesByType("navigation")[0];
      const paint=performance.getEntriesByType("paint").find(e=>e.name==="first-contentful-paint");
      return {
       ttfb:nav?.responseStart,domReady:nav?.domContentLoadedEventEnd,
       load:nav?.loadEventEnd>0?nav.loadEventEnd:null,
       fcp:paint?.startTime,lcp:window.__lab?.lcp,cls:window.__lab?.cls??null,
       resources:performance.getEntriesByType("resource").length,
       documentWidth:document.documentElement.scrollWidth,
       viewportWidth:document.documentElement.clientWidth,
       formPresent:Boolean(document.querySelector(".contact-form")),
       title:document.title
      };
   });
   const entry={route,profile:p.name,status:response.status(),ttfbMs:round(data.ttfb),domReadyMs:round(data.domReady),loadMs:round(data.load),fcpMs:round(data.fcp),lcpObservedMs:round(data.lcp),clsObserved:data.cls===null?null:Math.round(data.cls*1000)/1000,resourceCount:data.resources,horizontalOverflow:data.documentWidth>data.viewportWidth+2,formPresent:data.formPresent,title:data.title};
   results.push(entry);
   console.log("LAB_MEASURE",JSON.stringify(entry));
   await page.close();
  }
  await context.close();
 }
}finally{if(browser)await browser.close();}
const summary=profiles.map(p=>{
 const rows=results.filter(x=>x.profile===p.name);
 return {profile:p.name,samples:rows.length,medianTTFBms:median(rows.map(x=>x.ttfbMs)),medianFCPms:median(rows.map(x=>x.fcpMs)),medianLCPObservedMs:median(rows.map(x=>x.lcpObservedMs)),maxCLSObserved:Math.max(...rows.map(x=>x.clsObserved??0)),pagesWithOverflow:rows.filter(x=>x.horizontalOverflow).length};
});
const report={measuredAt:new Date().toISOString(),origin,method:"Chromium headless, synthetic GitHub runner, single visit per route and viewport; not real user Core Web Vitals",routes,profiles,summary,results};
await mkdir("reports",{recursive:true});
await writeFile("reports/metrics-after-release.json",JSON.stringify(report,null,2)+"\n");
const body="# Syntetyczny pomiar strony Twoja Sprawa\n\nData UTC: "+report.measuredAt+"\n\nUwaga: to pomiar laboratoryjny w GitHub Actions, **nie oznacza ruchu, leadów ani wyników rzeczywistych użytkowników**.\n\n| Urządzenie | Próbek | Mediana TTFB (ms) | Mediana FCP (ms) | Zaobserwowana mediana LCP (ms) | Najwyższe zaobserwowane CLS | Poziomy overflow |\n|---|---:|---:|---:|---:|---:|---:|\n"+summary.map(s=>"| "+s.profile+" | "+s.samples+" | "+(s.medianTTFBms??"brak")+" | "+(s.medianFCPms??"brak")+" | "+(s.medianLCPObservedMs??"brak")+" | "+s.maxCLSObserved+" | "+s.pagesWithOverflow+" |").join("\n")+"\n\nSzczegóły każdego URL w metrics-after-release.json. Brak danych o odwiedzinach i konwersji bez połączonego panelu analitycznego.\n";
await writeFile("reports/metrics-after-release.md",body);
console.log("LAB_SUMMARY",JSON.stringify(summary));
