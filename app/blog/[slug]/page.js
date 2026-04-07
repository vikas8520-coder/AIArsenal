import { notFound } from "next/navigation";
import { BLOG_POSTS, getBlogPostBySlug, getAllBlogSlugs } from "@/src/data/blog-posts";
import { TOOLS } from "@/src/data/tools";
import { getCategoryById } from "@/src/data/categories";
import { getToolSlug } from "@/src/lib/tools";
import BlogPostClient from "@/src/components/BlogPostClient";

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} | AIArsenal Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `/blog/${slug}`,
      siteName: "AIArsenal",
      publishedTime: post.date,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
    alternates: {
      canonical: `/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  // Resolve referenced tools
  const referencedTools = (post.toolIds || [])
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "AIArsenal",
      url: "https://ai-arsenal-nu.vercel.app",
    },
    url: `https://ai-arsenal-nu.vercel.app/blog/${slug}`,
    mainEntityOfPage: `https://ai-arsenal-nu.vercel.app/blog/${slug}`,
    articleSection: post.category,
    keywords: post.tags.join(", "),
    wordCount: post.sections.reduce((acc, s) => acc + (s.content || "").split(/\s+/).length, 0),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "AIArsenal", item: "https://ai-arsenal-nu.vercel.app" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://ai-arsenal-nu.vercel.app/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: `https://ai-arsenal-nu.vercel.app/blog/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {/* Server-rendered content for SEO */}
      <article style={{ display: "none" }}>
        <h1>{post.title}</h1>
        <p>{post.excerpt}</p>
        <time dateTime={post.date}>{post.date}</time>
        {post.sections.map((s, i) => (
          <section key={i}>
            <h2>{s.heading}</h2>
            <p>{s.content}</p>
            {s.toolId && (
              <a href={`/tools/${getToolSlug(TOOLS.find((t) => t.id === s.toolId))}`}>
                View {s.heading} details
              </a>
            )}
          </section>
        ))}
      </article>
      <BlogPostClient post={post} tools={referencedTools} />
    </>
  );
}
