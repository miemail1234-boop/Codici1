-- Additive migration: journal_deadlines remains the canonical archive.
alter table public.journal_deadlines
 add column if not exists fiscal_year integer,
 add column if not exists obligation_key text,
 add column if not exists applicability text not null default 'da_verificare' check (applicability in ('obbligatorio','facoltativo','alternativo','non_applicabile','da_verificare')),
 add column if not exists date_verified boolean not null default false,
 add column if not exists date_source text,
 add column if not exists amount_due numeric(14,2) check (amount_due >= 0),
 add column if not exists deleted_at timestamptz,
 add column if not exists revision bigint not null default 1,
 add column if not exists calendar_id text,
 add column if not exists calendar_event_id text,
 add column if not exists calendar_event_url text;
create unique index if not exists deadline_fiscal_identity on public.journal_deadlines(user_id,fiscal_year,obligation_key) where obligation_key is not null;
create unique index if not exists deadline_owner_identity on public.journal_deadlines(id,user_id);
create table public.fiscal_payments (
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id),
 deadline_id uuid not null, amount numeric(14,2) not null check(amount>=0),paid_on date not null,
 note text not null default '',created_at timestamptz not null default now(),
 foreign key(deadline_id,user_id) references public.journal_deadlines(id,user_id)
);
create table public.fiscal_documents (
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id),deadline_id uuid not null,
 drive_file_id text not null,file_name text not null,created_at timestamptz not null default now(),
 unique(user_id,drive_file_id), foreign key(deadline_id,user_id) references public.journal_deadlines(id,user_id)
);
create table public.fiscal_history (
 id bigint generated always as identity primary key,user_id uuid not null,deadline_id uuid not null,
 operation text not null,before_data jsonb,after_data jsonb,created_at timestamptz not null default now()
);
create index on public.fiscal_payments(user_id,deadline_id);
create index on public.fiscal_documents(user_id,deadline_id);
create index on public.fiscal_history(user_id,deadline_id);
alter table public.fiscal_payments enable row level security;
alter table public.fiscal_documents enable row level security;
alter table public.fiscal_history enable row level security;
create policy payment_read on public.fiscal_payments for select to authenticated using(auth.uid()=user_id);
create policy payment_insert on public.fiscal_payments for insert to authenticated with check(auth.uid()=user_id);
create policy document_read on public.fiscal_documents for select to authenticated using(auth.uid()=user_id);
create policy document_insert on public.fiscal_documents for insert to authenticated with check(auth.uid()=user_id);
create policy history_read on public.fiscal_history for select to authenticated using(auth.uid()=user_id);
grant select,insert on public.fiscal_payments,public.fiscal_documents to authenticated;
grant select on public.fiscal_history to authenticated;
-- Audit trigger only, not callable as an RPC; definer permits immutable history without granting clients writes.
create function public.lifeos_deadline_audit() returns trigger language plpgsql security definer set search_path=pg_catalog,public as $$
begin
 if auth.uid() is not null and auth.uid() <> coalesce(new.user_id,old.user_id) then raise exception 'Owner mismatch'; end if;
 if tg_op='UPDATE' then
  if new.user_id<>old.user_id then raise exception 'Owner cannot change'; end if;
  new.revision=old.revision+1;new.updated_at=clock_timestamp();
 end if;
 insert into public.fiscal_history(user_id,deadline_id,operation,before_data,after_data)
 values(coalesce(new.user_id,old.user_id),coalesce(new.id,old.id),tg_op,case when tg_op<>'INSERT' then to_jsonb(old) end,case when tg_op<>'DELETE' then to_jsonb(new) end);
 return case when tg_op='DELETE' then old else new end;
end $$;
revoke all on function public.lifeos_deadline_audit() from public,anon,authenticated;
create trigger lifeos_deadline_audit before insert or update or delete on public.journal_deadlines for each row execute function public.lifeos_deadline_audit();
-- Atomic idempotent payment registration and optimistic concurrency guard.
create function public.lifeos_record_payment(p_deadline uuid,p_revision bigint,p_id uuid,p_amount numeric,p_paid_on date,p_note text default '') returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare d public.journal_deadlines; existing public.fiscal_payments;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 select * into existing from public.fiscal_payments where id=p_id and user_id=auth.uid();
 if found then
  if existing.deadline_id<>p_deadline or existing.amount<>p_amount or existing.paid_on<>p_paid_on or existing.note<>p_note then raise exception 'Idempotency conflict'; end if;
  return to_jsonb(existing);
 end if;
 update public.journal_deadlines set updated_at=clock_timestamp() where id=p_deadline and user_id=auth.uid() and revision=p_revision returning * into d;
 if not found then raise exception 'Conflict: reload current deadline'; end if;
 insert into public.fiscal_payments(id,user_id,deadline_id,amount,paid_on,note) values(p_id,auth.uid(),p_deadline,p_amount,p_paid_on,p_note) returning * into existing;
 return to_jsonb(existing);
end $$;
revoke all on function public.lifeos_record_payment(uuid,bigint,uuid,numeric,date,text) from public,anon;
grant execute on function public.lifeos_record_payment(uuid,bigint,uuid,numeric,date,text) to authenticated;
