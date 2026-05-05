-- Migration v3: Add access_code to leases for code-based tenant portal login
-- Run this in your Supabase SQL editor

ALTER TABLE leases ADD COLUMN IF NOT EXISTS access_code text UNIQUE;

-- Index for fast lookup when tenant logs in via code
CREATE INDEX IF NOT EXISTS idx_leases_access_code ON leases(access_code);
