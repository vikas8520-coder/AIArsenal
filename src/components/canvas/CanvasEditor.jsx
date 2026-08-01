"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ToolNode from "./ToolNode";
import CanvasSidebar from "./CanvasSidebar";
import CanvasToolbar from "./CanvasToolbar";
import { AUTOMATION_TEMPLATES, templateToFlow } from "@/src/data/automations";

const STORAGE_KEY = "aiarsenal-canvas-v1";

const nodeTypes = { tool: ToolNode };

const defaultEdgeOptions = {
  animated: false,
  style: { stroke: "var(--accent, #00f0ff)", strokeWidth: 1.6 },
};

function CanvasInner() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [saveState, setSaveState] = useState("idle");
  const [templateOpen, setTemplateOpen] = useState(false);
  const [showProperties, setShowProperties] = useState(false);
  const [toast, setToast] = useState(null);

  const wrapperRef = useRef(null);
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const savedNodesRef = useRef(nodes);
  const savedEdgesRef = useRef(edges);

  // ── localStorage: load once on mount ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.nodes)) setNodes(parsed.nodes);
        if (Array.isArray(parsed.edges)) setEdges(parsed.edges);
      }
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  // ── localStorage: debounced save on change ──
  const saveTimer = useRef(null);
  useEffect(() => {
    savedNodesRef.current = nodes;
    savedEdgesRef.current = edges;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }));
      } catch {
        /* storage full — ignore */
      }
    }, 400);
    return () => clearTimeout(saveTimer.current);
  }, [nodes, edges]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  // ── node/edge updates ──
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            label: "data",
            style: { stroke: "var(--accent, #00f0ff)", strokeWidth: 1.6 },
            markerEnd: { type: "arrowclosed", width: 14, height: 14 },
          },
          eds
        )
      ),
    []
  );

  // ── drag & drop from palette ──
  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData("application/aiarsenal-tool");
      if (!raw) return;
      try {
        const tool = JSON.parse(raw);
        const position = screenToFlowPosition({
          x: e.clientX,
          y: e.clientY,
        });
        const id = `tool-${tool.toolId || Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)}`;
        const newNode = {
          id,
          type: "tool",
          position,
          data: {
            label: tool.name,
            category: tool.category,
            subcategory: tool.subcategory,
            description: tool.description,
            pricing: tool.pricing,
            toolId: tool.toolId,
            url: tool.url,
          },
        };
        setNodes((nds) => [...nds, newNode]);
        showToast(`Added ${tool.name} to canvas`);
      } catch {
        /* bad payload */
      }
    },
    [screenToFlowPosition, showToast]
  );

  // ── toolbar actions ──
  const handleClear = useCallback(() => {
    setNodes([]);
    setEdges([]);
    showToast("Canvas cleared");
  }, [showToast]);

  const handleExport = useCallback(() => {
    const data = { nodes, edges, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aiarsenal-canvas-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Canvas exported as JSON");
  }, [nodes, edges, showToast]);

  const handleSave = useCallback(() => {
    setSaveState("saving");
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ nodes: savedNodesRef.current, edges: savedEdgesRef.current })
      );
      setTimeout(() => setSaveState("saved"), 300);
      showToast("Canvas saved to this browser");
    } catch {
      setSaveState("idle");
      showToast("Could not save (storage full)");
    }
  }, [showToast]);

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2, duration: 400 });
  }, [fitView]);

  const loadTemplate = useCallback(
    (template) => {
      const flow = templateToFlow(template);
      setNodes(flow.nodes);
      setEdges(flow.edges);
      setTemplateOpen(false);
      setTimeout(() => fitView({ padding: 0.25, duration: 500 }), 60);
      showToast(`Loaded "${template.name}"`);
    },
    [fitView, showToast]
  );

  const selectedNode = useMemo(
    () => nodes.find((n) => n.selected) || null,
    [nodes]
  );

  const closeProperties = useCallback(() => {
    setNodes((nds) => nds.map((n) => (n.selected ? { ...n, selected: false } : n)));
  }, []);

  const deleteSelected = useCallback(() => {
    if (!selectedNode) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) =>
      eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
    );
    showToast(`Removed ${selectedNode.data?.label || "node"}`);
  }, [selectedNode, showToast]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
        background: "var(--bg)",
      }}
    >
      <CanvasToolbar
        nodeCount={nodes.length}
        edgeCount={edges.length}
        onClear={handleClear}
        onExport={handleExport}
        onSave={handleSave}
        onLoadTemplate={() => setTemplateOpen((v) => !v)}
        onFitView={handleFitView}
        saveState={saveState}
      />

      {/* Template dropdown */}
      {templateOpen && (
        <div
          style={{
            position: "absolute",
            top: 54,
            right: 16,
            zIndex: 40,
            width: 300,
            background: "var(--surface-2)",
            border: "1px solid var(--border-bright)",
            borderRadius: 12,
            boxShadow: "0 16px 48px rgba(0,0,0,0.35)",
            padding: 10,
          }}
        >
          <div style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: "var(--text-mid)", padding: "4px 6px 8px" }}>
            Starter Templates
          </div>
          {AUTOMATION_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => loadTemplate(t)}
              style={{
                width: "100%",
                textAlign: "left",
                background: "var(--surface-1)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "8px 10px",
                marginBottom: 6,
                cursor: "pointer",
                transition: "border-color 0.12s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-bright)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              <div style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 600, color: "var(--text-strong)" }}>
                {t.name}
              </div>
              <div style={{ fontSize: 9.5, color: "var(--text-faint)", marginTop: 2, lineHeight: 1.4 }}>
                {t.description.slice(0, 110)}…
              </div>
            </button>
          ))}
          <div style={{ fontSize: 8.5, color: "var(--text-faint)", padding: "6px 6px 2px", textAlign: "center" }}>
            More templates coming soon — gallery at /automations
          </div>
        </div>
      )}

      <div
        ref={wrapperRef}
        style={{ display: "flex", flex: 1, minHeight: 0, position: "relative" }}
      >
        <CanvasSidebar />

        {/* Canvas area */}
        <div ref={reactFlowWrapper} style={{ flex: 1, position: "relative", width: "100%", height: "100%" }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            fitViewOptions={{ padding: 0.25 }}
            minZoom={0.2}
            maxZoom={2}
            deleteKeyCode={["Backspace", "Delete"]}
            proOptions={{ hideAttribution: false }}
            colorMode="dark"
          >
            <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} color="rgba(120,140,180,0.18)" />
            <Controls position="bottom-left" showInteractive={false} />
            <MiniMap
              position="bottom-right"
              pannable
              zoomable
              nodeColor={(n) => {
                const catColors = {
                  "Developer Tools": "#00ff88",
                  "End-User Tools": "#ff6b9d",
                  "Creative AI": "#ffd700",
                  "MCP Servers": "#12b886",
                  "Git Repos": "#f59e0b",
                };
                return catColors[n.data?.category] || "#64748b";
              }}
              maskColor="rgba(0,0,0,0.6)"
              style={{ background: "var(--surface-1)" }}
            />
          </ReactFlow>
        </div>

        {/* Properties panel */}
        {selectedNode && (
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              zIndex: 30,
              width: 230,
              background: "var(--surface-2)",
              border: "1px solid var(--border-bright)",
              borderRadius: 12,
              padding: 12,
              boxShadow: "0 12px 32px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: "var(--text-mid)" }}>
                Node
              </span>
              <button
                onClick={closeProperties}
                style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", fontSize: 12 }}
                aria-label="Close properties"
              >
                ✕
              </button>
            </div>
            <div style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 600, color: "var(--text-strong)" }}>
              {selectedNode.data?.label}
            </div>
            <div style={{ fontSize: 9.5, color: "var(--text-faint)", marginTop: 2 }}>
              {selectedNode.data?.category} — {selectedNode.data?.subcategory}
            </div>
            {selectedNode.data?.description && (
              <div style={{ fontSize: 10, color: "var(--text-mid)", marginTop: 8, lineHeight: 1.45 }}>
                {selectedNode.data.description}
              </div>
            )}
            {selectedNode.data?.toolId && (
              <a
                href={`/tools/${selectedNode.data.toolId}`}
                style={{ display: "block", marginTop: 8, fontSize: 10, fontFamily: "monospace", color: "var(--accent, #00f0ff)", textDecoration: "none" }}
              >
                → View in directory
              </a>
            )}
            <button
              onClick={deleteSelected}
              style={{
                marginTop: 10,
                width: "100%",
                background: "transparent",
                border: "1px solid var(--danger, #ef4444)",
                color: "var(--danger, #ef4444)",
                borderRadius: 7,
                padding: "5px 8px",
                fontSize: 10,
                fontFamily: "monospace",
                cursor: "pointer",
              }}
            >
              ✕ Delete node
            </button>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--surface-2)",
            border: "1px solid var(--border-bright)",
            borderRadius: 10,
            padding: "10px 18px",
            fontSize: 11,
            fontFamily: "monospace",
            color: "var(--text-strong)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            zIndex: 100,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

export default function CanvasEditor() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
