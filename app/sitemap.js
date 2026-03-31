import { TOOLS } from "@/src/data/tools";
import { CATEGORIES } from "@/src/data/categories";
import { getAllToolSlugs, getToolBySlug, getCategorySlug } from "@/src/lib/tools";
import { slugify } from "@/src/utils/slugify";

const BASE_URL = "https://ai-arsenal-nu.vercel.app";

export default function sitemap() {
  const toolSlugs = getAllToolSlugs();

  const toolUrls = toolSlugs.map((slug) => {
    const tool = getToolBySlug(slug);
    return {
      url: `${BASE_URL}/tools/${slug}`,
      lastModified: tool?.dateAdded || "2025-12-01",
      changeFrequency: "weekly",
      priority: 0.8,
    };
  });

  const categoryUrls = CATEGORIES.filter((c) => c.id !== "all").map((cat) => ({
    url: `${BASE_URL}/category/${getCategorySlug(cat)}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...categoryUrls,
    ...toolUrls,
  ];
}
