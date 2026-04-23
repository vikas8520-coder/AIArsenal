// Encoder/decoder for user-built custom stacks shared via URL.
// Format: base64url of { n: name, d: desc, r: [[roleLabel, toolId], ...] }
// Compact keys to keep URLs short.

export function encodeCustomStack(stack) {
  if (!stack || !stack.roles || stack.roles.length === 0) return "";
  const compact = {
    n: (stack.name || "").slice(0, 80),
    d: (stack.description || "").slice(0, 200),
    r: stack.roles.map((r) => [(r.label || "").slice(0, 40), r.toolId]),
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

export function decodeCustomStack(str) {
  if (!str) return null;
  try {
    let b = str.replace(/-/g, "+").replace(/_/g, "/");
    while (b.length % 4) b += "=";
    const json =
      typeof window === "undefined"
        ? Buffer.from(b, "base64").toString("utf-8")
        : decodeURIComponent(escape(atob(b)));
    const parsed = JSON.parse(json);
    if (!parsed || !Array.isArray(parsed.r)) return null;
    return {
      name: parsed.n || "",
      description: parsed.d || "",
      roles: parsed.r
        .filter((r) => Array.isArray(r) && r.length === 2)
        .map(([label, toolId]) => ({ label: label || "", toolId })),
    };
  } catch {
    return null;
  }
}
