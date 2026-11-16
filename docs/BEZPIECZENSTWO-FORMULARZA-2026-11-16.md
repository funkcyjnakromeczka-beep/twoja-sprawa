# Lokalna ochrona danych w formularzu Twoja Sprawa

Data: 16.11.2026.

## Cel
Formularze zawierają wyraźne informacje, aby na pierwszym etapie nie przesyłać numeru PESEL, danych medycznych ani skanów dokumentów. Dodana kontrola wykrywa **niektóre przypadki** przypadkowego wklejenia pełnego numeru PESEL do opisu lub pola miejscowości.

## Mechanizm
- Lokalny test zgodności: 11 cyfr, suma kontrolna i poprawna data urodzenia kodowana przez PESEL.
- Gdy kandydat zostanie wykryty, pojawia się czytelne ostrzeżenie, a formularz nie wyśle zgłoszenia do Web3Forms do czasu ręcznej poprawy.
- Osoba wypełniająca formularz może jednym kliknięciem zastąpić wykryty numer PESEL w opisie informacją „[numer usunięty]”. Nie usuwamy innych liczb ani danych bez działania użytkownika.
- Kontrola działa wyłącznie w przeglądarce — nie przesyła żadnych informacji do dodatkowych usług, nie zapisuje treści w cookies ani Local Storage.
- Zgodność z PESEL nie oznacza pewności co do tożsamości, a brak ostrzeżenia **nie gwarantuje**, że opis jest wolny od danych osobowych, medycznych lub numerów dokumentów.

## Regresje
Dodatkowy test w Chromium symuluje poprawny PESEL, kontroluje brak POST, ręczne usunięcie, pole miejscowości i ciąg 11 cyfr z niepoprawną sumą. Inne istniejące testy nadal weryfikują rzeczywistą funkcję Web3Forms na odpowiedziach mockowanych.
