# Etap VI — ulotki, wejście QR i niezależność od Lovable

**Data:** 11 listopada 2026. **Produkcyjny serwis:** https://twoja-sprawa.pages.dev/

## 1. Prosty adres z ulotek

Publiczny, zweryfikowany adres: **https://twoja-sprawa.pages.dev/start**.

- Źródło: `v2/start.html`; wygląd: `v2/ulotka-start.css`.
- Dwie flagowe ścieżki: świadczenie wspierające i szkody górnicze, z odpowiednimi telefonami oraz przyciskiem do już działającego formularza.
- Cztery usługi uzupełniające w lekkich, czytelnych odnośnikach.
- Zachowanie bezpiecznego źródła zgłoszenia przez `utm_source=ulotka`, `utm_medium=druk`, `utm_campaign=ulotki_2026` i warianty treści.
- Brak dodatkowego formularza, bazy danych, płatnych narzędzi i zewnętrznych skryptów reklamowych na stronie wejściowej.
- `/start` nie jest stroną SEO: `noindex,follow`, nie występuje w `sitemap.xml`, pozostaje dostępna z ulotek.

## 2. Materiały drukowane

Dla uniwersalnej ulotki i wizytówki sugerowany kod QR na `/start`.
Dla druków wyłącznie o szkodach lub świadczeniu można używać odpowiednich adresów kampanii z atrybucją `utm_source=ulotka&utm_medium=qr#formularz`.

**Nie polecać `lovable.app` ani zewnętrznych skracaczy jako kodu QR.** Stary serwis Lovable pozostaje tylko przekierowaniem HTTP 301, a nie niezależnym miejscem do wysyłania formularza. Ponieważ budżet wynosi 0 zł, wydrukowana nazwa bazowa pozostaje pod `pages.dev`.

Wydruk próbny QR: utrzymać białą strefę ochronną, dobry kontrast, odpowiedni wymiar; po wydrukowaniu przetestować skanerem telefonu. Materiały QR PNG/SVG do drukarni udostępniono w bieżącej rozmowie; są to pliki użytkownika, nie część serwera.

## 3. Usunięcie zależności od starego serwisu

Po zastąpieniu dawnej strony Lovable przekierowaniem jej linki do zdjęć:
- `https://twojasprawa-votum.lovable.app/assets/wojciech-CIUxrQ8A.jpg`
- `https://twojasprawa-votum.lovable.app/assets/paulina-B6guxyXQ.jpg`

przestały zwracać JPEG i blokowały produkcyjny build. Teraz pliki są bezpośrednio w repozytorium:
- `v2/assets/wojciech-obieglo.jpg`
- `v2/assets/paulina-chandrala.jpg`

`scripts/build.mjs` w pierwszej kolejności używa tych plików, a `scripts/preview.mjs` zastępuje stare odnośniki lokalnymi. Projekt nie musi pobierać zdjęć z Lovable. Awaryjne odtworzenie z wcześniej opublikowanej strony Cloudflare jest przewidziane wyłącznie wtedy, gdy lokalnego pliku zabraknie.

Raport archiwizacji (2 pliki, pomyślnie): https://github.com/funkcyjnakromeczka-beep/twoja-sprawa/actions/runs/42951091396

## 4. Zweryfikowane testy i ograniczenia

- **Chromium:** 28 tras/widoków, dwa poprawne przejścia z `/start` do odpowiednich formularzy, właściwe UTM, brak poziomego overflow: https://github.com/funkcyjnakromeczka-beep/twoja-sprawa/actions/runs/42951447062
- **Kandydat produkcyjny:** kopie portretów identyczne ze źródłami w repozytorium; strona `/start` ma wymagane ścieżki, kanoniczny adres, CSS i noindex: https://github.com/funkcyjnakromeczka-beep/twoja-sprawa/actions/runs/42951345961
- **Audyt rzeczywiście działającego Cloudflare:** 20 zasobów, `/start`, telefony, cztery zasadnicze warstwy SEO: https://github.com/funkcyjnakromeczka-beep/twoja-sprawa/actions/runs/42951515880
- **Syntetyczny pomiar wydajności:** `/start` na telefonie i desktopie: FCP 76/80 ms, LCP 76/80 ms, CLS 0. Mierzone w Chromium/GitHub runnerze, **nie są to dane rzeczywistych odwiedzających**: https://github.com/funkcyjnakromeczka-beep/twoja-sprawa/actions/runs/42951685103

Strona jest gotowa technicznie do promocji na ulotkach. Wciąż nie znamy liczby prawdziwych wejść, skuteczności kontaktów i konwersji z ulotek bez analityki i danych o otrzymanych zgłoszeniach.
