"use client";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import confetti from "canvas-confetti";
import { TOOLS } from "../data/tools";
import { getToolSlug } from "../lib/tools";
import { getCategoryById } from "../data/categories";
import { getArchetypeBySlug } from "../data/quiz-archetypes";
import { encodeQuizResult } from "../utils/quizResult";
import { encodeCustomStack } from "../utils/customStack";
import StackConstellation from "./StackConstellation";
import SignatureBackground from "./SignatureBackground";

const ACCENT = "#00f0ff";

export default function QuizResultClient({ result }) {
  const [copied, setCopied] = useState(false);

  const archetype = useMemo(
    () => getArchetypeBySlug(result?.archetypeSlug) || null,
    [result?.archetypeSlug]
  );

  const accent = archetype?.accent || ACCENT;

  // Fire confetti on mount (once)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = setTimeout(() => {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.35 },
          colors: [accent, "#ffffff", "#a855f7", "#eab308"],
        });
      } catch {}
    }, 400);
    return () => clearTimeout(t);
  }, [accent]);

  // Plausible
  useEffect(() => {
    if (typeof window !== "undefined" && window.plausible && archetype) {
      window.plausible("Quiz Result Viewed", {
        props: { archetype: archetype.slug },
      });
    }
  }, [archetype]);

  if (!result || !archetype) {
    return (
      <div
        style={{
          maxWidth: 600,
          margin: "80px auto",
          padding: "40px 24px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "monospace",
            fontSize: 22,
            color: "var(--text-strong)",
          }}
        >
          Result not found
        </h1>
        <p
          style={{
            fontFamily: "monospace",
            fontSize: 13,
            color: "var(--text-secondary)",
          }}
        >
          Your quiz link may be invalid or expired.
        </p>
        <Link
          href="/quiz"
          style={{
            display: "inline-block",
            marginTop: 18,
            padding: "10px 20px",
            background: ACCENT,
            color: "#000",
            fontFamily: "monospace",
            fontSize: 11,
            fontWeight: 700,
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          RETAKE QUIZ →
        </Link>
      </div>
    );
  }

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/quiz/result?s=${encodeQuizResult({
          archetype: { slug: archetype.slug },
          answers: result.answers,
          tools: result.tools,
        })}`
      : "";

  const copyShare = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (typeof window !== "undefined" && window.plausible) {
        window.plausible("Quiz Result Shared", {
          props: { archetype: archetype.slug },
        });
      }
    });
  };

  // Build a /build URL with the quiz tools pre-loaded
  const builderUrl = useMemo(() => {
    const customStack = {
      name: `My ${archetype.name} stack`,
      description: archetype.tagline,
      roles: result.tools.map((t) => ({
        label: t.role || "",
        toolId: t.id,
      })),
    };
    return `/build?s=${encodeCustomStack(customStack)}`;
  }, [archetype, result.tools]);

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <SignatureBackground answers={result.answers} archetype={archetype} />

      <div
        style={{
          maxWidth: 920,
          margin: "0 auto",
          padding: "40px 24px 80px",
          position: "relative",
          zIndex: 1,
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
            marginBottom: 28,
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
            href="/quiz"
            style={{ color: "var(--text-faint)", textDecoration: "none" }}
          >
            Quiz
          </Link>
          <span>/</span>
          <span style={{ color: "var(--text-secondary)" }}>Result</span>
        </div>

        {/* Archetype header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: 40 }}
        >
          <div
            style={{
              fontSize: 10,
              fontFamily: "monospace",
              letterSpacing: 2.5,
              color: accent,
              marginBottom: 12,
            }}
          >
            YOU ARE
          </div>
          <h1
            style={{
              margin: 0,
              fontFamily: "monospace",
              fontSize: "clamp(32px, 6vw, 58px)",
              fontWeight: 700,
              color: "var(--text-strong)",
              letterSpacing: -1.5,
              lineHeight: 1.05,
            }}
          >
            {archetype.name}
          </h1>
          <p
            style={{
              margin: "12px auto 0",
              fontFamily: "monospace",
              fontSize: 14,
              color: accent,
              letterSpacing: 0.5,
            }}
          >
            "{archetype.tagline}"
          </p>
          <p
            style={{
              margin: "18px auto 0",
              maxWidth: 580,
              fontSize: 14,
              lineHeight: 1.6,
              color: "var(--text-secondary)",
            }}
          >
            {archetype.identity}
          </p>
        </motion.div>

        {/* Constellation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ marginBottom: 60 }}
        >
          <StackConstellation
            archetype={archetype}
            tools={result.tools}
            reveal={true}
          />
        </motion.div>

        {/* Linear list of tools */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1.2 }}
          style={{ marginBottom: 40 }}
        >
          <div
            style={{
              fontSize: 10,
              fontFamily: "monospace",
              letterSpacing: 2,
              color: "var(--text-faint)",
              marginBottom: 10,
            }}
          >
            YOUR STACK
          </div>
          <h2
            style={{
              margin: "0 0 18px",
              fontFamily: "monospace",
              fontSize: 20,
              color: "var(--text-strong)",
            }}
          >
            {result.tools.length} tools, curated for you
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {result.tools.map((t, i) => {
              const tool = TOOLS.find((x) => x.id === t.id);
              if (!tool) return null;
              const cat = getCategoryById(tool.category);
              const color = cat?.color || accent;
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 1.4 + i * 0.08 }}
                >
                  <Link
                    href={`/tools/${getToolSlug(tool)}`}
                    style={{
                      display: "flex",
                      gap: 14,
                      padding: "14px 16px",
                      background: "var(--surface-1)",
                      border: "1px solid var(--border)",
                      borderLeft: `3px solid ${color}`,
                      borderRadius: 10,
                      textDecoration: "none",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${color}50`;
                      e.currentTarget.style.borderLeftColor = color;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.borderLeftColor = color;
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: 10,
                        color: "var(--text-faint)",
                        flexShrink: 0,
                        marginTop: 3,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "baseline",
                          flexWrap: "wrap",
                          marginBottom: 3,
                        }}
                      >
                        {t.role && (
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: 9,
                              fontWeight: 700,
                              color,
                              letterSpacing: 1,
                            }}
                          >
                            {t.role.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontFamily: "monospace",
                          fontSize: 15,
                          fontWeight: 700,
                          color: "var(--text-strong)",
                          marginBottom: 4,
                        }}
                      >
                        {tool.name}
                      </div>
                      <div
                        style={{
                          fontSize: 12.5,
                          lineHeight: 1.55,
                          color: "var(--text-default)",
                        }}
                      >
                        {t.why || tool.desc}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "#10b981",
                          fontFamily: "monospace",
                          marginTop: 4,
                        }}
                      >
                        {tool.free}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1.8 }}
          style={{
            padding: "28px 24px",
            background: `${accent}08`,
            border: `1px solid ${accent}25`,
            borderRadius: 14,
            textAlign: "center",
            marginBottom: 30,
          }}
        >
          <h2
            style={{
              margin: "0 0 8px",
              fontFamily: "monospace",
              fontSize: 18,
              color: "var(--text-strong)",
            }}
          >
            What now?
          </h2>
          <p
            style={{
              margin: "0 auto 20px",
              maxWidth: 480,
              fontSize: 13,
              lineHeight: 1.6,
              color: "var(--text-secondary)",
            }}
          >
            Customize this stack to taste, or share it with someone who'd
            benefit.
          </p>
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href={builderUrl}
              style={{
                padding: "12px 22px",
                background: accent,
                color: "#000",
                fontFamily: "monospace",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1,
                borderRadius: 10,
                textDecoration: "none",
              }}
            >
              CUSTOMIZE IN BUILDER →
            </Link>
            <button
              onClick={copyShare}
              style={{
                padding: "12px 22px",
                background: copied ? "#10b98118" : "var(--surface-1)",
                color: copied ? "#10b981" : "var(--text-strong)",
                border: `1px solid ${copied ? "#10b98150" : "var(--border-bright)"}`,
                fontFamily: "monospace",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1,
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              {copied ? "✓ LINK COPIED" : "↗ SHARE RESULT"}
            </button>
            <Link
              href="/quiz"
              style={{
                padding: "12px 22px",
                background: "transparent",
                color: "var(--text-faint)",
                border: "1px solid var(--border)",
                fontFamily: "monospace",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1,
                borderRadius: 10,
                textDecoration: "none",
              }}
            >
              RETAKE
            </Link>
          </div>
        </motion.div>

        <div
          style={{
            textAlign: "center",
            fontSize: 10,
            fontFamily: "monospace",
            color: "var(--text-faint)",
            letterSpacing: 1,
          }}
        >
          Generated from the AIArsenal catalog · {TOOLS.length}+ free AI tools
        </div>
      </div>
    </div>
  );
}
