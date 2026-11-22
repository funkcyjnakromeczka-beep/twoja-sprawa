#!/usr/bin/env node
/**
 * Static site release builder. Run: SITE_URL=https://example.com RELEASE=1 node scripts/build.mjs
 * Does not deploy. Builds dist/ locally. Requires Node 20+.
 */
import { readdir, readFile, writeFile, mkdir, cp, rm } from "node:fs/promises";
import { join, relative, dirname } from "node:path";
import { execFileSync } from "node:child_process";
import {withNetworkBrand} from "./network-brand.mjs";
import {toPublicRoute} from "./public-routes.mjs";
import { shouldIndexRoute } from "./seo-policy.mjs";
import {buildVerifiedArticlesFeed} from "./verified-articles-feed.mjs";
import { enhancePageNavigation } from "./page-navigation.mjs";
import {enhanceKeyboardNavigation} from "./keyboard-navigation.mjs";
import {legacyPageRedirects} from "./legacy-page-redirects.mjs";
import {improveMediaAndNavigation} from "./media-navigation-quality.mjs";
import {improveContentLinks} from "./content-anchors.mjs";
import {addSectionPermalinks} from "./heading-permalinks.mjs";
import {appendRelatedContent} from "./related-content.mjs";
import {bundleSubpageCss} from "./subpage-css-bundles.mjs";
import {pruneHomepageRules,pruneSubpageRules} from "./homepage-css-prune.mjs";
let homepageClassOutsideHome=false;
const source="v2", dest="dist";
const url=process.env.SITE_URL;
const release=process.env.RELEASE==="1";
const legalApproved=process.env.LEGAL_APPROVED==="1";
const contentApproved=process.env.CONTENT_APPROVED==="1";
const formApproved=process.env.FORM_APPROVED==="1";
if(!url || !/^https:\/\/[^/]+\.[^/]+\/?$/.test(url)) throw new Error("SITE_URL must be HTTPS origin without a path.");
const origin=url.replace(/\/$/,"");
if(!release || !legalApproved || !contentApproved || !formApproved) throw new Error("Release blocked. Requires RELEASE=1, LEGAL_APPROVED=1, CONTENT_APPROVED=1 and FORM_APPROVED=1 after verified sign-off.");
await rm(dest,{recursive:true,force:true});
await mkdir(dest,{recursive:true});
// Owner-provided team portraits are stored inside v2/assets whenever possible.
// A one-time Cloudflare fallback allows safe transition without relying on Lovable,
// which now permanently redirects and no longer serves its former image files.
const portraits=[
 {legacy:"https://twojasprawa-votum.lovable.app/assets/wojciech-CIUxrQ8A.jpg",output:"assets/wojciech-obieglo.jpg"},
 {legacy:"https://twojasprawa-votum.lovable.app/assets/paulina-B6guxyXQ.jpg",output:"assets/paulina-chandrala.jpg"}
];
const localizePortraits=markup=>portraits.reduce((html,item)=>html.replaceAll(item.legacy,"/"+item.output),markup);
const validatePortrait=(data,output)=>{
 if(data.length<10000 || data.length>8_000_000 || data[0]!==0xff || data[1]!==0xd8){
  throw new Error("Invalid local JPEG: "+output);
 }
};
async function fetchPortraits(){
 for(const item of portraits){
  let data;
  try{
   data=new Uint8Array(await readFile(join(source,item.output)));
  }catch(error){
   if(error.code!=="ENOENT")throw error;
   // Bootstrap fallback: previously published portrait on this project's own Cloudflare.
   const controller=new AbortController();
   const timer=setTimeout(()=>controller.abort(),20000);
   try{
    const safeURL="https://twoja-sprawa.pages.dev/"+item.output;
    const response=await fetch(safeURL,{signal:controller.signal});
    if(!response.ok || !(response.headers.get("content-type")||"").startsWith("image/jpeg")){
     throw new Error("Missing project portrait; backup HTTP "+response.status+" "+safeURL);
    }
    data=new Uint8Array(await response.arrayBuffer());
   }finally{clearTimeout(timer);}
  }
  validatePortrait(data,item.output);
  await mkdir(dirname(join(dest,item.output)),{recursive:true});
  await writeFile(join(dest,item.output),data);
 }
}
const pages=[];
const actualSourcePages=[];
const navigationChanges=[];
const pageLastmod=new Map();
// Real source commit date only. Never stamp every sitemap URL with build time:
// false freshness signals can weaken indexing trust. Omit if Git metadata is absent.
const sourceLastmod=relativePath=>{
 try{
  const timestamp=execFileSync("git",["log","-1","--format=%cI","--",join(source,relativePath)],{
   encoding:"utf8",timeout:1500,stdio:["ignore","pipe","ignore"]
  }).trim();
  // Normalize the real commit time to UTC before dropping the time component.
  // A local date just after midnight can otherwise appear to be tomorrow in CI.
  const parsed=new Date(timestamp);
  return Number.isFinite(parsed.getTime())?parsed.toISOString().slice(0,10):null;
 }catch{return null;}
};
const cssLayerReport={pages:0,requestsSaved:0,unique:new Set()};
// Only content-reviewed guides are indexable; keep this list in sync with seo-policy.mjs. Their authored
// Article JSON-LD must point to the actual extensionless Cloudflare canonical,
// not legacy /v2/*.html links. Do not duplicate or invent a second Article node.
const publishedArticleRoutes=new Set([
 "/wiedza/drobne-pekniecia-szkody-gornicze.html",
 "/wiedza/ugoda-z-kopalnia-co-sprawdzic.html",
 "/wiedza/swiadczenie-wspierajace-2026-wzon-zus.html",
 "/wiedza/renta-powypadkowa-dokumenty.html",
 "/wiedza/swiadczenie-wspierajace-dokumenty.html",
 "/wiedza/kredyt-pln-dokumenty-skd.html",
 "/wiedza/sluzebnosc-przesylu-slup-na-dzialce.html",
 "/wiedza/wypadek-przy-pracy-pierwsze-kroki.html"
]);
function reconcilePublishedArticle(markup,route,canonical){
 if(!publishedArticleRoutes.has(route))return markup;
 let found=0;
 const normalized=markup.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,(tag,raw)=>{
  let data;
  try{data=JSON.parse(raw);}catch{return tag;}
  if(data?.["@type"]!=="Article")return tag;
  found++;
  const article={...data,
   "@id":canonical+"#article",url:canonical,
   mainEntityOfPage:{"@id":canonical+"#webpage"},
   author:{"@id":origin+"/#successtree"},
   publisher:{"@id":origin+"/#successtree"}
  };
  return '<script type="application/ld+json">'+JSON.stringify(article).replaceAll("<","\\u003c")+"</script>";
 });
 if(found!==1)throw new Error("Expected exactly one visible editorial Article JSON-LD in "+route+", found "+found);
 return normalized;
}
// Older source pages sometimes contain manually authored BreadcrumbList JSON-LD
// as well as the generated graph derived from the visible navigation. Publishing
// both creates duplicate, partly noncanonical markup. Keep the visible route
// as the only source of structured breadcrumbs on every site page.
function stripAuthoredBreadcrumbs(markup,rel){
 const hasVisibleBreadcrumb=markup.includes('<nav class="site-breadcrumbs" aria-label="Ścieżka nawigacji">');
 let removed=0;
 const html=markup.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,(tag,raw)=>{
  let schema;
  try{schema=JSON.parse(raw);}catch{return tag;}
  if(schema?.["@type"]!=="BreadcrumbList")return tag;
  if(!hasVisibleBreadcrumb)throw new Error("Authored BreadcrumbList lacks a matching visible breadcrumb: "+rel);
  removed++;
  return "";
 });
 if(removed>1)throw new Error("Unexpected multiple authored BreadcrumbLists: "+rel);
 return html;
}
const structured = (route,canonical,title,markup) => {
  // FAQPage reflects only answers visibly published on /faq; no invented recommendations.
  const decodeEntities=value=>value.replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">");

  // This graph describes SuccessTree's own agency site, never VOTUM as the publisher.
  const owner={"@type":"Person","@id":origin+"/#wojciech-obieglo",name:"Wojciech Obiegło",url:origin+"/o-nas#wojciech",image:origin+"/assets/wojciech-obieglo.jpg"};
  const colleague={"@type":"Person","@id":origin+"/#paulina-chandrala",name:"Paulina Chandrała",url:origin+"/o-nas#paulina",image:origin+"/assets/paulina-chandrala.jpg"};
  const organization={
    "@type":"Organization","@id":origin+"/#successtree",name:"SuccessTree OBIEGŁO WOJCIECH",
    alternateName:"SuccessTree",
    taxID:"6922462522",
    sameAs:["https://maps.google.com/maps?cid=14872348330301996246"],
    description:"Odrębna działalność przedstawicielska prowadząca serwis Twoja Sprawa we współpracy agencyjnej z podmiotami Grupy VOTUM. Pierwszy kontakt w sprawach szkód górniczych w Lubinie i Polkowicach, świadczenia wspierającego, sankcji kredytu darmowego (SKD) i rent powypadkowych. Serwis nie jest oficjalną witryną VOTUM.",
    url:origin+"/",email:"wojciech.obieglo@votum-ds.pl",telephone:"+48 796 441 345",
    founder:{"@id":owner["@id"]},
    contactPoint:[
      {"@type":"ContactPoint",contactType:"Szkody górnicze i pozostałe zapytania",telephone:"+48 796 441 345",email:"wojciech.obieglo@votum-ds.pl",areaServed:"PL",availableLanguage:"pl"},
      {"@type":"ContactPoint",contactType:"Świadczenie wspierające i renty",telephone:"+48 500 171 531",email:"paulina.chandrala@votum-ds.pl",areaServed:"PL",availableLanguage:"pl"}
    ]
  };
  const site={"@type":"WebSite","@id":origin+"/#website",name:"Twoja Sprawa",url:origin+"/",publisher:{"@id":organization["@id"]},inLanguage:"pl-PL"};
  const page={"@type":"WebPage","@id":canonical+"#webpage",url:canonical,name:title,isPartOf:{"@id":site["@id"]},inLanguage:"pl-PL"};
  // Social links explicitly published in this page's contextual section are
  // related resources, NOT sameAs identities of SuccessTree or the advisers.
  // Do not claim ownership of a Facebook group or third-party profile in JSON-LD.
  const socialRegion=markup.match(/<section class="[^"]*social-community[^"]*"[\s\S]*?<\/section>/)?.[0]||"";
  const relatedLinks=[...socialRegion.matchAll(/<a href="(https:\/\/(?:www\.facebook\.com|www\.tiktok\.com)\/[^"]+)"/g)]
   .map(match=>match[1]);
  if(relatedLinks.length)page.relatedLink=[...new Set(relatedLinks)];
  // Use Schema.org's specific WebPage subtypes on their matching visible pages.
  if(route==="/kontakt.html"){
    page["@type"]="ContactPage";
    page.mainEntity={"@id":organization["@id"]};
  }
  if(route==="/o-nas.html"){
    page["@type"]="AboutPage";
    page.about=[{"@id":owner["@id"]},{"@id":colleague["@id"]}];
  }
  if(route==="/wiedza/")page["@type"]="CollectionPage";
  if(publishedArticleRoutes.has(route))page.mainEntity={"@id":canonical+"#article"};

  if(route==="/faq.html"){
    const visible=[...markup.matchAll(/<article class="faq-card"[^>]*>[\s\S]*?<summary>([^<]+)<\/summary><div class="faq-answer"><p>([^<]+)<\/p>/g)];
    const cardCount=(markup.match(/<article class="faq-card"/g)||[]).length;
    if(!cardCount||visible.length!==cardCount)throw new Error("FAQ structured data out of sync: "+visible.length+" parsed answers / "+cardCount+" visible cards");
    page["@type"]="FAQPage";
    page.mainEntity=visible.map(([,question,answer])=>({
      "@type":"Question",
      name:decodeEntities(question),
      acceptedAnswer:{"@type":"Answer",text:decodeEntities(answer)}
    }));
  }

  const graph=[owner,colleague,organization,site,page];
  // Local landing pages cover both the named town and its municipality.
  // Explicit Place types make this unambiguous to crawlers without inventing
  // a physical office or claiming SuccessTree is a mine operator.
  const localCity=route.startsWith("/lokalnie/")?
    (route.includes("polkowice")?"Polkowice":"Lubin"):null;
  const localAreaServed=localCity?[
    {"@type":"City",name:localCity},
    {"@type":"AdministrativeArea",name:"gmina "+localCity,
      containedInPlace:{"@type":"AdministrativeArea",name:"województwo dolnośląskie"}}
  ]:null;
  if(route.startsWith("/uslugi/")||route.startsWith("/lokalnie/")){
    const visibleDescription=markup.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1]||"";
    page.mainEntity={"@id":canonical+"#service"};
    graph.push({
      "@type":"Service","@id":canonical+"#service",
      ...(visibleDescription?{description:decodeEntities(visibleDescription)}:{}),
      name:title.split("|")[0].trim().replace(/\\s*[—–-]\\s*Twoja Sprawa.*$/,""),
      provider:{"@id":organization["@id"]},
      areaServed:localAreaServed||(route.includes("szkody-gornicze")?"Lubin, Polkowice i okolice":"Polska"),
      url:canonical,
      serviceType:route.includes("swiadczenie")?"Wsparcie w sprawach świadczenia wspierającego":route.includes("szkody-gornicze")?"Wstępna analiza szkód górniczych":route.includes("kredyty-frankowe")?"Analiza umów kredytów CHF i możliwych rozliczeń z bankiem":route.includes("kredyty-pln")?"Analiza kredytu konsumenckiego pod kątem Sankcji Kredytu Darmowego":"Wstępny kontakt i analiza sprawy"
    });
  }
  // Structured breadcrumbs are derived from the visible, editorially
  // curated navigation instead of a separate SEO-only naming scheme.
  const breadcrumbMarkup=markup.match(/<nav class="site-breadcrumbs" aria-label="Ścieżka nawigacji">([\s\S]*?)<\/nav>/)?.[1];
  if(breadcrumbMarkup){
    const chain=[...breadcrumbMarkup.matchAll(/<a href="([^"]+)">([^<]+)<\/a>/g)]
      .map(([,href,name])=>({name:decodeEntities(name.trim()),item:new URL(href,origin).href}));
    const current=breadcrumbMarkup.match(/<span aria-current="page">([^<]+)<\/span>/);
    if(!current||chain.length<1)throw new Error("Incomplete visible breadcrumbs on "+route);
    chain.push({name:decodeEntities(current[1].trim()),item:canonical});
    const breadcrumb={"@type":"BreadcrumbList","@id":canonical+"#breadcrumb",
      itemListElement:chain.map((value,index)=>({"@type":"ListItem",position:index+1,name:value.name,item:value.item}))};
    graph.push(breadcrumb);
    page.breadcrumb={"@id":breadcrumb["@id"]};
  }
  return JSON.stringify({"@context":"https://schema.org","@graph":graph}).replaceAll("<","\\u003c");
};
// Same-origin social previews for every public route; existing project photos only.
function upsertSocialMetadata(markup,route,origin){
  const metaTag=(field,key)=>new RegExp('<meta\\b(?=[^>]*\\b'+field+'="'+key+'")[^>]*>','i');
  const getContent=(field,key)=>{
    const tag=markup.match(metaTag(field,key))?.[0]||"";
    return tag.match(/\bcontent="([^"]*)"/i)?.[1]||"";
  };
  const setContent=(field,key,value)=>{
    const tag='<meta '+field+'="'+key+'" content="'+value+'">';
    const pattern=metaTag(field,key);
    markup=pattern.test(markup)?markup.replace(pattern,tag):markup.replace("</head>",tag+"</head>");
  };
  const title=(markup.match(/<title>([^<]+)<\/title>/i)?.[1]||"Twoja Sprawa").trim();
  const description=getContent("name","description");
  const usePaulina=/swiadczenie-wspierajace|renty-powypadkowe/.test(route);
  const person=usePaulina?"Paulina Chandrała":"Wojciech Obiegło";
  // Facebook link previews are extracted server-side, without running JavaScript.
  // Use the first-party 1200x630 brand card for every destination provided by the
  // campaign-link generator, and for the corresponding mining service landing.
  // Otherwise keep the authentic adviser portrait (never a broken CDN reference).
  const brandedRoutes=new Set([
    "/", // Homepage is the destination of Google Business Profile links.
    "/kampanie/szkody-gornicze.html",
    "/kampanie/swiadczenie-wspierajace.html",
    "/kampanie/renty-powypadkowe.html",
    "/kampanie/skd.html",
    "/uslugi/renty-powypadkowe.html",
    "/uslugi/sluzebnosc-przesylu.html",
    "/uslugi/kredyty-frankowe.html",
    "/uslugi/szkody-gornicze.html",
    "/uslugi/kredyty-pln.html",
    "/uslugi/swiadczenie-wspierajace.html",
    "/lokalnie/szkody-gornicze-lubin.html",
    "/lokalnie/szkody-gornicze-polkowice.html"
  ]);
  const branded=brandedRoutes.has(route);
  const image=origin+"/assets/"+(branded?"og-twoja-sprawa-metallic-v1.jpg":(usePaulina?"paulina-chandrala.jpg":"wojciech-obieglo.jpg"));
  const imageAlt=branded?"Twoja Sprawa — VOTUM Odszkodowania; SuccessTree — współpraca agencyjna z VOTUM":person+" — osoba do pierwszego kontaktu, Twoja Sprawa";
  setContent("property","og:title",title);
  if(description)setContent("property","og:description",description);
  setContent("property","og:image",image);
  setContent("property","og:image:secure_url",image);
  setContent("property","og:image:type","image/jpeg");
  if(branded){
    setContent("property","og:image:width","1536");
    setContent("property","og:image:height","803");
  }
  setContent("property","og:image:alt",imageAlt);
  setContent("name","twitter:card","summary_large_image");
  setContent("name","twitter:title",title);
  if(description)setContent("name","twitter:description",description);
  setContent("name","twitter:image",image);
  setContent("name","twitter:image:alt",imageAlt);
  return markup;
}

// Source homepage has an older agency Organization/WebSite JSON-LD graph.
// Keep its visible FAQ schema, but generate the agency graph once with the
// verified per-advisor contacts below. This avoids two Organization nodes
// with the same @id and different contact information.
function stripSourceHomeAgencySchema(markup,rel){
 if(rel!=="index.html")return markup;
 return markup.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,(tag,raw)=>{
  let parsed;
  try{parsed=JSON.parse(raw);}catch{return tag;}
  const graph=parsed?.["@graph"];
  if(!Array.isArray(graph)||graph.length!==2)return tag;
  const agency=graph.find(item=>item["@type"]==="Organization");
  const website=graph.find(item=>item["@type"]==="WebSite");
  if(agency?.name!=="SuccessTree OBIEGŁO WOJCIECH"||website?.name!=="Twoja Sprawa")return tag;
  return "";
 });
}
// Production-only CSS comment removal. Whitespace and selector ordering remain
// untouched; preserve quoted strings/URLs so embedded content isn't modified.
// Source files retain all author notes for ongoing maintenance.
function stripCssComments(css){
 let result="",start=0,quote=null;
 for(let i=0;i<css.length;i++){
  const ch=css[i];
  if(quote){
   if(ch==="\\"){i++;continue;}
   if(ch===quote)quote=null;
   continue;
  }
  if(ch==='"'||ch==="'"){quote=ch;continue;}
  if(ch==="/"&&css[i+1]==="*"){
   const close=css.indexOf("*/",i+2);
   if(close<0)throw new Error("Unterminated CSS comment in homepage bundle");
   // Keep legal notices beginning with /*! unchanged.
   if(css[i+2]==="!"){i=close+1;continue;}
   result+=css.slice(start,i);
   i=close+1;
   start=i+1;
  }
 }
 if(quote)throw new Error("Unterminated CSS string in homepage bundle");
 // Preserve all token separators: the newline stays intact, only
 // indentation at the beginning of each line is removed from production.
 // This does not touch quoted CSS strings, URLs, selectors or declarations.
 // Collapse repeated empty lines in generated CSS; do not alter source files.
 const commentFree=result+css.slice(start);
 // Compact safe whitespace only next to CSS delimiters, not between words.
 return commentFree.replace(/^[ \t]+/gm,"").replace(/\n{2,}/g,"\n")
  .replace(/([{};])\n/g,"$1").replace(/\n(?=[{}])/g,"");
}
// Combine home CSS in source cascade order. Keep separate CSS for service pages.
const homeStyleOrder=["styles.css","premium-v2.css","portrait-upgrade.css","journey.css",
 "home-flow.css","network-brand.css","visual-contrast.css"];
// The release removes the legacy homepage partner strip from HTML; its CSS is
// therefore unreachable in production. Keep it in the authoring preview only.
function pruneReplacedPartnerStripCss(css,filename){
 if(filename!=="home-flow.css")return css;
 const start=css.indexOf("/* Partnerzy przy samym nagłówku:");
 const end=css.indexOf("/* Pierwsze dwie usługi:",start+1);
 if(start<0||end<=start)throw new Error("Legacy homepage partner CSS block changed unexpectedly");
 return css.slice(0,start)+css.slice(end);
}
async function bundleHomepageStyles(html){
 const linkPattern=/<link rel="stylesheet" href="\/([a-z0-9-]+\.css)">/g;
 const links=[...html.matchAll(linkPattern)];
 const found=links.map(match=>match[1]);
 if(found.join("|")!==homeStyleOrder.join("|")){
  throw new Error("Unexpected homepage stylesheet order: "+found.join(", "));
 }
 const chunks=[];
 let subpageRulesRemoved=0;
 for(const filename of found){
  const css=await readFile(join(source,filename),"utf8");
  if(/^\s*@(import|charset)\b/im.test(css)){
   throw new Error("Cannot safely bundle CSS with import/charset: "+filename);
  }
  // Retain cascade and shared selectors; drop exclusively subpage rules.
  const stripped=stripCssComments(pruneReplacedPartnerStripCss(css,filename).replaceAll("/v2/assets/","/assets/"));
  const optimized=pruneSubpageRules(stripped);
  subpageRulesRemoved+=optimized.removed;
  chunks.push(optimized.css);
 }
 await writeFile(join(dest,"home-bundle.css"),chunks.join("\n"));
 console.log("HOME_SUBPAGE_CSS_PRUNED "+JSON.stringify({rules:subpageRulesRemoved}));
 let inserted=false;
 return html.replace(linkPattern,()=>{
  if(inserted)return "";
  inserted=true;
  return '<link rel="stylesheet" href="/home-bundle.css">';
 });
}

// A compact common footer on information pages. Campaigns, leaflets and the
// homepage keep their own tailored conversion or navigation layout.
function addInformationFooter(html,path){
 if(path==="index.html"||path==="404.html"||path==="start.html"||path.startsWith("kampanie/")||path.startsWith("narzedzia/")||path==="polityka-prywatnosci.html")return html;
 if(html.includes('class="information-footer-nav"'))return html;
 const groups=[
  ["Najważniejsze usługi", [["/v2/uslugi/szkody-gornicze.html","Szkody górnicze"],["/v2/uslugi/swiadczenie-wspierajace.html","Świadczenie wspierające"],["/v2/uslugi/kredyty-pln.html","Sankcja Kredytu Darmowego"],["/v2/#uslugi","Wszystkie usługi"]]],
  ["Materiały dla klientów",[["/v2/wiedza/","Poradniki"],["/v2/plan-dzialania.html#brochure-library-heading","Broszury A4"],["/v2/faq.html","Pytania i odpowiedzi"],["/v2/szukaj.html","Szukaj w serwisie"]]],
  ["Kontakt i współpraca",[["/v2/kontakt.html","Kontakt i formularz"],["/v2/o-nas.html","Poznaj przedstawicieli"],["/v2/","Strona główna"]]]
 ];
 const nav='<nav class="information-footer-nav" aria-label="Skróty w stopce">'+groups.map(([title,links])=>'<div class="information-footer-group"><strong>'+title+'</strong>'+links.map(([href,label])=>'<a href="'+href+'">'+label+'</a>').join("")+'</div>').join("")+'</nav>';
 return html.replace(/<footer\b[^>]*>/i,tag=>tag+nav);
}

async function walk(dir){
  for(const entry of await readdir(dir,{withFileTypes:true})){
    const absolute=join(dir,entry.name);
    if(entry.isDirectory()){await walk(absolute);continue;}
    const rel=relative(source,absolute).replaceAll("\\","/");
    const target=join(dest,rel);
    await mkdir(dirname(target),{recursive:true});
    if(entry.name.endsWith(".html")){
      actualSourcePages.push(rel);
      let html=stripSourceHomeAgencySchema(withNetworkBrand(await readFile(absolute,"utf8")),rel);
      // 100 verifiable improvements across 47 pages: main labels, breadcrumbs,
      // missing keyboard skip links and shared focus treatment.
      html=enhancePageNavigation(html,rel).html;
      html=stripAuthoredBreadcrumbs(html,rel);
      html=improveMediaAndNavigation(html,rel.replaceAll("\\","/")).html;
      html=improveContentLinks(html,rel.replaceAll("\\","/")).html;
      html=addSectionPermalinks(html,rel.replaceAll("\\","/")).html;
      html=appendRelatedContent(html,rel.replaceAll("\\","/")).html;
      html=addInformationFooter(html,rel);
      const keyboard=enhanceKeyboardNavigation(html,rel);html=keyboard.html;
      navigationChanges.push(...keyboard.changes);
      const route=rel==="index.html"?"/":rel.endsWith("/index.html")?"/"+rel.slice(0,-"index.html".length):"/"+rel;
      const publicRoute=toPublicRoute(route); // Cloudflare Pages maps *.html to extensionless URLs.
      const canonical=origin+publicRoute;
      const indexable=shouldIndexRoute(route);
      const robots=indexable?"index,follow":"noindex,follow";
      html=html.replaceAll("/v2/","/");
      html=reconcilePublishedArticle(html,route,canonical);
      if(rel!=="index.html"&&[...html.matchAll(/\bclass=["\x27]([^"\x27]*)["\x27]/g)].some(m=>m[1].split(/\s+/).includes("premium-v2")))homepageClassOutsideHome=true;
      if(rel==="index.html")html=await bundleHomepageStyles(html);
      else {
       const layerResult=await bundleSubpageCss(html,
        async filename=>stripCssComments((await readFile(join(source,filename),"utf8")).replaceAll("/v2/assets/","/assets/")),
        (filename,content)=>writeFile(join(dest,filename),content));
       html=layerResult.html;
       if(layerResult.bundled){
        cssLayerReport.pages++;
        cssLayerReport.requestsSaved+=layerResult.requestsSaved;
        cssLayerReport.unique.add(layerResult.filename);
       }
      }
      // Avoid extra redirects: static links use the same extensionless public paths as sitemap.
      html=html.replace(/href="(\/[^"?#]+)\.html(?=[?#"])/g,(_m,path)=>'href="'+path);
      html=localizePortraits(html);
      // Atrybucja jest już podłączona w większości stron źródłowych. Nie montuj dwa razy tych samych listenerów.
      if(!html.includes('src="/attribution.js"')){
        html=html.replace("</body>",'<script src="/attribution.js" defer></script></body>');
      }
      const robotsTag=/<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i;
      if(!robotsTag.test(html)) throw new Error("Source robots tag missing: "+rel);
      html=html.replace(robotsTag,'<meta name="robots" content="'+robots+'">');
      const canonicalTag=/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i;
      if(canonicalTag.test(html)) html=html.replace(canonicalTag,'<link rel="canonical" href="'+canonical+'">');
      else html=html.replace("</head>",'<link rel="canonical" href="'+canonical+'"></head>');
      const ogUrl=/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i;
      if(ogUrl.test(html)) html=html.replace(ogUrl,'<meta property="og:url" content="'+canonical+'">');
      else html=html.replace("</head>",'<meta property="og:url" content="'+canonical+'"></head>');
      html=upsertSocialMetadata(html,route,origin);
      if(!html.includes('<meta name="robots" content="'+robots+'">')) throw new Error("Incorrect release robots tag: "+rel);
      html=html.replace("</head>",'<script type="application/ld+json">'+structured(route,canonical,html.match(/<title>([^<]+)<\/title>/i)?.[1]||"Informacje o usłudze",html)+'</script></head>');
      await writeFile(target,html);
      if(indexable){
       pages.push(publicRoute);
       const updatedAt=sourceLastmod(rel);
       if(updatedAt)pageLastmod.set(publicRoute,updatedAt);
      }
    } else if (rel.endsWith(".css")) {
      let css=await readFile(absolute,"utf8");
      css=stripCssComments(css.replaceAll("/v2/assets/","/assets/"));
      await writeFile(target,css);
    } else if (rel.endsWith(".js")) {
      let js=await readFile(absolute,"utf8");
      js=js.replaceAll('"/v2/"','"/"').replaceAll('"/v2/','"/');
      await writeFile(target,js);
    } else {
      await cp(absolute,target);
    }
  }
}
await walk(source);
// Standalone premium CSS is used on subpages; the homepage already has the full bundle.
// If a future secondary page adopts the homepage class, retain the full sheet.
if(!homepageClassOutsideHome){
 const path=join(dest,"premium-v2.css");
 const original=await readFile(path,"utf8");
 const trimmed=pruneHomepageRules(original);
 await writeFile(path,trimmed.css);
 console.log("SUBPAGE_HOMESTYLES_PRUNED "+JSON.stringify({removedRules:trimmed.removed,beforeBytes:Buffer.byteLength(original),afterBytes:Buffer.byteLength(trimmed.css),savedBytes:Buffer.byteLength(original)-Buffer.byteLength(trimmed.css)}));
}else console.log("SUBPAGE_HOMESTYLES_PRUNED skipped: homepage class used on another page");
await fetchPortraits();
// Google Search Central explicitly allows multiple sitemap directives.
// Advertise both identical canonical URL lists: XML is primary, TXT is fallback.
// Restore visitors following the old Google Business Profile URL. The address
// was accidentally saved with U+2060 WORD JOINER after its final slash.
// Google Search Console recorded the malformed path; redirect it permanently
// to the existing canonical homepage. Do not change normal unknown-page 404s.
await writeFile(join(dest,"_redirects"),[
  "# Google Business Profile: remove an accidentally appended invisible U+2060.",
  "/%E2%81%A0 / 301",
  "/%E2%81%A0/ / 301",
  "# Brochure URLs copied from source paths or older shared links.",
  "/broszury /plan-dzialania 301",
  "/broszury/ /plan-dzialania 301",
  "/broszury-graficzne /plan-dzialania 301",
  ...legacyPageRedirects(actualSourcePages)
].join("\n")+"\n");
await writeFile(join(dest,"robots.txt"),"User-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nSitemap: "+origin+"/sitemap.xml\nSitemap: "+origin+"/sitemap.txt\n");
const xml=s=>s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll('"',"&quot;");
await writeFile(join(dest,"sitemap.xml"),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+pages.sort().map(p=>'  <url><loc>'+xml(origin+p)+'</loc>'+(pageLastmod.has(p)?'<lastmod>'+pageLastmod.get(p)+'</lastmod>':'')+'</url>').join("\n")+'\n</urlset>\n');
// Google Search Central also supports a plain-text sitemap (one canonical URL per line).
// Keep the XML file as the primary sitemap announced in robots.txt, and generate
// this second advertised format from exactly the same sorted, indexable routes.
await writeFile(join(dest,"sitemap.txt"),pages.map(path=>origin+path).join("\n")+"\n");
// Publish a separate RSS feed for the approved articles, never drafts.
await writeFile(join(dest,"feed.xml"),await buildVerifiedArticlesFeed({source,origin}));
// Production fingerprint: no secrets, personal data, or credentials.
// A deployed /release-info.json helps distinguish GitHub changes from
// actual Cloudflare publication. If SHA is unavailable, report null.
const sourceCommit=(process.env.CF_PAGES_COMMIT_SHA||process.env.GITHUB_SHA||"").trim().toLowerCase();
const releaseInfo={
 schemaVersion:1,
 site:origin,
 sourceDirectory:"v2",
 buildScript:"scripts/build.mjs",
 commit:/^[a-f0-9]{40}$/.test(sourceCommit)?sourceCommit:null,
 builtAt:new Date().toISOString()
};
await writeFile(join(dest,"release-info.json"),JSON.stringify(releaseInfo,null,2)+"\n");
await writeFile(join(dest,"_headers"),"/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: SAMEORIGIN\n  Content-Security-Policy: frame-ancestors 'self'; object-src 'none'; base-uri 'self'\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n\n/release-info.json\n  Cache-Control: no-cache, no-store, must-revalidate\n\n/feed.xml\n  Content-Type: application/rss+xml; charset=utf-8\n  Cache-Control: public, max-age=1800\n\n/kontakty/wojciech-obieglo.vcf\n  Content-Type: text/vcard; charset=utf-8\n  Cache-Control: public, max-age=3600\n\n/kontakty/paulina-chandrala.vcf\n  Content-Type: text/vcard; charset=utf-8\n  Cache-Control: public, max-age=3600\n\n/assets/og-twoja-sprawa-metallic-v1.jpg\n  Cache-Control: public, max-age=604800\n\n/assets/wojciech-obieglo.jpg\n  Cache-Control: public, max-age=86400\n\n/assets/paulina-chandrala.jpg\n  Cache-Control: public, max-age=86400\n\n/assets/og-broszura-szkody-gornicze.jpg\n  Cache-Control: public, max-age=86400\n\n/assets/og-broszura-swiadczenie-wspierajace.jpg\n  Cache-Control: public, max-age=86400\n\n/assets/og-broszura-renty-powypadkowe.jpg\n  Cache-Control: public, max-age=86400\n\n/assets/og-broszura-skd.jpg\n  Cache-Control: public, max-age=86400\n\n/assets/og-broszura-kredyty-frankowe.jpg\n  Cache-Control: public, max-age=86400\n\n/assets/og-broszura-sluzebnosc-przesylu.jpg\n  Cache-Control: public, max-age=86400\n\n/layers-*.css\n  Cache-Control: public, max-age=31536000, immutable\n");
const newRedirects=legacyPageRedirects(actualSourcePages);
const navigationKinds=Object.create(null);
for(const change of navigationChanges)navigationKinds[change.kind]=(navigationKinds[change.kind]||0)+1;
console.log("SITEWIDE_NAVIGATION_REPORT "+JSON.stringify({pages:actualSourcePages.length,legacyRedirects:newRedirects.length,keyboardChanges:navigationChanges.length,kinds:navigationKinds}));
console.log("CSS_LAYER_BUILD "+JSON.stringify({pages:cssLayerReport.pages,requestsSavedPerFullSiteVisit:cssLayerReport.requestsSaved,uniqueBundles:cssLayerReport.unique.size}));
console.log("Built "+pages.length+" pages in dist/ for "+origin+". This command does not publish.");
