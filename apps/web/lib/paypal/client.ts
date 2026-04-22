/**
 * PayPal REST API client configuration.
 *
 * Uses the PayPal Orders v2 API via raw fetch (the @paypal/paypal-js package
 * is browser-only; server calls use the REST API directly with OAuth 2.0).
 */

export interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
}

function getPayPalConfig(): PayPalConfig {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId) throw new Error("Missing env: PAYPAL_CLIENT_ID");
  if (!clientSecret) throw new Error("Missing env: PAYPAL_CLIENT_SECRET");

  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

  return { clientId, clientSecret, baseUrl };
}

/**
 * Obtain a short-lived PayPal access token via client credentials grant.
 */
export async function getPayPalAccessToken(): Promise<string> {
  const { clientId, clientSecret, baseUrl } = getPayPalConfig();

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`PayPal auth failed: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

/**
 * Authenticated PayPal REST API fetch wrapper.
 */
export async function paypalFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const { baseUrl } = getPayPalConfig();
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`PayPal API error ${response.status}: ${body}`);
  }

  return response.json() as Promise<T>;
}

export const paypalConfig = {
  getConfig: getPayPalConfig,
};
