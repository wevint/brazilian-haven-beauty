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

export interface ConfirmSetupIntentResult {
  paymentMethodId: string;
  last4: string;
  brand: string;
}

/**
 * Create a Stripe SetupIntent to save a payment method for future use.
 * Used in the "Save payment method" account flow (US3).
 */
export async function createSetupIntent(
  customerId: string,
  metadata?: Record<string, string>
): Promise<CreateSetupIntentResult>;
export async function createSetupIntent(
  input: CreateSetupIntentInput
): Promise<CreateSetupIntentResult>;
export async function createSetupIntent(
  inputOrCustomerId: CreateSetupIntentInput | string,
  metadata?: Record<string, string>
): Promise<CreateSetupIntentResult> {
  const isString = typeof inputOrCustomerId === "string";
  const customerId = isString ? inputOrCustomerId : inputOrCustomerId.customerId;
  const meta = isString ? metadata : inputOrCustomerId.metadata;

  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    automatic_payment_methods: { enabled: true },
    metadata: meta,
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
 * Retrieve a SetupIntent by ID and extract the attached payment method details.
 * Returns paymentMethodId, last4, and brand — no raw card data stored.
 */
export async function confirmSetupIntent(
  setupIntentId: string
): Promise<ConfirmSetupIntentResult> {
  const setupIntent = await stripe.setupIntents.retrieve(setupIntentId, {
    expand: ["payment_method"],
  });

  const pm = setupIntent.payment_method as Stripe.PaymentMethod | null;
  if (!pm || typeof pm === "string") {
    throw new Error("SetupIntent has no attached payment method");
  }

  const card = pm.card;
  if (!card) {
    throw new Error("Payment method is not a card");
  }

  return {
    paymentMethodId: pm.id,
    last4: card.last4,
    brand: card.brand,
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
