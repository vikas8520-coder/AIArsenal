"use client";
import Link from "next/link";
import { getCategoryById } from "@/src/data/categories";

/**
 * Individual template card for the automations gallery.
 */
export default function AutomationCard({ template }) {
  const cat = getCategoryById(template.category);
  const difficultyColors = {
    beginner: { bg: "#22c55e15", text: "#22c55e", border: "#22c55e30" },
    intermediate: { bg: "#f59e0b15", text: "#f59e0b", border: "#f59e0b30" },
    advanced: { bg: "#ef444415", text: "#ef4444", border: "#ef444430" },
  };
  const dc = difficultyColors[template.difficulty] || difficultyColors.beginner;

  return (
    <Link
      href={`/automations/${template.slug}`}
      style={{
        textDecoration: "none",
        display: "block",
      }}
    >
      <article
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "16px 18px 18px",
          transition: "all 0.18s",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--border-bright)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.transform = "none";
        }}
      >
        {/* Header: category + difficulty */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span
            style={{
              fontSize: 9,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: "var(--text-faint)",
              background: "var(--surface-1)",
              padding: "2px 8px",
              borderRadius: 4,
            }}
          >
            {template.category}
          </span>
          <span
            style={{
              fontSize: 8.5,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              color: dc.text,
              background: dc.bg,
              border: `1px solid ${dc.border}`,
              padding: "2px 8px",
              borderRadius: 4,
            }}
          >
            {template.difficulty}
          </span>
        </div>

        {/* Name + emoji */}
        <h3
          style={{
            fontSize: 14.5,
            fontFamily: "monospace",
            fontWeight: 700,
            color: "var(--text-strong)",
            margin: "0 0 6px",
            lineHeight: 1.25,
          }}
        >
          <span style={{ fontSize: 18, marginRight: 6, display: "inline-block" }}>
            {template.id === "research-assistant" && "🔍"}
            {template.id === "content-factory" && "✍️"}
            {template.id === "code-review-pipeline" && "⌨️"}
            {template.id === "meeting-notes" && "📝"}
            {template.id === "content-repurposer" && "🔄"}
            {template.id === "support-bot" && "🤖"}
            {template.id === "data-pipeline" && "📊"}
            {template.id === "social-scheduler" && "📱"}
            {template.id === "fullstack-ai-app" && "🏗️"}
            {template.id === "rag-knowledge-base" && "🧠"}
            {template.id === "multi-agent-research" && "🕸️"}
            {template.id === "mcp-orchestrator" && "⚙️"}
          </span>
          {template.name}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: 10.5,
            color: "var(--text-mid)",
            lineHeight: 1.5,
            margin: "0 0 14px",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {template.description}
        </p>

        {/* Meta: cost, time, tools count */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
          <span
            style={{
              fontSize: 9.5,
              fontFamily: "monospace",
              color: "var(--text-faint)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span style={{ fontWeight: 700, color: "var(--text-muted)" }}>💰</span>
            {template.estimatedCost}
          </span>
          <span
            style={{
              fontSize: 9.5,
              fontFamily: "monospace",
              color: "var(--text-faint)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span style={{ fontWeight: 700, color: "var(--text-muted)" }}>⏱</span>
            {template.timeToSetup}
          </span>
          <span
            style={{
              fontSize: 9.5,
              fontFamily: "monospace",
              color: "var(--text-faint)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span style={{ fontWeight: 700, color: "var(--text-muted)" }}>🧩</span>
            {template.nodes?.length || 0} tools
          </span>
        </div>

        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 14 }}>
          {template.tags?.slice(0, 5).map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 8,
                fontFamily: "monospace",
                color: "var(--text-faint)",
                background: "var(--surface-1)",
                border: "1px solid var(--border)",
                padding: "2px 6px",
                borderRadius: 4,
                textTransform: "lowercase",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "10px 0",
            background: "var(--surface-1)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 10,
            fontFamily: "monospace",
            fontWeight: 700,
            color: "var(--accent, #00f0ff)",
            letterSpacing: 0.3,
            transition: "all 0.15s",
          }}
        >
          Open in Canvas →
        </div>
      </article>
    </Link>
  );
}