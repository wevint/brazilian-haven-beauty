import type Stripe from "stripe";
import { stripe } from "./client";

export interface CreateSetupIntentInput {
  customerId: string;
  metadata?: Record<string, string>;
}

export interface CreateSetupIntentResult {
  clientSecret: string;
  setupIntentId: string;
}

/**
 * Create a Stripe SetupIntent to save a payment method for future use.
 * Used in the "Save payment method" account flow (US3).
 */
export async function createSetupIntent(
  input: CreateSetupIntentInput
): Promise<CreateSetupIntentResult> {
  const setupIntent = await stripe.setupIntents.create({
    customer: input.customerId,
    automatic_payment_methods: { enabled: true },
    metadata: input.metadata,
  });

  if (!setupIntent.client_secret) {
    throw new Error("Stripe SetupIntent created without a client_secret");
  }

  return {
    clientSecret: setupIntent.client_secret,
    setupIntentId: setupIntent.id,
  };
}

/**
 * Retrieve a SetupIntent by ID.
 */
export async function retrieveSetupIntent(
  setupIntentId: string
): Promise<Stripe.SetupIntent> {
  return stripe.setupIntents.retrieve(setupIntentId);
}
