# Data Model: Brazilian Haven Beauty Platform MVP v1

**Phase**: 1 — Design & Contracts  
**Date**: 2026-04-17  
**Branch**: `001-platform-mvp-v1`

---

## Entity Relationship Overview

```
Client ─────────────── Appointment ─────── Staff
  │                        │                 │
  │                    Service          StaffTier
  │                        │                 │
  ├─ Membership ─── MembershipPlan    ServicePricing
  ├─ ClientPackage ── ServicePackage       (join)
  ├─ Coupon (redeemed)
  ├─ GiftCard (issued/redeemed)
  └─ PaymentTransaction
         │
    (Stripe / PayPal)
```

---

## Entities

### 1. Client

A person who books services, holds memberships/packages, and has an account on the platform.

**Fields**:

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `email` | String (unique) | Login credential, notification channel |
| `emailVerified` | DateTime? | Null until email-verified claim flow completes |
| `phone` | String? | E.164 format; used for SMS |
| `firstName` | String | |
| `lastName` | String | |
| `preferredLocale` | Enum `en \| pt` | Drives email language preference |
| `profilePhotoUrl` | String? | Cloudflare R2 URL |
| `staffNotes` | String? | Admin-only internal notes; never shown to client |
| `referredBy` | UUID? | FK → Client (referral tracking) |
| `isFirstTimeClient` | Boolean | Default `true`; set `false` after first completed appointment |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

**Relations**:
- `Appointment[]` — all appointments (past + future)
- `Membership[]` — active and past memberships
- `ClientPackage[]` — purchased packages
- `PaymentTransaction[]` — all payment records
- `NotificationPreference` — one-to-one; opt-in/out per channel and category
- `SavedPaymentMethod[]` — gateway vault references (no raw card data)

**Validation rules**:
- `email` must be valid format; unique across all accounts
- `phone` must be valid E.164 if provided
- `preferredLocale` defaults to `en`

**State transitions**: N/A (not a state machine entity)

---

### 2. Staff

A service provider with a profile, seniority tier, and schedule.

**Fields**:

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `userId` | UUID | FK → User (auth account for dashboard login) |
| `firstName` | String | |
| `lastName` | String | |
| `bio` | String? | Public-facing bio |
| `photoUrl` | String? | Cloudflare R2 URL |
| `specialties` | String[] | Tags displayed on profile |
| `tier` | Enum `junior \| senior \| master` | Drives pricing via ServicePricing join |
| `isActive` | Boolean | `false` = deactivated; hidden from booking |
| `displayOrder` | Int | Controls order on public staff listing |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

**Relations**:
- `StaffSchedule[]` — weekly recurring availability windows + exceptions
- `Appointment[]` — appointments assigned to this staff
- `ServicePricing[]` — per-(service, tier) price records authored when tier changes
- `Review[]` — client reviews

**State transitions**: `isActive` toggled by owner/manager. When set to `false`, future slots removed and existing appointments flagged for reassignment.

---

### 3. StaffSchedule

A recurring availability window or a one-off exception (block or extra availability).

**Fields**:

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `staffId` | UUID | FK → Staff |
| `type` | Enum `recurring \| exception` | |
| `dayOfWeek` | Int? | 0–6 (Sun–Sat); only for `recurring` |
| `startTime` | String | "HH:MM" in salon's local time |
| `endTime` | String | "HH:MM" in salon's local time |
| `date` | Date? | Specific date; only for `exception` |
| `isAvailable` | Boolean | `false` = blocked (day off, break) |
| `note` | String? | Admin note (e.g., "lunch break") |

---

### 4. Service

A bookable offering with per-staff-tier pricing and durations.

**Fields**:

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `name` | String | |
| `nameTranslations` | JSON | `{ en: string, pt: string }` |
| `description` | String | |
| `descriptionTranslations` | JSON | `{ en: string, pt: string }` |
| `category` | String | e.g., "Brazilian Wax", "Eyebrows" |
| `durationMinutes` | Int | Default duration (overridden per tier in ServicePricing) |
| `isActive` | Boolean | `false` = archived, not bookable |
| `allowWaitlist` | Boolean | Default `true` |
| `displayOrder` | Int | |
| `seoSlug` | String (unique) | URL slug for service detail page |
| `seoMetaDescription` | String? | Overrides generated meta description |
| `jsonLdSchema` | JSON? | Service-specific JSON-LD override |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

**Relations**:
- `ServicePricing[]` — per-tier price + duration records (mandatory; at least one tier required)
- `ServicePackage[]` (many-to-many via `PackageService`) — packages that include this service
- `MembershipPlan[]` (many-to-many via `PlanService`) — plans that cover this service

---

### 5. ServicePricing

Join table: (Service × StaffTier) → price and duration.

**Fields**:

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `serviceId` | UUID | FK → Service |
| `staffTier` | Enum `junior \| senior \| master` | |
| `priceUsd` | Decimal(10,2) | Price in USD; no flat-price shortcut |
| `durationMinutes` | Int | Can differ per tier (e.g., master is more thorough) |
| `isActive` | Boolean | Allows disabling a tier for a service |

**Unique constraint**: `(serviceId, staffTier)` — one price per tier per service.

**Validation**: `priceUsd >= 0`; `durationMinutes >= 5`.

---

### 6. Appointment

A scheduled instance of a service for a client with a specific staff member.

**Fields**:

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `clientId` | UUID | FK → Client |
| `staffId` | UUID | FK → Staff |
| `serviceId` | UUID | FK → Service |
| `staffTier` | Enum | Snapshot at booking time (tier may change later) |
| `startAt` | DateTime | UTC; stored as UTC, displayed in salon timezone |
| `endAt` | DateTime | UTC |
| `status` | Enum | `scheduled \| checked_in \| completed \| no_show \| cancelled` |
| `priceSnapshotUsd` | Decimal(10,2) | Price at time of booking (ServicePricing may change) |
| `paymentMethod` | Enum `membership_credit \| package \| coupon \| stripe \| paypal \| gift_card` | Primary payment method used |
| `membershipId` | UUID? | FK → Membership (if credit consumed) |
| `clientPackageId` | UUID? | FK → ClientPackage (if session consumed) |
| `couponId` | UUID? | FK → Coupon (if applied) |
| `paymentTransactionId` | UUID? | FK → PaymentTransaction (if direct payment) |
| `cancellationReason` | String? | Admin or client note on cancellation |
| `cancelledAt` | DateTime? | |
| `cancelledBy` | Enum `client \| admin` | |
| `noShowAt` | DateTime? | When marked no-show by admin |
| `checkInAt` | DateTime? | When client is checked in |
| `completedAt` | DateTime? | When appointment is marked complete |
| `adminNote` | String? | Staff notes, never shown to client |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

**State transitions**:
```
scheduled → checked_in → completed
scheduled → cancelled (by client or admin)
scheduled → no_show (by admin after appointment time passes)
```

**Validation rules**:
- `endAt > startAt`
- `startAt` must fall within a `StaffSchedule.isAvailable = true` window for the selected staff
- No overlapping `[startAt, endAt)` intervals for the same `staffId` with status not in `[cancelled]`
- Double-booking prevention: enforced at DB level via a partial unique index + Redis distributed lock at reservation time

---

### 7. AppointmentWaitlist

Clients waiting for a specific slot to open.

**Fields**:

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `clientId` | UUID | FK → Client |
| `serviceId` | UUID | FK → Service |
| `staffId` | UUID? | Preferred staff; `null` = any staff |
| `requestedDate` | Date | Day the client wants |
| `notifiedAt` | DateTime? | When the open-slot notification was sent |
| `claimExpiresAt` | DateTime? | Claim link TTL (30 min after notification) |
| `status` | Enum `waiting \| notified \| claimed \| expired` | |
| `createdAt` | DateTime | |

---

### 8. MembershipPlan

A recurring subscription definition.

**Fields**:

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `name` | String | e.g., "Wax Club – Senior" |
| `nameTranslations` | JSON | `{ en, pt }` |
| `descriptionTranslations` | JSON | `{ en, pt }` |
| `billingCycle` | Enum `monthly \| annual` | |
| `creditsPerCycle` | Int | Sessions granted per billing period |
| `isActive` | Boolean | `false` = not available for new signups |
| `stripeProductId` | String | Stripe Product ID for this plan |
| `createdAt` | DateTime | |

**Relations**:
- `PlanPricing[]` — per-staffTier price for this plan
- `PlanService[]` — services covered by this plan

---

### 9. PlanPricing

Per-tier monthly/annual price for a MembershipPlan.

**Fields**:

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `planId` | UUID | FK → MembershipPlan |
| `staffTier` | Enum `junior \| senior \| master` | |
| `priceUsd` | Decimal(10,2) | Monthly charge for this tier |
| `stripePriceId` | String | Stripe Price ID for recurring billing |

**Unique constraint**: `(planId, staffTier)`

---

### 10. Membership

A client's active instance of a MembershipPlan.

**Fields**:

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `clientId` | UUID | FK → Client |
| `planId` | UUID | FK → MembershipPlan |
| `staffTier` | Enum | Tier selected at signup |
| `status` | Enum `active \| paused \| cancelled \| expired` | |
| `creditBalance` | Int | Current available credits |
| `billingStart` | DateTime | First billing date |
| `nextRenewalAt` | DateTime | Next credit issue + charge date |
| `stripeSubscriptionId` | String | Stripe Subscription ID |
| `cancelledAt` | DateTime? | |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

**State transitions**:
```
active → paused (admin or client; billing paused)
active → cancelled (at end of cycle or immediately)
active → expired (if payment fails and dunning exhausted)
paused → active (resumed)
```

---

### 11. ServicePackage

A prepaid bundle definition (e.g., "6 Brazilian Wax Sessions").

**Fields**:

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `name` | String | |
| `nameTranslations` | JSON | `{ en, pt }` |
| `descriptionTranslations` | JSON | `{ en, pt }` |
| `sessionCount` | Int | Total sessions in the bundle |
| `priceUsd` | Decimal(10,2) | Total bundle price |
| `validityDays` | Int | Sessions expire N days after purchase |
| `staffTierRestriction` | Enum? | `null` = any tier; set to restrict (e.g., senior only) |
| `isActive` | Boolean | |
| `createdAt` | DateTime | |

**Relations**:
- `PackageService[]` — services that can be consumed from this package

---

### 12. ClientPackage

A purchased instance of a ServicePackage for a client.

**Fields**:

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `clientId` | UUID | FK → Client |
| `packageId` | UUID | FK → ServicePackage |
| `sessionsRemaining` | Int | Decrements on each appointment |
| `purchasedAt` | DateTime | |
| `expiresAt` | DateTime | `purchasedAt + validityDays` |
| `status` | Enum `active \| exhausted \| expired` | |
| `paymentTransactionId` | UUID | FK → PaymentTransaction |

---

### 13. Coupon

A promotional code.

**Fields**:

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `code` | String (unique, uppercase) | Client-facing redemption code |
| `description` | String | Admin label |
| `discountType` | Enum `percent \| fixed_usd` | |
| `discountValue` | Decimal(10,2) | Percentage (0–100) or USD amount |
| `scope` | Enum `service \| package \| plan \| order` | What it applies to |
| `serviceId` | UUID? | Scoped to a specific service (if scope = service) |
| `packageId` | UUID? | Scoped to a specific package |
| `planId` | UUID? | Scoped to a specific plan |
| `validFrom` | DateTime | |
| `validUntil` | DateTime | |
| `maxTotalUses` | Int? | `null` = unlimited |
| `maxUsesPerClient` | Int | Default `1` |
| `firstTimeClientOnly` | Boolean | Default `false` |
| `currentUseCount` | Int | Maintained by DB trigger / atomic increment |
| `isActive` | Boolean | Admin can disable mid-campaign |
| `createdAt` | DateTime | |

**Validation at redemption** (server-side, FR-027):
1. `isActive = true`
2. `now` between `validFrom` and `validUntil`
3. `currentUseCount < maxTotalUses` (if set)
4. Client's use count for this coupon < `maxUsesPerClient`
5. If `firstTimeClientOnly`: client's `isFirstTimeClient = true`
6. Scope matches the cart item being discounted

---

### 14. GiftCard

A prepaid balance instrument.

**Fields**:

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `code` | String (unique) | Tokenized reference (never raw card data) |
| `issuedToClientId` | UUID? | FK → Client; null for physical/retail GC |
| `initialBalanceUsd` | Decimal(10,2) | |
| `currentBalanceUsd` | Decimal(10,2) | |
| `currency` | String | "USD" |
| `status` | Enum `active \| exhausted \| expired \| voided` | |
| `expiresAt` | DateTime? | `null` = no expiry |
| `purchasedAt` | DateTime | |
| `paymentTransactionId` | UUID | FK → PaymentTransaction (the purchase) |

---

### 15. PaymentTransaction

A gateway-mediated payment record. No PAN/CVV stored.

**Fields**:

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `clientId` | UUID | FK → Client |
| `gateway` | Enum `stripe \| paypal \| affirm` | |
| `gatewayTransactionId` | String | Stripe PaymentIntent ID or PayPal Order ID |
| `gatewayCustomerId` | String? | Stripe Customer ID (for saved methods) |
| `amount` | Decimal(10,2) | Charged amount in USD |
| `currency` | String | "USD" |
| `status` | Enum `pending \| succeeded \| failed \| refunded \| partially_refunded` | |
| `last4` | String? | Last 4 digits of card (display only) |
| `cardBrand` | String? | "visa", "mastercard", etc. |
| `relatedEntity` | Enum `appointment \| membership \| package \| gift_card \| retail` | What was paid for |
| `relatedEntityId` | UUID | FK to the related entity |
| `refundedAmount` | Decimal(10,2) | Default 0 |
| `refundedAt` | DateTime? | |
| `refundGatewayId` | String? | Stripe Refund ID |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

**Constraint**: No column named `pan`, `cvv`, `cardNumber`, `fullCardNumber`, or similar. Enforced by CI schema scan.

---

### 16. SavedPaymentMethod

A gateway vault reference for a client's saved card. Zero raw card data.

**Fields**:

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `clientId` | UUID | FK → Client |
| `gateway` | Enum `stripe \| paypal` | |
| `gatewayPaymentMethodId` | String | Stripe PaymentMethod ID |
| `last4` | String | Display only |
| `cardBrand` | String | Display only |
| `expiryMonth` | Int | Display only |
| `expiryYear` | Int | Display only |
| `isDefault` | Boolean | |
| `createdAt` | DateTime | |

---

### 17. NotificationPreference

Per-client consent matrix for notification channels and categories.

**Fields**:

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `clientId` | UUID (unique) | FK → Client; one-to-one |
| `emailTransactional` | Boolean | Default `true`; cannot opt out of bookings |
| `emailMarketing` | Boolean | Default `true`; client can opt out |
| `emailReminders` | Boolean | Default `true` |
| `smsTransactional` | Boolean | Default `true` |
| `smsMarketing` | Boolean | Default `false` |
| `smsReminders` | Boolean | Default `true` |
| `updatedAt` | DateTime | |

---

### 18. Review

A client review for a completed appointment.

**Fields**:

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `clientId` | UUID | FK → Client |
| `staffId` | UUID | FK → Staff |
| `appointmentId` | UUID (unique) | FK → Appointment; one review per appointment |
| `overallRating` | Int | 1–5 |
| `punctualityRating` | Int | 1–5 |
| `valueRating` | Int | 1–5 |
| `serviceQualityRating` | Int | 1–5 |
| `comment` | String? | Optional text |
| `isPublished` | Boolean | Admin can withhold if inappropriate |
| `createdAt` | DateTime | |

---

### 19. AdCampaignReference

Local record of a Google Ads campaign, synced by the CLI tool.

**Fields**:

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `googleCampaignId` | String | Google Ads campaign resource ID |
| `name` | String | |
| `status` | Enum `enabled \| paused \| removed` | Mirrored from Google Ads |
| `dailyBudgetUsd` | Decimal(10,2) | Last synced budget |
| `linkedLandingPageSlug` | String? | Internal URL slug of the landing page this ad points to |
| `lastSyncedAt` | DateTime | |
| `impressions7d` | Int | |
| `clicks7d` | Int | |
| `costUsd7d` | Decimal(10,2) | |
| `conversions7d` | Int | |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

---

### 20. User (Auth)

Auth account for admin and staff dashboard access.

**Fields**:

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `email` | String (unique) | |
| `passwordHash` | String? | bcrypt hash; null for OAuth-only accounts |
| `role` | Enum `owner \| manager \| staff` | |
| `staffId` | UUID? | FK → Staff; links auth account to staff profile |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

---

## Key Relationships Summary

```
User (1) ──────────────── (1) Staff
Staff (1) ─────────────── (*) StaffSchedule
Staff (1) ─────────────── (*) ServicePricing ─── (1) Service
Staff (1) ─────────────── (*) Appointment
Staff (1) ─────────────── (*) Review

Service (1) ───────────── (*) ServicePricing
Service (*) ──────────── (*) ServicePackage  [via PackageService]
Service (*) ──────────── (*) MembershipPlan  [via PlanService]

Client (1) ─────────────  (*) Appointment
Client (1) ─────────────  (*) Membership
Client (1) ─────────────  (*) ClientPackage
Client (1) ─────────────  (*) PaymentTransaction
Client (1) ─────────────  (*) SavedPaymentMethod
Client (1) ─────────────  (1) NotificationPreference
Client (1) ─────────────  (*) Review
Client (1) ─────────────  (*) AppointmentWaitlist

MembershipPlan (1) ──────  (*) PlanPricing (per tier)
MembershipPlan (1) ──────  (*) Membership (client instances)

ServicePackage (1) ──────  (*) ClientPackage (client instances)

Appointment → Membership (credit consumed)
Appointment → ClientPackage (session consumed)
Appointment → Coupon (applied)
Appointment → PaymentTransaction (direct payment)

PaymentTransaction ←── ClientPackage (purchase)
PaymentTransaction ←── Membership (subscription)
PaymentTransaction ←── GiftCard (purchase)
```

---

## Critical Indexes

| Table | Index | Purpose |
|---|---|---|
| `Appointment` | `(staffId, startAt, endAt)` partial where status != cancelled | Double-booking overlap check |
| `Appointment` | `(clientId, startAt DESC)` | Client booking history |
| `Appointment` | `(startAt, status)` | Admin calendar queries |
| `Coupon` | `(code)` unique | Redemption lookup |
| `GiftCard` | `(code)` unique | Redemption lookup |
| `ServicePricing` | `(serviceId, staffTier)` unique | Price lookup at booking |
| `ClientPackage` | `(clientId, status)` | Active package lookup |
| `Membership` | `(clientId, status)` | Active membership lookup |
| `AppointmentWaitlist` | `(serviceId, staffId, requestedDate, status)` | Waitlist notification fan-out |

---

## State Machines

### Appointment Status
```
[created] → scheduled
scheduled → checked_in   (admin action: client arrives)
checked_in → completed   (admin action: service done)
scheduled → no_show      (admin action: after appointment time)
scheduled → cancelled    (client or admin)
checked_in → cancelled   (admin only; exceptional)
```

### Membership Status
```
[created] → active        (after first payment succeeds)
active → paused           (client or admin)
active → cancelled        (client or admin; end of cycle or immediate)
active → expired          (Stripe dunning failed)
paused → active           (resumed)
```

### ClientPackage Status
```
[created] → active        (after purchase payment)
active → exhausted        (sessionsRemaining reaches 0)
active → expired          (expiresAt reached)
```

### AppointmentWaitlist Status
```
[created] → waiting
waiting → notified        (slot opens, notification sent)
notified → claimed        (client books within TTL)
notified → expired        (TTL elapsed, next client notified)
waiting → expired         (manual admin removal or date passes)
```
