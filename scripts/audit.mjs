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
  if (!/<meta\s+name="robots" content="(?:index|noindex)[^"]*"/i.test(html)) errors.push(label + ": missing explicit robots policy");
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
    const faqStart=html.indexOf('class="campaign-faq wrap"');
    const faqEnd=html.indexOf("</section>",faqStart);
    const faqSection=faqStart>=0&&faqEnd>faqStart?html.slice(faqStart,faqEnd):"";
    if((faqSection.match(/<details>/g)||[]).length<3)warnings.push(label+": fewer than three FAQ items");
  }
  if (label.startsWith("poradniki/")) {
    if (!html.includes('src="/v2/guide-tools.js"')) errors.push(label + ": print tool missing");
    if (!html.includes('class="guide-checklist"')) errors.push(label + ": checklist missing");
    if (!html.includes('class="guide-next"')) errors.push(label + ": next-step section missing");
  }
  if (label === "index.html" && !html.includes("data-contact-form")) errors.push("index.html: missing contact form");
  if (label === "index.html" && !html.includes('class="hero-priority-grid"')) errors.push("index.html: two flagship campaign paths missing");
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
for (const js of ["v2/contact.js","v2/chat-assistant.js","v2/motion.js","v2/guide-tools.js","v2/service-navigator.js","v2/checklist.js","v2/campaign-links.js","scripts/preview.mjs"]) {
  try { execFileSync(process.execPath, ["--check",js], {stdio:"pipe"}); }
  catch (e) { errors.push(js + ": JavaScript syntax check failed: " + String(e.stderr || e.message).slice(0,500)); }
}
// Compact video library: one prominent and four expandable presentations.
try {
 const home=await readFile(join(root,"index.html"),"utf8");
 const start=home.indexOf('<section class="wrap motion-section" id="filmy">');
 const end=home.indexOf('<section class="wrap home-resource-section',start);
 const part=start>=0&&end>start?home.slice(start,end):"";
 const cards=(part.match(/class="video-feature"/g)||[]).length;
 const posters=(part.match(/class="video-poster"/g)||[]).length;
 const links=(part.match(/https:\/\/scrimba\.com\/explain\//g)||[]).length;
 if(cards!==5||posters!==5||links!==10)errors.push("Homepage: expected five videos with two access links per card, got "+cards+"/"+posters+"/"+links);
 if(!part.includes('class="video-library-more"'))errors.push("Homepage: secondary video disclosure missing");
} catch(e){errors.push("Homepage video audit failed: "+e.message);}
// Two flagship offers stay equally prominent with a restrained hero.
try {
 const home=await readFile(join(root,"index.html"),"utf8");
 const start=home.indexOf('class="hero-priority-grid"');
 const end=home.indexOf('<nav class="mobile-quick-nav"',start);
 const part=start>=0&&end>start?home.slice(start,end):"";
 if((part.match(/class="hero-support-spotlight/g)||[]).length!==2)errors.push("Homepage: expected two flagship hero cards");
 for(const slug of ["swiadczenie-wspierajace","szkody-gornicze"])
  if(!part.includes("/v2/kampanie/"+slug+".html"))errors.push("Homepage: missing priority path "+slug);
 if(!home.includes("nav-mining-priority")||!home.includes("nav-support-priority"))errors.push("Homepage: two priority menu choices missing");
 if(!home.includes('id="pytania"')||!home.includes('class="home-faq-grid"'))errors.push("Homepage: compact FAQ missing");
} catch(e){errors.push("Homepage priority audit failed: "+e.message);}
// Contact landing should show both specialists without changing form delivery.
try {
 const page=await readFile(join(root,"kontakt.html"),"utf8");
 if(!page.includes('class="premium-subpage theme-contact"')) errors.push("Contact premium: page theme missing");
 if((page.match(/class="contact-specialist"/g)||[]).length!==2) errors.push("Contact premium: expected two specialist cards");
 for(const phone of ["796 441 345","500 171 531"]) if(!page.includes(phone)) errors.push("Contact premium: missing "+phone);
 if(!page.includes('data-contact-form')) errors.push("Contact premium: original form host missing");
} catch(e){errors.push("Contact premium audit failed: "+e.message);}
// Premium contact form should distinguish API acceptance from inbox delivery.
try {
 const contact=await readFile(join(root,"contact.js"),"utf8");
 const css=await readFile(join(root,"premium-v2.css"),"utf8");
 if(!contact.includes("Nie jest to jeszcze potwierdzenie dostarczenia wiadomości")) errors.push("Contact premium: delivery caveat missing");
 if(!contact.includes("form.reset();updateAdvisor();updateGuide();updateStage()")) errors.push("Contact premium: guide state not reset");
 for(const token of [".contact-status-success",".contact-status-error",".contact-advisor",".contact-guide-box"]){
  if(!css.includes(token)) errors.push("Contact premium: missing CSS "+token);
 }
} catch(e){errors.push("Contact premium delivery audit failed: "+e.message);}
// Five direct service-finder choices lead to the relevant contact form.
try {
 const home=await readFile(join(root,"index.html"),"utf8");
 const form=await readFile(join(root,"contact.js"),"utf8");
 const contact=await readFile(join(root,"kontakt.html"),"utf8");
 if(!home.includes('id="dobierz-pomoc"')||!home.includes('src="/v2/service-navigator.js"'))errors.push("Service navigator missing");
 for(const alias of ["szkody","swiadczenie","renty","skd","przesyl"]){
  if(!home.includes('data-navigator="'+alias+'"'))errors.push("Service navigator: missing "+alias);
  if(!form.includes('"'+alias+'":'))errors.push("Contact: missing alias "+alias);
 }
 if(!contact.includes('id="formularz"'))errors.push("Contact page: form anchor missing");
} catch(e){errors.push("Service navigator audit failed: "+e.message);}
// Main acquisition landing pages must share premium styles without altering forms.
try {
 const css=await readFile(join(root,"premium-v2.css"),"utf8");
 if(!css.includes(".premium-campaign .campaign-hero")||!css.includes(".premium-campaign .campaign-form")) errors.push("Campaign premium: required styles missing");
 for(const [slug,theme] of [["swiadczenie-wspierajace","campaign-support"],["szkody-gornicze","campaign-mining"]]){
  const page=await readFile(join(root,"kampanie",slug+".html"),"utf8");
  if(!page.includes('class="campaign-page premium-campaign '+theme+'"')) errors.push("Campaign premium: theme missing "+slug);
  if(!page.includes('href="/v2/premium-v2.css"')) errors.push("Campaign premium: stylesheet missing "+slug);
  if(!page.includes('data-contact-form')||!page.includes('id="formularz"')) errors.push("Campaign premium: form missing "+slug);
 }
} catch(e){errors.push("Campaign premium audit failed: "+e.message);}
// Organic campaign generator must distinguish Facebook page and group traffic.
try {
 const html=await readFile(join(root,"narzedzia","linki-kampanii.html"),"utf8");
 const js=await readFile(join(root,"campaign-links.js"),"utf8");
 for(const channel of ["facebook_grupa","facebook_strona"]){
  if(!html.includes('value="'+channel+'"')) errors.push("Campaign channel: missing selector "+channel);
  if(!js.includes(channel+":")) errors.push("Campaign channel: missing medium "+channel);
 }
 if(!js.includes('selectedChannel.startsWith("facebook_") ? "facebook"')) errors.push("Campaign channel: Facebook source normalization missing");
} catch(e){errors.push("Campaign channel audit failed: "+e.message);}
// All five primary cards remain accessible, both featured with matching styles.
try {
 const home=await readFile(join(root,"index.html"),"utf8");
 const css=await readFile(join(root,"premium-v2.css"),"utf8");
 const start=home.indexOf('id="uslugi"');
 const end=home.indexOf('id="dobierz-pomoc"',start);
 const part=start>=0&&end>start?home.slice(start,end):"";
 if(!part.includes('class="grid primary-services"')||(part.match(/class="card primary-card/g)||[]).length!==5)errors.push("Service cards: expected exactly five");
 for(const slug of ["szkody-gornicze","swiadczenie-wspierajace","renty-powypadkowe","kredyty-pln","sluzebnosc-przesylu"])
  if(!part.includes("/v2/uslugi/"+slug+".html"))errors.push("Service card link missing: "+slug);
 if(!part.includes("support-featured")||!part.includes("mining-featured"))errors.push("Service cards: dual priority missing");
 if(!css.includes(".premium-v2 #uslugi .primary-services")||!css.includes("DUAL-PRIORITY-CHAT-20261110"))errors.push("Service card styling missing");
} catch(e){errors.push("Service card audit failed: "+e.message);}
// Premium V2 visual components, verified logo and all five film posters.
try {
 const homepage=await readFile(join(root,"index.html"),"utf8");
 const premium=await readFile(join(root,"premium-v2.css"),"utf8");
 const posterCount=homepage.split('class="video-poster"').length-1;
 if(posterCount!==5) errors.push("Premium V2: expected five visual video posters, got "+posterCount);
 if((homepage.match(/<a class="video-poster" href="https:\/\/scrimba\.com\/explain\//g)||[]).length!==5) errors.push("Premium V2: five poster video links missing");
 if(!homepage.includes('href="#uslugi"')||!homepage.includes('id="filmy"')) errors.push("Premium V2: services or video section missing");
 if(!homepage.includes('class="premium-v2"')||!homepage.includes('href="/v2/premium-v2.css"')) errors.push("Premium V2: homepage style layer missing");
 if(!homepage.includes('votum-sa.pl/wp-content/uploads/2024/06/logo_VOTUM_SA_rgb-480x71.png')) errors.push("Premium V2: official VOTUM logo missing");
 for(const token of [".premium-v2 .hero-glamour",".premium-v2 #filmy .video-library",".premium-subpage .subhero"]){
  if(!premium.includes(token)) errors.push("Premium V2: missing style "+token);
 }
 for(const [slug,theme] of [["szkody-gornicze","theme-mining"],["swiadczenie-wspierajace","theme-support"],["renty-powypadkowe","theme-rents"],["kredyty-pln","theme-skd"],["sluzebnosc-przesylu","theme-energy"]]){
  const service=await readFile(join(root,"uslugi",slug+".html"),"utf8");
  if(!service.includes('class="premium-subpage '+theme+'"')||!service.includes('href="/v2/premium-v2.css"')) errors.push("Premium V2: missing service styling "+slug);
  if(!service.includes('class="partner-inline"')) errors.push("Premium V2: VOTUM header logo missing "+slug);
 }
} catch(e){errors.push("Premium V2 audit failed: "+e.message);}
// Homepage keeps five small preparation links instead of a separate catalogue.
try {
 const home=await readFile(join(root,"index.html"),"utf8");
 const start=home.indexOf('class="home-resource-grid"');
 const end=home.indexOf('</div></section>',start);
 const part=start>=0&&end>start?home.slice(start,end):"";
 const count=(part.match(/href="\/v2\/poradniki\/[^"]+\.html"/g)||[]).length;
 if(count!==5)errors.push("Homepage: expected five concise guide links, got "+count);
} catch(e){errors.push("Homepage guides audit failed: "+e.message);}
// The campaign-link generator must use the same tracking fields as the lead form.
try {
 const builder=await readFile(join(root,"narzedzia","linki-kampanii.html"),"utf8");
 const logic=await readFile(join(root,"campaign-links.js"),"utf8");
 const contact=await readFile(join(root,"contact.js"),"utf8");
 if(!builder.includes("data-campaign-builder")||!builder.includes('src="/v2/campaign-links.js"')) errors.push("Campaign builder: missing form or script");
 if(!builder.includes('name="style"') || !logic.includes('const hooks =') || !logic.includes('const shorts =')) errors.push("Campaign builder: creative variants missing");
 for(const field of ["utm_source","utm_medium","utm_campaign","utm_content"]){
  if(!logic.includes(field)) errors.push("Campaign builder: missing "+field);
  if(!contact.includes(field)) errors.push("Contact form: tracking parameter not accepted "+field);
 }
 for(const service of ["szkody","swiadczenie","renty","skd","przesyl"]){
  if(!logic.includes(service+": {")) errors.push("Campaign builder: missing "+service);
 }
} catch(e) { errors.push("Campaign builder audit failed: "+e.message); }
// Each core lead form service must point to a matching preparation guide.
try {
 const contact=await readFile(join(root,"contact.js"),"utf8");
 for(const guide of ["checklista-szkody-gorniczej","swiadczenie-wspierajace-pierwsze-kroki","renta-powypadkowa-dokumenty","skd-kredyt-pln-lista-kontrolna","sluzebnosc-przesylu-dzialka"]){
  if(!contact.includes("/v2/poradniki/"+guide+".html")) errors.push("Contact form: missing contextual guide "+guide);
 }
 if(!contact.includes('select.addEventListener("change",updateGuide)')) errors.push("Contact form: guide does not follow service selection");
} catch(e) {errors.push("Contact guide audit failed: "+e.message);}
// All five core guides must offer an interactive checklist with a local-only script.
for (const slug of ["checklista-szkody-gorniczej","swiadczenie-wspierajace-pierwsze-kroki","renta-powypadkowa-dokumenty","skd-kredyt-pln-lista-kontrolna","sluzebnosc-przesylu-dzialka"]) {
 try {
  const guide=await readFile(join(root,"poradniki",slug+".html"),"utf8");
  if (!guide.includes('class="interactive-checklist"') || !guide.includes('/v2/checklist.js')) errors.push("Guide "+slug+": missing interactive checklist or script");
 } catch(e) { errors.push("Guide "+slug+": "+e.message); }
}
console.log("Checked " + files.length + " HTML files, including " + serviceForms.length + " service forms");
if(serviceForms.length !== 12) errors.push("Expected 12 service pages, found "+serviceForms.length);
for (const w of warnings) console.log("WARN " + w);
for (const e of errors) console.error("ERROR " + e);
if (errors.length) process.exitCode = 1;
