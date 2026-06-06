-- Mark a session as voluntarily abandoned (student chose to restart).
-- NULL means the session is active or naturally completed.
-- IS NOT NULL means the student reset mid-session; we keep the row for analytics.
ALTER TABLE student_sessions ADD COLUMN IF NOT EXISTS abandoned_at timestamptz;
