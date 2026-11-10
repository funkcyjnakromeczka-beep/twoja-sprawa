/* Progressive enhancement: accessible, low-cost scroll reveals and navigation. */
(()=>{'use strict';const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sections=[...document.querySelectorAll('.motion-section')];
if(!reduce&&'IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('motion-visible');observer.unobserve(entry.target);}}},{threshold:.08,rootMargin:'0px 0px -30px 0px'});for(const section of sections){section.classList.add('motion-ready');observer.observe(section);}}
const header=document.querySelector('.site-header');if(header){let busy=false;const update=()=>{header.classList.toggle('is-scrolled',window.scrollY>32);busy=false;};window.addEventListener('scroll',()=>{if(!busy){busy=true;requestAnimationFrame(update);}},{passive:true});update();}
const nav=document.querySelector('.main-nav');const trigger=document.querySelector('.mobile-menu-toggle');if(nav&&trigger){
  const setMenu=(open)=>{nav.classList.toggle('nav-open',open);trigger.setAttribute('aria-expanded',String(open));trigger.setAttribute('aria-label',open?'Zamknij menu':'Otwórz menu');if(!open){const more=nav.querySelector("details.nav-more");if(more)more.open=false;}};
  setMenu(false);
  trigger.addEventListener('click',()=>setMenu(trigger.getAttribute('aria-expanded')!=='true'));
  nav.addEventListener('click',e=>{if(e.target.closest('a'))setMenu(false);});
  document.addEventListener('pointerdown',e=>{if(!nav.contains(e.target)&&!trigger.contains(e.target))setMenu(false);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&trigger.getAttribute('aria-expanded')==='true'){setMenu(false);trigger.focus();}});
  window.addEventListener('resize',()=>{if(window.innerWidth>760&&trigger.getAttribute('aria-expanded')==='true')setMenu(false);});
  const navMore=nav.querySelector("details.nav-more");
  if(navMore){
    document.addEventListener("pointerdown",event=>{if(navMore.open&&!navMore.contains(event.target))navMore.open=false;});
    document.addEventListener("keydown",event=>{if(event.key==="Escape"&&navMore.open){navMore.open=false;navMore.querySelector("summary")?.focus();}});
  }
}
// Open native disclosures for hash links without requiring extra clicks.
const revealTarget=()=>{
  if(!window.location.hash)return;
  let id;try{id=decodeURIComponent(window.location.hash.slice(1));}catch{return;}
  const target=document.getElementById(id);if(!target)return;
  let node=target,changed=false;
  while(node&&node!==document.body){
    if(node instanceof HTMLDetailsElement&&!node.open){node.open=true;changed=true;}
    node=node.parentElement;
  }
  if(changed){requestAnimationFrame(()=>target.scrollIntoView({block:"start"}));}
};
// Same-hash links must reopen their disclosure even if the hash itself does not change.
document.addEventListener("click",event=>{
  const link=event.target?.closest?.("a[href]");
  if(!link)return;
  let destination;
  try{destination=new URL(link.href,window.location.href);}catch{return;}
  if(destination.origin===window.location.origin
     &&destination.pathname===window.location.pathname
     &&destination.hash===window.location.hash&&destination.hash){
    revealTarget();
  }
},true);
window.addEventListener("hashchange",revealTarget);
revealTarget();
})();
