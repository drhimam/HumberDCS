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

Every pull request should use a Pages preview deployment. Only a reviewed
change merged into `main` should become production.

The frontend includes:

- `public/_redirects` for client-side React Router routes
- `public/_headers` for baseline browser security headers
- `public/manifest.json` and service-worker assets for PWA installation

Cloudflare Pages copies these files into the published `build` directory.

## Environment boundaries

Use separate Cloudflare resources for each environment:

| Environment | Frontend | Worker/API | D1 |
|---|---|---|---|
| Local | `npm start` | Not connected yet | Not connected yet |
| Preview | Pages preview URL | Future preview Worker | Future preview D1 |
| Production | Pages production domain | Future production Worker | Future production D1 |

Never point local development or preview code at production D1. When the
Worker is introduced, use separate bindings and secrets for preview and
production. Keep provider credentials in Cloudflare secrets, not
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

When API work begins, add a separate Worker project and numbered D1 migrations.
The Worker should own authentication, authorization, email-provider calls,
PayPal verification, admin actions, and user data. Pages should call the
Worker through a documented API origin and should never contain provider
secrets or privileged D1 credentials.

Do not add a Worker binding to this frontend-only project until the Worker
entrypoint, tests, migrations, and environment-specific D1 databases exist.
