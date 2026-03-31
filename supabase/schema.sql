-- SnapQuote Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ENUM types
create type trade_type as enum ('plumber', 'hvac', 'electrician', 'general', 'other');
create type plan_type as enum ('starter', 'pro', 'team');
create type quote_status as enum ('draft', 'sent', 'approved', 'deposit_paid', 'cancelled');

-- Users table (contractors)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  business_name text,
  trade_type trade_type,
  logo_url text,
  hourly_rate numeric(10,2),
  default_deposit_percent integer default 33,
  stripe_account_id text,
  plan plan_type default 'starter',
  onboarded boolean default false,
  created_at timestamptz default now()
);

-- Quotes table
create table public.quotes (
  id uuid default uuid_generate_v4() primary key,
  contractor_id uuid references public.users(id) on delete cascade not null,
  customer_name text not null,
  customer_phone text,
  status quote_status default 'draft',
  photos text[] default '{}',
  ai_description text,
  line_items jsonb default '[]',
  subtotal numeric(10,2) default 0,
  deposit_amount numeric(10,2) default 0,
  deposit_percent integer default 33,
  notes text,
  pdf_url text,
  stripe_payment_intent_id text,
  sent_at timestamptz,
  approved_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- Indexes
create index idx_quotes_contractor on public.quotes(contractor_id);
create index idx_quotes_status on public.quotes(status);
create index idx_quotes_created on public.quotes(created_at desc);

-- RLS Policies

-- Enable RLS
alter table public.users enable row level security;
alter table public.quotes enable row level security;

-- Users: contractors can read/update their own profile
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);

-- Quotes: contractors can CRUD their own quotes
create policy "Contractors can view own quotes"
  on public.quotes for select
  using (auth.uid() = contractor_id);

create policy "Contractors can create quotes"
  on public.quotes for insert
  with check (auth.uid() = contractor_id);

create policy "Contractors can update own quotes"
  on public.quotes for update
  using (auth.uid() = contractor_id);

create policy "Contractors can delete own quotes"
  on public.quotes for delete
  using (auth.uid() = contractor_id);

-- Public quote access (for customer proposal page — read-only by quote ID)
create policy "Anyone can view quote by ID"
  on public.quotes for select
  using (true);

-- Trigger: auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Storage bucket for photos and logos
insert into storage.buckets (id, name, public) values ('photos', 'photos', true);
insert into storage.buckets (id, name, public) values ('logos', 'logos', true);
insert into storage.buckets (id, name, public) values ('pdfs', 'pdfs', true);

-- Storage policies
create policy "Authenticated users can upload photos"
  on storage.objects for insert
  with check (bucket_id = 'photos' and auth.role() = 'authenticated');

create policy "Anyone can view photos"
  on storage.objects for select
  using (bucket_id = 'photos');

create policy "Authenticated users can upload logos"
  on storage.objects for insert
  with check (bucket_id = 'logos' and auth.role() = 'authenticated');

create policy "Anyone can view logos"
  on storage.objects for select
  using (bucket_id = 'logos');

create policy "Authenticated users can upload pdfs"
  on storage.objects for insert
  with check (bucket_id = 'pdfs' and auth.role() = 'authenticated');

create policy "Anyone can view pdfs"
  on storage.objects for select
  using (bucket_id = 'pdfs');
