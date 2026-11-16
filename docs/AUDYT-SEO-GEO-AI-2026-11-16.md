# Audyt i poprawki widoczności SEO/GEO — Twoja Sprawa
Data: 16 listopada 2026 r. · Wersja źródłowa: twoja-sprawa.pages.dev

## Ustalenie
W bezpłatnym podstawowym skanie on-page strona główna oraz trzy główne strony usług uzyskały po 100/100 i 12/12 zaliczonych zasad. Jest to **wyłącznie audyt elementów HTML**, nie pomiar ruchu, pozycji, liczby zaindeksowanych URL ani odpowiedzi ChatGPT.

W chwili przeglądu publiczne strony miały sitemapę XML z 24 adresami kanonicznymi przeznaczonymi do indeksacji, dedykowaną regułę robots.txt dla OAI-SearchBot i działający workflow IndexNow. Bez połączenia Google Search Console i Bing Webmaster Tools nie można stwierdzić, ile adresów jest faktycznie zaindeksowanych ani na jakie frazy pojawia się serwis.

## Wdrożenie w tej iteracji
1. Usunięto nieaktualny Outlook z podstrony „O nas”, ujednolicono identyfikację kontaktu z formularzami i danymi strukturalnymi SuccessTree.
2. Dodano na sześciu stronach usług po trzy czytelne, ostrożne merytorycznie odpowiedzi na rzeczywiste pytania (18 odpowiedzi) oraz odnośniki do źródeł pierwotnych: PIG-PIB, ZUS, ELI i Rzecznika Finansowego.
3. Połączono te odpowiedzi z kontaktami do właściwej osoby, lokalnymi stronami szkód górniczych lub przydatnymi poradnikami, bez duplikowania i tworzenia masowych podstron.
4. Na stronie „O nas” dodano publiczne wyjaśnienie roli SuccessTree i metody korzystania ze źródeł, bez sugerowania statusu kancelarii ani gwarancji rezultatu.
5. W danych Schema.org strony usługi `WebPage.mainEntity` wskazuje teraz na opisującą ją `Service`, a `Service.description` odpowiada istniejącemu opisowi strony.
6. Sitemap XML może prezentować `lastmod` pochodzące z rzeczywistej daty zmiany pliku źródłowego odczytanej z Git. Gdy historia zmian jest niedostępna, data zostaje **pominięta**; nie dodajemy fałszywego „dzisiaj” do wszystkich URL.
7. Do testów produkcyjnych dołączono kontrolę widocznych odpowiedzi, źródeł, połączenia WebPage–Service, kontaktów i polityki wyszukiwania. Pozostaje oddzielny zestaw 1000 kontroli regresji całej witryny, nie 1000 twierdzonych poprawek.

## Czego nie robimy
- Nie tworzymy tysiąca podstron z drobnymi wariantami słów kluczowych, fikcyjnych opinii, certyfikatów, nagród ani gwarancji wyniku.
- Nie dodajemy `llms.txt` jako rzekomego czynnika rankingu Google. Google oficjalnie podaje, że nie jest wymagany ani przez Google Search, ani AI Overviews.
- Nie blokujemy robotów wyszukiwania ani nie mylimy ruchu OAI-SearchBot z treningowym GPTBot.
- Nie twierdzimy, że samo IndexNow, mapa strony, Schema.org lub poprawny robots.txt gwarantują indeksację, cytowanie w AI czy pozycję w Google.

## Oficjalne źródła strategii
- OpenAI: https://help.openai.com/pl-pl/articles/12627856-publishers-and-developers-faq
- Google AI i SEO: https://developers.google.com/search/docs/appearance/ai-features
- Google — generatywne wyszukiwanie: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Bing Webmaster Guidelines: https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a
- Google — wartościowe treści: https://developers.google.com/search/docs/fundamentals/creating-helpful-content

## Dalsze działania wymagające weryfikacji z kont właściciela
1. Zweryfikować własność `https://twoja-sprawa.pages.dev/` w Google Search Console (właściwość prefiksu URL). Dodać i sprawdzić `/sitemap.xml` i w raporcie „Indeksowanie stron” ustalić realną liczbę stron oraz przyczyny wykluczeń.
2. Zweryfikować witrynę w Bing Webmaster Tools, połączyć sitemapę i sprawdzić IndexNow oraz raport indeksowania.
3. W Cloudflare sprawdzić reguły bezpieczeństwa, wyzwania i logi ruchu dla OAI-SearchBot, Bingbota oraz Googlebota — sam robots.txt nie potwierdza braku blokad WAF.
4. Zestawić zapytania w Search Console (Lubin, Polkowice, szkody górnicze, świadczenie wspierające, SKD) z faktycznie pozyskanymi kontaktami. Ustalić strony o wysokich wyświetleniach i niskim CTR.
5. Po uzyskaniu danych zewnętrznych monitorować frazy i cytowania w odpowiedziach wyszukiwarek AI. Żadna usługa nie gwarantuje wyróżnienia firmy w osobnych rozmowach ChatGPT.

Koszt dodatkowego hostingu i płatnych narzędzi w tej iteracji: 0 zł.
