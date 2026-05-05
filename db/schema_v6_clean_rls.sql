-- Migration v6: Clean-slate RLS — run this in Supabase SQL editor
-- Drops EVERY existing policy on all tables (regardless of name), then
-- creates simple, recursion-free policies using SECURITY DEFINER helpers.

-- ── Step 1: Drop ALL existing policies on affected tables ─────────────────────
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'profiles','properties','units',
        'leases','payments','maintenance_requests'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- ── Step 2: Disable RLS momentarily to clear state ───────────────────────────
ALTER TABLE profiles              DISABLE ROW LEVEL SECURITY;
ALTER TABLE properties            DISABLE ROW LEVEL SECURITY;
ALTER TABLE units                 DISABLE ROW LEVEL SECURITY;
ALTER TABLE leases                DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments              DISABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests  DISABLE ROW LEVEL SECURITY;

-- ── Step 3: SECURITY DEFINER helpers (run as DB owner, bypass RLS chain) ──────
-- These read units/properties without triggering their own RLS policies,
-- breaking the recursion chain entirely.

CREATE OR REPLACE FUNCTION public.get_property_owner(p_property_id uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT owner_id FROM properties WHERE id = p_property_id;
$$;

CREATE OR REPLACE FUNCTION public.get_unit_owner(p_unit_id uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT p.owner_id
  FROM units u
  JOIN properties p ON p.id = u.property_id
  WHERE u.id = p_unit_id;
$$;

-- ── Step 4: Re-enable RLS and create clean policies ───────────────────────────

-- profiles ─────────────────────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (id = auth.uid());

-- properties ───────────────────────────────────────────────────────────────────
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "properties_all" ON properties FOR ALL
  USING  (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- units ────────────────────────────────────────────────────────────────────────
ALTER TABLE units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "units_all" ON units FOR ALL
  USING  (get_property_owner(property_id) = auth.uid())
  WITH CHECK (get_property_owner(property_id) = auth.uid());

-- leases ───────────────────────────────────────────────────────────────────────
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leases_owner" ON leases FOR ALL
  USING  (get_unit_owner(unit_id) = auth.uid())
  WITH CHECK (get_unit_owner(unit_id) = auth.uid());

CREATE POLICY "leases_tenant_view" ON leases FOR SELECT
  USING (tenant_id = auth.uid());

-- payments ─────────────────────────────────────────────────────────────────────
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_owner" ON payments FOR ALL
  USING (
    (property_id IS NOT NULL AND get_property_owner(property_id) = auth.uid())
    OR
    (property_id IS NULL AND tenant_id = auth.uid())
  );

CREATE POLICY "payments_tenant" ON payments FOR ALL
  USING    (tenant_id = auth.uid())
  WITH CHECK (tenant_id = auth.uid());

-- maintenance_requests ─────────────────────────────────────────────────────────
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "maint_owner" ON maintenance_requests FOR ALL
  USING (get_unit_owner(unit_id) = auth.uid());

CREATE POLICY "maint_tenant" ON maintenance_requests FOR ALL
  USING    (tenant_id = auth.uid())
  WITH CHECK (tenant_id = auth.uid());

-- ── Step 5: Verify (optional — run separately to check) ──────────────────────
-- SELECT tablename, policyname, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
