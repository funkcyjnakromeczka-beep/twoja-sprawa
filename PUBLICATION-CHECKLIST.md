# Twoja Sprawa — lista gotowości do oficjalnej publikacji

**Aktualizacja produkcyjna: 11 listopada 2026 r.** Katalog źródłowy: `v2/`. Produkcja: `https://twoja-sprawa.pages.dev`.

## Obowiązujący stan po publikacji — 11 listopada 2026
- [x] **Cloudflare Pages publikuje produkcyjny wariant z gałęzi `main`.** Weryfikacja przeglądarkowa: `/robots.txt` ma `Allow: /` i wpis dla `OAI-SearchBot`, `/sitemap.xml` istnieje, plik `/deployment-mode.txt` potwierdza wariant produkcyjny.
- [x] Działa strona główna, obie główne usługi, FAQ, globalna wyszukiwarka i lokalne pliki obu portretów — potwierdzono na serwisie.
- [x] **Właściciel potwierdził 11 listopada 2026**, że zgłoszenia formularza dochodzą bez zastrzeżeń. Jest to potwierdzenie użytkownika, a nie osobny test wykonany przez asystenta.
- [x] **Właściciel oświadczył 11 listopada 2026**, że ma uprawnienia do wykorzystania zdjęć, logotypów i publikowanych treści. Nie przedstawiać oświadczenia jako odrębnej weryfikacji dokumentów licencyjnych.
- [x] Wydanie produkcyjne zawiera kanoniczne adresy Cloudflare i 36 adresów w sitemap. Skrypt `scripts/test-production-bundle.mjs` sprawdza wydanie.
- [ ] Potwierdzenie dodania usługi i sitemap w **Google Search Console** oraz **Bing Webmaster Tools**. Dostępność robots i sitemap nie dowodzi indeksacji.
- [ ] Oddzielny przegląd formalny informacji o prywatności i aktualności przepisów. Zgoda właściciela na publikację nie zastępuje analizy prawnej/RODO.

**Bieżąca konfiguracja wdrożeniowa:** `node scripts/preview.mjs` na Cloudflare Pages z `CF_PAGES=1` i `CF_PAGES_BRANCH=main` tworzy zatwierdzony wariant produkcyjny w istniejącym katalogu `dist-preview/`. Ten sam skrypt uruchomiony lokalnie lub na innej gałęzi buduje nieindeksowalny podgląd. Nie należy ręcznie przywracać wcześniejszej konfiguracji blokującej roboty.

## Działania SEO/GEO po wdrożeniu — 11 listopada 2026
- [x] Dane strukturalne `FAQPage` budowane z 24 prawdziwych, widocznych odpowiedzi — test pakietu produkcyjnego pomyślny.
- [x] Klucz IndexNow dostępny jako publiczny plik TXT na domenie, z potwierdzoną zgodnością treści i nazwy.
- [x] 36 adresów zgłoszonych do IndexNow; **HTTP 202** oznacza odbiór i oczekującą weryfikację, nie indeksację. Dowód: https://github.com/funkcyjnakromeczka-beep/twoja-sprawa/actions/runs/42935600130
- [x] Rzeczywisty audyt publicznego Cloudflare: **10 zasobów, 36 adresów sitemap, 24 FAQ**, wszystkie krytyczne kontrole pomyślne. Raport: https://github.com/funkcyjnakromeczka-beep/twoja-sprawa/actions/runs/42936152727
- [x] Zaktualizowano `docs/STRATEGIA-SEO-GEO.md`, żeby nie mylić produkcji z dawnym podglądem `noindex`.
- [ ] Zweryfikować własność witryny w Google Search Console i przesłać `https://twoja-sprawa.pages.dev/sitemap.xml`, następnie sprawdzić raport indeksowania.
- [ ] Dodać witrynę do Bing Webmaster Tools, sprawdzić raport IndexNow i ewentualną weryfikację klucza po HTTP 202.
- [ ] Odrębnie ocenić zgodność polityki prywatności i danych dostawców; deklaracja o skutecznym działaniu formularza nie zastępuje analizy prawnej.

## Historia sprzed publikacji (od 10 listopada) — zachowana dla audytu

## 1. Ustalony i zweryfikowany stan
- Repozytorium: `funkcyjnakromeczka-beep/twoja-sprawa`, gałąź `main`.
- Zdjęcia Wojciecha Obiegło i Pauliny Chandrały odzyskano jako działające zasoby starego projektu Lovable i umieszczono na widocznej części strony głównej oraz „O nas”.
- Wersja produkcyjna przez `scripts/build.mjs` pobiera zdjęcia do `dist/assets/` i zamienia w HTML odsyłacze do starego hostingu na lokalne pliki. Build celowo kończy się błędem, jeśli zdjęć nie uda się bezpiecznie pobrać.
- Formularz Web3Forms ma istniejącą integrację z obsługą błędów. Sukces API oznacza przyjęcie przez operatora, **nie** gwarantuje otrzymania wiadomości w skrzynce.
- Testowy serwis publiczny pod adresem `twoja-sprawa.pages.dev` został sprawdzony 10 listopada 2026: `robots.txt` zawierał `Disallow: /`, a `sitemap.xml` zwracał 404. Nie jest to obecnie zaindeksowana wersja produkcyjna.

## 2. Obowiązkowe kontrole przed przełączeniem na wersję indeksowalną
- [x] Właściciel oświadczył, że dysponuje uprawnieniami do wykorzystania obu portretów, w tym portretu Pauliny (potwierdzenie użytkownika, bez kontroli dokumentów).
- [ ] Sprawdź poprawność opisów usług, status współpracy agencyjnej i zgodność użycia znaków graficznych VOTUM Network oraz VOTUM Scale Agency z udzielonymi uprawnieniami.
- [ ] Zweryfikuj aktualność informacji o WZON, ZUS, szkodach górniczych i SKD oraz brak gwarancji wyników.
- [ ] Zweryfikuj politykę prywatności (administrator, cele, podstawy prawne, odbiorcy, ewentualne transfery danych, okresy retencji) i sposób obsługi danych przez Web3Forms.
- [x] Właściciel potwierdził rzeczywiste doręczanie zgłoszeń formularza; niezależny test ponownej dostarczalności i ochrony danych pozostaje przydatny przy dalszych zmianach.
- [ ] Sprawdź telefony 796 441 345 i 500 171 531 oraz kierowanie leadów z obu głównych kampanii i chatbota.
- [ ] Obejrzyj podgląd mobilny (360/390 px), tablet (768 px) i desktop (1440 px). Sprawdź portrety, czytelność i brak poziomego przewijania.
- [ ] Potwierdź działanie wszystkich linków, wideo oraz dokumentów.
- [x] Wersja produkcyjna jest publicznie dostępna pod `twoja-sprawa.pages.dev`.

## 3. Prawidłowe ustawienia Cloudflare Pages po zatwierdzeniu
W panelu **Workers & Pages → projekt → Settings → Builds**:
- Git repository: `funkcyjnakromeczka-beep/twoja-sprawa`
- Production branch: `main`
- Root directory: katalog główny repozytorium
- Build output directory: **`dist-preview`** (aktualna konfiguracja Cloudflare, nawet gdy zawartość jest produkcyjna)
- Aktywne polecenie Cloudflare: **`node scripts/preview.mjs`**. Na gałęzi `main` i w środowisku `CF_PAGES=1` tworzy ono produkcję w `dist-preview`; lokalnie i na innych gałęziach tworzy nieindeksowalny podgląd.
- Wydanie pomocnicze do walidacji: `SITE_URL=https://twoja-sprawa.pages.dev RELEASE=1 LEGAL_APPROVED=1 CONTENT_APPROVED=1 FORM_APPROVED=1 node scripts/build.mjs` — tworzy `dist/`, nie publikuje samoistnie. Na Cloudflare wywoływany jest poprzez aktywny wrapper.

**Uwaga (aktualizacja):** publikację i wykorzystanie materiałów właściciel zaakceptował 11.11.2026. Wrapper produkcyjny na gałęzi `main` wybiera zatwierdzony build; audyty jakości nadal działają. Nie należy interpretować tych flag jako niezależnego potwierdzenia zgodności prawnej/RODO. Hasła i tokeny nie mogą trafiać do repozytorium.

## 4. Testy po skutecznym wdrożeniu
- [x] `https://twoja-sprawa.pages.dev/`: nowa sekcja zespołu ze zdjęciami.
- [x] `https://twoja-sprawa.pages.dev/assets/wojciech-obieglo.jpg` i `/assets/paulina-chandrala.jpg`: obraz JPEG jest dostępny bez Lovable.
- [x] `/robots.txt`: `Allow: /`, zezwolenie na `OAI-SearchBot`, bez `Disallow: /` dla całego serwisu.
- [x] `/sitemap.xml`: poprawny XML i adresy istniejących, indeksowalnych stron.
- [ ] `/uslugi/szkody-gornicze.html`, `/uslugi/swiadczenie-wspierajace.html` i nowe `/wiedza/...`: odpowiedzi 200, poprawne title/H1/canonical, brak `noindex`.
- [ ] Podstrony kampanii `/kampanie/...` nadal powinny mieć `noindex,follow` ze względu na duplikację treści.
- [ ] `/llms.txt`: pomocniczy plik informacyjny, bez obietnic wpływu na ranking.
- [ ] Schemat JSON-LD: `Person` dla Wojciecha i Pauliny, `Organization` dla SuccessTree, `Service` i `BreadcrumbList` na stronach usług.
- [ ] Google Search Console: zweryfikuj domenę i prześlij `/sitemap.xml`; monitoruj stan indeksacji. Dodatkowo Bing Webmaster Tools.
- [ ] Sprawdź dostępność dla `Googlebot`, `Bingbot` i `OAI-SearchBot` także przez WAF/ochronę botów Cloudflare.

## Etap IV — globalna wyszukiwarka i 500 kontroli
- [x] Utworzono wyszukiwarkę 60 istniejących materiałów (36 stron i 24 pytania FAQ).
- [x] Dodano wyszukiwanie po polsku (także bez polskich znaków), filtry, wyniki dostępne klawiaturą i komunikaty czytnika ekranu.
- [x] Zintegrowano wyniki FAQ z automatycznym rozwinięciem właściwego pytania.
- [x] Dodano link do wyszukiwarki w kluczowych miejscach nawigacji.
- [x] Sprawdzono 500 odrębnych przypadków testowych oraz testy Chromium na PC i telefonie.
- [x] Dodano kontrolę aktualności danych wyszukiwarki względem źródłowych stron i FAQ.
- [x] Wykluczono stronę wewnętrznego wyszukiwania z sitemap i indeksacji także po release.
- [ ] Po kolejnych edycjach treści utrzymuj indeks wyszukiwarki zgodny ze stronami (test świeżości).
- [ ] Przed oficjalną publikacją wykonaj audyt RODO, zgód na wizerunki i logotypy, treści ofert oraz rzeczywisty test Web3Forms.

## Seria III — baza FAQ i kontrola jakości
- [x] Nowa baza 24 pytań i odpowiedzi, z oficjalnymi odnośnikami w częściach dotyczących ZUS.
- [x] Sześć filtrów i wyszukiwanie bez polskich znaków, reset, brak cookies oraz zapisywania zapytań.
- [x] Skrót do FAQ na stronie głównej, w bibliotece wiedzy oraz w opisach szkód górniczych i świadczenia wspierającego.
- [x] Testy przeglądarkowe FAQ oraz 50 sekwencyjnych kontroli treści, prywatności, SEO i dostępności.
- [ ] Ostateczny redakcyjny przegląd wszystkich informacji prawnych i procedur przed publicznym indeksowaniem.
- [ ] Sprawdź rzeczywistą dostarczalność leadów i wymagane zatwierdzenia identyfikacji, materiałów oraz polityki prywatności.

## Seria II — plan działania i poprawne adresy SEO
- [x] Dodano generator planu pierwszych kroków dla pięciu usług, z dziewięcioma etapami szkód górniczych i WZON/ZUS.
- [x] Dodano postęp checklisty, druk PDF, reset i bezpośredni numer osoby do kontaktu; zero cookies i brak zewnętrznych żądań.
- [x] Połączono generator z przewodnikiem, dwiema głównymi usługami, biblioteką i formularzami.
- [x] Testy scenariuszy planu, formularza i 50 kolejnych kontroli zakończyły się powodzeniem.
- [x] Zweryfikowano przekierowania Cloudflare Pages z `*.html` na adresy bez rozszerzenia. Poprawiono canonical, og:url, JSON-LD i sitemap w kodzie wydania.
- [ ] Po zatwierdzonym wdrożeniu zweryfikuj końcowy `/plan-dzialania`, robots, sitemap, canonical, przekierowania oraz stan indeksacji.
- [ ] Wykonaj rzeczywisty test doręczenia Web3Forms do skrzynki Outlook (bez danych szczególnie chronionych).

## 5. Dodatkowy pakiet jakości UX i SEO
- [x] Biblioteka wiedzy (10 artykułów, filtrowanie, wyszukiwanie bez polskich znaków i reset) — test automatyczny.
- [x] Narzędzia czytania i drukowania na 10 artykułach — test automatyczny.
- [x] Przebudowana strona kontaktu ze zdjęciami i przyciskami do wstępnego wyboru usługi.
- [x] Wykluczenie strony `/404.html` z przyszłej mapy witryny.
- [x] Automatyczna kontrola flag zatwierdzenia treści, kwestii prawnych i formularza.
- [ ] Test rzeczywistego doręczenia formularza i zgodności treści polityki prywatności po wdrożeniu.
- [ ] Potwierdzenie zezwoleń na wizerunki oraz dozwolonego użycia logo podmiotów VOTUM.
- [ ] Aktywacja właściwej konfiguracji Cloudflare Pages, wydanie produkcyjne i ponowny test robotów oraz sitemap.

## 5. Istotne ograniczenia
Zielone testy GitHub Actions nie potwierdzają wdrożenia na Cloudflare. Prawidłowe `robots.txt`, sitemap i JSON-LD nie gwarantują indeksacji ani polecania strony przez AI. Treści prawne i strony wejściowe należy okresowo aktualizować, a dane kontaktowe monitorować. Kopie zdjęć w wydaniu produkcyjnym zależą od dostępności zdjęć ze starego projektu w trakcie *pierwszej budowy*; po utworzeniu release są hostowane przez Cloudflare.
