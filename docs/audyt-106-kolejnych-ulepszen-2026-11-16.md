# Audyt II: 106 kolejnych wdrożonych ulepszeń strony Twoja Sprawa

**Data:** 16 listopada 2026 r.  
**Źródło dowodów:** automatyczny test GitHub Actions [Sprawdzanie jakości strony #43787012329](https://github.com/funkcyjnakromeczka-beep/twoja-sprawa/actions/runs/43787012329).  
**Zakres:** 47 podstron, bez powielania poprzedniej setki poprawek nawigacji okruszkowej, nazw głównej sekcji i odnośników „Przejdź do treści”.

## Co zostało wykonane

- **67 zmian ochrony prywatności**: zewnętrzne grafiki otrzymały `referrerpolicy="no-referrer"`, dzięki czemu żądanie obrazu nie ujawnia serwerowi źródłowemu nagłówka Referer. Dostawca grafiki wciąż może zobaczyć m.in. adres IP klienta.
- **10 zmian ładowania obrazków**: dekoracyjne ikony społecznościowe otrzymały `loading="lazy"`.
- **10 zmian priorytetu zasobów**: te same niekrytyczne ikony otrzymały `fetchpriority="low"`.
- **8 zmian dekodowania grafik**: tam, gdzie brakowało atrybutu, wstawiono `decoding="async"`.
- **11 zmian dostępności nawigacji**: nieopisane elementy `nav` otrzymały `aria-label="Nawigacja główna"`.

Są to **106 oddzielnych zmian przypisanych do konkretnych elementów HTML**, a nie 106 nowych usług, stron czy funkcjonalności biznesowych. Priorytety i odroczone pobieranie są wskazówkami dla przeglądarki: rzeczywistego przyspieszenia strony nie można stwierdzić bez pomiarów.

## Pełna lista 106 poprawek

Numery obrazów liczone są osobno na każdej podstronie. Dwa usprawnienia tego samego obrazka są rozliczane oddzielnie tylko wtedy, gdy dotyczą **innych, niezależnych właściwości** (np. dekodowania i prywatności).

1. **`faq.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#1 `logo-votum-network-przedstawiciel-400x284-1.jpg`).
2. **`faq.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#2 `votum-scale-agency-.png`).
3. **`index.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#1 `logo_VOTUM_SA_rgb-480x71.png`).
4. **`index.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#2 `logo-votum-network-przedstawiciel-400x284-1.jpg`).
5. **`index.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#3 `votum-scale-agency-.png`).
6. **`index.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#8 `logo-votum-network-przedstawiciel-400x284-1.jpg`).
7. **`index.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#9 `votum-scale-agency-.png`).
8. **`index.html`** — Dodano opóźnione ładowanie dekoracyjnej ikony społecznościowej (#10 `icon-facebook.svg`).
9. **`index.html`** — Obniżono priorytet pobrania niekrytycznej ikony społecznościowej (#10 `icon-facebook.svg`).
10. **`index.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#11 `logo_VOTUM_SA_rgb-480x71.png`).
11. **`index.html`** — Dodano asynchroniczne dekodowanie obrazu (#11 `logo_VOTUM_SA_rgb-480x71.png`).
12. **`index.html`** — Dodano asynchroniczne dekodowanie obrazu (#12 `successtree-concept.svg`).
13. **`kampanie/skd.html`** — Dodano opóźnione ładowanie dekoracyjnej ikony społecznościowej (#2 `icon-facebook.svg`).
14. **`kampanie/skd.html`** — Obniżono priorytet pobrania niekrytycznej ikony społecznościowej (#2 `icon-facebook.svg`).
15. **`kampanie/swiadczenie-wspierajace.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#1 `Votum-Wsparcie-poziom_zielone.png`).
16. **`kampanie/swiadczenie-wspierajace.html`** — Dodano opóźnione ładowanie dekoracyjnej ikony społecznościowej (#3 `icon-facebook.svg`).
17. **`kampanie/swiadczenie-wspierajace.html`** — Obniżono priorytet pobrania niekrytycznej ikony społecznościowej (#3 `icon-facebook.svg`).
18. **`kampanie/szkody-gornicze.html`** — Dodano opóźnione ładowanie dekoracyjnej ikony społecznościowej (#2 `icon-tiktok.svg`).
19. **`kampanie/szkody-gornicze.html`** — Obniżono priorytet pobrania niekrytycznej ikony społecznościowej (#2 `icon-tiktok.svg`).
20. **`kampanie/szkody-gornicze.html`** — Dodano opóźnione ładowanie dekoracyjnej ikony społecznościowej (#3 `icon-facebook.svg`).
21. **`kampanie/szkody-gornicze.html`** — Obniżono priorytet pobrania niekrytycznej ikony społecznościowej (#3 `icon-facebook.svg`).
22. **`kontakt.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#1 `logo_VOTUM_SA_rgb-480x71.png`).
23. **`kontakt.html`** — Dodano asynchroniczne dekodowanie obrazu (#1 `logo_VOTUM_SA_rgb-480x71.png`).
24. **`kontakt.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#2 `logo-votum-network-przedstawiciel-400x284-1.jpg`).
25. **`kontakt.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#3 `votum-scale-agency-.png`).
26. **`lokalnie/szkody-gornicze-lubin.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#1 `logo-votum-network-przedstawiciel-400x284-1.jpg`).
27. **`lokalnie/szkody-gornicze-lubin.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#2 `votum-scale-agency-.png`).
28. **`lokalnie/szkody-gornicze-polkowice.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#1 `logo-votum-network-przedstawiciel-400x284-1.jpg`).
29. **`lokalnie/szkody-gornicze-polkowice.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#2 `votum-scale-agency-.png`).
30. **`narzedzia/linki-kampanii.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#1 `logo-votum-network-przedstawiciel-400x284-1.jpg`).
31. **`narzedzia/linki-kampanii.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#2 `votum-scale-agency-.png`).
32. **`o-nas.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#1 `logo-votum-network-przedstawiciel-400x284-1.jpg`).
33. **`o-nas.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#2 `votum-scale-agency-.png`).
34. **`o-nas.html`** — Nadano dostępną nazwę wcześniej nieopisanej nawigacji (nav 1).
35. **`plan-dzialania.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#1 `logo-votum-network-przedstawiciel-400x284-1.jpg`).
36. **`plan-dzialania.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#2 `votum-scale-agency-.png`).
37. **`polityka-prywatnosci.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#1 `logo-votum-network-przedstawiciel-400x284-1.jpg`).
38. **`polityka-prywatnosci.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#2 `votum-scale-agency-.png`).
39. **`polityka-prywatnosci.html`** — Nadano dostępną nazwę wcześniej nieopisanej nawigacji (nav 1).
40. **`poradniki/checklista-szkody-gorniczej.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#1 `logo-votum-network-przedstawiciel-400x284-1.jpg`).
41. **`poradniki/checklista-szkody-gorniczej.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#2 `votum-scale-agency-.png`).
42. **`rekrutacja.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#1 `logo-votum-network-przedstawiciel-400x284-1.jpg`).
43. **`rekrutacja.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#2 `votum-scale-agency-.png`).
44. **`rekrutacja.html`** — Nadano dostępną nazwę wcześniej nieopisanej nawigacji (nav 1).
45. **`szukaj.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#1 `logo-votum-network-przedstawiciel-400x284-1.jpg`).
46. **`szukaj.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#2 `votum-scale-agency-.png`).
47. **`uslugi/kredyty-pln.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#1 `logo_VOTUM_SA_rgb-480x71.png`).
48. **`uslugi/kredyty-pln.html`** — Dodano asynchroniczne dekodowanie obrazu (#1 `logo_VOTUM_SA_rgb-480x71.png`).
49. **`uslugi/kredyty-pln.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#2 `logo-votum-network-przedstawiciel-400x284-1.jpg`).
50. **`uslugi/kredyty-pln.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#3 `votum-scale-agency-.png`).
51. **`uslugi/kredyty-pln.html`** — Dodano opóźnione ładowanie dekoracyjnej ikony społecznościowej (#4 `icon-facebook.svg`).
52. **`uslugi/kredyty-pln.html`** — Obniżono priorytet pobrania niekrytycznej ikony społecznościowej (#4 `icon-facebook.svg`).
53. **`uslugi/nieudany-urlop.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#1 `logo-votum-network-przedstawiciel-400x284-1.jpg`).
54. **`uslugi/nieudany-urlop.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#2 `votum-scale-agency-.png`).
55. **`uslugi/odszkodowanie-za-halas.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#1 `logo-votum-network-przedstawiciel-400x284-1.jpg`).
56. **`uslugi/odszkodowanie-za-halas.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#2 `votum-scale-agency-.png`).
57. **`uslugi/pomoc-w-sprawach-karnych.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#1 `logo-votum-network-przedstawiciel-400x284-1.jpg`).
58. **`uslugi/pomoc-w-sprawach-karnych.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#2 `votum-scale-agency-.png`).
59. **`uslugi/renty-powypadkowe.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#1 `logo_VOTUM_SA_rgb-480x71.png`).
60. **`uslugi/renty-powypadkowe.html`** — Dodano asynchroniczne dekodowanie obrazu (#1 `logo_VOTUM_SA_rgb-480x71.png`).
61. **`uslugi/renty-powypadkowe.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#2 `logo-votum-network-przedstawiciel-400x284-1.jpg`).
62. **`uslugi/renty-powypadkowe.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#3 `votum-scale-agency-.png`).
63. **`uslugi/renty-powypadkowe.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#4 `Votum-Wsparcie-poziom_zielone.png`).
64. **`uslugi/renty-powypadkowe.html`** — Dodano opóźnione ładowanie dekoracyjnej ikony społecznościowej (#5 `icon-facebook.svg`).
65. **`uslugi/renty-powypadkowe.html`** — Obniżono priorytet pobrania niekrytycznej ikony społecznościowej (#5 `icon-facebook.svg`).
66. **`uslugi/sluzebnosc-przesylu.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#1 `logo_VOTUM_SA_rgb-480x71.png`).
67. **`uslugi/sluzebnosc-przesylu.html`** — Dodano asynchroniczne dekodowanie obrazu (#1 `logo_VOTUM_SA_rgb-480x71.png`).
68. **`uslugi/sluzebnosc-przesylu.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#2 `logo-votum-network-przedstawiciel-400x284-1.jpg`).
69. **`uslugi/sluzebnosc-przesylu.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#3 `votum-scale-agency-.png`).
70. **`uslugi/swiadczenie-wspierajace.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#1 `logo_VOTUM_SA_rgb-480x71.png`).
71. **`uslugi/swiadczenie-wspierajace.html`** — Dodano asynchroniczne dekodowanie obrazu (#1 `logo_VOTUM_SA_rgb-480x71.png`).
72. **`uslugi/swiadczenie-wspierajace.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#2 `logo-votum-network-przedstawiciel-400x284-1.jpg`).
73. **`uslugi/swiadczenie-wspierajace.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#3 `votum-scale-agency-.png`).
74. **`uslugi/swiadczenie-wspierajace.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#4 `Votum-Wsparcie-poziom_zielone-480x206.png`).
75. **`uslugi/swiadczenie-wspierajace.html`** — Dodano opóźnione ładowanie dekoracyjnej ikony społecznościowej (#6 `icon-facebook.svg`).
76. **`uslugi/swiadczenie-wspierajace.html`** — Obniżono priorytet pobrania niekrytycznej ikony społecznościowej (#6 `icon-facebook.svg`).
77. **`uslugi/szkody-gornicze.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#1 `logo_VOTUM_SA_rgb-480x71.png`).
78. **`uslugi/szkody-gornicze.html`** — Dodano asynchroniczne dekodowanie obrazu (#1 `logo_VOTUM_SA_rgb-480x71.png`).
79. **`uslugi/szkody-gornicze.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#2 `logo-votum-network-przedstawiciel-400x284-1.jpg`).
80. **`uslugi/szkody-gornicze.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#3 `votum-scale-agency-.png`).
81. **`uslugi/szkody-gornicze.html`** — Dodano opóźnione ładowanie dekoracyjnej ikony społecznościowej (#5 `icon-tiktok.svg`).
82. **`uslugi/szkody-gornicze.html`** — Obniżono priorytet pobrania niekrytycznej ikony społecznościowej (#5 `icon-tiktok.svg`).
83. **`uslugi/szkody-gornicze.html`** — Dodano opóźnione ładowanie dekoracyjnej ikony społecznościowej (#6 `icon-facebook.svg`).
84. **`uslugi/szkody-gornicze.html`** — Obniżono priorytet pobrania niekrytycznej ikony społecznościowej (#6 `icon-facebook.svg`).
85. **`uslugi/szkody-na-nieruchomosci.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#1 `logo-votum-network-przedstawiciel-400x284-1.jpg`).
86. **`uslugi/szkody-na-nieruchomosci.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#2 `votum-scale-agency-.png`).
87. **`uslugi/wypadki-komunikacyjne.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#1 `logo-votum-network-przedstawiciel-400x284-1.jpg`).
88. **`uslugi/wypadki-komunikacyjne.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#2 `votum-scale-agency-.png`).
89. **`uslugi/wypadki-przy-pracy.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#1 `logo-votum-network-przedstawiciel-400x284-1.jpg`).
90. **`uslugi/wypadki-przy-pracy.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#2 `votum-scale-agency-.png`).
91. **`uslugi/wypadki-w-rolnictwie.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#1 `logo-votum-network-przedstawiciel-400x284-1.jpg`).
92. **`uslugi/wypadki-w-rolnictwie.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#2 `votum-scale-agency-.png`).
93. **`wiedza/drobne-pekniecia-szkody-gornicze.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#1 `logo-votum-network-przedstawiciel-400x284-1.jpg`).
94. **`wiedza/drobne-pekniecia-szkody-gornicze.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#2 `votum-scale-agency-.png`).
95. **`wiedza/index.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#1 `logo-votum-network-przedstawiciel-400x284-1.jpg`).
96. **`wiedza/index.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#2 `votum-scale-agency-.png`).
97. **`wiedza/kredyt-pln-dokumenty-skd.html`** — Nadano dostępną nazwę wcześniej nieopisanej nawigacji (nav 1).
98. **`wiedza/renta-powypadkowa-dokumenty.html`** — Nadano dostępną nazwę wcześniej nieopisanej nawigacji (nav 1).
99. **`wiedza/sluzebnosc-przesylu-slup-na-dzialce.html`** — Nadano dostępną nazwę wcześniej nieopisanej nawigacji (nav 1).
100. **`wiedza/swiadczenie-wspierajace-2026-wzon-zus.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#1 `logo-votum-network-przedstawiciel-400x284-1.jpg`).
101. **`wiedza/swiadczenie-wspierajace-2026-wzon-zus.html`** — Dodano `referrerpolicy="no-referrer"` do zewnętrznego obrazu (#2 `votum-scale-agency-.png`).
102. **`wiedza/swiadczenie-wspierajace-dokumenty.html`** — Nadano dostępną nazwę wcześniej nieopisanej nawigacji (nav 1).
103. **`wiedza/swiadczenie-wspierajace-wzon-zus.html`** — Nadano dostępną nazwę wcześniej nieopisanej nawigacji (nav 1).
104. **`wiedza/szkody-gornicze-drobne-pekniecia.html`** — Nadano dostępną nazwę wcześniej nieopisanej nawigacji (nav 1).
105. **`wiedza/ugoda-z-kopalnia-co-sprawdzic.html`** — Nadano dostępną nazwę wcześniej nieopisanej nawigacji (nav 1).
106. **`wiedza/wypadek-przy-pracy-pierwsze-kroki.html`** — Nadano dostępną nazwę wcześniej nieopisanej nawigacji (nav 1).

## Realizacja techniczna i kontrola

- `scripts/media-navigation-quality.mjs` modyfikuje wyłącznie brakujące atrybuty, bez usuwania grafik lub odnośników.
- `scripts/build.mjs` i `scripts/preview.mjs` stosują te same reguły do wersji produkcyjnej i testowej.
- `scripts/test-media-navigation-quality.mjs` weryfikuje wszystkie 47 podstron, brak duplikacji poprawek po ponownym wykonaniu, zachowanie obrazów i nawigacji oraz co najmniej 100 indywidualnie identyfikowalnych zmian.
- Automatyczny raport: `IMPROVEMENTS_SECOND_ROUND_OK {"pages":47,"total":106,"kindTotals":{"external-image-privacy":67,"lazy-social-icon":10,"low-priority-social-icon":10,"nonblocking-image-decoding":8,"named-navigation-landmark":11}}`.
- Naprawiono również osobną regresję testów przeglądarkowych: selektor listy kontrolnej formularza pomija nowy odnośnik planu przygotowań. Tę naprawę traktujemy jako **dodatkową** i nie wliczamy do 106.

**Bezpieczeństwo wdrożenia:** nie dodano skryptów śledzących, płatnych usług, pól formularzy ani obietnic wyników prawnych. Nie dokonano automatycznej wysyłki zgłoszeń. Zmiany atrybutów grafik nie potwierdzają licencji na użycie znaków podmiotów zewnętrznych.
