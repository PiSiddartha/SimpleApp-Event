-- Phase 3: events is_exam, course_id
-- Prerequisite: 001-006 applied. Idempotent.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'is_exam') THEN
    ALTER TABLE events ADD COLUMN is_exam BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'course_id') THEN
    ALTER TABLE events ADD COLUMN course_id UUID REFERENCES courses(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_events_course_id ON events(course_id);
