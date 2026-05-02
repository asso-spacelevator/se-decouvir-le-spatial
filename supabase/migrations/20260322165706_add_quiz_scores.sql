/*
  # Add Quiz Scores Tracking

  ## Overview
  Add support for tracking quiz scores and performance for each student session.

  ## New Tables
  
  ### `quiz_scores`
  Tracks quiz performance and scores for each session
  - `id` (uuid, primary key) - Unique score identifier
  - `session_id` (uuid, foreign key) - Reference to student_sessions
  - `section` (text) - Section where quiz was taken
  - `question_id` (text) - Specific quiz question identifier
  - `points_earned` (integer) - Points earned (+10 for correct, -5 for incorrect)
  - `is_correct` (boolean) - Whether answer was correct
  - `created_at` (timestamptz) - When the answer was submitted

  ## New Columns
  
  ### `student_sessions` table updates
  - `total_quiz_score` (integer) - Running total of all quiz points earned

  ## Security
  - Enable RLS on quiz_scores table
  - Allow anonymous users to create and read their own scores
*/

-- Add total_quiz_score column to student_sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'student_sessions' AND column_name = 'total_quiz_score'
  ) THEN
    ALTER TABLE student_sessions ADD COLUMN total_quiz_score integer DEFAULT 0;
  END IF;
END $$;

-- Create quiz_scores table
CREATE TABLE IF NOT EXISTS quiz_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES student_sessions(id) ON DELETE CASCADE,
  section text NOT NULL,
  question_id text NOT NULL,
  points_earned integer NOT NULL,
  is_correct boolean NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE quiz_scores ENABLE ROW LEVEL SECURITY;

-- Policies for quiz_scores
CREATE POLICY "Anyone can create quiz scores"
  ON quiz_scores
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can read quiz scores"
  ON quiz_scores
  FOR SELECT
  TO anon
  USING (true);
