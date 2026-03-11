-- Migration: add event visibility (private vs global)
-- Run once on existing DB. Safe to re-run (idempotent).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'visibility'
  ) THEN
    ALTER TABLE events
    ADD COLUMN visibility VARCHAR(20) NOT NULL DEFAULT 'global'
    CHECK (visibility IN ('private', 'global'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_events_visibility ON events(visibility);
