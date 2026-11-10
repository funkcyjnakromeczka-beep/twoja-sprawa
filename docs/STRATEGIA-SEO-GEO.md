# Strategia SEO / GEO — Twoja Sprawa

## Pozycjonowanie
- Marka: Twoja Sprawa, projekt prowadzony przez SuccessTree OBIEGŁO WOJCIECH we współpracy z VOTUM. Nie przedstawiać SuccessTree jako kancelarii ani oficjalnej witryny VOTUM.
- Zasięg: ogólnopolski dla usług poza szkodami górniczymi; Lubin, Polkowice i okolice dla szkód górniczych. Nie dopisywać lokalizacji do wszystkich tytułów.
- Konwersja: telefon 796 441 345, e-mail twojasprawa_votum@outlook.com, ścieżki kontaktu z konkretnych podstron, formularz działa i właściciel potwierdził odbiór pojedynczej wiadomości testowej 9.11.2026; nadal wymagany przegląd zgodności RODO, monitorowanie doręczalności i kontrola antyspamu.
- Treści: rzeczowe, unikalne, odpowiadające na realne pytania, bez obietnic uzyskania świadczenia lub wygranej.

## Architektura docelowa
/ — ogólnopolska strona główna
/uslugi/szkody-gornicze — lokalna Lubin/Polkowice
/uslugi/swiadczenie-wspierajace
/uslugi/renty-powypadkowe
/uslugi/kredyty-pln
/uslugi/sluzebnosc-przesylu
+ 7 podstron usług dodatkowych z obecnego Lovable.
/wiedza/ — poradniki i aktualizacje z datą publikacji i weryfikacji
/o-nas — transparentny opis roli przedstawiciela
/kontakt — kontakt i informacje o przetwarzaniu danych
/polityka-prywatnosci

## Techniczne SEO
1. Jedno H1 na stronę, unikalne title i meta description, breadcrumb, wewnętrzne linkowanie usług i artykułów.
2. Obecny adres podglądu Cloudflare: https://twoja-sprawa.pages.dev/ (bez prefiksu /v2/). Kanoniczny URL dopiero po wybraniu ostatecznej domeny; jeden produkcyjny host i przekierowania 301.
3. **Nie odblokowywać indeksacji podglądu.** Obecny build celowo ustawia noindex,nofollow, nagłówek X-Robots-Tag oraz robots.txt blokujący indeksowanie. Dopiero po zatwierdzeniu publikacji: sitemap XML z prawdziwymi adresami, robots.txt dopuszczający wyszukiwarki i OAI-SearchBot oraz dostęp do CSS/JS.
4. SSR lub statycznie wyrenderowane HTML dla każdej usługi; nie polegać wyłącznie na renderowaniu JavaScript.
5. Dane strukturalne Organization/Person/WebSite/Service/BreadcrumbList/FAQPage tylko jeśli odpowiadają widocznej i prawdziwej treści; brak wymyślonych ocen, liczb spraw, lokalizacji biur.
6. Weryfikacja Google Search Console, Bing Webmaster Tools, indeksowania i Core Web Vitals; nie dodawać fałszywych znaczników.
7. Dostępność: kontrast, klawiatura, etykiety formularza, alt obrazów, mobilne CTA, brak autoplay audio.

## ChatGPT i inne systemy AI
- Publiczna, dostępna do indeksacji strona z jednoznaczną nazwą, profilem działalności, zakresem geograficznym i kontaktami.
- Utrzymywać spójne dane kontaktowe na witrynie, Facebooku, profilach biznesowych i źródłach partnerskich, jeżeli dozwolone.
- Dodać przydatne, źródłowe poradniki, FAQ i opisy procedur; aktualizować po zmianach prawa.
- Zezwolenie OAI-SearchBot pomaga w odkrywaniu treści, ale nie gwarantuje cytowania ani rekomendowania w ChatGPT. Plik llms.txt może być pomocniczy, nie jest standardem gwarantującym widoczność.
- Nie stosować tekstów ukrytych, sztucznych recenzji, kupionych linków ani fałszywego powiązania z VOTUM.

## Weryfikacja przed publikacją
- Uprawnienie do oficjalnego logo VOTUM i wytyczne brandingu.
- Dane i status firmy, faktyczna oferta, warunki finansowe i zakres współpracy z kancelarią.
- Osoby i zdjęcia: zgody na publikację; prawa autorskie do materiałów i wideo.
- Formularz: backend, ochrona antyspamowa, rzeczywiste dostarczenie e-maila, polityka prywatności, odbiorcy i retencja danych.
- Treści prawne: aktualność na dzień publikacji, daty, źródła pierwotne.

## Metryki
Kliknięcia telefonu i e-maila; poprawne zgłoszenia formularza; leady wg usługi i kanału; indeksowane podstrony; organiczne wejścia; Core Web Vitals. Analytics dopiero po konfiguracji prywatności.

## Stan operacyjny — 9 listopada 2026
- Cloudflare Pages: wdrożenia podglądowe działają pod adresem bez prefiksu `/v2/`.
- Web3Forms: właściciel potwierdził odbiór pojedynczego zgłoszenia w Outlooku; zob. `docs/formularz-test-odbioru.md`.
- Strona główna: pięć podstawowych usług, FAQ ze znacznikami FAQPage, pięć ścieżek leadowych i poradniki.
- **Indeksacja nadal wyłączona celowo** — brak zatwierdzenia prawnego i docelowego hosta. Nie należy przedstawiać obecnej strony jako już pozycjonowanej w Google/ChatGPT.
- Weryfikacja przed release: status i uprawnienie do użycia marki VOTUM; identyfikacja osób i zgody na zdjęcia; podstawy przetwarzania, dostawcy i retencja danych; weryfikacja zakresu oferty; aktualność danych finansowych i źródeł; rzeczywiste testy mobilne.
- Kolejność: audyt prawny i treści → decyzja o domenie → osobny build produkcyjny i kanoniczne URL → robots/sitemap → Google Search Console/Bing Webmaster Tools → monitoring zapytań i konwersji.

## Ulepszenia z 10 listopada 2026 — bez gwarancji indeksacji
- Biblioteka `/wiedza/` zawiera dziesięć poradników i lokalną wyszukiwarkę z kategoriami. Strona domowa prowadzi bezpośrednio do całej biblioteki.
- Użytkownicy poradników mogą powiększyć tekst, skopiować link lub wydrukować materiał. Nie wymaga to analityki, konta ani zewnętrznego API.
- Strona kontaktowa pokazuje autentyczne zdjęcia Wojciecha i Pauliny; formularz może wstępnie zaznaczyć usługę na podstawie lokalnego linku.
- Polityka SEO wyłącza `/404.html`, duplikujące strony kampanii i materiały prywatności z mapy indeksowanych adresów. Szczegóły: `scripts/seo-policy.mjs`.
- Każda publikacja nadal wymaga zatwierdzeń treści, wizerunków i RODO. `robots.txt` aktualnej wersji podglądowej blokuje indeksację i nie należy uznawać tego za awarię bez decyzji o release.
- Po wdrożeniu produkcyjnym zweryfikuj fizycznie dostępność `/robots.txt`, `/sitemap.xml`, artykułów i lokalnych zdjęć. Wynik CI sam nie dowodzi skutecznego wdrożenia.

## Adresy kanoniczne Cloudflare Pages — weryfikacja 11.11.2026
- Publiczne adresy końcowe zweryfikowano w przeglądarce: `/uslugi/szkody-gornicze`, `/wiedza/drobne-pekniecia-szkody-gornicze`, `/kontakt`, `/plan-dzialania` (bez rozszerzenia `.html`).
- Skrypt `scripts/build.mjs` wykorzystuje `scripts/public-routes.mjs` do ustawienia `rel=canonical`, `og:url`, `WebPage.url` i `sitemap.xml` na docelowe adresy bez przekierowań. Wewnętrzne statyczne linki `href` są normalizowane w produkcyjnym HTML.
- Podgląd nadal nie jest produkcyjnym release. Potwierdzić docelowe canonical, indeksację i sitemap **po** faktycznym wdrożeniu. Samo pojawienie się strony w przeglądarce nie dowodzi działania indeksacji.
