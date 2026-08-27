CREATE TABLE campaigns (
  id TEXT PRIMARY KEY,
  tool_slug TEXT NOT NULL,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('sponsored_card', 'affiliate_link')),
  label TEXT NOT NULL CHECK (
    (campaign_type = 'sponsored_card' AND label = '赞助') OR
    (campaign_type = 'affiliate_link' AND label = '联盟链接')
  ),
  destination_url TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'paused', 'ended')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (starts_at < ends_at)
);

CREATE INDEX idx_campaigns_active_window
  ON campaigns(status, starts_at, ends_at);
