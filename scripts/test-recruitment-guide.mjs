#!/usr/bin/env node
/** Verify genuinely useful recruitment information, contact and indexable cross-links. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const source=await readFile("v2/rekrutacja.html","utf8");
const published=await readFile("dist/rekrutacja.html","utf8");
const style=await readFile("v2/recruitment-guide.css","utf8");
for(const id of ["rekrutacja-etapy","rekrutacja-obszary","rekrutacja-zasady","rekrutacja-szkic"]){
 assert.ok(source.includes('id="'+id+'"')&&published.includes('id="'+id+'"'),
  "Useful recruitment section missing in source or release: "+id);
}
const road=source.match(/<section class="recruitment-roadmap"[\s\S]*?<\/section>/)?.[0]||"";
assert.equal((road.match(/<li>/g)||[]).length,4,"Recruitment process must describe four stages");
assert.ok(source.includes("nie stanowi oferty zatrudnienia")&&source.includes("a nie ogłoszenie o otwartym naborze"),
 "Recruitment information must not be represented as a confirmed open vacancy");
assert.ok(source.includes("Nie podejmuj decyzji wyłącznie")&&source.includes("w jaki sposób ustala się wynagrodzenie"),
 "Practical applicant guardrails must be present");
assert.ok(!/"@type"\s*:\s*"JobPosting"/.test(source),
 "Do not advertise a structured job posting without a confirmed open position");
const requiredRoutes=[
 "/uslugi/szkody-gornicze",
 "/uslugi/swiadczenie-wspierajace",
 "/uslugi/kredyty-pln",
 "/lokalnie/szkody-gornicze-lubin",
 "/lokalnie/szkody-gornicze-polkowice"
];
for(const path of requiredRoutes){
 assert.ok(published.includes('href="'+path+'"'),"Canonical service link missing: "+path);
 assert.ok(!published.includes('href="/v2'+path+'.html"'),"Source-only link leaked: "+path);
}
const draft=source.match(/class="recruitment-draft-link" href="([^"]+)"/)?.[1]||"";
assert.ok(draft.startsWith("mailto:wojciech.obieglo@votum-ds.pl?subject="),
 "E-mail draft must use the known contact");
const decoded=draft.replaceAll("&amp;","&");
const params=new URL(decoded).searchParams;
assert.ok(params.get("subject")?.includes("współpracę terenową"),"Applicant email needs relevant subject");
for(const term of ["Miejscowość","Dostępność","samochodem","dodatkowa/regularna"]){
 assert.ok(params.get("body")?.includes(term),"Applicant email prompt missing: "+term);
}
assert.ok(source.includes("nie zostanie wysłana automatycznie"),"User must know mailto does not auto-send");
assert.ok(!draft.includes("utm_"),"Recruitment email must not carry trackers");
assert.ok(style.includes(".recruitment-steps")&&style.includes("@media(max-width:650px)")&&style.includes(":focus-visible"),
 "Dedicated CSS must support mobile and keyboard use");
assert.ok(published.includes('name="robots" content="index,follow"'),
 "Recruitment source must remain approved/indexable");
console.log("RECRUITMENT_GUIDE_OK: 4 stages, 5 canonical service/city links, no fabricated job posting, private mailto draft.");
