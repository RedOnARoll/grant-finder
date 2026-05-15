-- ============================================================
-- seed-benefits-b5-childcare.sql  —  Childcare Benefits (9 new)
-- CCDF (child-care-development-fund) and Head Start (head-start-program)
-- already exist and are updated to type='benefit' by
-- seed-step1-type-column.sql — not re-inserted here.
-- Run AFTER seed-step1-type-column.sql.
-- Skips duplicates via ON CONFLICT (slug) DO NOTHING.
-- ============================================================

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Early Head Start',
  'U.S. Department of Health and Human Services',
  'individual',
  'childcare',
  'benefit',
  'Early Head Start provides comprehensive child development services — including health, nutrition, and social-emotional development — for low-income pregnant women, infants, and toddlers under age 3. Like Head Start, it is delivered by local grantee organizations including community action agencies, nonprofits, and school districts through both center-based and home visiting models. The program serves approximately 150,000 children and families annually and supports continuous care into Head Start at age 3.',
  NULL,
  true,
  NULL,
  '["Family income at or below 100% of the Federal Poverty Level", "Pregnant women and families with infants or toddlers under age 3", "Children in foster care may be enrolled regardless of family income", "Children with disabilities may be enrolled regardless of income (up to 10% of program enrollment)"]'::jsonb,
  '["Proof of family income (pay stubs, tax return, or benefit award letters)", "Child''s birth certificate or documentation of pregnancy", "Proof of address", "Child''s health and immunization records"]'::jsonb,
  'https://eclkc.ohs.acf.hhs.gov/center-locator',
  'https://eclkc.ohs.acf.hhs.gov/programs/article/early-head-start-programs',
  '[]'::jsonb,
  NULL,
  'early-head-start'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'CCAMPIS — Child Care Access Means Parents in School',
  'U.S. Department of Education',
  'individual',
  'childcare',
  'benefit',
  'CCAMPIS supports low-income student parents in postsecondary education by funding campus-based child care subsidies and services at participating colleges and universities. Institutions use CCAMPIS grants to reduce out-of-pocket child care costs for Pell Grant-eligible students, helping them remain enrolled and complete their degrees. Available services vary by institution and may include subsidized on-campus child care, partnerships with community providers, or child care resource and referral support.',
  NULL,
  true,
  NULL,
  '["Must be currently enrolled at a CCAMPIS-participating college or university", "Must be a Pell Grant recipient or otherwise demonstrate significant financial need", "Must have a dependent child requiring care", "Must be pursuing a degree, certificate, or other credential program"]'::jsonb,
  '["Enrollment verification at the participating institution", "FAFSA and Pell Grant award documentation", "Child''s birth certificate", "Child care provider enrollment documentation"]'::jsonb,
  'https://www2.ed.gov/programs/campisp/index.html',
  'https://www2.ed.gov/programs/campisp/index.html',
  '[]'::jsonb,
  NULL,
  'ccampis-campus-child-care'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'DoD Child Care Fee Assistance',
  'U.S. Department of Defense',
  'individual',
  'childcare',
  'benefit',
  'The DoD Child Care Fee Assistance program subsidizes off-installation child care costs for active duty service members when space at on-base child development centers is unavailable. Subsidies reduce the cost of licensed civilian child care for dependent children from birth through age 12, with the level of assistance based on total family income. The program is administered by the National Association of Child Care Resource and Referral Agencies (NACCRRA) under contract with DoD.',
  NULL,
  true,
  NULL,
  '["Must be an active duty service member or eligible DoD civilian employee", "Must have a dependent child between birth and 12 years of age requiring child care", "Must have documented unavailability of on-base child care space", "Subsidy amount is determined by total family income within the eligible population"]'::jsonb,
  '["Military ID card or DoD civilian employment documentation", "Documentation of on-base child care unavailability", "Child''s birth certificate", "Proof of enrollment with a licensed child care provider"]'::jsonb,
  'https://www.childcareaware.org/fee-assistancerespite/military-oconus/fee-assistance-programs/',
  'https://www.childcareaware.org/fee-assistancerespite/military-oconus/fee-assistance-programs/',
  '[]'::jsonb,
  NULL,
  'dod-child-care-fee-assistance'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'CCDF Tribal Child Care Grants',
  'U.S. Department of Health and Human Services',
  'individual',
  'childcare',
  'benefit',
  'CCDF Tribal grants provide child care funding directly to federally recognized Indian tribes and tribal organizations to expand access to affordable, high-quality child care for low-income families on and near tribal lands. Tribes design their own subsidy programs to reflect the cultural and geographic needs of their communities, and may also fund quality improvement activities at tribal child care centers and family child care homes. Approximately 260 tribal entities receive CCDF tribal grants annually.',
  NULL,
  true,
  NULL,
  '["Must be an enrolled member of, or reside in the service area of, a tribe with a CCDF tribal program", "Must meet the tribe''s income eligibility requirements (typically low-income)", "Child must be under 13 years of age (or under 19 with a qualifying disability)", "Parent or guardian must be working, attending school, or participating in job training", "Family must be unable to afford child care without assistance"]'::jsonb,
  '["Tribal enrollment documentation or proof of residence in tribal service area", "Proof of household income", "Child''s birth certificate", "Proof of employment, school enrollment, or training activity"]'::jsonb,
  'https://www.acf.hhs.gov/occ/tribal-child-care',
  'https://www.acf.hhs.gov/occ/tribal-child-care',
  '[]'::jsonb,
  NULL,
  'ccdf-tribal-grants'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Child and Dependent Care Tax Credit',
  'Internal Revenue Service, U.S. Department of the Treasury',
  'individual',
  'childcare',
  'benefit',
  'The Child and Dependent Care Tax Credit (CDCTC) is a federal tax credit for working taxpayers who pay for the care of a child under 13 or a disabled dependent so they can work or look for work. The credit equals 20–35% of qualifying care expenses up to $3,000 for one qualifying person or $6,000 for two or more, with the percentage decreasing as adjusted gross income rises. Qualifying expenses include payments to day care centers, after-school programs, babysitters, and summer day camps.',
  2100,
  true,
  NULL,
  '["Must have earned income from work or self-employment during the tax year", "Must have paid qualifying expenses for the care of a child under age 13 or a disabled spouse or dependent", "Care must enable you (and your spouse, if married filing jointly) to work or actively look for work", "Must file a federal income tax return (Form 1040)", "The care provider cannot be your spouse, the child''s parent, or a dependent you claim on your return"]'::jsonb,
  '["IRS Form 2441 (Child and Dependent Care Expenses)", "Social Security numbers for each qualifying person and care provider", "Care provider''s name, address, and Employer Identification Number (EIN) or SSN", "Records of care expenses paid throughout the year"]'::jsonb,
  'https://www.irs.gov/credits-deductions/individuals/child-and-dependent-care-credit-information',
  'https://www.irs.gov/credits-deductions/individuals/child-and-dependent-care-credit-information',
  '[]'::jsonb,
  NULL,
  'child-dependent-care-tax-credit'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  '21st Century Community Learning Centers',
  'U.S. Department of Education',
  'individual',
  'childcare',
  'benefit',
  '21st Century Community Learning Centers (21st CCLC) funds before-school, after-school, and summer learning programs that provide academic enrichment and safe environments for students attending low-performing schools in high-poverty communities. Programs offer tutoring, homework help, STEM enrichment, arts, and sports activities, and may include family engagement and adult literacy services for parents of participating students. States receive federal funds and competitively award them to local education agencies, nonprofits, and other community organizations.',
  NULL,
  true,
  NULL,
  '["Must be enrolled in a school served by a 21st CCLC-funded program", "Programs prioritize students attending low-performing schools in high-poverty neighborhoods", "Family members of participating students may access family engagement, literacy, and career development services", "Services available during non-school hours: before school, after school, and summer"]'::jsonb,
  '["No documentation typically required for individual student participation", "Program enrollment through the participating school or community organization"]'::jsonb,
  'https://www2.ed.gov/programs/21stcclc/index.html',
  'https://www2.ed.gov/programs/21stcclc/index.html',
  '[]'::jsonb,
  NULL,
  '21st-century-community-learning-centers'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Even Start Family Literacy',
  'U.S. Department of Education',
  'individual',
  'childcare',
  'benefit',
  'Even Start Family Literacy was a federally-funded program that integrated early childhood education, adult literacy, parenting skills, and interactive parent-child learning activities for low-income families with young children. Federal funding ended in 2011, but many states and localities continue similar integrated family literacy programs using state funds, TANF, Title I, and Adult Education dollars. Families seeking these combined services today should contact their local school district, community action agency, or Head Start program for available family literacy support.',
  NULL,
  true,
  NULL,
  '["Historically served low-income families with children from birth to age 8", "Required participation of both parent and child in all four program components", "Priority given to families with limited literacy skills or without a high school diploma", "Currently offered through state-funded programs and other federal streams in participating localities"]'::jsonb,
  '["Proof of family income", "Child''s birth certificate", "Contact local adult education provider or Head Start program for current availability"]'::jsonb,
  'https://www2.ed.gov/programs/evenstartformula/index.html',
  'https://www2.ed.gov/programs/evenstartformula/index.html',
  '[]'::jsonb,
  NULL,
  'even-start-family-literacy'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'TANF Child Care Assistance',
  'U.S. Department of Health and Human Services',
  'individual',
  'childcare',
  'benefit',
  'States use a portion of their Temporary Assistance for Needy Families (TANF) block grant funds to provide child care assistance to current TANF recipients and to low-income families transitioning off TANF, helping parents maintain employment. Unlike the Child Care and Development Fund, TANF child care assistance is not subject to federal child care regulations and eligibility criteria, so benefits, funding levels, and rules vary considerably by state. Some states transfer TANF funds to their CCDF program; others operate separate TANF-funded child care programs.',
  NULL,
  true,
  NULL,
  '["Must be a current TANF recipient or have recently left TANF for employment", "Must be low-income and meet state-specific income requirements", "Must have a dependent child requiring care", "Must be working, in job training, or in another activity required by the state TANF program", "Eligibility rules vary significantly by state"]'::jsonb,
  '["TANF case number or documentation of recent TANF participation", "Proof of employment, job training, or required TANF activity", "Child''s birth certificate", "Proof of income and household composition"]'::jsonb,
  'https://www.acf.hhs.gov/ofa/programs/tanf/about',
  'https://www.acf.hhs.gov/ofa/programs/tanf/about',
  '[]'::jsonb,
  NULL,
  'tanf-childcare-assistance'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Child Care Subsidies — Social Services Block Grant',
  'U.S. Department of Health and Human Services',
  'individual',
  'childcare',
  'benefit',
  'The Social Services Block Grant (SSBG) provides flexible federal funds to states that may be used, among many purposes, to fund child care services and child welfare programs for low-income families. States have wide discretion in how they use SSBG funds and are not required to report expenditure categories, so the availability of SSBG-funded child care subsidies varies considerably by state and locality. Families should contact their state or county social services agency to learn what SSBG-funded child care assistance may be available in their area.',
  NULL,
  true,
  NULL,
  '["Must meet state-defined eligibility requirements for SSBG-funded services", "Typically serves low-income families with dependent children requiring care", "State or county social services agency determines eligibility based on local program rules", "Income thresholds, documentation requirements, and services available vary by state"]'::jsonb,
  '["Proof of household income", "Child''s birth certificate", "Government-issued photo ID", "Documentation of child care need (varies by state program)"]'::jsonb,
  'https://www.acf.hhs.gov/ocs/programs/ssbg',
  'https://www.acf.hhs.gov/ocs/programs/ssbg',
  '[]'::jsonb,
  NULL,
  'child-care-social-services-block-grant'
) ON CONFLICT (slug) DO NOTHING;
