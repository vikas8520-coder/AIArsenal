"use client";
import { useMemo, useRef } from "react";
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
      combineWith: "AND",
    },
  });

  const docs = tools.map((t, i) => ({
    // MiniSearch needs a unique numeric or string id field
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
 * Supports fuzzy matching (typo tolerance), prefix search, and
 * field-weighted scoring.
 *
 * @param {Array} tools - full tools array
 * @param {string} query - user search string
 * @returns {Array} filtered + ranked tools
 */
export function searchTools(tools, query) {
  if (!query.trim()) return tools;

  const index = getIndex(tools);
  const results = index.search(query.trim());

  if (results.length === 0) {
    // Fallback: try with higher fuzzy tolerance for very short/typo queries
    const fuzzyResults = index.search(query.trim(), { fuzzy: 0.35 });
    if (fuzzyResults.length > 0) {
      const idSet = new Set(fuzzyResults.map((r) => r.id));
      return tools.filter((_, i) => idSet.has(i));
    }
    return [];
  }

  // Map MiniSearch results back to tool objects, preserving score order
  const idSet = new Map(results.map((r) => [r.id, r.score]));
  return tools
    .filter((_, i) => idSet.has(i))
    .sort((a, b) => {
      const ai = tools.indexOf(a);
      const bi = tools.indexOf(b);
      return (idSet.get(bi) || 0) - (idSet.get(ai) || 0);
    });
}

/**
 * Get autocomplete suggestions for a partial query.
 *
 * @param {Array} tools - full tools array
 * @param {string} query - partial search string
 * @param {number} limit - max suggestions
 * @returns {Array<{suggestion: string, score: number}>}
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
