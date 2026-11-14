/** Rules for indexing the approved release. Preview remains noindex for every page. */
export function shouldIndexRoute(route) {
  if (typeof route !== "string" || !route.startsWith("/") || route.includes("?") || route.includes("#")) return false;
  if (route === "/404.html") return false; // error pages must never appear in the sitemap
  if (route === "/szukaj.html") return false;
  if (route === "/start.html") return false; // mobilne wejście z ulotki, funnel bez konkurencji SEO // internal site search and query results are not indexable landing pages
  if (route.startsWith("/narzedzia/")) return false; // internal marketing tools
  if (route.startsWith("/kampanie/")) return false; // paid/organic campaign lead funnels, duplicate content
  if (route === "/polityka-prywatnosci.html") return false;
  // Materiały kontrolne dla klienta nie są odrębnymi stronami SEO.
  // Indeksujemy bazę wiedzy i dwa sprawdzone artykuły. Pozostałe poradniki
  // wymagają kontroli merytorycznej przed świadomym otwarciem indeksacji.
  if (route.startsWith("/poradniki/")) return false;
  if (route.startsWith("/wiedza/")) {
    return new Set([
      "/wiedza/",
      "/wiedza/drobne-pekniecia-szkody-gornicze.html",
      "/wiedza/swiadczenie-wspierajace-2026-wzon-zus.html"
    ]).has(route);
  }
  return true;
}
