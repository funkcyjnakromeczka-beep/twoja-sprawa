# Twoja Sprawa — źródło strony WWW

## Struktura projektu
- **`v2/` to katalog źródłowy witryny publikowanej na Cloudflare Pages.** Zmiany w wyglądzie, tekstach i skryptach wprowadzaj tutaj.
- `scripts/build.mjs` buduje katalog produkcyjny `dist/`, zamienia ścieżki `/v2/` na `/`, ustawia właściwe indeksowanie i dodaje dane strukturalne. Samo uruchomienie skryptu **nie publikuje strony**.
- `scripts/preview.mjs` tworzy podgląd `dist-preview/` z wyłączonym indeksowaniem.
- Główny `/index.html` w repozytorium jest osobnym plikiem historycznym. **Nie należy traktować go jako źródła aktualnej publikacji.**
- `scripts/network-brand.mjs` dodaje na każdej podstronie stały górny pasek logotypów **Votum Network** i **Votum Scale Agency**. Nie dodawaj drugiego takiego paska w `v2/index.html`.

## Główne ścieżki
- Strona główna: `v2/index.html`
- Szkody górnicze: `v2/uslugi/szkody-gornicze.html`
- Świadczenie wspierające: `v2/uslugi/swiadczenie-wspierajace.html`
- Chatbot-przewodnik: `v2/chat-assistant.js`
- Formularz Web3Forms: `v2/contact.js`
- Styl graficzny: `v2/styles.css` i `v2/premium-v2.css`

## Testy przed publikacją
```sh
node scripts/audit.mjs
node scripts/test-chat-lead.mjs
node scripts/test-contact-client.mjs
node scripts/test-network-brand.mjs
node scripts/test-seo-policy.mjs
```
GitHub Actions wykonuje automatyczny audyt dla gałęzi `main`. Zielony audyt **nie potwierdza** wdrożenia na Cloudflare ani dostarczenia zgłoszenia do skrzynki Outlook.

## Zasady publikacji
Budowanie wersji produkcyjnej wymaga jawnie potwierdzonych przeglądów treści, kwestii prawnych i formularza. Zgodnie z zabezpieczeniami w `scripts/build.mjs` wymagane są zmienne `SITE_URL`, `RELEASE=1`, `LEGAL_APPROVED=1`, `CONTENT_APPROVED=1`, `FORM_APPROVED=1`. Nie ustawiaj ich bez rzeczywistego zatwierdzenia.
Kanonikalny adres witryny: https://twoja-sprawa.pages.dev/.
Dane przekazywane przez formularz kierowane są do Web3Forms i następnie na `twojasprawa_votum@outlook.com`; faktyczne doręczenie należy sprawdzać osobnym testem.
