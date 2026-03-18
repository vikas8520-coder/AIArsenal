#!/usr/bin/env node
/**
 * Add a new tool to src/data/tools.js from a JSON payload.
 *
 * Usage:
 *   TOOL_JSON='{"name":"..."}' node scripts/add-tool.mjs
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

// ── Main ─────────────────────────────────────────────────────────────────────
const tool = readToolPayload();
validate(tool);

const source = readFileSync(TOOLS_PATH, "utf-8");

// Check duplicates by URL or name
const urlNorm = normalizeUrl(tool.url);
const nameNorm = tool.name.toLowerCase();

const idRegex = /id:\s*"([a-z]+)(\d+)"/g;
const urlRegex = /url:\s*"([^"]+)"/g;
const nameRegex = /name:\s*"([^"]+)"/g;

// Collect existing IDs, URLs, names
const existingIds = [];
let m;
while ((m = idRegex.exec(source))) {
  existingIds.push({ prefix: m[1], num: parseInt(m[2], 10) });
}
const existingUrls = [];
while ((m = urlRegex.exec(source))) {
  existingUrls.push(normalizeUrl(m[1]));
}
const existingNames = [];
while ((m = nameRegex.exec(source))) {
  existingNames.push(m[1].toLowerCase());
}

if (existingUrls.includes(urlNorm)) {
  console.error(`❌ Duplicate URL: ${tool.url} already exists in tools.js`);
  process.exit(1);
}
if (existingNames.includes(nameNorm)) {
  console.error(
    `❌ Duplicate name: "${tool.name}" already exists in tools.js`
  );
  process.exit(1);
}

// Generate next ID
const prefix = CATEGORY_PREFIX[tool.category];
const maxNum = existingIds
  .filter((e) => e.prefix === prefix)
  .reduce((max, e) => Math.max(max, e.num), 0);
const newId = `${prefix}${maxNum + 1}`;

// Build the tool line (single-line, matching existing style)
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

const toolLine = `  { ${fields.join(", ")} },`;
const today = new Date().toISOString().slice(0, 10);
const comment = `  // ── Added by Arsenal Curator (${today}) ──`;

// Insert before closing ];
const closingIndex = source.lastIndexOf("];");
if (closingIndex === -1) {
  throw new Error("Could not find closing ]; in tools.js");
}

const before = source.slice(0, closingIndex);
const after = source.slice(closingIndex);
const updated = `${before}\n${comment}\n${toolLine}\n${after}`;

// Add to RECENT_TOOL_DATES
const datesPattern = /const RECENT_TOOL_DATES = \{/;
const datesMatch = updated.match(datesPattern);
if (datesMatch) {
  const insertPos = updated.indexOf("{", updated.indexOf("RECENT_TOOL_DATES")) + 1;
  const dateLine = `\n  "${newId}": "${today}",`;
  const final = updated.slice(0, insertPos) + dateLine + updated.slice(insertPos);
  writeFileSync(TOOLS_PATH, final, "utf-8");
} else {
  writeFileSync(TOOLS_PATH, updated, "utf-8");
}

console.log(`✅ Added "${tool.name}" as ${newId} (${tool.category})`);
console.log(`   Date: ${today}`);
