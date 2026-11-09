/** Rules for indexing the approved release. Preview remains noindex for every page. */
export function shouldIndexRoute(route) {
  if (typeof route !== "string" || !route.startsWith("/") || route.includes("?") || route.includes("#")) return false;
  if (route.startsWith("/narzedzia/")) return false; // internal marketing tools
  if (route.startsWith("/kampanie/")) return false; // paid/organic campaign lead funnels, duplicate content
  if (route === "/polityka-prywatnosci.html") return false;
  return true;
}
