#!/usr/bin/env node
/**
 * Static site release builder. Run: SITE_URL=https://example.com RELEASE=1 node scripts/build.mjs
 * Does not deploy. Builds dist/ locally. Requires Node 20+.
 */
import { readdir, readFile, writeFile, mkdir, cp, rm } from "node:fs/promises";
import { join, relative, dirname } from "node:path";
import {withNetworkBrand} from "./network-brand.mjs";
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
const pages=[];
const structured = (route,canonical,title) => {
  const person={"@type":"Person","@id":origin+"/#wojciech-obieglo",name:"Wojciech Obiegło",url:origin+"/o-nas.html"};
  const organization={"@type":"Organization","@id":origin+"/#successtree",name:"SuccessTree OBIEGŁO WOJCIECH",url:origin+"/",email:"twojasprawa_votum@outlook.com",telephone:"+48 796 441 345",founder:{"@id":person["@id"]}};
  const site={"@type":"WebSite","@id":origin+"/#website",name:"Twoja Sprawa",url:origin+"/",publisher:{"@id":organization["@id"]},inLanguage:"pl-PL"};
  const page={"@type":"WebPage","@id":canonical+"#webpage",url:canonical,isPartOf:{"@id":site["@id"]},inLanguage:"pl-PL"};
  const graph=[person,organization,site,page];
  if(route.startsWith("/uslugi/")||route.startsWith("/lokalnie/")){
    graph.push({"@type":"Service","@id":canonical+"#service",name:title.split("|")[0].trim().replace(/\s*[—–-]\s*Twoja Sprawa.*$/,""),provider:{"@id":organization["@id"]},areaServed:route.startsWith("/lokalnie/")?(route.includes("polkowice")?"Polkowice i okolice":"Lubin i okolice"):"Polska",url:canonical});
  }
  return JSON.stringify({"@context":"https://schema.org","@graph":graph}).replaceAll("<","\\u003c");
};
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
      const canonical=origin+route;
      const indexable=shouldIndexRoute(route);
      const robots=indexable?"index,follow":"noindex,follow";
      html=html.replaceAll("/v2/","/");
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
      if(!html.includes('<meta name="robots" content="'+robots+'">')) throw new Error("Incorrect release robots tag: "+rel);
      html=html.replace("</head>",'<script type="application/ld+json">'+structured(route,canonical,html.match(/<title>([^<]+)<\/title>/i)?.[1]||"Informacje o usłudze")+'</script></head>');
      await writeFile(target,html);
      if(indexable) pages.push(route);
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
await writeFile(join(dest,"robots.txt"),"User-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nSitemap: "+origin+"/sitemap.xml\n");
const xml=s=>s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll('"',"&quot;");
await writeFile(join(dest,"sitemap.xml"),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+pages.sort().map(p=>'  <url><loc>'+xml(origin+p)+'</loc></url>').join("\n")+'\n</urlset>\n');
await writeFile(join(dest,"_headers"),"/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: DENY\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n");
console.log("Built "+pages.length+" pages in dist/ for "+origin+". This command does not publish.");
