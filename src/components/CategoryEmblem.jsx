"use client";
import { useEffect, useState } from "react";

/**
 * Renders a category's generative emblem if /public/categories/{id}.jpg
 * exists; otherwise falls back to the unicode glyph from categories.js.
 *
 * Pre-loads the image and only swaps in once it's actually loaded so we
 * never show a broken-image icon.
 */
export default function CategoryEmblem({ category, size = 22, accent }) {
  const [loaded, setLoaded] = useState(false);
  const safeId = (category?.id || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const url = safeId ? `/categories/${safeId}.jpg` : null;

  useEffect(() => {
    if (!url) return;
    setLoaded(false);
    const img = new window.Image();
    img.onload = () => setLoaded(true);
    img.src = url;
    return () => {
      img.onload = null;
    };
  }, [url]);

  const color = accent || category?.color || "#00f0ff";

  if (loaded && url) {
    return (
      <span
        aria-hidden
        style={{
          display: "inline-block",
          width: size,
          height: size,
          backgroundImage: `url(${url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: 4,
          border: `1px solid ${color}30`,
          flexShrink: 0,
        }}
      />
    );
  }

  // Glyph fallback
  return (
    <span
      style={{
        fontFamily: "monospace",
        fontSize: Math.round(size * 0.85),
        color,
        lineHeight: 1,
        display: "inline-block",
        width: size,
        height: size,
        textAlign: "center",
      }}
    >
      {category?.icon || "◈"}
    </span>
  );
}
