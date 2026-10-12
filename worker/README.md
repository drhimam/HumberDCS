# DCSQbank API Worker

This is the Cloudflare Worker boundary for DCSQbank. It exposes a
database-backed health endpoint and the initial authentication routes:

- `GET /health`
- `GET /api/health`
- `POST /auth/register`
- `GET /auth/verify-email`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`

Forgot-password, rate limiting, and admin authorization still need to be
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

The configured sender is `DCS QBank <info@qbanks.org>`. The Worker uses the
Canada ZeptoMail API endpoint configured as `ZEPTOMAIL_API_URL` in
`wrangler.toml`. The `cpaas.zohocloud.ca` host is the Zoho Canada portal host,
not the send-email API hostname. Verify the `qbanks.org` domain and this sender
address in ZeptoMail before deploying email-dependent routes.
