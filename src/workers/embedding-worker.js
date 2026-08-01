/**
 * Web Worker for semantic search using transformers.js
 *
 * Fetches pre-computed tool embeddings on first search, loads the
 * all-MiniLM-L6-v2 model only when a semantic query is issued, then
 * processes query embeddings off the main thread.
 */

import { pipeline } from "@huggingface/transformers";

let embedder = null;
let toolEmbeddings = null;
let embeddingsPromise = null;
let modelReady = false;
let modelLoading = false;
let modelPromise = null;

// ── Cosine similarity ───────────────────────────────────────────────────────
function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ── Load model lazily on first search ───────────────────────────────────────
async function ensureModel() {
  if (modelReady) return;
  if (modelPromise) return modelPromise;

  modelLoading = true;
  modelPromise = (async () => {
    self.postMessage({ type: "status", status: "loading" });
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
      dtype: "q8",
    });
    modelReady = true;
    self.postMessage({ type: "status", status: "ready" });
  })().catch((err) => {
    self.postMessage({ type: "status", status: "error", error: err.message });
    throw err;
  }).finally(() => {
    modelLoading = false;
  });

  return modelPromise;
}

// ── Load embeddings lazily on first search ──────────────────────────────────
async function ensureEmbeddings() {
  if (toolEmbeddings) return toolEmbeddings;
  if (!embeddingsPromise) {
    embeddingsPromise = fetch("/tool-embeddings.json").then((r) => r.json());
  }
  toolEmbeddings = await embeddingsPromise;
  return toolEmbeddings;
}

// ── Handle messages ─────────────────────────────────────────────────────────
self.onmessage = async (e) => {
  const { type, data } = e.data;

  if (type === "init") {
    // Legacy no-op; embeddings are fetched on first search.
    return;
  }

  if (type === "search") {
    const { query, topK = 8, minScore = 0.25, requestId } = data;

    try {
      const embeddings = await ensureEmbeddings();
      await ensureModel();

      // Embed the query
      const output = await embedder(query, { pooling: "mean", normalize: true });
      const queryVec = Array.from(output.data);

      // Compute similarity with all tools
      const scores = [];
      for (const [toolId, embedding] of Object.entries(embeddings)) {
        const score = cosineSimilarity(queryVec, embedding);
        if (score >= minScore) {
          scores.push({ id: toolId, score });
        }
      }

      // Sort by score descending, take topK
      scores.sort((a, b) => b.score - a.score);
      const results = scores.slice(0, topK);

      self.postMessage({ type: "results", requestId, results, ready: true });
    } catch (err) {
      self.postMessage({
        type: "results",
        requestId,
        results: [],
        ready: true,
        error: err.message,
      });
    }
  }
};
