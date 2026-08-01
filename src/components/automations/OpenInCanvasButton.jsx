"use client";

/**
 * Client component for the "Open in Canvas" button with hover effects.
 * Separated to avoid event handlers on server-rendered Link.
 */
export default function OpenInCanvasButton() {
  return (
    <a
      href="/canvas"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: "var(--accent, #00f0ff)",
        color: "#000",
        fontFamily: "monospace",
        fontSize: 11.5,
        fontWeight: 700,
        letterSpacing: 0.5,
        padding: "14px 28px",
        borderRadius: 10,
        textDecoration: "none",
        transition: "all 0.15s",
        boxShadow: "0 4px 16px rgba(0,240,255,0.3)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,240,255,0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,240,255,0.3)";
      }}
    >
      Open in Canvas →
    </a>
  );
}