// Darken a bright neon color for light-mode readability.
// In dark mode the original color is returned.
export function adjustColorForTheme(color, theme) {
  if (theme !== "light" || !color) return color;
  return darkenHex(color, 0.35);
}

function darkenHex(hex, amount) {
  hex = hex.replace("#", "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const r = Math.max(0, Math.round(parseInt(hex.slice(0, 2), 16) * (1 - amount)));
  const g = Math.max(0, Math.round(parseInt(hex.slice(2, 4), 16) * (1 - amount)));
  const b = Math.max(0, Math.round(parseInt(hex.slice(4, 6), 16) * (1 - amount)));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
