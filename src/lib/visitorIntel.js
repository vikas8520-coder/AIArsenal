// Client-side visitor intelligence. Everything lives in localStorage,
// nothing is sent over the wire. Exposes a React hook + helpers that
// turn raw browsing behavior into personalization signal.

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { TOOLS } from "../data/tools";
import { ARCHETYPES, scoreArchetypes } from "../data/quiz-archetypes";

const STORAGE_KEY = "aiarsenal-visitor-profile";
const STORAGE_VERSION = 1;

const DEFAULT_PROFILE = {
  version: STORAGE_VERSION,
  firstVisit: null,
  lastVisit: null,
  visitCount: 0,
  // { [toolId]: { count, lastViewed } }
  viewedTools: {},
  // { [category]: count }
  viewedCategories: {},
  // Last 20 search queries
  recentSearches: [],
  // { archetypeSlug, takenAt, answers, tools }
  quizResult: null,
  // Custom stacks from /build
  savedStacks: [],
  // Pages visited { [path]: count }
  pageViews: {},
};

// ── Storage I/O ─────────────────────────────────────────────────────────────
export function readProfile() {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    if (parsed.version !== STORAGE_VERSION) return DEFAULT_PROFILE;
    // Merge with defaults so new fields show up
    return { ...DEFAULT_PROFILE, ...parsed };
  } catch {
    return DEFAULT_PROFILE;
  }
}

function writeProfile(next) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
}

// ── Inference ───────────────────────────────────────────────────────────────
// Infer archetype from click behavior by turning viewed tools into implicit
// "answers" and running them through the same scoring matrix the quiz uses.
//
// Heuristic: for each viewed tool we emit implicit votes on the dimensions
// (building/role/budget/technical/privacy) based on the tool's category,
// oss status, privacy string, etc. Then score as if they took the quiz.
export function inferArchetype(profile) {
  const views = Object.entries(profile.viewedTools || {});
  if (views.length < 3) return null; // need a minimum of signal

  // Tally implicit dimension votes weighted by view count
  const tally = {
    building: {},
    role: {},
    budget: {},
    technical: {},
    privacy: {},
  };

  const bump = (dim, key, weight) => {
    if (!key) return;
    tally[dim][key] = (tally[dim][key] || 0) + weight;
  };

  for (const [toolId, data] of views) {
    const tool = TOOLS.find((t) => t.id === toolId);
    if (!tool) continue;
    const w = Math.log2((data.count || 1) + 1) + 1; // diminishing returns

    // Building — infer from category
    const catBuilding = {
      "Developer Tools": "ship-product",
      "Creative AI": "create-content",
      "Automation & Agents": "automate-work",
      "End-User Tools": "replace-paid",
      "Research & Education": "learn-research",
      "AI Income": "earn-income",
      "Token Economy": "earn-income",
      "Open-Source Models": "learn-research",
    };
    bump("building", catBuilding[tool.category], w);

    // Role — from subcategory hints
    if (tool.category === "Developer Tools") bump("role", "solo-dev", w);
    if (tool.category === "Creative AI") bump("role", "creator", w);
    if (tool.category === "Business AI") bump("role", "biz-ops", w);
    if (tool.category === "Research & Education") bump("role", "researcher", w);
    if (tool.category === "End-User Tools" && !tool.oss) bump("role", "non-technical", w * 0.5);

    // Budget — free-only preference inferred from OSS/free-first clicks
    if (tool.oss) bump("budget", "free-only", w * 0.5);
    if ((tool.free || "").toLowerCase().includes("unlimited")) bump("budget", "free-only", w * 0.5);

    // Technical
    if (tool.category === "Infrastructure") bump("technical", "ml-engineer", w);
    if (tool.category === "Open-Source Models") bump("technical", "ml-engineer", w * 0.5);
    if (tool.category === "Developer Tools") bump("technical", "full-stack", w * 0.7);
    if (tool.category === "End-User Tools") bump("technical", "copy-paste", w * 0.3);
    if (tool.category === "Automation & Agents") bump("technical", "copy-paste", w * 0.5);

    // Privacy
    const priv = (tool.privacy || "").toLowerCase();
    if (priv.includes("local") || priv.includes("self-host") || priv.includes("on-device")) {
      bump("privacy", "self-host", w);
    } else if (priv.includes("not used to train") || priv.includes("no data") || priv.includes("opt-out")) {
      bump("privacy", "no-train", w * 0.5);
    } else {
      bump("privacy", "cloud-ok", w * 0.2);
    }
  }

  // Pick the winning key per dim
  const answers = {};
  for (const dim of Object.keys(tally)) {
    const sorted = Object.entries(tally[dim]).sort((a, b) => b[1] - a[1]);
    answers[dim] = sorted[0]?.[0] || null;
  }

  // Fall back if we didn't get signal on every dim
  const required = ["building", "role", "budget", "technical", "privacy"];
  for (const r of required) {
    if (!answers[r]) answers[r] = defaultAnswer(r);
  }

  const scored = scoreArchetypes(answers);
  const top = scored[0];
  // Require a minimum confidence — the winning score should be > 50% of max
  // possible to avoid suggesting a random archetype from 3 clicks.
  const maxPossible = views.length * 8;
  if (!top || top.score < Math.min(10, maxPossible * 0.3)) return null;
  return {
    slug: top.archetype.slug,
    name: top.archetype.name,
    tagline: top.archetype.tagline,
    accent: top.archetype.accent,
    confidence: Math.min(1, top.score / (maxPossible * 0.6)),
    inferredAnswers: answers,
  };
}

function defaultAnswer(dim) {
  return {
    building: "ship-product",
    role: "solo-dev",
    budget: "under-50",
    technical: "copy-paste",
    privacy: "cloud-ok",
  }[dim];
}

// ── Tracking helpers (call these as side-effects from components) ──────────
export function trackToolView(toolId) {
  if (!toolId) return;
  const p = readProfile();
  const prev = p.viewedTools[toolId] || { count: 0 };
  p.viewedTools = {
    ...p.viewedTools,
    [toolId]: {
      count: prev.count + 1,
      lastViewed: new Date().toISOString(),
    },
  };
  const tool = TOOLS.find((t) => t.id === toolId);
  if (tool) {
    p.viewedCategories = {
      ...p.viewedCategories,
      [tool.category]: (p.viewedCategories[tool.category] || 0) + 1,
    };
  }
  writeProfile(p);
}

export function trackSearch(query) {
  if (!query || query.length < 3) return;
  const p = readProfile();
  const trimmed = query.trim().slice(0, 100);
  p.recentSearches = [
    trimmed,
    ...(p.recentSearches || []).filter((s) => s !== trimmed),
  ].slice(0, 20);
  writeProfile(p);
}

export function trackPageView(path) {
  if (!path) return;
  const p = readProfile();
  p.pageViews = {
    ...p.pageViews,
    [path]: (p.pageViews[path] || 0) + 1,
  };
  writeProfile(p);
}

export function trackVisit() {
  const p = readProfile();
  const now = new Date().toISOString();
  if (!p.firstVisit) p.firstVisit = now;
  const prevLastVisit = p.lastVisit;
  p.lastVisit = now;
  p.visitCount = (p.visitCount || 0) + 1;
  writeProfile(p);
  return prevLastVisit; // caller gets the OLD last visit for "new since"
}

export function setQuizResult(result) {
  if (!result || !result.archetype) return;
  const p = readProfile();
  p.quizResult = {
    archetypeSlug: result.archetype.slug,
    takenAt: new Date().toISOString(),
    answers: result.answers || null,
    toolIds: (result.tools || []).map((t) => t.id),
  };
  writeProfile(p);
}

export function clearProfile() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

// ── Derived getters ─────────────────────────────────────────────────────────
export function getTopViewedTools(profile, limit = 5) {
  return Object.entries(profile.viewedTools || {})
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .map(([id, data]) => ({ id, ...data }));
}

export function getLastViewedTools(profile, limit = 5) {
  return Object.entries(profile.viewedTools || {})
    .sort((a, b) => {
      const aT = new Date(a[1].lastViewed || 0).getTime();
      const bT = new Date(b[1].lastViewed || 0).getTime();
      return bT - aT;
    })
    .slice(0, limit)
    .map(([id, data]) => ({ id, ...data }));
}

// "Effective" archetype — quiz result wins, else inferred.
export function getEffectiveArchetype(profile) {
  if (profile.quizResult?.archetypeSlug) {
    const a = ARCHETYPES.find(
      (x) => x.slug === profile.quizResult.archetypeSlug
    );
    if (a) {
      return {
        slug: a.slug,
        name: a.name,
        tagline: a.tagline,
        accent: a.accent,
        source: "quiz",
        confidence: 1,
      };
    }
  }
  const inferred = inferArchetype(profile);
  if (inferred) return { ...inferred, source: "inferred" };
  return null;
}

// Tools added on or after `sinceIso`.
export function getNewToolsSince(sinceIso) {
  if (!sinceIso) return [];
  const cutoff = new Date(sinceIso).getTime();
  return TOOLS.filter((t) => {
    if (!t.dateAdded) return false;
    return new Date(t.dateAdded).getTime() > cutoff;
  });
}

// ── Hook ───────────────────────────────────────────────────────────────────
export function useVisitorProfile() {
  const [profile, setProfile] = useState(() =>
    typeof window === "undefined" ? DEFAULT_PROFILE : readProfile()
  );
  const hydrated = useRef(false);

  // Sync from storage once on mount (SSR safety)
  useEffect(() => {
    if (!hydrated.current) {
      setProfile(readProfile());
      hydrated.current = true;
    }
    // Listen for changes from other tabs/scripts
    const handler = (e) => {
      if (e.key === STORAGE_KEY) setProfile(readProfile());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const refresh = useCallback(() => {
    setProfile(readProfile());
  }, []);

  return { profile, refresh };
}
