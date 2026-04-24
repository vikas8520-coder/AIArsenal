"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
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
import ArchetypeAura from "./ArchetypeAura";
import HolographicCard from "./HolographicCard";
import KineticArchetypeTitle from "./KineticArchetypeTitle";
import GenerativeSigil from "./GenerativeSigil";
import QuizStoryMode from "./QuizStoryMode";
import {
  setQuizResult as persistQuizResult,
  saveQuizResultToLibrary,
  isQuizResultSaved,
} from "../lib/visitorIntel";

const ACCENT = "#00f0ff";

export default function QuizResultClient({ result }) {
  const [copied, setCopied] = useState(false);
  // Story mode shows once per result-URL; exit sticks for the session
  const [storyOpen, setStoryOpen] = useState(true);
  const [saved, setSaved] = useState(false);

  const archetype = useMemo(
    () => getArchetypeBySlug(result?.archetypeSlug) || null,
    [result?.archetypeSlug]
  );

  const accent = archetype?.accent || ACCENT;

  // Skip story mode if this URL's result was already seen in this session
  useEffect(() => {
    if (typeof window === "undefined" || !result?.archetypeSlug) return;
    try {
      const key = `aiarsenal-story-seen-${result.archetypeSlug}`;
      if (sessionStorage.getItem(key) === "1") setStoryOpen(false);
    } catch {}
  }, [result?.archetypeSlug]);

  const exitStory = useCallback(() => {
    setStoryOpen(false);
    try {
      if (result?.archetypeSlug) {
        sessionStorage.setItem(
          `aiarsenal-story-seen-${result.archetypeSlug}`,
          "1"
        );
      }
    } catch {}
  }, [result?.archetypeSlug]);

  const replayStory = useCallback(() => {
    try {
      if (result?.archetypeSlug) {
        sessionStorage.removeItem(
          `aiarsenal-story-seen-${result.archetypeSlug}`
        );
      }
    } catch {}
    setStoryOpen(true);
  }, [result?.archetypeSlug]);

  // Fire confetti on mount (once) — only when story is closed
  useEffect(() => {
    if (typeof window === "undefined" || storyOpen) return;
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
  }, [accent, storyOpen]);

  // Plausible
  useEffect(() => {
    if (typeof window !== "undefined" && window.plausible && archetype) {
      window.plausible("Quiz Result Viewed", {
        props: { archetype: archetype.slug },
      });
    }
  }, [archetype]);

  // Persist the result into the visitor profile so future pages
  // know which archetype the user is.
  useEffect(() => {
    if (!archetype || !result) return;
    persistQuizResult({
      archetype,
      answers: result.answers,
      tools: result.tools,
    });
  }, [archetype, result]);

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

  // Encoded payload for the save-library entry — same shape as the share URL
  const quizEncoded = useMemo(() => {
    return encodeQuizResult({
      archetype: { slug: archetype.slug },
      answers: result.answers,
      tools: result.tools,
    });
  }, [archetype.slug, result.answers, result.tools]);

  // Reflect saved-state on mount + after archetype changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    setSaved(isQuizResultSaved(quizEncoded));
  }, [quizEncoded]);

  const handleSave = () => {
    saveQuizResultToLibrary({
      archetype,
      answers: result.answers,
      tools: result.tools,
      encoded: quizEncoded,
      label: archetype.name,
    });
    setSaved(true);
    if (typeof window !== "undefined" && window.plausible) {
      window.plausible("Quiz Result Saved", {
        props: { archetype: archetype.slug },
      });
    }
  };

  // Build a /build and /scaffold URL with the quiz tools pre-loaded
  const stackEncoded = useMemo(() => {
    const customStack = {
      name: `My ${archetype.name} stack`,
      description: archetype.tagline,
      roles: result.tools.map((t) => ({
        label: t.role || "",
        toolId: t.id,
      })),
    };
    return encodeCustomStack(customStack);
  }, [archetype, result.tools]);

  const builderUrl = `/build?s=${stackEncoded}`;
  const scaffoldUrl = `/scaffold?s=${stackEncoded}`;

  // Deterministic seed for the generative sigil — same answers always
  // produce the same mark. Bakes archetype + every answer into the hash.
  const sigilSeed = useMemo(() => {
    const parts = [archetype.slug];
    if (result.answers) {
      for (const k of Object.keys(result.answers).sort()) {
        parts.push(`${k}:${result.answers[k]}`);
      }
    }
    parts.push(...result.tools.map((t) => t.id).sort());
    return parts.join("|");
  }, [archetype.slug, result.answers, result.tools]);

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {storyOpen && (
        <QuizStoryMode
          archetype={archetype}
          result={result}
          sigilSeed={sigilSeed}
          builderUrl={builderUrl}
          scaffoldUrl={scaffoldUrl}
          shareUrl={shareUrl}
          onCopyShare={copyShare}
          copied={copied}
          onExit={exitStory}
        />
      )}
      <ArchetypeAura answers={result.answers} archetype={archetype} />

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

        {/* Holographic identity card — archetype + constellation wrapped as
            a collectible tilting card with cursor-following foil */}
        <div style={{ marginBottom: 48, perspective: 1200 }}>
          <HolographicCard accent={accent}>
            {/* Top row: "YOU ARE" label + 1-of-10 rarity tag */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  fontSize: 10,
                  fontFamily: "monospace",
                  letterSpacing: 2.5,
                  color: accent,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: accent,
                    boxShadow: `0 0 10px ${accent}`,
                  }}
                />
                YOU ARE
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                style={{
                  fontSize: 10,
                  fontFamily: "monospace",
                  letterSpacing: 2,
                  color: "var(--text-faint)",
                  padding: "4px 10px",
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                }}
              >
                1 OF 10 · ARCHETYPE
              </motion.div>
            </div>

            {/* Kinetic title */}
            <div style={{ marginBottom: 14 }}>
              <KineticArchetypeTitle name={archetype.name} accent={accent} />
            </div>

            {/* Tagline + identity */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.5 }}
              style={{
                margin: "0 auto 12px",
                maxWidth: 520,
                fontFamily: "monospace",
                fontSize: 13,
                color: accent,
                letterSpacing: 0.5,
                textAlign: "center",
              }}
            >
              "{archetype.tagline}"
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.7 }}
              style={{
                margin: "0 auto 36px",
                maxWidth: 580,
                fontSize: 13.5,
                lineHeight: 1.65,
                color: "var(--text-secondary)",
                textAlign: "center",
              }}
            >
              {archetype.identity}
            </motion.p>

            {/* Constellation inside the card */}
            <div
              style={{
                position: "relative",
                marginBottom: 10,
              }}
            >
              <StackConstellation
                archetype={archetype}
                tools={result.tools}
                reveal={true}
              />
            </div>

            {/* Bottom row: sigil on the left, serial number on the right */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 2.5 }}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginTop: 40,
                paddingTop: 24,
                borderTop: `1px dashed ${accent}25`,
                gap: 20,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 9,
                    fontFamily: "monospace",
                    letterSpacing: 2,
                    color: "var(--text-faint)",
                    marginBottom: 10,
                  }}
                >
                  SIGIL · UNIQUE TO YOUR ANSWERS
                </div>
                <GenerativeSigil
                  seed={sigilSeed}
                  color={accent}
                  size={96}
                />
              </div>
              <div
                style={{
                  textAlign: "right",
                  fontFamily: "monospace",
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    letterSpacing: 2,
                    color: "var(--text-faint)",
                    marginBottom: 4,
                  }}
                >
                  STACK SIZE
                </div>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: "var(--text-strong)",
                    letterSpacing: -1,
                    lineHeight: 1,
                  }}
                >
                  {String(result.tools.length).padStart(2, "0")}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    letterSpacing: 2,
                    color: "var(--text-faint)",
                    marginTop: 4,
                  }}
                >
                  TOOLS · AIARSENAL
                </div>
              </div>
            </motion.div>
          </HolographicCard>
        </div>

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
              href={scaffoldUrl}
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
              ⚡ GENERATE STARTER KIT →
            </Link>
            <Link
              href={builderUrl}
              style={{
                padding: "12px 22px",
                background: "var(--surface-1)",
                color: "var(--text-strong)",
                border: "1px solid var(--border-bright)",
                fontFamily: "monospace",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1,
                borderRadius: 10,
                textDecoration: "none",
              }}
            >
              CUSTOMIZE →
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
            <button
              onClick={handleSave}
              disabled={saved}
              style={{
                padding: "12px 22px",
                background: saved ? "#eab30818" : "var(--surface-1)",
                color: saved ? "#eab308" : "var(--text-strong)",
                border: `1px solid ${saved ? "#eab30850" : "var(--border-bright)"}`,
                fontFamily: "monospace",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1,
                borderRadius: 10,
                cursor: saved ? "default" : "pointer",
              }}
            >
              {saved ? "★ SAVED" : "☆ SAVE FOR LATER"}
            </button>
            <button
              onClick={replayStory}
              style={{
                padding: "12px 22px",
                background: "transparent",
                color: accent,
                border: `1px solid ${accent}50`,
                fontFamily: "monospace",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1,
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              ▶ REPLAY STORY
            </button>
            <Link
              href="/quiz/library"
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
              YOUR LIBRARY
            </Link>
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
