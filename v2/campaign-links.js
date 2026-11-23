/* Generator linków promocyjnych: bez cookies, zewnętrznych skryptów i przechowywania danych. */
(() => {
  "use strict";
  const form = document.querySelector("[data-campaign-builder]");
  if (!form) return;
  const service = form.querySelector("[name=service]");
  const region = form.querySelector("[name=region]");
  const regionControl = form.querySelector("[data-campaign-region]");
  const channel = form.querySelector("[name=channel]");
  const name = form.querySelector("[name=campaign]");
  const content = form.querySelector("[name=content]");
  const style = form.querySelector("[name=style]");
  const destinationControl = form.querySelector("[name=destination]");
  const educationalTopics = Object.freeze({"szkody":{"path":"/wiedza/drobne-pekniecia-szkody-gornicze","hash":"zabezpieczony-dom","variant":"pekniecia_po_remoncie","title":"Pęknięcia wróciły po remoncie?","body":"Zachowaj zdjęcia wcześniejszych i obecnych uszkodzeń oraz dokumenty napraw. Sama rysa nie dowodzi szkody górniczej. Przeczytaj, co przygotować do analizy."},"swiadczenie":{"path":"/wiedza/swiadczenie-wspierajace-2026-wzon-zus","hash":"po-decyzji-wzon","variant":"decyzja_wzon","title":"Masz decyzję WZON?","body":"Sprawdź punktację, pouczenie i daty. Poradnik pomaga uporządkować kolejne kroki bez obietnic wyniku. Wniosek do ZUS i pomoc w jego złożeniu są bezpłatne."},"skd":{"path":"/wiedza/kredyt-pln-dokumenty-skd","hash":"wczesniejsza-splata-skd","variant":"splata_i_skd","title":"Kredyt spłacony wcześniej lub odmowa banku?","body":"SKD i zwrot kosztów wcześniejszej spłaty to różne zagadnienia. Zobacz, jakie dokumenty przygotować i dlaczego trzeba sprawdzić terminy."},"renty":{"path":"/wiedza/renta-powypadkowa-dokumenty","hash":"renta-od-lat","variant":"renta_od_lat","title":"Od lat otrzymujesz tę samą rentę?","body":"Porównaj dawne i obecne koszty opieki, rehabilitacji oraz utracone dochody. Podwyższenie nie jest automatyczne. Zobacz praktyczny poradnik."},"franki":{"path":"/uslugi/kredyty-frankowe","hash":"ugoda-chf","variant":"ugoda_chf","title":"Bank proponuje ugodę frankową?","body":"Sprawdź rozliczenia, saldo, raty i skutki porozumienia. Poradnik wskazuje siedem obszarów do analizy przed podpisaniem."},"przesyl":{"path":"/wiedza/sluzebnosc-przesylu-slup-na-dzialce","hash":"","variant":"slup_na_dzialce","title":"Słup lub sieć na działce?","body":"Przygotuj dokumenty dotyczące nieruchomości i urządzeń. Sama obecność instalacji nie przesądza o prawie do wynagrodzenia."}});
  const educationalPreviews = Object.freeze({"/wiedza/drobne-pekniecia-szkody-gornicze":{"title":"Drobne pęknięcia a szkody górnicze — Lubin i Polkowice","description":"Niewielkie rysy na ścianie, pęknięcia elewacji lub nierówna kostka? Sprawdź, jak dokumentować uszkodzenia w rejonie Lubina i Polkowic."},"/wiedza/swiadczenie-wspierajace-2026-wzon-zus":{"title":"Świadczenie wspierające 2026 — WZON i ZUS","description":"Świadczenie wspierające w 2026 r.: WZON, decyzja o poziomie potrzeby wsparcia od 70 punktów, wniosek do ZUS i ważne terminy. Poradnik SuccessTree."},"/wiedza/kredyt-pln-dokumenty-skd":{"title":"Sankcja kredytu darmowego (SKD): jakie dokumenty przygotować?","description":"Sprawdź listę dokumentów do analizy SKD: umowa kredytu, aneksy, koszty, harmonogram, spłata i terminy. Praktyczny poradnik SuccessTree."},"/wiedza/renta-powypadkowa-dokumenty":{"title":"Renta powypadkowa: dokumenty i podwyższenie | Twoja Sprawa","description":"Jakie dokumenty przygotować do renty powypadkowej lub jej podwyższenia? Sprawdź dowody kosztów, utraconych dochodów i możliwości kontaktu z Pauliną."},"/uslugi/kredyty-frankowe":{"title":"Pomoc frankowiczom — kredyty CHF | Twoja Sprawa","description":"Sprawdź, jakie dokumenty przygotować i jakie możliwości analizy umowy frankowej istnieją. Wsparcie na terenie Polski."},"/wiedza/sluzebnosc-przesylu-slup-na-dzialce":{"title":"Słup energetyczny na działce — służebność przesyłu","description":"Słup lub sieć na działce? Sprawdź dokumenty, tytuł prawny operatora, zasady wynagrodzenia za służebność przesyłu i ryzyko zasiedzenia."}});
  const urlOutput = document.querySelector("[data-campaign-url]");
  const postOutput = document.querySelector("[data-campaign-post]");
  const message = document.querySelector("[data-campaign-status]");
  const linkAction = document.querySelector("[data-copy-link]");
  const postAction = document.querySelector("[data-copy-post]");
  const openAction = document.querySelector("[data-open-link]");
  const communityPresetButtons = document.querySelectorAll?.("[data-community-preset]") || [];
  const communityPresetStatus = document.querySelector("[data-community-preset-status]");
  const platformNote = document.querySelector("[data-platform-note]");
  const profileConfirmed = document.querySelector("[data-profile-link-confirmed]");
  const profileConfirmWrap = document.querySelector("[data-profile-confirm-wrap]");
  let confirmedProfileUrl = "";
  const platformPresetButtons = document.querySelectorAll?.("[data-platform-preset]") || [];
  const platformPresetStatus = document.querySelector("[data-platform-preset-status]");
  const qrImage = document.querySelector("[data-campaign-qr-image]");
  const qrDownload = document.querySelector("[data-campaign-qr-download]");
  const qrCaption = document.querySelector("[data-campaign-qr-caption]");
  const qrStatus = document.querySelector("[data-campaign-qr-status]");
  const qrFigure = document.querySelector("[data-campaign-qr-figure]");
  const flyer = document.querySelector("[data-campaign-flyer]");
  const flyerHeading = document.querySelector("[data-flyer-heading]");
  const flyerArea = document.querySelector("[data-flyer-area]");
  const flyerText = document.querySelector("[data-flyer-text]");
  const flyerPhone = document.querySelector("[data-flyer-phone]");
  const flyerQr = document.querySelector("[data-flyer-qr]");
  const flyerPrint = document.querySelector("[data-print-flyer]");
  const flyerHint = document.querySelector("[data-flyer-hint]");
  // Reviewed public page metadata; the regression test validates the live preview.
  // Categorical, first-party information only: no user data, cookies or requests.
  const previewCards={"/":{"title":"Szkody górnicze i świadczenie wspierające | Twoja Sprawa","description":"Szkody górnicze w Lubinie i Polkowicach, świadczenie wspierające w całej Polsce, SKD i renty. Sprawdź, jak zgłosić sprawę do SuccessTree."},"/kampanie/szkody-gornicze":{"title":"Szkody górnicze Lubin i Polkowice — zgłoś szkodę | Twoja Sprawa","description":"Pęknięcia ścian, elewacji, nierówna kostka? Zgłoś szkodę górniczą w Lubinie, Polkowicach i okolicy do wstępnej analizy. Formularz i telefon."},"/kampanie/swiadczenie-wspierajace":{"title":"Świadczenie wspierające — zostaw kontakt | Twoja Sprawa","description":"Świadczenie wspierające: pomoc w ustaleniu etapu postępowania WZON i ZUS. Zostaw kontakt bez przesyłania dokumentacji medycznej."},"/kampanie/skd":{"title":"SKD — wyślij umowę kredytową i zostaw telefon | Twoja Sprawa","description":"Sankcja Kredytu Darmowego (SKD): wyślij pełną umowę kredytu konsumenckiego w PLN i zostaw numer telefonu do wstępnej analizy."},"/kampanie/renty-powypadkowe":{"title":"Renty powypadkowe — analiza i podwyższenie | Twoja Sprawa","description":"Renta od ubezpieczyciela po wypadku? Sprawdź możliwość analizy wysokości świadczenia, zwiększonych potrzeb lub utraty zarobków. Kontakt z Pauliną."},"/uslugi/renty-powypadkowe":{"title":"Renty powypadkowe — analiza i podwyższenie | Twoja Sprawa","description":"Renta od ubezpieczyciela po wypadku. Sprawdź dokumenty, zwiększone potrzeby i możliwości ustalenia lub podwyższenia świadczenia."},"/uslugi/sluzebnosc-przesylu":{"title":"Służebność przesyłu — słup na działce | Twoja Sprawa","description":"Słup, linia energetyczna lub gazociąg na działce? Poznaj dokumenty potrzebne do analizy praw operatora i możliwych roszczeń właściciela."},"/uslugi/kredyty-frankowe":{"title":"Kredyty CHF — analiza umowy frankowej | Twoja Sprawa","description":"Analiza aktywnych i spłaconych kredytów CHF, zapisów umowy, rozliczeń z bankiem i możliwych roszczeń. Pierwszy kontakt bezpłatny."},"/lokalnie/szkody-gornicze-lubin":{"title":"Szkody górnicze Lubin — pęknięcia ścian | Twoja Sprawa","description":"Lubin i gmina Lubin: zauważyłeś pęknięcia ścian, rysy elewacji lub uszkodzone płytki? Sprawdź, jak udokumentować szkodę i zgłosić ją do analizy."},"/lokalnie/szkody-gornicze-polkowice":{"title":"Szkody górnicze Polkowice — szkody posesji | Twoja Sprawa","description":"Polkowice i gmina Polkowice: nierówna kostka brukowa, spękania elewacji i uszkodzenia posesji? Dowiedz się, jak przygotować dokumentację szkody do analizy."}};
  const previewTitle=document.querySelector("[data-preview-title]");
  const previewDescription=document.querySelector("[data-preview-description]");
  const previewHost=document.querySelector("[data-preview-host]");
  const previewImage=document.querySelector(".campaign-link-preview-card img");
  const previewGraphic=path=>{
    if(path==="/lokalnie/szkody-gornicze-lubin")return "og-szkody-lubin.jpg";
    if(path==="/lokalnie/szkody-gornicze-polkowice")return "og-szkody-polkowice.jpg";
    if(path==="/wiedza/kredyt-pln-dokumenty-skd")return "og-skd-dokumenty.jpg";
    if(/szkody-gornicze|drobne-pekniecia|ugoda-z-kopalnia/.test(path))return "og-szkody-gornicze.jpg";
    if(/swiadczenie-wspierajace|wzon-zus/.test(path))return "og-swiadczenie-wspierajace.jpg";
    if(/renty-powypadkowe|renta-powypadkowa/.test(path))return "og-renty-powypadkowe.jpg";
    if(/kredyty-frankowe/.test(path))return "og-kredyty-frankowe.jpg";
    if(/sluzebnosc-przesylu/.test(path))return "og-sluzebnosc-przesylu.jpg";
    if(/kredyty-pln|skd/.test(path))return "og-skd.jpg";
    return "og-twoja-sprawa-metallic-v1.jpg";
  };
  const campaigns = {
    szkody: {
      path: "/kampanie/szkody-gornicze.html",
      title: "Szkody górnicze — Lubin, Polkowice i okolice",
      text: "Pęknięcia ścian, uszkodzenia elewacji lub nierówna kostka brukowa? Warto udokumentować zauważone zmiany i ustalić możliwości działania. Pomagam w pierwszym kontakcie i wstępnej analizie spraw dotyczących szkód górniczych. Zostaw kontakt, aby omówić swoją sytuację. Wysłanie zapytania nie oznacza podpisania umowy."
    },
    swiadczenie: {
      path: "/kampanie/swiadczenie-wspierajace.html",
      title: "Świadczenie wspierające — WZON i ZUS",
      text: "Masz pytania o świadczenie wspierające, ocenę potrzeby wsparcia lub otrzymaną decyzję? Możemy pomóc uporządkować etap sprawy i ustalić możliwe dalsze kroki. Nie trzeba wysyłać dokumentacji medycznej przez formularz. Samo zgłoszenie nie gwarantuje przyznania świadczenia."
    },
    renty: {
      path: "/kampanie/renty-powypadkowe.html",
      title: "Renty powypadkowe",
      text: "Po wypadku ponosisz dodatkowe koszty lub zmieniły się Twoje możliwości zarobkowania? Sprawdź, jakie informacje mogą być potrzebne do indywidualnej analizy roszczenia o rentę powypadkową. Pierwszy kontakt nie zobowiązuje do zawarcia umowy."
    },
    skd: {
      path: "/kampanie/skd.html",
      title: "Kredyty PLN — sankcja kredytu darmowego",
      text: "Masz umowę kredytu konsumenckiego w PLN? Możesz przesłać pełną umowę do indywidualnej analizy pod kątem sankcji kredytu darmowego. Wyślij dokument na wojciech.obieglo@votum-ds.pl i podaj numer telefonu do kontaktu. Nie każda umowa daje podstawę do zastosowania SKD."
    },
    przesyl: {
      path: "/uslugi/sluzebnosc-przesylu.html",
      title: "Służebność przesyłu",
      text: "Na Twojej działce znajdują się słupy, linie lub inne urządzenia przesyłowe? Warto ustalić stan prawny nieruchomości oraz dokumentację dotyczącą urządzeń. Możesz zostawić kontakt do wstępnej analizy sytuacji. Samo istnienie urządzeń nie oznacza automatycznie prawa do wynagrodzenia."
    },
    franki: {
      path: "/uslugi/kredyty-frankowe.html",
      title: "Kredyty frankowe CHF — analiza umowy",
      text: "Masz kredyt frankowy lub spłaciłeś już taką umowę? Możesz zapytać o analizę postanowień umowy, historii spłaty i możliwych rozliczeń z bankiem. Ocena indywidualnej sprawy zależy od treści umowy, dokumentacji i aktualnego stanu prawnego. Kontakt nie oznacza obietnicy wygranej ani określonej korzyści."
    }
  };
  // Local mining ads may use indexable city pages, each with the correct
  // service adviser and Facebook/Open Graph graphic. These are public
  // destinations, never user addresses or precise location data.
  const miningRegions = Object.freeze({
    lubin: {
      path: "/lokalnie/szkody-gornicze-lubin.html",
      name: "Lubin i gmina Lubin",
      text: "Lubin i gmina Lubin: widzisz pęknięcia ścian, rysy elewacji lub uszkodzenia posadzki? Zachowaj zdjęcia i daty zauważonych zmian. Pomagam uporządkować informacje do wstępnej analizy szkody górniczej. Zostaw kontakt, aby omówić możliwe dalsze kroki. Samo zapytanie nie oznacza podpisania umowy ani potwierdzenia odpowiedzialności kopalni.",
      short: "Lubin i gmina Lubin: pęknięcia ścian lub elewacji? Warto je udokumentować i zapytać o wstępną analizę. Pierwszy kontakt nie zobowiązuje do umowy.",
      hook: "Mieszkasz w Lubinie lub gminie Lubin i zauważyłeś pęknięcia ścian po ostatnim remoncie?"
    },
    polkowice: {
      path: "/lokalnie/szkody-gornicze-polkowice.html",
      name: "Polkowice i gmina Polkowice",
      text: "Polkowice i gmina Polkowice: nierówna kostka, pęknięcia elewacji lub uszkodzenia ogrodzenia? Udokumentuj zmiany i zachowaj dotychczasowe zgłoszenia lub kosztorysy. Pomagam w pierwszym kontakcie oraz uporządkowaniu informacji do analizy szkody. Zostaw kontakt, aby omówić sytuację. Przyczyna uszkodzeń wymaga indywidualnej oceny.",
      short: "Polkowice i gmina Polkowice: nierówna kostka lub pęknięta elewacja? Zachowaj zdjęcia i sprawdź możliwość analizy uszkodzeń. Bez gwarancji wyniku.",
      hook: "W Polkowicach zauważyłeś nierówną kostkę brukową lub nowe pęknięcia elewacji?"
    }
  });
  const hooks = {
    szkody: "Zauważyłeś rysę na elewacji i zastanawiasz się, czy może mieć związek z działalnością górniczą?",
    swiadczenie: "Masz decyzję WZON albo dopiero planujesz wniosek o świadczenie wspierające?",
    renty: "Czy skutki wypadku nadal wpływają na Twoje wydatki lub możliwości zarobkowania?",
    skd: "Czy dokładnie wiesz, jakie koszty przewiduje Twoja umowa kredytu konsumenckiego?",
    przesyl: "Czy na Twojej działce znajdują się urządzenia przesyłowe?",
    franki: "Masz kredyt frankowy — aktywny albo spłacony — i chcesz sprawdzić swoją umowę?"
  };
  const shorts = {
    szkody: "Lubin, Polkowice i okolice: pęknięcia ścian, elewacji lub uszkodzenia kostki? Warto udokumentować szkody i sprawdzić możliwości działania. Pierwszy kontakt bez zobowiązania do umowy.",
    swiadczenie: "Świadczenie wspierające: jesteś przed oceną WZON, czekasz na decyzję czy składasz wniosek do ZUS? Zapytaj o możliwe dalsze kroki i przygotowanie sprawy. Bez obietnic wyniku.",
    renty: "Otrzymujesz rentę powypadkową od ubezpieczyciela lub zastanawiasz się, czy możesz o nią wystąpić? Zapytaj o indywidualną analizę świadczenia i możliwych dalszych kroków. Bez gwarancji podwyższenia.",
    skd: "Kredyt konsumencki w PLN? Wyślij pełną umowę na wojciech.obieglo@votum-ds.pl, zostaw numer telefonu i zapytaj o indywidualną analizę SKD. Bez gwarancji wyniku.",
    przesyl: "Słupy lub linie na działce? Warto ustalić dokumentację i stan prawny urządzeń przesyłowych przed podjęciem dalszych działań.",
    franki: "Kredyt frankowy CHF? Sprawdź, jakie zapisy umowy i dokumenty mogą mieć znaczenie dla indywidualnej analizy możliwych rozliczeń z bankiem. Bez obietnic wyniku."
  };
  const channels = {
    facebook: "social", facebook_grupa: "grupa", facebook_strona: "post", instagram: "social", tiktok: "social",
    google: "search", google_wizytowka: "local", ulotka: "print", plakat: "print",
    qr: "print", polecenie: "referral", organiczne: "organic", inne: "other"
  };
  const slug = value => String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ł/g, "l").replace(/[^a-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 40);
  const generate = () => {
    const chosen = campaigns[service.value];
    if (!chosen) return;
    const isMining = service.value === "szkody";
    regionControl.hidden = !isMining;
    const chosenRegion = isMining && Object.prototype.hasOwnProperty.call(miningRegions, region.value) ? miningRegions[region.value] : null;
    const origin = window.location.origin;
    // Cloudflare Pages publicly serves HTML pages at extensionless canonical URLs.
    // Prefer direct short addresses for QR codes, posts and printed flyers.
    const campaign = slug(name.value) || "kampania_bezplatna";
    const selectedChannel = Object.prototype.hasOwnProperty.call(channels, channel.value) ? channel.value : "inne";
    // The website field in Google Business Profile should point to the business home
    // (which is indexable), not to a noindex advertising-funnel landing.
    const isBusinessProfile = selectedChannel === "google_wizytowka";
    const educational = destinationControl?.value === "poradnik" && ["facebook","facebook_strona","facebook_grupa","instagram","tiktok","organiczne","polecenie"].includes(selectedChannel) && !chosenRegion ? educationalTopics[service.value] : null;
    const destination = isBusinessProfile ? "/" : educational?.path || (chosenRegion?.path || chosen.path).replace(/\.html$/, "");
    const target = new URL(destination, origin);
    const source = selectedChannel.startsWith("facebook_") ? "facebook" : isBusinessProfile ? "google" : selectedChannel;
    target.searchParams.set("utm_source", source);
    target.searchParams.set("utm_medium", channels[selectedChannel]);
    target.searchParams.set("utm_campaign", campaign);
    // A local listing is not an article variant. Preserve optional explicit
    // utm_content, but do not insert the unrelated social-post writing style.
    const variant = slug(content.value) || (isBusinessProfile ? "" : educational?.variant || slug(style.value));
    if (variant) target.searchParams.set("utm_content", variant);
    if (isBusinessProfile) target.searchParams.set("usluga", service.value);
    if (educational?.hash) target.hash = educational.hash;
    urlOutput.value = target.href;
    const isReelChannel = selectedChannel === "instagram" || selectedChannel === "tiktok";
    if (profileConfirmed) {
      if (confirmedProfileUrl !== target.href || !isReelChannel) {
        confirmedProfileUrl = "";
        profileConfirmed.checked = false;
      }
      if (profileConfirmWrap) profileConfirmWrap.hidden = !isReelChannel;
    }
    const publicationText = chosenRegion?.text || chosen.text;
    const selectedText = educational ? educational.title + "\n\n" + educational.body : style.value === "short"
      ? (chosenRegion?.short || shorts[service.value])
      : style.value === "hook"
        ? (chosenRegion?.hook || hooks[service.value]) + "\n\n" + publicationText
        : publicationText;
    const contactFooter = service.value === "skd" ? "Umowa kredytowa: wojciech.obieglo@votum-ds.pl\nTelefon: 796 441 345" : "Kontakt: " + (["swiadczenie", "renty"].includes(service.value) ? "500 171 531" : "796 441 345");
    // Plain URLs in Instagram/TikTok captions are not reliable clickable links.
    // Keep the tagged URL separately for a profile link or Story link sticker
    // where the platform/account permits it. Give readers a manual fallback.
    const captionOnly = selectedChannel === "instagram" || selectedChannel === "tiktok";
    const liveProfileLink = captionOnly && Boolean(
      profileConfirmed?.checked && confirmedProfileUrl === target.href
    );
    const captionContact = captionOnly
      ? liveProfileLink
        ? "Szczegóły i formularz kontaktowy: przejdź przez link w profilu."
        : "Informacje: twoja-sprawa.pages.dev (wpisz adres w przeglądarce)"
      : target.href;
    postOutput.value = selectedText + "\n\n" + captionContact + "\n\n" + contactFooter;
    if (platformNote) {
      platformNote.hidden = !captionOnly;
      platformNote.textContent = liveProfileLink
        ? "Podano w opisie link w profilu wyłącznie na podstawie Twojego potwierdzenia. Przed publikacją sprawdź, czy właśnie ten pełny link UTM jest aktywny i otwiera właściwy formularz."
        : !captionOnly ? "" : selectedChannel === "instagram"
        ? "Instagram: adres w zwykłym opisie posta lub rolki zazwyczaj nie jest klikalny. Skopiuj link UTM z pola powyżej i dodaj go do linków profilu albo naklejki linku w Stories. Nie pisz „link w bio”, dopóki naprawdę go tam nie ustawisz. Wpisanie krótkiego adresu ręcznie nie przeniesie parametrów UTM."
        : "TikTok: adres w opisie filmu zwykle nie jest klikalny. Skopiuj link UTM z pola powyżej do strony WWW profilu tylko wtedy, gdy Twoje konto udostępnia taką funkcję. W przeciwnym razie widz może wpisać krótki adres w przeglądarce lub zadzwonić. Ręczne wejście bez UTM nie przypisze źródła kampanii.";
    }
    openAction.href = target.href;
    // Generate QR locally, using exactly the public UTM link shown to the user.
    // No remote QR service, extra tracker, cookies, or storing client data.
    if (qrImage && qrDownload && qrStatus && qrCaption && qrFigure) {
      try {
        if (typeof qrcode !== "function") throw new Error("QR library unavailable");
        const code = qrcode(0, "M");
        code.addData(target.href);
        code.make();
        // Four-module white quiet zone, black artwork, lossless vector SVG.
        const svg = code.createSvgTag({cellSize:8, margin:32, scalable:true});
        const dataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
        qrImage.src = dataUrl;
        qrImage.hidden = false;
        qrFigure.hidden = false;
        qrDownload.href = dataUrl;
        qrDownload.download = "twoja-sprawa-qr-" + slug(service.value) +
          (chosenRegion ? "-" + slug(region.value) : "") +
          "-" + slug(selectedChannel) + "-" + campaign + ".svg";
        qrDownload.hidden = false;
        qrCaption.textContent = target.href;
        qrStatus.textContent = "Kod QR jest gotowy. Zeskanuj go telefonem przed drukowaniem.";
      } catch {
        qrFigure.hidden = true;
        qrDownload.hidden = true;
        qrStatus.textContent = "Kod QR niedostępny. Skopiuj link i przygotuj kod w Canvie.";
      }
    }
    // A4 print is limited to true print campaigns. Otherwise the QR would
    // wrongly label a paper lead as Facebook, search or a Google profile visit.
    if (flyer && flyerHeading && flyerArea && flyerText && flyerPhone && flyerQr && flyerPrint && flyerHint) {
      const printChannel = new Set(["ulotka","plakat","qr"]).has(channel.value);
      const hasQr = Boolean(qrImage && qrImage.src && !qrFigure.hidden);
      const ready = printChannel && hasQr;
      flyer.hidden = !ready;
      flyerPrint.disabled = !ready;
      flyerHint.textContent = ready
        ? "Ulotka A4 jest gotowa. Przed drukiem zeskanuj kod i sprawdź stronę docelową."
        : "Aby utworzyć ulotkę A4, ustaw źródło odbiorców: Ulotka papierowa, Plakat albo Kod QR.";
      if (ready) {
        const printTitle = isMining && chosenRegion ? "Szkody górnicze — " + chosenRegion.name : chosen.title;
        flyerHeading.textContent = printTitle;
        flyerArea.textContent = isMining ? (chosenRegion ? chosenRegion.name : "Lubin, Polkowice i okolice") : "Kontakt z całej Polski";
        flyerText.textContent = isMining && chosenRegion ? chosenRegion.short : shorts[service.value];
        flyerPhone.textContent = ["swiadczenie","renty"].includes(service.value)
          ? "500 171 531" : "796 441 345";
        flyerQr.src = qrImage.src;
      }
    }
    const preview=educational ? educationalPreviews[target.pathname] : Object.prototype.hasOwnProperty.call(previewCards,target.pathname)
      ? previewCards[target.pathname] : {title:chosen.title,description:publicationText};
    if(previewImage){
      const file=previewGraphic(target.pathname.replace(/\.html$/,""));
      const src="/assets/"+file;
      if(previewImage.getAttribute("src")!==src)previewImage.src=src;
      previewImage.alt=preview.title+" — grafika udostępnianego linku";
      const brand=file==="og-twoja-sprawa-metallic-v1.jpg";
      previewImage.width=brand?1536:1200;
      previewImage.height=brand?803:630;
    }
    if(previewTitle)previewTitle.textContent=preview.title;
    if(previewDescription)previewDescription.textContent=preview.description;
    if(previewHost)previewHost.textContent=target.hostname;
    message.textContent = isBusinessProfile
      ? "W Profilu Firmy w Google wklej do pola „Witryna” wyłącznie link z pierwszego pola (nie tekst posta). Link prowadzi na stronę główną, a wybór tematu trafia do formularza. Oznaczenia UTM mogą pomóc rozpoznać źródło przesłanego zgłoszenia, ale Google może usuwać parametry z linku wizytówki. Po zapisaniu sprawdź opublikowany odnośnik; jeśli są problemy, użyj zwykłego adresu strony głównej. Sam link nie liczy wejść ani nie gwarantuje indeksacji."
      : /(?:^|\.)pages\.dev$/i.test(window.location.hostname || "") ? "Darmowa domena Cloudflare Pages (pages.dev) nadaje się do publikacji. Przed udostępnieniem sprawdź działanie strony i odbiór formularzy." : "Link przygotowany. Możesz go skopiować lub sprawdzić stronę docelową.";
    if (educational) message.textContent += " Cel: poradnik edukacyjny. Podgląd dotyczy całej strony, nie sekcji wskazanej kotwicą.";
    if (chosenRegion && !isBusinessProfile) {
      message.textContent += " Wybrano lokalną stronę: " + chosenRegion.name + ". Link zachowuje oznaczenia UTM i kieruje do formularza tej lokalizacji.";
    } else if (chosenRegion && isBusinessProfile) {
      message.textContent += " Wybrane miasto nie zmienia adresu pola „Witryna” w Profilu Firmy — pozostaje strona główna.";
    }
  };
  const copy = async (value, label) => {
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(value);
      message.textContent = label + " skopiowano.";
    } catch {
      message.textContent = "Nie udało się skopiować automatycznie. Zaznacz tekst w polu i skopiuj go ręcznie.";
      (label === "Link" ? urlOutput : postOutput).focus();
      (label === "Link" ? urlOutput : postOutput).select();
    }
  };
  if (profileConfirmed) {
    profileConfirmed.addEventListener("change", () => {
      confirmedProfileUrl = profileConfirmed.checked ? urlOutput.value : "";
      generate();
    });
  }
  form.addEventListener("input", generate);
  form.addEventListener("change", generate);
  linkAction.addEventListener("click", () => copy(urlOutput.value, "Link"));
  postAction.addEventListener("click", () => copy(postOutput.value, "Treść posta"));
  if (flyerPrint) {
    flyerPrint.addEventListener("click", () => {
      if (flyer && !flyer.hidden && !flyerPrint.disabled && typeof window.print === "function") window.print();
    });
  }
  // Editorial presets for the user's own FB group. They only prepare a
  // locally generated post and categorical attribution; nothing is published.
  const communityPreset = Object.freeze({
    swiadczenie: {service:"swiadczenie",content:"wspierajace_post"},
    renty: {service:"renty",content:"renty_post"}
  });
  for (const presetButton of communityPresetButtons) {
    presetButton.addEventListener("click", () => {
      const preset = communityPreset[presetButton.getAttribute("data-community-preset")];
      if (!preset) return;
      service.value = preset.service;
      region.value = "ogolnie";
      if (destinationControl) destinationControl.value = "formularz";
      channel.value = "facebook_grupa";
      name.value = "grupa_swiadczenia_renty";
      content.value = preset.content;
      style.value = "educational";
      generate();
      if (communityPresetStatus)
        communityPresetStatus.textContent =
          "Przygotowano post i link UTM. Skopiuj treść poniżej i opublikuj samodzielnie w grupie. Nic nie zostało wysłane do Facebooka.";
    });
  }
  // One-click organic presets. Explicit user click is the only trigger;
  // no external publishing, message, profile edits, persistence or telemetry.
  const platformPresets = Object.freeze({
    "tiktok-szkody": {service:"szkody",channel:"tiktok",campaign:"tiktok_szkody",variant:"wideo_1"},
    "instagram-szkody": {service:"szkody",channel:"instagram",campaign:"instagram_szkody",variant:"rolka_1"},
    "instagram-skd": {service:"skd",channel:"instagram",campaign:"instagram_skd",variant:"rolka_1"},
    "tiktok-swiadczenie": {service:"swiadczenie",channel:"tiktok",campaign:"tiktok_swiadczenie",variant:"wideo_1"},
    "instagram-swiadczenie": {service:"swiadczenie",channel:"instagram",campaign:"instagram_swiadczenie",variant:"rolka_1"},
    "tiktok-renty": {service:"renty",channel:"tiktok",campaign:"tiktok_renty",variant:"wideo_1"},
    "instagram-renty": {service:"renty",channel:"instagram",campaign:"instagram_renty",variant:"rolka_1"}
  });
  for (const button of platformPresetButtons) {
    button.addEventListener("click", () => {
      const preset = platformPresets[button.getAttribute("data-platform-preset")];
      if (!preset) return;
      service.value = preset.service;
      region.value = "ogolnie";
      if (destinationControl) destinationControl.value = "formularz";
      channel.value = preset.channel;
      name.value = preset.campaign;
      content.value = preset.variant;
      style.value = "short";
      generate();
      if (platformPresetStatus)
        platformPresetStatus.textContent =
          "Przygotowano opis i osobny link UTM. Wybierz, gdzie w profilu możesz umieścić klikalny odnośnik. Niczego nie opublikowano.";
    });
  }
  generate();
})();