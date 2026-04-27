// Outbound URL helper. Returns a /go/<slug> path that the server then
// 302-redirects (with UTM stamping + future affiliate-link swap) to the
// tool's real destination. Use this instead of building outbound URLs
// directly in components.
//
// Pass `source` to label the click context (e.g. "directory", "compare",
// "stack", "quiz", "scaffold"). Lands as ?src=… on the redirector.

import { getToolSlug } from "./tools";

export function getOutboundHref(tool, source = "directory") {
  if (!tool) return "#";
  const slug = getToolSlug(tool);
  if (!slug) return tool.url || "#";
  const params = source && source !== "directory" ? `?src=${encodeURIComponent(source)}` : "";
  return `/go/${slug}${params}`;
}
