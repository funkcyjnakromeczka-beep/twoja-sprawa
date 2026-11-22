# Twoja Sprawa — diagnoza i plan metamorfozy serwisu
Stan wiedzy: 22 listopada 2026. Dokument roboczy SuccessTree, do kontynuacji z GitHub/Codex.

## Decyzja projektowa
Nie przebudowywać działającej strony od zera. Pomiary wskazują dobrą wydajność i podstawowe SEO; główne luki to indeksowanie stron usług, brak pełnej analityki pozyskanych leadów i słaba integracja kanałów organicznych. Zmiany prowadzić etapami z odtwarzalnym testem przed/po i zachowaniem dostępu bez JavaScript.

## Kontekst i granice
- Domena produkcyjna: https://twoja-sprawa.pages.dev/.
- Repozytorium: funkcyjnakromeczka-beep/twoja-sprawa; kod źródłowy w `v2/`, build `scripts/build.mjs`, testy w GitHub Actions, Cloudflare Pages.
- Marki: Twoja Sprawa / SuccessTree; współpraca agencyjna z Grupą VOTUM. Serwis nie jest oficjalną witryną spółki ani kancelarią prawną.
- Priorytety: (1) szkody górnicze Lubin/Polkowice i okolice, (2) świadczenie wspierające Polska, następnie renty powypadkowe, SKD, kredyty frankowe, służebność przesyłu.
- Kontakt: Wojciech — szkody górnicze/SKD/pozostałe usługi; Paulina — świadczenie wspierające/renty. Nie zmieniać potwierdzonych numerów/adresów bez sprawdzenia.
- Zachować istniejące zdjęcia osób, identyfikację VOTUM, czytelny styl premium i dostępne warianty druku. Grafiki dekoracyjne nie mogą udawać dowodów faktycznych szkód klientów.
- Zakaz gwarantowania odszkodowania, wygranej, świadczenia, bezpłatnej reprezentacji czy wielkości wypłaty bez zweryfikowanej oferty.
- Publikacje prawne/wspierające wymagają źródeł urzędowych i jasnego rozdzielenia informacji, analizy sprawy i decyzji organu.
- Formularze nie powinny zbierać PESEL ani dokumentów medycznych w pierwszym kontakcie; nie ujawniać treści leadów w analityce.
- Prace na stronie nie upoważniają do uruchamiania płatnych kampanii, abonamentów, bulk mailingów lub automatycznej publikacji w social media.

## Evidence baseline (nie mieszać populacji i okresów)

| Źródło | Zakres | Odczyt | Interpretacja / ograniczenie |
| --- | --- | --- | --- |
| Grow My Website | Strona główna i lokalna Lubin, 22.11.2026 | 100/100 każda, podstawowe kontrole SEO | Nie jest pomiarem pozycji ani wszystkich Core Web Vitals |
| OpenSEO, audyt `2c69d367-17a6-4a1a-b9fe-9824fc910b30` | 50 podstron, Lighthouse 10 × 2 urządzenia | Główna mobile: performance 98, SEO 92, accessibility 100; Lubin mobile: 99/100/100 | Próbka laboratoryjna, nie dane terenowe wszystkich użytkowników |
| OpenSEO, kampania świadczenia desktop, przed naprawą | 22.11.2026 | CLS 0.2844035, performance 86, accessibility 99 | Istotne przesuwanie układu, część spowodowana późnym zbudowaniem formularza |
| OpenSEO, audyt `6ef9d85c-b0cb-498f-baba-cdaaac9ed17f`, po naprawie | 22.11.2026 | Kampania desktop: CLS 0.046721227, performance 100, accessibility 100 | Spadek CLS ok. 84% między dwoma pomiarami, bez obietnicy utrzymania wyniku |
| Search Console i analityka kont | Dane prywatne | Nie publikujemy niepublicznych odczytów kont marketingowych w repozytorium | Wnioski i dokładne wyniki przekazano właścicielowi w rozmowie; stan indeksacji i pomiar konwersji badać osobno |
| Facebook, Instagram, Wizytówka Google | Dane prywatne | W repozytorium zapisujemy wyłącznie zadania integracyjne i metodologię | Odczyty prowadzić w podłączonym narzędziu, bez udostępniania statystyk kont |

Ważne: publiczne repozytorium jest przeznaczone dla kodu i planu technicznego. Szczegółowe wyniki z podłączonych kont (w tym profile, zasięgi, kliknięcia i stan integracji) pozostają w prywatnej analizie rozmowy.

## Co już wprowadzono 22.11.2026
- `v2/contact.js`: każdy generowany link do listy kontrolnej otrzymuje początkowy poprawny `href`, potem jest podmieniany na poradnik wybranej usługi.
- `v2/contact.js`: nagłówek formularza kampanii jest `h2`, nie `h3` po `h1`, bez zmiany wizualnej hierarchii na innych podstronach.
- `v2/styles.css`, `v2/premium-v2.css`: dostosowano style dla nagłówka formularza.
- `v2/kampanie/*.html`: formularz budowany w końcowym skrypcie bez `defer`, przed pierwszym renderem; bez zmian w sposobie wysyłki i konfiguracji Web3Forms.
- `scripts/test-production-bundle.mjs`: kontrola domyślnego `href`, nagłówków i synchronicznego budowania formularzy. Build zmienia źródłowe `/v2/plan-dzialania.html` na `/plan-dzialania`, a test uwzględnia obie formy.
- CI `45070933476` kandydat produkcyjny: sukces; `45070933459` test przeglądarkowy: sukces i potwierdzenie wdrożenia commita `220472a856779aab40b4d74f0d0f5e09bfa06ba0`.

## Wynik ponownego audytu po wdrożeniu

Powtórny audyt Lighthouse po release (audit `51d3deab-9e0e-42a6-b6a3-b04996aec560`) wykazał na stronie głównej i kontakcie 100/100 dla wydajności, SEO i automatycznej kontroli dostępności na komputerze i telefonie. Nie jest to gwarancja stabilnego wyniku dla wszystkich użytkowników ani potwierdzenie indeksacji w Google.

## P0 — odnajdywalność w Google

**Kroki:**
1. W Google Search Console wykonać Inspekcja URL dla `/uslugi/szkody-gornicze`, `/uslugi/swiadczenie-wspierajace`, `/lokalnie/szkody-gornicze-lubin`, `/lokalnie/szkody-gornicze-polkowice`; sprawdzić wyniki testu na żywo, kanoniczny URL i ewentualnie zgłosić do indeksacji. Connector `inspect_urls` sprawdza **istniejący** stan, ale nie zleca indeksacji.
2. Sprawdzić sitemap, poprawną indeksowalność tych czterech stron, widoczny tekst i linki bez JS; unikać tworzenia 20 podobnych podstron dla sąsiadujących wsi bez rzeczywistej wartości.
3. Zbadać nietypowy zakodowany adres raportowany w GSC: sprawdzić jego pochodzenie i nie wyciągać wniosków o rankingu całej witryny na podstawie pojedynczych zdarzeń.
4. Utrzymywać odnośniki z wizytówki SuccessTree, lokalnych publikacji i realnych partnerów; nie kupować nienaturalnych linków i nie generować fałszywych opinii.

**Odbiór:** podane cztery URL mają powtarzalnie potwierdzoną indeksowalność techniczną i znany stan GSC; liczba zaindeksowanych stron i wyświetleń raportowana tygodniowo z datą. Samo zgłoszenie nie gwarantuje indeksacji.

## P0 — analityka kontaktów i zgodność z prywatnością

**Projekt metryk:**
- Ruch: wejścia na landing / główną / lokalne / usługowe (dopiero gdy GA4 jest poprawnie podłączone i działa zgodnie z obowiązkami informacyjnymi).
- Mikrokonwersje: kliknięcia `tel:`, kliknięcia `mailto:`, wybór tematu, rozpoczęcie formularza. **Nie są** to wysłane zgłoszenia.
- Lead: tylko potwierdzone przyjęcie formularza (np. `generate_lead` wysyłane z JS po otrzymaniu rzeczywistego sukcesu; nie po kliknięciu Wyślij i nie po walidacji przeglądarki).
- Jakość: ręczne, zagregowane statusy leadów według tematu i kanału; nigdy imię, telefon, PESEL, treść sytuacji, informacje o zdrowiu.
- Identyfikacja źródła: dane UTM i dozwolone źródła odsyłające; nie zakładać, że odesłanie z Google = Google Maps ani że facebookowy klik = lead.
- Zgodność: ustalić podstawę i obowiązki informacyjne, potrzebę zgody na cookies przed dołożeniem skryptów śledzących. Istniejąca strona nie używa takich tagów automatycznie.

**Odbiór:** kontrolowane, testowe przejścia powodują jedno zdarzenie leada po potwierdzonym sukcesie, zero na błędzie, nie ujawniają danych; wyświetlają się w narzędziu analitycznym dopiero po poprawnym wdrożeniu.

## P0 — organiczny lejek Facebook/Instagram/Wizytówka Google

1. Instagram: sprawdzić i w razie potrzeby uzupełnić link do `https://twoja-sprawa.pages.dev/` lub odpowiedniej strony usługi; zatwierdzić zmianę na właściwym profilu.
2. Facebook szkody górnicze: uprościć CTA i pinned post, np. `Masz pęknięcia domu w Lubinie lub Polkowicach? Zobacz, co warto sfotografować` prowadzące do lokalnego poradnika, z wyraźnym telefonem Wojciecha.
3. Świadczenia/renty: kierować do Pauliny, nie na numer Wojciecha; oznaczać reklamowy/agencyjny charakter komunikacji, nie obiecywać przyznania świadczenia.
4. Google Business: potwierdzić kategorię działalności, obszar obsługi, godziny, aktualny URL, spójność nazwy i zdjęć, wyłącznie prawdziwe opinie klientów.
5. Z każdego kanału korzystać z osobnego bezpiecznego UTM (istnieje generator linków `/narzedzia/linki-kampanii`); nie nadpisywać ręcznie źródeł i nie wykorzystywać personalnych danych z pochodzenia kliknięcia.

**Odbiór:** realnie widoczne i działające linki z każdego profilu oraz osobny pomiar kliknięć/zgłoszeń; nie wnioskować o konwersji tylko na podstawie zasięgu.

## P1 — UX i design premium, bez zmiany tożsamości

**Obecny stan:** rozbudowana strona główna ma ok. 158 linków, 47 podstron, bogatą warstwę wizualną i dwie usługi priorytetowe. Potencjalny koszt kognitywny rośnie przy nadmiarze równorzędnych wejść.

**Proponowane ulepszenia:**
- Ustabilizować pierwszy ekran: jeden główny nagłówek, dwa wyraźne wejścia `Pęknięcia i szkody` / `Świadczenie wspierające`, dyskretne dodatkowe usługi pod nimi; nie usuwać ważnych linków SEO, tylko zmienić ich ekspozycję.
- Zachować portrety Wojciecha i Pauliny oraz rozdział odpowiedzialności; dodać krótką, czytelną informację o agencji VOTUM bez sugerowania świadczenia pomocy prawnej przez osobę bez uprawnień.
- W aplikacji mobilnej minimalizować niepotrzebne warstwy sticky, chatbot i formularz nie mogą zachodzić na siebie przy klawiaturze ekranowej.
- Ujednolicić przestrzenie, skalę typografii, kontrast na obrazach i wysokość przycisków; dalej używać spójnego granatu, jasnych sekcji, złota/czerwieni jako akcentu, ale nie nadużywać gradientów.
- Utrzymać wszystkie 6 graficznych broszur i QR; każda broszura prowadzi do właściwego, działającego poradnika i kontaktu.

**Odbiór:** na szerokościach 320, 390, 768, 1024 i 1440 px brak przewijania poziomego, zasłoniętych CTA, mylących numerów, nieosiągalnych kontrolek klawiaturą; bez JS pozostaje kontakt i nawigacja. Screenshoty mobilne i desktopowe porównywać przed/po.

## P1 — media i performance

- Najbardziej opłacalne wydajnościowo: hero `og-twoja-sprawa-metallic-v1.jpg` (Lighthouse raportuje około 146 KiB możliwej oszczędności mobilnie), logotypy pobierane z VOTUM i niewykorzystane reguły `home-bundle.css` (~33 KiB).
- Zbadać wariant hero WebP/AVIF w rozmiarach responsywnych, pod warunkiem zachowania poprawnego pliku Open Graph dla Facebook i obecnego wyglądu grafiki.
- Nie zmieniać zewnętrznych logotypów VOTUM na nieautoryzowane wersje; optymalizować bez utraty znaku i czytelności.
- Przed masowym przerabianiem CSS porównać rzeczywiste `LCP`, `CLS`, `INP` w field data, jeśli zbierane, oraz laboratoryjne Lighthouse; nie „oszczędzać” kilku KiB kosztem niestabilnego wyglądu.

**Odbiór:** nowa grafika ma tę samą treść, kontrast i wyraźne logo; brak 404 plików, CLS pogorszenia czy blokowania crawlowania.

## P1 — transparentność informacji prawnych i świadczeń

- Pod każdą kluczową usługą: `kto prowadzi kontakt`, `jaki jest etap`, `co przygotować`, `czego nie przesyłać przez formularz`, `jakie koszty i kto je potwierdza`, bez domniemanych gwarancji.
- Źródła pierwotne: ZUS, gov.pl, ELI/Dziennik Ustaw, PGI MIDAS; datować weryfikację, rozróżniać tekst ustawy i interpretację.
- Świadczenie wspierające: jasno rozdzielić WZON (poziom potrzeby wsparcia) i ZUS (wypłata) oraz dostępność bezpłatnej urzędowej pomocy.
- Szkody górnicze: odróżnić pęknięcia od prawnie ustalonego związku przyczynowego; treść ugód i odmów wymaga indywidualnej oceny.
- Nie tworzyć syntetycznych testimoniali, fikcyjnych historii wygranych, fikcyjnych kwalifikacji „ekspertów”, domniemanych wyroków i kwot.
- Jeśli pojawia się prawdziwe studium przypadku: wyraźny zakres zgody, anonimizacja, data, rozróżnienie ugody i procesu, bez utożsamiania historii z prawdopodobnym wynikiem nowej sprawy.

**Odbiór:** redakcyjny checklist źródło/data/właściwa osoba/uwagi o ryzyku; nie publikować gdy źródło jest stare lub sprzeczne.

## P2 — rozszerzenia, po ustaleniu bazy i pomiaru

- Filmy 30–45 s o fotografiach rys, ugodzie z kopalnią i etapach WZON → ZUS, z wyraźnie oznaczoną prawdziwą osobą, naturalnym lektorem i napisami. Generowanie przez narzędzie AI tylko po sprawdzeniu licencji i kosztów; wizerunki i głosy nie mogą naśladować prawdziwych ludzi bez ich zgody.
- Interaktywny wybór ścieżki tylko jeśli faktycznie skraca drogę; dziś serwis ma `service-navigator.js` i `chat-assistant.js`. Nie kopiować tej samej logiki trzykrotnie pod innymi nazwami.
- Moduł „co przygotować do oględzin” odwołujący do istniejących broszur, nie nowa baza danych klientów.
- Proste testy A/B nagłówków i układu CTA dopiero gdy ruch i zdarzenia będą wystarczające; wcześniej decyzje projektowe pozostają hipotezami.
- Artykuły lokalne wyłącznie przy rzeczywistych, zweryfikowanych tematach i jakości ważniejszej od masowej produkcji treści.

## Etapy odbioru kolejnych commitów

1. Odczytaj świeży HEAD `main` i odpowiednie pliki; nie opieraj się na nieaktualnym SHA.
2. Opisz hipotezę i konkretne kryterium `przed/po` dla jednego ograniczonego wdrożenia.
3. Zmieniaj źródła w `v2/` + test(y) w `scripts/` w jednym spójnym commicie, a nie ręcznie wygenerowane `dist/`.
4. Potwierdź sukces workflow candidate, testy UI, formularze na mocku, mobile, dostępność i zgodność SEO.
5. Potwierdź realny release SHA w teście Cloudflare — zielony build nie zawsze oznacza wdrożoną stronę.
6. W raporcie rozdziel: faktycznie opublikowane, tylko zbadane, proponowane, wymagające zewnętrznego zatwierdzenia/zgody.

## Narzędzia — wynik tej sesji

- GitHub: odczyt źródeł, poprawki kodu, CI i potwierdzony release.
- OpenSEO / Search Console: testy indeksowania i Lighthouse before/after; nie publikować w repozytorium prywatnych wyników konta.
- Grow My Website: dwie podstawowe kontrole 100/100.
- Windsor.ai: analiza zagregowana kanałów; raportowanie niepublicznych liczb wyłącznie właścicielowi.
- Exa: porównanie konkurencji i oficjalnych zasad Google; lokalne oferty konkurencyjne weryfikować aktualnie przed wykorzystaniem.
- Canva: odnaleziony projekt strony, ale brak możliwej do oceny treści w wyniku odczytu; nie publikowano nowej grafiki.
- Metricool: przed planowaniem automatyzacji zweryfikować dostępność połączenia i zgodę właściciela.
- Browser/Opera: odczyt kart nie był dostępny w tej sesji; produkcję weryfikowano w GitHub CI.
- Pozostałe wtyczki (ads, wideo, głosy, narzędzia do slajdów, PDF, kalendarz) nie mają uzasadnionej operacji do wykonania bez ustalonego materiału, zgód i kosztów; nie uruchamiać ich „dla liczby użytych pluginów”.

## Linki źródłowe
- Wykonane testy: https://github.com/funkcyjnakromeczka-beep/twoja-sprawa/actions/runs/45070933476
- Testy strony produkcyjnej: https://github.com/funkcyjnakromeczka-beep/twoja-sprawa/actions/runs/45070933459
- Google Search: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- GA4 recommended `generate_lead` event: https://developers.google.com/analytics/devguides/collection/ga4/reference/events
- Google Search Console: https://search.google.com/search-console/
- ZUS: https://www.zus.pl/swiadczenia/inne-swiadczenia-z-zus/wiadczenie-wspierajace-dla-osob-z-niepelnosprawnoscia
- ELI: https://eli.gov.pl/
