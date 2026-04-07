import Link from "next/link";
import { BLOG_POSTS } from "@/src/data/blog-posts";
import { getCategoryById } from "@/src/data/categories";
import BlogIndexClient from "@/src/components/BlogIndexClient";

export const metadata = {
  title: "Blog — AI Tools Guides & Comparisons | AIArsenal",
  description:
    "In-depth guides, comparisons, and tutorials on free AI tools. Best coding assistants, ChatGPT alternatives, free GPU compute, and more.",
  openGraph: {
    title: "Blog — AI Tools Guides | AIArsenal",
    description:
      "In-depth guides and comparisons on free AI tools.",
    type: "website",
    url: "/blog",
  },
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogIndex() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "AIArsenal Blog",
    description: "In-depth guides, comparisons, and tutorials on free AI tools",
    url: "https://ai-arsenal-nu.vercel.app/blog",
    blogPost: BLOG_POSTS.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      author: { "@type": "Organization", name: post.author },
      url: `https://ai-arsenal-nu.vercel.app/blog/${post.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Server-rendered for SEO */}
      <div style={{ display: "none" }}>
        <h1>AIArsenal Blog — AI Tools Guides & Comparisons</h1>
        <ul>
          {BLOG_POSTS.map((post) => (
            <li key={post.slug}>
              <a href={`/blog/${post.slug}`}>{post.title}</a> — {post.excerpt}
            </li>
          ))}
        </ul>
      </div>
      <BlogIndexClient posts={BLOG_POSTS} />
    </>
  );
}
