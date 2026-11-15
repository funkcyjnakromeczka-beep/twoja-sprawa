#!/usr/bin/env node
/** Offline regression: ChatGPT referral attribution without cookies or real leads. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {runInNewContext} from "node:vm";

const attribution=await readFile("v2/attribution.js","utf8");
const form=await readFile("v2/contact.js","utf8");
function allowedSources(source,variable){
 const match=source.match(new RegExp("const "+variable+"=new Set\\((\\[[^\\]]+\\])\\)"));
 assert.ok(match,variable+" allow-list not found");
 return new Set(JSON.parse(match[1]));
}
for(const [name,sources] of [["internal links",allowedSources(attribution,"allowedSources")],["lead form",allowedSources(form,"sourceAllowed")]]){
 assert.ok(sources.has("chatgpt.com"),name+" must recognize ChatGPT search");
 assert.ok(sources.has("facebook")&&sources.has("google"),name+" must preserve existing sources");
 assert.ok(!sources.has("untrusted.example"),name+" must not permit arbitrary attribution");
}
assert.ok(form.includes('sourceAllowed.has(campaignSource)?campaignSource:"nieoznaczone"'),
 "Lead source should be classified with the same allow-list");

const origin="https://twoja-sprawa.pages.dev";
function navigate(sourceQuery,href){
 let click;
 const location={origin,href:origin+"/"+sourceQuery,search:sourceQuery};
 const link={
  href,
  getAttribute(key){return key==="href"?href:null;},
  hasAttribute(){return false;}
 };
 const document={addEventListener(type,handler){if(type==="click")click=handler;}};
 runInNewContext(attribution,{window:{location},document,URL,URLSearchParams});
 if(click){
  click({target:{closest:()=>link},defaultPrevented:false,button:0,
   metaKey:false,ctrlKey:false,shiftKey:false,altKey:false});
 }
 return link.href;
}
const search="?utm_source=chatgpt.com&utm_medium=referral&utm_campaign=szkody_ai&utm_content=odpowiedz&email=private%40example.com";
const next=new URL(navigate(search,"/kampanie/szkody-gornicze?utm_source=organiczne&utm_campaign=homepage"),origin);
assert.equal(next.searchParams.get("utm_source"),"chatgpt.com");
assert.equal(next.searchParams.get("utm_medium"),"referral");
assert.equal(next.searchParams.get("utm_campaign"),"szkody_ai");
assert.equal(next.searchParams.get("utm_content"),"odpowiedz");
assert.equal(next.searchParams.get("email"),null,"Personal query data must not be forwarded");
assert.equal(navigate(search,"https://votum-sa.pl/"),"https://votum-sa.pl/","External links must not be modified");
assert.equal(navigate(search,"/kontakt?utm_source=facebook"),"/kontakt?utm_source=facebook","Explicit non-organic attribution must take priority");
assert.equal(navigate("?utm_source=untrusted.example&utm_campaign=test","/kontakt"),"/kontakt","Unknown referrals must not be forwarded");
console.log("OK: ChatGPT referral survives navigation and lead-source classification; no tracking cookies or test messages.");
