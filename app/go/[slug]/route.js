import { redirect } from "next/navigation";
import { getToolBySlug } from "@/src/lib/tools";

/**
 * Server-side redirector for ALL outbound tool clicks.
 * /go/cursor → 302 to either tool.affiliate (with UTM) or tool.url (with UTM).
 *
 * Why route through here instead of linking direct:
 * - Adds UTM source/medium/campaign automatically — no per-component duplication
 * - Single point to swap an affiliate URL in for a tool without touching UI code
 * - Server log of every outbound (Plausible custom event still fires client-side
 *   when the link is clicked, but this gives us a server-side trail too)
 * - Works for crawlers / scripts / share buttons that wouldn't run JS
 */

export const dynamic = "force-dynamic";

function buildOutboundUrl(tool, source = "directory") {
  const raw = tool.affiliate || tool.url || "";
  if (!raw) return null;
  const withScheme = raw.startsWith("http") ? raw : `https://${raw}`;
  try {
    const url = new URL(withScheme);
    // Don't double-stamp if the affiliate link already carries UTM
    if (!url.searchParams.has("utm_source")) {
      url.searchParams.set("utm_source", "aiarsenal");
    }
    if (!url.searchParams.has("utm_medium")) {
      url.searchParams.set("utm_medium", source);
    }
    if (!url.searchParams.has("utm_campaign")) {
      url.searchParams.set("utm_campaign", "tools");
    }
    return url.toString();
  } catch {
    return withScheme;
  }
}

export async function GET(request, { params }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) {
    return new Response("Tool not found", { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const source = searchParams.get("src") || "directory";

  const target = buildOutboundUrl(tool, source);
  if (!target) {
    return new Response("Tool has no URL", { status: 500 });
  }

  // 302 because the destination might change when we swap affiliate links
  return Response.redirect(target, 302);
}
