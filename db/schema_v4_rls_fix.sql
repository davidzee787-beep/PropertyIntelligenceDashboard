-- Migration v4: Fix RLS policies so users can manage their own profiles
-- Run this in your Supabase SQL editor if you see "Cannot read properties of null" errors
-- or if properties/leases fail to save.

-- ── profiles ──────────────────────────────────────────────────────────────────
-- Allow users to read and write their own profile row
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile"   ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ── properties ────────────────────────────────────────────────────────────────
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage own properties" ON properties;

CREATE POLICY "Owners can manage own properties"
  ON properties FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- ── units ─────────────────────────────────────────────────────────────────────
ALTER TABLE units ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage units of own properties" ON units;

CREATE POLICY "Owners can manage units of own properties"
  ON units FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = units.property_id
        AND properties.owner_id = auth.uid()
    )
  );

-- ── leases ────────────────────────────────────────────────────────────────────
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage leases on their properties" ON leases;
DROP POLICY IF EXISTS "Tenants can view own lease"                   ON leases;

CREATE POLICY "Owners can manage leases on their properties"
  ON leases FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM units
      JOIN properties ON properties.id = units.property_id
      WHERE units.id = leases.unit_id
        AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Tenants can view own lease"
  ON leases FOR SELECT
  USING (tenant_id = auth.uid());

-- ── payments ──────────────────────────────────────────────────────────────────
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage payments on their properties" ON payments;
DROP POLICY IF EXISTS "Tenants can manage own payments"                ON payments;

CREATE POLICY "Owners can manage payments on their properties"
  ON payments FOR ALL
  USING (
    property_id IN (
      SELECT id FROM properties WHERE owner_id = auth.uid()
    )
    OR
    lease_id IN (
      SELECT leases.id FROM leases
      JOIN units ON units.id = leases.unit_id
      JOIN properties ON properties.id = units.property_id
      WHERE properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Tenants can manage own payments"
  ON payments FOR ALL
  USING (tenant_id = auth.uid())
  WITH CHECK (tenant_id = auth.uid());

-- ── maintenance_requests ──────────────────────────────────────────────────────
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage maintenance on their units" ON maintenance_requests;
DROP POLICY IF EXISTS "Tenants can submit and view own maintenance"  ON maintenance_requests;

CREATE POLICY "Owners can manage maintenance on their units"
  ON maintenance_requests FOR ALL
  USING (
    unit_id IN (
      SELECT units.id FROM units
      JOIN properties ON properties.id = units.property_id
      WHERE properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Tenants can submit and view own maintenance"
  ON maintenance_requests FOR ALL
  USING (tenant_id = auth.uid())
  WITH CHECK (tenant_id = auth.uid());
