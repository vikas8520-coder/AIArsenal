"use client";
import { motion } from "framer-motion";

/**
 * Reusable cyberpunk texture overlays.
 * - <Scanlines /> : horizontal CRT lines
 * - <Grid />      : 8px hairline grid, radial-faded
 * - <Noise />     : fractal noise grain
 * - <CornerMarks />: ASCII box-drawing corner ornaments
 * - <SpecLabel /> : tiny "LABEL · value" pair
 */

export function Scanlines({ opacity = 0.06 }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity,
        backgroundImage:
          "linear-gradient(transparent 50%, rgba(255,255,255,0.8) 50%)",
        backgroundSize: "100% 3px",
        mixBlendMode: "overlay",
      }}
    />
  );
}

export function Grid({ color = "rgba(255,255,255,0.08)" }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        backgroundImage: `
          linear-gradient(${color} 1px, transparent 1px),
          linear-gradient(90deg, ${color} 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
        maskImage:
          "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        WebkitMaskImage:
          "radial-gradient(ellipse at center, black 30%, transparent 80%)",
      }}
    />
  );
}

export function Noise({ opacity = 0.04 }) {
  return (
    <svg
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity,
        mixBlendMode: "overlay",
      }}
    >
      <filter id="cp-noise">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="1.4"
          numOctaves="2"
          stitchTiles="stitch"
        />
        <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#cp-noise)" />
    </svg>
  );
}

export function CornerMarks({ color = "#00f0ff", size = 22, thickness = 1.5, inset = 24 }) {
  const common = {
    position: "absolute",
    width: size,
    height: size,
    borderColor: color,
    borderStyle: "solid",
    opacity: 0.55,
    pointerEvents: "none",
  };
  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 0.55, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{
          ...common,
          top: inset,
          left: inset,
          borderWidth: `${thickness}px 0 0 ${thickness}px`,
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 0.55, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        style={{
          ...common,
          top: inset,
          right: inset,
          borderWidth: `${thickness}px ${thickness}px 0 0`,
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 0.55, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          ...common,
          bottom: inset,
          left: inset,
          borderWidth: `0 0 ${thickness}px ${thickness}px`,
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 0.55, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        style={{
          ...common,
          bottom: inset,
          right: inset,
          borderWidth: `0 ${thickness}px ${thickness}px 0`,
        }}
      />
    </>
  );
}

export function SpecLabel({ label, value, accent = "#00f0ff" }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "var(--font-mono, monospace)",
        fontSize: 10,
        letterSpacing: 1,
      }}
    >
      <span style={{ color: "var(--text-faint)" }}>{label}</span>
      <span style={{ color: accent, fontWeight: 700 }}>{value}</span>
    </span>
  );
}
