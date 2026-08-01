"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Mermaid Diagram Renderer
 * Renders Mermaid syntax as SVG diagram
 */
export default function MermaidDiagram({ mermaidCode }) {
  const containerRef = useRef(null);
  const [svgContent, setSvgContent] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!mermaidCode || !containerRef.current) return;
    
    let cancelled = false;
    
    const renderMermaid = async () => {
      try {
        // Load mermaid dynamically
        const mermaid = await import("mermaid");
        mermaid.default.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables: {
            primaryColor: "#00f0ff",
            primaryTextColor: "#e2e8f0",
            primaryBorderColor: "#3b82f6",
            lineColor: "#64748b",
            secondaryColor: "#1e293b",
            tertiaryColor: "#0f172a",
            background: "#0f172a",
            mainBkg: "#1e293b",
            secondBkg: "#0f172a",
            tertiaryBkg: "#1e293b",
            textColor: "#e2e8f0",
            fontFamily: "monospace",
            fontSize: "12px",
            nodeBorder: "#3b82f6",
            clusterBkg: "#1e293b",
            clusterBorder: "#3b82f6",
            defaultLinkColor: "#64748b",
            titleColor: "#e2e8f0",
            edgeLabelBackground: "#0f172a",
            actorBorder: "#3b82f6",
            actorBkg: "#1e293b",
            actorTextColor: "#e2e8f0",
            actorLineColor: "#64748b",
            signalColor: "#64748b",
            signalTextColor: "#e2e8f0",
            labelBoxBkgColor: "#1e293b",
            labelBoxBorderColor: "#3b82f6",
            labelTextColor: "#e2e8f0",
            loopTextColor: "#e2e8f0",
            noteBkgColor: "#1e293b",
            noteBorderColor: "#3b82f6",
            noteTextColor: "#e2e8f0",
          },
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: "basis",
            nodeSpacing: 50,
            rankSpacing: 80,
          },
        });

        const { svg } = await mermaid.default.render("architecture-diagram", mermaidCode);
        if (!cancelled) {
          setSvgContent(svg);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      }
    };

    renderMermaid();
    
    return () => {
      cancelled = true;
    };
  }, [mermaidCode]);

  if (error) {
    return (
      <div style={{ 
        color: "#ef4444", 
        fontSize: 11, 
        fontFamily: "monospace",
        padding: 12,
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: 8,
      }}>
        Failed to render diagram: {error}
      </div>
    );
  }

  if (!mermaidCode) {
    return (
      <div
        style={{
          minHeight: 300,
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "var(--text-faint)", fontSize: 12, fontFamily: "monospace" }}>
          No architecture diagram available.
        </div>
      </div>
    );
  }

  // NOTE: dangerouslySetInnerHTML and children are mutually exclusive in React
  // (error #60). Render the placeholder WITHOUT dangerouslySetInnerHTML until
  // the SVG is ready, then render the SVG-only div.
  if (!svgContent) {
    return (
      <div
        ref={containerRef}
        style={{
          minHeight: 300,
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 12,
          overflow: "auto",
        }}
      >
        <div style={{ 
          color: "var(--text-faint)", 
          fontSize: 12, 
          fontFamily: "monospace",
          textAlign: "center",
          padding: 40,
        }}>
          Rendering architecture diagram...
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: 300,
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: 12,
        overflow: "auto",
      }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}