# DCSQbank API Worker

This is the first Cloudflare Worker boundary for DCSQbank. It currently
exposes only a database-backed health endpoint:

- `GET /health`
- `GET /api/health`

It is intentionally not an authentication API yet. Signup, email verification,
password reset, sessions, and admin authorization must be implemented together
with ZeptoMail delivery, rate limiting, and authorization tests before those
routes are exposed.

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
