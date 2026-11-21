/**
 * Cloudflare Pages Function — one public /plan-dzialania page with six
 * server-rendered Open Graph/Twitter previews for individual client brochures.
 * The browser still renders and prints the existing brochure with brochure-view.js.
 * This function never processes client documents, form values or personal data.
 */
const ORIGIN="https://twoja-sprawa.pages.dev";
// Each brochure has its own first-party JPEG with exact service headline.
export const BROCHURE_PREVIEWS=Object.freeze({
 "szkody-gornicze":{
  title:"Szkody górnicze — broszura dokumentów | Twoja Sprawa",
  description:"Bezpłatna broszura A4: dokumentacja nieruchomości, pisma z kopalni, zdjęcia uszkodzeń i kontakt do Wojciecha Obiegło. Do wydruku.",
  imageAlt:"Twoja Sprawa — broszura o szkodach górniczych, współpraca agencyjna z VOTUM."
 },
 "swiadczenie-wspierajace":{
  title:"Świadczenie wspierające — broszura | Twoja Sprawa",
  description:"Graficzna lista do wydruku: dokumenty WZON, decyzja o potrzebie wsparcia, sprawa ZUS i codzienne funkcjonowanie. Kontakt do Pauliny Chandrała.",
  imageAlt:"Twoja Sprawa — broszura o świadczeniu wspierającym, współpraca agencyjna z VOTUM."
 },
 "renty-powypadkowe":{
  title:"Renty powypadkowe — dokumenty | Twoja Sprawa",
  description:"Bezpłatna broszura A4: wypadek, decyzje ubezpieczyciela, leczenie, wydatki, dochody i wypłaty renty. Kontakt do Pauliny Chandrała.",
  imageAlt:"Twoja Sprawa — broszura o rentach powypadkowych, współpraca agencyjna z VOTUM."
 },
 "skd":{
  title:"Sankcja kredytu darmowego — broszura | Twoja Sprawa",
  description:"Co przygotować do analizy kredytu konsumenckiego? Umowa, aneksy, harmonogram, historia spłat i pisma banku. Bezpłatna broszura A4.",
  imageAlt:"Twoja Sprawa — broszura o sankcji kredytu darmowego, współpraca agencyjna z VOTUM."
 },
 "kredyty-frankowe":{
  title:"Kredyty frankowe — broszura dokumentów | Twoja Sprawa",
  description:"Graficzny poradnik A4: umowa CHF, aneksy, historia spłat, zaświadczenia banku i korespondencja. Do wydruku lub przesłania klientowi.",
  imageAlt:"Twoja Sprawa — broszura o kredytach frankowych, współpraca agencyjna z VOTUM."
 },
 "sluzebnosc-przesylu":{
  title:"Służebność przesyłu — broszura | Twoja Sprawa",
  description:"Jak przygotować dokumenty działki, zdjęcia urządzeń, mapy i korespondencję z operatorem? Bezpłatna dwustronicowa broszura A4.",
  imageAlt:"Twoja Sprawa — broszura o służebności przesyłu, współpraca agencyjna z VOTUM."
 }
});
const escapeAttr=s=>s.replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;");
const tagPattern=(attr,key)=>new RegExp('<meta\\b(?=[^>]*\\b'+attr+'="'+key+'")[^>]*>','i');
function setMeta(html,attr,key,value){
 const tag='<meta '+attr+'="'+key+'" content="'+escapeAttr(value)+'">';
 const re=tagPattern(attr,key);
 return re.test(html)?html.replace(re,tag):html.replace("</head>",tag+"</head>");
}
export function brochureKeyFromUrl(input){
 const url=new URL(input);
 const keys=url.searchParams.getAll("broszura");
 if(keys.length!==1)return null;
 const key=keys[0];
 return Object.prototype.hasOwnProperty.call(BROCHURE_PREVIEWS,key)?key:null;
}
export function rewriteBrochurePreview(html,key){
 const info=BROCHURE_PREVIEWS[key];
 if(!info)return html;
 // Keep the existing single page and its noindex/canonical policy. Each
 // brochure is a share variant, not an additional SEO landing page.
 const canonical=ORIGIN+"/plan-dzialania";
 const shareUrl=canonical+"?broszura="+encodeURIComponent(key);
 const image=ORIGIN+"/assets/og-broszura-"+key+".jpg";
 let next=html.replace(/<title>[\s\S]*?<\/title>/i,"<title>"+escapeAttr(info.title)+"</title>");
 next=setMeta(next,"name","robots","noindex,follow");
 next=setMeta(next,"name","description",info.description);
 next=setMeta(next,"property","og:title",info.title);
 next=setMeta(next,"property","og:description",info.description);
 next=setMeta(next,"property","og:url",shareUrl);
 next=setMeta(next,"property","og:type","website");
 next=setMeta(next,"property","og:image",image);
 next=setMeta(next,"property","og:image:secure_url",image);
 next=setMeta(next,"property","og:image:type","image/jpeg");
 next=setMeta(next,"property","og:image:width","1200");
 next=setMeta(next,"property","og:image:height","630");
 next=setMeta(next,"property","og:image:alt",info.imageAlt);
 next=setMeta(next,"name","twitter:card","summary_large_image");
 next=setMeta(next,"name","twitter:title",info.title);
 next=setMeta(next,"name","twitter:description",info.description);
 next=setMeta(next,"name","twitter:image",image);
 next=setMeta(next,"name","twitter:image:alt",info.imageAlt);
 // The canonical is intentionally the unparameterized, noindex tool page.
 const canonicalTag='<link rel="canonical" href="'+canonical+'">';
 next=/<link\b(?=[^>]*\brel="canonical")[^>]*>/i.test(next)?
  next.replace(/<link\b(?=[^>]*\brel="canonical")[^>]*>/i,canonicalTag):
  next.replace("</head>",canonicalTag+"</head>");
 return next;
}
export async function onRequestGet({request,next}){
 const key=brochureKeyFromUrl(request.url);
 if(!key)return next();
 const response=await next();
 if(!response.ok||!(response.headers.get("content-type")||"").toLowerCase().includes("text/html"))return response;
 // A route error must not be replaced by the brochure shell.
 const html=await response.clone().text();
 if(!html.includes('data-brochure-root'))return response;
 const headers=new Headers(response.headers);
 headers.delete("content-length");
 headers.delete("content-encoding");
 headers.delete("etag");
 headers.set("content-type","text/html; charset=utf-8");
 headers.set("cache-control","public, max-age=300");
 headers.set("x-content-type-options","nosniff");
 return new Response(rewriteBrochurePreview(html,key),{
  status:response.status,statusText:response.statusText,headers
 });
}
