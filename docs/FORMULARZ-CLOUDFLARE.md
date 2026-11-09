# Formularz serwerowy — konfiguracja bez ujawniania sekretów

## Stan
Kod funkcji Cloudflare Pages znajduje się w `functions/api/contact.js`. Nie jest podłączony do produkcyjnego formularza. Obecny formularz na stronie nadal przygotowuje e-mail przez mailto. Kod nie był testowany na Cloudflare.

## Wymagane usługi
- Cloudflare Pages (Functions) na domenie produkcyjnej.
- Cloudflare Turnstile: widget site key na froncie, **secret key wyłącznie po stronie serwera**.
- Resend lub inny operator poczty transakcyjnej. W przykładzie użyto Resend. Wymaga konta, zatwierdzonej domeny nadawczej i konfiguracji DNS. Limity i ceny sprawdzić przed uruchomieniem.

## Sekrety / zmienne Cloudflare Pages
- `RESEND_API_KEY` — **secret**, nie zapisywać w GitHub.
- `TURNSTILE_SECRET_KEY` — **secret**, nie zapisywać w GitHub.
- `CONTACT_FROM` — nadawca z domeny zweryfikowanej w Resend, np. `Twoja Sprawa <kontakt@twojadomena.pl>` (przykład, nieistniejący adres).
- `CONTACT_TO` — `twojasprawa_votum@outlook.com`.
- `PUBLIC_ORIGIN` — dokładny origin strony, np. `https://twojadomena.pl` po ustaleniu domeny.

## Integracja frontendowa — po zatwierdzeniu polityki prywatności
1. Dodać pole adresu e-mail klienta, widget Turnstile i wymagane informacje RODO.
2. Po pozytywnej walidacji wysłać JSON `{service, location, message, email, turnstileToken, website:""}` metodą POST na `/api/contact`.
3. Wyświetlić sukces **wyłącznie** po odpowiedzi HTTP 200 z `{ok:true}`. Obsłużyć błędy, timeout i brak sieci.
4. Po wysyłce zresetować Turnstile. Nie zapisywać treści zgłoszenia w localStorage ani w narzędziach analitycznych.
5. Przetestować rzeczywistą dostawę do Outlooka (także spam), kodowanie polskich znaków, nagłówek reply-to, błędy i ponowne wysyłki.

## Bezpieczeństwo
- Serwer weryfikuje token Turnstile, dozwolone kategorie, długości pól i Origin.
- Honeypot ogranicza część botów. Turnstile nie jest pełnym rate limitingiem; warto dodać limitowanie przez Cloudflare WAF/Rules zgodnie z możliwościami planu.
- Nie prosić o PESEL, dokumenty medyczne ani załączniki przez ten formularz.
- Nie dodawać danych osobowych do logów, URL-i i narzędzi telemetrycznych.
- W razie zmiany hostingu na Workers konieczna adaptacja funkcji Pages do odpowiedniego runtime.
- Kod wymaga audytu i testów integracyjnych przed produkcją.

## Warunek uruchomienia
Nie włączać wysyłki bez kompletnej klauzuli informacyjnej, skonfigurowanych sekretów, potwierdzenia domeny i testu dostarczenia.
