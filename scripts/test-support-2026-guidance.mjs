#!/usr/bin/env node
/** ZUS public-safety and legal accuracy guardrail, based on 2026 ZUS publications.
 * No personal records, no simulation of entitlement or automatic applications.
 */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const guide=await readFile("v2/wiedza/swiadczenie-wspierajace-2026-wzon-zus.html","utf8");
const service=await readFile("v2/uslugi/swiadczenie-wspierajace.html","utf8");
const campaign=await readFile("v2/kampanie/swiadczenie-wspierajace.html","utf8");
const strip=html=>html.replace(/<script\b[\s\S]*?<\/script>/gi," ").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
const article=strip(guide),offer=strip(service),ad=strip(campaign);
const assertions=[
 ["Date-specific initial WZON decision",()=>assert.ok(article.includes("1 stycznia 2026 r.")&&article.includes("pierwszego wniosku")&&article.includes("od dnia wydania decyzji"))],
 ["No automatic retroactive effective date",()=>assert.ok(article.includes("nie automatycznie od dnia złożenia wniosku"))],
 ["Three-month deadline discrepancy and safe prompt filing",()=>assert.ok(article.includes("trzy miesiące od wydania decyzji")&&article.includes("moment jej ostateczności")&&article.includes("złóż wniosek niezwłocznie"))],
 ["Official ZUS source present",()=>assert.ok(guide.includes('href="https://www.zus.pl/')&&guide.includes("ZUS —"))],
 ["Explicit free ZUS filing",()=>assert.ok(article.includes("bez opłaty")&&article.includes("pomagają bezpłatnie"))],
 ["Paid intermediary not mandatory",()=>assert.ok(article.includes("odpłatnego pośrednika nie jest obowiązkowe"))],
 ["Services and public assistance clearly separate",()=>assert.ok(article.includes("odrębna od pomocy ZUS"))],
 ["Consent required to enter agency contract",()=>assert.ok(article.includes("Samo pozostawienie kontaktu nie oznacza zawarcia umowy"))],
 ["Service page has accurate WZON effective date",()=>assert.ok(offer.includes("Ważne od 2026 r.")&&offer.includes("od dnia wydania decyzji"))],
 ["Service page links updated guide",()=>assert.ok(service.includes('href="/v2/wiedza/swiadczenie-wspierajace-2026-wzon-zus.html"'))],
 ["Service page explains free ZUS help",()=>assert.ok(offer.includes("Pomoc ZUS jest bezpłatna")&&offer.includes("Nie trzeba podpisywać odpłatnej umowy"))],
 ["No guaranteed award",()=>assert.ok(!/gwarantujemy (?:świadczenie|przyznanie)/i.test(article+" "+offer))],
 ["Preserve Paulina direct call",()=>assert.ok(service.includes('href="tel:+48500171531"')&&guide.includes('href="tel:+48500171531"'))],
 ["Preserve privacy caveat",()=>assert.ok(offer.includes("PESEL")&&article.includes("dokumentacji medycznej"))],
 ["Article modification date matches audit",()=>assert.ok(guide.includes('"dateModified":"2026-11-16"'))],
 ["Campaign discloses free ZUS help",()=>assert.ok(ad.includes("Wniosek do ZUS jest bezpłatny")&&ad.includes("nie wymaga płatnego pośrednika")&&ad.includes("dobrowolna"))],
 ["Campaign offers public ZUS source",()=>assert.ok(campaign.includes("https://www.zus.pl/o-zus/o-nas/kampanie/")&&campaign.includes("Oficjalna informacja ZUS"))]
];
for(const [name,fn] of assertions){fn();console.log("ZUS_2026_CHECK_OK "+name);}
console.log("ZUS_2026_GUIDANCE_RESULT",JSON.stringify({checks:assertions.length,officialSource:true,noAutomaticAward:true}));
