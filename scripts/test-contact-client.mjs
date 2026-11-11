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
 focus(){this.focused=true;}
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
 const phoneHelp=visit(form,n=>n.id?.startsWith("cf-phone-help-"));
 assert.ok(phoneHelp&&phone.getAttribute("aria-describedby")===phoneHelp.id,"Phone guidance must be connected for screen readers");
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
// Qualification of an observed property issue, without inferring a mining cause.
{
 const host=new Node("host");
 const quick=new Node("a");
 quick.getAttribute=key=>key==="data-damage-option"?"Kostka i ogrodzenie":null;
 const document={
  body:{classList:{contains:()=>false}},
  currentScript:{getAttribute:key=>key==="data-service"?"Szkody górnicze":""},
  querySelectorAll:selector=>selector==="[data-contact-form]"?[host]:selector==="[data-damage-option]"?[quick]:[],
  createElement:tag=>new Node(tag),
  createTextNode:text=>({tag:"text",textContent:text})
 };
 const window={location:{search:"?utm_source=ulotka"},setTimeout:()=>1,clearTimeout:()=>{}};
 const captured=[];
 const fetch=async(_url,options)=>{
  captured.push(JSON.parse(options.body));
  return {ok:true,json:async()=>({success:true})};
 };
 runInNewContext(source,{document,window,fetch,URLSearchParams,AbortController,Math});
 const form=host.children[0];
 const service=visit(form,n=>n.id?.startsWith("cf-service-"));
 const damage=visit(form,n=>n.id?.startsWith("cf-damage-"));
 const damageWrap=visit(form,n=>n.className==="contact-damage-area");
 const name=visit(form,n=>n.autocomplete==="given-name");
 const phone=visit(form,n=>n.autocomplete==="tel");
 assert.ok(damage&&damageWrap&&!damageWrap.hidden,"Mining form should show optional damage categories");
 assert.equal(damage.children.length,6,"Damage categories should be a closed, fixed list");
 assert.equal(typeof quick.events.click,"function","Campaign link must be connected to lead form");
 quick.events.click();
 assert.equal(damage.value,"Kostka i ogrodzenie","One-click campaign selection must prefill the lead");
 quick.getAttribute=()=>"<script>untrusted</script>";
 quick.events.click();
 assert.equal(damage.value,"Kostka i ogrodzenie","Unknown category must not overwrite a valid choice");
 name.value="Test";phone.value="500000000";
 await form.events.submit({preventDefault(){}});
 assert.equal(captured[0].damage_area,"Kostka i ogrodzenie");
 assert.equal(captured[0].service,"Szkody górnicze");
 service.value="Świadczenie wspierające";service.events.change();
 assert.equal(damageWrap.hidden,true,"Other service should hide mining questions");
 assert.equal(damage.value,"","Switching services must clear an old damage selection");
 await form.events.submit({preventDefault(){}});
 assert.ok(!("damage_area" in captured[1]),"Other services must not receive mining damage details");
}

// Stage selection from the WZON landing: validated choice and no sensitive uploads.
{
 const host=new Node("host");
 const stageButton=new Node("a");
 stageButton.getAttribute=key=>key==="data-stage-option"?"decyzja":null;
 const document={
  body:{classList:{contains:()=>false}},
  currentScript:{getAttribute:key=>key==="data-service"?"Świadczenie wspierające":""},
  querySelectorAll:selector=>selector==="[data-contact-form]"?[host]:selector==="[data-stage-option]"?[stageButton]:[],
  createElement:tag=>new Node(tag),
  createTextNode:text=>({tag:"text",textContent:text})
 };
 const window={location:{search:"?utm_source=facebook"},setTimeout:()=>1,clearTimeout:()=>{}};
 const payloads=[];
 const fetch=async(_url,options)=>{
  payloads.push(JSON.parse(options.body));
  return {ok:true,json:async()=>({success:true})};
 };
 runInNewContext(source,{document,window,fetch,URLSearchParams,AbortController,Math});
 const form=host.children[0];
 const service=visit(form,n=>n.id?.startsWith("cf-service-"));
 const stage=visit(form,n=>n.id?.startsWith("cf-stage-"));
 const name=visit(form,n=>n.autocomplete==="given-name");
 const email=visit(form,n=>n.autocomplete==="email");
 assert.equal(service.value,"Świadczenie wspierające");
 assert.equal(typeof stageButton.events.click,"function","Support stage button should have a click action");
 stageButton.events.click();
 assert.equal(stage.value,"Mam decyzję WZON","Support stage choice did not prefill existing select");
 stageButton.getAttribute=()=>"__proto__";
 stageButton.events.click();
 assert.equal(stage.value,"Mam decyzję WZON","Prototype code must not change stage");
 stageButton.getAttribute=()=>"nieznany";
 stageButton.events.click();
 assert.equal(stage.value,"Mam decyzję WZON","Unknown stage must not change selection");
 name.value="Test";email.value="test@example.com";
 await form.events.submit({preventDefault(){}});
 assert.equal(payloads[0].case_stage,"Mam decyzję WZON","Lead must carry the selected WZON stage");
 assert.ok(!("damage_area" in payloads[0]),"WZON leads must not include mining damage category");
}
const supportLanding=await readFile("v2/kampanie/swiadczenie-wspierajace.html","utf8");
assert.equal((supportLanding.match(/data-stage-option="/g)||[]).length,3,"Support landing must have three stage shortcuts");
for(const value of ["wniosek","oczekiwanie","decyzja"]){
 assert.ok(supportLanding.includes('data-stage-option="'+value+'"'),"Missing support stage shortcut: "+value);
}

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

const miningLanding=await readFile("v2/kampanie/szkody-gornicze.html","utf8");
assert.equal((miningLanding.match(/data-damage-option="/g)||[]).length,3,"Mining campaign should provide exactly three one-tap categories");
for(const code of ["Ściany i elewacja","Kostka i ogrodzenie","Drzwi i okna"]){
 assert.ok(miningLanding.includes('data-damage-option="'+code+'"'),"Campaign category link missing: "+code);
}
// Blank names and repeated submit events must never generate bad/duplicate leads.
{
 const host=new Node("host");
 const document={
  body:{classList:{contains:()=>false}},
  currentScript:{getAttribute:key=>key==="data-service"?"Szkody górnicze":""},
  querySelectorAll:selector=>selector==="[data-contact-form]"?[host]:[],
  createElement:tag=>new Node(tag),
  createTextNode:text=>({tag:"text",textContent:text})
 };
 let requests=0,resolveRequest;
 const fetch=async()=>{requests++;return await new Promise(resolve=>{resolveRequest=resolve;});};
 const window={location:{search:"?utm_source=ulotka"},setTimeout:()=>1,clearTimeout:()=>{}};
 runInNewContext(source,{document,window,fetch,URLSearchParams,AbortController,Math});
 const form=host.children[0];
 const name=visit(form,n=>n.autocomplete==="given-name");
 const phone=visit(form,n=>n.autocomplete==="tel");
 const submit=event=>form.events.submit(event);
 phone.value="500000000";
 name.value="    ";
 await submit({preventDefault(){}});
 assert.equal(requests,0,"Whitespace-only names cannot trigger delivery");
 assert.ok(name.validationMessage.includes("imię")&&name.focused,"Name error must focus the missing input");
 name.value="Test";
 if(name.events.input)name.events.input();
 const first=submit({preventDefault(){}});
 assert.equal(requests,1,"First valid attempt should start a request");
 const second=submit({preventDefault(){}});
 await second;
 assert.equal(requests,1,"Second submit during in-flight request must be ignored");
 const sendButton=visit(form,n=>n.type==="submit");
 assert.equal(sendButton.disabled,true,"Submit button should be disabled while sending");
 resolveRequest({ok:true,json:async()=>({success:true})});
 await first;
 assert.equal(sendButton.disabled,false,"Submit button should recover after completion");
 const third=submit({preventDefault(){}});
 assert.equal(requests,2,"New attempt must be possible once the previous request completes");
 resolveRequest({ok:true,json:async()=>({success:true})});
 await third;
}

// Invalid phone strings should not become unusable callbacks or block a valid email-only lead.
for(const sample of [
  {phone:"---------",email:"",method:"Dowolny",accepted:false},
  {phone:"123456",email:"",method:"Telefon",accepted:false},
  {phone:"1234567",email:"",method:"Telefon",accepted:true},
  {phone:"+48 796 441 345",email:"",method:"Telefon",accepted:true},
  {phone:"00442079460123",email:"",method:"Telefon",accepted:true},
  {phone:"5123+4567",email:"",method:"Telefon",accepted:false},
  {phone:"1234567890123456",email:"",method:"Telefon",accepted:false},
  {phone:"",email:"",method:"Dowolny",accepted:false},
  {phone:"",email:"test@example.com",method:"E-mail",accepted:true},
  {phone:"",email:"test@example.com",method:"Telefon",accepted:false},
  {phone:"796 441 345",email:"test@example.com",method:"E-mail",accepted:true}
]){
  const host=new Node("host");
  const document={
    body:{classList:{contains:()=>false}},
    currentScript:{getAttribute:key=>key==="data-service"?"Szkody górnicze":""},
    querySelectorAll:selector=>selector==="[data-contact-form]"?[host]:[],
    createElement:tag=>new Node(tag),
    createTextNode:text=>({tag:"text",textContent:text})
  };
  const window={location:{search:"?utm_source=ulotka"},setTimeout:()=>1,clearTimeout:()=>{}};
  const payloads=[];
  const fetch=async(_url,request)=>{payloads.push(JSON.parse(request.body));return {ok:true,json:async()=>({success:true})};};
  runInNewContext(source,{document,window,fetch,URLSearchParams,AbortController,Math});
  const form=host.children[0];
  const name=visit(form,n=>n.autocomplete==="given-name");
  const phone=visit(form,n=>n.autocomplete==="tel");
  const email=visit(form,n=>n.autocomplete==="email");
  const method=visit(form,n=>n.id?.startsWith("cf-method-"));
  name.value="Test";phone.value=sample.phone;email.value=sample.email;method.value=sample.method;
  method.events.change();
  await form.events.submit({preventDefault(){}});
  assert.equal(payloads.length,sample.accepted?1:0,"Incorrect phone/contact validation: "+JSON.stringify(sample));
  if(!sample.accepted)assert.ok(phone.focused||email.focused,"Invalid contact field should receive focus");
  if(sample.accepted)assert.equal(payloads[0].phone,sample.phone);
}

console.log("OK: contact leads, delivery fallback, UTM/lead-path, and five validated chatbot stage preselection cases.");
