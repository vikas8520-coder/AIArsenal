export function encodeStack(ids) {
  if (!ids || ids.length === 0) return "";
  return `#stack=${ids.join(",")}`;
}

export function decodeStack(hash) {
  if (!hash || !hash.includes("stack=")) return [];
  const match = hash.match(/stack=([^&]+)/);
  if (!match) return [];
  return match[1].split(",").filter(Boolean);
}
