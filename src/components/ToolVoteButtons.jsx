"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

const STORAGE_KEY = "aiarsenal-tool-votes";

function readMyVotes() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeMyVotes(v) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  } catch {}
}

let cachedCounts = null;
let cachedAt = 0;

async function fetchAllCounts() {
  if (cachedCounts && Date.now() - cachedAt < 60_000) {
    return cachedCounts;
  }
  try {
    const res = await fetch("/api/votes", { cache: "no-store" });
    if (!res.ok) return {};
    const data = await res.json();
    cachedCounts = data.counts || {};
    cachedAt = Date.now();
    return cachedCounts;
  } catch {
    return {};
  }
}

/**
 * Compact 👍 / 👎 vote pair with aggregated counts. Stores the user's
 * own vote in localStorage so they can change it but not re-spam.
 *
 * Props:
 *   toolId: required
 *   accent: theme color, defaults to cyan
 *   compact: render smaller (for cards)
 */
export default function ToolVoteButtons({ toolId, accent = "#00f0ff", compact = false }) {
  const [counts, setCounts] = useState({ up: 0, down: 0 });
  const [myVote, setMyVote] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load aggregated counts + my vote on mount
  useEffect(() => {
    let mounted = true;
    fetchAllCounts().then((all) => {
      if (!mounted) return;
      setCounts(all[toolId] || { up: 0, down: 0 });
    });
    setMyVote(readMyVotes()[toolId] || null);
    return () => {
      mounted = false;
    };
  }, [toolId]);

  const submit = useCallback(
    async (vote) => {
      if (loading) return;
      const already = readMyVotes()[toolId];
      if (already === vote) return; // no-op — already voted this way
      setLoading(true);

      // Optimistic update
      setCounts((c) => {
        const next = { ...c };
        if (already === "up") next.up = Math.max(0, next.up - 1);
        if (already === "down") next.down = Math.max(0, next.down - 1);
        next[vote] = (next[vote] || 0) + 1;
        return next;
      });
      setMyVote(vote);
      const all = readMyVotes();
      all[toolId] = vote;
      writeMyVotes(all);

      try {
        await fetch("/api/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolId, vote }),
        });
        if (typeof window !== "undefined" && window.plausible) {
          window.plausible("Tool Voted", {
            props: { vote, toolId },
          });
        }
      } catch {
        // Roll back if the API call fails
        setCounts((c) => {
          const next = { ...c };
          next[vote] = Math.max(0, next[vote] - 1);
          if (already === "up") next.up = next.up + 1;
          if (already === "down") next.down = next.down + 1;
          return next;
        });
        setMyVote(already || null);
        const rolledBack = readMyVotes();
        if (already) rolledBack[toolId] = already;
        else delete rolledBack[toolId];
        writeMyVotes(rolledBack);
      } finally {
        setLoading(false);
      }
    },
    [toolId, loading]
  );

  const sz = compact ? 24 : 28;
  const fs = compact ? 10 : 11;
  const padX = compact ? 8 : 10;

  return (
    <div
      style={{
        display: "inline-flex",
        gap: 6,
        alignItems: "center",
        fontFamily: "monospace",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <VoteButton
        active={myVote === "up"}
        onClick={() => submit("up")}
        accent="#00ff88"
        sz={sz}
        padX={padX}
        fs={fs}
        ariaLabel="Helpful"
      >
        <span aria-hidden>▲</span>
        <span>{counts.up}</span>
      </VoteButton>
      <VoteButton
        active={myVote === "down"}
        onClick={() => submit("down")}
        accent="#ef5350"
        sz={sz}
        padX={padX}
        fs={fs}
        ariaLabel="Not helpful"
      >
        <span aria-hidden>▼</span>
        <span>{counts.down}</span>
      </VoteButton>
    </div>
  );
}

function VoteButton({ active, onClick, accent, sz, padX, fs, ariaLabel, children }) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={active}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        height: sz,
        padding: `0 ${padX}px`,
        background: active ? `${accent}20` : "var(--surface-1)",
        border: `1px solid ${active ? `${accent}60` : "var(--border)"}`,
        color: active ? accent : "var(--text-secondary)",
        borderRadius: 6,
        fontFamily: "monospace",
        fontSize: fs,
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {children}
    </motion.button>
  );
}
