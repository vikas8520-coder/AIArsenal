"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { getCategoryById } from "../data/categories";
import { getToolSlug } from "../lib/tools";
import { getAttributes } from "../data/tool-attributes";

function trackCompareClick(tool) {
  if (typeof window !== "undefined" && window.plausible) {
    window.plausible(tool.affiliate ? "Affiliate Click" : "Tool Click", {
      props: { tool: tool.name, source: "compare" },
    });
  }
}

function outboundUrl(tool) {
  if (tool.affiliate) {
    const url = new URL(tool.affiliate);
    url.searchParams.set("utm_source", "aiarsenal");
    url.searchParams.set("utm_medium", "compare");
    url.searchParams.set("utm_campaign", "tools");
    return url.toString();
  }
  const raw = tool.url;
  return raw.startsWith("http") ? raw : `https://${raw}`;
}

const ROWS = [
  { key: "free", label: "Free Tier" },
  { key: "company", label: "Company" },
  { key: "oss", label: "Open Source" },
  { key: "privacy", label: "Privacy" },
  { key: "category", label: "Category" },
  { key: "subcategory", label: "Subcategory" },
];

function formatVal(tool, key) {
  if (key === "oss") return tool.oss ? "Yes ✓" : "No";
  if (key === "tags") return (tool.tags || []).map((t) => `#${t}`).join(", ");
  return tool[key] || "—";
}

function ToolVerdict({ tool, color, attrs }) {
  const bestFor = attrs?.bestFor || [
    `${tool.desc}`,
    `Free tier: ${tool.free}`,
    ...(tool.oss ? ["Open source / self-hostable"] : []),
  ];
  const notFor = attrs?.notFor || [];

  return (
    <div>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 11,
          fontWeight: 700,
          color,
          marginBottom: 6,
          letterSpacing: 0.5,
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
          gap: 6,
          marginBottom: notFor.length > 0 ? 14 : 0,
        }}
      >
        {bestFor.map((b, i) => (
          <li
            key={i}
            style={{
              fontSize: 12,
              color: "var(--text-default)",
              display: "flex",
              gap: 8,
              lineHeight: 1.5,
            }}
          >
            <span style={{ color, flexShrink: 0 }}>▸</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      {notFor.length > 0 && (
        <>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              fontWeight: 700,
              color: "var(--text-faint)",
              marginBottom: 6,
              letterSpacing: 0.5,
            }}
          >
            Skip it if…
          </div>
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
            {notFor.map((n, i) => (
              <li
                key={i}
                style={{
                  fontSize: 11.5,
                  color: "var(--text-faint)",
                  display: "flex",
                  gap: 8,
                  lineHeight: 1.5,
                }}
              >
                <span style={{ color: "var(--text-faint)", flexShrink: 0 }}>
                  ✕
                </span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function ToolColumn({ tool, color }) {
  return (
    <div
      style={{
        padding: 20,
        background: "var(--surface-1)",
        border: `1px solid ${color}25`,
        borderRadius: 14,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 6,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "monospace",
              fontSize: 20,
              fontWeight: 700,
              color,
              letterSpacing: -0.3,
            }}
          >
            {tool.name}
          </h2>
          {tool.oss && (
            <span
              style={{
                fontSize: 9,
                padding: "2px 6px",
                background: "rgba(0,255,136,0.12)",
                color: "#00ff88",
                borderRadius: 3,
                fontFamily: "monospace",
                fontWeight: 700,
                border: "1px solid rgba(0,255,136,0.25)",
              }}
            >
              OSS
            </span>
          )}
          {tool.sponsored && (
            <span
              style={{
                fontSize: 9,
                padding: "2px 6px",
                background: "rgba(234,179,8,0.12)",
                color: "#eab308",
                borderRadius: 3,
                fontFamily: "monospace",
                fontWeight: 700,
                border: "1px solid rgba(234,179,8,0.25)",
              }}
            >
              FEATURED
            </span>
          )}
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            lineHeight: 1.55,
            color: "var(--text-secondary)",
          }}
        >
          {tool.desc}
        </p>
      </div>

      {tool.detail && (
        <p
          style={{
            margin: 0,
            fontSize: 12.5,
            lineHeight: 1.6,
            color: "var(--text-default)",
            padding: "10px 12px",
            background: "var(--surface-2)",
            borderRadius: 8,
          }}
        >
          {tool.detail}
        </p>
      )}

      {tool.quickStart && (
        <div>
          <div
            style={{
              fontSize: 9,
              fontFamily: "monospace",
              letterSpacing: 1.5,
              color,
              marginBottom: 4,
            }}
          >
            QUICK START
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 11.5,
              lineHeight: 1.55,
              color: "var(--text-default)",
              fontFamily: "monospace",
              padding: "8px 10px",
              background: `${color}08`,
              border: `1px solid ${color}15`,
              borderRadius: 6,
            }}
          >
            {tool.quickStart}
          </p>
        </div>
      )}

      <a
        href={outboundUrl(tool)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackCompareClick(tool)}
        style={{
          display: "inline-block",
          padding: "10px 14px",
          textAlign: "center",
          fontFamily: "monospace",
          fontSize: 11.5,
          fontWeight: 700,
          letterSpacing: 0.5,
          background: color,
          color: "#000",
          borderRadius: 8,
          textDecoration: "none",
          marginTop: "auto",
          transition: "all 0.15s",
        }}
      >
        Try {tool.name} →
      </a>

      <Link
        href={`/tools/${getToolSlug(tool)}`}
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          color: "var(--text-faint)",
          textDecoration: "none",
          textAlign: "center",
        }}
      >
        View full listing →
      </Link>
    </div>
  );
}

export default function ComparePageClient({ toolA, toolB, related }) {
  const catA = getCategoryById(toolA.category);
  const catB = getCategoryById(toolB.category);
  const colorA = catA?.color || "#00f0ff";
  const colorB = catB?.color || "#a855f7";
  const attrsA = getAttributes(toolA.id);
  const attrsB = getAttributes(toolB.id);

  return (
    <div
      style={{
        maxWidth: 1100,
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
          marginBottom: 20,
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
        <span style={{ color: "var(--text-secondary)" }}>
          {toolA.name} vs {toolB.name}
        </span>
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 40 }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: "monospace",
            fontSize: "clamp(28px, 5vw, 44px)",
            fontWeight: 700,
            color: "var(--text-strong)",
            letterSpacing: -1,
            lineHeight: 1.1,
          }}
        >
          <span style={{ color: colorA }}>{toolA.name}</span>
          <span style={{ color: "var(--text-faint)" }}> vs </span>
          <span style={{ color: colorB }}>{toolB.name}</span>
        </h1>
        <p
          style={{
            margin: "12px 0 0",
            fontSize: 14,
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            maxWidth: 720,
          }}
        >
          Side-by-side comparison of free tiers, features, privacy, and company
          background. Updated for 2026.
        </p>
      </motion.div>

      {/* Two-column overview */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 16,
          marginBottom: 40,
        }}
      >
        <ToolColumn tool={toolA} color={colorA} />
        <ToolColumn tool={toolB} color={colorB} />
      </div>

      {/* Comparison table */}
      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            fontSize: 10,
            fontFamily: "monospace",
            letterSpacing: 2,
            color: "var(--text-faint)",
            marginBottom: 10,
          }}
        >
          SIDE-BY-SIDE
        </div>
        <h2
          style={{
            margin: "0 0 20px",
            fontFamily: "monospace",
            fontSize: 20,
            color: "var(--text-strong)",
          }}
        >
          Feature comparison
        </h2>
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontFamily: "monospace",
              fontSize: 12,
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    width: 140,
                    textAlign: "left",
                    padding: "12px 16px",
                    background: "var(--surface-1)",
                    borderBottom: "1px solid var(--border)",
                    fontSize: 9,
                    color: "var(--text-faint)",
                    letterSpacing: 1.5,
                  }}
                />
                <th
                  style={{
                    textAlign: "left",
                    padding: "12px 16px",
                    background: "var(--surface-1)",
                    borderBottom: "1px solid var(--border)",
                    fontSize: 12,
                    fontWeight: 700,
                    color: colorA,
                  }}
                >
                  {toolA.name}
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "12px 16px",
                    background: "var(--surface-1)",
                    borderBottom: "1px solid var(--border)",
                    fontSize: 12,
                    fontWeight: 700,
                    color: colorB,
                  }}
                >
                  {toolB.name}
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr
                  key={row.key}
                  style={{
                    background: i % 2 === 0 ? "transparent" : "var(--surface-1)",
                  }}
                >
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 9,
                      color: "var(--text-faint)",
                      letterSpacing: 1,
                      borderBottom:
                        i === ROWS.length - 1
                          ? "none"
                          : "1px solid var(--border)",
                      verticalAlign: "top",
                    }}
                  >
                    {row.label.toUpperCase()}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color:
                        row.key === "oss" && toolA.oss
                          ? "#00ff88"
                          : "var(--text-default)",
                      borderBottom:
                        i === ROWS.length - 1
                          ? "none"
                          : "1px solid var(--border)",
                      borderLeft: "1px solid var(--border)",
                      lineHeight: 1.5,
                      verticalAlign: "top",
                    }}
                  >
                    {formatVal(toolA, row.key)}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color:
                        row.key === "oss" && toolB.oss
                          ? "#00ff88"
                          : "var(--text-default)",
                      borderBottom:
                        i === ROWS.length - 1
                          ? "none"
                          : "1px solid var(--border)",
                      borderLeft: "1px solid var(--border)",
                      lineHeight: 1.5,
                      verticalAlign: "top",
                    }}
                  >
                    {formatVal(toolB, row.key)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision helper */}
      <div
        style={{
          marginBottom: 40,
          padding: "24px 28px",
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: 14,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontFamily: "monospace",
            letterSpacing: 2,
            color: "var(--text-faint)",
            marginBottom: 8,
          }}
        >
          DECISION GUIDE
        </div>
        <h2
          style={{
            margin: "0 0 16px",
            fontFamily: "monospace",
            fontSize: 18,
            color: "var(--text-strong)",
          }}
        >
          Which should you pick?
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          <ToolVerdict tool={toolA} color={colorA} attrs={attrsA} />
          <ToolVerdict tool={toolB} color={colorB} attrs={attrsB} />
        </div>
        <div
          style={{
            marginTop: 20,
            padding: "14px 18px",
            background: "#00f0ff08",
            border: "1px solid #00f0ff20",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 12.5,
              color: "var(--text-default)",
              lineHeight: 1.5,
            }}
          >
            Still stuck? Ask AIArsenal — our conversational advisor considers
            your use case, budget, and privacy needs.
          </span>
          <Link
            href={`/ask?q=${encodeURIComponent(`${toolA.name} vs ${toolB.name} — which should I pick?`)}`}
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              padding: "6px 12px",
              background: "#00f0ff20",
              border: "1px solid #00f0ff50",
              color: "#00f0ff",
              borderRadius: 6,
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            ASK AI →
          </Link>
          <Link
            href={`/compare/multi?ids=${toolA.id},${toolB.id}`}
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              padding: "6px 12px",
              background: "#a855f720",
              border: "1px solid #a855f750",
              color: "#a855f7",
              borderRadius: 6,
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            + COMPARE MORE TOOLS
          </Link>
        </div>
      </div>

      {/* Related comparisons */}
      {related && related.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <div
            style={{
              fontSize: 10,
              fontFamily: "monospace",
              letterSpacing: 2,
              color: "var(--text-faint)",
              marginBottom: 10,
            }}
          >
            RELATED
          </div>
          <h2
            style={{
              margin: "0 0 14px",
              fontFamily: "monospace",
              fontSize: 18,
              color: "var(--text-strong)",
            }}
          >
            More comparisons
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 10,
            }}
          >
            {related.map(({ slug, toolA: ra, toolB: rb }) => (
              <Link
                key={slug}
                href={`/compare/${slug}`}
                style={{
                  padding: "12px 14px",
                  background: "var(--surface-1)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  textDecoration: "none",
                  transition: "all 0.15s",
                  fontFamily: "monospace",
                  fontSize: 12,
                  color: "var(--text-default)",
                }}
              >
                <span style={{ color: getCategoryById(ra.category)?.color || "#00f0ff" }}>
                  {ra.name}
                </span>
                <span style={{ color: "var(--text-faint)" }}> vs </span>
                <span style={{ color: getCategoryById(rb.category)?.color || "#a855f7" }}>
                  {rb.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
