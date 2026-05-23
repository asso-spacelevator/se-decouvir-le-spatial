/*
  # Lock down student-data RLS via anonymous sign-ins (fixes #3)

  Before this migration, every policy was USING (true): the public anon key
  (extractable from the JS bundle) was enough to read or overwrite any
  student's responses, questions, quiz scores, and session progress.

  After: every read/write requires a JWT and is scoped to the row owner via
  student_sessions.user_id = auth.uid(). The anon Postgres role loses all
  privileges on the four student-data tables; only authenticated users
  (including anonymous sign-ins, which still produce a real JWT) can reach
  them, and only their own data.

  Requires: Anonymous Sign-Ins enabled in Supabase Auth
  (dashboard: Authentication -> Providers -> Anonymous Sign-Ins,
   or supabase/config.toml: [auth] enable_anonymous_sign_ins = true).

  Destructive: truncates all pre-existing student data. There are no
  auth.users to backfill against, so the rows would be unreachable under the
  new policies regardless; truncating keeps the schema honest.
*/

BEGIN;

-- 1. Wipe legacy rows. CASCADE handles all three child tables, but we list
--    them explicitly for readability.
TRUNCATE TABLE
  public.quiz_scores,
  public.student_questions,
  public.student_responses,
  public.student_sessions
RESTART IDENTITY CASCADE;

-- 2. Link sessions to auth.users.
ALTER TABLE public.student_sessions
  ADD COLUMN user_id uuid NOT NULL
  REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX student_sessions_user_id_key
  ON public.student_sessions(user_id);

-- 3. Drop legacy USING(true) policies.
DROP POLICY IF EXISTS "Anyone can create sessions"    ON public.student_sessions;
DROP POLICY IF EXISTS "Users can read own sessions"   ON public.student_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON public.student_sessions;
DROP POLICY IF EXISTS "Anyone can create responses"   ON public.student_responses;
DROP POLICY IF EXISTS "Users can read responses"      ON public.student_responses;
DROP POLICY IF EXISTS "Anyone can create questions"   ON public.student_questions;
DROP POLICY IF EXISTS "Users can read questions"      ON public.student_questions;
DROP POLICY IF EXISTS "Anyone can create quiz scores" ON public.quiz_scores;
DROP POLICY IF EXISTS "Users can read quiz scores"    ON public.quiz_scores;

-- 4. New policies. All TO authenticated, all scoped to auth.uid().

-- student_sessions: own row only.
CREATE POLICY "session_select_own" ON public.student_sessions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "session_insert_own" ON public.student_sessions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "session_update_own" ON public.student_sessions
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- student_responses: only via your own session. UPDATE is required because
-- SessionContext.saveResponse upserts via select-then-update-or-insert.
CREATE POLICY "response_select_own" ON public.student_responses
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.student_sessions s
      WHERE s.id = student_responses.session_id
        AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "response_insert_own" ON public.student_responses
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.student_sessions s
      WHERE s.id = student_responses.session_id
        AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "response_update_own" ON public.student_responses
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.student_sessions s
      WHERE s.id = student_responses.session_id
        AND s.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.student_sessions s
      WHERE s.id = student_responses.session_id
        AND s.user_id = auth.uid()
    )
  );

-- student_questions: INSERT only. Clients never list them; any teacher
-- dashboard will need its own policy (likely service-role).
CREATE POLICY "question_insert_own" ON public.student_questions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.student_sessions s
      WHERE s.id = student_questions.session_id
        AND s.user_id = auth.uid()
    )
  );

-- quiz_scores: INSERT only. The UI reads total_quiz_score off the session
-- row, not this table.
CREATE POLICY "quiz_insert_own" ON public.quiz_scores
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.student_sessions s
      WHERE s.id = quiz_scores.session_id
        AND s.user_id = auth.uid()
    )
  );

-- 5. Strip anon privileges; grant authenticated exactly what the client needs.
REVOKE ALL ON public.student_sessions   FROM anon;
REVOKE ALL ON public.student_responses  FROM anon;
REVOKE ALL ON public.student_questions  FROM anon;
REVOKE ALL ON public.quiz_scores        FROM anon;

GRANT SELECT, INSERT, UPDATE ON public.student_sessions   TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.student_responses  TO authenticated;
GRANT        INSERT          ON public.student_questions  TO authenticated;
GRANT        INSERT          ON public.quiz_scores        TO authenticated;

COMMIT;
