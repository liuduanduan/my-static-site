CREATE TABLE published_tool_domains (
  normalized_domain TEXT PRIMARY KEY,
  published_at TEXT NOT NULL,
  created_at TEXT NOT NULL
) WITHOUT ROWID;

INSERT OR IGNORE INTO published_tool_domains (
  normalized_domain, published_at, created_at
)
SELECT
  normalized_domain,
  COALESCE(published_at, updated_at),
  updated_at
FROM tool_submissions
WHERE status = 'published';
