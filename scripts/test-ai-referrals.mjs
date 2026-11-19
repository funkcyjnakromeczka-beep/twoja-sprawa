#!/usr/bin/env node
/** Offline regression: ChatGPT referral attribution without cookies or real leads. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {runInNewContext} from "node:vm";

const attribution=await readFile("v2/attribution.js","utf8");
const form=await readFile("v2/contact.js","utf8");
const chatbot=await readFile("v2/chat-assistant.js","utf8");
const navigator=await readFile("v2/service-navigator.js","utf8");
const plan=await readFile("v2/plan-dzialania.js","utf8");
function allowedSources(source,variable){
 const match=source.match(new RegExp("const "+variable+"=new Set\\((\\[[^\\]]+\\])\\)"));
 assert.ok(match,variable+" allow-list not found");
 return new Set(JSON.parse(match[1]));
}
for(const [name,sources] of [["internal links",allowedSources(attribution,"allowedSources")],["lead form",allowedSources(form,"sourceAllowed")],["chatbot",allowedSources(chatbot,"allowedSources")],["service navigator",allowedSources(navigator,"sourceAllowed")],["action plan",allowedSources(plan,"allowedSources")]]){
 assert.ok(sources.has("chatgpt.com"),name+" must recognize ChatGPT search");
 assert.ok(sources.has("facebook")&&sources.has("google"),name+" must preserve existing sources");
 assert.ok(!sources.has("untrusted.example"),name+" must not permit arbitrary attribution");
}
assert.ok(form.includes('sourceAllowed.has(campaignSource)?campaignSource:(!campaignSource&&inferredAIReferrer?inferredAIReferrer:"nieoznaczone")'),
 "Lead source should be classified with the same allow-list");

const origin="https://twoja-sprawa.pages.dev";
function navigate(sourceQuery,href,referrer=""){
 let click;
 const location={origin,href:origin+"/"+sourceQuery,search:sourceQuery};
 const link={
  href,
  getAttribute(key){return key==="href"?href:null;},
  hasAttribute(){return false;}
 };
 const document={referrer,addEventListener(type,handler){if(type==="click")click=handler;}};
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
for(const [name,code] of [["links",attribution],["form",form],["chatbot",chatbot],["navigator",navigator],["action plan",plan]]){
 assert.ok(code.includes("const inferredAIReferrer="),name+" must handle trusted referrer domains");
 assert.ok(code.includes('"chat.openai.com"'),name+" must support legacy OpenAI chat links");
}
const ai=new URL(navigate("","/kontakt","https://chatgpt.com/c/example"),origin);
assert.equal(ai.searchParams.get("utm_source"),"chatgpt.com","Trusted AI referrer must be attributed");
assert.equal(ai.searchParams.get("utm_medium"),"referral","Untagged AI visit must carry referral medium");
assert.equal(navigate("","/kontakt","https://evilchatgpt.com/"),"/kontakt","Lookalike domains must be ignored");
assert.equal(navigate("?utm_source=facebook","/kontakt","https://chatgpt.com/").includes("utm_source=facebook"),true,"Explicit campaign must have priority");

for (const [referrer,canonical] of [
 ["https://www.perplexity.ai/search/abc","perplexity.ai"],
 ["https://claude.ai/new","claude.ai"],
 ["https://gemini.google.com/app","gemini.google.com"],
 ["https://copilot.microsoft.com/chats/1","copilot.microsoft.com"],
 ["https://grok.com/","grok.com"]
]) {
 const carried=new URL(navigate("","/kontakt",referrer),origin);
 assert.equal(carried.searchParams.get("utm_source"),canonical,"Recognize AI source: "+canonical);
 assert.equal(carried.searchParams.get("utm_medium"),"referral","Referrer medium for "+canonical);
 const direct=new URL(navigate("?utm_source="+encodeURIComponent(canonical),"/kontakt"),origin);
 assert.equal(direct.searchParams.get("utm_source"),canonical,"Explicit source for "+canonical);
}
for(const referrer of ["https://perplexity.ai.evil.example/","https://claude.ai.evil.example/","https://fakegemini.google.com/","https://fakecopilot.microsoft.com/","https://grok.com.evil.example/"]){
 assert.equal(navigate("","/kontakt",referrer),"/kontakt","Reject hostname lookalike "+referrer);
}
assert.equal(new URL(navigate("?utm_source=google","/kontakt","https://www.perplexity.ai/"),origin).searchParams.get("utm_source"),"google",
 "Explicit non-AI marketing source takes precedence over AI referrer");
for(const [name, sources] of [["links",allowedSources(attribution,"allowedSources")],["form",allowedSources(form,"sourceAllowed")],["chatbot",allowedSources(chatbot,"allowedSources")],["navigator",allowedSources(navigator,"sourceAllowed")],["plan",allowedSources(plan,"allowedSources")]]){
 for(const source of ["perplexity.ai","claude.ai","gemini.google.com","copilot.microsoft.com","grok.com"]){
  assert.ok(sources.has(source),name+" must accept "+source);
 }
}

console.log("OK: tagged and untagged ChatGPT referrals preserve safe attribution; no cookies or test submissions.");
