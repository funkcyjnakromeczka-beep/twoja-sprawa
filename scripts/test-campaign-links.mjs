#!/usr/bin/env node
/** Isolated DOM simulation: no browser, no network calls or real form submissions. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {runInNewContext} from "node:vm";

const source=await readFile("v2/campaign-links.js","utf8");
const values={
 service:{value:"szkody"},
 channel:{value:"facebook"},
 campaign:{value:"Lubiń Polkowice 2026"},
 content:{value:""},
 style:{value:"educational"}
};
const listeners={};
const form={
 querySelector: selector => values[selector.match(/\[name=(\w+)\]/)?.[1]],
 addEventListener: (name,fn) => {listeners[name]=fn;}
};
const link={value:""};
const post={value:""};
const status={textContent:""};
const open={href:""};
const noOpControl={addEventListener:()=>{}};
const nodes={
 "[data-campaign-builder]":form,
 "[data-campaign-url]":link,
 "[data-campaign-post]":post,
 "[data-campaign-status]":status,
 "[data-copy-link]":noOpControl,
 "[data-copy-post]":noOpControl,
 "[data-open-link]":open
};
const document={querySelector:sel=>nodes[sel]};
const window={location:{origin:"https://twoja-sprawa.pages.dev",hostname:"twoja-sprawa.pages.dev"},isSecureContext:true};
runInNewContext(source,{window,document,URL,console});
const check=(service,path,phone)=>{
 values.service.value=service;
 listeners.change();
 const url=new URL(link.value);
 assert.equal(url.pathname,path);
 assert.equal(url.searchParams.get("utm_source"),"facebook");
 assert.equal(url.searchParams.get("utm_medium"),"social");
 assert.equal(url.searchParams.get("utm_campaign"),"lubin_polkowice_2026");
 assert.ok(post.value.includes(phone));
 assert.ok(post.value.includes(link.value));
 assert.equal(open.href,link.value);
};
check("szkody","/kampanie/szkody-gornicze.html","796 441 345");
check("swiadczenie","/kampanie/swiadczenie-wspierajace.html","500 171 531");
check("renty","/uslugi/renty-powypadkowe.html","500 171 531");
check("skd","/uslugi/kredyty-pln.html","500 171 531");
check("przesyl","/uslugi/sluzebnosc-przesylu.html","796 441 345");
values.channel.value="ulotka";
values.content.value="Grupa 1";
values.style.value="short";
listeners.input();
const offline=new URL(link.value);
assert.equal(offline.searchParams.get("utm_source"),"ulotka");
assert.equal(offline.searchParams.get("utm_medium"),"print");
assert.equal(offline.searchParams.get("utm_content"),"grupa_1");
assert.ok(post.value.includes("Słupy lub linie na działce?"));
values.style.value="hook";values.content.value="";
listeners.change();
assert.equal(new URL(link.value).searchParams.get("utm_content"),"hook");
assert.ok(post.value.includes("Czy na Twojej działce"));
assert.ok(status.textContent.includes("wersji testowej Cloudflare Pages"));
console.log("OK: five services, phone routing, UTM channels, variants and generated content, with no external requests.");
