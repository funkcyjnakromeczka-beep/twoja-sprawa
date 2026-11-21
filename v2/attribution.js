/* Przenosi wyłącznie oznaczenia kampanii między stronami serwisu.
   Nie używa cookies, storage, analityki ani połączeń sieciowych. */
(() => {
 "use strict";
 const allowedSources=new Set(["facebook","instagram","tiktok","google","chatgpt.com","perplexity.ai","claude.ai","gemini.google.com","copilot.microsoft.com","grok.com","ulotka","plakat","qr","polecenie","organiczne","strona","inne","broszura"]);
 const valid=value=>/^[a-z0-9_-]{1,40}$/.test(value);
 const query=new URLSearchParams(window.location.search);
 const inferredAIReferrer=(()=>{
  try {
    const host=new URL(document.referrer).hostname.toLowerCase();
    // Exact hostname matching: never infer visits from lookalikes or arbitrary URLs.
    const trusted={
      "chatgpt.com":"chatgpt.com","www.chatgpt.com":"chatgpt.com","chat.openai.com":"chatgpt.com",
      "perplexity.ai":"perplexity.ai","www.perplexity.ai":"perplexity.ai",
      "claude.ai":"claude.ai","www.claude.ai":"claude.ai",
      "gemini.google.com":"gemini.google.com",
      "copilot.microsoft.com":"copilot.microsoft.com",
      "grok.com":"grok.com","www.grok.com":"grok.com"
    };
    return Object.prototype.hasOwnProperty.call(trusted,host)?trusted[host]:"";
  } catch { return ""; }
 })();
 const source=(query.get("utm_source")||inferredAIReferrer).toLowerCase().trim();
 if(!allowedSources.has(source))return;
 const tracking={utm_source:source};
 // Gdy brak oznaczenia UTM, rozpoznaj tylko znany nagłówek strony odsyłającej.
 if(inferredAIReferrer&&!query.get("utm_source"))tracking.utm_medium="referral";
 for(const field of ["utm_medium","utm_campaign","utm_content"]){
  const value=(query.get(field)||"").toLowerCase().trim();
  if(valid(value))tracking[field]=value;
 }
 // Set safe attribution on static same-origin anchors before activation.
 // This also covers keyboard activation, context-menu "open in new tab"
 // and middle click, which do not always dispatch an ordinary click.
 // Dynamic links are still handled on an actual click below.
 const tagLink=link=>{
  if(!link||link.hasAttribute("download")||link.classList?.contains("service-share-direct"))return;
  const raw=link.getAttribute("href");
  if(!raw||raw.startsWith("#")||raw.startsWith("mailto:")||raw.startsWith("tel:")||raw.startsWith("javascript:"))return;
  let target;
  try{target=new URL(raw,window.location.href);}catch{return;}
  if(target.origin!==window.location.origin||!/^https?:$/.test(target.protocol))return;
  const existing=(target.searchParams.get("utm_source")||"").toLowerCase().trim();
  if(existing&&existing!=="organiczne")return;
  if(existing==="organiczne"&&source==="organiczne")return;
  for(const [field,value] of Object.entries(tracking))target.searchParams.set(field,value);
  if(existing==="organiczne"&&source!=="organiczne"){
   for(const field of ["utm_medium","utm_campaign","utm_content"]){
    if(!(field in tracking))target.searchParams.delete(field);
   }
  }
  link.href=target.href;
 };
 if(typeof document.querySelectorAll==="function"){
  for(const link of document.querySelectorAll("a[href]"))tagLink(link);
 }
 document.addEventListener("click",event=>{
  const link=event.target?.closest?.("a[href]");
  if(!link || event.defaultPrevented || event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)return;
  tagLink(link);
 },true);
})();
