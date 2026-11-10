# Twoja Sprawa — lista gotowości do oficjalnej publikacji

**Stan przygotowania: 10 listopada 2026.** Katalog źródłowy produkcji: `v2/`. Aktualna domena: `https://twoja-sprawa.pages.dev`.

## 1. Ustalony i zweryfikowany stan
- Repozytorium: `funkcyjnakromeczka-beep/twoja-sprawa`, gałąź `main`.
- Zdjęcia Wojciecha Obiegło i Pauliny Chandrały odzyskano jako działające zasoby starego projektu Lovable i umieszczono na widocznej części strony głównej oraz „O nas”.
- Wersja produkcyjna przez `scripts/build.mjs` pobiera zdjęcia do `dist/assets/` i zamienia w HTML odsyłacze do starego hostingu na lokalne pliki. Build celowo kończy się błędem, jeśli zdjęć nie uda się bezpiecznie pobrać.
- Formularz Web3Forms ma istniejącą integrację z obsługą błędów. Sukces API oznacza przyjęcie przez operatora, **nie** gwarantuje otrzymania wiadomości w skrzynce.
- Testowy serwis publiczny pod adresem `twoja-sprawa.pages.dev` został sprawdzony 10 listopada 2026: `robots.txt` zawierał `Disallow: /`, a `sitemap.xml` zwracał 404. Nie jest to obecnie zaindeksowana wersja produkcyjna.

## 2. Obowiązkowe kontrole przed przełączeniem na wersję indeksowalną
- [ ] Potwierdź uprawnienie do publicznego wykorzystania obu portretów, w szczególności zgodę Pauliny.
- [ ] Sprawdź poprawność opisów usług, status współpracy agencyjnej i zgodność użycia znaków graficznych VOTUM Network oraz VOTUM Scale Agency z udzielonymi uprawnieniami.
- [ ] Zweryfikuj aktualność informacji o WZON, ZUS, szkodach górniczych i SKD oraz brak gwarancji wyników.
- [ ] Zweryfikuj politykę prywatności (administrator, cele, podstawy prawne, odbiorcy, ewentualne transfery danych, okresy retencji) i sposób obsługi danych przez Web3Forms.
- [ ] Wykonaj rzeczywisty test formularza, sprawdź skrzynkę `twojasprawa_votum@outlook.com`, pole spam i poprawne prowadzenie statusu błędu. Nie wysyłaj PESEL ani danych medycznych w teście.
- [ ] Sprawdź telefony 796 441 345 i 500 171 531 oraz kierowanie leadów z obu głównych kampanii i chatbota.
- [ ] Obejrzyj podgląd mobilny (360/390 px), tablet (768 px) i desktop (1440 px). Sprawdź portrety, czytelność i brak poziomego przewijania.
- [ ] Potwierdź działanie wszystkich linków, wideo oraz dokumentów.
- [ ] Potwierdź gotowość do publikacji pod adresem `twoja-sprawa.pages.dev` lub ustawioną własną domeną.

## 3. Prawidłowe ustawienia Cloudflare Pages po zatwierdzeniu
W panelu **Workers & Pages → projekt → Settings → Builds**:
- Git repository: `funkcyjnakromeczka-beep/twoja-sprawa`
- Production branch: `main`
- Root directory: katalog główny repozytorium
- Build output directory: `dist`
- Wersja testowa: `node scripts/preview.mjs` tworzy `dist-preview` i uniemożliwia indeksację. **Nie zostawiać jej jako produkcyjnej.**
- Wersja produkcyjna: `SITE_URL=https://twoja-sprawa.pages.dev RELEASE=1 LEGAL_APPROVED=1 CONTENT_APPROVED=1 FORM_APPROVED=1 node scripts/build.mjs`

**Uwaga:** wymienione zmienne zatwierdzające to zabezpieczenia projektu. Nie wolno ustawić ich na `1`, zanim nie przejdą kontrole z punktu 2. Obecnie nie są one potwierdzone i nie zostały przez asystenta ustawione w Cloudflare. Skrypt sam nie publikuje — do publikacji potrzebne jest wdrożenie Cloudflare. Nie przekazuj haseł ani tokenów w czacie.

## 4. Testy po skutecznym wdrożeniu
- [ ] `https://twoja-sprawa.pages.dev/`: nowa sekcja zespołu ze zdjęciami.
- [ ] `https://twoja-sprawa.pages.dev/assets/wojciech-obieglo.jpg` i `/assets/paulina-chandrala.jpg`: obraz JPEG jest dostępny bez Lovable.
- [ ] `/robots.txt`: `Allow: /`, zezwolenie na `OAI-SearchBot`, bez `Disallow: /` dla całego serwisu.
- [ ] `/sitemap.xml`: poprawny XML i adresy istniejących, indeksowalnych stron.
- [ ] `/uslugi/szkody-gornicze.html`, `/uslugi/swiadczenie-wspierajace.html` i nowe `/wiedza/...`: odpowiedzi 200, poprawne title/H1/canonical, brak `noindex`.
- [ ] Podstrony kampanii `/kampanie/...` nadal powinny mieć `noindex,follow` ze względu na duplikację treści.
- [ ] `/llms.txt`: pomocniczy plik informacyjny, bez obietnic wpływu na ranking.
- [ ] Schemat JSON-LD: `Person` dla Wojciecha i Pauliny, `Organization` dla SuccessTree, `Service` i `BreadcrumbList` na stronach usług.
- [ ] Google Search Console: zweryfikuj domenę i prześlij `/sitemap.xml`; monitoruj stan indeksacji. Dodatkowo Bing Webmaster Tools.
- [ ] Sprawdź dostępność dla `Googlebot`, `Bingbot` i `OAI-SearchBot` także przez WAF/ochronę botów Cloudflare.

## 5. Istotne ograniczenia
Zielone testy GitHub Actions nie potwierdzają wdrożenia na Cloudflare. Prawidłowe `robots.txt`, sitemap i JSON-LD nie gwarantują indeksacji ani polecania strony przez AI. Treści prawne i strony wejściowe należy okresowo aktualizować, a dane kontaktowe monitorować. Kopie zdjęć w wydaniu produkcyjnym zależą od dostępności zdjęć ze starego projektu w trakcie *pierwszej budowy*; po utworzeniu release są hostowane przez Cloudflare.
