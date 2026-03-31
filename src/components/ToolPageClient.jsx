"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { findSimilarTools } from "@/src/utils/similarTools";
import { TOOLS } from "@/src/data/tools";
import { getCategoryById } from "@/src/data/categories";
import { getToolSlug } from "@/src/lib/tools";

export default function ToolPageClient({ tool }) {
  const [bookmarked, setBookmarked] = useState(() => {
    try {
      const raw = localStorage.getItem("aiarsenal-bookmarks");
      return raw ? JSON.parse(raw).includes(tool.id) : false;
    } catch {
      return false;
    }
  });

  const toggleBookmark = () => {
    try {
      const raw = localStorage.getItem("aiarsenal-bookmarks");
      const set = new Set(raw ? JSON.parse(raw) : []);
      if (set.has(tool.id)) set.delete(tool.id);
      else set.add(tool.id);
      localStorage.setItem("aiarsenal-bookmarks", JSON.stringify([...set]));
      setBookmarked(set.has(tool.id));
    } catch {}
  };

  const similar = useMemo(() => {
    const results = findSimilarTools(tool.id, 5);
    return results
      .map(({ id, score }) => ({
        tool: TOOLS.find((t) => t.id === id),
        score,
      }))
      .filter((r) => r.tool);
  }, [tool.id]);

  const cat = getCategoryById(tool.category);
  const toolUrl = tool.url?.startsWith("http") ? tool.url : `https://${tool.url}`;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text-default)",
        fontFamily: "var(--font-body)",
      }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
        {/* Breadcrumb */}
        <nav
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--text-faint)",
            marginBottom: 24,
            display: "flex",
            gap: 6,
            alignItems: "center",
          }}
        >
          <Link href="/" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
            AIArsenal
          </Link>
          <span>›</span>
          <Link
            href={`/category/${encodeURIComponent(tool.category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""))}`}
            style={{ color: cat?.color || "var(--text-secondary)", textDecoration: "none" }}
          >
            {tool.category}
          </Link>
          <span>›</span>
          <span style={{ color: "var(--text-muted)" }}>{tool.name}</span>
        </nav>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
            <div style={{ flex: 1 }}>
              <h1
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 28,
                  fontWeight: 700,
                  color: "var(--text-strong)",
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {tool.name}
              </h1>
              <p
                style={{
                  fontSize: 15,
                  color: "var(--text-secondary)",
                  margin: "8px 0 0",
                  lineHeight: 1.5,
                }}
              >
                {tool.desc}
              </p>
            </div>
            <button
              onClick={toggleBookmark}
              style={{
                background: bookmarked ? "rgba(255,215,0,0.12)" : "var(--surface-1)",
                border: `1px solid ${bookmarked ? "rgba(255,215,0,0.3)" : "var(--border)"}`,
                borderRadius: 8,
                padding: "8px 12px",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: bookmarked ? "#ffd700" : "var(--text-muted)",
              }}
            >
              {bookmarked ? "★ Saved" : "☆ Save"}
            </button>
          </div>

          {/* Visit button */}
          <a
            href={tool.affiliate || toolUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              fontWeight: 600,
              color: "#0a0a0a",
              background: cat?.color || "#00f0ff",
              padding: "10px 20px",
              borderRadius: 8,
              textDecoration: "none",
              marginBottom: 32,
            }}
          >
            Visit {tool.name} →
          </a>
        </motion.div>

        {/* Details */}
        <div
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: 24,
            marginBottom: 24,
          }}
        >
          {tool.detail && (
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-default)", margin: "0 0 20px" }}>
              {tool.detail}
            </p>
          )}

          <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "auto 1fr", gap: "10px 20px" }}>
            <dt style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-faint)", letterSpacing: 1 }}>FREE TIER</dt>
            <dd style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>{tool.free}</dd>

            <dt style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-faint)", letterSpacing: 1 }}>COMPANY</dt>
            <dd style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>{tool.company}</dd>

            <dt style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-faint)", letterSpacing: 1 }}>CATEGORY</dt>
            <dd style={{ margin: 0, fontSize: 13, color: cat?.color }}>{tool.category} › {tool.subcategory}</dd>

            {tool.oss && (
              <>
                <dt style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-faint)", letterSpacing: 1 }}>OPEN SOURCE</dt>
                <dd style={{ margin: 0, fontSize: 13, color: "#00ff88" }}>Yes</dd>
              </>
            )}

            {tool.privacy && (
              <>
                <dt style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-faint)", letterSpacing: 1 }}>PRIVACY</dt>
                <dd style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>{tool.privacy}</dd>
              </>
            )}

            {tool.tags && tool.tags.length > 0 && (
              <>
                <dt style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-faint)", letterSpacing: 1 }}>TAGS</dt>
                <dd style={{ margin: 0, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {tool.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        padding: "2px 8px",
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                        borderRadius: 4,
                        color: "var(--text-muted)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </dd>
              </>
            )}
          </dl>

          {tool.quickStart && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
              <h3 style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-faint)", letterSpacing: 1, margin: "0 0 8px" }}>
                QUICK START
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
                {tool.quickStart}
              </p>
            </div>
          )}
        </div>

        {/* Similar Tools */}
        {similar.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--text-faint)",
                letterSpacing: 1.5,
                marginBottom: 12,
              }}
            >
              SIMILAR TOOLS
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {similar.map(({ tool: t, score }) => {
                const tCat = getCategoryById(t.category);
                return (
                  <Link
                    key={t.id}
                    href={`/tools/${getToolSlug(t)}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 16px",
                      background: "var(--surface-1)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      textDecoration: "none",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "var(--text-strong)" }}>
                        {t.name}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>
                        {t.desc}
                      </div>
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 9,
                        padding: "2px 6px",
                        background: `${tCat?.color || "#00f0ff"}15`,
                        color: tCat?.color || "#00f0ff",
                        borderRadius: 3,
                      }}
                    >
                      {Math.round(score * 100)}% match
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Back to directory */}
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
