// Server-only Stripe singleton + tier config.
// All env vars are read once on first import; missing keys throw at
// request time (not at module load) so the app still builds locally
// without Stripe configured.

import Stripe from "stripe";

let cached = null;

export function getStripe() {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  cached = new Stripe(key, {
    apiVersion: "2024-12-18.acacia",
    typescript: false,
  });
  return cached;
}

// Tier definitions used by both the checkout endpoint and the public UI.
// priceId is read from env so you can swap test/live keys without code changes.
export const TIERS = {
  featured: {
    id: "featured",
    name: "Featured",
    priceLabel: "$99/mo",
    priceEnv: "STRIPE_PRICE_FEATURED",
    description:
      "Pinned to the top of its category. FEATURED badge. Affiliate tracking. Newsletter feature. Live in 48 hours.",
  },
  partner: {
    id: "partner",
    name: "Partner",
    priceLabel: "$299/mo",
    priceEnv: "STRIPE_PRICE_PARTNER",
    description:
      "Everything in Featured + dedicated comparison page, editorial blog post, custom landing page, homepage spotlight.",
  },
};

export function getPriceIdForTier(tierId) {
  const tier = TIERS[tierId];
  if (!tier) throw new Error(`Unknown tier: ${tierId}`);
  const priceId = process.env[tier.priceEnv];
  if (!priceId) throw new Error(`${tier.priceEnv} not set`);
  return priceId;
}
