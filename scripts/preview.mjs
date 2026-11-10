#!/usr/bin/env node
/** Builds a local-only preview. No release flags, no publishing, no indexing. */
import {readdir,readFile,writeFile,mkdir,cp,rm} from "node:fs/promises";
import {join,relative,dirname} from "node:path";
import {withNetworkBrand} from "./network-brand.mjs";
const source="v2",dest="dist-preview";
const buildId="20261110-network32";
await rm(dest,{recursive:true,force:true});
await mkdir(dest,{recursive:true});
let pages=0;
async function walk(dir){
 for(const entry of await readdir(dir,{withFileTypes:true})){
  const absolute=join(dir,entry.name);
  if(entry.isDirectory()){await walk(absolute);continue;}
  const rel=relative(source,absolute);
  const target=join(dest,rel);
  await mkdir(dirname(target),{recursive:true});
  if(rel.endsWith(".html")){
   let html=withNetworkBrand(await readFile(absolute,"utf8"));
   if(!/<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i.test(html))throw Error("Source robots tag missing: "+rel);
   html=html.replaceAll("/v2/","/");
   // Refresh every local CSS and JS asset with the same build version.
   html=html.replace(/(href="\/[^"]+?\.css)(\?[^"]*)?(")/g,`$1?v=${buildId}$3`);
   html=html.replace(/(src="\/[^"]+?\.js)(\?[^"]*)?(")/g,`$1?v=${buildId}$3`);
      html=html.replace("</body>",'<script src="/attribution.js" defer></script></body>');
   // A non-sensitive version marker makes deployment verification possible.
   html=html.replace("</head>",`<link rel="icon" type="image/svg+xml" href="/assets/site-mark.svg"><meta name="site-build" content="${buildId}"></head>`);
   // Explicit preview-only robots directive in every generated HTML document.
   html=html.replace(/<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i,'<meta name="robots" content="noindex,nofollow">');
   if(!/<meta\s+name="robots"\s+content="noindex,nofollow">/i.test(html)) throw Error("Preview noindex missing: "+rel);
   await writeFile(target,html);
   pages++;
  }else{
   if(rel.endsWith(".css")){
    let css=await readFile(absolute,"utf8");
    css=css.replaceAll("/v2/assets/","/assets/");
    await writeFile(target,css);
   }else if(rel.endsWith(".js")){
    let js=await readFile(absolute,"utf8");
    js=js.replaceAll('"/v2/"','"/"').replaceAll('"/v2/','"/');
    await writeFile(target,js);
   }else await cp(absolute,target);
  }
 }
}
await walk(source);
await writeFile(join(dest,"robots.txt"),"User-agent: *\nDisallow: /\n");
await writeFile(join(dest,"_headers"),"/*\n  X-Robots-Tag: noindex, nofollow\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: geolocation=(), camera=(), microphone=()\n");
console.log("Prepared "+pages+" HTML pages in dist-preview/. Not deployed.");
