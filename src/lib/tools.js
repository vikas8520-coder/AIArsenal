import { TOOLS } from "../data/tools";
import { CATEGORIES } from "../data/categories";
import { slugify } from "../utils/slugify";

// Pre-build slug maps (runs once at build time for SSG)
const toolSlugMap = new Map();
const toolIdToSlugMap = new Map();

TOOLS.forEach((t) => {
  const slug = slugify(t.name);
  if (toolSlugMap.has(slug)) {
    // Handle collision by appending tool id
    const collisionSlug = `${slug}-${t.id}`;
    toolSlugMap.set(collisionSlug, t);
    toolIdToSlugMap.set(t.id, collisionSlug);
  } else {
    toolSlugMap.set(slug, t);
    toolIdToSlugMap.set(t.id, slug);
  }
});

export function getToolBySlug(slug) {
  return toolSlugMap.get(slug) || null;
}

export function getAllToolSlugs() {
  return [...toolSlugMap.keys()];
}

export function getToolSlug(tool) {
  return toolIdToSlugMap.get(tool.id) || slugify(tool.name);
}

export function getCategorySlug(cat) {
  return slugify(cat.id === "all" ? "all-tools" : cat.id);
}

export function getCategoryBySlug(slug) {
  return CATEGORIES.find((c) => getCategorySlug(c) === slug) || null;
}

export function getAllCategorySlugs() {
  return CATEGORIES.filter((c) => c.id !== "all").map((c) => getCategorySlug(c));
}

export function getToolUrl(tool) {
  const url = tool.url || "";
  return url.startsWith("http") ? url : `https://${url}`;
}
