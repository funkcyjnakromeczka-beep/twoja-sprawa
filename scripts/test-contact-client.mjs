#!/usr/bin/env node
/** Browser-free integration tests of the live client form. No external requests. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {runInNewContext} from "node:vm";

class Node {
 constructor(tag="node"){this.tag=tag;this.children=[];this.events={};this.attributes={};this._value=undefined;this.textContent="";this.checked=false;this.style={cssText:""};}
 get value(){return this._value!==undefined?this._value:(this.tag==="select"?this.children.find(n=>n.selected)?.value??"":"");}
 set value(next){this._value=next;}
 append(...children){this.children.push(...children);}
 replaceChildren(...children){this.children=[...children];}
 setAttribute(key,value){this.attributes[key]=value;}
 getAttribute(key){return this.attributes[key]??null;}
 addEventListener(key,cb){const previous=this.events[key];this.events[key]=previous?(...args)=>{previous(...args);cb(...args);}:cb;}
 insertAdjacentElement(){}
 setCustomValidity(message){this.validationMessage=message;}
 reportValidity(){return true;}
 reset(){}
}
const visit=(node,pred)=>{if(pred(node))return node;for(const child of node.children||[]){const found=visit(child,pred);if(found)return found;}return null;};
const source=await readFile("v2/contact.js","utf8");
const run=async(error=false)=>{
 const host=new Node("host");
 const document={
  body:{classList:{contains:()=>false}},
  currentScript:{getAttribute:()=>""},
  querySelectorAll:selector=>selector==="[data-contact-form]"?[host]:[],
  createElement:tag=>new Node(tag),
  createTextNode:text=>({tag:"text",textContent:text})
 };
 const window={
  location:{search:"?utm_source=facebook&utm_medium=social&utm_campaign=grupa_lubin&utm_content=post_2"},
  setTimeout:()=>1,clearTimeout:()=>{}
 };
 let requestBody=null;
 const fetch=async(url,opts)=>{
  assert.equal(url,"https://api.web3forms.com/submit");
  requestBody=JSON.parse(opts.body);
  if(error)throw Error("mock network failure");
  return {ok:true,json:async()=>({success:true})};
 };
 runInNewContext(source,{document,window,fetch,URLSearchParams,AbortController,Math});
 const form=host.children[0];
 assert.equal(form.tag,"form");
 const firstName=visit(form,n=>n.autocomplete==="given-name");
 const location=visit(form,n=>n.autocomplete==="address-level2");
 const phone=visit(form,n=>n.autocomplete==="tel");
 const email=visit(form,n=>n.autocomplete==="email");
 const method=visit(form,n=>n.id?.startsWith("cf-method-"));
 const callback=visit(form,n=>n.id?.startsWith("cf-time-"));
 const select=visit(form,n=>n.id?.startsWith("cf-service-"));
 assert.ok(firstName&&location&&phone&&email&&method&&callback&&select);
 const advisor=visit(form,n=>n.className==="contact-advisor");
 assert.ok(advisor&&advisor.hidden===true,"Before choosing service no specialist should appear selected");
 firstName.value="Test";location.value="Lubin";phone.value="";
 email.value="test@example.com";method.value="E-mail";method.events.change();
 callback.value="Po południu";select.value="Świadczenie wspierające";
 if(select.events.change)select.events.change();
 assert.equal(advisor.hidden,false,"Specialist is visible after choosing service");
 assert.ok(advisor.children.some(node=>(node.textContent||"").includes("Paulina Chandrała")),"Support cases should show Paulina");
 assert.equal(phone.required,false);
 assert.equal(email.required,true);
 const submit=form.events.submit;
 assert.equal(typeof submit,"function");
 await submit({preventDefault(){}});
 assert.equal(requestBody.name,"Test");
 assert.equal(requestBody.phone,"");
 assert.equal(requestBody.email,"test@example.com");
 assert.equal(requestBody.contact_preference,"E-mail");
 assert.equal(requestBody.preferred_time,"Po południu");
 assert.equal(requestBody.service,"Świadczenie wspierające");
 assert.equal(requestBody.campaign_source,"facebook");
 assert.equal(requestBody.campaign_medium,"social");
 assert.equal(requestBody.campaign_name,"grupa_lubin");
 assert.equal(requestBody.campaign_variant,"post_2");
 assert.equal(requestBody.lead_path,"formularz");
 const status=visit(form,n=>n.attributes?.role==="status");
 assert.ok(status);
 if(error){
  assert.equal(status.className,"contact-status-error");
  const fallback=visit(status,n=>n.tag==="a"&&n.className==="contact-fallback-link");
  assert.ok(fallback);
  assert.ok(fallback.href.startsWith("mailto:"));
  assert.ok(decodeURIComponent(fallback.href).includes("Dogodna pora: Po południu"));
  assert.ok(decodeURIComponent(fallback.href).includes("grupa_lubin"));
 }else{
  assert.equal(status.className,"contact-status-success");
 }
};
await run(false);
await run(true);
// Scenario hand-off from chatbot: validate only known stage codes and initial service.
const stageCase=(service,code,expected)=>{
 const host=new Node("host");
 const document={
  body:{classList:{contains:()=>false}},
  currentScript:{getAttribute:key=>key==="data-service"?service:""},
  querySelectorAll:selector=>selector==="[data-contact-form]"?[host]:[],
  createElement:tag=>new Node(tag),
  createTextNode:text=>({tag:"text",textContent:text})
 };
 const window={location:{search:"?etap="+code+"&lead_path=chatbot"}};
 runInNewContext(source,{document,window,URLSearchParams,Math});
 const form=host.children[0];
 const stage=visit(form,n=>n.id?.startsWith("cf-stage-"));
 const chosen=visit(form,n=>n.id?.startsWith("cf-service-"));
 assert.equal(chosen.value,service);
 assert.equal(stage.value,expected);
 const note=visit(form,n=>n.className==="contact-context-notice");
 assert.ok(note,"Context note must be in the form");
 assert.equal(note.hidden,!Boolean(expected),"Valid chatbot stages reveal the summary");
 if(expected)assert.ok(note.children.some(n=>n.textContent===expected),"Summary should describe the selected stage");
};
stageCase("Szkody górnicze","ugoda","Otrzymałem/am propozycję ugody");
stageCase("Szkody górnicze","odmowa","Kopalnia odmówiła");
stageCase("Świadczenie wspierające","decyzja","Mam decyzję WZON");
stageCase("Świadczenie wspierające","odwolanie","Chcę przeanalizować decyzję lub odwołanie");
stageCase("Szkody górnicze","nieznany_kod","");
// Navigator path must show the same safe, editable case-stage summary as chatbot.
{
 const host=new Node("host");
 const document={
  body:{classList:{contains:()=>false}},
  currentScript:{getAttribute:key=>key==="data-service"?"Szkody górnicze":""},
  querySelectorAll:selector=>selector==="[data-contact-form]"?[host]:[],
  createElement:tag=>new Node(tag),
  createTextNode:text=>({tag:"text",textContent:text})
 };
 const window={location:{search:"?etap=ugoda&lead_path=navigator&utm_source=facebook&utm_campaign=test"}};
 runInNewContext(source,{document,window,URLSearchParams,Math});
 const form=host.children[0];
 const stage=visit(form,n=>n.id?.startsWith("cf-stage-"));
 const context=visit(form,n=>n.className==="contact-context-notice");
 assert.equal(stage.value,"Otrzymałem/am propozycję ugody");
 assert.equal(context.hidden,false);
 assert.ok(context.children.some(n=>n.textContent==="Otrzymałem/am propozycję ugody"));
}

console.log("OK: contact leads, delivery fallback, UTM/lead-path, and five validated chatbot stage preselection cases.");
