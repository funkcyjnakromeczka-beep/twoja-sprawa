/** Cloudflare Pages publikuje pliki *.html pod adresami bez rozszerzenia.
 * Zachowuje slash dla katalogowych index.html; używać tylko po zbudowaniu sourceRoute.
 */
export function toPublicRoute(sourceRoute){
 if(typeof sourceRoute!=="string"||!sourceRoute.startsWith("/")||sourceRoute.includes("?")||sourceRoute.includes("#"))throw new TypeError("Invalid route");
 return sourceRoute.endsWith(".html")?sourceRoute.slice(0,-5):sourceRoute;
}
