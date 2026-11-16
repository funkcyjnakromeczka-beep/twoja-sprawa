/**
 * Incremental improvements on existing content, in production and preview:
 * image referrer privacy, missing async decoding, non-critical icon loading,
 * and missing accessible navigation-landmark names. No client JavaScript.
 */
import { PAGE_PATHS } from "./page-navigation.mjs";

const attr=(tag,name)=>new RegExp('(?:^|\\s)'+name+'\\s*=','i').test(tag);
const withAttr=(tag,name,value)=>tag.replace(/>$/, ' '+name+'="'+value+'">');
const getAttr=(tag,name)=>{
 const m=tag.match(new RegExp('(?:^|\\s)'+name+'\\s*=\\s*"([^"]*)"','i'));
 return m?.[1]??"";
};
const externalImage=tag=>{
 const src=getAttr(tag,"src");
 if(!(src.startsWith("https://")||src.startsWith("http://")))return false;
 try{return new URL(src).hostname.toLowerCase()!=="twoja-sprawa.pages.dev";}catch{return false;}
};
const decorativeSocialIcon=tag=>{
 const cls=getAttr(tag,"class");
 return cls.split(/\s+/).includes("social-brand-icon")&&/\/assets\/icon-(?:facebook|tiktok)\.svg(?:\?|$)/.test(getAttr(tag,"src"));
};

/** @returns {{html:string, changes:Array<{kind:string, detail:string}>}} */
export function improveMediaAndNavigation(markup,path){
 if(!PAGE_PATHS.includes(path))return {html:markup,changes:[]};
 const changes=[];
 let imageIndex=0;
 let html=markup.replace(/<img\b[^>]*>/gi,original=>{
  imageIndex++;
  let tag=original;
  const src=getAttr(tag,"src");
  const imageReference="#"+imageIndex+" "+src;
  if(externalImage(tag)&&!attr(tag,"referrerpolicy")){
   tag=withAttr(tag,"referrerpolicy","no-referrer");
   changes.push({kind:"external-image-privacy",detail:imageReference});
  }
  if(!attr(tag,"decoding")){
   tag=withAttr(tag,"decoding","async");
   changes.push({kind:"nonblocking-image-decoding",detail:imageReference});
  }
  if(decorativeSocialIcon(tag)&&!attr(tag,"loading")){
   tag=withAttr(tag,"loading","lazy");
   changes.push({kind:"lazy-social-icon",detail:imageReference});
  }
  if(decorativeSocialIcon(tag)&&!attr(tag,"fetchpriority")){
   tag=withAttr(tag,"fetchpriority","low");
   changes.push({kind:"low-priority-social-icon",detail:imageReference});
  }
  return tag;
 });
 let navIndex=0;
 html=html.replace(/<nav\b[^>]*>/gi,original=>{
  navIndex++;
  if(attr(original,"aria-label")||attr(original,"aria-labelledby"))return original;
  changes.push({kind:"named-navigation-landmark",detail:"nav "+navIndex});
  return withAttr(original,"aria-label","Nawigacja główna");
 });
 return {html,changes};
}
