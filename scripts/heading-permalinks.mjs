/**
 * Section permalink actions for long editorial pages.
 * Makes headings shareable via a visible keyboard/touch-accessible # anchor,
 * without tracking, clipboard access or replacing content.
 */
import {PAGE_PATHS} from "./page-navigation.mjs";
const EXCLUDED=new Set(["index.html","404.html","start.html","faq.html","szukaj.html",
 "plan-dzialania.html","narzedzia/test-formularzy.html",
 "kampanie/skd.html","kampanie/swiadczenie-wspierajace.html","kampanie/szkody-gornicze.html"]);
const attr=(s,k)=>s.match(new RegExp('(?:^|\\s)'+k+'="([^"]*)"','i'))?.[1]||"";
const escapeAttr=v=>v.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const text=v=>v.replace(/<[^>]*>/g," ").replace(/&amp;/g,"&").replace(/\s+/g," ").trim();
export function addSectionPermalinks(markup,path){
 if(!PAGE_PATHS.includes(path)||EXCLUDED.has(path))return {html:markup,changes:[]};
 const m=/<main\b[^>]*>/i.exec(markup);
 if(!m)return {html:markup,changes:[]};
 const end=markup.indexOf("</main>",m.index+m[0].length);
 if(end<0)return {html:markup,changes:[]};
 const head=markup.slice(0,m.index+m[0].length),tail=markup.slice(end);
 const changes=[];
 let ordinal=0;
 const body=markup.slice(m.index+m[0].length,end).replace(/<h([2-4])\b([^>]*)>([\s\S]*?)<\/h\1>/gi,(original,level,attrs,inside)=>{
  ordinal++;
  const id=attr(attrs,"id");
  const label=text(inside);
  if(!id||!label||/<a\b/i.test(inside)||/class="heading-permalink"/.test(inside))return original;
  const link='<a class="heading-permalink" href="#'+escapeAttr(id)+'" aria-label="Bezpośredni link do sekcji: '+escapeAttr(label.slice(0,92))+'"></a>';
  changes.push({kind:"permalink-to-heading",detail:"H"+level+" "+ordinal+" #"+id});
  return '<h'+level+attrs+'>'+inside+link+'</h'+level+'>';
 });
 if(!changes.length)return {html:markup,changes};
 let html=head+body+tail;
 if(!html.includes('href="/v2/heading-permalinks.css"')){
  html=html.replace("</head>",'<link rel="stylesheet" href="/v2/heading-permalinks.css"></head>');
 }
 return {html,changes};
}
