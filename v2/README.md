# Twoja Sprawa — źródło strony WWW

## Struktura projektu
- **`v2/` to katalog źródłowy wersji wdrażanej na Cloudflare Pages.** Zmiany w wyglądzie, tekstach i skryptach wprowadzaj tutaj.
- `scripts/build.mjs` buduje katalog produkcyjny `dist/`, zamienia ścieżki `/v2/` na `/`, ustawia właściwe indeksowanie, dodaje dane strukturalne, a publiczne adresy kanoniczne i sitemap tworzy **bez rozszerzenia `.html`**, zgodnie z przekierowaniami Cloudflare Pages. Samo uruchomienie skryptu **nie publikuje strony**.
- `scripts/preview.mjs` tworzy podgląd `dist-preview/` z wyłączonym indeksowaniem.
- Główny `/index.html` w repozytorium jest osobnym plikiem historycznym. **Nie należy traktować go jako źródła aktualnej publikacji.**
- `scripts/network-brand.mjs` dodaje na każdej podstronie stały górny pasek logotypów **Votum Network** i **Votum Scale Agency**. Nie dodawaj drugiego takiego paska w `v2/index.html`.

## Główne ścieżki
- Strona główna: `v2/index.html`
- Szkody górnicze: `v2/uslugi/szkody-gornicze.html`
- Świadczenie wspierające: `v2/uslugi/swiadczenie-wspierajace.html`
- Chatbot-przewodnik: `v2/chat-assistant.js`
- Dwustopniowy wybór usługi oraz etapu sprawy (bez zapisu danych): `v2/service-navigator.js` i `v2/journey.css`
- Portrety zespołu na stronie głównej: `v2/portrait-upgrade.css`; na stronach usług i kampanii: `v2/lead-persona.css`
- Zdjęcia Wojciecha i Pauliny podczas budowy produkcyjnej są pobierane przez `scripts/build.mjs` do `dist/assets/`.
- Formularz Web3Forms: `v2/contact.js`
- Styl graficzny: `v2/styles.css` i `v2/premium-v2.css`
- Biblioteka wiedzy i szybkie wyszukiwanie: `v2/wiedza/index.html`, `v2/knowledge-hub.js`, `v2/knowledge-hub.css`
- Baza 24 FAQ: `v2/faq.html`, `v2/faq.js`, `v2/faq.css` — sześć kategorii, wyszukiwarka lokalna, odnośniki do oficjalnych źródeł, filtrowanie `?temat=szkody|swiadczenie|renty|skd|przesyl|kontakt`.
- Generator planu pierwszych kroków: `v2/plan-dzialania.html`, `v2/plan-dzialania.js`, `v2/plan-dzialania.css` — pięć usług, etap sprawy, checklista, druk i kontakt bez danych osobowych.
- Powiększanie tekstu i druk artykułów: `v2/article-accessibility.js` i `v2/article-accessibility.css`
- Strona kontaktu ze zdjęciami specjalistów: `v2/kontakt.html` i `v2/contact-hub.css`

## Testy przed publikacją
```sh
node scripts/audit.mjs
node scripts/test-chat-lead.mjs
node scripts/test-service-navigator.mjs
node scripts/test-knowledge-hub.mjs
node scripts/test-article-accessibility.mjs
node scripts/test-release-readiness.mjs
node scripts/test-action-plan.mjs
node scripts/test-50-continuations.mjs
node scripts/test-faq.mjs
node scripts/test-50-continuations-iii.mjs
node scripts/test-contact-client.mjs
node scripts/test-network-brand.mjs
node scripts/test-seo-policy.mjs
```
GitHub Actions wykonuje automatyczny audyt dla gałęzi `main` oraz oddzielny test wizualny dla telefonów i komputerów. Test obejmuje przejście z przewodnika do wstępnie wypełnionego formularza i ładowanie portretów. Zielony audyt **nie potwierdza** wdrożenia na Cloudflare ani dostarczenia zgłoszenia do skrzynki Outlook.

## Zasady publikacji
Budowanie wersji produkcyjnej wymaga jawnie potwierdzonych przeglądów treści, kwestii prawnych i formularza. Zgodnie z zabezpieczeniami w `scripts/build.mjs` wymagane są zmienne `SITE_URL`, `RELEASE=1`, `LEGAL_APPROVED=1`, `CONTENT_APPROVED=1`, `FORM_APPROVED=1`. Nie ustawiaj ich bez rzeczywistego zatwierdzenia.
Kanonikalny adres witryny: https://twoja-sprawa.pages.dev/.
Dane przekazywane przez formularz kierowane są do Web3Forms i następnie na `twojasprawa_votum@outlook.com`; faktyczne doręczenie należy sprawdzać osobnym testem.

## Stan wdrożenia i uwagi (10 listopada 2026)
- Na stronie głównej wyeksponowano dwie najważniejsze usługi, rzeczywiste zdjęcia i numery osób kontaktowych.
- Strony obu głównych usług oraz ich kampanie mają portret i telefon osoby do pierwszego kontaktu.
- Przewodnik rozróżnia m.in. odmowę kopalni, propozycję ugody, decyzję WZON i etap ZUS; wysyła do formularza wyłącznie kody kategorii i etapu oraz bezpieczne oznaczenia kampanii.
- Na stronie produkcyjnej bezwzględnie należy zweryfikować działanie formularza, licencje materiałów i uprawnienia do wykorzystania wizerunków oraz politykę prywatności.
- **Nie przełączać `robots.txt` na indeksowanie bez zatwierdzenia zgodnie z `PUBLICATION-CHECKLIST.md`.**

## Biblioteka poradników — stan techniczny
- Dziesięć artykułów jest dostępnych w `v2/wiedza/index.html` z filtrowaniem według pięciu kategorii, wyszukiwaniem odpornym na polskie znaki oraz przyciskiem resetu.
- Każdy artykuł w `v2/wiedza/` zawiera narzędzia: większy tekst, druk do PDF przez przeglądarkę i kopiowanie linku. Funkcje nie wymagają rejestracji i nie zapisują wyszukiwań.
- Strona kontaktu prezentuje Wojciecha i Paulinę ze zdjęciami; przyciski wskazują usługę przed wejściem do formularza.
- W polityce SEO strona `/404.html` jest wykluczona z indeksacji i mapy witryny.

## Druga seria iteracji (11 listopada 2026)
- Zrealizowano 50 kolejnych kontroli funkcji, SEO, prywatności, wydania i dostępności. Wyniki oraz nazwy kontroli opisano w `docs/50-KONTYNUACJI-ETAP-II.md`.
- Formularz obsługuje `lead_path=plan` i wstępne zaznaczenie etapu, ale nie przyjmuje diagnoz ani dokumentów.
- Weryfikacja ZUS: trzy miesiące od ostateczności decyzji WZON mogą mieć znaczenie dla wyrównania świadczenia. Treść należy monitorować przy zmianach prawa.
\n## Adresy Cloudflare i SEO\n- Pliki źródłowe nadal mają nazwy `*.html`, ale Cloudflare Pages przekierowuje ich publiczne odpowiedniki na adresy bez `.html`, np. `/kontakt` i `/plan-dzialania`.\n- `scripts/public-routes.mjs` jest jedynym konwerterem tras dla kanonicznych adresów i mapy witryny. Test `scripts/test-public-routes.mjs` bada 10 poprawnych przykładów oraz 5 błędnych wejść.\n- Przegląd `robots.txt` i faktycznego `sitemap.xml` jest konieczny **po zatwierdzonym wdrożeniu produkcyjnym**; zielony test CI nie dowodzi opublikowania mapy.\n
## Trzecia seria rozwoju (11 listopada 2026)
- Dodatkowa strona `/faq` z 24 edukacyjnymi pytaniami: 6 szkody górnicze, 6 świadczenie wspierające, 3 renty, 3 kredyty PLN/SKD, 2 służebność przesyłu, 4 kontakt.
- Skrót na stronie głównej, link z biblioteki poradników i kontekstowe odnośniki z najważniejszych usług. FAQ jest indeksowalne dopiero w zatwierdzonym wydaniu produkcyjnym.
- 50 sekwencyjnych kontroli treści, bezpieczeństwa i technicznego SEO uruchamia `scripts/test-50-continuations-iii.mjs`; test interakcji filtrów: `scripts/test-faq.mjs`.
- Dalsze zatwierdzenia prawne, wizerunki, formularz i konfiguracja Cloudflare pozostają oddzielnymi zadaniami. Zaliczenie CI nie oznacza zakończenia publikacji.
