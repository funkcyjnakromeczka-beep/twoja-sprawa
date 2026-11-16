# Udostępnianie sześciu usług na stronie Twoja Sprawa

Data: 16 listopada 2026 r.

## Co zostało wdrożone
Na podstronach szkód górniczych, świadczenia wspierającego, Sankcji Kredytu Darmowego, rent powypadkowych, kredytów frankowych i służebności przesyłu umieszczono panel polecania publicznej informacji.

- Stały publiczny link do konkretnej usługi działa bez JavaScript.
- Jeśli działa JavaScript, widoczny jest przycisk „Udostępnij lub skopiuj link”.
- Na telefonie preferuje natywne udostępnianie, w przeciwnym razie schowek; przy odmowie dostępu pojawia się pole z zaznaczonym adresem.
- Udostępniany URL jest bez parametrów kampanii, danych formularza, numerów telefonu osób trzecich i historii wyszukiwania.
- Żaden moduł udostępniania nie wysyła leadów ani nie dokonuje analityki. Powiadomienia są lokalne.
- Panel jest umieszczony bezpośrednio przed formularzem, ale pozostawia bez zmian formularz, wybór doradcy i linki kontaktowe.

## Testy
Plik `scripts/test-service-share.mjs` działa w GitHub Actions na zbudowanych plikach.
Scenariusz Chromium w `scripts/test-browser-flows.mjs` weryfikuje sześć tras, ekran 390px, prawidłowe URL bez parametrów oraz mockowane udostępnianie i awaryjne kopiowanie.

## Uczciwa interpretacja
Zaliczenie 1000 kontroli wydania nie jest równoważne z wdrożeniem 1000 poprawek. Nie znamy faktycznej liczby poleceń ani ich wpływu na pozyskanie klientów bez danych biznesowych. Koszt usług zewnętrznych: 0 zł.
