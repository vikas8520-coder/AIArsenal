"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { getCategoryById } from "@/src/data/categories";

const bounceEase = [0.6, 0.5, 0, 1.4];

export default function BlogIndexClient({ posts }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text-default)",
        fontFamily: "var(--font-body)",
      }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 20px" }}>
        {/* Header */}
        <nav style={{
          fontFamily: "var(--font-mono)", fontSize: 11,
          color: "var(--text-faint)", marginBottom: 32,
        }}>
          <Link href="/" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
            AIArsenal
          </Link>
          <span> › </span>
          <span style={{ color: "var(--text-muted)" }}>Blog</span>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: bounceEase }}
        >
          <h1 style={{
            fontFamily: "var(--font-mono)", fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: 800, color: "var(--text-strong)",
            margin: "0 0 8px", letterSpacing: -1,
          }}>
            Blog
          </h1>
          <p style={{
            fontSize: 16, color: "var(--text-secondary)",
            margin: "0 0 40px", lineHeight: 1.6,
          }}>
            In-depth guides, comparisons, and tutorials on free AI tools.
          </p>
        </motion.div>

        {/* Post list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {posts.map((post, i) => {
            const cat = getCategoryById(post.category);
            return (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: bounceEase }}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  style={{
                    display: "block",
                    padding: "24px 24px",
                    background: "rgba(255,255,255,0.025)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 16,
                    textDecoration: "none",
                    transition: "border-color 0.3s, transform 0.2s, box-shadow 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${cat?.color || "#00f0ff"}30`;
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = `0 12px 40px ${cat?.color || "#00f0ff"}08`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 9,
                      color: cat?.color || "#00f0ff",
                      background: `${cat?.color || "#00f0ff"}10`,
                      border: `1px solid ${cat?.color || "#00f0ff"}18`,
                      borderRadius: 6, padding: "3px 8px",
                      letterSpacing: 0.5,
                    }}>
                      {post.category}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 10,
                      color: "var(--text-faint)",
                    }}>
                      {post.date} · {post.readTime} min read
                    </span>
                  </div>

                  <h2 style={{
                    fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700,
                    color: "var(--text-strong)", margin: "0 0 8px",
                    lineHeight: 1.3,
                  }}>
                    {post.title}
                  </h2>

                  <p style={{
                    fontSize: 14, color: "var(--text-muted)",
                    margin: 0, lineHeight: 1.55,
                  }}>
                    {post.excerpt}
                  </p>

                  <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                    {post.tags.slice(0, 4).map((tag) => (
                      <span key={tag} style={{
                        fontFamily: "var(--font-mono)", fontSize: 9,
                        color: "var(--text-faint)",
                        background: "var(--surface-1)",
                        border: "1px solid var(--border)",
                        borderRadius: 4, padding: "2px 6px",
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Back link */}
        <div style={{ marginTop: 40 }}>
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-mono)", fontSize: 12,
              color: "var(--text-muted)", textDecoration: "none",
            }}
          >
            ← Back to all tools
          </Link>
        </div>
      </div>
    </div>
  );
}
