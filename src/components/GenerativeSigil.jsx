"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";

/**
 * Deterministic procedural signature SVG computed from a seed string.
 * Same input → same sigil, always. Different input → completely different.
 * Renders as a compact 120×120 glyph that doubles as the "no one else has
 * this exact card" mark on the quiz result page.
 *
 * Props:
 *   seed:   string (hash input — pass e.g. "solo-shipper|ship-product|...")
 *   color:  accent color for the sigil strokes
 *   size:   pixel size (default 120)
 */

// Fast, deterministic xmur3 → mulberry32 PRNG. Stable across runs.
function makeRng(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = (h ^= h >>> 16);
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function GenerativeSigil({ seed, color = "#00f0ff", size = 120 }) {
  const { paths, dots, ring, label } = useMemo(() => {
    const rng = makeRng(seed || "default");
    const cx = 60;
    const cy = 60;

    // 3-5 radial "rays" at pseudo-random angles, each with a unique inner shape
    const rayCount = 3 + Math.floor(rng() * 3);
    const paths = [];
    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2 + rng() * 0.5;
      const len = 22 + rng() * 20;
      const x2 = cx + Math.cos(angle) * len;
      const y2 = cy + Math.sin(angle) * len;
      // Control point for a curve
      const perp = angle + Math.PI / 2;
      const bend = (rng() - 0.5) * 18;
      const mx = (cx + x2) / 2 + Math.cos(perp) * bend;
      const my = (cy + y2) / 2 + Math.sin(perp) * bend;
      paths.push(`M ${cx} ${cy} Q ${mx} ${my} ${x2} ${y2}`);
    }

    // A few decorative dots scattered around
    const dotCount = 4 + Math.floor(rng() * 4);
    const dots = [];
    for (let i = 0; i < dotCount; i++) {
      const a = rng() * Math.PI * 2;
      const r = 12 + rng() * 34;
      dots.push({
        x: cx + Math.cos(a) * r,
        y: cy + Math.sin(a) * r,
        s: 0.8 + rng() * 1.6,
      });
    }

    // Inner ring variation
    const ring = {
      r1: 10 + Math.floor(rng() * 6),
      r2: 18 + Math.floor(rng() * 8),
      dashA: 1 + Math.floor(rng() * 4),
      dashB: 2 + Math.floor(rng() * 5),
      rotation: Math.floor(rng() * 360),
    };

    // 4-char hex label
    let h = 0;
    for (let i = 0; i < (seed || "").length; i++) {
      h = (h * 31 + (seed || "").charCodeAt(i)) >>> 0;
    }
    const label = h.toString(16).padStart(8, "0").slice(0, 6).toUpperCase();

    return { paths, dots, ring, label };
  }, [seed]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 2.5 }}
      style={{
        width: size,
        height: size,
        position: "relative",
      }}
    >
      <svg
        viewBox="0 0 120 120"
        width={size}
        height={size}
        style={{ display: "block" }}
      >
        {/* Outer ring */}
        <circle
          cx={60}
          cy={60}
          r={54}
          fill="none"
          stroke={color}
          strokeWidth="0.7"
          strokeOpacity="0.4"
        />
        <circle
          cx={60}
          cy={60}
          r={ring.r2}
          fill="none"
          stroke={color}
          strokeWidth="0.6"
          strokeOpacity="0.5"
          strokeDasharray={`${ring.dashA} ${ring.dashB}`}
          transform={`rotate(${ring.rotation} 60 60)`}
        />
        <circle
          cx={60}
          cy={60}
          r={ring.r1}
          fill={color}
          fillOpacity="0.12"
          stroke={color}
          strokeWidth="0.7"
        />

        {/* Procedural rays */}
        {paths.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            fill="none"
            stroke={color}
            strokeWidth="1.4"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.95 }}
            transition={{ duration: 0.9, delay: 2.6 + i * 0.12 }}
          />
        ))}

        {/* Decorative dots */}
        {dots.map((d, i) => (
          <motion.circle
            key={i}
            cx={d.x}
            cy={d.y}
            r={d.s}
            fill={color}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ duration: 0.4, delay: 3.2 + i * 0.08 }}
          />
        ))}

        {/* Center dot */}
        <circle cx={60} cy={60} r={2} fill={color} />
      </svg>

      {/* Hex label below */}
      <div
        style={{
          position: "absolute",
          bottom: -18,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: "var(--font-mono, monospace)",
          fontSize: 9,
          letterSpacing: 2,
          color,
          opacity: 0.6,
        }}
      >
        {label}
      </div>
    </motion.div>
  );
}
