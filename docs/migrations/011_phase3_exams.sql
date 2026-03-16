-- Phase 3: exams and exam_attempts
-- Prerequisite: 001-010 applied. Idempotent.

CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50),
    max_score INT,
    pass_score INT,
    is_proctored BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exams_course_id ON exams(course_id);

CREATE TABLE IF NOT EXISTS exam_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score NUMERIC,
    status VARCHAR(20) CHECK (status IN ('pending', 'passed', 'failed')),
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam_id ON exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_id ON exam_attempts(user_id);
