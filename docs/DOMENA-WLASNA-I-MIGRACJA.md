# Zmiana adresu Twoja Sprawa: pages.dev → własna domena

Stan: 11.11.2026. **Nie przełączono domeny.** Obowiązujący adres: https://twoja-sprawa.pages.dev.

## Rekomendacja

Własna domena `.pl` jest korzystniejsza do materiałów drukowanych, wiarygodności marki i krótkiego podawania adresu przez telefon. Sprawdzić dostępność `twoja-sprawa.pl`; jeżeli zajęta lub koliduje z istniejącą marką, rozważyć `twojasprawa-pomoc.pl` albo `twoja-sprawa-online.pl`. Nie ma potwierdzonej dostępności, ceny ani praw do któregokolwiek z tych adresów. Nie używać `votum` w domenie bez odrębnej decyzji właściciela znaku.

Cloudflare Pages **nie wymaga płatnego hostingu przy podłączeniu własnej domeny**, choć rejestracja domeny i odnowienie zwykle są płatne u rejestratora. Można zachować GitHub, formularze i aktualny mechanizm publikacji. Jeśli koszt domeny jest dziś problemem, zostawić `pages.dev`; nie zmieniać SEO tylko dla kosmetycznej zmiany subdomeny.

## Czego nie robić teraz

- Nie usuwać projektu Cloudflare ani obecnego subdomenowego adresu `pages.dev`.
- Nie zmieniać `SITE_URL` i `canonical` na domenę bez aktywnego HTTPS i sprawdzonego mapowania.
- Nie przekierowywać wszystkiego do strony głównej i nie publikować dwóch różnych adresów jako równorzędnych `canonical`.
- Nie przyjmować za pewnik, że rejestracja domeny daje prawa do nazwy marki; w razie potrzeby sprawdzić znaki towarowe.

## Plan po wybraniu i wykupieniu domeny

1. Sprawdzić dostępność i koszt **odnowienia** wybranej `.pl` oraz ewentualne kolizje nazwy; nabyć domenę we własnym imieniu.
2. W Cloudflare → Workers & Pages → `twoja-sprawa` → **Custom domains** → Set up a domain. Dla domeny głównej `twoja-sprawa.pl` należy dodać strefę DNS do Cloudflare i ustawić nameserwery zgodnie z jego instrukcją. Dla subdomeny stosuje się CNAME, ale również trzeba **najpierw dodać ją w Custom domains**.
3. Potwierdzić HTTPS, poprawne wyświetlanie strony na telefonie, działanie Web3Forms i obu numerów telefonu pod nowym adresem.
4. Zaktualizować origin w `scripts/preview.mjs`, `scripts/test-production-bundle.mjs`, `scripts/audit-production-live.mjs`, `scripts/submit-indexnow.mjs` i `scripts/measure-live-performance.mjs`; sprawdzić wszystkie kanoniczne linki w JSON-LD, sitemap i og:url. Wydanie do nowej domeny musi być **spójne**.
5. Przenieść weryfikację IndexNow na nowy host oraz zweryfikować nowy adres w Google Search Console i Bing Webmaster Tools.
6. Uruchomić **stałe przekierowania 301** z obecnego `pages.dev` na odpowiadające mu adresy nowej domeny — zachować ścieżkę każdego poradnika i formularza, łącznie z kampaniami. Cloudflare przewiduje Bulk Redirect dla subdomeny `pages.dev`.
7. Przed zgłoszeniem migracji porównać sitemap, robots, canonical, formularze, przekierowania, HTTPS i mobile.
8. Aktualizować linki w profilach Facebook, Instagram, TikTok, wizytówkach, QR oraz materiałach drukowanych dopiero po testach.
9. Obserwować obie domeny w Search Console; nie usuwać starych przekierowań przez co najmniej rok, najlepiej zachować na stałe.

## Źródła techniczne (stan 2026)

- Cloudflare Pages: https://developers.cloudflare.com/pages/configuration/custom-domains/
- Google Search Central, przenoszenie: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes?hl=pl
- Cloudflare Web Analytics (bezpłatne mierzenie rzeczywistych odsłon): https://developers.cloudflare.com/web-analytics/get-started/

## Pomiar i ograniczenia

Można mierzyć **wydajność techniczną** od razu (raport Chromium w GitHub). Liczby użytkowników, kliknięć i konwersji wymagają włączenia własnej analityki i dostępu do jej raportów. Cloudflare Pages udostępnia Web Analytics w panelu projektu: **Workers & Pages → projekt → Metrics → Enable under Web Analytics**. Nie należy podawać wartości ruchu ani liczby leadów bez rzeczywistych danych. Formularz działa, co potwierdził właściciel, ale to nie jest pomiar konwersji.
