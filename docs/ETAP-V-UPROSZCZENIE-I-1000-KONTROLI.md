# Etap V — uporządkowanie strony głównej i 1000 kontroli

**Data:** 11 listopada 2026 r.
**Serwis:** https://twoja-sprawa.pages.dev/
**Repozytorium:** funkcyjnakromeczka-beep/twoja-sprawa (gałąź `main`).

## Zmiany wykonane

1. **Hierarchia strony głównej:** po dwóch wyróżnionych projektach odwiedzający widzi wszystkie sześć usług, a następnie przewodnik, zespół i kontakt. Wcześniej długa prezentacja zespołu oddzielała hero od listy usług.
2. **Zrównoważony wygląd:** przy szerokości ≥1100 px siatka 12-kolumnowa wyświetla dwie flagowe oferty w pierwszym rzędzie i cztery kolejne w drugim. Węższe ekrany przechodzą na dwie kolumny, telefony na jedną; cztery drugoplanowe karty są niższe na telefonie.
3. **Pomoc w wyborze:** link `#dobierz-pomoc` otwiera natywny, zamknięty element `details`, zamiast przewijać do nieotwartego panelu. Działa po kliknięciu oraz przy wejściu z zakładki.
4. **Pozycjonowanie:** `Service` JSON-LD rozróżnia analizę kredytów frankowych CHF od Sankcji Kredytu Darmowego (SKD), bez twierdzeń o automatycznym prawie do roszczenia.
5. **Testy regresji:** do CI dołączono 1000 sekwencyjnych testów 62 rekordów wyszukiwania: 16 testów na rekord (m.in. prawdziwy adres, tytuł, opis, kategoria, normalizacja języka polskiego, poprawność wyszukiwania) i osiem kontroli ogólnych. Nie wysyłają formularzy ani innych danych.

## Raporty

- 1000/1000 testów lokalnych oraz istniejące 500/500 i audyt HTML: https://github.com/funkcyjnakromeczka-beep/twoja-sprawa/actions/runs/42943560526
- Testy Chromium: 26 tras, mobilna ścieżka frankowiczów, otwieranie nawigatora i pozycjonowanie 2+4: https://github.com/funkcyjnakromeczka-beep/twoja-sprawa/actions/runs/42943695013
- Test aktualnej strony Cloudflare: 18 zasobów, 38 adresów sitemap, 24 odpowiedzi FAQ, nowy układ strony głównej: https://github.com/funkcyjnakromeczka-beep/twoja-sprawa/actions/runs/42943820709

## Uczciwe ograniczenia

- To **1000 automatycznych sprawdzeń**, a nie 1000 oddzielnych zmian, kreatywnych sesji czy 1000 wdrożeń.
- Nie prowadzono sześciogodzinnej, nieprzerwanej pracy asynchronicznej. Próba uruchomienia sześciu kolejnych sesji co godzinę w ChatGPT zakończyła się limitem **5 z 5 aktywnych automatyzacji** — nie wyłączono żadnego z istniejących zadań.
- Zmiany kodu i publikacji technicznej nie są dowodem zwiększenia liczby leadów. Nie są dostępne aktualne raporty ruchu ani indeksacji z Google Search Console.
- Strona przechowuje dotychczasowe zgody właściciela na materiały i dotychczasową działającą konfigurację formularza. Nie wysyłano żadnych testowych zgłoszeń klienta.

## Kolejny sensowny kierunek

Połączyć Google Search Console / Cloudflare Web Analytics z dostępem do danych, aby porównać wejścia, wyświetlenia, kliknięcia i formularze przed i po zmianach. Unikać dodawania nowych sekcji bez dowodów, że poprawiają drogę do kontaktu.
