-- ============================================================
-- seed-batch-1.sql  —  Small Business (22) + Individual (20)
-- 42 grants total
-- Run in Supabase SQL editor. Skips duplicates via ON CONFLICT.
-- ============================================================

-- ── SMALL BUSINESS (22) ──────────────────────────────

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'SBIR Phase II Grant',
  'Small Business Administration',
  'small_business',
  'research',
  'SBIR Phase II builds on successful Phase I work, providing up to $1,000,000 to expand R&D scope and advance technology toward commercialization. Awards fund two-year projects and require demonstrated Phase I technical merit and a credible commercialization plan.',
  1000000,
  true,
  NULL,
  '{"max_employees": 500, "requires_us_ownership": true, "requires_phase_1_completion": true, "industries": ["technology", "science", "engineering", "health", "defense"]}'::jsonb,
  '["Phase I final report", "Technical proposal", "Commercialization plan", "Budget justification", "Company certifications", "Biographical sketches"]'::jsonb,
  'https://www.sbir.gov/apply',
  'https://www.sbir.gov',
  '[]'::jsonb,
  NULL,
  'sbir-phase-2-grant'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'STTR Phase I Grant',
  'Small Business Administration',
  'small_business',
  'research',
  'The Small Business Technology Transfer Phase I program funds cooperative R&D between small businesses and US nonprofit research institutions such as universities and federal labs. Awards of up to $150,000 support feasibility studies for innovative technology concepts. A formal collaboration agreement with the research partner is required.',
  150000,
  true,
  NULL,
  '{"max_employees": 500, "requires_us_ownership": true, "requires_research_partnership": true}'::jsonb,
  '["Technical proposal", "Research institution agreement", "Budget justification", "Biographical sketches", "Company registration documents"]'::jsonb,
  'https://www.sbir.gov/apply',
  'https://www.sbir.gov',
  '[]'::jsonb,
  NULL,
  'sttr-phase-1-grant'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'STTR Phase II Grant',
  'Small Business Administration',
  'small_business',
  'research',
  'STTR Phase II continues and expands Phase I R&D with up to $1,000,000 over two years to move the technology closer to commercial deployment. The required partnership with a US nonprofit research institution must be maintained throughout the award period. Businesses must have completed Phase I and demonstrated satisfactory technical results.',
  1000000,
  true,
  NULL,
  '{"max_employees": 500, "requires_us_ownership": true, "requires_phase_1_completion": true, "requires_research_partnership": true}'::jsonb,
  '["Phase I final report", "Technical proposal", "Commercialization plan", "Research institution agreement", "Budget justification", "Company certifications"]'::jsonb,
  'https://www.sbir.gov/apply',
  'https://www.sbir.gov',
  '[]'::jsonb,
  NULL,
  'sttr-phase-2-grant'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'SBA Community Advantage Loans',
  'Small Business Administration',
  'small_business',
  'lending',
  'Community Advantage gives mission-based lenders—CDFIs and approved nonprofits—access to SBA loan guarantees to serve small businesses in underserved markets. Loans up to $350,000 provide affordable capital to entrepreneurs in low-income areas, rural communities, and underserved populations who lack traditional financing options.',
  350000,
  true,
  NULL,
  '{"max_employees": 500, "requires_us_business": true, "requires_underserved_market": true}'::jsonb,
  '["Business plan", "Financial statements (2 years)", "Tax returns (3 years)", "Business licenses", "Personal financial statement", "SBA borrower information form"]'::jsonb,
  'https://www.sba.gov/funding-programs/loans/community-advantage-loans',
  'https://www.sba.gov',
  '[]'::jsonb,
  NULL,
  'sba-community-advantage-loans'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Economic Development Administration Grants',
  'Economic Development Administration',
  'small_business',
  'economic_development',
  'EDA grants fund infrastructure, planning, and technical assistance projects that create and retain jobs and attract private investment in economically distressed communities. Awards support a wide range of projects from industrial parks to broadband infrastructure. Eligible applicants include states, cities, counties, and nonprofits in qualifying distressed areas.',
  3000000,
  true,
  NULL,
  '{"requires_distressed_area": true, "eligible_applicants": ["local_government", "state_government", "nonprofit", "economic_development_district"]}'::jsonb,
  '["Application narrative", "Economic impact analysis", "Letters of support", "Financial statements", "NEPA documentation", "Budget detail", "Match documentation"]'::jsonb,
  'https://www.eda.gov/funding/programs',
  'https://www.eda.gov',
  '[]'::jsonb,
  NULL,
  'eda-economic-development-grants'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'CDFI Fund Technical Assistance Grants',
  'U.S. Department of the Treasury',
  'small_business',
  'community_development',
  'The CDFI Fund Technical Assistance component helps Community Development Financial Institutions build organizational capacity to better serve low-income communities. Grants fund staff training, technology upgrades, strategic planning, and new product development to strengthen CDFI operations and mission impact.',
  125000,
  true,
  NULL,
  '{"requires_cdfi_certification": true, "requires_low_income_service": true}'::jsonb,
  '["CDFI certification documents", "Strategic plan", "Financial statements (3 years)", "Narrative application", "Board resolution", "Tax-exempt status documentation"]'::jsonb,
  'https://www.cdfifund.gov/programs-training/programs/cdfi-program',
  'https://www.cdfifund.gov',
  '[]'::jsonb,
  NULL,
  'cdfi-technical-assistance-grants'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'State Trade Expansion Program (STEP)',
  'Small Business Administration',
  'small_business',
  'export',
  'STEP grants reimburse small businesses for eligible export promotion expenses including international trade show participation, website translation, foreign market sales trips, and export training. Applications are submitted through the state economic development agency, which administers reimbursements to qualifying businesses.',
  15000,
  true,
  NULL,
  '{"max_employees": 500, "requires_us_business": true, "requires_export_intent": true, "max_revenue": 19000000}'::jsonb,
  '["Business registration", "Export marketing plan", "Receipts for eligible export expenses", "Certification of eligibility", "Tax returns"]'::jsonb,
  'https://www.sba.gov/funding-programs/grants/state-trade-expansion-program-step',
  'https://www.sba.gov',
  '[]'::jsonb,
  NULL,
  'step-export-assistance'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'SBA 8(a) Business Development Program',
  'Small Business Administration',
  'small_business',
  'contracting',
  'The 8(a) program helps small businesses owned by socially and economically disadvantaged individuals compete for federal contracts through set-asides and sole-source awards up to $4 million. Participants receive nine years of business development assistance including mentorship, training, and access to specialized contracting vehicles.',
  0,
  true,
  NULL,
  '{"requires_disadvantaged_status": true, "max_employees": 500, "requires_us_ownership": true, "min_ownership_percent": 51}'::jsonb,
  '["SBA Form 1010", "Business financial statements", "Personal financial statements", "Tax returns (3 years)", "Social disadvantage narrative", "Business plan"]'::jsonb,
  'https://www.sba.gov/federal-contracting/contracting-assistance-programs/8a-business-development-program',
  'https://www.sba.gov',
  '[]'::jsonb,
  NULL,
  'sba-8a-business-development'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Opportunity Zone Business Investment',
  'U.S. Department of the Treasury',
  'small_business',
  'investment',
  'Opportunity Zone tax incentives allow investors to defer and reduce capital gains taxes by investing in Qualified Opportunity Funds that finance businesses in designated economically distressed communities. Businesses in Opportunity Zones benefit from increased access to patient capital flowing into their communities through QOF investment.',
  0,
  true,
  NULL,
  '{"requires_opportunity_zone_location": true, "requires_us_business": true, "requires_active_business_income": true}'::jsonb,
  '["IRS Form 8996", "Business registration", "Opportunity Zone location documentation", "Financial projections", "Business plan"]'::jsonb,
  'https://www.irs.gov/credits-deductions/opportunity-zones',
  'https://www.irs.gov/credits-deductions/opportunity-zones',
  '[]'::jsonb,
  NULL,
  'opportunity-zone-business-investment'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Rural Microentrepreneur Assistance Program',
  'USDA Rural Development',
  'small_business',
  'rural',
  'RMAP provides grants and technical assistance to microenterprise development organizations that support rural entrepreneurs with up to 10 employees. Eligible organizations use funds to deliver microloans, business training, and one-on-one coaching to rural small business owners and startups.',
  50000,
  true,
  NULL,
  '{"requires_rural": true, "max_employees": 10, "requires_us_business": true}'::jsonb,
  '["Organizational application", "Financial statements", "Microloan portfolio documentation", "Technical assistance plan", "Rural area certification", "Match documentation"]'::jsonb,
  'https://www.rd.usda.gov/programs-services/business-programs/rural-microentrepreneur-assistance-program',
  'https://www.rd.usda.gov',
  '[]'::jsonb,
  NULL,
  'rural-microentrepreneur-assistance'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Native American Business Development Institute Grants',
  'Bureau of Indian Affairs',
  'small_business',
  'minority',
  'BIA grants support Native American entrepreneurs and tribal businesses with feasibility studies, business planning, technical assistance, and startup capital. Funds help tribal members develop sustainable enterprises that create jobs and economic opportunity in American Indian and Alaska Native communities.',
  100000,
  true,
  NULL,
  '{"requires_native_american": true, "requires_tribal_affiliation": true}'::jsonb,
  '["Tribal enrollment documentation", "Business plan", "Financial statements", "Project narrative", "Tribal government letter of support"]'::jsonb,
  'https://www.bia.gov/bia/ois/dbic',
  'https://www.bia.gov',
  '[]'::jsonb,
  NULL,
  'native-american-business-development'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Small Business Innovation in Clean Energy (DOE SBIR)',
  'U.S. Department of Energy',
  'small_business',
  'energy',
  'DOE''s SBIR program provides Phase I and Phase II awards to small businesses developing innovative clean energy technologies including solar, wind, battery storage, and energy efficiency solutions. Awards fund high-risk R&D with strong commercial potential and require the primary researcher to be employed by the small business.',
  200000,
  true,
  NULL,
  '{"max_employees": 500, "requires_us_ownership": true, "industries": ["energy", "technology", "engineering", "science"]}'::jsonb,
  '["Technical proposal", "Budget justification", "Biographical sketches", "Company certifications", "Letters of support from potential customers"]'::jsonb,
  'https://www.energy.gov/eere/funding-opportunities',
  'https://www.energy.gov',
  '[]'::jsonb,
  NULL,
  'doe-small-business-clean-energy'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Export-Import Bank Small Business Program',
  'Export-Import Bank of the United States',
  'small_business',
  'export',
  'EXIM Bank''s small business programs offer working capital guarantees, export credit insurance, and buyer financing to reduce the financial risk of international sales. These tools help US small businesses access capital against export receivables and offer competitive financing terms to foreign buyers.',
  0,
  true,
  NULL,
  '{"requires_us_exporter": true, "max_employees": 500, "requires_us_business": true, "requires_us_content": true}'::jsonb,
  '["Export contract or purchase order", "Business financial statements", "Tax returns (2 years)", "EXIM application form", "Export compliance certification"]'::jsonb,
  'https://www.exim.gov/what-we-do/small-business',
  'https://www.exim.gov',
  '[]'::jsonb,
  NULL,
  'exim-small-business-program'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Small Business Environmental Assistance Program',
  'Environmental Protection Agency',
  'small_business',
  'environmental',
  'EPA''s Small Business Environmental Assistance Program provides free, confidential compliance assistance to help small businesses navigate air quality, water discharge, hazardous waste, and other environmental regulations. Technical experts help businesses achieve compliance without incurring regulatory penalties or costly violations.',
  50000,
  true,
  NULL,
  '{"max_employees": 500, "requires_us_business": true}'::jsonb,
  '["Business registration", "Description of operations and processes", "Current permits or compliance documentation"]'::jsonb,
  'https://www.epa.gov/assistance/environmental-assistance-and-small-business',
  'https://www.epa.gov',
  '[]'::jsonb,
  NULL,
  'small-business-environmental-assistance'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'DOT Disadvantaged Business Enterprise Program',
  'U.S. Department of Transportation',
  'small_business',
  'transportation',
  'DOT''s Disadvantaged Business Enterprise program provides contracting opportunities and technical assistance to small businesses owned by socially and economically disadvantaged individuals in federally funded transportation projects. Certified DBEs receive bid preference and set-aside opportunities on highway, transit, and aviation contracts.',
  0,
  true,
  NULL,
  '{"max_employees": 500, "requires_transportation_industry": true, "requires_disadvantaged_status": true, "requires_us_business": true}'::jsonb,
  '["DBE certification application", "Business financial statements", "Personal net worth statement", "Business licenses", "Tax returns (3 years)"]'::jsonb,
  'https://www.transportation.gov/civil-rights/disadvantaged-business-enterprise',
  'https://www.transportation.gov',
  '[]'::jsonb,
  NULL,
  'dot-disadvantaged-business-enterprise'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Manufacturing Extension Partnership Grants',
  'National Institute of Standards and Technology',
  'small_business',
  'manufacturing',
  'MEP provides matching grants to establish and operate regional centers that deliver hands-on technical assistance to small and medium-sized manufacturers. Centers offer lean manufacturing, process improvement, workforce development, technology adoption, and supply chain services. Grant recipients must provide matching funds and serve manufacturers in a designated geographic territory.',
  300000,
  true,
  NULL,
  '{"requires_manufacturing_focus": true, "requires_us_organization": true, "max_employees": 500}'::jsonb,
  '["MEP center application", "Organizational capability statement", "Manufacturing services plan", "Financial statements", "Letters of commitment", "Matching funds documentation"]'::jsonb,
  'https://www.nist.gov/mep',
  'https://www.nist.gov/mep',
  '[]'::jsonb,
  NULL,
  'manufacturing-extension-partnership'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Good Jobs Challenge Grant',
  'Economic Development Administration',
  'small_business',
  'workforce',
  'The Good Jobs Challenge funds industry-led workforce training systems that connect workers to high-quality jobs in high-demand sectors such as manufacturing, technology, healthcare, and clean energy. Grants support sector-based partnerships including employers, training providers, workforce boards, and community organizations. Priority is given to projects placing workers from underserved communities.',
  25000000,
  false,
  NULL,
  '{"requires_industry_partnership": true, "requires_employer_commitment": true, "requires_us_organization": true}'::jsonb,
  '["Application narrative", "Industry partnership documentation", "Employer commitment letters", "Budget justification", "Workforce data and labor market analysis", "Equity plan"]'::jsonb,
  'https://www.eda.gov/funding/programs/good-jobs-challenge',
  'https://www.eda.gov',
  '[]'::jsonb,
  NULL,
  'good-jobs-challenge-grant'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Community Navigator Pilot Program',
  'Small Business Administration',
  'small_business',
  'outreach',
  'The Community Navigator Pilot Program funds trusted community organizations to provide culturally tailored outreach and business development services to underserved entrepreneurs. Navigators act as trusted intermediaries connecting small businesses to SBA resources, capital, federal programs, and technical assistance while removing systemic barriers.',
  1000000,
  false,
  NULL,
  '{"requires_underserved_community_focus": true, "requires_us_nonprofit_or_organization": true}'::jsonb,
  '["Application narrative", "Organizational capability statement", "Community needs assessment", "Partnership agreements", "Financial statements", "Board resolution"]'::jsonb,
  'https://www.sba.gov/funding-programs/grants/community-navigator-pilot-program',
  'https://www.sba.gov',
  '[]'::jsonb,
  NULL,
  'community-navigator-pilot'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Small Business Debt Relief Program',
  'Small Business Administration',
  'small_business',
  'debt_relief',
  'The SBA Debt Relief Program covered principal, interest, and fee payments on behalf of qualifying small businesses with existing SBA loans during the COVID-19 pandemic. Relief was automatic for eligible borrowers with active SBA 7(a), 504, or microloans in good standing at the time of program implementation.',
  10000,
  false,
  NULL,
  '{"requires_existing_sba_loan": true, "requires_us_business": true, "loan_types": ["7a", "504", "microloan"]}'::jsonb,
  '["SBA loan account number", "Business registration", "Financial statements", "Proof of active loan in good standing"]'::jsonb,
  'https://www.sba.gov/funding-programs/loans/covid-19-relief-options',
  'https://www.sba.gov',
  '[]'::jsonb,
  NULL,
  'sba-small-business-debt-relief'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Distressed Capital Access Program',
  'U.S. Department of the Treasury',
  'small_business',
  'capital',
  'DCAP channels affordable capital to small businesses in low and moderate income communities and distressed areas through Community Development Financial Institutions. The program addresses gaps in conventional small business lending by providing grants and flexible loan products to entrepreneurs who lack access to mainstream credit.',
  100000,
  true,
  NULL,
  '{"requires_lmi_community": true, "max_employees": 500, "requires_us_business": true}'::jsonb,
  '["Business plan", "Financial statements", "Tax returns (2 years)", "Community location documentation", "Personal financial statement"]'::jsonb,
  'https://www.cdfifund.gov',
  'https://www.cdfifund.gov',
  '[]'::jsonb,
  NULL,
  'distressed-capital-access-program'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'HUBZone Program',
  'Small Business Administration',
  'small_business',
  'contracting',
  'The HUBZone program stimulates economic development in historically underutilized business zones by giving certified small businesses a 10% price evaluation preference in competitive federal contract bidding. Certified companies are eligible for set-aside contracts and sole-source awards, and must maintain their principal office in a designated HUBZone with at least 35% of staff residing in HUBZone areas.',
  0,
  true,
  NULL,
  '{"requires_hubzone_principal_office": true, "min_hubzone_employee_percent": 35, "max_employees": 500, "requires_us_ownership": true}'::jsonb,
  '["SBA HUBZone certification application", "Business registration", "Employee residence documentation", "Principal office lease or deed", "Financial statements", "Tax returns (2 years)"]'::jsonb,
  'https://www.sba.gov/federal-contracting/contracting-assistance-programs/hubzone-program',
  'https://www.sba.gov',
  '[]'::jsonb,
  NULL,
  'hubzone-program'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Main Street Lending Program',
  'Federal Reserve',
  'small_business',
  'lending',
  'The Main Street Lending Program provided accessible credit to small and medium-sized US businesses and nonprofits impacted by the COVID-19 pandemic through participating lenders. Loans helped businesses maintain payroll, operations, and debt service during economic disruption. Eligible borrowers must have been operating before March 2020 and meet revenue and employee size thresholds.',
  300000,
  false,
  NULL,
  '{"requires_us_business": true, "max_employees": 15000, "max_revenue": 5000000000, "requires_pre_pandemic_operations": true}'::jsonb,
  '["Business financial statements", "Tax returns (2 years)", "Payroll documentation", "Business registration", "Borrower certifications", "Lender application"]'::jsonb,
  'https://www.federalreserve.gov/monetarypolicy/mainstreetlending.htm',
  'https://www.federalreserve.gov',
  '[]'::jsonb,
  NULL,
  'main-street-lending-program'
) ON CONFLICT (slug) DO NOTHING;

-- ── INDIVIDUAL (20) ─────────────────────────────────

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Federal Supplemental Educational Opportunity Grant (FSEOG)',
  'U.S. Department of Education',
  'individual',
  'education',
  'FSEOG provides supplemental grant funding to undergraduate students with exceptional financial need, prioritizing Federal Pell Grant recipients with the lowest Expected Family Contributions. Awards range from $100 to $4,000 per year and do not require repayment. Students must be enrolled at a participating institution and complete the FAFSA.',
  4000,
  true,
  NULL,
  '{"requires_student": true, "requires_us_citizen": true, "education_level": "undergraduate", "requires_exceptional_financial_need": true}'::jsonb,
  '["FAFSA", "Enrollment verification", "Student ID", "Financial aid application"]'::jsonb,
  'https://studentaid.gov/understand-aid/types/grants/fseog',
  'https://studentaid.gov',
  '[]'::jsonb,
  NULL,
  'fseog-grant'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'TEACH Grant',
  'U.S. Department of Education',
  'individual',
  'education',
  'The Teacher Education Assistance for College and Higher Education Grant provides up to $4,000 per year to students preparing to teach in high-need subject areas at low-income elementary or secondary schools. Recipients sign an Agreement to Serve committing to four years of full-time teaching within eight years of program completion. Failure to complete the service obligation converts the grant to an unsubsidized loan.',
  4000,
  true,
  NULL,
  '{"requires_student": true, "requires_us_citizen": true, "education_level": "undergraduate", "requires_teaching_commitment": true, "min_gpa": 3.25}'::jsonb,
  '["FAFSA", "TEACH Grant counseling completion certificate", "Agreement to Serve", "Enrollment in qualifying teacher preparation program"]'::jsonb,
  'https://studentaid.gov/understand-aid/types/grants/teach',
  'https://studentaid.gov',
  '[]'::jsonb,
  NULL,
  'teach-grant'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Iraq and Afghanistan Service Grant',
  'U.S. Department of Education',
  'individual',
  'military',
  'This grant assists college students whose parent or guardian died as a result of military service in Iraq or Afghanistan after September 11, 2001. The award equals the maximum Federal Pell Grant for the applicable year even if the student does not otherwise qualify for Pell. Applicants must be under 24 years old or enrolled at least part-time when their parent or guardian died.',
  7395,
  true,
  NULL,
  '{"requires_student": true, "requires_us_citizen": true, "requires_military_parent_death": true, "max_age": 24}'::jsonb,
  '["FAFSA", "Death certificate", "Military service documentation", "Enrollment verification", "Birth certificate or legal guardianship documentation"]'::jsonb,
  'https://studentaid.gov/understand-aid/types/grants/iraq-afghanistan-service',
  'https://studentaid.gov',
  '[]'::jsonb,
  NULL,
  'iraq-afghanistan-service-grant'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'USDA Single Family Housing Repair Grant',
  'USDA Rural Development',
  'individual',
  'housing',
  'The Section 504 Home Repair Grant helps very low-income rural homeowners aged 62 and older remove health and safety hazards or make accessibility modifications to their homes. Grants up to $10,000 cover repairs such as roof replacement, heating system fixes, plumbing, electrical upgrades, and disability-related modifications. Recipients must own and occupy the property and be unable to afford a repair loan.',
  10000,
  true,
  NULL,
  '{"requires_us_resident": true, "min_age": 62, "requires_rural": true, "requires_homeowner": true, "max_household_income_percent_poverty": 50}'::jsonb,
  '["Proof of age (62+)", "Proof of property ownership", "Income documentation", "Rural area verification", "Description of needed repairs", "Title search"]'::jsonb,
  'https://www.rd.usda.gov/programs-services/single-family-housing-programs/single-family-housing-repair-loans-grants',
  'https://www.rd.usda.gov',
  '[]'::jsonb,
  NULL,
  'usda-housing-repair-grant'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Emergency Rental Assistance Program',
  'U.S. Department of the Treasury',
  'individual',
  'housing',
  'ERAP provides financial assistance to low-income renters experiencing hardship due to the COVID-19 pandemic to prevent eviction and housing instability. Funds cover up to 18 months of past-due and prospective rent, utilities, and other qualifying housing costs. Eligible households must earn at or below 80% of area median income and demonstrate COVID-related financial hardship.',
  15000,
  false,
  NULL,
  '{"requires_us_resident": true, "max_household_income_percent_ami": 80, "requires_rental_housing": true, "requires_covid_hardship": true}'::jsonb,
  '["Proof of identity", "Lease agreement", "Proof of income", "Utility bills", "Documentation of COVID-related hardship", "Proof of housing instability or eviction risk"]'::jsonb,
  'https://home.treasury.gov/policy-issues/coronavirus/assistance-for-state-local-and-tribal-governments/emergency-rental-assistance-program',
  'https://home.treasury.gov',
  '[]'::jsonb,
  NULL,
  'emergency-rental-assistance'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Social Security Disability Insurance (SSDI)',
  'Social Security Administration',
  'individual',
  'disability',
  'SSDI provides monthly income replacement to workers who become disabled and can no longer engage in substantial gainful activity due to a medically determinable impairment. Benefit amounts are based on lifetime earnings and Social Security contributions. Applicants must have sufficient work credits and a qualifying disability expected to last at least 12 months or result in death.',
  43524,
  true,
  NULL,
  '{"requires_disability": true, "requires_work_credits": true, "requires_us_citizen": true}'::jsonb,
  '["SSA Form SSA-16-BK", "Medical records", "Work history documentation", "Birth certificate", "W-2 forms or self-employment tax returns"]'::jsonb,
  'https://www.ssa.gov/benefits/disability/apply.html',
  'https://www.ssa.gov',
  '[]'::jsonb,
  NULL,
  'social-security-disability-insurance'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Supplemental Security Income (SSI)',
  'Social Security Administration',
  'individual',
  'disability',
  'SSI provides monthly cash assistance to elderly, blind, or disabled individuals with very limited income and resources to help cover basic needs such as food, clothing, and shelter. Benefit amounts are determined by the federal benefit rate minus countable income. Eligibility is based on financial need rather than work history, with strict income and asset limits.',
  10968,
  true,
  NULL,
  '{"requires_disability_or_age": true, "max_household_income": 9000, "requires_us_citizen": true, "max_assets": 2000}'::jsonb,
  '["SSA Form SSA-8000", "Proof of identity", "Birth certificate", "Proof of income and resources", "Medical records (if disability-based)", "Proof of living arrangements"]'::jsonb,
  'https://www.ssa.gov/benefits/ssi/apply.html',
  'https://www.ssa.gov',
  '[]'::jsonb,
  NULL,
  'supplemental-security-income'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Temporary Assistance for Needy Families (TANF)',
  'U.S. Department of Health and Human Services',
  'individual',
  'family',
  'TANF provides time-limited cash assistance and supportive services to low-income families with children through state-administered programs funded by federal block grants. States have flexibility to design their programs within federal guidelines, creating variation in benefit levels across states. Benefits are limited to a 60-month lifetime maximum and typically require participation in work activities.',
  0,
  true,
  NULL,
  '{"requires_children": true, "requires_us_citizen": true, "max_household_income": 24000, "requires_us_resident": true}'::jsonb,
  '["State application form", "Proof of identity", "Birth certificates for children", "Proof of income", "Proof of residency", "Social Security cards"]'::jsonb,
  'https://www.acf.hhs.gov/ofa/programs/tanf',
  'https://www.acf.hhs.gov',
  '[]'::jsonb,
  NULL,
  'tanf-cash-assistance'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Head Start Program',
  'U.S. Department of Health and Human Services',
  'individual',
  'early_childhood',
  'Head Start provides comprehensive early childhood education, health screening, nutrition, and family engagement services to children from birth to age five from low-income families at no cost. The program builds the social, emotional, and cognitive foundations children need to succeed in school and life. Enrollment prioritizes families with incomes at or below the federal poverty level.',
  0,
  true,
  NULL,
  '{"requires_children": true, "max_age": 5, "max_household_income_percent_poverty": 100, "requires_us_resident": true}'::jsonb,
  '["Enrollment application", "Proof of income", "Birth certificate", "Immunization records", "Proof of residency"]'::jsonb,
  'https://www.acf.hhs.gov/ohs/about/head-start',
  'https://www.acf.hhs.gov',
  '[]'::jsonb,
  NULL,
  'head-start-program'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Child Care and Development Fund (CCDF)',
  'U.S. Department of Health and Human Services',
  'individual',
  'family',
  'CCDF provides childcare subsidies to low-income working families to help cover the cost of quality care for children up to age 13, or up to age 19 for children with special needs. Families typically pay an income-based copayment while the subsidy covers the balance. Parents must be working, in school, or in job training.',
  0,
  true,
  NULL,
  '{"requires_children": true, "max_child_age": 13, "requires_working_parent": true, "max_household_income_percent_poverty": 200, "requires_us_resident": true}'::jsonb,
  '["State application form", "Proof of income", "Proof of employment or school enrollment", "Child birth certificate", "Proof of residency"]'::jsonb,
  'https://www.childcare.gov',
  'https://www.acf.hhs.gov/occ',
  '[]'::jsonb,
  NULL,
  'child-care-development-fund'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'WIC Nutrition Program',
  'USDA Food and Nutrition Service',
  'individual',
  'nutrition',
  'WIC provides monthly food benefits, nutrition education, breastfeeding support, and healthcare referrals to low-income pregnant, postpartum, and breastfeeding women and children under five at nutritional risk. Participants receive electronic benefits redeemable for specific healthy foods at authorized retailers. Eligibility requires income at or below 185% of the federal poverty level.',
  0,
  true,
  NULL,
  '{"requires_us_resident": true, "max_household_income_percent_poverty": 185, "requires_nutritional_risk": true}'::jsonb,
  '["Proof of identity", "Proof of residency", "Proof of income", "Medical or self-certification of nutritional risk"]'::jsonb,
  'https://www.fns.usda.gov/wic/wic-how-apply',
  'https://www.fns.usda.gov/wic',
  '[]'::jsonb,
  NULL,
  'wic-nutrition-program'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'AmeriCorps Segal Education Award',
  'AmeriCorps',
  'individual',
  'education',
  'AmeriCorps members who complete a qualified term of national service earn a Segal Education Award of up to $7,395 to pay tuition and fees or repay qualified student loans at accredited institutions. Full-time members serving one year earn the maximum award, while part-time members earn proportionally smaller amounts. The award must be used within seven years of completing service.',
  7395,
  true,
  NULL,
  '{"requires_americorps_service": true, "requires_us_citizen": true, "min_age": 17}'::jsonb,
  '["AmeriCorps service completion documentation", "My AmeriCorps portal enrollment", "Institution enrollment or student loan documentation"]'::jsonb,
  'https://americorps.gov/members-volunteers/segal-americorps-education-award',
  'https://americorps.gov',
  '[]'::jsonb,
  NULL,
  'americorps-education-award'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'National Health Service Corps Scholarship Program',
  'Health Resources and Services Administration',
  'individual',
  'health',
  'The NHSC Scholarship Program pays full tuition, required fees, and a monthly living stipend for health professions students who commit to serving in Health Professional Shortage Areas. Scholars provide one year of full-time clinical service for each year of support received, with a minimum two-year commitment. Eligible disciplines include primary care medicine, dentistry, nursing, and behavioral health.',
  0,
  true,
  NULL,
  '{"requires_student": true, "requires_us_citizen": true, "requires_health_professions_enrollment": true, "requires_service_commitment": true}'::jsonb,
  '["NHSC application", "Enrollment verification", "Academic transcripts", "Letters of recommendation", "Personal statement", "CV or resume"]'::jsonb,
  'https://nhsc.hrsa.gov/scholarships',
  'https://nhsc.hrsa.gov',
  '[]'::jsonb,
  NULL,
  'nhsc-scholarship'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Harry S. Truman Scholarship',
  'Harry S. Truman Scholarship Foundation',
  'individual',
  'education',
  'The Truman Scholarship supports outstanding college juniors committed to careers in public service leadership with up to $30,000 for graduate school expenses. Recipients demonstrate exceptional leadership potential, academic achievement, and dedication to careers in government, nonprofit, or advocacy. Applicants must be nominated by their college or university.',
  30000,
  false,
  NULL,
  '{"requires_student": true, "requires_us_citizen": true, "education_level": "junior", "requires_public_service_commitment": true, "min_gpa": 3.0}'::jsonb,
  '["Institutional nomination", "Application essays", "Academic transcripts", "Three letters of recommendation", "Policy proposal"]'::jsonb,
  'https://www.truman.gov/candidates/applying-for-the-truman-scholarship',
  'https://www.truman.gov',
  '[]'::jsonb,
  NULL,
  'truman-scholarship'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Barry Goldwater Scholarship',
  'Barry Goldwater Scholarship and Excellence in Education Foundation',
  'individual',
  'education',
  'The Goldwater Scholarship supports outstanding sophomore and junior undergraduates pursuing research careers in mathematics, natural sciences, or engineering. Awards of up to $7,500 per year cover tuition, fees, books, and room and board. Applicants must be nominated by their institution and demonstrate exceptional research potential and a B+ or higher GPA.',
  7500,
  false,
  NULL,
  '{"requires_student": true, "requires_us_citizen": true, "education_level": "sophomore_or_junior", "min_gpa": 3.3, "industries": ["mathematics", "science", "engineering"]}'::jsonb,
  '["Institutional nomination", "Research essays", "Academic transcripts", "Faculty letters of recommendation", "Research experience description"]'::jsonb,
  'https://goldwaterscholarship.gov/apply',
  'https://goldwaterscholarship.gov',
  '[]'::jsonb,
  NULL,
  'goldwater-scholarship'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'NSF Graduate Research Fellowship',
  'National Science Foundation',
  'individual',
  'research',
  'The NSF GRFP provides three years of financial support to outstanding graduate students pursuing research-based STEM degrees, including a $37,000 annual stipend and a $16,000 cost-of-education allowance. The fellowship spans a five-year period and is among the most prestigious early-career research awards in the US. Applications are open to final-year undergraduates and early-stage graduate students.',
  37000,
  true,
  NULL,
  '{"requires_student": true, "requires_us_citizen": true, "education_level": "graduate", "industries": ["science", "technology", "engineering", "mathematics"]}'::jsonb,
  '["NSF application", "Personal statement", "Graduate research plan", "Academic transcripts", "Three reference letters"]'::jsonb,
  'https://www.nsfgrfp.org',
  'https://www.nsf.gov/funding/pgm_summ.jsp?pims_id=6201',
  '[]'::jsonb,
  NULL,
  'nsf-graduate-research-fellowship'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Jacob K. Javits Fellowship Program',
  'U.S. Department of Education',
  'individual',
  'education',
  'The Javits Fellowships support students of superior academic ability pursuing graduate study in arts, humanities, and social sciences at accredited US institutions. Fellows receive up to $40,000 per year for up to 48 months of graduate education. Eligible students must be enrolled in or accepted to doctoral or master''s programs and demonstrate exceptional scholarly potential.',
  40000,
  true,
  NULL,
  '{"requires_student": true, "requires_us_citizen": true, "education_level": "graduate", "industries": ["arts", "humanities", "social_sciences"]}'::jsonb,
  '["DOE application", "Personal statement", "Academic transcripts", "Letters of recommendation", "Writing sample", "Degree program documentation"]'::jsonb,
  'https://www2.ed.gov/programs/jacobjavits/index.html',
  'https://www2.ed.gov',
  '[]'::jsonb,
  NULL,
  'javits-fellowship'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Paul Douglas Teacher Scholarship',
  'U.S. Department of Education',
  'individual',
  'education',
  'The Paul Douglas Scholarship provides up to $5,000 per year to students who graduated in the top 10% of their high school class and plan to pursue full-time teaching careers in early childhood, elementary, or secondary education. Recipients must teach two years for each year of support received. Scholarships are distributed through state education agencies.',
  5000,
  true,
  NULL,
  '{"requires_student": true, "requires_us_citizen": true, "requires_top_10_percent_class_rank": true, "requires_teaching_commitment": true}'::jsonb,
  '["State application form", "High school transcripts with class rank", "Enrollment verification", "Teacher preparation program documentation"]'::jsonb,
  'https://www2.ed.gov/programs/pauldouglas/index.html',
  'https://www2.ed.gov',
  '[]'::jsonb,
  NULL,
  'paul-douglas-teacher-scholarship'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Indian Health Service Scholarship Program',
  'Indian Health Service',
  'individual',
  'health',
  'The IHS Scholarship Program supports American Indian and Alaska Native students pursuing health professions degrees by covering full tuition, required fees, and a monthly living stipend. Recipients commit to serving in IHS facilities, tribal health programs, or urban Indian organizations for one year per year of support received, with a minimum two-year service obligation.',
  0,
  true,
  NULL,
  '{"requires_native_american": true, "requires_student": true, "requires_health_professions_enrollment": true, "requires_service_commitment": true}'::jsonb,
  '["IHS application", "Tribal enrollment documentation", "Acceptance letter from health professions program", "Academic transcripts", "Letters of recommendation", "Personal statement"]'::jsonb,
  'https://www.ihs.gov/scholarship',
  'https://www.ihs.gov',
  '[]'::jsonb,
  NULL,
  'ihs-scholarship'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'SNAP Benefits',
  'USDA Food and Nutrition Service',
  'individual',
  'nutrition',
  'The Supplemental Nutrition Assistance Program provides monthly electronic benefits to low-income households to purchase food at authorized grocery stores and markets. Benefit amounts are based on household size, net income, and allowable deductions including housing, childcare, and dependent care. Most households must have gross income at or below 130% of the federal poverty level to qualify.',
  0,
  true,
  NULL,
  '{"requires_us_resident": true, "max_household_income_percent_poverty": 130, "requires_us_citizen": true}'::jsonb,
  '["State application form", "Proof of identity", "Proof of residency", "Proof of income", "Social Security numbers for household members"]'::jsonb,
  'https://www.fns.usda.gov/snap/apply',
  'https://www.fns.usda.gov/snap',
  '[]'::jsonb,
  NULL,
  'snap-benefits'
) ON CONFLICT (slug) DO NOTHING;
