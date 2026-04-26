"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { findSimilarTools } from "@/src/utils/similarTools";
import { TOOLS } from "@/src/data/tools";
import { getCategoryById } from "@/src/data/categories";
import { getAttributes } from "@/src/data/tool-attributes";
import { getToolSlug } from "@/src/lib/tools";
import { getTypicalPairs } from "@/src/lib/typicalPairs";
import { trackToolView } from "@/src/lib/visitorIntel";
import ToolVoteButtons from "@/src/components/ToolVoteButtons";

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
  const attrs = getAttributes(tool.id);
  const typicalPairs = useMemo(() => {
    return getTypicalPairs(tool.id, 4)
      .map((p) => TOOLS.find((t) => t.id === p.toolId))
      .filter(Boolean);
  }, [tool.id]);

  // Track this tool page view into visitor profile
  useEffect(() => {
    trackToolView(tool.id);
  }, [tool.id]);

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
              <div style={{ marginTop: 12 }}>
                <ToolVoteButtons toolId={tool.id} accent={cat?.color} />
              </div>
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

          {attrs && (attrs.bestFor?.length > 0 || attrs.notFor?.length > 0) && (
            <div
              style={{
                marginTop: 20,
                paddingTop: 16,
                borderTop: "1px solid var(--border)",
                display: "grid",
                gridTemplateColumns: attrs.notFor?.length ? "1fr 1fr" : "1fr",
                gap: 16,
              }}
            >
              {attrs.bestFor?.length > 0 && (
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: cat?.color || "#00f0ff",
                      letterSpacing: 1.5,
                      margin: "0 0 8px",
                    }}
                  >
                    BEST FOR
                  </h3>
                  <ul
                    style={{
                      margin: 0,
                      padding: 0,
                      listStyle: "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    {attrs.bestFor.map((b, i) => (
                      <li
                        key={i}
                        style={{
                          fontSize: 12.5,
                          lineHeight: 1.55,
                          color: "var(--text-default)",
                          display: "flex",
                          gap: 8,
                        }}
                      >
                        <span style={{ color: cat?.color || "#00f0ff", flexShrink: 0 }}>▸</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {attrs.notFor?.length > 0 && (
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--text-faint)",
                      letterSpacing: 1.5,
                      margin: "0 0 8px",
                    }}
                  >
                    NOT FOR
                  </h3>
                  <ul
                    style={{
                      margin: 0,
                      padding: 0,
                      listStyle: "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    {attrs.notFor.map((n, i) => (
                      <li
                        key={i}
                        style={{
                          fontSize: 12.5,
                          lineHeight: 1.55,
                          color: "var(--text-faint)",
                          display: "flex",
                          gap: 8,
                        }}
                      >
                        <span style={{ flexShrink: 0 }}>✕</span>
                        <span>{n}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Typically paired with — smart co-occurrence from curated stacks */}
        {typicalPairs.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: cat?.color || "#00f0ff",
                letterSpacing: 1.5,
                marginBottom: 4,
              }}
            >
              ◈ TYPICALLY PAIRED WITH
            </h2>
            <p
              style={{
                fontSize: 12,
                color: "var(--text-faint)",
                margin: "0 0 12px",
                lineHeight: 1.5,
              }}
            >
              Tools that appear alongside {tool.name} in AIArsenal's curated
              stacks.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {typicalPairs.map((t) => {
                const tCat = getCategoryById(t.category);
                const tColor = tCat?.color || "#00f0ff";
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
                      borderLeft: `3px solid ${tColor}`,
                      borderRadius: 10,
                      textDecoration: "none",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--text-strong)",
                        }}
                      >
                        {t.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11.5,
                          color: "var(--text-secondary)",
                          marginTop: 2,
                          lineHeight: 1.4,
                        }}
                      >
                        {t.desc}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 9,
                        fontFamily: "var(--font-mono)",
                        color: tColor,
                        letterSpacing: 1,
                        flexShrink: 0,
                      }}
                    >
                      {tCat?.label || t.category}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

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
