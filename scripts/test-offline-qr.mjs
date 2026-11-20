#!/usr/bin/env node
/** First-party QR: real matrix + SVG and exact UTM match, no browser/network. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {runInNewContext} from "node:vm";

const preview=process.argv.includes("--preview");
const dir=preview?"dist-preview":"dist";
const generator=await readFile("v2/campaign-links.js","utf8");
const vendor=await readFile("v2/vendor/qrcode-generator.js","utf8");
const license=await readFile("v2/vendor/LICENSE.qrcode-generator.txt","utf8");
const html=await readFile(dir+"/narzedzia/linki-kampanii.html","utf8");
assert.ok(license.includes("MIT License")&&license.includes("Copyright (c) 2009 Kazuhiko Arase"));
assert.equal(await readFile(dir+"/vendor/qrcode-generator.js","utf8"),vendor,"Vendor must be self-hosted in released site");
assert.equal(await readFile(dir+"/vendor/LICENSE.qrcode-generator.txt","utf8"),license,"MIT notice must ship with vendor");
assert.ok(html.includes('src="/vendor/qrcode-generator.js"')&&html.includes('src="/campaign-links.js"'));
assert.ok(html.indexOf('src="/vendor/qrcode-generator.js"')<html.indexOf('src="/campaign-links.js"'),"QR library must load first");
assert.ok(html.includes("Pobierz kod QR (SVG) do Canvy i druku")&&html.includes('data-campaign-qr-image'));
assert.ok(html.includes("nie liczy automatycznie skanów"),"No false tracking claims");
assert.ok(!/<script\\b[^>]+src="https?:\\/\\//i.test(html),"No remote QR scripts");
assert.ok(!/fetch\\(|sendBeacon|XMLHttpRequest|localStorage|sessionStorage|document\\.cookie/.test(generator),"No QR tracking requests or storage");

const values={
 service:{value:"szkody"},region:{value:"ogolnie"},channel:{value:"facebook"},
 campaign:{value:"Lubiń Polkowice 2026"},content:{value:""},style:{value:"educational"}
};
const handlers={};
const regionControl={hidden:true};
const form={
 querySelector:sel=>sel==="[data-campaign-region]"?regionControl:values[sel.match(/\\[name=(\\w+)\\]/)?.[1]],
 addEventListener:(name,fn)=>{handlers[name]=fn;}
};
const node=()=>({value:"",textContent:"",src:"",href:"",download:"",hidden:true,addEventListener:()=>{}});
const url=node(),post=node(),feedback=node(),open=node();
const qrImage=node(),qrDownload=node(),qrCaption=node(),qrStatus=node(),qrFigure=node();
const entries={
 "[data-campaign-builder]":form,
 "[data-campaign-url]":url,
 "[data-campaign-post]":post,
 "[data-campaign-status]":feedback,
 "[data-copy-link]":node(),
 "[data-copy-post]":node(),
 "[data-open-link]":open,
 "[data-preview-title]":node(),
 "[data-preview-description]":node(),
 "[data-preview-host]":node(),
 "[data-campaign-qr-image]":qrImage,
 "[data-campaign-qr-download]":qrDownload,
 "[data-campaign-qr-caption]":qrCaption,
 "[data-campaign-qr-status]":qrStatus,
 "[data-campaign-qr-figure]":qrFigure
};
const document={querySelector:sel=>entries[sel]};
const window={location:{origin:"https://twoja-sprawa.pages.dev",hostname:"twoja-sprawa.pages.dev"},isSecureContext:true};
const context={document,window,URL};
runInNewContext(vendor,context);
assert.equal(typeof context.qrcode,"function","Official self-hosted library must initialize");
const baseFactory=context.qrcode;
let encodedURL="",qrModules=0;
context.qrcode=(version,correction)=>{
 assert.equal(version,0,"QR version must adjust automatically");
 assert.equal(correction,"M","QR must have medium error correction");
 const qr=baseFactory(version,correction);
 const add=qr.addData;
 qr.addData=text=>{encodedURL=text;add(text);};
 const make=qr.make;
 qr.make=()=>{make();qrModules=qr.getModuleCount();};
 return qr;
};
runInNewContext(generator,context);
const svg=()=>decodeURIComponent(qrImage.src.slice(qrImage.src.indexOf(",")+1));
const verify=(service,region,channel,path)=>{
 values.service.value=service;values.region.value=region;values.channel.value=channel;
 handlers.change();
 const generated=new URL(url.value);
 assert.equal(generated.pathname,path,"Wrong campaign destination");
 assert.equal(encodedURL,url.value,"QR must contain the exact generated campaign URL and UTM");
 assert.equal(qrCaption.textContent,url.value,"The printed description must match the QR");
 assert.equal(qrImage.hidden,false,"Visible QR preview required");
 assert.equal(qrFigure.hidden,false);
 assert.equal(qrDownload.hidden,false);
 assert.ok(qrImage.src.startsWith("data:image/svg+xml;charset=utf-8,"));
 assert.equal(qrDownload.href,qrImage.src,"The saved file must match its on-page preview");
 assert.match(qrDownload.download,/^twoja-sprawa-qr-[a-z0-9_.-]+\\.svg$/);
 assert.ok(qrDownload.download.includes(service),"File should identify the service");
 if(service==="szkody"&&region!=="ogolnie")assert.ok(qrDownload.download.includes("-"+region+"-"),"Filename must distinguish city");
 assert.ok(qrStatus.textContent.includes("Zeskanuj"),"Print test reminder missing");
 assert.ok(svg().startsWith("<svg ")&&svg().includes('fill="white"')&&svg().includes('fill="black"'));
 const box=svg().match(/viewBox="0 0 (\\d+) (\\d+)"/);
 assert.ok(box,"SVG must use an explicit viewBox");
 assert.equal(Number(box[1]),qrModules*8+64,"Keep four modules of white quiet space");
 assert.equal(box[1],box[2]);
 assert.ok(!svg().includes("https://twoja-sprawa.pages.dev"),"Do not place raw tracking URL visibly in SVG markup");
 return generated;
};
verify("szkody","ogolnie","facebook","/kampanie/szkody-gornicze");
const lubin=verify("szkody","lubin","facebook_grupa","/lokalnie/szkody-gornicze-lubin");
assert.equal(lubin.searchParams.get("utm_source"),"facebook");
assert.equal(lubin.searchParams.get("utm_medium"),"grupa");
assert.equal(lubin.searchParams.get("utm_campaign"),"lubin_polkowice_2026");
const polkowice=verify("szkody","polkowice","facebook_grupa","/lokalnie/szkody-gornicze-polkowice");
assert.equal(polkowice.searchParams.get("utm_medium"),"grupa");
verify("swiadczenie","ogolnie","facebook","/kampanie/swiadczenie-wspierajace");
verify("skd","ogolnie","facebook","/kampanie/skd");
verify("renty","ogolnie","facebook","/uslugi/renty-powypadkowe");
verify("przesyl","ogolnie","facebook","/uslugi/sluzebnosc-przesylu");
verify("franki","ogolnie","facebook","/uslugi/kredyty-frankowe");
const business=verify("szkody","lubin","google_wizytowka","/");
assert.equal(business.searchParams.get("utm_source"),"google");
assert.equal(business.searchParams.get("utm_medium"),"local");
assert.equal(business.searchParams.get("usluga"),"szkody");
assert.equal(qrCaption.textContent,url.value,"Google Business QR must match its home URL exactly");
values.service.value="szkody";values.region.value="lubin";values.channel.value="ulotka";
values.content.value="ulotka_a4";handlers.input();
assert.equal(new URL(url.value).searchParams.get("utm_medium"),"print");
assert.equal(new URL(url.value).searchParams.get("utm_content"),"ulotka_a4");
assert.equal(encodedURL,url.value,"Print campaign QR must retain full tracking parameters");
const savedQR=qrImage.src;
values.content.value="ulotka_b5";handlers.input();
assert.notEqual(qrImage.src,savedQR,"Different campaigns must produce different QR matrices");
assert.equal(encodedURL,url.value);
const broken={document,window,URL};
qrImage.src="";qrDownload.hidden=true;qrFigure.hidden=true;
runInNewContext(generator,broken);
assert.ok(url.value.includes("utm_source="),"Link must work when QR library is unavailable");
assert.equal(qrDownload.hidden,true);
assert.ok(qrStatus.textContent.includes("Canvie"),"Accessible manual fallback required");

console.log("OFFLINE_QR_OK: nine routes, two city links, Google Business Profile, print UTM, SVG quiet-zone, local MIT vendor, no network requests.");
