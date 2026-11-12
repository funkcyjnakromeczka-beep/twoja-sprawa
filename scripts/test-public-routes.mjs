#!/usr/bin/env node
import assert from "node:assert/strict";
import {toPublicRoute} from "./public-routes.mjs";
const cases=[
 ["/","/"],
 ["/wiedza/","/wiedza/"],
 ["/plan-dzialania.html","/plan-dzialania"],
 ["/kontakt.html","/kontakt"],
 ["/o-nas.html","/o-nas"],
 ["/uslugi/szkody-gornicze.html","/uslugi/szkody-gornicze"],
 ["/uslugi/swiadczenie-wspierajace.html","/uslugi/swiadczenie-wspierajace"],
 ["/wiedza/drobne-pekniecia-szkody-gornicze.html","/wiedza/drobne-pekniecia-szkody-gornicze"],
 ["/lokalnie/szkody-gornicze-lubin.html","/lokalnie/szkody-gornicze-lubin"],
 ["/404.html","/404"],
 ["/kampanie/skd.html","/kampanie/skd"],
 ["/kampanie/swiadczenie-wspierajace.html","/kampanie/swiadczenie-wspierajace"]
];
for(const [source,expected] of cases)assert.equal(toPublicRoute(source),expected);
for(const invalid of ["", "uslugi/a.html", "/kontakt.html?utm=x", "/kontakt.html#formularz", null]){
 assert.throws(()=>toPublicRoute(invalid),TypeError);
}
console.log("OK: 12 canonical Cloudflare routes without HTML extensions and 5 invalid cases.");
