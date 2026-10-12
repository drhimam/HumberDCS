# DCSQbank D1 Schema

The first migration is [0001_initial.sql](../database/migrations/0001_initial.sql).
It is a forward-only Cloudflare D1/SQLite migration for the future Worker
backend. The current frontend does not connect to this database.

## Table responsibilities

- `users`, `sessions`: accounts, roles, status, and opaque session hashes.
- `email_verification_tokens`, `password_reset_tokens`: single-use token
  hashes with expiry timestamps. Raw tokens must never be stored.
- `progress_attempts`, `learning_sessions`: synchronized learner progress and
  study/exam history. Question text is kept as a snapshot so historical
  records remain readable after content changes.
- `notifications`, `notification_deliveries`: admin-authored messages and
  per-user delivery state.
- `donations`, `paypal_webhook_events`: minimum PayPal reconciliation data and
  idempotent webhook event tracking.
- `audit_logs`: append-only administrative and security events.
- `content_releases`: optional release metadata while reviewed QBank content
  remains versioned in Git.

## Migration rules

1. Use numbered, forward-only SQL files. Never edit an applied migration.
2. Apply migrations to a disposable local database, then production D1 after
   review. This project does not use a remote preview D1 database.
3. Keep the local D1 binding and production D1 binding separate.
4. Use UTC ISO-8601 timestamps and parameterized queries.
5. Store token hashes, password hashes, and provider IDs only as required.
6. Make webhook processing idempotent through `paypal_webhook_events.event_id`.
7. Write audit rows in the same transaction as sensitive admin changes.

## Retention and cleanup

- Delete expired, used verification/reset tokens during scheduled maintenance.
- Revoke expired sessions and remove them after the session retention window.
- Retain donation and audit records for reconciliation and compliance needs;
  define the exact legal retention period before production launch.
- Keep learning history until the user requests deletion, subject to the
  account-retention policy.

## Pre-Worker checklist

- Add a Worker package and `wrangler.toml` with separate preview/production
  D1 bindings.
- Add migration tests against an empty SQLite/D1-compatible database.
- Add authorization tests for every user-owned query.
- Define account deletion and anonymous-progress merge transactions.
- Confirm the schema with privacy, email, and PayPal integration requirements.
