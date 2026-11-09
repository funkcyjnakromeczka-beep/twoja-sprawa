# Premium V2 — materiały wizualne i zasady publikacji

Zmienione: 9 listopada 2026. Warstwa `v2/premium-v2.css` rozwija istniejący serwis bez zmian w obsłudze formularzy, poradników i testach kampanii.

## Materiały graficzne

- **VOTUM S.A.** — oryginalne logo z oficjalnej witryny partnera: https://votum-sa.pl/wp-content/uploads/2024/06/logo_VOTUM_SA_rgb-480x71.png. Logo prezentowane z jasnym tłem, z dopiskiem `Współpraca agencyjna`. Nie sugerować, że serwis SuccessTree jest oficjalnym serwisem VOTUM.
- **Pęknięcia tynku** — Marija Zaric / Unsplash: https://unsplash.com/photos/LGf2CDKjDvM ; obraz: https://images.unsplash.com/photo-1670078763002-59f7982d493e. Używany jako ilustracyjne tło stron o szkodach, nie jako dokumentacja szkody klienta.
- **Linie przesyłowe** — Alexandru Boicu / Unsplash: https://unsplash.com/photos/h0z0ptvGVR8 ; obraz: https://images.unsplash.com/photo-1572211281255-bb9fd6f3ca0e. Używany jako ilustracja zagadnień przesyłu.
- Licence imagery: https://unsplash.com/license ; verify usage terms before reusing elsewhere.

## Działanie filmów

Pięć materiałów jest otwieranych na zewnętrznym Scrimba/Explain Video, zamiast ładować iframe przy każdej wizycie. Taki wybór ogranicza wagę strony i automatyczne połączenia z dostawcą wideo przed kliknięciem. Linki do pięciu filmów są w `v2/index.html` i na stronach usługowych.

## Zachowanie wdrożenia

- Wersja testowa Cloudflare pozostaje `noindex,nofollow`.
- Użyć docelowej domeny dopiero po sprawdzeniu dostarczania wiadomości, warunków prawnych i treści.
- Grafiki zewnętrzne pobierane bezpośrednio z domen dostawców wymagają dostępności sieci; ciemne gradienty stanowią wizualny fallback przy niedostępności fotografii.
- Przy testach sprawdzić kontrast i układ na telefonach, widoczność numerów kontaktowych oraz to, czy logo z domeny partnera ładuje się poprawnie.
