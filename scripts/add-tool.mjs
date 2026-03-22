#!/usr/bin/env node
/**
 * Add one or more tools to src/data/tools.js from a JSON payload.
 * Supports both single tool objects and arrays of tools.
 *
 * Usage:
 *   TOOL_JSON='{"name":"..."}' node scripts/add-tool.mjs
 *   TOOL_JSON='[{"name":"..."},{"name":"..."}]' node scripts/add-tool.mjs
 *   node scripts/add-tool.mjs path/to/tool.json
 */

import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOOLS_PATH = join(__dirname, "..", "src", "data", "tools.js");

// ── Category → ID prefix mapping ────────────────────────────────────────────
const CATEGORY_PREFIX = {
  "Developer Tools": "d",
  "End-User Tools": "e",
  "Creative AI": "c",
  "Open-Source Models": "o",
  "Infrastructure": "i",
  "Research & Education": "r",
  "Automation & Agents": "a",
  "Business AI": "b",
  "Safety & Ethics": "s",
  "Token Economy": "t",
  "AI Income": "n",
  "Cost Optimization": "x",
  "Personal AI Systems": "p",
};

const REQUIRED_FIELDS = [
  "name",
  "url",
  "category",
  "subcategory",
  "desc",
  "detail",
  "free",
  "company",
  "tags",
];

// ── Read tool JSON ───────────────────────────────────────────────────────────
function readToolPayload() {
  // Option 1: env var
  if (process.env.TOOL_JSON) {
    return JSON.parse(process.env.TOOL_JSON);
  }
  // Option 2: file path argument
  if (process.argv[2]) {
    return JSON.parse(readFileSync(process.argv[2], "utf-8"));
  }
  // Option 3: stdin (piped)
  const chunks = [];
  const fd = 0; // stdin
  const buf = Buffer.alloc(1024);
  let n;
  try {
    while ((n = require("fs").readSync(fd, buf)) > 0) {
      chunks.push(buf.slice(0, n));
    }
  } catch {
    // EAGAIN on empty stdin
  }
  if (chunks.length > 0) {
    return JSON.parse(Buffer.concat(chunks).toString("utf-8"));
  }
  throw new Error(
    "No tool data provided. Set TOOL_JSON env var, pass a file path, or pipe JSON to stdin."
  );
}

// ── Validate ─────────────────────────────────────────────────────────────────
function validate(tool) {
  const missing = REQUIRED_FIELDS.filter((f) => !tool[f]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }
  if (!CATEGORY_PREFIX[tool.category]) {
    throw new Error(
      `Unknown category "${tool.category}". Valid: ${Object.keys(CATEGORY_PREFIX).join(", ")}`
    );
  }
  // Coerce types
  if (typeof tool.oss === "string")
    tool.oss = tool.oss.toLowerCase() === "true";
  if (typeof tool.oss === "undefined") tool.oss = false;
  if (typeof tool.tags === "string")
    tool.tags = tool.tags.split(",").map((t) => t.trim());
  if (!tool.privacy) tool.privacy = "";
  if (!tool.quickStart) tool.quickStart = "";
}

// ── Normalize URL for duplicate check ────────────────────────────────────────
function normalizeUrl(url) {
  return url
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
}

// ── Build tool line from validated tool object ──────────────────────────────
function buildToolLine(tool, newId) {
  const fields = [
    `id: ${JSON.stringify(newId)}`,
    `name: ${JSON.stringify(tool.name)}`,
    `url: ${JSON.stringify(tool.url)}`,
    `category: ${JSON.stringify(tool.category)}`,
    `subcategory: ${JSON.stringify(tool.subcategory)}`,
    `desc: ${JSON.stringify(tool.desc)}`,
    `detail: ${JSON.stringify(tool.detail)}`,
  ];
  if (tool.quickStart)
    fields.push(`quickStart: ${JSON.stringify(tool.quickStart)}`);
  fields.push(`free: ${JSON.stringify(tool.free)}`);
  fields.push(`company: ${JSON.stringify(tool.company)}`);
  fields.push(`oss: ${tool.oss}`);
  fields.push(`privacy: ${JSON.stringify(tool.privacy)}`);
  fields.push(`tags: ${JSON.stringify(tool.tags)}`);
  if (tool.affiliate) fields.push(`affiliate: ${JSON.stringify(tool.affiliate)}`);
  return `  { ${fields.join(", ")} },`;
}

// ── Main ─────────────────────────────────────────────────────────────────────
const payload = readToolPayload();

// Support both single tool and array of tools
const tools = Array.isArray(payload) ? payload : [payload];

if (tools.length === 0) {
  console.error("❌ No tools provided");
  process.exit(1);
}

let source = readFileSync(TOOLS_PATH, "utf-8");

// Parse existing state once
const idRegex = /id:\s*"([a-z]+)(\d+)"/g;
const urlRegex = /url:\s*"([^"]+)"/g;
const nameRegex = /name:\s*"([^"]+)"/g;

const existingIds = [];
let m;
while ((m = idRegex.exec(source))) {
  existingIds.push({ prefix: m[1], num: parseInt(m[2], 10) });
}
const existingUrls = new Set();
while ((m = urlRegex.exec(source))) {
  existingUrls.add(normalizeUrl(m[1]));
}
const existingNames = new Set();
while ((m = nameRegex.exec(source))) {
  existingNames.add(m[1].toLowerCase());
}

// Track max IDs per prefix (mutable — incremented as we add tools)
const maxPerPrefix = {};
for (const e of existingIds) {
  if (!maxPerPrefix[e.prefix] || e.num > maxPerPrefix[e.prefix]) {
    maxPerPrefix[e.prefix] = e.num;
  }
}

// Track within-batch additions for dedup
const batchUrls = new Set();
const batchNames = new Set();

const today = new Date().toISOString().slice(0, 10);
const added = [];
const skipped = [];

for (const tool of tools) {
  try {
    validate(tool);
  } catch (err) {
    skipped.push({ name: tool.name || "unknown", reason: err.message });
    continue;
  }

  const urlNorm = normalizeUrl(tool.url);
  const nameNorm = tool.name.toLowerCase();

  // Check duplicates against existing + batch
  if (existingUrls.has(urlNorm) || batchUrls.has(urlNorm)) {
    skipped.push({ name: tool.name, reason: "duplicate URL" });
    continue;
  }
  if (existingNames.has(nameNorm) || batchNames.has(nameNorm)) {
    skipped.push({ name: tool.name, reason: "duplicate name" });
    continue;
  }

  // Generate next ID
  const prefix = CATEGORY_PREFIX[tool.category];
  const currentMax = maxPerPrefix[prefix] || 0;
  const nextNum = currentMax + 1;
  maxPerPrefix[prefix] = nextNum;
  const newId = `${prefix}${nextNum}`;

  // Build the tool line
  const toolLine = buildToolLine(tool, newId);

  // Insert before closing ];
  const closingIndex = source.lastIndexOf("];");
  if (closingIndex === -1) {
    skipped.push({ name: tool.name, reason: "could not find ]; in tools.js" });
    continue;
  }

  const comment = tools.length === 1
    ? `  // ── Added by Arsenal Curator (${today}) ──`
    : "";  // For batch, we add one comment before all entries
  const before = source.slice(0, closingIndex);
  const after = source.slice(closingIndex);
  source = `${before}\n${comment ? comment + "\n" : ""}${toolLine}\n${after}`;

  // Add to RECENT_TOOL_DATES
  const datesPattern = /const RECENT_TOOL_DATES = \{/;
  if (datesPattern.test(source)) {
    const insertPos = source.indexOf("{", source.indexOf("RECENT_TOOL_DATES")) + 1;
    const dateLine = `\n  "${newId}": "${today}",`;
    source = source.slice(0, insertPos) + dateLine + source.slice(insertPos);
  }

  // Track for within-batch dedup
  batchUrls.add(urlNorm);
  batchNames.add(nameNorm);
  existingUrls.add(urlNorm);
  existingNames.add(nameNorm);

  added.push({ name: tool.name, id: newId, category: tool.category });
}

// Add batch comment if multiple tools added
if (added.length > 1) {
  // The individual tool lines are already inserted; add a batch header comment
  // (Individual comments were skipped for batch mode)
  const batchComment = `  // ── Batch added by Arsenal Curator (${today}) — ${added.length} tools ──`;
  // Find first of our newly added tools and prepend comment
  const firstNewId = added[0].id;
  const firstIdIndex = source.indexOf(`id: "${firstNewId}"`);
  if (firstIdIndex > -1) {
    const lineStart = source.lastIndexOf("\n", firstIdIndex);
    source = source.slice(0, lineStart) + "\n" + batchComment + source.slice(lineStart);
  }
}

// Write final result
if (added.length > 0) {
  writeFileSync(TOOLS_PATH, source, "utf-8");
}

// Report
for (const a of added) {
  console.log(`✅ Added "${a.name}" as ${a.id} (${a.category})`);
}
for (const s of skipped) {
  console.log(`⏭️  Skipped "${s.name}": ${s.reason}`);
}
console.log(`\n📊 Summary: ${added.length} added, ${skipped.length} skipped (of ${tools.length} total)`);

if (added.length === 0 && tools.length > 0) {
  console.error("❌ No tools were added");
  process.exit(1);
}
