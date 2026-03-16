-- Phase 3: certificates_issued (attendance and completion certificates)
-- Prerequisite: 001-011 applied. Idempotent.

CREATE TABLE IF NOT EXISTS certificates_issued (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    certificate_type VARCHAR(50) NOT NULL CHECK (certificate_type IN ('attendance', 'completion')),
    provider VARCHAR(255),
    certificate_url TEXT,
    external_certificate_id VARCHAR(255),
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB,
    CONSTRAINT chk_certificates_course_or_event CHECK (course_id IS NOT NULL OR event_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_certificates_issued_user_id ON certificates_issued(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_issued_course_id ON certificates_issued(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_issued_event_id ON certificates_issued(event_id);
