#!/usr/bin/env node
/** Read-only HTML and internal-link audit. No dependencies. Node 20+. */
import { readdir, readFile, access } from "node:fs/promises";
import { join, dirname, resolve } from "node:path";
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
console.log("Checked " + files.length + " HTML files");
for (const w of warnings) console.log("WARN " + w);
for (const e of errors) console.error("ERROR " + e);
if (errors.length) process.exitCode = 1;
