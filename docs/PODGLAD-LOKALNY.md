# Podgląd roboczy — komputer i telefon

Ten proces **nie publikuje strony** w Cloudflare, Lovable ani GitHub Pages.

## Lokalny podgląd

W katalogu repozytorium, mając Node.js 20+:

```bash
node scripts/audit.mjs
node scripts/preview.mjs
npx --yes http-server dist-preview -a 127.0.0.1 -p 4173 -c-1
```

Otwórz na komputerze: http://127.0.0.1:4173/

Aby uniknąć pobierania dodatkowego pakietu, można użyć istniejącego serwera HTTP, np. `python -m http.server 4173 --bind 127.0.0.1 --directory dist-preview`.

W Chrome lub Edge otwórz Narzędzia deweloperskie → Tryb urządzenia (Ctrl+Shift+M), następnie sprawdź szerokości 360, 390, 768, 1024 i 1440 px.

## Co sprawdzić
- Nawigacja: na telefonie można przewijać menu poziomo, bez ucinania pozycji.
- Sekcja główna: złoty nagłówek, kontrast, czytelne przyciski i brak przewijania całej strony w poziomie.
- Pięć głównych usług i odnośniki do 12 podstron.
- MIDAS: przycisk otwiera oficjalny serwis w nowej karcie.
- Formularz: wszystkie pola, wybór usługi, walidacja i jawne przekierowanie do klienta poczty.
- Czat: wybór pięciu tematów, zamknięcie przyciskiem i klawiszem Escape.
- Brak skryptów śledzących i wysyłania danych przez formularz bez świadomego działania klienta.

## Ważne ograniczenia
- Podgląd ma `noindex` i plik `robots.txt` z `Disallow: /`.
- Lokalny serwer na 127.0.0.1 jest dostępny wyłącznie na danym komputerze.
- Backend e-mail i tawk.to nie są podłączone.
- Nie należy udostępniać folderu `dist-preview` jako strony produkcyjnej.
- Generator produkcyjny `scripts/build.mjs` ma osobne blokady zatwierdzenia.
