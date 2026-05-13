#!/usr/bin/env python3
"""Generates seed-batch-1.sql — Small Business (22) + Individual (20) grants."""
import json, textwrap

GRANTS = [
  # ── SMALL BUSINESS ──────────────────────────────────────────────────────────
  {
    "name": "SBIR Phase II Grant",
    "agency": "Small Business Administration",
    "category": "small_business",
    "subcategory": "research",
    "description": (
      "SBIR Phase II builds on successful Phase I work, providing up to $1,000,000 "
      "to expand R&D scope and advance technology toward commercialization. "
      "Awards fund two-year projects and require demonstrated Phase I technical merit "
      "and a credible commercialization plan."
    ),
    "max_amount": 1000000,
    "is_recurring": True,
    "eligibility_criteria": {
      "max_employees": 500,
      "requires_us_ownership": True,
      "requires_phase_1_completion": True,
      "industries": ["technology","science","engineering","health","defense"],
    },
    "required_documents": [
      "Phase I final report","Technical proposal","Commercialization plan",
      "Budget justification","Company certifications","Biographical sketches",
    ],
    "application_url": "https://www.sbir.gov/apply",
    "official_source_url": "https://www.sbir.gov",
    "slug": "sbir-phase-2-grant",
  },
  {
    "name": "STTR Phase I Grant",
    "agency": "Small Business Administration",
    "category": "small_business",
    "subcategory": "research",
    "description": (
      "The Small Business Technology Transfer Phase I program funds cooperative R&D "
      "between small businesses and US nonprofit research institutions such as universities "
      "and federal labs. Awards of up to $150,000 support feasibility studies for innovative "
      "technology concepts. A formal collaboration agreement with the research partner is required."
    ),
    "max_amount": 150000,
    "is_recurring": True,
    "eligibility_criteria": {
      "max_employees": 500,
      "requires_us_ownership": True,
      "requires_research_partnership": True,
    },
    "required_documents": [
      "Technical proposal","Research institution agreement",
      "Budget justification","Biographical sketches","Company registration documents",
    ],
    "application_url": "https://www.sbir.gov/apply",
    "official_source_url": "https://www.sbir.gov",
    "slug": "sttr-phase-1-grant",
  },
  {
    "name": "STTR Phase II Grant",
    "agency": "Small Business Administration",
    "category": "small_business",
    "subcategory": "research",
    "description": (
      "STTR Phase II continues and expands Phase I R&D with up to $1,000,000 over two years "
      "to move the technology closer to commercial deployment. The required partnership with a "
      "US nonprofit research institution must be maintained throughout the award period. "
      "Businesses must have completed Phase I and demonstrated satisfactory technical results."
    ),
    "max_amount": 1000000,
    "is_recurring": True,
    "eligibility_criteria": {
      "max_employees": 500,
      "requires_us_ownership": True,
      "requires_phase_1_completion": True,
      "requires_research_partnership": True,
    },
    "required_documents": [
      "Phase I final report","Technical proposal","Commercialization plan",
      "Research institution agreement","Budget justification","Company certifications",
    ],
    "application_url": "https://www.sbir.gov/apply",
    "official_source_url": "https://www.sbir.gov",
    "slug": "sttr-phase-2-grant",
  },
  {
    "name": "SBA Community Advantage Loans",
    "agency": "Small Business Administration",
    "category": "small_business",
    "subcategory": "lending",
    "description": (
      "Community Advantage gives mission-based lenders—CDFIs and approved nonprofits—access "
      "to SBA loan guarantees to serve small businesses in underserved markets. "
      "Loans up to $350,000 provide affordable capital to entrepreneurs in low-income areas, "
      "rural communities, and underserved populations who lack traditional financing options."
    ),
    "max_amount": 350000,
    "is_recurring": True,
    "eligibility_criteria": {
      "max_employees": 500,
      "requires_us_business": True,
      "requires_underserved_market": True,
    },
    "required_documents": [
      "Business plan","Financial statements (2 years)","Tax returns (3 years)",
      "Business licenses","Personal financial statement","SBA borrower information form",
    ],
    "application_url": "https://www.sba.gov/funding-programs/loans/community-advantage-loans",
    "official_source_url": "https://www.sba.gov",
    "slug": "sba-community-advantage-loans",
  },
  {
    "name": "Economic Development Administration Grants",
    "agency": "Economic Development Administration",
    "category": "small_business",
    "subcategory": "economic_development",
    "description": (
      "EDA grants fund infrastructure, planning, and technical assistance projects that "
      "create and retain jobs and attract private investment in economically distressed communities. "
      "Awards support a wide range of projects from industrial parks to broadband infrastructure. "
      "Eligible applicants include states, cities, counties, and nonprofits in qualifying distressed areas."
    ),
    "max_amount": 3000000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_distressed_area": True,
      "eligible_applicants": ["local_government","state_government","nonprofit","economic_development_district"],
    },
    "required_documents": [
      "Application narrative","Economic impact analysis","Letters of support",
      "Financial statements","NEPA documentation","Budget detail","Match documentation",
    ],
    "application_url": "https://www.eda.gov/funding/programs",
    "official_source_url": "https://www.eda.gov",
    "slug": "eda-economic-development-grants",
  },
  {
    "name": "CDFI Fund Technical Assistance Grants",
    "agency": "U.S. Department of the Treasury",
    "category": "small_business",
    "subcategory": "community_development",
    "description": (
      "The CDFI Fund Technical Assistance component helps Community Development Financial "
      "Institutions build organizational capacity to better serve low-income communities. "
      "Grants fund staff training, technology upgrades, strategic planning, and new product "
      "development to strengthen CDFI operations and mission impact."
    ),
    "max_amount": 125000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_cdfi_certification": True,
      "requires_low_income_service": True,
    },
    "required_documents": [
      "CDFI certification documents","Strategic plan","Financial statements (3 years)",
      "Narrative application","Board resolution","Tax-exempt status documentation",
    ],
    "application_url": "https://www.cdfifund.gov/programs-training/programs/cdfi-program",
    "official_source_url": "https://www.cdfifund.gov",
    "slug": "cdfi-technical-assistance-grants",
  },
  {
    "name": "State Trade Expansion Program (STEP)",
    "agency": "Small Business Administration",
    "category": "small_business",
    "subcategory": "export",
    "description": (
      "STEP grants reimburse small businesses for eligible export promotion expenses including "
      "international trade show participation, website translation, foreign market sales trips, "
      "and export training. Applications are submitted through the state economic development "
      "agency, which administers reimbursements to qualifying businesses."
    ),
    "max_amount": 15000,
    "is_recurring": True,
    "eligibility_criteria": {
      "max_employees": 500,
      "requires_us_business": True,
      "requires_export_intent": True,
      "max_revenue": 19000000,
    },
    "required_documents": [
      "Business registration","Export marketing plan",
      "Receipts for eligible export expenses","Certification of eligibility","Tax returns",
    ],
    "application_url": "https://www.sba.gov/funding-programs/grants/state-trade-expansion-program-step",
    "official_source_url": "https://www.sba.gov",
    "slug": "step-export-assistance",
  },
  {
    "name": "SBA 8(a) Business Development Program",
    "agency": "Small Business Administration",
    "category": "small_business",
    "subcategory": "contracting",
    "description": (
      "The 8(a) program helps small businesses owned by socially and economically disadvantaged "
      "individuals compete for federal contracts through set-asides and sole-source awards up to "
      "$4 million. Participants receive nine years of business development assistance including "
      "mentorship, training, and access to specialized contracting vehicles."
    ),
    "max_amount": 0,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_disadvantaged_status": True,
      "max_employees": 500,
      "requires_us_ownership": True,
      "min_ownership_percent": 51,
    },
    "required_documents": [
      "SBA Form 1010","Business financial statements","Personal financial statements",
      "Tax returns (3 years)","Social disadvantage narrative","Business plan",
    ],
    "application_url": "https://www.sba.gov/federal-contracting/contracting-assistance-programs/8a-business-development-program",
    "official_source_url": "https://www.sba.gov",
    "slug": "sba-8a-business-development",
  },
  {
    "name": "Opportunity Zone Business Investment",
    "agency": "U.S. Department of the Treasury",
    "category": "small_business",
    "subcategory": "investment",
    "description": (
      "Opportunity Zone tax incentives allow investors to defer and reduce capital gains taxes "
      "by investing in Qualified Opportunity Funds that finance businesses in designated "
      "economically distressed communities. Businesses in Opportunity Zones benefit from "
      "increased access to patient capital flowing into their communities through QOF investment."
    ),
    "max_amount": 0,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_opportunity_zone_location": True,
      "requires_us_business": True,
      "requires_active_business_income": True,
    },
    "required_documents": [
      "IRS Form 8996","Business registration",
      "Opportunity Zone location documentation","Financial projections","Business plan",
    ],
    "application_url": "https://www.irs.gov/credits-deductions/opportunity-zones",
    "official_source_url": "https://www.irs.gov/credits-deductions/opportunity-zones",
    "slug": "opportunity-zone-business-investment",
  },
  {
    "name": "Rural Microentrepreneur Assistance Program",
    "agency": "USDA Rural Development",
    "category": "small_business",
    "subcategory": "rural",
    "description": (
      "RMAP provides grants and technical assistance to microenterprise development "
      "organizations that support rural entrepreneurs with up to 10 employees. "
      "Eligible organizations use funds to deliver microloans, business training, "
      "and one-on-one coaching to rural small business owners and startups."
    ),
    "max_amount": 50000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_rural": True,
      "max_employees": 10,
      "requires_us_business": True,
    },
    "required_documents": [
      "Organizational application","Financial statements","Microloan portfolio documentation",
      "Technical assistance plan","Rural area certification","Match documentation",
    ],
    "application_url": "https://www.rd.usda.gov/programs-services/business-programs/rural-microentrepreneur-assistance-program",
    "official_source_url": "https://www.rd.usda.gov",
    "slug": "rural-microentrepreneur-assistance",
  },
  {
    "name": "Native American Business Development Institute Grants",
    "agency": "Bureau of Indian Affairs",
    "category": "small_business",
    "subcategory": "minority",
    "description": (
      "BIA grants support Native American entrepreneurs and tribal businesses with feasibility "
      "studies, business planning, technical assistance, and startup capital. "
      "Funds help tribal members develop sustainable enterprises that create jobs and "
      "economic opportunity in American Indian and Alaska Native communities."
    ),
    "max_amount": 100000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_native_american": True,
      "requires_tribal_affiliation": True,
    },
    "required_documents": [
      "Tribal enrollment documentation","Business plan","Financial statements",
      "Project narrative","Tribal government letter of support",
    ],
    "application_url": "https://www.bia.gov/bia/ois/dbic",
    "official_source_url": "https://www.bia.gov",
    "slug": "native-american-business-development",
  },
  {
    "name": "Small Business Innovation in Clean Energy (DOE SBIR)",
    "agency": "U.S. Department of Energy",
    "category": "small_business",
    "subcategory": "energy",
    "description": (
      "DOE's SBIR program provides Phase I and Phase II awards to small businesses "
      "developing innovative clean energy technologies including solar, wind, battery storage, "
      "and energy efficiency solutions. Awards fund high-risk R&D with strong commercial "
      "potential and require the primary researcher to be employed by the small business."
    ),
    "max_amount": 200000,
    "is_recurring": True,
    "eligibility_criteria": {
      "max_employees": 500,
      "requires_us_ownership": True,
      "industries": ["energy","technology","engineering","science"],
    },
    "required_documents": [
      "Technical proposal","Budget justification","Biographical sketches",
      "Company certifications","Letters of support from potential customers",
    ],
    "application_url": "https://www.energy.gov/eere/funding-opportunities",
    "official_source_url": "https://www.energy.gov",
    "slug": "doe-small-business-clean-energy",
  },
  {
    "name": "Export-Import Bank Small Business Program",
    "agency": "Export-Import Bank of the United States",
    "category": "small_business",
    "subcategory": "export",
    "description": (
      "EXIM Bank's small business programs offer working capital guarantees, export credit "
      "insurance, and buyer financing to reduce the financial risk of international sales. "
      "These tools help US small businesses access capital against export receivables and "
      "offer competitive financing terms to foreign buyers."
    ),
    "max_amount": 0,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_us_exporter": True,
      "max_employees": 500,
      "requires_us_business": True,
      "requires_us_content": True,
    },
    "required_documents": [
      "Export contract or purchase order","Business financial statements",
      "Tax returns (2 years)","EXIM application form","Export compliance certification",
    ],
    "application_url": "https://www.exim.gov/what-we-do/small-business",
    "official_source_url": "https://www.exim.gov",
    "slug": "exim-small-business-program",
  },
  {
    "name": "Small Business Environmental Assistance Program",
    "agency": "Environmental Protection Agency",
    "category": "small_business",
    "subcategory": "environmental",
    "description": (
      "EPA's Small Business Environmental Assistance Program provides free, confidential "
      "compliance assistance to help small businesses navigate air quality, water discharge, "
      "hazardous waste, and other environmental regulations. Technical experts help businesses "
      "achieve compliance without incurring regulatory penalties or costly violations."
    ),
    "max_amount": 50000,
    "is_recurring": True,
    "eligibility_criteria": {
      "max_employees": 500,
      "requires_us_business": True,
    },
    "required_documents": [
      "Business registration","Description of operations and processes",
      "Current permits or compliance documentation",
    ],
    "application_url": "https://www.epa.gov/assistance/environmental-assistance-and-small-business",
    "official_source_url": "https://www.epa.gov",
    "slug": "small-business-environmental-assistance",
  },
  {
    "name": "DOT Disadvantaged Business Enterprise Program",
    "agency": "U.S. Department of Transportation",
    "category": "small_business",
    "subcategory": "transportation",
    "description": (
      "DOT's Disadvantaged Business Enterprise program provides contracting opportunities "
      "and technical assistance to small businesses owned by socially and economically "
      "disadvantaged individuals in federally funded transportation projects. "
      "Certified DBEs receive bid preference and set-aside opportunities on highway, "
      "transit, and aviation contracts."
    ),
    "max_amount": 0,
    "is_recurring": True,
    "eligibility_criteria": {
      "max_employees": 500,
      "requires_transportation_industry": True,
      "requires_disadvantaged_status": True,
      "requires_us_business": True,
    },
    "required_documents": [
      "DBE certification application","Business financial statements",
      "Personal net worth statement","Business licenses","Tax returns (3 years)",
    ],
    "application_url": "https://www.transportation.gov/civil-rights/disadvantaged-business-enterprise",
    "official_source_url": "https://www.transportation.gov",
    "slug": "dot-disadvantaged-business-enterprise",
  },
  {
    "name": "Manufacturing Extension Partnership Grants",
    "agency": "National Institute of Standards and Technology",
    "category": "small_business",
    "subcategory": "manufacturing",
    "description": (
      "MEP provides matching grants to establish and operate regional centers that deliver "
      "hands-on technical assistance to small and medium-sized manufacturers. "
      "Centers offer lean manufacturing, process improvement, workforce development, "
      "technology adoption, and supply chain services. Grant recipients must provide "
      "matching funds and serve manufacturers in a designated geographic territory."
    ),
    "max_amount": 300000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_manufacturing_focus": True,
      "requires_us_organization": True,
      "max_employees": 500,
    },
    "required_documents": [
      "MEP center application","Organizational capability statement",
      "Manufacturing services plan","Financial statements","Letters of commitment",
      "Matching funds documentation",
    ],
    "application_url": "https://www.nist.gov/mep",
    "official_source_url": "https://www.nist.gov/mep",
    "slug": "manufacturing-extension-partnership",
  },
  {
    "name": "Good Jobs Challenge Grant",
    "agency": "Economic Development Administration",
    "category": "small_business",
    "subcategory": "workforce",
    "description": (
      "The Good Jobs Challenge funds industry-led workforce training systems that connect "
      "workers to high-quality jobs in high-demand sectors such as manufacturing, technology, "
      "healthcare, and clean energy. Grants support sector-based partnerships including "
      "employers, training providers, workforce boards, and community organizations. "
      "Priority is given to projects placing workers from underserved communities."
    ),
    "max_amount": 25000000,
    "is_recurring": False,
    "eligibility_criteria": {
      "requires_industry_partnership": True,
      "requires_employer_commitment": True,
      "requires_us_organization": True,
    },
    "required_documents": [
      "Application narrative","Industry partnership documentation",
      "Employer commitment letters","Budget justification",
      "Workforce data and labor market analysis","Equity plan",
    ],
    "application_url": "https://www.eda.gov/funding/programs/good-jobs-challenge",
    "official_source_url": "https://www.eda.gov",
    "slug": "good-jobs-challenge-grant",
  },
  {
    "name": "Community Navigator Pilot Program",
    "agency": "Small Business Administration",
    "category": "small_business",
    "subcategory": "outreach",
    "description": (
      "The Community Navigator Pilot Program funds trusted community organizations to provide "
      "culturally tailored outreach and business development services to underserved entrepreneurs. "
      "Navigators act as trusted intermediaries connecting small businesses to SBA resources, "
      "capital, federal programs, and technical assistance while removing systemic barriers."
    ),
    "max_amount": 1000000,
    "is_recurring": False,
    "eligibility_criteria": {
      "requires_underserved_community_focus": True,
      "requires_us_nonprofit_or_organization": True,
    },
    "required_documents": [
      "Application narrative","Organizational capability statement",
      "Community needs assessment","Partnership agreements",
      "Financial statements","Board resolution",
    ],
    "application_url": "https://www.sba.gov/funding-programs/grants/community-navigator-pilot-program",
    "official_source_url": "https://www.sba.gov",
    "slug": "community-navigator-pilot",
  },
  {
    "name": "Small Business Debt Relief Program",
    "agency": "Small Business Administration",
    "category": "small_business",
    "subcategory": "debt_relief",
    "description": (
      "The SBA Debt Relief Program covered principal, interest, and fee payments on behalf "
      "of qualifying small businesses with existing SBA loans during the COVID-19 pandemic. "
      "Relief was automatic for eligible borrowers with active SBA 7(a), 504, or microloans "
      "in good standing at the time of program implementation."
    ),
    "max_amount": 10000,
    "is_recurring": False,
    "eligibility_criteria": {
      "requires_existing_sba_loan": True,
      "requires_us_business": True,
      "loan_types": ["7a","504","microloan"],
    },
    "required_documents": [
      "SBA loan account number","Business registration","Financial statements",
      "Proof of active loan in good standing",
    ],
    "application_url": "https://www.sba.gov/funding-programs/loans/covid-19-relief-options",
    "official_source_url": "https://www.sba.gov",
    "slug": "sba-small-business-debt-relief",
  },
  {
    "name": "Distressed Capital Access Program",
    "agency": "U.S. Department of the Treasury",
    "category": "small_business",
    "subcategory": "capital",
    "description": (
      "DCAP channels affordable capital to small businesses in low and moderate income "
      "communities and distressed areas through Community Development Financial Institutions. "
      "The program addresses gaps in conventional small business lending by providing "
      "grants and flexible loan products to entrepreneurs who lack access to mainstream credit."
    ),
    "max_amount": 100000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_lmi_community": True,
      "max_employees": 500,
      "requires_us_business": True,
    },
    "required_documents": [
      "Business plan","Financial statements","Tax returns (2 years)",
      "Community location documentation","Personal financial statement",
    ],
    "application_url": "https://www.cdfifund.gov",
    "official_source_url": "https://www.cdfifund.gov",
    "slug": "distressed-capital-access-program",
  },
  {
    "name": "HUBZone Program",
    "agency": "Small Business Administration",
    "category": "small_business",
    "subcategory": "contracting",
    "description": (
      "The HUBZone program stimulates economic development in historically underutilized "
      "business zones by giving certified small businesses a 10% price evaluation preference "
      "in competitive federal contract bidding. Certified companies are eligible for set-aside "
      "contracts and sole-source awards, and must maintain their principal office in a "
      "designated HUBZone with at least 35% of staff residing in HUBZone areas."
    ),
    "max_amount": 0,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_hubzone_principal_office": True,
      "min_hubzone_employee_percent": 35,
      "max_employees": 500,
      "requires_us_ownership": True,
    },
    "required_documents": [
      "SBA HUBZone certification application","Business registration",
      "Employee residence documentation","Principal office lease or deed",
      "Financial statements","Tax returns (2 years)",
    ],
    "application_url": "https://www.sba.gov/federal-contracting/contracting-assistance-programs/hubzone-program",
    "official_source_url": "https://www.sba.gov",
    "slug": "hubzone-program",
  },
  {
    "name": "Main Street Lending Program",
    "agency": "Federal Reserve",
    "category": "small_business",
    "subcategory": "lending",
    "description": (
      "The Main Street Lending Program provided accessible credit to small and medium-sized "
      "US businesses and nonprofits impacted by the COVID-19 pandemic through participating "
      "lenders. Loans helped businesses maintain payroll, operations, and debt service during "
      "economic disruption. Eligible borrowers must have been operating before March 2020 and "
      "meet revenue and employee size thresholds."
    ),
    "max_amount": 300000,
    "is_recurring": False,
    "eligibility_criteria": {
      "requires_us_business": True,
      "max_employees": 15000,
      "max_revenue": 5000000000,
      "requires_pre_pandemic_operations": True,
    },
    "required_documents": [
      "Business financial statements","Tax returns (2 years)","Payroll documentation",
      "Business registration","Borrower certifications","Lender application",
    ],
    "application_url": "https://www.federalreserve.gov/monetarypolicy/mainstreetlending.htm",
    "official_source_url": "https://www.federalreserve.gov",
    "slug": "main-street-lending-program",
  },

  # ── INDIVIDUAL ───────────────────────────────────────────────────────────────
  {
    "name": "Federal Supplemental Educational Opportunity Grant (FSEOG)",
    "agency": "U.S. Department of Education",
    "category": "individual",
    "subcategory": "education",
    "description": (
      "FSEOG provides supplemental grant funding to undergraduate students with exceptional "
      "financial need, prioritizing Federal Pell Grant recipients with the lowest Expected "
      "Family Contributions. Awards range from $100 to $4,000 per year and do not require "
      "repayment. Students must be enrolled at a participating institution and complete the FAFSA."
    ),
    "max_amount": 4000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_student": True,
      "requires_us_citizen": True,
      "education_level": "undergraduate",
      "requires_exceptional_financial_need": True,
    },
    "required_documents": [
      "FAFSA","Enrollment verification","Student ID","Financial aid application",
    ],
    "application_url": "https://studentaid.gov/understand-aid/types/grants/fseog",
    "official_source_url": "https://studentaid.gov",
    "slug": "fseog-grant",
  },
  {
    "name": "TEACH Grant",
    "agency": "U.S. Department of Education",
    "category": "individual",
    "subcategory": "education",
    "description": (
      "The Teacher Education Assistance for College and Higher Education Grant provides "
      "up to $4,000 per year to students preparing to teach in high-need subject areas "
      "at low-income elementary or secondary schools. Recipients sign an Agreement to Serve "
      "committing to four years of full-time teaching within eight years of program completion. "
      "Failure to complete the service obligation converts the grant to an unsubsidized loan."
    ),
    "max_amount": 4000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_student": True,
      "requires_us_citizen": True,
      "education_level": "undergraduate",
      "requires_teaching_commitment": True,
      "min_gpa": 3.25,
    },
    "required_documents": [
      "FAFSA","TEACH Grant counseling completion certificate",
      "Agreement to Serve","Enrollment in qualifying teacher preparation program",
    ],
    "application_url": "https://studentaid.gov/understand-aid/types/grants/teach",
    "official_source_url": "https://studentaid.gov",
    "slug": "teach-grant",
  },
  {
    "name": "Iraq and Afghanistan Service Grant",
    "agency": "U.S. Department of Education",
    "category": "individual",
    "subcategory": "military",
    "description": (
      "This grant assists college students whose parent or guardian died as a result of "
      "military service in Iraq or Afghanistan after September 11, 2001. "
      "The award equals the maximum Federal Pell Grant for the applicable year even if "
      "the student does not otherwise qualify for Pell. Applicants must be under 24 years "
      "old or enrolled at least part-time when their parent or guardian died."
    ),
    "max_amount": 7395,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_student": True,
      "requires_us_citizen": True,
      "requires_military_parent_death": True,
      "max_age": 24,
    },
    "required_documents": [
      "FAFSA","Death certificate","Military service documentation",
      "Enrollment verification","Birth certificate or legal guardianship documentation",
    ],
    "application_url": "https://studentaid.gov/understand-aid/types/grants/iraq-afghanistan-service",
    "official_source_url": "https://studentaid.gov",
    "slug": "iraq-afghanistan-service-grant",
  },
  {
    "name": "USDA Single Family Housing Repair Grant",
    "agency": "USDA Rural Development",
    "category": "individual",
    "subcategory": "housing",
    "description": (
      "The Section 504 Home Repair Grant helps very low-income rural homeowners aged 62 and "
      "older remove health and safety hazards or make accessibility modifications to their homes. "
      "Grants up to $10,000 cover repairs such as roof replacement, heating system fixes, "
      "plumbing, electrical upgrades, and disability-related modifications. "
      "Recipients must own and occupy the property and be unable to afford a repair loan."
    ),
    "max_amount": 10000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_us_resident": True,
      "min_age": 62,
      "requires_rural": True,
      "requires_homeowner": True,
      "max_household_income_percent_poverty": 50,
    },
    "required_documents": [
      "Proof of age (62+)","Proof of property ownership","Income documentation",
      "Rural area verification","Description of needed repairs","Title search",
    ],
    "application_url": "https://www.rd.usda.gov/programs-services/single-family-housing-programs/single-family-housing-repair-loans-grants",
    "official_source_url": "https://www.rd.usda.gov",
    "slug": "usda-housing-repair-grant",
  },
  {
    "name": "Emergency Rental Assistance Program",
    "agency": "U.S. Department of the Treasury",
    "category": "individual",
    "subcategory": "housing",
    "description": (
      "ERAP provides financial assistance to low-income renters experiencing hardship due "
      "to the COVID-19 pandemic to prevent eviction and housing instability. "
      "Funds cover up to 18 months of past-due and prospective rent, utilities, and other "
      "qualifying housing costs. Eligible households must earn at or below 80% of area median "
      "income and demonstrate COVID-related financial hardship."
    ),
    "max_amount": 15000,
    "is_recurring": False,
    "eligibility_criteria": {
      "requires_us_resident": True,
      "max_household_income_percent_ami": 80,
      "requires_rental_housing": True,
      "requires_covid_hardship": True,
    },
    "required_documents": [
      "Proof of identity","Lease agreement","Proof of income",
      "Utility bills","Documentation of COVID-related hardship",
      "Proof of housing instability or eviction risk",
    ],
    "application_url": "https://home.treasury.gov/policy-issues/coronavirus/assistance-for-state-local-and-tribal-governments/emergency-rental-assistance-program",
    "official_source_url": "https://home.treasury.gov",
    "slug": "emergency-rental-assistance",
  },
  {
    "name": "Social Security Disability Insurance (SSDI)",
    "agency": "Social Security Administration",
    "category": "individual",
    "subcategory": "disability",
    "description": (
      "SSDI provides monthly income replacement to workers who become disabled and can no "
      "longer engage in substantial gainful activity due to a medically determinable impairment. "
      "Benefit amounts are based on lifetime earnings and Social Security contributions. "
      "Applicants must have sufficient work credits and a qualifying disability expected to "
      "last at least 12 months or result in death."
    ),
    "max_amount": 43524,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_disability": True,
      "requires_work_credits": True,
      "requires_us_citizen": True,
    },
    "required_documents": [
      "SSA Form SSA-16-BK","Medical records","Work history documentation",
      "Birth certificate","W-2 forms or self-employment tax returns",
    ],
    "application_url": "https://www.ssa.gov/benefits/disability/apply.html",
    "official_source_url": "https://www.ssa.gov",
    "slug": "social-security-disability-insurance",
  },
  {
    "name": "Supplemental Security Income (SSI)",
    "agency": "Social Security Administration",
    "category": "individual",
    "subcategory": "disability",
    "description": (
      "SSI provides monthly cash assistance to elderly, blind, or disabled individuals "
      "with very limited income and resources to help cover basic needs such as food, "
      "clothing, and shelter. Benefit amounts are determined by the federal benefit rate "
      "minus countable income. Eligibility is based on financial need rather than work "
      "history, with strict income and asset limits."
    ),
    "max_amount": 10968,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_disability_or_age": True,
      "max_household_income": 9000,
      "requires_us_citizen": True,
      "max_assets": 2000,
    },
    "required_documents": [
      "SSA Form SSA-8000","Proof of identity","Birth certificate",
      "Proof of income and resources","Medical records (if disability-based)",
      "Proof of living arrangements",
    ],
    "application_url": "https://www.ssa.gov/benefits/ssi/apply.html",
    "official_source_url": "https://www.ssa.gov",
    "slug": "supplemental-security-income",
  },
  {
    "name": "Temporary Assistance for Needy Families (TANF)",
    "agency": "U.S. Department of Health and Human Services",
    "category": "individual",
    "subcategory": "family",
    "description": (
      "TANF provides time-limited cash assistance and supportive services to low-income "
      "families with children through state-administered programs funded by federal block grants. "
      "States have flexibility to design their programs within federal guidelines, creating "
      "variation in benefit levels across states. Benefits are limited to a 60-month lifetime "
      "maximum and typically require participation in work activities."
    ),
    "max_amount": 0,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_children": True,
      "requires_us_citizen": True,
      "max_household_income": 24000,
      "requires_us_resident": True,
    },
    "required_documents": [
      "State application form","Proof of identity","Birth certificates for children",
      "Proof of income","Proof of residency","Social Security cards",
    ],
    "application_url": "https://www.acf.hhs.gov/ofa/programs/tanf",
    "official_source_url": "https://www.acf.hhs.gov",
    "slug": "tanf-cash-assistance",
  },
  {
    "name": "Head Start Program",
    "agency": "U.S. Department of Health and Human Services",
    "category": "individual",
    "subcategory": "early_childhood",
    "description": (
      "Head Start provides comprehensive early childhood education, health screening, "
      "nutrition, and family engagement services to children from birth to age five "
      "from low-income families at no cost. The program builds the social, emotional, "
      "and cognitive foundations children need to succeed in school and life. "
      "Enrollment prioritizes families with incomes at or below the federal poverty level."
    ),
    "max_amount": 0,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_children": True,
      "max_age": 5,
      "max_household_income_percent_poverty": 100,
      "requires_us_resident": True,
    },
    "required_documents": [
      "Enrollment application","Proof of income","Birth certificate",
      "Immunization records","Proof of residency",
    ],
    "application_url": "https://www.acf.hhs.gov/ohs/about/head-start",
    "official_source_url": "https://www.acf.hhs.gov",
    "slug": "head-start-program",
  },
  {
    "name": "Child Care and Development Fund (CCDF)",
    "agency": "U.S. Department of Health and Human Services",
    "category": "individual",
    "subcategory": "family",
    "description": (
      "CCDF provides childcare subsidies to low-income working families to help cover "
      "the cost of quality care for children up to age 13, or up to age 19 for children "
      "with special needs. Families typically pay an income-based copayment while the "
      "subsidy covers the balance. Parents must be working, in school, or in job training."
    ),
    "max_amount": 0,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_children": True,
      "max_child_age": 13,
      "requires_working_parent": True,
      "max_household_income_percent_poverty": 200,
      "requires_us_resident": True,
    },
    "required_documents": [
      "State application form","Proof of income","Proof of employment or school enrollment",
      "Child birth certificate","Proof of residency",
    ],
    "application_url": "https://www.childcare.gov",
    "official_source_url": "https://www.acf.hhs.gov/occ",
    "slug": "child-care-development-fund",
  },
  {
    "name": "WIC Nutrition Program",
    "agency": "USDA Food and Nutrition Service",
    "category": "individual",
    "subcategory": "nutrition",
    "description": (
      "WIC provides monthly food benefits, nutrition education, breastfeeding support, "
      "and healthcare referrals to low-income pregnant, postpartum, and breastfeeding women "
      "and children under five at nutritional risk. Participants receive electronic benefits "
      "redeemable for specific healthy foods at authorized retailers. "
      "Eligibility requires income at or below 185% of the federal poverty level."
    ),
    "max_amount": 0,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_us_resident": True,
      "max_household_income_percent_poverty": 185,
      "requires_nutritional_risk": True,
    },
    "required_documents": [
      "Proof of identity","Proof of residency","Proof of income",
      "Medical or self-certification of nutritional risk",
    ],
    "application_url": "https://www.fns.usda.gov/wic/wic-how-apply",
    "official_source_url": "https://www.fns.usda.gov/wic",
    "slug": "wic-nutrition-program",
  },
  {
    "name": "AmeriCorps Segal Education Award",
    "agency": "AmeriCorps",
    "category": "individual",
    "subcategory": "education",
    "description": (
      "AmeriCorps members who complete a qualified term of national service earn a Segal "
      "Education Award of up to $7,395 to pay tuition and fees or repay qualified student "
      "loans at accredited institutions. Full-time members serving one year earn the maximum "
      "award, while part-time members earn proportionally smaller amounts. "
      "The award must be used within seven years of completing service."
    ),
    "max_amount": 7395,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_americorps_service": True,
      "requires_us_citizen": True,
      "min_age": 17,
    },
    "required_documents": [
      "AmeriCorps service completion documentation",
      "My AmeriCorps portal enrollment",
      "Institution enrollment or student loan documentation",
    ],
    "application_url": "https://americorps.gov/members-volunteers/segal-americorps-education-award",
    "official_source_url": "https://americorps.gov",
    "slug": "americorps-education-award",
  },
  {
    "name": "National Health Service Corps Scholarship Program",
    "agency": "Health Resources and Services Administration",
    "category": "individual",
    "subcategory": "health",
    "description": (
      "The NHSC Scholarship Program pays full tuition, required fees, and a monthly living "
      "stipend for health professions students who commit to serving in Health Professional "
      "Shortage Areas. Scholars provide one year of full-time clinical service for each year "
      "of support received, with a minimum two-year commitment. "
      "Eligible disciplines include primary care medicine, dentistry, nursing, and behavioral health."
    ),
    "max_amount": 0,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_student": True,
      "requires_us_citizen": True,
      "requires_health_professions_enrollment": True,
      "requires_service_commitment": True,
    },
    "required_documents": [
      "NHSC application","Enrollment verification","Academic transcripts",
      "Letters of recommendation","Personal statement","CV or resume",
    ],
    "application_url": "https://nhsc.hrsa.gov/scholarships",
    "official_source_url": "https://nhsc.hrsa.gov",
    "slug": "nhsc-scholarship",
  },
  {
    "name": "Harry S. Truman Scholarship",
    "agency": "Harry S. Truman Scholarship Foundation",
    "category": "individual",
    "subcategory": "education",
    "description": (
      "The Truman Scholarship supports outstanding college juniors committed to careers "
      "in public service leadership with up to $30,000 for graduate school expenses. "
      "Recipients demonstrate exceptional leadership potential, academic achievement, "
      "and dedication to careers in government, nonprofit, or advocacy. "
      "Applicants must be nominated by their college or university."
    ),
    "max_amount": 30000,
    "is_recurring": False,
    "eligibility_criteria": {
      "requires_student": True,
      "requires_us_citizen": True,
      "education_level": "junior",
      "requires_public_service_commitment": True,
      "min_gpa": 3.0,
    },
    "required_documents": [
      "Institutional nomination","Application essays","Academic transcripts",
      "Three letters of recommendation","Policy proposal",
    ],
    "application_url": "https://www.truman.gov/candidates/applying-for-the-truman-scholarship",
    "official_source_url": "https://www.truman.gov",
    "slug": "truman-scholarship",
  },
  {
    "name": "Barry Goldwater Scholarship",
    "agency": "Barry Goldwater Scholarship and Excellence in Education Foundation",
    "category": "individual",
    "subcategory": "education",
    "description": (
      "The Goldwater Scholarship supports outstanding sophomore and junior undergraduates "
      "pursuing research careers in mathematics, natural sciences, or engineering. "
      "Awards of up to $7,500 per year cover tuition, fees, books, and room and board. "
      "Applicants must be nominated by their institution and demonstrate exceptional "
      "research potential and a B+ or higher GPA."
    ),
    "max_amount": 7500,
    "is_recurring": False,
    "eligibility_criteria": {
      "requires_student": True,
      "requires_us_citizen": True,
      "education_level": "sophomore_or_junior",
      "min_gpa": 3.3,
      "industries": ["mathematics","science","engineering"],
    },
    "required_documents": [
      "Institutional nomination","Research essays","Academic transcripts",
      "Faculty letters of recommendation","Research experience description",
    ],
    "application_url": "https://goldwaterscholarship.gov/apply",
    "official_source_url": "https://goldwaterscholarship.gov",
    "slug": "goldwater-scholarship",
  },
  {
    "name": "NSF Graduate Research Fellowship",
    "agency": "National Science Foundation",
    "category": "individual",
    "subcategory": "research",
    "description": (
      "The NSF GRFP provides three years of financial support to outstanding graduate "
      "students pursuing research-based STEM degrees, including a $37,000 annual stipend "
      "and a $16,000 cost-of-education allowance. The fellowship spans a five-year period "
      "and is among the most prestigious early-career research awards in the US. "
      "Applications are open to final-year undergraduates and early-stage graduate students."
    ),
    "max_amount": 37000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_student": True,
      "requires_us_citizen": True,
      "education_level": "graduate",
      "industries": ["science","technology","engineering","mathematics"],
    },
    "required_documents": [
      "NSF application","Personal statement","Graduate research plan",
      "Academic transcripts","Three reference letters",
    ],
    "application_url": "https://www.nsfgrfp.org",
    "official_source_url": "https://www.nsf.gov/funding/pgm_summ.jsp?pims_id=6201",
    "slug": "nsf-graduate-research-fellowship",
  },
  {
    "name": "Jacob K. Javits Fellowship Program",
    "agency": "U.S. Department of Education",
    "category": "individual",
    "subcategory": "education",
    "description": (
      "The Javits Fellowships support students of superior academic ability pursuing "
      "graduate study in arts, humanities, and social sciences at accredited US institutions. "
      "Fellows receive up to $40,000 per year for up to 48 months of graduate education. "
      "Eligible students must be enrolled in or accepted to doctoral or master's programs "
      "and demonstrate exceptional scholarly potential."
    ),
    "max_amount": 40000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_student": True,
      "requires_us_citizen": True,
      "education_level": "graduate",
      "industries": ["arts","humanities","social_sciences"],
    },
    "required_documents": [
      "DOE application","Personal statement","Academic transcripts",
      "Letters of recommendation","Writing sample","Degree program documentation",
    ],
    "application_url": "https://www2.ed.gov/programs/jacobjavits/index.html",
    "official_source_url": "https://www2.ed.gov",
    "slug": "javits-fellowship",
  },
  {
    "name": "Paul Douglas Teacher Scholarship",
    "agency": "U.S. Department of Education",
    "category": "individual",
    "subcategory": "education",
    "description": (
      "The Paul Douglas Scholarship provides up to $5,000 per year to students who "
      "graduated in the top 10% of their high school class and plan to pursue full-time "
      "teaching careers in early childhood, elementary, or secondary education. "
      "Recipients must teach two years for each year of support received. "
      "Scholarships are distributed through state education agencies."
    ),
    "max_amount": 5000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_student": True,
      "requires_us_citizen": True,
      "requires_top_10_percent_class_rank": True,
      "requires_teaching_commitment": True,
    },
    "required_documents": [
      "State application form","High school transcripts with class rank",
      "Enrollment verification","Teacher preparation program documentation",
    ],
    "application_url": "https://www2.ed.gov/programs/pauldouglas/index.html",
    "official_source_url": "https://www2.ed.gov",
    "slug": "paul-douglas-teacher-scholarship",
  },
  {
    "name": "Indian Health Service Scholarship Program",
    "agency": "Indian Health Service",
    "category": "individual",
    "subcategory": "health",
    "description": (
      "The IHS Scholarship Program supports American Indian and Alaska Native students "
      "pursuing health professions degrees by covering full tuition, required fees, "
      "and a monthly living stipend. Recipients commit to serving in IHS facilities, "
      "tribal health programs, or urban Indian organizations for one year per year of "
      "support received, with a minimum two-year service obligation."
    ),
    "max_amount": 0,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_native_american": True,
      "requires_student": True,
      "requires_health_professions_enrollment": True,
      "requires_service_commitment": True,
    },
    "required_documents": [
      "IHS application","Tribal enrollment documentation",
      "Acceptance letter from health professions program",
      "Academic transcripts","Letters of recommendation","Personal statement",
    ],
    "application_url": "https://www.ihs.gov/scholarship",
    "official_source_url": "https://www.ihs.gov",
    "slug": "ihs-scholarship",
  },
  {
    "name": "SNAP Benefits",
    "agency": "USDA Food and Nutrition Service",
    "category": "individual",
    "subcategory": "nutrition",
    "description": (
      "The Supplemental Nutrition Assistance Program provides monthly electronic benefits "
      "to low-income households to purchase food at authorized grocery stores and markets. "
      "Benefit amounts are based on household size, net income, and allowable deductions "
      "including housing, childcare, and dependent care. Most households must have gross "
      "income at or below 130% of the federal poverty level to qualify."
    ),
    "max_amount": 0,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_us_resident": True,
      "max_household_income_percent_poverty": 130,
      "requires_us_citizen": True,
    },
    "required_documents": [
      "State application form","Proof of identity","Proof of residency",
      "Proof of income","Social Security numbers for household members",
    ],
    "application_url": "https://www.fns.usda.gov/snap/apply",
    "official_source_url": "https://www.fns.usda.gov/snap",
    "slug": "snap-benefits",
  },
]


def sql_str(s: str) -> str:
    """Escape a string for SQL single-quote literals."""
    return s.replace("'", "''")

def grant_to_sql(g: dict) -> str:
    return (
        "INSERT INTO grants "
        "(name, agency, category, subcategory, description, max_amount, is_recurring, "
        "deadline, eligibility_criteria, required_documents, application_url, "
        "official_source_url, form_numbers, processing_time_days, slug) VALUES (\n"
        f"  '{sql_str(g['name'])}',\n"
        f"  '{sql_str(g['agency'])}',\n"
        f"  '{g['category']}',\n"
        f"  '{g['subcategory']}',\n"
        f"  '{sql_str(g['description'])}',\n"
        f"  {g['max_amount']},\n"
        f"  {str(g['is_recurring']).lower()},\n"
        f"  NULL,\n"
        f"  '{json.dumps(g['eligibility_criteria'])}'::jsonb,\n"
        f"  '{json.dumps(g['required_documents'])}'::jsonb,\n"
        f"  '{g['application_url']}',\n"
        f"  '{g['official_source_url']}',\n"
        f"  '[]'::jsonb,\n"
        f"  NULL,\n"
        f"  '{g['slug']}'\n"
        ") ON CONFLICT (slug) DO NOTHING;"
    )

out_path = "/Users/yonatanlivshits/Downloads/grant-finder/seed-batch-1.sql"
lines = [
    "-- ============================================================",
    "-- seed-batch-1.sql  —  Small Business (22) + Individual (20)",
    f"-- {len(GRANTS)} grants total",
    "-- Run in Supabase SQL editor. Skips duplicates via ON CONFLICT.",
    "-- ============================================================",
    "",
]
sb = [g for g in GRANTS if g["category"] == "small_business"]
ind = [g for g in GRANTS if g["category"] == "individual"]

lines += ["-- ── SMALL BUSINESS (" + str(len(sb)) + ") ──────────────────────────────", ""]
for g in sb:
    lines.append(grant_to_sql(g))
    lines.append("")

lines += ["-- ── INDIVIDUAL (" + str(len(ind)) + ") ─────────────────────────────────", ""]
for g in ind:
    lines.append(grant_to_sql(g))
    lines.append("")

with open(out_path, "w") as f:
    f.write("\n".join(lines))

print(f"✓ Wrote {len(GRANTS)} grants to {out_path}")
print(f"  Small business : {len(sb)}")
print(f"  Individual     : {len(ind)}")

# Slug uniqueness check
slugs = [g["slug"] for g in GRANTS]
dupes = [s for s in slugs if slugs.count(s) > 1]
if dupes:
    print(f"  ✗ DUPLICATE SLUGS: {set(dupes)}")
else:
    print("  ✓ All slugs unique")
