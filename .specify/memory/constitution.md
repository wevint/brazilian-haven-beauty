<!--
Sync Impact Report
Version change: (none) → 1.0.0 (initial ratification)
Modified principles: N/A (first version)
Added sections: Core Principles, Platform Feature Scope, Development Workflow, Governance
Removed sections: N/A
Templates updated:
  ✅ .specify/templates/plan-template.md — Constitution Check section updated with principle gates
  ✅ .specify/memory/constitution.md — all placeholder tokens replaced
  ⚠ .specify/templates/spec-template.md — generic; no changes needed for initial version
  ⚠ .specify/templates/tasks-template.md — generic; no changes needed for initial version
Follow-up TODOs:
  - specs/design.md to be created when Home/About page design begins (Principle VI)
  - Tech stack (language, framework, DB) to be defined before first /speckit-plan run
-->

# Brazilian Haven Beauty Constitution

## Core Principles

### I. Client-First Experience

Every feature, page, and interaction MUST prioritize the client's comfort, simplicity, and wellness outcome.
UX decisions defer to the client journey — the booking flow, service discovery, and account management
MUST minimize friction at every step. If a design decision adds complexity for the client in exchange
for internal convenience, it MUST be rejected or formally justified.

### II. Custom-Built Platform, No Third-Party Booking Dependency

All capabilities — booking, scheduling, staff profiles, service catalogs, payments, memberships,
subscription plans, client data, calendar, payroll, and invoicing — are owned and managed by the
Brazilian Haven Beauty platform itself. No reliance on any third-party booking engine or SaaS platform
as a runtime dependency. External services (Stripe, PayPal, Affirm, SMS gateways) are integration
points, not replacements for platform ownership. Every core feature MUST be implementable and
maintainable without a third-party platform lock-in.

### III. Full Service & Pricing Customization

Services, memberships, and subscription plans MUST support per-staff pricing without exception.
A client's choice of professional directly and transparently affects the total price and duration.
This rule applies to:
- Individual à-la-carte services
- Service packages and bundles
- Recurring membership and subscription plans
- Add-on services during booking

No flat-price assumption is permitted across any service or plan type. Staff seniority tiers
MUST be reflected in pricing at every booking touchpoint.

### IV. Trust and Transparency

Pricing MUST be visible to the client before the booking is confirmed — no surprises at checkout.
Staff credentials, specialties, and verified client reviews MUST be accessible from their profile.
Promotional terms, membership conditions, package inclusions, and cancellation policies MUST be
clearly described before purchase. Hidden fees, opaque pricing tiers, and unexplained charges are
prohibited.

### V. Security Without Local Card Storage

No raw credit card or payment data is stored in the platform's database or any custom backend.
All payment processing flows through Stripe and PayPal, which are PCI-compliant. Affirm (Buy Now,
Pay Later) is integrated via Stripe. Gift card issuance and retail checkout follow the same rule —
tokenized references only, never raw card data. Client payment methods are managed exclusively
within the payment gateway's vault.

### VI. Premium Brazilian Wellness Brand Identity

Every design decision MUST reflect a premium, Brazilian-inspired wellness aesthetic. Brand
consistency is non-negotiable across all surfaces: web pages, email templates, SMS notifications,
promotional materials, booking confirmations, and gift card designs. A dedicated `specs/design.md`
artifact MUST be produced and approved before any design-heavy page (Home, About, Promotions) is
implemented. No ad-hoc styling decisions that deviate from the established brand language.

### VII. Automated Client Engagement

The platform MUST implement built-in automation to maintain ongoing, low-friction client relationships:
- Appointment reminders via email, SMS, and push notifications
- Waitlist slot notifications triggered automatically on cancellation
- Membership credit tracking and renewal reminders
- Promotional messaging for deals and first-time offers

Manual communication (staff-initiated messages via two-way in-app/SMS chat) is a complement, not
the primary engagement channel. Automation MUST reduce no-shows and improve retention by default.

## Platform Feature Scope

The following features are in scope for the Brazilian Haven Beauty platform. All are to be
implemented as first-party features:

| Domain | Features |
|---|---|
| **Booking** | 24/7 online booking, real-time slot availability, staff selection, service add-ons, waitlist management |
| **Promotions** | Daily deals, first-time client discounts, seasonal packages, coupon codes |
| **Staff** | Individual profiles, specialties, bio, photo gallery, seniority-based pricing tiers, reviews |
| **Reviews** | Client feedback by category: overall experience, punctuality, value, service quality |
| **Notifications** | Email, SMS, and push notifications for reminders, changes, waitlist, and promotions |
| **Memberships & Plans** | Recurring subscription plans with staff-linked pricing; session credit tracking; automatic credit application at booking |
| **Payments** | Stripe + PayPal processing; Affirm BNPL via Stripe; digital/physical gift cards; retail product checkout |
| **Messaging** | Two-way in-app and SMS chat between clients and staff (Vagaro Connect-inspired model) |
| **Operations** | Internal calendar, payroll tracking, invoices, customer tracking, notification management |
| **Client Profiles** | Personal account: booking history, purchase history, active memberships, saved preferences |

## Development Workflow

- Every new feature MUST begin with a written specification via `/speckit-specify` before any code is written.
- Implementation MUST be preceded by `/speckit-plan` (architecture + research) and `/speckit-tasks` (task breakdown).
- Design-heavy pages (Home, About, Promotions) MUST have an approved `specs/design.md` artifact before UI implementation begins.
- No service, staff, pricing, or booking data is hardcoded — all is driven by the platform's own data layer.
- Branch naming follows spec-kit's sequential numbering convention (e.g., `001-booking-flow`).
- Optional pre-implementation validation: use `/speckit-clarify` for ambiguous requirements and `/speckit-analyze` for cross-artifact consistency before implementation.

## Governance

This constitution is the authoritative document for all feature scopes, design decisions, and
technical constraints for Brazilian Haven Beauty. It MUST be consulted before starting any new
feature or making any architectural decision.

**Amendment procedure**:
1. Document the rationale for the change.
2. Increment the version according to semantic versioning:
   - MAJOR: Removal or redefinition of a principle (backward-incompatible governance change)
   - MINOR: New principle or section added, or materially expanded guidance
   - PATCH: Clarifications, wording improvements, typo fixes
3. Re-run `/speckit-constitution` to propagate changes to all dependent templates.

**Compliance**: Every feature spec and plan MUST include a Constitution Check section that explicitly
verifies alignment with all seven principles. Any feature that contradicts a principle MUST be
rejected or the principle formally amended first, with a documented rationale.

**Version**: 1.0.0 | **Ratified**: 2026-04-09 | **Last Amended**: 2026-04-09
