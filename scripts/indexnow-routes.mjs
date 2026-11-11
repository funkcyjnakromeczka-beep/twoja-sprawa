/** Pure source-route collector for IndexNow. Ignores non-indexable pages. */
import {readdir} from "node:fs/promises";
import {join,relative} from "node:path";
import {toPublicRoute} from "./public-routes.mjs";
import {shouldIndexRoute} from "./seo-policy.mjs";
export async function collectIndexableRoutes(source="v2"){
 const found=[];
 async function walk(dir){
  for(const entry of await readdir(dir,{withFileTypes:true})){
   const absolute=join(dir,entry.name);
   if(entry.isDirectory()){await walk(absolute);continue;}
   if(!entry.isFile()||!entry.name.endsWith(".html"))continue;
   const rel=relative(source,absolute).replaceAll("\\","/");
   const route=rel==="index.html"?"/":rel.endsWith("/index.html")?"/"+rel.slice(0,-"index.html".length):"/"+rel;
   if(shouldIndexRoute(route))found.push(toPublicRoute(route));
  }
 }
 await walk(source);
 const unique=[...new Set(found)].sort();
 if(unique.length!==found.length)throw Error("Source pages contain duplicate public URLs");
 return unique;
}
