#!/usr/bin/env node
/** Tests for offline, privacy-safe brochure social caption builder; no external requests. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {runInNewContext} from "node:vm";

const [source,html,css]=await Promise.all([
 readFile("v2/brochure-promo.js","utf8"),
 readFile("v2/plan-dzialania.html","utf8"),
 readFile("v2/brochure-view.css","utf8")
]);
assert.ok(html.includes('src="/v2/brochure-promo.js" defer'),"Browser must load organic post generator");
assert.ok(html.includes('<details class="plan-brochure-promo"'),"Social post utility should be collapsed by default");
assert.ok(html.includes('role="status" aria-live="polite"'),"Copy status must be announced");
assert.ok(css.includes("plan-brochure-promo-fields")&&css.includes("@media(max-width:700px)"),"Mobile editor styling absent");
assert.ok(html.includes("Niczego nie publikujemy automatycznie."),"Explicit no-publishing disclosure missing");
const chooser={value:"szkody-gornicze",events:{},addEventListener(type,fn){this.events[type]=fn;}};
const draft={value:"",focused:false,selected:false,focus(){this.focused=true;},select(){this.selected=true;}};
const feedback={textContent:""};
const copy={disabled:false,events:{},addEventListener(type,fn){this.events[type]=fn;}};
const nodes={
 "[data-brochure-promo-service]":chooser,
 "[data-brochure-promo-draft]":draft,
 "[data-brochure-promo-copy]":copy,
 "[data-brochure-promo-status]":feedback
};
const root={querySelector:selector=>nodes[selector]};
const document={querySelector:selector=>selector==="[data-brochure-promo]"?root:null};
let copied="";
const navigator={clipboard:{writeText:async text=>{copied=text;}}};
runInNewContext(source,{document,navigator,encodeURIComponent,Object});
const cases=[
 ["szkody-gornicze","Wojciech Obiegło","796 441 345","Lubinie lub Polkowicach"],
 ["swiadczenie-wspierajace","Paulina Chandrała","500 171 531","WZON"],
 ["renty-powypadkowe","Paulina Chandrała","500 171 531","koszty leczenia"],
 ["skd","Wojciech Obiegło","796 441 345","Nie każda umowa"],
 ["kredyty-frankowe","Wojciech Obiegło","796 441 345","umowę CHF"],
 ["sluzebnosc-przesylu","Wojciech Obiegło","796 441 345","Samo istnienie urządzeń"]
];
const outputs=new Set();
for(const [key,advisor,phone,detail] of cases){
 assert.ok(html.includes('<option value="'+key+'">'),"Service unavailable in post chooser: "+key);
 chooser.value=key;chooser.events.change();
 assert.equal(copy.disabled,false);
 assert.ok(draft.value.includes(advisor)&&draft.value.includes(phone),"Wrong adviser for "+key);
 assert.ok(draft.value.includes(detail),"Missing service-specific substance for "+key);
 assert.ok(draft.value.includes("https://twoja-sprawa.pages.dev/plan-dzialania?broszura="+key+"#broszura"),"Wrong clean share link for "+key);
 assert.ok(!draft.value.includes("utm_"),"Social posts should use clean links");
 assert.ok(!/gwarantujemy|100% pewności|wygramy|przyznamy świadczenie/i.test(draft.value),"Unsupported promise: "+key);
 assert.ok(!/[0-9]{11}/.test(draft.value),"Do not print PESEL-like identifiers");
 const tags=draft.value.match(/#[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż0-9]+/g)||[];
 assert.ok(tags.length<=5,"No more than five topic hashtags in a social caption");
 await copy.events.click();
 assert.equal(copied,draft.value,"Clipboard must receive only the selected caption");
 assert.ok(feedback.textContent.includes("Skopiowano"),"No success status after copy");
 outputs.add(draft.value);
}
assert.equal(outputs.size,6,"Six service posts must have unique copy");
chooser.value="unknown";chooser.events.change();
assert.equal(draft.value,"");
assert.equal(copy.disabled,true,"Invalid selection must disable copy");
chooser.value="skd";chooser.events.change();
navigator.clipboard.writeText=async()=>{throw Error("Clipboard forbidden");};
await copy.events.click();
assert.equal(draft.focused,true,"Failed clipboard copy should focus selectable caption");
assert.equal(draft.selected,true,"Failed clipboard copy should select text for manual copying");
assert.ok(feedback.textContent.includes("ręcznie"),"Do not claim copy succeeded after clipboard rejection");
console.log("BROCHURE_ORGANIC_POSTS_OK: 6 distinct posts, correct advisers, safe social links, fallback copy, no data collection.");
