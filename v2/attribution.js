/* Przenosi wyłącznie oznaczenia kampanii między stronami serwisu.
   Nie używa cookies, storage, analityki ani połączeń sieciowych. */
(() => {
 "use strict";
 const allowedSources=new Set(["facebook","instagram","tiktok","google","ulotka","plakat","qr","polecenie","organiczne","inne"]);
 const valid=value=>/^[a-z0-9_-]{1,40}$/.test(value);
 const query=new URLSearchParams(window.location.search);
 const source=(query.get("utm_source")||"").toLowerCase().trim();
 if(!allowedSources.has(source))return;
 const tracking={utm_source:source};
 for(const field of ["utm_medium","utm_campaign","utm_content"]){
  const value=(query.get(field)||"").toLowerCase().trim();
  if(valid(value))tracking[field]=value;
 }
 document.addEventListener("click",event=>{
  const link=event.target?.closest?.("a[href]");
  if(!link || event.defaultPrevented || event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute("download"))return;
  const raw=link.getAttribute("href");
  if(!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:") || raw.startsWith("javascript:"))return;
  let target;
  try{target=new URL(raw,window.location.href);}catch{return;}
  if(target.origin!==window.location.origin || !/^https?:$/.test(target.protocol))return;
  const existing=(target.searchParams.get("utm_source")||"").toLowerCase().trim();
  if(existing && existing!=="organiczne")return;
  if(existing==="organiczne" && source==="organiczne")return;
  for(const [field,value] of Object.entries(tracking))target.searchParams.set(field,value);
  if(existing==="organiczne" && source!=="organiczne"){
   for(const field of ["utm_medium","utm_campaign","utm_content"]){
    if(!(field in tracking))target.searchParams.delete(field);
   }
  }
  link.href=target.href;
 },true);
})();