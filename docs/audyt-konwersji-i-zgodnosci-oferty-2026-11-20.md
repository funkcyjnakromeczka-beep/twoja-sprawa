# Audyt strony „Twoja Sprawa” — 20 listopada 2026 r.

## Potwierdzone wykonanie
- W katalogu `v2/assets/` znajduje się zatwierdzony przez właściciela baner `og-twoja-sprawa-metallic-v1.jpg`, 1536 × 803, 175149 bajtów.
- Wersja produkcyjna udostępnia go przez `/assets/og-twoja-sprawa-metallic-v1.jpg`.
- Metadane OG 12 sprawdzonych publicznych adresów wskazują ten sam baner, prawidłowe wymiary i zgodne adresy kanoniczne.
- Kampanie `/kampanie/*` pozostają `noindex,follow`; kluczowe strony usługowe pozostają `index,follow`.
- Usunięto dwie dekoracje HTML z głównej sekcji i dodano test `scripts/test-brand-hero.mjs` do CI.
- Wygenerowana konfiguracja cache zawiera siedem dni pamięci podręcznej dla wersjonowanego banera.
- Dodano ograniczone do konkretnych selektorów akcenty granatu, srebra i czerwieni w CSS.

## Zakres oferty a publiczne podstrony — wymaga decyzji właściciela
W serwisie jest **25 adresów w sitemap.xml**. Zweryfikowane jako bieżące główne projekty do komunikacji marketingowej:
1. Szkody górnicze — Lubin, Polkowice i okolice.
2. Świadczenie wspierające — Paulina.
3. Renty powypadkowe — Paulina.
4. Sankcja Kredytu Darmowego (SKD).
5. Kredyty frankowe CHF.
6. Służebność przesyłu.

Siedem innych indeksowanych podstron tematycznych pozostaje do weryfikacji zakresu faktycznie świadczonych usług i uprawnień przed przygotowaniem reklam: `nieudany-urlop`, `odszkodowanie-za-halas`, `pomoc-w-sprawach-karnych`, `szkody-na-nieruchomosci`, `wypadki-komunikacyjne`, `wypadki-przy-pracy`, `wypadki-w-rolnictwie`. Samo występowanie strony w serwisie nie potwierdza, że SuccessTree ma umowne upoważnienie do obsługi danej sprawy. Nie zmieniano zakresu oferty ani statusu indeksowania bez takiego potwierdzenia.

## Kontrola rzetelności świadczenia wspierającego
- Zweryfikowano na oficjalnej stronie ZUS zasady 2026 r., próg od 70 punktów i informację, że ZUS umożliwia samodzielne, bezpłatne złożenie wniosku.
- Przypomnienie o możliwości bezpłatnego załatwiania formalności w ZUS jest już widoczne na podstronie świadczenia wspierającego. Nie należy sugerować, że odpłatny pośrednik jest obowiązkowy.
- Źródła urzędowe:
  - https://www.zus.pl/swiadczenia/inne-swiadczenia-z-zus/wiadczenie-wspierajace-dla-osob-z-niepelnosprawnoscia
  - https://www.zus.pl/o-zus/o-nas/kampanie/wiadczenie-wspierajace-dla-ciebie-nie-dla-posrednikow-kampania-mrpips

## Stan weryfikacji
Przeprowadzono bezpośrednie kontrole metadanych strony produkcyjnej. Nie potwierdzono pełnego wyniku bieżącego przebiegu GitHub Actions, końcowych parametrów Core Web Vitals ani wyglądu na rzeczywistym urządzeniu mobilnym. Testy CI przygotowano, ale ich pozytywny wynik wymaga osobnego odczytu. Nie deklarować przyrostu ruchu, indeksacji przez Google ani liczby leadów bez danych Search Console/CRM.
