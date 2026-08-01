"use client";
import { useMemo } from "react";
import Link from "next/link";
import { CATEGORIES, getCategoryById } from "../data/categories";
import { TOOLS } from "../data/tools";
import { detectStackGaps } from "../data/stack-patterns";
import { getToolSlug } from "../lib/tools";

const ACCENT = "#eab308";

function StackStatus({ gaps, count }) {
  if (count < 2 || !gaps) {
    return (
      <span style={{ fontSize: 9, color: "var(--text-faint)", fontFamily: "monospace" }}>
        Need 2+ to stack-check
      </span>
    );
  }
  const complete = gaps.missing.length === 0;
  return (
    <span
      style={{
        fontSize: 9,
        color: complete ? "#00ff88" : ACCENT,
        fontFamily: "monospace",
      }}
    >
      {complete ? "Stack looks complete" : `${gaps.filledCount}/${gaps.totalCount} roles filled`}
    </span>
  );
}

export default function RecentStacks({
  tools,
  onExploreCategory,
  isBookmarked,
  onToggleBookmark,
}) {
  const grouped = useMemo(() => {
    const map = new Map();
    for (const tool of tools) {
      if (!map.has(tool.category)) map.set(tool.category, []);
      map.get(tool.category).push(tool);
    }
    const order = CATEGORIES.map((c) => c.id);
    return new Map(
      [...map.entries()].sort(
        (a, b) => order.indexOf(a[0]) - order.indexOf(b[0])
      )
    );
  }, [tools]);

  if (tools.length === 0) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 9,
            color: "#00f0ff",
            letterSpacing: 1.5,
            fontWeight: 600,
          }}
        >
          RECENT STACKS
        </span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 12,
        }}
      >
        {[...grouped.entries()].map(([catId, groupTools]) => {
          const cat = getCategoryById(catId);
          const accent = cat?.color || "#00f0ff";
          const gaps =
            groupTools.length >= 2
              ? detectStackGaps(groupTools.map((t) => t.id), TOOLS)
              : null;
          const allBookmarked = groupTools.every((t) => isBookmarked(t.id));

          const handleStackAll = () => {
            groupTools.forEach((t) => {
              if (!isBookmarked(t.id)) onToggleBookmark(t.id);
            });
          };

          return (
            <div
              key={catId}
              style={{
                background: "var(--surface-1)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 12,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                  borderBottom: "1px solid var(--border)",
                  paddingBottom: 8,
                }}
              >
                <span
                  style={{
                    color: accent,
                    fontFamily: "monospace",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 1,
                  }}
                >
                  {cat?.label.toUpperCase()}
                </span>
                <StackStatus gaps={gaps} count={groupTools.length} />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  flex: 1,
                }}
              >
                {groupTools.map((tool) => (
                  <div
                    key={tool.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 8px",
                      background: "var(--surface-2)",
                      borderRadius: 8,
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
                          fontFamily: "monospace",
                          fontSize: 11,
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
                          fontSize: 9,
                          color: "var(--text-faint)",
                          lineHeight: 1.3,
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {tool.desc}
                      </div>
                    </Link>
                    <button
                      onClick={() => onToggleBookmark(tool.id)}
                      aria-label={
                        isBookmarked(tool.id)
                          ? "Remove from stack"
                          : "Add to stack"
                      }
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 14,
                        color: isBookmarked(tool.id) ? "#eab308" : "var(--text-faint)",
                        padding: "2px 4px",
                        lineHeight: 1,
                      }}
                    >
                      {isBookmarked(tool.id) ? "★" : "☆"}
                    </button>
                  </div>
                ))}
              </div>

              {gaps && gaps.missing.length > 0 && (
                <div
                  style={{
                    marginTop: 10,
                    padding: 8,
                    background: `${ACCENT}08`,
                    border: `1px solid ${ACCENT}20`,
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 8,
                      color: ACCENT,
                      fontFamily: "monospace",
                      letterSpacing: 1,
                      marginBottom: 4,
                    }}
                  >
                    MISSING ROLES
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    {gaps.missing.slice(0, 2).map((role) => (
                      <div key={role.key}>
                        <span
                          style={{
                            fontSize: 10,
                            color: "var(--text-secondary)",
                          }}
                        >
                          {role.label}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            gap: 4,
                            flexWrap: "wrap",
                            marginTop: 2,
                          }}
                        >
                          {role.suggestIds.slice(0, 2).map((id) => {
                            const suggested = TOOLS.find((t) => t.id === id);
                            if (!suggested) return null;
                            return (
                              <span
                                key={id}
                                style={{
                                  fontSize: 8,
                                  color: "var(--text-faint)",
                                  background: "var(--surface-2)",
                                  padding: "1px 4px",
                                  borderRadius: 3,
                                }}
                              >
                                {suggested.name}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: 6,
                  marginTop: 10,
                }}
              >
                <button
                  onClick={handleStackAll}
                  disabled={allBookmarked}
                  style={{
                    flex: 1,
                    fontFamily: "monospace",
                    fontSize: 9,
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    background: allBookmarked
                      ? "var(--surface-2)"
                      : `${accent}15`,
                    color: allBookmarked ? "var(--text-faint)" : accent,
                    border: allBookmarked
                      ? "1px solid var(--border)"
                      : `1px solid ${accent}35`,
                    borderRadius: 7,
                    padding: "7px 10px",
                    cursor: allBookmarked ? "default" : "pointer",
                  }}
                >
                  {allBookmarked ? "In Stack" : "Stack all"}
                </button>
                <button
                  onClick={() => onExploreCategory(catId)}
                  style={{
                    flex: 1,
                    fontFamily: "monospace",
                    fontSize: 9,
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    background: "var(--surface-2)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border)",
                    borderRadius: 7,
                    padding: "7px 10px",
                    cursor: "pointer",
                  }}
                >
                  Explore
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
