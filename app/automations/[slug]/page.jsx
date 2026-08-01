import { notFound } from "next/navigation";
import { AUTOMATION_TEMPLATES, getTemplateById, templateToFlow } from "@/src/data/automations";
import Link from "next/link";
import { getCategoryById } from "@/src/data/categories";
import OpenInCanvasButton from "@/src/components/automations/OpenInCanvasButton";

export async function generateStaticParams() {
  return AUTOMATION_TEMPLATES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const template = getTemplateById(slug);
  if (!template) return {};

  const cat = getCategoryById(template.category);
  return {
    title: `${template.name} — Automation Template | AIArsenal`,
    description: `${template.description} Free template. Open in the visual canvas and customize.`,
    openGraph: {
      title: `${template.name} — AIArsenal`,
      description: template.description,
      type: "website",
      url: `/automations/${slug}`,
    },
    alternates: { canonical: `/automations/${slug}` },
  };
}

export default async function AutomationDetailPage({ params }) {
  const { slug } = await params;
  const template = getTemplateById(slug);
  if (!template) notFound();

  const cat = getCategoryById(template.category);
  const difficultyColors = {
    beginner: { bg: "#22c55e15", text: "#22c55e", border: "#22c55e30" },
    intermediate: { bg: "#f59e0b15", text: "#f59e0b", border: "#f59e0b30" },
    advanced: { bg: "#ef444415", text: "#ef4444", border: "#ef444430" },
  };
  const dc = difficultyColors[template.difficulty] || difficultyColors.beginner;

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", padding: "24px 20px 40px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Back link */}
        <Link
          href="/automations"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 20,
            fontSize: 11,
            fontFamily: "monospace",
            color: "var(--text-faint)",
            textDecoration: "none",
          }}
        >
          ← Back to Automations
        </Link>

        {/* Header */}
        <header style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
            <span
              style={{
                fontSize: 10,
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: "var(--text-faint)",
                background: "var(--surface-1)",
                padding: "3px 10px",
                borderRadius: 5,
              }}
            >
              {template.category}
            </span>
            <span
              style={{
                fontSize: 9,
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: "uppercase",
                color: dc.text,
                background: dc.bg,
                border: `1px solid ${dc.border}`,
                padding: "3px 10px",
                borderRadius: 5,
              }}
            >
              {template.difficulty}
            </span>
            <span
              style={{
                fontSize: 9,
                fontFamily: "monospace",
                color: "var(--text-faint)",
                background: "var(--surface-1)",
                padding: "3px 10px",
                borderRadius: 5,
              }}
            >
              {template.nodes?.length || 0} tools
            </span>
          </div>

          <h1
            style={{
              fontFamily: "monospace",
              fontSize: 28,
              fontWeight: 700,
              color: "var(--text-strong)",
              margin: "0 0 8px",
              lineHeight: 1.2,
            }}
          >
            {template.name}
          </h1>

          <p style={{ fontSize: 13, color: "var(--text-mid)", margin: 0, lineHeight: 1.55 }}>
            {template.description}
          </p>
        </header>

        {/* Meta bar */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
            marginBottom: 24,
            padding: "14px 18px",
            background: "var(--surface-1)",
            border: "1px solid var(--border)",
            borderRadius: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontWeight: 700, color: "var(--text-muted)", fontFamily: "monospace", fontSize: 10.5 }}>💰</span>
            <span style={{ fontSize: 10.5, color: "var(--text-strong)", fontFamily: "monospace" }}>
              {template.estimatedCost}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontWeight: 700, color: "var(--text-muted)", fontFamily: "monospace", fontSize: 10.5 }}>⏱</span>
            <span style={{ fontSize: 10.5, color: "var(--text-strong)", fontFamily: "monospace" }}>
              {template.timeToSetup}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontWeight: 700, color: "var(--text-muted)", fontFamily: "monospace", fontSize: 10.5 }}>🧩</span>
            <span style={{ fontSize: 10.5, color: "var(--text-strong)", fontFamily: "monospace" }}>
              {template.nodes?.length || 0} tools
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontWeight: 700, color: "var(--text-muted)", fontFamily: "monospace", fontSize: 10.5 }}>🏷</span>
            <span style={{ fontSize: 10.5, color: "var(--text-strong)", fontFamily: "monospace" }}>
              {template.tags?.join(", ") || "—"}
            </span>
          </div>
        </div>

        {/* Primary CTA */}
        <div style={{ marginBottom: 32 }}>
          <OpenInCanvasButton />
        </div>

        {/* Flow diagram preview */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "var(--text-strong)", margin: "0 0 16px" }}>
            Flow Preview
          </h2>
          <FlowPreview nodes={template.nodes} edges={template.edges} />
        </section>

        {/* Tools used */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "var(--text-strong)", margin: "0 0 16px" }}>
            Tools Used
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
            {template.nodes?.map((node, i) => (
              <ToolBadge key={`${node.id}-${i}`} node={node} />
            ))}
          </div>
        </section>

        {/* Tags */}
        <section>
          <h2 style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "var(--text-strong)", margin: "0 0 12px" }}>
            Tags
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {template.tags?.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 9.5,
                  fontFamily: "monospace",
                  color: "var(--text-mid)",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  padding: "4px 10px",
                  borderRadius: 6,
                  textTransform: "lowercase",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function FlowPreview({ nodes, edges }) {
  if (!nodes || !edges) return <div style={{ color: "var(--text-faint)" }}>No flow data</div>;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const outgoing = new Map();
  edges.forEach((e) => {
    if (!outgoing.has(e.source)) outgoing.set(e.source, []);
    outgoing.get(e.source).push({ target: e.target, label: e.label });
  });

  function renderNode(node, depth = 0, visited = new Set()) {
    if (visited.has(node.id)) {
      // Cycle detected - show a truncated node
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              background: "#64748b15",
              border: "1px solid #64748b30",
              borderRadius: 8,
              marginLeft: depth * 24,
              minWidth: 180,
              opacity: 0.6,
            }}
          >
            <span style={{ color: "#64748b", fontSize: 12 }}>↻</span>
            <span style={{ fontWeight: 600, color: "var(--text-strong)" }}>{node.data?.label}</span>
            <span style={{ fontSize: 8.5, color: "var(--text-faint)", marginLeft: "auto" }}>
              {node.data?.pricing} (cycle)
            </span>
          </div>
        </div>
      );
    }
    visited.add(node.id);

    const cat = node.data?.category;
    const colors = {
      "MCP Servers": "#12b886",
      "End-User Tools": "#ff6b9d",
      "Developer Tools": "#00ff88",
      "Git Repos": "#f59e0b",
      "Creative AI": "#ffd700",
      "Open-Source Models": "#b388ff",
      "Automation & Agents": "#69f0ae",
      "Business AI": "#ffab40",
      "Safety & Ethics": "#ef5350",
      "Token Economy": "#00e5ff",
      "AI Income": "#76ff03",
      "Cost Optimization": "#ff4081",
      "Personal AI Systems": "#a855f7",
      "CLI Tools": "#22d3ee",
      "Reference Servers": "#12b886",
      "Coding & Dev": "#00ff88",
      "Cloud Platforms": "#f59e0b",
      "Productivity & Design": "#ff6b9d",
      "Web Data & Scraping": "#ffd700",
      "Integration Gateways": "#69f0ae",
    };
    const color = colors[cat] || "#64748b";
    const children = outgoing.get(node.id) || [];

    const childElements = children.map((c, idx) => {
      return (
        <div key={`${node.id}-${c.target}-${idx}`} style={{ marginTop: 6 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginLeft: depth * 24 + 40,
              color: "var(--text-faint)",
              fontSize: 9,
              fontFamily: "monospace",
            }}
          >
            <span style={{ color: "var(--accent, #00f0ff)" }}>└─ {c.label} →</span>
          </div>
          <div>{renderNode(nodeMap.get(c.target), depth + 1, new Set(visited))}</div>
        </div>
      );
    });

    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 10px",
            background: `${color}15`,
            border: `1px solid ${color}30`,
            borderRadius: 8,
            marginLeft: depth * 24,
            minWidth: 180,
          }}
        >
          <span style={{ color, fontSize: 12 }}>{cat?.charAt(0) || "◈"}</span>
          <span style={{ fontWeight: 600, color: "var(--text-strong)" }}>{node.data?.label}</span>
          <span style={{ fontSize: 8.5, color: "var(--text-faint)", marginLeft: "auto" }}>
            {node.data?.pricing}
          </span>
        </div>
        {childElements}
      </div>
    );
  }

  // Find root nodes (no incoming edges)
  const hasIncoming = new Set(edges.map((e) => e.target));
  const roots = nodes.filter((n) => !hasIncoming.has(n.id));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {roots.map((root, idx) => (
        <div key={root.id}>{renderNode(root)}</div>
      ))}
    </div>
  );
}

function ToolBadge({ node }) {
  const cat = node.data?.category;
  const colors = {
    "MCP Servers": { bg: "#12b88615", text: "#12b886", border: "#12b88630" },
    "End-User Tools": { bg: "#ff6b9d15", text: "#ff6b9d", border: "#ff6b9d30" },
    "Developer Tools": { bg: "#00ff8815", text: "#00ff88", border: "#00ff8830" },
    "Git Repos": { bg: "#f59e0b15", text: "#f59e0b", border: "#f59e0b30" },
    "Creative AI": { bg: "#ffd70015", text: "#d4a800", border: "#ffd70030" },
    "Open-Source Models": { bg: "#b388ff15", text: "#b388ff", border: "#b388ff30" },
    "Automation & Agents": { bg: "#69f0ae15", text: "#69f0ae", border: "#69f0ae30" },
    "Business AI": { bg: "#ffab4015", text: "#ffab40", border: "#ffab4030" },
    "Safety & Ethics": { bg: "#ef535015", text: "#ef5350", border: "#ef535030" },
    "Token Economy": { bg: "#00e5ff15", text: "#00e5ff", border: "#00e5ff30" },
    "AI Income": { bg: "#76ff0315", text: "#76ff03", border: "#76ff0330" },
    "Cost Optimization": { bg: "#ff408115", text: "#ff4081", border: "#ff408130" },
    "Personal AI Systems": { bg: "#a855f715", text: "#a855f7", border: "#a855f730" },
    "CLI Tools": { bg: "#22d3ee15", text: "#22d3ee", border: "#22d3ee30" },
    "Reference Servers": { bg: "#12b88615", text: "#12b886", border: "#12b88630" },
    "Coding & Dev": { bg: "#00ff8815", text: "#00ff88", border: "#00ff8830" },
    "Cloud Platforms": { bg: "#f59e0b15", text: "#f59e0b", border: "#f59e0b30" },
    "Productivity & Design": { bg: "#ff6b9d15", text: "#ff6b9d", border: "#ff6b9d30" },
    "Web Data & Scraping": { bg: "#ffd70015", text: "#d4a800", border: "#ffd70030" },
    "Integration Gateways": { bg: "#69f0ae15", text: "#69f0ae", border: "#69f0ae30" },
  };
  const c = colors[cat] || { bg: "#64748b15", text: "#64748b", border: "#64748b30" };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 8,
        transition: "all 0.15s",
      }}
    >
      <span style={{ color: c.text, fontSize: 13 }}>{cat?.charAt(0) || "◈"}</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 10.5, fontWeight: 600, color: "var(--text-strong)" }}>
          {node.data?.label}
        </div>
        <div style={{ fontSize: 8.5, color: "var(--text-faint)" }}>
          {cat} — {node.data?.pricing}
        </div>
      </div>
    </div>
  );
}