-- Phase 3: course_certificate extensions, course_registrations status/delivery, courses delivery_modes
-- Prerequisite: 001, 002, 003, 004 already applied. Idempotent.

-- course_certificate: external_config, completion_rules
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'course_certificate' AND column_name = 'external_config') THEN
    ALTER TABLE course_certificate ADD COLUMN external_config JSONB;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'course_certificate' AND column_name = 'completion_rules') THEN
    ALTER TABLE course_certificate ADD COLUMN completion_rules JSONB;
  END IF;
END $$;

-- course_registrations: status, updated_at, notes, source
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'course_registrations' AND column_name = 'status') THEN
    ALTER TABLE course_registrations ADD COLUMN status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('interested', 'applied', 'registered', 'completed', 'dropped'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'course_registrations' AND column_name = 'updated_at') THEN
    ALTER TABLE course_registrations ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'course_registrations' AND column_name = 'notes') THEN
    ALTER TABLE course_registrations ADD COLUMN notes TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'course_registrations' AND column_name = 'source') THEN
    ALTER TABLE course_registrations ADD COLUMN source VARCHAR(50);
  END IF;
END $$;

-- Backfill existing rows: set status and set updated_at to created_at for existing rows
UPDATE course_registrations SET status = 'registered' WHERE status IS NULL;
UPDATE course_registrations SET updated_at = created_at WHERE updated_at IS NULL;

-- courses: delivery_modes (array of recorded|online|in_person)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'delivery_modes') THEN
    ALTER TABLE courses ADD COLUMN delivery_modes JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_course_registrations_status ON course_registrations(status);
