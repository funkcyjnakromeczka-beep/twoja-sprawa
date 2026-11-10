#!/usr/bin/env node
/** Builds a local-only preview. No release flags, no publishing, no indexing. */
import {readdir,readFile,writeFile,mkdir,cp,rm} from "node:fs/promises";
import {join,relative,dirname} from "node:path";
const source="v2",dest="dist-preview";
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
   let html=await readFile(absolute,"utf8");
   if(!/<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i.test(html))throw Error("Source robots tag missing: "+rel);
   html=html.replaceAll("/v2/","/");
   // Bust cached styles on each deployment while preserving the source paths.
   html=html.replace(/(href="\/premium-v2\.css)(\?[^"]*)?(")/g,`$1?v=20261110-form18$3`);
   html=html.replace(/(src="\/contact\.js)(\?[^"]*)?(")/g,`$1?v=20261110-form18$3`);
      html=html.replace("</body>",'<script src="/attribution.js" defer></script></body>');
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
await writeFile(join(dest,"_headers"),"/*\n  X-Robots-Tag: noindex, nofollow\n  X-Content-Type-Options: nosniff\n");
console.log("Prepared "+pages+" HTML pages in dist-preview/. Not deployed.");
