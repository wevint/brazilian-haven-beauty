# Quickstart: Brazilian Haven Beauty Platform MVP v1

**Branch**: `001-platform-mvp-v1`  
**Stack**: Next.js 15 · TypeScript · Prisma · PostgreSQL (Neon) · Upstash Redis · Vercel

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 22 LTS | [nodejs.org](https://nodejs.org) or `nvm use 22` |
| pnpm | 9.x | `npm install -g pnpm` |
| Git | Any recent | Pre-installed |
| Docker | Optional | For local PostgreSQL if not using Neon |

---

## 1. Clone and install

```bash
git clone https://github.com/<org>/brazilian-haven-beauty.git
cd brazilian-haven-beauty
git checkout 001-platform-mvp-v1

pnpm install
```

---

## 2. Environment variables

Copy the environment template and fill in your secrets:

```bash
cp apps/web/.env.example apps/web/.env.local
cp tools/google-ads-cli/.env.example tools/google-ads-cli/.env
```

### `apps/web/.env.local` (required for local dev)

```env
# Database (Neon — create a free project at neon.tech)
DATABASE_URL="postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/brazilianhaven?sslmode=require"

# Redis (Upstash — create a free database at upstash.com)
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXxx..."

# Auth.js
AUTH_SECRET="generate-with: openssl rand -hex 32"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (use test keys for local dev)
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."    # from: stripe listen --forward-to localhost:3000/api/webhooks/stripe

# PayPal (sandbox for local dev)
PAYPAL_CLIENT_ID="..."
PAYPAL_CLIENT_SECRET="..."
PAYPAL_MODE="sandbox"                # "live" in production

# Twilio (SMS)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_FROM_NUMBER="+1..."

# Resend (Email)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="bookings@brazilianhaven.com"

# Cloudflare R2
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="brazilianhaven-media"
R2_PUBLIC_URL="https://media.brazilianhaven.com"

# Inngest
INNGEST_SIGNING_KEY="signkey-..."
INNGEST_EVENT_KEY="..."

# Salon config
SALON_TIMEZONE="America/New_York"
SALON_NAME="Brazilian Haven Beauty"

# Feature flags
NEXT_PUBLIC_PAYPAL_CLIENT_ID="..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_GTM_ID="GTM-..."        # Google Tag Manager container ID
NEXT_PUBLIC_SALON_TIMEZONE="America/New_York"
```

---

## 3. Database setup

```bash
# Apply migrations (creates all tables)
pnpm --filter db db:migrate:dev

# Seed with sample data (staff, services, one membership plan)
pnpm --filter db db:seed
```

> If you prefer local PostgreSQL instead of Neon:
> ```bash
> docker run -d --name bhb-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16
> # Then set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/brazilianhaven
> ```

---

## 4. Run the development server

```bash
# Start Next.js + Inngest dev server simultaneously
pnpm dev
```

This runs:
- **Next.js**: [http://localhost:3000](http://localhost:3000)
- **Inngest Dev Server**: [http://localhost:8288](http://localhost:8288)

### Key URLs in dev

| URL | Description |
|---|---|
| `localhost:3000` | Public site (Home, Services, etc.) |
| `localhost:3000/en/book` | Booking wizard |
| `localhost:3000/en/account` | Client account (requires login) |
| `localhost:3000/admin` | Admin dashboard (requires admin login) |
| `localhost:3000/api/trpc/...` | tRPC endpoint |
| `localhost:8288` | Inngest dev UI (inspect events + replay) |

---

## 5. Stripe webhook forwarding (local dev)

The booking confirmation depends on Stripe webhooks. In local dev:

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy the whsec_... value into STRIPE_WEBHOOK_SECRET in .env.local
```

---

## 6. Create the first admin account

```bash
pnpm --filter db db:create-admin --email owner@brazilianhaven.com --role owner
```

Then log in at `localhost:3000/admin` with that email. On first login you'll be prompted to set a password.

---

## 7. Google Ads CLI (optional for dev)

```bash
# Build the CLI
pnpm --filter google-ads-cli build

# Verify credentials
node tools/google-ads-cli/dist/index.js list-campaigns

# Or use from Claude Code:
node tools/google-ads-cli/dist/index.js report all --days 7
```

> The Google Ads CLI requires a valid Developer Token and OAuth2 refresh token. Contact the account owner for credentials. See `contracts/google-ads-cli.md` for full command reference.

---

## 8. Run tests

```bash
# Unit + integration tests (Vitest)
pnpm test

# E2E tests (Playwright) — requires dev server running
pnpm e2e

# Type check across all packages
pnpm typecheck

# Lint
pnpm lint
```

---

## 9. Add a new language string (EN/PT)

1. Add the key to `apps/web/messages/en.json`
2. Add the Portuguese translation to `apps/web/messages/pt.json`
3. Use it in a Server Component: `const t = await getTranslations('Namespace'); t('key')`
4. Use it in a Client Component: `const t = useTranslations('Namespace'); t('key')`

---

## 10. Add a new service in local dev

1. Log into admin: `localhost:3000/admin`
2. Go to **Services → New Service**
3. Fill in name (EN + PT), category, per-tier pricing for junior/senior/master
4. Save — the public Services page updates immediately

---

## Build for production

```bash
pnpm build
# Or let Vercel handle it on push to main
```

## Deploy

- Production deploys automatically on merge to `main` via Vercel Git integration.
- Preview deploys are created for every PR (Neon branch per preview deployment via Neon GitHub Action).
- Environment secrets are managed in Vercel Dashboard → Project → Environment Variables.

---

## Turbo task pipeline reference

| Command | Description |
|---|---|
| `pnpm dev` | Start all apps in dev mode |
| `pnpm build` | Build all packages + apps |
| `pnpm test` | Run all Vitest tests |
| `pnpm e2e` | Run Playwright E2E suite |
| `pnpm lint` | ESLint across all packages |
| `pnpm typecheck` | tsc --noEmit across all packages |
| `pnpm --filter db db:migrate:dev` | Create and apply a new migration |
| `pnpm --filter db db:studio` | Open Prisma Studio (local DB browser) |
| `pnpm --filter db db:seed` | Seed with sample data |
