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
 // Browser-free mock does not attach siblings via insertAdjacentElement().
 // The real-browser smoke test checks DOM rendering; here verify the input reference.
 assert.ok(phone.getAttribute("aria-describedby")?.startsWith("cf-phone-help-"),"Phone field must reference its format guidance");
 const advisor=visit(form,n=>n.className==="contact-advisor");
 assert.ok(advisor&&advisor.hidden===true,"Before choosing service no specialist should appear selected");
 firstName.value="Test";location.value="Lubin";phone.value="";
 email.value="test@example.com";method.value="E-mail";method.events.change();
 callback.value="Po południu";select.value="Świadczenie wspierające";
 if(select.events.change)select.events.change();
 assert.equal(advisor.hidden,false,"Specialist is visible after choosing service");
 assert.ok(advisor.children.some(node=>(node.textContent||"").includes("Paulina Chandrała")),"Support cases should show Paulina");
 // Opening a checklist or privacy information must not replace the filled form.
 const guide=visit(form,n=>n.tag==="a"&&n.textContent?.startsWith("Otwórz listę kontrolną"));
 const privacy=visit(form,n=>n.tag==="a"&&n.href==="/v2/polityka-prywatnosci.html");
 assert.ok(guide?.href.includes("swiadczenie-wspierajace-pierwsze-kroki.html"),"Correct checklist must be linked for support");
 for(const a of [guide,privacy]){
  assert.equal(a?.target,"_blank","Guide/privacy pages must open in a separate tab");
  assert.equal(a?.rel,"noopener noreferrer","New-tab links must not expose the original page context");
  assert.ok(a.textContent.includes("nowa karta"),"The visitor should be told a new tab will open");
 }

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

// A chatbot may pass only an enumerated type of visible property damage.
for(const sample of [
 {service:"Szkody górnicze",slug:"sciany",expected:"Ściany i elewacja"},
 {service:"Szkody górnicze",slug:"kostka",expected:"Kostka i ogrodzenie"},
 {service:"Szkody górnicze",slug:"nieznana",expected:""},
 {service:"Szkody górnicze",slug:"__proto__",expected:""},
 {service:"Świadczenie wspierające",slug:"sciany",expected:""}
]){
 const host=new Node("host");
 const document={
  body:{classList:{contains:()=>false}},
  currentScript:{getAttribute:key=>key==="data-service"?sample.service:""},
  querySelectorAll:selector=>selector==="[data-contact-form]"?[host]:[],
  createElement:tag=>new Node(tag),
  createTextNode:text=>({tag:"text",textContent:text})
 };
 const window={location:{search:"?uszkodzenie="+encodeURIComponent(sample.slug)+"&etap=uszkodzenia&lead_path=chatbot"}};
 runInNewContext(source,{document,window,URLSearchParams,Math});
 const form=host.children[0];
 const damage=visit(form,n=>n.id?.startsWith("cf-damage-"));
 const damageWrap=visit(form,n=>n.className==="contact-damage-area");
 const stage=visit(form,n=>n.id?.startsWith("cf-stage-"));
 const service=visit(form,n=>n.id?.startsWith("cf-service-"));
 assert.equal(damage.value,sample.expected,"Mining category prefilling must be allowlisted: "+sample.slug);
 if(sample.service==="Szkody górnicze"){
  assert.equal(stage.value,"Zauważyłem/am uszkodzenia");
  service.value="Świadczenie wspierające";service.events.change();
  assert.equal(damage.value,"","Service switch must not retain unrelated mining damage");
 }else assert.equal(damageWrap.hidden,true,"Support must hide the mining category control");
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

// The two homepage shortcuts change an existing form; no third-party request occurs.
{
 const host=new Node("host");
 const mining=new Node("a"),support=new Node("a"),feedback=new Node("p");
 const makeKey=(node,key)=>{node.getAttribute=name=>name==="data-contact-shortcut"?key:(node.attributes[name]??null);};
 makeKey(mining,"szkody");makeKey(support,"swiadczenie");
 const document={
  body:{classList:{contains:()=>false}},
  currentScript:{getAttribute:()=>""},
  querySelectorAll:selector=>selector==="[data-contact-form]"?[host]:selector==="[data-contact-shortcut]"?[mining,support]:selector==="[data-contact-shortcut-status]"?[feedback]:[],
  createElement:tag=>new Node(tag),
  createTextNode:text=>({tag:"text",textContent:text})
 };
 const window={location:{search:"?utm_source=organiczne"},setTimeout:()=>1,clearTimeout:()=>{}};
 const fetch=async()=>({ok:true,json:async()=>({success:true})});
 runInNewContext(source,{document,window,fetch,URLSearchParams,AbortController,Math});
 const form=host.children[0];
 const service=visit(form,n=>n.id?.startsWith("cf-service-"));
 const advisor=visit(form,n=>n.className==="contact-advisor");
 const damage=visit(form,n=>n.className==="contact-damage-area");
 assert.equal(service.value,"","Homepage starts with no service preselected");
 assert.equal(mining.attributes["data-selected"],"false");
 assert.equal(support.attributes["data-selected"],"false");
 let prevented=false;
 mining.events.click({preventDefault(){prevented=true;}});
 assert.equal(prevented,true,"A functional shortcut should prevent the anchor jump");
 assert.equal(service.value,"Szkody górnicze");
 assert.equal(damage.hidden,false,"Choosing mining reveals its damage area");
 assert.equal(mining.attributes["data-selected"],"true");
 assert.equal(support.attributes["data-selected"],"false");
 assert.ok(feedback.textContent.includes("Szkody górnicze"));
 assert.equal(service.focused,true,"Shortcut should move focus to the service field");
 support.events.click({preventDefault(){}});
 assert.equal(service.value,"Świadczenie wspierające");
 assert.equal(damage.hidden,true,"Support must hide mining qualifier");
 assert.equal(mining.attributes["data-selected"],"false","Previous shortcut must be deselected");
 assert.equal(support.attributes["data-selected"],"true");
 assert.ok(feedback.textContent.includes("Świadczenie wspierające"));
 assert.ok(advisor.children.some(n=>(n.textContent||"").includes("Paulina Chandrała")));
 service.value="Renty powypadkowe";service.events.change();
 assert.equal(mining.attributes["data-selected"],"false");
 assert.equal(support.attributes["data-selected"],"false");
 assert.equal(feedback.textContent,"","Other services should not show stale shortcut feedback");
 makeKey(mining,"__proto__");
 mining.events.click({preventDefault(){throw Error("Unknown shortcut should not intercept navigation");}});
 assert.equal(service.value,"Renty powypadkowe","Unexpected shortcut code must not change selection");
 makeKey(support,"swiadczenie");
 support.events.click({preventDefault(){}});
 const name=visit(form,n=>n.autocomplete==="given-name");
 const email=visit(form,n=>n.autocomplete==="email");
 name.value="Test";email.value="test@example.com";
 form.reset=()=>{service.value="";}; // browser reset restores the unselected home service
 await form.events.submit({preventDefault(){}});
 assert.equal(mining.attributes["data-selected"],"false");
 assert.equal(support.attributes["data-selected"],"false","Successful send should clear the selected shortcut");
 assert.equal(feedback.textContent,"","Shortcut confirmation must clear when the form resets");
}

console.log("OK: contact leads, delivery fallback, UTM/lead-path, and five validated chatbot stage preselection cases.");
