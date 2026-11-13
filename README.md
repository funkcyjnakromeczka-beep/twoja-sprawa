# Twoja Sprawa — SuccessTree

Strona informacyjna SuccessTree OBIEGŁO WOJCIECH, przedstawiciela współpracującego z VOTUM. Publiczny adres: https://twoja-sprawa.pages.dev/ .

## Właściwy punkt edycji i publikacji

**Zweryfikowano 13 listopada 2026 r. na publicznej witrynie:**

- Widoczna strona główna odpowiada treści `v2/index.html`, a **nie** głównemu `index.html` repozytorium.
- Publiczne adresy są prezentowane bez prefiksu `/v2/` i zazwyczaj bez końcówki `.html`.
- Na przykład: źródło `v2/kontakt.html` → opublikowana strona `/kontakt`.
- Plik `v2/styles.css` jest publicznie dostępny jako `/styles.css`.
- Wpisanie `/v2/kontakt.html` na domenie publicznej daje 404 — nie należy udostępniać takiego adresu klientom.
- Zmiany w `v2/index.html` i `v2/home-flow.css` pojawiły się na publicznej witrynie po zapisie w GitHub. Nie jest to dowód stałej dostępności mechanizmu publikacji.

**Wniosek operacyjny:** dopóki konfiguracja nie zostanie zmieniona, główny projekt publiczny należy rozwijać przede wszystkim w katalogu `v2/`. Główny `index.html` repozytorium jest odmienną wersją i jego edycja nie gwarantuje zmiany publicznej strony. Nie usuwaj go bez analizy zależności wdrożenia.

Mechanizm usuwania prefiksu/rozszerzenia i ustawienia projektu Cloudflare trzeba weryfikować osobno, jeżeli zmieni się proces publikacji. Nie są one zapisane w tym README jako ustalona konfiguracja konta.

## Najważniejsze pliki

- `v2/index.html` — publiczna strona główna
- `v2/o-nas.html` — indeksowalna podstrona o zespole i zakresie współpracy (samodzielna treść, canonical `/o-nas`, schemat `AboutPage`); łączy trzy główne usługi i bezpośrednie kontakty do doradców
- `v2/home-flow.css`, `v2/premium-v2.css`, `v2/styles.css` — układ i styl
- `v2/portrait-upgrade.css` — karty osób kontaktowych, elastyczne adresy e-mail i odnośniki do usług na urządzeniach mobilnych
- `v2/contact.js` — formularze Web3Forms z awaryjnym kontaktem e-mail
- `v2/chat-assistant.js` — bezpłatny przewodnik po usługach
- `v2/kampanie/skd.html` — kontakt do analizy pełnej umowy kredytu PLN
- `v2/attribution.js` — bezcookiesowe przenoszenie wyłącznie dozwolonych UTM przy klikaniu linków wewnętrznych; podłączone do kluczowych podstron
- `v2/narzedzia/linki-kampanii.html` + `v2/campaign-links.js` — bezpłatny generator linków UTM i tekstów do publikacji (6 usług, w tym SKD jako trzecia)
- `v2/narzedzia/test-formularzy.html` — ręcznie uruchamiana kontrola 10 podstron, 3 plików indeksowania, 3 elementów aktualnej wersji FAQ (JS, CSS, osadzenie w HTML) i renderowania 2 formularzy, bez wysyłania danych i bez płatnych usług
- `v2/local-mining.css`, `v2/lokalnie/` — lokalne strony Lubina i Polkowic
- `v2/_headers` — konserwatywne nagłówki bezpieczeństwa na ścieżce publikacji
- `v2/404.html` — wersja strony błędu powiązana z publiczną witryną

## Bezpłatne linki marketingowe

Generator: https://twoja-sprawa.pages.dev/narzedzia/linki-kampanii (strona pomocnicza oznaczona `noindex`). Tworzy gotowe linki z UTM oraz propozycje tekstów. Nie zapisuje nazw kampanii na serwerze. Do Canvy można skopiować cały URL i wygenerować kod QR na ulotkę.

Przykłady do edycji:

- Szkody, Facebook: `https://twoja-sprawa.pages.dev/kampanie/szkody-gornicze?utm_source=facebook&utm_medium=post&utm_campaign=szkody_lubin_2026`
- Świadczenia, rolka: `https://twoja-sprawa.pages.dev/kampanie/swiadczenie-wspierajace?utm_source=instagram&utm_medium=social&utm_campaign=swiadczenie_2026`
- SKD, kod QR: `https://twoja-sprawa.pages.dev/kampanie/skd?utm_source=qr&utm_medium=print&utm_campaign=skd_ulotka_2026`

Skrypt `attribution.js` zachowuje oznaczenia kampanii podczas typowej nawigacji linkami. **Nie mierzy wejść ani konwersji bez wysłania formularza** i nie działa jako pełna analityka. Nie dodawać do UTM imion klientów, telefonów, PESEL ani danych wrażliwych.

Audyt statycznych odnośników (13.11.2026): w 12 kluczowych stronach znaleziono 70 unikatowych lokalnych zasobów; istnienie powiązanych plików, w tym obu JPG, zostało potwierdzone w GitHub. To nie zastępuje testów całej strony w działającej przeglądarce.

## Kontrola zmian po każdym wdrożeniu

1. Otwórz `https://twoja-sprawa.pages.dev/`; sprawdź widoczność szkód górniczych, świadczenia wspierającego i trzeciej ścieżki SKD.
2. Sprawdź `https://twoja-sprawa.pages.dev/kontakt` oraz `https://twoja-sprawa.pages.dev/kampanie/skd`.
3. Sprawdź `https://twoja-sprawa.pages.dev/uslugi/szkody-gornicze` oraz `https://twoja-sprawa.pages.dev/uslugi/swiadczenie-wspierajace`.
4. Sprawdź aktualną mapę `https://twoja-sprawa.pages.dev/sitemap.xml` — publiczna mapa jest generowana inaczej niż starszy plik `sitemap.xml` w katalogu repozytorium.
5. Otwórz `https://twoja-sprawa.pages.dev/narzedzia/test-formularzy` i kliknij „Uruchom kontrolę” — sprawdza 10 stron, 3 pliki SEO, 3 elementy najnowszego FAQ i 2 formularze bez wysyłania danych.
6. Przetestuj działanie formularza w przeglądarce i potwierdź dostarczenie testowego zgłoszenia dopiero po uzgodnieniu procedury, aby nie generować fałszywych leadów.
7. Jeżeli formularz nie działa, statyczny kontakt wewnątrz `[data-contact-form]` powinien pozostać widoczny.

## Diagnostyka rozbieżności GitHub ↔ Cloudflare (13.11.2026)

**Potwierdzony problem:** pliki `v2/faq-share-v1.js` i `v2/faq-share-v1.css` istnieją w GitHub, a po opublikowaniu w katalogu `v2/` powinny być dostępne odpowiednio pod `/faq-share-v1.js` oraz `/faq-share-v1.css`. Publiczny Cloudflare Pages zwrócił 404, zaś `/faq` nadal wskazywał stare zasoby, pomimo obecności nowych odnośników w `v2/faq.html`. **Zapis w GitHub nie jest potwierdzeniem wdrożenia.**

Nie znaleziono standardowych plików `.github/workflows/deploy.yml`, `cloudflare.yml`, `pages.yml`, `wrangler.toml` ani `package.json` w badanych ścieżkach repozytorium. Nie przesądza to, czy Cloudflare Pages jest połączony przez własną integrację Git, czy wdrażany ręcznie (Direct Upload).

### Bezpłatny sposób rozpoznania i naprawy

1. W panelu https://dash.cloudflare.com/ przejdź do **Workers & Pages → twoja-sprawa → Deployments** i sprawdź datę, status, gałąź i commit ostatniej udanej publikacji.
2. **Jeśli projekt ma integrację GitHub:** wejdź do **Settings → Builds → Branch control**, sprawdź, czy produkcyjną gałęzią jest `main` i czy automatyczne wdrożenia produkcyjne są aktywne. Sprawdź także repozytorium i katalog wyjściowy (publiczne pliki pochodzą z `v2`), a następnie błędy ostatniego wdrożenia. Zastosuj ponowne wdrożenie z panelu dopiero po sprawdzeniu właściwej gałęzi i konfiguracji.
3. **Jeżeli projekt jest typu Direct Upload:** sam `git push` nie publikuje zmian; potrzebne jest świadome wdrożenie katalogu z plikami przez Cloudflare Pages (ręcznie lub przez bezpłatnie skonfigurowany proces CI). Nie wprowadzaj tokenów API ani sekretów do repozytorium.
4. Po publikacji sprawdź działanie `https://twoja-sprawa.pages.dev/faq-share-v1.js`, `https://twoja-sprawa.pages.dev/faq-share-v1.css` oraz znaczników w `https://twoja-sprawa.pages.dev/faq`. Możesz też użyć `/narzedzia/test-formularzy`: podaje wynik 0–3 dla aktualności FAQ.
5. Nie zmieniaj domeny ani nie usuwaj istniejącego projektu bez potwierdzenia, jak został pierwotnie wdrożony. W pierwszej kolejności przywróć spójność między repozytorium a obecnym projektem.

Dokumentacja Cloudflare: [GitHub integration](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/) i [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/).

## Przekazywanie zgłoszeń i podglądy linków

Formularze Web3Forms korzystają z jednego publicznego identyfikatora formularza. O tym, do której rzeczywistej skrzynki trafiają wiadomości, decyduje konfiguracja Web3Forms. Pole `advisor` / `advisor_email` i tytuł zgłoszenia pomagają w ręcznym przypisaniu sprawy: Wojciech — szkody górnicze, SKD i pozostałe usługi; Paulina — świadczenia wspierające i renty. Nie oznacza to automatycznego przekierowania na dwie skrzynki. W razie błędu formularza link mailto przygotowuje wiadomość bezpośrednio do wskazanego doradcy.

Strona główna oraz trzy główne podstrony mają jawne `og:url` z kanonicznym adresem publicznym i `og:image` ze zdjęciem właściwej osoby. Wymiary obrazów sprawdzone w plikach JPEG: Wojciech 1080 × 1708 px, Paulina 1056 × 1489 px. Ostateczny wygląd podglądu jest kontrolowany również przez Facebook, komunikatory i inne serwisy i nie jest gwarantowany przez samo dodanie metadanych.

## Zasady projektu

- Bez konieczności płacenia za nowe usługi.
- Najważniejsze tematy: szkody górnicze, świadczenie wspierające, **SKD jako trzecia wyróżniona usługa**.
- W SKD: e-mail `wojciech.obieglo@votum-ds.pl`; prośba o pełną umowę i numer telefonu.
- Nie deklarujemy gwarantowanego świadczenia, odszkodowania ani wygranej.
- SuccessTree jest odrębną działalnością; serwis nie jest oficjalną stroną VOTUM ani kancelarią.
- Przy formularzach nie prosimy o PESEL, hasła ani szczegółową dokumentację medyczną.

## Główne ścieżki kontaktu i testy

1. Wybór szkód górniczych, świadczenia wspierającego lub SKD na stronie głównej, przejście do sekcji `#kontakt` (również na wąskim ekranie).
2. Z formularza SKD wymagany jest numer telefonu; pełną umowę klient wysyła osobno na `wojciech.obieglo@votum-ds.pl`.
3. Na podstronie `/o-nas` sprawdź klikane numery, adresy e-mail i trzy linki do usług.
4. Awaryjny kontakt e-mail z formularza trafia bezpośrednio do właściwej osoby; Web3Forms nadal używa osobno skonfigurowanej skrzynki, a pole `advisor_email` ma wyłącznie charakter informacyjny.
5. Nie udawaj potwierdzenia doręczenia e-maila na podstawie statusu API. Tester `/narzedzia/test-formularzy` nie wysyła żadnych zgłoszeń.
