// Encode/decode a quiz result for sharing via URL.
// Format: base64url of { a: archetypeSlug, q: answers, t: [[toolId, roleLabel, why]...] }

export function encodeQuizResult(result) {
  if (!result || !result.archetype || !result.tools) return "";
  const compact = {
    a: result.archetype.slug || result.archetypeSlug,
    q: result.answers || {},
    t: result.tools.map((t) => [t.id, t.role || "", t.why || ""]),
  };
  const json = JSON.stringify(compact);
  if (typeof window === "undefined") {
    return Buffer.from(json, "utf-8").toString("base64url");
  }
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decodeQuizResult(str) {
  if (!str) return null;
  try {
    let b = str.replace(/-/g, "+").replace(/_/g, "/");
    while (b.length % 4) b += "=";
    const json =
      typeof window === "undefined"
        ? Buffer.from(b, "base64").toString("utf-8")
        : decodeURIComponent(escape(atob(b)));
    const parsed = JSON.parse(json);
    if (!parsed || !Array.isArray(parsed.t)) return null;
    return {
      archetypeSlug: parsed.a,
      answers: parsed.q || {},
      tools: parsed.t
        .filter((r) => Array.isArray(r) && r.length >= 2)
        .map(([id, role, why]) => ({ id, role: role || "", why: why || "" })),
    };
  } catch {
    return null;
  }
}
