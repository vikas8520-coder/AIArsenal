import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PAID_TOOLS, BUDGET_BLUEPRINTS, COST_STRATEGIES } from "../data/paid-tools";
import { TOOLS } from "../data/tools";

function getBlueprintTier(budget) {
  if (budget <= 0) return "bootstrap";
  if (budget <= 150) return "growth";
  return "scale";
}

function parsePrice(tier) {
  const match = tier.price.match(/\$([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

function buildOptimalStack(budget) {
  // Score paid tools by value and fit within budget
  const scored = PAID_TOOLS.map((pt) => {
    const minPrice = Math.min(...pt.pricing.tiers.map(parsePrice).filter((p) => p > 0)) || 10;
    return { ...pt, monthlyPrice: minPrice };
  })
    .filter((pt) => pt.monthlyPrice <= budget)
    .sort((a, b) => a.monthlyPrice - b.monthlyPrice);

  const recommended = [];
  let remaining = budget;
  const usedCategories = new Set();

  for (const tool of scored) {
    if (remaining < tool.monthlyPrice) continue;
    if (usedCategories.has(tool.category)) continue;
    recommended.push(tool);
    remaining -= tool.monthlyPrice;
    usedCategories.add(tool.category);
  }

  // Find free alternatives for categories not covered
  const freeAlts = TOOLS.filter(
    (t) => !usedCategories.has(t.category) && t.free && t.free !== "N/A"
  ).slice(0, 3);

  return { recommended, remaining, freeAlts };
}

export default function CostCalculator({ open, onClose, accent = "#00f0ff" }) {
  const [budget, setBudget] = useState(50);

  const tier = getBlueprintTier(budget);
  const blueprint = BUDGET_BLUEPRINTS[tier];
  const { recommended, remaining, freeAlts } = useMemo(() => buildOptimalStack(budget), [budget]);

  const applicableStrategies = useMemo(() => {
    if (budget === 0) return COST_STRATEGIES.filter((s) => s.name === "Free Tier Stacking");
    if (budget <= 50) return COST_STRATEGIES.filter((s) => ["Model Routing", "Free Tier Stacking", "Prompt Optimization"].includes(s.name));
    return COST_STRATEGIES;
  }, [budget]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0, zIndex: 60,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
            }}
          />

          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: "fixed", top: 0, right: 0, bottom: 0,
              zIndex: 61,
              width: 420, maxWidth: "95vw",
              background: "var(--surface-3)",
              backdropFilter: "blur(24px)",
              border: "1px solid var(--border-bright)",
              borderRight: "none",
              boxShadow: "-8px 0 32px rgba(0,0,0,0.3)",
              display: "flex", flexDirection: "column",
            }}
          >
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 16px", borderBottom: "1px solid var(--border)",
            }}>
              <span style={{
                fontFamily: "monospace", fontSize: 11, fontWeight: 600,
                color: accent, letterSpacing: 1.5,
              }}>
                BUDGET CALCULATOR
              </span>
              <button
                onClick={onClose}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "monospace", fontSize: 14, color: "var(--text-faint)",
                  padding: "2px 6px", lineHeight: 1,
                }}
              >
                x
              </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
              {/* Budget slider */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontFamily: "monospace", fontSize: 9, color: "var(--text-faint)", letterSpacing: 1 }}>
                    MONTHLY BUDGET
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-faint)" }}>$</span>
                    <input
                      type="number"
                      min={0}
                      max={500}
                      value={budget}
                      onChange={(e) => setBudget(Math.max(0, Math.min(500, parseInt(e.target.value) || 0)))}
                      style={{
                        width: 60, padding: "4px 6px",
                        background: "var(--surface-1)", border: "1px solid var(--border)",
                        borderRadius: 5, color: accent,
                        fontFamily: "monospace", fontSize: 14, fontWeight: 700,
                        textAlign: "right", outline: "none",
                      }}
                    />
                    <span style={{ fontFamily: "monospace", fontSize: 10, color: "var(--text-faint)" }}>/mo</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={500}
                  step={5}
                  value={budget}
                  onChange={(e) => setBudget(parseInt(e.target.value))}
                  style={{ width: "100%", accentColor: accent }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "monospace", fontSize: 9, color: "var(--text-ghost)" }}>
                  <span>$0</span>
                  <span>$500</span>
                </div>
              </div>

              {/* Blueprint tier */}
              <div style={{
                padding: "12px 14px", marginBottom: 16,
                background: `${accent}08`, border: `1px solid ${accent}20`,
                borderRadius: 10,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{
                    fontSize: 8, padding: "2px 6px",
                    background: `${accent}20`, color: accent,
                    borderRadius: 3, fontFamily: "monospace", fontWeight: 700,
                  }}>
                    {blueprint.label.toUpperCase()}
                  </span>
                  <span style={{ fontFamily: "monospace", fontSize: 10, color: "var(--text-muted)" }}>
                    {blueprint.monthlyBudget}
                  </span>
                </div>
                <p style={{ fontFamily: "monospace", fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                  {blueprint.description}
                </p>
              </div>

              {/* Blueprint stack */}
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontFamily: "monospace", fontSize: 9, color: "var(--text-faint)", letterSpacing: 1 }}>
                  RECOMMENDED STACK
                </span>
                <div style={{ marginTop: 8 }}>
                  {Object.entries(blueprint.stack).map(([key, value]) => (
                    <div key={key} style={{
                      display: "flex", gap: 10, padding: "8px 0",
                      borderBottom: "1px solid var(--border)",
                      fontSize: 10, fontFamily: "monospace",
                    }}>
                      <span style={{ color: accent, fontWeight: 600, width: 90, flexShrink: 0, textTransform: "uppercase", fontSize: 9 }}>
                        {key}
                      </span>
                      <span style={{ color: "var(--text-secondary)", lineHeight: 1.4 }}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optimal combo */}
              {budget > 0 && recommended.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontFamily: "monospace", fontSize: 9, color: "var(--text-faint)", letterSpacing: 1 }}>
                    OPTIMAL COMBINATION (${budget - remaining} of ${budget})
                  </span>
                  <div style={{ marginTop: 8 }}>
                    {recommended.map((tool) => (
                      <div key={tool.name} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "8px 10px", marginBottom: 4,
                        background: "var(--surface-1)", border: "1px solid var(--border)",
                        borderRadius: 7,
                      }}>
                        <div>
                          <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-strong)", fontWeight: 600 }}>
                            {tool.name}
                          </span>
                          <span style={{
                            fontSize: 8, padding: "1px 5px", marginLeft: 6,
                            background: "var(--surface-2)", color: "var(--text-faint)",
                            borderRadius: 3, fontFamily: "monospace",
                          }}>
                            {tool.category}
                          </span>
                        </div>
                        <span style={{ fontFamily: "monospace", fontSize: 10, color: accent, fontWeight: 600 }}>
                          ${tool.monthlyPrice}/mo
                        </span>
                      </div>
                    ))}
                    {freeAlts.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <span style={{ fontFamily: "monospace", fontSize: 8, color: "#00ff88", letterSpacing: 1 }}>
                          + FREE ALTERNATIVES
                        </span>
                        {freeAlts.map((tool) => (
                          <div key={tool.id} style={{
                            display: "flex", justifyContent: "space-between",
                            padding: "6px 10px", marginTop: 4,
                            background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.12)",
                            borderRadius: 7,
                          }}>
                            <span style={{ fontFamily: "monospace", fontSize: 10, color: "var(--text-secondary)" }}>
                              {tool.name}
                            </span>
                            <span style={{ fontFamily: "monospace", fontSize: 9, color: "#00ff88" }}>
                              FREE
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tradeoffs */}
              <div style={{
                padding: "10px 12px", marginBottom: 16,
                background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.15)",
                borderRadius: 8,
              }}>
                <span style={{ fontFamily: "monospace", fontSize: 8, color: "#eab308", letterSpacing: 1 }}>
                  TRADEOFFS
                </span>
                <p style={{ fontFamily: "monospace", fontSize: 10, color: "var(--text-muted)", lineHeight: 1.5, margin: "4px 0 0" }}>
                  {blueprint.tradeoffs}
                </p>
              </div>

              {/* Cost strategies */}
              <div>
                <span style={{ fontFamily: "monospace", fontSize: 9, color: "var(--text-faint)", letterSpacing: 1 }}>
                  COST STRATEGIES
                </span>
                <div style={{ marginTop: 8 }}>
                  {applicableStrategies.map((strategy) => (
                    <div key={strategy.name} style={{
                      padding: "10px 12px", marginBottom: 6,
                      background: "var(--surface-1)", border: "1px solid var(--border)",
                      borderRadius: 8,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-strong)", fontWeight: 600 }}>
                          {strategy.name}
                        </span>
                        <span style={{
                          fontSize: 9, padding: "2px 6px",
                          background: "rgba(0,255,136,0.1)", color: "#00ff88",
                          borderRadius: 3, fontFamily: "monospace", fontWeight: 600,
                        }}>
                          {strategy.savingsEstimate}
                        </span>
                      </div>
                      <p style={{ fontFamily: "monospace", fontSize: 10, color: "var(--text-muted)", lineHeight: 1.4, margin: 0 }}>
                        {strategy.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
