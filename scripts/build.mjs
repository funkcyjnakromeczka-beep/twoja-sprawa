#!/usr/bin/env node
/**
 * Static site release builder. Run: SITE_URL=https://example.com RELEASE=1 node scripts/build.mjs
 * Does not deploy. Builds dist/ locally. Requires Node 20+.
 */
import { readdir, readFile, writeFile, mkdir, cp, rm } from "node:fs/promises";
import { join, relative, dirname } from "node:path";
const source="v2", dest="dist";
const url=process.env.SITE_URL;
const release=process.env.RELEASE==="1";
if(!url || !/^https:\/\/[^/]+\.[^/]+\/?$/.test(url)) throw new Error("SITE_URL must be HTTPS origin without a path.");
const origin=url.replace(/\/$/,"");
if(!release) throw new Error("Release is gated: set RELEASE=1 only after content, privacy and form approval.");
await rm(dest,{recursive:true,force:true});
await mkdir(dest,{recursive:true});
const pages=[];
async function walk(dir){
  for(const entry of await readdir(dir,{withFileTypes:true})){
    const absolute=join(dir,entry.name);
    if(entry.isDirectory()){await walk(absolute);continue;}
    const rel=relative(source,absolute).replaceAll("\\","/");
    const target=join(dest,rel);
    await mkdir(dirname(target),{recursive:true});
    if(entry.name.endsWith(".html")){
      let html=await readFile(absolute,"utf8");
      const route=rel==="index.html"?"/":"/"+rel;
      const canonical=origin+route;
      html=html.replaceAll("/v2/","/");
      html=html.replace(/<meta name="robots" content="noindex,follow">/g,'<meta name="robots" content="index,follow">');
      if(!html.includes('rel="canonical"')) html=html.replace("</head>",'<link rel="canonical" href="'+canonical+'"></head>');
      if(!html.includes('property="og:url"')) html=html.replace("</head>",'<meta property="og:url" content="'+canonical+'"></head>');
      await writeFile(target,html);
      pages.push(route);
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
