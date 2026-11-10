/* Lokalny silnik wyszukiwania — zero requestów, cookies, storage i zależności zewnętrznych. */
(()=>{
 "use strict";
 const entries=[...(window.TwojaSprawaSearchPages1||[]),...(window.TwojaSprawaSearchPages2||[]),...(window.TwojaSprawaSearchFaq||[])];
 const categories=new Set(["all","szkody","swiadczenie","renty","skd","przesyl","inne"]);
 const normalize=value=>String(value||"").toLocaleLowerCase("pl-PL").normalize("NFD").replace(/\p{M}/gu,"").replaceAll("ł","l").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
 const index=entries.map((entry,i)=>{
  const title=normalize(entry.title),description=normalize(entry.description),keywords=normalize(entry.keywords);
  return {entry,index:i,title,description,keywords,all:title+" "+description+" "+keywords};
 });
 const search=(input="",category="all",limit=30)=>{
  const raw=normalize(input);
  const pieces=raw.slice(0,130).split(" ").filter(Boolean).slice(0,12);
  const cat=categories.has(category)?category:"all";
  const max=Number.isSafeInteger(limit)?Math.max(1,Math.min(100,limit)):30;
  return index.filter(row=>(cat==="all"||row.entry.category===cat)&&pieces.every(part=>row.all.includes(part))).map(row=>{
    let score=0;
    if(pieces.length){
      if(row.title===raw)score+=140;
      else if(row.title.includes(raw))score+=65;
      if(row.description.includes(raw))score+=20;
      for(const part of pieces){
        if(row.title.includes(part))score+=15;
        else if(row.keywords.includes(part))score+=6;
        else score+=2;
      }
    }
    if(row.entry.id.startsWith("page:"))score+=3;
    return {...row.entry,score,order:row.index};
  }).sort((a,b)=>b.score-a.score||a.order-b.order).slice(0,max);
 };
 window.TwojaSprawaSearch=Object.freeze({search,normalize,entries:Object.freeze(entries.slice()),categories:Object.freeze([...categories])});
})();
