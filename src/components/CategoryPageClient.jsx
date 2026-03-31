"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { getCategoryById } from "@/src/data/categories";
import { getToolSlug } from "@/src/lib/tools";

export default function CategoryPageClient({ category, tools }) {
  const cat = getCategoryById(category.id);

  // Group tools by subcategory
  const grouped = new Map();
  tools.forEach((t) => {
    if (!grouped.has(t.subcategory)) grouped.set(t.subcategory, []);
    grouped.get(t.subcategory).push(t);
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text-default)",
        fontFamily: "var(--font-body)",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px" }}>
        {/* Breadcrumb */}
        <nav
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--text-faint)",
            marginBottom: 24,
            display: "flex",
            gap: 6,
          }}
        >
          <Link href="/" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
            AIArsenal
          </Link>
          <span>›</span>
          <span style={{ color: cat?.color || "var(--text-muted)" }}>{category.label}</span>
        </nav>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 28 }}>{category.icon}</span>
              <h1
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 26,
                  fontWeight: 700,
                  color: cat?.color || "var(--text-strong)",
                  margin: 0,
                }}
              >
                {category.label}
              </h1>
            </div>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
              {category.desc}
            </p>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--text-faint)",
                marginTop: 8,
                display: "inline-block",
              }}
            >
              {tools.length} tools
            </span>
          </div>
        </motion.div>

        {/* Tools by subcategory */}
        {[...grouped.entries()].map(([subcategory, subTools]) => (
          <div key={subcategory} style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--text-faint)",
                  letterSpacing: 1.5,
                }}
              >
                {subcategory.toUpperCase()}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  padding: "1px 6px",
                  background: `${cat?.color || "#00f0ff"}15`,
                  color: cat?.color || "#00f0ff",
                  borderRadius: 3,
                }}
              >
                {subTools.length}
              </span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {subTools.map((tool, i) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                >
                  <Link
                    href={`/tools/${getToolSlug(tool)}`}
                    style={{
                      display: "block",
                      padding: "14px 18px",
                      background: "var(--surface-1)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      textDecoration: "none",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--text-strong)",
                          }}
                        >
                          {tool.name}
                          {tool.oss && (
                            <span
                              style={{
                                fontSize: 8,
                                padding: "1px 5px",
                                background: "rgba(0,255,136,0.1)",
                                color: "#00ff88",
                                borderRadius: 3,
                                marginLeft: 8,
                                fontWeight: 700,
                              }}
                            >
                              OSS
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 3 }}>
                          {tool.desc}
                        </div>
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          color: "var(--text-muted)",
                          flexShrink: 0,
                        }}
                      >
                        {tool.company}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-faint)",
                        marginTop: 6,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      Free: {tool.free}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {/* Back link */}
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--text-muted)",
            textDecoration: "none",
          }}
        >
          ← Back to all tools
        </Link>
      </div>
    </div>
  );
}
