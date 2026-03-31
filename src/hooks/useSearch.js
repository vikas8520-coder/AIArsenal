"use client";
import { useMemo } from "react";

/**
 * Score a single tool against a single search term.
 * Returns 0 if no match (tool should be excluded).
 * Higher score = better match.
 */
function scoreToolForTerm(tool, term) {
  const t = term.toLowerCase();
  const name = tool.name.toLowerCase();

  // Name matches — highest priority
  if (name === t) return 100;
  if (name.startsWith(t)) return 80;
  if (name.includes(t)) return 60;

  // Tag matches
  const tagExact = tool.tags.some((tag) => tag.toLowerCase() === t);
  if (tagExact) return 55;
  const tagContains = tool.tags.some((tag) => tag.toLowerCase().includes(t));
  if (tagContains) return 45;

  // Subcategory
  if (tool.subcategory.toLowerCase().includes(t)) return 40;

  // Company
  if (tool.company.toLowerCase().includes(t)) return 35;

  // Category
  if (tool.category.toLowerCase().includes(t)) return 25;

  // Description
  if (tool.desc.toLowerCase().includes(t)) return 20;

  // Free tier details (lowest priority)
  if (tool.free.toLowerCase().includes(t)) return 10;

  return 0; // no match
}

/**
 * Search and rank tools against a query string.
 *
 * Multi-word AND logic: all space-separated terms must match at least one
 * field per tool. Scores are summed across terms and results sorted
 * descending by score (ties broken alphabetically by name).
 *
 * @param {Array} tools - full tools array
 * @param {string} query - user search string
 * @returns {Array} filtered + ranked tools
 */
export function searchTools(tools, query) {
  if (!query.trim()) return tools;

  const terms = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const scored = [];

  for (const tool of tools) {
    let totalScore = 0;
    let allTermsMatch = true;

    for (const term of terms) {
      const s = scoreToolForTerm(tool, term);
      if (s === 0) {
        allTermsMatch = false;
        break;
      }
      totalScore += s;
    }

    if (allTermsMatch) {
      scored.push({ tool, score: totalScore });
    }
  }

  scored.sort(
    (a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name)
  );

  return scored.map((s) => s.tool);
}

/**
 * React hook wrapping searchTools with useMemo.
 */
export default function useSearch(tools, query) {
  return useMemo(() => searchTools(tools, query), [tools, query]);
}
