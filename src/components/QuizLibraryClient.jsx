"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  useVisitorProfile,
  removeSavedQuizResult,
} from "../lib/visitorIntel";
import { TOOLS } from "../data/tools";
import { getCategoryById } from "../data/categories";
import GenerativeSigil from "./GenerativeSigil";

const ACCENT = "#00f0ff";

export default function QuizLibraryClient() {
  const { profile, refresh } = useVisitorProfile();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const handleRemove = (id) => {
    removeSavedQuizResult(id);
    refresh();
  };

  const saved = profile.savedQuizResults || [];

  return (
    <div
      style={{
        maxWidth: 1100,
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
          marginBottom: 24,
        }}
      >
        ← AIArsenal
      </Link>

      <div style={{ marginBottom: 36 }}>
        <div
          style={{
            fontSize: 10,
            fontFamily: "monospace",
            letterSpacing: 2.5,
            color: ACCENT,
            marginBottom: 10,
          }}
        >
          QUIZ LIBRARY
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: "monospace",
            fontSize: "clamp(26px, 4.4vw, 40px)",
            fontWeight: 700,
            color: "var(--text-strong)",
            letterSpacing: -0.8,
            lineHeight: 1.15,
          }}
        >
          Your saved <span style={{ color: ACCENT }}>archetypes</span>
        </h1>
        <p
          style={{
            margin: "12px 0 0",
            fontSize: 14,
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            maxWidth: 640,
          }}
        >
          Every result you star is stored locally in this browser. Re-watch
          the story, scaffold the stack, or share the link any time.
        </p>
      </div>

      {!hydrated ? (
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 12,
            color: "var(--text-faint)",
            textAlign: "center",
            padding: "60px 20px",
          }}
        >
          Loading…
        </div>
      ) : saved.length === 0 ? (
        <EmptyLibrary />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          <AnimatePresence>
            {saved.map((entry) => (
              <SavedCard
                key={entry.id}
                entry={entry}
                onRemove={() => handleRemove(entry.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <div
        style={{
          marginTop: 48,
          padding: "20px 24px",
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: "0 0 14px",
            fontSize: 13,
            color: "var(--text-secondary)",
          }}
        >
          Want a different archetype? Take the quiz again with new answers.
        </p>
        <Link
          href="/quiz"
          style={{
            display: "inline-block",
            padding: "12px 22px",
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
          TAKE THE QUIZ →
        </Link>
      </div>
    </div>
  );
}

function EmptyLibrary() {
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
      <div style={{ fontSize: 28, marginBottom: 14 }}>★</div>
      <h2
        style={{
          margin: "0 0 8px",
          fontFamily: "monospace",
          fontSize: 16,
          color: "var(--text-strong)",
        }}
      >
        No saved results yet
      </h2>
      <p
        style={{
          margin: "0 auto 22px",
          maxWidth: 420,
          fontSize: 13,
          color: "var(--text-secondary)",
          lineHeight: 1.6,
        }}
      >
        Take the Stack Quiz and tap{" "}
        <span
          style={{
            fontFamily: "monospace",
            color: "#eab308",
          }}
        >
          ☆ SAVE FOR LATER
        </span>{" "}
        on the result page. Your archetype card will live here for re-watching.
      </p>
      <Link
        href="/quiz"
        style={{
          display: "inline-block",
          padding: "10px 20px",
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
        TAKE THE QUIZ →
      </Link>
    </div>
  );
}

function SavedCard({ entry, onRemove }) {
  const accent = entry.archetypeAccent || ACCENT;
  const sigilSeed =
    entry.archetypeSlug +
    "|" +
    Object.entries(entry.answers || {})
      .sort()
      .map(([k, v]) => `${k}:${v}`)
      .join("|") +
    "|" +
    (entry.tools || []).map((t) => t.id).sort().join(",");

  const savedDate = new Date(entry.savedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      style={{
        padding: 18,
        background: "var(--surface-1)",
        border: `1px solid ${accent}25`,
        borderLeft: `3px solid ${accent}`,
        borderRadius: 12,
        position: "relative",
      }}
    >
      <button
        onClick={onRemove}
        title="Remove from library"
        aria-label="Remove"
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "transparent",
          border: "1px solid var(--border)",
          color: "var(--text-faint)",
          width: 24,
          height: 24,
          borderRadius: 5,
          cursor: "pointer",
          fontSize: 14,
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ×
      </button>

      <div
        style={{
          fontSize: 9,
          fontFamily: "monospace",
          letterSpacing: 2,
          color: "var(--text-faint)",
          marginBottom: 6,
        }}
      >
        SAVED · {savedDate.toUpperCase()}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div style={{ flexShrink: 0 }}>
          <GenerativeSigil seed={sigilSeed} color={accent} size={56} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 16,
              fontWeight: 700,
              color: accent,
              letterSpacing: -0.3,
              lineHeight: 1.15,
              marginBottom: 4,
            }}
          >
            {entry.archetypeName}
          </div>
          {entry.archetypeTagline && (
            <div
              style={{
                fontSize: 11,
                color: "var(--text-faint)",
                fontStyle: "italic",
                lineHeight: 1.4,
              }}
            >
              "{entry.archetypeTagline}"
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          fontSize: 9,
          fontFamily: "monospace",
          letterSpacing: 1.5,
          color: "var(--text-faint)",
          marginBottom: 6,
        }}
      >
        STACK · {(entry.tools || []).length} TOOLS
      </div>
      <div
        style={{
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        {(entry.tools || []).slice(0, 6).map((t) => {
          const tool = TOOLS.find((x) => x.id === t.id);
          if (!tool) return null;
          const cat = getCategoryById(tool.category);
          const color = cat?.color || accent;
          return (
            <span
              key={t.id}
              style={{
                fontSize: 10,
                fontFamily: "monospace",
                padding: "2px 7px",
                background: `${color}12`,
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

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <Link
          href={`/quiz/result?s=${entry.encoded}`}
          style={{
            padding: "8px 12px",
            background: accent,
            color: "#000",
            fontFamily: "monospace",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1,
            borderRadius: 6,
            textDecoration: "none",
          }}
        >
          ▶ REWATCH
        </Link>
        <Link
          href={`/scaffold?s=${entry.encoded}`}
          style={{
            padding: "8px 12px",
            background: "var(--surface-2)",
            color: "var(--text-strong)",
            border: "1px solid var(--border-bright)",
            fontFamily: "monospace",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1,
            borderRadius: 6,
            textDecoration: "none",
          }}
        >
          ⚡ SCAFFOLD
        </Link>
        <a
          href={`/api/quiz/poster?s=${entry.encoded}`}
          download={`aiarsenal-${entry.archetypeSlug}-poster.png`}
          style={{
            padding: "8px 12px",
            background: "var(--surface-2)",
            color: "#a855f7",
            border: "1px solid #a855f750",
            fontFamily: "monospace",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1,
            borderRadius: 6,
            textDecoration: "none",
          }}
        >
          ↓ POSTER
        </a>
      </div>
    </motion.div>
  );
}
