/**
 * Generate embeddings for all AIArsenal tools at build time.
 * Uses all-MiniLM-L6-v2 (384 dimensions, ~23MB ONNX).
 *
 * Run: node scripts/generate-embeddings.mjs
 * Output: src/data/tool-embeddings.json
 */

import { pipeline } from "@huggingface/transformers";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ── Load tools data (parse from JS module) ──────────────────────────────────
// Since tools.js uses `export const`, we need dynamic import
const toolsPath = join(ROOT, "src/data/tools.js");
const toolsSource = readFileSync(toolsPath, "utf-8");

// Extract the TOOLS array by evaluating the module
const toolsModule = await import(toolsPath);
const TOOLS = toolsModule.TOOLS;

console.log(`Loaded ${TOOLS.length} tools`);

// ── Build searchable text per tool ──────────────────────────────────────────
function buildToolText(tool) {
  const parts = [
    tool.name,
    tool.desc,
    tool.detail || "",
    tool.free || "",
    tool.company || "",
    tool.category,
    tool.subcategory || "",
    (tool.tags || []).join(" "),
    tool.privacy || "",
  ];
  return parts.filter(Boolean).join(". ");
}

// ── Generate embeddings ─────────────────────────────────────────────────────
console.log("Loading all-MiniLM-L6-v2 model...");
const embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
  dtype: "q8",  // quantized for speed
});

console.log("Generating embeddings...");
const embeddings = {};

for (let i = 0; i < TOOLS.length; i++) {
  const tool = TOOLS[i];
  const text = buildToolText(tool);

  // Run through model — returns tensor, convert to plain array
  const output = await embedder(text, { pooling: "mean", normalize: true });
  embeddings[tool.id] = Array.from(output.data);

  if ((i + 1) % 20 === 0 || i === TOOLS.length - 1) {
    console.log(`  ${i + 1}/${TOOLS.length} tools embedded`);
  }
}

// ── Save output ─────────────────────────────────────────────────────────────
const outputPath = join(ROOT, "src/data/tool-embeddings.json");
writeFileSync(outputPath, JSON.stringify(embeddings));

const sizeKB = (Buffer.byteLength(JSON.stringify(embeddings)) / 1024).toFixed(1);
console.log(`\nDone! Saved ${Object.keys(embeddings).length} embeddings to src/data/tool-embeddings.json (${sizeKB}KB)`);
