# Darmowy asystent strony i przejęcie rozmowy przez konsultanta

## Co już działa w kodzie
- Plik `v2/chat-assistant.js` tworzy lokalny panel wyboru 5 usług.
- Udziela wcześniej przygotowanych odpowiedzi bez modelu AI, konta i transmisji danych do podmiotów trzecich.
- Pokazuje odnośnik do szczegółów usługi, telefonu i formularza mailto.
- Przycisk „Porozmawiaj z konsultantem” **nie udaje połączenia na żywo**: dopóki usługa nie jest podłączona, wyjaśnia, że czat na żywo jest niedostępny.
- Panel jest osadzony na stronie głównej i 5 głównych podstronach.

## Bezpłatny live chat — tawk.to
Oficjalny cennik i FAQ: https://www.tawk.to/faqs/ . Według dostawcy bezpłatne są: widget, aplikacje mobilne/desktopowe, obsługa własnych agentów, nieograniczona liczba agentów i rozmów. Płatne mogą być dodatki, np. wynajęty agent lub usunięcie brandingu. **Nie zakładamy, że AI Assist/bot generatywny jest bezpłatny.**

### Konfiguracja po utworzeniu konta
1. Utwórz konto na https://www.tawk.to/ i dodaj witrynę „Twoja Sprawa”.
2. Wybierz aplikację mobilną tawk.to i włącz powiadomienia. Dzięki temu możesz odpowiadać jako konsultant w czasie rzeczywistym.
3. Skopiuj **publiczny identyfikator widgetu** lub link Direct Chat z panelu tawk.to. Nie przekazuj haseł ani tokenów administracyjnych.
4. Zweryfikuj z dostawcą lokalizację przechowywania danych, transfery poza EOG, umowę powierzenia, retencję i listę podprocesorów. Uzupełnij politykę prywatności przed załadowaniem zewnętrznego skryptu.
5. Po weryfikacji skonfiguruj widget na stronie. Asystent ma już obsługę `window.Tawk_API.maximize()` i opcjonalnego linku Direct Chat (`data-live-chat-url`).
6. Przetestuj rozmowę w dwóch przeglądarkach: klient anonimowy i konsultant w aplikacji mobilnej; sprawdź także stan offline.

## RODO i ograniczenia
- Do czasu uzupełnienia informacji RODO **nie osadzać automatycznie zewnętrznego skryptu** na każdej odsłonie.
- Nie zbierać przez bot PESEL, szczegółowych danych o zdrowiu, dokumentów i załączników.
- Czat lokalny to nawigator tematyczny, a nie generatywny model AI ani doradca prawny.
- Nie pokazywać „konsultant online” bez sygnału dostępności od rzeczywistego dostawcy.
- Rozważ wczytanie skryptu live chat dopiero po świadomym kliknięciu klienta, aby ograniczyć transmisję danych do dostawcy.
