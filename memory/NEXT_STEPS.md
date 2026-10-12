# EchoBank / DCS QBank Next Steps

Updated: 2026-10-12

This sequence is updated for the target production architecture:

- **Frontend hosting:** Cloudflare Pages
- **Backend/API:** Cloudflare Workers
- **Database:** Cloudflare D1 (SQLite)
- **Email:** ZeptoMail for verification, password reset, welcome, donation thank-you, and operational emails
- **Payments:** PayPal
- **Administration:** protected admin panel for users, activity, content operations, and notifications
- **Content operations:** ongoing manual question creation, editing, review, image management, and release

The system must continue supporting anonymous local study while adding optional accounts and synchronized progress.

## P0 — Stabilize the current browser-first product

### 1. Add content validation

- Define a JSON schema or runtime validator for `index.json`, `subject.json`, and chapter question objects.
- Validate IDs, option counts, answer indexes, required strings, and duplicate IDs.
- Add a build-time/content-check command so invalid content fails before deployment.
- Keep stable IDs as an explicit rule and report duplicate IDs clearly.

Relevant areas: `frontend/src/lib/qbank.js`, `frontend/public/qbank/`, `scripts/`.

### 2. Replace silent chapter failures with observable errors

- Distinguish intentionally empty chapters from missing files and invalid JSON.
- Surface the subject/chapter that failed in the UI.
- Log enough context for debugging without exposing learner data.
- Add a catalog health check that can be run in CI.

**Status:** Implemented in `frontend/src/lib/qbank.js`. Valid empty chapters remain supported; missing files, invalid JSON, malformed catalog structures, and chapter ID mismatches now fail with contextual errors that the existing page error state displays.

Relevant area: `frontend/src/lib/qbank.js`.

### 3. Create real application tests

Prioritize pure logic tests first:

- catalog loading and normalization
- progress record/merge/replace/reset
- wrong-answer derivation
- exam pool filtering and section exclusion
- option shuffling and answer remapping
- timer/finish behavior
- stats calculations

Then add focused UI tests for navigation, study answer locking, exam setup, resume, results filters, and import/export.

**Status:** Initial pure-logic coverage is implemented in `frontend/src/lib/progress.test.js`, `frontend/src/lib/exam.test.js`, and `frontend/src/lib/stats.test.js`. The targeted suite passes 10 tests covering progress aggregation/import, wrong-answer derivation, exam filtering and option remapping, statistics, durations, and clock formatting. UI tests and catalog-loader tests remain follow-up work.

### 4. Make installation and build reproducible

- Decide and document the supported Node version.
- Resolve or explicitly lock the `date-fns`/`react-day-picker` peer mismatch.
- Avoid relying on ad hoc `--no-save` compatibility installs.
- Add a clean-install and production-build check.
- Review the current npm audit output separately; do not apply broad forced upgrades without compatibility testing.

**Status:** Implemented repository setup documentation, pinned Node 20 LTS via `.nvmrc`, added frontend npm engine requirements, and committed `frontend/.npmrc` so clean npm installs consistently use the known peer-dependency resolution. The documented verification sequence is `npm ci`, `npm run validate:qbank`, the one-shot Jest suite, and `npm run build`.

## P1 — Complete the learning content and UX

### 5. Establish a content production workflow

- Inventory every subject/chapter and mark content status.
- Continue importing source question sets through `scripts/import_mcq_text.py`.
- Add source/reference metadata and review ownership.
- Add a duplicate/answer-range/content-quality report.
- Prioritize empty chapters that block the main curriculum path.

**Status:** Added `scripts/qbank_inventory.js` and `npm run inventory:qbank` to generate repeatable coverage and metadata reports after imports. The maintenance guide now includes the command and release-recording procedure.

### 6. Accessibility and responsive UX pass

- Verify all interactive controls have accessible names and visible focus.
- Check keyboard navigation when dialogs/calculator are open.
- Test exam runner and question navigator at mobile widths.
- Fix chart container sizing warnings.
- Confirm color contrast for correct/wrong/flagged states.

**Status:** Added mobile-safe overflow handling, touch-friendly browser behavior, safe-area support, responsive navigation sizing, a hamburger navigation menu, and mobile ordering that places the question navigator below the question and explanation in study/exam mode. PWA manifest/icons and a production service worker provide installation from supported mobile and desktop browsers. Native store packages remain out of scope until a separate wrapper strategy is selected.

### 7. Improve data safety

- Show the last successful export and warn before reset/replace.
- Consider versioned migrations for `dcs_qbank_progress_v1`.
- Validate imported question snapshots and session records more strictly.
- Provide a recoverable backup workflow before any storage schema change.

## P2 — Define the Cloudflare production architecture

### 8. Establish environments and deployment boundaries

- Create separate development, preview, and production Cloudflare environments.
- Deploy the React frontend through Cloudflare Pages.
- Deploy API/auth/admin/payment/email endpoints as a Cloudflare Worker.
- Bind D1 separately per environment; never use production data for local development.
- Store all credentials and API secrets in Cloudflare secrets, never in the frontend bundle, Git, or question JSON.
- Define custom domains, HTTPS, CORS, security headers, logging, rollback, and backup expectations.
- Add CI checks for content validation, frontend build, Worker tests, migrations, and deployment previews.

### 9. Design the D1 schema and migration process

Define migrations before implementing application code. At minimum, plan tables for:

- users and roles
- email-verification tokens
- password-reset tokens
- sessions/refresh tokens or an equivalent secure session mechanism
- user progress attempts and study/exam sessions
- notification messages and delivery status
- PayPal donations, webhook events, and thank-you email status
- audit logs for admin actions
- optional content metadata/version history if content remains static in Git

Use numbered, forward-only SQL migrations. Every migration must be reviewed, tested against a disposable D1 database, and applied to preview before production. Define retention, indexes, foreign keys, timestamps, and UTC conventions.

## P3 — Implement authentication, email, payments, and administration

### 10. Implement secure account flows

- Add signup, sign-in, sign-out, email verification, forgot-password, reset-password, and session expiration.
- Use opaque, single-use, expiring tokens for verification and reset links; store only token hashes in D1.
- Send verification, welcome, and password-reset mail through ZeptoMail from Worker-side code.
- Do not expose ZeptoMail credentials or reset tokens in client code or logs.
- Rate-limit authentication, reset, verification, and notification endpoints.
- Preserve anonymous local progress and provide an explicit, user-confirmed merge into an account.
- Add authorization tests for every user-owned resource.

### 11. Build the protected admin panel

- Restrict access using a server-side role check, not a hidden frontend route.
- Start with roles such as `admin` and `user`; add finer permissions only when required.
- Provide user search, account status, verification status, recent activity, and donation status.
- Provide notification composition, audience selection, preview, send, retry, and delivery history.
- Record immutable audit events for role changes, account actions, notification sends, content releases, and donation reconciliation.
- Never display passwords, raw auth tokens, or full payment secrets in the panel.

### 12. Integrate PayPal safely

- Create donations through a Worker endpoint and verify all completed payments server-side.
- Validate PayPal webhook signatures and make webhook processing idempotent.
- Store only the minimum payment/customer data needed for reconciliation and receipts.
- Mark donation status from verified PayPal events, not from client redirect parameters.
- Trigger a ZeptoMail thank-you email only after verified completion, with duplicate-send protection.
- Document sandbox and production credentials separately and test refund/cancel/failure paths.

## P4 — Operate the content pipeline at scale

### 13. Follow the QBank maintenance process

- Use the detailed [QBank Content Maintenance Guide](./QBANK_CONTENT_MAINTENANCE_GUIDE.md) for every manual content change.
- Keep question IDs stable after publication.
- Validate JSON, duplicate IDs, answer indexes, image paths, and required metadata before merging.
- Keep source material and import scripts separate from published JSON.
- Review imported questions for correctness, ambiguity, formatting, accessibility, and references.
- Use small, reviewable commits grouped by subject/chapter.
- Record content changes and release notes when a change affects learners.

### 14. Decide the content delivery model

Start with reviewed JSON content versioned in Git and deployed with the Pages build. Add database-backed content only if administrators need browser-based editing. If a content CMS is added later:

- keep a canonical exportable format
- require draft/review/published states
- preserve stable question IDs
- retain revision history
- validate before publishing
- support rollback
- keep image references and alt text explicit

## P5 — Validate production readiness and scale

### 15. Add observability, backups, and incident procedures

- Track Worker errors, auth failures, email failures, PayPal webhook failures, and notification delivery.
- Add privacy-safe activity metrics and an admin audit trail.
- Schedule/export D1 backups according to the recovery objective.
- Test restore, migration rollback, account recovery, and PayPal reconciliation.
- Define incident response for leaked secrets, abusive accounts, email provider outage, and payment discrepancies.

### 16. Production acceptance checklist

- Cloudflare Pages preview and production deployments succeed.
- Worker bindings and secrets are environment-specific.
- D1 migrations apply cleanly from an empty database and an existing database.
- Signup, verification, login, logout, reset, and welcome email flows work.
- Anonymous progress remains available and account merge is deterministic.
- Admin authorization, user activity, notifications, and audit logs work.
- PayPal sandbox flows and verified webhooks work before production credentials are enabled.
- Content validation, image checks, frontend build, Worker tests, and smoke tests pass.
- Documentation is updated before handing maintenance to another person.

## Deferred product expansion

- mixed exams across multiple subjects/courses
- bookmarks and notes per question
- spaced-repetition review scheduling
- printable/PDF results
- richer analytics by chapter, section, and time
- browser-based instructor/admin content editing, after the Git-based workflow is proven

## Suggested first implementation batch

1. Build a content validator and run it against all 14 subject folders.
2. Add pure tests for `progress.js`, `exam.js`, and `stats.js`.
3. Add a catalog error state that identifies failed files.
4. Document supported Node/npm setup and make a clean install/build pass.
5. Produce a content inventory showing question counts by subject/chapter.

These steps improve reliability without changing the current learner-facing product model.
