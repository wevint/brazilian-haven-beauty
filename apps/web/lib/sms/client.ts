import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid) throw new Error("Missing env: TWILIO_ACCOUNT_SID");
if (!authToken) throw new Error("Missing env: TWILIO_AUTH_TOKEN");

/**
 * Twilio client singleton.
 * All SMS messages are sent via this client.
 */
export const twilioClient = twilio(accountSid, authToken);

/** Twilio phone number used as the "From" for all outbound SMS. */
export const SMS_FROM = process.env.TWILIO_PHONE_NUMBER;

if (!SMS_FROM) {
  throw new Error("Missing env: TWILIO_PHONE_NUMBER");
}
