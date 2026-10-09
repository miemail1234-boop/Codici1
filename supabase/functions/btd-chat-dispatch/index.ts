import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
const validUuid = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const input = await req.json().catch(() => null);
  const requestId = input?.request_id;
  if (!validUuid(requestId)) return json({ error: "invalid_request" }, 400);

  const projectUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!projectUrl || !serviceKey) return json({ error: "internal_configuration_error" }, 503);

  // The database creates an unpredictable, two-minute, single-use request ID.
  // RLS and GRANTs block anon/authenticated users from creating or reading IDs.
  const tableUrl = `${projectUrl}/rest/v1/btd_chat_requests`;
  const apiHeaders = {
    "apikey": serviceKey,
    "Authorization": `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation",
  };
  const now = new Date().toISOString();
  const claimUrl = `${tableUrl}?id=eq.${requestId}&status=eq.queued&expires_at=gt.${encodeURIComponent(now)}`;
  let claimed = false;
  try {
    const claimResponse = await fetch(claimUrl, {
      method: "PATCH", headers: apiHeaders,
      body: JSON.stringify({ status: "claimed", claimed_at: now }),
    });
    if (!claimResponse.ok) return json({ error: "ticket_check_unavailable" }, 503);
    const rows = await claimResponse.json();
    claimed = Array.isArray(rows) && rows.length === 1;
  } catch {
    return json({ error: "ticket_check_unavailable" }, 503);
  }
  if (!claimed) return json({ error: "unauthorized_or_expired" }, 401);

  let result: Record<string, unknown> = {};
  let ok = false;
  let failure = "orchestrator_failed";
  try {
    const scan = await fetch(`${projectUrl}/functions/v1/btd-run-now-temp`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${serviceKey}`, "apikey": serviceKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason: "chat-authorized", force_macro_refresh: true }),
    });
    const payload: unknown = await scan.json().catch(() => null);
    if (payload && typeof payload === "object" && !Array.isArray(payload)) {
      result = payload as Record<string, unknown>;
    }
    const macro = result.macro_refresh as Record<string, unknown> | undefined;
    const refreshed = macro?.refreshed as Record<string, unknown> | undefined;
    const after = macro?.after as Record<string, Record<string, unknown>> | undefined;
    ok = scan.ok && result.ok === true && result.status === "success" &&
      result.asset_count === 28 && result.success_count === 28 &&
      result.error_count === 0 && refreshed?.cycle === true &&
      refreshed?.monetary === true &&
      after?.cycle?.count === 15 && after?.monetary?.count === 15;
    failure = `orchestrator_http_${scan.status}`;
  } catch {
    failure = "orchestrator_unreachable";
  }
  const runId = validUuid(result.run_id) ? result.run_id : null;
  const doneAt = new Date().toISOString();
  try {
    const save = await fetch(`${tableUrl}?id=eq.${requestId}&status=eq.claimed`, {
      method: "PATCH", headers: apiHeaders,
      body: JSON.stringify({
        status: ok ? "success" : "failed",
        completed_at: doneAt,
        run_id: runId,
        error: ok ? null : failure,
      }),
    });
    if (!save.ok) return json({ ok, run_id: runId, error: "result_persistence_failed" }, 503);
  } catch {
    return json({ ok, run_id: runId, error: "result_persistence_failed" }, 503);
  }
  return json({ ok, run_id: runId, request_id: requestId,
    asset_count: result.asset_count ?? null, success_count: result.success_count ?? null,
    error_count: result.error_count ?? null, error: ok ? null : failure }, ok ? 200 : 502);
});
