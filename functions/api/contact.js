/**
 * Cloudflare Pages Function — POST /api/contact
 * Deployment is intentionally disabled until required secrets are configured.
 * Required: RESEND_API_KEY, CONTACT_FROM, CONTACT_TO, TURNSTILE_SECRET_KEY.
 * CONTACT_FROM must use a sender/domain verified in Resend.
 */
const MAX_BYTES = 6000;
const SERVICES = new Set([
  "Szkody górnicze","Świadczenie wspierające","Służebność przesyłu",
  "Renty powypadkowe","Kredyt w PLN / SKD","Wypadek komunikacyjny",
  "Wypadek przy pracy","Wypadek w rolnictwie","Szkoda na nieruchomości",
  "Odszkodowanie za hałas","Pomoc w sprawie karnej","Nieudany urlop","Inna sprawa"
]);
const json = (value, status = 200) => new Response(JSON.stringify(value), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  }
});
const clean = (value, max) => typeof value === "string" ? value.trim().slice(0, max) : "";
const validEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 254;

export async function onRequestPost({ request, env }) {
  if (!env.RESEND_API_KEY || !env.CONTACT_FROM || !env.CONTACT_TO || !env.TURNSTILE_SECRET_KEY) {
    return json({ ok: false, error: "unavailable" }, 503);
  }
  const origin = request.headers.get("Origin");
  const expected = env.PUBLIC_ORIGIN;
  if (!expected || !origin || origin !== expected) return json({ ok: false, error: "origin" }, 403);
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_BYTES) return json({ ok: false, error: "size" }, 413);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return json({ ok: false, error: "content_type" }, 415);
  }
  let payload;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > MAX_BYTES) return json({ ok: false, error: "size" }, 413);
    payload = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return json({ ok: false, error: "invalid" }, 400);
  if (payload.website) return json({ ok: false, error: "validation" }, 400); // honeypot; do not claim successful delivery
  const service = clean(payload.service, 100);
  const location = clean(payload.location, 100);
  const name = clean(payload.name, 80);
  const phone = clean(payload.phone, 30);
  const message = clean(payload.message, 1200);
  const email = clean(payload.email, 254);
  const token = clean(payload.turnstileToken, 4096);
  if (!SERVICES.has(service) || !name || !location || !/^[+0-9()\s-]{7,30}$/.test(phone) || !validEmail(email) || !token || payload.privacyAcknowledged !== true) {
    return json({ ok: false, error: "validation" }, 400);
  }
  // Check Turnstile server-side. Do not trust browser verification alone.
  const verifyBody = new FormData();
  verifyBody.set("secret", env.TURNSTILE_SECRET_KEY);
  verifyBody.set("response", token);
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) verifyBody.set("remoteip", ip);
  let verified;
  try {
    const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST", body: verifyBody
    });
    verified = verification.ok && (await verification.json()).success === true;
  } catch { verified = false; }
  if (!verified) return json({ ok: false, error: "verification" }, 400);
  const body = [
    "Zapytanie z witryny Twoja Sprawa", "",
    "Usługa: " + service,
    "Imię: " + name,
    "Miejscowość: " + location,
    "Telefon: " + phone,
    "E-mail kontaktowy: " + email, "",
    "Opis:", message || "Nie podano — prośba o kontakt.", "",
    "Wiadomość wygenerowana przez formularz strony."
  ].join("\n");
  let sent;
  try {
    sent = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": "Bearer " + env.RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.CONTACT_FROM,
        to: [env.CONTACT_TO],
        reply_to: email,
        subject: "Twoja Sprawa: " + service,
        text: body
      })
    });
  } catch { return json({ ok: false, error: "delivery" }, 502); }
  if (!sent.ok) return json({ ok: false, error: "delivery" }, 502);
  return json({ ok: true });
}

export async function onRequest() {
  return json({ ok: false, error: "method" }, 405);
}
