/** Build-only removal of exclusively homepage-scoped CSS from the separately served premium sheet. */
export function pruneHomepageRules(css){
 // Only prune entire normal rules with selectors requiring the homepage class.
 // Mixed selectors and all unknown at-rules are kept as authored.
 const scan=(s,start,targets)=>{
  let quote="",round=0,square=0;
  for(let i=start;i<s.length;i++){
   const ch=s[i];
   if(ch==="\\"){i++;continue;}
   if(quote){if(ch===quote)quote="";continue;}
   if(ch==="'"||ch==='"'){quote=ch;continue;}
   if(ch==="/"&&s[i+1]==="*"){
    const end=s.indexOf("*/",i+2);if(end<0)throw Error("Unterminated CSS comment");i=end+1;continue;
   }
   if(ch==="(")round++;else if(ch===")")round--;
   if(ch==="[")square++;else if(ch==="]")square--;
   if(!round&&!square&&targets.includes(ch))return i;
  }
  return -1;
 };
 const splitSelectors=header=>{
  const parts=[];let start=0;
  while(start<header.length){
   const end=scan(header,start,",");
   if(end<0){parts.push(header.slice(start).trim());break;}
   parts.push(header.slice(start,end).trim());start=end+1;
  }
  return parts;
 };
 const homeOnly=h=>{const parts=splitSelectors(h);return parts.length>0&&parts.every(p=>/^(?:body)?\.premium-v2(?=$|[\s.#:[>+~])/.test(p)&&!p.includes("/*"));};
 let removed=0;
 const visit=s=>{
  let out="",start=0;
  while(start<s.length){
   const open=scan(s,start,"{;");
   if(open<0){out+=s.slice(start);break;}
   if(s[open]===";"){out+=s.slice(start,open+1);start=open+1;continue;}
   let depth=1,end=open+1;
   while(depth){end=scan(s,end,"{}");if(end<0)throw Error("Unbalanced CSS block");depth+=s[end]==="{"?1:-1;end++;}
   const raw=s.slice(start,open),heading=raw.trim(),body=s.slice(open+1,end-1);
   if(/^@media\b/i.test(heading)){const inner=visit(body);if(inner.trim())out+=raw+"{"+inner+"}";}
   else if(!heading.startsWith("@")&&homeOnly(heading)){removed++;}
   else out+=s.slice(start,end);
   start=end;
  }
  return out;
 };
 return {css:visit(css),removed};
}


/** Exclude CSS rules that can only match body.premium-subpage from homepage release. */
export function pruneSubpageRules(css){
 const scan=(s,start,targets)=>{
  let quote="",round=0,square=0;
  for(let i=start;i<s.length;i++){
   const ch=s[i];
   if(ch==="\\"){i++;continue;}
   if(quote){if(ch===quote)quote="";continue;}
   if(ch==="'"||ch==='"'){quote=ch;continue;}
   if(ch==="(")round++;else if(ch===")")round--;
   if(ch==="[")square++;else if(ch==="]")square--;
   if(!round&&!square&&targets.includes(ch))return i;
  }
  return -1;
 };
 const splitSelectors=heading=>{
  const parts=[];let start=0;
  while(start<heading.length){
   const end=scan(heading,start,",");
   if(end<0){parts.push(heading.slice(start).trim());break;}
   parts.push(heading.slice(start,end).trim());start=end+1;
  }
  return parts;
 };
 const onlySubpage=heading=>{
  const parts=splitSelectors(heading);
  return parts.length>0&&parts.every(p=>/^(?:body)?\.premium-subpage(?=$|[\s.#:[>+~])/.test(p)&&!p.includes(":not("));
 };
 let removed=0;
 const visit=s=>{
  let out="",start=0;
  while(start<s.length){
   const open=scan(s,start,"{;");
   if(open<0){out+=s.slice(start);break;}
   if(s[open]===";"){out+=s.slice(start,open+1);start=open+1;continue;}
   let depth=1,end=open+1;
   while(depth){
    end=scan(s,end,"{}");
    if(end<0)throw Error("Unbalanced homepage CSS block");
    depth+=s[end]==="{"?1:-1;end++;
   }
   const raw=s.slice(start,open),heading=raw.trim(),body=s.slice(open+1,end-1);
   if(/^@(?:media|supports|container|layer)\b/i.test(heading)){
    const inner=visit(body);
    if(inner.trim())out+=raw+"{"+inner+"}";
   }else if(!heading.startsWith("@")&&onlySubpage(heading)){
    removed++;
   }else out+=s.slice(start,end);
   start=end;
  }
  return out;
 };
 return {css:visit(css),removed};
}
