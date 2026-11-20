#!/usr/bin/env node
/** Manual lead dashboard: privacy, CSV round-trip, dedupe, real UI interactions. No network. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {runInNewContext} from "node:vm";
const coreSrc=await readFile("v2/lead-summary-core.js","utf8");
const widgetSrc=await readFile("v2/lead-summary.js","utf8");
const markup=await readFile("v2/narzedzia/linki-kampanii.html","utf8");
const css=await readFile("v2/lead-summary.css","utf8");
const window={};
runInNewContext(coreSrc,{window});
const core=window.TwojaSprawaLeadSummary;
assert.ok(core,"Shared offline logic should be accessible");
assert.equal(core.services.length,6);
assert.equal(core.sources.length,18);
assert.ok(core.sources.includes("nieoznaczone")&&core.sources.includes("chatgpt.com"));
const a={date:"2026-11-19",service:"szkody",source:"facebook",campaign:"lokalna_pomoc",leads:"12",qualified:"7",clients:"2"};
const b={date:"2026-11-19",service:"renty",source:"tiktok",campaign:"post_2",leads:"4",qualified:"1",clients:"1"};
const x=core.normalize(a);
assert.equal(x.leads,12);
assert.equal(core.summarize([x],null).clients,2);
const one=core.upsert([],a);
assert.equal(one.replaced,false);
const upd=core.upsert(one.rows,{...a,leads:"13",qualified:"8",clients:"3"});
assert.equal(upd.replaced,true,"Same day/service/channel/campaign must not double count");
assert.equal(upd.rows.length,1);
assert.equal(upd.rows[0].leads,13);
const two=core.upsert(upd.rows,b);
const breakdown=core.summarize(two.rows,"wszystkie");
assert.equal(breakdown.leads,17);
assert.equal(breakdown.qualified,9);
assert.equal(breakdown.clients,4);
assert.equal(breakdown.sources.length,2);
assert.equal(breakdown.campaigns.length,2);
assert.equal([...breakdown.campaigns].map(x=>x.campaign).join("|"),"lokalna_pomoc|post_2","Campaign ranking sorts signed clients, then qualified and leads");
const repeatedLabel=core.normalize({...a,service:"renty",source:"facebook",leads:"5",qualified:"3",clients:"1"});
const ranked=core.summarize([x,repeatedLabel],"wszystkie");
assert.equal(ranked.campaigns.length,2,"Identical campaign names across services must not merge");
assert.equal(ranked.campaigns.reduce((sum,x)=>sum+x.leads,0),17);
assert.equal(core.summarize([x,repeatedLabel],"szkody").campaigns.length,1,"Service filter must apply to campaign ranking");
assert.equal(core.summarize(two.rows,"szkody").leads,13,"Service filter");
assert.equal(core.summarize(two.rows,"swiadczenie").leads,0);
const exported=core.csv(two.rows);
assert.ok(exported.startsWith("date,service,source,campaign,leads,qualified,clients\n"));
const imported=core.parseCsv("\uFEFF"+exported.replaceAll("\n","\r\n"));
assert.equal(core.csv(imported),exported,"Exact round-trip without data loss");
assert.throws(()=>core.normalize({...a,leads:2,qualified:3}),/Umowy|kwalifikowane/);
assert.throws(()=>core.normalize({...a,qualified:2,clients:3}),/Umowy/);
assert.throws(()=>core.normalize({...a,campaign:"=IMPORTXML(123)"}),/Kampania/,"CSV formula injection blocked");
assert.throws(()=>core.normalize({...a,campaign:"Klient Jan Kowalski"}),/Kampania/,"Do not admit names in UTM identifiers");
assert.throws(()=>core.normalize({...a,date:"2026-02-31"}),/datę/);
assert.throws(()=>core.normalize({...a,leads:""}),/Liczby/);
assert.throws(()=>core.normalize({...a,leads:"-1"}),/Liczby/);
assert.throws(()=>core.normalize({...a,leads:100000}),/99999/);
assert.throws(()=>core.normalize({...a,source:"sklep-fake"}),/źródeł/);
assert.throws(()=>core.parseCsv("name,phone\nJan,500000000"),/nagłówek/);
assert.throws(()=>core.parseCsv(exported+"2026-11-19,szkody,facebook,=BAD,5,2,1\n"),/Wiersz/);
assert.throws(()=>core.parseCsv(exported+"2026-11-19,szkody,facebook\n"),/kolumn/);
const many=Array.from({length:301},(_,i)=>[ "2026-11-19","szkody","facebook","week_"+i,"1","0","0"].join(","));
assert.throws(()=>core.parseCsv(core.header+"\n"+many.join("\n")),/300/);
const noNetwork=/\b(fetch|sendBeacon|XMLHttpRequest|localStorage|sessionStorage|document\.cookie)\b/;
assert.ok(!noNetwork.test(coreSrc+widgetSrc),"Aggregate report must not track, transmit or persist user data");
assert.ok(markup.includes('name="robots" content="noindex,follow"'),"Internal marketing tool stays noindex");
assert.ok(markup.includes('data-lead-summary')&&markup.includes('data-lead-report'),"Real UI must be included in current generator");
assert.ok(markup.includes('data-campaign-breakdown'),"Campaign ranking must be visible");
assert.ok(markup.includes('src="/v2/lead-summary-core.js" defer')&&markup.includes('src="/v2/lead-summary.js" defer'));
assert.ok(markup.includes('href="/v2/lead-summary.css"'));
for(const required of ['data-stat="leads"','data-stat="qualified"','data-stat="clients"','data-stat="quality-rate"','data-stat="client-rate"','data-csv-file','data-download-summary','data-import-summary'])
 assert.ok(markup.includes(required),"Missing functional dashboard element "+required);
assert.ok(css.includes(":focus-visible")&&css.includes("@media(max-width:650px)"),"Responsive readable keyboard controls");
assert.ok(css.includes(".campaign-page .lead-summary>.eyebrow{color:#285967}"),"Eyebrow on light card must have readable contrast");
assert.ok(css.includes("grid-template-columns:minmax(0,1fr)")&&css.includes(".lead-summary-tables>div{min-width:0}"),"Wide tables must scroll inside small mobile screens");
assert.equal((markup.match(/class="lead-summary-scroll" tabindex="0" role="region" aria-label="/g)||[]).length,3,"All three horizontal scroll regions must be keyboard-focusable and labeled");
assert.ok(!markup.includes('data-analytics-lead')&&!/google-analytics|googletagmanager/.test(widgetSrc));

// Browser-free DOM integration: no actual form sends, files, storage or analytics.
class Node{
 constructor(tag="div"){this.tag=tag;this.children=[];this.events={};this.attributes={};this.dataset={};this.value="";this.textContent="";this.hidden=false;}
 append(...children){this.children.push(...children);}
 replaceChildren(...children){this.children=[...children];}
 addEventListener(name,fn){this.events[name]=fn;}
 setAttribute(name,value){this.attributes[name]=value;}
 focus(){this.focused=true;}
 select(){this.selected=true;}
}
const selectors=[
 "[data-lead-entry]","[data-lead-report]","[data-summary-filter]","[data-lead-entries]",
 "[data-source-breakdown]","[data-csv-output]","[data-csv-input]","[data-csv-file]",
 "[data-lead-status]","[data-lead-empty]","[data-campaign-breakdown]","[data-copy-summary]",
 "[data-download-summary]","[data-import-summary]","[data-clear-summary]",
 ...["leads","qualified","clients","quality-rate","client-rate"].map(x=>'[data-stat="'+x+'"]')
];
const nodes=Object.fromEntries(selectors.map(s=>[s,new Node()]));
const inputs={date:new Node("input"),service:new Node("select"),source:new Node("select"),
 campaign:new Node("input"),leads:new Node("input"),qualified:new Node("input"),clients:new Node("input")};
nodes["[data-lead-entry]"].elements={namedItem:key=>inputs[key]};
nodes["[data-summary-filter]"].value="wszystkie";
const host={querySelector:sel=>nodes[sel]||null};
const doc={
 querySelector:sel=>sel==="[data-lead-summary]"?host:null,
 createElement:tag=>new Node(tag),
 body:{append:()=>{}}
};
const win={TwojaSprawaLeadSummary:core,confirm:()=>true,setTimeout:fn=>fn()};
const written=[];
runInNewContext(widgetSrc,{document:doc,window:win,navigator:{clipboard:{writeText:async x=>{written.push(x);}}},
 Blob,URL,console});
assert.equal(nodes['[data-stat="leads"]'].textContent,"0");
assert.equal(nodes["[data-lead-empty]"].hidden,false);
for(const [k,v] of Object.entries(a))inputs[k].value=v;
nodes["[data-lead-entry]"].events.submit({preventDefault(){}});
assert.equal(nodes['[data-stat="leads"]'].textContent,"12");
assert.equal(nodes['[data-stat="quality-rate"]'].textContent,"58,3%");
assert.equal(nodes['[data-stat="client-rate"]'].textContent,"16,7%");
assert.equal(nodes["[data-lead-entries]"].children.length,1);
assert.equal(nodes["[data-source-breakdown]"].children.length,1);
assert.equal(nodes["[data-campaign-breakdown]"].children.length,1);
inputs.leads.value="13";inputs.qualified.value="8";inputs.clients.value="3";
nodes["[data-lead-entry]"].events.submit({preventDefault(){}});
assert.equal(nodes["[data-lead-entries]"].children.length,1,"Duplicate should update existing row");
assert.equal(nodes['[data-stat="leads"]'].textContent,"13");
assert.ok(nodes["[data-lead-status]"].textContent.includes("Zaktualizowano"));
await nodes["[data-copy-summary]"].events.click();
assert.equal(written.at(-1),nodes["[data-csv-output]"].value);
nodes["[data-csv-input]"].value=core.csv([core.normalize(b)]);
nodes["[data-import-summary]"].events.click();
assert.equal(nodes['[data-stat="leads"]'].textContent,"4");
assert.equal(nodes["[data-lead-entries]"].children.length,1);
nodes["[data-summary-filter]"].value="szkody";
nodes["[data-summary-filter]"].events.change();
assert.equal(nodes['[data-stat="leads"]'].textContent,"0");
nodes["[data-summary-filter]"].value="renty";
nodes["[data-summary-filter]"].events.change();
assert.equal(nodes['[data-stat="leads"]'].textContent,"4");
const deleteBtn=nodes["[data-lead-entries]"].children[0].children.at(-1).children[0];
assert.equal(deleteBtn.textContent,"Usuń");
deleteBtn.events.click();
assert.equal(nodes['[data-stat="leads"]'].textContent,"0");
assert.equal(nodes["[data-lead-empty]"].hidden,false);
console.log("LEAD_SUMMARY_OK: validated counts, de-duplication, CSV round-trip, privacy, filters, copy, import and delete.");
