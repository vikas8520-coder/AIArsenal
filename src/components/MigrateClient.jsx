"use client";
import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { PAID_TOOLS } from "../data/paid-tools";
import { TOOLS } from "../data/tools";
import { getCategoryById } from "../data/categories";
import { getToolSlug } from "../lib/tools";

const ACCENT = "#10b981"; // green — "save money"

export default function MigrateClient() {
  const [paidTool, setPaidTool] = useState("");
  const [useCase, setUseCase] = useState("");
  const [monthlyCost, setMonthlyCost] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const popularPaid = useMemo(
    () => PAID_TOOLS.slice(0, 12).map((p) => p.name),
    []
  );

  const submit = useCallback(
    async (e) => {
      e?.preventDefault();
      if (!paidTool.trim() || loading) return;
      setLoading(true);
      setError(null);
      setResult(null);
      try {
        const res = await fetch("/api/migrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paidTool: paidTool.trim(),
            useCase: useCase.trim(),
            monthlyCost: monthlyCost.trim(),
          }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        const data = await res.json();
        setResult(data);
        if (typeof window !== "undefined" && window.plausible) {
          window.plausible("Migration Generated", {
            props: { paidTool: paidTool.trim().slice(0, 40) },
          });
        }
      } catch (e2) {
        setError(e2.message);
      } finally {
        setLoading(false);
      }
    },
    [paidTool, useCase, monthlyCost, loading]
  );

  return (
    <div
      style={{
        maxWidth: 880,
        margin: "0 auto",
        padding: "32px 24px 80px",
      }}
    >
      <Link
        href="/"
        style={{
          fontSize: 11,
          fontFamily: "monospace",
          color: "var(--text-faint)",
          textDecoration: "none",
          display: "inline-block",
          marginBottom: 22,
        }}
      >
        ← AIArsenal
      </Link>

      {/* Hero */}
      <div style={{ marginBottom: 30 }}>
        <div
          style={{
            fontSize: 10,
            fontFamily: "monospace",
            letterSpacing: 2,
            color: ACCENT,
            marginBottom: 10,
          }}
        >
          MIGRATION ASSISTANT
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: "monospace",
            fontSize: "clamp(26px, 4.4vw, 42px)",
            fontWeight: 700,
            color: "var(--text-strong)",
            letterSpacing: -0.8,
            lineHeight: 1.15,
          }}
        >
          Cancel a paid AI tool.
          <br />
          <span style={{ color: ACCENT }}>Replace it for $0.</span>
        </h1>
        <p
          style={{
            margin: "14px 0 0",
            fontSize: 14,
            lineHeight: 1.6,
            color: "var(--text-secondary)",
            maxWidth: 580,
          }}
        >
          Tell me what you're paying for. I'll find the closest free
          alternative from the AIArsenal catalog, list the tradeoffs honestly,
          and give you concrete migration steps.
        </p>
      </div>

      {/* Form */}
      {!result && !loading && (
        <form
          onSubmit={submit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: 20,
            background: "var(--surface-1)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            marginBottom: 18,
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: 10,
                fontFamily: "monospace",
                letterSpacing: 1.5,
                color: "var(--text-faint)",
                marginBottom: 6,
              }}
            >
              PAID TOOL YOU WANT TO REPLACE *
            </label>
            <input
              type="text"
              required
              list="popular-paid"
              value={paidTool}
              onChange={(e) => setPaidTool(e.target.value)}
              placeholder="e.g. Cursor Pro, Midjourney, ElevenLabs"
              style={inputStyle}
            />
            <datalist id="popular-paid">
              {popularPaid.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 10,
                  fontFamily: "monospace",
                  letterSpacing: 1.5,
                  color: "var(--text-faint)",
                  marginBottom: 6,
                }}
              >
                YOUR USE CASE (OPTIONAL)
              </label>
              <input
                type="text"
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                placeholder="e.g. shipping a Next.js side project"
                style={inputStyle}
              />
            </div>
            <div style={{ width: 200 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 10,
                  fontFamily: "monospace",
                  letterSpacing: 1.5,
                  color: "var(--text-faint)",
                  marginBottom: 6,
                }}
              >
                CURRENT SPEND (OPTIONAL)
              </label>
              <input
                type="text"
                value={monthlyCost}
                onChange={(e) => setMonthlyCost(e.target.value)}
                placeholder="$20/mo"
                style={inputStyle}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!paidTool.trim()}
            style={{
              padding: "12px 20px",
              background: paidTool.trim() ? ACCENT : "var(--surface-2)",
              color: paidTool.trim() ? "#000" : "var(--text-faint)",
              border: "none",
              fontFamily: "monospace",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.5,
              borderRadius: 10,
              cursor: paidTool.trim() ? "pointer" : "not-allowed",
              alignSelf: "flex-start",
              boxShadow: paidTool.trim() ? `0 6px 24px ${ACCENT}30` : "none",
            }}
          >
            FIND FREE ALTERNATIVES →
          </button>
        </form>
      )}

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              padding: "60px 24px",
              textAlign: "center",
              maxWidth: 480,
              margin: "0 auto",
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                width: 56,
                height: 56,
                margin: "0 auto 18px",
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
                marginBottom: 8,
              }}
            >
              ANALYZING YOUR MIGRATION
            </div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 13,
                color: "var(--text-secondary)",
              }}
            >
              Checking the catalog for {paidTool}'s closest free alternatives…
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            marginBottom: 14,
          }}
        >
          {error}
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", flexDirection: "column", gap: 18 }}
        >
          {/* Best alternative — hero */}
          {result.bestAlternative && (
            <div
              style={{
                padding: "22px 24px",
                background: `linear-gradient(135deg, ${ACCENT}10 0%, ${ACCENT}05 100%)`,
                border: `1px solid ${ACCENT}40`,
                borderRadius: 14,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontFamily: "monospace",
                  letterSpacing: 2,
                  color: ACCENT,
                  marginBottom: 8,
                }}
              >
                ★ BEST FREE REPLACEMENT
              </div>
              <h2
                style={{
                  margin: "0 0 6px",
                  fontFamily: "monospace",
                  fontSize: "clamp(22px, 3vw, 28px)",
                  fontWeight: 700,
                  color: "var(--text-strong)",
                  letterSpacing: -0.3,
                }}
              >
                {result.bestAlternative.name}
              </h2>
              <p
                style={{
                  margin: "4px 0 12px",
                  fontSize: 13.5,
                  color: "var(--text-default)",
                  lineHeight: 1.6,
                }}
              >
                {result.bestAlternative.why}
              </p>
              <div
                style={{
                  fontSize: 11,
                  color: ACCENT,
                  fontFamily: "monospace",
                  marginBottom: 10,
                }}
              >
                Free tier: {result.bestAlternative.free}
              </div>
              <Link
                href={`/tools/${(() => {
                  const t = TOOLS.find((x) => x.id === result.bestAlternative.id);
                  return t ? getToolSlug(t) : "";
                })()}`}
                style={{
                  display: "inline-block",
                  padding: "10px 16px",
                  background: ACCENT,
                  color: "#000",
                  fontFamily: "monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1,
                  borderRadius: 8,
                  textDecoration: "none",
                }}
              >
                VIEW {result.bestAlternative.name.toUpperCase()} →
              </Link>
            </div>
          )}

          {/* Estimated savings */}
          {result.estimatedSavings && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 18px",
                background: "var(--surface-1)",
                border: `1px solid ${ACCENT}30`,
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  fontFamily: "monospace",
                  letterSpacing: 2,
                  color: "var(--text-faint)",
                }}
              >
                YOU SAVE
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 22,
                  fontWeight: 700,
                  color: ACCENT,
                  letterSpacing: -0.5,
                }}
              >
                {result.estimatedSavings}
              </div>
            </div>
          )}

          {/* Other alternatives */}
          {result.alternatives && result.alternatives.length > 0 && (
            <Section label={`OTHER OPTIONS (${result.alternatives.length})`}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {result.alternatives.map((alt) => {
                  const tool = TOOLS.find((t) => t.id === alt.id);
                  if (!tool) return null;
                  const cat = getCategoryById(tool.category);
                  const color = cat?.color || ACCENT;
                  return (
                    <Link
                      key={alt.id}
                      href={`/tools/${getToolSlug(tool)}`}
                      style={{
                        padding: "14px 16px",
                        background: "var(--surface-1)",
                        border: "1px solid var(--border)",
                        borderLeft: `3px solid ${color}`,
                        borderRadius: 10,
                        textDecoration: "none",
                        display: "block",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "monospace",
                          fontSize: 14,
                          fontWeight: 700,
                          color: "var(--text-strong)",
                          marginBottom: 4,
                        }}
                      >
                        {alt.name}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-secondary)",
                          lineHeight: 1.5,
                          marginBottom: 4,
                        }}
                      >
                        {alt.why}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "#10b981",
                          fontFamily: "monospace",
                        }}
                      >
                        {alt.free}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Caveats */}
          {result.caveats && result.caveats.length > 0 && (
            <Section label="⚠ WATCH OUT" labelColor="#eab308">
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {result.caveats.map((c, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: 13,
                      color: "var(--text-default)",
                      display: "flex",
                      gap: 8,
                      lineHeight: 1.55,
                    }}
                  >
                    <span style={{ color: "#eab308", flexShrink: 0 }}>•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Migration steps */}
          {result.migrationSteps && result.migrationSteps.length > 0 && (
            <Section label="MIGRATION STEPS">
              <ol
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {result.migrationSteps.map((s, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      gap: 14,
                      padding: "10px 14px",
                      background: "var(--surface-1)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        width: 24,
                        height: 24,
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
            </Section>
          )}

          {/* Reset */}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              onClick={() => {
                setResult(null);
                setError(null);
              }}
              style={{
                padding: "10px 16px",
                background: "var(--surface-1)",
                color: "var(--text-strong)",
                border: "1px solid var(--border-bright)",
                fontFamily: "monospace",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1,
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              ← MIGRATE ANOTHER TOOL
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  background: "var(--surface-2)",
  border: "1px solid var(--border-bright)",
  borderRadius: 8,
  color: "var(--text-strong)",
  fontFamily: "monospace",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};

function Section({ label, labelColor = "var(--text-faint)", children }) {
  return (
    <div>
      <div
        style={{
          fontSize: 9,
          fontFamily: "monospace",
          letterSpacing: 2,
          color: labelColor,
          marginBottom: 10,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}
