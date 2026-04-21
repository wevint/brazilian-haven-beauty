import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible Auth.js configuration.
 *
 * This config is imported by both `apps/web/auth.ts` (Node.js runtime)
 * and `apps/web/middleware.ts` (Edge runtime).
 *
 * It MUST NOT import anything that is not available on the Edge runtime
 * (e.g., bcryptjs, prisma). Adapters and credential providers are added
 * only in the full `auth.ts` config.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  callbacks: {
    /**
     * Controls whether a route is accessible.
     * The full session check (role + db lookup) runs in `auth.ts`.
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      // Protect account and admin routes at the edge
      const isAccountRoute = /^\/[a-z]{2}\/account(\/.*)?$/.test(pathname);
      const isAdminRoute = /^\/[a-z]{2}\/admin(\/.*)?$/.test(pathname);

      if (isAccountRoute || isAdminRoute) {
        return isLoggedIn;
      }

      return true;
    },
  },
  providers: [],
  session: { strategy: "jwt" },
};
