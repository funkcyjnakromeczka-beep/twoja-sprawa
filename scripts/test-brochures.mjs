#!/usr/bin/env node
/** Six brochure runtime/content regressions without sending client data or making HTTP requests. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {runInNewContext} from "node:vm";

const brochureJs=await readFile("v2/brochure-view.js","utf8");
const brochureCss=await readFile("v2/brochure-view.css","utf8");
const planHtml=await readFile("v2/plan-dzialania.html","utf8");
const hubHtml=await readFile("v2/wiedza/index.html","utf8");
const homeHtml=await readFile("v2/index.html","utf8");
assert.ok(homeHtml.includes('Broszury dokumentów do wydruku'),"Homepage must surface printed brochures near service choices");
assert.ok(homeHtml.includes('/v2/plan-dzialania.html#brochure-library-heading'),"Homepage brochure entry must open gallery directly");
assert.ok(hubHtml.includes('aria-label="Broszury do druku dla sześciu usług"'),"Editorial hub must expose brochure topic navigation");
assert.ok(hubHtml.includes('Broszury dokumentów — do druku i udostępniania'),"Knowledge hub section heading missing");

for(const [page,brochure] of [
 ["drobne-pekniecia-szkody-gornicze","szkody-gornicze"],
 ["ugoda-z-kopalnia-co-sprawdzic","szkody-gornicze"],
 ["swiadczenie-wspierajace-2026-wzon-zus","swiadczenie-wspierajace"]
]){
 const article=await readFile("v2/wiedza/"+page+".html","utf8");
 assert.ok(article.includes('class="article-brochure-cta"'),
  "Reviewed/indexable editorial article needs relevant practical brochure: "+page);
 assert.ok(article.includes('href="/v2/plan-dzialania.html?broszura='+brochure+'#broszura"'),
  "Reviewed article links to wrong brochure: "+page);
 assert.equal((article.match(/class="article-brochure-cta"/g)||[]).length,1,
  "Only one CTA per published article: "+page);
}


const campaignBrochures=[
 ["szkody-gornicze","szkody-gornicze"],
 ["swiadczenie-wspierajace","swiadczenie-wspierajace"],
 ["renty-powypadkowe","renty-powypadkowe"],
 ["skd","skd"]
];
for(const [page,topic] of campaignBrochures){
 const campaign=await readFile("v2/kampanie/"+page+".html","utf8");
 const href='/v2/plan-dzialania.html?broszura='+topic+'#broszura';
 assert.equal(campaign.split('href="'+href+'"').length-1,1,
  "Every campaign must expose exactly one matching graphic brochure: "+page);
 assert.ok(campaign.includes("graficzną broszurę A4"),"Descriptive brochure link missing: "+page);
 assert.ok(campaign.includes('data-contact-form'),"Campaign must retain its own contact form: "+page);
 assert.ok(!campaign.includes('href="/v2/plan-dzialania.html?broszura=nieznana'),"Unknown brochure URL: "+page);
}
console.log("CAMPAIGN_BROCHURES_OK: four campaigns provide one free, matching brochure each.");

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
 assert.ok(hubHtml.includes('href="/v2/plan-dzialania.html?broszura='+topic+'#broszura"'),
  "Knowledge hub missing direct brochure for "+topic);

 const thumbnail='/v2/assets/og-broszura-'+topic+'.jpg';
 assert.ok(planHtml.includes('src="'+thumbnail+'"'),"Gallery missing custom topic thumbnail: "+topic);
 const thumbnailMarkup=planHtml.match(new RegExp('<img src="'+thumbnail.replaceAll(".","\\.")+'"[^>]*>'));
 assert.ok(thumbnailMarkup?.[0].includes('loading="lazy"'),"Gallery must lazy-load thumbnails: "+topic);
 assert.ok(thumbnailMarkup?.[0].includes('alt=""'),"Decorative thumbnails must not duplicate accessible service link label: "+topic);

 const {document,root}=fake();
 let copiedUrl="";
 const navigator={clipboard:{writeText:async text=>{copiedUrl=text;}}};
 runInNewContext(brochureJs,{
  document,location:{search:"?broszura="+encodeURIComponent(topic)},
  URL,URLSearchParams,window:{print(){}},navigator,
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
 const media=nodes.find(n=>n.tagName==="A"&&n.className==="ts-brochure-media-link");
 assert.ok(media,"Each brochure needs its own freely downloadable Facebook card: "+topic);
 assert.equal(media.href,"/assets/og-broszura-"+topic+".jpg");
 assert.equal(media.attributes.download,"Twoja-Sprawa-"+topic+"-Facebook.jpg");
 const jpg=await readFile("v2/assets/og-broszura-"+topic+".jpg");
 assert.ok(jpg.length>15_000&&jpg.length<400_000,"Social JPEG missing or wrong size: "+topic);
 const contact=nodes.find(n=>n.tagName==="A"&&n.className==="ts-brochure-contact-link");
 assert.ok(contact,"Brochure must link to a user-approved first-party contact form: "+topic);
 const phone=nodes.find(n=>n.tagName==="A"&&n.className==="ts-brochure-phone-link");
 assert.ok(phone,"Brochure must enable direct phone contact: "+topic);
 const expectedPhone=advisor==="Paulina Chandrała"?"+48500171531":"+48796441345";
 assert.equal(phone.href,"tel:"+expectedPhone,"Wrong adviser phone in brochure: "+topic);
 assert.equal(phone.attributes["aria-label"],"Zadzwoń do "+advisor+" — "+(advisor==="Paulina Chandrała"?"500 171 531":"796 441 345"));
 const actions=nodes.find(n=>n.className==="ts-brochure-actions");
 assert.ok(actions,"Brochure action toolbar must exist: "+topic);
 assert.equal(actions.children[0],contact,"Contact CTA must precede printing and social utilities: "+topic);
 assert.equal(actions.children[1],phone,"Direct phone CTA must be second: "+topic);
 const contactURL=new URL(contact.href,"https://twoja-sprawa.pages.dev");
 const alias={ "szkody-gornicze":"szkody","swiadczenie-wspierajace":"swiadczenie",
  "renty-powypadkowe":"renty","skd":"skd","kredyty-frankowe":"franki",
  "sluzebnosc-przesylu":"przesyl" }[topic];
 assert.equal(contactURL.pathname,"/kontakt");
 assert.equal(contactURL.hash,"#formularz");
 assert.equal(contactURL.searchParams.get("usluga"),alias,"Correct brochure service must be selected");
 assert.equal(contactURL.searchParams.get("utm_source"),"broszura");
 assert.equal(contactURL.searchParams.get("utm_medium"),"material");
 assert.equal(contactURL.searchParams.get("lead_path"),"broszura","Form must tag brochure-specific last-touch step");
 assert.equal(contactURL.searchParams.get("utm_campaign"),"broszura_"+topic.replaceAll("-","_"));
 for(const key of ["pesel","name","email","phone","doc","token"])
  assert.ok(!contactURL.searchParams.has(key),"Never forward personal data in referral URLs");

 const share=nodes.find(n=>n.tagName==="BUTTON"&&n.className==="ts-brochure-share");
 assert.ok(share?.events?.click,"Share button must be available for clients: "+topic);
 await share.events.click();
 assert.equal(copiedUrl,"https://twoja-sprawa.pages.dev/plan-dzialania?broszura="+topic+"#broszura",
  "Share must copy clean, canonical link without personal or advertising parameters: "+topic);
 const status=nodes.find(n=>n.className==="ts-brochure-share-feedback");
 assert.ok(status?.textContent.includes("Skopiowano"),"Screen-reader feedback after successful share copy: "+topic);
 assert.ok(allText(root).includes("niezależna działalność współpracująca z VOTUM"),
  "Published brochure must distinguish SuccessTree from official VOTUM channels: "+topic);
 const image=nodes.find(n=>n.tagName==="IMG"&&n.className==="ts-brochure-qr-image");
 assert.ok(image,"Every brochure needs a printable, service-specific QR code: "+topic);
 assert.equal(image.src,"/v2/assets/qr-broszura-"+topic+".svg","QR code file must match the selected service");
 const qrSvg=await readFile("v2/assets/qr-broszura-"+topic+".svg","utf8");
 assert.ok(qrSvg.startsWith("<svg ")&&qrSvg.includes("<path ")&&!qrSvg.includes("<script"),"QR asset must be a self-contained static SVG");
 assert.ok(!nodes.some(n=>n.tagName==="INPUT"||n.tagName==="TEXTAREA"),"Brochure must not collect client input: "+topic);
 // Every organic social channel is preserved until the service-selected lead
 // form; the brochure does not generate or transmit any personal identifier.
 for(const trafficSource of ["facebook","instagram","tiktok","inne"]){
  const {document:trackedDocument,root:trackedRoot}=fake();
  const trackedParams=new URLSearchParams({broszura:topic,utm_source:trafficSource,
   utm_medium:"social",utm_campaign:"broszura_"+topic.replaceAll("-","_"),utm_content:"post_organic"});
  runInNewContext(brochureJs,{
   document:trackedDocument,location:{search:"?"+trackedParams.toString()},
   URL,URLSearchParams,window:{print(){}},navigator:{},Object,String
  });
  const trackedContact=allNodes(trackedRoot).find(n=>n.className==="ts-brochure-contact-link");
  const nextURL=new URL(trackedContact.href,"https://twoja-sprawa.pages.dev");
  assert.equal(nextURL.searchParams.get("usluga"),alias,"Incorrect service with incoming social source");
  assert.equal(nextURL.searchParams.get("utm_source"),trafficSource,"Brochure lost social channel: "+topic);
  assert.equal(nextURL.searchParams.get("utm_medium"),"material","Brochure contact must identify last referral step");
  assert.equal(nextURL.searchParams.get("utm_campaign"),"broszura_"+topic.replaceAll("-","_"));
  assert.equal(nextURL.searchParams.get("utm_content"),"broszura_klient");
  assert.equal(nextURL.searchParams.get("lead_path"),"broszura","All social paths must identify the brochure handoff");
  for(const secret of ["name","email","phone","pesel","fbclid","gclid"])
   assert.equal(nextURL.searchParams.has(secret),false,"No visitor identifiers passed to form");
 }
}
console.log("BROCHURES_6_OK: 6 brochure flows, 24 social-to-form routes, correct adviser calling, 2x3 A4 printing and safe metadata.");
