/* Generator linków promocyjnych: bez cookies, zewnętrznych skryptów i przechowywania danych. */
(() => {
  "use strict";
  const form = document.querySelector("[data-campaign-builder]");
  if (!form) return;
  const service = form.querySelector("[name=service]");
  const channel = form.querySelector("[name=channel]");
  const name = form.querySelector("[name=campaign]");
  const content = form.querySelector("[name=content]");
  const style = form.querySelector("[name=style]");
  const urlOutput = document.querySelector("[data-campaign-url]");
  const postOutput = document.querySelector("[data-campaign-post]");
  const message = document.querySelector("[data-campaign-status]");
  const linkAction = document.querySelector("[data-copy-link]");
  const postAction = document.querySelector("[data-copy-post]");
  const openAction = document.querySelector("[data-open-link]");
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
      path: "/uslugi/renty-powypadkowe.html",
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
    swiadczenie: "Świadczenie wspierające: WZON, ZUS, decyzja lub wniosek? Uporządkuj etap sprawy i poznaj możliwe dalsze kroki. Bez obietnic wyniku.",
    renty: "Renta powypadkowa: sprawdź, jakie dokumenty i informacje mogą być potrzebne do analizy indywidualnej sytuacji.",
    skd: "Kredyt konsumencki w PLN? Wyślij pełną umowę na wojciech.obieglo@votum-ds.pl, zostaw numer telefonu i zapytaj o indywidualną analizę SKD. Bez gwarancji wyniku.",
    przesyl: "Słupy lub linie na działce? Warto ustalić dokumentację i stan prawny urządzeń przesyłowych przed podjęciem dalszych działań.",
    franki: "Kredyt frankowy CHF? Sprawdź, jakie zapisy umowy i dokumenty mogą mieć znaczenie dla indywidualnej analizy możliwych rozliczeń z bankiem. Bez obietnic wyniku."
  };
  const channels = {
    facebook: "social", facebook_grupa: "grupa", facebook_strona: "post", instagram: "social", tiktok: "social",
    google: "search", ulotka: "print", plakat: "print",
    qr: "print", polecenie: "referral", organiczne: "organic", inne: "other"
  };
  const slug = value => String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ł/g, "l").replace(/[^a-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 40);
  const generate = () => {
    const chosen = campaigns[service.value];
    if (!chosen) return;
    const origin = window.location.origin;
    // Cloudflare Pages publicly serves HTML pages at extensionless canonical URLs.
    // Prefer direct short addresses for QR codes, posts and printed flyers.
    const target = new URL(chosen.path.replace(/\.html$/, ""), origin);
    const campaign = slug(name.value) || "kampania_bezplatna";
    const selectedChannel = Object.prototype.hasOwnProperty.call(channels, channel.value) ? channel.value : "inne";
    const source = selectedChannel.startsWith("facebook_") ? "facebook" : selectedChannel;
    target.searchParams.set("utm_source", source);
    target.searchParams.set("utm_medium", channels[selectedChannel]);
    target.searchParams.set("utm_campaign", campaign);
    const variant = slug(content.value) || slug(style.value);
    if (variant) target.searchParams.set("utm_content", variant);
    urlOutput.value = target.href;
    const selectedText = style.value === "short" ? shorts[service.value] : style.value === "hook" ? hooks[service.value] + "\n\n" + chosen.text : chosen.text;
    const contactFooter = service.value === "skd" ? "Umowa kredytowa: wojciech.obieglo@votum-ds.pl\nTelefon: 796 441 345" : "Kontakt: " + (["swiadczenie", "renty"].includes(service.value) ? "500 171 531" : "796 441 345");
    postOutput.value = selectedText + "\n\n" + target.href + "\n\n" + contactFooter;
    openAction.href = target.href;
    message.textContent = /(?:^|\.)pages\.dev$/i.test(window.location.hostname || "") ? "Darmowa domena Cloudflare Pages (pages.dev) nadaje się do publikacji. Przed udostępnieniem sprawdź działanie strony i odbiór formularzy." : "Link przygotowany. Możesz go skopiować lub sprawdzić stronę docelową.";
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
  form.addEventListener("input", generate);
  form.addEventListener("change", generate);
  linkAction.addEventListener("click", () => copy(urlOutput.value, "Link"));
  postAction.addEventListener("click", () => copy(postOutput.value, "Treść posta"));
  generate();
})();