# Implementation Plan: Brazilian Haven Beauty Platform MVP v1

**Feature**: `platform-mvp-v1` | **Date**: 2026-04-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/spec.md`

---

## Summary

Build a full-stack, white-label beauty booking platform that fully replaces Vagaro for Brazilian Haven Beauty. The platform exposes a bilingual (EN/PT) public website with 7 pages + a Brazilian Wax landing page, a client-facing booking and account system, and a unified admin dashboard for appointments/staff/services/promotions/memberships. All payment flows route through Stripe and PayPal (PCI-SAQ-A). Google Ads campaign management is operable from Claude Code via a TypeScript CLI layer over the Google Ads API.

**Tech approach**: Next.js 15 App Router monolith (TypeScript) with Prisma + PostgreSQL (Neon), deployed on Vercel. Shadcn/ui + Tailwind CSS 4 for the UI system. tRPC v11 for type-safe API. Auth.js v5 for sessions. Background automation via Inngest. SMS via Twilio, email via Resend.

---

## Technical Context

**Language/Version**: TypeScript 5.5+, Node.js 22 LTS  
**Primary Dependencies**:
- `next` 15 (App Router, React Server Components, Server Actions)
- `react` 19
- `@trpc/server` + `@trpc/client` v11 (type-safe API layer)
- `prisma` + `@prisma/client` (ORM)
- `next-auth` v5 / Auth.js (session auth — email+password + OAuth)
- `shadcn/ui` (Radix UI + Tailwind component system)
- `tailwindcss` v4
- `next-intl` v4 (EN/PT i18n with RSC support)
- `stripe` SDK v16
- `@paypal/paypal-js` + PayPal Orders API
- `twilio` SDK (SMS)
- `resend` SDK + React Email (transactional email)
- `inngest` (background jobs: reminders, waitlist, renewals)
- `zod` v3 (validation)
- `@tanstack/react-table` v8 (admin data tables)
- `recharts` (admin analytics charts)
- `@fullcalendar/react` (admin appointment calendar)
- `google-ads-api` (Google Ads API v18 Node.js client)

**Storage**:
- PostgreSQL via Neon (serverless, connection pooling built-in)
- Redis via Upstash (rate limiting, session store, distributed locks for double-booking prevention)
- Cloudflare R2 (staff photos, service images, email assets)

**Testing**:
- Vitest (unit + integration)
- Playwright (E2E — booking flow, admin dashboard, payment sandbox)
- MSW (API mocking in integration tests)

**Target Platform**: Web (mobile-first responsive PWA); future React Native app will consume the same tRPC API

**Project Type**: Full-stack web application — Next.js monolith with co-located API routes, deployed to Vercel (Edge runtime for public pages, Node.js runtime for API + admin)

**Performance Goals** (from spec Success Criteria):
- 95% availability lookups < 1 second (SC-002)
- Zero double-bookings under 50 concurrent requests per staff/min (SC-003)
- Admin dashboard loads full day view in < 2 seconds at 200+ appts/day (SC-012)
- Booking completion < 3 minutes on mobile (SC-001)

**Constraints**:
- PCI-SAQ-A: no card data stored in platform DB or backend — gateway-hosted fields only
- Single salon location, single timezone (America/New_York assumed; configurable in env)
- Bilingual EN/PT: all public content, all automated emails must support both languages
- Distributed lock (Redis) REQUIRED on slot reservation to prevent double-booking race conditions
- `specs/design.md` MUST be produced and approved before Home, About, and Brazilian Wax pages are implemented (Constitution Principle VI)

**Scale/Scope**:
- Single location, ~200–500 appointments/day
- ~2,000–5,000 active client accounts at launch
- ~10–20 staff profiles
- ~50–100 services in catalog

---

## Constitution Check

*GATE: Evaluated before Phase 0 research. Re-checked post-design.*

- [x] **I. Client-First Experience** — Booking flow is a 4-step wizard (service → staff → datetime → payment) with progressive disclosure. Mobile-first. Staff pricing is shown inline as the user selects staff. No dead ends. ✅
- [x] **II. Custom-Built Platform** — All booking, scheduling, memberships, packages, and payments are first-party. Stripe, PayPal, Twilio, Resend are integration points (additive), not runtime dependencies. Vagaro is eliminated. ✅
- [x] **III. Full Service & Pricing Customization** — Prisma schema enforces `ServicePricing` as a per-(service, staffTier) join table. No service has a single flat price field. All booking, membership, and package flows read from this table. ✅
- [x] **IV. Trust and Transparency** — Price shown on service card updates when staff is selected. Membership terms and package inclusions displayed before checkout. Cancellation policy shown at booking confirmation step. ✅
- [x] **V. Security Without Local Card Storage** — Stripe Payment Element (iframe) handles card entry; we store only `stripePaymentIntentId`, `last4`, `brand`. PayPal generates an `orderId`. No PAN/CVV in any table. Verified via DB column audit in CI. ✅
- [x] **VI. Premium Brazilian Wellness Brand Identity** — `specs/design.md` artifact is a required pre-condition for Home, About, and Brazilian Wax pages. Shadcn/ui tokens will be configured to match the approved design system. ✅ *(design.md not yet created — flagged as Phase 0 blocker for UI implementation)*
- [x] **VII. Automated Client Engagement** — Inngest functions handle: appointment reminders (24h + 2h), waitlist open-slot notifications, membership renewal warnings, welcome sequences, low-credit alerts. Zero manual triggers required. ✅

**Constitution Check Result**: **PASS** — all 7 gates clear. Note: `specs/design.md` is gated before UI implementation of design-heavy pages, not before back-end development.

---

## Project Structure

### Documentation (this feature)

```
specs/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/           ← Phase 1 output
│   ├── api.md           ← tRPC router contracts + REST webhooks
│   └── google-ads-cli.md ← Google Ads CLI command schema
└── tasks.md             ← Phase 2 output (/speckit-tasks command)
```

### Source Code Repository Structure

```
brazilian-haven-beauty/
├── apps/
│   └── web/                          # Next.js 15 App Router application
│       ├── app/
│       │   ├── [locale]/             # next-intl locale routing (en / pt)
│       │   │   ├── (public)/         # Public marketing pages (SSG/ISR)
│       │   │   │   ├── page.tsx      # Home
│       │   │   │   ├── about/
│       │   │   │   ├── services/
│       │   │   │   ├── prices/
│       │   │   │   ├── contact/
│       │   │   │   └── brazilian-wax/
│       │   │   ├── (booking)/        # Booking wizard (SSR + Server Actions)
│       │   │   │   └── book/
│       │   │   ├── (account)/        # Authenticated client pages
│       │   │   │   └── account/
│       │   │   └── (admin)/          # Admin dashboard (auth-gated)
│       │   │       └── admin/
│       │   │           ├── page.tsx  # Dashboard home (KPIs + today's calendar)
│       │   │           ├── appointments/
│       │   │           ├── staff/
│       │   │           ├── services/
│       │   │           ├── clients/
│       │   │           ├── memberships/
│       │   │           ├── packages/
│       │   │           ├── coupons/
│       │   │           ├── reports/
│       │   │           └── settings/
│       │   └── api/
│       │       ├── trpc/[trpc]/      # tRPC HTTP handler
│       │       ├── webhooks/
│       │       │   ├── stripe/       # Stripe webhook handler
│       │       │   └── paypal/       # PayPal webhook handler
│       │       └── inngest/          # Inngest event handler
│       ├── components/
│       │   ├── ui/                   # Shadcn/ui components (generated)
│       │   ├── booking/              # Booking wizard steps
│       │   ├── admin/                # Dashboard-specific components
│       │   │   ├── calendar/         # FullCalendar integration
│       │   │   ├── tables/           # TanStack Table wrappers
│       │   │   └── charts/           # Recharts wrappers
│       │   ├── public/               # Marketing page components
│       │   └── shared/               # Shared across contexts
│       ├── lib/
│       │   ├── trpc/                 # tRPC client + server setup
│       │   ├── auth/                 # Auth.js configuration
│       │   ├── stripe/               # Stripe SDK helpers
│       │   ├── paypal/               # PayPal SDK helpers
│       │   ├── inngest/              # Inngest client + function definitions
│       │   ├── email/                # Resend + React Email templates
│       │   ├── sms/                  # Twilio helpers
│       │   ├── r2/                   # Cloudflare R2 upload helpers
│       │   └── booking/              # Booking availability + locking logic
│       ├── messages/
│       │   ├── en.json               # English strings
│       │   └── pt.json               # Portuguese strings
│       └── middleware.ts             # next-intl + auth middleware
│
├── packages/
│   ├── db/                           # Prisma schema + migrations
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── trpc/                         # Shared tRPC router definitions
│   │   ├── routers/
│   │   │   ├── appointments.ts
│   │   │   ├── services.ts
│   │   │   ├── staff.ts
│   │   │   ├── clients.ts
│   │   │   ├── memberships.ts
│   │   │   ├── packages.ts
│   │   │   ├── coupons.ts
│   │   │   ├── payments.ts
│   │   │   └── admin.ts
│   │   └── index.ts
│   └── config/                       # Shared ESLint, TypeScript, Tailwind config
│
├── tools/
│   └── google-ads-cli/               # Google Ads campaign management CLI
│       ├── src/
│       │   ├── commands/             # list, create, edit, pause, resume, report
│       │   └── client.ts             # google-ads-api wrapper
│       ├── package.json
│       └── README.md
│
├── specs/                            # Feature specifications (this directory)
├── .specify/                         # spec-kit configuration
├── package.json                      # pnpm workspace root
├── pnpm-workspace.yaml
└── turbo.json                        # Turborepo build pipeline
```

**Structure Decision**: pnpm + Turborepo monorepo with `apps/web` as the Next.js application, `packages/db` for Prisma schema (shared), `packages/trpc` for router definitions (enables future React Native / mobile app to consume same API), and `tools/google-ads-cli` as a standalone CLI for campaign management from Claude Code. This avoids the complexity of microservices for MVP while setting up clean module boundaries for future scaling.

---

## Complexity Tracking

No constitution violations. No unjustified complexity.

| Decision | Why |
|----------|-----|
| Monorepo (pnpm + Turborepo) | Single team, shared Prisma types across web + future mobile; avoids type drift |
| Redis distributed lock on slot reservation | Zero double-booking under concurrent load is a hard spec requirement (SC-003) |
| Inngest (not BullMQ) | Vercel-native serverless background jobs; no Redis worker process to manage; great DX |
| `packages/trpc` separated from `apps/web` | Enables future React Native mobile app to consume same type-safe API without code duplication |
| `specs/design.md` gate before UI | Constitution Principle VI is non-negotiable; back-end can be built in parallel |
