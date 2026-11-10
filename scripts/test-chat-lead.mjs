#!/usr/bin/env node
/** Browser-free chatbot -> form handoff test. No network or personal data. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {runInNewContext} from "node:vm";
const source=await readFile("v2/chat-assistant.js","utf8");
class Element{
 constructor(tag){this.tag=tag;this.children=[];this.dataset={};this.events={};this.attrs={};this.hidden=false;this.textContent="";this.href="";this.classList={toggle(){}};}
 append(...nodes){this.children.push(...nodes)}
 replaceChildren(...nodes){this.children=[...nodes]}
 setAttribute(k,v){this.attrs[k]=v}
 getAttribute(k){return this.attrs[k]||null}
 addEventListener(k,callback){this.events[k]=callback}
 querySelectorAll(selector){
  const result=[];
  for(const node of this.children){
   if(node.tag==="button"&&selector==="button")result.push(node);
   result.push(...node.querySelectorAll(selector));
  }
  return result;
 }
 focus(){}
 scrollIntoView(){}
}
const visit=(node,predicate)=>{
 if(predicate(node))return node;
 for(const child of node.children||[]){const found=visit(child,predicate);if(found)return found;}
 return null;
};
const origin="https://twoja-sprawa.pages.dev";
const search="?utm_source=facebook&utm_medium=facebook_grupa&utm_campaign=grupa_lubin&utm_content=post_2";
const body=new Element("body");
const document={
 currentScript:{getAttribute:key=>key==="data-base"?"/v2/":null},
 createElement:tag=>new Element(tag),
 body,
 getElementById:()=>null,
 addEventListener(){}
};
const window={
 location:{pathname:"/",origin,search},
 matchMedia:()=>({matches:false}),
 addEventListener(){}
};
runInNewContext(source,{document,window,URL,URLSearchParams,Set,Object});
const choices=visit(body,n=>n.className==="chat-choices");
const result=visit(body,n=>n.className==="chat-reply");
const bottom=visit(body,n=>n.className==="chat-actions");
assert.ok(choices&&result&&bottom);
const assertChoice=(topic,stage,expected)=>{
 const item=choices.children.find(n=>n.dataset.topic===topic);
 assert.ok(item,"Missing chatbot topic "+topic);
 item.events.click();
 const stages=visit(result,n=>n.className==="chat-stage-choices");
 assert.ok(stages,"Missing stage options");
 const choice=stages.children.find(n=>n.textContent===stage);
 assert.ok(choice,"Missing stage "+stage);
 choice.events.click();
 const link=visit(result,n=>n.className==="chat-reply-contact");
 const url=new URL(link.href,origin);
 assert.equal(url.searchParams.get("utm_source"),"facebook");
 assert.equal(url.searchParams.get("utm_medium"),"facebook_grupa");
 assert.equal(url.searchParams.get("utm_campaign"),"grupa_lubin");
 assert.equal(url.searchParams.get("utm_content"),"post_2");
 assert.equal(url.searchParams.get("lead_path"),"chatbot");
 assert.equal(url.searchParams.get("etap"),expected||null);
 const footer=bottom.children.find(n=>n.textContent.startsWith("✉"));
 assert.ok(footer.href.endsWith(url.pathname+url.search+url.hash)||footer.href===url.pathname+url.search+url.hash);
};
assertChoice("szkody","Mam propozycję ugody","ugoda");
assertChoice("szkody","Otrzymałem odmowę","odmowa");
assertChoice("swiadczenie","Mam decyzję WZON","decyzja");
assertChoice("swiadczenie","Chcę sprawdzić odwołanie","odwolanie");
assertChoice("renty","Mam już rentę",null);
console.log("OK: five chatbot lead links preserve original social medium and select a safe case stage.");
