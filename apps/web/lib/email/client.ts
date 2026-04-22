import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  throw new Error("Missing environment variable: RESEND_API_KEY");
}

/**
 * Resend client singleton.
 * All transactional emails are sent via this client.
 */
export const resend = new Resend(apiKey);

/** Default "From" address used for all platform emails. */
export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? "Brazilian Haven Beauty <hello@brazilianhaven.com>";
