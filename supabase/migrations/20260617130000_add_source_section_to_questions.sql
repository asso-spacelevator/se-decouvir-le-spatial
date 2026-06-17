-- Add source_section to student_questions so analytics can distinguish
-- session-1 questions from session-2 FAQ questions (and future sections).
ALTER TABLE public.student_questions
  ADD COLUMN source_section text CHECK (length(source_section) <= 100);
