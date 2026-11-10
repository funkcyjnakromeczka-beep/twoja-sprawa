/* Narzędzia czytania poradnika — tylko lokalnie, bez analityki i kont. */
(()=>{
 "use strict";
 const article=document.querySelector("main article.article");
 if(!article)return;
 const tools=document.createElement("div");
 tools.className="article-reading-tools";
 tools.setAttribute("role","group");
 tools.setAttribute("aria-label","Narzędzia ułatwiające czytanie i udostępnianie poradnika");
 const make=(label,callback)=>{
  const button=document.createElement("button");
  button.type="button";button.textContent=label;
  button.addEventListener("click",callback);
  tools.append(button);
  return button;
 };
 const status=document.createElement("span");
 status.className="article-reading-message";
 status.setAttribute("role","status");
 status.setAttribute("aria-live","polite");
 const grow=make("A+ Większy tekst",()=>{
  const expanded=article.classList.toggle("reading-large");
  grow.setAttribute("aria-pressed",String(expanded));
  grow.textContent=expanded?"A− Zwykły tekst":"A+ Większy tekst";
  status.textContent=expanded?"Powiększono tekst poradnika.":"Przywrócono zwykłą wielkość tekstu.";
 });
 grow.setAttribute("aria-pressed","false");
 make("Drukuj / zapisz PDF",()=>window.print());
 make("Kopiuj link",async()=>{
  const url=window.location.origin+window.location.pathname;
  status.replaceChildren();
  try{
   if(!navigator.clipboard?.writeText)throw new Error("unavailable");
   await navigator.clipboard.writeText(url);
   status.textContent="Skopiowano link do poradnika.";
  }catch{
   const label=document.createElement("label");
   label.textContent="Skopiuj link ręcznie:";
   const input=document.createElement("input");
   input.type="text";input.readOnly=true;input.value=url;input.setAttribute("aria-label","Adres poradnika");
   label.append(input);status.append(label);
   input.focus();input.select();
  }
 });
 tools.append(status);
 article.prepend(tools);
})();
