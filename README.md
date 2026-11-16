# Twoja Sprawa — SuccessTree

**Audyt V (16.11.2026):** [27 sekcji powiązanych materiałów, 93 bezpieczne odnośniki i sześć ścieżek wyszukiwania](docs/audyt-powiazanych-materialow-i-wyszukiwania-2026-11-16.md). Sprawdzane automatycznie przez `scripts/test-related-content.mjs` oraz `scripts/test-search-index-freshness.mjs`.

**Audyt IV — 16.11.2026:** [1000 kontroli wydania i nowe ulepszenia nawigacji/SEO](docs/audyt-1000-kontroli-i-nowe-ulepszenia-2026-11-16.md). Pakiet obejmuje 229 bezpośrednich linków do nagłówków, 40 spójnych BreadcrumbList, usunięcie duplikatu AboutPage oraz naprawę kolizji odnośników w kartach. Kontrola regresji: `node scripts/test-1000-release-checks.mjs` uruchamiana po budowaniu produkcyjnym. **1000 kontroli nie oznacza 1000 zmian w interfejsie.**

**Audyt III — 16.11.2026:** [1011 wykonanych ulepszeń na 47 podstronach — pełna lista z testu wydania](docs/audyt-1011-ulepszen-2026-11-16.md). Zakres: 289 opisów działania odnośników, 231 adresowalnych nagłówków, 211 skrótów spisu treści, 175 nazwanych regionów oraz 105 usprawnień nawigacji kontaktowej i powrotu. Kontrola: `node scripts/test-content-anchors.mjs`.

**Audyt II — 16.11.2026:** [106 kolejnych wdrożonych poprawek grafik, prywatności i dostępności nawigacji](docs/audyt-106-kolejnych-ulepszen-2026-11-16.md), potwierdzonych przez `node scripts/test-media-navigation-quality.mjs` i produkcyjne testy GitHub Actions.

**Audyt 16.11.2026:** [100 wdrożonych poprawek dostępności i nawigacji — lista każdej zmiany](docs/audyt-100-ulepszen-2026-11-16.md). Kontrola: `node scripts/test-page-navigation.mjs` oraz testy produkcyjne GitHub Actions.

## Spójna ścieżka od usługi do planu pierwszych kroków (15.11.2026)

- Na sześciu głównych podstronach (szkody górnicze, świadczenie wspierające, SKD, renty, kredyty CHF i służebność przesyłu) przy **istniejącej sekcji kontaktu** znajduje się dodatkowy odnośnik do `/plan-dzialania?usluga=<kod>`. Nie dodano drugiego formularza ani skryptów analitycznych.
- Każda podstrona zawiera krótką wskazówkę przygotowawczą dostosowaną do usługi. Wersje źródłowe odnośników `/v2/...` są przepisywane na adresy produkcyjne przez istniejący generator.
- Zaktualizowano treść pięciu ogólnych nagłówków CTA, pozostawiając w CHF dotychczasowy nagłówek. Na telefonach link ma co najmniej 48 px wysokości. Nowa klasa CSS: `.service-plan-bridge` w `v2/styles.css`.
- Odpowiedzialni za kontakt bez zmian: Wojciech +48 796 441 345 (szkody, SKD, CHF, przesył), Paulina +48 500 171 531 (świadczenie, renty). W SKD e-mail do wysyłki umowy: `wojciech.obieglo@votum-ds.pl`.
- Kontrola: `node scripts/test-action-plan.mjs` sprawdza sześć powiązań, sposób kontaktu, dostępność CSS i brak obowiązku podawania danych osobowych. Produkcyjne linki sprawdzono na wszystkich sześciu publicznych podstronach; to nie jest pomiar skuteczności konwersji.

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
- `v2/narzedzia/test-formularzy.html` — ręcznie uruchamiana kontrola 10 podstron, 3 plików indeksowania, 3 elementów aktualnej wersji FAQ (JS, CSS, osadzenie w HTML) i 7 testów formularzy oraz ścieżek kontaktu (m.in. SKD, Paulina, zmiana usługi przez kartę, walidacja telefonu, kontakt e-mail bez telefonu), bez wysyłania danych i bez płatnych usług
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

## Chatbot i przewodnik — interakcje, nawigacja, WCAG (15.11.2026)

- W chatbocie wyróżniono **trzy główne usługi w ustalonej kolejności**: szkody górnicze, świadczenie wspierające, Sankcja Kredytu Darmowego (SKD) jako trzecia. Pozostałe tematy pozostają dostępne.
- Po zamknięciu panelu klawiaturą (Esc) lub kliknięciem poza panelem fokus nie zostaje na ukrytym elemencie. Odpowiedzi na pytania i etapy sprawy nadal działają bez wysyłania danych.
- Dolny pasek akcji chatbota nie pozostaje przyklejony do panelu podczas przewijania. Dotychczas potrafił zasłaniać link **„Przejdź do formularza”** po wybraniu etapu sprawy, zmniejszając jego rzeczywisty dostępny obszar do ok. 11 px — mimo właściwej nominalnej wysokości linku.
- Test Chromium obejmuje **6 ścieżek przewodnika i 6 ścieżek chatbota**, sprawdza doradcę, formularz, etapy, bezpośrednie linki i zachowanie oznaczeń kampanii. Dodatkowo kontroluje **otwarty chatbot i otwarty przewodnik** za pomocą axe-core WCAG A/AA oraz nawigację klawiaturą. Przebieg po poprawce wykazał 0 naruszeń w obu rozwiniętych panelach.
- Jest to wynik zautomatyzowany na wybranych ścieżkach i viewportach; nie stanowi deklaracji pełnej zgodności WCAG na każdym urządzeniu.

## Rozszerzony audyt stron usługowych (15.11.2026)

- `scripts/test-browser-flows.mjs` w realnym Chromium sprawdza teraz **11 publicznych adresów**: stronę główną, kontakt, trzy kampanie i sześć pełnych stron usługowych (szkody górnicze, świadczenie wspierające, SKD, renty, kredyty frankowe, służebność przesyłu). W zakończonym przebiegu dla commitu `4a081c0` wszystkie adresy miały **zero wykrytych naruszeń w automatycznym zestawie WCAG 2.x A/AA**. Sprawdza także stan rozwiniętego chatbota i przewodnika.
- Strony sześciu usług przeszły automatyczne kontrole przy szerokościach **320 oraz 390 px**: brak poziomego przewijania oraz za małych mobilnych linków kontaktowych.
- Poprawiono zbyt jasne podpisy na kremowych kartach, odziedziczony jasny tekst w jasnym panelu MIDAS, kontrast złotego przycisku telefonicznego, etykiety przycisków powrotu i szybkiego kontaktu, a także nazwę linku e-mail na podstronie SKD.
- Automatyczne testy nie zastępują pełnego audytu manualnego, w szczególności na iOS, z VoiceOver / TalkBack i przy powiększeniu tekstu.

## Odnośniki i dostępność (15.11.2026)

- `scripts/test-internal-links.mjs` w workflow `.github/workflows/release-candidate.yml` kontroluje lokalnie wygenerowane linki i odwołania do sekcji. Zakończony poprawnie przebieg zbadał **47 plików HTML, 1040 odnośników/zasobów i 219 fragmentów**. Nie łączy się z zewnętrznymi serwisami; odnośniki wychodzące trzeba weryfikować osobno.
- `scripts/test-browser-flows.mjs` używa bezpłatnego `axe-core@4.14.0` na rzeczywistym wdrożeniu Cloudflare i zatrzymuje test, jeśli wykryje problem z kryteriami WCAG A/AA na stronie głównej, kontakcie lub trzech kampaniach. W zakończonym przebiegu pięć stron miało **0 wykrytych naruszeń** w użytym zestawie reguł.
- Poprawiono czytelność sekcji kontaktowej i jasnych podpisów na stronach kampanii oraz zgodność nazw linków z widocznym tekstem. Automatyczny wynik nie oznacza pełnego audytu dostępności: nadal należy wykonać manualną kontrolę klawiatury, czytnika ekranu i rzeczywistych urządzeń.

## Optymalizacja strony głównej (15.11.2026)

- Produkcyjny kompilator (`scripts/build.mjs`) zachowuje wszystkie 7 arkuszy CSS osobno dla podstron usług, lecz dla strony głównej generuje jeden `/home-bundle.css` w identycznej kolejności reguł. Źródłowe arkusze pozostają oddzielne, a generator kończy pracę błędem, jeśli kolejność CSS się zmieni. Nie wprowadzono płatnych usług.
- Pomiar Chromium (390 px): **7 → 1 żądanie CSS**; transfer CSS około **70,0 KB → 63,3 KB**. Objętość reguł po rozpakowaniu pozostaje prawie bez zmian (około 291 KB), więc jest to optymalizacja sposobu pobierania, a nie usuwanie stylów.
- W dwóch przebiegach CI zdarzenie `load` wystąpiło po odpowiednio 845 ms przed zmianą i 609 ms po zmianie. To **pojedyncze pomiary w środowisku testowym**, nie dowód 236 ms poprawy dla rzeczywistych użytkowników i nie wynik Core Web Vitals.
- `scripts/test-browser-flows.mjs` sprawdza liczbę arkuszy CSS, ładowanie kluczowych lokalnych obrazów, siedem scenariuszy formularzy, nawigację oraz układ kampanii na wąskich ekranach. Testy nie wysyłają żadnych zgłoszeń.

## Lżejsze style CSS w wydaniu produkcyjnym (15.11.2026)

- Generator `scripts/build.mjs` usuwa komentarze autorskie z **produkcyjnego** `/home-bundle.css` oraz siedmiu odrębnych arkuszy CSS używanych przez podstrony. Zachowuje treść reguł, ich kolejność i teksty w cudzysłowie; oryginały `v2/*.css` pozostają nienaruszone i nadal zawierają komentarze pomocne przy edycji.
- Zmierzony pakiet strony głównej: **295 202 B źródeł → 279 271 B CSS**. Oszczędność **15 931 B (ok. 5,4%) przed kompresją HTTP**. W analogicznym zestawie siedmiu osobnych arkuszy produkcyjnych oszczędność komentarzy wynosi sumarycznie 15 931 B; **nie należy sumować obu oszczędności w odniesieniu do jednej wizyty**, ponieważ podstrony i strona główna korzystają z alternatywnych układów tych samych arkuszy.
- `scripts/test-production-bundle.mjs` pilnuje granicy 285 KB dla pakietu głównego oraz zmniejszenia osobnych arkuszy. Test przeglądarkowy monitoruje rozmiar pobranego arkusza strony głównej i pełne ścieżki formularzy oraz dostępność interfejsu.
- Jest to ograniczenie rozmiaru zasobu, a nie potwierdzona poprawa Core Web Vitals lub konwersji w rzeczywistym ruchu. Nie użyto dodatkowych płatnych narzędzi.

## Kontrola zmian po każdym wdrożeniu

1. Otwórz `https://twoja-sprawa.pages.dev/`; sprawdź widoczność szkód górniczych, świadczenia wspierającego i trzeciej ścieżki SKD.
2. Sprawdź `https://twoja-sprawa.pages.dev/kontakt` oraz `https://twoja-sprawa.pages.dev/kampanie/skd`.
3. Sprawdź `https://twoja-sprawa.pages.dev/uslugi/szkody-gornicze` oraz `https://twoja-sprawa.pages.dev/uslugi/swiadczenie-wspierajace`.
4. Sprawdź aktualną mapę `https://twoja-sprawa.pages.dev/sitemap.xml` — publiczna mapa jest generowana inaczej niż starszy plik `sitemap.xml` w katalogu repozytorium.
5. Otwórz `https://twoja-sprawa.pages.dev/narzedzia/test-formularzy` i kliknij „Uruchom kontrolę” — sprawdza 10 stron, 3 pliki SEO, 3 elementy najnowszego FAQ oraz 7 scenariuszy formularzy bez wysyłania danych.
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

## Audyt produkcji po zmianach z 14 listopada 2026 r.

- Aktualną kontrolą odczytową jest `scripts/audit-production-current.mjs`, uruchamiana przez `.github/workflows/live-audit.yml` lub ręcznie przez `node scripts/audit-production-current.mjs`. Sprawdza 13 publicznych zasobów, trzy usługi i trzy skróty kontaktowe, pojedynczą belkę partnerów, zgodność adresów e-mail, canonical, sitemap, Web3Forms i FAQ; nie wysyła zgłoszeń.
- Starszy `scripts/audit-production-live.mjs` pozostaje historycznym zestawem testów, **nie jest aktualną podstawą oceny**: zawiera oczekiwania z poprzednich wersji strony, np. dwa zamiast trzech skrótów formularza.
- Kompilacja w `scripts/build.mjs` usuwa starszy, powtórzony schemat Organization/WebSite ze strony głównej i generuje jeden aktualny graf z kontaktami Wojciecha i Pauliny. `scripts/test-production-bundle.mjs` kontroluje ich zgodność.
- Kompilator usuwa też źródłowy `homepage-partner-strip` przy wstawianiu wspólnego paska `network-brand-bar`. Źródłowy podgląd HTML może mieć osobną belkę, ale **kandydat produkcyjny nie powinien pokazywać dwóch**.
- Zmiany zapisane w GitHub to **nie potwierdzenie publikacji** w Cloudflare Pages. Audyt publicznej produkcji jest niezależny od testów `dist/`. Do naprawy rozbieżności potrzebne jest sprawdzenie panelu Cloudflare i rzeczywistej konfiguracji GitHub/Direct Upload.
- Audyt uruchamia się ręcznie lub po zmianie jego workflow/skryptu. Nie należy zakładać, że audyt automatycznie wykonuje wdrożenie.

## Usprawnienia ścieżek użytkownika (14 listopada 2026 r.)

- W kreatorze usług (`v2/service-navigator.js`) i chatbotcie (`v2/chat-assistant.js`) SKD prowadzi do `/kampanie/skd#formularz`, a nie do ogólnej strony kontaktowej. Dedykowana kampania zawiera możliwość przesłania pełnej umowy na `wojciech.obieglo@votum-ds.pl` i podania telefonu. Wersja źródłowa używa ścieżki `/v2/kampanie/skd.html`, przetwarzanej w buildzie.
- Na ekranach o szerokości do 760 px wielokrotne przyciski w hero są schowane na rzecz jednego widocznego paska mobilnego dla szkód, świadczenia i SKD (`v2/home-flow.css`).
- Dane strukturalne `Service.areaServed`: szkody górnicze — Lubin, Polkowice i okolice; lokalne strony — odpowiednio Lubin lub Polkowice; świadczenia wspierające — Polska. Zasięg w Schema.org ma odpowiadać rzeczywistej ofercie, nie udawać dostępności wszędzie.
- `scripts/validate-site.js` i `scripts/test-production-bundle.mjs` zawierają regresję dla nowych ścieżek SKD i zasięgu SEO. `scripts/audit-production-current.mjs` weryfikuje także publiczną wersję obu funkcji i układu mobilnego, bez wysyłania formularzy.
- `.github/workflows/release-candidate.yml` uruchamia kontrolę także po zmianie `scripts/network-brand.mjs`. Nadal jest to **budowanie i testowanie bez wdrożenia**.
- Odczyt produkcyjnej domeny nie był możliwy przez dostępne kanały HTTP w tej sesji. Zatwierdzona zmiana w GitHub nie oznacza weryfikacji strony Cloudflare Pages.

## Ustalenie faktycznej wersji na Cloudflare

Od tej wersji polecenie `node scripts/build.mjs` zapisuje do pakietu produkcyjnego plik `dist/release-info.json`. Zawiera on wyłącznie publiczne informacje techniczne: adres strony, katalog źródłowy `v2`, ścieżkę skryptu kompilacji, czas budowania (UTC) i identyfikator commita, o ile jest dostępny w `CF_PAGES_COMMIT_SHA` lub `GITHUB_SHA`. W pakiecie nie zapisuje się haseł, formularzy ani danych klientów.

Po **rzeczywistej publikacji pakietu `dist/`** sprawdź `https://twoja-sprawa.pages.dev/release-info.json`. Jeśli plik nie jest dostępny, to Cloudflare może nadal publikować inny katalog lub starszy pakiet. Nie należy interpretować braku pliku jako potwierdzenia aktualizacji. Jeśli plik jest dostępny, porównaj `commit` z GitHub i `builtAt` z datą wdrożenia. Przy braku identyfikatora commita pole ma wartość `null` — nie należy wtedy zgadywać wersji.

Test kandydata wydania sprawdza format i zgodność pliku, a workflow GitHub pokazuje jego zawartość w logu. `scripts/audit-production-current.mjs` próbuje odczytać go z publicznej domeny — powodzenie audytu oznacza **odczyt działającej produkcji**, nie tylko przejście testów GitHub. Ten mechanizm nie wykonuje samodzielnie wdrożenia.

## Obecne workflow GitHub i lokalny proces wydania

W repozytorium działają już niezależne zadania:
- `.github/workflows/validate-site.yml` — szybka kontrola składni i integralności źródła po zmianie plików, uruchamia `node scripts/validate-site.js`.
- `.github/workflows/release-candidate.yml` — buduje katalog `dist/` i sprawdza kandydata wydania, ale **nie publikuje** plików na Cloudflare.
- `.github/workflows/live-audit.yml` — odczytowa kontrola publicznej produkcji, nie publikuje plików.
- `.github/workflows/browser-flows.yml` — **bezpłatne testy Chromium w publicznym repozytorium**. Po zmianach strony czeka na zgodność hasha `release-info.json` z commitem GitHub, następnie otwiera opublikowaną diagnostykę i sprawdza w rzeczywistej przeglądarce 10 podstron, 3 pliki SEO, 3 elementy FAQ i 7 scenariuszy formularzy, nie wysyłając zgłoszeń. Dodatkowo porównuje nawigację mobilną (390 px) i komputerową (1280 px), trzy wyróżnione usługi, dwa logotypy i dolne przyciski telefoniczne Wojciecha oraz Pauliny. Skrypt: `scripts/test-browser-flows.mjs`.
- `.github/workflows/indexnow.yml` — zgłaszanie wyłącznie potwierdzonych publicznych adresów, nie jest systemem publikacji.
- `.github/workflows/backup-portraits.yml` — zabezpieczenie lokalnych zdjęć zespołu w repozytorium.

**Zweryfikowane uruchomienie przeglądarkowe (14.11.2026):** [GitHub Actions #2](https://github.com/funkcyjnakromeczka-beep/twoja-sprawa/actions/runs/43639601413) zakończyło się sukcesem dla commita `1004039ae37c4a8efd6cd6ef94fb7d0063284ace`: **13/13** zasobów, **3/3** FAQ, **7/7** formularzy, plus mobilne i desktopowe przejścia kontaktowe. Kontrola nie dotyczy skuteczności faktycznego doręczenia e-maili przez Web3Forms; tę kwestię należy testować odrębnie, z uzgodnionym testowym zgłoszeniem.

**Głównym generatorem strony jest `scripts/build.mjs` (źródło: `v2/`, wynik: `dist/`).** Nie wdraża on samodzielnie plików. Przed zmianami w konfiguracji Cloudflare należy porównać ostatni plik `dist/` z aktywnym wdrożeniem. Celem jest zachowanie obecnej domeny i wszystkich funkcji kontaktowych, nie przenoszenie strony do nowego hostingu.

Przy budowaniu `attribution.js` podłączany jest tylko raz, nawet jeżeli strona źródłowa już go posiada. Polityka `scripts/seo-policy.mjs` zezwala na indeksowanie centrum wiedzy i dwóch zatwierdzonych artykułów; pozostałe szkice i checklisty mają pozostać poza mapą witryny. `scripts/test-production-bundle.mjs` kontroluje te zasady na kandydacie wydania.

Dokumentacja Cloudflare: [GitHub integration](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/) i [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/).

## Spójne ścieżki chatbota i przewodnika (15.11.2026)

- Dwa interaktywne elementy: `service-navigator.js` i `chat-assistant.js` kierują do odpowiedniego formularza z **adresem bez `.html` na produkcji Cloudflare Pages**. W lokalnym podglądzie `/v2/` zachowane są linki do plików `.html`. Zapobiega to niepotrzebnym przekierowaniom i zachowuje podgląd projektu.
- Przed kliknięciem w formularz klient może wybrać jedną z 6 usług. Kody etapu sprawy, rodzaju uszkodzeń i dozwolone oznaczenia UTM pozostają w odnośniku. Nie przechodzą przez niego telefon, adres e-mail, PESEL ani inne dane osobowe.
- Realny test Chromium `scripts/test-browser-flows.mjs` weryfikuje **12 tras** (6 × 2 interfejsy), numery doradców, źródło kampanii oraz rzeczywiste otwarcie wypełnionych kontekstowo formularzy świadczeń i szkód. W testach nie wysyła się zgłoszeń.
- Kompilator przepisuje odnośniki w wydaniu — dlatego kontrola kandydata produkcji dodatkowo wykrywa przypadkowe uszkodzenie mechanizmu rozpoznawania podglądu `/v2/`.

## Wyszukiwarka: awaryjny dostęp do sześciu usług (15.11.2026)

- Strona `/szukaj` działa lokalnie i nie przesyła tekstu wpisanego w pole wyszukiwania do serwera. Po prawidłowym inicjowaniu `v2/site-search.js` ustawia `data-search-ready="true"`, pokazuje pole/filtry/wyniki i ukrywa statyczny panel awaryjny.
- Bez JavaScript albo przy błędzie ładowania skryptów/indeksu użytkownik widzi **sześć bezpośrednich odnośników**: szkody górnicze, świadczenie wspierające, SKD (trzecie), renty, kredyty CHF i służebność przesyłu. Nie pokazuje się wtedy niedziałające pole wyszukiwania. Pozostają także telefony Wojciecha i Pauliny.
- Po usunięciu sztywnego liczbowego opisu wyników tekst nie wymaga ręcznej aktualizacji wraz z rozbudową serwisu. Poprawiono też zbyt słaby kontrast małej etykiety wyszukiwarki.
- Test Chromium przy **320 px** potwierdza: realne wyniki SKD, filtrowanie i reset; widoczne linki awaryjne przy wyłączonym JavaScript; panel awaryjny przy zablokowanym `site-search.js`; brak przewijania poziomego. Audyt axe-core objął dodatkowo `/szukaj`, czyli **12 sprawdzanych tras**, bez wykrytych naruszeń użytych reguł WCAG A/AA w ostatnim przebiegu.
- `scripts/test-production-bundle.mjs` sprawdza, czy produkcyjne HTML/CSS/JS utrzymują tę degradację i komplet sześciu odnośników. Testy nie dowodzą pełnej dostępności na wszystkich platformach ani nie mierzą rzeczywistych konwersji.

## Kontakty bez JavaScript — test 320 px (15.11.2026)

- Strona główna i podstrona kontaktowa pokazują w statycznym komunikacie **telefon i e-mail obojga doradców** także wówczas, gdy skrypty są wyłączone lub formularz nie został załadowany. Ten komunikat jest zastępowany po uruchomieniu formularza; nie jest drugim formularzem i sam nie przesyła danych.
- Na jedenastu kluczowych adresach — stronie głównej, kontakcie, trzech kampaniach i sześciu stronach usługowych — test Chromium tworzy osobny kontekst `javaScriptEnabled:false` o szerokości 320 px. Czeka na pełne załadowanie CSS (`waitUntil:"load"`), a następnie sprawdza brak formularza JS, widoczność statycznej informacji, właściwy telefon i e-mail, brak poziomego przewijania.
- Osobny test produkcyjnego pakietu (`scripts/test-production-bundle.mjs`) uniemożliwia przypadkowe usunięcie któregokolwiek z czterech linków kontaktowych z dwóch głównych fallbacków.
- Potwierdzony przebieg Chromium nie wykrył błędów w tych jedenastu ścieżkach; test nie obejmuje rzeczywistego doręczania e-maili ani wszystkich przeglądarek i urządzeń.

## Awaryjne zachowanie formularzy Web3Forms (15.11.2026)

- W razie braku potwierdzenia od Web3Forms formularz **nie jest resetowany**; komunikat rozróżnia utratę połączenia (`navigator.onLine === false`) od innych błędów, bez twierdzenia, że wiadomość na pewno nie dotarła.
- Przycisk **„Skopiuj treść zgłoszenia”** jest dostępny tylko w przeglądarkach obsługujących bezpieczny schowek i dopiero po nieudanym potwierdzeniu. Generuje treść lokalnie z aktualnych pól w momencie kliknięcia. Nie zapisuje danych klienta na dysku, w cookies ani w adresie URL strony.
- Skopiowany tekst zawiera wybrane dane kontaktowe. **Schowek urządzenia może być dostępny dla innych aplikacji** — użytkownik jest o tym informowany po skopiowaniu. Zalecany jest kontakt przez prywatną pocztę lub telefon, bez wpisywania PESEL, haseł i danych medycznych.
- Link do gotowej wiadomości e-mail jest aktualizowany przy kliknięciu, aby po zmianie usługi trafił do właściwej osoby: Wojciecha lub Pauliny. Samo otwarcie linku nie wysyła wiadomości.
- GitHub Actions `scripts/test-browser-flows.mjs` przechwytuje każde testowe wywołanie `https://api.web3forms.com/submit` i symuluje odpowiedzi HTTP 503 i HTTP 200. Sprawdza zachowanie danych po błędzie, zawartość schowka, zmianę doradcy i reset dopiero po potwierdzeniu `success: true`. **Żadne testowe dane nie są wysyłane na zewnętrzny serwer.**
- To nie jest test rzeczywistej skrzynki odbiorczej ani prawdziwego doręczenia wiadomości e-mail. Potwierdzenie doręczania produkcyjnego wymaga osobnej kontroli z uprawnionym odbiorcą.

## Bezpośrednie kopiowanie e-maila doradcy (15.11.2026)

- Po wyborze usługi każdy formularz pokazuje rzeczywisty adres e-mail odpowiedniej osoby i — jeżeli przeglądarka obsługuje schowek — przycisk **„Skopiuj e-mail”**. Kopiowanie działa bez aplikacji pocztowej, bez cookie, bez zapisywania danych klienta i bez dodatkowych usług.
- Dla świadczeń wspierających i rent kopiuje adres Pauliny; dla szkód górniczych, SKD, kredytów CHF i pozostałych zgłoszeń — adres Wojciecha. Funkcja nie zmienia odbiorcy formularza Web3Forms.
- Testy na publicznej stronie, z użyciem Chromium, sprawdzają rzeczywistą zawartość schowka po czterech zmianach usługi oraz czy nowy interfejs nie pogarsza mobilnego układu i dostępności WCAG A/AA. `scripts/validate-site.js`, `scripts/test-production-bundle.mjs` i `scripts/audit-production-current.mjs` kontrolują obecność funkcji w źródle, wydaniu i produkcji.

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
