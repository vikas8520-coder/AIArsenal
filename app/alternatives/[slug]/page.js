import { notFound } from "next/navigation";
import { TOOLS } from "@/src/data/tools";
import { getCategoryById } from "@/src/data/categories";
import { getToolBySlug, getAllToolSlugs, getToolSlug, getToolUrl } from "@/src/lib/tools";
import { findSimilarTools } from "@/src/utils/similarTools";
import AlternativesPageClient from "@/src/components/AlternativesPageClient";

export async function generateStaticParams() {
  return getAllToolSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};

  const altCount = findSimilarTools(tool.id, 10).length;
  const cat = getCategoryById(tool.category);

  return {
    title: `Best ${altCount} Alternatives to ${tool.name} (2026) | AIArsenal`,
    description: `Looking for alternatives to ${tool.name}? Compare ${altCount} similar ${tool.category.toLowerCase()} tools with free tiers. ${tool.desc}`,
    openGraph: {
      title: `Best Alternatives to ${tool.name} | AIArsenal`,
      description: `${altCount} free alternatives to ${tool.name} — compared side by side.`,
      type: "article",
      url: `/alternatives/${slug}`,
      siteName: "AIArsenal",
    },
    twitter: {
      card: "summary",
      title: `Alternatives to ${tool.name}`,
      description: `${altCount} free alternatives to ${tool.name}`,
    },
    alternates: {
      canonical: `/alternatives/${slug}`,
    },
  };
}

export default async function AlternativesPage({ params }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const cat = getCategoryById(tool.category);
  const similar = findSimilarTools(tool.id, 10);
  const alternatives = similar
    .map(({ id, score }) => ({
      tool: TOOLS.find((t) => t.id === id),
      score,
    }))
    .filter((r) => r.tool);

  const toolUrl = getToolUrl(tool);

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Best Alternatives to ${tool.name}`,
    description: `${alternatives.length} similar tools to ${tool.name} with free tiers`,
    url: `https://ai-arsenal-nu.vercel.app/alternatives/${slug}`,
    numberOfItems: alternatives.length,
    itemListElement: alternatives.map((alt, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "SoftwareApplication",
        name: alt.tool.name,
        description: alt.tool.desc,
        url: `https://ai-arsenal-nu.vercel.app/tools/${getToolSlug(alt.tool)}`,
        applicationCategory: "DeveloperApplication",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          description: alt.tool.free,
        },
      },
    })),
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
        name: `Alternatives to ${tool.name}`,
        item: `https://ai-arsenal-nu.vercel.app/alternatives/${slug}`,
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
      <div style={{ display: "none" }}>
        <h1>Best Alternatives to {tool.name}</h1>
        <p>
          {tool.desc}. Compare {alternatives.length} similar free AI tools.
        </p>
        <ol>
          {alternatives.map((alt) => (
            <li key={alt.tool.id}>
              <a href={`/tools/${getToolSlug(alt.tool)}`}>
                {alt.tool.name}
              </a>{" "}
              — {alt.tool.desc} (Free: {alt.tool.free})
            </li>
          ))}
        </ol>
        <p>
          <a href={`/tools/${slug}`}>View {tool.name} details</a>
        </p>
      </div>
      <AlternativesPageClient tool={tool} alternatives={alternatives} />
    </>
  );
}
