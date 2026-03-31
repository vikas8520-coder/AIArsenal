import { notFound } from "next/navigation";
import { getToolBySlug, getAllToolSlugs, getToolUrl } from "@/src/lib/tools";
import { getCategoryById } from "@/src/data/categories";
import ToolPageClient from "@/src/components/ToolPageClient";

export async function generateStaticParams() {
  return getAllToolSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};

  const cat = getCategoryById(tool.category);
  return {
    title: `${tool.name} — Free AI Tool | AIArsenal`,
    description: tool.detail || tool.desc,
    openGraph: {
      title: `${tool.name} — Free AI Tool | AIArsenal`,
      description: tool.detail || tool.desc,
      type: "article",
      url: `/tools/${slug}`,
      siteName: "AIArsenal",
    },
    twitter: {
      card: "summary",
      title: `${tool.name} — Free AI Tool`,
      description: tool.desc,
    },
    alternates: {
      canonical: `/tools/${slug}`,
    },
  };
}

export default async function ToolPage({ params }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const cat = getCategoryById(tool.category);
  const toolUrl = getToolUrl(tool);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.detail || tool.desc,
    url: toolUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: tool.free,
    },
    author: { "@type": "Organization", name: tool.company },
    isAccessibleForFree: true,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "AIArsenal",
        item: "https://ai-arsenal-nu.vercel.app",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: tool.category,
        item: `https://ai-arsenal-nu.vercel.app/category/${tool.category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tool.name,
        item: `https://ai-arsenal-nu.vercel.app/tools/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {/* Server-rendered content for SEO crawlers */}
      <article
        style={{ display: "none" }}
        itemScope
        itemType="https://schema.org/SoftwareApplication"
      >
        <h1 itemProp="name">{tool.name}</h1>
        <p itemProp="description">{tool.detail || tool.desc}</p>
        <span itemProp="applicationCategory">AI Tool</span>
        <span>Free Tier: {tool.free}</span>
        <span>Company: {tool.company}</span>
        <span>Category: {tool.category}</span>
        {tool.oss && <span>Open Source: Yes</span>}
        {tool.quickStart && <span>Quick Start: {tool.quickStart}</span>}
        <a href={toolUrl} itemProp="url">
          Visit {tool.name}
        </a>
      </article>
      {/* Interactive client component */}
      <ToolPageClient tool={tool} />
    </>
  );
}
