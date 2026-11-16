# Konsolidacja CSS podstron — raport wdrożeniowy

Data: 16.11.2026.

## Cel

Strona główna korzysta z jednego pliku CSS. Na podstronach usług podstawowy CSS i warstwa premium występują we wszystkich sekcjach, ale dodatkowe warstwy (kontakt, formularze, nawigacja, kontrast, marka) potrafiły wymagać 8 kolejnych zapytań. Nowy builder scala dodatki w jeden plik o nazwie `layers-<skrót SHA-256>.css`, pozostawiając bazowy `styles.css` i współdzielony `premium-v2.css` osobno. Dzięki temu krytyczne podstrony mają docelowo trzy żądania o CSS zamiast dziesięciu.

## Ograniczenia i dowody

- Zachowana jest oryginalna kolejność reguł i ponowne wykorzystanie głównych stylów w cache przeglądarki.
- Przy nietypowych deklaracjach `rel=stylesheet`, stylach inline, `@import` lub `@charset` optymalizacja zostaje pominięta zamiast ryzykować zmianę widoku.
- Dla wszystkich arkuszy pozostają osobne pliki źródłowe — ułatwia to dalszą edycję.
- Zawartość pakietu ma SHA-256 w nazwie; test sprawdza zgodność nazwy z bajtami pliku.
- Bez zmian w kontakcie, Web3Forms, danych klienta i kolejności trzech wyróżnionych usług.
- GitHub Actions uruchamia test 1000 kontroli produkcyjnych, test pakietów CSS i testy 47 stron × 2 rozdzielczości; liczb tych nie należy interpretować jako liczby niezależnych edycji.

## Dalsze prace

Zweryfikować w praktyce Core Web Vitals i rzeczywisty wzrost liczby zgłoszeń. Nie można wywnioskować ich zmian z samego spadku liczby żądań CSS.

## Zmierzony zakres w buildzie GitHub Actions

- **42 z 47 podstron** mają scalenie dodatkowych arkuszy.
- **224 żądania CSS mniej** przy pojedynczym przejściu kolejno przez 42 zoptymalizowane podstrony, bez uwzględnienia cache. Dla pojedynczej podstrony redukcja jest mniejsza i zależy od jej stylów.
- **22 unikatowe pakiety warstw** o nazwach zawierających fragment SHA-256.
- **1000/1000** kontroli HTML/SEO/odnośników/usług w kandydacie wydania.
- Cache-Control `immutable` jest zarezerwowany wyłącznie dla plików nazwanych skrótem treści; polityka pozostałych zasobów pozostaje bez zmian.
