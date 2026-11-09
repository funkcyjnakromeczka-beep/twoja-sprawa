# Scenariusze odbiorowe formularza kontaktowego — Twoja Sprawa

## Status
Wersja demonstracyjna: formularz przygotowuje e-mail w aplikacji użytkownika. Backend `functions/api/contact.js` istnieje, ale **nie jest podłączony do frontendu ani wdrożony**. Nie uznawać automatycznego doręczania za gotowe.

## Kontrola pól
| Test | Oczekiwany wynik |
|---|---|
| Każda z 12 podstron usług | Formularz widoczny, właściwa usługa wybrana automatycznie |
| Strona główna | Formularz widoczny, użytkownik wybiera usługę |
| Puste imię, miasto, telefon lub e-mail | Przeglądarka blokuje przygotowanie wiadomości |
| Niepoprawny e-mail | Przeglądarka pokazuje błąd |
| Brak zaznaczenia potwierdzenia | Formularz nie uruchamia aplikacji pocztowej |
| Opis pusty | Wiadomość może zostać przygotowana z prośbą o kontakt |
| Wypełniony formularz | Otwiera się klient poczty z danymi i adresem twojasprawa_votum@outlook.com |
| Brak skonfigurowanej aplikacji pocztowej | Nie wolno sugerować, że zgłoszenie dotarło |

## Testy API przed włączeniem
- Bez sekretów środowiskowych endpoint odpowiada 503.
- Żądania z obcej domeny otrzymują 403.
- Dane przekraczające limit 6000 bajtów otrzymują 413.
- Niepoprawny JSON i Content-Type są odrzucane.
- Obsługiwane są wszystkie 13 kategorii zgodnych z frontendem.
- Imię, miejscowość, telefon i poprawny e-mail są wymagane.
- Weryfikacja Cloudflare Turnstile odbywa się na serwerze.
- Błąd Resend nie może zostać przedstawiony jako sukces.
- Po prawidłowej wysyłce wiadomość trafia do docelowej skrzynki, a odpowiedź można wysłać na adres nadawcy.
- Weryfikacja nadawcy i domeny w Resend, limity wysyłek i ochrona przed nadużyciami muszą być sprawdzone.

## Dane osobowe i zgody
- Potwierdzić rzeczywistego administratora, cel, podstawę prawną, okres retencji i odbiorców danych.
- Dostosować klauzulę do hostingu Cloudflare, usługi pocztowej Resend i ewentualnego tawk.to.
- Oddzielić akceptację informacji o prywatności od dobrowolnej zgody marketingowej, jeżeli marketing miałby być prowadzony.
- Nie zbierać PESEL, dokumentów medycznych ani pełnej dokumentacji sprawy w otwartym formularzu.
- Przetestować czytelność pól, obsługę klawiaturą i komunikaty błędów na telefonie.

## Warunek publikacji
Nie ustawiać `FORM_APPROVED=1` do czasu pozytywnego testu rzeczywistej wysyłki i zatwierdzenia klauzuli informacyjnej.
