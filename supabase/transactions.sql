create extension if not exists pgcrypto;

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('income', 'expense')),
  amount numeric not null,
  category text not null,
  note text,
  date timestamp not null,
  created_at timestamp not null default now()
);

alter table public.transactions enable row level security;

drop policy if exists "anon can read transactions" on public.transactions;
create policy "anon can read transactions"
on public.transactions
for select
to anon
using (true);

drop policy if exists "anon can insert transactions" on public.transactions;
create policy "anon can insert transactions"
on public.transactions
for insert
to anon
with check (true);
