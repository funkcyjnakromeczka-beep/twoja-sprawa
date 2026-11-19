/* Zestawienia zagregowanych zgłoszeń. Brak serwera, cookies i danych klientów. */
(function(root){
  "use strict";
  const services=["szkody","swiadczenie","skd","renty","przesyl","franki"];
  const sources=["facebook","instagram","tiktok","google","ulotka","plakat","qr","polecenie","organiczne","strona","chatgpt.com","perplexity.ai","claude.ai","gemini.google.com","copilot.microsoft.com","grok.com","inne","nieoznaczone"];
  const header="date,service,source,campaign,leads,qualified,clients";
  const maxRows=300;
  function integer(value){
    const s=String(value??"").trim();
    if(!/^\d{1,6}$/.test(s))throw Error("Liczby muszą być całkowite i nieujemne.");
    const n=Number(s);
    if(!Number.isSafeInteger(n)||n>99999)throw Error("Liczby mogą mieć maksymalnie 99999.");
    return n;
  }
  function dateCheck(value){
    const s=String(value??"").trim();
    if(!/^\d{4}-\d{2}-\d{2}$/.test(s))throw Error("Podaj datę w formacie RRRR-MM-DD.");
    const d=new Date(s+"T00:00:00Z");
    if(Number.isNaN(d.getTime())||d.toISOString().slice(0,10)!==s)throw Error("Podaj prawidłową datę kalendarzową.");
    return s;
  }
  function normalize(input){
    const date=dateCheck(input.date);
    const service=String(input.service||"").trim();
    const source=String(input.source||"").trim();
    if(!services.includes(service)||!sources.includes(source))throw Error("Wybierz jedną z dostępnych usług i źródeł.");
    const campaign=String(input.campaign??"").trim().toLowerCase()||"bez_kampanii";
    if(!/^[a-z0-9_-]{1,40}$/.test(campaign))throw Error("Kampania: maksymalnie 40 znaków a-z, 0-9, _ lub -. Nie wpisuj danych osobowych.");
    const leads=integer(input.leads),qualified=integer(input.qualified),clients=integer(input.clients);
    if(qualified>leads||clients>qualified)throw Error("Umowy nie mogą przekraczać leadów kwalifikowanych, a kwalifikowane — wszystkich leadów.");
    return {date,service,source,campaign,leads,qualified,clients};
  }
  const key=x=>[x.date,x.service,x.source,x.campaign].join("|");
  function upsert(rows,item){
    const entry=normalize(item),list=rows.map(normalize);
    const i=list.findIndex(x=>key(x)===key(entry));
    if(i>=0)list[i]=entry;
    else list.push(entry);
    if(list.length>maxRows)throw Error("Limit 300 dziennych pozycji. Wyeksportuj CSV i rozpocznij nowy okres.");
    return {rows:list.sort((a,b)=>b.date.localeCompare(a.date)||a.source.localeCompare(b.source)),replaced:i>=0};
  }
  function total(rows){
    return rows.reduce((acc,x)=>({leads:acc.leads+x.leads,qualified:acc.qualified+x.qualified,clients:acc.clients+x.clients}),{leads:0,qualified:0,clients:0});
  }
  function summarize(rows,service){
    const all=rows.map(normalize);
    const chosen=service&&service!=="wszystkie"?all.filter(x=>x.service===service):all;
    const bySource=new Map();
    for(const x of chosen){
      if(!bySource.has(x.source))bySource.set(x.source,[]);
      bySource.get(x.source).push(x);
    }
    const sources=[...bySource.entries()].map(([source,records])=>({source,...total(records)}))
      .sort((a,b)=>b.leads-a.leads||a.source.localeCompare(b.source));
    return {count:chosen.length,...total(chosen),sources};
  }
  function csv(rows){
    const list=rows.map(normalize);
    return [header,...list.map(x=>[x.date,x.service,x.source,x.campaign,x.leads,x.qualified,x.clients].join(","))].join("\n")+"\n";
  }
  function parseCsv(raw){
    if(typeof raw!=="string"||raw.length>90000)throw Error("Plik CSV jest zbyt duży.");
    const lines=raw.replace(/^\uFEFF/,"").replaceAll("\r\n","\n").trim().split("\n");
    if(lines.shift()!==header)throw Error("Nieprawidłowy nagłówek CSV. Importuj tylko CSV wyeksportowany z tego narzędzia.");
    if(lines.length>maxRows)throw Error("Import ma więcej niż 300 pozycji.");
    let rows=[];
    for(let i=0;i<lines.length;i++){
      if(!lines[i].trim())continue;
      const values=lines[i].split(",");
      if(values.length!==7)throw Error("Nieprawidłowa liczba kolumn w wierszu "+(i+2)+".");
      const [date,service,source,campaign,leads,qualified,clients]=values;
      try{rows=upsert(rows,{date,service,source,campaign,leads,qualified,clients}).rows;}
      catch(error){throw Error("Wiersz "+(i+2)+": "+error.message);}
    }
    return rows;
  }
  root.TwojaSprawaLeadSummary=Object.freeze({services:Object.freeze(services),sources:Object.freeze(sources),header,maxRows,normalize,upsert,summarize,csv,parseCsv});
})(window);
