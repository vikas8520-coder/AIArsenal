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
  useKeyPress,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ToolNode from "./ToolNode";
import CanvasSidebar from "./CanvasSidebar";
import CanvasToolbar from "./CanvasToolbar";
import CanvasAdvisor from "./CanvasAdvisor";
import { AUTOMATION_TEMPLATES, templateToFlow } from "@/src/data/automations";
import { TOOLS } from "@/src/data/tools";
import { GOALS, getGoal, goalToFlow, registerToolInfo } from "@/src/data/goals";
import { getCategoryById } from "@/src/data/categories";

const STORAGE_KEY = "aiarsenal-canvas-v1";

// Register directory tool info so goalToFlow builds real nodes.
TOOLS.forEach(registerToolInfo);

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
  const [advisorOpen, setAdvisorOpen] = useState(true);
  const [activeGoal, setActiveGoal] = useState(null);
  const [toast, setToast] = useState(null);
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [edgePanelId, setEdgePanelId] = useState(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  // ── Undo/Redo history ──
  const [history, setHistory] = useState({ past: [], future: [] });
  const MAX_HISTORY = 50;

  const pushHistory = useCallback((newNodes, newEdges) => {
    setHistory((h) => ({
      past: [...h.past, { nodes: h.past.length ? h.past[h.past.length - 1].nodes : nodes, edges: h.past.length ? h.past[h.past.length - 1].edges : edges }].slice(-MAX_HISTORY),
      future: [],
    }));
  }, [nodes, edges]);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.past.length === 0) return h;
      const previous = h.past[h.past.length - 1];
      const newPast = h.past.slice(0, -1);
      setNodes(previous.nodes);
      setEdges(previous.edges);
      return { past: newPast, future: [{ nodes, edges }, ...h.future].slice(0, MAX_HISTORY) };
    });
    showToast("Undo");
  }, [nodes, edges, showToast]);

  const redo = useCallback(() => {
    setHistory((h) => {
      if (h.future.length === 0) return h;
      const next = h.future[0];
      const newFuture = h.future.slice(1);
      setNodes(next.nodes);
      setEdges(next.edges);
      return { past: [...h.past, { nodes, edges }].slice(-MAX_HISTORY), future: newFuture };
    });
    showToast("Redo");
  }, [nodes, edges, showToast]);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const { screenToFlowPosition, fitView } = useReactFlow();
  const savedNodesRef = useRef(nodes);
  const savedEdgesRef = useRef(edges);
  const saveTimer = useRef(null);
  const didInit = useRef(false);

  const cmdS = useKeyPress(["meta+s", "ctrl+s"]);

  // ── localStorage: load once on mount ──
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
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

  // ── Cmd+S / Ctrl+S saves ──
  useEffect(() => {
    if (cmdS) {
      handleSave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cmdS]);

  // ── Undo/Redo keyboard shortcuts ──
  const cmdZ = useKeyPress(["meta+z", "ctrl+z"]);
  useEffect(() => {
    if (cmdZ) {
      undo();
    }
  }, [cmdZ, undo]);

  const cmdShiftZ = useKeyPress(["meta+shift+z", "ctrl+shift+z"]);
  useEffect(() => {
    if (cmdShiftZ) {
      redo();
    }
  }, [cmdShiftZ, redo]);

  // ── Push history on node/edge changes ──
  const prevNodesRef = useRef(nodes);
  const prevEdgesRef = useRef(edges);
  useEffect(() => {
    if (prevNodesRef.current !== nodes || prevEdgesRef.current !== edges) {
      pushHistory(nodes, edges);
      prevNodesRef.current = nodes;
      prevEdgesRef.current = edges;
    }
  }, [nodes, edges, pushHistory]);

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
        const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
        const id = `tool-${tool.toolId || Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
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

  const handleExport = useCallback(() => {
    const data = { nodes, edges, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aiarsenal-canvas-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Canvas exported as JSON");
  }, [nodes, edges, showToast]);

  const handleClear = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setActiveGoal(null);
    showToast("Canvas cleared");
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
      setActiveGoal(null);
      setTimeout(() => fitView({ padding: 0.25, duration: 500 }), 60);
      showToast(`Loaded "${template.name}"`);
    },
    [fitView, showToast]
  );

  // ── goal → stack ──
  const applyGoal = useCallback(
    (goal) => {
      const flow = goalToFlow(goal);
      setNodes(flow.nodes);
      setEdges(flow.edges);
      setActiveGoal(goal.id);
      setTimeout(() => fitView({ padding: 0.25, duration: 500 }), 60);
      showToast(`Laid out "${goal.title}" stack`);
    },
    [fitView, showToast]
  );

  const addToolById = useCallback(
    (toolId) => {
      const tool = TOOLS.find((t) => t.id === toolId);
      if (!tool) return;
      const cat = getCategoryById(tool.category);
      const id = `tool-${toolId}-${Math.random().toString(36).slice(2, 7)}`;
      const existing = nodes.filter((n) => n.data?.toolId === toolId).length;
      const newNode = {
        id,
        type: "tool",
        position: { x: 80 + existing * 40, y: 80 + existing * 40 },
        data: {
          label: tool.name,
          category: tool.category,
          subcategory: tool.subcategory,
          description: (tool.desc || "").slice(0, 80),
          pricing: tool.free && /free/i.test(tool.free) ? "Free" : "Paid",
          toolId: tool.id,
          url: tool.url,
        },
      };
      setNodes((nds) => [...nds, newNode]);
      showToast(`Added ${tool.name}`);
    },
    [nodes, showToast]
  );

  // ── autolayout with elkjs ──
  const handleAutoLayout = useCallback(async () => {
    if (nodes.length === 0) return;
    const { default: ELK } = await import("elkjs/lib/elk.bundled.js");
    const elk = new ELK();
    const elkNodes = nodes.map((n) => ({
      id: n.id,
      width: 220,
      height: 96,
    }));
    const elkEdges = edges.map((e) => ({ id: e.id, sources: [e.source], targets: [e.target] }));
    const graph = {
      id: "root",
      layoutOptions: {
        "elk.algorithm": "layered",
        "elk.direction": "RIGHT",
        "elk.spacing.nodeNode": "60",
        "elk.layered.spacing.nodeNodeBetweenLayers": "80",
        "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
      },
      children: elkNodes,
      edges: elkEdges,
    };
    try {
      const layout = await elk.layout(graph);
      const pos = new Map(layout.children.map((c) => [c.id, { x: c.x, y: c.y }]));
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          position: pos.get(n.id) || n.position,
          selected: false,
        }))
      );
      setTimeout(() => fitView({ padding: 0.25, duration: 400 }), 80);
      showToast("Auto-layout applied");
    } catch {
      showToast("Auto-layout failed");
    }
  }, [nodes, edges, fitView, showToast]);

  // ── selection state ──
  const selectedNode = useMemo(() => nodes.find((n) => n.selected) || null, [nodes]);
  const selectedEdge = useMemo(() => edges.find((e) => e.selected) || null, [edges]);

  useEffect(() => {
    if (selectedNode) setEdgePanelId(null);
    if (selectedEdge) setEditingNodeId(null);
  }, [selectedNode, selectedEdge]);

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

  const renameNode = useCallback(
    (id, label) => {
      setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label } } : n)));
      setEditingNodeId(null);
    },
    []
  );

  const renameEdge = useCallback(
    (id, label) => {
      setEdges((eds) => eds.map((e) => (e.id === id ? { ...e, label } : e)));
      setEdgePanelId(null);
    },
    []
  );

  const deleteEdge = useCallback(
    (id) => {
      setEdges((eds) => eds.filter((e) => e.id !== id));
      setEdgePanelId(null);
      showToast("Connection removed");
    },
    [showToast]
  );

  const isEmpty = nodes.length === 0;

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
        onAutoLayout={handleAutoLayout}
        onToggleAdvisor={() => setAdvisorOpen((v) => !v)}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        advisorOpen={advisorOpen}
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
        </div>
      )}

      <div style={{ display: "flex", flex: 1, minHeight: 0, position: "relative" }}>
        <CanvasSidebar />

        {/* Canvas area */}
        <div style={{ flex: 1, position: "relative", width: "100%", height: "100%" }}>
          {/* Empty state: goal-first onboarding */}
          {isEmpty && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--bg)",
              }}
            >
              <div style={{ maxWidth: 560, width: "90%", textAlign: "center" }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>◈</div>
                <h1
                  style={{
                    fontFamily: "monospace",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--text-strong)",
                    margin: "0 0 6px",
                    letterSpacing: 0.5,
                  }}
                >
                  What do you want to build?
                </h1>
                <p style={{ fontSize: 11.5, color: "var(--text-faint)", margin: "0 0 20px", lineHeight: 1.5 }}>
                  Pick a goal and we'll lay out the right tools — or drag your own from the palette.
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 8,
                  }}
                >
                  {GOAL_CARDS.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => applyGoal(getGoal(g.id))}
                      style={{
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        padding: "14px 10px",
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--border-bright)";
                        e.currentTarget.style.background = "var(--surface-3)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.background = "var(--surface-2)";
                        e.currentTarget.style.transform = "none";
                      }}
                    >
                      <div style={{ fontSize: 20, marginBottom: 6 }}>{g.emoji}</div>
                      <div style={{ fontSize: 10.5, fontFamily: "monospace", fontWeight: 600, color: "var(--text-strong)", lineHeight: 1.3 }}>
                        {g.title}
                      </div>
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 16, fontSize: 10, color: "var(--text-faint)" }}>
                  or{" "}
                  <button
                    onClick={() => showToast("Drag tools from the palette to start")}
                    style={{ background: "none", border: "none", color: "var(--accent, #00f0ff)", cursor: "pointer", fontSize: 10, fontFamily: "monospace", textDecoration: "underline" }}
                  >
                    start from scratch
                  </button>{" "}
                  with the palette on the left
                </div>
              </div>
            </div>
          )}

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
            onNodeDoubleClick={(_, node) => setEditingNodeId(node.id)}
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
                  "Automation & Agents": "#a78bfa",
                  "Open-Source Models": "#38bdf8",
                };
                return catColors[n.data?.category] || "#64748b";
              }}
              maskColor="rgba(0,0,0,0.6)"
              style={{ background: "var(--surface-1)" }}
            />
          </ReactFlow>

          {/* Node properties panel */}
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
              {editingNodeId === selectedNode.id ? (
                <input
                  autoFocus
                  defaultValue={selectedNode.data?.label}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") renameNode(selectedNode.id, e.target.value);
                    if (e.key === "Escape") setEditingNodeId(null);
                  }}
                  onBlur={(e) => renameNode(selectedNode.id, e.target.value)}
                  style={{
                    width: "100%",
                    background: "var(--surface-1)",
                    border: "1px solid var(--accent, #00f0ff)",
                    borderRadius: 6,
                    padding: "4px 8px",
                    color: "var(--text-strong)",
                    fontFamily: "monospace",
                    fontSize: 12,
                    outline: "none",
                  }}
                />
              ) : (
                <div
                  style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 600, color: "var(--text-strong)", cursor: "pointer" }}
                  onDoubleClick={() => setEditingNodeId(selectedNode.id)}
                  title="Double-click to rename"
                >
                  {selectedNode.data?.label}
                </div>
              )}
              <div style={{ fontSize: 9.5, color: "var(--text-faint)", marginTop: 2 }}>
                {selectedNode.data?.category} — {selectedNode.data?.subcategory}
                {selectedNode.data?.toolId ? ` · ${selectedNode.data.toolId}` : " · custom node"}
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
              <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                <button
                  onClick={() => setEditingNodeId(selectedNode.id)}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "1px solid var(--border-bright)",
                    color: "var(--text-mid)",
                    borderRadius: 7,
                    padding: "5px 8px",
                    fontSize: 10,
                    fontFamily: "monospace",
                    cursor: "pointer",
                  }}
                >
                  ✎ Rename
                </button>
                <button
                  onClick={deleteSelected}
                  style={{
                    flex: 1,
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
                  ✕ Delete
                </button>
              </div>
            </div>
          )}

          {/* Edge panel */}
          {selectedEdge && (
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: "var(--text-mid)" }}>
                  Connection
                </span>
                <button
                  onClick={() => {
                    setEdges((eds) => eds.map((e) => (e.selected ? { ...e, selected: false } : e)));
                  }}
                  style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", fontSize: 12 }}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <div style={{ fontSize: 9.5, color: "var(--text-faint)", marginBottom: 6 }}>
                {nodes.find((n) => n.id === selectedEdge.source)?.data?.label || "?"} →{" "}
                {nodes.find((n) => n.id === selectedEdge.target)?.data?.label || "?"}
              </div>
              <input
                defaultValue={selectedEdge.label || ""}
                placeholder="label (e.g. results)"
                onKeyDown={(e) => {
                  if (e.key === "Enter") renameEdge(selectedEdge.id, e.target.value);
                  if (e.key === "Escape") setEdgePanelId(null);
                }}
                onBlur={(e) => renameEdge(selectedEdge.id, e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--surface-1)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "5px 8px",
                  color: "var(--text-strong)",
                  fontFamily: "monospace",
                  fontSize: 10.5,
                  outline: "none",
                  marginBottom: 8,
                }}
              />
              <button
                onClick={() => deleteEdge(selectedEdge.id)}
                style={{
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
                ✕ Delete connection
              </button>
            </div>
          )}
        </div>

        {/* Advisor panel */}
        {advisorOpen && (
          <CanvasAdvisor
            nodes={nodes}
            edges={edges}
            onApplyGoal={applyGoal}
            onAddTool={addToolById}
            activeGoal={activeGoal}
            setActiveGoal={setActiveGoal}
          />
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

const GOAL_CARDS = [
  { id: "research", emoji: "🔍", title: "Research" },
  { id: "content", emoji: "✍️", title: "Content" },
  { id: "code", emoji: "⌨️", title: "Code" },
  { id: "images", emoji: "🎨", title: "Images" },
  { id: "voice", emoji: "🎙️", title: "Voice" },
  { id: "data", emoji: "📊", title: "Data" },
  { id: "agents", emoji: "🤖", title: "Agents" },
  { id: "local", emoji: "🏠", title: "Local AI" },
  { id: "app", emoji: "🏗️", title: "AI App" },
];

export default function CanvasEditor() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
