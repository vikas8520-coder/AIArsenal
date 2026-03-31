"use client";
/**
 * useSemanticSearch — client-side semantic search via Web Worker
 *
 * Loads all-MiniLM-L6-v2 in a Web Worker, then embeds queries and
 * compares against pre-computed tool embeddings for semantic ranking.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import toolEmbeddings from "../data/tool-embeddings.json";
import { TOOLS } from "../data/tools";

// Build a lookup map once
const TOOL_MAP = Object.fromEntries(TOOLS.map((t) => [t.id, t]));

// Question intent detection patterns
const QUESTION_PATTERNS = [
  /\b(what|which|how|where|why|who)\b/i,
  /\b(alternative|better|similar|like|instead|replace|versus|vs|compare)\b/i,
  /\b(best|top|recommend|suggest|good|cheapest|fastest|free)\b/i,
  /\?$/,
];

export function isSemanticQuery(query) {
  if (!query || query.trim().length < 8) return false;
  return QUESTION_PATTERNS.some((p) => p.test(query.trim()));
}

export function useSemanticSearch() {
  const workerRef = useRef(null);
  const requestIdRef = useRef(0);
  const callbackMapRef = useRef(new Map());
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error

  // Initialize worker
  useEffect(() => {
    const worker = new Worker(
      new URL("../workers/embedding-worker.js", import.meta.url),
      { type: "module" }
    );

    worker.onmessage = (e) => {
      const { type, data } = e;
      const msg = e.data;

      if (msg.type === "status") {
        setStatus(msg.status);
      }

      if (msg.type === "results") {
        const callback = callbackMapRef.current.get(msg.requestId);
        if (callback) {
          callbackMapRef.current.delete(msg.requestId);

          // Map tool IDs back to full tool objects
          const results = msg.results
            .map(({ id, score }) => ({
              tool: TOOL_MAP[id],
              score,
              reason: null, // Will be filled by AI or left null for semantic
            }))
            .filter((r) => r.tool);

          callback({
            results,
            ready: msg.ready,
            error: msg.error || null,
          });
        }
      }
    };

    // Send pre-computed embeddings to worker
    worker.postMessage({
      type: "init",
      data: { embeddings: toolEmbeddings },
    });

    workerRef.current = worker;

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  // Search function — returns a promise
  const search = useCallback((query, { topK = 8, minScore = 0.25 } = {}) => {
    return new Promise((resolve) => {
      if (!workerRef.current) {
        resolve({ results: [], ready: false, error: "Worker not ready" });
        return;
      }

      const requestId = ++requestIdRef.current;
      callbackMapRef.current.set(requestId, resolve);

      workerRef.current.postMessage({
        type: "search",
        data: { query, topK, minScore, requestId },
      });

      // Timeout after 10s
      setTimeout(() => {
        if (callbackMapRef.current.has(requestId)) {
          callbackMapRef.current.delete(requestId);
          resolve({ results: [], ready: false, error: "Search timed out" });
        }
      }, 10000);
    });
  }, []);

  return { search, status };
}
