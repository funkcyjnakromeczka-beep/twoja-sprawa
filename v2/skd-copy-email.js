/* SKD: copy public mailbox, and prepare a complete email only on explicit click.
   No background submissions, cookies, analytics or phone data in page URLs. */
(()=>{
 "use strict";
 const mailbox="wojciech.obieglo@votum-ds.pl";
 const button=document.querySelector("[data-skd-copy-email]");
 const status=document.querySelector("[data-skd-copy-status]");
 if(button&&status&&navigator.clipboard?.writeText){
  button.hidden=false;
  button.addEventListener("click",async()=>{
   try{
    await navigator.clipboard.writeText(mailbox);
    status.textContent="Adres skopiowany. Wyślij pełną umowę jako załącznik i wpisz numer telefonu w treści wiadomości.";
   }catch{
    status.textContent="Nie udało się skopiować adresu. Możesz zaznaczyć adres e-mail widoczny nad przyciskami.";
   }
  });
 }
 const validPhone=value=>{
  const raw=value.trim();
  const digits=raw.replace(/\D/g,"");
  if(!/^(?:\+?\d|\(\+?\d)[0-9()\s-]*$/.test(raw))return false;
  let opened=false;
  for(const character of raw){
   if(character==="("){if(opened)return false;opened=true;}
   if(character===")"){if(!opened)return false;opened=false;}
  }
  return !opened&&digits.length>=7&&digits.length<=15;
 };
 // Native mailto links continue to work when this optional script is blocked.
 // Use the same one-click draft on the SKD campaign and the full service page.
 // The service page has multiple deliberate "send agreement" buttons, including
 // a fixed mobile one; otherwise those buttons leave the callback as a placeholder.
 const mailtoSelectors=[
  ".campaign-skd-email",
  ".campaign-skd .campaign-mobile-actions .campaign-mobile-primary",
  ".premium-subpage.theme-skd .service-hero-actions a[href^='mailto:']",
  ".premium-subpage.theme-skd .skd-document-actions .skd-email-action",
  ".premium-subpage.theme-skd #kontakt .actions a[href^='mailto:']",
  ".premium-subpage.theme-skd .service-cta .actions a[href^='mailto:']",
  ".premium-subpage.theme-skd .skd-mobile-quickbar .skd-mobile-mail"
 ];
 const links=[...document.querySelectorAll(mailtoSelectors.join(", "))];
 for(const link of links){
  const original=link.getAttribute("href")||"";
  if(!original.startsWith("mailto:"+mailbox+"?"))continue;
  link.addEventListener("click",()=>{
   // The contact form is initialized separately. Read its phone only when
   // the visitor chooses to open their own email program.
   const raw=document.querySelector('#formularz .contact-form input[autocomplete="tel"]')?.value?.trim()||"";
   const phone=validPhone(raw)?raw:"[wpisz numer]";
   const body=[
    "Dzień dobry,",
    "Proszę o wstępną analizę załączonej umowy kredytowej pod kątem SKD.",
    "Mój numer telefonu: "+phone,
    "Pełną umowę dołączę jako załącznik."
   ].join("\n");
   link.href="mailto:"+mailbox+"?subject="+encodeURIComponent("Umowa kredytowa do analizy SKD")+"&body="+encodeURIComponent(body);
   // Clear the temporary phone from the page after the browser processes
   // the mailto click; no persistent state or automatic message sending.
   window.setTimeout(()=>link.setAttribute("href",original),0);
  });
 }
})();
