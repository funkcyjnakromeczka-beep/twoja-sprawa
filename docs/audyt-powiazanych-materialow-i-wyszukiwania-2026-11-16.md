# Audyt V — powiązane ścieżki klienta i wyszukiwarka

**Data:** 16 listopada 2026 r.  
**Projekt:** Twoja Sprawa, SuccessTree OBIEGŁO WOJCIECH.

## Faktycznie wykonane ulepszenia

- **27** kontekstowych sekcji „Powiązane materiały” na stronach usług i poradników.
- **93** nowe, audytowalne odnośniki między stronami, kierujące tylko do publicznych, zatwierdzonych do indeksowania treści.
- **6** przykładów popularnych wyszukiwań, po jednym na każdą główną kategorię, z poprawnym działaniem wyszukiwarki.
- Poprawiona obsługa zapytania **„waloryzacja renty”**, które przed zmianą nie prowadziło do odpowiedniego materiału.
- Większe, co najmniej **44-pikselowe** cele dotykowe dla przykładów wyszukiwania i obramowanie klawiaturowe.
- Struktura bez płatnych narzędzi, nowych połączeń z zewnętrznymi wyszukiwarkami i przekazywania zapytań klienta do adresu e-mail.

**Weryfikacja:** [test jakości GitHub Actions #43807520433](https://github.com/funkcyjnakromeczka-beep/twoja-sprawa/actions/runs/43807520433). Kontrole źródłowe: `scripts/test-related-content.mjs` oraz `scripts/test-search-index-freshness.mjs`. Testy wykazały 27 paneli, 93 poprawne przejścia oraz wyszukiwalność wszystkich sześciu przykładów.

**Licznik:** odróżniamy 93 odnośniki od 27 paneli i sześciu przykładów. Nie sumujemy ich jako 1000 osobnych funkcji. Wcześniejsze 1000 kontroli wydania również nie stanowi 1000 dodatkowych poprawek.

## Pełna lista 93 nowych połączeń między stronami

| Nr | Strona źródłowa | Zatwierdzony adres docelowy |
|---:|---|---|
| 1 | `lokalnie/szkody-gornicze-lubin.html` | [uslugi/szkody-gornicze.html](https://twoja-sprawa.pages.dev/uslugi/szkody-gornicze) |
| 2 | `lokalnie/szkody-gornicze-lubin.html` | [lokalnie/szkody-gornicze-polkowice.html](https://twoja-sprawa.pages.dev/lokalnie/szkody-gornicze-polkowice) |
| 3 | `lokalnie/szkody-gornicze-lubin.html` | [wiedza/drobne-pekniecia-szkody-gornicze.html](https://twoja-sprawa.pages.dev/wiedza/drobne-pekniecia-szkody-gornicze) |
| 4 | `lokalnie/szkody-gornicze-lubin.html` | [faq.html](https://twoja-sprawa.pages.dev/faq) |
| 5 | `lokalnie/szkody-gornicze-polkowice.html` | [uslugi/szkody-gornicze.html](https://twoja-sprawa.pages.dev/uslugi/szkody-gornicze) |
| 6 | `lokalnie/szkody-gornicze-polkowice.html` | [lokalnie/szkody-gornicze-lubin.html](https://twoja-sprawa.pages.dev/lokalnie/szkody-gornicze-lubin) |
| 7 | `lokalnie/szkody-gornicze-polkowice.html` | [wiedza/drobne-pekniecia-szkody-gornicze.html](https://twoja-sprawa.pages.dev/wiedza/drobne-pekniecia-szkody-gornicze) |
| 8 | `lokalnie/szkody-gornicze-polkowice.html` | [faq.html](https://twoja-sprawa.pages.dev/faq) |
| 9 | `poradniki/checklista-szkody-gorniczej.html` | [uslugi/szkody-gornicze.html](https://twoja-sprawa.pages.dev/uslugi/szkody-gornicze) |
| 10 | `poradniki/checklista-szkody-gorniczej.html` | [lokalnie/szkody-gornicze-lubin.html](https://twoja-sprawa.pages.dev/lokalnie/szkody-gornicze-lubin) |
| 11 | `poradniki/checklista-szkody-gorniczej.html` | [lokalnie/szkody-gornicze-polkowice.html](https://twoja-sprawa.pages.dev/lokalnie/szkody-gornicze-polkowice) |
| 12 | `poradniki/checklista-szkody-gorniczej.html` | [wiedza/drobne-pekniecia-szkody-gornicze.html](https://twoja-sprawa.pages.dev/wiedza/drobne-pekniecia-szkody-gornicze) |
| 13 | `poradniki/frankowicze-lista-kontrolna.html` | [uslugi/kredyty-frankowe.html](https://twoja-sprawa.pages.dev/uslugi/kredyty-frankowe) |
| 14 | `poradniki/frankowicze-lista-kontrolna.html` | [faq.html](https://twoja-sprawa.pages.dev/faq) |
| 15 | `poradniki/frankowicze-lista-kontrolna.html` | [kontakt.html](https://twoja-sprawa.pages.dev/kontakt) |
| 16 | `poradniki/renta-powypadkowa-dokumenty.html` | [uslugi/renty-powypadkowe.html](https://twoja-sprawa.pages.dev/uslugi/renty-powypadkowe) |
| 17 | `poradniki/renta-powypadkowa-dokumenty.html` | [uslugi/wypadki-przy-pracy.html](https://twoja-sprawa.pages.dev/uslugi/wypadki-przy-pracy) |
| 18 | `poradniki/renta-powypadkowa-dokumenty.html` | [faq.html](https://twoja-sprawa.pages.dev/faq) |
| 19 | `poradniki/renta-powypadkowa-dokumenty.html` | [kontakt.html](https://twoja-sprawa.pages.dev/kontakt) |
| 20 | `poradniki/skd-kredyt-pln-lista-kontrolna.html` | [uslugi/kredyty-pln.html](https://twoja-sprawa.pages.dev/uslugi/kredyty-pln) |
| 21 | `poradniki/skd-kredyt-pln-lista-kontrolna.html` | [faq.html](https://twoja-sprawa.pages.dev/faq) |
| 22 | `poradniki/skd-kredyt-pln-lista-kontrolna.html` | [kontakt.html](https://twoja-sprawa.pages.dev/kontakt) |
| 23 | `poradniki/sluzebnosc-przesylu-dzialka.html` | [uslugi/sluzebnosc-przesylu.html](https://twoja-sprawa.pages.dev/uslugi/sluzebnosc-przesylu) |
| 24 | `poradniki/sluzebnosc-przesylu-dzialka.html` | [faq.html](https://twoja-sprawa.pages.dev/faq) |
| 25 | `poradniki/sluzebnosc-przesylu-dzialka.html` | [kontakt.html](https://twoja-sprawa.pages.dev/kontakt) |
| 26 | `poradniki/swiadczenie-wspierajace-pierwsze-kroki.html` | [uslugi/swiadczenie-wspierajace.html](https://twoja-sprawa.pages.dev/uslugi/swiadczenie-wspierajace) |
| 27 | `poradniki/swiadczenie-wspierajace-pierwsze-kroki.html` | [wiedza/swiadczenie-wspierajace-2026-wzon-zus.html](https://twoja-sprawa.pages.dev/wiedza/swiadczenie-wspierajace-2026-wzon-zus) |
| 28 | `poradniki/swiadczenie-wspierajace-pierwsze-kroki.html` | [faq.html](https://twoja-sprawa.pages.dev/faq) |
| 29 | `poradniki/swiadczenie-wspierajace-pierwsze-kroki.html` | [kontakt.html](https://twoja-sprawa.pages.dev/kontakt) |
| 30 | `uslugi/kredyty-frankowe.html` | [faq.html](https://twoja-sprawa.pages.dev/faq) |
| 31 | `uslugi/kredyty-frankowe.html` | [kontakt.html](https://twoja-sprawa.pages.dev/kontakt) |
| 32 | `uslugi/kredyty-pln.html` | [faq.html](https://twoja-sprawa.pages.dev/faq) |
| 33 | `uslugi/kredyty-pln.html` | [kontakt.html](https://twoja-sprawa.pages.dev/kontakt) |
| 34 | `uslugi/renty-powypadkowe.html` | [uslugi/wypadki-przy-pracy.html](https://twoja-sprawa.pages.dev/uslugi/wypadki-przy-pracy) |
| 35 | `uslugi/renty-powypadkowe.html` | [faq.html](https://twoja-sprawa.pages.dev/faq) |
| 36 | `uslugi/renty-powypadkowe.html` | [kontakt.html](https://twoja-sprawa.pages.dev/kontakt) |
| 37 | `uslugi/sluzebnosc-przesylu.html` | [faq.html](https://twoja-sprawa.pages.dev/faq) |
| 38 | `uslugi/sluzebnosc-przesylu.html` | [kontakt.html](https://twoja-sprawa.pages.dev/kontakt) |
| 39 | `uslugi/swiadczenie-wspierajace.html` | [wiedza/swiadczenie-wspierajace-2026-wzon-zus.html](https://twoja-sprawa.pages.dev/wiedza/swiadczenie-wspierajace-2026-wzon-zus) |
| 40 | `uslugi/swiadczenie-wspierajace.html` | [faq.html](https://twoja-sprawa.pages.dev/faq) |
| 41 | `uslugi/swiadczenie-wspierajace.html` | [kontakt.html](https://twoja-sprawa.pages.dev/kontakt) |
| 42 | `uslugi/szkody-gornicze.html` | [lokalnie/szkody-gornicze-lubin.html](https://twoja-sprawa.pages.dev/lokalnie/szkody-gornicze-lubin) |
| 43 | `uslugi/szkody-gornicze.html` | [lokalnie/szkody-gornicze-polkowice.html](https://twoja-sprawa.pages.dev/lokalnie/szkody-gornicze-polkowice) |
| 44 | `uslugi/szkody-gornicze.html` | [wiedza/drobne-pekniecia-szkody-gornicze.html](https://twoja-sprawa.pages.dev/wiedza/drobne-pekniecia-szkody-gornicze) |
| 45 | `uslugi/szkody-gornicze.html` | [faq.html](https://twoja-sprawa.pages.dev/faq) |
| 46 | `uslugi/wypadki-komunikacyjne.html` | [uslugi/renty-powypadkowe.html](https://twoja-sprawa.pages.dev/uslugi/renty-powypadkowe) |
| 47 | `uslugi/wypadki-komunikacyjne.html` | [uslugi/wypadki-przy-pracy.html](https://twoja-sprawa.pages.dev/uslugi/wypadki-przy-pracy) |
| 48 | `uslugi/wypadki-komunikacyjne.html` | [faq.html](https://twoja-sprawa.pages.dev/faq) |
| 49 | `uslugi/wypadki-komunikacyjne.html` | [kontakt.html](https://twoja-sprawa.pages.dev/kontakt) |
| 50 | `uslugi/wypadki-przy-pracy.html` | [uslugi/renty-powypadkowe.html](https://twoja-sprawa.pages.dev/uslugi/renty-powypadkowe) |
| 51 | `uslugi/wypadki-przy-pracy.html` | [faq.html](https://twoja-sprawa.pages.dev/faq) |
| 52 | `uslugi/wypadki-przy-pracy.html` | [kontakt.html](https://twoja-sprawa.pages.dev/kontakt) |
| 53 | `uslugi/wypadki-w-rolnictwie.html` | [uslugi/renty-powypadkowe.html](https://twoja-sprawa.pages.dev/uslugi/renty-powypadkowe) |
| 54 | `uslugi/wypadki-w-rolnictwie.html` | [uslugi/wypadki-przy-pracy.html](https://twoja-sprawa.pages.dev/uslugi/wypadki-przy-pracy) |
| 55 | `uslugi/wypadki-w-rolnictwie.html` | [faq.html](https://twoja-sprawa.pages.dev/faq) |
| 56 | `uslugi/wypadki-w-rolnictwie.html` | [kontakt.html](https://twoja-sprawa.pages.dev/kontakt) |
| 57 | `wiedza/drobne-pekniecia-szkody-gornicze.html` | [uslugi/szkody-gornicze.html](https://twoja-sprawa.pages.dev/uslugi/szkody-gornicze) |
| 58 | `wiedza/drobne-pekniecia-szkody-gornicze.html` | [lokalnie/szkody-gornicze-lubin.html](https://twoja-sprawa.pages.dev/lokalnie/szkody-gornicze-lubin) |
| 59 | `wiedza/drobne-pekniecia-szkody-gornicze.html` | [lokalnie/szkody-gornicze-polkowice.html](https://twoja-sprawa.pages.dev/lokalnie/szkody-gornicze-polkowice) |
| 60 | `wiedza/drobne-pekniecia-szkody-gornicze.html` | [faq.html](https://twoja-sprawa.pages.dev/faq) |
| 61 | `wiedza/kredyt-pln-dokumenty-skd.html` | [uslugi/kredyty-pln.html](https://twoja-sprawa.pages.dev/uslugi/kredyty-pln) |
| 62 | `wiedza/kredyt-pln-dokumenty-skd.html` | [faq.html](https://twoja-sprawa.pages.dev/faq) |
| 63 | `wiedza/kredyt-pln-dokumenty-skd.html` | [kontakt.html](https://twoja-sprawa.pages.dev/kontakt) |
| 64 | `wiedza/renta-powypadkowa-dokumenty.html` | [uslugi/renty-powypadkowe.html](https://twoja-sprawa.pages.dev/uslugi/renty-powypadkowe) |
| 65 | `wiedza/renta-powypadkowa-dokumenty.html` | [uslugi/wypadki-przy-pracy.html](https://twoja-sprawa.pages.dev/uslugi/wypadki-przy-pracy) |
| 66 | `wiedza/renta-powypadkowa-dokumenty.html` | [faq.html](https://twoja-sprawa.pages.dev/faq) |
| 67 | `wiedza/renta-powypadkowa-dokumenty.html` | [kontakt.html](https://twoja-sprawa.pages.dev/kontakt) |
| 68 | `wiedza/sluzebnosc-przesylu-slup-na-dzialce.html` | [uslugi/sluzebnosc-przesylu.html](https://twoja-sprawa.pages.dev/uslugi/sluzebnosc-przesylu) |
| 69 | `wiedza/sluzebnosc-przesylu-slup-na-dzialce.html` | [faq.html](https://twoja-sprawa.pages.dev/faq) |
| 70 | `wiedza/sluzebnosc-przesylu-slup-na-dzialce.html` | [kontakt.html](https://twoja-sprawa.pages.dev/kontakt) |
| 71 | `wiedza/swiadczenie-wspierajace-2026-wzon-zus.html` | [uslugi/swiadczenie-wspierajace.html](https://twoja-sprawa.pages.dev/uslugi/swiadczenie-wspierajace) |
| 72 | `wiedza/swiadczenie-wspierajace-2026-wzon-zus.html` | [faq.html](https://twoja-sprawa.pages.dev/faq) |
| 73 | `wiedza/swiadczenie-wspierajace-2026-wzon-zus.html` | [kontakt.html](https://twoja-sprawa.pages.dev/kontakt) |
| 74 | `wiedza/swiadczenie-wspierajace-dokumenty.html` | [uslugi/swiadczenie-wspierajace.html](https://twoja-sprawa.pages.dev/uslugi/swiadczenie-wspierajace) |
| 75 | `wiedza/swiadczenie-wspierajace-dokumenty.html` | [wiedza/swiadczenie-wspierajace-2026-wzon-zus.html](https://twoja-sprawa.pages.dev/wiedza/swiadczenie-wspierajace-2026-wzon-zus) |
| 76 | `wiedza/swiadczenie-wspierajace-dokumenty.html` | [faq.html](https://twoja-sprawa.pages.dev/faq) |
| 77 | `wiedza/swiadczenie-wspierajace-dokumenty.html` | [kontakt.html](https://twoja-sprawa.pages.dev/kontakt) |
| 78 | `wiedza/swiadczenie-wspierajace-wzon-zus.html` | [uslugi/swiadczenie-wspierajace.html](https://twoja-sprawa.pages.dev/uslugi/swiadczenie-wspierajace) |
| 79 | `wiedza/swiadczenie-wspierajace-wzon-zus.html` | [wiedza/swiadczenie-wspierajace-2026-wzon-zus.html](https://twoja-sprawa.pages.dev/wiedza/swiadczenie-wspierajace-2026-wzon-zus) |
| 80 | `wiedza/swiadczenie-wspierajace-wzon-zus.html` | [faq.html](https://twoja-sprawa.pages.dev/faq) |
| 81 | `wiedza/swiadczenie-wspierajace-wzon-zus.html` | [kontakt.html](https://twoja-sprawa.pages.dev/kontakt) |
| 82 | `wiedza/szkody-gornicze-drobne-pekniecia.html` | [uslugi/szkody-gornicze.html](https://twoja-sprawa.pages.dev/uslugi/szkody-gornicze) |
| 83 | `wiedza/szkody-gornicze-drobne-pekniecia.html` | [lokalnie/szkody-gornicze-lubin.html](https://twoja-sprawa.pages.dev/lokalnie/szkody-gornicze-lubin) |
| 84 | `wiedza/szkody-gornicze-drobne-pekniecia.html` | [lokalnie/szkody-gornicze-polkowice.html](https://twoja-sprawa.pages.dev/lokalnie/szkody-gornicze-polkowice) |
| 85 | `wiedza/szkody-gornicze-drobne-pekniecia.html` | [wiedza/drobne-pekniecia-szkody-gornicze.html](https://twoja-sprawa.pages.dev/wiedza/drobne-pekniecia-szkody-gornicze) |
| 86 | `wiedza/ugoda-z-kopalnia-co-sprawdzic.html` | [uslugi/szkody-gornicze.html](https://twoja-sprawa.pages.dev/uslugi/szkody-gornicze) |
| 87 | `wiedza/ugoda-z-kopalnia-co-sprawdzic.html` | [lokalnie/szkody-gornicze-lubin.html](https://twoja-sprawa.pages.dev/lokalnie/szkody-gornicze-lubin) |
| 88 | `wiedza/ugoda-z-kopalnia-co-sprawdzic.html` | [lokalnie/szkody-gornicze-polkowice.html](https://twoja-sprawa.pages.dev/lokalnie/szkody-gornicze-polkowice) |
| 89 | `wiedza/ugoda-z-kopalnia-co-sprawdzic.html` | [wiedza/drobne-pekniecia-szkody-gornicze.html](https://twoja-sprawa.pages.dev/wiedza/drobne-pekniecia-szkody-gornicze) |
| 90 | `wiedza/wypadek-przy-pracy-pierwsze-kroki.html` | [uslugi/renty-powypadkowe.html](https://twoja-sprawa.pages.dev/uslugi/renty-powypadkowe) |
| 91 | `wiedza/wypadek-przy-pracy-pierwsze-kroki.html` | [uslugi/wypadki-przy-pracy.html](https://twoja-sprawa.pages.dev/uslugi/wypadki-przy-pracy) |
| 92 | `wiedza/wypadek-przy-pracy-pierwsze-kroki.html` | [faq.html](https://twoja-sprawa.pages.dev/faq) |
| 93 | `wiedza/wypadek-przy-pracy-pierwsze-kroki.html` | [kontakt.html](https://twoja-sprawa.pages.dev/kontakt) |

## Zasady utrzymania

Reguły są zapisane w `scripts/related-content.mjs`. Każdy nowy odnośnik musi wskazywać istniejącą, merytorycznie powiązaną stronę, która nie jest szkicem oznaczonym `noindex`. Kontrola wymusza brak autopowiązań, duplikatów i nieznanych ścieżek. Układ i fokus są w `v2/related-content.css`.

Wyszukiwarka i przykłady znajdują się w `v2/szukaj.html`, `v2/search-pages-1.js` i `v2/site-search.css`. Wpisy wyszukiwania dotyczą istniejących materiałów, nie gwarantują uprawnień ani wyniku sprawy.

## Dalsze priorytety po tym etapie

Należy mierzyć skuteczność przejść do formularzy bez zapisywania treści zapytań ani identyfikatorów osób, sprawdzić zachowanie kart na małych ekranach i utrzymać ręczną weryfikację aktualności treści prawnych przed ich indeksowaniem.
