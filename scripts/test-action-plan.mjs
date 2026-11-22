#!/usr/bin/env node
/** Plan działania: test sześciu obszarów, etapów, UTM, prywatności, drukowania i postępu bez sieci. */
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
 select(){this.selected=true;}
 querySelectorAll(selector){
  if(selector==='input[type="checkbox"]')return this.children.flatMap(node=>node.children.flatMap(label=>label.children.filter(x=>x.tag==="input")));
  return [];
 }
}
function setup(query,{clipboard=true}={}){
 const keys=["szkody","swiadczenie","skd","renty","franki","przesyl"];
 const buttons=keys.map(key=>{const b=new Node("button");b.dataset.planService=key;return b;});
 const dom={};
 for(const key of ["[data-plan-stage-container]","[data-plan-stage-select]","[data-plan-title]","[data-plan-intro]","[data-plan-checklist]","[data-plan-progress]","[data-plan-print]","[data-plan-share]","[data-plan-share-status]","[data-plan-share-fallback]","[data-plan-share-text]","[data-plan-reset]","[data-plan-contact]","[data-plan-call]","[data-plan-email]","[data-plan-email-hint]","[data-plan-service-link]"])dom[key]=new Node(key==="[data-plan-stage-select]"?"select":"div");
 const root={querySelector:key=>dom[key],querySelectorAll:sel=>sel==="[data-plan-service]"?buttons:[]};
 let printCount=0;const copies=[];
 const window={location:{search:query,origin:"https://twoja-sprawa.pages.dev"},print:()=>printCount++,navigator:clipboard?{clipboard:{writeText:async value=>{copies.push(value)}}}:{}};
 runInNewContext(source,{document:{querySelector:sel=>sel==="[data-plan-root]"?root:null,createElement:tag=>new Node(tag)},window,URL,URLSearchParams,Set,Object});
 return {dom,buttons,copies,printCount:()=>printCount,click:key=>buttons.find(b=>b.dataset.planService===key).events.click()};
}
const state=setup("?utm_source=facebook&utm_medium=social&utm_campaign=szkody_lubin&utm_content=post_a&usluga=szkody&etap=ugoda");
const get=key=>state.dom[key];
assert.equal(get("[data-plan-title]").textContent,"Szkody górnicze");
assert.equal(get("[data-plan-stage-select]").value,"ugoda");
assert.equal(get("[data-plan-checklist]").children.length,5);
assert.equal(get("[data-plan-progress]").textContent,"0 z 5");
let u=new URL(get("[data-plan-contact]").href,"https://twoja-sprawa.pages.dev");
assert.equal(u.pathname,"/v2/kontakt.html");
assert.equal(get("[data-plan-call]").href,"tel:+48796441345");
assert.equal(get("[data-plan-call]").hidden,false);
assert.equal(get("[data-plan-contact]").textContent,"Przejdź do formularza →");
assert.equal(get("[data-plan-email]").hidden,true);
assert.equal(get("[data-plan-email-hint]").hidden,true);
assert.equal(get("[data-plan-service-link]").href,"/v2/uslugi/szkody-gornicze.html");
assert.equal(get("[data-plan-service-link]").hidden,false);
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
await get("[data-plan-share]").events.click();
assert.equal(state.copies.length,1,"Click must copy one checklist");
assert.ok(state.copies[0].includes("Szkody górnicze"));
assert.ok(state.copies[0].includes("Etap: Otrzymałem/am propozycję ugody"));
assert.ok(state.copies[0].includes("[x] 1.")&&state.copies[0].includes("[ ] 2."));
assert.ok(state.copies[0].includes("https://twoja-sprawa.pages.dev/uslugi/szkody-gornicze"));
assert.ok(!state.copies[0].includes("utm_")&&!state.copies[0].includes("PESEL"));
assert.match(get("[data-plan-share-status]").textContent,/skopiowana/);
assert.equal(get("[data-plan-share-fallback]").hidden,true);
const manual=setup("?usluga=swiadczenie",{clipboard:false});
await manual.dom["[data-plan-share]"].events.click();
assert.equal(manual.dom["[data-plan-share-fallback]"].hidden,false);
assert.equal(manual.dom["[data-plan-share-text]"].selected,true);
assert.match(manual.dom["[data-plan-share-text]"].value,/Świadczenie wspierające/);
assert.match(manual.dom["[data-plan-share-status]"].textContent,/ręcznie/);
for(const [name,expectedTel] of [["swiadczenie","500 171 531"],["skd","796 441 345"],["renty","500 171 531"],["franki","796 441 345"],["przesyl","796 441 345"]]){
 state.click(name);assert.ok(get("[data-plan-title]").textContent.length>5);
 assert.equal(get("[data-plan-checklist]").children.length,4);
 assert.equal(get("[data-plan-contact]").textContent,name==="skd"?"Zostaw numer telefonu →":"Przejdź do formularza →");
 assert.equal(get("[data-plan-email]").hidden,name!=="skd");
 assert.equal(get("[data-plan-email-hint]").hidden,name!=="skd");
 assert.ok(get("[data-plan-call]").textContent.includes(expectedTel));
 assert.equal(get("[data-plan-progress]").textContent,"0 z 4");
 const serviceLink=get("[data-plan-service-link]");
 assert.equal(serviceLink.hidden,false);
 assert.equal(serviceLink.href,"/v2/uslugi/"+({swiadczenie:"swiadczenie-wspierajace",skd:"kredyty-pln",renty:"renty-powypadkowe",franki:"kredyty-frankowe",przesyl:"sluzebnosc-przesylu"}[name])+".html");
}
state.click("przesyl");
const propertyStage=get("[data-plan-stage-select]");
assert.equal(get("[data-plan-stage-container]").hidden,false,"Property plan should offer stage selection");
for(const code of ["urzadzenia","dokumenty","propozycja","odmowa"]){
 propertyStage.value=code;propertyStage.events.change();
 assert.equal(get("[data-plan-checklist]").children.length,5);
 assert.equal(new URL(get("[data-plan-contact]").href,"https://twoja-sprawa.pages.dev").searchParams.get("etap"),code);
}
state.click("renty");
const rentsStageSelect=get("[data-plan-stage-select]");
assert.equal(get("[data-plan-stage-container]").hidden,false,"Rent plan should offer stage selection");
rentsStageSelect.value="podwyzszenie";rentsStageSelect.events.change();
assert.equal(get("[data-plan-checklist]").children.length,5);
let stageContact=new URL(get("[data-plan-contact]").href,"https://twoja-sprawa.pages.dev");
assert.equal(stageContact.searchParams.get("etap"),"podwyzszenie");
assert.equal(get("[data-plan-call]").href,"tel:+48500171531");
state.click("skd");
const skdStageSelect=get("[data-plan-stage-select]");
assert.equal(get("[data-plan-stage-container]").hidden,false,"SKD plan should offer stage selection");
skdStageSelect.value="splacony";skdStageSelect.events.change();
assert.equal(get("[data-plan-checklist]").children.length,5);
stageContact=new URL(get("[data-plan-contact]").href,"https://twoja-sprawa.pages.dev");
assert.equal(stageContact.searchParams.get("etap"),"splacony");
assert.equal(get("[data-plan-call]").href,"tel:+48796441345");
state.click("skd");
const skdMail=decodeURIComponent(get("[data-plan-email]").href);
assert.ok(skdMail.startsWith("mailto:wojciech.obieglo@votum-ds.pl?subject="),"SKD email must go to Wojciech");
assert.ok(skdMail.includes("Umowa kredytowa do analizy SKD"));
assert.ok(skdMail.includes("Mój numer telefonu: [wpisz numer]"));
assert.ok(skdMail.includes("[Dołącz umowę kredytową jako załącznik]"));
assert.ok(!skdMail.includes("500 171 531")&&!skdMail.includes("796 441 345"),"Client or unrelated phone cannot be embedded into mail draft");
assert.equal(get("[data-plan-call]").href,"tel:+48796441345","SKD must reach Wojciech, not Paulina");
let serviceLink=new URL(get("[data-plan-contact]").href,"https://twoja-sprawa.pages.dev");
assert.equal(serviceLink.searchParams.get("usluga"),"skd");
state.click("franki");
serviceLink=new URL(get("[data-plan-contact]").href,"https://twoja-sprawa.pages.dev");
assert.equal(serviceLink.searchParams.get("usluga"),"franki");
assert.equal(serviceLink.hash,"#formularz");
assert.equal(get("[data-plan-call]").href,"tel:+48796441345");
assert.equal(get("[data-plan-stage-select]").hidden,false);
const frankStage=get("[data-plan-stage-select]");
frankStage.value="ugoda";frankStage.events.change();
assert.equal(get("[data-plan-checklist]").children.length,5);
serviceLink=new URL(get("[data-plan-contact]").href,"https://twoja-sprawa.pages.dev");
assert.equal(serviceLink.searchParams.get("etap"),"ugoda");
state.click("swiadczenie");
const select=get("[data-plan-stage-select]");
select.value="odwolanie";select.events.change();
assert.equal(get("[data-plan-checklist]").children.length,5);
u=new URL(get("[data-plan-contact]").href,"https://twoja-sprawa.pages.dev");
assert.equal(u.searchParams.get("etap"),"odwolanie");
get("[data-plan-reset]").events.click();
assert.equal(get("[data-plan-title]").textContent,"Wybierz rodzaj sprawy");
assert.equal(get("[data-plan-print]").disabled,true);
assert.equal(get("[data-plan-share]").disabled,true);
assert.equal(get("[data-plan-call]").hidden,true);
assert.equal(get("[data-plan-email]").hidden,true);
assert.equal(get("[data-plan-email-hint]").hidden,true);
assert.equal(get("[data-plan-service-link]").hidden,true,"Cleared plan must not show a stale service link");
const invalid=setup("?usluga=<script>&etap=xxxx&utm_source=not_allowed&utm_campaign=%3Cscript%3E");
invalid.click("szkody");
u=new URL(invalid.dom["[data-plan-contact]"].href,"https://twoja-sprawa.pages.dev");
assert.equal(u.searchParams.get("utm_source"),"strona");
assert.equal(u.searchParams.get("utm_campaign"),"plan_pierwszych_krokow");
assert.equal(u.searchParams.get("etap"),null);
assert.equal(u.searchParams.get("email"),null);
assert.ok(html.includes('meta name="robots" content="noindex,follow"'));
assert.ok(html.includes("Nie wpisujesz tu imienia"));
assert.ok(html.includes("sześciu kategorii"));
const order=[...html.matchAll(/data-plan-service="([^"]+)"/g)].map(m=>m[1]);
assert.deepEqual(order,["szkody","swiadczenie","skd","renty","franki","przesyl"]);
assert.ok(html.includes("Kredyty frankowe CHF"),"Missing CHF preparation path");
assert.ok(html.includes('data-plan-email href="mailto:wojciech.obieglo@votum-ds.pl" hidden'),"SKD email must be hidden until selected");
assert.ok(html.includes("Otwarcie poczty przygotuje jedynie szkic wiadomości"),"SKD mail action needs user guidance");

assert.ok(html.includes('data-plan-share-fallback hidden')&&html.includes('data-plan-share-status role="status" aria-live="polite"'),"Accessible manual fallback is required");
const actionRegion=html.split('<div class="plan-actions">')[1]?.split("</div>")[0]||"";
assert.deepEqual([...actionRegion.matchAll(/\bdata-plan-(contact|call|email|print|share|reset)\b/g)].map(m=>m[1]),
 ["contact","call","email","print","share","reset"],
 "Mobile plan must prioritize contact paths over printing or reset");
assert.ok(html.includes('data-plan-service-link href="/v2/#uslugi" hidden'),"Missing hidden service detail link in initial view");

/* Every flagship service must expose a usable context-specific preparation path.
   These links stay local, preserve the corresponding service, and do not collect data. */
const prepRoutes=[
 ["szkody-gornicze","szkody","+48796441345"],
 ["swiadczenie-wspierajace","swiadczenie","+48500171531"],
 ["kredyty-pln","skd","wojciech.obieglo@votum-ds.pl"],
 ["renty-powypadkowe","renty","+48500171531"],
 ["kredyty-frankowe","franki","+48796441345"],
 ["sluzebnosc-przesylu","przesyl","+48796441345"]
];
for(const [slug,kind,destination] of prepRoutes){
 const page=await readFile("v2/uslugi/"+slug+".html","utf8");
 const root=slug==="kredyty-frankowe"?"<section class=\"wrap frank-contact\" id=\"kontakt\"":"<section class=\"service-cta\" aria-labelledby=\"service-contact\"";
 const beg=page.indexOf(root);
 const end=page.indexOf("</section>",beg);
 assert.ok(beg>=0&&end>beg,"Missing service conversion section: "+slug);
 const context=page.slice(beg,end);
 assert.equal((context.match(/class="service-plan-bridge"/g)||[]).length,1,"One preparation bridge expected: "+slug);
 assert.ok(context.includes('href="/v2/plan-dzialania.html?usluga='+kind+'"'),"Wrong plan destination for "+slug);
 assert.ok(context.includes("bez logowania i nie wymaga wpisywania danych osobowych"),"Preparation privacy microcopy missing: "+slug);
 assert.ok(context.includes(destination), "Wrong contact person for "+slug);
 assert.ok(context.includes('href="#formularz"'),"Submission CTA lost: "+slug);
}
const bridgeCSS=await readFile("v2/styles.css","utf8");
for(const token of ["SERVICE_PREPARATION_BRIDGE_20261115",".service-plan-action:focus-visible","min-height:48px","@media(max-width:600px)"]){
 assert.ok(bridgeCSS.includes(token),"Mobile/accessibility treatment missing: "+token);
}

const detailCSS=await readFile("v2/plan-dzialania.css","utf8");
assert.ok(detailCSS.includes(".plan-more-info a:focus-visible")&&detailCSS.includes(".plan-more-info a[hidden]"),"Service details link needs accessible focus and hidden states");
assert.ok(detailCSS.includes(".plan-skd-mail-hint[hidden]{display:none!important}"),"SKD email hint must be hidden outside SKD");
assert.ok(detailCSS.includes("button[data-plan-reset]"),"Reset styling must not rely on positional selectors");
assert.ok(!detailCSS.includes("button:nth-child(2)"),"Action ordering must not break reset styles");
console.log("OK: sześć usług, eksport listy, udostępnienie, ręczny fallback, drukowanie, reset, prywatność, UTM.");
