-- Remove score tracking, keep only correct/incorrect logging for internal analytics

-- Drop unused score column from student_sessions
ALTER TABLE student_sessions DROP COLUMN IF EXISTS total_quiz_score;

-- Drop unused points_earned column from quiz_scores
ALTER TABLE quiz_scores DROP COLUMN IF EXISTS points_earned;
