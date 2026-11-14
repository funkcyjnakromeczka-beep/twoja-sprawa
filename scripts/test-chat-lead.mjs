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
const assertChoice=(topic,stage,expected,expectedDamage=null)=>{
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
 assert.equal(url.searchParams.get("uszkodzenie"),expectedDamage,"Damage category mismatch in chatbot handoff");
 assert.equal(url.hash,"#formularz","Chatbot should send visitors straight to the lead form");
 const footer=bottom.children.find(n=>n.textContent.startsWith("✉"));
 assert.ok(footer.href.endsWith(url.pathname+url.search+url.hash)||footer.href===url.pathname+url.search+url.hash);
};
assertChoice("szkody","Widziałem niewielkie pęknięcia","uszkodzenia","sciany");
assertChoice("szkody","Kostka lub ogrodzenie są uszkodzone","uszkodzenia","kostka");
assertChoice("szkody","Mam propozycję ugody","ugoda");
assertChoice("szkody","Otrzymałem odmowę","odmowa");
assertChoice("swiadczenie","Mam decyzję WZON","decyzja");
assertChoice("swiadczenie","Chcę sprawdzić odwołanie","odwolanie");
assertChoice("renty","Mam już rentę",null);
// For SKD, the guide must offer an agreement email in addition to the lead form.
choices.children.find(n=>n.dataset.topic==="skd").events.click();
const skdMail=visit(result,n=>n.className==="chat-reply-email");
assert.ok(skdMail,"SKD chatbot should offer direct contract email");
assert.ok(skdMail.href.startsWith("mailto:wojciech.obieglo@votum-ds.pl?subject="),"SKD email must target Wojciech");
assert.ok(decodeURIComponent(skdMail.href).includes("Mój numer telefonu: [wpisz numer]"),"SKD email must request callback phone");
assert.ok(skdMail.href.includes("%0A"),"SKD email should contain real line breaks, not a literal backslash-n");
assert.ok(decodeURIComponent(skdMail.href).includes("umowę dołączę do wiadomości"),"SKD email must ask for contract attachment");
const skdForm=visit(result,n=>n.className==="chat-reply-contact");
assert.equal(new URL(skdForm.href,origin).searchParams.get("usluga"),"skd","SKD form must retain service alias");
const skdCaution=visit(result,n=>n.className==="chat-caution");
assert.ok(skdCaution.textContent.includes("nie wysyła zgłoszenia"),"SKD chatbot must explain no automatic submission");
assert.deepEqual(choices.children.map(x=>x.dataset.topic),["szkody","swiadczenie","skd","renty","franki","przesyl"],"SKD must be the third visible chatbot topic");
assert.ok(source.includes('["renty-powypadkowe","renty"]'),"Rent page should auto-select its own adviser by key");
assert.ok(source.includes('["kredyty-pln","skd"]'),"SKD service page should auto-select the agreement path");
assert.ok(source.includes('["kampanie/skd","skd"]'),"SKD campaign should auto-select its own topic");
console.log("OK: chatbot links preserve UTM/stage, service pages auto-select the correct adviser and SKD offers the contract mailbox.");
