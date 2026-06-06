-- RGPD: purge school_name automatically after 1 year.
-- A pg_cron job runs nightly at 03:00 UTC and nullifies school_name on sessions older than 1 year.
-- pg_cron must be enabled on the project (Supabase dashboard > Extensions > pg_cron).

CREATE OR REPLACE FUNCTION purge_old_school_names()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE student_sessions
  SET school_name = NULL
  WHERE school_name IS NOT NULL
    AND created_at < NOW() - INTERVAL '1 year';
$$;

-- Register the cron job only when the extension is available (noop in envs without pg_cron)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    BEGIN
      PERFORM cron.unschedule('purge-school-name-1y');
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    PERFORM cron.schedule(
      'purge-school-name-1y',
      '0 3 * * *',
      'SELECT purge_old_school_names()'
    );
  END IF;
END;
$$;
