# Formularz serwerowy — konfiguracja bez ujawniania sekretów

## Stan
Kod funkcji Cloudflare Pages znajduje się w `functions/api/contact.js`. Frontend ma już warunkową integrację POST `/api/contact`. Włącza się dopiero po dodaniu do `<head>` każdej strony z formularzem znacznika `<meta name="turnstile-site-key" content="PUBLICZNY_SITE_KEY">`. Bez niego pozostaje tryb `mailto:`. Kod nie był jeszcze przetestowany z prawdziwymi sekretami i dostawą na Cloudflare.

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

## Aktywacja frontendowa — dopiero po zatwierdzeniu polityki prywatności
1. Uzupełnić rzeczywistą politykę prywatności. Następnie dodać do `<head>` każdej strony z formularzem `<meta name="turnstile-site-key" content="PUBLICZNY_SITE_KEY">` (site key jest jawny, nie jest sekretem). Skrypt sam ładuje widget Turnstile.
2. Skrypt formularza wysyła JSON `{service, name, location, phone, email, message, privacyAcknowledged:true, turnstileToken, website:""}` metodą POST na `/api/contact`.
3. Sukces wyświetla się **wyłącznie** po odpowiedzi HTTP 200 z `{ok:true}`; błędy nie są przedstawiane jako wysłanie.
4. Skrypt resetuje Turnstile po próbie wysyłki. Nie zapisuje treści zgłoszenia w localStorage ani w narzędziach analitycznych.
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

## Praktyczne kroki w Cloudflare
1. Potwierdź, że projekt to **Pages**, a nie Workers, oraz że funkcja `/api/contact` jest publikowana z katalogu `functions/` w repozytorium.
2. W Cloudflare → Turnstile utwórz widget dla `twoja-sprawa.pages.dev`; skopiuj **site key** (publiczny) i **secret key** (tajny).
3. W Resend utwórz konto, zweryfikuj domenę nadawczą i skonfiguruj jej rekordy DNS. Bez domeny nadawczej zweryfikowanej u dostawcy nie zakładaj, że wiadomości można wysyłać na dowolny Outlook.
4. W ustawieniach projektu Cloudflare Pages → Settings → Variables and Secrets dodaj `RESEND_API_KEY` i `TURNSTILE_SECRET_KEY` jako sekrety, a także `CONTACT_FROM` (zweryfikowany nadawca), `CONTACT_TO=twojasprawa_votum@outlook.com` i `PUBLIC_ORIGIN=https://twoja-sprawa.pages.dev`. Ustaw właściwe środowisko (Production) i wykonaj nowe wdrożenie.
5. Dopiero po zatwierdzeniu polityki prywatności i skonfigurowaniu sekretów dodaj publiczny site key do stron z formularzem, opublikuj i wykonaj próbne zgłoszenie. Sprawdź odebranie e-maila w Outlook, spam i Reply-To.
6. Nigdy nie przesyłaj kluczy API w czacie ani nie umieszczaj ich w GitHub.

**Alternatywa bez własnej domeny:** zewnętrzny formularz Google/Microsoft Forms z powiadomieniami e-mail, ale wymaga oddzielnej konfiguracji, ogranicza personalizację i przekazuje dane do kolejnego podmiotu — należy go ująć w informacji o prywatności.
