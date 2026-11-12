/* Lokalny silnik wyszukiwania — zero requestów, cookies, storage i zależności zewnętrznych. */
(()=>{
 "use strict";
 const entries=[...(window.TwojaSprawaSearchPages1||[]),...(window.TwojaSprawaSearchPages2||[]),...(window.TwojaSprawaSearchFaq||[])];
 const categories=new Set(["all","szkody","swiadczenie","renty","skd","franki","przesyl","inne"]);
 const normalize=value=>String(value||"").toLocaleLowerCase("pl-PL").normalize("NFD").replace(/\p{M}/gu,"").replaceAll("ł","l").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
 const index=entries.map((entry,i)=>{
  const title=normalize(entry.title),description=normalize(entry.description),keywords=normalize(entry.keywords);
  return {entry,index:i,title,description,keywords,all:title+" "+description+" "+keywords};
 });
 // Only used when a literal all-word query returns no results; ordinary searches
 // and precise FAQ links retain their existing ranking and filtering semantics.
 const questionWords=new Set([
  "jak","co","czy","kiedy","gdzie","ile","mam","masz","mamy","chce","chcesz","chca",
  "moge","mozesz","mozna","jest","sa","oraz","i","a","albo","ale","do","od","po","za",
  "z","ze","na","w","we","dla","o","u","przy","pod","nad","bez","to","ten","ta","te",
  "tych","tego","ktory","ktora","ktore","jesli","jezeli","gdy","nie","wiem","robic",
  "zrobic","nalezy","mi","sie","moj","moja","moje","jakiej","jakiego","prosze",
  "chcialbym","chcialabym","otrzymac","dostac","uzyskac","sprawdzic","przygotowac",
  "potrzebuje"
 ]);
 const wordRoot=word=>word.length>=6?word.slice(0,5):word.length===5?word.slice(0,4):word;
 const search=(input="",category="all",limit=30)=>{
  const raw=normalize(input);
  const pieces=raw.slice(0,130).split(" ").filter(Boolean).slice(0,12);
  const cat=categories.has(category)?category:"all";
  const max=Number.isSafeInteger(limit)?Math.max(1,Math.min(100,limit)):30;
  const inCategory=row=>cat==="all"||row.entry.category===cat;
  const literal=index.filter(row=>inCategory(row)&&pieces.every(part=>row.all.includes(part)));
  if(literal.length){
   return literal.map(row=>{
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
  }
  if(!pieces.length)return [];
  // For natural Polish questions, skip conversational words and compare short
  // beginnings of important words: "umowę"/"umowy", "decyzję"/"decyzji".
  const roots=[...new Set(pieces.filter(word=>word.length>=3&&!questionWords.has(word)).map(wordRoot))];
  if(!roots.length)return [];
  const minimum=roots.length===1?1:2;
  return index.filter(inCategory).map(row=>{
   const hits=roots.filter(root=>row.all.includes(root)).length;
   const titleHits=roots.filter(root=>row.title.includes(root)).length;
   const descriptionHits=roots.filter(root=>row.description.includes(root)).length;
   return {...row.entry,score:hits*35+titleHits*25+descriptionHits*8+(row.entry.id.startsWith("page:")?3:0),order:row.index,similar:true,hits};
  }).filter(row=>row.hits>=minimum)
   .sort((a,b)=>b.score-a.score||a.order-b.order).slice(0,max)
   .map(({hits,...row})=>row);
 };
 window.TwojaSprawaSearch=Object.freeze({search,normalize,entries:Object.freeze(entries.slice()),categories:Object.freeze([...categories])});
})();
