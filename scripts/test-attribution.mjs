#!/usr/bin/env node
/** Verify first-party campaign attribution offline, without browser or network calls. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {runInNewContext} from "node:vm";
const script=await readFile("v2/attribution.js","utf8");
const host="https://twoja-sprawa.pages.dev";
function run(current,raw,options={}){
 let listener=null;
 const document={addEventListener:(name,handler,capture)=>{assert.equal(name,"click");assert.equal(capture,true);listener=handler;}};
 const window={location:new URL(current,host)};
 runInNewContext(script,{window,document,URL,URLSearchParams,Set,Object});
 const link={
  value:raw,
  getAttribute(name){return name==="href"?this.value:null;},
  set href(value){this.value=value;},
  get href(){return this.value;},
  hasAttribute:()=>false
 };
 if(listener)listener({button:0,defaultPrevented:false,metaKey:false,ctrlKey:false,shiftKey:false,altKey:false,target:{closest:()=>link},...options});
 return link.value;
}
const start=host+"/kampanie/szkody-gornicze.html?utm_source=facebook&utm_medium=social&utm_campaign=szkody_lubin&utm_content=grupa_a";
const result=run(start,"/poradniki/checklista-szkody-gorniczej.html");
const params=new URL(result).searchParams;
assert.equal(params.get("utm_source"),"facebook");
assert.equal(params.get("utm_campaign"),"szkody_lubin");
assert.equal(params.get("utm_content"),"grupa_a");
assert.equal(new URL(result).pathname,"/poradniki/checklista-szkody-gorniczej.html");
const override=new URL(run(start,"/kampanie/szkody-gornicze.html?utm_source=organiczne&utm_campaign=checklista"));
assert.equal(override.searchParams.get("utm_source"),"facebook");
assert.equal(override.searchParams.get("utm_campaign"),"szkody_lubin");
assert.equal(run(start,"/kontakt.html?utm_source=instagram&utm_campaign=inna"),"/kontakt.html?utm_source=instagram&utm_campaign=inna");
assert.equal(run(start,"mailto:test@example.com"),"mailto:test@example.com");
assert.equal(run(start,"tel:+48796441345"),"tel:+48796441345");
assert.equal(run(start,"#formularz"),"#formularz");
assert.equal(run(start,"https://external.example/path"),"https://external.example/path");
assert.equal(run(host+"/", "/kontakt.html"),"/kontakt.html");
assert.equal(run(host+"/?utm_source=foo%20bar","/kontakt.html"),"/kontakt.html");
assert.equal(run(start,"/kontakt.html",{ctrlKey:true}),"/kontakt.html");
console.log("OK: attribution follows internal links, overrides organic defaults and never follows external or modified clicks.");
