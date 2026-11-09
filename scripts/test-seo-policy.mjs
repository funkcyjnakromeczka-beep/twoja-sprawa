#!/usr/bin/env node
import assert from "node:assert/strict";
import {shouldIndexRoute} from "./seo-policy.mjs";
for(const route of ["/","/uslugi/szkody-gornicze.html","/uslugi/swiadczenie-wspierajace.html","/poradniki/checklista-szkody-gorniczej.html","/lokalnie/lubin.html","/kontakt.html"]){
  assert.equal(shouldIndexRoute(route),true,"Expected indexable: "+route);
}
for(const route of ["/narzedzia/linki-kampanii.html","/kampanie/szkody-gornicze.html","/kampanie/swiadczenie-wspierajace.html","/polityka-prywatnosci.html","invalid","/?utm_source=facebook"]){
  assert.equal(shouldIndexRoute(route),false,"Expected excluded: "+route);
}
console.log("OK: public pages indexable after approval; campaign funnels, privacy and marketing tools excluded.");
