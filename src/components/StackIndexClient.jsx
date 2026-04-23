"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { STACKS } from "../data/stacks";
import { TOOLS } from "../data/tools";
import { getCategoryById } from "../data/categories";

const ACCENT = "#00f0ff";

function StackCard({ stack, index }) {
  const firstTool = TOOLS.find((t) => t.id === stack.roles[0]?.toolId);
  const cat = firstTool ? getCategoryById(firstTool.category) : null;
  const color = cat?.color || ACCENT;
  const diffColor =
    stack.difficulty === "Beginner"
      ? "#10b981"
      : stack.difficulty === "Advanced"
        ? "#ef5350"
        : "#eab308";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: (index % 6) * 0.04 }}
    >
      <Link
        href={`/stacks/${stack.slug}`}
        style={{
          display: "block",
          padding: 20,
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderLeft: `3px solid ${color}`,
          borderRadius: 12,
          textDecoration: "none",
          height: "100%",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = `${color}40`;
          e.currentTarget.style.borderLeftColor = color;
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.borderLeftColor = color;
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontFamily: "monospace",
              padding: "2px 6px",
              background: `${diffColor}12`,
              color: diffColor,
              borderRadius: 3,
              border: `1px solid ${diffColor}25`,
              letterSpacing: 0.5,
            }}
          >
            {stack.difficulty.toUpperCase()}
          </span>
          <span
            style={{
              fontSize: 9,
              fontFamily: "monospace",
              padding: "2px 6px",
              background: "rgba(16,185,129,0.1)",
              color: "#10b981",
              borderRadius: 3,
              letterSpacing: 0.5,
            }}
          >
            {stack.budget}
          </span>
          <span
            style={{
              fontSize: 9,
              fontFamily: "monospace",
              padding: "2px 6px",
              background: "var(--surface-2)",
              color: "var(--text-faint)",
              borderRadius: 3,
              letterSpacing: 0.5,
            }}
          >
            {stack.roles.length} tools
          </span>
        </div>
        <h3
          style={{
            margin: "0 0 8px",
            fontFamily: "monospace",
            fontSize: 17,
            fontWeight: 700,
            color: "var(--text-strong)",
            letterSpacing: -0.3,
            lineHeight: 1.25,
          }}
        >
          {stack.title}
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: 12.5,
            lineHeight: 1.55,
            color: "var(--text-secondary)",
          }}
        >
          {stack.hook}
        </p>
        <div
          style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: "1px dashed var(--border)",
            fontSize: 11,
            fontFamily: "monospace",
            color: "var(--text-faint)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>{stack.useCase}</span>
          <span style={{ color }}>view →</span>
        </div>
      </Link>
    </motion.div>
  );
}

export default function StackIndexClient() {
  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "32px 24px 80px",
      }}
    >
      {/* Back link */}
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

      {/* Hero */}
      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            fontSize: 10,
            fontFamily: "monospace",
            letterSpacing: 2,
            color: ACCENT,
            marginBottom: 10,
          }}
        >
          STACK RECIPES
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: "monospace",
            fontSize: "clamp(28px, 4.5vw, 44px)",
            fontWeight: 700,
            color: "var(--text-strong)",
            letterSpacing: -1,
            lineHeight: 1.1,
          }}
        >
          Build <span style={{ color: ACCENT }}>anything</span>.
          <br />
          With tools that work together.
        </h1>
        <p
          style={{
            margin: "18px 0 0",
            fontSize: 15,
            lineHeight: 1.6,
            color: "var(--text-secondary)",
            maxWidth: 640,
          }}
        >
          Curated multi-tool recipes for specific outcomes. Each stack has a
          role-by-role breakdown, alternatives, quickstart steps, and the
          hidden costs no one tells you about.
        </p>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {STACKS.map((stack, i) => (
          <StackCard key={stack.slug} stack={stack} index={i} />
        ))}
      </div>

      {/* CTA */}
      <div
        style={{
          marginTop: 48,
          padding: "24px 28px",
          background: `${ACCENT}08`,
          border: `1px solid ${ACCENT}25`,
          borderRadius: 14,
          textAlign: "center",
        }}
      >
        <h2
          style={{
            margin: "0 0 8px",
            fontFamily: "monospace",
            fontSize: 18,
            color: "var(--text-strong)",
          }}
        >
          Don't see your use case?
        </h2>
        <p
          style={{
            margin: "0 auto 16px",
            maxWidth: 480,
            fontSize: 13,
            lineHeight: 1.6,
            color: "var(--text-secondary)",
          }}
        >
          Describe what you're building in 1-2 sentences. AIArsenal will put
          together a stack from the 206+ tool catalog.
        </p>
        <Link
          href="/ask"
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
          ASK FOR A CUSTOM STACK →
        </Link>
      </div>
    </div>
  );
}
