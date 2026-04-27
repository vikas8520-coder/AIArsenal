import { NextResponse } from "next/server";
import { getStripe, getPriceIdForTier, TIERS } from "../../../../src/lib/stripe";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://ai-arsenal-nu.vercel.app";

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400, headers: corsHeaders }
    );
  }

  const { tier, toolName, toolUrl, email, contactName, pitch } = body;

  if (!tier || !TIERS[tier]) {
    return NextResponse.json(
      { error: "Invalid tier — must be 'featured' or 'partner'" },
      { status: 400, headers: corsHeaders }
    );
  }
  if (!toolName || !toolUrl || !email) {
    return NextResponse.json(
      { error: "toolName, toolUrl, and email are required" },
      { status: 400, headers: corsHeaders }
    );
  }

  let stripe, priceId;
  try {
    stripe = getStripe();
    priceId = getPriceIdForTier(tier);
  } catch (e) {
    return NextResponse.json(
      { error: e.message },
      { status: 500, headers: corsHeaders }
    );
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      allow_promotion_codes: true,
      success_url: `${BASE_URL}/get-featured/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/get-featured?canceled=1`,
      metadata: {
        tier,
        tool_name: String(toolName).slice(0, 100),
        tool_url: String(toolUrl).slice(0, 200),
        contact_name: String(contactName || "").slice(0, 100),
        pitch: String(pitch || "").slice(0, 500),
      },
      subscription_data: {
        metadata: {
          tier,
          tool_name: String(toolName).slice(0, 100),
          tool_url: String(toolUrl).slice(0, 200),
        },
      },
    });

    return NextResponse.json(
      { ok: true, url: session.url, sessionId: session.id },
      { headers: corsHeaders }
    );
  } catch (e) {
    return NextResponse.json(
      { error: `Stripe: ${e.message}` },
      { status: 500, headers: corsHeaders }
    );
  }
}
