import { notFound } from "next/navigation";
import { TOOLS } from "@/src/data/tools";
import { CATEGORIES } from "@/src/data/categories";
import { getCategoryBySlug, getAllCategorySlugs, getCategorySlug, getToolSlug } from "@/src/lib/tools";
import CategoryPageClient from "@/src/components/CategoryPageClient";

export async function generateStaticParams() {
  return getAllCategorySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) return {};

  const toolCount = TOOLS.filter((t) => t.category === cat.id).length;
  return {
    title: `${cat.label} — ${toolCount} Free AI Tools | AIArsenal`,
    description: `${cat.desc} Browse ${toolCount} curated free AI tools in the ${cat.label} category.`,
    openGraph: {
      title: `${cat.label} — Free AI Tools | AIArsenal`,
      description: cat.desc,
      type: "website",
      url: `/category/${slug}`,
    },
    alternates: {
      canonical: `/category/${slug}`,
    },
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) notFound();

  const tools = TOOLS.filter((t) => t.category === cat.id);

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
        name: cat.label,
        item: `https://ai-arsenal-nu.vercel.app/category/${slug}`,
      },
    ],
  };

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${cat.label} — Free AI Tools`,
    description: cat.desc,
    url: `https://ai-arsenal-nu.vercel.app/category/${slug}`,
    numberOfItems: tools.length,
    hasPart: tools.slice(0, 20).map((tool) => ({
      "@type": "SoftwareApplication",
      name: tool.name,
      description: tool.desc,
      url: `https://ai-arsenal-nu.vercel.app/tools/${getToolSlug(tool)}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      {/* Server-rendered list for SEO */}
      <div style={{ display: "none" }}>
        <h1>{cat.label} — Free AI Tools</h1>
        <p>{cat.desc}</p>
        <ul>
          {tools.map((tool) => (
            <li key={tool.id}>
              <a href={`/tools/${getToolSlug(tool)}`}>{tool.name}</a> — {tool.desc}
            </li>
          ))}
        </ul>
      </div>
      <CategoryPageClient category={cat} tools={tools} />
    </>
  );
}
