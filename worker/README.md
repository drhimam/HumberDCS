# DCSQbank API Worker

This is the Cloudflare Worker boundary for DCSQbank. It exposes a
database-backed health endpoint and the initial authentication routes:

- `GET /health`
- `GET /api/health`
- `POST /auth/register`
- `POST /auth/resend-verification`
- `GET /auth/verify-email`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/profile`
- `POST /auth/logout`

Rate limiting and admin authorization still need to be
implemented with the same security and testing requirements.

Passwords use PBKDF2-HMAC-SHA-256 with 100,000 iterations, the maximum
iteration count supported by Cloudflare Workers WebCrypto. The iteration count
is stored in each password hash so future migrations can support a different
work factor safely.

## Local development

From `worker`:

```powershell
npm install
npm run dev
```

Wrangler uses a local D1 emulator for local development. It does not connect
local requests to the production database.

## Deployment

The Worker is configured with the production D1 binding in `wrangler.toml`.
Deploy only after reviewing the dry run:

```powershell
npm run dry-run
npm run deploy
```

Provider credentials must be added later with `wrangler secret put`; never add
them to this directory, the frontend, or Git.

The configured sender is `DCS QBank <noreply@qbanks.org>`. The Worker uses the
Canada ZeptoMail API endpoint `https://api.zeptomail.ca/v1.1/email`, configured as
`ZEPTOMAIL_API_URL` in `wrangler.toml`. Verify the `qbanks.org` domain and this sender
address in ZeptoMail before deploying email-dependent routes.

## PayPal Donation Integration

The Worker provides complete server-side PayPal REST API payment creation, server-side capture verification, idempotent webhook processing, and automated thank-you receipt email generation.

### Endpoints
- `GET /api/donations/config` — Returns public PayPal configuration (`clientId`, `currency`, `environment`).
- `POST /api/donations/create-order` — Initiates an order with PayPal and creates a pending record in D1 `donations`.
- `POST /api/donations/capture-order` — Captures payment via PayPal REST API, verifies completion, updates D1 `donations`, records audit log, and delivers a branded thank-you email receipt via ZeptoMail.
- `POST /api/donations/webhook` — Idempotent webhook listener (`paypal_webhook_events`) reconciling captures, refunds, and cancellations.
- `GET /api/donations/stats` — Community stats summary (total supporter count & total CAD raised).
- `GET /api/donations/my-donations` — User's donation history (requires session cookie).

### Cloudflare Environment Configuration

You can configure PayPal in Cloudflare Workers via **Cloudflare Dashboard** or **Wrangler CLI**:

#### Option A: Via Cloudflare Dashboard
1. Go to **Workers & Pages** → **dcsqbank-api** → **Settings** → **Variables and Secrets**.
2. Add Secret:
   - Name: `PAYPAL_CLIENT_SECRET` → Value: *(Your PayPal Secret)*
3. Add Variable or Secret:
   - Name: `PAYPAL_CLIENT_ID` → Value: *(Your PayPal Client ID)*
4. (Optional) Variables:
   - `PAYPAL_ENVIRONMENT` = `live` (or `sandbox` for testing)
   - `PAYPAL_CURRENCY` = `CAD`

#### Option B: Via Wrangler CLI
```powershell
npx wrangler secret put PAYPAL_CLIENT_ID
npx wrangler secret put PAYPAL_CLIENT_SECRET
```

