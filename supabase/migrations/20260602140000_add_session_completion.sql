-- Track explicit completion timestamps for each séance.
-- NULL = not yet completed.  IS NOT NULL = student finished that séance.
-- Kept separate from completed_sections (per-chapter log) so we can query
-- quickly without scanning the jsonb array.
ALTER TABLE student_sessions ADD COLUMN IF NOT EXISTS session1_completed_at timestamptz;
ALTER TABLE student_sessions ADD COLUMN IF NOT EXISTS session2_completed_at timestamptz;
