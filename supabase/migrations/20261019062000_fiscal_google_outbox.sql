-- Apply after a fresh private backup. No OAuth credentials are in this migration.
create table public.fiscal_google_connections (
 user_id uuid primary key references auth.users(id),refresh_cipher text not null,
 calendar_id text not null,receipts_folder_id text not null,updated_at timestamptz not null default now()
);
create table public.fiscal_google_oauth_states (
 state_hash text primary key,user_id uuid not null references auth.users(id),
 expires_at timestamptz not null,created_at timestamptz not null default now()
);
create table public.fiscal_google_jobs (
 deadline_id uuid primary key references public.journal_deadlines(id),user_id uuid not null references auth.users(id),
 generation bigint not null default 1,locked_until timestamptz,attempts integer not null default 0,
 available_at timestamptz not null default now(),last_error text,updated_at timestamptz not null default now()
);
alter table public.fiscal_google_connections enable row level security;
alter table public.fiscal_google_oauth_states enable row level security;
alter table public.fiscal_google_jobs enable row level security;
revoke all on public.fiscal_google_connections,public.fiscal_google_oauth_states,public.fiscal_google_jobs from public,anon,authenticated;
grant all on public.fiscal_google_connections,public.fiscal_google_oauth_states,public.fiscal_google_jobs to service_role;
create index fiscal_google_jobs_ready on public.fiscal_google_jobs(available_at,locked_until);
create function public.lifeos_queue_fiscal_google() returns trigger language plpgsql security definer set search_path=pg_catalog,public as $$
declare did uuid;uid uuid;
begin
 if tg_table_name='journal_deadlines' then
  if tg_op='UPDATE' and (to_jsonb(new)-array['revision','updated_at','calendar_id','calendar_event_id','calendar_event_url'])=(to_jsonb(old)-array['revision','updated_at','calendar_id','calendar_event_id','calendar_event_url']) then return new; end if;
  if new.category not in ('fiscale','amministrativa') and new.obligation_key is null then return new; end if;
  did=new.id;uid=new.user_id;
 else did=new.deadline_id;uid=new.user_id;end if;
 if auth.uid() is not null and auth.uid()<>uid then raise exception 'Owner mismatch';end if;
 insert into public.fiscal_google_jobs(deadline_id,user_id) values(did,uid)
 on conflict(deadline_id) do update set generation=fiscal_google_jobs.generation+1,available_at=now(),updated_at=now(),last_error=null;
 return new;
end $$;
revoke all on function public.lifeos_queue_fiscal_google() from public,anon,authenticated;
create trigger fiscal_queue_deadline after insert or update on public.journal_deadlines for each row execute function public.lifeos_queue_fiscal_google();
create trigger fiscal_queue_payment after insert on public.fiscal_payments for each row execute function public.lifeos_queue_fiscal_google();
create trigger fiscal_queue_document after insert on public.fiscal_documents for each row execute function public.lifeos_queue_fiscal_google();
create function public.lifeos_claim_fiscal_jobs() returns setof public.fiscal_google_jobs language sql security invoker set search_path=public,pg_temp as $$
 update public.fiscal_google_jobs set locked_until=now()+interval '5 minutes',attempts=attempts+1
 where deadline_id in(select deadline_id from public.fiscal_google_jobs where available_at<=now() and (locked_until is null or locked_until<now()) order by available_at for update skip locked limit 20) returning *;
$$;
revoke all on function public.lifeos_claim_fiscal_jobs() from public,anon,authenticated;
grant execute on function public.lifeos_claim_fiscal_jobs() to service_role;
create function public.lifeos_consume_google_state(p_hash text) returns setof public.fiscal_google_oauth_states language sql security invoker set search_path=public,pg_temp as $$
 delete from public.fiscal_google_oauth_states where state_hash=p_hash and expires_at>now() returning *;
$$;
revoke all on function public.lifeos_consume_google_state(text) from public,anon,authenticated;
grant execute on function public.lifeos_consume_google_state(text) to service_role;
create table public.fiscal_google_uploads (
 user_id uuid not null references auth.users(id),operation_id uuid not null,deadline_id uuid not null,
 drive_file_id text not null,file_name text not null,file_size bigint not null,
 created_at timestamptz not null default now(),primary key(user_id,operation_id),
 foreign key(deadline_id,user_id) references public.journal_deadlines(id,user_id)
);
alter table public.fiscal_google_uploads enable row level security;
revoke all on public.fiscal_google_uploads from public,anon,authenticated;
grant all on public.fiscal_google_uploads to service_role;
