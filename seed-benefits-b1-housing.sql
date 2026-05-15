-- ============================================================
-- seed-benefits-b1-housing.sql  —  Housing Benefits (8 new)
-- Programs already in the DB (updated to type='benefit' by
-- seed-step1-type-column.sql) are intentionally omitted here:
--   hud-section-8-housing-choice-voucher, home-investment-partnerships-program,
--   emergency-solutions-grant-program, hud-continuum-of-care-program,
--   usda-section-502-direct-loan, emergency-rental-assistance
-- Run AFTER seed-step1-type-column.sql.
-- Skips duplicates via ON CONFLICT (slug) DO NOTHING.
-- ============================================================

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'HUD Public Housing',
  'U.S. Department of Housing and Urban Development',
  'individual',
  'housing',
  'benefit',
  'HUD''s Public Housing program provides safe, decent, and affordable rental housing for low-income families, the elderly, and persons with disabilities through local Public Housing Agencies (PHAs) that manage approximately one million housing units nationwide. Rent is typically capped at 30% of the household''s adjusted gross income, making it the most affordable option for very low-income households. Applications are submitted directly to the local PHA, and waiting lists are common due to high demand.',
  NULL,
  true,
  NULL,
  '["Must meet income limits (generally below 80% of Area Median Income; priority for below 30%)", "Must be a U.S. citizen or eligible non-citizen with qualifying immigration status", "Must pass a criminal background check", "Must not owe money to any housing authority", "Income limits vary by family size and metropolitan area"]'::jsonb,
  '["Government-issued photo ID for all adult household members", "Social Security cards or documentation for all household members", "Proof of income (pay stubs, benefit award letters, tax returns)", "Birth certificates for all household members", "Rental history and landlord references"]'::jsonb,
  'https://www.hud.gov/topics/rental_assistance/phprog',
  'https://www.hud.gov/topics/rental_assistance/phprog',
  '[]'::jsonb,
  NULL,
  'hud-public-housing'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'USDA Section 515 Rural Rental Housing',
  'U.S. Department of Agriculture',
  'individual',
  'housing',
  'benefit',
  'USDA''s Section 515 Rural Rental Housing program finances the construction, acquisition, and rehabilitation of affordable rental housing in rural communities for low- and moderate-income families, elderly residents, and persons with disabilities. Loans carry below-market interest rates of as low as 1%, significantly reducing rents for tenants who may also receive Section 8 assistance to lower their out-of-pocket costs further. Housing must be located in a rural area with a population of 35,000 or fewer.',
  NULL,
  true,
  NULL,
  '["Must reside in a rural area (generally population under 35,000)", "Must meet income limits (at or below 115% of Area Median Income)", "Must be a U.S. citizen or eligible non-citizen", "Elderly, persons with disabilities, and families with children given priority at many sites"]'::jsonb,
  '["Proof of income for all household members", "Government-issued photo ID", "Social Security numbers for all household members", "Rental application submitted to the property manager"]'::jsonb,
  'https://www.rd.usda.gov/programs-services/multi-family-housing/multi-family-housing-programs',
  'https://www.rd.usda.gov/programs-services/multi-family-housing/multi-family-housing-programs',
  '[]'::jsonb,
  NULL,
  'usda-section-515-rural-rental-housing'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'HUD Housing Counseling Assistance',
  'U.S. Department of Housing and Urban Development',
  'individual',
  'housing',
  'benefit',
  'HUD''s Housing Counseling Program funds a national network of approved nonprofit agencies to provide free or low-cost counseling on buying a home, renting, avoiding foreclosure, resolving homelessness, and improving financial literacy. Counselors help individuals understand their rights, navigate housing options, and develop sustainable household budgets. Services are available in multiple languages and are open to people of all income levels.',
  NULL,
  true,
  NULL,
  '["Open to all individuals and families regardless of income", "No prior housing experience required", "Available to renters, prospective homebuyers, current homeowners, and those experiencing homelessness", "Services accessible to non-English speakers through multilingual counselors"]'::jsonb,
  '["No standard documents required to begin counseling", "Financial documents (pay stubs, bank statements, mortgage statements) may be requested depending on the type of counseling needed"]'::jsonb,
  'https://www.hud.gov/program_offices/housing/sfh/hcc/fc',
  'https://www.hud.gov/program_offices/housing/sfh/hcc',
  '[]'::jsonb,
  NULL,
  'hud-housing-counseling-assistance'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Native American Housing Block Grants (IHBG)',
  'U.S. Department of Housing and Urban Development',
  'individual',
  'housing',
  'benefit',
  'The Indian Housing Block Grant (IHBG) program provides formula-based grants to federally recognized tribes and Tribally Designated Housing Entities (TDHEs) to develop, rehabilitate, and operate affordable housing for Native American residents on and near tribal lands. Funded activities include new construction, home repair, homeownership assistance, tenant-based rental assistance, and crime prevention. Each tribe determines its own program design within NAHASDA guidelines, so services and eligibility rules vary by tribal housing authority.',
  NULL,
  true,
  NULL,
  '["Must be a member of a federally recognized Indian tribe or Alaska Native village", "Must meet income limits (generally at or below 80% of Area Median Income)", "Must reside within or near the tribal housing service area", "Specific eligibility criteria are determined by each tribe or TDHE"]'::jsonb,
  '["Tribal enrollment documentation or Certificate of Degree of Indian Blood (CDIB)", "Proof of income for all household members", "Government-issued photo ID", "Housing application submitted to your Tribal Housing Authority"]'::jsonb,
  'https://www.hud.gov/program_offices/public_indian_housing/ih/grants/ihbg',
  'https://www.hud.gov/program_offices/public_indian_housing/ih/grants/ihbg',
  '[]'::jsonb,
  NULL,
  'native-american-housing-block-grants'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'HOPWA — Housing Opportunities for Persons With AIDS',
  'U.S. Department of Housing and Urban Development',
  'individual',
  'housing',
  'benefit',
  'HOPWA provides housing assistance and supportive services for people living with HIV/AIDS and their families who are at risk of homelessness or residing in substandard housing. Funded services include short-term rent and utility assistance, transitional housing, permanent supportive housing, and case management. Grants are awarded to states, cities, and nonprofit organizations that deliver services directly to clients across the country.',
  NULL,
  true,
  NULL,
  '["Must have a confirmed HIV/AIDS diagnosis", "Must meet low-income requirements (generally at or below 80% of Area Median Income)", "Must be at risk of homelessness or currently in unstable housing", "Household members and dependents of eligible individuals may also qualify"]'::jsonb,
  '["Medical documentation confirming HIV/AIDS diagnosis", "Proof of income for all household members", "Government-issued photo ID", "Documentation of housing instability or homelessness risk"]'::jsonb,
  'https://www.hud.gov/program_offices/comm_planning/hopwa',
  'https://www.hud.gov/program_offices/comm_planning/hopwa',
  '[]'::jsonb,
  NULL,
  'hopwa-housing-opportunities-hiv-aids'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'HUD-VASH — Veterans Affairs Supportive Housing',
  'U.S. Department of Housing and Urban Development / U.S. Department of Veterans Affairs',
  'individual',
  'housing',
  'benefit',
  'HUD-VASH combines HUD Housing Choice Voucher rental assistance with ongoing VA case management and clinical services to help homeless veterans achieve stable, permanent housing. Veterans use the voucher to lease private-market housing while VA social workers provide mental health treatment, substance abuse counseling, and employment support. It is the nation''s largest permanent supportive housing program for veterans and has helped house over 100,000 veterans since its inception.',
  NULL,
  true,
  NULL,
  '["Must be a veteran with an honorable or other-than-dishonorable discharge", "Must currently be homeless or at imminent risk of homelessness", "Must be eligible for VA health care services", "Must meet HCV income requirements (at or below 50% of Area Median Income)"]'::jsonb,
  '["DD-214 Certificate of Release or Discharge from Active Duty", "Government-issued photo ID", "Social Security card", "VA health care enrollment or eligibility documentation", "Proof of income"]'::jsonb,
  'https://www.va.gov/homeless/hud-vash.asp',
  'https://www.hud.gov/program_offices/public_indian_housing/programs/hcv/vash',
  '[]'::jsonb,
  NULL,
  'hud-vash-veterans-housing'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Good Neighbor Next Door',
  'U.S. Department of Housing and Urban Development',
  'individual',
  'housing',
  'benefit',
  'HUD''s Good Neighbor Next Door program offers law enforcement officers, firefighters, emergency medical technicians, and pre-K through 12th-grade teachers a 50% discount on the list price of eligible HUD-owned single-family homes located in designated revitalization areas. Buyers must commit to living in the purchased home as their sole residence for at least 36 months. Properties are listed weekly on the HUD Homestore website and must be purchased through a registered HUD-approved real estate agent.',
  NULL,
  true,
  NULL,
  '["Must be employed full-time as a law enforcement officer, firefighter, EMT, or K-12 teacher", "Must be employed by an agency serving the area where the property is located", "Must not have owned a primary residence in the 12 months prior to submitting an offer", "Must commit to occupying the home as sole residence for at least 36 months", "Must obtain financing or pay cash at the time of purchase"]'::jsonb,
  '["Proof of full-time employment in an eligible profession", "Government-issued photo ID", "Mortgage pre-approval or proof of cash financing", "HUD-approved real estate agent certification"]'::jsonb,
  'https://www.hud.gov/program_offices/housing/sfh/reo/goodn/gnndabot',
  'https://www.hud.gov/program_offices/housing/sfh/reo/goodn/gnndabot',
  '[]'::jsonb,
  NULL,
  'hud-good-neighbor-next-door'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Section 811 Supportive Housing for Persons with Disabilities',
  'U.S. Department of Housing and Urban Development',
  'individual',
  'housing',
  'benefit',
  'Section 811 funds nonprofit organizations to develop and operate affordable rental housing with supportive services for low-income adults with significant disabilities, enabling them to live independently in the community. The program provides project-based rental assistance and requires coordination with state Medicaid programs to deliver long-term supports and services such as personal care, transportation, and employment assistance. Referrals are typically made through state housing and Medicaid agencies.',
  NULL,
  true,
  NULL,
  '["Must be an adult (18 years or older) with a significant physical, developmental, or psychiatric disability", "Must meet very low-income limits (at or below 50% of Area Median Income)", "Must be a U.S. citizen or eligible non-citizen", "Must be referred through a state Medicaid agency or designated partner organization", "Must require supportive services to live independently"]'::jsonb,
  '["Documentation of disability from a licensed healthcare provider", "Proof of income for all household members", "Government-issued photo ID", "Social Security card", "Medicaid eligibility documentation or referral from state agency"]'::jsonb,
  'https://www.hud.gov/program_offices/housing/mfh/progdesc/disab811',
  'https://www.hud.gov/program_offices/housing/mfh/progdesc/disab811',
  '[]'::jsonb,
  NULL,
  'hud-section-811-supportive-housing'
) ON CONFLICT (slug) DO NOTHING;
