/** Build-stage usability improvements. Runs after all navigation generators.
 * Only affects native keyboard focus on real intra-page targets and missing
 * descriptions/security attributes. No client scripts, new content or forms.
 */
const tagPattern=/<(?:!--[\s\S]*?--|(?:script|style)\b[^>]*>[\s\S]*?<\/(?:script|style)>|\/?[a-z][\w:-]*\b(?:[^>"']|"[^"]*"|'[^']*')*)>/gi;
const attr=(tag,key)=>tag.match(new RegExp('(?:^|\\s)'+key+'\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\')','i'))?.slice(1).find(v=>v!==undefined)??"";
const has=(tag,key)=>new RegExp('(?:^|\\s)'+key+'(?:\\s*=|\\s|/?>)','i').test(tag);
const append=(tag,attrs)=>tag.replace(/\s*\/?>$/,end=>attrs+end);
const decode=value=>{try{return decodeURIComponent(value)}catch{return value}};
export function enhanceKeyboardNavigation(html,path){
 const changes=[];const targets=new Set();
 for(const match of html.matchAll(tagPattern)){
  const tag=match[0];
  if(!/^<a\b/i.test(tag))continue;
  const href=attr(tag,"href");
  if(href.startsWith("#")&&href.length>1)targets.add(decode(href.slice(1)));
 }
 let ordinal=0;
 const updated=html.replace(tagPattern,original=>{
  let tag=original;
  if(!/^<[a-z]/i.test(tag)||/^<(?:script|style)\b/i.test(tag))return tag;
  const name=tag.match(/^<([a-z][\w:-]*)/i)?.[1]?.toLowerCase();
  ordinal++;
  const id=attr(tag,"id");
  const record=kind=>changes.push({kind,page:path,element:name,ordinal,...(id?{id}: {})});
  // tabindex=-1 does not add a stop to the Tab sequence. It lets a native
  // fragment navigation move keyboard focus to the linked reading region.
  if((name==="main"||(/^(?:h[1-6]|section|article|div)$/.test(name)&&id&&targets.has(id)))
   &&!has(tag,"tabindex")&&!has(tag,"hidden")&&!has(tag,"inert")&&attr(tag,"aria-hidden")!=="true"){
   tag=append(tag,' tabindex="-1"');record("focusable-reading-target");
  }
  if(name==="a"&&has(tag,"href")){
   const href=attr(tag,"href"),blank=attr(tag,"target")==="_blank";
   if(blank&&!attr(tag,"rel").split(/\s+/).includes("noopener")&&!attr(tag,"rel").split(/\s+/).includes("noreferrer")){
    const rel=attr(tag,"rel");tag=has(tag,"rel")?tag.replace(/\srel\s*=\s*(?:"[^"]*"|'[^']*')/i,' rel="'+(rel?rel+" ":"")+'noopener"'):append(tag,' rel="noopener"');
    record("safe-new-tab");
   }
   if(!has(tag,"aria-description")){
    const description=has(tag,"download")?"Pobiera plik na urządzenie":blank?"Otwiera stronę w nowej karcie":href.startsWith("tel:")?"Otwiera połączenie telefoniczne":href.startsWith("mailto:")?"Otwiera program pocztowy":"";
    if(description){tag=append(tag,' aria-description="'+description+'"');record("link-action-description-final");}
   }
  }
  if(name==="img"){
   const src=attr(tag,"src");
   if(/^https?:\/\//i.test(src)&&!/^https:\/\/twoja-sprawa\.pages\.dev\//i.test(src)&&!has(tag,"referrerpolicy")){
    tag=append(tag,' referrerpolicy="no-referrer"');record("external-image-referrer-final");
   }
   if(!has(tag,"decoding")){tag=append(tag,' decoding="async"');record("image-decoding-final");}
  }
  if(name==="svg"&&attr(tag,"aria-hidden")==="true"&&!has(tag,"focusable")){
   tag=append(tag,' focusable="false"');record("decorative-svg-focus");
  }
  return tag;
 });
 return {html:updated,changes};
}
