import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { functions } from "@/lib/inngest/functions/index";

/**
 * Inngest serve handler for Next.js App Router.
 * Registers all background functions with the Inngest platform.
 *
 * Inngest hits this endpoint to:
 * - Discover registered functions (GET)
 * - Deliver events to function handlers (POST)
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});
