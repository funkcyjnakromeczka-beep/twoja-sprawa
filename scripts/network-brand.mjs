/** Shared partner branding for preview and future production builds. */
const strip="<div class=\"network-brand-bar\" style=\"max-width:100%;overflow:hidden\" role=\"region\" aria-label=\"Współpraca agencyjna SuccessTree z podmiotami VOTUM\"><div class=\"network-brand-inner\" style=\"max-width:100%;min-width:0\"><span class=\"network-brand-label\">SuccessTree <span aria-hidden=\"true\">•</span> Współpraca agencyjna</span><div class=\"network-brand-logos\" data-mobile-brand-fallback=\"true\" style=\"display:flex;justify-content:center;max-width:100%;min-width:0\"><a style=\"display:flex;max-width:calc(50vw - 15px);min-width:0;overflow:hidden\" href=\"https://votum-sa.pl/votum-network-s-a/\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"Votum Network — informacje o spółce\"><span class=\"network-brand-fallback\" aria-hidden=\"true\">Votum <b>Network</b></span><img src=\"https://votum-sa.pl/wp-content/uploads/2024/09/logo-votum-network-przedstawiciel-400x284-1.jpg\" alt=\"Votum Network\" style=\"max-width:100%\" width=\"400\" height=\"284\" decoding=\"async\" loading=\"lazy\" fetchpriority=\"low\"></a><a style=\"display:flex;max-width:calc(50vw - 15px);min-width:0;overflow:hidden\" href=\"https://dsa.pl/\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"Votum Scale Agency — oficjalna strona spółki\"><span class=\"network-brand-fallback\" aria-hidden=\"true\">Votum <b>Scale Agency</b></span><img src=\"https://votum-sa.pl/wp-content/uploads/2026/05/votum-scale-agency-.png\" alt=\"Votum Scale Agency\" style=\"max-width:100%\" width=\"400\" height=\"284\" decoding=\"async\" loading=\"lazy\" fetchpriority=\"low\"></a></div><span class=\"network-brand-note\">Serwis przedstawiciela, nie oficjalna witryna spółek VOTUM</span></div></div>";
// Atrybuty awaryjne nagłówka działają bez JS i bez zewnętrznych arkuszy CSS.
function removeLegacyLogoStrip(sourceHtml){
 let html=sourceHtml;
 // Source homepage keeps a partner strip for direct previews.
 // Release builds insert the shared sticky bar; remove old duplicates.
 const staleStrips=["agency-logos-bar","homepage-partner-strip","partner-identity-bar"];
 for(const className of staleStrips){
   const headerEnd=html.indexOf("</header>");
   if(headerEnd<0)continue;
   const mainStart=html.indexOf("<main",headerEnd+9);
   if(mainStart<0)continue;
   const start=html.indexOf('<div class="'+className+'"',headerEnd);
   if(start<0||start>=mainStart)continue;
   const tags=/<\/?div\b[^>]*>/gi;
   tags.lastIndex=start;
   let depth=0,match,end=-1;
   while((match=tags.exec(html))&&match.index<mainStart){
     depth+=match[0].startsWith("</")?-1:1;
     if(depth===0){end=tags.lastIndex;break;}
   }
   if(end<0)throw Error("Unclosed partner strip: "+className);
   html=html.slice(0,start)+html.slice(end);
 }
 return html;
}
export function withNetworkBrand(sourceHtml){
 let html=removeLegacyLogoStrip(sourceHtml);
 if(html.includes('class="network-brand-bar"'))return html;
 if(!html.includes("</head>"))throw Error("HTML head missing");
 // Reuse the existing public partner origin; warm the connection without prioritizing both logos over the main image.
 if(!/<link\b[^>]*rel="preconnect"[^>]*href="https:\/\/votum-sa\.pl"/i.test(html))html=html.replace("</head>",'<link rel="preconnect" href="https://votum-sa.pl"> </head>');
 html=html.replace("</head>",'<link rel="stylesheet" href="/v2/network-brand.css"><link rel="stylesheet" href="/v2/visual-contrast.css"><script src="/v2/network-brand.js" defer></script>'
  +'</head>');
 if(/<header\b/i.test(html))html=html.replace(/<header\b/i,strip+"<header");
 else{
   const skip=html.match(/<a\b[^>]*class="skip-link"[^>]*>[\s\S]*?<\/a>/i);
   if(skip)html=html.replace(skip[0],skip[0]+strip);
   else html=html.replace(/<body\b[^>]*>/i,match=>match+strip);
 }
 return html;
}
