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
