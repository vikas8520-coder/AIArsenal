"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { TOOLS } from "../data/tools";
import { getToolSlug } from "../lib/tools";
import { getCategoryById } from "../data/categories";
import { getAttributes } from "../data/tool-attributes";

const ACCENT = "#00f0ff";

function getTool(id) {
  return TOOLS.find((t) => t.id === id) || null;
}

function outboundUrl(tool) {
  if (tool.affiliate) {
    const url = new URL(tool.affiliate);
    url.searchParams.set("utm_source", "aiarsenal");
    url.searchParams.set("utm_medium", "stacks");
    url.searchParams.set("utm_campaign", "tools");
    return url.toString();
  }
  const raw = tool.url;
  return raw.startsWith("http") ? raw : `https://${raw}`;
}

function trackClick(tool) {
  if (typeof window !== "undefined" && window.plausible) {
    window.plausible(tool.affiliate ? "Affiliate Click" : "Tool Click", {
      props: { tool: tool.name, source: "stack" },
    });
  }
}

function StatPill({ label, value, color = ACCENT }) {
  return (
    <div
      style={{
        padding: "8px 12px",
        background: `${color}08`,
        border: `1px solid ${color}25`,
        borderRadius: 8,
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontFamily: "monospace",
          letterSpacing: 1.5,
          color: "var(--text-faint)",
        }}
      >
        {label.toUpperCase()}
      </div>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 13,
          fontWeight: 700,
          color,
          marginTop: 2,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function RoleCard({ role, index }) {
  const tool = getTool(role.toolId);
  if (!tool) return null;
  const cat = getCategoryById(tool.category);
  const color = cat?.color || ACCENT;
  const attrs = getAttributes(tool.id);
  const alternatives = (role.alternatives || [])
    .map((id) => getTool(id))
    .filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      style={{
        padding: 20,
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderLeft: `3px solid ${color}`,
        borderRadius: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          marginBottom: 10,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 10,
              fontFamily: "monospace",
              letterSpacing: 1.5,
              color: "var(--text-faint)",
              marginBottom: 4,
            }}
          >
            {String(index + 1).padStart(2, "0")} · {role.label.toUpperCase()}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <Link
              href={`/tools/${getToolSlug(tool)}`}
              style={{
                fontFamily: "monospace",
                fontSize: 18,
                fontWeight: 700,
                color,
                textDecoration: "none",
                letterSpacing: -0.3,
              }}
            >
              {tool.name}
            </Link>
            <span
              style={{
                fontSize: 10,
                fontFamily: "monospace",
                color: "#10b981",
              }}
            >
              {tool.free}
            </span>
          </div>
          <p
            style={{
              margin: "10px 0 0",
              fontSize: 13,
              lineHeight: 1.6,
              color: "var(--text-default)",
            }}
          >
            {role.why}
          </p>
        </div>
        <a
          href={outboundUrl(tool)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackClick(tool)}
          style={{
            fontFamily: "monospace",
            fontSize: 10,
            fontWeight: 700,
            padding: "6px 12px",
            background: color,
            color: "#000",
            borderRadius: 6,
            textDecoration: "none",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          TRY →
        </a>
      </div>

      {attrs?.bestFor && attrs.bestFor.length > 0 && (
        <ul
          style={{
            margin: "10px 0 0",
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {attrs.bestFor.slice(0, 2).map((b, i) => (
            <li
              key={i}
              style={{
                fontSize: 11.5,
                lineHeight: 1.45,
                color: "var(--text-secondary)",
                display: "flex",
                gap: 8,
              }}
            >
              <span style={{ color, flexShrink: 0 }}>▸</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}

      {alternatives.length > 0 && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 10,
            borderTop: "1px dashed var(--border)",
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontFamily: "monospace",
              letterSpacing: 1.5,
              color: "var(--text-faint)",
              marginBottom: 6,
            }}
          >
            OR SWAP IN
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {alternatives.map((alt) => {
              const altCat = getCategoryById(alt.category);
              const altColor = altCat?.color || "#a855f7";
              return (
                <Link
                  key={alt.id}
                  href={`/tools/${getToolSlug(alt)}`}
                  style={{
                    fontFamily: "monospace",
                    fontSize: 10.5,
                    padding: "3px 8px",
                    background: `${altColor}10`,
                    color: altColor,
                    border: `1px solid ${altColor}25`,
                    borderRadius: 4,
                    textDecoration: "none",
                  }}
                >
                  {alt.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function StackPageClient({ stack, related }) {
  const diffColor =
    stack.difficulty === "Beginner"
      ? "#10b981"
      : stack.difficulty === "Advanced"
        ? "#ef5350"
        : "#eab308";

  const askQuery = encodeURIComponent(
    `Help me customize the "${stack.title}" stack for my specific use case`
  );

  return (
    <div
      style={{
        maxWidth: 920,
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
        <Link
          href="/stacks"
          style={{ color: "var(--text-faint)", textDecoration: "none" }}
        >
          Stacks
        </Link>
        <span>/</span>
        <span style={{ color: "var(--text-secondary)" }}>{stack.title}</span>
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 28 }}
      >
        <div
          style={{
            fontSize: 10,
            fontFamily: "monospace",
            letterSpacing: 2,
            color: ACCENT,
            marginBottom: 10,
          }}
        >
          STACK RECIPE
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: "monospace",
            fontSize: "clamp(26px, 4.2vw, 40px)",
            fontWeight: 700,
            color: "var(--text-strong)",
            letterSpacing: -0.8,
            lineHeight: 1.15,
          }}
        >
          {stack.title}
        </h1>
        <p
          style={{
            margin: "14px 0 0",
            fontSize: 15,
            lineHeight: 1.55,
            color: "var(--text-secondary)",
          }}
        >
          {stack.hook}
        </p>
      </motion.div>

      {/* Stats */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 36,
        }}
      >
        <StatPill label="For" value={stack.useCase} />
        <StatPill label="Budget" value={stack.budget} color="#10b981" />
        <StatPill label="Difficulty" value={stack.difficulty} color={diffColor} />
        <StatPill label="Time to ship" value={stack.timeToShip} color="#a855f7" />
        <StatPill label="Tools" value={`${stack.roles.length} tools`} />
      </div>

      {/* The stack */}
      <section style={{ marginBottom: 48 }}>
        <div
          style={{
            fontSize: 10,
            fontFamily: "monospace",
            letterSpacing: 2,
            color: "var(--text-faint)",
            marginBottom: 10,
          }}
        >
          THE STACK
        </div>
        <h2
          style={{
            margin: "0 0 20px",
            fontFamily: "monospace",
            fontSize: 20,
            color: "var(--text-strong)",
          }}
        >
          {stack.roles.length} tools that work together
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {stack.roles.map((role, i) => (
            <RoleCard key={`${role.toolId}-${i}`} role={role} index={i} />
          ))}
        </div>
      </section>

      {/* Steps */}
      {stack.steps?.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <div
            style={{
              fontSize: 10,
              fontFamily: "monospace",
              letterSpacing: 2,
              color: "var(--text-faint)",
              marginBottom: 10,
            }}
          >
            QUICK START
          </div>
          <h2
            style={{
              margin: "0 0 20px",
              fontFamily: "monospace",
              fontSize: 20,
              color: "var(--text-strong)",
            }}
          >
            How to ship it
          </h2>
          <ol
            style={{
              margin: 0,
              paddingLeft: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {stack.steps.map((s, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  gap: 14,
                  padding: "12px 16px",
                  background: "var(--surface-1)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: `${ACCENT}15`,
                    border: `1px solid ${ACCENT}40`,
                    color: ACCENT,
                    fontFamily: "monospace",
                    fontSize: 11,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {i + 1}
                </span>
                <span
                  style={{
                    fontSize: 13.5,
                    lineHeight: 1.55,
                    color: "var(--text-default)",
                  }}
                >
                  {s}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Hidden costs */}
      {stack.hiddenCosts && (
        <section style={{ marginBottom: 48 }}>
          <div
            style={{
              padding: "16px 20px",
              background: "rgba(234,179,8,0.05)",
              border: "1px solid rgba(234,179,8,0.25)",
              borderRadius: 12,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontFamily: "monospace",
                letterSpacing: 2,
                color: "#eab308",
                marginBottom: 8,
              }}
            >
              ⚠ WATCH OUT
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                lineHeight: 1.6,
                color: "var(--text-default)",
              }}
            >
              {stack.hiddenCosts}
            </p>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ marginBottom: 48 }}>
        <div
          style={{
            padding: "24px 28px",
            background: `${ACCENT}08`,
            border: `1px solid ${ACCENT}25`,
            borderRadius: 14,
            textAlign: "center",
          }}
        >
          <h2
            style={{
              margin: "0 0 10px",
              fontFamily: "monospace",
              fontSize: 18,
              color: "var(--text-strong)",
            }}
          >
            Want this stack customized for you?
          </h2>
          <p
            style={{
              margin: "0 auto 18px",
              maxWidth: 520,
              fontSize: 13,
              lineHeight: 1.6,
              color: "var(--text-secondary)",
            }}
          >
            Ask AIArsenal to tailor it to your use case — budget, scale,
            privacy needs. It knows every tool in this stack.
          </p>
          <Link
            href={`/ask?q=${askQuery}`}
            style={{
              display: "inline-block",
              padding: "12px 24px",
              background: ACCENT,
              color: "#000",
              fontFamily: "monospace",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1,
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            ASK AIARSENAL →
          </Link>
        </div>
      </section>

      {/* Related */}
      {related?.length > 0 && (
        <section>
          <div
            style={{
              fontSize: 10,
              fontFamily: "monospace",
              letterSpacing: 2,
              color: "var(--text-faint)",
              marginBottom: 10,
            }}
          >
            RELATED STACKS
          </div>
          <h2
            style={{
              margin: "0 0 14px",
              fontFamily: "monospace",
              fontSize: 18,
              color: "var(--text-strong)",
            }}
          >
            More recipes
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 10,
            }}
          >
            {related.map((s) => (
              <Link
                key={s.slug}
                href={`/stacks/${s.slug}`}
                style={{
                  padding: "14px 16px",
                  background: "var(--surface-1)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  textDecoration: "none",
                }}
              >
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--text-strong)",
                    marginBottom: 4,
                  }}
                >
                  {s.title}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-faint)",
                    lineHeight: 1.4,
                  }}
                >
                  {s.hook}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
