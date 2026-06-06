-- Add school_name to student_sessions so we can track which institution each student is from.
-- VARCHAR(150) with a CHECK mirrors the client-side maxLength={150}.
ALTER TABLE student_sessions ADD COLUMN IF NOT EXISTS school_name VARCHAR(150);
ALTER TABLE student_sessions ADD CONSTRAINT student_sessions_school_name_length
  CHECK (school_name IS NULL OR length(school_name) <= 150);
