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
 querySelector(selector){
  if(!selector.startsWith('label[for="')||!selector.endsWith('"]'))return null;
  const id=selector.slice(11,-2);
  return visit(this,node=>node.tag==="label"&&node.htmlFor===id);
 }
 addEventListener(key,cb){const previous=this.events[key];this.events[key]=previous?(...args)=>{previous(...args);cb(...args);}:cb;}
 insertAdjacentElement(){}
 setCustomValidity(message){this.validationMessage=message;}
 reportValidity(){return true;}
 focus(){this.focused=true;}
 reset(){}
}
const visit=(node,pred)=>{if(!node)return null;if(pred(node))return node;for(const child of node.children||[]){const found=visit(child,pred);if(found)return found;}return null;};
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
 const scheduled=[];
 const window={
  location:{search:"?utm_source=facebook&utm_medium=social&utm_campaign=grupa_lubin&utm_content=post_2"},
  setTimeout:callback=>{scheduled.push(callback);return scheduled.length;},clearTimeout:()=>{}
 };
 let requestBody=null;
 const fetch=async(url,opts)=>{
  assert.equal(url,"https://api.web3forms.com/submit");
  requestBody=JSON.parse(opts.body);
  if(error)throw Error("mock network failure");
  return {ok:true,json:async()=>({success:true})};
 };
 runInNewContext(source,{document,window,navigator:{},fetch,URLSearchParams,AbortController,Math});
 const form=host.children[0];
 assert.equal(form.tag,"form");
 const firstName=visit(form,n=>n.autocomplete==="given-name");
 const location=visit(form,n=>n.autocomplete==="address-level2");
 const phone=visit(form,n=>n.autocomplete==="tel");
 const email=visit(form,n=>n.autocomplete==="email");
 const method=visit(form,n=>n.id?.startsWith("cf-method-"));
 const callback=visit(form,n=>n.id?.startsWith("cf-time-"));
 const select=visit(form,n=>n.id?.startsWith("cf-service-"));
 const reported=visit(form,n=>n.id?.startsWith("cf-discovery-"));
 const reportedWrap=visit(form,n=>n.className==="contact-optional-details contact-source-details");
 assert.ok(firstName&&location&&phone&&email&&method&&callback&&select&&reported&&reportedWrap);
 assert.equal(reported.required,undefined,"Reported source must not be required");
 assert.equal(reported.value,"","A Facebook UTM must NOT silently become the visitor's own declaration");
 assert.ok(visit(reportedWrap,n=>n.tag==="summary"&&n.textContent.includes("Skąd dowiedziałeś się o nas?")));
 assert.ok(reported.children.some(n=>n.value==="Nie pamiętam")&&reported.children.some(n=>n.value==="Polecenie"));
 reported.value="Polecenie";
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
 assert.ok(advisor.children.some(node=>node.href?.startsWith("mailto:paulina.chandrala@votum-ds.pl?subject=")),"Support adviser email must be directly accessible");
 const message=visit(form,n=>n.tag==="textarea"&&n.maxLength===1200);
 const example=visit(form,n=>n.className==="contact-message-example");
 const exampleResult=visit(form,n=>n.className==="contact-example-feedback");
 assert.ok(message&&example&&exampleResult,"Editable example available without sending a lead");
 assert.equal(message.value||"","","No text inserted before explicit click");
 assert.equal(requestBody,null,"Example must not call Web3Forms");
 example.events.click();
 assert.ok(message.value.includes("WZON"),"Example must follow selected service");
 assert.ok(message.focused,"Focus moves to editable text");
 assert.ok(exampleResult.textContent.includes("Dostosuj"),"No one should mistake example for personal facts");
 message.value="Moja własna wiadomość";
 example.events.click();
 assert.equal(message.value,"Moja własna wiadomość","Never overwrite the visitor's text");
 message.value="";
 const direct=visit(form,n=>n.className==="contact-direct-alternatives");
 assert.ok(direct,"Before Web3Forms submit, visitors can choose direct contact");
 assert.ok(visit(direct,n=>n.href==="tel:+48500171531"),"Support direct phone must route to Paulina");
 assert.ok(visit(direct,n=>n.href?.startsWith("mailto:paulina.chandrala@votum-ds.pl?subject=")),"Support direct e-mail must route to Paulina");
 const supportPhone=visit(form,n=>n.className==="contact-people");
 assert.ok(supportPhone.children.some(n=>n.href==="tel:+48500171531"),"Support hotline must link to Paulina");
 assert.ok(!supportPhone.children.some(n=>n.href==="tel:+48796441345"),"Support should not show unrelated mining hotline");
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
 assert.match(requestBody.reference_code,/^TS-\d{8}-[A-F0-9]{12}$/);
 assert.ok(requestBody.subject.includes("["+requestBody.reference_code+"]"));
 assert.equal(requestBody.advisor_email,"paulina.chandrala@votum-ds.pl");
 assert.equal(requestBody.campaign_source,"facebook");
 assert.equal(requestBody.reported_source,"Polecenie","Source declared by the visitor must not replace UTM");
 assert.equal(requestBody.campaign_medium,"social");
 assert.equal(requestBody.campaign_name,"grupa_lubin");
 assert.equal(requestBody.campaign_variant,"post_2");
 assert.equal(requestBody.lead_path,"formularz");
 const status=visit(form,n=>n.attributes?.role==="status");
 assert.ok(status);
 if(error){
  assert.equal(status.className,"contact-status-error");
 assert.ok(status.children.some(n=>n.textContent?.includes("nie klikaj wielokrotnie")),"Network error must warn against accidental duplicate submissions");
  assert.ok(status.children.some(n=>n.textContent?.includes("nie klikaj wielokrotnie")),"Network error must warn against accidental duplicate submissions");
  const fallback=visit(status,n=>n.tag==="a"&&n.className==="contact-fallback-link");
  assert.ok(fallback);
  assert.ok(fallback.href.startsWith("mailto:paulina.chandrala@votum-ds.pl?"),"Support fallback must route directly to Paulina");
  assert.ok(!fallback.href.includes("&body="),"Personal email draft must not be stored in dormant DOM links");
  assert.ok(!decodeURIComponent(fallback.href).includes("test@example.com"),"Customer email leaked into dormant link");
  assert.ok(fallback.events.click,"Fallback email must be built only on explicit click");
  fallback.events.click();
  const draft=decodeURIComponent(fallback.href);
  assert.ok(draft.includes("Dogodna pora: Po południu"));
  assert.ok(draft.includes("grupa_lubin"));
  assert.ok(draft.includes("Źródło wskazane przez klienta: Polecenie"),"Recovery email should preserve the voluntary answer");
  assert.ok(draft.includes("Imię: Test"));
  assert.ok(draft.includes("Kod próby: "+requestBody.reference_code));
  assert.ok(draft.includes("E-mail: test@example.com"));
  assert.equal(typeof scheduled.at(-1),"function","Draft link must be scheduled for immediate privacy cleanup");
  scheduled.at(-1)();
  assert.ok(!fallback.href.includes("&body="),"Personal email draft must be removed after mail app opens");
  const errorPhone=visit(status,n=>n.tag==="a"&&n.href?.startsWith("tel:"));
  assert.equal(errorPhone?.href,"tel:+48500171531","Failure recovery should initially call Paulina");
  // The visitor may switch from support to mining after a failed submission.
  // Every recovery link must update without resubmitting personal details.
  select.value="Szkody górnicze";
  select.events.change();
  assert.equal(errorPhone.href,"tel:+48796441345","Failure callback must follow the currently selected service");
  assert.equal(errorPhone.textContent,"796 441 345","Visible callback number must match its destination");
  assert.ok(fallback.href.startsWith("mailto:wojciech.obieglo@votum-ds.pl?"),"Fallback email must follow the new service");
  assert.ok(!fallback.href.includes("&body="),"Changing service must not expose personal details");
  fallback.events.click();
  assert.ok(decodeURIComponent(fallback.href).includes("Usługa: Szkody górnicze"),"Failure draft should follow the current service");
  assert.ok(fallback.href.startsWith("mailto:wojciech.obieglo@votum-ds.pl?"),"Changed service email should use Wojciech");
  scheduled.at(-1)();
  assert.ok(!fallback.href.includes("&body="),"Dormant link must be restored after clicking changed service");
  select.value="Świadczenie wspierające";
  select.events.change();
  assert.equal(errorPhone.href,"tel:+48500171531");
  assert.ok(fallback.href.startsWith("mailto:paulina.chandrala@votum-ds.pl?"));
 }else{
  assert.equal(status.className,"contact-status-success");
  assert.ok(status.textContent.includes(requestBody.reference_code),"Confirmation must display reference");
 }
};
await run(false);
await run(true);
const privacy=await readFile("v2/polityka-prywatnosci.html","utf8");
assert.ok(privacy.includes("dobrowolnie wskazać w formularzu"),"Privacy notice must explain the self-reported source");
assert.ok(privacy.includes("odrębna od oznaczeń UTM"),"The two sources must not be presented as equivalent");
assert.ok(source.includes('const discoveryAllowed=new Set(')&&source.includes('const reportedSource=()'),"Only enumerated categorical values may reach the lead");
assert.ok(!/localStorage|sessionStorage|document\.cookie|sendBeacon/.test(source),"No local tracking or cookies should be added");
// SKD inquiries should point to Wojciech for contract review and callback.
{
 const host=new Node("host");
 const document={
  body:{classList:{contains:()=>false}},
  currentScript:{getAttribute:key=>key==="data-service"?"Kredyt w PLN / SKD":""},
  querySelectorAll:selector=>selector==="[data-contact-form]"?[host]:[],
  createElement:tag=>new Node(tag),
  createTextNode:text=>({tag:"text",textContent:text})
 };
 const window={location:{search:"?utm_source=ulotka"}};
 runInNewContext(source,{document,window,navigator:{},URLSearchParams,Math});
 const form=host.children[0];
 const service=visit(form,n=>n.id?.startsWith("cf-service-"));
 const advisor=visit(form,n=>n.className==="contact-advisor");
 const guide=visit(form,n=>n.className==="contact-guide-box");
 assert.equal(service.value,"Kredyt w PLN / SKD");
 const skdPhone=visit(form,n=>n.className==="contact-people");
 assert.ok(skdPhone.children.some(n=>n.href==="tel:+48796441345"),"SKD phone must be Wojciech");
 assert.ok(!skdPhone.children.some(n=>n.href==="tel:+48500171531"),"SKD phone must not be benefit specialist");
 assert.ok(advisor.children.some(n=>n.textContent==="Twoja osoba do kontaktu: Wojciech Obiegło"),"SKD advisor must be Wojciech");
 assert.ok(advisor.children.some(n=>n.href?.startsWith("mailto:wojciech.obieglo@votum-ds.pl")),"SKD email destination missing");
 assert.ok(advisor.children.some(n=>n.href==="tel:+48796441345"),"SKD callback uses a different phone");
 const direct=visit(form,n=>n.className==="contact-direct-alternatives");
 assert.ok(visit(direct,n=>n.href==="tel:+48796441345"),"SKD direct phone must route to Wojciech");
 assert.ok(visit(direct,n=>n.href?.startsWith("mailto:wojciech.obieglo@votum-ds.pl?subject=")),"SKD direct e-mail must route to Wojciech");
 assert.ok(guide.children.some(n=>n.textContent?.includes("wojciech.obieglo@votum-ds.pl")),"SKD checklist guidance must invite contract email");
 const phone=visit(form,n=>n.autocomplete==="tel");
 const email=visit(form,n=>n.autocomplete==="email");
 const name=visit(form,n=>n.autocomplete==="given-name");
 const method=visit(form,n=>n.id?.startsWith("cf-method-"));
 assert.equal(phone.required,true,"SKD must require a callback phone number");
 // This lightweight DOM mock does not attach afterend siblings; the Chromium test verifies the rendered phone hint.
 assert.ok(source.includes("W sprawie SKD pozostaw numer telefonu"),"SKD telephone guidance missing");
 name.value="Test";email.value="test@example.com";method.value="E-mail";method.events.change();
 assert.equal(phone.required,true,"Selecting email contact preference must not drop SKD phone requirement");
 assert.equal(email.required,true,"Selected email preference must still validate email");
 phone.focused=false;
 await form.events.submit({preventDefault(){}});
 assert.equal(phone.focused,true,"Email-only SKD lead should focus missing callback number before sending");
 phone.value="+48 796 441 345";phone.events.input();
 assert.equal(phone.validationMessage,"","Correct SKD phone should clear custom error");
 phone.value="";phone.events.input();
 method.value="Dowolny";method.events.change();
 assert.ok(advisor.children.some(n=>n.textContent?.includes("Do analizy dołącz pełną umowę kredytową")),"SKD advisor must explicitly request the full agreement by email");
 const benefits=visit(form,n=>n.className==="contact-benefits");
 assert.ok(benefits.children.some(n=>n.textContent?.includes("pełną umowę e-mailem")),"SKD lead must not discourage sending the contract");
 service.value="Świadczenie wspierające";service.events.change();
 assert.equal(phone.required,false,"Switching away from SKD should restore email-only enquiries");
 assert.ok(visit(direct,n=>n.href==="tel:+48500171531"),"Direct phone must follow service switching");
 assert.equal(email.required,true,"Support email-only route must require the sole contact method");

 assert.ok(benefits.children.every(n=>!n.textContent?.includes("pełną umowę e-mailem")),"Non-SKD leads must not show contract upload guidance");
 service.value="Kredyt w PLN / SKD";service.events.change();
 assert.ok(benefits.children.some(n=>n.textContent?.includes("pełną umowę e-mailem")),"Returning to SKD must restore complete agreement guidance");
}

 // Simulated API failure: the SKD customer must be directed to Wojciech's work inbox,
 // with the callback number preserved in a prefilled message.
{
 const host=new Node("host");
 const document={
  body:{classList:{contains:()=>false}},
  currentScript:{getAttribute:key=>key==="data-service"?"Kredyt w PLN / SKD":""},
  querySelectorAll:selector=>selector==="[data-contact-form]"?[host]:[],
  createElement:tag=>new Node(tag),
  createTextNode:text=>({tag:"text",textContent:text})
 };
 const window={location:{search:"?utm_source=ulotka"},setTimeout:()=>1,clearTimeout:()=>{}};
 let attempted=0;
 const fetch=async()=>{attempted++;throw Error("Synthetic delivery outage");};
 runInNewContext(source,{document,window,navigator:{},fetch,URLSearchParams,AbortController,Math});
 const form=host.children[0];
 const name=visit(form,n=>n.autocomplete==="given-name");
 const phone=visit(form,n=>n.autocomplete==="tel");
 const service=visit(form,n=>n.id?.startsWith("cf-service-"));
 name.value="Test";phone.value="796 441 345";phone.events.input();
 assert.equal(service.value,"Kredyt w PLN / SKD");
 await form.events.submit({preventDefault(){}});
 assert.equal(attempted,1,"Synthetic Web3Forms outage must be exercised");
 const status=visit(form,n=>n.attributes?.role==="status");
 assert.equal(status.className,"contact-status-error");
 assert.ok(status.children.some(n=>n.textContent?.includes("nie klikaj wielokrotnie")),"Network error must warn against accidental duplicate submissions");
 const fallback=visit(status,n=>n.tag==="a"&&n.className==="contact-fallback-link");
 assert.ok(fallback?.href.startsWith("mailto:wojciech.obieglo@votum-ds.pl?"),"SKD fallback must go to Wojciech's VOTUM email");
 assert.ok(!fallback.href.includes("&body="),"SKD dormant email link must not expose callback data");
 assert.ok(!decodeURIComponent(fallback.href).includes("796 441 345"),"SKD callback phone must stay out of DOM links until click");
 fallback.events.click();
 assert.ok(decodeURIComponent(fallback.href).includes("Telefon: 796 441 345"),"SKD clicked email draft must retain the callback number");
 assert.ok(status.children.some(n=>n.href==="tel:+48796441345"),"Fallback call number for SKD differs from Wojciech");
}

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
 runInNewContext(source,{document,window,navigator:{},fetch,URLSearchParams,AbortController,Math});
 const form=host.children[0];
 const service=visit(form,n=>n.id?.startsWith("cf-service-"));
 const damage=visit(form,n=>n.id?.startsWith("cf-damage-"));
 const damageWrap=visit(form,n=>n.className==="contact-damage-area");
 const name=visit(form,n=>n.autocomplete==="given-name");
 const phone=visit(form,n=>n.autocomplete==="tel");
 assert.ok(damage&&damageWrap&&!damageWrap.hidden,"Mining form should show optional damage categories");
 const city=visit(form,n=>n.autocomplete==="address-level2");
 const cityQuick=visit(form,n=>n.className==="contact-city-quick");
 const cityChoices=visit(form,n=>n.className==="contact-city-options")?.children;
 assert.ok(city&&cityQuick&&!cityQuick.hidden,"Mining form should offer optional municipality shortcuts");
 assert.deepEqual(Array.from(cityChoices||[],n=>n.textContent),["Lubin","Polkowice"],"Two exact city shortcuts, no approximate geography");
 cityChoices[1].events.click();
 assert.equal(city.value,"Polkowice","City shortcut should fill the ordinary location input");
 assert.equal(cityChoices[1].getAttribute("aria-pressed"),"true","Selected city should be visually announced");
 city.value="Rudna";city.events.input();
 assert.equal(cityChoices[1].getAttribute("aria-pressed"),"false","Manual town input must override the quick city state");
 const otherCity=visit(form,n=>n.className==="contact-city-other");
 assert.ok(otherCity&&typeof otherCity.events.click==="function","Any local town must have a manual-entry action");
 otherCity.events.click();
 assert.equal(city.focused,true,"Manual-entry button must focus the location field");
 cityChoices[1].events.click();

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
 assert.equal(captured[0].location,"Polkowice","Quick location should flow into normal form payload");
 assert.equal(captured[0].service,"Szkody górnicze");
 service.value="Świadczenie wspierające";service.events.change();
 assert.equal(damageWrap.hidden,true,"Other service should hide mining questions");
 assert.equal(cityQuick.hidden,true,"Other service should hide mining city shortcuts");
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
 runInNewContext(source,{document,window,navigator:{},fetch,URLSearchParams,AbortController,Math});
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
// Rent campaign: stage cards route to Paulina and choose the validated case stage.
for(const [code,expected] of [
 ["nowa","Nie otrzymuję jeszcze renty"],
 ["podwyzszenie","Mam rentę i chcę sprawdzić jej podwyższenie"],
 ["odmowa","Ubezpieczyciel odmówił ustalenia lub zmiany renty"],
 ["ugoda","Otrzymałem/am propozycję ugody lub kapitalizacji"]
]){
 const host=new Node("host");
 const stageButton=new Node("a");
 stageButton.getAttribute=key=>key==="data-stage-option"?code:key==="data-stage-service"?"renty":null;
 const document={
  body:{classList:{contains:()=>false}},
  currentScript:{getAttribute:key=>key==="data-service"?"Renty powypadkowe":""},
  querySelectorAll:selector=>selector==="[data-contact-form]"?[host]:selector==="[data-stage-option]"?[stageButton]:[],
  createElement:tag=>new Node(tag),
  createTextNode:text=>({tag:"text",textContent:text})
 };
 const window={location:{search:"?utm_source=facebook&utm_campaign=renty"},setTimeout:()=>1,clearTimeout:()=>{}};
 const captured=[];
 const fetch=async(_url,options)=>{captured.push(JSON.parse(options.body));return {ok:true,json:async()=>({success:true})};};
 runInNewContext(source,{document,window,navigator:{},fetch,URLSearchParams,AbortController,Math});
 const form=host.children[0];
 const service=visit(form,n=>n.id?.startsWith("cf-service-"));
 const stage=visit(form,n=>n.id?.startsWith("cf-stage-"));
 const name=visit(form,n=>n.autocomplete==="given-name");
 const email=visit(form,n=>n.autocomplete==="email");
 assert.equal(service.value,"Renty powypadkowe");
 stageButton.events.click();
 assert.equal(stage.value,expected,"Rent landing card must select the exact allowed stage "+code);
 const direct=visit(form,n=>n.className==="contact-direct-alternatives");
 assert.ok(visit(direct,n=>n.href==="tel:+48500171531"),"Rent campaign must give Paulina phone");
 name.value="Test";email.value="test@example.com";
 await form.events.submit({preventDefault(){}});
 assert.equal(captured.length,1,"Card must never submit an extra lead");
 assert.equal(captured[0].case_stage,expected,"Rent lead stage mismatch "+code);
 assert.equal(captured[0].advisor,"Paulina Chandrała","Rent lead assigned to wrong adviser");
}
console.log("RENT_CAMPAIGN_CONTACT_OK: four explicit stages, contact Paulina, no duplicate test leads.");

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
 runInNewContext(source,{document,window,navigator:{},URLSearchParams,Math});
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
 runInNewContext(source,{document,window,navigator:{},URLSearchParams,Math});
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

// A non-circular preparation checklist and privacy-safe plan shortcut must be
// available in the form for each of the six flagship services.
for(const [kind,service,stageCode,expectedStage] of [
 ["szkody","Szkody górnicze","ugoda","ugoda"],
 ["swiadczenie","Świadczenie wspierające","odwolanie","odwolanie"],
 ["skd","Kredyt w PLN / SKD","",""],
 ["renty","Renty powypadkowe","",""],
 ["franki","Kredyty frankowe CHF","ugoda","ugoda"],
 ["przesyl","Służebność przesyłu","",""]
]){
 const host=new Node("host");
 const document={
  body:{classList:{contains:()=>false}},
  currentScript:{getAttribute:()=>""},
  querySelectorAll:selector=>selector==="[data-contact-form]"?[host]:[],
  createElement:tag=>new Node(tag),
  createTextNode:text=>({tag:"text",textContent:text})
 };
 const window={location:{search:"?usluga="+kind+(stageCode?"&etap="+stageCode:"")+"&lead_path=plan"}};
 runInNewContext(source,{document,window,navigator:{},URLSearchParams,Math});
 const form=host.children[0];
 const chosen=visit(form,n=>n.id?.startsWith("cf-service-"));
 const plan=visit(form,n=>n.className==="contact-guide-plan-link");
 const checklist=visit(form,n=>n.tag==="a"&&n.textContent?.startsWith("Otwórz listę kontrolną"));
 const stage=visit(form,n=>n.id?.startsWith("cf-stage-"));
 assert.equal(chosen.value,service,"Wrong preselected service for "+kind);
 assert.ok(plan&&!plan.hidden,"Preparation plan must be available for "+kind);
 const url=new URL(plan.href,"https://twoja-sprawa.pages.dev");
 assert.equal(url.pathname,"/v2/plan-dzialania.html");
 assert.equal(url.searchParams.get("usluga"),kind);
 assert.equal(url.searchParams.get("etap"),expectedStage||null);
 assert.equal(url.searchParams.get("phone"),null,"Never embed contact data in URLs");
 assert.equal(url.searchParams.get("email"),null,"Never embed contact data in URLs");
 assert.equal(plan.target,"_blank");
 assert.equal(plan.rel,"noopener noreferrer");
 assert.ok(checklist?.href,"A real checklist must remain available for "+kind);
 assert.notEqual(checklist.href,"/v2/uslugi/kredyty-frankowe.html","CHF checklist cannot loop to its own service page");
 if(kind==="franki"){
  assert.equal(checklist.href,"/v2/poradniki/frankowicze-lista-kontrolna.html");
  assert.equal(stage.value,"Bank proponuje ugodę dotyczącą kredytu CHF");
  chosen.value="Świadczenie wspierające";chosen.events.change();
  const changed=new URL(plan.href,"https://twoja-sprawa.pages.dev");
  assert.equal(changed.searchParams.get("usluga"),"swiadczenie");
  assert.equal(changed.searchParams.get("etap"),null,"Old CHF stage must not leak into WZON plan");
  stage.value="Mam decyzję WZON";stage.events.change();
  assert.equal(new URL(plan.href,"https://twoja-sprawa.pages.dev").searchParams.get("etap"),"decyzja");
 }
}


// Complete six-service planner -> contact flow for CHF: selected stage survives
// the transition, remains editable and is sent as an enumerated case stage.
for(const [code,label] of [
 ["aktywny","Nadal spłacam kredyt CHF"],
 ["splacony","Kredyt CHF został spłacony"],
 ["ugoda","Bank proponuje ugodę dotyczącą kredytu CHF"],
 ["postepowanie","Sprawa kredytu CHF jest już prowadzona"],
 ["nieznany",""]
]){
 const host=new Node("host");
 const document={
  body:{classList:{contains:()=>false}},
  currentScript:{getAttribute:()=>""},
  querySelectorAll:selector=>selector==="[data-contact-form]"?[host]:[],
  createElement:tag=>new Node(tag),
  createTextNode:text=>({tag:"text",textContent:text})
 };
 let lead=null;
 const fetch=async(_url,opts)=>{lead=JSON.parse(opts.body);return {ok:true,json:async()=>({success:true})};};
 const window={location:{search:"?usluga=franki&etap="+code+"&lead_path=plan&utm_source=facebook"},setTimeout:()=>1,clearTimeout:()=>{}};
 runInNewContext(source,{document,window,navigator:{},fetch,URLSearchParams,AbortController,Math});
 const form=host.children[0];
 const service=visit(form,n=>n.id?.startsWith("cf-service-"));
 const stage=visit(form,n=>n.id?.startsWith("cf-stage-"));
 const stageWrap=visit(form,n=>n.className==="contact-stage");
 const info=visit(form,n=>n.className==="contact-context-notice");
 const advisor=visit(form,n=>n.className==="contact-advisor");
 assert.equal(service.value,"Kredyty frankowe CHF","Plan should preselect CHF");
 assert.equal(stageWrap.hidden,false,"CHF stage must be visible and editable");
 assert.equal(stage.value,label,"Planner stage lost for "+code);
 assert.equal(info.hidden,!Boolean(label),"Plan context summary mismatch for "+code);
 assert.equal(info.children[0].textContent,"Twój wybór w planie przygotowań");
 assert.ok(advisor.children.some(n=>n.href==="tel:+48796441345"),"CHF call should go to Wojciech");
 if(code==="ugoda"){
  const name=visit(form,n=>n.autocomplete==="given-name");
  const phone=visit(form,n=>n.autocomplete==="tel");
  const method=visit(form,n=>n.id?.startsWith("cf-method-"));
  name.value="Test";phone.value="796441345";method.value="Telefon";method.events.change();
  await form.events.submit({preventDefault(){}});
  assert.equal(lead?.service,"Kredyty frankowe CHF");
  assert.equal(lead?.case_stage,label,"Selected CHF stage missing in lead payload");
  assert.equal(lead?.lead_path,"plan","Plan source missing in lead payload");
  assert.equal(lead?.advisor_email,"wojciech.obieglo@votum-ds.pl");
 }
}

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
 runInNewContext(source,{document,window,navigator:{},URLSearchParams,Math});
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
 runInNewContext(source,{document,window,navigator:{},fetch,URLSearchParams,AbortController,Math});
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
  {phone:"++48796441345",email:"",method:"Telefon",accepted:false},
  {phone:"(48796441345",email:"",method:"Telefon",accepted:false},
  {phone:"48)796441345",email:"",method:"Telefon",accepted:false},
  {phone:"+48 (796) 441-345",email:"",method:"Telefon",accepted:true},
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
  runInNewContext(source,{document,window,navigator:{},fetch,URLSearchParams,AbortController,Math});
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
  if(sample.accepted){
    assert.equal(payloads[0].phone,sample.phone);
    if(sample.email){
      assert.equal(payloads[0].email,sample.email,"Valid email must be forwarded");
      assert.equal(payloads[0].replyto,sample.email,"Reply-To must match the supplied email");
    }else{
      assert.ok(!Object.hasOwn(payloads[0],"email"),"Phone-only submission must omit empty email key");
      assert.ok(!Object.hasOwn(payloads[0],"replyto"),"Phone-only submission must omit empty Reply-To");
    }
  }
}

// Three homepage shortcuts change one form without sending data on selection.
{
 const host=new Node("host");
 const mining=new Node("a"),support=new Node("a"),skd=new Node("a"),feedback=new Node("p");
 const makeKey=(node,key)=>{node.getAttribute=name=>name==="data-contact-shortcut"?key:(node.attributes[name]??null);};
 makeKey(mining,"szkody");makeKey(support,"swiadczenie");makeKey(skd,"skd");
 const document={
  body:{classList:{contains:()=>false}},
  currentScript:{getAttribute:()=>""},
  querySelectorAll:selector=>selector==="[data-contact-form]"?[host]:selector==="[data-contact-shortcut]"?[mining,support,skd]:selector==="[data-contact-shortcut-status]"?[feedback]:[],
  createElement:tag=>new Node(tag),
  createTextNode:text=>({tag:"text",textContent:text})
 };
 const window={location:{search:"?utm_source=organiczne"},setTimeout:()=>1,clearTimeout:()=>{}};
 const fetch=async()=>({ok:true,json:async()=>({success:true})});
 runInNewContext(source,{document,window,navigator:{},fetch,URLSearchParams,AbortController,Math});
 const form=host.children[0];
 const service=visit(form,n=>n.id?.startsWith("cf-service-"));
 const advisor=visit(form,n=>n.className==="contact-advisor");
 const damage=visit(form,n=>n.className==="contact-damage-area");
 assert.equal(service.value,"","Homepage starts with no service preselected");
 const quickPhone=visit(form,n=>n.autocomplete==="tel");
 const quickEmail=visit(form,n=>n.autocomplete==="email");
 const quickMethod=visit(form,n=>n.id?.startsWith("cf-method-"));
 // The small DOM mock does not automatically select the first <option> as a real browser does.
 quickMethod.value="Dowolny";quickMethod.events.change();
 quickEmail.value="test@example.com";quickEmail.events.input();
 service.value="Kredyt w PLN / SKD";service.events.change();
 assert.equal(quickPhone.required,true,"SKD must require a phone before using a homepage shortcut");

 assert.equal(mining.attributes["data-selected"],"false");
 assert.equal(support.attributes["data-selected"],"false");
 let prevented=false;
 mining.events.click({preventDefault(){prevented=true;}});
 assert.equal(prevented,true,"A functional shortcut should prevent the anchor jump");
 assert.equal(service.value,"Szkody górnicze");
 assert.equal(damage.hidden,false,"Choosing mining reveals its damage area");
 assert.equal(quickPhone.required,false,"Mining homepage shortcut must clear the previous SKD-only phone requirement");
 assert.equal(quickEmail.required,true,"Email-only mining lead must still validate its email");

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
 // A quick second click can race with the previous scroll in the browser.
 // Pointer activation must select SKD even if the subsequent click is lost.
 skd.events.pointerdown({isPrimary:true,pointerType:"mouse",button:0});
 assert.equal(service.value,"Kredyt w PLN / SKD","Mouse pointerdown should preserve SKD selection under scroll");
 assert.equal(skd.attributes["data-selected"],"true");
 assert.equal(quickPhone.required,true,"Selecting SKD must require callback phone");
 support.events.pointerup({isPrimary:true,pointerType:"touch"});
 assert.equal(service.value,"Świadczenie wspierające","Touch pointerup should select service after a completed tap");
 skd.events.click({preventDefault(){}});
 assert.equal(service.value,"Kredyt w PLN / SKD","Normal keyboard/click activation remains functional");
 assert.equal(skd.attributes["data-selected"],"true");
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

// A homepage shortcut does not dispatch the select's native change event.
// Verify it still refreshes every recovery route after a failed submission.
{
 const host=new Node("host"),mining=new Node("a"),support=new Node("a"),skd=new Node("a");
 const code=(link,name)=>link.getAttribute=key=>key==="data-contact-shortcut"?name:(link.attributes[key]??null);
 code(mining,"szkody");code(support,"swiadczenie");code(skd,"skd");
 const document={
  body:{classList:{contains:token=>token==="premium-v2"}},
  currentScript:{getAttribute:()=>""},
  querySelectorAll:selector=>selector==="[data-contact-form]"?[host]:
   selector==="[data-contact-shortcut]"?[mining,support,skd]:[],
  createElement:tag=>new Node(tag),
  createTextNode:value=>({tag:"text",textContent:value})
 };
 const window={location:{search:"?utm_source=ulotka"},setTimeout:()=>1,clearTimeout:()=>{}};
 let attempted=0;
 const fetch=async()=>{attempted++;throw Error("Synthetic outage for shortcut recovery");};
 runInNewContext(source,{document,window,navigator:{},fetch,URLSearchParams,AbortController,Math});
 const form=host.children[0];
 const select=visit(form,n=>n.id?.startsWith("cf-service-"));
 const name=visit(form,n=>n.autocomplete==="given-name");
 const phone=visit(form,n=>n.autocomplete==="tel");
 const method=visit(form,n=>n.id?.startsWith("cf-method-"));
 name.value="Testowy";phone.value="500 000 000";method.value="Dowolny";method.events.change();
 support.events.click({preventDefault(){}});
 assert.equal(select.value,"Świadczenie wspierające");
 await form.events.submit({preventDefault(){}});
 assert.equal(attempted,1,"Simulated failure should perform exactly one mocked submission");
 const status=visit(form,n=>n?.attributes?.role==="status");
 assert.equal(status?.className,"contact-status-error","Failure should offer recovery controls");
 const fallback=visit(status,n=>n.className==="contact-fallback-link");
 const call=visit(status,n=>n.href?.startsWith("tel:"));
 assert.ok(fallback?.href.startsWith("mailto:paulina.chandrala@votum-ds.pl?"));
 assert.equal(call?.href,"tel:+48500171531");
 for(const [link,recipient,telephone] of [
  [mining,"wojciech.obieglo@votum-ds.pl","tel:+48796441345"],
  [skd,"wojciech.obieglo@votum-ds.pl","tel:+48796441345"],
  [support,"paulina.chandrala@votum-ds.pl","tel:+48500171531"]
 ]){
  link.events.click({preventDefault(){}});
  assert.ok(fallback.href.startsWith("mailto:"+recipient+"?"),"Recovery email stayed on wrong person");
  assert.ok(!fallback.href.includes("&body="),"Switching services must not expose client details in dormant links");
  assert.equal(call.href,telephone,"Recovery phone stayed on wrong person");
  assert.equal(attempted,1,"Service shortcut must never resubmit a lead");
 }
 assert.equal(name.value,"Testowy","Service shortcuts must preserve customer name");
 assert.equal(phone.value,"500 000 000","Service shortcuts must preserve callback number");
}
console.log("HOME_SHORTCUT_RECOVERY_OK: fallback follows adviser changes with no duplicate submissions.");

// Renty: links should preselect one of four allowed stages while retaining Paulina.
for(const [code,expected] of [
 ["nowa","Nie otrzymuję jeszcze renty"],
 ["podwyzszenie","Mam rentę i chcę sprawdzić jej podwyższenie"],
 ["odmowa","Ubezpieczyciel odmówił ustalenia lub zmiany renty"],
 ["ugoda","Otrzymałem/am propozycję ugody lub kapitalizacji"]
]){
 const host=new Node("host");
 const document={
  body:{classList:{contains:()=>false}},
  currentScript:{getAttribute:name=>name==="data-service"?"Renty powypadkowe":""},
  querySelectorAll:sel=>sel==="[data-contact-form]"?[host]:[],
  createElement:tag=>new Node(tag),
  createTextNode:value=>({tag:"text",textContent:value})
 };
 const window={location:{search:"?etap="+code+"&utm_source=facebook"}};
 runInNewContext(source,{document,window,navigator:{},URLSearchParams,Math});
 const form=host.children[0];
 const service=visit(form,n=>n.id?.startsWith("cf-service-"));
 const stage=visit(form,n=>n.id?.startsWith("cf-stage-"));
 const stageWrap=visit(form,n=>n.className==="contact-stage");
 const stageLabel=visit(form,n=>n.htmlFor===stage.id);
 assert.equal(service.value,"Renty powypadkowe");
 assert.equal(stageWrap.hidden,false);
 assert.equal(stageLabel.textContent,"Na jakim etapie jest sprawa renty?");
 assert.equal(stage.value,expected,"Rent stage preselection broken: "+code);
 const direct=visit(form,n=>n.className==="contact-direct-alternatives");
 assert.ok(visit(direct,n=>n.href==="tel:+48500171531"),"Rent route should call Paulina");
 assert.ok(visit(direct,n=>n.href?.startsWith("mailto:paulina.chandrala@votum-ds.pl")),"Rent route should email Paulina");
}
console.log("RENT_FORM_STAGE_OK: 4 safe URL stages and Paulina contact.");

// SKD: four enumerated journey links must preselect the correct stage and adviser.
for(const [code,description] of [
 ["splata","Nadal spłacam kredyt konsumencki w PLN"],
 ["splacony","Kredyt konsumencki został już spłacony"],
 ["wczesniejsza","Spłaciłem/am kredyt przed terminem"],
 ["odmowa","Kredytodawca odmówił uznania SKD"]
]){
 const host=new Node("host");
 const doc={
  body:{classList:{contains:()=>false}},
  currentScript:{getAttribute:key=>key==="data-service"?"Kredyt w PLN / SKD":""},
  querySelectorAll:selector=>selector==="[data-contact-form]"?[host]:[],
  createElement:tag=>new Node(tag),
  createTextNode:value=>({tag:"text",textContent:value})
 };
 const win={location:{search:"?etap="+code+"&utm_source=facebook"}};
 runInNewContext(source,{document:doc,window:win,navigator:{},URLSearchParams,Math});
 const form=host.children[0];
 const service=visit(form,n=>n.id?.startsWith("cf-service-"));
 const stage=visit(form,n=>n.id?.startsWith("cf-stage-"));
 const wrap=visit(form,n=>n.className==="contact-stage");
 const stageLabel=visit(form,n=>n.htmlFor===stage.id);
 const callback=visit(form,n=>n.autocomplete==="tel");
 const direct=visit(form,n=>n.className==="contact-direct-alternatives");
 assert.equal(service.value,"Kredyt w PLN / SKD");
 assert.equal(stage.value,description,"SKD stage must match trusted code "+code);
 assert.equal(stageLabel.textContent,"Na jakim etapie jest sprawa kredytu PLN?");
 assert.equal(wrap.hidden,false);
 assert.equal(callback.required,true,"SKD always requires a phone number");
 assert.ok(visit(direct,n=>n.href==="tel:+48796441345"),"SKD callback must call Wojciech");
 assert.ok(visit(direct,n=>n.href?.startsWith("mailto:wojciech.obieglo@votum-ds.pl")),"SKD email must reach Wojciech");
}
console.log("SKD_FORM_STAGE_OK: 4 safe stages, validated callback and adviser.");

// Mining: a previously protected building requires a precise, selectable stage.
{
 const host=new Node("host");
 const document={body:{classList:{contains:()=>false}},currentScript:{getAttribute:key=>key==="data-service"?"Szkody górnicze":""},
  querySelectorAll:sel=>sel==="[data-contact-form]"?[host]:[],createElement:tag=>new Node(tag),
  createTextNode:text=>({tag:"text",textContent:text})};
 const window={location:{search:"?etap=zabezpieczenia&utm_source=facebook&utm_campaign=lokalna_pomoc"}};
 runInNewContext(source,{document,window,navigator:{},URLSearchParams,Math});
 const form=host.children[0];
 const service=visit(form,n=>n.id?.startsWith("cf-service-"));
 const stage=visit(form,n=>n.id?.startsWith("cf-stage-"));
 const phone=visit(form,n=>n.autocomplete==="tel");
 const direct=visit(form,n=>n.className==="contact-direct-alternatives");
 assert.equal(service.value,"Szkody górnicze");
 assert.equal(stage.value,"Pojawiły się szkody mimo wcześniejszych zabezpieczeń lub napraw");
 assert.ok(phone,"Mining contact form must include a phone field");
 assert.ok(visit(direct,n=>n.href==="tel:+48796441345"),"Correct mining adviser");
 assert.ok(visit(direct,n=>n.href?.startsWith("mailto:wojciech.obieglo@votum-ds.pl")),"Correct mining adviser email");
}
console.log("MINING_PROTECTED_STAGE_OK: safe preselected stage, verified adviser and phone.");

console.log("OK: contact leads, delivery fallback, UTM/lead-path, and five validated chatbot stage preselection cases.");
