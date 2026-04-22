# Tasks: Brazilian Haven Beauty Platform MVP v1

**Input**: Design documents from `/specs/`  
**Prerequisites**: `scope.md`, `plan.md`, `spec.md`, `research.md`, `data-model.md`, `design.md`, `components.md`, `tokens.md`, `contracts/`

**Tests**: This task plan uses TDD. For each user story, write the listed contract, integration, and end-to-end tests first and confirm they fail before implementation.

**Organization**: Tasks are grouped by user story to preserve independent delivery and testability, while following current market-standard web delivery practices: CI-first quality gates, contract coverage for external interfaces, unit/integration coverage on domain logic, and Playwright coverage on critical user flows.

## Scope Boundary

This task plan covers MVP v1 only.

Included in this plan:
- public website
- booking
- payments
- memberships
- packages
- coupons
- email and SMS automation
- core admin operations
- Google Ads CLI

Explicitly not covered by this task plan:
- gift cards
- in-person retail checkout / POS
- two-way client/staff messaging
- public reviews system
- payroll tracking
- invoicing
- push notifications
- full mandatory Vagaro migration

Items not covered here require separate specification before task generation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel when working in different files with no blocking dependency
- **[Story]**: `SETUP`, `FOUND`, or a user story label such as `US1`
- Include exact file paths in descriptions

## Path Conventions

- Web app: `apps/web/`
- Shared database package: `packages/db/`
- Shared API/router package: `packages/trpc/`
- Shared config package: `packages/config/`
- CLI tooling: `tools/google-ads-cli/`
- Tests: `tests/unit/`, `tests/integration/`, `tests/e2e/`, `tests/contracts/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the monorepo, tooling, and baseline quality gates.

- [X] T001 [SETUP] Create workspace root files `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.gitignore`, `.editorconfig`, `.npmrc`
- [X] T002 [P] [SETUP] Create shared config package scaffolding in `packages/config/package.json`, `packages/config/tsconfig.base.json`, `packages/config/eslint/`, `packages/config/prettier/`
- [X] T003 [P] [SETUP] Create web app scaffolding in `apps/web/package.json`, `apps/web/tsconfig.json`, `apps/web/next.config.ts`, `apps/web/postcss.config.js`
- [X] T004 [P] [SETUP] Create shared test and CI scaffolding in `vitest.config.ts`, `playwright.config.ts`, `.github/workflows/ci.yml`
- [X] T005 [SETUP] Create root scripts for `lint`, `typecheck`, `test`, `e2e`, `build`, and `dev` in `package.json`
- [X] T006 [P] [SETUP] Create environment templates in `apps/web/.env.example` and `tools/google-ads-cli/.env.example`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core platform foundations that block all feature work.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [X] T007 [FOUND] Implement design tokens as CSS variables in `apps/web/app/globals.css` using `specs/tokens.md`
- [X] T008 [FOUND] Map approved tokens into Tailwind in `apps/web/tailwind.config.ts`
- [X] T009 [P] [FOUND] Create public component primitives in `apps/web/components/public/` for `site-header.tsx`, `hero-section.tsx`, `cta-banner.tsx`, `site-footer.tsx`
- [X] T010 [P] [FOUND] Create base app shell and route groups in `apps/web/app/[locale]/(public)/`, `apps/web/app/[locale]/(booking)/`, `apps/web/app/[locale]/(account)/`, `apps/web/app/[locale]/(admin)/`
- [X] T011 [P] [FOUND] Create i18n infrastructure in `apps/web/messages/en.json`, `apps/web/messages/pt.json`, `apps/web/middleware.ts`, `apps/web/lib/i18n/`
- [X] T012 [P] [FOUND] Create Prisma package scaffolding in `packages/db/package.json`, `packages/db/schema.prisma`, `packages/db/seed.ts`
- [X] T013 [FOUND] Implement core enums and shared entities from `data-model.md` in `packages/db/schema.prisma`
- [X] T014 [P] [FOUND] Create database client and repository helpers in `packages/db/src/client.ts` and `packages/db/src/repositories/`
- [X] T015 [P] [FOUND] Create Auth.js foundation in `apps/web/lib/auth/`, `apps/web/auth.ts`, and role-aware middleware guards
- [X] T016 [P] [FOUND] Create tRPC base infrastructure in `packages/trpc/package.json`, `packages/trpc/src/trpc.ts`, `packages/trpc/src/index.ts`, `apps/web/lib/trpc/`
- [X] T017 [P] [FOUND] Create payment integration shells in `apps/web/lib/stripe/`, `apps/web/lib/paypal/`, and webhook route placeholders in `apps/web/app/api/webhooks/`
- [X] T018 [P] [FOUND] Create background job scaffolding in `apps/web/lib/inngest/` and `apps/web/app/api/inngest/route.ts`
- [X] T019 [P] [FOUND] Create email and SMS provider scaffolding in `apps/web/lib/email/`, `apps/web/lib/sms/`, and bilingual template base files
- [X] T020 [P] [FOUND] Create observability and error handling setup in `apps/web/lib/observability/`, `apps/web/lib/errors/`, and shared API error formatting

**Checkpoint**: Foundation complete. User story work can now proceed in priority order.

---

## Phase 3: User Story 1 - Client books a service online with staff-tiered pricing (Priority: P1) 🎯 MVP

**Goal**: Deliver the revenue-critical public browsing and booking flow with real availability, tier-based pricing, and booking confirmation.

**Independent Test**: From a clean session, browse services, switch staff tiers, select an available slot, pay, and receive a confirmed booking that appears in the system.

### Tests for User Story 1 ⚠️

- [X] T021 [P] [US1] Write contract tests for `services`, `staff`, `availability`, and `bookings` routers in `tests/contracts/trpc/services.contract.test.ts`
- [X] T022 [P] [US1] Write unit tests for pricing resolution and duration lookup in `tests/unit/booking/pricing-resolution.test.ts`
- [X] T023 [P] [US1] Write unit tests for availability calculation and double-booking guards in `tests/unit/booking/availability.test.ts`
- [X] T024 [P] [US1] Write integration tests for booking creation and slot reservation in `tests/integration/booking/create-booking.test.ts`
- [X] T025 [P] [US1] Write Playwright flow for service selection to confirmation in `tests/e2e/booking/first-time-booking.spec.ts`

### Implementation for User Story 1

- [X] T026 [P] [US1] Implement service, staff, and service-pricing models in `packages/db/schema.prisma`
- [X] T027 [P] [US1] Implement appointment and staff schedule models in `packages/db/schema.prisma`
- [X] T028 [US1] Add seed data for services, staff, tiers, and availability in `packages/db/seed.ts`
- [X] T029 [US1] Implement booking domain services in `apps/web/lib/booking/pricing.ts`, `apps/web/lib/booking/availability.ts`, `apps/web/lib/booking/reservations.ts`
- [X] T030 [US1] Implement Redis lock and transaction-safe booking reservation flow in `apps/web/lib/booking/lock.ts` and `apps/web/lib/booking/create-booking.ts`
- [X] T031 [US1] Implement `services`, `staff`, `availability`, and `bookings` tRPC routers in `packages/trpc/src/routers/services.ts`, `staff.ts`, `appointments.ts`
- [X] T032 [P] [US1] Build public service browsing components in `apps/web/components/public/service-category-grid.tsx` and `service-card.tsx`
- [X] T033 [P] [US1] Build booking wizard components in `apps/web/components/booking/service-step.tsx`, `staff-step.tsx`, `datetime-step.tsx`, `payment-step.tsx`
- [X] T034 [US1] Build Services page in `apps/web/app/[locale]/(public)/services/page.tsx`
- [X] T035 [US1] Build Booking page in `apps/web/app/[locale]/(booking)/book/page.tsx`
- [X] T036 [US1] Implement booking confirmation email and SMS flow in `apps/web/lib/email/templates/booking-confirmation.tsx`, `apps/web/lib/sms/templates/booking-confirmation.ts`
- [X] T037 [US1] Add authenticated account upcoming-booking view in `apps/web/app/[locale]/(account)/account/page.tsx`

**Checkpoint**: User Story 1 should be fully functional and demoable as the MVP booking flow.

---

## Phase 4: User Story 2 - Admin manages the day's operations from a unified dashboard (Priority: P1)

**Goal**: Enable owners and staff to manage appointments, staff, and services from a first-party admin interface.

**Independent Test**: Sign in as admin, view today's calendar, edit service pricing, move an appointment, and verify public site data updates.

### Tests for User Story 2 ⚠️

- [X] T038 [P] [US2] Write contract tests for admin, appointments, services, and staff routers in `tests/contracts/trpc/admin.contract.test.ts`
- [X] T039 [P] [US2] Write integration tests for drag-reschedule and conflict handling in `tests/integration/admin/reschedule-appointment.test.ts`
- [X] T040 [P] [US2] Write integration tests for service pricing updates in `tests/integration/admin/update-service-pricing.test.ts`
- [X] T041 [P] [US2] Write Playwright admin flow for dashboard and calendar operations in `tests/e2e/admin/daily-operations.spec.ts`

### Implementation for User Story 2

- [X] T042 [US2] Implement admin role policy helpers in `apps/web/lib/auth/roles.ts`
- [X] T043 [US2] Implement admin-facing appointment, staff, and service routers in `packages/trpc/src/routers/admin.ts`, `appointments.ts`, `staff.ts`, `services.ts`
- [X] T044 [P] [US2] Build admin layout and navigation in `apps/web/app/[locale]/(admin)/admin/layout.tsx` and `apps/web/components/admin/admin-sidebar.tsx`
- [X] T045 [P] [US2] Build KPI and operational widgets in `apps/web/components/admin/kpi-cards.tsx` and `daily-summary.tsx`
- [X] T046 [P] [US2] Build calendar integration in `apps/web/components/admin/calendar/day-calendar.tsx`
- [X] T047 [P] [US2] Build service management table and form in `apps/web/components/admin/services/services-table.tsx` and `service-form.tsx`
- [X] T048 [P] [US2] Build staff management table and form in `apps/web/components/admin/staff/staff-table.tsx` and `staff-form.tsx`
- [X] T049 [US2] Implement admin dashboard page in `apps/web/app/[locale]/(admin)/admin/page.tsx`
- [X] T050 [US2] Implement appointment management page in `apps/web/app/[locale]/(admin)/admin/appointments/page.tsx`
- [X] T051 [US2] Implement services and staff pages in `apps/web/app/[locale]/(admin)/admin/services/page.tsx` and `staff/page.tsx`

**Checkpoint**: Admin users can operate day-to-day scheduling and pricing without Vagaro.

---

## Phase 5: User Story 3 - Payment capture without storing raw card data (Priority: P1)

**Goal**: Complete secure payment processing, saved methods, refunds, and payment record handling under PCI-SAQ-A constraints.

**Independent Test**: Complete a booking and a package-like checkout with Stripe/PayPal, verify token-only storage, save a method, and issue a refund from admin.

### Tests for User Story 3 ⚠️

- [X] T052 [P] [US3] Write contract tests for payment and webhook endpoints in `tests/contracts/http/payments.contract.test.ts`
- [X] T053 [P] [US3] Write unit tests verifying payment metadata storage constraints in `tests/unit/payments/payment-storage-guards.test.ts`
- [X] T054 [P] [US3] Write integration tests for Stripe and PayPal success/failure webhook handling in `tests/integration/payments/webhooks.test.ts`
- [X] T055 [P] [US3] Write Playwright payment flow tests in `tests/e2e/payments/checkout-and-confirmation.spec.ts`

### Implementation for User Story 3

- [X] T056 [US3] Implement payment transaction and saved payment method models in `packages/db/schema.prisma`
- [X] T057 [US3] Implement Stripe payment intent, setup intent, and refund helpers in `apps/web/lib/stripe/payment-intents.ts`, `setup-intents.ts`, `refunds.ts`
- [X] T058 [US3] Implement PayPal order helpers in `apps/web/lib/paypal/orders.ts`
- [X] T059 [US3] Implement payment and refund tRPC routers in `packages/trpc/src/routers/payments.ts`
- [X] T060 [US3] Implement Stripe and PayPal webhook routes in `apps/web/app/api/webhooks/stripe/route.ts` and `paypal/route.ts`
- [X] T061 [US3] Implement saved payment method account management in `apps/web/app/[locale]/(account)/account/payments/page.tsx`
- [X] T062 [US3] Implement admin refund UI in `apps/web/components/admin/payments/refund-panel.tsx`
- [X] T063 [US3] Add schema and log guards to prevent raw card storage in `packages/db/scripts/assert-no-raw-card-fields.ts` and CI workflow

**Checkpoint**: Payment flows are secure, testable, and refund-capable without storing raw card data.

---

## Phase 6: User Story 4 - Client buys a subscription plan with a chosen staff tier (Priority: P2)

**Goal**: Deliver recurring memberships with per-tier pricing, credits, and tier-upgrade logic.

**Independent Test**: Purchase a membership, receive credits, book a covered service, and consume a credit with correct tier pricing behavior.

### Tests for User Story 4 ⚠️

- [X] T064 [P] [US4] Write contract tests for memberships and plans in `tests/contracts/trpc/memberships.contract.test.ts`
- [X] T065 [P] [US4] Write unit tests for credit consumption and tier-difference charging in `tests/unit/memberships/credit-consumption.test.ts`
- [X] T066 [P] [US4] Write integration tests for renewal and credit issuance in `tests/integration/memberships/renewal.test.ts`
- [X] T067 [P] [US4] Write Playwright membership purchase flow in `tests/e2e/memberships/signup-and-book.spec.ts`

### Implementation for User Story 4

- [X] T068 [US4] Implement membership plan, plan pricing, and membership models in `packages/db/schema.prisma`
- [X] T069 [US4] Implement membership domain services in `apps/web/lib/memberships/plans.ts`, `credits.ts`, `renewals.ts`
- [X] T070 [US4] Implement membership and plans routers in `packages/trpc/src/routers/memberships.ts`
- [X] T071 [P] [US4] Build membership cards and plan comparison components in `apps/web/components/public/membership-card.tsx` and `membership-grid.tsx`
- [X] T072 [US4] Build memberships page in `apps/web/app/[locale]/(public)/memberships/page.tsx`
- [X] T073 [US4] Build account membership overview in `apps/web/app/[locale]/(account)/account/memberships/page.tsx`

**Checkpoint**: Membership sales and credit-based usage are independently functional.

---

## Phase 7: User Story 5 - Client purchases a service package / bundle in advance (Priority: P2)

**Goal**: Support prepaid packages with balance tracking, restrictions, and consumption at booking.

**Independent Test**: Purchase a package, consume one session during booking, and verify the balance and expiry behavior.

### Tests for User Story 5 ⚠️

- [ ] T074 [P] [US5] Write contract tests for packages in `tests/contracts/trpc/packages.contract.test.ts`
- [ ] T075 [P] [US5] Write unit tests for package balance decrement and expiry rules in `tests/unit/packages/package-balance.test.ts`
- [ ] T076 [P] [US5] Write integration tests for package purchase and booking application in `tests/integration/packages/apply-package-session.test.ts`
- [ ] T077 [P] [US5] Write Playwright package purchase flow in `tests/e2e/packages/purchase-and-apply.spec.ts`

### Implementation for User Story 5

- [ ] T078 [US5] Implement package and client package models in `packages/db/schema.prisma`
- [ ] T079 [US5] Implement package domain services in `apps/web/lib/packages/packages.ts` and `balance.ts`
- [ ] T080 [US5] Implement packages router in `packages/trpc/src/routers/packages.ts`
- [ ] T081 [P] [US5] Build package marketing and package card components in `apps/web/components/public/package-card.tsx`
- [ ] T082 [US5] Build packages page in `apps/web/app/[locale]/(public)/packages/page.tsx`
- [ ] T083 [US5] Build account package balance view in `apps/web/app/[locale]/(account)/account/packages/page.tsx`

**Checkpoint**: Package sales and usage are independently functional.

---

## Phase 8: User Story 6 - Coupons, promotions, and first-time discounts (Priority: P2)

**Goal**: Enable admin-configured coupon creation and safe checkout redemption.

**Independent Test**: Create a coupon, apply it at checkout, and enforce scope, date, and usage-limit rules.

### Tests for User Story 6 ⚠️

- [ ] T084 [P] [US6] Write contract tests for coupons in `tests/contracts/trpc/coupons.contract.test.ts`
- [ ] T085 [P] [US6] Write unit tests for coupon validation rules in `tests/unit/coupons/validate-coupon.test.ts`
- [ ] T086 [P] [US6] Write integration tests for first-time restrictions and usage limits in `tests/integration/coupons/redemption-rules.test.ts`
- [ ] T087 [P] [US6] Write Playwright coupon redemption test in `tests/e2e/coupons/apply-coupon-at-checkout.spec.ts`

### Implementation for User Story 6

- [ ] T088 [US6] Implement coupon model in `packages/db/schema.prisma`
- [ ] T089 [US6] Implement coupon validation and redemption services in `apps/web/lib/coupons/validate.ts` and `redeem.ts`
- [ ] T090 [US6] Implement coupons router in `packages/trpc/src/routers/coupons.ts`
- [ ] T091 [P] [US6] Build admin coupon table and form in `apps/web/components/admin/coupons/coupons-table.tsx` and `coupon-form.tsx`
- [ ] T092 [US6] Build admin coupons page in `apps/web/app/[locale]/(admin)/admin/coupons/page.tsx`
- [ ] T093 [US6] Add coupon UI to booking and checkout summary in `apps/web/components/booking/checkout-summary.tsx`

**Checkpoint**: Promotions are manageable and redeemable without breaking checkout integrity.

---

## Phase 9: User Story 7 - Automated client notifications reduce no-shows (Priority: P2)

**Goal**: Implement reminder, waitlist, renewal, and welcome automations as background workflows.

**Independent Test**: Create bookings and memberships, trigger time-based workflows, and verify sends and state transitions.

### Tests for User Story 7 ⚠️

- [ ] T094 [P] [US7] Write integration tests for Inngest reminder and renewal jobs in `tests/integration/automation/inngest-jobs.test.ts`
- [ ] T095 [P] [US7] Write integration tests for waitlist notification fan-out in `tests/integration/automation/waitlist-notifications.test.ts`
- [ ] T096 [P] [US7] Write unit tests for notification preference filtering in `tests/unit/notifications/preference-filtering.test.ts`

### Implementation for User Story 7

- [ ] T097 [US7] Implement waitlist and notification preference models in `packages/db/schema.prisma`
- [ ] T098 [US7] Implement reminder, waitlist, welcome, renewal, and low-credit workflows in `apps/web/lib/inngest/functions/`
- [ ] T099 [US7] Implement reusable bilingual email templates in `apps/web/lib/email/templates/`
- [ ] T100 [US7] Implement SMS message templates in `apps/web/lib/sms/templates/`
- [ ] T101 [US7] Build notification preference UI in `apps/web/app/[locale]/(account)/account/preferences/page.tsx`

**Checkpoint**: Automation reduces operational burden and supports retention targets.

---

## Phase 10: User Story 8 - Public website pages are SEO-ready for Google Ads (Priority: P3)

**Goal**: Build the public pages to the reference site’s layout language with SEO, performance, and conversion instrumentation.

**Independent Test**: Run Lighthouse and structured data validation on Home, About, Services, Prices, Contact, and Brazilian Wax pages.

### Tests for User Story 8 ⚠️

- [ ] T102 [P] [US8] Write metadata and JSON-LD rendering tests in `tests/integration/seo/public-page-metadata.test.tsx`
- [ ] T103 [P] [US8] Write accessibility smoke tests for public pages in `tests/integration/a11y/public-pages.test.tsx`
- [ ] T104 [P] [US8] Write Playwright public-page navigation and CTA tracking tests in `tests/e2e/public/public-pages-and-cta.spec.ts`

### Implementation for User Story 8

- [ ] T105 [US8] Build shared public-page components from `specs/components.md` in `apps/web/components/public/`
- [ ] T106 [US8] Build Home page in `apps/web/app/[locale]/(public)/page.tsx` following `specs/design.md` and the home reference page
- [ ] T107 [US8] Build About page in `apps/web/app/[locale]/(public)/about/page.tsx` following the about reference page
- [ ] T108 [US8] Build Services page refinements in `apps/web/app/[locale]/(public)/services/page.tsx` following the services reference page
- [ ] T109 [US8] Build Prices page in `apps/web/app/[locale]/(public)/prices/page.tsx` following the prices reference page
- [ ] T110 [US8] Build Contact page in `apps/web/app/[locale]/(public)/contact/page.tsx` following the contact reference page
- [ ] T111 [US8] Build Brazilian Wax landing page in `apps/web/app/[locale]/(public)/brazilian-wax/page.tsx`
- [ ] T112 [US8] Implement shared metadata, Open Graph, canonical, and JSON-LD helpers in `apps/web/lib/seo/`
- [ ] T113 [US8] Implement Google Ads / GTM conversion event utilities in `apps/web/lib/analytics/gtm.ts` and `conversion-events.ts`

**Checkpoint**: Public marketing pages are brand-aligned, performant, and ad-ready.

---

## Phase 11: User Story 9 - Google Ads campaign management operated from Claude Code (Priority: P3)

**Goal**: Deliver a CLI for Google Ads operations that can be driven from Claude Code.

**Independent Test**: List campaigns, create one, edit it, pause/resume it, and fetch reporting without using the Google Ads UI.

### Tests for User Story 9 ⚠️

- [ ] T114 [P] [US9] Write command contract tests for the CLI in `tests/contracts/cli/google-ads-cli.contract.test.ts`
- [ ] T115 [P] [US9] Write unit tests for Google Ads response mapping in `tests/unit/google-ads/report-mapping.test.ts`
- [ ] T116 [P] [US9] Write integration tests for CLI command flows with mocked API responses in `tests/integration/google-ads/cli-commands.test.ts`

### Implementation for User Story 9

- [ ] T117 [US9] Create CLI package scaffolding in `tools/google-ads-cli/package.json`, `tsconfig.json`, `src/index.ts`
- [ ] T118 [US9] Implement Google Ads client wrapper in `tools/google-ads-cli/src/client.ts`
- [ ] T119 [P] [US9] Implement list/report commands in `tools/google-ads-cli/src/commands/list-campaigns.ts` and `report.ts`
- [ ] T120 [P] [US9] Implement create/edit commands in `tools/google-ads-cli/src/commands/create-campaign.ts` and `edit-campaign.ts`
- [ ] T121 [P] [US9] Implement pause/resume commands in `tools/google-ads-cli/src/commands/pause-campaign.ts` and `resume-campaign.ts`
- [ ] T122 [US9] Write CLI documentation in `tools/google-ads-cli/README.md`

**Checkpoint**: Marketing operations can be handled from Claude Code using a safe, testable CLI.

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening, performance, migration readiness, and release safety checks.

- [ ] T123 [P] [POLISH] Add performance budgets and Web Vitals reporting in `apps/web/lib/observability/web-vitals.ts`
- [ ] T124 [P] [POLISH] Add accessibility review fixes across public and booking components in `apps/web/components/`
- [ ] T125 [P] [POLISH] Add structured data validation to CI in `.github/workflows/ci.yml`
- [ ] T126 [P] [POLISH] Add scoped migration/import scaffolding for optional v1 cutover support in `packages/db/src/migrations/vagaro-import/`
- [ ] T127 [POLISH] Run quickstart validation and update `specs/quickstart.md` where implementation details changed
- [ ] T128 [POLISH] Finalize production readiness checklist in `docs/release-checklist.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: starts immediately
- **Foundational (Phase 2)**: depends on Setup and blocks all stories
- **User Story Phases (Phase 3 onward)**: depend on Foundational completion
- **Polish (Phase 12)**: depends on all required user stories being complete

### User Story Dependencies

- **US1** depends only on Foundational and is the MVP
- **US2** depends on Foundational and benefits from US1 appointment and service models
- **US3** depends on Foundational and supports US1 checkout completion
- **US4** depends on US1 and US3
- **US5** depends on US1 and US3
- **US6** depends on US1 and US3
- **US7** depends on US1, US4, and US5 event flows
- **US8** depends on Foundational plus approved design artifacts; can run in parallel with some domain work once tokens/components exist
- **US9** depends on Foundational only and can run late without blocking MVP

### TDD Rule

- For every story, execute the listed tests first.
- Confirm tests fail before implementation begins.
- Do not mark a story complete until contract, integration, and end-to-end coverage passes for that story’s critical path.

---

## Parallel Opportunities

- Setup tasks marked `[P]` can run together
- Foundational token, i18n, db, auth, and integration shell tasks marked `[P]` can run together
- Within each story, tests marked `[P]` can run together
- Public page work in US8 can be split by page once shared public components exist
- CLI command tasks in US9 can run in parallel after the base client exists

---

## Implementation Strategy

### MVP First

1. Complete Setup
2. Complete Foundational
3. Complete US1
4. Complete US3 items required for live checkout
5. Validate booking flow independently

### Incremental Delivery

1. MVP booking and payment flow
2. Admin daily operations
3. Public marketing pages aligned to design and SEO requirements
4. Memberships, packages, coupons
5. Automations
6. Google Ads CLI

### Deferred / Needs Separate Spec

- gift cards
- in-person retail checkout / POS
- two-way client/staff messaging
- public reviews system
- payroll tracking
- invoicing
- push notifications
- full migration and reconciliation program

### Market-Standard Delivery Practices

- CI must gate on lint, typecheck, unit tests, integration tests, and contract tests
- Playwright covers revenue-critical journeys only, not every permutation
- Contract tests protect webhooks, CLI commands, and tRPC interfaces from regressions
- Domain logic lives in testable service modules, not page components
- SEO, accessibility, and payment safety checks are part of the release path, not post-launch cleanup
