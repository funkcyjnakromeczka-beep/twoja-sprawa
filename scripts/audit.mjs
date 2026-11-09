#!/usr/bin/env node
/** Read-only HTML and internal-link audit. No dependencies. Node 20+. */
import { readdir, readFile, access } from "node:fs/promises";
import { join, dirname, resolve } from "node:path";
import { execFileSync } from "node:child_process";
const root = resolve("v2");
const files = [];
async function walk(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, item.name);
    if (item.isDirectory()) await walk(path);
    else if (item.name.endsWith(".html")) files.push(path);
  }
}
await walk(root);
const errors = [], warnings = [];
const seenTitles = new Map();
const serviceForms = [];
const exists = async path => { try { await access(path); return true; } catch { return false; } };
for (const file of files) {
  const html = await readFile(file, "utf8");
  const label = file.slice(root.length + 1);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  const h1 = [...html.matchAll(/<h1\b[^>]*>/gi)];
  if (!title) errors.push(label + ": missing title");
  else if (seenTitles.has(title)) warnings.push(label + ": duplicate title with " + seenTitles.get(title));
  else seenTitles.set(title, label);
  if (h1.length !== 1) errors.push(label + ": expected one H1, found " + h1.length);
  if (!/<meta\s+name="description"/i.test(html)) warnings.push(label + ": missing meta description");
  if (!/<meta\s+name="robots" content="noindex,follow"/i.test(html)) errors.push(label + ": draft page must remain noindex");
  if (!/<html\s+lang="pl"/i.test(html)) warnings.push(label + ": missing lang=pl");
  if (/<script\b[^>]*src="https?:/i.test(html)) warnings.push(label + ": third-party script needs privacy review");
  if (html.includes("data-contact-form") && !html.includes('src="/v2/contact.js"')) errors.push(label + ": contact form without script");
  if (label.startsWith("uslugi/")) {
    if (!html.includes("data-contact-form")) errors.push(label + ": service page missing contact form");
    if (!html.includes('src="/v2/contact.js"')) errors.push(label + ": service page missing contact script");
    else if (!/data-service="[^"]+"/.test(html)) errors.push(label + ": missing default service");
    if (!/<section\b[^>]*\bid="formularz"[^>]*>/.test(html)) errors.push(label + ": missing #formularz target");
    if (html.includes('href="/v2/#kontakt">Przygotuj zapytanie')) errors.push(label + ": CTA incorrectly links to homepage instead of local form");
    if (html.includes("Automatyczny formularz nie jest jeszcze aktywny")) warnings.push(label + ": outdated inactive-form notice");
    serviceForms.push(label);
  }
  if (label.startsWith("kampanie/")) {
    if (!html.includes('id="formularz"')) errors.push(label + ": campaign landing missing #formularz");
    if (!html.includes("data-contact-form")) errors.push(label + ": campaign landing missing form");
    if (!/data-service="[^"]+"/.test(html)) errors.push(label + ": campaign landing missing service");
    if (!html.includes('href="#formularz"')) warnings.push(label + ": campaign landing missing form CTA");
    if (!html.includes('class="campaign-mobile-actions"')) errors.push(label + ": missing mobile conversion bar");
    if (!html.includes('class="campaign-mobile-call"')) errors.push(label + ": missing mobile call button");
    if (!html.includes('class="campaign-process-list"')) warnings.push(label + ": campaign contact steps missing");
    const faqMatch=html.match(new RegExp('<script type="application/ld\\+json">([\s\S]*?)</script>',"i"));
    if (!faqMatch) warnings.push(label + ": structured FAQ missing");
    else { try { const faq=JSON.parse(faqMatch[1]); if(faq["@type"]!=="FAQPage"||faq.mainEntity?.length!==3) warnings.push(label + ": unexpected FAQ schema"); } catch { errors.push(label + ": invalid FAQ JSON-LD"); } }
  }
  if (label.startsWith("poradniki/")) {
    if (!html.includes('src="/v2/guide-tools.js"')) errors.push(label + ": print tool missing");
    if (!html.includes('class="guide-checklist"')) errors.push(label + ": checklist missing");
    if (!html.includes('class="guide-next"')) errors.push(label + ": next-step section missing");
  }
  if (label === "index.html" && !html.includes("data-contact-form")) errors.push("index.html: missing contact form");
  if (label === "index.html" && !html.includes('class="campaign-home-grid"')) warnings.push("index.html: featured campaign paths missing");
  if (label === "index.html" && !html.includes('src="/v2/chat-assistant.js"')) warnings.push("index.html: assistant script missing");
  const anchors = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
  for (const match of html.matchAll(/href="#([^"]+)"/g)) {
    const targetId = decodeURIComponent(match[1]);
    if (!anchors.has(targetId)) errors.push(label + ": missing internal anchor #" + targetId);
  }
  const attributes = [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)].map(m => m[1]);
  for (const attr of attributes) {
    if (!attr.startsWith("/v2/")) continue;
    const path = decodeURIComponent(attr.split(/[?#]/)[0]).slice("/v2/".length);
    if (path.includes("..")) { errors.push(label + ": unsafe path " + attr); continue; }
    const target = resolve(root, path);
    if (!target.startsWith(root + "/") && target !== root) { errors.push(label + ": outside root " + attr); continue; }
    if (!(await exists(target)) && !(await exists(join(target, "index.html")))) errors.push(label + ": broken link " + attr);
  }
}
for (const js of ["v2/contact.js","v2/chat-assistant.js","v2/motion.js","v2/guide-tools.js","v2/service-navigator.js","v2/checklist.js","scripts/preview.mjs"]) {
  try { execFileSync(process.execPath, ["--check",js], {stdio:"pipe"}); }
  catch (e) { errors.push(js + ": JavaScript syntax check failed: " + String(e.stderr || e.message).slice(0,500)); }
}
// Main-page video library: every core service needs a playable presentation link.
try {
 const home = await readFile(join(root,"index.html"),"utf8");
 const start = home.indexOf('<div class="video-library"');
 const end = home.indexOf('<div class="video-links">',start);
 if (start < 0 || end < start) errors.push("Homepage: missing video library");
 else {
  const section = home.slice(start,end);
  const count = section.split('class="video-feature"').length - 1;
  const links = section.split('https://scrimba.com/explain/').length - 1;
  if (count !== 5 || links !== 5) errors.push("Homepage: expected five video cards with five video links, got "+count+" cards and "+links+" links");
 }
} catch(e) { errors.push("Homepage video library audit failed: "+e.message); }
console.log("Checked " + files.length + " HTML files, including " + serviceForms.length + " service forms");
if(serviceForms.length !== 12) errors.push("Expected 12 service pages, found "+serviceForms.length);
for (const w of warnings) console.log("WARN " + w);
for (const e of errors) console.error("ERROR " + e);
if (errors.length) process.exitCode = 1;
