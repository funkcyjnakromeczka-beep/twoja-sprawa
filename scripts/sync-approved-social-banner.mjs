#!/usr/bin/env node
/* Approved visual identity asset, supplied by the site owner.
   This check never downloads from third-party sources. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {createHash} from "node:crypto";

const asset="v2/assets/og-twoja-sprawa-metallic-v1.jpg";
const bytes=await readFile(asset);
const sha256=createHash("sha256").update(bytes).digest("hex");
assert.equal(sha256,"489f8b499f49f841c6dec3f5777a791f4007ad9d5e8c109ceeed6cc83187798c","Graphic differs from owner-approved original");
assert.equal(bytes.length,175149,"Unexpected size of approved brand asset");
assert.equal(bytes[0],0xff);
assert.equal(bytes[1],0xd8);
assert.equal(bytes[bytes.length-2],0xff);
assert.equal(bytes[bytes.length-1],0xd9);
console.log("APPROVED_BRAND_BANNER_OK: exact user-approved image, 1536x803, 175149 bytes.");
