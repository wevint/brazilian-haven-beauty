# Feature Specification: Brazilian Haven Beauty Platform MVP v1

**Feature**: `platform-mvp-v1`
**Created**: 2026-04-17
**Status**: Draft
**Input**: User description: "Build the Brazilian Haven Beauty custom platform to fully replace Vagaro. Public website with pages Home, About, Services, Prices, Booking, Contact, and a dedicated Brazilian Wax landing page, styled after https://red-badger-285858.hostingersite.com. Core client capabilities: browse services with staff-linked pricing, book appointments, purchase subscription plans with per-staff pricing, buy service packages (combos), redeem coupons. Admin dashboard for appointments, staff, services, prices, coupons, memberships, and packages. Pages must be SEO-optimized for Google Ads; campaign management must be operable from Claude Code."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Client books a service online with staff-tiered pricing (Priority: P1)

A first-time client lands on the site, browses available services, sees transparent per-staff pricing, picks a date/time with their preferred professional, pays, and receives a booking confirmation — entirely without a staff phone call.

**Why this priority**: This is the single revenue-generating path that must work before Vagaro can be shut off. If this flow is unreliable, the business loses every new booking.

**Independent Test**: From an empty session, complete a booking for a specific service with a specific staff member at a future time slot. Verify the appointment appears on the staff's internal calendar, the client receives a confirmation email, and payment is captured (or authorized) via the payment gateway. Delivers value even with no other stories implemented — the business can take live bookings.

**Acceptance Scenarios**:

1. **Given** a client is on the Services page, **When** they select a service and a staff member, **Then** the displayed price updates to reflect that staff member's tier.
2. **Given** a client has chosen service + staff + date, **When** they open the time picker, **Then** only real availability for that staff member on that date is selectable — no overlapping or already-booked slots.
3. **Given** a client confirms the booking and enters payment details, **When** the payment gateway authorizes the transaction, **Then** the appointment is persisted, a confirmation email is sent, and the slot is removed from availability for other clients.
4. **Given** the client has an active booking, **When** they return to their account page, **Then** they see the upcoming appointment with an option to cancel per the stated cancellation policy.

---

### User Story 2 — Admin manages the day's operations from a unified dashboard (Priority: P1)

An owner or staff member signs into the admin dashboard to see today's appointments, check in arriving clients, adjust the schedule when someone is running late, and add or edit services, staff, and prices — without ever touching Vagaro.

**Why this priority**: Without admin control of the live calendar, the salon cannot actually operate. The client-facing booking flow and the admin dashboard are co-required for day-one cutover.

**Independent Test**: Sign in as an admin, view today's appointment list, move an appointment to a new time slot, edit a service's price for one staff tier, and verify these changes are immediately reflected on the public site.

**Acceptance Scenarios**:

1. **Given** the admin signs in, **When** they open the dashboard home, **Then** they see today's appointments grouped by staff with status (scheduled / checked-in / completed / no-show / cancelled).
2. **Given** an appointment is displayed, **When** the admin drags it to a different time or staff column, **Then** the schedule updates, conflicts are detected, and the client is notified of the change.
3. **Given** the admin opens the Services panel, **When** they add a new service or change per-staff pricing, **Then** the public Services and Prices pages reflect the change immediately.
4. **Given** the admin opens the Staff panel, **When** they update a staff member's availability or seniority tier, **Then** the public booking calendar and displayed prices update accordingly.

---

### User Story 3 — Payment capture without storing raw card data (Priority: P1)

Every transaction — new booking, package purchase, membership signup, in-person retail checkout, gift card purchase — flows through Stripe or PayPal. The platform never stores raw card numbers. Affirm (BNPL) is offered via Stripe for eligible purchases.

**Why this priority**: No payment, no launch. Also a hard constitution constraint (Principle V): any card-storage leak blocks release entirely.

**Independent Test**: Complete a full purchase (booking + package + tip) using Stripe test cards. Inspect the database and confirm no PAN/CVV is stored — only gateway tokens. Repeat with PayPal and Affirm.

**Acceptance Scenarios**:

1. **Given** a client is at checkout, **When** they choose Stripe, PayPal, or Affirm, **Then** card entry happens in the gateway's hosted/SDK element — never in a form the platform controls.
2. **Given** a payment succeeds, **When** the record is stored, **Then** only the gateway's transaction reference and last-4/brand metadata are persisted; no PAN, CVV, or expiry is in the database.
3. **Given** a client wants to save a payment method, **When** they opt in, **Then** the card is vaulted in the gateway and a tokenized reference is stored locally.
4. **Given** a refund is required, **When** the admin issues it from the dashboard, **Then** the refund is executed against the original gateway transaction, not reconstructed from stored card data.

---

### User Story 4 — Client buys a subscription plan with a chosen staff tier (Priority: P2)

A returning client purchases a monthly membership (e.g., 2 Brazilian wax sessions/month with Senior staff). They pay monthly, and on each booking the platform automatically applies one of their membership credits, charging only the difference if they upgrade to a higher-tier staff.

**Why this priority**: Memberships are a retention and recurring-revenue lever. The business can technically launch without them, but competitive parity with Vagaro requires them within a short window of cutover.

**Independent Test**: A client signs up for a plan, credits appear in their account, they book an eligible service with their selected staff tier, and a credit is consumed rather than charging full price.

**Acceptance Scenarios**:

1. **Given** a client is on the Memberships page, **When** they select a plan and a staff tier, **Then** the displayed monthly price reflects that tier and the plan terms are shown in full before checkout.
2. **Given** a client completes signup, **When** the first billing cycle starts, **Then** the agreed credits are issued to their account and the recurring charge is scheduled in the payment gateway.
3. **Given** a member books a covered service at their plan's staff tier, **When** the booking is confirmed, **Then** one credit is consumed and no additional charge is made.
4. **Given** a member books the same service with a higher-tier staff than their plan covers, **When** the booking is confirmed, **Then** a credit is consumed and the tier-difference is charged.
5. **Given** a member's credit balance or renewal date is approaching, **When** the automation runs, **Then** the member is notified via their preferred channel.

---

### User Story 5 — Client purchases a service package / bundle in advance (Priority: P2)

A client buys a 6-session Brazilian wax package upfront at a bundled price. Future bookings draw from the package balance until exhausted; remaining balance is visible in their account.

**Why this priority**: Packages drive upfront cash flow and retention. Not required for launch, but expected by existing clients migrating from Vagaro.

**Independent Test**: Purchase a 6-session package, book and consume one session, verify the balance decrements to 5, and confirm the client cannot overspend the remaining balance.

**Acceptance Scenarios**:

1. **Given** a client views a service, **When** a package is offered, **Then** the package price, session count, staff-tier restrictions, and expiration are clearly displayed before purchase.
2. **Given** the client purchases the package, **When** payment succeeds, **Then** the sessions are credited to their account with the correct expiration.
3. **Given** a client books a covered service, **When** they apply a package session, **Then** the balance decrements and the booking shows "paid via package" in both client and admin views.
4. **Given** the package is expired or exhausted, **When** the client attempts to apply it, **Then** the system prevents application and offers either plan upgrade or standard payment.

---

### User Story 6 — Coupons, promotions, and first-time discounts (Priority: P2)

The admin creates a coupon (percentage or fixed amount, scoped to service/package/plan, with start/end dates and usage limits). Clients apply the code at checkout and see the discount before confirming.

**Why this priority**: Marketing levers are essential for paid-ads ROI. They enable first-time-client conversion flows that Google Ads campaigns will rely on.

**Independent Test**: Admin creates a 20%-off coupon valid for one service for 30 days. A client applies it and sees the discount on the checkout summary. A second redemption beyond the limit is rejected.

**Acceptance Scenarios**:

1. **Given** the admin is in the Promotions panel, **When** they create a coupon with scope, discount type, validity window, and usage cap, **Then** the coupon is saved and becomes redeemable at checkout.
2. **Given** a client enters a valid coupon at checkout, **When** the system validates it, **Then** the discount is applied and the total updates before payment.
3. **Given** a coupon exceeds its usage cap or expires, **When** a client attempts redemption, **Then** the attempt is rejected with a clear reason.
4. **Given** a first-time-client coupon exists, **When** a returning client attempts to use it, **Then** the system detects the account's booking history and rejects the redemption.

---

### User Story 7 — Automated client notifications reduce no-shows (Priority: P2)

Clients receive appointment reminders by email and SMS at configured intervals (e.g., 24 h and 2 h before). When a client cancels, waitlisted clients are notified automatically. Membership renewals, low-credit alerts, and first-time-client welcomes fire automatically.

**Why this priority**: Automation is a constitution mandate (Principle VII) and the single biggest lever on no-show rate. Without it, operational burden grows linearly with bookings.

**Independent Test**: Create an appointment, advance the clock, verify the reminder sent at the expected time. Cancel the appointment, verify waitlisted clients get notified.

**Acceptance Scenarios**:

1. **Given** a client has an upcoming appointment, **When** the reminder window is reached, **Then** a reminder is sent via the client's opted-in channels (email, SMS, push).
2. **Given** a client cancels a booking, **When** a waitlist exists for the freed slot, **Then** the next waitlisted client is notified with a time-bounded claim link.
3. **Given** a member's next billing is in 3 days, **When** the automation runs, **Then** a renewal reminder is sent with the charged amount and their plan details.
4. **Given** a client has elected to opt out of marketing messages, **When** a promotional send is generated, **Then** their profile is excluded from that send but transactional reminders still go through.

---

### User Story 8 — Public website pages are SEO-ready for Google Ads (Priority: P3)

Home, About, Services, Prices, Booking, Contact, and Brazilian Wax pages are built with clean URLs, fast load, proper heading hierarchy, descriptive meta tags, structured data (Service/LocalBusiness schema), and conversion tracking hooks ready for Google Ads to point at.

**Why this priority**: Ad spend is inefficient if landing pages aren't SEO-clean and conversion-tracked. This is prerequisite work for Google Ads campaigns but can follow the core booking flow.

**Independent Test**: Run each public page through an SEO audit (Lighthouse / PageSpeed / Rich Results Test). Verify title, meta description, canonical URL, Open Graph tags, JSON-LD structured data, and conversion event hooks are present. Confirm a dedicated `/brazilian-wax` landing page exists with service-specific content and a direct CTA to book.

**Acceptance Scenarios**:

1. **Given** each public page loads, **When** inspected, **Then** it returns a unique `<title>`, meta description, canonical, Open Graph/Twitter card, and relevant JSON-LD structured data.
2. **Given** the Google Rich Results Test scans any service page, **When** the test runs, **Then** LocalBusiness and Service schema validate without errors.
3. **Given** a client clicks "Book Now" from a landing page, **When** the event fires, **Then** a conversion event is sent to the configured analytics/ads pixel with the correct value and service identifier.
4. **Given** the Brazilian Wax dedicated page loads, **When** the user scrolls, **Then** they see service description, duration, per-staff pricing, FAQs, and a sticky "Book Brazilian Wax" CTA.

---

### User Story 9 — Google Ads campaign management operated from Claude Code (Priority: P3)

An operator uses Claude Code to create, edit, pause, and report on Google Ads campaigns — so the business can iterate on ad copy, budgets, keywords, and audiences without context-switching into the Google Ads UI for routine tasks.

**Why this priority**: Accelerates marketing iteration and is a stated user objective, but the platform can ship and take bookings without it. Implementable after the site is live and ads pixels are firing.

**Independent Test**: From Claude Code, create a test campaign targeting "Brazilian wax [city]", set a daily budget, pause it, and pull a performance report — all without opening the Google Ads web UI.

**Acceptance Scenarios**:

1. **Given** an operator is in Claude Code, **When** they invoke the campaign-management capability with valid credentials, **Then** they can list existing campaigns with status, budget, and 7-day performance.
2. **Given** the operator provides campaign parameters (name, budget, keywords, target location, ad copy), **When** they confirm, **Then** a campaign is created in Google Ads and an ID is returned.
3. **Given** a campaign exists, **When** the operator pauses or edits budget/keywords/ad copy, **Then** the change is applied and a confirmation is returned.
4. **Given** a campaign has been running, **When** the operator requests a report, **Then** impressions, clicks, cost, conversions, and CPA are returned, scoped to the requested date range.

---

### Edge Cases

- **Double-booking race condition**: two clients click the same slot simultaneously → only one booking succeeds; the other sees a clear "slot just taken" message with nearest alternatives.
- **Staff goes offline mid-day**: admin marks staff unavailable → existing appointments flagged for rebooking, future availability removed, affected clients notified.
- **Package or membership expires mid-booking-flow**: the platform detects expiry at confirmation time and prompts the client to either pay out-of-pocket or cancel.
- **Payment gateway outage**: client sees a graceful error; booking is NOT persisted; no partial state left behind.
- **Coupon + package + membership stacking**: rules for stacking must be explicit. Default: a booking can apply at most one membership credit *or* one package session *or* one coupon, not combinations (unless explicitly configured).
- **Timezone mismatch**: client books from a different timezone than the salon → all times display in the salon's local timezone with a clear label, and client confirmations also note the salon timezone.
- **Refund after a package session was consumed**: refund recalculates based on sessions remaining at the at-purchase bundle-price vs. single-session price.
- **SEO page edits break structured data**: CI should fail if a published page emits invalid JSON-LD.
- **Google Ads API outage**: Claude-Code-initiated operations surface a clear error and do not leave half-applied state.

---

## Requirements *(mandatory)*

### Functional Requirements

**Public website & content**

- **FR-001**: The platform MUST serve a public website with the following pages: Home, About, Services, Prices, Booking, Contact, and a dedicated `/brazilian-wax` landing page, following the layout and brand language of the reference site at `https://red-badger-285858.hostingersite.com`.
- **FR-002**: Every public page MUST include unique `<title>`, meta description, canonical URL, Open Graph tags, and relevant JSON-LD structured data (LocalBusiness, Service, FAQPage where applicable).
- **FR-003**: The website MUST implement a conversion-tracking pixel and event layer that Google Ads and Google Analytics can consume for campaign attribution.
- **FR-004**: The Services and Prices pages MUST render live data from the platform's own service catalog — no hardcoded service lists.
- **FR-005**: The Brazilian Wax landing page MUST include service description, duration, per-staff pricing, FAQs, and a primary booking CTA.

**Booking & scheduling**

- **FR-006**: Clients MUST be able to book an appointment by selecting service → staff → date → time → confirmation, without phone or email intervention.
- **FR-007**: The displayed price for any service MUST update in real time when the client changes the selected staff member.
- **FR-008**: The booking calendar MUST show only real, current availability for each staff member and MUST prevent double-booking under concurrent requests.
- **FR-009**: Clients MUST receive a booking confirmation via their selected channel(s) on successful booking and payment.
- **FR-010**: Clients MUST be able to view, reschedule (subject to policy), and cancel their upcoming appointments from their account page.
- **FR-011**: The platform MUST support a per-service waitlist; when a slot opens the next waitlisted client is notified with a time-bounded claim link.

**Staff & services**

- **FR-012**: Each staff member MUST have a profile with name, photo, bio, specialties, seniority tier, reviews, and visible per-tier pricing.
- **FR-013**: Every service MUST support per-staff-tier pricing and per-staff-tier duration. Flat pricing across tiers is not permitted unless the admin explicitly sets all tiers to the same value.
- **FR-014**: Admins MUST be able to create, edit, archive, and reorder services without code changes.
- **FR-015**: Admins MUST be able to add, edit, deactivate, and set schedules for staff without code changes.

**Subscriptions & packages**

- **FR-016**: The platform MUST support recurring subscription plans that bundle a fixed number of credits per billing cycle, scoped to specified services and staff tiers.
- **FR-017**: When a member books a covered service at their plan's staff tier, one credit MUST be consumed automatically with no additional charge. Upgrading to a higher staff tier MUST consume a credit and charge the tier-difference.
- **FR-018**: The platform MUST support prepaid service packages (N sessions bundled at a discount, with expiration and scope rules). A package session MUST be deductible at booking.
- **FR-019**: Membership and package purchases MUST NOT stack on the same booking unless the admin explicitly enables stacking for a specific promotion.
- **FR-020**: Clients MUST be able to see their active memberships, remaining credits, package balances, and upcoming renewals from their account page.

**Payments**

- **FR-021**: All payments MUST be processed via Stripe or PayPal. Affirm MUST be offered via Stripe for eligible purchases.
- **FR-022**: The platform MUST NOT store raw card data (PAN, CVV, expiry). Only gateway tokens and non-sensitive metadata (last-4, brand) may be persisted.
- **FR-023**: Refunds MUST be executable from the admin dashboard against the original gateway transaction.
- **FR-024**: The platform MUST support digital and physical gift card issuance and redemption with tokenized references, never raw card data.
- **FR-025**: In-person retail/product checkout MUST use the same payment rail as online bookings.

**Promotions**

- **FR-026**: Admins MUST be able to create coupons with configurable scope (service, package, plan, entire order), discount type (percent or fixed), validity window, per-client and total usage caps, and first-time-client restrictions.
- **FR-027**: Coupon redemption MUST be validated server-side at checkout; invalid/expired/exceeded coupons MUST be rejected with a clear reason.

**Notifications & automation**

- **FR-028**: The platform MUST send appointment reminders via email and SMS at configurable intervals before each appointment.
- **FR-029**: The platform MUST send waitlist notifications automatically when a covered slot opens.
- **FR-030**: The platform MUST send membership renewal reminders, low-credit alerts, and first-time-client welcomes automatically.
- **FR-031**: Clients MUST be able to opt out of marketing messages while continuing to receive transactional reminders.

**Admin dashboard**

- **FR-032**: The admin dashboard MUST provide: appointment calendar (day/week/staff views), staff management, service management, pricing management, coupon management, membership/plan management, package management, client lookup, refund capability, and at-a-glance operational KPIs (today's appointments, revenue, no-show rate).
- **FR-033**: Admin actions MUST be role-gated: owner, manager, and staff roles with distinct permissions. Staff roles MUST NOT be able to alter pricing or issue refunds.
- **FR-034**: All admin changes that affect the public site (services, prices, staff availability) MUST be reflected within 60 seconds.

**Client accounts & data**

- **FR-035**: Clients MUST be able to create an account, log in, view booking and purchase history, manage saved payment methods (via gateway vault), update profile, and opt in/out of notification channels.
- **FR-036**: Client profiles MUST retain booking, purchase, and membership history; staff notes; and preferences without ever storing raw payment data.

**SEO & Google Ads integration**

- **FR-037**: The platform MUST integrate Google Ads conversion tracking (via Global Site Tag or Google Tag Manager) and fire a conversion event on successful booking, membership signup, and package purchase with order value.
- **FR-038**: The platform MUST expose a campaign-management capability usable from Claude Code that can list, create, edit, pause, resume, and report on Google Ads campaigns, ad groups, and keywords for the configured Google Ads account.
- **FR-039**: SEO-critical pages MUST be server-rendered or pre-rendered such that crawlers receive fully rendered HTML with structured data.

**Vagaro decommissioning**

- **FR-040**: At cutover, the platform MUST provide a clean customer-facing replacement for every Vagaro flow currently in use (booking, memberships, gift cards, messaging, purchases, account access).
- **FR-041**: At cutover, the platform MUST migrate client accounts (name, email, contact details), active membership enrollments, remaining package session counts, and unredeemed gift card balances from Vagaro. Historical appointment records and payment history are NOT migrated. Existing clients claim their new account via an email-verified flow sent at launch.
- **FR-042**: The website MUST display a language toggle in the global header, defaulting to English. Selecting Portuguese switches all public-facing page content to Portuguese. The selected language is persisted for the session.
- **FR-043**: All automated email notifications (booking confirmation, reminder, cancellation, membership renewal, welcome) MUST include both English and Portuguese content in the same message, clearly separated by language.

### Key Entities *(include if feature involves data)*

- **Client**: A person who books, purchases, or holds a membership. Fields include identity, contact, notification preferences, saved-payment-method references (token only), booking history, purchase history, and active memberships/packages.
- **Staff**: A service provider. Fields include identity, role, seniority tier, specialties, bio, photo, per-day schedule/availability, reviews, and per-staff pricing overrides.
- **Service**: A bookable offering. Fields include name, description, base duration, per-staff-tier pricing and per-staff-tier duration, category, publish status, SEO metadata.
- **Appointment**: A scheduled instance of a service. Fields include client, staff, service, start/end, status (scheduled / checked-in / completed / no-show / cancelled), payment reference, and applied credits (membership / package / coupon).
- **Membership Plan**: A recurring subscription definition. Fields include name, billing cycle, per-staff-tier price, credits granted per cycle, covered services, and terms.
- **Membership**: A client's active instance of a plan. Fields include plan reference, billing start / next-renewal, credit balance, status.
- **Service Package**: A prepaid bundle definition. Fields include name, included sessions, bundle price, covered services, staff-tier restrictions, expiration rule.
- **Client Package**: A purchased instance of a package for a client. Fields include sessions remaining, expiration, purchase reference.
- **Coupon**: A promotional code. Fields include code, scope, discount type/amount, validity window, usage caps, first-time-client flag.
- **Gift Card**: A prepaid balance instrument. Fields include tokenized reference, balance, currency, issued-to, redeemed-by, expiration (if any).
- **Payment Transaction**: A gateway-mediated transaction record. Fields include gateway, transaction reference, amount, currency, status, related entity (appointment / membership / package / gift-card / retail), last-4, brand. No PAN/CVV.
- **Notification Preference**: A client's per-channel (email / SMS / push), per-category (transactional / marketing / reminders) consent matrix.
- **Ad Campaign Reference**: A local record of a Google Ads campaign (id, name, status, budget, linked landing page, latest synced metrics) that the Claude-Code-operated campaign layer reads and writes.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new client can complete a first booking — from landing on the homepage to receiving a confirmation — in under 3 minutes on mobile.
- **SC-002**: 95% of real-availability lookups (a client opening the booking calendar for a service/staff/date) return within 1 second.
- **SC-003**: Double-booking incidents on the platform fall to 0 across concurrent-load testing at 50 simultaneous booking attempts per staff member per minute.
- **SC-004**: Vagaro is fully decommissioned — no new bookings, no new memberships, no new gift-card issuance routed through Vagaro — within 60 days of platform MVP go-live.
- **SC-005**: Appointment no-show rate drops by at least 25% compared to the pre-launch Vagaro baseline within 90 days post-launch, attributable to automated reminders.
- **SC-006**: 80% of existing Vagaro clients successfully claim their new-platform account within 30 days of cutover.
- **SC-007**: Zero incidents of raw card data stored locally, verified by automated scanning of the database and logs on every release.
- **SC-008**: Every public page passes Google Rich Results Test with valid LocalBusiness and Service schema on release.
- **SC-009**: Core Web Vitals (LCP, CLS, INP) pass Google's "Good" thresholds on mobile for Home, Services, Prices, Booking, and Brazilian Wax pages.
- **SC-010**: Google Ads conversion events fire with correct order value on 99%+ of completed bookings, verified via Google Ads attribution report.
- **SC-011**: An operator can create, pause, edit, and report on a Google Ads campaign from Claude Code in under 5 minutes per action, without opening the Google Ads web UI.
- **SC-012**: The admin dashboard can load today's full appointment view in under 2 seconds at realistic salon load (200+ appointments/day).

---

## Assumptions

- **Single location, single timezone at launch.** Multi-location support is out of scope for v1 and will be specified separately if needed.
- **Bilingual website (English / Portuguese).** The website header exposes a language toggle; it always opens in English. Portuguese is a fully supported alternative language. Email notification content is bilingual (both languages in the same message).
- **USD currency.** Single currency at launch.
- **Design reference provided.** The reference site `https://red-badger-285858.hostingersite.com` is the authoritative visual/layout reference; the `ui-ux-pro-max` agent will be used to produce the design system and implement the frontend. A `specs/design.md` artifact will be produced before design-heavy pages (Home, About, Brazilian Wax) are implemented, per constitution Principle VI.
- **Stripe is the primary gateway.** PayPal is an alternate option at checkout. Affirm is offered through Stripe for eligible cart values.
- **Notification channels.** Email and SMS at launch; push notifications in a later iteration. SMS requires a dedicated delivery provider (to be selected in the plan phase).
- **Google Ads account exists.** The business already owns a Google Ads account with historical campaigns running against the reference site. Credentials and API access will be provided for the Claude-Code campaign layer.
- **Existing ad campaigns on the reference site.** Active campaigns will be paused, migrated, or redirected to the new landing pages during cutover — not left pointing at the old site.
- **Authentication.** Client and admin accounts use email + password with industry-standard session/OAuth patterns; exact choice is a planning-phase decision.
- **Data layer.** All service, staff, pricing, booking, and membership data is owned by the new platform's data store — no runtime dependency on Vagaro. *(Constitution Principle II.)*
- **Role model.** Admin roles at launch: owner, manager, staff. Clients are a separate account type.
- **Audit & compliance.** Payment flows are PCI-SAQ-A scope (hosted gateway fields). Standard data protection practices apply to client PII.

---

## Constitution Alignment Preview

This feature's scope maps to all seven constitutional principles and does not contradict any:

- **I. Client-First Experience** — Booking flow, transparent pricing, and account simplicity are P1.
- **II. Custom-Built Platform** — All booking, scheduling, memberships, packages, and payments are first-party; no runtime Vagaro dependency.
- **III. Full Service & Pricing Customization** — FR-007, FR-012, FR-013, FR-017 enforce per-staff-tier pricing across services, memberships, packages, and add-ons.
- **IV. Trust and Transparency** — FR-002, FR-012, FR-027, and the Prices/Memberships pages ensure pricing and terms are visible before commitment.
- **V. Security Without Local Card Storage** — FR-021–FR-024, SC-007 codify gateway-only card handling.
- **VI. Premium Brazilian Wellness Brand Identity** — FR-001, FR-005, and the Assumptions commit to a `specs/design.md` artifact before design-heavy pages are implemented.
- **VII. Automated Client Engagement** — FR-028–FR-031 cover reminders, waitlist, renewal, and welcome automation.

A full Constitution Check with gate evaluation is the responsibility of `/speckit-plan`.
