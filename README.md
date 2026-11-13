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
- `v2/home-flow.css`, `v2/premium-v2.css`, `v2/styles.css` — układ i styl
- `v2/contact.js` — formularze Web3Forms z awaryjnym kontaktem e-mail
- `v2/chat-assistant.js` — bezpłatny przewodnik po usługach
- `v2/kampanie/skd.html` — kontakt do analizy pełnej umowy kredytu PLN
- `v2/attribution.js` — bezcookiesowe przenoszenie wyłącznie dozwolonych UTM przy klikaniu linków wewnętrznych; podłączone do kluczowych podstron
- `v2/narzedzia/linki-kampanii.html` + `v2/campaign-links.js` — bezpłatny generator linków UTM i tekstów do publikacji (6 usług, w tym SKD jako trzecia)
- `v2/narzedzia/test-formularzy.html` — ręcznie uruchamiana kontrola dostępności dziesięciu stron i renderowania dwóch formularzy, bez wysyłania danych i bez płatnych usług
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
5. Otwórz `https://twoja-sprawa.pages.dev/narzedzia/test-formularzy` i kliknij „Uruchom kontrolę” — sprawdza 10 stron i dwa formularze bez przesyłania danych.
6. Przetestuj działanie formularza w przeglądarce i potwierdź dostarczenie testowego zgłoszenia dopiero po uzgodnieniu procedury, aby nie generować fałszywych leadów.
7. Jeżeli formularz nie działa, statyczny kontakt wewnątrz `[data-contact-form]` powinien pozostać widoczny.

## Zasady projektu

- Bez konieczności płacenia za nowe usługi.
- Najważniejsze tematy: szkody górnicze, świadczenie wspierające, **SKD jako trzecia wyróżniona usługa**.
- W SKD: e-mail `wojciech.obieglo@votum-ds.pl`; prośba o pełną umowę i numer telefonu.
- Nie deklarujemy gwarantowanego świadczenia, odszkodowania ani wygranej.
- SuccessTree jest odrębną działalnością; serwis nie jest oficjalną stroną VOTUM ani kancelarią.
- Przy formularzach nie prosimy o PESEL, hasła ani szczegółową dokumentację medyczną.
