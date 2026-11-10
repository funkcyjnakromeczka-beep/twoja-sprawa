#!/usr/bin/env node
/** Test bezpieczeństwa i przekierowań przewodnika — bez przeglądarki i bez sieci. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {runInNewContext} from "node:vm";
const source=await readFile("v2/service-navigator.js","utf8");
class Node{
 constructor(tag="div"){this.tag=tag;this.children=[];this.events={};this.dataset={};this.attrs={};this.textContent="";this.href="";}
 append(...values){this.children.push(...values);}
 replaceChildren(...values){this.children=[...values];}
 setAttribute(key,value){this.attrs[key]=value;}
 addEventListener(key,callback){this.events[key]=callback;}
 querySelector(selector){return selector==="#navigator-result"?this.result:null;}
 querySelectorAll(selector){return selector==="[data-navigator]"?this.buttons:[];}
 scrollIntoView(){}
}
const find=(parent,check)=>{
 if(check(parent))return parent;
 for(const child of parent.children||[]){const match=find(child,check);if(match)return match;}
 return null;
};
function run(query){
 const root=new Node("details"),result=new Node("div");
 root.result=result;root.buttons=["szkody","swiadczenie","renty","skd","przesyl"].map(k=>{
  const button=new Node("button");button.dataset.navigator=k;return button;
 });
 const document={querySelector:selector=>selector==="#dobierz-pomoc"?root:null,createElement:tag=>new Node(tag)};
 const window={location:{search:query,origin:"https://twoja-sprawa.pages.dev"},matchMedia:()=>({matches:false})};
 runInNewContext(source,{document,window,URL,URLSearchParams,Set,Object});
 const select=key=>{
  const button=root.buttons.find(x=>x.dataset.navigator===key);
  assert.ok(button.events.click,"missing click listener for "+key);
  button.events.click();
  assert.equal(button.attrs["aria-pressed"],"true");
  return {
   form:find(result,n=>n.className==="btn navigator-contact-cta"),
   stage:code=>find(result,n=>n.dataset.stage===code),
   phone:find(result,n=>n.className==="navigator-direct-phone"),
   result
  };
 };
 return {select};
}
const result=run("?utm_source=facebook&utm_medium=facebook_grupa&utm_campaign=grupa_lubin&utm_content=post_2");
let s=result.select("szkody");
assert.equal(s.phone.href,"tel:+48796441345");
assert.ok(s.stage("ugoda"));
s.stage("ugoda").events.click();
let link=new URL(s.form.href,"https://twoja-sprawa.pages.dev");
assert.equal(link.pathname,"/v2/kampanie/szkody-gornicze.html");
for(const [k,v] of Object.entries({utm_source:"facebook",utm_medium:"facebook_grupa",utm_campaign:"grupa_lubin",utm_content:"post_2",lead_path:"navigator",etap:"ugoda"})){
 assert.equal(link.searchParams.get(k),v,k+" was not carried");
}
assert.equal(link.hash,"#formularz");
assert.equal(s.stage("ugoda").attrs["aria-pressed"],"true");
let p=result.select("swiadczenie");
p.stage("odwolanie").events.click();
link=new URL(p.form.href,"https://twoja-sprawa.pages.dev");
assert.equal(link.pathname,"/v2/kampanie/swiadczenie-wspierajace.html");
assert.equal(link.searchParams.get("etap"),"odwolanie");
assert.equal(p.phone.href,"tel:+48500171531");
for(const [key,path] of [["renty","renty"],["skd","skd"],["przesyl","przesyl"]]){
 const choice=result.select(key);
 const u=new URL(choice.form.href,"https://twoja-sprawa.pages.dev");
 assert.equal(u.pathname,"/v2/kontakt.html");
 assert.equal(u.searchParams.get("usluga"),path);
 assert.equal(u.searchParams.get("lead_path"),"navigator");
 assert.equal(u.searchParams.get("etap"),null);
}
const invalid=run("?utm_source=malware&utm_campaign=bad%20campaign&utm_medium=%3Cscript%3E");
const safe=invalid.select("szkody");
const url=new URL(safe.form.href,"https://twoja-sprawa.pages.dev");
assert.equal(url.searchParams.get("utm_source"),"strona");
assert.equal(url.searchParams.get("utm_medium"),"wybor_na_stronie");
assert.equal(url.searchParams.get("utm_campaign"),"wybor_uslugi");
assert.equal(url.searchParams.get("utm_content"),null);
console.log("OK: 5 usług, 2 etapy szczegółowe, właściwe telefony, bezpieczne UTM i bez danych osobowych w linkach.");
