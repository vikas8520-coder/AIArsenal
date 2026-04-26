"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { TOOLS } from "../data/tools";
import { CATEGORIES, getCategoryById } from "../data/categories";
import { getToolSlug } from "../lib/tools";
import { getAttributes } from "../data/tool-attributes";

const ACCENT = "#a855f7";
const MIN = 2;
const MAX = 5;

const ROWS = [
  { key: "free", label: "Free Tier" },
  { key: "company", label: "Company" },
  { key: "category", label: "Category" },
  { key: "subcategory", label: "Subcategory" },
  { key: "oss", label: "Open Source" },
  { key: "privacy", label: "Privacy" },
];

function formatVal(tool, key) {
  if (key === "oss") return tool.oss ? "Yes ✓" : "No";
  return tool[key] || "—";
}

function trackClick(tool) {
  if (typeof window !== "undefined" && window.plausible) {
    window.plausible(tool.affiliate ? "Affiliate Click" : "Tool Click", {
      props: { tool: tool.name, source: "multi-compare" },
    });
  }
}

function outboundUrl(tool) {
  if (tool.affiliate) {
    const url = new URL(tool.affiliate);
    url.searchParams.set("utm_source", "aiarsenal");
    url.searchParams.set("utm_medium", "compare-multi");
    url.searchParams.set("utm_campaign", "tools");
    return url.toString();
  }
  const raw = tool.url;
  return raw.startsWith("http") ? raw : `https://${raw}`;
}

export default function MultiCompareClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [picking, setPicking] = useState(false);

  const ids = useMemo(() => {
    const raw = searchParams?.get("ids") || "";
    return raw.split(",").map((s) => s.trim()).filter(Boolean).slice(0, MAX);
  }, [searchParams]);

  const tools = useMemo(
    () => ids.map((id) => TOOLS.find((t) => t.id === id)).filter(Boolean),
    [ids]
  );

  // Update URL when ids change
  const setIds = (next) => {
    const sliced = next.slice(0, MAX);
    const params = new URLSearchParams();
    if (sliced.length > 0) params.set("ids", sliced.join(","));
    router.replace(`/compare/multi?${params.toString()}`);
  };

  const removeTool = (id) => setIds(ids.filter((x) => x !== id));
  const addTool = (id) => {
    if (ids.includes(id)) return;
    setIds([...ids, id]);
    setPicking(false);
  };

  const colors = useMemo(
    () => tools.map((t) => getCategoryById(t.category)?.color || ACCENT),
    [tools]
  );

  // Title pieces
  const titleNames = tools.map((t) => t.name).join(" vs ");

  return (
    <div
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "32px 24px 80px",
      }}
    >
      {/* Breadcrumb */}
      <div
        style={{
          display: "flex",
          gap: 8,
          fontSize: 11,
          fontFamily: "monospace",
          color: "var(--text-faint)",
          marginBottom: 18,
        }}
      >
        <Link
          href="/"
          style={{ color: "var(--text-faint)", textDecoration: "none" }}
        >
          AIArsenal
        </Link>
        <span>/</span>
        <span>Compare</span>
        <span>/</span>
        <span style={{ color: "var(--text-secondary)" }}>Multi</span>
      </div>

      {/* Hero */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontSize: 10,
            fontFamily: "monospace",
            letterSpacing: 2,
            color: ACCENT,
            marginBottom: 10,
          }}
        >
          MULTI-WAY COMPARISON · UP TO {MAX} TOOLS
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: "monospace",
            fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: 700,
            color: "var(--text-strong)",
            letterSpacing: -0.5,
            lineHeight: 1.15,
          }}
        >
          {tools.length === 0
            ? "Compare any AI tools side-by-side"
            : tools.length === 1
              ? `${tools[0].name} — pick more to compare`
              : titleNames}
        </h1>
        <p
          style={{
            margin: "12px 0 0",
            fontSize: 13.5,
            color: "var(--text-secondary)",
            lineHeight: 1.55,
            maxWidth: 700,
          }}
        >
          Add up to {MAX} tools to see them side-by-side: free tier, company,
          OSS status, privacy, and editorial decision guides. Share the URL —
          your selection persists in the link.
        </p>
      </div>

      {/* Tool slot pills */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 28,
          alignItems: "center",
        }}
      >
        {tools.map((t, i) => {
          const color = colors[i];
          return (
            <span
              key={t.id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 6px 8px 14px",
                background: `${color}10`,
                border: `1px solid ${color}40`,
                borderRadius: 8,
                fontFamily: "monospace",
                fontSize: 12,
                color,
                fontWeight: 700,
              }}
            >
              {t.name}
              <button
                onClick={() => removeTool(t.id)}
                aria-label={`Remove ${t.name}`}
                style={{
                  background: "transparent",
                  border: "none",
                  color,
                  fontSize: 14,
                  cursor: "pointer",
                  padding: "0 4px",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </span>
          );
        })}
        {tools.length < MAX && (
          <button
            onClick={() => setPicking(true)}
            style={{
              padding: "8px 14px",
              background: ACCENT,
              color: "#000",
              border: "none",
              fontFamily: "monospace",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 0.5,
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            + ADD TOOL ({tools.length}/{MAX})
          </button>
        )}
        {tools.length > 0 && (
          <button
            onClick={() => setIds([])}
            style={{
              padding: "8px 12px",
              background: "transparent",
              color: "var(--text-faint)",
              border: "1px solid var(--border)",
              fontFamily: "monospace",
              fontSize: 11,
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Picker drawer */}
      {picking && (
        <ToolPicker
          excluded={new Set(ids)}
          onPick={addTool}
          onClose={() => setPicking(false)}
        />
      )}

      {/* Empty state */}
      {tools.length === 0 && !picking && <EmptyHelper onAdd={() => setPicking(true)} />}

      {/* Comparison content */}
      {tools.length >= 1 && (
        <>
          {/* Tool overview cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${tools.length}, minmax(0, 1fr))`,
              gap: 12,
              marginBottom: 28,
              overflowX: "auto",
            }}
          >
            {tools.map((t, i) => (
              <ToolColumn key={t.id} tool={t} color={colors[i]} />
            ))}
          </div>

          {/* Spec table */}
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: 12,
              overflow: "hidden",
              marginBottom: 32,
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: "monospace",
                fontSize: 12,
                minWidth: 560,
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      width: 130,
                      textAlign: "left",
                      padding: "12px 14px",
                      background: "var(--surface-1)",
                      borderBottom: "1px solid var(--border)",
                      fontSize: 9,
                      letterSpacing: 1.5,
                      color: "var(--text-faint)",
                    }}
                  />
                  {tools.map((t, i) => (
                    <th
                      key={t.id}
                      style={{
                        textAlign: "left",
                        padding: "12px 14px",
                        background: "var(--surface-1)",
                        borderBottom: "1px solid var(--border)",
                        borderLeft: "1px solid var(--border)",
                        color: colors[i],
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, ri) => (
                  <tr
                    key={row.key}
                    style={{
                      background: ri % 2 === 0 ? "transparent" : "var(--surface-1)",
                    }}
                  >
                    <td
                      style={{
                        padding: "12px 14px",
                        fontSize: 9,
                        letterSpacing: 1,
                        color: "var(--text-faint)",
                        verticalAlign: "top",
                        borderBottom:
                          ri === ROWS.length - 1 ? "none" : "1px solid var(--border)",
                      }}
                    >
                      {row.label.toUpperCase()}
                    </td>
                    {tools.map((t, i) => (
                      <td
                        key={t.id}
                        style={{
                          padding: "12px 14px",
                          color:
                            row.key === "oss" && t.oss
                              ? "#00ff88"
                              : "var(--text-default)",
                          borderLeft: "1px solid var(--border)",
                          borderBottom:
                            ri === ROWS.length - 1 ? "none" : "1px solid var(--border)",
                          lineHeight: 1.5,
                          verticalAlign: "top",
                        }}
                      >
                        {formatVal(t, row.key)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Best-for grid */}
          <div style={{ marginBottom: 32 }}>
            <div
              style={{
                fontSize: 10,
                fontFamily: "monospace",
                letterSpacing: 2,
                color: "var(--text-faint)",
                marginBottom: 12,
              }}
            >
              EDITORIAL VERDICTS
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(auto-fit, minmax(${tools.length > 3 ? 220 : 280}px, 1fr))`,
                gap: 12,
              }}
            >
              {tools.map((t, i) => (
                <BestForCard key={t.id} tool={t} color={colors[i]} />
              ))}
            </div>
          </div>

          {/* Share + ask */}
          <div
            style={{
              padding: "20px 24px",
              background: `${ACCENT}08`,
              border: `1px solid ${ACCENT}25`,
              borderRadius: 12,
              display: "flex",
              gap: 14,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: "var(--text-default)",
                lineHeight: 1.5,
                flex: 1,
                minWidth: 240,
              }}
            >
              Still stuck? Ask AIArsenal to weigh these for your specific
              use case.
            </span>
            <Link
              href={`/ask?q=${encodeURIComponent(
                `Which should I pick: ${tools.map((t) => t.name).join(", ")}? My use case is `
              )}`}
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                padding: "10px 16px",
                background: ACCENT,
                color: "#fff",
                borderRadius: 8,
                textDecoration: "none",
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              ASK AI →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function ToolColumn({ tool, color }) {
  return (
    <div
      style={{
        padding: 16,
        background: "var(--surface-1)",
        border: `1px solid ${color}25`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 10,
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 14,
          fontWeight: 700,
          color,
          marginBottom: 4,
          letterSpacing: -0.2,
        }}
      >
        {tool.name}
      </div>
      <div
        style={{
          fontSize: 11.5,
          color: "var(--text-secondary)",
          lineHeight: 1.5,
          marginBottom: 10,
        }}
      >
        {tool.desc}
      </div>
      <a
        href={outboundUrl(tool)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackClick(tool)}
        style={{
          display: "inline-block",
          fontFamily: "monospace",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 0.5,
          padding: "6px 10px",
          background: color,
          color: "#000",
          borderRadius: 6,
          textDecoration: "none",
        }}
      >
        Try {tool.name} →
      </a>
    </div>
  );
}

function BestForCard({ tool, color }) {
  const attrs = getAttributes(tool.id);
  return (
    <div
      style={{
        padding: 14,
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderLeft: `3px solid ${color}`,
        borderRadius: 10,
      }}
    >
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 12,
          fontWeight: 700,
          color,
          marginBottom: 8,
        }}
      >
        Pick {tool.name} if…
      </div>
      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          gap: 5,
        }}
      >
        {(attrs?.bestFor || [tool.desc]).map((b, i) => (
          <li
            key={i}
            style={{
              fontSize: 11.5,
              color: "var(--text-default)",
              display: "flex",
              gap: 6,
              lineHeight: 1.45,
            }}
          >
            <span style={{ color, flexShrink: 0 }}>▸</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmptyHelper({ onAdd }) {
  return (
    <div
      style={{
        padding: "60px 24px",
        textAlign: "center",
        background: "var(--surface-1)",
        border: "1px dashed var(--border)",
        borderRadius: 14,
      }}
    >
      <div style={{ fontSize: 30, marginBottom: 14 }}>◈</div>
      <h2
        style={{
          margin: "0 0 8px",
          fontFamily: "monospace",
          fontSize: 17,
          color: "var(--text-strong)",
        }}
      >
        Pick 2–5 tools to compare
      </h2>
      <p
        style={{
          margin: "0 auto 22px",
          maxWidth: 460,
          fontSize: 13,
          color: "var(--text-secondary)",
          lineHeight: 1.6,
        }}
      >
        Common picks: Cursor vs Windsurf vs Cline · Claude vs ChatGPT vs Gemini
        · Suno vs Udio.
      </p>
      <button
        onClick={onAdd}
        style={{
          padding: "12px 22px",
          background: ACCENT,
          color: "#fff",
          border: "none",
          fontFamily: "monospace",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1,
          borderRadius: 10,
          cursor: "pointer",
        }}
      >
        + ADD A TOOL
      </button>
    </div>
  );
}

function ToolPicker({ excluded, onPick, onClose }) {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOLS.filter((t) => {
      if (excluded.has(t.id)) return false;
      if (activeCat !== "all" && t.category !== activeCat) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        (t.tags || []).some((tag) => tag.toLowerCase().includes(q))
      );
    }).slice(0, 40);
  }, [query, activeCat, excluded]);

  return (
    <div
      style={{
        marginBottom: 24,
        padding: 16,
        background: "var(--surface-1)",
        border: `1px solid ${ACCENT}40`,
        borderRadius: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          placeholder="Search 207+ tools..."
          style={{
            flex: 1,
            padding: "10px 12px",
            background: "var(--surface-2)",
            border: "1px solid var(--border-bright)",
            borderRadius: 8,
            color: "var(--text-strong)",
            fontFamily: "monospace",
            fontSize: 13,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            padding: "10px 14px",
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--text-faint)",
            fontFamily: "monospace",
            fontSize: 12,
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
        <CategoryPill
          label="All"
          active={activeCat === "all"}
          onClick={() => setActiveCat("all")}
        />
        {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
          <CategoryPill
            key={c.id}
            label={c.label}
            color={c.color}
            active={activeCat === c.id}
            onClick={() => setActiveCat(c.id)}
          />
        ))}
      </div>
      <div
        style={{
          maxHeight: 380,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
        className="no-scrollbar"
      >
        {filtered.map((tool) => {
          const cat = getCategoryById(tool.category);
          const color = cat?.color || ACCENT;
          return (
            <button
              key={tool.id}
              onClick={() => onPick(tool.id)}
              style={{
                display: "flex",
                gap: 10,
                padding: "10px 12px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ color, fontFamily: "monospace", flexShrink: 0 }}>
                ◈
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontWeight: 700,
                    fontSize: 12,
                    color: "var(--text-strong)",
                  }}
                >
                  {tool.name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-secondary)",
                    marginTop: 2,
                    lineHeight: 1.4,
                  }}
                >
                  {tool.desc}
                </div>
              </div>
              <span style={{ color, fontSize: 16, alignSelf: "center" }}>+</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CategoryPill({ label, active, onClick, color = ACCENT }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "monospace",
        fontSize: 10,
        padding: "4px 9px",
        background: active ? `${color}18` : "var(--surface-2)",
        border: `1px solid ${active ? `${color}50` : "var(--border)"}`,
        color: active ? color : "var(--text-faint)",
        borderRadius: 4,
        cursor: "pointer",
        letterSpacing: 0.5,
      }}
    >
      {label}
    </button>
  );
}
