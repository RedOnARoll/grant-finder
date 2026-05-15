-- ============================================================
-- seed-benefits-b6-energy.sql  —  Energy Benefits (3 new)
-- The following already exist and are updated to type='benefit'
-- by seed-step1-type-column.sql (no re-insert needed):
--   liheap-energy-assistance, doe-weatherization-assistance-program,
--   rural-energy-for-america-reap, doe-state-energy-program,
--   doe-energy-efficiency-conservation-block-grant,
--   doe-solar-for-all-program, ira-homes-rebate-program,
--   ira-heehra-rebate-program
-- Run AFTER seed-step1-type-column.sql.
-- Skips duplicates via ON CONFLICT (slug) DO NOTHING.
-- ============================================================

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'HUD Green and Resilient Retrofit Program',
  'U.S. Department of Housing and Urban Development',
  'individual',
  'energy',
  'benefit',
  'The Green and Resilient Retrofit Program (GRRP) provides grants and loans to owners of HUD-assisted multifamily housing to make energy efficiency improvements and climate resilience upgrades that benefit residents in affordable apartment communities. Funded improvements may include HVAC upgrades, insulation, roofing, solar installations, and infrastructure hardening against extreme weather events. Low-income residents in participating HUD-assisted buildings benefit directly through reduced utility costs and improved living conditions without bearing the upfront investment cost.',
  NULL,
  true,
  NULL,
  '["Must be a resident of a HUD-assisted multifamily housing property participating in the GRRP", "Building owners must apply — residents benefit indirectly through property improvements", "Priority for buildings in areas at high risk from climate events such as flooding, heat, or wind", "Applicable to properties with Section 8 Project-Based Rental Assistance, Section 202, Section 811, and other HUD multifamily programs"]'::jsonb,
  '["No application required from individual residents", "Building owners apply through HUD''s multifamily housing portal", "Residents should contact their property management to check if their building is participating"]'::jsonb,
  'https://www.hud.gov/GRRP',
  'https://www.hud.gov/GRRP',
  '[]'::jsonb,
  NULL,
  'hud-green-resilient-retrofit'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'USDA Electric Loan Program',
  'U.S. Department of Agriculture',
  'individual',
  'energy',
  'benefit',
  'The USDA Rural Utilities Service Electric Loan Program provides low-interest loans to rural electric cooperatives, public power districts, and other eligible borrowers to fund the construction, expansion, and improvement of electric distribution, transmission, and generation facilities in rural areas. By financing reliable, affordable electricity infrastructure in rural communities, the program reduces energy costs and improves quality of life for rural residents and businesses who are the end beneficiaries. Loans may also fund smart grid upgrades, distributed energy, and energy storage projects.',
  NULL,
  true,
  NULL,
  '["Must be a rural resident or business served by an eligible rural electric borrower (electric cooperative or public power district)", "Rural area: typically a community with a population under 20,000", "Direct benefits flow to rural utility customers through infrastructure improvements and rate stabilization", "Individual residents do not apply directly — contact your rural electric cooperative for service"]'::jsonb,
  '["No direct application for individual residents", "Rural electric cooperatives and utilities apply through RUS", "Contact your local electric cooperative for service inquiries"]'::jsonb,
  'https://www.rd.usda.gov/programs-services/electric-programs',
  'https://www.rd.usda.gov/programs-services/electric-programs',
  '[]'::jsonb,
  NULL,
  'usda-electric-loan-program'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Energy Audits for Low-Income Households',
  'U.S. Department of Energy / State Energy Offices',
  'individual',
  'energy',
  'benefit',
  'Free or low-cost home energy audits for low-income households are delivered through the Weatherization Assistance Program (WAP), LIHEAP Energy Crisis funding, and state and utility energy efficiency programs. A home energy audit identifies air leaks, insulation deficiencies, inefficient appliances, and heating and cooling problems — providing a prioritized list of improvements that can be addressed through weatherization and retrofit programs. Audit results are used to qualify homes for free energy efficiency upgrades under WAP and other assistance programs.',
  NULL,
  true,
  NULL,
  '["Must meet income eligibility for the Weatherization Assistance Program (at or below 200% of Federal Poverty Level)", "Priority given to households with elderly members, individuals with disabilities, or families with young children", "Homeowners and renters may qualify (renters require landlord permission for improvements)", "Must reside in a home eligible for weatherization (single-family, manufactured homes, and small multifamily buildings typically qualify)"]'::jsonb,
  '["Proof of household income for all members", "Government-issued photo ID", "Proof of residency (utility bill or lease agreement)", "Landlord written permission if renting", "Proof of homeownership if applicable"]'::jsonb,
  'https://www.energy.gov/eere/wap/weatherization-assistance-program',
  'https://www.energy.gov/eere/wap/weatherization-assistance-program',
  '[]'::jsonb,
  NULL,
  'energy-audits-low-income'
) ON CONFLICT (slug) DO NOTHING;
