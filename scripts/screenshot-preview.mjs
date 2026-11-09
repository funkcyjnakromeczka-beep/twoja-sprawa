#!/usr/bin/env node
/** Manual GitHub Actions screenshot job; local preview only. */
import {spawn} from "node:child_process";
import {mkdir} from "node:fs/promises";
import {chromium} from "playwright";
const server=spawn("python3",["-m","http.server","4173","--bind","127.0.0.1","--directory","dist-preview"],{stdio:"ignore"});
const wait=async()=>{
 for(let i=0;i<40;i++){
  try{const response=await fetch("http://127.0.0.1:4173/");if(response.ok)return;}catch{}
  await new Promise(resolve=>setTimeout(resolve,250));
 }
 throw Error("Preview server unavailable");
};
let browser;
try{
 await wait();
 await mkdir("screenshots",{recursive:true});
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const sizes=[["telefon-360",360,800],["telefon-390",390,844],["tablet-768",768,1024],["desktop-1440",1440,900]];
 for(const [name,width,height] of sizes){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  await page.goto("http://127.0.0.1:4173/",{waitUntil:"networkidle"});
  await page.screenshot({path:"screenshots/"+name+".png",fullPage:true});
  const measurements=await page.evaluate(()=>({
   viewport:document.documentElement.clientWidth,
   scrollWidth:document.documentElement.scrollWidth,
   heading:document.querySelector("h1")?.textContent?.trim(),
   form:!!document.querySelector(".contact-form")
  }));
  console.log(name,JSON.stringify(measurements));
  if(measurements.scrollWidth>measurements.viewport+2)throw Error("Horizontal overflow on "+name);
  if(!measurements.heading||!measurements.form)throw Error("Missing hero or contact form on "+name);
  await page.close();
 }
 const routes=[["szkody-gornicze","/uslugi/szkody-gornicze.html"],["swiadczenie-wspierajace","/uslugi/swiadczenie-wspierajace.html"],["skd","/uslugi/kredyty-pln.html"]];
 for(const [name,route] of routes){
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const response=await page.goto("http://127.0.0.1:4173"+route,{waitUntil:"networkidle"});
  if(!response?.ok())throw Error("Missing service page: "+route);
  const state=await page.evaluate(()=>({form:!!document.querySelector(".contact-form"),service:document.querySelector(".contact-form select")?.value,scrollWidth:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
  if(!state.form||!state.service)throw Error("Missing configured form on "+route);
  if(state.scrollWidth>state.viewport+2)throw Error("Horizontal overflow on "+route);
  await page.screenshot({path:"screenshots/usluga-"+name+"-telefon.png",fullPage:true});
  console.log(route,JSON.stringify(state));
  await page.close();
 }
}finally{
 if(browser)await browser.close();
 server.kill("SIGTERM");
}
