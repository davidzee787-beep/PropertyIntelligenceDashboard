-- Migration v5: Fix infinite recursion in RLS policies
-- Run this INSTEAD of (or after) schema_v4_rls_fix.sql
-- Uses SECURITY DEFINER helper functions to break the policy recursion chain.

-- ── Helper functions (bypass RLS to check ownership) ─────────────────────────

CREATE OR REPLACE FUNCTION auth_owns_unit(p_unit_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM units u
    JOIN properties p ON p.id = u.property_id
    WHERE u.id = p_unit_id AND p.owner_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION auth_owns_property(p_property_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM properties WHERE id = p_property_id AND owner_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION auth_owns_lease(p_lease_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM leases l
    JOIN units u ON u.id = l.unit_id
    JOIN properties p ON p.id = u.property_id
    WHERE l.id = p_lease_id AND p.owner_id = auth.uid()
  );
$$;

-- ── profiles ──────────────────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile"   ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- ── properties ────────────────────────────────────────────────────────────────
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage own properties" ON properties;

CREATE POLICY "Owners can manage own properties"
  ON properties FOR ALL
  USING  (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- ── units ─────────────────────────────────────────────────────────────────────
ALTER TABLE units ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage units of own properties" ON units;

CREATE POLICY "Owners can manage units of own properties"
  ON units FOR ALL
  USING  (auth_owns_property(property_id))
  WITH CHECK (auth_owns_property(property_id));

-- ── leases ────────────────────────────────────────────────────────────────────
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage leases on their properties" ON leases;
DROP POLICY IF EXISTS "Tenants can view own lease"                   ON leases;

-- Uses SECURITY DEFINER function — avoids recursion through units/properties RLS
CREATE POLICY "Owners can manage leases on their properties"
  ON leases FOR ALL
  USING  (auth_owns_unit(unit_id))
  WITH CHECK (auth_owns_unit(unit_id));

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
    auth_owns_property(property_id)
    OR auth_owns_lease(lease_id)
  );

CREATE POLICY "Tenants can manage own payments"
  ON payments FOR ALL
  USING    (tenant_id = auth.uid())
  WITH CHECK (tenant_id = auth.uid());

-- ── maintenance_requests ──────────────────────────────────────────────────────
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage maintenance on their units" ON maintenance_requests;
DROP POLICY IF EXISTS "Tenants can submit and view own maintenance"  ON maintenance_requests;

CREATE POLICY "Owners can manage maintenance on their units"
  ON maintenance_requests FOR ALL
  USING (auth_owns_unit(unit_id));

CREATE POLICY "Tenants can submit and view own maintenance"
  ON maintenance_requests FOR ALL
  USING    (tenant_id = auth.uid())
  WITH CHECK (tenant_id = auth.uid());
