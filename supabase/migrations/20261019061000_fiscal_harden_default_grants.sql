-- Supabase default privileges can include TRUNCATE, which RLS does not restrict.
revoke all on public.fiscal_payments,public.fiscal_documents,public.fiscal_history from public,anon,authenticated;
grant select,insert on public.fiscal_payments,public.fiscal_documents to authenticated;
grant select on public.fiscal_history to authenticated;
