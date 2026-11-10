# Twoja Sprawa — trzecia seria 50 kontroli i prac

**Data:** 11 listopada 2026 r.  
**Repozytorium:** `funkcyjnakromeczka-beep/twoja-sprawa` (gałąź `main`).

## Co zostało zbudowane

- Nowa podstrona `v2/faq.html` z 24 pytaniami i odpowiedziami, uporządkowanymi według sześciu kategorii: szkody górnicze (6), świadczenie wspierające (6), renty (3), kredyty PLN/SKD (3), służebność przesyłu (2), kontakt i bezpieczeństwo (4).
- Lokalna wyszukiwarka i filtry (bez cookies, usług analitycznych ani przechowywania zapytań): `v2/faq.js` oraz `v2/faq.css`.
- Odnośniki do FAQ ze strony głównej, biblioteki wiedzy i dwóch głównych stron usług; możliwość otwierania filtra przez `?temat=...`.
- Test logiki: `scripts/test-faq.mjs`; test 50 kontroli: `scripts/test-50-continuations-iii.mjs`.
- Przeglądarkowa kontrola responsywności i działania filtrów: `scripts/screenshot-preview.mjs`.

## Wykaz 50 sekwencyjnych kontroli

1. FAQ: Czy małe pęknięcie elewacji może być szkodą górniczą?
2. FAQ: Co fotografować przy podejrzeniu szkód górniczych?
3. FAQ: Czy nierówna kostka brukowa również wymaga dokumentacji?
4. FAQ: Czy po wykonaniu wzmocnień fundamentów można zgłosić nową szkodę?
5. FAQ: Na co zwrócić uwagę przed podpisaniem ugody z kopalnią?
6. FAQ: Czy mapa MIDAS sama potwierdza prawo do odszkodowania?
7. FAQ: Czym różni się decyzja WZON od decyzji ZUS?
8. FAQ: Czy w 2026 r. świadczenie wspierające obejmuje 70–77 punktów?
9. FAQ: Czy stopień niepełnosprawności automatycznie daje prawo do świadczenia?
10. FAQ: Kiedy złożyć wniosek do ZUS, aby sprawdzić możliwość wyrównania?
11. FAQ: Co jeśli nie zgadzam się z punktacją WZON?
12. FAQ: Czy wniosek o świadczenie wspierające można złożyć papierowo?
13. FAQ: Czym renta powypadkowa różni się od jednorazowego odszkodowania?
14. FAQ: Jakie dokumenty mogą pomóc w analizie renty?
15. FAQ: Czy wysokość renty od ubezpieczyciela można ponownie przeanalizować?
16. FAQ: Czy każda umowa kredytu w PLN daje prawo do sankcji kredytu darmowego?
17. FAQ: Jakie dokumenty przygotować do analizy SKD?
18. FAQ: Czy sankcję kredytu darmowego można zastosować po spłacie kredytu?
19. FAQ: Czy słup energetyczny na mojej działce oznacza automatycznie wynagrodzenie?
20. FAQ: Co przygotować, gdy przez działkę przebiega linia energetyczna?
21. FAQ: Czy pierwszy kontakt ze SuccessTree jest płatny?
22. FAQ: Czy muszę od razu wysyłać dokumentację medyczną i numer PESEL?
23. FAQ: Czy „Twoja Sprawa” jest oficjalną stroną VOTUM lub kancelarii?
24. FAQ: Jak bezpiecznie zgłosić pytanie bez użycia formularza?
25. FAQ widoczne na stronie głównej
26. FAQ połączone z biblioteką poradników
27. Link do FAQ szkód górniczych ze strony usługi
28. Link do FAQ świadczenia z właściwej podstrony
29. Pojedynczy nagłówek H1
30. Stan wyników dostępny dla czytnika ekranu
31. Filtry o poprawnym stanie aktywności
32. Dokładnie sześć kategorii pytań
33. Siedem przycisków filtrowania
34. Ograniczona długość wyszukiwanej frazy
35. Domyślnie ukryty przycisk resetu
36. Układ mobilny jest jednokolumnowy
37. Widoczna klawiaturowa nawigacja focus
38. Wyszukiwarka bez sieci i przechowywania danych
39. Rozpoznawanie polskich znaków
40. Lista bezpiecznych filtrów URL
41. Odnośniki do oficjalnych stron ZUS
42. Ochrona kart zewnętrznych
43. Trzy miesiące od ostateczności decyzji WZON
44. Informacja o zakresie czasowym materiałów
45. Ostrzeżenie o wrażliwych danych
46. Transparentne przedstawienie roli SuccessTree
47. Działający skrypt formularza na stronie kontaktowej
48. FAQ jest indeksowalne wyłącznie po zatwierdzonym release
49. Podgląd nie udostępnia indeksacji
50. Produkcyjny release wymaga trzech zatwierdzeń

## Zweryfikowane wyniki

- **50/50 kontroli pomyślnych:** https://github.com/funkcyjnakromeczka-beep/twoja-sprawa/actions/runs/42924546570
- **FAQ — test Chromium:** 24 karty, filtr szkód (6), wyszukiwanie bez znaków diakrytycznych, filtr świadczenia (6), reset. Sprawdzono również 20 widoków mobilnych/desktop: https://github.com/funkcyjnakromeczka-beep/twoja-sprawa/actions/runs/42924661661
- **Wersja dostępna w podglądzie:** https://twoja-sprawa.pages.dev/faq

## Granice zakończonych działań

Nie wysłano żadnego prawdziwego formularza ani nie zatwierdzono uprawnień do wykorzystania wizerunków i logotypów. Podgląd pozostaje zablokowany przed indeksacją poprzez `robots.txt`; pliki produkcyjnego release, sitemap i canonical powinny być sprawdzone dopiero po wdrożeniu i wymaganych zatwierdzeniach. 50 kontroli to **50 testów wykonanych po kolei**, a nie 50 odrębnych rozmów lub automatycznych przyszłych uruchomień.

## Źródła urzędowe

ZUS: https://www.zus.pl/swiadczenia/inne-swiadczenia-z-zus/wiadczenie-wspierajace-dla-osob-z-niepelnosprawnoscia (publikacja ZUS 26.05.2026); gov.pl: https://www.gov.pl/web/gov/uzyskaj-swiadczenie-wspierajace.
