-- Migration: polls MCQ (correct option) and optional material link
-- Run once on existing RDS. Additive only; safe to re-run.

-- ============================================
-- POLLS: add material_id (optional FK to materials)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'polls' AND column_name = 'material_id'
  ) THEN
    ALTER TABLE polls ADD COLUMN material_id UUID REFERENCES materials(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_polls_material_id ON polls(material_id);

-- ============================================
-- POLL_OPTIONS: add is_correct (MCQ correct answer)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'poll_options' AND column_name = 'is_correct'
  ) THEN
    ALTER TABLE poll_options ADD COLUMN is_correct BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;
