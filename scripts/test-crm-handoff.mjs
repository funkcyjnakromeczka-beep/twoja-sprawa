#!/usr/bin/env node
/* Bezpieczny, lokalny most CRM: testy wyłącznie na fikcyjnych metadanych. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {runInNewContext} from "node:vm";

const coreSrc=await readFile("v2/crm-handoff-core.js","utf8");
const clientSrc=await readFile("v2/crm-handoff.js","utf8");
const html=await readFile("v2/narzedzia/linki-kampanii.html","utf8");
const css=await readFile("v2/crm-handoff.css","utf8");
const win={};
runInNewContext(coreSrc,{window:win});
const api=win.TwojaSprawaCrmHandoff;
assert.ok(api,"Expected manual CRM handoff core");
assert.equal(Object.keys(api.services).length,6);
assert.equal(Object.keys(api.statuses).length,7);
assert.equal(api.sources.length,18);
const sample={ref:"ts-20261120-ab12cd34ef56",service:"renty",source:"facebook",campaign:"renty_rolka_2",status:"nowe"};
const item=api.prepare(sample);
assert.equal(item.ref,"TS-20261120-AB12CD34EF56");
assert.equal(item.service,"Renty powypadkowe");
assert.equal(item.advisor,"Paulina Chandrała");
assert.equal(item.source,"facebook");
const note=api.note(sample);
assert.ok(note.includes("Kod zgłoszenia: TS-20261120-AB12CD34EF56"));
assert.ok(note.includes("Kampania UTM: renty_rolka_2"));
assert.ok(note.includes("Opiekun: Paulina Chandrała"));
assert.ok(note.includes("Sprawdź e-mail Web3Forms")===false,"Use the current caution wording");
assert.ok(note.includes("sprawdź e-mail Web3Forms"));
assert.ok(!note.includes("phone=")&&!note.includes("PESEL"),"No client details");
for(const [service,advisor] of [
 ["swiadczenie","Paulina Chandrała"],
 ["renty","Paulina Chandrała"],
 ["szkody","Wojciech Obiegło"],
 ["skd","Wojciech Obiegło"],
 ["franki","Wojciech Obiegło"],
 ["przesyl","Wojciech Obiegło"]
]) assert.equal(api.prepare({...sample,service}).advisor,advisor);
for(const change of [
 {ref:"TS-20261120-INVALID"},
 {ref:"20261120-AB12CD34EF56"},
 {ref:"TS-20261120-AB12CD34EF56 Jan Kowalski"},
 {service:"nieistniejaca"},
 {source:"fake.example"},
 {campaign:"Jan Kowalski"},
 {campaign:"=IMPORTXML(x)"},
 {status:"signed_without_confirmation"}
])assert.throws(()=>api.prepare({...sample,...change}),Error);
assert.equal(api.prepare({...sample,campaign:""}).campaign,"brak");
assert.ok(html.includes('id="przekazanie-do-crm"'),"Handoff visible in campaign builder");
assert.ok(html.includes('data-crm-handoff')&&html.includes('data-crm-note')&&html.includes('data-crm-copy'));
assert.ok(html.includes('name="robots" content="noindex,follow"'),"Internal tool remains noindex");
assert.ok(html.includes('src="/v2/crm-handoff-core.js" defer')&&html.includes('src="/v2/crm-handoff.js" defer'));
assert.ok(html.includes('href="/v2/crm-handoff.css"'));
assert.ok(html.includes("To nie jest automatyczna integracja"),"Do not imply CRM access");
assert.ok(html.includes("nie wpisuj imienia"),"Tool must warn about confidential data");
assert.ok(css.includes("@media(max-width:560px)")&&css.includes(":focus-visible"));
const banned=/\b(fetch|sendBeacon|XMLHttpRequest|localStorage|sessionStorage|document\.cookie)\b/;
assert.ok(!banned.test(coreSrc+clientSrc),"No network, tracking, or storage should be added");

const fields=Object.fromEntries(Object.entries(sample).map(([k,v])=>[k,{value:v}]));
const listeners={};
const form={elements:{namedItem:key=>fields[key]},addEventListener:(name,fn)=>listeners[name]=fn};
const output={value:"",focused:false,selected:false,focus(){this.focused=true;},select(){this.selected=true;}};
const status={textContent:""};
const button={disabled:false,addEventListener:(name,fn)=>button[name]=fn};
const elements={"[data-crm-handoff]":form,"[data-crm-note]":output,"[data-crm-status]":status,"[data-crm-copy]":button};
const document={querySelector:selector=>elements[selector]||null};
const copied=[];
const navigator={clipboard:{writeText:async v=>copied.push(v)}};
runInNewContext(clientSrc,{window:{TwojaSprawaCrmHandoff:api},document,navigator});
assert.equal(button.disabled,true,"Must not copy before preparing a note");
listeners.submit({preventDefault(){}});
assert.equal(button.disabled,false);
assert.equal(output.value,note);
assert.ok(status.textContent.includes("Przygotowano notatkę"));
await button.click();
assert.equal(copied.length,1);
assert.equal(copied[0],note,"Copy only the checked note on explicit click");
fields.campaign.value="nowa_rolka";
listeners.input();
assert.equal(button.disabled,true,"Edits invalidate the earlier note");
assert.equal(output.value,"","Old reference should be cleared after edit");
await button.click();
assert.equal(copied.length,1,"No stale note can be copied");
fields.campaign.value="Klient Jan";
listeners.submit({preventDefault(){}});
assert.equal(button.disabled,true,"Reject unsafe campaign text");
assert.ok(status.textContent.includes("Kampania"));
console.log("CRM_HANDOFF_OK: six advisers, 18 channels, strict TS reference, explicit clipboard, no network/storage or client data.");
