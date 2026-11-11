/** Shared partner branding for preview and future production builds. */
const strip="<div class=\"network-brand-bar\" role=\"region\" aria-label=\"Współpraca agencyjna SuccessTree z podmiotami VOTUM\"><div class=\"network-brand-inner\"><span class=\"network-brand-label\">SuccessTree <span aria-hidden=\"true\">•</span> Współpraca agencyjna</span><div class=\"network-brand-logos\"><a href=\"https://votum-sa.pl/votum-network-s-a/\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"Votum Network — informacje o spółce\"><span class=\"network-brand-fallback\" aria-hidden=\"true\">Votum <b>Network</b></span><img src=\"https://votum-sa.pl/wp-content/uploads/2024/09/logo-votum-network-przedstawiciel-400x284-1.jpg\" alt=\"Votum Network\" width=\"400\" height=\"284\" decoding=\"async\" fetchpriority=\"high\"></a><a href=\"https://dsa.pl/\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"Votum Scale Agency — oficjalna strona spółki\"><span class=\"network-brand-fallback\" aria-hidden=\"true\">Votum <b>Scale Agency</b></span><img src=\"https://votum-sa.pl/wp-content/uploads/2026/05/votum-scale-agency-.png\" alt=\"Votum Scale Agency\" width=\"400\" height=\"284\" decoding=\"async\" fetchpriority=\"high\"></a></div><span class=\"network-brand-note\">Serwis przedstawiciela, nie oficjalna witryna spółek VOTUM</span></div></div>";
function removeLegacyLogoStrip(html){
 const headerEnd=html.indexOf("</header>");
 if(headerEnd<0)return html;
 const mainStart=html.indexOf("<main",headerEnd+9);
 if(mainStart<0)return html;
 const start=html.indexOf('<div class="agency-logos-bar"',headerEnd);
 if(start<0||start>=mainStart)return html;
 const tags=/<\/?div\b[^>]*>/gi;
 tags.lastIndex=start;
 let depth=0,match,end=-1;
 while((match=tags.exec(html))&&match.index<mainStart){
   depth+=match[0].startsWith("</")?-1:1;
   if(depth===0){end=tags.lastIndex;break;}
 }
 if(end<0)throw Error("Unclosed legacy network strip");
 return html.slice(0,start)+html.slice(end);
}
export function withNetworkBrand(sourceHtml){
 let html=removeLegacyLogoStrip(sourceHtml);
 if(html.includes('class="network-brand-bar"'))return html;
 if(!html.includes("</head>"))throw Error("HTML head missing");
 html=html.replace("</head>",'<link rel="stylesheet" href="/v2/network-brand.css"><link rel="stylesheet" href="/v2/visual-contrast.css"><script src="/v2/network-brand.js" defer></script></head>');
 if(/<header\b/i.test(html))html=html.replace(/<header\b/i,strip+"<header");
 else{
   const skip=html.match(/<a\b[^>]*class="skip-link"[^>]*>[\s\S]*?<\/a>/i);
   if(skip)html=html.replace(skip[0],skip[0]+strip);
   else html=html.replace(/<body\b[^>]*>/i,match=>match+strip);
 }
 return html;
}
