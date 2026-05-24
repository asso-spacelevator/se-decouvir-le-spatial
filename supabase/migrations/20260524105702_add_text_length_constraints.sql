-- Add CHECK constraints to prevent unbounded text inserts (DoS protection)
ALTER TABLE student_responses ADD CONSTRAINT student_responses_text_length CHECK (length(response_text) <= 4000);
ALTER TABLE student_questions ADD CONSTRAINT student_questions_text_length CHECK (length(question_text) <= 4000);
