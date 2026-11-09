# Web3Forms — uruchomienie formularza Twoja Sprawa

## Status
Kod frontendowy w `v2/contact.js` jest przygotowany, lecz pozostaje nieaktywny do czasu skonfigurowania klucza i uzupełnienia polityki prywatności. Bez klucza działa dotychczasowy formularz `mailto:`.

## Uruchomienie bez własnej domeny
1. Otwórz https://web3forms.com/ i utwórz bezpłatny klucz dostępu dla `twojasprawa_votum@outlook.com`.
2. Odbierz wiadomość weryfikacyjną w Outlook i potwierdź adres, jeśli usługa tego wymaga.
3. Uzupełnij politykę prywatności: administrator danych, cele, podstawa prawna, okres przechowywania, odbiorcy/podmioty przetwarzające (w tym Web3Forms), prawa osób i kontakt. Zweryfikuj faktyczne warunki przetwarzania danych u dostawcy.
4. Dodaj do `<head>` każdej podstrony korzystającej z formularza: `<meta name="web3forms-access-key" content="KLUCZ_DOSTEPU">`. Klucz dostępu Web3Forms jest używany po stronie przeglądarki i nie powinien być traktowany jak prywatny sekret; sprawdź zabezpieczenia i ograniczenia u dostawcy.
5. Po wdrożeniu przetestuj zgłoszenie z testowymi danymi: sprawdź skrzynkę odbiorczą, spam, temat, polskie znaki i odpowiedź na adres nadawcy. Test musi zostać potwierdzony przed kampanią.

## Bezpieczeństwo i ograniczenia
- Nie zbieramy PESEL, dokumentów medycznych ani szczegółowych danych zdrowotnych.
- Klient powinien być świadomy przekazania danych przez zewnętrzny formularz; zweryfikuj politykę prywatności i umowę powierzenia z dostawcą.
- `botcheck` jest tylko podstawowym honeypotem, nie pełnym zabezpieczeniem przed spamem. Można rozważyć Turnstile, jeśli Web3Forms wspiera daną integrację.
- Formularz informuje o przyjęciu przez API, nie o gwarantowanym doręczeniu do Outlooka.
- Nie publikuj w witrynie haseł do poczty ani innych sekretów.
- Przed dodaniem klucza nie włączaj automatycznej wysyłki.

## Dotychczasowa integracja Cloudflare/Resend
Plik `functions/api/contact.js` pozostaje w repozytorium jako nieaktywna alternatywa. Nie jest używany przez formularz Web3Forms. W przyszłości można go usunąć po weryfikacji działania wybranej usługi.
