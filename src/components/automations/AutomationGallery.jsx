"use client";
import { useState, useMemo } from "react";
import AutomationCard from "./AutomationCard";
import { AUTOMATION_TEMPLATES } from "@/src/data/automations";

const CATEGORIES = [...new Set(AUTOMATION_TEMPLATES.map((t) => t.category))].sort();
const DIFFICULTIES = ["beginner", "intermediate", "advanced"];
const COST_FILTERS = ["Free", "Paid", "Mixed"];

export default function AutomationGallery() {
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterDifficulty, setFilterDifficulty] = useState("All");
  const [filterCost, setFilterCost] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return AUTOMATION_TEMPLATES.filter((t) => {
      if (filterCategory !== "All" && t.category !== filterCategory) return false;
      if (filterDifficulty !== "All" && t.difficulty !== filterDifficulty) return false;
      if (filterCost !== "All") {
        if (filterCost === "Free" && !/free/i.test(t.estimatedCost)) return false;
        if (filterCost === "Paid" && /free/i.test(t.estimatedCost)) return false;
        if (filterCost === "Mixed" && !(/free/i.test(t.estimatedCost) && /paid/i.test(t.estimatedCost.toLowerCase()))) {
          // Mixed means has both free and paid tools - simplified check
          return false;
        }
      }
      if (search) {
        const q = search.toLowerCase();
        if (
          !t.name.toLowerCase().includes(q) &&
          !t.description.toLowerCase().includes(q) &&
          !t.category.toLowerCase().includes(q) &&
          !t.tags?.some((tag) => tag.toLowerCase().includes(q))
        )
          return false;
      }
      return true;
    });
  }, [filterCategory, filterDifficulty, filterCost, search]);

  return (
    <div style={{ padding: "20px 24px 40px" }}>
      {/* Hero */}
      <div style={{ marginBottom: 28, maxWidth: 800 }}>
        <h1
          style={{
            fontFamily: "monospace",
            fontSize: 24,
            fontWeight: 700,
            color: "var(--text-strong)",
            margin: "0 0 8px",
            letterSpacing: 0.3,
          }}
        >
          ⚡ AUTOMATIONS
        </h1>
        <p style={{ fontSize: 12.5, color: "var(--text-mid)", margin: 0, lineHeight: 1.5 }}>
          Pre-built workflows connecting AI tools from the directory. Pick a template, open it in the
          canvas, and tweak it to your needs. All templates are free to use and modify.
        </p>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 20,
          padding: "12px 16px",
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: 12,
        }}
      >
        <input
          type="text"
          placeholder="Search templates…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: 180,
            padding: "8px 12px",
            fontSize: 11,
            fontFamily: "monospace",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--text-strong)",
            outline: "none",
          }}
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={selectStyle}
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value)}
          style={selectStyle}
        >
          <option value="All">All Difficulties</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={filterCost}
          onChange={(e) => setFilterCost(e.target.value)}
          style={selectStyle}
        >
          <option value="All">All Costs</option>
          <option value="Free">Free</option>
          <option value="Paid">Paid</option>
        </select>
      </div>

      {/* Results count */}
      <div style={{ marginBottom: 16, fontSize: 10, color: "var(--text-faint)", fontFamily: "monospace" }}>
        {filtered.length} of {AUTOMATION_TEMPLATES.length} templates
        {(filterCategory !== "All" || filterDifficulty !== "All" || filterCost !== "All" || search) && (
          <span style={{ color: "var(--accent, #00f0ff)" }}>
            &nbsp;—&nbsp;filtered
          </span>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 48,
            color: "var(--text-faint)",
            fontSize: 11.5,
          }}
        >
          No templates match your filters. Try clearing some filters.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 16,
          }}
        >
          {filtered.map((template) => (
            <AutomationCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  );
}

const selectStyle = {
  padding: "8px 12px",
  fontSize: 11,
  fontFamily: "monospace",
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--text-strong)",
  cursor: "pointer",
  outline: "none",
  minWidth: 120,
};