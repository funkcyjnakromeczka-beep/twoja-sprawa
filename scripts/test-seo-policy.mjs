#!/usr/bin/env node
import assert from "node:assert/strict";
import {shouldIndexRoute} from "./seo-policy.mjs";
for(const route of ["/","/uslugi/szkody-gornicze.html","/uslugi/swiadczenie-wspierajace.html","/lokalnie/lubin.html","/kontakt.html","/wiedza/","/wiedza/drobne-pekniecia-szkody-gornicze.html","/wiedza/swiadczenie-wspierajace-2026-wzon-zus.html"]){
  assert.equal(shouldIndexRoute(route),true,"Expected indexable: "+route);
}
for(const route of ["/404.html","/narzedzia/linki-kampanii.html","/kampanie/szkody-gornicze.html","/kampanie/swiadczenie-wspierajace.html","/polityka-prywatnosci.html","/poradniki/checklista-szkody-gorniczej.html","/poradniki/skd-kredyt-pln-lista-kontrolna.html","/wiedza/ugoda-z-kopalnia-co-sprawdzic.html","/wiedza/kredyt-pln-dokumenty-skd.html","invalid","/?utm_source=facebook"]){
  assert.equal(shouldIndexRoute(route),false,"Expected excluded: "+route);
}
console.log("OK: public pages indexable after approval; 404, campaign funnels, privacy and marketing tools excluded.");
