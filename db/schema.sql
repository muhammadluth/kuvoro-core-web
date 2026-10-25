-- Run against a dedicated Kuvoro PostgreSQL database, never a shared application's database.
CREATE TABLE IF NOT EXISTS office_presence (
  id UUID PRIMARY KEY,
  name VARCHAR(24) NOT NULL,
  color VARCHAR(7) NOT NULL,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  direction VARCHAR(5) NOT NULL,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS office_presence_last_seen_idx ON office_presence(last_seen);
