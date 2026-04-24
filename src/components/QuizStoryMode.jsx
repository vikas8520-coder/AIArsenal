"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { TOOLS } from "../data/tools";
import { getToolSlug } from "../lib/tools";
import { getCategoryById } from "../data/categories";
import { ANSWER_LABELS } from "../data/quiz-archetypes";
import StackConstellation from "./StackConstellation";
import KineticArchetypeTitle from "./KineticArchetypeTitle";
import GenerativeSigil from "./GenerativeSigil";
import {
  Scanlines,
  Grid,
  Noise,
  CornerMarks,
  SpecLabel,
} from "./CyberpunkChrome";

/**
 * Full-viewport Spotify-Wrapped-style story mode for the quiz result.
 * 5 slides, tap/swipe/keyboard to navigate, auto-advances unless paused.
 * Cyberpunk chrome layered across all slides (scanlines, grid, noise,
 * corner ornaments, spec-sheet labels).
 */

const SLIDE_DURATION = 9000;
const TOTAL_SLIDES = 5;

export default function QuizStoryMode({
  archetype,
  result,
  sigilSeed,
  builderUrl,
  scaffoldUrl,
  onExit,
  shareUrl,
  onCopyShare,
  copied,
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const touchStartX = useRef(null);

  const accent = archetype?.accent || "#00f0ff";

  const next = useCallback(() => {
    setIndex((i) => (i + 1 < TOTAL_SLIDES ? i + 1 : i));
    setProgress(0);
  }, []);
  const prev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
    setProgress(0);
  }, []);

  // Auto-advance with progress bar fill
  useEffect(() => {
    if (paused) return;
    const tickMs = 50;
    let elapsed = 0;
    timerRef.current = setInterval(() => {
      elapsed += tickMs;
      const p = Math.min(1, elapsed / SLIDE_DURATION);
      setProgress(p);
      if (p >= 1) {
        clearInterval(timerRef.current);
        if (index + 1 < TOTAL_SLIDES) {
          next();
        } else {
          setPaused(true);
        }
      }
    }, tickMs);
    return () => clearInterval(timerRef.current);
  }, [index, paused, next]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        prev();
      } else if (e.key === "Escape") {
        onExit?.();
      } else if (e.key === "p" || e.key === "P") {
        setPaused((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, onExit]);

  // Swipe nav
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) next();
      else prev();
    }
    touchStartX.current = null;
  };

  // Tap zones: left third → prev, right two-thirds → next
  const onTap = (e) => {
    if (e.target.closest("a, button, input")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 3) prev();
    else next();
  };

  return (
    <div
      onClick={onTap}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "#050506",
        overflow: "hidden",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      {/* Global chrome */}
      <Grid color={`${accent}12`} />
      <Noise opacity={0.05} />
      <Scanlines opacity={0.04} />
      <CornerMarks color={accent} />

      {/* Progress bars at top — Instagram-style */}
      <div
        style={{
          position: "absolute",
          top: 18,
          left: 18,
          right: 18,
          display: "flex",
          gap: 6,
          zIndex: 10,
        }}
      >
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 2.5,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <motion.div
              initial={false}
              animate={{
                width: i < index ? "100%" : i === index ? `${progress * 100}%` : "0%",
              }}
              transition={{ duration: 0.05, ease: "linear" }}
              style={{
                height: "100%",
                background: accent,
                boxShadow: `0 0 8px ${accent}`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Header meta + exit */}
      <div
        style={{
          position: "absolute",
          top: 38,
          left: 24,
          right: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 10,
          fontFamily: "monospace",
          fontSize: 10,
          color: "var(--text-faint)",
          letterSpacing: 2,
        }}
      >
        <span style={{ color: accent }}>
          AIARSENAL · STACK QUIZ
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExit?.();
          }}
          style={{
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--text-faint)",
            fontFamily: "monospace",
            fontSize: 10,
            letterSpacing: 1.5,
            padding: "4px 10px",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          SKIP ⏻
        </button>
      </div>

      {/* Slide content */}
      <AnimatePresence mode="wait">
        {index === 0 && (
          <Slide key="s1">
            <TitleSlide archetype={archetype} accent={accent} />
          </Slide>
        )}
        {index === 1 && (
          <Slide key="s2">
            <SigilSlide sigilSeed={sigilSeed} accent={accent} archetype={archetype} />
          </Slide>
        )}
        {index === 2 && (
          <Slide key="s3">
            <ConstellationSlide
              archetype={archetype}
              tools={result.tools}
              accent={accent}
            />
          </Slide>
        )}
        {index === 3 && (
          <Slide key="s4">
            <SpecSheetSlide tools={result.tools} accent={accent} />
          </Slide>
        )}
        {index === 4 && (
          <Slide key="s5">
            <FinalSlide
              archetype={archetype}
              accent={accent}
              builderUrl={builderUrl}
              scaffoldUrl={scaffoldUrl}
              onCopyShare={onCopyShare}
              copied={copied}
              onExit={onExit}
            />
          </Slide>
        )}
      </AnimatePresence>

      {/* Tap hint */}
      <div
        style={{
          position: "absolute",
          bottom: 22,
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "monospace",
          fontSize: 9,
          letterSpacing: 2,
          color: "var(--text-faint)",
          zIndex: 10,
          opacity: 0.6,
        }}
      >
        TAP OR → TO CONTINUE · ESC TO EXIT
      </div>
    </div>
  );
}

function Slide({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px 60px",
        boxSizing: "border-box",
      }}
    >
      {children}
    </motion.div>
  );
}

// ── Slide 1: Title ──────────────────────────────────────────────────────────
function TitleSlide({ archetype, accent }) {
  return (
    <div style={{ textAlign: "center", maxWidth: 820, width: "100%" }}>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          letterSpacing: 3,
          color: accent,
          marginBottom: 30,
        }}
      >
        ╶──── ARCHETYPE LOCKED ────╴
      </motion.div>

      <KineticArchetypeTitle name={archetype.name} accent={accent} />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.6 }}
        style={{
          margin: "28px auto 0",
          maxWidth: 520,
          fontFamily: "monospace",
          fontSize: 15,
          color: accent,
          letterSpacing: 0.5,
        }}
      >
        &ldquo;{archetype.tagline}&rdquo;
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.9 }}
        style={{
          margin: "22px auto 0",
          maxWidth: 560,
          fontSize: 14,
          lineHeight: 1.7,
          color: "var(--text-secondary)",
        }}
      >
        {archetype.identity}
      </motion.p>
    </div>
  );
}

// ── Slide 2: Sigil ──────────────────────────────────────────────────────────
function SigilSlide({ sigilSeed, accent, archetype }) {
  return (
    <div style={{ textAlign: "center" }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          letterSpacing: 3,
          color: accent,
          marginBottom: 36,
        }}
      >
        ╶──── YOUR SIGIL ────╴
      </motion.div>

      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        style={{ display: "inline-block" }}
      >
        <GenerativeSigil seed={sigilSeed} color={accent} size={280} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        style={{
          marginTop: 54,
          fontFamily: "monospace",
          fontSize: 13,
          color: "var(--text-secondary)",
          maxWidth: 440,
          marginLeft: "auto",
          marginRight: "auto",
          lineHeight: 1.6,
        }}
      >
        A deterministic mark derived from your answers.
        <br />
        <span style={{ color: "var(--text-faint)" }}>
          No one else gets this exact glyph.
        </span>
      </motion.div>
    </div>
  );
}

// ── Slide 3: Constellation ──────────────────────────────────────────────────
function ConstellationSlide({ archetype, tools, accent }) {
  return (
    <div
      style={{
        textAlign: "center",
        width: "100%",
        maxWidth: 720,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          letterSpacing: 3,
          color: accent,
          marginBottom: 20,
        }}
      >
        ╶──── STACK CONSTELLATION · {tools.length} NODES ────╴
      </motion.div>

      <StackConstellation archetype={archetype} tools={tools} reveal={true} />
    </div>
  );
}

// ── Slide 4: Spec sheet ─────────────────────────────────────────────────────
function SpecSheetSlide({ tools, accent }) {
  return (
    <div style={{ width: "100%", maxWidth: 640 }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          letterSpacing: 3,
          color: accent,
          marginBottom: 26,
          textAlign: "center",
        }}
      >
        ╶──── STACK MANIFEST ────╴
      </motion.div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {tools.map((t, i) => {
          const tool = TOOLS.find((x) => x.id === t.id);
          if (!tool) return null;
          const cat = getCategoryById(tool.category);
          const color = cat?.color || accent;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.15 + i * 0.09 }}
              style={{
                padding: "12px 16px",
                background: "rgba(13,13,15,0.7)",
                border: `1px solid ${color}25`,
                borderLeft: `3px solid ${color}`,
                borderRadius: 6,
                fontFamily: "monospace",
                backdropFilter: "blur(8px)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "baseline",
                  flexWrap: "wrap",
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    color,
                    letterSpacing: 1.5,
                    fontWeight: 700,
                  }}
                >
                  NODE.{String(i + 1).padStart(2, "0")}
                </span>
                <span
                  style={{
                    fontSize: 15,
                    color: "var(--text-strong)",
                    fontWeight: 700,
                    letterSpacing: -0.2,
                  }}
                >
                  {tool.name}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 18,
                  flexWrap: "wrap",
                  marginBottom: 6,
                }}
              >
                <SpecLabel
                  label="ROLE ·"
                  value={(t.role || tool.subcategory || "tool").toUpperCase()}
                  accent={color}
                />
                <SpecLabel
                  label="OSS ·"
                  value={tool.oss ? "YES" : "NO"}
                  accent={color}
                />
                <SpecLabel
                  label="TIER ·"
                  value="FREE"
                  accent="#10b981"
                />
              </div>
              {t.why && (
                <div
                  style={{
                    fontSize: 11.5,
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                    marginTop: 4,
                  }}
                >
                  {t.why}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Slide 5: Final CTA ──────────────────────────────────────────────────────
function FinalSlide({
  archetype,
  accent,
  builderUrl,
  scaffoldUrl,
  onCopyShare,
  copied,
  onExit,
}) {
  return (
    <div style={{ textAlign: "center", maxWidth: 620, width: "100%" }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          letterSpacing: 3,
          color: accent,
          marginBottom: 30,
        }}
      >
        ╶──── NOW BUILD IT ────╴
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          fontFamily: "monospace",
          fontSize: "clamp(26px, 4vw, 40px)",
          fontWeight: 700,
          color: "var(--text-strong)",
          margin: "0 0 16px",
          letterSpacing: -1,
          lineHeight: 1.15,
        }}
      >
        Your stack is ready.
        <br />
        <span style={{ color: accent }}>Pick what to do next.</span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        style={{
          margin: "0 auto 36px",
          maxWidth: 460,
          fontSize: 13.5,
          color: "var(--text-secondary)",
          lineHeight: 1.6,
        }}
      >
        Generate a working starter kit, customize the picks in the builder,
        or share your archetype card with a friend.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Link
          href={scaffoldUrl}
          onClick={(e) => e.stopPropagation()}
          style={{
            padding: "14px 26px",
            background: accent,
            color: "#000",
            fontFamily: "monospace",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.5,
            borderRadius: 10,
            textDecoration: "none",
            boxShadow: `0 8px 28px ${accent}40`,
          }}
        >
          ⚡ GENERATE STARTER KIT
        </Link>
        <Link
          href={builderUrl}
          onClick={(e) => e.stopPropagation()}
          style={{
            padding: "14px 22px",
            background: "var(--surface-1)",
            color: "var(--text-strong)",
            border: "1px solid var(--border-bright)",
            fontFamily: "monospace",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.5,
            borderRadius: 10,
            textDecoration: "none",
          }}
        >
          CUSTOMIZE
        </Link>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCopyShare?.();
          }}
          style={{
            padding: "14px 22px",
            background: copied ? "#10b98118" : "transparent",
            color: copied ? "#10b981" : "var(--text-strong)",
            border: `1px solid ${copied ? "#10b98150" : "var(--border)"}`,
            fontFamily: "monospace",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.5,
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          {copied ? "✓ LINK COPIED" : "↗ SHARE"}
        </button>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.3 }}
        onClick={(e) => {
          e.stopPropagation();
          onExit?.();
        }}
        style={{
          marginTop: 44,
          background: "transparent",
          border: "none",
          color: "var(--text-faint)",
          fontFamily: "monospace",
          fontSize: 10,
          letterSpacing: 2,
          cursor: "pointer",
        }}
      >
        VIEW FULL DETAILS ↓
      </motion.button>
    </div>
  );
}
