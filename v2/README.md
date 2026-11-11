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
- Wyszukiwarka całej witryny: `v2/szukaj.html`, `v2/site-search.js`, `v2/search-core.js`, `v2/site-search.css` oraz trzy statyczne indeksy `v2/search-pages-1.js`, `v2/search-pages-2.js`, `v2/search-faq-data.js` (36 stron + 24 FAQ).
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
node scripts/test-500-continuations.mjs
node scripts/test-search-index-freshness.mjs
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

## Etap IV — 500 testów i wyszukiwarka globalna (11 listopada 2026)
- Wyszukiwarka `/szukaj` obejmuje 60 lokalnych materiałów, bez zewnętrznego API, cookies ani zapisu zapytań. Wyniki pytaniowe prowadzą do rozwiniętej odpowiedzi FAQ.
- Indeks źródłowy jest statyczny. **Po każdej zmianie tytułu, opisu strony, pytania lub odpowiedzi FAQ należy zaktualizować odpowiedni plik `search-pages-*.js` lub `search-faq-data.js`**. Test `scripts/test-search-index-freshness.mjs` wykrywa rozbieżność i nie dopuszcza pomyślnego audytu.
- Wyniki audytu 500 przypadków i dokładny ich rejestr: `docs/500-KONTYNUACJI-ETAP-IV.md`.
- `/szukaj` nie jest landingiem SEO. `scripts/seo-policy.mjs` wyklucza ją z indeksacji i mapy witryny także w wydaniu produkcyjnym; oficjalne publikowanie innych stron wymaga osobnych zatwierdzeń.

## Ulepszenia konwersji i SEO — 11 listopada 2026
- `v2/mobile-service-cta.js` + `v2/mobile-service-cta.css`: mobilny pasek połączenia i formularza tylko dla dwóch głównych usług, bez przechowywania danych. Zostaje ukryty, gdy formularz pojawi się w widoku; pozycja chatbota jest przesunięta ponad pasek.
- `v2/contact.js`: dopóki odwiedzający nie wybierze usługi, formularz nie pokazuje żadnego konsultanta jako domyślnego. Po wybraniu tematu aktualizuje nazwę, opis i numer do kontaktu.
- Testy: `scripts/test-mobile-service-cta.mjs` (mock DOM) i `scripts/test-contact-client.mjs`; Chromium `scripts/screenshot-preview.mjs` sprawdza położenie przycisków oraz kliknięcie bez nakładania elementów.
- `scripts/indexnow-routes.mjs` określa rzeczywiste indeksowalne ścieżki na podstawie aktualnego kodu; `scripts/submit-indexnow.mjs` nie zgłasza przestarzałej sitemap. `.github/workflows/indexnow.yml` automatycznie reaguje na zmiany treści HTML. Zgłoszenie IndexNow nie oznacza, że Bing czy Google na pewno pokaże adresy.
- Test zasad zgłaszania: `scripts/test-indexnow-routes.mjs`. Pozostają obowiązujące zgody właściciela na materiały i brak gwarancji uzyskania roszczeń/świadczeń.

## Aktualizacja — 11 listopada 2026: sześć usług, kontrast, logotypy i wyniki

- Strona https://twoja-sprawa.pages.dev/ zawiera **6 głównych usług**, w tym nową pomoc frankowiczom (aktywne i spłacone kredyty CHF) i link do checklisty.
- Tytuły Sankcji Kredytu Darmowego (SKD) na podstronie, w karcie głównej i menu zostały rozwinięte.
- Logo Votum Wsparcie jest wyróżnione na stronie świadczenia i w kampanii świadczenia wspierającego; partnerzy Votum Network i Votum Scale Agency mają większe oznaczenia na wspólnym pasku.
- Osobny arkusz `v2/visual-contrast.css` poprawia ciemną czcionkę na jasnych formularzach, kartach i interaktywnych checklistach.
- Produkcyjny audyt: **16 zasobów, 38 adresów w sitemap, 24 odpowiedzi FAQ**, dostępność nowej usługi i logo. https://github.com/funkcyjnakromeczka-beep/twoja-sprawa/actions/runs/42941776579
- Testy Chromium na 26 trasach potwierdziły m.in. kontrast tekstu 10,1:1 do 12,58:1 w wybranych elementach, brak poziomego przewijania i ładowanie logo Votum Wsparcie.
- Pomiar syntetyczny Chromium, 5 tras × 2 ekrany: mediana FCP telefon 364 ms, desktop 168 ms; mediana zaobserwowanego LCP telefon 404 ms, desktop 188 ms. To nie są dane rzeczywistych użytkowników. https://github.com/funkcyjnakromeczka-beep/twoja-sprawa/actions/runs/42941074955
- Zgłoszono 38 aktualnych adresów przez IndexNow, przyjęcie HTTP 200; nie gwarantuje indeksacji.
- Do pomiaru faktycznej liczby odwiedzin i współczynnika konwersji należy uruchomić Cloudflare Web Analytics i uzyskać dostęp do danych z formularza/Search Console.
- Własna domena nie została zakupiona ani przełączona. Plan migracji: `docs/DOMENA-WLASNA-I-MIGRACJA.md`.


## Etap V — uproszczona droga od usługi do kontaktu (11.11.2026)

- Strona główna prowadzi od dwóch głównych projektów bezpośrednio do sześciu usług, przed rozbudowaną sekcją zespołu.
- Nowy `v2/home-flow.css`: 2+4 karty na desktopie, dwie kolumny na tablecie, czytelne i niższe kafle pomocnicze na telefonie.
- Przewodnik `#dobierz-pomoc` rozwija się po kliknięciu odnośnika i po wejściu na adres z kotwicą.
- `Service` JSON-LD rozróżnia kredyty frankowe CHF od Sankcji Kredytu Darmowego (SKD).
- **1000/1000 testów sekwencyjnych** (16 kontroli dla każdego z 62 materiałów oraz osiem ogólnych) w automatycznym CI.
- Chromium: 26 testowanych tras oraz nowa ścieżka wyboru sprawy i siatka 2+4; raport: https://github.com/funkcyjnakromeczka-beep/twoja-sprawa/actions/runs/42943695013
- Audyt produkcyjny Cloudflare: 18 zasobów, 38 adresów sitemap, 24 FAQ; raport: https://github.com/funkcyjnakromeczka-beep/twoja-sprawa/actions/runs/42943820709
- Pomiar realnej liczby odwiedzających i leadów nadal wymaga podłączonych danych analitycznych.
- Automatyzacja sześciu kolejnych godzin nie została utworzona z powodu limitu 5/5 aktywnych zadań w ChatGPT; wcześniejsze zadania pozostawiono bez zmian.

Dokładny raport: `docs/ETAP-V-UPROSZCZENIE-I-1000-KONTROLI.md`.

## Etap VII — metadane udostępniania i bezpłatne polecenia (11.11.2026)
- `scripts/build.mjs` dodaje do każdej wydanej strony indywidualne `og:title`, `og:description`, `twitter:title` i `twitter:description`, zgodne z jej własnym tytułem i opisem. Wersja źródłowa `v2/` nadal ma `noindex`; publikacja odbywa się tylko przez kontrolowany build.
- Podgląd społecznościowy korzysta z lokalnych zdjęć `/assets/wojciech-obieglo.jpg` i `/assets/paulina-chandrala.jpg`; dla świadczenia wspierającego i rent wybrano zdjęcie Pauliny, w innych przypadkach Wojciecha. Są to istniejące fotografie kontaktowe, nie nowe autorskie grafiki panoramiczne.
- Dodatkowo ustawiono `og:image`, `og:image:secure_url`, `og:image:type`, `og:image:alt`, `twitter:image` i `twitter:image:alt`.
- Stopka `v2/index.html` zawiera dyskretną funkcję „Udostępnij stronę”, obsługiwaną przez istniejący `v2/share-page.js`; bez skryptów śledzących, dodatkowych zgód i usług płatnych.
- Na telefonie strona główna zachowuje trzy szybkie działania: telefony Wojciecha i Pauliny oraz formularz; pasek chowa się przy aktywnym formularzu albo otwartym przewodniku.
- `scripts/test-production-bundle.mjs` kontroluje zgodność podglądów wybranych usług i obecność funkcji udostępniania w pakiecie wydania. `scripts/test-home-clarity.mjs` sprawdza mobilny pasek.
- Zielone audyty: [test wydania](https://github.com/funkcyjnakromeczka-beep/twoja-sprawa/actions/runs/42954115941), [audyt kodu](https://github.com/funkcyjnakromeczka-beep/twoja-sprawa/actions/runs/42954158657).
- **Ograniczenie:** samo zapisanie kodu i ukończenie CI nie oznaczają automatycznie nowej publikacji na Cloudflare ani potwierdzenia wyglądu podglądu w Facebooku, Instagramie czy aplikacjach wiadomości. Dostępne źródła nie potwierdziły nowego wdrożenia. Zmiany są gotowe w gałęzi `main`.

## Etap VIII — kwalifikacja zgłoszeń szkód górniczych (11.11.2026)
- Formularz `v2/contact.js` pokazuje wyłącznie dla usługi „Szkody górnicze” **opcjonalne** pole `Co zostało uszkodzone?`: ściany/elewacja, wnętrza, kostka/ogrodzenie, drzwi/okna lub kilka miejsc/inne. Nie oznacza to stwierdzenia przyczyny uszkodzeń.
- Zgłoszenie Web3Forms zawiera pole `damage_area` tylko dla szkód górniczych, jeśli wybrano kategorię. Fallback e-mail zawiera to samo oznaczenie, jeśli dotyczy. Przy zmianie usługi wybór jest czyszczony; nie przesyłamy zdjęć ani załączników.
- Na `v2/kampanie/szkody-gornicze.html` trzy przyciski w kartach uszkodzeń prowadzą do `#formularz` i ustawiają bezpieczną wartość pola bez automatycznego wysłania zgłoszenia i bez utraty parametrów UTM.
- Styl wybranego pola: `v2/visual-contrast.css`; przycisków: `v2/lead-persona.css`.
- Testy jednostkowe `scripts/test-contact-client.mjs` sprawdzają przełączanie usług, niedozwolone dane wejściowe, zawartość zgłoszeń i funkcje 3 skrótów.
- Kontrola w prawdziwej przeglądarce: `scripts/screenshot-preview.mjs` sprawdza kategorię kostki brukowej, zaznaczenie w formularzu i kotwicę. Nie wysyła rzeczywistych zgłoszeń.
- Audyt HTTP działającej publikacji: [GitHub Actions — wynik produkcji](https://github.com/funkcyjnakromeczka-beep/twoja-sprawa/actions/runs/43051431068).
- **Ograniczenia:** zielony audyt produkcyjny potwierdza obecność odpowiedniego kodu i elementów HTML/CSS, ale nie potwierdza otrzymania wiadomości e-mail przez adresata ani wzrostu konwersji. Odbiór zgłoszeń wymaga osobnego testu za zgodą właściciela.

## Etap IX — jednoklikowy wybór etapu WZON i stabilniejszy test wizualny (11.11.2026)

- Na `v2/kampanie/swiadczenie-wspierajace.html` trzy karty mają odnośniki „Wybieram ten etap”: pierwszy wniosek, oczekiwanie na decyzję i otrzymana decyzja. Link prowadzi do `#formularz` nawet bez JavaScript.
- `v2/contact.js` przepisuje tylko zatwierdzone kody (`wniosek`, `oczekiwanie`, `decyzja`) na istniejące etapy formularza. Nie pobiera z odnośników tekstu dowolnego ani danych dotyczących zdrowia; używa sprawdzenia `hasOwnProperty`, aby odrzucić również nazwy właściwości prototypu.
- Wybór etapu nie wysyła zgłoszenia. Telefon/e-mail i zgoda pozostają do wypełnienia przez użytkownika. Po zatwierdzeniu formularz może przekazać wybraną fazę jako `case_stage`, tak jak wcześniej.
- `v2/lead-persona.css` zapewnia zielone przyciski o minimalnej wysokości 44 px i kontrastowym tekście. Test klienta w `scripts/test-contact-client.mjs` kontroluje mapowanie, odmowę nieznanych kodów i poprawną treść *symulowanego* zgłoszenia.
- `scripts/screenshot-preview.mjs` rozszerzono o test trzeciej karty na ekranie 390 px, przejścia do `#formularz` i wyboru „Mam decyzję WZON” — bez wysyłania kontaktu. `scripts/audit-production-live.mjs` sprawdza publikację odpowiednich elementów.
- Historia nieudanego testu screenów: GitHub runner `ubuntu-latest` próbował instalować biblioteki przez serwery `archive.ubuntu.com` / `security.ubuntu.com`; w logach występował `Temporary failure resolving`. W `.github/workflows/screenshots.yml` wskazano `ubuntu-24.04`, a pobieranie bibliotek systemowych przez `--with-deps` zastąpiono samą instalacją headless Chromium (`--only-shell`); dodano `concurrency` z anulowaniem starszych zrzutów, żeby nie zużywać niepotrzebnie minut testowych. Dalsze testy Chromium później zakończyły się powodzeniem, potwierdzając dostępność testowego środowiska.
- **Bezpieczeństwo danych:** brak nowych formularzy, przesyłania dokumentacji medycznej, serwerów pośrednich i płatnych usług. Nie zmieniano konfiguracji dostawcy Web3Forms.

## Etap X — niezawodność zgłoszeń i testy produkcyjne (11.11.2026)
- Formularz `v2/contact.js` blokuje kolejne zdarzenia `submit` podczas wysyłania przez Web3Forms (`sending` + wyłączenie przycisku), również gdy użytkownik naciska Enter. Po zakończeniu wywołania `finally` zwalnia blokadę. Nie ma zapisu zgłoszeń ani ich retransmisji w tle.
- Imię musi zawierać co najmniej jeden znak inny niż biały znak; przy pustej wartości uruchamia się natywna walidacja przeglądarki i fokus pola.
- Po pomyślnej odpowiedzi operatora formularz jest resetowany, a dodatkowe błędy walidacji imienia usuwane. Przy błędzie wysyłki obecny mechanizm pozostawia dane i proponuje kontakt telefoniczny lub przygotowaną wiadomość e-mail.
- `scripts/test-contact-client.mjs` sprawdza, że puste imię nie inicjuje żądania, druga wysyłka w toku jest ignorowana, przycisk jest zablokowany podczas żądania i po jego zakończeniu dopuszcza nowe zgłoszenie. Testy używają atrap API, bez przekazywania danych klienta.
- `scripts/audit-production-live.mjs` sprawdza opublikowaną na Cloudflare obecność tych zabezpieczeń, ale nie wysyła formularzy ani nie sprawdza dostarczenia maila.
- **Zakres ochrony:** blokada zapobiega podwójnemu rozpoczęciu równoległego żądania w tej samej karcie. Nie daje gwarancji deduplikacji żądań po błędzie, odświeżeniu strony ani na poziomie serwera. Wysyłkę rzeczywistą należy przetestować osobno.

## Etap XI — jakość danych kontaktowych (11.11.2026)

- Formularz `v2/contact.js` sprawdza liczbę cyfr w numerze telefonu (7–15), a nie tylko długość całego ciągu z odstępami i myślnikami. Odrzuca też przypadkowe znaki, źle umieszczone plusy i zbyt długie ciągi. Obsługuje zapis z prefiksem międzynarodowym, bez zakładania numeru polskiego.
- `checkContact()` weryfikuje istnienie co najmniej jednego kontaktu i respektuje wybór „Telefon” lub „E-mail”. Klient może pozostawić sam prawidłowy e-mail, bez podawania numeru telefonu. Gdy podano numer błędny, formularz prosi o poprawkę przed wysłaniem.
- Podpowiedź o 7–15 cyfrach jest powiązana z polem telefonu za pomocą `aria-describedby`, dzięki czemu mogą ją odczytać narzędzia wspomagające. Nie dodano kolejnego pola ani obowiązku podawania informacji wrażliwych.
- `scripts/test-contact-client.mjs`: 11 scenariuszy numerów polskich/zagranicznych, znaków niepoprawnych, błędnego wyboru sposobu kontaktu oraz zgłoszeń wyłącznie e-mailowych, plus test dostępności opisu. Testy mają podstawione API i **nie wysyłają prawdziwych leadów**.
- `scripts/audit-production-live.mjs` weryfikuje obecność opublikowanej walidacji na Cloudflare. To kontrola kodu zwróconego przez serwer, nie dowód dostarczenia wiadomości do skrzynki ani pomiar liczby zapytań.

## Etap XII — szybka droga z głównej strony do zgłoszenia (11.11.2026)
- Przy istniejącym formularzu na `v2/index.html` są dwa kompaktowe wybory: „Szkody górnicze” oraz „Świadczenie wspierające”. To **skróty do jednego formularza**, nie dwa osobne formularze. Bez JavaScript linki prowadzą do sekcji `#kontakt`.
- `v2/contact.js` po wyborze ustawia właściwą usługę i aktualizuje dotychczasowe elementy (osobę kontaktową, odnośnik do poradnika, etap sprawy i opcjonalną kategorię szkody); nie wysyła zgłoszenia. Wybór innej usługi z listy usuwa podświetlenie skrótów; po poprawnej wysyłce reset formularza przywraca właściwy stan wyboru.
- `v2/home-flow.css` odpowiada za małe, wyraźne przyciski ze stanem wyboru, wygodny dotyk na telefonie oraz margines pod przyklejonym paskiem logotypów. Przejście do formularza jest natychmiastowe (nieanimowane), więc nie powoduje konfliktów podczas szybkiej zmiany wyboru i jest odpowiednie także przy ograniczeniu ruchu.
- `scripts/test-home-clarity.mjs` pilnuje dokładnie dwóch skrótów i jednej wersji formularza. `scripts/test-contact-client.mjs` sprawdza mapowanie usług, atrybuty wizualne, stan dostępnego komunikatu, zmianę usługi, blokadę nieznanych kodów i reset po pomyślnym teście z atrapą operatora.
- `scripts/screenshot-preview.mjs` zawiera test zachowania w Chromium na ekranie 390 px i zapisuje podgląd `screenshots/home-dwa-wybory-formularz-telefon.png`. Weryfikacja nie wysyła leadów.
- `scripts/audit-production-live.mjs` sprawdza odpowiednie elementy i logikę na publicznej wersji Cloudflare (same odczyty, bez wysyłania zgłoszeń).
- **Ograniczenie:** sukces testów i publikacji nie jest pomiarem konwersji, dostarczenia wiadomości Web3Forms ani widoczności w Google. Nie uruchomiono płatnych usług.

## Etap XIII — usunięcie wyścigu animacji i stabilizacja formularza (11.11.2026)
- Analiza niezaliczonego testu `43063586107`: po jednym wyborze na głównej stronie drugi szybki wybór nie zawsze ustawiał usługę w realnym Chromium. Testy JavaScript bez przeglądarki przechodziły, więc konieczna była kontrola interakcji i przewijania.
- Główny dokument używa `html{scroll-behavior:smooth}`, który może utrudniać szybkie powtórne kliknięcia podczas przewijania. `v2/contact.js` przewija teraz formularz z `behavior:"instant"`, bez kolizji z globalną animacją.
- `v2/home-flow.css` nadaje `scroll-margin-top` rzeczywistemu elementowi docelowemu `[data-contact-form]` (oraz panelowi) poniżej przyklejonego paska logotypów.
- `scripts/screenshot-preview.mjs` zachowuje pełny test dwóch kolejnych kliknięć na ekranie 390 px i w razie przyszłej regresji raportuje stan widocznego formularza, zaznaczeń, aktywnego pola i przewinięcia.
- **Potwierdzenie:** [test Chromium: 28 widoków i scenariuszy, w tym HOME_SHORTCUT_UI_OK](https://github.com/funkcyjnakromeczka-beep/twoja-sprawa/actions/runs/43064424017). W ramach testu nie wysyłano leadów; sprawdzono też odczyt zdjęć oraz logotypów.
- `scripts/audit-production-live.mjs` sprawdza obecność nowego przewijania i marginesu na publicznym Cloudflare, bez jakichkolwiek modyfikacji danych klientów.
