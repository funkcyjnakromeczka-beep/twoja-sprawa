#!/usr/bin/env node
/** Validate maintained GitHub Actions pins in all project workflows.
 * This is release infrastructure verification, not a claimed website fix.
 */
import assert from "node:assert/strict";
import {readdir,readFile} from "node:fs/promises";
const dir=".github/workflows";
const paths=(await readdir(dir)).filter(x=>x.endsWith(".yml")||x.endsWith(".yaml"));
let checked=0,modern=0;
for(const name of paths){
 const body=await readFile(dir+"/"+name,"utf8");
 const used=[...body.matchAll(/uses:\s*(actions\/(checkout|setup-node|upload-artifact)@v\d+)/g)];
 for(const m of used){
  assert.match(m[1],/@v7$/,"Outdated action in "+name+": "+m[1]);
  modern++;
 }
 assert.ok(!/actions\/checkout@v[1-6]|actions\/setup-node@v[1-6]|actions\/upload-artifact@v[1-6]/.test(body),
  "Legacy runner detected in "+name);
 checked++;
}
assert.ok(checked>=11,"Must inspect all CI and deployment workflows");
assert.ok(modern>=25,"Expected at least 25 upgraded action references");
console.log("ACTIONS_MAINTENANCE_OK "+JSON.stringify({workflows:checked,maintainedActionReferences:modern}));
