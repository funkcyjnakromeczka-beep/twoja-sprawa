# Twoja Sprawa — 50 kroków rozwoju w jednej sesji

Data: 10 listopada 2026 r. Są to odrębne kroki robocze i kontrole zrealizowane w jednej rozmowie, **nie 50 niezależnych uruchomień automatycznego zadania**. Zmiany zapisano na GitHub `main`; automatyczne testy źródeł przechodziły pomyślnie po naprawie wykrytych problemów. Oficjalny release i odblokowanie indeksacji pozostają wstrzymane do zatwierdzeń.

1. **Audyt drzewa repozytorium:** Sprawdzono rzeczywistą strukturę 39 plików HTML i skryptów.
2. **Ustalenie źródła produkcyjnego:** Pracowano w v2/, nie w archiwalnym głównym index.html.
3. **Inwentaryzacja poradników:** Zidentyfikowano istniejące artykuły i ich adresy.
4. **Biblioteka wiedzy — wygląd:** Powstał knowledge-hub.css z jasnymi kartami i kontrastowym wyróżnieniem.
5. **Biblioteka wiedzy — mechanizm:** Powstał knowledge-hub.js bez cookies i zewnętrznego API.
6. **Biblioteka wiedzy — strona:** Przebudowano wiedza/index.html na 10 kart i pięć kategorii.
7. **Test filtrów:** Dodano test-knowledge-hub.mjs.
8. **Test CI biblioteki:** Do audytu GitHub Actions dodano testy biblioteki.
9. **Zrzuty wiedzy:** Do workflow zrzutów dodano pliki biblioteki.
10. **Polskie znaki wyszukiwania:** Naprawiono normalizację Unicode i literę ł.
11. **Kontakt — wygląd:** Powstał contact-hub.css ze zdjęciami i kartami kontaktowymi.
12. **Kontakt — treść:** Przebudowano kontakt.html, dodano zdjęcia i dwie odrębne ścieżki usług.
13. **Zgodność kart z audytem:** Przywrócono stabilną klasę contact-specialist, dodano data-persona.
14. **Styling persony:** Dopasowano zielony wariant Pauliny do data-persona.
15. **Test ekranów kontaktu:** Dodano widok mobilny kontaktu do Playwright.
16. **Test filtru w Chromium:** Sprawdzane są wyszukiwanie, kategorie i stan braku wyników.
17. **Narzędzia czytania — JS:** Utworzono article-accessibility.js.
18. **Narzędzia czytania — CSS:** Utworzono article-accessibility.css i responsywny układ.
19. **Poradnik: drobne pęknięcia:** Do artykułu dodano narzędzia czytania.
20. **Poradnik: kredyty PLN:** Do artykułu dodano narzędzia czytania.
21. **Poradnik: renta powypadkowa:** Do artykułu dodano narzędzia czytania.
22. **Poradnik: słup na działce:** Do artykułu dodano narzędzia czytania.
23. **Poradnik: świadczenie 2026:** Do artykułu dodano narzędzia czytania.
24. **Poradnik: dokumenty WZON:** Do artykułu dodano narzędzia czytania.
25. **Poradnik: WZON i ZUS:** Do artykułu dodano narzędzia czytania.
26. **Poradnik: szkody i rysy:** Do artykułu dodano narzędzia czytania.
27. **Poradnik: ugoda z kopalnią:** Do artykułu dodano narzędzia czytania.
28. **Poradnik: wypadek w pracy:** Do artykułu dodano narzędzia czytania.
29. **Starsze szablony artykułów:** Poprawiono selektory CSS działające także bez klasy premium-subpage.
30. **Test powiększania i druku:** Utworzono test-article-accessibility.mjs.
31. **CI narzędzi dostępności:** Do workflow dodano test plików i funkcjonalności 10 artykułów.
32. **Polityka SEO strony błędu:** 404.html wyłączono z przyszłego indeksowania.
33. **Testy zasad SEO:** Dopasowano testy do mapy wiedzy i wykluczenia strony 404.
34. **Link biblioteki na głównej:** Dodano drogę do całego katalogu poradników.
35. **Wygląd CTA biblioteki:** Dodano kontrastowy hub-all-link w knowledge-articles.css.
36. **Bezpieczny release — test:** Utworzono test-release-readiness.mjs bez publikowania strony.
37. **Kontrola release w CI:** Test włączono do GitHub Actions.
38. **Test powiększania w Chromium:** Dodano zrzut i test włączania/wyłączania dużego tekstu.
39. **Ścieżki screenshot workflow:** Podpięto zmiany kontaktu i narzędzi czytania pod zrzuty.
40. **Naprawa zakresu audytu:** Naprawiono zliczanie pięciu skrótów poradników po dodaniu nowej sekcji.
41. **Reset wyszukiwarki — JS:** Dodano wyczyszczenie hasła i aktualnego filtru.
42. **Reset wyszukiwarki — UI:** Dodano semantyczny przycisk i ograniczenie długości pola.
43. **Reset wyszukiwarki — CSS:** Dodano stany focus i hidden.
44. **Reset wyszukiwarki — test:** Dodano test resetu, widoczności kart i przywrócenia fokusu.
45. **Katalog AI:** Rozszerzono llms.txt o bibliotekę poradników i funkcje dostępności.
46. **Dokumentacja źródeł:** Zaktualizowano v2/README.md i listę testów.
47. **Test resetu w Playwright:** Dodano weryfikację 10 wyników po resecie.
48. **Strategia SEO i GEO:** Zaktualizowano rzeczywiste ścieżki HTML oraz etap indeksacji.
49. **Checklista publikacyjna:** Dodano kontrolę nowych funkcji i otwartych zatwierdzeń.
50. **Końcowa walidacja:** GitHub Actions: testy kodu i Playwright zakończone sukcesem; zewnętrzny robots.txt nadal blokuje indeksację.

## Ograniczenia
- Automatyczne testy nie sprawdzają rzeczywistego doręczenia formularza do Outlooka.
- Produkcyjne `robots.txt` na bieżącym hostingu wciąż zawiera `Disallow: /` — indeksacja jest wyłączona.
- Wymagane: zgody na zdjęcia, kontrola materiałów partnerów, polityka prywatności, prawidłowa konfiguracja produkcyjnej kompilacji Cloudflare.
- Brak gwarancji indeksacji lub rekomendacji w odpowiedziach systemów AI.
