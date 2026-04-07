"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { getCategoryById } from "@/src/data/categories";
import { TOOLS } from "@/src/data/tools";
import { getToolSlug } from "@/src/lib/tools";

const bounceEase = [0.6, 0.5, 0, 1.4];

export default function BlogPostClient({ post, tools }) {
  const cat = getCategoryById(post.category);
  const accent = cat?.color || "#00f0ff";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text-default)",
        fontFamily: "var(--font-body)",
      }}
    >
      <article style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px" }}>
        {/* Breadcrumb */}
        <nav style={{
          fontFamily: "var(--font-mono)", fontSize: 11,
          color: "var(--text-faint)", marginBottom: 32,
          display: "flex", gap: 6, alignItems: "center",
        }}>
          <Link href="/" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>AIArsenal</Link>
          <span>›</span>
          <Link href="/blog" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Blog</Link>
          <span>›</span>
          <span style={{ color: "var(--text-muted)" }}>{post.title}</span>
        </nav>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: bounceEase }}
          style={{ marginBottom: 40 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 10,
              color: accent, background: `${accent}10`,
              border: `1px solid ${accent}18`,
              borderRadius: 6, padding: "3px 10px",
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

          <h1 style={{
            fontFamily: "var(--font-mono)",
            fontSize: "clamp(26px, 5vw, 40px)",
            fontWeight: 800,
            color: "var(--text-strong)",
            margin: "0 0 12px",
            letterSpacing: -1, lineHeight: 1.15,
          }}>
            {post.title}
          </h1>

          <p style={{
            fontSize: 17, color: "var(--text-secondary)",
            margin: 0, lineHeight: 1.6,
          }}>
            {post.excerpt}
          </p>
        </motion.header>

        {/* Sections */}
        {post.sections.map((section, i) => {
          const sectionTool = section.toolId
            ? TOOLS.find((t) => t.id === section.toolId)
            : null;

          return (
            <motion.section
              key={i}
              initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: 0.05, ease: bounceEase }}
              style={{ marginBottom: 36 }}
            >
              <h2 style={{
                fontFamily: "var(--font-mono)",
                fontSize: 20, fontWeight: 700,
                color: "var(--text-strong)",
                margin: "0 0 12px", lineHeight: 1.3,
                borderLeft: sectionTool ? `3px solid ${accent}` : "none",
                paddingLeft: sectionTool ? 14 : 0,
              }}>
                {section.heading}
              </h2>

              {/* Content paragraphs */}
              {section.content.split("\n\n").map((para, j) => {
                // Handle markdown-style bold
                const parts = para.split(/\*\*(.*?)\*\*/g);
                // Handle markdown-style table
                if (para.startsWith("|")) {
                  const rows = para.split("\n").filter((r) => r.trim() && !r.match(/^\|[-\s|]+\|$/));
                  const headers = rows[0]?.split("|").filter(Boolean).map((h) => h.trim());
                  const data = rows.slice(1).map((r) => r.split("|").filter(Boolean).map((c) => c.trim()));

                  return (
                    <div key={j} style={{
                      overflowX: "auto", marginBottom: 16,
                      border: "1px solid var(--border)", borderRadius: 10,
                    }}>
                      <table style={{
                        width: "100%", borderCollapse: "collapse",
                        fontFamily: "var(--font-mono)", fontSize: 11,
                      }}>
                        <thead>
                          <tr>
                            {headers?.map((h, k) => (
                              <th key={k} style={{
                                padding: "8px 12px", textAlign: "left",
                                color: accent, fontWeight: 600,
                                borderBottom: "1px solid var(--border)",
                                background: "var(--surface-1)",
                              }}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {data.map((row, k) => (
                            <tr key={k}>
                              {row.map((cell, l) => (
                                <td key={l} style={{
                                  padding: "8px 12px",
                                  color: "var(--text-secondary)",
                                  borderBottom: k < data.length - 1 ? "1px solid var(--border)" : "none",
                                }}>
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }

                return (
                  <p key={j} style={{
                    fontSize: 15, color: "var(--text-default)",
                    margin: "0 0 14px", lineHeight: 1.7,
                  }}>
                    {parts.map((part, k) =>
                      k % 2 === 1 ? (
                        <strong key={k} style={{ color: "var(--text-strong)", fontWeight: 600 }}>
                          {part}
                        </strong>
                      ) : part
                    )}
                  </p>
                );
              })}

              {/* Tool card link */}
              {sectionTool && (
                <Link
                  href={`/tools/${getToolSlug(sectionTool)}`}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "12px 16px",
                    background: "rgba(255,255,255,0.025)",
                    border: `1px solid ${accent}15`,
                    borderRadius: 10,
                    textDecoration: "none",
                    transition: "border-color 0.2s, background 0.2s",
                    marginTop: 8,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${accent}30`;
                    e.currentTarget.style.background = `${accent}05`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${accent}15`;
                    e.currentTarget.style.background = "rgba(255,255,255,0.025)";
                  }}
                >
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600,
                    color: accent,
                  }}>
                    →
                  </span>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600,
                    color: "var(--text-strong)",
                  }}>
                    View {sectionTool.name}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 10,
                    color: "var(--text-faint)", marginLeft: "auto",
                  }}>
                    Free: {sectionTool.free.slice(0, 40)}{sectionTool.free.length > 40 ? "…" : ""}
                  </span>
                </Link>
              )}
            </motion.section>
          );
        })}

        {/* Referenced tools sidebar */}
        {tools.length > 0 && (
          <motion.aside
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{
              marginTop: 40, padding: "24px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border)",
              borderRadius: 16,
            }}
          >
            <h3 style={{
              fontFamily: "var(--font-mono)", fontSize: 11,
              color: "var(--text-faint)", letterSpacing: 2,
              margin: "0 0 14px",
            }}>
              TOOLS MENTIONED
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {tools.map((tool) => {
                const tCat = getCategoryById(tool.category);
                return (
                  <Link
                    key={tool.id}
                    href={`/tools/${getToolSlug(tool)}`}
                    style={{
                      fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600,
                      color: tCat?.color || "var(--text-secondary)",
                      background: `${tCat?.color || "#00f0ff"}08`,
                      border: `1px solid ${tCat?.color || "#00f0ff"}15`,
                      borderRadius: 8, padding: "5px 10px",
                      textDecoration: "none",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = `${tCat?.color || "#00f0ff"}15`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = `${tCat?.color || "#00f0ff"}08`; }}
                  >
                    {tool.name}
                  </Link>
                );
              })}
            </div>
          </motion.aside>
        )}

        {/* Navigation */}
        <div style={{
          marginTop: 40, display: "flex", gap: 16, flexWrap: "wrap",
        }}>
          <Link
            href="/blog"
            style={{
              fontFamily: "var(--font-mono)", fontSize: 12,
              color: accent, textDecoration: "none",
            }}
          >
            ← All posts
          </Link>
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-mono)", fontSize: 12,
              color: "var(--text-muted)", textDecoration: "none",
            }}
          >
            Browse all tools
          </Link>
        </div>
      </article>
    </div>
  );
}
