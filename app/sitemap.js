import { TOOLS } from "@/src/data/tools";
import { CATEGORIES } from "@/src/data/categories";
import { BLOG_POSTS } from "@/src/data/blog-posts";
import { getAllToolSlugs, getToolBySlug, getCategorySlug } from "@/src/lib/tools";
import { getAllCompareSlugs } from "@/src/lib/compare";
import { getAllStackSlugs } from "@/src/data/stacks";
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

  const alternativesUrls = toolSlugs.map((slug) => ({
    url: `${BASE_URL}/alternatives/${slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const blogUrls = [
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...BLOG_POSTS.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.date,
      changeFrequency: "monthly",
      priority: 0.8,
    })),
  ];

  const staticUrls = [
    {
      url: `${BASE_URL}/ask`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/stacks`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/build`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/quiz`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/scaffold`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/compare/multi`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/migrate`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/get-featured`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const stackUrls = getAllStackSlugs().map((slug) => ({
    url: `${BASE_URL}/stacks/${slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const compareUrls = getAllCompareSlugs().map((slug) => ({
    url: `${BASE_URL}/compare/${slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...staticUrls,
    ...blogUrls,
    ...stackUrls,
    ...categoryUrls,
    ...toolUrls,
    ...alternativesUrls,
    ...compareUrls,
  ];
}
