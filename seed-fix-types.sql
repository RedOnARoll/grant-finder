-- ═══════════════════════════════════════════════════════
-- FIX 1: Move competitive grants / scholarships / research
--         grants that were wrongly set to type='benefit'
-- ═══════════════════════════════════════════════════════

-- Private / competitive scholarships → individual grants
UPDATE grants SET type = 'grant', category = 'individual'
WHERE slug IN (
  'goldwater-scholarship',
  'gates-scholarship',
  'truman-scholarship',
  'hispanic-scholarship-fund-grant',
  'jack-kent-cooke-foundation-college-scholarship',
  'questbridge-national-college-match-scholarship',
  'thurgood-marshall-college-fund-scholarship',
  'paul-douglas-teacher-scholarship',
  'javits-fellowship',
  'americorps-education-award',
  'american-indian-college-fund-scholarship',
  'coca-cola-scholars-program',
  'dell-scholars-program'
);

-- Research & foundation health grants → research grants
UPDATE grants SET type = 'grant', category = 'research'
WHERE slug IN (
  'american-cancer-society-research-grants',
  'american-heart-association-innovative-project-award',
  'susan-g-komen-breast-cancer-research-grant',
  'wk-kellogg-health-equity-grant',
  'rwjf-health-policy-fellowship',
  'cdc-rural-health-grant',
  'arpa-e-energy-innovation-grants',
  'nih-kirschstein-research-award'
);

-- Small business / institutional energy grants → small_business grants
UPDATE grants SET type = 'grant', category = 'small_business'
WHERE slug IN (
  'doe-small-business-clean-energy',
  'doe-energy-efficiency-conservation-block-grant',
  'doe-state-energy-program',
  'epa-clean-school-bus-program',
  'nih-sbir-health',
  'hud-community-development-block-grant'
);

-- Agricultural energy grants → agricultural grants
UPDATE grants SET type = 'grant', category = 'agricultural'
WHERE slug IN (
  'rural-energy-for-america-reap',
  'usda-biorefinery-biobased-product-grant'
);

-- DOE Solar for All → small_business (competitive program for utilities/communities)
UPDATE grants SET type = 'grant', category = 'small_business'
WHERE slug = 'doe-solar-for-all-program';

-- ═══════════════════════════════════════════════════════
-- FIX 2: Move government assistance programs that were
--         left as type='grant' but are actually benefits
-- ═══════════════════════════════════════════════════════

UPDATE grants SET type = 'benefit', subcategory = 'food'
WHERE slug IN ('snap-benefits', 'wic-nutrition-program');

UPDATE grants SET type = 'benefit', subcategory = 'energy'
WHERE slug = 'liheap-energy-assistance';

UPDATE grants SET type = 'benefit', subcategory = 'childcare'
WHERE slug IN (
  'head-start-program',
  'child-care-development-fund',
  'tanf-cash-assistance'
);

-- ═══════════════════════════════════════════════════════
-- FIX 3: Remove exact duplicates
-- ═══════════════════════════════════════════════════════

-- Duplicate FSEOG (keep fseog-grant, remove the other)
DELETE FROM grants WHERE slug = 'federal-supplemental-educational-opportunity-grant';

-- Duplicate REAP (keep rural-energy-for-america-reap, remove the other)
DELETE FROM grants WHERE slug = 'usda-rural-energy-for-america-program';
