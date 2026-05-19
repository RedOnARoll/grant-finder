-- ============================================================
-- seed-batch-5-sbir.sql  —  Agency-specific SBIR/STTR grants (8)
-- Skipped (existing entries cover these):
--   DOE SBIR Phase I  → doe-small-business-clean-energy
--   DARPA SBIR        → darpa-research-grants
--   NIH SBIR Phase I  → nih-sbir-health
--   NIH SBIR Phase II → nih-sbir-health
-- Run in Supabase SQL editor. Skips duplicates via ON CONFLICT.
-- ============================================================

-- 1. NSF SBIR Phase I
INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'NSF SBIR Phase I',
  'National Science Foundation',
  'small_business',
  'research',
  'Funding for small businesses to explore the technical merit and feasibility of innovative ideas that have potential for commercialization. Awards support high-risk, high-reward R&D across all NSF-funded disciplines. At least 50% of the funded work must be performed by the small business.',
  275000,
  true,
  NULL,
  '{"max_employees": 500, "requires_us_ownership": true, "requires_us_business": true, "industries": ["technology", "science", "engineering", "health", "computing"]}'::jsonb,
  '[]'::jsonb,
  'https://seedfund.nsf.gov',
  'https://seedfund.nsf.gov',
  '[]'::jsonb,
  NULL,
  'nsf-sbir-phase-i'
) ON CONFLICT (slug) DO NOTHING;

-- 2. NSF SBIR Phase II
INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'NSF SBIR Phase II',
  'National Science Foundation',
  'small_business',
  'research',
  'Continued R&D funding for businesses that completed Phase I, focusing on full-scale research and commercialization potential. Phase II awards expand on the results of Phase I and fund up to two years of continued R&D.',
  1000000,
  true,
  NULL,
  '{"max_employees": 500, "requires_us_ownership": true, "requires_us_business": true, "requires_phase_1_completion": true, "industries": ["technology", "science", "engineering", "health", "computing"]}'::jsonb,
  '[]'::jsonb,
  'https://seedfund.nsf.gov',
  'https://seedfund.nsf.gov',
  '[]'::jsonb,
  NULL,
  'nsf-sbir-phase-ii'
) ON CONFLICT (slug) DO NOTHING;

-- 3. NSF STTR Phase I
INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'NSF STTR Phase I',
  'National Science Foundation',
  'small_business',
  'research',
  'Funds cooperative R&D projects between small businesses and nonprofit research institutions such as universities and federal labs. Requires a formal partnership agreement. At least 40% of work must be performed by the small business and at least 30% by the research partner.',
  275000,
  true,
  NULL,
  '{"max_employees": 500, "requires_us_business": true, "requires_research_partnership": true, "industries": ["technology", "science", "engineering", "health"]}'::jsonb,
  '[]'::jsonb,
  'https://seedfund.nsf.gov',
  'https://seedfund.nsf.gov',
  '[]'::jsonb,
  NULL,
  'nsf-sttr-phase-i'
) ON CONFLICT (slug) DO NOTHING;

-- 4. DOE SBIR Phase II
INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'DOE SBIR Phase II',
  'Department of Energy',
  'small_business',
  'energy',
  'Full-scale R&D funding for energy-focused small businesses that completed DOE SBIR Phase I. Awards fund up to two years of continued research to advance the technology toward commercial deployment. Applicants must have demonstrated satisfactory Phase I technical results.',
  1500000,
  true,
  NULL,
  '{"max_employees": 500, "requires_us_ownership": true, "requires_us_business": true, "requires_phase_1_completion": true, "industries": ["energy", "technology", "engineering", "science"]}'::jsonb,
  '[]'::jsonb,
  'https://science.osti.gov/sbir',
  'https://science.osti.gov/sbir',
  '[]'::jsonb,
  NULL,
  'doe-sbir-phase-ii'
) ON CONFLICT (slug) DO NOTHING;

-- 5. NIH STTR Phase I
INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'NIH STTR Phase I',
  'National Institutes of Health',
  'small_business',
  'research',
  'Supports collaborative biomedical R&D between small businesses and US nonprofit research institutions. Phase I awards fund feasibility research to establish the scientific and technical merit of the cooperative effort. At least 30% of work must be performed by the research partner.',
  400000,
  true,
  NULL,
  '{"max_employees": 500, "requires_us_business": true, "requires_research_partnership": true, "industries": ["health", "biotech", "science", "engineering"]}'::jsonb,
  '[]'::jsonb,
  'https://sbir.nih.gov',
  'https://sbir.nih.gov',
  '[]'::jsonb,
  NULL,
  'nih-sttr-phase-i'
) ON CONFLICT (slug) DO NOTHING;

-- 6. DOT SBIR
INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'DOT SBIR',
  'Department of Transportation',
  'small_business',
  'research',
  'Funds transportation-related R&D by small businesses with strong commercial potential. Topics cover safety, efficiency, and innovation across all transportation modes including road, rail, aviation, and maritime. Phase I awards test feasibility; Phase II awards fund full R&D.',
  200000,
  true,
  NULL,
  '{"max_employees": 500, "requires_us_business": true, "industries": ["transportation", "technology", "engineering"]}'::jsonb,
  '[]'::jsonb,
  'https://www.transportation.gov/sbir',
  'https://www.transportation.gov/sbir',
  '[]'::jsonb,
  NULL,
  'dot-sbir'
) ON CONFLICT (slug) DO NOTHING;

-- 7. EPA SBIR
INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'EPA SBIR',
  'Environmental Protection Agency',
  'small_business',
  'research',
  'Funds small businesses developing innovative environmental technologies and solutions. Topics include air and water quality, waste management, climate change, and sustainable chemistry. Phase I awards fund feasibility; Phase II funds full R&D and early commercialization.',
  200000,
  true,
  NULL,
  '{"max_employees": 500, "requires_us_ownership": true, "requires_us_business": true, "industries": ["environment", "cleantech", "technology", "science"]}'::jsonb,
  '[]'::jsonb,
  'https://www.epa.gov/sbir',
  'https://www.epa.gov/sbir',
  '[]'::jsonb,
  NULL,
  'epa-sbir'
) ON CONFLICT (slug) DO NOTHING;

-- 8. USDA SBIR
INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'USDA SBIR',
  'USDA National Institute of Food and Agriculture',
  'small_business',
  'research',
  'Funds small businesses conducting agricultural and food systems R&D with strong commercialization potential. Priority topics include food safety, sustainable agriculture, rural development, and agricultural biotechnology. Phase I awards fund feasibility studies.',
  175000,
  true,
  NULL,
  '{"max_employees": 500, "requires_us_business": true, "industries": ["agriculture", "food", "science", "technology"]}'::jsonb,
  '[]'::jsonb,
  'https://nifa.usda.gov/program/small-business-innovation-research-program',
  'https://nifa.usda.gov/program/small-business-innovation-research-program',
  '[]'::jsonb,
  NULL,
  'usda-sbir'
) ON CONFLICT (slug) DO NOTHING;
