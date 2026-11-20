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
runInNewContext(coreSrc,{window:win,URL});
const api=win.TwojaSprawaCrmHandoff;
assert.ok(api,"Expected manual CRM handoff core");
assert.equal(Object.keys(api.services).length,6);
assert.equal(Object.keys(api.statuses).length,7);
assert.equal(Object.keys(api.nextSteps).length,7,"Each status needs an explicit next step");
assert.equal(api.parseFollowUpDate(""),"","Follow-up must be optional");
assert.equal(api.parseFollowUpDate("2028-02-29"),"2028-02-29","Allow leap-day dates");
for(const bad of ["2027-02-29","2026-11-31","2026-13-01","tomorrow","2026-1-2","2026-11-20 Jan Kowalski"]){
 assert.throws(()=>api.parseFollowUpDate(bad),/datę|Data/,"Reject invalid follow-up "+bad);
}
assert.equal(api.sources.length,18);
assert.ok(typeof api.campaignFromUrl==="function","Safe campaign importer should be public");
assert.equal(typeof api.calendarReminder,"function","Standalone neutral calendar event must be available");
const ics=api.calendarReminder("2026-11-27","local-event-000001");
assert.ok(ics.startsWith("BEGIN:VCALENDAR\\r\\n"),"ICS must use CRLF line breaks");
assert.ok(ics.includes("DTSTART;VALUE=DATE:20261127\\r\\n"));
assert.ok(ics.includes("DTEND;VALUE=DATE:20261128\\r\\n"));
assert.match(ics,/DTSTAMP:\\d{8}T\\d{6}Z/);
assert.ok(ics.includes("SUMMARY:Twoja Sprawa - przeglad zaplanowanych kontaktow"));
assert.ok(!ics.includes("AB12CD34EF56")&&!ics.includes("Paulina")&&!ics.includes("facebook"),"Calendar has no customer reference, advisor or marketing metadata");
const yearEnd=api.calendarReminder("2026-12-31","year-end-000001");
assert.ok(yearEnd.includes("DTEND;VALUE=DATE:20270101"),"Calendar event correctly rolls into the next year");
assert.throws(()=>api.calendarReminder("2026-02-30","valid-event-001"),/Data kolejnego kontaktu/);
assert.throws(()=>api.calendarReminder("","valid-event-001"),/Ustal datę/);
assert.throws(()=>api.calendarReminder("2026-11-27","../illegal"),/identyfikator/);

const sourceUrl="https://twoja-sprawa.pages.dev/kampanie/renty-powypadkowe?utm_source=facebook&utm_campaign=renty_rolka_2&email=private%40example.com";
const importedCampaign=api.campaignFromUrl(sourceUrl,"https://twoja-sprawa.pages.dev");
assert.equal(importedCampaign.source,"facebook");
assert.equal(importedCampaign.campaign,"renty_rolka_2");
assert.equal(Object.keys(importedCampaign).sort().join("|"),"campaign|source","Never transfer email or other URL data");
for(const badUrl of [
 "https://twoja-sprawa.pages.dev.evil.example/?utm_source=facebook&utm_campaign=x",
 "javascript:alert(1)",
 "https://evil.example/?utm_source=facebook&utm_campaign=x",
 "https://twoja-sprawa.pages.dev/?utm_source=unknown&utm_campaign=x",
 "https://twoja-sprawa.pages.dev/?utm_source=facebook&utm_campaign=Jan%20Kowalski"
]) assert.throws(()=>api.campaignFromUrl(badUrl,"https://twoja-sprawa.pages.dev"),/Nieprawidłowy|własnej witryny|poprawnego/);
const sample={ref:"ts-20261120-ab12cd34ef56",service:"renty",source:"facebook",campaign:"renty_rolka_2",status:"nowe"};
const item=api.prepare(sample);
assert.equal(item.ref,"TS-20261120-AB12CD34EF56");
assert.equal(item.service,"Renty powypadkowe");
assert.equal(item.advisor,"Paulina Chandrała");
assert.equal(item.source,"facebook");
assert.throws(()=>api.prepare({...sample,ref:"TS-20260230-AB12CD34EF56"}),/Podaj pełny kod TS/,"Impossible calendar date must fail");
assert.throws(()=>api.prepare({...sample,ref:"TS-20261131-AB12CD34EF56"}),/Podaj pełny kod TS/);
assert.equal(api.prepare({...sample,ref:"TS-20240229-AB12CD34EF56"}).ref,"TS-20240229-AB12CD34EF56","Leap day is valid");
assert.throws(()=>api.prepare({...sample,status:"umowa"}),/potwierdź/,"Signed contract requires verification");
assert.throws(()=>api.prepare({...sample,status:"przekazane"}),/potwierdź/,"Transfer to VOTUM requires verification");
assert.ok(api.note({...sample,status:"umowa",confirmed:true}).includes("wymaga potwierdzenia"));
const note=api.note(sample);
assert.ok(note.includes("Kod zgłoszenia: TS-20261120-AB12CD34EF56"));
assert.ok(note.includes("Kampania UTM: renty_rolka_2"));
assert.ok(note.includes("Opiekun: Paulina Chandrała"));
assert.ok(note.includes("Następny krok (zalecenie wewnętrzne):"),"Include a status-specific checklist recommendation");
assert.ok(note.includes("Wpływ zgłoszenia zweryfikowany: NIE — wymaga sprawdzenia"));
assert.ok(note.includes("Sprawdzono duplikaty w CRM: NIE — wymaga sprawdzenia"));
assert.ok(note.includes("Następny kontakt (plan wewnętrzny): nie ustalono"));
const verifiedNote=api.note({...sample,received:true,checkedDuplicates:true,followUp:"2026-11-27"});
assert.ok(verifiedNote.includes("Wpływ zgłoszenia zweryfikowany: TAK — zaznaczono ręcznie"));
assert.ok(verifiedNote.includes("Sprawdzono duplikaty w CRM: TAK — zaznaczono ręcznie"));
assert.ok(verifiedNote.includes("Następny kontakt (plan wewnętrzny): 2026-11-27"));
assert.ok(!verifiedNote.includes("Automatyczne przypomnienie"));

for(const status of Object.keys(api.statuses)){
 const statusNote=api.note({...sample,status,confirmed:true});
 assert.ok(statusNote.includes(api.nextSteps[status]),"Next step must match status "+status);
 assert.ok(!statusNote.includes("test@example.com"),"No personal details are added");
}
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
])assert.throws(()=>api.prepare({...sample,...change}),/Podaj|Wybierz|Kampania/);
assert.equal(api.prepare({...sample,campaign:""}).campaign,"brak");
assert.ok(html.includes('id="przekazanie-do-crm"'),"Handoff visible in campaign builder");
assert.ok(html.includes('data-crm-handoff')&&html.includes('data-crm-note')&&html.includes('data-crm-copy'));
assert.ok(html.includes('data-crm-from-campaign'),"One-click import must be available");
assert.ok(html.includes('data-crm-calendar'),"User should be able to download a neutral calendar entry");
assert.ok(html.includes("Plik .ics obejmuje cały wybrany dzień"),"No implied automatic reminders");

assert.ok(html.includes('name="confirmed" type="checkbox"'),"Confirmation of sensitive statuses must be explicit");
assert.ok(html.includes('name="received" type="checkbox"'),"Check delivery manually");
assert.ok(html.includes('name="checkedDuplicates" type="checkbox"'),"Check the CRM manually for duplicates");
assert.ok(html.includes('name="followUp" type="date"'),"The follow-up date must be optional");
assert.ok(html.includes("bez automatycznego przypomnienia"),"No automation promised");

assert.ok(html.includes('name="robots" content="noindex,follow"'),"Internal tool remains noindex");
assert.ok(html.includes('src="/v2/crm-handoff-core.js" defer')&&html.includes('src="/v2/crm-handoff.js" defer'));
assert.ok(html.includes('href="/v2/crm-handoff.css"'));
assert.ok(html.includes("To nie jest automatyczna integracja"),"Do not imply CRM access");
assert.ok(html.includes("nie wpisuj imienia"),"Tool must warn about confidential data");
assert.ok(html.includes("w bieżącej karcie"),"Warn that duplicate checking only works in a single open tab");
assert.ok(html.includes("proponowany następny krok"),"Explain that actions are recommendations only");
assert.ok(css.includes("@media(max-width:560px)")&&css.includes(":focus-visible"));
const banned=/\b(fetch|sendBeacon|XMLHttpRequest|localStorage|sessionStorage|document\.cookie)\b/;
assert.ok(!banned.test(coreSrc+clientSrc),"No network, tracking, or storage should be added");

const fields=Object.fromEntries(Object.entries(sample).map(([k,v])=>[k,{value:v}]));
fields.confirmed={checked:false};
fields.received={checked:false};
fields.checkedDuplicates={checked:false};
fields.followUp={value:""};
const listeners={};
const form={elements:{namedItem:key=>fields[key]},addEventListener:(name,fn)=>listeners[name]=fn};
const output={value:"",focused:false,selected:false,focus(){this.focused=true;},select(){this.selected=true;}};
const status={textContent:""};
const button={disabled:false,addEventListener:(name,fn)=>button[name]=fn};
const calendarButton={disabled:false,addEventListener:(name,fn)=>calendarButton[name]=fn};
let savedCalendarFile="",calendarBlob=null,revokedUrl="";
const URLmock={
 createObjectURL:blob=>{calendarBlob=blob;return "blob:mock-calendar";},
 revokeObjectURL:url=>{revokedUrl=url;}
};

const importButton={addEventListener:(name,fn)=>importButton[name]=fn};
const campaignLink={value:sourceUrl};
const campaignBuilder={querySelector:selector=>selector==='[name=service]'?{value:"renty"}:null};
const elements={"[data-crm-handoff]":form,"[data-crm-note]":output,"[data-crm-status]":status,"[data-crm-copy]":button,"[data-crm-calendar]":calendarButton,
 "[data-crm-from-campaign]":importButton,"[data-campaign-url]":campaignLink,"[data-campaign-builder]":campaignBuilder};
const document={
 querySelector:selector=>elements[selector]||null,
 body:{append(){}},
 createElement:()=>({href:"",download:"",style:{},click(){savedCalendarFile=this.download;},remove(){}})
};
const copied=[];
const navigator={clipboard:{writeText:async v=>copied.push(v)}};
runInNewContext(clientSrc,{window:{TwojaSprawaCrmHandoff:api,location:{origin:"https://twoja-sprawa.pages.dev"},crypto:{randomUUID:()=>"mock-event-000001"},setTimeout:callback=>{callback();return 1;}},document,navigator,Blob,URL:URLmock});
assert.equal(button.disabled,true,"Must not copy before preparing a note");
listeners.submit({preventDefault(){}});
assert.equal(button.disabled,false);
assert.equal(output.value,note);
assert.ok(status.textContent.includes("Przygotowano notatkę"));
await button.click();
assert.equal(copied.length,1);
assert.equal(copied[0],note,"Copy only the checked note on explicit click");
await button.click();
assert.equal(copied.length,1,"Repeated copy should first trigger a warning, not the clipboard");
assert.ok(status.textContent.includes("ten kod kopiowano już"),"Explain that the same code was copied in this tab");
await button.click();
assert.equal(copied.length,2,"Second intentional click should allow re-copy");
assert.equal(copied[1],note,"Re-copy must not alter the note");
fields.campaign.value="nowa_rolka";
listeners.input();
assert.equal(button.disabled,true,"Edits invalidate the earlier note");
assert.equal(output.value,"","Old reference should be cleared after edit");
await button.click();
assert.equal(copied.length,2,"No stale note can be copied");
fields.campaign.value="Klient Jan";
listeners.submit({preventDefault(){}});
assert.equal(button.disabled,true,"Reject unsafe campaign text");
assert.ok(status.textContent.includes("Kampania"));
await importButton.click();
assert.equal(fields.service.value,"renty","Campaign import must retain the service");
assert.equal(fields.source.value,"facebook");
assert.equal(fields.campaign.value,"renty_rolka_2");
assert.equal(fields.ref.value,sample.ref,"Import must not touch the case reference");
assert.equal(fields.status.value,"nowe","Import must not change case status");
assert.equal(output.value,"","Import must invalidate earlier note");
assert.equal(copied.length,2,"Import alone cannot write clipboard");
assert.ok(status.textContent.includes("wyłącznie usługę")||status.textContent.includes("Pobrano wyłącznie usługę"));
fields.status.value="umowa";
listeners.submit({preventDefault(){}});
assert.equal(button.disabled,true,"Contract claim must be blocked without verification");
assert.ok(status.textContent.includes("potwierdź"));
fields.confirmed.checked=true;
listeners.change();
listeners.submit({preventDefault(){}});
assert.equal(button.disabled,false,"Verified status can be prepared for manual CRM review");
assert.ok(output.value.includes("Umowa podpisana"));
fields.status.value="kontakt";
fields.confirmed.checked=false;
fields.received.checked=true;
fields.checkedDuplicates.checked=true;
fields.followUp.value="2026-11-27";
listeners.change();
listeners.submit({preventDefault(){}});
assert.ok(output.value.includes("Następny kontakt (plan wewnętrzny): 2026-11-27"));
assert.ok(output.value.includes("Sprawdzono duplikaty w CRM: TAK — zaznaczono ręcznie"));
fields.followUp.value="2026-02-30";
listeners.change();
listeners.submit({preventDefault(){}});
assert.equal(button.disabled,true,"Impossible follow-up date blocks the note");
assert.ok(status.textContent.includes("Data kolejnego kontaktu"));
assert.equal(calendarButton.disabled,true,"Impossible follow-up date blocks calendar download");
fields.followUp.value="2026-11-27";
listeners.change();
listeners.submit({preventDefault(){}});
assert.equal(calendarButton.disabled,false,"Valid date after preparing the note enables ICS download");
calendarButton.click();
assert.equal(savedCalendarFile,"twoja-sprawa-przeglad-kontaktow-2026-11-27.ics");
assert.ok(calendarBlob instanceof Blob,"Calendar must be a local Blob, not a network request");
const exportedIcs=await calendarBlob.text();
assert.ok(exportedIcs.includes("DTSTART;VALUE=DATE:20261127"));
assert.ok(!exportedIcs.includes(sample.ref)&&!exportedIcs.includes("Paulina")&&!exportedIcs.includes("facebook"));
assert.equal(revokedUrl,"blob:mock-calendar","Object URL must be revoked after download");
fields.followUp.value="";
listeners.input();
assert.equal(calendarButton.disabled,true,"Editing the form invalidates calendar preview");
console.log("CRM_HANDOFF_OK: six advisers, 18 channels, strict TS reference, explicit clipboard, no network/storage or client data.");
