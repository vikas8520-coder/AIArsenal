import { NextResponse } from "next/server";
import { getStripe } from "../../../../src/lib/stripe";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_NAME = "FeaturedSubmissions";

// Webhook signature verification needs the raw request body — Next 16
// gives that via request.text(). Edge runtime is fine for this.
export const runtime = "nodejs";

async function logToAirtable(fields) {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) return;
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ records: [{ fields }] }),
    });
  } catch {
    // Logging failure must not crash the webhook — Stripe will retry on
    // a non-2xx, but a missing Airtable shouldn't break payments.
  }
}

export async function POST(request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return new NextResponse("Webhook not configured", { status: 500 });
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (e) {
    return new NextResponse(e.message, { status: 500 });
  }

  const sig = request.headers.get("stripe-signature");
  const raw = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (e) {
    return new NextResponse(`Webhook signature verification failed: ${e.message}`, {
      status: 400,
    });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const m = session.metadata || {};
      await logToAirtable({
        event_type: "checkout.completed",
        tier: m.tier || "",
        tool_name: m.tool_name || "",
        tool_url: m.tool_url || "",
        contact_name: m.contact_name || "",
        contact_email: session.customer_email || "",
        pitch: m.pitch || "",
        amount: ((session.amount_total || 0) / 100).toFixed(2),
        currency: session.currency || "usd",
        stripe_session_id: session.id,
        stripe_customer: session.customer || "",
        stripe_subscription: session.subscription || "",
        status: "pending_review",
        created_at: new Date().toISOString(),
      });
      break;
    }
    case "customer.subscription.deleted": {
      // Tool's subscription ended — flag for un-featuring
      const sub = event.data.object;
      const m = sub.metadata || {};
      await logToAirtable({
        event_type: "subscription.canceled",
        tier: m.tier || "",
        tool_name: m.tool_name || "",
        tool_url: m.tool_url || "",
        stripe_subscription: sub.id,
        status: "canceled",
        created_at: new Date().toISOString(),
      });
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object;
      await logToAirtable({
        event_type: "invoice.failed",
        contact_email: invoice.customer_email || "",
        amount: ((invoice.amount_due || 0) / 100).toFixed(2),
        stripe_subscription: invoice.subscription || "",
        status: "payment_failed",
        created_at: new Date().toISOString(),
      });
      break;
    }
    default:
      // Ignore other event types to keep the webhook fast
      break;
  }

  return NextResponse.json({ received: true });
}
