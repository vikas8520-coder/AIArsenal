import { notFound } from "next/navigation";
import ComparePageClient from "../../../src/components/ComparePageClient";
import {
  getAllCompareSlugs,
  getComparisonBySlug,
  getRelatedComparisons,
} from "../../../src/lib/compare";

const BASE_URL = "https://ai-arsenal-nu.vercel.app";

export function generateStaticParams() {
  return getAllCompareSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const pair = getComparisonBySlug(slug);
  if (!pair) {
    return { title: "Comparison not found — AIArsenal" };
  }
  const title = `${pair.toolA.name} vs ${pair.toolB.name} — 2026 Comparison | AIArsenal`;
  const description = `${pair.toolA.name} vs ${pair.toolB.name}: free tiers, privacy, features side-by-side. ${pair.toolA.desc} vs ${pair.toolB.desc}. Updated for 2026.`;
  const url = `${BASE_URL}/compare/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ComparePage({ params }) {
  const { slug } = await params;
  const pair = getComparisonBySlug(slug);
  if (!pair) notFound();

  const related = getRelatedComparisons(slug, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${pair.toolA.name} vs ${pair.toolB.name} — 2026 Comparison`,
    description: `Side-by-side comparison of ${pair.toolA.name} and ${pair.toolB.name}: free tiers, privacy, features, and use cases.`,
    author: { "@type": "Organization", name: "AIArsenal" },
    publisher: {
      "@type": "Organization",
      name: "AIArsenal",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo-192.png`,
      },
    },
    datePublished: "2026-04-22",
    dateModified: new Date().toISOString().slice(0, 10),
    mainEntityOfPage: `${BASE_URL}/compare/${slug}`,
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "AIArsenal", item: BASE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Compare",
        item: `${BASE_URL}/compare`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${pair.toolA.name} vs ${pair.toolB.name}`,
        item: `${BASE_URL}/compare/${slug}`,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <ComparePageClient
        toolA={pair.toolA}
        toolB={pair.toolB}
        related={related}
      />
    </>
  );
}
