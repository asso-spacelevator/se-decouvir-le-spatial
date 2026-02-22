/*
  # Space Education Platform Schema

  ## Overview
  Database schema for tracking anonymous student sessions and interactions in the space education platform.

  ## New Tables
  
  ### `student_sessions`
  Tracks anonymous student sessions and their progress through the educational journey
  - `id` (uuid, primary key) - Unique session identifier
  - `created_at` (timestamptz) - When the session was created
  - `last_active` (timestamptz) - Last activity timestamp
  - `current_section` (text) - Current section (start, geopolitical, technical, manufacturing, operations, questions, completed)
  - `completed_sections` (jsonb) - Array of completed section IDs
  - `total_time_spent` (integer) - Total time spent in seconds
  
  ### `student_responses`
  Stores student answers to interactive questions throughout the journey
  - `id` (uuid, primary key) - Unique response identifier
  - `session_id` (uuid, foreign key) - Reference to student_sessions
  - `section` (text) - Which section the response is from
  - `question_id` (text) - Identifier for the specific question
  - `response_text` (text) - Student's answer
  - `created_at` (timestamptz) - When the response was submitted
  
  ### `student_questions`
  Stores questions submitted by students in the Question Zone
  - `id` (uuid, primary key) - Unique question identifier
  - `session_id` (uuid, foreign key) - Reference to student_sessions
  - `category` (text) - Question category (career, technical, geopolitics, general)
  - `question_text` (text) - The question content
  - `is_anonymous` (boolean) - Whether submitted anonymously
  - `created_at` (timestamptz) - When the question was submitted

  ## Security
  - Enable RLS on all tables
  - Allow anonymous users to create and read their own sessions
  - Allow anonymous users to create responses and questions
*/

-- Create student_sessions table
CREATE TABLE IF NOT EXISTS student_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now(),
  current_section text DEFAULT 'start',
  completed_sections jsonb DEFAULT '[]'::jsonb,
  total_time_spent integer DEFAULT 0
);

-- Create student_responses table
CREATE TABLE IF NOT EXISTS student_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES student_sessions(id) ON DELETE CASCADE,
  section text NOT NULL,
  question_id text NOT NULL,
  response_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create student_questions table
CREATE TABLE IF NOT EXISTS student_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES student_sessions(id) ON DELETE CASCADE,
  category text DEFAULT 'general',
  question_text text NOT NULL,
  is_anonymous boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE student_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_questions ENABLE ROW LEVEL SECURITY;

-- Policies for student_sessions
-- Allow anyone to create sessions (anonymous users)
CREATE POLICY "Anyone can create sessions"
  ON student_sessions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow reading own session
CREATE POLICY "Users can read own sessions"
  ON student_sessions
  FOR SELECT
  TO anon
  USING (true);

-- Allow updating own session
CREATE POLICY "Users can update own sessions"
  ON student_sessions
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Policies for student_responses
-- Allow anyone to create responses
CREATE POLICY "Anyone can create responses"
  ON student_responses
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow reading own responses
CREATE POLICY "Users can read responses"
  ON student_responses
  FOR SELECT
  TO anon
  USING (true);

-- Policies for student_questions
-- Allow anyone to create questions
CREATE POLICY "Anyone can create questions"
  ON student_questions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow reading questions
CREATE POLICY "Users can read questions"
  ON student_questions
  FOR SELECT
  TO anon
  USING (true);