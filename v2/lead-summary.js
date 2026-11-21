/* Ręczny rejestr zagregowanych wyników kampanii. Niczego nie wysyła ani nie zapisuje na serwerze. */
(()=>{
 "use strict";
 const host=document.querySelector("[data-lead-summary]");
 const core=window.TwojaSprawaLeadSummary;
 if(!host||!core)return;
 const find=selector=>host.querySelector(selector);
 const form=find("[data-lead-entry]");
 const report=find("[data-lead-report]");
 const filter=find("[data-summary-filter]");
 const entries=find("[data-lead-entries]");
 const breakdown=find("[data-source-breakdown]");
 const topicBreakdown=find("[data-topic-breakdown]");
 const briefOutput=find("[data-summary-brief]");
 const campaignBreakdown=find("[data-campaign-breakdown]");
 const csvOutput=find("[data-csv-output]");
 const csvInput=find("[data-csv-input]");
 const fileInput=find("[data-csv-file]");
 const status=find("[data-lead-status]");
 const empty=find("[data-lead-empty]");
 const names={
  szkody:"Szkody górnicze",swiadczenie:"Świadczenie wspierające",skd:"Kredyty PLN / SKD",
  renty:"Renty powypadkowe",przesyl:"Służebność przesyłu",franki:"Kredyty CHF",
  facebook:"Facebook",instagram:"Instagram",tiktok:"TikTok",google:"Google",
  ulotka:"Ulotka",plakat:"Plakat",qr:"Kod QR",polecenie:"Polecenie",organiczne:"Organiczne",
  strona:"Strona",inne:"Inne",nieoznaczone:"Nieoznaczone",
  "chatgpt.com":"ChatGPT","perplexity.ai":"Perplexity","claude.ai":"Claude",
  "gemini.google.com":"Gemini","copilot.microsoft.com":"Copilot","grok.com":"Grok"
 };
 let rows=[];
 const display=value=>names[value]||value;
 const percentage=(part,all)=>all>0?(100*part/all).toLocaleString("pl-PL",{maximumFractionDigits:1})+"%":"—";
 function cell(tr,value){
  const td=document.createElement("td");td.textContent=String(value);tr.append(td);return td;
 }
 const feedback=(message,error=false)=>{
  status.textContent=message;
  status.dataset.state=error?"error":"ok";
 };
 function show(){
  const data=core.summarize(rows,filter.value);
  for(const name of ["leads","qualified","clients"])
   find('[data-stat="'+name+'"]').textContent=String(data[name]);
  find('[data-stat="quality-rate"]').textContent=percentage(data.qualified,data.leads);
  find('[data-stat="client-rate"]').textContent=percentage(data.clients,data.leads);
  empty.hidden=rows.length>0;
  entries.replaceChildren();
  const visible=filter.value==="wszystkie"?rows:rows.filter(x=>x.service===filter.value);
  for(const item of visible){
   const tr=document.createElement("tr");
   cell(tr,item.date);cell(tr,display(item.service));cell(tr,display(item.source));
   cell(tr,item.campaign);cell(tr,item.variant);cell(tr,item.leads);cell(tr,item.qualified);cell(tr,item.clients);
   const last=document.createElement("td");
   const remove=document.createElement("button");remove.type="button";remove.className="lead-summary-remove";
   remove.textContent="Usuń";
   remove.setAttribute("aria-label","Usuń wpis: "+item.date+", "+display(item.service)+", "+display(item.source)+", "+item.campaign+", "+item.variant);
   remove.addEventListener("click",()=>{
    rows=rows.filter(x=>!(x.date===item.date&&x.service===item.service&&x.source===item.source&&x.campaign===item.campaign&&x.variant===item.variant));
    show();feedback("Wpis został usunięty z pamięci tej karty.");
   });
   last.append(remove);tr.append(last);entries.append(tr);
  }
  if(topicBreakdown){
   topicBreakdown.replaceChildren();
   for(const group of data.topics){
    const tr=document.createElement("tr");
    cell(tr,display(group.service));cell(tr,group.leads);cell(tr,group.qualified);
    cell(tr,group.clients);cell(tr,percentage(group.clients,group.leads));
    cell(tr,group.leads<10?"Mała próba":"Wyniki wstępne");
    topicBreakdown.append(tr);
   }
  }
  breakdown.replaceChildren();
  for(const group of data.sources){
   const tr=document.createElement("tr");
   cell(tr,display(group.source));cell(tr,group.leads);cell(tr,group.qualified);
   cell(tr,group.clients);cell(tr,percentage(group.qualified,group.leads));
   breakdown.append(tr);
  }
  if(campaignBreakdown){
   campaignBreakdown.replaceChildren();
   for(const group of data.campaigns){
    const tr=document.createElement("tr");
    cell(tr,display(group.service));cell(tr,display(group.source));cell(tr,group.campaign);cell(tr,group.variant);
    cell(tr,group.leads);cell(tr,group.qualified);cell(tr,group.clients);
    cell(tr,percentage(group.clients,group.leads));
    campaignBreakdown.append(tr);
   }
  }
  if(briefOutput){
   const lines=[
    "Twoja Sprawa — zbiorcze wyniki kampanii (ręczna ewidencja)",
    "Zakres: "+(filter.value==="wszystkie"?"wszystkie usługi":display(filter.value)),
    "Zgłoszenia: "+data.leads+" | kwalifikowane: "+data.qualified+" | umowy: "+data.clients,
    "Tematy:"
   ];
   if(!data.topics.length)lines.push("Brak wpisanych wyników.");
   for(const group of data.topics)lines.push(
    "- "+display(group.service)+": "+group.leads+" zgłoszeń, "+group.qualified+
    " kwalifikowanych, "+group.clients+" umów ("+percentage(group.clients,group.leads)+
    " umowy/zgłoszenia)"+(group.leads<10?" — mała próba":"")
   );
   lines.push("Źródła:");
   for(const group of data.sources)lines.push(
    "- "+display(group.source)+": "+group.leads+" zgłoszeń, "+group.clients+" umów"
   );
   lines.push("Publikacje (maks. 3, wg liczby umów — nie ranking skuteczności):");
   for(const group of data.campaigns.slice(0,3))lines.push(
    "- "+display(group.service)+" / "+display(group.source)+" / "+group.campaign+
    " / "+group.variant+": "+group.leads+" zgłoszeń, "+group.clients+" umów"
   );
   lines.push("Uwaga: dane ręczne, bez automatycznego pomiaru odsłon. Małe próby nie przesądzają o skuteczności. Nie wpisuj danych klientów.");
   briefOutput.value=lines.join("\n");
  }
  csvOutput.value=core.csv(rows);
  report.hidden=false;
 }
 form.addEventListener("submit",event=>{
  event.preventDefault();
  const f=key=>form.elements.namedItem(key)?.value||"";
  try{
   const result=core.upsert(rows,{
    date:f("date"),service:f("service"),source:f("source"),campaign:f("campaign"),variant:f("variant"),
    leads:f("leads"),qualified:f("qualified"),clients:f("clients")
   });
   rows=result.rows;show();
   feedback(result.replaced?"Zaktualizowano istniejący dzienny wiersz (bez podwójnego liczenia).":"Dodano dzienny wynik kampanii.");
  }catch(error){feedback(error.message,true);}
 });
 const useCampaign=find("[data-lead-from-campaign]");
 if(useCampaign)useCampaign.addEventListener("click",()=>{
  try{
   const built=document.querySelector("[data-campaign-url]")?.value||"";
   const builder=document.querySelector("[data-campaign-builder]");
   const parsed=new URL(built);
   if(parsed.origin!==window.location.origin)throw Error("Źródło linku nie pasuje do tej strony.");
   const params=parsed.searchParams;
   const service=builder?.querySelector("[name=service]")?.value||"";
   const source=params.get("utm_source")||"";
   const campaign=params.get("utm_campaign")||"";
   const variant=params.get("utm_content")||"bez_wariantu";
   const valid=value=>/^[a-z0-9_-]{1,40}$/.test(value);
   if(!core.services.includes(service)||!core.sources.includes(source)||!valid(campaign)||!valid(variant))
    throw Error("Nie udało się odczytać bezpiecznych oznaczeń kampanii.");
   for(const [key,value] of Object.entries({service,source,campaign,variant})){
    const field=form.elements.namedItem(key);
    if(field)field.value=value;
   }
   feedback("Przeniesiono jedynie usługę i oznaczenia UTM. Wpisz datę i potwierdzone liczby; niczego nie naliczono ani nie wysłano.");
  }catch(error){feedback("Nie można przenieść oznaczeń: "+error.message,true);}
 });
 filter.addEventListener("change",show);
 const copyBrief=find("[data-copy-brief]");
 if(copyBrief&&briefOutput)copyBrief.addEventListener("click",async()=>{
  try{
   if(!navigator.clipboard?.writeText)throw Error("Schowek niedostępny.");
   await navigator.clipboard.writeText(briefOutput.value);
   feedback("Skopiowano zbiorczy raport tekstowy bez danych klientów.");
  }catch{
   briefOutput.focus();briefOutput.select();
   feedback("Zaznaczony raport tekstowy skopiuj ręcznie.",true);
  }
 });
 find("[data-copy-summary]").addEventListener("click",async()=>{
  try{
   if(!navigator.clipboard?.writeText)throw Error("Brak dostępu do schowka.");
   await navigator.clipboard.writeText(csvOutput.value);
   feedback("Skopiowano CSV. Zapisz go w swoim pliku, jeśli chcesz zachować wyniki.");
  }catch{
   csvOutput.focus();csvOutput.select();
   feedback("Zaznaczony tekst CSV skopiuj ręcznie i zapisz w bezpiecznym miejscu.",true);
  }
 });
 find("[data-download-summary]").addEventListener("click",()=>{
  try{
   const blob=new Blob(["\uFEFF"+core.csv(rows)],{type:"text/csv;charset=utf-8"});
   const url=URL.createObjectURL(blob);
   const a=document.createElement("a");a.href=url;a.download="twoja-sprawa-wyniki-kampanii.csv";
   a.hidden=true;document.body.append(a);a.click();a.remove();
   window.setTimeout(()=>URL.revokeObjectURL(url),0);
   feedback("Przygotowano lokalny plik CSV. Zapisz go — wpisy nie pozostaną po odświeżeniu strony.");
  }catch{feedback("Pobieranie nie zadziałało. Skopiuj zawartość pola CSV ręcznie.",true);}
 });
 function importText(text){
  const imported=core.parseCsv(text);
  rows=imported;show();
  feedback("Wczytano "+rows.length+" dziennych pozycji. Zastąpiono poprzednie dane w tej karcie.");
 }
 find("[data-import-summary]").addEventListener("click",()=>{
  try{importText(csvInput.value);}catch(error){feedback(error.message,true);}
 });
 fileInput.addEventListener("change",async()=>{
  const file=fileInput.files?.[0];
  if(!file)return;
  try{
   if(file.size>90000)throw Error("Plik CSV jest zbyt duży (limit 90 kB).");
   importText(await file.text());csvInput.value="";
  }catch(error){feedback(error.message,true);}
  fileInput.value="";
 });
 find("[data-clear-summary]").addEventListener("click",()=>{
  if(!rows.length){feedback("Brak wpisów do usunięcia.");return;}
  if(!window.confirm("Usunąć wszystkie wpisy z tej karty? Najpierw pobierz CSV, jeśli chcesz je zachować."))return;
  rows=[];show();feedback("Wyczyszczono wyniki. Niczego nie wysłano na serwer.");
 });
 show();
})();
