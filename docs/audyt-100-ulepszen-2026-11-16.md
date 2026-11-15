# 100 wykonanych ulepszeń serwisu Twoja Sprawa

**Audyt wdrożenia: 16 listopada 2026 r.**

Dokument wymienia **100 odrębnych poprawek na poziomie podstron i wspólnego interfejsu**. Nie są to 100 nowych funkcji biznesowych: to 47 udoskonaleń dostępności nazw sekcji głównej, 40 uzupełnień ścieżek nawigacji, 12 nowych odnośników pomijania menu oraz 1 wspólny styl widocznego fokusu. Każdą poprawkę można sprawdzić w plikach lub wynikowym HTML.

Zmiany są stosowane w **budowie produkcyjnej i podglądowej** przez `scripts/page-navigation.mjs` (reguły zastosowane do `scripts/build.mjs` i `scripts/preview.mjs`), bez wysyłania danych, cookies, płatnych usług, bibliotek JS czy zmian obietnic prawnych.

## I. Główny obszar strony opisany nagłówkiem H1 — 47 poprawek

Każda z 47 stron zyskała powiązanie głównej sekcji `main` z jej własnym nagłówkiem H1 (`aria-labelledby`), z zachowaniem istniejących identyfikatorów. Ułatwia to korzystanie z czytników ekranu.
1. **404.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
2. **faq.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
3. **index.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
4. **kampanie/skd.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
5. **kampanie/swiadczenie-wspierajace.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
6. **kampanie/szkody-gornicze.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
7. **kontakt.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
8. **lokalnie/szkody-gornicze-lubin.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
9. **lokalnie/szkody-gornicze-polkowice.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
10. **narzedzia/linki-kampanii.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
11. **narzedzia/test-formularzy.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
12. **o-nas.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
13. **plan-dzialania.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
14. **polityka-prywatnosci.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
15. **poradniki/checklista-szkody-gorniczej.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
16. **poradniki/frankowicze-lista-kontrolna.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
17. **poradniki/renta-powypadkowa-dokumenty.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
18. **poradniki/skd-kredyt-pln-lista-kontrolna.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
19. **poradniki/sluzebnosc-przesylu-dzialka.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
20. **poradniki/swiadczenie-wspierajace-pierwsze-kroki.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
21. **rekrutacja.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
22. **start.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
23. **szukaj.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
24. **uslugi/kredyty-frankowe.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
25. **uslugi/kredyty-pln.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
26. **uslugi/nieudany-urlop.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
27. **uslugi/odszkodowanie-za-halas.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
28. **uslugi/pomoc-w-sprawach-karnych.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
29. **uslugi/renty-powypadkowe.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
30. **uslugi/sluzebnosc-przesylu.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
31. **uslugi/swiadczenie-wspierajace.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
32. **uslugi/szkody-gornicze.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
33. **uslugi/szkody-na-nieruchomosci.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
34. **uslugi/wypadki-komunikacyjne.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
35. **uslugi/wypadki-przy-pracy.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
36. **uslugi/wypadki-w-rolnictwie.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
37. **wiedza/drobne-pekniecia-szkody-gornicze.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
38. **wiedza/index.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
39. **wiedza/kredyt-pln-dokumenty-skd.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
40. **wiedza/renta-powypadkowa-dokumenty.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
41. **wiedza/sluzebnosc-przesylu-slup-na-dzialce.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
42. **wiedza/swiadczenie-wspierajace-2026-wzon-zus.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
43. **wiedza/swiadczenie-wspierajace-dokumenty.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
44. **wiedza/swiadczenie-wspierajace-wzon-zus.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
45. **wiedza/szkody-gornicze-drobne-pekniecia.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
46. **wiedza/ugoda-z-kopalnia-co-sprawdzic.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.
47. **wiedza/wypadek-przy-pracy-pierwsze-kroki.html** — dostępna nazwa głównego obszaru oparta na nagłówku danej podstrony.

## II. Kontekstowa ścieżka nawigacji — 40 poprawek

Każda z wymienionych stron otrzymała osobną, semantyczną ścieżkę `nav` z etykietą „Ścieżka nawigacji”, powrotem na stronę główną, właściwą kategorią i bieżącą pozycją oznaczoną `aria-current="page"`. Wyłączono strony kampanijne, start z ulotki, 404 oraz diagnostykę, aby nie rozpraszać celu tych ekranów.

48. **faq.html** — ścieżka do „Najczęstsze pytania” przez odpowiednią kategorię.
49. **kontakt.html** — ścieżka do „Kontakt” przez odpowiednią kategorię.
50. **lokalnie/szkody-gornicze-lubin.html** — ścieżka do „Szkody górnicze — Lubin” przez odpowiednią kategorię.
51. **lokalnie/szkody-gornicze-polkowice.html** — ścieżka do „Szkody górnicze — Polkowice” przez odpowiednią kategorię.
52. **narzedzia/linki-kampanii.html** — ścieżka do „Generator linków kampanii” przez odpowiednią kategorię.
53. **o-nas.html** — ścieżka do „O nas” przez odpowiednią kategorię.
54. **plan-dzialania.html** — ścieżka do „Plan pierwszych kroków” przez odpowiednią kategorię.
55. **polityka-prywatnosci.html** — ścieżka do „Prywatność” przez odpowiednią kategorię.
56. **poradniki/checklista-szkody-gorniczej.html** — ścieżka do „Lista szkód górniczych” przez odpowiednią kategorię.
57. **poradniki/frankowicze-lista-kontrolna.html** — ścieżka do „Dokumenty kredytu CHF” przez odpowiednią kategorię.
58. **poradniki/renta-powypadkowa-dokumenty.html** — ścieżka do „Dokumenty do renty” przez odpowiednią kategorię.
59. **poradniki/skd-kredyt-pln-lista-kontrolna.html** — ścieżka do „Dokumenty do SKD” przez odpowiednią kategorię.
60. **poradniki/sluzebnosc-przesylu-dzialka.html** — ścieżka do „Urządzenia na działce” przez odpowiednią kategorię.
61. **poradniki/swiadczenie-wspierajace-pierwsze-kroki.html** — ścieżka do „Pierwsze kroki WZON/ZUS” przez odpowiednią kategorię.
62. **rekrutacja.html** — ścieżka do „Współpraca” przez odpowiednią kategorię.
63. **szukaj.html** — ścieżka do „Wyszukiwarka” przez odpowiednią kategorię.
64. **uslugi/kredyty-frankowe.html** — ścieżka do „Kredyty frankowe” przez odpowiednią kategorię.
65. **uslugi/kredyty-pln.html** — ścieżka do „Sankcja kredytu darmowego” przez odpowiednią kategorię.
66. **uslugi/nieudany-urlop.html** — ścieżka do „Nieudany urlop” przez odpowiednią kategorię.
67. **uslugi/odszkodowanie-za-halas.html** — ścieżka do „Odszkodowanie za hałas” przez odpowiednią kategorię.
68. **uslugi/pomoc-w-sprawach-karnych.html** — ścieżka do „Sprawy karne” przez odpowiednią kategorię.
69. **uslugi/renty-powypadkowe.html** — ścieżka do „Renty powypadkowe” przez odpowiednią kategorię.
70. **uslugi/sluzebnosc-przesylu.html** — ścieżka do „Służebność przesyłu” przez odpowiednią kategorię.
71. **uslugi/swiadczenie-wspierajace.html** — ścieżka do „Świadczenie wspierające” przez odpowiednią kategorię.
72. **uslugi/szkody-gornicze.html** — ścieżka do „Szkody górnicze” przez odpowiednią kategorię.
73. **uslugi/szkody-na-nieruchomosci.html** — ścieżka do „Szkody na nieruchomości” przez odpowiednią kategorię.
74. **uslugi/wypadki-komunikacyjne.html** — ścieżka do „Wypadki komunikacyjne” przez odpowiednią kategorię.
75. **uslugi/wypadki-przy-pracy.html** — ścieżka do „Wypadki przy pracy” przez odpowiednią kategorię.
76. **uslugi/wypadki-w-rolnictwie.html** — ścieżka do „Wypadki w rolnictwie” przez odpowiednią kategorię.
77. **wiedza/drobne-pekniecia-szkody-gornicze.html** — ścieżka do „Drobne pęknięcia” przez odpowiednią kategorię.
78. **wiedza/index.html** — ścieżka do „Biblioteka poradników” przez odpowiednią kategorię.
79. **wiedza/kredyt-pln-dokumenty-skd.html** — ścieżka do „Dokumenty do kredytu PLN” przez odpowiednią kategorię.
80. **wiedza/renta-powypadkowa-dokumenty.html** — ścieżka do „Renta powypadkowa” przez odpowiednią kategorię.
81. **wiedza/sluzebnosc-przesylu-slup-na-dzialce.html** — ścieżka do „Słup na działce” przez odpowiednią kategorię.
82. **wiedza/swiadczenie-wspierajace-2026-wzon-zus.html** — ścieżka do „Świadczenie wspierające 2026” przez odpowiednią kategorię.
83. **wiedza/swiadczenie-wspierajace-dokumenty.html** — ścieżka do „Dokumenty WZON/ZUS” przez odpowiednią kategorię.
84. **wiedza/swiadczenie-wspierajace-wzon-zus.html** — ścieżka do „WZON i ZUS” przez odpowiednią kategorię.
85. **wiedza/szkody-gornicze-drobne-pekniecia.html** — ścieżka do „Drobne szkody górnicze” przez odpowiednią kategorię.
86. **wiedza/ugoda-z-kopalnia-co-sprawdzic.html** — ścieżka do „Ugoda z kopalnią” przez odpowiednią kategorię.
87. **wiedza/wypadek-przy-pracy-pierwsze-kroki.html** — ścieżka do „Wypadek przy pracy” przez odpowiednią kategorię.

## III. Pomijanie menu za pomocą klawiatury — 12 poprawek

W wymienionych podstronach brakowało łącza bezpośrednio do treści. Wstawiono odnośnik „Przejdź do treści” i zapewniono docelowy identyfikator `#main`. Strona `/start` zachowuje istniejące już łącze `leaflet-skip`, dlatego nie jest liczona ponownie.

88. **o-nas.html** — odnośnik klawiaturowy do głównej treści.
89. **rekrutacja.html** — odnośnik klawiaturowy do głównej treści.
90. **polityka-prywatnosci.html** — odnośnik klawiaturowy do głównej treści.
91. **narzedzia/test-formularzy.html** — odnośnik klawiaturowy do głównej treści.
92. **wiedza/kredyt-pln-dokumenty-skd.html** — odnośnik klawiaturowy do głównej treści.
93. **wiedza/renta-powypadkowa-dokumenty.html** — odnośnik klawiaturowy do głównej treści.
94. **wiedza/sluzebnosc-przesylu-slup-na-dzialce.html** — odnośnik klawiaturowy do głównej treści.
95. **wiedza/swiadczenie-wspierajace-dokumenty.html** — odnośnik klawiaturowy do głównej treści.
96. **wiedza/swiadczenie-wspierajace-wzon-zus.html** — odnośnik klawiaturowy do głównej treści.
97. **wiedza/szkody-gornicze-drobne-pekniecia.html** — odnośnik klawiaturowy do głównej treści.
98. **wiedza/ugoda-z-kopalnia-co-sprawdzic.html** — odnośnik klawiaturowy do głównej treści.
99. **wiedza/wypadek-przy-pracy-pierwsze-kroki.html** — odnośnik klawiaturowy do głównej treści.

## IV. Widoczny fokus klawiatury — 1 poprawka

100. **Wspólny wygląd fokusu** — nowy lekki arkusz `v2/page-navigation.css` zwiększa czytelność ścieżek nawigacji i widoczność fokusowania, uwzględnia małe ekrany, kontrast oraz drukowanie; nie obciąża pakietu CSS strony głównej.

## Kontrola wykonania

- Łącznie: **47 + 40 + 12 + 1 = 100**.
- Każdy element jest badany przez `scripts/test-page-navigation.mjs`, z kontrolą liczby 47 podstron, 40 nazw ścieżek, 12 brakujących odnośników i właściwych identyfikatorów nagłówków.
- Raport automatyczny musi zawierać `IMPROVEMENTS_100_OK {"labelled":47,"breadcrumbs":40,"skips":12,"focusStyling":1,"total":100}`.
- Test jest wykonywany w `Sprawdzanie jakości strony` i `Kandydat produkcyjny — test bez wdrożenia`; standardowe kontrole HTML, linków i kompilacji pozostają aktywne.
- Dla poprawek wygenerowanych w kompilacji źródłowe pliki HTML nie są nadpisywane; wynik należy oglądać w `dist/`, `dist-preview/` lub w opublikowanej witrynie.

**Ograniczenie:** te 100 zmian poprawia przede wszystkim dostępność i orientację w serwisie. Ich skutku dla współczynnika konwersji lub pozycji w wyszukiwarkach nie można potwierdzić bez odrębnych pomiarów.
