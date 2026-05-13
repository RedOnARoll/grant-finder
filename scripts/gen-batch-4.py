#!/usr/bin/env python3
"""Generates seed-batch-4.sql — Housing (10) + Energy (9) + Health (10) grants."""
import json

GRANTS = [
  # ── HOUSING ──────────────────────────────────────────────────────────────────
  {
    "name": "HUD Section 8 Housing Choice Voucher Program",
    "agency": "U.S. Department of Housing and Urban Development",
    "category": "individual",
    "subcategory": "housing",
    "description": (
      "The Housing Choice Voucher (HCV) program is the federal government's major program "
      "for assisting very low-income families, the elderly, and the disabled to afford "
      "decent, safe, and sanitary housing in the private market. Participants find their "
      "own housing and use the voucher to pay for all or part of the rent. The program "
      "is administered by local public housing agencies (PHAs)."
    ),
    "max_amount": 24000,
    "is_recurring": True,
    "deadline": None,
    "eligibility_criteria": {
      "requires_us_citizen": True,
      "requires_low_income": True,
      "max_household_income_percent_ami": 50,
    },
    "required_documents": [
      "HUD Form 52517 (Application)", "Photo ID for all household members",
      "Social Security cards", "Birth certificates", "Income verification",
      "Rental history", "Criminal background check consent",
    ],
    "application_url": "https://www.hud.gov/topics/housing_choice_voucher_program_section_8",
    "official_source_url": "https://www.hud.gov/topics/housing_choice_voucher_program_section_8",
    "form_numbers": ["HUD-52517"],
    "processing_time_days": 180,
    "slug": "hud-section-8-housing-choice-voucher",
  },
  {
    "name": "USDA Single Family Housing Direct Loan Program (Section 502)",
    "agency": "USDA Rural Development",
    "category": "individual",
    "subcategory": "housing",
    "description": (
      "This program assists low- and very-low-income applicants in obtaining decent, safe, "
      "and sanitary housing in eligible rural areas by providing payment assistance to "
      "reduce the applicant's repayment obligation. Payment assistance is a type of "
      "subsidy that reduces the mortgage payment temporarily for a period of time. The "
      "amount of assistance is determined by the adjusted family income."
    ),
    "max_amount": 500000,
    "is_recurring": True,
    "deadline": None,
    "eligibility_criteria": {
      "requires_us_citizen": True,
      "requires_low_income": True,
      "requires_rural_location": True,
      "max_household_income_percent_ami": 80,
    },
    "required_documents": [
      "USDA Form RD 410-4", "Proof of income", "Credit history",
      "Property appraisal", "Title search", "Flood determination",
    ],
    "application_url": "https://www.rd.usda.gov/programs-services/single-family-housing-programs/single-family-housing-direct-home-loans",
    "official_source_url": "https://www.rd.usda.gov",
    "processing_time_days": 60,
    "slug": "usda-section-502-direct-loan",
  },
  {
    "name": "HOME Investment Partnerships Program",
    "agency": "U.S. Department of Housing and Urban Development",
    "category": "individual",
    "subcategory": "housing",
    "description": (
      "The HOME Investment Partnerships Program provides formula grants to states and "
      "localities that communities use to fund a wide range of activities including "
      "building, buying, and/or rehabilitating affordable housing for rent or homeownership "
      "or providing direct rental assistance to low-income people. It is the largest "
      "federal block grant to state and local governments for housing."
    ),
    "max_amount": 15000,
    "is_recurring": True,
    "deadline": None,
    "eligibility_criteria": {
      "requires_us_citizen": True,
      "requires_low_income": True,
      "max_household_income_percent_ami": 80,
    },
    "required_documents": [
      "Local PHA application", "Income documentation", "Asset verification",
      "Rental history", "Photo ID",
    ],
    "application_url": "https://www.hud.gov/program_offices/comm_planning/home",
    "official_source_url": "https://www.hud.gov/program_offices/comm_planning/home",
    "processing_time_days": 90,
    "slug": "home-investment-partnerships-program",
  },
  {
    "name": "Low Income Home Energy Assistance Program (LIHEAP)",
    "agency": "U.S. Department of Health and Human Services",
    "category": "individual",
    "subcategory": "housing",
    "description": (
      "LIHEAP helps low-income households with their home energy costs including heating, "
      "cooling, and crisis assistance. The program also helps with weatherization to "
      "reduce energy consumption. Benefits are provided as cash or vendor payments and "
      "are administered by states, territories, and tribal governments through local "
      "community action agencies."
    ),
    "max_amount": 1000,
    "is_recurring": True,
    "deadline": None,
    "eligibility_criteria": {
      "requires_us_citizen": True,
      "requires_low_income": True,
      "max_household_income_percent_poverty": 150,
    },
    "required_documents": [
      "State application form", "Proof of income (30 days)", "Utility bills",
      "Photo ID", "Proof of address", "Social Security numbers for all household members",
    ],
    "application_url": "https://www.benefits.gov/benefit/623",
    "official_source_url": "https://www.acf.hhs.gov/ocs/programs/liheap",
    "processing_time_days": 30,
    "slug": "liheap-energy-assistance",
  },
  {
    "name": "HUD Continuum of Care Program",
    "agency": "U.S. Department of Housing and Urban Development",
    "category": "individual",
    "subcategory": "housing",
    "description": (
      "The Continuum of Care (CoC) program promotes community-wide commitment to the goal "
      "of ending homelessness. It provides funding for efforts by nonprofit providers "
      "and State and local governments to quickly rehouse homeless individuals and families "
      "while minimizing trauma and dislocation. The program provides transitional housing, "
      "permanent supportive housing, and rapid rehousing."
    ),
    "max_amount": 20000,
    "is_recurring": True,
    "deadline": None,
    "eligibility_criteria": {
      "requires_us_citizen": True,
      "requires_homeless_or_at_risk": True,
    },
    "required_documents": [
      "Local CoC application", "Proof of homelessness or housing instability",
      "Income documentation", "Photo ID",
    ],
    "application_url": "https://www.hud.gov/program_offices/comm_planning/continuum_of_care",
    "official_source_url": "https://www.hud.gov/program_offices/comm_planning/continuum_of_care",
    "processing_time_days": 60,
    "slug": "hud-continuum-of-care-program",
  },
  {
    "name": "USDA Rural Housing Repair Loans and Grants (Section 504)",
    "agency": "USDA Rural Development",
    "category": "individual",
    "subcategory": "housing",
    "description": (
      "The Section 504 Home Repair program provides loans and grants to very-low-income "
      "homeowners to repair, improve, or modernize their homes or to remove health and "
      "safety hazards. Grants are provided to elderly (age 62+) very-low-income homeowners. "
      "The program is available only in eligible rural areas and helps homeowners who "
      "cannot afford commercial financing."
    ),
    "max_amount": 10000,
    "is_recurring": True,
    "deadline": None,
    "eligibility_criteria": {
      "requires_us_citizen": True,
      "requires_low_income": True,
      "requires_rural_location": True,
      "min_age": 62,
      "requires_homeowner": True,
    },
    "required_documents": [
      "USDA Form RD 410-4", "Proof of ownership", "Income documentation",
      "Proof of occupancy", "Contractor estimates",
    ],
    "application_url": "https://www.rd.usda.gov/programs-services/single-family-housing-programs/single-family-housing-repair-loans-grants",
    "official_source_url": "https://www.rd.usda.gov",
    "processing_time_days": 60,
    "slug": "usda-section-504-home-repair",
  },
  {
    "name": "HUD Community Development Block Grant (CDBG)",
    "agency": "U.S. Department of Housing and Urban Development",
    "category": "small_business",
    "subcategory": "housing",
    "description": (
      "The Community Development Block Grant (CDBG) program is one of the longest-running "
      "HUD programs. It provides annual grants on a formula basis to states, cities, and "
      "counties to develop viable urban communities by providing decent housing, a suitable "
      "living environment, and expanding economic opportunities, principally for low- and "
      "moderate-income persons."
    ),
    "max_amount": 3000000,
    "is_recurring": True,
    "deadline": None,
    "eligibility_criteria": {
      "requires_us_organization": True,
      "requires_low_moderate_income_service": True,
    },
    "required_documents": [
      "Local government application", "Needs assessment", "Program description",
      "Budget narrative", "Organizational capacity documentation",
    ],
    "application_url": "https://www.hud.gov/program_offices/comm_planning/cdbg",
    "official_source_url": "https://www.hud.gov/program_offices/comm_planning/cdbg",
    "processing_time_days": 120,
    "slug": "hud-community-development-block-grant",
  },
  {
    "name": "NeighborWorks America Homeownership Grant",
    "agency": "NeighborWorks America",
    "category": "individual",
    "subcategory": "housing",
    "description": (
      "NeighborWorks America and its network of nearly 250 local nonprofit organizations "
      "provide down payment assistance, closing cost assistance, and homebuyer education "
      "for low- and moderate-income first-time homebuyers. Programs vary by location but "
      "typically help buyers purchase homes in targeted neighborhoods and communities "
      "across the U.S."
    ),
    "max_amount": 10000,
    "is_recurring": True,
    "deadline": None,
    "eligibility_criteria": {
      "requires_us_citizen": True,
      "requires_first_time_homebuyer": True,
      "requires_low_moderate_income": True,
      "max_household_income_percent_ami": 120,
    },
    "required_documents": [
      "Local NeighborWorks application", "Homebuyer education certificate",
      "Income documentation", "Credit report", "Mortgage pre-approval letter",
    ],
    "application_url": "https://www.neighborworks.org/find-a-location",
    "official_source_url": "https://www.neighborworks.org",
    "processing_time_days": 30,
    "slug": "neighborworks-homeownership-grant",
  },
  {
    "name": "Emergency Solutions Grant Program (ESG)",
    "agency": "U.S. Department of Housing and Urban Development",
    "category": "individual",
    "subcategory": "housing",
    "description": (
      "The Emergency Solutions Grants (ESG) program provides funds to engage homeless "
      "individuals and families living on the street, improve the number and quality of "
      "emergency shelters, help operate emergency shelters, provide essential services to "
      "shelter residents, rapidly rehouse homeless individuals and families, and prevent "
      "families and individuals from becoming homeless."
    ),
    "max_amount": 12000,
    "is_recurring": True,
    "deadline": None,
    "eligibility_criteria": {
      "requires_us_citizen": True,
      "requires_homeless_or_at_risk": True,
    },
    "required_documents": [
      "Local ESG application", "Proof of housing crisis", "Income documentation", "Photo ID",
    ],
    "application_url": "https://www.hud.gov/program_offices/comm_planning/esg",
    "official_source_url": "https://www.hud.gov/program_offices/comm_planning/esg",
    "processing_time_days": 30,
    "slug": "emergency-solutions-grant-program",
  },
  {
    "name": "HUD Choice Neighborhoods Initiative",
    "agency": "U.S. Department of Housing and Urban Development",
    "category": "small_business",
    "subcategory": "housing",
    "description": (
      "The Choice Neighborhoods Initiative supports locally driven strategies to address "
      "struggling neighborhoods with distressed public or HUD-assisted housing through "
      "a comprehensive approach to neighborhood transformation. Planning grants help "
      "communities develop comprehensive neighborhood revitalization plans. "
      "Implementation grants fund the full execution of these plans."
    ),
    "max_amount": 50000000,
    "is_recurring": True,
    "deadline": "2026-03-01",
    "eligibility_criteria": {
      "requires_local_government": True,
      "requires_distressed_neighborhood": True,
    },
    "required_documents": [
      "Federal application (Grants.gov)", "Transformation plan", "Community needs assessment",
      "Partnership letters", "Budget narrative", "Performance metrics",
    ],
    "application_url": "https://www.hud.gov/program_offices/public_indian_housing/programs/ph/cn",
    "official_source_url": "https://www.hud.gov/program_offices/public_indian_housing/programs/ph/cn",
    "processing_time_days": 180,
    "slug": "hud-choice-neighborhoods-initiative",
  },

  # ── ENERGY ───────────────────────────────────────────────────────────────────
  {
    "name": "DOE Weatherization Assistance Program (WAP)",
    "agency": "U.S. Department of Energy",
    "category": "individual",
    "subcategory": "energy",
    "description": (
      "The Weatherization Assistance Program (WAP) reduces energy costs for low-income "
      "households by increasing the energy efficiency of their homes, while ensuring "
      "their health and safety. Funded through the DOE, WAP provides services to "
      "approximately 35,000 homes per year. Services include insulation, air sealing, "
      "HVAC system upgrades, and health and safety improvements."
    ),
    "max_amount": 8000,
    "is_recurring": True,
    "deadline": None,
    "eligibility_criteria": {
      "requires_us_citizen": True,
      "requires_low_income": True,
      "max_household_income_percent_poverty": 200,
    },
    "required_documents": [
      "State application form", "Proof of income", "Utility bills",
      "Proof of residence", "Photo ID",
    ],
    "application_url": "https://www.energy.gov/scep/wap/weatherization-assistance-program",
    "official_source_url": "https://www.energy.gov/scep/wap/weatherization-assistance-program",
    "processing_time_days": 60,
    "slug": "doe-weatherization-assistance-program",
  },
  {
    "name": "USDA Rural Energy for America Program (REAP)",
    "agency": "USDA Rural Development",
    "category": "small_business",
    "subcategory": "energy",
    "description": (
      "REAP provides guaranteed loan financing and grant funding to agricultural producers "
      "and rural small businesses for renewable energy systems or to make energy efficiency "
      "improvements. Renewable energy systems include wind, solar, biomass, geothermal, "
      "hydroelectric, and hydrogen systems. The program also funds energy efficiency "
      "improvements to existing buildings, equipment, and facilities."
    ),
    "max_amount": 500000,
    "is_recurring": True,
    "deadline": "2026-03-31",
    "eligibility_criteria": {
      "requires_us_business": True,
      "requires_rural_location": True,
      "requires_agricultural_producer_or_rural_small_business": True,
    },
    "required_documents": [
      "SF 424 Application", "Energy audit or assessment", "Project technical report",
      "Financial statements", "Business plan", "Environmental review documentation",
    ],
    "application_url": "https://www.rd.usda.gov/programs-services/energy-programs/rural-energy-america-program-renewable-energy-systems-energy-efficiency-improvement-guaranteed-loans",
    "official_source_url": "https://www.rd.usda.gov",
    "processing_time_days": 90,
    "slug": "usda-rural-energy-for-america-program",
  },
  {
    "name": "DOE State Energy Program (SEP)",
    "agency": "U.S. Department of Energy",
    "category": "small_business",
    "subcategory": "energy",
    "description": (
      "The State Energy Program (SEP) provides funding and technical assistance to states "
      "and territories for developing and implementing state-specific energy initiatives. "
      "SEP funds a wide range of activities including renewable energy deployment, energy "
      "efficiency improvements, transportation sector initiatives, and energy planning. "
      "Grants flow from DOE to states, who then issue sub-grants to businesses and organizations."
    ),
    "max_amount": 250000,
    "is_recurring": True,
    "deadline": None,
    "eligibility_criteria": {
      "requires_us_business": True,
      "requires_energy_project": True,
    },
    "required_documents": [
      "State SEP application", "Project description", "Budget narrative",
      "Technical specifications", "Energy savings analysis",
    ],
    "application_url": "https://www.energy.gov/scep/slsc/state-energy-program",
    "official_source_url": "https://www.energy.gov/scep/slsc/state-energy-program",
    "processing_time_days": 90,
    "slug": "doe-state-energy-program",
  },
  {
    "name": "Inflation Reduction Act Home Energy Rebates (HOMES Program)",
    "agency": "U.S. Department of Energy",
    "category": "individual",
    "subcategory": "energy",
    "description": (
      "The HOMES (Home Owner Managing Energy Savings) Rebate Program provides rebates "
      "to homeowners who make whole-home energy efficiency upgrades. The rebate amount "
      "is based on modeled or measured energy savings and household income. Low- and "
      "moderate-income households can receive higher rebate amounts. Rebates are "
      "administered through state energy offices."
    ),
    "max_amount": 8000,
    "is_recurring": True,
    "deadline": None,
    "eligibility_criteria": {
      "requires_us_citizen": True,
      "requires_homeowner": True,
      "requires_energy_upgrade": True,
    },
    "required_documents": [
      "State rebate application", "Proof of homeownership", "Energy audit",
      "Contractor invoices", "Income documentation (for enhanced rebates)",
    ],
    "application_url": "https://www.energy.gov/scep/home-energy-rebates-frequently-asked-questions",
    "official_source_url": "https://www.energy.gov/scep/home-energy-rebates-programs",
    "processing_time_days": 30,
    "slug": "ira-homes-rebate-program",
  },
  {
    "name": "Inflation Reduction Act High-Efficiency Electric Home Rebate (HEEHRA)",
    "agency": "U.S. Department of Energy",
    "category": "individual",
    "subcategory": "energy",
    "description": (
      "The High-Efficiency Electric Home Rebate Act (HEEHRA) provides point-of-sale "
      "rebates for low- and moderate-income households to electrify their homes. "
      "Rebates cover heat pumps, heat pump water heaters, electric stoves, clothes "
      "dryers, insulation, weatherization, and electrical panel upgrades. "
      "Income-qualified households can receive up to $14,000 in rebates."
    ),
    "max_amount": 14000,
    "is_recurring": True,
    "deadline": None,
    "eligibility_criteria": {
      "requires_us_citizen": True,
      "requires_homeowner_or_renter": True,
      "max_household_income_percent_ami": 150,
    },
    "required_documents": [
      "State rebate application", "Income documentation", "Product receipts",
      "Contractor installation documentation",
    ],
    "application_url": "https://www.energy.gov/scep/home-energy-rebates-frequently-asked-questions",
    "official_source_url": "https://www.energy.gov/scep/home-energy-rebates-programs",
    "processing_time_days": 30,
    "slug": "ira-heehra-rebate-program",
  },
  {
    "name": "EPA Clean School Bus Program",
    "agency": "U.S. Environmental Protection Agency",
    "category": "small_business",
    "subcategory": "energy",
    "description": (
      "The Clean School Bus program provides up to $5 billion over five years to replace "
      "existing school buses with zero-emission and clean school buses. Priority is given "
      "to high-need local education agencies, rural local education agencies, and tribal "
      "schools. Grants and rebates fund the purchase of new electric and propane buses "
      "to replace older, higher-polluting diesel buses."
    ),
    "max_amount": 400000,
    "is_recurring": True,
    "deadline": "2026-04-30",
    "eligibility_criteria": {
      "requires_school_district": True,
      "requires_existing_diesel_bus": True,
    },
    "required_documents": [
      "Grants.gov application", "Fleet inventory documentation", "Replacement plan",
      "Budget narrative", "Priority community documentation",
    ],
    "application_url": "https://www.epa.gov/cleanschoolbus",
    "official_source_url": "https://www.epa.gov/cleanschoolbus",
    "processing_time_days": 90,
    "slug": "epa-clean-school-bus-program",
  },
  {
    "name": "DOE Solar for All Program",
    "agency": "U.S. Department of Energy",
    "category": "individual",
    "subcategory": "energy",
    "description": (
      "Solar for All is a $7 billion program funded by the Inflation Reduction Act that "
      "provides grants to states, territories, Tribal governments, and nonprofits to "
      "deploy rooftop solar and community solar to low-income and disadvantaged communities. "
      "The program aims to enable 900,000+ households to benefit from solar energy and "
      "lower their electricity bills through direct incentives and rebates."
    ),
    "max_amount": 5000,
    "is_recurring": True,
    "deadline": None,
    "eligibility_criteria": {
      "requires_us_citizen": True,
      "requires_low_income": True,
      "max_household_income_percent_ami": 80,
    },
    "required_documents": [
      "State/program application", "Income documentation", "Utility bills",
      "Proof of residence",
    ],
    "application_url": "https://www.epa.gov/greenhouse-gas-reduction-fund/solar-all",
    "official_source_url": "https://www.epa.gov/greenhouse-gas-reduction-fund/solar-all",
    "processing_time_days": 60,
    "slug": "doe-solar-for-all-program",
  },
  {
    "name": "USDA Biorefinery, Renewable Chemical, and Biobased Product Manufacturing Grant",
    "agency": "USDA Rural Development",
    "category": "small_business",
    "subcategory": "energy",
    "description": (
      "This program assists in the development of new and emerging technologies for "
      "advanced biofuels, renewable chemicals, and biobased product manufacturing so as "
      "to materially enhance the nation's economic security, create domestic jobs, and "
      "protect the environment. Grants assist in developing new and emerging technologies "
      "or retrofitting existing facilities."
    ),
    "max_amount": 15000000,
    "is_recurring": True,
    "deadline": "2026-02-28",
    "eligibility_criteria": {
      "requires_us_business": True,
      "requires_rural_location": True,
      "requires_biorefinery_project": True,
    },
    "required_documents": [
      "SF 424 Application", "Technical feasibility study", "Business plan",
      "Environmental review", "Financial statements", "Project timeline",
    ],
    "application_url": "https://www.rd.usda.gov/programs-services/energy-programs/biorefinery-renewable-chemical-and-biobased-product-manufacturing-assistance",
    "official_source_url": "https://www.rd.usda.gov",
    "processing_time_days": 120,
    "slug": "usda-biorefinery-biobased-product-grant",
  },
  {
    "name": "DOE Energy Efficiency and Conservation Block Grant (EECBG)",
    "agency": "U.S. Department of Energy",
    "category": "small_business",
    "subcategory": "energy",
    "description": (
      "The Energy Efficiency and Conservation Block Grant (EECBG) Program assists "
      "eligible entities in implementing strategies to reduce fossil fuel emissions, "
      "reduce total energy use, and improve energy efficiency in the transportation, "
      "building, and other sectors. The program provides formula-based grants to "
      "states, territories, local governments, and Indian tribes."
    ),
    "max_amount": 1000000,
    "is_recurring": True,
    "deadline": None,
    "eligibility_criteria": {
      "requires_local_government": True,
      "requires_energy_efficiency_project": True,
    },
    "required_documents": [
      "Federal application", "Energy efficiency plan", "Budget narrative",
      "Technical specifications", "Environmental review",
    ],
    "application_url": "https://www.energy.gov/scep/slsc/energy-efficiency-and-conservation-block-grant-program",
    "official_source_url": "https://www.energy.gov/scep/slsc/energy-efficiency-and-conservation-block-grant-program",
    "processing_time_days": 90,
    "slug": "doe-energy-efficiency-conservation-block-grant",
  },

  # ── HEALTH ───────────────────────────────────────────────────────────────────
  {
    "name": "NIH Small Business Innovation Research (SBIR) – Health",
    "agency": "National Institutes of Health",
    "category": "small_business",
    "subcategory": "health",
    "description": (
      "NIH SBIR grants support domestic small businesses engaged in research and "
      "development with high technological innovation potential in areas of importance "
      "to public health. Phase I awards provide up to $300,000 for feasibility research. "
      "Phase II awards provide up to $1 million for full R&D. The program stimulates "
      "commercialization of innovations stemming from federal research and development."
    ),
    "max_amount": 1000000,
    "is_recurring": True,
    "deadline": "2026-04-05",
    "eligibility_criteria": {
      "requires_us_business": True,
      "requires_small_business": True,
      "max_employees": 500,
      "requires_us_ownership": True,
      "requires_health_focus": True,
    },
    "required_documents": [
      "SF 424 Application", "Research strategy (12 pages)", "Budget justification",
      "Facilities and resources", "Human subjects research plan",
      "Biosketches for key personnel", "Letters of support",
    ],
    "application_url": "https://grants.nih.gov/grants/funding/sbir.htm",
    "official_source_url": "https://www.nih.gov",
    "processing_time_days": 180,
    "slug": "nih-sbir-health",
  },
  {
    "name": "HRSA Federally Qualified Health Center (FQHC) Grant",
    "agency": "Health Resources and Services Administration",
    "category": "small_business",
    "subcategory": "health",
    "description": (
      "HRSA's Health Center Program provides grants to community-based organizations "
      "to become Federally Qualified Health Centers (FQHCs), which provide comprehensive "
      "primary care services to underserved communities regardless of patients' ability "
      "to pay. FQHCs receive enhanced Medicaid and Medicare reimbursements and access "
      "to the Federal Tort Claims Act malpractice coverage."
    ),
    "max_amount": 650000,
    "is_recurring": True,
    "deadline": "2026-05-01",
    "eligibility_criteria": {
      "requires_us_nonprofit": True,
      "requires_health_organization": True,
      "requires_underserved_community_service": True,
    },
    "required_documents": [
      "HRSA Electronic Handbook application", "Needs assessment", "Service area documentation",
      "Governance documentation", "Financial statements", "Operational plan",
      "Community health needs assessment",
    ],
    "application_url": "https://bphc.hrsa.gov/funding/apply-for-funding",
    "official_source_url": "https://bphc.hrsa.gov",
    "processing_time_days": 180,
    "slug": "hrsa-federally-qualified-health-center-grant",
  },
  {
    "name": "CDC Community Health Worker Training Grant",
    "agency": "Centers for Disease Control and Prevention",
    "category": "small_business",
    "subcategory": "health",
    "description": (
      "CDC provides grants to train and deploy Community Health Workers (CHWs) who serve "
      "as a bridge between health and social services and the community. CHW programs "
      "improve health outcomes for underserved populations by addressing social "
      "determinants of health, promoting preventive care, and helping individuals "
      "navigate health and social service systems."
    ),
    "max_amount": 500000,
    "is_recurring": True,
    "deadline": "2026-04-01",
    "eligibility_criteria": {
      "requires_us_nonprofit": True,
      "requires_health_organization": True,
    },
    "required_documents": [
      "CDC PODS application", "Program narrative", "Logic model",
      "Budget justification", "Evaluation plan", "Partnership letters",
    ],
    "application_url": "https://www.cdc.gov/grants/index.html",
    "official_source_url": "https://www.cdc.gov",
    "processing_time_days": 120,
    "slug": "cdc-community-health-worker-training-grant",
  },
  {
    "name": "SAMHSA Substance Abuse Prevention and Treatment Block Grant",
    "agency": "Substance Abuse and Mental Health Services Administration",
    "category": "small_business",
    "subcategory": "health",
    "description": (
      "SAMHSA's Substance Abuse Prevention and Treatment (SAPT) Block Grant provides "
      "funds to states and territories for substance use disorder prevention, treatment, "
      "and recovery support services. States allocate funds to local providers of "
      "prevention activities, treatment services, and recovery supports for individuals "
      "with substance use disorders."
    ),
    "max_amount": 750000,
    "is_recurring": True,
    "deadline": None,
    "eligibility_criteria": {
      "requires_us_nonprofit": True,
      "requires_substance_abuse_services": True,
    },
    "required_documents": [
      "State SAMHSA application", "Program description", "Budget",
      "Performance measures", "Organizational capacity documentation",
    ],
    "application_url": "https://www.samhsa.gov/grants",
    "official_source_url": "https://www.samhsa.gov",
    "processing_time_days": 90,
    "slug": "samhsa-substance-abuse-prevention-treatment-grant",
  },
  {
    "name": "Susan G. Komen Breast Cancer Research Grant",
    "agency": "Susan G. Komen Foundation",
    "category": "individual",
    "subcategory": "health",
    "description": (
      "Susan G. Komen funds a variety of research grants focused on breast cancer "
      "prevention, detection, and treatment. The foundation provides grants to "
      "researchers at all career stages, from graduate students to experienced "
      "investigators. Komen has invested more than $1 billion in breast cancer research "
      "since 1982, making it one of the largest funders of breast cancer research."
    ),
    "max_amount": 250000,
    "is_recurring": True,
    "deadline": "2026-02-01",
    "eligibility_criteria": {
      "requires_us_researcher": True,
      "requires_breast_cancer_research": True,
    },
    "required_documents": [
      "Online application", "Research proposal", "Budget justification",
      "Biosketches for key personnel", "Institution sign-off",
      "IRB/IACUC documentation",
    ],
    "application_url": "https://www.komen.org/research/grant-opportunities/",
    "official_source_url": "https://www.komen.org",
    "processing_time_days": 180,
    "slug": "susan-g-komen-breast-cancer-research-grant",
  },
  {
    "name": "American Heart Association Innovative Project Award",
    "agency": "American Heart Association",
    "category": "individual",
    "subcategory": "health",
    "description": (
      "The AHA Innovative Project Award provides funding for pioneering research in "
      "cardiovascular disease and stroke. Awards support high-risk, high-reward projects "
      "that may not fit traditional funding mechanisms. The program encourages innovative "
      "approaches and novel hypotheses that have the potential to transform understanding "
      "of cardiovascular and cerebrovascular disease."
    ),
    "max_amount": 200000,
    "is_recurring": True,
    "deadline": "2026-03-01",
    "eligibility_criteria": {
      "requires_us_researcher": True,
      "requires_cardiovascular_research": True,
      "requires_institutional_affiliation": True,
    },
    "required_documents": [
      "Online application (Grants@Heart)", "Research proposal (5 pages)",
      "Budget", "Biosketches", "Institutional letter", "Lay summary",
    ],
    "application_url": "https://professional.heart.org/en/research-programs/application-information",
    "official_source_url": "https://www.heart.org",
    "processing_time_days": 120,
    "slug": "american-heart-association-innovative-project-award",
  },
  {
    "name": "Robert Wood Johnson Foundation Health Policy Fellowship",
    "agency": "Robert Wood Johnson Foundation",
    "category": "individual",
    "subcategory": "health",
    "description": (
      "The Robert Wood Johnson Foundation Health Policy Fellowship places mid-career "
      "health professionals in leadership positions in Congress or the Executive Branch "
      "for a year of experiential learning in the health policy arena. Fellows gain "
      "firsthand experience in the federal policy process and build lasting relationships "
      "that enhance their capacity to improve health and health care."
    ),
    "max_amount": 120000,
    "is_recurring": True,
    "deadline": "2025-10-01",
    "eligibility_criteria": {
      "requires_us_citizen": True,
      "requires_health_professional": True,
      "requires_mid_career": True,
    },
    "required_documents": [
      "Online application", "Curriculum vitae", "Personal statement",
      "Letters of reference (3)", "Academic transcripts",
    ],
    "application_url": "https://www.rwjf.org/en/grants/active-funding-opportunities/2023/rwjf-health-policy-fellows.html",
    "official_source_url": "https://www.rwjf.org",
    "processing_time_days": 120,
    "slug": "rwjf-health-policy-fellowship",
  },
  {
    "name": "W.K. Kellogg Foundation Health Equity Grant",
    "agency": "W.K. Kellogg Foundation",
    "category": "small_business",
    "subcategory": "health",
    "description": (
      "The W.K. Kellogg Foundation funds organizations working to advance racial equity "
      "and health equity for vulnerable children and families. Grants support community "
      "health programs, policy advocacy, and systems change initiatives that address "
      "the root causes of health disparities. The foundation focuses on food security, "
      "mental health, and access to quality healthcare."
    ),
    "max_amount": 500000,
    "is_recurring": True,
    "deadline": "2026-02-15",
    "eligibility_criteria": {
      "requires_us_nonprofit": True,
      "requires_health_equity_focus": True,
    },
    "required_documents": [
      "Online letter of inquiry", "Organization description", "Program description",
      "Budget overview", "IRS determination letter", "Annual report",
    ],
    "application_url": "https://www.wkkf.org/grants/grant-application",
    "official_source_url": "https://www.wkkf.org",
    "processing_time_days": 180,
    "slug": "wk-kellogg-health-equity-grant",
  },
  {
    "name": "CDC Rural Health Grant",
    "agency": "Centers for Disease Control and Prevention",
    "category": "small_business",
    "subcategory": "health",
    "description": (
      "CDC's Rural Health program funds initiatives to improve the health of rural "
      "populations who often face greater challenges accessing quality health care. "
      "Grants support telehealth infrastructure, rural health workforce development, "
      "chronic disease prevention, maternal and child health, and behavioral health "
      "programs in rural communities across the United States."
    ),
    "max_amount": 300000,
    "is_recurring": True,
    "deadline": "2026-04-30",
    "eligibility_criteria": {
      "requires_us_nonprofit": True,
      "requires_rural_service_area": True,
      "requires_health_organization": True,
    },
    "required_documents": [
      "Grants.gov application", "Project narrative", "Logic model",
      "Budget justification", "Evaluation plan", "Rural community documentation",
    ],
    "application_url": "https://www.cdc.gov/grants/index.html",
    "official_source_url": "https://www.cdc.gov/ruralhealth/",
    "processing_time_days": 120,
    "slug": "cdc-rural-health-grant",
  },
  {
    "name": "HRSA Maternal and Child Health Block Grant",
    "agency": "Health Resources and Services Administration",
    "category": "small_business",
    "subcategory": "health",
    "description": (
      "The Maternal and Child Health (MCH) Block Grant provides federal funds to states "
      "and territories to improve the health of mothers, children, and their families. "
      "Programs funded include prenatal care, newborn screening, immunizations, early "
      "intervention services, child health outreach, and programs for children and "
      "youth with special health care needs."
    ),
    "max_amount": 1000000,
    "is_recurring": True,
    "deadline": None,
    "eligibility_criteria": {
      "requires_us_state_agency": True,
      "requires_maternal_child_health_focus": True,
    },
    "required_documents": [
      "HRSA Electronic Handbook application", "State MCH needs assessment",
      "Annual report", "Performance measures", "Budget narrative",
    ],
    "application_url": "https://mchb.hrsa.gov/programs-impact/programs/maternal-child-health-block-grant",
    "official_source_url": "https://mchb.hrsa.gov",
    "processing_time_days": 120,
    "slug": "hrsa-maternal-child-health-block-grant",
  },
]

def sql_str(s):
  if s is None:
    return "NULL"
  return "'" + str(s).replace("'", "''") + "'"

def grant_to_sql(g):
  name          = sql_str(g["name"])
  agency        = sql_str(g["agency"])
  category      = sql_str(g["category"])
  subcategory   = sql_str(g.get("subcategory"))
  description   = sql_str(g["description"])
  max_amount    = str(g["max_amount"]) if g.get("max_amount") is not None else "NULL"
  is_recurring  = "TRUE" if g.get("is_recurring") else "FALSE"
  deadline      = sql_str(g.get("deadline"))
  elig          = sql_str(json.dumps(g.get("eligibility_criteria", {})))
  req_docs      = sql_str(json.dumps(g.get("required_documents", [])))
  app_url       = sql_str(g["application_url"])
  src_url       = sql_str(g["official_source_url"])
  form_nums     = sql_str(json.dumps(g.get("form_numbers", [])))
  proc_days     = str(g["processing_time_days"]) if g.get("processing_time_days") is not None else "NULL"
  slug          = sql_str(g["slug"])

  return f"""INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug)
VALUES ({name}, {agency}, {category}, {subcategory}, {description}, {max_amount}, {is_recurring}, {deadline}, {elig}::jsonb, {req_docs}::jsonb, {app_url}, {src_url}, {form_nums}::jsonb, {proc_days}, {slug})
ON CONFLICT (slug) DO NOTHING;"""

if __name__ == "__main__":
  slugs = [g["slug"] for g in GRANTS]
  assert len(slugs) == len(set(slugs)), "Duplicate slugs found!"

  output_path = "/Users/yonatanlivshits/Downloads/grant-finder/seed-batch-4.sql"
  with open(output_path, "w") as f:
    f.write("-- Batch 4: Housing (10) + Energy (9) + Health (10) = 29 grants\n\n")
    for g in GRANTS:
      f.write(grant_to_sql(g) + "\n\n")

  counts = {}
  for g in GRANTS:
    key = g.get("subcategory") or g["category"]
    counts[key] = counts.get(key, 0) + 1

  print(f"✓ Wrote {len(GRANTS)} grants to {output_path}")
  for cat, n in sorted(counts.items()):
    print(f"  {cat:<16}: {n}")
  print("  ✓ All slugs unique")
