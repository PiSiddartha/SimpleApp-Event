-- Phase 3: attendance mode, course_id, class_id
-- Prerequisite: 001-006 applied (course_classes exists). Idempotent.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'attendance' AND column_name = 'mode') THEN
    ALTER TABLE attendance ADD COLUMN mode VARCHAR(20) CHECK (mode IN ('recorded', 'online', 'in_person'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'attendance' AND column_name = 'course_id') THEN
    ALTER TABLE attendance ADD COLUMN course_id UUID REFERENCES courses(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'attendance' AND column_name = 'class_id') THEN
    ALTER TABLE attendance ADD COLUMN class_id UUID REFERENCES course_classes(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_attendance_course_id ON attendance(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class_id ON attendance(class_id);
