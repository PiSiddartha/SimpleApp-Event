-- Phase 3: materials course_id, class_id (allow materials linked to course/class)
-- Prerequisite: 001-006 applied. Idempotent.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'materials' AND column_name = 'course_id') THEN
    ALTER TABLE materials ADD COLUMN course_id UUID REFERENCES courses(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'materials' AND column_name = 'class_id') THEN
    ALTER TABLE materials ADD COLUMN class_id UUID REFERENCES course_classes(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Ensure at least one of event_id or course_id is set for new/updated rows (constraint optional; app enforces)
-- ALTER TABLE materials ADD CONSTRAINT chk_materials_event_or_course CHECK (event_id IS NOT NULL OR course_id IS NOT NULL);
-- Skipping CHECK to avoid breaking existing rows that have event_id; application should validate on insert.

CREATE INDEX IF NOT EXISTS idx_materials_course_id ON materials(course_id);
CREATE INDEX IF NOT EXISTS idx_materials_class_id ON materials(class_id);
