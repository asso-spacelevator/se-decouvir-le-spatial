-- Grant table privileges to anon role.
-- Supabase no longer grants these automatically; RLS policies alone are insufficient.

GRANT SELECT, INSERT, UPDATE ON public.student_sessions TO anon;
GRANT SELECT, INSERT, UPDATE ON public.student_responses TO anon;
GRANT SELECT, INSERT ON public.student_questions TO anon;
GRANT SELECT, INSERT ON public.quiz_scores TO anon;
GRANT SELECT ON public.mentoring_platforms TO anon;
GRANT SELECT ON public.scientific_associations TO anon;
