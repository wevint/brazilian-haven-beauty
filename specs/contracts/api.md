# API Contracts: Brazilian Haven Beauty Platform MVP v1

**Phase**: 1 — Design & Contracts  
**Date**: 2026-04-17  
**Transport**: tRPC v11 over HTTP (JSON-RPC style). All procedures use POST to `/api/trpc/<procedure>`.  
**Auth**: Session cookie (Auth.js). Procedures marked `[public]` require no auth. `[client]` requires an authenticated Client session. `[admin]` requires role ∈ {owner, manager, staff}. `[owner]` requires role = owner.

---

## Router: `services`

### `services.list` [public]
List all active services, optionally filtered by category.

**Input**:
```ts
{
  category?: string;
  locale: "en" | "pt";
}
```
**Output**:
```ts
{
  id: string;
  name: string;           // localized
  description: string;    // localized
  category: string;
  seoSlug: string;
  pricing: {
    staffTier: "junior" | "senior" | "master";
    priceUsd: number;
    durationMinutes: number;
  }[];
}[]
```

### `services.get` [public]
Single service detail (used for SEO service pages).

**Input**: `{ slug: string; locale: "en" | "pt" }`  
**Output**: Same as list item + `allowWaitlist`, `jsonLdSchema`

### `services.upsert` [admin: owner | manager]
Create or update a service.

**Input**:
```ts
{
  id?: string;            // omit for create
  nameTranslations: { en: string; pt: string };
  descriptionTranslations: { en: string; pt: string };
  category: string;
  seoSlug: string;
  seoMetaDescription?: string;
  isActive: boolean;
  allowWaitlist: boolean;
  displayOrder: number;
  pricing: {
    staffTier: "junior" | "senior" | "master";
    priceUsd: number;
    durationMinutes: number;
    isActive: boolean;
  }[];
}
```
**Output**: `{ id: string; updatedAt: string }`

### `services.archive` [admin: owner | manager]
**Input**: `{ id: string }`  
**Output**: `{ id: string; isActive: false }`

---

## Router: `staff`

### `staff.list` [public]
**Input**: `{ locale: "en" | "pt" }`  
**Output**:
```ts
{
  id: string;
  firstName: string;
  lastName: string;
  bio: string;
  photoUrl: string | null;
  specialties: string[];
  tier: "junior" | "senior" | "master";
  displayOrder: number;
  averageRating: number;
  reviewCount: number;
}[]
```

### `staff.availability` [public]
Real-time availability for a staff member on a given date.

**Input**:
```ts
{
  staffId: string;
  serviceId: string;
  date: string;           // "YYYY-MM-DD"
}
```
**Output**:
```ts
{
  slots: {
    startAt: string;      // ISO 8601 UTC
    endAt: string;        // ISO 8601 UTC
    available: boolean;
  }[];
}
```
**Performance**: This procedure is cached with 30-second TTL and invalidated on appointment mutations. Response must be < 1 second (SC-002).

### `staff.upsert` [admin: owner | manager]
Create or update a staff profile.

### `staff.deactivate` [admin: owner]
**Input**: `{ staffId: string }` — Sets `isActive = false`, removes future slots, flags existing appointments.

### `staff.schedule.set` [admin: owner | manager]
Set recurring availability windows and exceptions.

---

## Router: `appointments`

### `appointments.reserve` [public | client]
Step 1 of booking: reserve a slot with a distributed lock (Redis NX). Returns a reservation token valid for 10 minutes.

**Input**:
```ts
{
  serviceId: string;
  staffId: string;
  startAt: string;        // ISO 8601 UTC
  clientEmail?: string;   // for guest booking
  clientId?: string;      // for authenticated client
}
```
**Output**:
```ts
{
  reservationToken: string;   // JWT; expires in 10 minutes
  slotConfirmed: boolean;
  priceUsd: number;           // from ServicePricing snapshot
  expiresAt: string;          // ISO 8601
}
```
**Errors**: `SLOT_UNAVAILABLE` | `STAFF_INACTIVE` | `SERVICE_INACTIVE`

### `appointments.confirm` [public | client]
Step 2: finalize booking after payment authorization.

**Input**:
```ts
{
  reservationToken: string;
  paymentMethod: "stripe" | "paypal" | "membership_credit" | "package" | "gift_card";
  stripePaymentIntentId?: string;   // if paypal: paypalOrderId
  paypalOrderId?: string;
  membershipId?: string;
  clientPackageId?: string;
  giftCardCode?: string;
  couponCode?: string;
  // Client details (required for guest)
  guestFirstName?: string;
  guestLastName?: string;
  guestEmail?: string;
  guestPhone?: string;
}
```
**Output**:
```ts
{
  appointmentId: string;
  confirmationCode: string;   // human-readable: "BHB-20260417-A4B9"
  startAt: string;
  staffName: string;
  serviceName: string;
  totalChargedUsd: number;
}
```
**Side effects**: sends confirmation email + SMS; triggers Inngest reminder events.

### `appointments.list` [client]
Client's own upcoming + past appointments.

### `appointments.cancel` [client | admin]
**Input**: `{ appointmentId: string; reason?: string }`  
**Side effects**: releases slot, notifies waitlist via Inngest.

### `appointments.reschedule` [admin]
**Input**: `{ appointmentId: string; newStartAt: string }`  
**Side effects**: validates new slot, notifies client.

### `appointments.updateStatus` [admin]
**Input**: `{ appointmentId: string; status: "checked_in" | "completed" | "no_show" }`

### `appointments.adminList` [admin]
Admin calendar query.

**Input**:
```ts
{
  date?: string;            // "YYYY-MM-DD" for day view
  startDate?: string;       // for week view
  endDate?: string;
  staffId?: string;
  status?: AppointmentStatus[];
}
```
**Output**: `Appointment[]` with client name, staff name, service name, status, times.

---

## Router: `memberships`

### `memberships.plans.list` [public]
**Input**: `{ locale: "en" | "pt" }`  
**Output**: `MembershipPlan[]` with `pricing[]` per tier.

### `memberships.signup` [client]
**Input**:
```ts
{
  planId: string;
  staffTier: "junior" | "senior" | "master";
  stripePaymentMethodId: string;    // vault reference
}
```
**Output**: `{ membershipId: string; stripeSubscriptionId: string; nextRenewalAt: string }`

### `memberships.cancel` [client | admin]
**Input**: `{ membershipId: string; immediateOrEndOfCycle: "immediate" | "end_of_cycle" }`

### `memberships.creditBalance` [client]
**Input**: `{ membershipId: string }`  
**Output**: `{ creditsRemaining: number; nextRenewalAt: string; planName: string }`

---

## Router: `packages`

### `packages.list` [public]
Active service packages.

### `packages.purchase` [client]
**Input**: `{ packageId: string; paymentMethod: "stripe" | "paypal"; ... }`  
**Output**: `{ clientPackageId: string; sessionsGranted: number; expiresAt: string }`

### `packages.balance` [client]
**Input**: `{ clientPackageId: string }`  
**Output**: `{ sessionsRemaining: number; expiresAt: string; status: string }`

---

## Router: `coupons`

### `coupons.validate` [public]
Server-side coupon validation before payment.

**Input**: `{ code: string; cartItem: { type: "service" | "package" | "plan"; id: string }; clientId?: string }`  
**Output**: `{ valid: boolean; discountType: "percent" | "fixed_usd"; discountValue: number; invalidReason?: string }`

### `coupons.upsert` [admin: owner | manager]
Create or update a coupon.

### `coupons.list` [admin]
With filters: active, expired, all.

---

## Router: `clients`

### `clients.me` [client]
**Output**: Full client profile + active memberships + active packages + upcoming appointments.

### `clients.updateProfile` [client]
**Input**: `{ firstName?: string; lastName?: string; phone?: string; preferredLocale?: "en" | "pt" }`

### `clients.updateNotificationPreferences` [client]
**Input**: `NotificationPreference` partial update.

### `clients.search` [admin]
**Input**: `{ query: string }` — searches name, email, phone.

### `clients.get` [admin]
**Input**: `{ clientId: string }`  
**Output**: Full client profile + history + memberships + packages + notes.

### `clients.upsertNote` [admin]
**Input**: `{ clientId: string; note: string }` — overwrites `staffNotes`.

---

## Router: `payments`

### `payments.createStripePaymentIntent` [public | client]
Creates a Stripe PaymentIntent for a reservation.

**Input**: `{ reservationToken: string; couponCode?: string; giftCardCode?: string }`  
**Output**: `{ clientSecret: string; amountUsd: number }` — client mounts Stripe Payment Element with `clientSecret`.

### `payments.createPaypalOrder` [public | client]
**Input**: `{ reservationToken: string; ... }`  
**Output**: `{ paypalOrderId: string }`

### `payments.refund` [admin: owner | manager]
**Input**: `{ paymentTransactionId: string; amountUsd?: number }` — partial or full refund.  
**Output**: `{ refundId: string; refundedAmountUsd: number }`

### `payments.history` [client]
**Output**: `PaymentTransaction[]` — client's own transactions.

---

## Router: `waitlist`

### `waitlist.join` [public | client]
**Input**: `{ serviceId: string; staffId?: string; requestedDate: string; clientEmail?: string }`

### `waitlist.leave` [client]
**Input**: `{ waitlistId: string }`

---

## Router: `reviews`

Public reviews are out of scope for MVP v1 and require a separate specification before contract definition.

---

## Router: `admin.dashboard`

### `admin.dashboard.kpis` [admin]
Today's KPI snapshot.

**Output**:
```ts
{
  todayRevenue: number;
  yesterdayRevenue: number;
  appointmentsToday: { scheduled: number; checkedIn: number; completed: number; noShow: number; cancelled: number };
  utilizationRatePercent: number;
  noShowRate30d: number;
}
```

---

## Router: `admin.googleAds`

### `admin.googleAds.sync` [admin: owner]
Syncs latest campaign metrics from Google Ads API into `AdCampaignReference` table.

**Output**: `{ synced: number; lastSyncedAt: string }`

### `admin.googleAds.list` [admin]
**Output**: `AdCampaignReference[]`

---

## Webhook Endpoints (REST, not tRPC)

### `POST /api/webhooks/stripe`
Handles Stripe webhook events. Stripe-signature header validated with `STRIPE_WEBHOOK_SECRET`.

| Event | Action |
|---|---|
| `payment_intent.succeeded` | Calls `appointments.confirm` internally; issues membership credits |
| `payment_intent.payment_failed` | Releases slot reservation; notifies client |
| `customer.subscription.renewed` | Issues membership credits for next cycle |
| `customer.subscription.deleted` | Sets Membership status to `cancelled` |
| `customer.subscription.past_due` | Sets Membership status to `expired` after dunning |
| `charge.refunded` | Updates PaymentTransaction status |

**Response**: Always `{ received: true }` with 200 to acknowledge.

### `POST /api/webhooks/paypal`
Handles PayPal IPN/Webhooks. PayPal webhook ID validated via PayPal SDK.

| Event | Action |
|---|---|
| `PAYMENT.CAPTURE.COMPLETED` | Calls `appointments.confirm` internally |
| `PAYMENT.CAPTURE.DENIED` | Releases slot reservation |

### `POST /api/inngest`
Inngest event handler. Serves all background functions. Inngest signing key validated.

---

## Error Codes (tRPC)

| Code | HTTP | Description |
|---|---|---|
| `UNAUTHORIZED` | 401 | Session required |
| `FORBIDDEN` | 403 | Insufficient role |
| `NOT_FOUND` | 404 | Entity does not exist |
| `SLOT_UNAVAILABLE` | 409 | Booking slot taken by concurrent request |
| `COUPON_INVALID` | 422 | Coupon failed validation |
| `PAYMENT_FAILED` | 422 | Gateway rejected payment |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected error; details logged, not exposed |

---

## Rate Limiting

Enforced via Upstash Redis at the Edge middleware layer:

| Endpoint | Limit |
|---|---|
| `appointments.reserve` | 10 req/min per IP |
| `coupons.validate` | 20 req/min per IP |
| All admin procedures | 120 req/min per authenticated user |
| Webhook endpoints | No client rate limit (Stripe/PayPal IPs only, validated by signature) |
