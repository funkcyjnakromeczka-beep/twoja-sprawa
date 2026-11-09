# Projekt Twoja Sprawa — wydanie statyczne

Robocze pliki w `v2/`. Wersja robocza ma `noindex` i adresy z prefiksem `/v2/`.

## Budowa wersji produkcyjnej (nie publikować przed odbiorem)

Wymaga Node.js 20+. Z repozytorium:

```bash
SITE_URL=https://twoja-domena.pl RELEASE=1 node scripts/build.mjs
```

Domena w poleceniu jest przykładem. Skrypt generuje `dist/` z:
- usuniętym prefiksem `/v2/` w linkach;
- meta robots index,follow;
- kanonicznymi adresami;
- `robots.txt`, `sitemap.xml` i podstawowymi nagłówkami.

**Uwaga:** builder nie weryfikuje treści, poprawności routingu bez `.html`, polityki prywatności, formularza ani licencji grafik. `RELEASE=1` należy stosować dopiero po przejściu checklisty. Skrypt nie wysyła nic do Cloudflare.

## Cloudflare Pages

Projekt powinien wykonać build w środowisku z Node.js i ustawić output directory `dist`. Funkcja `functions/api/contact.js` jest kodem Pages Functions, wymaga osobnej konfiguracji sekretów. Nie należy automatycznie przełączać na Workers bez dostosowania kodu.
