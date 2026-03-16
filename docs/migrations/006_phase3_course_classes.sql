-- Phase 3: course_classes table (sessions per course: recorded, online, in_person)
-- Prerequisite: 001-005 applied. Idempotent.

CREATE TABLE IF NOT EXISTS course_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    class_type VARCHAR(20) NOT NULL CHECK (class_type IN ('recorded', 'online', 'in_person')),
    duration_minutes INT,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    zoom_link TEXT,
    location TEXT,
    recording_material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_course_classes_course_id ON course_classes(course_id);
CREATE INDEX IF NOT EXISTS idx_course_classes_class_type ON course_classes(class_type);
CREATE INDEX IF NOT EXISTS idx_course_classes_event_id ON course_classes(event_id);
CREATE INDEX IF NOT EXISTS idx_course_classes_sort ON course_classes(course_id, sort_order);
