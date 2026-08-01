"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { TOOLS } from "../data/tools";
import { CATEGORIES, getCategoryById } from "../data/categories";
import { detectStackGaps } from "../data/stack-patterns";
import { getToolSlug } from "../lib/tools";
import useBookmarks from "../hooks/useBookmarks";

const ACCENT = "#00f0ff";

export default function RecentStacksClient() {
  const { isBookmarked, toggle: toggleBookmark } = useBookmarks();
  const [filter, setFilter] = useState("all");

  // Recent tools: top 24 by dateAdded
  const recentTools = useMemo(() => {
    return [...TOOLS]
      .sort((a, b) => (b.dateAdded || "").localeCompare(a.dateAdded || ""))
      .slice(0, 24);
  }, []);

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map();
    for (const tool of recentTools) {
      if (!map.has(tool.category)) map.set(tool.category, []);
      map.get(tool.category).push(tool);
    }
    const order = CATEGORIES.map((c) => c.id);
    return new Map(
      [...map.entries()].sort(
        (a, b) => order.indexOf(a[0]) - order.indexOf(b[0])
      )
    );
  }, [recentTools]);

  const categories = [...grouped.keys()];
  const visibleCategories = filter === "all" ? categories : [filter];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text-default)",
        padding: "40px 20px 60px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--text-muted)",
              textDecoration: "none",
              marginBottom: 16,
              display: "inline-block",
            }}
          >
            ← Back to directory
          </Link>
          <h1
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "clamp(24px, 4vw, 32px)",
              fontWeight: 700,
              color: "var(--text-strong)",
              margin: "0 0 8px",
              letterSpacing: -0.5,
            }}
          >
            Recent Stacks
          </h1>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              color: "var(--text-secondary)",
              margin: 0,
              maxWidth: 600,
              lineHeight: 1.6,
            }}
          >
            Recently added tools grouped by category with automatic
            compatibility checks. See which roles are filled, what's missing,
            and stack them in one click.
          </p>
        </div>

        {/* Category filter */}
        {categories.length > 1 && (
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              marginBottom: 24,
            }}
          >
            <button
              onClick={() => setFilter("all")}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 0.5,
                padding: "6px 12px",
                borderRadius: 6,
                cursor: "pointer",
                background:
                  filter === "all" ? `${ACCENT}15` : "var(--surface-1)",
                color: filter === "all" ? ACCENT : "var(--text-muted)",
                border:
                  filter === "all"
                    ? `1px solid ${ACCENT}35`
                    : "1px solid var(--border)",
              }}
            >
              ALL
            </button>
            {categories.map((catId) => {
              const cat = getCategoryById(catId);
              const color = cat?.color || ACCENT;
              const active = filter === catId;
              return (
                <button
                  key={catId}
                  onClick={() => setFilter(catId)}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    padding: "6px 12px",
                    borderRadius: 6,
                    cursor: "pointer",
                    background: active ? `${color}15` : "var(--surface-1)",
                    color: active ? color : "var(--text-muted)",
                    border: active
                      ? `1px solid ${color}35`
                      : "1px solid var(--border)",
                  }}
                >
                  {cat?.label.toUpperCase()}
                </button>
              );
            })}
          </div>
        )}

        {/* Stack cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: 16,
          }}
        >
          {visibleCategories.map((catId, idx) => {
            const groupTools = grouped.get(catId) || [];
            const cat = getCategoryById(catId);
            const accent = cat?.color || ACCENT;
            const gaps =
              groupTools.length >= 2
                ? detectStackGaps(groupTools.map((t) => t.id), TOOLS)
                : null;
            const complete = gaps && gaps.missing.length === 0;
            const allBookmarked = groupTools.every((t) => isBookmarked(t.id));

            const handleStackAll = () => {
              groupTools.forEach((t) => {
                if (!isBookmarked(t.id)) toggleBookmark(t.id);
              });
            };

            return (
              <motion.div
                key={catId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                style={{
                  background: "var(--surface-1)",
                  border: "1px solid var(--border)",
                  borderLeft: `3px solid ${accent}`,
                  borderRadius: 12,
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Card header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 14,
                    paddingBottom: 12,
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 13,
                        fontWeight: 700,
                        color: accent,
                        letterSpacing: 0.5,
                      }}
                    >
                      {cat?.label}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color: "var(--text-faint)",
                        marginTop: 2,
                      }}
                    >
                      {groupTools.length} tool{groupTools.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  {gaps ? (
                    <div
                      style={{
                        textAlign: "right",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          fontWeight: 700,
                          color: complete ? "var(--success-color)" : "var(--badge-sponsored-color)",
                        }}
                      >
                        {complete
                          ? "✓ Complete"
                          : `${gaps.filledCount}/${gaps.totalCount} roles`}
                      </div>
                      <div
                        style={{
                          fontSize: 9,
                          color: "var(--text-faint)",
                          fontFamily: "var(--font-mono)",
                          marginTop: 2,
                        }}
                      >
                        {gaps.pattern.label}
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 9,
                        color: "var(--text-faint)",
                      }}
                    >
                      Add 2+ to check
                    </div>
                  )}
                </div>

                {/* Tool list */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    flex: 1,
                  }}
                >
                  {groupTools.map((tool) => {
                    const bookmarked = isBookmarked(tool.id);
                    return (
                      <div
                        key={tool.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 12px",
                          background: "var(--surface-2)",
                          borderRadius: 8,
                          border: "1px solid var(--border)",
                        }}
                      >
                        <Link
                          href={`/tools/${getToolSlug(tool)}`}
                          style={{
                            flex: 1,
                            minWidth: 0,
                            textDecoration: "none",
                          }}
                        >
                          <div
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 12,
                              fontWeight: 600,
                              color: "var(--text-strong)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {tool.name}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              color: "var(--text-faint)",
                              marginTop: 2,
                              lineHeight: 1.4,
                              display: "-webkit-box",
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {tool.desc}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: 4,
                              marginTop: 4,
                              flexWrap: "wrap",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 8,
                                fontFamily: "var(--font-mono)",
                                padding: "1px 5px",
                                background: `${accent}12`,
                                color: accent,
                                borderRadius: 3,
                              }}
                            >
                              {tool.subcategory}
                            </span>
                            {tool.oss && (
                              <span
                                style={{
                                  fontSize: 8,
                                  fontFamily: "var(--font-mono)",
                                  padding: "1px 5px",
                                  background: "rgba(16,185,129,0.12)",
                                  color: "#10b981",
                                  borderRadius: 3,
                                }}
                              >
                                OSS
                              </span>
                            )}
                          </div>
                        </Link>
                        <button
                          onClick={() => toggleBookmark(tool.id)}
                          aria-label={
                            bookmarked ? "Remove from stack" : "Add to stack"
                          }
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 16,
                            color: bookmarked ? "#eab308" : "var(--text-faint)",
                            padding: "4px 6px",
                            lineHeight: 1,
                            flexShrink: 0,
                          }}
                        >
                          {bookmarked ? "★" : "☆"}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Missing roles */}
                {gaps && gaps.missing.length > 0 && (
                  <div
                    style={{
                      marginTop: 14,
                      padding: 12,
                      background: "rgba(234,179,8,0.06)",
                      border: "1px solid rgba(234,179,8,0.2)",
                      borderRadius: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 9,
                        fontFamily: "var(--font-mono)",
                        color: "#eab308",
                        letterSpacing: 1,
                        marginBottom: 8,
                        fontWeight: 600,
                      }}
                    >
                      MISSING ROLES
                    </div>
                    {gaps.missing.map((role) => (
                      <div
                        key={role.key}
                        style={{ marginBottom: 8 }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--text-secondary)",
                            fontFamily: "var(--font-mono)",
                            marginBottom: 4,
                          }}
                        >
                          {role.label}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: 4,
                            flexWrap: "wrap",
                          }}
                        >
                          {role.suggestIds.map((id) => {
                            const suggested = TOOLS.find((t) => t.id === id);
                            if (!suggested) return null;
                            const sCat = getCategoryById(suggested.category);
                            const sColor = sCat?.color || ACCENT;
                            return (
                              <Link
                                key={id}
                                href={`/tools/${getToolSlug(suggested)}`}
                                style={{
                                  fontSize: 9,
                                  fontFamily: "var(--font-mono)",
                                  padding: "3px 8px",
                                  background: `${sColor}10`,
                                  color: sColor,
                                  borderRadius: 4,
                                  textDecoration: "none",
                                  border: `1px solid ${sColor}25`,
                                }}
                              >
                                + {suggested.name}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 14,
                  }}
                >
                  <button
                    onClick={handleStackAll}
                    disabled={allBookmarked}
                    style={{
                      flex: 1,
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: 0.5,
                      background: allBookmarked
                        ? "var(--surface-2)"
                        : `${accent}15`,
                      color: allBookmarked ? "var(--text-faint)" : accent,
                      border: allBookmarked
                        ? "1px solid var(--border)"
                        : `1px solid ${accent}35`,
                      borderRadius: 8,
                      padding: "9px 12px",
                      cursor: allBookmarked ? "default" : "pointer",
                    }}
                  >
                    {allBookmarked ? "✓ All in Stack" : "+ Stack all"}
                  </button>
                  <Link
                    href={`/category/${cat?.id || catId}`}
                    style={{
                      flex: 1,
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: 0.5,
                      background: "var(--surface-2)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: "9px 12px",
                      cursor: "pointer",
                      textAlign: "center",
                      textDecoration: "none",
                    }}
                  >
                    Explore category →
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty state */}
        {recentTools.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "var(--text-faint)",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
            }}
          >
            No recently added tools yet.
          </div>
        )}
      </div>
    </div>
  );
}
