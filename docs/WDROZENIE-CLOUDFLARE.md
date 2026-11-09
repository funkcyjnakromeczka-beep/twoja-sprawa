# Plan migracji z projektu roboczego do Cloudflare — bez ryzyka przypadkowej publikacji

## Stan
Projekt v2 jest w katalogu /v2, podczas gdy repozytorium zawiera wcześniejszą stronę w katalogu głównym. Obecne adresy /v2/ są robocze, a strony mają meta robots noindex. Nie publikować w tej postaci.

## Przed wdrożeniem
1. Zweryfikować każdą podstronę usług i poradniki z aktualnymi źródłami; ustalić finalną listę 12 usług.
2. Uzyskać plik oficjalnego logo VOTUM i potwierdzić możliwość użycia. Dodać małe oznaczenie SuccessTree.
3. Uruchomić serwerowy endpoint kontaktowy i wykonać test dostarczenia wiadomości do twojasprawa_votum@outlook.com. Nie mylić obecnego mailto z wysyłką automatyczną.
4. Zatwierdzić pełną politykę prywatności, w tym administratora danych, cele, podstawy, odbiorców, retencję i prawa osób.
5. Zweryfikować licencje zdjęć i filmów; skompresować obrazy i przygotować napisy.
6. Ustalić produkcyjną domenę i przekierowania; dopiero wtedy przygotować kanoniczne URL-e.

## Wariant wdrożenia
Preferowany: Cloudflare Pages z połączeniem GitHub, bez komendy budowania dla statycznego HTML. Wydzielić katalog gotowych plików produkcyjnych (np. dist) i w konfiguracji Pages wskazać właśnie ten katalog.

Alternatywa: Cloudflare Workers ze statycznymi zasobami. Wymaga jawnej konfiguracji assets i właściwego polecenia deploy; nie korzystać z domyślnego npx wrangler deploy bez sprawdzenia projektu.

## Techniczne kroki po akceptacji
- Przenieść pliki v2 do docelowej struktury, usunąć prefix /v2/ z href i src.
- Zapewnić działanie adresów bez .html przez reguły routingu lub strukturę katalogową index.html.
- Usunąć noindex tylko z zatwierdzonych podstron; robots.txt ma wskazywać produkcyjną sitemap.
- Dodać canonical, Open Graph, schema.org i breadcrumbs do rzeczywistych URL-i.
- Sprawdzić 404, linki wewnętrzne, mobile, wydajność, kontrast, klawiaturę.
- Dopiero wtedy połączyć produkcyjne wdrożenie z domeną i zgłosić sitemap do Google i Bing.

## Uwaga o wyszukiwarkach AI
Indeksowanie nie oznacza gwarantowanych poleceń przez ChatGPT. Poprawne dane kontaktowe, pomocne źródłowe treści i dostęp dla OAI-SearchBot zwiększają szanse odnalezienia, ale nie dają kontroli nad odpowiedziami modelu.
