#!/usr/bin/env node
/**
 * Fetch bestFor/notFor attributes from the production /api/admin/generate-
 * attributes endpoint (where GOOGLE_AI_API_KEY is properly decrypted by
 * Vercel). Merges results into src/data/tool-attributes.js.
 *
 * Usage:
 *   ADMIN_PASSWORD=... node scripts/fetch-attributes.mjs
 *   BASE_URL=https://ai-arsenal-nu.vercel.app ADMIN_PASSWORD=... node scripts/fetch-attributes.mjs
 *   (add --force to regenerate everything)
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ATTRS_PATH = join(ROOT, "src", "data", "tool-attributes.js");

// Pull password from env or .env.local
function loadEnvLocal() {
  const envPath = join(ROOT, ".env.local");
  if (!existsSync(envPath)) return;
  const raw = readFileSync(envPath, "utf-8");
  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const k = line.slice(0, eq).trim();
    let v = line.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnvLocal();

const BASE_URL = process.env.BASE_URL || "https://ai-arsenal-nu.vercel.app";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD || ADMIN_PASSWORD.startsWith("AQ.")) {
  console.error(
    "❌ Need plain-text ADMIN_PASSWORD. Pass as: ADMIN_PASSWORD=xxx node scripts/fetch-attributes.mjs"
  );
  process.exit(1);
}

const force = process.argv.includes("--force");

const { TOOL_ATTRIBUTES } = await import(ATTRS_PATH);

let merged = force ? {} : { ...TOOL_ATTRIBUTES };
let startIdx = 0;
const count = 20;
const allErrors = [];
const startTime = Date.now();
let totalMissing = null;

console.log(`📡 Fetching attributes from ${BASE_URL}${force ? " (force)" : ""}`);

while (true) {
  const res = await fetch(`${BASE_URL}/api/admin/generate-attributes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      password: ADMIN_PASSWORD,
      startIdx,
      count,
      force,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error(`❌ HTTP ${res.status}: ${txt.slice(0, 300)}`);
    process.exit(1);
  }

  const data = await res.json();
  if (totalMissing === null) {
    totalMissing = data.totalMissing;
    console.log(`📋 ${totalMissing} tools need attributes${force ? " (regenerating all)" : ""}`);
    if (totalMissing === 0) {
      console.log("✅ Already covered. Use --force to regenerate.");
      process.exit(0);
    }
  }

  const got = Object.keys(data.generated).length;
  Object.assign(merged, data.generated);
  for (const err of data.errors || []) {
    allErrors.push(err);
    console.log(`  ✗ ${err.id.padEnd(5)} ${err.name} — ${err.error}`);
  }
  for (const id of Object.keys(data.generated)) {
    console.log(`  ✓ ${id.padEnd(5)} (${startIdx + Object.keys(merged).length - Object.keys(TOOL_ATTRIBUTES).length}/${totalMissing})`);
  }

  if (data.remaining === 0) break;
  startIdx += count;
}

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(
  `\n⏱  Done in ${elapsed}s · ${Object.keys(merged).length - Object.keys(force ? {} : TOOL_ATTRIBUTES).length} new · ${allErrors.length} errors`
);

// ── Write back ──────────────────────────────────────────────────────────────
function serializeAttrs(attrs) {
  const entries = Object.keys(attrs).sort().map((id) => {
    const { bestFor, notFor } = attrs[id];
    const b = bestFor.map((s) => `      ${JSON.stringify(s)}`).join(",\n");
    const n = notFor.map((s) => `      ${JSON.stringify(s)}`).join(",\n");
    return `  ${id}: {\n    bestFor: [\n${b},\n    ],\n    notFor: [\n${n},\n    ],\n  },`;
  });
  return entries.join("\n");
}

const header = `// Decision-guide attributes layered on top of tools.js by tool id.
// Each entry: { bestFor: [2-4 short lines], notFor: [2-3 short lines] }.
// Used by ToolCard, ToolPageClient, and ComparePageClient when present.
//
// Regenerate missing entries (server-side, fast path):
//   ADMIN_PASSWORD=xxx node scripts/fetch-attributes.mjs
// Force-regenerate all:
//   ADMIN_PASSWORD=xxx node scripts/fetch-attributes.mjs --force

export const TOOL_ATTRIBUTES = {
${serializeAttrs(merged)}
};

export function getAttributes(toolId) {
  return TOOL_ATTRIBUTES[toolId] || null;
}
`;

writeFileSync(ATTRS_PATH, header, "utf-8");
console.log(`✅ Wrote ${Object.keys(merged).length} entries to src/data/tool-attributes.js`);
