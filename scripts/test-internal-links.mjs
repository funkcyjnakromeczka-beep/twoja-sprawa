#!/usr/bin/env node
/**
 * Validate local navigational and asset links in the production bundle.
 * Resolves Cloudflare Pages extensionless HTML routes against dist/.
 * Does not make network calls and never submits forms.
 */
import assert from "node:assert/strict";
import {readdir,readFile,stat} from "node:fs/promises";
import path from "node:path";
const root=path.resolve("dist"), origin="https://twoja-sprawa.pages.dev";
const pages=[];
async function walk(dir){
 for(const entry of await readdir(dir,{withFileTypes:true})){
  const abs=path.join(dir,entry.name);
  if(entry.isDirectory())await walk(abs);
  else if(entry.name.endsWith(".html"))pages.push(abs);
 }
}
await walk(root);
const toUrl=relative=>{
 const rel=path.relative(root,relative).split(path.sep).join("/");
 return rel==="index.html"?"/":"/"+rel.replace(/index\.html$/,"").replace(/\.html$/,"");
};
const htmls=new Map();
for(const file of pages)htmls.set(toUrl(file),await readFile(file,"utf8"));
const errors=[];
const missing=new Set();
const idCache=new Map();
const exists=async relative=>{
 const abs=path.resolve(root,"."+relative);
 if(!abs.startsWith(root+path.sep))return false;
 if(missing.has(abs))return false;
 try{return (await stat(abs)).isFile()}catch{missing.add(abs);return false}
};
const decode=s=>s.replaceAll("&amp;","&").replaceAll("&#38;","&");
let checked=0,fragmentChecks=0;
for(const [route,html] of htmls){
 const tags=html.matchAll(/<(a|link|script|img|iframe|source|video|audio|track|object)\b([^>]*)>/gi);
 for(const match of tags){
  const name=match[1].toLowerCase(), attrs=match[2];
  const values=[];
  for(const a of attrs.matchAll(/\b(href|src|poster|data|srcset)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)){
   const attr=a[1].toLowerCase();
   if(attr==="data"&&name!=="object")continue;
   if(attr==="srcset"){
    for(const item of a[2]?.split(",")||a[3]?.split(",")||[]){
     const url=item.trim().split(/\s+/)[0];if(url)values.push([attr,url]);
    }
   }else values.push([attr,a[2]??a[3]??""]);
  }
  for(const [attr,rawValue] of values){
   const val=decode(rawValue.trim());
   if(!val||val==="#"||/^(mailto:|tel:|sms:|data:|blob:|javascript:)/i.test(val)||val.startsWith("//"))continue;
   let resolved;
   try{resolved=new URL(val,origin+route)}catch{errors.push(route+" invalid "+attr+"="+val);continue}
   if(resolved.origin!==origin)continue;
   let dest=resolved.pathname;
   try{dest=decodeURIComponent(dest)}catch{errors.push(route+" invalid URI "+val);continue}
   if(dest.includes("\0")){errors.push(route+" nul byte "+val);continue}
   const trial=dest==="/"?["/index.html"]:[
    dest,
    dest.endsWith("/")?dest+"index.html":dest+".html",
    dest.endsWith("/")?dest+"index.html":dest+"/index.html"
   ];
   let present=false;
   for(const t of trial)if(await exists(t)){present=true;break}
   if(!present){errors.push(route+" missing "+name+"["+attr+"] "+val);continue}
   checked++;
   // Anchor checking only for HTML navigation, not CSS/JS or mailto query strings.
   if(name==="a"&&attr==="href"&&resolved.hash){
    const fragment=decodeURIComponent(resolved.hash.slice(1));
    if(!fragment)continue;
    const targetRoute=dest.endsWith(".html")?dest.replace(/\.html$/,""):dest.replace(/\/$/,"")||"/";
    const targetHTML=htmls.get(targetRoute);
    if(targetHTML){
     if(!idCache.has(targetRoute)){
      const ids=new Set();
      for(const m of targetHTML.matchAll(/\bid\s*=\s*(?:"([^"]*)"|'([^']*)')/g))ids.add(m[1]??m[2]);
      idCache.set(targetRoute,ids);
     }
     fragmentChecks++;
     if(!idCache.get(targetRoute).has(fragment))
      errors.push(route+" missing anchor "+val);
    }
   }
  }
 }
}
assert.ok(pages.length>=30,"Unexpectedly few HTML files in build: "+pages.length);
if(errors.length){
 console.error("INTERNAL_LINK_ERRORS "+errors.length+"\n"+errors.slice(0,100).join("\n"));
 process.exitCode=1;
}else console.log("INTERNAL_LINK_OK: "+pages.length+" HTML files, "+checked+
 " same-origin links/assets, "+fragmentChecks+" fragment targets checked.");
