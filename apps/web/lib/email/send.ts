import type { ReactElement } from "react";
import { render } from "@react-email/components";
import { resend, EMAIL_FROM } from "./client";
import { logger } from "@/lib/observability/logger";

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  /** React Email template rendered to HTML. */
  template: ReactElement;
  /** Reply-to address (optional). */
  replyTo?: string;
  /** Optional Resend tag for analytics. */
  tags?: Array<{ name: string; value: string }>;
}

export interface SendEmailResult {
  id: string;
}

/**
 * Send a transactional email via Resend.
 *
 * Accepts a React Email template element, renders it to HTML, and
 * delivers the email using the Resend SDK.
 *
 * @throws If Resend returns an error response.
 */
export async function sendEmail(
  input: SendEmailInput
): Promise<SendEmailResult> {
  const html = await render(input.template);

  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: Array.isArray(input.to) ? input.to : [input.to],
    subject: input.subject,
    html,
    reply_to: input.replyTo,
    tags: input.tags,
  });

  if (error || !data) {
    logger.error("Failed to send email", {
      to: input.to,
      subject: input.subject,
      error: error?.message,
    });
    throw new Error(`Email send failed: ${error?.message ?? "Unknown error"}`);
  }

  logger.info("Email sent", { to: input.to, subject: input.subject, id: data.id });

  return { id: data.id };
}
