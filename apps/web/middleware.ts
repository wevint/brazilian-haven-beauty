import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import { locales, defaultLocale } from "./lib/i18n/config";

/**
 * next-intl locale routing middleware.
 * Handles locale detection, redirect, and cookie persistence.
 */
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

/**
 * Combined middleware: runs next-intl for all requests, then applies
 * Auth.js guards on protected route groups.
 */
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Auth guards ────────────────────────────────────────────────────────────
  // These patterns match localised paths, e.g. /en/(account)/... or /pt/(admin)/...
  const isAccountRoute = /^\/[a-z]{2}\/account(\/.*)?$/.test(pathname);
  const isAdminRoute = /^\/[a-z]{2}\/admin(\/.*)?$/.test(pathname);

  if (isAccountRoute || isAdminRoute) {
    const session = await auth();

    if (!session) {
      // Preserve return URL in query string so the sign-in page can redirect back
      const locale = pathname.split("/")[1] ?? defaultLocale;
      const signInUrl = new URL(`/${locale}/sign-in`, request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    if (isAdminRoute) {
      const role = (session.user as { role?: string } | undefined)?.role;
      const isAdminRole = ["owner", "manager", "staff"].includes(role ?? "");
      if (!isAdminRole) {
        const locale = pathname.split("/")[1] ?? defaultLocale;
        return NextResponse.redirect(new URL(`/${locale}`, request.url));
      }
    }
  }

  // ── i18n routing ───────────────────────────────────────────────────────────
  return intlMiddleware(request);
}

export const config = {
  // Match all routes except Next.js internals and static assets
  matcher: [
    "/((?!_next|_vercel|api/inngest|api/webhooks|favicon\\.ico|.*\\..*).*)",
  ],
};
