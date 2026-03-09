/**
 * Web Worker for semantic search using transformers.js
 *
 * Loads the all-MiniLM-L6-v2 model once, then processes query embeddings
 * off the main thread. Pre-computed tool embeddings are passed in on init.
 */

import { pipeline } from "@huggingface/transformers";

let embedder = null;
let toolEmbeddings = null; // { id: Float32Array }
let modelLoading = false;
let modelReady = false;

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

// ── Load model ──────────────────────────────────────────────────────────────
async function loadModel() {
  if (modelReady || modelLoading) return;
  modelLoading = true;

  try {
    self.postMessage({ type: "status", status: "loading" });
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
      dtype: "q8",
    });
    modelReady = true;
    self.postMessage({ type: "status", status: "ready" });
  } catch (err) {
    self.postMessage({ type: "status", status: "error", error: err.message });
  } finally {
    modelLoading = false;
  }
}

// ── Handle messages ─────────────────────────────────────────────────────────
self.onmessage = async (e) => {
  const { type, data } = e.data;

  if (type === "init") {
    // Receive pre-computed embeddings
    toolEmbeddings = data.embeddings; // { toolId: number[] }
    // Start loading model immediately
    loadModel();
    return;
  }

  if (type === "search") {
    const { query, topK = 8, minScore = 0.25, requestId } = data;

    if (!modelReady) {
      // Model still loading — try to load and wait
      if (!modelLoading) loadModel();
      // Return empty for now, client will retry or show keyword results
      self.postMessage({
        type: "results",
        requestId,
        results: [],
        ready: false,
      });
      return;
    }

    if (!toolEmbeddings) {
      self.postMessage({
        type: "results",
        requestId,
        results: [],
        ready: true,
        error: "No embeddings loaded",
      });
      return;
    }

    try {
      // Embed the query
      const output = await embedder(query, { pooling: "mean", normalize: true });
      const queryVec = Array.from(output.data);

      // Compute similarity with all tools
      const scores = [];
      for (const [toolId, embedding] of Object.entries(toolEmbeddings)) {
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
