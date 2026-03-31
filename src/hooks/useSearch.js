"use client";
import { useMemo } from "react";
import MiniSearch from "minisearch";

/**
 * Build a MiniSearch index from tools array.
 * Fields are weighted to match the original scoring priority:
 *   name (highest) > tags > subcategory > company > category > desc > free
 */
function buildIndex(tools) {
  const ms = new MiniSearch({
    fields: ["name", "tags_str", "subcategory", "company", "category", "desc", "free"],
    storeFields: ["id"],
    searchOptions: {
      boost: {
        name: 10,
        tags_str: 5,
        subcategory: 4,
        company: 3.5,
        category: 2.5,
        desc: 2,
        free: 1,
      },
      fuzzy: 0.2,
      prefix: true,
      // Use OR so multi-word queries return results even if not all terms match.
      // MiniSearch naturally scores docs with more term matches higher.
      combineWith: "OR",
    },
  });

  const docs = tools.map((t, i) => ({
    id: i,
    toolId: t.id,
    name: t.name,
    tags_str: (t.tags || []).join(" "),
    subcategory: t.subcategory || "",
    company: t.company || "",
    category: t.category || "",
    desc: t.desc || "",
    free: t.free || "",
  }));

  ms.addAll(docs);
  return ms;
}

// Module-level cache so we don't rebuild on every render
let cachedIndex = null;
let cachedTools = null;

function getIndex(tools) {
  if (cachedTools === tools && cachedIndex) return cachedIndex;
  cachedIndex = buildIndex(tools);
  cachedTools = tools;
  return cachedIndex;
}

/**
 * Search and rank tools against a query string using MiniSearch.
 *
 * Uses OR combination so multi-word queries like "chatbot framework free tier"
 * return results matching any terms, ranked by how many terms match and
 * field weight. Fuzzy matching handles typos.
 *
 * @param {Array} tools - full tools array
 * @param {string} query - user search string
 * @returns {Array} filtered + ranked tools
 */
export function searchTools(tools, query) {
  if (!query.trim()) return tools;

  const index = getIndex(tools);

  // First try with default settings (OR + fuzzy 0.2)
  let results = index.search(query.trim());

  if (results.length === 0) {
    // Fallback: higher fuzzy tolerance for typos
    results = index.search(query.trim(), { fuzzy: 0.35 });
  }

  if (results.length === 0) return [];

  // Filter out very low-scoring results (noise from OR mode)
  // Use 15% of top score as threshold
  const topScore = results[0].score;
  const threshold = topScore * 0.15;
  const filtered = results.filter((r) => r.score >= threshold);

  // Map MiniSearch results back to tool objects, preserving score order
  const scoreMap = new Map(filtered.map((r) => [r.id, r.score]));
  return tools
    .filter((_, i) => scoreMap.has(i))
    .sort((a, b) => {
      const ai = tools.indexOf(a);
      const bi = tools.indexOf(b);
      return (scoreMap.get(bi) || 0) - (scoreMap.get(ai) || 0);
    });
}

/**
 * Get autocomplete suggestions for a partial query.
 */
export function getAutoSuggestions(tools, query, limit = 6) {
  if (!query.trim() || query.trim().length < 2) return [];
  const index = getIndex(tools);
  return index.autoSuggest(query.trim(), {
    fuzzy: 0.2,
    prefix: true,
    boost: { name: 10, tags_str: 3 },
  }).slice(0, limit);
}

/**
 * React hook wrapping searchTools with useMemo.
 */
export default function useSearch(tools, query) {
  return useMemo(() => searchTools(tools, query), [tools, query]);
}
