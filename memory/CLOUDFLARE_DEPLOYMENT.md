# Cloudflare Deployment Runbook

This runbook defines the first deployment boundary for DCSQbank. The current
application is a static React/PWA frontend. Authentication, D1, payments,
email, and administration remain future Worker features and must not be
simulated with frontend secrets.

## Cloudflare Pages configuration

Create one Pages project connected to the GitHub repository:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Root directory | `frontend` |
| Build command | `npm run build` |
| Build output directory | `build` |
| Node version | `20` |

The project is created as `dcsqbank` and is available at
`https://dcsqbank.pages.dev/`. The first production deployment is available at
`https://8b43b54c.dcsqbank.pages.dev/`.

Every pull request should use a Pages preview deployment. Only a reviewed
change merged into `main` should become production.

The frontend includes:

- `public/_redirects` for client-side React Router routes
- `public/_headers` for baseline browser security headers
- `public/manifest.json` and service-worker assets for PWA installation

Cloudflare Pages copies these files into the published `build` directory.

## Environment boundaries

Use separate resources where they provide meaningful safety. Because the
backend is intentionally minimal, this project uses Wrangler's local D1
emulator for development and one production D1 database. It does not create
a remote preview database.

| Environment | Frontend | Worker/API | D1 |
|---|---|---|---|
| Local | `npm start` | Local Worker | Wrangler local D1 emulator |
| Preview | Pages preview URL | Future Worker preview deployment | No remote database; use local/test data only |
| Production | Pages production domain | Production Worker | Production D1 |

Production D1 resource:

- Name: `dcsqbank-production-db`
- ID: `30566c45-72f3-460c-b7b2-e9f4c5dc3103`
- Region: ENAM

The initial schema migration has been applied successfully. The Worker is not
deployed yet because its authentication/API entrypoint has not been built.

Never point local development or Pages preview code at production D1. The
production Worker is the only deployment allowed to use the production D1
binding. Keep provider credentials in Cloudflare secrets, not
`REACT_APP_*` variables, Git, JSON content, or the browser bundle.

## Deployment checklist

Before enabling production deployment:

1. Confirm the GitHub Actions frontend validation workflow is green.
2. Confirm QBank validation and the production build pass.
3. Open a Pages preview and test dashboard, subjects, study mode, exam mode,
   PWA installation, and direct refreshes on nested routes.
4. Inspect response headers on the preview URL.
5. Confirm no credentials or `.env` files appear in the build artifact.
6. Promote only the reviewed commit to the production branch.
7. Record the Pages deployment URL and commit SHA in the release notes.

## Future Worker boundary

When API work begins, add a Worker project and numbered D1 migrations.
The Worker should own authentication, authorization, email-provider calls,
PayPal verification, admin actions, and user data. Pages should call the
Worker through a documented API origin and should never contain provider
secrets or privileged D1 credentials.

Do not expose the production D1 binding to local or preview deployments.
Before production release, run migrations against a disposable local database,
review the migration output, and take a D1 backup/export according to the
recovery policy.
