"use client";
import { motion } from "framer-motion";

/**
 * Cinematic letter-by-letter reveal of the archetype name.
 * Each letter drops in + blurs out with slight stagger and glitch feel.
 */
export default function KineticArchetypeTitle({ name, accent = "#00f0ff" }) {
  // Split into "The" prefix + rest so we can style them differently
  const parts = (name || "").split(/\s+/);
  const prefix = parts[0] === "The" ? "The" : null;
  const mainWords = prefix ? parts.slice(1).join(" ") : name;

  const mainLetters = (mainWords || "").split("");

  return (
    <h1
      style={{
        margin: 0,
        fontFamily: "var(--font-mono, monospace)",
        fontSize: "clamp(32px, 6.5vw, 64px)",
        fontWeight: 700,
        color: "var(--text-strong)",
        letterSpacing: -1.8,
        lineHeight: 1.0,
        position: "relative",
        textAlign: "center",
      }}
    >
      {prefix && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 0.55, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            display: "block",
            fontSize: "0.4em",
            fontWeight: 400,
            letterSpacing: 8,
            color: "var(--text-faint)",
            marginBottom: 6,
          }}
        >
          THE
        </motion.div>
      )}

      <span
        style={{
          display: "inline-flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0.18em",
        }}
      >
        {mainLetters.map((ch, i) => {
          if (ch === " ") {
            return (
              <span
                key={i}
                style={{ width: "0.3em", display: "inline-block" }}
              />
            );
          }
          return (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 30, filter: "blur(12px)", scale: 1.3 }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
              transition={{
                duration: 0.55,
                delay: 0.5 + i * 0.05,
                ease: [0.25, 0.85, 0.3, 1],
              }}
              style={{
                display: "inline-block",
                textShadow: `0 0 40px ${accent}60, 0 0 12px ${accent}30`,
              }}
            >
              {ch}
            </motion.span>
          );
        })}
      </span>

      {/* Subtle underline accent */}
      <motion.span
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.7, delay: 1.2, ease: [0.4, 0, 0.2, 1] }}
        style={{
          display: "block",
          height: 1,
          width: "40%",
          margin: "22px auto 0",
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          transformOrigin: "center",
        }}
      />
    </h1>
  );
}
