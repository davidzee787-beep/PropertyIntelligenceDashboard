-- ─────────────────────────────────────────────────────────────────────────────
-- Augmentics AI — Schema v2 Migration
-- Run in Supabase Dashboard → SQL Editor → New Query → Run
-- Run AFTER schema.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- Allow owner-recorded payments that don't require a lease or tenant account
ALTER TABLE public.payments ALTER COLUMN lease_id   DROP NOT NULL;
ALTER TABLE public.payments ALTER COLUMN tenant_id  DROP NOT NULL;

-- Direct property reference (for owner-recorded payments)
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS property_id uuid references public.properties(id) on delete cascade;

-- Free-text tenant name (when no profile exists yet)
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS tenant_name text;

-- ─── Updated payment RLS policies ─────────────────────────────────────────────

DROP POLICY IF EXISTS "owners see all payments"      ON public.payments;
DROP POLICY IF EXISTS "owners update payment status" ON public.payments;
DROP POLICY IF EXISTS "tenants manage own payments"  ON public.payments;

-- Owners can see payments on their properties (via direct property_id OR via lease chain)
CREATE POLICY "owners see all payments" ON public.payments
  FOR SELECT USING (
    (property_id IN (SELECT id FROM public.properties WHERE owner_id = auth.uid()))
    OR
    (lease_id IN (
      SELECT l.id FROM public.leases l
      JOIN public.units u ON u.id = l.unit_id
      JOIN public.properties p ON p.id = u.property_id
      WHERE p.owner_id = auth.uid()
    ))
    OR (tenant_id = auth.uid())
  );

-- Owners can insert payments directly against their properties
CREATE POLICY "owners insert payments" ON public.payments
  FOR INSERT WITH CHECK (
    (property_id IN (SELECT id FROM public.properties WHERE owner_id = auth.uid()))
    OR
    (lease_id IN (
      SELECT l.id FROM public.leases l
      JOIN public.units u ON u.id = l.unit_id
      JOIN public.properties p ON p.id = u.property_id
      WHERE p.owner_id = auth.uid()
    ))
  );

-- Owners can update payment status on their properties
CREATE POLICY "owners update payment status" ON public.payments
  FOR UPDATE USING (
    (property_id IN (SELECT id FROM public.properties WHERE owner_id = auth.uid()))
    OR
    (lease_id IN (
      SELECT l.id FROM public.leases l
      JOIN public.units u ON u.id = l.unit_id
      JOIN public.properties p ON p.id = u.property_id
      WHERE p.owner_id = auth.uid()
    ))
  );

-- Tenants can manage payments where they are the named tenant
CREATE POLICY "tenants manage own payments" ON public.payments
  FOR ALL USING (tenant_id = auth.uid());
