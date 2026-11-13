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
- `v2/local-mining.css`, `v2/lokalnie/` — lokalne strony Lubina i Polkowic
- `v2/_headers` — konserwatywne nagłówki bezpieczeństwa na ścieżce publikacji
- `v2/404.html` — wersja strony błędu powiązana z publiczną witryną

## Kontrola zmian po każdym wdrożeniu

1. Otwórz `https://twoja-sprawa.pages.dev/`; sprawdź widoczność szkód górniczych, świadczenia wspierającego i trzeciej ścieżki SKD.
2. Sprawdź `https://twoja-sprawa.pages.dev/kontakt` oraz `https://twoja-sprawa.pages.dev/kampanie/skd`.
3. Sprawdź `https://twoja-sprawa.pages.dev/uslugi/szkody-gornicze` oraz `https://twoja-sprawa.pages.dev/uslugi/swiadczenie-wspierajace`.
4. Sprawdź aktualną mapę `https://twoja-sprawa.pages.dev/sitemap.xml` — publiczna mapa jest generowana inaczej niż starszy plik `sitemap.xml` w katalogu repozytorium.
5. Przetestuj działanie formularza w przeglądarce i potwierdź dostarczenie testowego zgłoszenia dopiero po uzgodnieniu procedury, aby nie generować fałszywych leadów.
6. Jeżeli formularz nie działa, statyczny kontakt wewnątrz `[data-contact-form]` powinien pozostać widoczny.

## Zasady projektu

- Bez konieczności płacenia za nowe usługi.
- Najważniejsze tematy: szkody górnicze, świadczenie wspierające, **SKD jako trzecia wyróżniona usługa**.
- W SKD: e-mail `wojciech.obieglo@votum-ds.pl`; prośba o pełną umowę i numer telefonu.
- Nie deklarujemy gwarantowanego świadczenia, odszkodowania ani wygranej.
- SuccessTree jest odrębną działalnością; serwis nie jest oficjalną stroną VOTUM ani kancelarią.
- Przy formularzach nie prosimy o PESEL, hasła ani szczegółową dokumentację medyczną.
