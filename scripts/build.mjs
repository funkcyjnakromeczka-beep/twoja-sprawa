#!/usr/bin/env node
/**
 * Static site release builder. Run: SITE_URL=https://example.com RELEASE=1 node scripts/build.mjs
 * Does not deploy. Builds dist/ locally. Requires Node 20+.
 */
import { readdir, readFile, writeFile, mkdir, cp, rm } from "node:fs/promises";
import { join, relative, dirname } from "node:path";
import {withNetworkBrand} from "./network-brand.mjs";
import {toPublicRoute} from "./public-routes.mjs";
import { shouldIndexRoute } from "./seo-policy.mjs";
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
const structured = (route,canonical,title,markup) => {
  // FAQPage reflects only answers visibly published on /faq; no invented recommendations.
  const decodeEntities=value=>value.replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">");

  // This graph describes SuccessTree's own agency site, never VOTUM as the publisher.
  const owner={"@type":"Person","@id":origin+"/#wojciech-obieglo",name:"Wojciech Obiegło",url:origin+"/o-nas#wojciech",image:origin+"/assets/wojciech-obieglo.jpg"};
  const colleague={"@type":"Person","@id":origin+"/#paulina-chandrala",name:"Paulina Chandrała",url:origin+"/o-nas#paulina",image:origin+"/assets/paulina-chandrala.jpg"};
  const organization={
    "@type":"Organization","@id":origin+"/#successtree",name:"SuccessTree OBIEGŁO WOJCIECH",
    url:origin+"/",email:"twojasprawa_votum@outlook.com",telephone:"+48 796 441 345",
    founder:{"@id":owner["@id"]},
    contactPoint:[
      {"@type":"ContactPoint",contactType:"Szkody górnicze i pozostałe zapytania",telephone:"+48 796 441 345",areaServed:"PL",availableLanguage:"pl"},
      {"@type":"ContactPoint",contactType:"Świadczenie wspierające i renty",telephone:"+48 500 171 531",areaServed:"PL",availableLanguage:"pl"}
    ]
  };
  const site={"@type":"WebSite","@id":origin+"/#website",name:"Twoja Sprawa",url:origin+"/",publisher:{"@id":organization["@id"]},inLanguage:"pl-PL"};
  const page={"@type":"WebPage","@id":canonical+"#webpage",url:canonical,name:title,isPartOf:{"@id":site["@id"]},inLanguage:"pl-PL"};
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

  if(route==="/faq.html"){
    const visible=[...markup.matchAll(/<article class="faq-card"[^>]*>[\s\S]*?<summary>([^<]+)<\/summary><div class="faq-answer"><p>([^<]+)<\/p>/g)];
    if(visible.length!==24)throw new Error("FAQ structured data out of sync with 24 visible questions");
    page["@type"]="FAQPage";
    page.mainEntity=visible.map(([,question,answer])=>({
      "@type":"Question",
      name:decodeEntities(question),
      acceptedAnswer:{"@type":"Answer",text:decodeEntities(answer)}
    }));
  }

  const graph=[owner,colleague,organization,site,page];
  if(route.startsWith("/uslugi/")||route.startsWith("/lokalnie/")){
    graph.push({
      "@type":"Service","@id":canonical+"#service",
      name:title.split("|")[0].trim().replace(/\\s*[—–-]\\s*Twoja Sprawa.*$/,""),
      provider:{"@id":organization["@id"]},
      areaServed:route.startsWith("/lokalnie/")?(route.includes("polkowice")?"Polkowice i okolice":"Lubin i okolice"):"Polska",
      url:canonical,
      serviceType:route.includes("swiadczenie")?"Wsparcie w sprawach świadczenia wspierającego":route.includes("szkody-gornicze")?"Wstępna analiza szkód górniczych":route.includes("kredyty-frankowe")?"Analiza umów kredytów CHF i możliwych rozliczeń z bankiem":route.includes("kredyty-pln")?"Analiza kredytu konsumenckiego pod kątem Sankcji Kredytu Darmowego":"Wstępny kontakt i analiza sprawy"
    });
  }
  const category=route.startsWith("/uslugi/")?"Usługi":route.startsWith("/poradniki/")?"Poradniki":route.startsWith("/lokalnie/")?"Szkody górnicze — lokalnie":null;
  if(category){
    const categoryUrl=route.startsWith("/poradniki/")?origin+"/wiedza/":origin+"/#uslugi";
    graph.push({"@type":"BreadcrumbList","@id":canonical+"#breadcrumb",itemListElement:[
      {"@type":"ListItem",position:1,name:"Twoja Sprawa",item:origin+"/"},
      {"@type":"ListItem",position:2,name:category,item:categoryUrl},
      {"@type":"ListItem",position:3,name:title.split("|")[0].trim(),item:canonical}
    ]});
    page.breadcrumb={"@id":canonical+"#breadcrumb"};
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
  const image=origin+"/assets/"+(usePaulina?"paulina-chandrala.jpg":"wojciech-obieglo.jpg");
  setContent("property","og:title",title);
  if(description)setContent("property","og:description",description);
  setContent("property","og:image",image);
  setContent("property","og:image:secure_url",image);
  setContent("property","og:image:type","image/jpeg");
  setContent("property","og:image:alt",person+" — osoba do pierwszego kontaktu, Twoja Sprawa");
  setContent("name","twitter:card","summary");
  setContent("name","twitter:title",title);
  if(description)setContent("name","twitter:description",description);
  setContent("name","twitter:image",image);
  setContent("name","twitter:image:alt",person+" — Twoja Sprawa");
  return markup;
}

async function walk(dir){
  for(const entry of await readdir(dir,{withFileTypes:true})){
    const absolute=join(dir,entry.name);
    if(entry.isDirectory()){await walk(absolute);continue;}
    const rel=relative(source,absolute).replaceAll("\\","/");
    const target=join(dest,rel);
    await mkdir(dirname(target),{recursive:true});
    if(entry.name.endsWith(".html")){
      let html=withNetworkBrand(await readFile(absolute,"utf8"));
      const route=rel==="index.html"?"/":rel.endsWith("/index.html")?"/"+rel.slice(0,-"index.html".length):"/"+rel;
      const publicRoute=toPublicRoute(route); // Cloudflare Pages maps *.html to extensionless URLs.
      const canonical=origin+publicRoute;
      const indexable=shouldIndexRoute(route);
      const robots=indexable?"index,follow":"noindex,follow";
      html=html.replaceAll("/v2/","/");
      // Avoid extra redirects: static links use the same extensionless public paths as sitemap.
      html=html.replace(/href="(\/[^"?#]+)\.html(?=[?#"])/g,(_m,path)=>'href="'+path);
      html=localizePortraits(html);
      html=html.replace("</body>",'<script src="/attribution.js" defer></script></body>');
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
      if(indexable) pages.push(publicRoute);
    } else if (rel.endsWith(".css")) {
      let css=await readFile(absolute,"utf8");
      css=css.replaceAll("/v2/assets/","/assets/");
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
await fetchPortraits();
await writeFile(join(dest,"robots.txt"),"User-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nSitemap: "+origin+"/sitemap.xml\n");
const xml=s=>s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll('"',"&quot;");
await writeFile(join(dest,"sitemap.xml"),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+pages.sort().map(p=>'  <url><loc>'+xml(origin+p)+'</loc></url>').join("\n")+'\n</urlset>\n');
await writeFile(join(dest,"_headers"),"/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: DENY\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n");
console.log("Built "+pages.length+" pages in dist/ for "+origin+". This command does not publish.");
