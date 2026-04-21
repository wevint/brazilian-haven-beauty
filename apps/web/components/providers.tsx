"use client";

import { SessionProvider } from "next-auth/react";
import { TRPCReactProvider } from "@/lib/trpc/client";

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Client-side providers tree.
 * Wraps the app with tRPC and Auth.js SessionProvider.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <TRPCReactProvider>{children}</TRPCReactProvider>
    </SessionProvider>
  );
}
