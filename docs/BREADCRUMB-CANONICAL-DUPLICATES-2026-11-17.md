# Ujednolicenie ścieżek nawigacji JSON-LD — 17.11.2026

## Rzeczywista przyczyna
Dwie lokalne strony szkód górniczych (Lubin i Polkowice) publikowały
dwa niezależne dokumenty `BreadcrumbList`: starszy, ręcznie wpisany
w kodzie z niekanonicznymi adresami `/v2/*.html`, oraz aktualny,
automatycznie generowany na podstawie widocznej nawigacji.

Wcześniejszy test kontrolował wyłącznie zawartość grafu
`@graph`, dlatego nie wykrywał samodzielnych dokumentów JSON-LD.

## Wdrożenie
- Usunięto dwie ręcznie wpisane, zduplikowane ścieżki JSON-LD.
- Poprawiono źródłowe znaczniki `canonical` i `og:url` na dokładne
  publiczne adresy bez `/v2/` i `.html`.
- Zachowano generowane przy kompilacji dane z jednej widocznej ścieżki,
  dokładnie jedną `BreadcrumbList` na każdą z 40 stron ze ścieżką.
- Rozszerzono test na **wszystkie** dokumenty JSON-LD, zarówno
  indywidualne, jak i znajdujące się w `@graph`, aby błąd
  nie powrócił na żadnej z 47 stron.

## Granice
Zmiana poprawia semantykę i spójność danych dla robotów wyszukiwania.
Nie dowodzi wzrostu ruchu w Google, rankingów ani cytowania w AI.
Formularze kontaktowe, dane klientów, adresy e-mail i dostarczanie
zgłoszeń nie były zmieniane. Koszt dodatkowy: 0 zł.

## Rozszerzenie kontroli na wszystkie podstrony
Rozszerzony test wykrył także samodzielny `BreadcrumbList` na stronach usług,
który wcześniejsze testy ignorowały. Dlatego etap budowania usuwa przestarzały,
ręcznie wpisany samodzielny `BreadcrumbList` **na każdej stronie z widoczną
ścieżką nawigacji**, zachowując pozostałe dane strukturalne. Obowiązujący
`BreadcrumbList` jest następnie generowany wyłącznie z widocznej nawigacji.
Jeżeli źródłowy znacznik istnieje bez widocznej ścieżki, wydanie jest przerywane.
Nowy test liczy wszystkie rekordy w `@graph` i poza nim.
