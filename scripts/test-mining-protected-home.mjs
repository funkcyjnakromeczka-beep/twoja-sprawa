#!/usr/bin/env node
/** Regression: prior mining protection is not an automatic acceptance or rejection of claims. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const read=path=>readFile(path,"utf8");
const article=await read("v2/wiedza/drobne-pekniecia-szkody-gornicze.html");
const section=article.match(/<section id="zabezpieczony-dom" aria-labelledby="zabezpieczony-dom-heading">([\s\S]*?)<\/section>/)?.[1]||"";
assert.ok(section.includes('<h2 id="zabezpieczony-dom-heading">'),"Anchor must have a real, accessible heading");
assert.equal((section.match(/<li>/g)||[]).length,5,"Five practical steps, not a legal promise");
for(const marker of [
 "fundamentów","dokumentacji wzmocnienia","datę","ugody","gruntowych",
 "Art. 144 ust. 1","art. 146 ust. 1","Art. 150","art. 149","pięć lat",
 "https://eli.gov.pl/eli/DU/2026/69/ogl",
 "nie wykluczają automatycznie","nie oznacza","Nie wpisuj"
])assert.ok(section.toLowerCase().includes(marker.toLowerCase()),"Crucial factual or safety qualification missing: "+marker);
assert.ok(section.includes('href="/v2/uslugi/szkody-gornicze.html?etap=zabezpieczenia#formularz"'),"Article CTA must choose known stage");
assert.ok(article.includes('"dateModified":"2026-11-21"'),"Article metadata should be updated on the content revision");
assert.ok(!/gwarantujemy|100%|odszkodowanie należy się każdemu/i.test(section),"No guaranteed award or generic assertions");
const localDiscovery=article.split('<section id="lokalnie-pierwsze-objawy" aria-labelledby="local-injury-heading">')[1]?.split("</section>")[0]||"";
assert.ok(localDiscovery.includes('<h2 id="local-injury-heading">'),"Reviewed mining article needs clear local section");
for(const slug of ["lubin","polkowice"]){
 const href='/v2/lokalnie/szkody-gornicze-'+slug+'.html';
 assert.equal(localDiscovery.split('href="'+href+'"').length-1,1,"Mining article lost "+slug+" discovery");
}
assert.ok(localDiscovery.includes("Położenie działki nie przesądza"),
 "Local entry must not guarantee mining causation");
assert.ok(!localDiscovery.includes("data-contact-form")&&!localDiscovery.includes("PESEL")&&!localDiscovery.includes("utm_"),
 "Local editorial crosslinks must not collect data or add tracking");
const service=await read("v2/uslugi/szkody-gornicze.html");
const serviceSection=service.match(/<section class="focus-detail" id="wzmocnione-fundamenty" aria-labelledby="wzmocnione-fundamenty-title">([\s\S]*?)<\/section>/)?.[1]||"";
assert.ok(serviceSection.includes('<h2 id="wzmocnione-fundamenty-title">'),"Visible service block");
assert.ok(serviceSection.includes('href="/v2/wiedza/drobne-pekniecia-szkody-gornicze.html#zabezpieczony-dom"'),"Guide navigation");
assert.ok(serviceSection.includes('href="/v2/uslugi/szkody-gornicze.html?etap=zabezpieczenia#formularz"'),"Service lead route");
assert.ok(service.indexOf('id="wzmocnione-fundamenty"')<service.indexOf('id="formularz"'),"Education before contact");
const stages=await read("v2/contact.js");
assert.ok(stages.includes('zabezpieczenia:"Pojawiły się szkody mimo wcześniejszych zabezpieczeń lub napraw"'),"Contact must accept only enumerated, non-personal stage code");
assert.ok(stages.includes('"Zauważyłem/am uszkodzenia","Pojawiły się szkody mimo wcześniejszych zabezpieczeń lub napraw","Zgłosiłem/am szkodę do kopalni"'),"Stage option must appear in UI");
for(const city of ["lubin","polkowice"]){
 const local=await read("v2/lokalnie/szkody-gornicze-"+city+".html");
 assert.ok(local.includes('id="szkody-po-zabezpieczeniu"'),"Local contextual card missing: "+city);
 assert.ok(local.includes('href="/v2/wiedza/drobne-pekniecia-szkody-gornicze.html#zabezpieczony-dom"'),"Local guide link: "+city);
 assert.ok(local.includes('href="/v2/lokalnie/szkody-gornicze-'+city+'.html?etap=zabezpieczenia#formularz"'),"Local selected form: "+city);
 assert.ok(local.includes('data-service="Szkody górnicze"')&&local.includes('id="formularz"'),"Local contact mount intact: "+city);
 assert.ok(local.includes("nie wyłącza automatycznie analizy roszczenia"),"No denial due solely to protection: "+city);
}
const hub=await read("v2/wiedza/index.html");
assert.ok(hub.includes("fundamenty były wzmacniane, a rysy wróciły"),"Knowledge search discovery must include the new topic");
assert.equal((hub.match(/<a class="hub-card(?:\s|")/g)||[]).length,10,"Editorial hub still has ten reviewed and archival cards");
console.log("MINING_PROTECTED_HOME_OK: official statute, 5 practical steps, 3 entry points, 2 local funnels, safe known lead stage and explicit non-guarantee.");
