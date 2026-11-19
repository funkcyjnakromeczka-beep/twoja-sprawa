# Pomiar skuteczności bezpłatnych kampanii — Twoja Sprawa

**Data wdrożenia:** 19 listopada 2026 r.  
**Cel:** rozpoznać, które kanały pozyskują kwalifikowane kontakty i klientów, bez śledzenia osób i bez płatnych usług analitycznych.

## Dane i ich źródło

Raport dostępny w istniejącym generatorze linków kampanii, w sekcji „Ile zgłoszeń przynoszą Twoje kampanie?”:
`https://twoja-sprawa.pages.dev/narzedzia/linki-kampanii#wyniki-kampanii`.

Źródłem prawdy pozostaje **potwierdzony wpływ zgłoszenia** (Web3Forms, telefon, e-mail) i **faktyczny stan sprawy** (CRM lub własna ewidencja). Generator linków przygotowuje `utm_source`, `utm_medium`, `utm_campaign` i `utm_content` w adresach URL; atrybucja formularza może dołączyć je do zgłoszenia. Nie jest to narzędzie liczące kliknięcia, odsłony ani wiadomości automatycznie. W przypadku braku oznaczenia lub wiarygodnego potwierdzenia źródła trzeba użyć opcji `nieoznaczone`.

## Definicje KPI

| Nazwa | Definicja | Obliczenie | Interpretacja |
| --- | --- | --- | --- |
| Otrzymane zgłoszenia | Unikalni potencjalni klienci, którzy skutecznie nawiązali kontakt w danym dniu dla usługi, kanału i kampanii, po ręcznej deduplikacji | Suma `leads` | **Nie** liczba odwiedzin ani kliknięć |
| Zgłoszenia kwalifikowane | Zgłoszenia pasujące do wstępnych kryteriów danej usługi | Suma `qualified` | Powinny być podzbiorem otrzymanych zgłoszeń |
| Podpisane umowy | Potwierdzone zawarte umowy w ramach tych zgłoszeń | Suma `clients` | Nie prognoza, nie samo przesłanie formularza |
| Udział kwalifikowanych | Odsetek otrzymanych zgłoszeń zakwalifikowanych do dalszego działania | `qualified / leads × 100%` | Nie oznacza współczynnika konwersji strony |
| Umowy / zgłoszenia | Odsetek zgłoszeń, które doprowadziły do zawarcia umowy | `clients / leads × 100%` | Przy małej liczbie zgłoszeń jest bardzo niestabilny |

**Zasada rozliczenia:** jedna pozycja to `data + usługa + źródło + nazwa kampanii`. Ponowne dodanie takiej samej pozycji zastępuje jej liczby, a nie dodaje drugi raz. Przy przechodzeniu sprawy do kolejnego etapu aktualizuj dzienny agregat, a nie dopisuj drugiego klienta.

**Ograniczenie kohortowe:** narzędzie nie łączy indywidualnego zgłoszenia z późniejszą umową i nie rozwiązuje automatycznie opóźnienia między datą pierwszego kontaktu a datą podpisania. Bez spójnego sposobu przypisywania umów do zgłoszeń w CRM traktuj wskaźniki jako uproszczoną ewidencję ręczną, nie ścisłą analizę kohortową.

## Ochrona danych

- Nie wpisuj do raportu imion, nazwisk, numerów telefonów, e-maili, identyfikatorów klientów, danych zdrowotnych, rachunków, adresów ani opisów spraw.
- Wartości kampanii muszą odpowiadać prostym identyfikatorom UTM: `a-z`, `0-9`, `_`, `-`, maksymalnie 40 znaków.
- Wpisy są przechowywane **wyłącznie w pamięci otwartej karty**. Nie jest używany `localStorage`, cookies ani zewnętrzny system analityczny. Odświeżenie usuwa dane.
- Eksport CSV generowany jest lokalnie. Zapisz go samodzielnie i przechowuj prywatnie. Import akceptuje tylko format wygenerowany przez narzędzie i zastępuje aktualny zestaw.
- Nie udostępniaj publicznie CSV, nawet gdy nie zawiera danych osobowych — wyniki sprzedaży mogą być informacją biznesową.
- Sam plik CSV nie potwierdza skutecznego doręczenia formularzy. Weryfikuj je w rzeczywistym kanale odbioru.

## Rekomendowana kontrola

Raz w tygodniu sprawdź źródła z największą liczbą **kwalifikowanych** kontaktów i zawartych umów. Uzupełnij brakujące źródła, porównaj kanały przy podobnych nakładach pracy i zachowaj eksport CSV. Nie wyznaczaj celów liczbowych ani wniosków o skuteczności kanału bez prawdziwych danych i odpowiednio długiej obserwacji.
