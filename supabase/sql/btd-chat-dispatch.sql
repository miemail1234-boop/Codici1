-- Life Tracker: admin-only BTD launch from an authenticated Supabase SQL connector.
-- Deploy supabase/functions/btd-chat-dispatch/index.ts with verify_jwt=false.
-- This endpoint implements custom authentication: random, single-use, 2-minute DB tickets.
-- No API keys or JWTs are stored in this repository or passed through ChatGPT.
--
-- Execute once as a privileged project administrator. The script is idempotent.
BEGIN;

CREATE SCHEMA IF NOT EXISTS btd_internal;
REVOKE ALL ON SCHEMA btd_internal FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS public.btd_chat_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '2 minutes'),
  status text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'claimed', 'success', 'failed')),
  claimed_at timestamptz,
  completed_at timestamptz,
  run_id uuid,
  error text
);

ALTER TABLE public.btd_chat_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.btd_chat_requests FROM PUBLIC, anon, authenticated;
GRANT SELECT, UPDATE ON public.btd_chat_requests TO service_role;

CREATE OR REPLACE FUNCTION btd_internal.dispatch_chat_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog
AS $fn$
BEGIN
  PERFORM net.http_post(
    url := 'https://kujyowhezihjambhpahe.supabase.co/functions/v1/btd-chat-dispatch',
    body := jsonb_build_object('request_id', new.id),
    headers := '{"Content-Type":"application/json"}'::jsonb,
    timeout_milliseconds := 60000
  );
  RETURN new;
END;
$fn$;

REVOKE ALL ON FUNCTION btd_internal.dispatch_chat_request()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS btd_chat_requests_dispatch ON public.btd_chat_requests;
CREATE TRIGGER btd_chat_requests_dispatch
AFTER INSERT ON public.btd_chat_requests
FOR EACH ROW EXECUTE FUNCTION btd_internal.dispatch_chat_request();

COMMIT;

-- Launch from an admin-authorized Supabase SQL connector:
-- INSERT INTO public.btd_chat_requests DEFAULT VALUES RETURNING id;
-- Check:
-- SELECT status, run_id, error FROM public.btd_chat_requests ORDER BY created_at DESC LIMIT 1;
-- SELECT id, status, asset_count, success_count, error_count
-- FROM public.btd_scan_runs ORDER BY started_at DESC LIMIT 1;
