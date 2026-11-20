#!/usr/bin/env node
/** A4 leaflet must use the QR campaign URL, correct phone and print-only UTM. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {runInNewContext} from "node:vm";
const js=await readFile("v2/campaign-links.js","utf8");
const vendor=await readFile("v2/vendor/qrcode-generator.js","utf8");
const css=await readFile("v2/campaign-flyer.css","utf8");
const html=await readFile("v2/narzedzia/linki-kampanii.html","utf8");
assert.ok(html.includes('href="/v2/campaign-flyer.css"'));
for(const x of ['data-campaign-flyer','data-flyer-heading','data-flyer-area','data-flyer-text','data-flyer-phone','data-flyer-qr','data-print-flyer','data-flyer-hint'])
 assert.ok(html.includes(x),"Missing print field "+x);
for(const x of ['@page{size:A4 portrait;margin:12mm}','@media print','break-inside:avoid','print-color-adjust:economy','.campaign-flyer-paper','[hidden]{display:none!important}'])
 assert.ok(css.includes(x),"Print layout missing "+x);
assert.ok(!/<script\b[^>]*src="https?:\/\//.test(html),"Print must not use remote scripts");
const values={service:{value:"szkody"},region:{value:"ogolnie"},channel:{value:"facebook"},
 campaign:{value:"Lubiń Polkowice 2026"},content:{value:""},style:{value:"educational"}};
const events={};
const regionControl={hidden:true};
const form={querySelector:sel=>sel==="[data-campaign-region]"?regionControl:values[sel.match(/\[name=(\w+)\]/)?.[1]],addEventListener:(name,fn)=>events[name]=fn};
const el=()=>({textContent:"",src:"",value:"",href:"",hidden:true,disabled:false,events:{},addEventListener(name,fn){this.events[name]=fn}});
const link=el(), qr=el(), figure=el(), flyer=el(), printButton=el(), printImage=el(), flyerPhone=el(), flyerHeading=el(), flyerArea=el(), flyerText=el(), flyerHint=el();
const nodes={
 "[data-campaign-builder]":form,"[data-campaign-url]":link,"[data-campaign-post]":el(),
 "[data-campaign-status]":el(),"[data-copy-link]":el(),"[data-copy-post]":el(),
 "[data-open-link]":el(),"[data-campaign-qr-image]":qr,
 "[data-campaign-qr-download]":el(),"[data-campaign-qr-caption]":el(),
 "[data-campaign-qr-status]":el(),"[data-campaign-qr-figure]":figure,
 "[data-preview-title]":el(),"[data-preview-description]":el(),"[data-preview-host]":el(),
 "[data-campaign-flyer]":flyer,"[data-flyer-heading]":flyerHeading,
 "[data-flyer-area]":flyerArea,"[data-flyer-text]":flyerText,
 "[data-flyer-phone]":flyerPhone,"[data-flyer-qr]":printImage,
 "[data-print-flyer]":printButton,"[data-flyer-hint]":flyerHint
};
let printed=0;
const window={location:{origin:"https://twoja-sprawa.pages.dev",hostname:"twoja-sprawa.pages.dev"},
 isSecureContext:true,print:()=>{printed++;}};
const ctx={window,document:{querySelector:sel=>nodes[sel]},URL,console};
runInNewContext(vendor,ctx);
runInNewContext(js,ctx);
assert.equal(flyer.hidden,true,"Never print Facebook-UTM link as a paper leaflet");
assert.equal(printButton.disabled,true);
printButton.events.click();
assert.equal(printed,0,"Print button must not print when source is Facebook");
const verify=(service,region,source,expectedPath,expectedPhone)=>{
 values.service.value=service;values.region.value=region;values.channel.value=source;
 events.change();
 assert.equal(flyer.hidden,false,"Printable source should show the A4 leaflet");
 assert.equal(printButton.disabled,false);
 assert.equal(flyerPhone.textContent,expectedPhone);
 assert.ok(flyerText.textContent.length>40,"Flyer must have useful, non-guaranteed explanation");
 assert.ok(!/gwarantowana wypłata|100% wygranej|odszkodowanie na pewno/i.test(flyerText.textContent));
 assert.equal(printImage.src,qr.src,"Printed QR must be identical to the generated QR");
 assert.equal(new URL(link.value).pathname,expectedPath);
 assert.equal(new URL(link.value).searchParams.get("utm_medium"),"print");
 assert.ok(flyerHint.textContent.includes("zeskanuj kod"));
 const old=printed;printButton.events.click();
 assert.equal(printed,old+1,"Print command must use direct window.print()");
};
verify("szkody","lubin","ulotka","/lokalnie/szkody-gornicze-lubin","796 441 345");
assert.ok(flyerHeading.textContent.includes("Lubin"));
assert.ok(flyerArea.textContent.includes("gmina Lubin"));
verify("szkody","polkowice","plakat","/lokalnie/szkody-gornicze-polkowice","796 441 345");
assert.ok(flyerHeading.textContent.includes("Polkowice"));
verify("swiadczenie","ogolnie","ulotka","/kampanie/swiadczenie-wspierajace","500 171 531");
verify("renty","ogolnie","plakat","/uslugi/renty-powypadkowe","500 171 531");
verify("skd","ogolnie","qr","/kampanie/skd","796 441 345");
verify("przesyl","ogolnie","ulotka","/uslugi/sluzebnosc-przesylu","796 441 345");
verify("franki","ogolnie","plakat","/uslugi/kredyty-frankowe","796 441 345");
values.channel.value="facebook";events.change();
assert.equal(flyer.hidden,true);
assert.equal(printButton.disabled,true);
assert.ok(flyerHint.textContent.includes("Ulotka papierowa"));
printButton.events.click();assert.equal(printed,7);
assert.ok(html.includes("Nie jest to oficjalna witryna spółek VOTUM"));
assert.ok(html.includes("nie oznacza zawarcia umowy ani gwarancji"));
for(const [path,preview] of [["dist-preview",true],["dist",false]]){
 try{
  const built=await readFile(path+"/narzedzia/linki-kampanii.html","utf8");
  assert.ok(built.includes('href="/campaign-flyer.css'),"Print stylesheet must survive build");
  assert.ok(built.includes('data-campaign-flyer'));
 }catch(e){if(e.code!=="ENOENT")throw e;if(!preview)console.log("NO_RELEASE_BUNDLE: production release tested in release workflow");}
}
console.log("A4_FLYER_OK: 2 cities, 6 services, 2 adviser numbers, print-source UTM protection, local QR, A4 CSS and print invocation.");
