# Twoja Sprawa — druga seria 50 kolejnych działań kontrolnych

**Termin prac:** 11 listopada 2026 r.  
**Repozytorium:** `funkcyjnakromeczka-beep/twoja-sprawa`, gałąź `main`.

Użytkownik poprosił o kontynuowanie kreatywnego rozwoju strony bez ręcznego ponawiania polecenia i o 50 powtórzeń. W ramach tej sesji dodano nową funkcję i przeprowadzono **50 odrębnych, kolejno wykonywanych kontroli projektu**. Nie oznacza to 50 samodzielnych tur rozmowy ani 50 oddzielnych publikacji.

## Funkcja dostarczona w tej serii

- Dodano `v2/plan-dzialania.html` — generator planu pierwszych kroków z pięcioma obszarami pomocy i dziewięcioma wariantami etapu sprawy.
- Dodano `v2/plan-dzialania.js` — listy kontrolne, postęp oznaczania, druk, reset, bezpośredni numer właściwej osoby i przekazanie do formularza. Nie używa cookies, localStorage ani połączeń sieciowych.
- Dodano `v2/plan-dzialania.css` — czytelność PC/telefon oraz wydruk.
- Połączono generator z przewodnikiem na stronie głównej, dwiema najważniejszymi podstronami i biblioteką poradników.
- Dodano testy `scripts/test-action-plan.mjs` oraz przeglądarkowy test przekazania wyboru do formularza.
- W artykule o świadczeniu wspierającym poprawiono wskazanie trzech miesięcy **od ostateczności decyzji WZON** i odnośnik do ZUS, na podstawie aktualnych materiałów urzędowych.

## 50 kolejnych kontroli

1. Dwa główne projekty w hero
2. Świadczenie wspierające w hero
3. Szkody górnicze w hero
4. Priorytet świadczenia w nawigacji
5. Priorytet szkód w nawigacji
6. Zidentyfikowana osoba Wojciech
7. Zidentyfikowana osoba Paulina
8. Portret Wojciecha na stronie głównej
9. Portret Pauliny na stronie głównej
10. Formularz na stronie głównej
11. FAQ na stronie głównej
12. Link do generatora planu
13. Bezpośredni kontakt telefoniczny Wojciech
14. Bezpośredni kontakt telefoniczny Paulina
15. Techniczny pasek logotypów obydwu partnerów
16. Podstrona szkód z własnym tytułem
17. Podstrona świadczenia z własnym tytułem
18. Plan ze strony szkód
19. Plan ze strony świadczenia
20. Formularze na obu głównych podstronach
21. Zdjęcia osób na dwóch podstronach
22. Dwie karty kontaktu z wizerunkami
23. Rozróżnienie tematów przez formularz
24. Formularz obsługiwany przez Web3Forms
25. Honeypot przeciw przypadkowym botom
26. Ograniczenie czasu żądania formularza
27. Awaryjny kontakt przez e-mail
28. Zgoda na kontakt w formularzu
29. Telefon lub e-mail: dynamiczny wymóg
30. Formularz przyjmuje wybór z planu
31. Plan ma kategorię szkód górniczych
32. Plan ma kategorię świadczeń
33. Plan ma kategorię rent
34. Plan ma kategorię kredytów PLN
35. Plan ma kategorię przesyłu
36. Plan obsługuje propozycję ugody
37. Plan obsługuje odmowę kopalni
38. Plan obsługuje decyzję WZON
39. Plan obsługuje odwołanie
40. Checklista z prawdziwym postępem
41. Drukowanie planu z poziomu strony
42. Reset planu i brak zapisanych danych
43. Plan nie wykonuje połączeń sieciowych
44. Plan przekazuje tylko rozpoznane źródła UTM
45. Generator jasno informuje o prywatności
46. Biblioteka zawiera dziesięć kart
47. Biblioteka ma pięć filtrów usług
48. Biblioteka szuka bez polskich znaków
49. Aktualna informacja prawna: ZUS i ostateczność decyzji
50. Bezpieczne wydanie: brak indeksacji podglądu i strony 404

## Wynik i granice weryfikacji

- **50/50 kontroli** zakończyło się powodzeniem w GitHub Actions: https://github.com/funkcyjnakromeczka-beep/twoja-sprawa/actions/runs/42922266537
- Testy Chromium potwierdziły przejście od planu szkód górniczych (etap ugody) do formularza z zachowaniem kodu etapu, numeru osoby kontaktowej oraz źródła kampanii: https://github.com/funkcyjnakromeczka-beep/twoja-sprawa/actions/runs/42921697055
- Weryfikacja nie obejmuje wysyłania rzeczywistych leadów ani logowania do konta Cloudflare.
- Nadal nie należy uruchamiać indeksacji i produkcyjnego release bez zatwierdzenia praw do zdjęć i logotypów, opisów usług, polityki prywatności oraz rzeczywistego testu Web3Forms. Wdrożenie jest osobnym procesem.
