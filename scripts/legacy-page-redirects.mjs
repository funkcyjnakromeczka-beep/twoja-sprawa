/** Legacy authoring URLs from the site's real source pages, not speculative URLs. */
export function legacyPageRedirects(paths){
 const redirects=new Map();
 for(const path of paths){
  if(!/^(?:[a-z0-9-]+\/)*[a-z0-9-]+\.html$/.test(path))throw Error("Invalid legacy page path: "+path);
  if(path==="404.html")continue; // keep real not-found handling
  const index=path==="index.html"||path.endsWith("/index.html");
  const canonical=index?"/"+path.slice(0,-"index.html".length):"/"+path.slice(0,-5);
  const legacy="/v2/"+path;
  const aliases=index?[legacy,legacy.slice(0,-"index.html".length),legacy.slice(0,-"index.html".length-1)].filter(Boolean):[legacy,legacy.slice(0,-5),legacy.slice(0,-5)+"/"];
  for(const route of aliases){
   if(route===canonical||!route.startsWith("/v2"))continue;
   if(redirects.has(route)&&redirects.get(route)!==canonical)throw Error("Conflicting legacy redirect: "+route);
   redirects.set(route,canonical);
  }
 }
 return [...redirects.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([from,to])=>from+" "+to+" 301");
}
