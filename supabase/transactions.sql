create extension if not exists pgcrypto;

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  type text not null check (type in ('income', 'expense', 'initial_balance')),
  amount numeric not null,
  category text not null,
  note text,
  date timestamp not null,
  created_at timestamp not null default now()
);

alter table if exists public.transactions
add column if not exists user_id uuid references auth.users (id) on delete cascade;

alter table if exists public.transactions
drop constraint if exists transactions_type_check;

alter table if exists public.transactions
add constraint transactions_type_check
check (type in ('income', 'expense', 'initial_balance'));

create index if not exists transactions_user_id_idx
on public.transactions (user_id);

alter table public.transactions enable row level security;

drop policy if exists "anon can read transactions" on public.transactions;
drop policy if exists "anon can insert transactions" on public.transactions;
drop policy if exists "authenticated users can read own transactions" on public.transactions;
drop policy if exists "authenticated users can insert own transactions" on public.transactions;
drop policy if exists "authenticated users can delete own transactions" on public.transactions;

create policy "authenticated users can read own transactions"
on public.transactions
for select
to authenticated
using (auth.uid() = user_id);

create policy "authenticated users can insert own transactions"
on public.transactions
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "authenticated users can delete own transactions"
on public.transactions
for delete
to authenticated
using (auth.uid() = user_id);
