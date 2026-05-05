-- ─────────────────────────────────────────────────────────────────────────────
-- Augmentics AI — Real Estate Dashboard
-- Run this entire file in: Supabase Dashboard → SQL Editor → New Query → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- Extensions
create extension if not exists "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────────────────────
create table public.profiles (
  id          uuid references auth.users on delete cascade not null primary key,
  email       text unique not null,
  full_name   text,
  phone       text,
  role        text not null default 'owner' check (role in ('owner', 'tenant', 'admin')),
  avatar_url  text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- ─── PROPERTIES ──────────────────────────────────────────────────────────────
create table public.properties (
  id            uuid default uuid_generate_v4() primary key,
  owner_id      uuid references public.profiles(id) on delete cascade not null,
  name          text not null,
  code          text unique not null,
  type          text not null check (type in ('Residential', 'Commercial', 'Industrial')),
  address       text,
  city          text,
  floors        integer default 1,
  sqft          integer,
  parking_spots integer default 0,
  year_built    integer,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

-- ─── UNITS ───────────────────────────────────────────────────────────────────
create table public.units (
  id          uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  unit_number text not null,
  floor       integer default 1,
  sqft        integer,
  rent_amount numeric(10,2) not null default 0,
  status      text not null default 'vacant' check (status in ('occupied', 'vacant')),
  created_at  timestamptz default now() not null
);

-- ─── LEASES ──────────────────────────────────────────────────────────────────
create table public.leases (
  id           uuid default uuid_generate_v4() primary key,
  unit_id      uuid references public.units(id) on delete cascade not null,
  tenant_id    uuid references public.profiles(id) on delete cascade not null,
  monthly_rent numeric(10,2) not null,
  start_date   date not null,
  end_date     date not null,
  status       text not null default 'active' check (status in ('active', 'expired', 'expiring')),
  notes        text,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

-- ─── PAYMENTS ────────────────────────────────────────────────────────────────
create table public.payments (
  id             uuid default uuid_generate_v4() primary key,
  lease_id       uuid references public.leases(id) on delete cascade not null,
  tenant_id      uuid references public.profiles(id) on delete cascade not null,
  amount         numeric(10,2) not null,
  due_date       date not null,
  paid_date      date,
  status         text not null default 'pending' check (status in ('paid', 'pending', 'overdue')),
  payment_method text check (payment_method in ('Bank Transfer', 'Cheque', 'Online Payment', 'Cash')),
  receipt_url    text,
  notes          text,
  created_at     timestamptz default now() not null
);

-- ─── MAINTENANCE REQUESTS ────────────────────────────────────────────────────
create table public.maintenance_requests (
  id          uuid default uuid_generate_v4() primary key,
  unit_id     uuid references public.units(id) on delete cascade not null,
  tenant_id   uuid references public.profiles(id) on delete cascade not null,
  issue       text not null,
  description text,
  priority    text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  status      text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  assignee    text,
  photos_urls text[],
  notes       text,
  resolved_at timestamptz,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- ─── TRIGGERS ────────────────────────────────────────────────────────────────

-- Auto-create profile row when a user signs up (covers Google OAuth + email)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at timestamps
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at        before update on public.profiles           for each row execute procedure public.set_updated_at();
create trigger properties_updated_at      before update on public.properties         for each row execute procedure public.set_updated_at();
create trigger leases_updated_at          before update on public.leases             for each row execute procedure public.set_updated_at();
create trigger maintenance_updated_at     before update on public.maintenance_requests for each row execute procedure public.set_updated_at();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────

alter table public.profiles             enable row level security;
alter table public.properties           enable row level security;
alter table public.units                enable row level security;
alter table public.leases               enable row level security;
alter table public.payments             enable row level security;
alter table public.maintenance_requests enable row level security;

-- Profiles
create policy "own profile" on public.profiles
  for all using (auth.uid() = id);

create policy "owners see all profiles" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','admin'))
  );

-- Properties
create policy "owners manage own properties" on public.properties
  for all using (owner_id = auth.uid());

create policy "tenants see leased properties" on public.properties
  for select using (
    exists (
      select 1 from public.leases l join public.units u on u.id = l.unit_id
      where u.property_id = properties.id and l.tenant_id = auth.uid()
    )
  );

-- Units
create policy "owners manage units" on public.units
  for all using (
    exists (select 1 from public.properties p where p.id = units.property_id and p.owner_id = auth.uid())
  );

create policy "tenants see leased units" on public.units
  for select using (
    exists (select 1 from public.leases l where l.unit_id = units.id and l.tenant_id = auth.uid())
  );

-- Leases
create policy "owners manage leases" on public.leases
  for all using (
    exists (
      select 1 from public.units u join public.properties p on p.id = u.property_id
      where u.id = leases.unit_id and p.owner_id = auth.uid()
    )
  );

create policy "tenants see own leases" on public.leases
  for select using (tenant_id = auth.uid());

-- Payments
create policy "owners see all payments" on public.payments
  for select using (
    exists (
      select 1 from public.leases l join public.units u on u.id = l.unit_id
      join public.properties p on p.id = u.property_id
      where l.id = payments.lease_id and p.owner_id = auth.uid()
    )
  );

create policy "owners update payment status" on public.payments
  for update using (
    exists (
      select 1 from public.leases l join public.units u on u.id = l.unit_id
      join public.properties p on p.id = u.property_id
      where l.id = payments.lease_id and p.owner_id = auth.uid()
    )
  );

create policy "tenants manage own payments" on public.payments
  for all using (tenant_id = auth.uid());

-- Maintenance
create policy "owners see all maintenance" on public.maintenance_requests
  for select using (
    exists (
      select 1 from public.units u join public.properties p on p.id = u.property_id
      where u.id = maintenance_requests.unit_id and p.owner_id = auth.uid()
    )
  );

create policy "owners update maintenance" on public.maintenance_requests
  for update using (
    exists (
      select 1 from public.units u join public.properties p on p.id = u.property_id
      where u.id = maintenance_requests.unit_id and p.owner_id = auth.uid()
    )
  );

create policy "tenants manage own maintenance" on public.maintenance_requests
  for all using (tenant_id = auth.uid());

-- ─── REALTIME ────────────────────────────────────────────────────────────────
-- Enables live push when tenants submit payments or maintenance requests
alter publication supabase_realtime add table public.payments;
alter publication supabase_realtime add table public.maintenance_requests;
