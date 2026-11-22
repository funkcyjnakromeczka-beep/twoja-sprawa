/**
 * Production/preview content navigation and link-action accessibility.
 * Changes are build-time HTML only; no tracking, network calls or new runtime JS.
 * All changes are individually audit-identified by page and element ordinal.
 */
import {PAGE_PATHS} from "./page-navigation.mjs";

const attr=(tag,name)=>{
 const m=tag.match(new RegExp('(?:^|\\s)'+name+'\\s*=\\s*"([^"]*)"','i'));
 return m?.[1]??"";
};
const has=(tag,name)=>new RegExp('(?:^|\\s)'+name+'\\s*=','i').test(tag);
const extend=(tag,attributes)=>tag.replace(/>$/,attributes+">");
const plain=html=>html.replace(/<[^>]*>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\s+/g," ").trim();
const safe=value=>String(value).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const slug=value=>plain(value).toLocaleLowerCase("pl-PL").replaceAll("ł","l").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,55).replace(/-$/,"")||"sekcja";
const TOC_EXCLUDE=new Set(["index.html","faq.html","404.html","start.html","plan-dzialania.html","szukaj.html","narzedzia/test-formularzy.html",
 "kampanie/skd.html","kampanie/swiadczenie-wspierajace.html","kampanie/szkody-gornicze.html"]);


const contactRoute=path=>{
 if(path.startsWith("uslugi/")||path.startsWith("lokalnie/"))return "#formularz";
 const v=path.toLowerCase();
 let code="";
 if(/frank|chf/.test(v))code="franki";
 else if(/skd|kredyt-pln/.test(v))code="skd";
 else if(/swiadczenie|wzon|zus/.test(v))code="swiadczenie";
 else if(/renta/.test(v))code="renty";
 else if(/sluzebnosc|przesyl/.test(v))code="przesyl";
 else if(/gornicz|pekniecia|kopalni/.test(v))code="szkody";
 return "/v2/kontakt.html"+(code?"?usluga="+code:"")+"#formularz";
};
export function improveContentLinks(markup,path){
 if(!PAGE_PATHS.includes(path))return {html:markup,changes:[]};
 const changes=[];
 let anchors=0;
 let html=markup.replace(/<a\b[^>]*>/gi,tag=>{
  anchors++;
  if(!has(tag,"href"))return tag;
  const href=attr(tag,"href");
  if(has(tag,"aria-description"))return tag;
  let description="";
  if(attr(tag,"target")==="_blank")description="Otwiera stronę w nowej karcie";
  else if(href.startsWith("tel:"))description="Otwiera połączenie telefoniczne";
  else if(href.startsWith("mailto:"))description="Otwiera program pocztowy";
  if(!description)return tag;
  changes.push({kind:"link-action-description",detail:"link "+anchors+" "+href.slice(0,100)});
  return extend(tag,' aria-description="'+description+'"');
 });
 const firstMain=/<main\b[^>]*>/i.exec(html);
 const endMain=firstMain?html.indexOf("</main>",firstMain.index+firstMain[0].length):-1;
 if(!firstMain||endMain<0)return {html,changes};
 const before=html.slice(0,firstMain.index+firstMain[0].length);
 let body=html.slice(firstMain.index+firstMain[0].length,endMain);
 const after=html.slice(endMain);
 const allIds=new Set([...html.matchAll(/\bid=(["'])([^"']+)\1/g)].map(m=>m[2]));
 const headings=[];
 let hn=0;
 body=body.replace(/<h([2-6])\b([^>]*)>([\s\S]*?)<\/h\1>/gi,(whole,lvl,attrs,inner)=>{
  hn++;
  let id=attr(attrs,"id");
  const text=plain(inner).slice(0,130);
  if(!id){
   const stem="tresc-"+slug(inner);
   id=stem;
   let i=2;while(allIds.has(id))id=stem+"-"+i++;
   allIds.add(id);
   changes.push({kind:"heading-deep-link",detail:"H"+lvl+" "+hn+" #"+id});
  }
  headings.push({level:Number(lvl),id,text});
  const opening="<h"+lvl+attrs+(has(attrs,"id")?"":' id="'+id+'"')+">";
  return opening+inner+"</h"+lvl+">";
 });
 // Assign a heading to the closest containing section/article.  Native
 // elements stay native and any explicit labels are left untouched.
 const token=/<\/?(?:section|article|h[2-6])\b[^>]*>/gi;
 const containers=[],stack=[];
 let match;
 while((match=token.exec(body))){
  const raw=match[0],name=raw.match(/^<\/?([a-z0-9]+)/i)?.[1]?.toLowerCase();
  const closing=raw.startsWith("</");
  if(name==="section"||name==="article"){
   if(!closing){
    const obj={tag:name,index:match.index,open:raw,candidate:"",number:containers.length+1};
    containers.push(obj);stack.push(obj);
   }else{
    const top=stack.at(-1);
    if(top?.tag===name)stack.pop();
   }
  }else if(!closing){
   const top=stack.at(-1);
   if(!top||top.candidate||has(top.open,"aria-label")||has(top.open,"aria-labelledby"))continue;
   const level=Number(name.slice(1));
   if(level<2||(top.tag==="section"&&level>4))continue;
   const id=attr(raw,"id");
   if(id)top.candidate=id;
  }
 }
 const patches=[];
 for(const c of containers){
  if(c.candidate&&!has(c.open,"aria-label")&&!has(c.open,"aria-labelledby")){
   patches.push({index:c.index,length:c.open.length,replacement:extend(c.open,' aria-labelledby="'+safe(c.candidate)+'"')});
   changes.push({kind:"named-content-region",detail:c.tag+" "+c.number+" #"+c.candidate});
  }
 }
 patches.sort((a,b)=>b.index-a.index);
 for(const p of patches)body=body.slice(0,p.index)+p.replacement+body.slice(p.index+p.length);
 // A concise, collapsed TOC on content-heavy pages; section links use the
 // real heading IDs and do not alter the page's form/lead-routing logic.
 const h2=headings.filter(h=>h.level===2&&h.text);
 if(!TOC_EXCLUDE.has(path)&&h2.length>=3&&!body.includes('class="content-toc"')){
  const entries=h2.slice(0,24);
  const contactHref=contactRoute(path);
  const toc='<details class="content-toc"><summary>Spis treści — przejdź do sekcji</summary>'+
    '<nav aria-label="Spis treści strony"><ol>'+entries.map(h=>'<li><a href="#'+safe(h.id)+'">'+safe(h.text)+'</a></li>').join("")+
    '</ol><p class="content-toc-contact"><a href="'+safe(contactHref)+'">Zostaw kontakt w swojej sprawie →</a></p></nav></details>';
  // On editorial pages the headline must precede secondary navigation.
  // Keep all original heading IDs and every existing TOC entry.
  if(path.startsWith("wiedza/")&&path!=="wiedza/index.html"){
   const hero=/<section\b[^>]*class="[^"]*\bsubhero\b[^"]*"[^>]*>[\s\S]*?<\/section>/i.exec(body);
   if(hero){const end=hero.index+hero[0].length;body=body.slice(0,end)+toc+body.slice(end);}
   else body=toc+body;
  }else if(path.startsWith("poradniki/")){
   const intro=/<p\b[^>]*class="[^"]*\bguide-lead\b[^"]*"[^>]*>[\s\S]*?<\/p>/i.exec(body);
   if(intro){const end=intro.index+intro[0].length;body=body.slice(0,end)+toc+body.slice(end);}
   else body=toc+body;
  }else body=toc+body;
  for(const [i,h] of entries.entries())changes.push({kind:"content-toc-shortcut",detail:"item "+(i+1)+" #"+h.id});
  changes.push({kind:"content-toc-panel",detail:"section navigation ("+entries.length+" entries)"});
  changes.push({kind:"content-toc-contact",detail:"existing form: "+contactHref});
  const mainName=attr(firstMain[0],"aria-labelledby");
  if(!mainName)throw new Error("Page heading landmark required to build return link: "+path);
  body+='<p class="content-return-top"><a href="#'+safe(mainName)+'">↑ Wróć na początek strony</a></p>';
  changes.push({kind:"content-return-top",detail:"return to #"+mainName});
 }
 html=before+body+after;
 // Load a small CSS file only on pages that gained an actual TOC or heading.
 if(changes.some(c=>c.kind==="content-toc-panel")){
  if(!html.includes('href="/v2/content-anchors.css"'))
   html=html.replace("</head>",'<link rel="stylesheet" href="/v2/content-anchors.css"></head>');
 }
 return {html,changes};
}
