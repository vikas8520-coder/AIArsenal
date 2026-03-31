"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getCategoryById } from "@/src/data/categories";
import { getToolSlug, getToolUrl } from "@/src/lib/tools";

const springSmooth = { type: "spring", stiffness: 120, damping: 20 };

export default function AlternativesPageClient({ tool, alternatives }) {
  const cat = getCategoryById(tool.category);
  const toolUrl = getToolUrl(tool);

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
          <span style={{ color: "var(--text-muted)" }}>Alternatives</span>
          <span>›</span>
          <span style={{ color: cat?.color || "var(--text-muted)" }}>{tool.name}</span>
        </nav>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springSmooth}
        >
          <h1
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "clamp(24px, 4vw, 36px)",
              fontWeight: 700,
              color: "var(--text-strong)",
              margin: "0 0 8px",
              lineHeight: 1.2,
            }}
          >
            Best Alternatives to{" "}
            <span style={{ color: cat?.color || "#00f0ff" }}>{tool.name}</span>
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "var(--text-secondary)",
              margin: "0 0 12px",
              lineHeight: 1.6,
            }}
          >
            {tool.desc}. Here are {alternatives.length} similar tools you can use
            {tool.oss ? " — including open-source options" : ""}.
          </p>

          {/* Source tool summary */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 18px",
              background: "var(--surface-1)",
              border: `1px solid ${cat?.color || "var(--border)"}25`,
              borderRadius: 12,
              marginBottom: 32,
            }}
          >
            <span style={{ fontSize: 20, color: cat?.color }}>{cat?.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--text-strong)" }}>
                {tool.name}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
                {tool.company} · {tool.category} · {tool.free}
              </div>
            </div>
            <a
              href={tool.affiliate || toolUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 600,
                color: cat?.color || "#00f0ff",
                textDecoration: "none",
                padding: "6px 14px",
                border: `1px solid ${cat?.color || "#00f0ff"}30`,
                borderRadius: 8,
                flexShrink: 0,
              }}
            >
              Visit →
            </a>
          </div>
        </motion.div>

        {/* Alternatives list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {alternatives.map((alt, i) => {
            const altCat = getCategoryById(alt.tool.category);
            const altUrl = getToolUrl(alt.tool);
            const matchPercent = Math.round(alt.score * 100);

            return (
              <motion.div
                key={alt.tool.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springSmooth, delay: i * 0.05 }}
                style={{
                  padding: "18px 20px",
                  background: "var(--surface-1)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  transition: "border-color 0.2s, background 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  {/* Rank */}
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      fontWeight: 700,
                      color: i < 3 ? (altCat?.color || "#00f0ff") : "var(--text-faint)",
                      width: 24,
                      textAlign: "center",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    #{i + 1}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <Link
                        href={`/tools/${getToolSlug(alt.tool)}`}
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 14,
                          fontWeight: 700,
                          color: "var(--text-strong)",
                          textDecoration: "none",
                        }}
                      >
                        {alt.tool.name}
                      </Link>
                      {alt.tool.oss && (
                        <span
                          style={{
                            fontSize: 8,
                            padding: "1px 5px",
                            background: "rgba(0,255,136,0.1)",
                            color: "#00ff88",
                            borderRadius: 3,
                            fontFamily: "var(--font-mono)",
                            fontWeight: 700,
                          }}
                        >
                          OPEN SOURCE
                        </span>
                      )}
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 9,
                          padding: "2px 7px",
                          background: `${altCat?.color || "#00f0ff"}10`,
                          color: altCat?.color || "#00f0ff",
                          borderRadius: 4,
                        }}
                      >
                        {matchPercent}% match
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--text-secondary)",
                        margin: "0 0 8px",
                        lineHeight: 1.5,
                      }}
                    >
                      {alt.tool.desc}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          color: "var(--text-faint)",
                        }}
                      >
                        {alt.tool.company}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          color: "var(--text-faint)",
                        }}
                      >
                        Free: {alt.tool.free}
                      </span>
                    </div>
                  </div>

                  {/* Visit button */}
                  <a
                    href={alt.tool.affiliate || altUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      fontWeight: 600,
                      color: altCat?.color || "#00f0ff",
                      textDecoration: "none",
                      padding: "6px 12px",
                      border: `1px solid ${altCat?.color || "#00f0ff"}25`,
                      borderRadius: 7,
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    Visit →
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom links */}
        <div style={{ marginTop: 32, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Link
            href={`/tools/${getToolSlug(tool)}`}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: cat?.color || "var(--text-muted)",
              textDecoration: "none",
            }}
          >
            View {tool.name} details →
          </Link>
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--text-muted)",
              textDecoration: "none",
            }}
          >
            ← Browse all tools
          </Link>
        </div>
      </div>
    </div>
  );
}
