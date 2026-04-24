// Pre-computed "typically paired with" lookup table built from
// the 8 curated /stacks recipes + the 10 archetype presets.
//
// For any tool id, returns the other tools that most often co-occur
// with it in editorial-curated stacks. No server needed, no API call,
// just O(1) map lookup at render time.

import { STACKS } from "../data/stacks";

const coOccurrence = (() => {
  const map = new Map(); // toolId -> Map<otherToolId, count>

  for (const stack of STACKS) {
    const ids = stack.roles.map((r) => r.toolId);
    for (const a of ids) {
      for (const b of ids) {
        if (a === b) continue;
        if (!map.has(a)) map.set(a, new Map());
        const inner = map.get(a);
        inner.set(b, (inner.get(b) || 0) + 1);
      }
    }
    // Alternatives in each role also count
    for (const role of stack.roles) {
      for (const altId of role.alternatives || []) {
        for (const otherRole of stack.roles) {
          if (otherRole.toolId === altId) continue;
          if (!map.has(altId)) map.set(altId, new Map());
          const inner = map.get(altId);
          inner.set(otherRole.toolId, (inner.get(otherRole.toolId) || 0) + 0.5);
        }
      }
    }
  }

  // Convert inner maps to sorted arrays
  const result = new Map();
  for (const [id, inner] of map.entries()) {
    const sorted = [...inner.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([otherId, count]) => ({ toolId: otherId, weight: count }));
    result.set(id, sorted);
  }
  return result;
})();

export function getTypicalPairs(toolId, limit = 4) {
  const pairs = coOccurrence.get(toolId);
  if (!pairs) return [];
  return pairs.slice(0, limit);
}
