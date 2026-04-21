import Stripe from "stripe";

const apiKey = process.env.STRIPE_SECRET_KEY;

if (!apiKey) {
  throw new Error("Missing environment variable: STRIPE_SECRET_KEY");
}

/**
 * Stripe SDK singleton instance.
 * Configured with API version pinned to a stable release.
 */
export const stripe = new Stripe(apiKey, {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
  appInfo: {
    name: "Brazilian Haven Beauty",
    version: "1.0.0",
  },
});
