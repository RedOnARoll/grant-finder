-- ============================================================
-- seed-step1-type-column.sql
-- Adds `type` column ('grant' | 'benefit') to the grants table
-- and classifies all existing rows.
-- Run in Supabase SQL editor BEFORE any benefits seed batches.
-- ============================================================

-- 1. Add the column (safe to re-run; no-op if already exists)
ALTER TABLE grants ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'grant';

-- 2. Mark rows whose top-level category maps to benefits
UPDATE grants SET type = 'benefit'
WHERE category IN ('housing', 'health', 'energy', 'education');

-- 3. Mark rows under 'individual' category whose subcategory is a benefit type
--    (covers SNAP, WIC, SSDI, SSI, TANF, LIHEAP, Section 8, CCDF, Head Start, etc.)
UPDATE grants SET type = 'benefit'
WHERE subcategory IN ('housing', 'food', 'disability', 'childcare', 'energy', 'health', 'education');

-- 4. Verify: should show 'grant' and 'benefit' rows
SELECT type, COUNT(*) AS total FROM grants GROUP BY type ORDER BY type;

-- 5. Spot-check a few known benefits
SELECT slug, category, subcategory, type FROM grants
WHERE slug IN (
  'snap-benefits', 'wic-nutrition-program',
  'social-security-disability-insurance', 'supplemental-security-income',
  'liheap-energy-assistance', 'hud-section-8-housing-choice-voucher',
  'child-care-development-fund', 'head-start-program',
  'federal-pell-grant', 'doe-weatherization-assistance-program'
)
ORDER BY slug;
