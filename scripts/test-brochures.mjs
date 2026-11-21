#!/usr/bin/env node
/** Six brochure runtime/content regressions without sending client data or making HTTP requests. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {runInNewContext} from "node:vm";

const brochureJs=await readFile("v2/brochure-view.js","utf8");
const brochureCss=await readFile("v2/brochure-view.css","utf8");
const planHtml=await readFile("v2/plan-dzialania.html","utf8");
const brochurePages=[
 ["szkody-gornicze","szkody-gornicze","Wojciech Obiegło"],
 ["swiadczenie-wspierajace","swiadczenie-wspierajace","Paulina Chandrała"],
 ["renty-powypadkowe","renty-powypadkowe","Paulina Chandrała"],
 ["kredyty-pln","skd","Wojciech Obiegło"],
 ["kredyty-frankowe","kredyty-frankowe","Wojciech Obiegło"],
 ["sluzebnosc-przesylu","sluzebnosc-przesylu","Wojciech Obiegło"]
];
assert.ok(planHtml.includes('data-brochure-root hidden'),"No private graphic brochure mount");
assert.ok(planHtml.includes('src="/v2/brochure-view.js" defer'),"Brochure script not loaded");
assert.ok(planHtml.includes('href="/v2/brochure-view.css"'),"Brochure styles not loaded");
assert.ok(brochureCss.includes("@page{size:A4 landscape;margin:0}"),"Missing exact A4 landscape printing");
assert.ok(brochureCss.includes("grid-template-columns:repeat(3,99mm)"),"Printed spreads must have three A4 triptych panels");
assert.ok(brochureCss.includes("body.brochure-active .plan-brochure-library{display:none!important}"),"Noisy chooser should be hidden in brochure mode");

const allText=node=>[node.textContent||"",...(node.children||[]).map(allText)].join(" ");
const allNodes=node=>[node,...(node.children||[]).flatMap(allNodes)];
function fake(){
 let visible=null;
 const makeNode=tag=>({
  tagName:tag.toUpperCase(),
  children:[],textContent:"",className:"",attributes:{},hidden:false,
  setAttribute(name,value){this.attributes[name]=String(value)},
  append(...nodes){this.children.push(...nodes)},
  replaceChildren(...nodes){this.children=nodes},
  addEventListener(name,fn){(this.events??={})[name]=fn}
 });
 visible=makeNode("section");visible.hidden=true;
 const document={
  title:"Przygotowanie do sprawy",
  body:{classList:{values:new Set(),add(name){this.values.add(name)}}},
  querySelector(selector){return selector==="[data-brochure-root]"?visible:null},
  createElement:makeNode
 };
 return {document,root:visible};
}
for(const [service,topic,advisor] of brochurePages){
 const source=await readFile("v2/uslugi/"+service+".html","utf8");
 const expected="/v2/plan-dzialania.html?broszura="+topic+"#broszura";
 assert.ok(source.includes('href="'+expected+'"'),"Service missing unique graphic brochure link: "+service);
 assert.ok(planHtml.includes('href="?broszura='+topic+'#broszura"'),"Library missing "+topic);
 const {document,root}=fake();
 runInNewContext(brochureJs,{
  document,location:{search:"?broszura="+encodeURIComponent(topic)},
  URLSearchParams,window:{print(){}} ,
  Object,String
 });
 assert.equal(root.hidden,false,"Selected brochure not revealed: "+topic);
 assert.ok(document.body.classList.values.has("brochure-active"),"Print mode not toggled: "+topic);
 const nodes=allNodes(root);
 assert.equal(nodes.filter(n=>n.className.includes("ts-brochure-spread")).length,2,"Two spreads required: "+topic);
 assert.equal(nodes.filter(n=>n.className==="ts-brochure-panel ts-brochure-document").length,3,"Three document columns required: "+topic);
 assert.equal(nodes.filter(n=>n.className==="ts-brochure-rule").length,4,"Four initial rules required: "+topic);
 assert.ok(allText(root).includes(advisor),"Correct adviser must appear: "+topic);
 assert.ok(allText(root).includes("Drukuj / Zapisz PDF"),"Print button must appear: "+topic);
 assert.ok(nodes.some(n=>n.tagName==="BUTTON"&&n.events?.click),"Print control must be wired: "+topic);
 assert.ok(allText(root).includes("Nie musisz mieć wszystkiego."),"No mandatory-document claim: "+topic);
 assert.ok(!nodes.some(n=>n.tagName==="INPUT"||n.tagName==="TEXTAREA"),"Brochure must not collect client input: "+topic);
}
console.log("BROCHURES_6_OK: six brochure flows, private runtime, six adviser routes, 2x3 A4 print layouts.");
