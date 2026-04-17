# Scope Definition: Brazilian Haven Beauty MVP v1

**Feature**: `platform-mvp-v1`  
**Date**: 2026-04-17  
**Status**: Review artifact

---

## Purpose

This document is the single review surface for project scope. It defines what is included in MVP v1,
what is explicitly excluded, what requires a separate future specification, and what is launch-critical
versus post-launch.

This file should be reviewed alongside:
- [spec.md](spec.md)
- [plan.md](plan.md)
- [tasks.md](tasks.md)
- [constitution.md](constitution.md)
- [design.md](design.md)

---

## Product Goal

Deliver the Brazilian Haven Beauty platform needed for launch-ready replacement of the core Vagaro flows
in scope: public website, booking, memberships, packages, coupons, account access, and core admin operations.

---

## MVP In Scope

| Area | Included |
|---|---|
| **Public Website** | Home, About, Services, Prices, Booking, Contact, Brazilian Wax landing page |
| **Brand & UX** | Bilingual EN/PT public site, language toggle, approved visual system, SEO-ready page structure |
| **Booking** | Service selection, staff selection, tiered pricing, tiered duration, real availability, booking confirmation, cancel/reschedule support, waitlist |
| **Staff & Services** | Staff profiles, specialties, bios, photos, schedules, admin-managed services, admin-managed pricing |
| **Payments** | Stripe, PayPal, Affirm via Stripe, saved payment methods via gateway vault, refunds, webhook handling |
| **Client Accounts** | Sign up, login, booking history, purchase history, memberships, packages, payment methods, notification preferences |
| **Memberships** | Recurring plans, staff-tier pricing, credits, renewal handling, tier-difference charging |
| **Packages** | Prepaid bundles, balance tracking, expiration rules, package application during booking |
| **Coupons** | Admin coupon management, server-side validation, checkout application |
| **Notifications** | Email and SMS reminders, waitlist notifications, low-credit alerts, renewal reminders, welcome flows, marketing opt-out controls |
| **Admin Dashboard** | Role-based access, KPI dashboard, appointments, calendar operations, staff management, service management, pricing management, coupon management, refunds |
| **Marketing Tooling** | Google Ads / analytics conversion tracking, Google Ads CLI for campaign operations from Claude Code |
| **Quality Gates** | TDD-first implementation, CI gating, contract tests, integration tests, E2E coverage for critical flows, accessibility and structured data validation |

---

## Explicitly Out of Scope for MVP v1

| Area | Excluded |
|---|---|
| **Commerce Expansion** | Gift cards, in-person retail checkout / POS |
| **Communication Expansion** | Two-way client/staff messaging, push notifications |
| **Trust Layer Expansion** | Public reviews system |
| **Back Office Expansion** | Payroll tracking, invoicing |
| **Migration Expansion** | Full mandatory Vagaro migration as a hard launch blocker |
| **Parity Expansion** | Full “every Vagaro flow” replacement at MVP |

---

## Needs Separate Future Spec

These items are intentionally deferred and must not be implemented ad hoc:

| Feature Area | Why Separate Spec Is Required |
|---|---|
| **Gift Cards** | Requires purchase, redemption, balance, admin, and accounting rules |
| **Retail / POS** | Requires checkout, catalog, tax, inventory, and reconciliation decisions |
| **Two-Way Messaging** | Requires threading, notifications, moderation, privacy, and retention rules |
| **Reviews** | Requires moderation, publishing rules, staff attribution, and trust policies |
| **Payroll** | Requires compensation model, reporting rules, and operational workflows |
| **Invoicing** | Requires invoice lifecycle, accounting expectations, and legal/business rules |
| **Push Notifications** | Requires device registration, opt-in model, and provider decisions |
| **Full Migration Program** | Requires import mapping, reconciliation, dry runs, fallback, and cutover strategy |
| **Historical Data Import** | Requires data-shape mapping and archival expectations |
| **Multi-Location Support** | Requires scheduling, pricing, staffing, and routing model changes |
| **Mobile App** | Requires separate product and client experience scope despite shared API potential |

---

## Launch-Critical

These capabilities are required for MVP v1 launch readiness:

- foundation and platform setup
- public website shell
- live Services and Prices pages
- booking flow with real availability
- payment completion and confirmation
- core admin daily operations
- staff, service, and pricing management
- account access and upcoming booking visibility
- reminder automation
- SEO and conversion instrumentation on public pages

---

## Post-Launch / Phase 2 Candidates

These may follow MVP v1 after the scoped launch flows are stable:

- deeper membership polish
- richer package marketing
- broader coupon sophistication
- more advanced automation journeys
- expanded Google Ads tooling maturity
- optional import tooling expansion
- richer reporting and operational analytics

---

## Scope Governance

- Any feature not listed under **MVP In Scope** is not assumed to be part of MVP v1.
- Any feature listed under **Needs Separate Future Spec** requires its own written specification before planning or implementation.
- If `spec.md`, `plan.md`, `tasks.md`, or supporting artifacts contradict this file, they should be updated to match this scope definition before implementation proceeds.
