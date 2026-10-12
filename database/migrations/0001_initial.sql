-- DCSQbank D1 schema, migration 0001.
-- Timestamps are UTC ISO-8601 strings. Token columns store hashes only.

PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  email_verified_at TEXT,
  last_seen_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE email_verification_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL,
  last_seen_at TEXT
);

CREATE TABLE progress_attempts (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  stem TEXT NOT NULL,
  options_json TEXT NOT NULL,
  answer_index INTEGER NOT NULL CHECK (answer_index >= 0),
  last_selected INTEGER NOT NULL CHECK (last_selected >= 0),
  last_correct INTEGER NOT NULL CHECK (last_correct IN (0, 1)),
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  correct_count INTEGER NOT NULL DEFAULT 0 CHECK (correct_count >= 0),
  wrong_count INTEGER NOT NULL DEFAULT 0 CHECK (wrong_count >= 0),
  first_at TEXT NOT NULL,
  last_at TEXT NOT NULL,
  last_mode TEXT NOT NULL CHECK (last_mode IN ('study', 'exam')),
  PRIMARY KEY (user_id, question_id)
);

CREATE TABLE learning_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('study', 'exam')),
  subject_id TEXT NOT NULL,
  subject_code TEXT NOT NULL,
  subject_title TEXT NOT NULL,
  label TEXT NOT NULL,
  total_count INTEGER NOT NULL CHECK (total_count >= 0),
  answered_count INTEGER NOT NULL CHECK (answered_count >= 0),
  correct_count INTEGER NOT NULL CHECK (correct_count >= 0),
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds >= 0),
  started_at TEXT NOT NULL,
  ended_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  audience TEXT NOT NULL CHECK (audience IN ('all', 'verified_users', 'admins', 'user')),
  created_by TEXT NOT NULL REFERENCES users(id),
  scheduled_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE notification_deliveries (
  notification_id TEXT NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  provider_message_id TEXT,
  error_code TEXT,
  sent_at TEXT,
  created_at TEXT NOT NULL,
  PRIMARY KEY (notification_id, user_id)
);

CREATE TABLE donations (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  paypal_order_id TEXT UNIQUE,
  paypal_capture_id TEXT UNIQUE,
  amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
  currency TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('created', 'completed', 'refunded', 'cancelled', 'failed')),
  donor_email TEXT,
  thank_you_sent_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE paypal_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  processed_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  metadata_json TEXT,
  request_id TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE content_releases (
  id TEXT PRIMARY KEY,
  version TEXT NOT NULL UNIQUE,
  commit_sha TEXT NOT NULL,
  notes TEXT,
  published_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  published_at TEXT NOT NULL
);

CREATE INDEX idx_verification_tokens_user ON email_verification_tokens(user_id);
CREATE INDEX idx_verification_tokens_expiry ON email_verification_tokens(expires_at);
CREATE INDEX idx_reset_tokens_user ON password_reset_tokens(user_id);
CREATE INDEX idx_reset_tokens_expiry ON password_reset_tokens(expires_at);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expiry ON sessions(expires_at);
CREATE INDEX idx_progress_user_last_at ON progress_attempts(user_id, last_at);
CREATE INDEX idx_learning_sessions_user_ended ON learning_sessions(user_id, ended_at);
CREATE INDEX idx_notification_deliveries_status ON notification_deliveries(status);
CREATE INDEX idx_donations_user_created ON donations(user_id, created_at);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_audit_logs_actor_created ON audit_logs(actor_user_id, created_at);
CREATE INDEX idx_audit_logs_target ON audit_logs(target_type, target_id);
