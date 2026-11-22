/** Canonical RSS 2.0 feed of explicitly reviewed and indexable guides only. */
import {readFile} from "node:fs/promises";
import {join} from "node:path";
import {shouldIndexRoute} from "./seo-policy.mjs";
import {toPublicRoute} from "./public-routes.mjs";

// Do not silently publish draft guides. This must mirror publishedArticleRoutes
// in build.mjs and the SEO allow list, enforced by scripts/test-rss-feed.mjs.
export const feedArticlePaths=Object.freeze([
 "wiedza/drobne-pekniecia-szkody-gornicze.html",
 "wiedza/swiadczenie-wspierajace-2026-wzon-zus.html",
 "wiedza/ugoda-z-kopalnia-co-sprawdzic.html",
 "wiedza/renta-powypadkowa-dokumenty.html",
 "wiedza/swiadczenie-wspierajace-dokumenty.html",
 "wiedza/kredyt-pln-dokumenty-skd.html"
]);
const xmlEscape=value=>String(value)
 .replaceAll("&","&amp;").replaceAll("<","&lt;")
 .replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&apos;");
const decodeHtmlEntities=value=>String(value)
 .replaceAll("&amp;","&").replaceAll("&quot;",'"')
 .replaceAll("&#39;","'").replaceAll("&lt;","<").replaceAll("&gt;",">");
const capture=(html,regex,kind,route)=>{
 const result=html.match(regex)?.[1]?.trim();
 if(!result)throw Error("RSS: missing "+kind+" on "+route);
 return decodeHtmlEntities(result);
};
export async function buildVerifiedArticlesFeed({source="v2",origin}){
 if(!/^https:\/\/[^/]+$/.test(origin||""))throw Error("RSS requires an HTTPS origin");
 const items=[];
 for(const relative of feedArticlePaths){
  const path="/"+relative;
  if(!shouldIndexRoute(path))throw Error("RSS must exclude a noindex guide: "+path);
  const html=await readFile(join(source,relative),"utf8");
  const robots=capture(html,/<meta\s+name="robots"\s+content="([^"]+)"/i,"robots",relative);
  if(!/^index,follow/.test(robots))throw Error("RSS refuses an unapproved draft: "+relative);
  const title=capture(html,/<title>([^<]+)<\/title>/i,"title",relative);
  const description=capture(html,/<meta\s+name="description"\s+content="([^"]+)"/i,"description",relative);
  const matches=[...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(([,raw])=>JSON.parse(raw)).filter(item=>item["@type"]==="Article");
  if(matches.length!==1)throw Error("RSS requires exactly one authored Article schema: "+relative);
  const article=matches[0];
  if(article.headline!==title||article.description!==description||
     article.author?.name!=="SuccessTree OBIEGŁO WOJCIECH"){
   throw Error("RSS metadata disagrees with the reviewed article: "+relative);
  }
  const modified=article.dateModified;
  if(typeof modified!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(modified)||Number.isNaN(Date.parse(modified))){
   throw Error("RSS requires a grounded ISO calendar date: "+relative);
  }
  const canonical=origin+toPublicRoute(path);
  items.push({title,description,modified,canonical,category:relative.includes("swiadczenie")?"Świadczenie wspierające":relative.includes("renta-powypadkowa")?"Renty powypadkowe":relative.includes("kredyt-pln")?"Kredyt konsumencki / SKD":"Szkody górnicze"});
 }
 if(new Set(items.map(item=>item.canonical)).size!==items.length)throw Error("RSS canonical URLs not unique");
 items.sort((a,b)=>b.modified.localeCompare(a.modified)||a.canonical.localeCompare(b.canonical));
 const body=items.map(item=>[
  "  <item>",
  "    <title>"+xmlEscape(item.title)+"</title>",
  "    <link>"+xmlEscape(item.canonical)+"</link>",
  "    <guid isPermaLink=\"true\">"+xmlEscape(item.canonical)+"</guid>",
  "    <description>"+xmlEscape(item.description)+"</description>",
  "    <category>"+xmlEscape(item.category)+"</category>",
  "    <dc:date>"+xmlEscape(item.modified)+"</dc:date>",
  "  </item>"
 ].join("\n")).join("\n");
 // dc:date keeps the date-only source truth; don't fabricate a time for pubDate.
 return '<?xml version="1.0" encoding="UTF-8"?>\n'+
  '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">\n'+
  '<channel>\n'+
  '  <title>Twoja Sprawa — sprawdzone poradniki</title>\n'+
  '  <link>'+xmlEscape(origin+'/wiedza/')+'</link>\n'+
  '  <description>Materiały edukacyjne SuccessTree o szkodach górniczych, świadczeniu wspierającym, rentach powypadkowych i SKD. Bez gwarancji wyników spraw.</description>\n'+
  '  <language>pl-PL</language>\n'+
  '  <atom:link href="'+xmlEscape(origin+'/feed.xml')+'" rel="self" type="application/rss+xml"/>\n'+
  body+'\n</channel>\n</rss>\n';
}
