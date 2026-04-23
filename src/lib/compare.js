import { TOOLS } from "../data/tools";
import { COMPARISONS } from "../data/comparisons";
import { slugify } from "../utils/slugify";

function findTool(name) {
  const lower = name.toLowerCase();
  return TOOLS.find((t) => t.name.toLowerCase() === lower) || null;
}

function compareSlug(a, b) {
  const [x, y] = [slugify(a), slugify(b)].sort();
  return `${x}-vs-${y}`;
}

// Build slug → { toolA, toolB } map once at import.
const pairMap = new Map();

for (const { a, b } of COMPARISONS) {
  const toolA = findTool(a);
  const toolB = findTool(b);
  if (!toolA || !toolB || toolA.id === toolB.id) continue;
  const slug = compareSlug(toolA.name, toolB.name);
  // Normalize order so the page always shows them in the same order as the slug.
  const [first, second] =
    slugify(toolA.name) < slugify(toolB.name)
      ? [toolA, toolB]
      : [toolB, toolA];
  pairMap.set(slug, { toolA: first, toolB: second });
}

export function getAllCompareSlugs() {
  return [...pairMap.keys()];
}

export function getComparisonBySlug(slug) {
  return pairMap.get(slug) || null;
}

export function getCompareSlug(toolA, toolB) {
  return compareSlug(toolA.name, toolB.name);
}

// Suggest related comparisons: other pairs sharing a tool or subcategory.
export function getRelatedComparisons(slug, limit = 5) {
  const current = pairMap.get(slug);
  if (!current) return [];
  const out = [];
  for (const [s, pair] of pairMap.entries()) {
    if (s === slug) continue;
    const sharesTool =
      pair.toolA.id === current.toolA.id ||
      pair.toolA.id === current.toolB.id ||
      pair.toolB.id === current.toolA.id ||
      pair.toolB.id === current.toolB.id;
    const sharesSubcat =
      pair.toolA.subcategory === current.toolA.subcategory ||
      pair.toolB.subcategory === current.toolA.subcategory;
    if (sharesTool || sharesSubcat) {
      out.push({ slug: s, ...pair, score: sharesTool ? 2 : 1 });
    }
  }
  return out.sort((x, y) => y.score - x.score).slice(0, limit);
}
