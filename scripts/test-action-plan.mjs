#!/usr/bin/env node
/** Plan działania: test pięciu obszarów, etapów, UTM, prywatności, drukowania i postępu bez sieci. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {runInNewContext} from "node:vm";
const source=await readFile("v2/plan-dzialania.js","utf8");
const html=await readFile("v2/plan-dzialania.html","utf8");
class Node{
 constructor(tag="div"){this.tag=tag;this.children=[];this.dataset={};this.events={};this.attrs={};this.checked=false;this.hidden=false;this.disabled=false;this.textContent="";this.href="";this.value="";this.classList={toggle:()=>{}};}
 append(...parts){this.children.push(...parts);}
 replaceChildren(...parts){this.children=[...parts];}
 setAttribute(k,v){this.attrs[k]=v;}
 addEventListener(k,callback){this.events[k]=callback;}
 focus(){this.focused=true;}
 querySelectorAll(selector){
  if(selector==='input[type="checkbox"]')return this.children.flatMap(node=>node.children.flatMap(label=>label.children.filter(x=>x.tag==="input")));
  return [];
 }
}
function setup(query){
 const keys=["szkody","swiadczenie","renty","skd","przesyl"];
 const buttons=keys.map(key=>{const b=new Node("button");b.dataset.planService=key;return b;});
 const dom={};
 for(const key of ["[data-plan-stage-container]","[data-plan-stage-select]","[data-plan-title]","[data-plan-intro]","[data-plan-checklist]","[data-plan-progress]","[data-plan-print]","[data-plan-reset]","[data-plan-contact]"])dom[key]=new Node(key==="[data-plan-stage-select]"?"select":"div");
 const root={querySelector:key=>dom[key],querySelectorAll:sel=>sel==="[data-plan-service]"?buttons:[]};
 let printCount=0;
 const window={location:{search:query,origin:"https://twoja-sprawa.pages.dev"},print:()=>printCount++};
 runInNewContext(source,{document:{querySelector:sel=>sel==="[data-plan-root]"?root:null,createElement:tag=>new Node(tag)},window,URL,URLSearchParams,Set,Object});
 return {dom,buttons,printCount:()=>printCount,click:key=>buttons.find(b=>b.dataset.planService===key).events.click()};
}
const state=setup("?utm_source=facebook&utm_medium=social&utm_campaign=szkody_lubin&utm_content=post_a&usluga=szkody&etap=ugoda");
const get=key=>state.dom[key];
assert.equal(get("[data-plan-title]").textContent,"Szkody górnicze");
assert.equal(get("[data-plan-stage-select]").value,"ugoda");
assert.equal(get("[data-plan-checklist]").children.length,5);
assert.equal(get("[data-plan-progress]").textContent,"0 z 5");
let u=new URL(get("[data-plan-contact]").href,"https://twoja-sprawa.pages.dev");
assert.equal(u.pathname,"/v2/kontakt.html");
for(const [field,value] of Object.entries({usluga:"szkody",etap:"ugoda",lead_path:"plan",utm_source:"facebook",utm_medium:"social",utm_campaign:"szkody_lubin",utm_content:"post_a"}))assert.equal(u.searchParams.get(field),value);
assert.equal(u.hash,"#formularz");
assert.equal(u.searchParams.get("name"),null);
assert.equal(u.searchParams.get("phone"),null);
assert.equal(u.searchParams.get("email"),null);
const first=get("[data-plan-checklist]").children[0].children[0].children[0];
first.checked=true;first.events.change();
assert.equal(get("[data-plan-progress]").textContent,"1 z 5");
get("[data-plan-print]").events.click();
assert.equal(state.printCount(),1);
for(const [name,expectedTel] of [["swiadczenie","500 171 531"],["renty","500 171 531"],["skd","500 171 531"],["przesyl","796 441 345"]]){
 state.click(name);assert.ok(get("[data-plan-title]").textContent.length>5);
 assert.equal(get("[data-plan-checklist]").children.length,4);
 assert.ok(get("[data-plan-contact]").textContent.includes(expectedTel));
 assert.equal(get("[data-plan-progress]").textContent,"0 z 4");
}
state.click("swiadczenie");
const select=get("[data-plan-stage-select]");
select.value="odwolanie";select.events.change();
assert.equal(get("[data-plan-checklist]").children.length,5);
u=new URL(get("[data-plan-contact]").href,"https://twoja-sprawa.pages.dev");
assert.equal(u.searchParams.get("etap"),"odwolanie");
get("[data-plan-reset]").events.click();
assert.equal(get("[data-plan-title]").textContent,"Wybierz temat po lewej stronie");
assert.equal(get("[data-plan-print]").disabled,true);
const invalid=setup("?usluga=<script>&etap=xxxx&utm_source=not_allowed&utm_campaign=%3Cscript%3E");
invalid.click("szkody");
u=new URL(invalid.dom["[data-plan-contact]"].href,"https://twoja-sprawa.pages.dev");
assert.equal(u.searchParams.get("utm_source"),"strona");
assert.equal(u.searchParams.get("utm_campaign"),"plan_pierwszych_krokow");
assert.equal(u.searchParams.get("etap"),null);
assert.equal(u.searchParams.get("email"),null);
assert.ok(html.includes('meta name="robots" content="noindex,follow"'));
assert.ok(html.includes("Nie wpisujesz tu imienia"));
console.log("OK: 5 usług, 9 wariantów etapów, print, reset, checkbox progress, prawidłowe kontakty, bezpieczne adresy i UTM.");
