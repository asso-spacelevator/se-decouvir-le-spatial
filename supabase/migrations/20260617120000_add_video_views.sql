-- Track video views for session 2 sections (entreprises_spatiales, accompagnement, etc.)
-- INSERT-only from clients; reporting queries go through service-role.

CREATE TABLE public.video_views (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid        NOT NULL REFERENCES public.student_sessions(id) ON DELETE CASCADE,
  section    text        NOT NULL CHECK (length(section) <= 100),
  video_id   text        NOT NULL CHECK (length(video_id) <= 50),
  video_title text       NOT NULL CHECK (length(video_title) <= 200),
  viewed_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.video_views ENABLE ROW LEVEL SECURITY;

-- Students can only insert rows linked to their own session.
CREATE POLICY "video_view_insert_own" ON public.video_views
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.student_sessions s
      WHERE s.id = video_views.session_id
        AND s.user_id = (select auth.uid())
    )
  );

-- Grant only INSERT to authenticated role (no read from client).
REVOKE ALL ON public.video_views FROM anon, authenticated;
GRANT INSERT ON public.video_views TO authenticated;
