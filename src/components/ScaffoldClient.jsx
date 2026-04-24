"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TOOLS } from "../data/tools";
import { STACKS } from "../data/stacks";
import { getCategoryById } from "../data/categories";
import { decodeCustomStack } from "../utils/customStack";

const ACCENT = "#a855f7";

const FRAMEWORKS = [
  { id: "Next.js + TypeScript", label: "Next.js + TypeScript", hint: "Most AI SaaS projects" },
  { id: "Python / FastAPI", label: "Python / FastAPI", hint: "For ML-heavy backends" },
  { id: "Node.js + Express", label: "Node.js + Express", hint: "Lean Node services" },
];

function getTool(id) {
  return TOOLS.find((t) => t.id === id) || null;
}

// Minimal markdown → HTML renderer (blocks + inline basics only).
// We use this instead of pulling in react-markdown to keep bundle lean.
function renderMarkdown(md) {
  if (!md) return "";

  const lines = md.split(/\r?\n/);
  let html = "";
  let inCode = false;
  let codeLang = "";
  let codeBuffer = [];
  let inList = false;
  let inOl = false;

  const flushList = () => {
    if (inList) {
      html += "</ul>";
      inList = false;
    }
    if (inOl) {
      html += "</ol>";
      inOl = false;
    }
  };

  const inline = (s) =>
    escapeHtml(s)
      .replace(/`([^`]+)`/g, '<code class="md-inline">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener">$1</a>'
      );

  for (const rawLine of lines) {
    const line = rawLine;

    // Code fence
    const fenceMatch = line.match(/^```(\w+)?\s*$/);
    if (fenceMatch) {
      if (!inCode) {
        flushList();
        inCode = true;
        codeLang = fenceMatch[1] || "";
        codeBuffer = [];
      } else {
        html += `<pre class="md-code" data-lang="${escapeHtml(codeLang)}"><code>${escapeHtml(codeBuffer.join("\n"))}</code></pre>`;
        inCode = false;
        codeLang = "";
        codeBuffer = [];
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    // Headings
    const h1 = line.match(/^# (.+)/);
    const h2 = line.match(/^## (.+)/);
    const h3 = line.match(/^### (.+)/);
    if (h1) {
      flushList();
      html += `<h1 class="md-h1">${inline(h1[1])}</h1>`;
      continue;
    }
    if (h2) {
      flushList();
      html += `<h2 class="md-h2">${inline(h2[1])}</h2>`;
      continue;
    }
    if (h3) {
      flushList();
      html += `<h3 class="md-h3">${inline(h3[1])}</h3>`;
      continue;
    }

    // Lists
    const liMatch = line.match(/^[-*+] (.+)/);
    const olMatch = line.match(/^\d+\.\s(.+)/);
    if (liMatch) {
      if (!inList) {
        flushList();
        html += "<ul class=\"md-list\">";
        inList = true;
      }
      html += `<li>${inline(liMatch[1])}</li>`;
      continue;
    }
    if (olMatch) {
      if (!inOl) {
        flushList();
        html += "<ol class=\"md-olist\">";
        inOl = true;
      }
      html += `<li>${inline(olMatch[1])}</li>`;
      continue;
    }

    // Blank
    if (!line.trim()) {
      flushList();
      continue;
    }

    // Paragraph
    flushList();
    html += `<p class="md-p">${inline(line)}</p>`;
  }

  flushList();
  if (inCode) {
    html += `<pre class="md-code"><code>${escapeHtml(codeBuffer.join("\n"))}</code></pre>`;
  }
  return html;
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function StackPreview({ stack }) {
  return (
    <div
      style={{
        padding: 14,
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        marginBottom: 16,
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
        YOUR STACK
      </div>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 14,
          fontWeight: 700,
          color: "var(--text-strong)",
          marginBottom: 4,
        }}
      >
        {stack.name || "Custom stack"}
      </div>
      {stack.description && (
        <div
          style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            marginBottom: 10,
            lineHeight: 1.5,
          }}
        >
          {stack.description}
        </div>
      )}
      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
        }}
      >
        {stack.roles.map((r, i) => {
          const tool = getTool(r.toolId);
          if (!tool) return null;
          const cat = getCategoryById(tool.category);
          const color = cat?.color || ACCENT;
          return (
            <span
              key={i}
              style={{
                fontSize: 10,
                fontFamily: "monospace",
                padding: "3px 8px",
                background: `${color}15`,
                border: `1px solid ${color}30`,
                color,
                borderRadius: 4,
              }}
            >
              {tool.name}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function StackPicker({ onPick }) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <p
        style={{
          textAlign: "center",
          fontFamily: "monospace",
          fontSize: 12,
          color: "var(--text-secondary)",
          marginBottom: 24,
          lineHeight: 1.6,
        }}
      >
        Pick a curated stack recipe below, or paste a link from{" "}
        <Link href="/build" style={{ color: ACCENT }}>/build</Link> or{" "}
        <Link href="/quiz" style={{ color: ACCENT }}>/quiz</Link>.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {STACKS.map((s) => (
          <button
            key={s.slug}
            onClick={() =>
              onPick({
                name: s.title,
                description: s.hook,
                roles: s.roles.map((r) => ({
                  label: r.label,
                  toolId: r.toolId,
                })),
              })
            }
            style={{
              textAlign: "left",
              padding: "14px 16px",
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              cursor: "pointer",
              fontFamily: "monospace",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${ACCENT}50`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--text-strong)",
                marginBottom: 3,
              }}
            >
              {s.title}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-secondary)",
                lineHeight: 1.5,
              }}
            >
              {s.hook}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ScaffoldClient() {
  const searchParams = useSearchParams();
  const [stack, setStack] = useState(null);
  const [framework, setFramework] = useState(FRAMEWORKS[0].id);
  const [loading, setLoading] = useState(false);
  const [markdown, setMarkdown] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Load stack from URL param on mount
  useEffect(() => {
    const encoded = searchParams?.get("s");
    if (!encoded) return;
    const decoded = decodeCustomStack(encoded);
    if (decoded && decoded.roles?.length > 0) {
      setStack(decoded);
    }
  }, [searchParams]);

  const validRoles = useMemo(
    () => (stack?.roles || []).filter((r) => getTool(r.toolId)),
    [stack]
  );

  const generate = useCallback(async () => {
    if (!stack || validRoles.length === 0) return;
    setLoading(true);
    setError(null);
    setMarkdown(null);
    try {
      const res = await fetch("/api/scaffold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stack: { ...stack, roles: validRoles },
          framework,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setMarkdown(data.markdown);
      if (typeof window !== "undefined" && window.plausible) {
        window.plausible("Scaffold Generated", {
          props: { framework, toolCount: validRoles.length },
        });
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [stack, validRoles, framework]);

  const downloadMd = () => {
    if (!markdown) return;
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = (stack?.name || "ai-stack")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    a.download = `${safeName}-starter-kit.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    if (typeof window !== "undefined" && window.plausible) {
      window.plausible("Scaffold Downloaded");
    }
  };

  const copyMd = () => {
    if (!markdown) return;
    navigator.clipboard.writeText(markdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      <style jsx global>{`
        .md-body {
          font-family: var(--font-body, system-ui, sans-serif);
          font-size: 14px;
          line-height: 1.7;
          color: var(--text-default);
        }
        .md-body .md-h1 {
          font-family: var(--font-mono, monospace);
          font-size: 28px;
          color: var(--text-strong);
          letter-spacing: -0.5px;
          margin: 0 0 18px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--border);
        }
        .md-body .md-h2 {
          font-family: var(--font-mono, monospace);
          font-size: 18px;
          color: ${ACCENT};
          letter-spacing: 0.5px;
          margin: 32px 0 12px;
        }
        .md-body .md-h3 {
          font-family: var(--font-mono, monospace);
          font-size: 14px;
          color: var(--text-strong);
          margin: 20px 0 8px;
          letter-spacing: 0.3px;
        }
        .md-body .md-p {
          margin: 0 0 12px;
          color: var(--text-default);
        }
        .md-body .md-list,
        .md-body .md-olist {
          margin: 0 0 14px;
          padding-left: 24px;
        }
        .md-body .md-list li,
        .md-body .md-olist li {
          margin-bottom: 4px;
        }
        .md-body .md-inline {
          background: var(--surface-2);
          padding: 1px 6px;
          border-radius: 4px;
          font-family: var(--font-mono, monospace);
          font-size: 12.5px;
          color: ${ACCENT};
          border: 1px solid var(--border);
        }
        .md-body .md-code {
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 14px 16px;
          font-family: var(--font-mono, monospace);
          font-size: 12.5px;
          line-height: 1.6;
          overflow-x: auto;
          margin: 12px 0 18px;
          color: var(--text-default);
          position: relative;
        }
        .md-body .md-code[data-lang]:not([data-lang=""])::before {
          content: attr(data-lang);
          position: absolute;
          top: 8px;
          right: 12px;
          font-size: 9px;
          letter-spacing: 1.5px;
          color: var(--text-faint);
          text-transform: uppercase;
        }
        .md-body a {
          color: ${ACCENT};
          text-decoration: none;
          border-bottom: 1px dotted ${ACCENT}60;
        }
        .md-body strong {
          color: var(--text-strong);
        }
      `}</style>

      <div
        style={{
          maxWidth: 860,
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
          <span style={{ color: "var(--text-secondary)" }}>Scaffold</span>
        </div>

        {/* Hero */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: 10,
              fontFamily: "monospace",
              letterSpacing: 2,
              color: ACCENT,
              marginBottom: 8,
            }}
          >
            AI STARTER KIT
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
            Turn any stack into{" "}
            <span style={{ color: ACCENT }}>runnable code</span>
          </h1>
          <p
            style={{
              margin: "14px 0 0",
              fontSize: 14,
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              maxWidth: 620,
            }}
          >
            Gemini generates a complete starter kit for your chosen stack —
            architecture diagram, env vars, step-by-step setup code for each
            tool, integration example, deployment recommendations, and cost
            estimates. Download as Markdown and paste into your repo.
          </p>
        </div>

        {/* If no stack — picker */}
        {!stack && !markdown && !loading && <StackPicker onPick={setStack} />}

        {/* Stack + framework controls */}
        {stack && !markdown && !loading && (
          <div style={{ maxWidth: 620, margin: "0 auto" }}>
            <StackPreview stack={stack} />

            <div
              style={{
                padding: 14,
                background: "var(--surface-1)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  fontFamily: "monospace",
                  letterSpacing: 1.5,
                  color: "var(--text-faint)",
                  marginBottom: 10,
                }}
              >
                TARGET FRAMEWORK
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                {FRAMEWORKS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFramework(f.id)}
                    style={{
                      flex: 1,
                      minWidth: 160,
                      padding: "10px 12px",
                      background:
                        framework === f.id ? `${ACCENT}15` : "var(--surface-2)",
                      border: `1px solid ${framework === f.id ? `${ACCENT}50` : "var(--border)"}`,
                      color:
                        framework === f.id ? ACCENT : "var(--text-secondary)",
                      borderRadius: 8,
                      fontFamily: "monospace",
                      fontSize: 11,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>
                      {f.label}
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: "var(--text-faint)",
                        letterSpacing: 0.5,
                      }}
                    >
                      {f.hint}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={generate}
                style={{
                  padding: "14px 28px",
                  background: ACCENT,
                  color: "#000",
                  fontFamily: "monospace",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  boxShadow: `0 6px 24px ${ACCENT}30`,
                }}
              >
                GENERATE STARTER KIT →
              </motion.button>
              <button
                onClick={() => setStack(null)}
                style={{
                  padding: "14px 18px",
                  background: "transparent",
                  color: "var(--text-faint)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  fontFamily: "monospace",
                  fontSize: 11,
                  letterSpacing: 1,
                  cursor: "pointer",
                }}
              >
                PICK DIFFERENT STACK
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                textAlign: "center",
                padding: "8vh 20px",
                maxWidth: 480,
                margin: "0 auto",
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  width: 64,
                  height: 64,
                  margin: "0 auto 22px",
                  borderRadius: "50%",
                  border: `2px solid ${ACCENT}25`,
                  borderTopColor: ACCENT,
                }}
              />
              <div
                style={{
                  fontSize: 10,
                  fontFamily: "monospace",
                  letterSpacing: 2,
                  color: ACCENT,
                  marginBottom: 10,
                }}
              >
                GENERATING YOUR STARTER KIT
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                Writing architecture diagram, wiring code for{" "}
                {validRoles.length} tools, drafting setup steps…
                <br />
                <span
                  style={{ fontSize: 11, color: "var(--text-faint)" }}
                >
                  Usually takes 15–40 seconds.
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <div
            style={{
              padding: "12px 16px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 10,
              fontFamily: "monospace",
              fontSize: 12,
              color: "#f87171",
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {/* Result */}
        {markdown && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {stack && <StackPreview stack={stack} />}

            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                marginBottom: 14,
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={copyMd}
                style={{
                  padding: "8px 14px",
                  background: copied ? "#10b98118" : "var(--surface-1)",
                  color: copied ? "#10b981" : "var(--text-secondary)",
                  border: `1px solid ${copied ? "#10b98150" : "var(--border-bright)"}`,
                  borderRadius: 8,
                  fontFamily: "monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1,
                  cursor: "pointer",
                }}
              >
                {copied ? "✓ COPIED" : "COPY MD"}
              </button>
              <button
                onClick={downloadMd}
                style={{
                  padding: "8px 14px",
                  background: ACCENT,
                  color: "#000",
                  border: `1px solid ${ACCENT}`,
                  borderRadius: 8,
                  fontFamily: "monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1,
                  cursor: "pointer",
                }}
              >
                ↓ DOWNLOAD .MD
              </button>
              <button
                onClick={() => {
                  setMarkdown(null);
                  setError(null);
                }}
                style={{
                  padding: "8px 14px",
                  background: "transparent",
                  color: "var(--text-faint)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontFamily: "monospace",
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                REGENERATE
              </button>
            </div>

            <div
              className="md-body"
              style={{
                padding: "28px 32px",
                background: "var(--surface-1)",
                border: "1px solid var(--border)",
                borderRadius: 14,
              }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
            />
          </motion.div>
        )}
      </div>
    </>
  );
}
