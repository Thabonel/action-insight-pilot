-- Set up cron jobs for autopilot automation
-- Uses pg_cron extension to schedule Supabase Edge Functions

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage on cron schema to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Remove existing cron jobs if they exist
SELECT cron.unschedule('autopilot-daily-orchestration');
SELECT cron.unschedule('autopilot-weekly-reports');

-- Schedule daily autopilot orchestration (runs at 2 AM UTC every day)
SELECT cron.schedule(
  'autopilot-daily-orchestration',
  '0 2 * * *', -- Every day at 2 AM
  $$
  SELECT
    net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/autopilot-orchestrator',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- Schedule weekly report generation (runs Monday at 9 AM UTC)
SELECT cron.schedule(
  'autopilot-weekly-reports',
  '0 9 * * 1', -- Every Monday at 9 AM
  $$
  SELECT
    net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/autopilot-weekly-report',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- Create a view to monitor cron job execution
CREATE OR REPLACE VIEW autopilot_cron_monitor AS
SELECT
  jobid,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active,
  jobname
FROM cron.job
WHERE jobname LIKE 'autopilot-%'
ORDER BY jobname;

-- Grant access to the monitoring view
GRANT SELECT ON autopilot_cron_monitor TO authenticated;

-- Create a function to manually trigger autopilot orchestration (for testing)
CREATE OR REPLACE FUNCTION trigger_autopilot_orchestration()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT
    net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/autopilot-orchestrator',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{}'::jsonb
    ) INTO result;

  RETURN result;
END;
$$;

-- Create a function to manually trigger weekly report generation (for testing)
CREATE OR REPLACE FUNCTION trigger_weekly_report_generation()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT
    net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/autopilot-weekly-report',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{}'::jsonb
    ) INTO result;

  RETURN result;
END;
$$;

-- Add comments for documentation
COMMENT ON FUNCTION trigger_autopilot_orchestration() IS
  'Manually trigger the autopilot orchestration process for testing. Use: SELECT trigger_autopilot_orchestration();';

COMMENT ON FUNCTION trigger_weekly_report_generation() IS
  'Manually trigger weekly report generation for testing. Use: SELECT trigger_weekly_report_generation();';

-- Log the cron job setup
DO $$
BEGIN
  RAISE NOTICE '✅ Autopilot cron jobs configured successfully';
  RAISE NOTICE '📅 Daily orchestration: Every day at 2 AM UTC';
  RAISE NOTICE '📊 Weekly reports: Every Monday at 9 AM UTC';
  RAISE NOTICE '🔧 Manual triggers available: trigger_autopilot_orchestration(), trigger_weekly_report_generation()';
END $$;
