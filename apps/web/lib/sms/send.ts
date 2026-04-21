import { twilioClient, SMS_FROM } from "./client";
import { logger } from "@/lib/observability/logger";

export interface SendSmsInput {
  /** Recipient phone number in E.164 format (+15550001234). */
  to: string;
  message: string;
}

export interface SendSmsResult {
  sid: string;
  status: string;
}

/**
 * Send an SMS message via Twilio.
 *
 * @throws If the phone number is invalid or Twilio returns an error.
 */
export async function sendSms(input: SendSmsInput): Promise<SendSmsResult> {
  const { to, message } = input;

  // Basic E.164 validation
  if (!/^\+[1-9]\d{6,14}$/.test(to)) {
    throw new Error(`Invalid E.164 phone number: ${to}`);
  }

  const result = await twilioClient.messages.create({
    from: SMS_FROM!,
    to,
    body: message,
  });

  logger.info("SMS sent", { to, sid: result.sid, status: result.status });

  return { sid: result.sid, status: result.status };
}
