import { useState, useCallback, useMemo } from "react";
import { TOOLS } from "../data/tools";

const STORAGE_KEY = "aiarsenal-bookmarks";

function loadBookmarks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveBookmarks(set) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {}
}

export default function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(loadBookmarks);

  const toggle = useCallback((id) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveBookmarks(next);
      return next;
    });
  }, []);

  const isBookmarked = useCallback((id) => bookmarks.has(id), [bookmarks]);

  const count = bookmarks.size;

  const bookmarkedTools = useMemo(
    () => TOOLS.filter((t) => bookmarks.has(t.id)),
    [bookmarks]
  );

  const exportMarkdown = useCallback(() => {
    const tools = TOOLS.filter((t) => bookmarks.has(t.id));
    const lines = [
      "# My AI Stack",
      "",
      "| Tool | Category | Free Tier | Link |",
      "|------|----------|-----------|------|",
      ...tools.map(
        (t) =>
          `| ${t.name} | ${t.category} | ${t.free} | [${t.url}](https://${t.url}) |`
      ),
      "",
      `*Exported from [AIArsenal](https://aiarsenal.vercel.app) — ${new Date().toLocaleDateString()}*`,
    ];
    return lines.join("\n");
  }, [bookmarks]);

  const clearAll = useCallback(() => {
    setBookmarks(new Set());
    saveBookmarks(new Set());
  }, []);

  return { bookmarks, toggle, isBookmarked, count, bookmarkedTools, exportMarkdown, clearAll };
}
