-- D1 schema cho tính năng Highlight + Favourite
-- Áp dụng:  wrangler d1 execute bantin-reader --file=./reader/schema.sql

CREATE TABLE IF NOT EXISTS highlights (
  id         TEXT PRIMARY KEY,      -- id do client sinh (h_xxx)
  email      TEXT NOT NULL,         -- chủ sở hữu (từ Cloudflare Access)
  page       TEXT NOT NULL,         -- vd '2026-08-22'
  quote      TEXT NOT NULL,         -- đoạn text được bôi
  prefix     TEXT,                  -- ~40 ký tự trước (để neo lại)
  suffix     TEXT,                  -- ~40 ký tự sau
  anchor_id  TEXT,                  -- id thẻ chứa (vd 'bai1')
  start_off  INTEGER,               -- offset ký tự trong anchor
  end_off    INTEGER,
  color      TEXT,                  -- y|g|p|b
  note       TEXT,
  created_at INTEGER NOT NULL       -- epoch ms
);
CREATE INDEX IF NOT EXISTS idx_hl_email_page ON highlights(email, page);

CREATE TABLE IF NOT EXISTS favourites (
  email      TEXT NOT NULL,
  page       TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (email, page)
);
CREATE INDEX IF NOT EXISTS idx_fav_email ON favourites(email);
