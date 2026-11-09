#!/usr/bin/env node
/** Offline unit tests of Cloudflare Pages contact endpoint; no real messages sent. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const source=await readFile("functions/api/contact.js","utf8");
const {onRequestPost,onRequest}=await import("data:text/javascript;base64,"+Buffer.from(source).toString("base64"));
const env={RESEND_API_KEY:"test-not-real",CONTACT_FROM:"test@example.com",CONTACT_TO:"test@example.com",TURNSTILE_SECRET_KEY:"test-not-real",PUBLIC_ORIGIN:"https://example.com"};
const services=["Szkody górnicze","Świadczenie wspierające","Renty powypadkowe","Kredyt w PLN / SKD","Służebność przesyłu","Wypadek komunikacyjny","Wypadek przy pracy","Wypadek w rolnictwie","Szkoda na nieruchomości","Odszkodowanie za hałas","Pomoc w sprawie karnej","Nieudany urlop","Inna sprawa"];
const payload=(service)=>({service,name:"Jan",location:"Lubin",phone:"+48 796 441 345",email:"jan@example.com",message:"",turnstileToken:"mock-token",privacyAcknowledged:true});
const request=(body,origin=env.PUBLIC_ORIGIN,contentType="application/json")=>new Request("https://example.com/api/contact",{method:"POST",headers:{"Origin":origin,"Content-Type":contentType},body:typeof body==="string"?body:JSON.stringify(body)});
const run=async(body,origin,settings=env)=>onRequestPost({request:request(body,origin),env:settings});
assert.equal((await run(payload(services[0]),undefined,{})).status,503,"secrets are required");
assert.equal((await run(payload(services[0]),"https://evil.example")).status,403,"origin checked");
assert.equal((await run("{invalid")).status,400,"JSON validated");
assert.equal((await run({...payload(services[0]),privacyAcknowledged:false})).status,400,"privacy acknowledgment required");
assert.equal((await run({...payload(services[0]),phone:"abc"})).status,400,"phone validated");
assert.equal((await run({...payload(services[0]),phone:"1234567",name:""})).status,400,"name required");
assert.equal((await run({...payload(services[0]),location:""})).status,400,"location required");
assert.equal((await run({...payload(services[0]),email:"invalid"})).status,400,"email validated");
assert.equal((await run({...payload(services[0]),service:"Unknown"})).status,400,"service whitelist");
assert.equal((await onRequest()).status,405,"other methods rejected");
const originalFetch=globalThis.fetch;
let verified=0, delivered=0;
try{
 globalThis.fetch=async(url,opts)=>{
  if(String(url).includes("siteverify")){verified++;return new Response(JSON.stringify({success:true}),{status:200});}
  if(String(url).includes("api.resend.com/emails")){delivered++;const data=JSON.parse(opts.body);assert.equal(data.to[0],"test@example.com");assert.ok(data.text.includes("Telefon:"));return new Response(JSON.stringify({id:"mock"}),{status:200});}
  throw Error("Unexpected external URL");
 };
 for(const service of services){const response=await run(payload(service));assert.equal(response.status,200,service);assert.equal((await response.json()).ok,true);}
 const compact=await run({...payload(services[0]),phone:"796441345"});assert.equal(compact.status,200,"compact phone accepted");
 const dashed=await run({...payload(services[0]),phone:"796-441-345"});assert.equal(dashed.status,200,"dashed phone accepted");
 assert.equal(verified,services.length+2);
 assert.equal(delivered,services.length+2);
 globalThis.fetch=async(url)=>String(url).includes("siteverify")?new Response(JSON.stringify({success:true}),{status:200}):new Response("error",{status:500});
 const failed=await run(payload(services[0]));assert.equal(failed.status,502);assert.equal((await failed.json()).ok,false,"failed delivery is not success");
}finally{globalThis.fetch=originalFetch;}
console.log("OK: "+services.length+" categories, validation, origin, Turnstile, delivery failure; all requests mocked.");
