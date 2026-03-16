-- Phase 3: events issue_attendance_certificate flag
-- Prerequisite: 001-012 applied. Idempotent.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'issue_attendance_certificate') THEN
    ALTER TABLE events ADD COLUMN issue_attendance_certificate BOOLEAN DEFAULT false;
  END IF;
END $$;
