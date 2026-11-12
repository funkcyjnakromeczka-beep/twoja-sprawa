#!/usr/bin/env node
/* Działanie dostępnych narzędzi poradnika — lokalny test bez internetu. */
import assert from "node:assert/strict";
import {readFile,readdir} from "node:fs/promises";
import {runInNewContext} from "node:vm";
const script=await readFile("v2/article-accessibility.js","utf8");
const pages=(await readdir("v2/wiedza")).filter(x=>x.endsWith(".html")&&x!=="index.html");
assert.equal(pages.length,10);
for(const page of pages){
 const html=await readFile("v2/wiedza/"+page,"utf8");
 assert.ok(html.includes('src="/v2/article-accessibility.js"'),"Missing script: "+page);
 assert.ok(html.includes('href="/v2/article-accessibility.css"'),"Missing stylesheet: "+page);
}
// Archival educational pages remain accessible: never route benefit/rent enquiries
// to the mining adviser or to an unrelated homepage form.
for(const [path,destination] of [
 ["swiadczenie-wspierajace-dokumenty.html","/v2/kampanie/swiadczenie-wspierajace.html#formularz"],
 ["swiadczenie-wspierajace-wzon-zus.html","/v2/kampanie/swiadczenie-wspierajace.html#formularz"],
 ["renta-powypadkowa-dokumenty.html","/v2/uslugi/renty-powypadkowe.html#formularz"]
]){
 const page=await readFile("v2/wiedza/"+path,"utf8");
 assert.ok(!page.includes('href="tel:+48796441345"'),"Wrong mining contact on educational page "+path);
 assert.ok(page.includes('href="tel:+48500171531"'),"Benefit and rent pages must call Paulina: "+path);
 assert.ok(page.includes('class="btn" href="'+destination+'"'),"Primary lead CTA should open the service-specific contact form: "+path);
 assert.ok(page.includes('href="'+destination+'">Kontakt</a>'),"Header contact must retain correct service: "+path);
}
// Older knowledge articles now lead directly to the contextual contact form
// instead of dropping a visitor at an unselected homepage contact form.
for(const [path,target,phone] of [
 ["kredyt-pln-dokumenty-skd.html","/v2/kampanie/skd.html#formularz","+48796441345"],
 ["sluzebnosc-przesylu-slup-na-dzialce.html","/v2/uslugi/sluzebnosc-przesylu.html#formularz","+48796441345"],
 ["ugoda-z-kopalnia-co-sprawdzic.html","/v2/uslugi/szkody-gornicze.html?etap=ugoda#formularz","+48796441345"],
 ["szkody-gornicze-drobne-pekniecia.html","/v2/uslugi/szkody-gornicze.html?etap=uszkodzenia&uszkodzenie=sciany#formularz","+48796441345"],
 ["wypadek-przy-pracy-pierwsze-kroki.html","/v2/uslugi/wypadki-przy-pracy.html#formularz","+48796441345"]
]){
 const html=await readFile("v2/wiedza/"+path,"utf8");
 assert.ok(!html.includes('href="/v2/#kontakt"'),"Old home contact must not swallow the service selection: "+path);
 assert.ok(html.includes('href="'+target.replaceAll("&","&amp;")+'">Kontakt</a>'),"Article must carry the service to the form: "+path);
 assert.ok(html.includes('href="tel:'+phone+'"'),"Wrong article contact phone: "+path);
}
const supportDetails=await readFile("v2/uslugi/swiadczenie-wspierajace.html","utf8");
assert.ok(supportDetails.includes('href="mailto:paulina.chandrala@votum-ds.pl?subject='),"Benefit service must email the Paulina adviser");
assert.ok(!supportDetails.includes("mailto:twojasprawa_votum@outlook.com"),"Benefit service must not offer unrelated general mailbox as primary CTA");
class Node{
 constructor(tag){this.tag=tag;this.children=[];this.events={};this.attributes={};this.className="";this.textContent="";this.classList={value:false,toggle:()=>this.classList.value=!this.classList.value};}
 addEventListener(key,cb){this.events[key]=cb;}
 setAttribute(key,value){this.attributes[key]=value;}
 append(...values){this.children.push(...values);}
 prepend(...values){this.children.unshift(...values);}
}
const article=new Node("article");
const document={querySelector:sel=>sel==="main article.article"?article:null,createElement:tag=>new Node(tag)};
let prints=0;
runInNewContext(script,{document,window:{print:()=>prints++},navigator:{clipboard:{writeText:async()=>{}}}});
assert.equal(article.children.length,1);
const group=article.children[0];
assert.equal(group.attributes.role,"group");
const buttons=group.children.filter(x=>x.tag==="button");
assert.equal(buttons.length,3);
buttons[0].events.click();
assert.equal(article.classList.value,true);
assert.equal(buttons[0].attributes["aria-pressed"],"true");
buttons[0].events.click();
assert.equal(article.classList.value,false);
buttons[1].events.click();
assert.equal(prints,1);
console.log("OK: 10 artykułów, rozmiar tekstu i druk; narzędzia bez zapisu oraz bez wysyłania danych.");
