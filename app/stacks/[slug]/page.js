import { notFound } from "next/navigation";
import StackPageClient from "../../../src/components/StackPageClient";
import {
  STACKS,
  getStackBySlug,
  getAllStackSlugs,
} from "../../../src/data/stacks";
import { TOOLS } from "../../../src/data/tools";

const BASE_URL = "https://ai-arsenal-nu.vercel.app";

export function generateStaticParams() {
  return getAllStackSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const stack = getStackBySlug(params.slug);
  if (!stack) return { title: "Stack not found — AIArsenal" };
  const url = `${BASE_URL}/stacks/${params.slug}`;
  return {
    title: `${stack.title} — AI Stack Recipe | AIArsenal`,
    description: `${stack.hook} ${stack.roles.length} tools · ${stack.budget} · ${stack.difficulty}.`,
    alternates: { canonical: url },
    openGraph: {
      title: stack.title,
      description: stack.hook,
      url,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: stack.title,
      description: stack.hook,
    },
  };
}

export default function StackPage({ params }) {
  const stack = getStackBySlug(params.slug);
  if (!stack) notFound();

  const related = (stack.relatedSlugs || [])
    .map((s) => STACKS.find((x) => x.slug === s))
    .filter(Boolean);

  // HowTo schema
  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: stack.title,
    description: stack.hook,
    totalTime: stack.timeToShip,
    estimatedCost: {
      "@type": "MonetaryAmount",
      currency: "USD",
      value: stack.budget,
    },
    tool: stack.roles
      .map((r) => TOOLS.find((t) => t.id === r.toolId))
      .filter(Boolean)
      .map((t) => ({ "@type": "HowToTool", name: t.name })),
    step: stack.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: `Step ${i + 1}`,
      text: s,
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "AIArsenal", item: BASE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Stacks",
        item: `${BASE_URL}/stacks`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: stack.title,
        item: `${BASE_URL}/stacks/${params.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <StackPageClient stack={stack} related={related} />
    </>
  );
}
