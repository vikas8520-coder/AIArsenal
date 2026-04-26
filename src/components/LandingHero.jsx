"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { TOOLS } from "../data/tools";
import { CATEGORIES } from "../data/categories";
import { ARCHETYPES } from "../data/quiz-archetypes";
import { COMPARISONS } from "../data/comparisons";
import { STACKS } from "../data/stacks";
import HolographicCard from "./HolographicCard";
import KineticCounter from "./KineticCounter";
import GenerativeSigil from "./GenerativeSigil";
import { Scanlines, Grid, CornerMarks, SpecLabel } from "./CyberpunkChrome";
import { readProfile, getEffectiveArchetype } from "../lib/visitorIntel";

const ACCENT = "#00f0ff";

// Headlines that rotate in the live feed at the bottom of the hero.
const FEED = [
  "Nano Banana now in the catalog",
  "207 free AI tools · 96 OSS",
  "Take the 5-question quiz, get your archetype",
  "Pollinations.ai powers our quiz visuals",
  "8 stack recipes · 47 head-to-head comparisons",
  "All 207 tools have AI-curated bestFor / notFor",
  "Save your quiz result to /quiz/library",
];

export default function LandingHero({ accent = ACCENT, onExplore }) {
  const [visible, setVisible] = useState(true);
  const [feedIdx, setFeedIdx] = useState(0);
  const [archetype, setArchetype] = useState(null);

  // Honor the existing splash-gating contract: hidden after first interaction
  useEffect(() => {
    try {
      if (sessionStorage.getItem("aiarsenal-hero-seen")) setVisible(false);
    } catch {}
  }, []);

  // Visitor-intel hint: show inferred archetype if known
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = readProfile();
    setArchetype(getEffectiveArchetype(p));
  }, []);

  // Rotate the feed
  useEffect(() => {
    const i = setInterval(() => setFeedIdx((v) => (v + 1) % FEED.length), 4500);
    return () => clearInterval(i);
  }, []);

  // Stats
  const stats = useMemo(
    () => ({
      tools: TOOLS.length,
      oss: TOOLS.filter((t) => t.oss).length,
      categories: CATEGORIES.length - 1,
      archetypes: ARCHETYPES.length,
      stacks: STACKS.length,
      comparisons: COMPARISONS.length,
    }),
    []
  );

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const sigilSeed = archetype?.slug
    ? `landing-${archetype.slug}`
    : "aiarsenal-2026";

  const handleExplore = () => {
    setVisible(false);
    try {
      sessionStorage.setItem("aiarsenal-hero-seen", "1");
    } catch {}
    if (onExplore) onExplore();
  };

  if (!visible) return null;

  return (
    <section
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "var(--bg, #0a0a0a)",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Layered ambient background — same DNA as the quiz aura */}
      <AmbientBackdrop accent={accent} />
      <Grid color={`${accent}10`} />
      <Scanlines opacity={0.03} />
      <CornerMarks color={accent} inset={28} />

      {/* Top bar */}
      <div
        style={{
          position: "relative",
          zIndex: 5,
          padding: "22px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontFamily: "monospace",
            fontSize: 11,
            letterSpacing: 2,
            color: accent,
          }}
        >
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: accent,
              boxShadow: `0 0 12px ${accent}`,
            }}
          />
          AIARSENAL · v2.0 · LIVE
        </motion.div>
        <div
          style={{
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <SpecLabel label="UPD ·" value={today} accent="var(--text-faint)" />
          {archetype && (
            <SpecLabel
              label="YOU ·"
              value={archetype.name.toUpperCase().replace(/^THE /, "")}
              accent={archetype.accent || accent}
            />
          )}
          <Link
            href="/quiz/library"
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              letterSpacing: 1.5,
              color: "var(--text-faint)",
              textDecoration: "none",
              padding: "4px 10px",
              border: "1px solid var(--border)",
              borderRadius: 4,
            }}
          >
            ★ LIBRARY
          </Link>
        </div>
      </div>

      {/* Centered hero card */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "12px 24px 60px",
          position: "relative",
          zIndex: 5,
          perspective: 1400,
        }}
      >
        <div style={{ width: "100%", maxWidth: 1040 }}>
          <HolographicCard accent={accent}>
            {/* Status row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{
                fontFamily: "monospace",
                fontSize: 10,
                letterSpacing: 3,
                color: accent,
                marginBottom: 18,
                textAlign: "center",
              }}
            >
              ╶──── FREE AI TOOL DIRECTORY ────╴
            </motion.div>

            {/* Hero: split — giant counter on the left, headline on the right */}
            <div
              style={{
                display: "flex",
                gap: 36,
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: 28,
              }}
            >
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{
                  fontFamily: "monospace",
                  fontSize: "clamp(80px, 14vw, 168px)",
                  fontWeight: 700,
                  color: "var(--text-strong)",
                  letterSpacing: -6,
                  lineHeight: 0.85,
                  textShadow: `0 0 80px ${accent}30`,
                  flexShrink: 0,
                }}
              >
                <KineticCounter
                  target={stats.tools}
                  duration={2000}
                  delay={400}
                />
              </motion.div>

              <div style={{ flex: 1, minWidth: 280 }}>
                <h1
                  style={{
                    margin: 0,
                    fontFamily: "monospace",
                    fontSize: "clamp(24px, 4vw, 38px)",
                    fontWeight: 700,
                    color: "var(--text-strong)",
                    letterSpacing: -0.6,
                    lineHeight: 1.1,
                  }}
                >
                  <FlashLetters
                    text="Free AI tools."
                    delay={0.5}
                    accent={accent}
                  />
                </h1>
                <h2
                  style={{
                    margin: "8px 0 0",
                    fontFamily: "monospace",
                    fontSize: "clamp(24px, 4vw, 38px)",
                    fontWeight: 700,
                    color: accent,
                    letterSpacing: -0.6,
                    lineHeight: 1.1,
                  }}
                >
                  <FlashLetters
                    text="One arsenal."
                    delay={1.0}
                    accent={accent}
                  />
                </h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.7 }}
                  style={{
                    margin: "20px 0 0",
                    fontSize: 14,
                    lineHeight: 1.65,
                    color: "var(--text-secondary)",
                    maxWidth: 480,
                  }}
                >
                  Curated, opinionated, hand-updated. Take the 60-second
                  quiz to get a stack picked for you, or browse the catalog.
                </motion.p>
              </div>
            </div>

            {/* Stats grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.9 }}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
                gap: 1,
                background: `${accent}12`,
                border: `1px solid ${accent}25`,
                borderRadius: 10,
                overflow: "hidden",
                marginBottom: 26,
              }}
            >
              <StatTile
                label="OSS TOOLS"
                value={stats.oss}
                accent="#00ff88"
                delay={1900}
              />
              <StatTile
                label="CATEGORIES"
                value={stats.categories}
                accent="#b388ff"
                delay={2000}
              />
              <StatTile
                label="STACKS"
                value={stats.stacks}
                accent="#a855f7"
                delay={2100}
              />
              <StatTile
                label="COMPARISONS"
                value={stats.comparisons}
                accent="#eab308"
                delay={2200}
              />
              <StatTile
                label="ARCHETYPES"
                value={stats.archetypes}
                accent={accent}
                delay={2300}
              />
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 2.4 }}
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 24,
              }}
            >
              <button
                onClick={handleExplore}
                style={{
                  padding: "14px 24px",
                  background: accent,
                  color: "#000",
                  border: "none",
                  fontFamily: "monospace",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  borderRadius: 10,
                  cursor: "pointer",
                  boxShadow: `0 8px 28px ${accent}40`,
                }}
              >
                ◈ EXPLORE TOOLS →
              </button>
              <Link
                href="/quiz"
                onClick={() => {
                  try {
                    sessionStorage.setItem("aiarsenal-hero-seen", "1");
                  } catch {}
                }}
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
                ✨ TAKE THE QUIZ
              </Link>
              <Link
                href="/stacks"
                onClick={() => {
                  try {
                    sessionStorage.setItem("aiarsenal-hero-seen", "1");
                  } catch {}
                }}
                style={{
                  padding: "14px 22px",
                  background: "transparent",
                  color: "var(--text-faint)",
                  border: "1px solid var(--border)",
                  fontFamily: "monospace",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  borderRadius: 10,
                  textDecoration: "none",
                }}
              >
                BROWSE RECIPES
              </Link>
              <Link
                href="/ask"
                onClick={() => {
                  try {
                    sessionStorage.setItem("aiarsenal-hero-seen", "1");
                  } catch {}
                }}
                style={{
                  padding: "14px 22px",
                  background: "transparent",
                  color: "var(--text-faint)",
                  border: "1px solid var(--border)",
                  fontFamily: "monospace",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  borderRadius: 10,
                  textDecoration: "none",
                }}
              >
                ⌕ ASK AI
              </Link>
            </motion.div>

            {/* Footer: feed + sigil */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 2.7 }}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 18,
                paddingTop: 18,
                borderTop: `1px dashed ${accent}25`,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flex: 1,
                  minWidth: 240,
                  fontFamily: "monospace",
                  fontSize: 11,
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    letterSpacing: 2,
                    color: accent,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  ⚡ FEED
                </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={feedIdx}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.35 }}
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {FEED[feedIdx]}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 9,
                    letterSpacing: 1.5,
                    color: "var(--text-faint)",
                    textAlign: "right",
                  }}
                >
                  SITE SIGIL
                </div>
                <GenerativeSigil seed={sigilSeed} color={accent} size={56} />
              </div>
            </motion.div>
          </HolographicCard>
        </div>
      </div>

      {/* Marquee strip — recent additions, scrolls horizontally */}
      <RecentMarquee accent={accent} />

      {/* Scroll cue */}
      <motion.button
        onClick={handleExplore}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 3.2 }}
        whileHover={{ y: -2 }}
        style={{
          position: "absolute",
          bottom: 18,
          left: "50%",
          transform: "translateX(-50%)",
          background: "transparent",
          border: "none",
          color: "var(--text-faint)",
          fontFamily: "monospace",
          fontSize: 10,
          letterSpacing: 2,
          cursor: "pointer",
          zIndex: 5,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        SCROLL FOR DIRECTORY
        <motion.span
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        >
          ↓
        </motion.span>
      </motion.button>
    </section>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function FlashLetters({ text, delay = 0, accent }) {
  return (
    <span
      style={{
        display: "inline-flex",
        flexWrap: "wrap",
        gap: "0.05em",
      }}
    >
      {text.split("").map((ch, i) => {
        if (ch === " ") {
          return (
            <span
              key={i}
              style={{ width: "0.32em", display: "inline-block" }}
            />
          );
        }
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              duration: 0.45,
              delay: delay + i * 0.035,
              ease: [0.25, 0.85, 0.3, 1],
            }}
            style={{
              display: "inline-block",
              textShadow: `0 0 24px ${accent}25`,
            }}
          >
            {ch}
          </motion.span>
        );
      })}
    </span>
  );
}

function StatTile({ label, value, accent, delay }) {
  return (
    <div
      style={{
        padding: "14px 14px",
        background: "rgba(13,13,15,0.7)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontFamily: "monospace",
          letterSpacing: 1.5,
          color: "var(--text-faint)",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 24,
          fontWeight: 700,
          color: accent,
          letterSpacing: -0.5,
          lineHeight: 1,
        }}
      >
        <KineticCounter target={value} duration={1200} delay={delay} pad={2} />
      </div>
    </div>
  );
}

function AmbientBackdrop({ accent }) {
  return (
    <>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 140, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "200vmax",
          height: "200vmax",
          marginTop: "-100vmax",
          marginLeft: "-100vmax",
          zIndex: 0,
          pointerEvents: "none",
          background: `conic-gradient(from 0deg, ${accent}00 0%, ${accent}1c 15%, ${accent}00 30%, #a855f71c 55%, ${accent}00 70%, ${accent}14 85%, ${accent}00 100%)`,
          opacity: 0.6,
        }}
      />
      <motion.div
        animate={{
          x: ["-10%", "12%", "-10%"],
          y: ["-5%", "10%", "-5%"],
        }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "5%",
          left: "5%",
          width: 480,
          height: 480,
          borderRadius: "50%",
          background: accent,
          opacity: 0.16,
          filter: "blur(120px)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <motion.div
        animate={{
          x: ["10%", "-12%", "10%"],
          y: ["10%", "-8%", "10%"],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          bottom: "5%",
          right: "5%",
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: "#a855f7",
          opacity: 0.13,
          filter: "blur(140px)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
    </>
  );
}

function RecentMarquee({ accent }) {
  // Recent tools by dateAdded, top 24
  const recent = useMemo(
    () =>
      [...TOOLS]
        .sort((a, b) => (b.dateAdded || "").localeCompare(a.dateAdded || ""))
        .slice(0, 22),
    []
  );

  // Duplicate the list so the marquee loops seamlessly
  const list = [...recent, ...recent];

  return (
    <div
      style={{
        position: "relative",
        zIndex: 5,
        padding: "12px 0 28px",
        overflow: "hidden",
        maskImage:
          "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 14,
          width: "fit-content",
          animation: "aia-marquee 60s linear infinite",
        }}
      >
        {list.map((t, i) => (
          <span
            key={`${t.id}-${i}`}
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              padding: "6px 14px",
              borderRadius: 6,
              background: "rgba(13,13,15,0.6)",
              border: `1px solid ${accent}20`,
              color: "var(--text-secondary)",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <span style={{ color: accent, marginRight: 8 }}>◈</span>
            {t.name}
          </span>
        ))}
      </div>
      <style jsx global>{`
        @keyframes aia-marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
