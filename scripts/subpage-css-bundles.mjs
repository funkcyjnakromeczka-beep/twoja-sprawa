import {createHash} from "node:crypto";

/**
 * Build-only CSS request consolidation. Keep shared base/premium files cached
 * across pages; combine only remaining local layers, preserving original order.
 * No HTML source files, form scripts or visual rules are changed.
 *
 * Returns a traceable report for tests and build logs. Skips uncertain
 * markup (inline styles, media-specific or external stylesheet links).
 */
const stylePattern=/<link rel="stylesheet" href="\/([a-z0-9-]+\.css)">/g;
export async function bundleSubpageCss(html,readCss,writeCss){
 const headEnd=html.indexOf("</head>");
 if(headEnd<0)return {html,bundled:false,reason:"no-head"};
 const head=html.slice(0,headEnd);
 const all=[...head.matchAll(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi)];
 const styles=[...head.matchAll(stylePattern)];
 if(styles.length<4)return {html,bundled:false,reason:"few-styles"};
 if(all.length!==styles.length||/<style\b/i.test(head))
  return {html,bundled:false,reason:"nonstandard-styles"};
 let keep=styles[0][1]==="styles.css"?1:0;
 if(keep===1&&styles[1]?.[1]==="premium-v2.css")keep++;
 const layers=styles.slice(keep).map(m=>m[1]);
 if(layers.length<2)return {html,bundled:false,reason:"few-layers"};
 const chunks=[];
 for(const filename of layers){
  const css=await readCss(filename);
  if(/^\s*@(import|charset)\b/im.test(css))
   return {html,bundled:false,reason:"import-or-charset"};
  chunks.push(css);
 }
 const content=chunks.join("\n");
 const fingerprint=createHash("sha256").update(content,"utf8").digest("hex").slice(0,16);
 const filename="layers-"+fingerprint+".css";
 await writeCss(filename,content);
 let n=0;
 const updatedHead=head.replace(stylePattern,original=>{
  const i=n++;
  if(i<keep)return original;
  return i===keep?'<link rel="stylesheet" href="/'+filename+'">':"";
 });
 if(n!==styles.length)throw Error("Stylesheet mutation count mismatch");
 return {html:updatedHead+html.slice(headEnd),bundled:true,filename,
  sourceLayers:layers,requestsSaved:layers.length-1};
}
