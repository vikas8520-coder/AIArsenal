"use client";
import { useMemo, useState, useEffect } from "react";
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
import {
  Scanlines,
  Grid,
  CornerMarks,
  SpecLabel,
} from "./CyberpunkChrome";
import {
  readProfile,
  getEffectiveArchetype,
} from "../lib/visitorIntel";

const ACCENT = "#00f0ff";

const TRENDING_HEADLINES = [
  "Nano Banana joined the catalog",
  "Cursor still tops Coding Assistants",
  "Le Chat is the fastest mainstream chatbot in 2026",
  "Pollinations.ai now powers our quiz visuals",
  "8 stack recipes available — try /stacks",
  "Take the 5-question quiz, get your archetype",
  "All 207 tools have AI-curated bestFor / notFor",
];

export default function KineticHero({ accent = ACCENT }) {
  const ossCount = useMemo(() => TOOLS.filter((t) => t.oss).length, []);
  const stats = {
    tools: TOOLS.length,
    oss: ossCount,
    categories: CATEGORIES.length - 1,
    archetypes: ARCHETYPES.length,
    comparisons: COMPARISONS.length,
    stacks: STACKS.length,
  };

  // Personalization: show archetype + a tiny sigil if user has one
  const [archetype, setArchetype] = useState(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = readProfile();
    setArchetype(getEffectiveArchetype(p));
  }, []);

  // Rotate the trending headline
  const [tickerIdx, setTickerIdx] = useState(0);
  useEffect(() => {
    const i = setInterval(() => {
      setTickerIdx((v) => (v + 1) % TRENDING_HEADLINES.length);
    }, 4200);
    return () => clearInterval(i);
  }, []);

  const sigilSeed = useMemo(() => {
    if (archetype?.slug) return `landing-${archetype.slug}`;
    return "landing-2026";
  }, [archetype?.slug]);

  const today = useMemo(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }, []);

  return (
    <div style={{ marginBottom: 28, perspective: 1400 }}>
      <HolographicCard accent={accent}>
        {/* Top spec strip */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: 22,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontFamily: "monospace",
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
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontSize: 10,
                letterSpacing: 2.5,
                color: accent,
                fontWeight: 700,
              }}
            >
              AIARSENAL · v2.0 · LIVE
            </span>
          </div>
          <div
            style={{
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
              fontFamily: "monospace",
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
          </div>
        </div>

        {/* Hero kinetic title — split: BIG NUMBER + small subtitle */}
        <div
          style={{
            display: "flex",
            gap: 28,
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: 24,
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontFamily: "monospace",
              fontSize: "clamp(72px, 14vw, 152px)",
              fontWeight: 700,
              color: "var(--text-strong)",
              letterSpacing: -5,
              lineHeight: 0.85,
              textShadow: `0 0 60px ${accent}30`,
            }}
          >
            <KineticCounter target={stats.tools} duration={1800} delay={400} />
          </motion.div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <h1
              style={{
                margin: 0,
                fontFamily: "monospace",
                fontSize: "clamp(20px, 3.4vw, 30px)",
                fontWeight: 700,
                color: "var(--text-strong)",
                letterSpacing: -0.5,
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
                margin: "10px 0 0",
                fontFamily: "monospace",
                fontSize: "clamp(20px, 3.4vw, 30px)",
                fontWeight: 700,
                color: accent,
                letterSpacing: -0.5,
                lineHeight: 1.1,
              }}
            >
              <FlashLetters
                text="One arsenal."
                delay={0.95}
                accent={accent}
              />
            </h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.5 }}
              style={{
                margin: "16px 0 0",
                fontSize: 13.5,
                lineHeight: 1.6,
                color: "var(--text-secondary)",
                maxWidth: 460,
              }}
            >
              Curated, opinionated, and updated by hand. Take the 60-second
              quiz to get a stack picked for you, or browse the catalog
              below.
            </motion.p>
          </div>
        </div>

        {/* Stats grid — kinetic counters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.7 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
            gap: 1,
            background: `${accent}12`,
            border: `1px solid ${accent}25`,
            borderRadius: 10,
            overflow: "hidden",
            marginBottom: 22,
          }}
        >
          <StatTile
            label="OSS TOOLS"
            value={stats.oss}
            accent="#00ff88"
            delay={1700}
          />
          <StatTile
            label="CATEGORIES"
            value={stats.categories}
            accent="#b388ff"
            delay={1800}
          />
          <StatTile
            label="STACKS"
            value={stats.stacks}
            accent="#a855f7"
            delay={1900}
          />
          <StatTile
            label="COMPARISONS"
            value={stats.comparisons}
            accent="#eab308"
            delay={2000}
          />
          <StatTile
            label="ARCHETYPES"
            value={stats.archetypes}
            accent={accent}
            delay={2100}
          />
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 2.2 }}
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 24,
          }}
        >
          <Link
            href="/quiz"
            style={{
              padding: "14px 22px",
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
            ✨ TAKE THE QUIZ →
          </Link>
          <Link
            href="/build"
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
            + BUILD A STACK
          </Link>
          <Link
            href="/stacks"
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

        {/* Bottom: trending ticker + sigil */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 2.6 }}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
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
                key={tickerIdx}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.35 }}
                style={{ color: "var(--text-secondary)" }}
              >
                {TRENDING_HEADLINES[tickerIdx]}
              </motion.span>
            </AnimatePresence>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
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
              SIGIL
            </div>
            <GenerativeSigil seed={sigilSeed} color={accent} size={48} />
          </div>
        </motion.div>
      </HolographicCard>
    </div>
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
            initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
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
