CREATE TABLE tool_submissions (
  id TEXT PRIMARY KEY,
  public_ref TEXT NOT NULL UNIQUE,
  public_code_hash TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  official_url TEXT NOT NULL,
  normalized_domain TEXT NOT NULL,
  category TEXT NOT NULL,
  pricing_mode TEXT NOT NULL,
  chinese_support TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  best_for_json TEXT NOT NULL,
  features_json TEXT NOT NULL,
  pros_json TEXT NOT NULL,
  cons_json TEXT NOT NULL,
  access_modes_json TEXT NOT NULL,
  logo_url TEXT,
  contact_email_ciphertext TEXT NOT NULL,
  submitter_relationship TEXT NOT NULL,
  intent TEXT NOT NULL CHECK (intent IN ('standard', 'priority_interest', 'commercial_interest')),
  commercial_note TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK (
    status IN (
      'pending', 'processing', 'needs_info', 'needs_enrichment',
      'pr_open', 'published', 'rejected', 'error'
    )
  ),
  source TEXT NOT NULL CHECK (source IN ('public_form', 'admin')),
  content_hash TEXT NOT NULL,
  domain_hash TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0 AND attempt_count <= 3),
  last_error_code TEXT,
  next_attempt_at TEXT,
  claim_expires_at TEXT,
  github_pr_url TEXT,
  public_message TEXT NOT NULL,
  published_at TEXT,
  retention_until TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_tool_submissions_status_created
  ON tool_submissions(status, created_at);
CREATE INDEX idx_tool_submissions_retry
  ON tool_submissions(status, next_attempt_at, claim_expires_at, attempt_count);
CREATE INDEX idx_tool_submissions_domain_status
  ON tool_submissions(normalized_domain, status);
CREATE UNIQUE INDEX idx_tool_submissions_live_domain
  ON tool_submissions(normalized_domain)
  WHERE status <> 'rejected';
CREATE INDEX idx_tool_submissions_retention
  ON tool_submissions(retention_until);

CREATE TABLE submission_rate_limits (
  key_hash TEXT NOT NULL,
  window_start TEXT NOT NULL,
  count INTEGER NOT NULL CHECK (count > 0),
  PRIMARY KEY (key_hash, window_start)
);

CREATE INDEX idx_submission_rate_limits_window
  ON submission_rate_limits(window_start);

CREATE TABLE submission_daily_stats (
  day TEXT NOT NULL,
  source TEXT NOT NULL,
  intent TEXT NOT NULL,
  outcome TEXT NOT NULL,
  count INTEGER NOT NULL CHECK (count >= 0),
  PRIMARY KEY (day, source, intent, outcome)
);
