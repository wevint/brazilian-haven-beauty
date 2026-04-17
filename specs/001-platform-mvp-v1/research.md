# Research: Brazilian Haven Beauty Platform MVP v1

**Phase**: 0 — Outline & Research  
**Date**: 2026-04-17  
**Branch**: `001-platform-mvp-v1`

---

## 1. Market Landscape: Beauty & Wellness Booking Software (2025–2026)

### Decision: Build custom, not integrate a white-label
**Rationale**: The constitution mandates a custom platform (Principle II). Beyond compliance, market leaders show that brand-owned booking tools outperform embedded third-party widgets for trust, conversion, and SEO. The goal is parity with or better than Fresha/Boulevard feature-for-feature.

### What market leaders do that we must match or exceed

| Feature Area | Fresha (market leader) | Boulevard (premium salons) | Our target |
|---|---|---|---|
| Booking flow | 3-step, staff first, no account required | 4-step, smart scheduling | 4-step wizard, staff + pricing upfront |
| Staff profiles | Photo, specialty, reviews | Bio, portfolio, real-time availability | Full profile + tier-based pricing visible |
| Subscriptions | Credit-based memberships | Membership + package bundles | Per-staff-tier memberships + packages |
| Admin calendar | Multi-staff grid, drag & drop | Timeline + grid hybrid | FullCalendar multi-staff grid + drag |
| Notifications | Email + SMS, configurable intervals | Email + SMS + push | Email + SMS (push in v2) |
| Analytics | Revenue, utilization, retention | AI-powered insights, cohort analysis | Revenue KPIs, no-show rate, utilization |
| Mobile admin | Native iOS/Android | Native iOS + web | Mobile-responsive web (native in v2) |
| Google Ads | Landing page suggestions | No built-in | Claude Code campaign management CLI |
| Bilingual | English only | English only | EN/PT toggle in header |

**Key differentiator we have**: per-staff-tier pricing on every object (services, memberships, packages, add-ons) — neither Fresha nor Boulevard enforce this at the data model level.

---

## 2. Framework & Runtime

### Decision: Next.js 15 (App Router) + TypeScript 5.5
**Rationale**:
- App Router with React Server Components (RSC) enables server-side rendering for SEO (FR-039) without a separate SSR service.
- React 19 actions/server actions eliminate most API route boilerplate for form submissions.
- Built-in image optimization (`next/image`) for staff photos and service thumbnails.
- Vercel deployment: zero-config Edge caching for public pages, Node.js runtime for API.
- TypeScript 5.5 satisfies `Array.isArray` narrowing improvements important for tRPC type inference.

**Alternatives considered**:
- **Remix / React Router v7**: Excellent for form-heavy flows, but smaller ecosystem for the UI libs (Shadcn) and less Vercel optimization.
- **Astro + React islands**: Superior static performance, but admin dashboard requires too much interactivity for island model.
- **SvelteKit**: Smaller community, fewer enterprise-grade UI component libraries for dashboards.

---

## 3. API Layer

### Decision: tRPC v11 (type-safe API, no REST codegen required)
**Rationale**:
- End-to-end type safety from Prisma schema → tRPC router → React component, zero manual type duplication.
- tRPC v11 supports React Server Components as a first-class output format.
- `packages/trpc` as a shared package means a future React Native app gets the same typed API without a separate API spec.
- Subscriptions (tRPC + WebSockets or SSE) for real-time booking availability updates to the calendar.

**Alternatives considered**:
- **REST + OpenAPI**: More portable for third-party consumers, but there are no third-party consumers for MVP; REST adds codegen complexity.
- **GraphQL**: Flexible queries are not needed — our data shapes are well-defined. Apollo/Pothos adds overhead.
- **Server Actions only**: Can't share router definitions across future mobile app; no type-safe client for non-Next.js consumers.

---

## 4. Database

### Decision: PostgreSQL via Neon (serverless) + Prisma ORM
**Rationale**:
- Neon: serverless PostgreSQL with connection pooling (PgBouncer built-in), branching for staging/preview, scale-to-zero for cost efficiency at MVP stage.
- Prisma ORM: best-in-class DX with Next.js, generates fully typed `PrismaClient`, excellent migration tooling.
- PostgreSQL: ACID transactions are critical for the double-booking prevention lock + appointment create in a single transaction.

**Distributed lock for double-booking**:
- Use `SELECT ... FOR UPDATE SKIP LOCKED` on the `TimeSlot` reservation table within a Prisma `$transaction` for optimistic locking.
- Redis (Upstash) as a secondary distributed lock via `SET NX PX` for the sub-millisecond window before the DB transaction begins, reducing DB contention under high concurrency.

**Alternatives considered**:
- **Supabase**: Also PostgreSQL + Prisma-compatible, but Supabase auth would conflict with Auth.js; Neon is more focused.
- **PlanetScale (MySQL)**: No foreign key constraints makes referential integrity harder for our complex entity graph.
- **MongoDB**: Document model is a poor fit for the relational entity graph (service → staff → pricing → appointment → payment).

---

## 5. Authentication

### Decision: Auth.js v5 (NextAuth v5)
**Rationale**:
- Native Next.js App Router integration; works with React Server Components.
- Supports email/password (Credentials provider) + Google OAuth for admin convenience.
- JWT + database sessions (Prisma adapter) for persistent admin sessions.
- Role-based middleware: `middleware.ts` checks session role (owner / manager / staff / client) and gates routes accordingly.

**Alternatives considered**:
- **Clerk**: Excellent DX and prebuilt UI, but introduces a third-party SaaS dependency for auth — a potential Principle II violation if Clerk becomes critical path. Auth.js keeps auth first-party.
- **Lucia Auth**: Lightweight, but requires more manual session management scaffolding.
- **Custom JWT**: Too much security surface for an MVP.

---

## 6. UI Component System

### Decision: Shadcn/ui + Tailwind CSS v4 + Radix UI
**Rationale**:
- Shadcn/ui (2025 market standard for Next.js SaaS dashboards): copy-into-project components mean full control over styling, no version lock.
- Tailwind CSS v4 brings a major performance improvement (Rust-based engine, 10× faster builds) and CSS variables for design tokens — critical for applying the brand design system.
- Radix UI primitives underneath Shadcn ensure accessibility (WCAG 2.1 AA) for booking forms, date pickers, and modals without custom ARIA work.
- Admin dashboard pattern: sidebar nav (collapsible on mobile) + top-bar with quick actions + content area. Matches Boulevard/Fresha admin UX patterns.

**Admin dashboard UI components**:
- **Calendar**: `@fullcalendar/react` v6 — industry standard for multi-staff appointment grids. Supports drag-and-drop rescheduling, resource (staff) views, time grid.
- **Data tables**: `@tanstack/react-table` v8 — virtual scrolling for large appointment lists, column sorting/filtering, row selection for bulk actions.
- **Charts/KPIs**: `recharts` — composable, RSC-compatible, covers revenue bar charts, utilization line charts, no-show rate gauges.

**Alternatives considered**:
- **MUI (Material UI)**: Well-established but heavy bundle, Material design doesn't fit Brazilian wellness aesthetic.
- **Mantine**: Good DX but smaller component variety for complex admin patterns.
- **Tremor**: Beautiful analytics components but limited for full admin UI.

---

## 7. Background Jobs & Automation

### Decision: Inngest (serverless background functions)
**Rationale**:
- Inngest is fully serverless-native: functions deployed as Vercel serverless functions, triggered by events. No worker process, no Redis queue to manage.
- Durable execution: Inngest handles retries, fan-out, and step-function patterns. Critical for multi-step flows like: "cancel appointment → check waitlist → notify top 3 → wait 30 min → move to next if unclaimed."
- Cron support for scheduled reminder windows (24h / 2h before appointment).
- Local development: `npx inngest-cli dev` runs the Inngest Dev Server locally, full event replay.

**Inngest functions needed**:
1. `appointment/reminder` — fires at T-24h and T-2h via `inngest.createStepFunction`
2. `appointment/cancelled` → fan-out to waitlisted clients → claim-link expiry
3. `membership/renewal-warning` — T-3 days before billing date
4. `membership/low-credit-alert` — when credits drop to 1
5. `client/welcome-sequence` — new account claim flow (D0, D3, D7)
6. `package/expiry-warning` — 7 days before package expiration

**Alternatives considered**:
- **Trigger.dev v3**: Very similar to Inngest, also serverless-native. Inngest has slightly better DX for Next.js and longer track record.
- **BullMQ + Redis**: Requires a persistent worker process (incompatible with pure Vercel serverless); works better on Railway/Render but adds infra complexity.
- **Vercel Cron + API routes**: Simple crons work but lack durable step-function capabilities for waitlist fan-out logic.

---

## 8. Email & SMS

### Decision: Resend (email) + Twilio (SMS)

**Email — Resend**:
- React Email templates: write email HTML as React components, preview in browser during dev.
- Bilingual emails (FR-043): template receives `locale` prop; renders EN section first, PT section second, separated by a horizontal rule.
- Resend handles SPF/DKIM/DMARC automatically for the custom domain.
- Rate limits well above salon send volumes (free tier: 100/day, Pro: 50k/month).

**SMS — Twilio**:
- Market standard for transactional SMS; programmable number with Webhooks for two-way messaging (future Principle VII compliance).
- Twilio's Verify API for phone number OTP at account claim time.

**Alternatives considered**:
- **Postmark**: Excellent deliverability but no React Email SDK; template management is less developer-friendly.
- **SendGrid**: Heavier, less developer-focused, more expensive at low volumes.
- **Vonage**: Comparable to Twilio for SMS, smaller ecosystem.

---

## 9. Media Storage

### Decision: Cloudflare R2 (S3-compatible, zero egress fees)
**Rationale**:
- Staff photos, service images, gift card designs, email header images.
- Zero egress fees vs. AWS S3 (significant at scale).
- Cloudflare Images for automatic resizing and WebP conversion (performance).
- S3-compatible API: standard `@aws-sdk/client-s3` works against R2 with endpoint override.

---

## 10. Payments

### Decision: Stripe (primary) + PayPal (alternate) + Affirm via Stripe

**Stripe**:
- **Payment Element** (iframe): card entry never touches our DOM — PCI-SAQ-A compliant out of the box.
- **Payment Intents** for booking payments (authorized at booking, captured at appointment completion).
- **Setup Intents** for saving payment methods to the Stripe Customer vault.
- **Stripe Billing** for recurring membership subscriptions (automatic invoice, retry logic, dunning).
- **Stripe Connect** not needed at MVP (single location, single merchant account).
- **Affirm via Stripe**: enabled on the Payment Element for cart values ≥ $50.

**PayPal**:
- PayPal Orders API v2 (JavaScript SDK); client renders PayPal button component.
- PayPal captures payment and returns `orderId`; we store that reference, not any card data.

**Webhooks** (critical for Stripe):
- `payment_intent.succeeded` → confirm booking, send confirmation
- `payment_intent.payment_failed` → release slot reservation
- `customer.subscription.renewed` → issue membership credits
- `customer.subscription.deleted` → deactivate membership

---

## 11. SEO & Google Ads

### Decision: Server-rendered pages + JSON-LD + GTM + Google Ads API CLI

**Server rendering** (FR-039):
- All public pages use Next.js `generateMetadata()` for `<title>`, `<meta description>`, OG tags.
- JSON-LD injected via `<script type="application/ld+json">` in RSC page components.
- Schemas: `LocalBusiness`, `Service`, `FAQPage`, `BreadcrumbList`.
- `generateStaticParams` for service detail pages (ISR, revalidate: 3600s).

**Google Tag Manager**:
- GTM container loaded in `<head>` via Next.js `Script` with `strategy="afterInteractive"`.
- Custom events pushed to `window.dataLayer`: `purchase` (booking confirmed + value), `sign_up` (membership), `add_to_cart` (booking initiated).
- GTM configured (outside codebase) to forward these to Google Ads conversion actions.

**Google Ads CLI** (FR-038, SC-011) — `tools/google-ads-cli/`:
- Uses `google-ads-api` v16 Node.js client (wraps gRPC Google Ads API v18).
- Auth: OAuth2 refresh token stored in `.env` (never in repo). Developer token + customer ID configurable.
- Commands implemented as `commander.js` CLI:
  - `list-campaigns` → tabular output of id, name, status, budget, 7-day metrics
  - `create-campaign` → campaign + ad group + keywords (from JSON input or prompts)
  - `pause-campaign <id>` / `resume-campaign <id>`
  - `edit-campaign <id>` → budget, keywords, ad copy
  - `report <id>` → impressions, clicks, cost, conversions, CPA (date range arg)
- Claude Code invokes via `Bash` tool: `node tools/google-ads-cli/dist/index.js list-campaigns`

---

## 12. Internationalisation (EN/PT)

### Decision: next-intl v4
**Rationale**:
- Best-in-class Next.js i18n library with full React Server Component support.
- Locale routing via middleware: `/en/services`, `/pt/services`. Default locale `en` (no prefix or with prefix — both modes supported).
- `useTranslations()` hook in client components; `getTranslations()` in RSC.
- ICU message format for plurals and date/number formatting.
- `messages/en.json` and `messages/pt.json` are the source of truth for all UI strings.
- Email templates receive `locale` prop; bilingual emails render both locales in sequence.

**Bilingual email approach** (FR-043):
```
[Subject: Appointment Confirmed / Compromisso Confirmado]
[Logo]
[EN content block — full email in English]
---
[PT content block — full email in Portuguese]
```

---

## 13. Deployment & Infrastructure

| Layer | Tool | Notes |
|---|---|---|
| Hosting | Vercel | Edge for public pages, Node.js for API + admin |
| Database | Neon (PostgreSQL) | Serverless, auto-scale, branching per PR |
| Cache / Locks | Upstash Redis | Serverless Redis; KV for rate limiting + distributed locks |
| Media | Cloudflare R2 | Zero egress, S3-compatible |
| Background Jobs | Inngest Cloud | Serverless; connects to Vercel deployment URL |
| Email | Resend | Transactional + marketing |
| SMS | Twilio | Transactional |
| DNS / CDN | Cloudflare | Proxied A record to Vercel; DDoS protection |
| Monitoring | Vercel Analytics + Sentry | Core Web Vitals + error tracking |

---

## 14. Admin Dashboard UX Patterns (2025 Market Standard)

Based on analysis of Boulevard, Fresha, and modern SaaS admin patterns:

**Layout**:
- Left sidebar (collapsed to icon-only on mobile): logo → Dashboard → Appointments → Clients → Staff → Services → Memberships → Packages → Promotions → Reports → Settings
- Top bar: date navigator (today / ‹ ›) + "New Booking" primary button + staff filter chips + notification bell
- Content: full-height calendar or data table depending on route

**Dashboard Home (KPI widgets)**:
- Today's revenue (vs. yesterday)
- Appointments today: count by status (scheduled / checked-in / completed / no-show)
- Utilization rate (booked slots / total slots)
- No-show rate (rolling 30-day)
- Quick-actions: New Booking, Block Time, Send Message

**Appointment Calendar**:
- Default: multi-staff resource time-grid (8am–9pm)
- Toggle: day / week / list views
- Drag-and-drop rescheduling (with conflict detection)
- Click slot → new booking modal (pre-filled with time + staff)
- Color-coded by status: blue (scheduled), green (checked-in), gray (completed), red (no-show), orange (cancelled)
- Real-time updates via tRPC subscriptions (SSE) when another admin moves an appointment

**Mobile admin (responsive)**:
- Sidebar collapses to bottom tab bar (5 primary routes)
- Calendar switches to scrollable day-list view
- "New Booking" FAB (floating action button) always visible

---

## Summary of All Decisions

| Topic | Decision | Key Reason |
|---|---|---|
| Framework | Next.js 15 App Router | SSR for SEO, RSC, Vercel optimized |
| Language | TypeScript 5.5 | Full type safety end-to-end |
| API | tRPC v11 | Type-safe, shared with future mobile |
| ORM | Prisma + PostgreSQL (Neon) | ACID for booking, great DX |
| Auth | Auth.js v5 | First-party, App Router native |
| UI | Shadcn/ui + Tailwind v4 | 2025 standard, fully customizable |
| Calendar | FullCalendar v6 | Multi-staff drag-drop grid |
| Tables | TanStack Table v8 | Virtual scrolling, type-safe |
| Charts | Recharts | Lightweight, composable |
| Background jobs | Inngest | Serverless-native, durable steps |
| Email | Resend + React Email | React templates, great DX |
| SMS | Twilio | Market standard |
| Media | Cloudflare R2 | Zero egress, S3-compatible |
| i18n | next-intl v4 | Best RSC support, EN/PT |
| Payments | Stripe + PayPal + Affirm | PCI-SAQ-A, per constitution |
| Deployment | Vercel + Neon + Upstash | Serverless, zero-config |
| Google Ads | google-ads-api CLI (commander.js) | Operable from Claude Code Bash |
| Monorepo | pnpm + Turborepo | Type sharing, future mobile |
