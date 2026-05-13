#!/usr/bin/env python3
"""Generates seed-batch-2.sql — Agricultural (20) + Research (18) grants."""
import json

GRANTS = [
  # ── AGRICULTURAL ─────────────────────────────────────────────────────────────
  {
    "name": "USDA Value-Added Producer Grant (VAPG)",
    "agency": "USDA Rural Development",
    "category": "agricultural",
    "subcategory": "marketing",
    "description": (
      "VAPG helps agricultural producers enter value-added markets by funding planning "
      "activities and working capital for processing, marketing, and distributing value-added "
      "agricultural products such as jams, cheeses, and specialty meats. "
      "Grants give priority to beginning farmers, socially disadvantaged producers, "
      "and mid-tier value chains."
    ),
    "max_amount": 250000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_agricultural_producer": True,
      "requires_us_farmer": True,
      "requires_value_added_product": True,
    },
    "required_documents": [
      "Business plan", "Feasibility study", "Producer eligibility documentation",
      "Financial statements", "Budget narrative", "Letters of support",
    ],
    "application_url": "https://www.rd.usda.gov/programs-services/business-programs/value-added-producer-grants",
    "official_source_url": "https://www.rd.usda.gov",
    "slug": "usda-value-added-producer-grant",
  },
  {
    "name": "Sustainable Agriculture Research and Education (SARE) Grants",
    "agency": "USDA National Institute of Food and Agriculture",
    "category": "agricultural",
    "subcategory": "research",
    "description": (
      "SARE funds research and education projects that advance sustainable farming "
      "and ranching systems that are profitable, environmentally sound, and good for "
      "communities. Four regional SARE programs offer grants to farmers, researchers, "
      "educators, and agricultural professionals across the country. "
      "Projects must address economic, environmental, and social dimensions of sustainability."
    ),
    "max_amount": 400000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_us_organization": True,
      "eligible_applicants": ["farmer", "researcher", "educator", "agricultural_professional"],
    },
    "required_documents": [
      "Project proposal", "Budget narrative", "CV or resume",
      "Collaborator agreements", "Farmer cooperator letters",
    ],
    "application_url": "https://www.sare.org/grants",
    "official_source_url": "https://www.sare.org",
    "slug": "sare-sustainable-agriculture",
  },
  {
    "name": "Beginning Farmer and Rancher Development Program",
    "agency": "USDA National Institute of Food and Agriculture",
    "category": "agricultural",
    "subcategory": "training",
    "description": (
      "BFRDP funds organizations to develop and offer education, mentoring, and technical "
      "assistance programs for beginning farmers and ranchers with 10 or fewer years of experience. "
      "Programs help new agricultural producers develop the skills, knowledge, and networks "
      "needed to establish and grow successful farm operations. "
      "Priority is given to programs serving veterans, socially disadvantaged, and immigrant farmers."
    ),
    "max_amount": 250000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_us_organization": True,
      "serves_beginning_farmers": True,
      "max_farming_experience_years": 10,
    },
    "required_documents": [
      "Project narrative", "Budget and budget justification", "Organizational capability statement",
      "Partner letters of commitment", "Logic model", "Evaluation plan",
    ],
    "application_url": "https://www.nifa.usda.gov/grants/funding-opportunities/beginning-farmer-rancher-development-program",
    "official_source_url": "https://www.nifa.usda.gov",
    "slug": "beginning-farmer-rancher-development",
  },
  {
    "name": "Environmental Quality Incentives Program (EQIP)",
    "agency": "USDA Natural Resources Conservation Service",
    "category": "agricultural",
    "subcategory": "conservation",
    "description": (
      "EQIP provides financial and technical assistance to farmers and ranchers to implement "
      "conservation practices that improve soil health, water quality, and wildlife habitat "
      "on working agricultural land. Payments cover a portion of the costs for installing "
      "conservation systems such as cover crops, nutrient management plans, and irrigation efficiency. "
      "Priority is given to projects addressing resource concerns in high-priority watersheds."
    ),
    "max_amount": 450000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_agricultural_producer": True,
      "requires_us_farmer": True,
      "requires_owned_or_controlled_land": True,
    },
    "required_documents": [
      "NRCS application (CPA-1200)", "Farm operating plan", "Conservation plan",
      "Proof of land control", "Financial information",
    ],
    "application_url": "https://www.nrcs.usda.gov/programs-initiatives/eqip-environmental-quality-incentives",
    "official_source_url": "https://www.nrcs.usda.gov",
    "slug": "eqip-environmental-quality-incentives",
  },
  {
    "name": "Conservation Stewardship Program (CSP)",
    "agency": "USDA Natural Resources Conservation Service",
    "category": "agricultural",
    "subcategory": "conservation",
    "description": (
      "CSP rewards farmers and ranchers who maintain high levels of conservation performance "
      "and take on additional stewardship activities across their entire operation. "
      "Annual payments compensate producers for maintaining existing conservation systems "
      "and adopting new activities that address priority resource concerns. "
      "Contracts run for five years and are renewed based on continued performance."
    ),
    "max_amount": 40000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_agricultural_producer": True,
      "requires_us_farmer": True,
      "requires_existing_conservation_activities": True,
      "requires_owned_or_controlled_land": True,
    },
    "required_documents": [
      "NRCS application", "Conservation performance assessment", "Farm operating plan",
      "Proof of land control", "Stewardship activity documentation",
    ],
    "application_url": "https://www.nrcs.usda.gov/programs-initiatives/csp-conservation-stewardship-program",
    "official_source_url": "https://www.nrcs.usda.gov",
    "slug": "conservation-stewardship-program",
  },
  {
    "name": "Farm Storage Facility Loan Program",
    "agency": "USDA Farm Service Agency",
    "category": "agricultural",
    "subcategory": "infrastructure",
    "description": (
      "The Farm Storage Facility Loan Program provides low-interest financing to build "
      "or upgrade on-farm storage and handling facilities for eligible commodities including "
      "grains, hay, fruits, vegetables, and aquaculture products. "
      "Loans help farmers reduce post-harvest losses and improve marketing flexibility "
      "by storing crops until prices improve. Terms range from 3 to 12 years depending on facility type."
    ),
    "max_amount": 500000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_agricultural_producer": True,
      "requires_us_farmer": True,
      "requires_eligible_commodity": True,
    },
    "required_documents": [
      "FSA application (CCC-185)", "Construction plans or equipment quotes",
      "Farm operating plan", "Proof of production history",
      "Environmental compliance documentation",
    ],
    "application_url": "https://www.fsa.usda.gov/programs-and-services/farm-loan-programs/farm-storage-facility-loans",
    "official_source_url": "https://www.fsa.usda.gov",
    "slug": "farm-storage-facility-loan",
  },
  {
    "name": "Specialty Crop Block Grant Program",
    "agency": "USDA Agricultural Marketing Service",
    "category": "agricultural",
    "subcategory": "marketing",
    "description": (
      "The Specialty Crop Block Grant Program funds projects that enhance the competitiveness "
      "of specialty crops including fruits, vegetables, tree nuts, dried fruits, horticulture, "
      "and nursery crops. State departments of agriculture receive federal funds and award "
      "subgrants to eligible organizations for research, marketing, and food safety projects. "
      "Projects must solely benefit specialty crop producers."
    ),
    "max_amount": 200000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_specialty_crop_focus": True,
      "requires_us_organization": True,
      "eligible_applicants": ["state_agency", "university", "nonprofit", "producer_group"],
    },
    "required_documents": [
      "Project proposal", "Budget narrative", "Specialty crop benefit statement",
      "Organizational credentials", "Letters of support",
    ],
    "application_url": "https://www.ams.usda.gov/services/grants/scbgp",
    "official_source_url": "https://www.ams.usda.gov",
    "slug": "specialty-crop-block-grant",
  },
  {
    "name": "Organic Agriculture Research and Extension Initiative",
    "agency": "USDA National Institute of Food and Agriculture",
    "category": "agricultural",
    "subcategory": "research",
    "description": (
      "OREI funds research, extension, and education projects that advance organic farming "
      "systems, including organic production, marketing, and processing. "
      "Projects must address critical organic farmer and rancher needs and contribute to "
      "the development of a robust, science-based organic sector. "
      "Applicants must include a certified organic operation or operation transitioning to organic."
    ),
    "max_amount": 2000000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_organic_focus": True,
      "requires_us_institution": True,
      "requires_organic_farmer_partner": True,
    },
    "required_documents": [
      "Project narrative", "Budget and justification", "CV for key personnel",
      "Organic certification documentation", "Partner letters",
      "Data management plan",
    ],
    "application_url": "https://www.nifa.usda.gov/grants/funding-opportunities/organic-agriculture-research-extension-initiative",
    "official_source_url": "https://www.nifa.usda.gov",
    "slug": "organic-agriculture-research-initiative",
  },
  {
    "name": "Livestock Forage Disaster Program (LFP)",
    "agency": "USDA Farm Service Agency",
    "category": "agricultural",
    "subcategory": "disaster_relief",
    "description": (
      "LFP provides compensation to eligible livestock producers who suffer grazing losses "
      "due to drought or fire on federally managed lands. "
      "Payments help ranchers offset the cost of purchasing supplemental feed when drought "
      "reduces normal grazing capacity on their land. "
      "Eligible producers must have suffered qualifying losses during a program year with "
      "a drought intensity of D2 or higher on the drought monitor."
    ),
    "max_amount": 0,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_livestock_producer": True,
      "requires_us_farmer": True,
      "requires_drought_or_fire_loss": True,
    },
    "required_documents": [
      "FSA application (CCC-855)", "Livestock inventory records",
      "Grazing lease or land ownership documentation",
      "Drought certification", "Agricultural records",
    ],
    "application_url": "https://www.fsa.usda.gov/programs-and-services/disaster-assistance-program/livestock-forage",
    "official_source_url": "https://www.fsa.usda.gov",
    "slug": "livestock-forage-disaster-program",
  },
  {
    "name": "Emergency Livestock Assistance Program (ELAP)",
    "agency": "USDA Farm Service Agency",
    "category": "agricultural",
    "subcategory": "disaster_relief",
    "description": (
      "ELAP provides emergency assistance to eligible livestock, honeybee, and farm-raised "
      "fish producers who suffer losses due to disasters not covered by other FSA programs. "
      "Covered losses include feed and grazing losses, livestock death losses, and costs "
      "associated with transporting water during drought. "
      "Producers must report losses to their local FSA office within 30 days of the disaster."
    ),
    "max_amount": 0,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_livestock_producer": True,
      "requires_us_farmer": True,
      "requires_eligible_disaster_loss": True,
    },
    "required_documents": [
      "FSA application (CCC-851)", "Loss documentation",
      "Livestock inventory records", "Veterinary records (if applicable)",
      "Agricultural operations records",
    ],
    "application_url": "https://www.fsa.usda.gov/programs-and-services/disaster-assistance-program/emergency-livestock-assistance",
    "official_source_url": "https://www.fsa.usda.gov",
    "slug": "emergency-livestock-assistance-program",
  },
  {
    "name": "Noninsured Crop Disaster Assistance Program (NAP)",
    "agency": "USDA Farm Service Agency",
    "category": "agricultural",
    "subcategory": "disaster_relief",
    "description": (
      "NAP provides financial assistance to producers of non-insurable crops — those not "
      "eligible for federal crop insurance — when low yields, loss of inventory, or "
      "prevented planting occur due to natural disasters. "
      "Coverage is available for crops grown for food, fiber, livestock feed, and specialty crops. "
      "Producers must apply for coverage at their local FSA office before the application closing date."
    ),
    "max_amount": 0,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_agricultural_producer": True,
      "requires_us_farmer": True,
      "requires_non_insurable_crop": True,
    },
    "required_documents": [
      "FSA application (CCC-471)", "Crop production records",
      "Acreage report", "Service fee payment", "Loss notice",
    ],
    "application_url": "https://www.fsa.usda.gov/programs-and-services/disaster-assistance-program/noninsured-crop-disaster-assistance",
    "official_source_url": "https://www.fsa.usda.gov",
    "slug": "noninsured-crop-disaster-assistance",
  },
  {
    "name": "Agricultural Conservation Easement Program (ACEP)",
    "agency": "USDA Natural Resources Conservation Service",
    "category": "agricultural",
    "subcategory": "conservation",
    "description": (
      "ACEP helps landowners, land trusts, and other entities protect, restore, and enhance "
      "wetlands and preserve working agricultural lands through conservation easements. "
      "The program pays landowners fair market value for voluntarily limiting development "
      "and other uses that are incompatible with agricultural production or wetland conservation. "
      "Easements are permanent and run with the land regardless of future ownership."
    ),
    "max_amount": 0,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_agricultural_land": True,
      "requires_landowner_or_entity": True,
      "requires_us_land": True,
    },
    "required_documents": [
      "NRCS application (CPA-1200)", "Deed and title documentation",
      "Appraisal", "Conservation easement deed draft",
      "Environmental assessment", "Baseline documentation report",
    ],
    "application_url": "https://www.nrcs.usda.gov/programs-initiatives/acep-agricultural-conservation-easement-program",
    "official_source_url": "https://www.nrcs.usda.gov",
    "slug": "agricultural-conservation-easement-program",
  },
  {
    "name": "Regional Food System Partnerships Program",
    "agency": "USDA Agricultural Marketing Service",
    "category": "agricultural",
    "subcategory": "food_systems",
    "description": (
      "RFSP funds partnerships that connect local and regional food producers with markets, "
      "supply chain partners, and consumers to build more resilient food systems. "
      "Grants support activities such as aggregation, distribution, food hubs, and market "
      "development that increase access to locally and regionally produced food. "
      "Projects must demonstrate collaboration between multiple food system stakeholders."
    ),
    "max_amount": 1000000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_food_system_partnership": True,
      "requires_us_organization": True,
      "eligible_applicants": ["nonprofit", "cooperative", "local_government", "tribal_government"],
    },
    "required_documents": [
      "Project narrative", "Partnership agreements",
      "Budget and justification", "Organizational capability statement",
      "Food system assessment", "Logic model",
    ],
    "application_url": "https://www.ams.usda.gov/services/grants/rfsp",
    "official_source_url": "https://www.ams.usda.gov",
    "slug": "regional-food-system-partnerships",
  },
  {
    "name": "Farmers Market Promotion Program (FMPP)",
    "agency": "USDA Agricultural Marketing Service",
    "category": "agricultural",
    "subcategory": "marketing",
    "description": (
      "FMPP provides competitive grants to support the development, improvement, and expansion "
      "of direct producer-to-consumer markets such as farmers markets, roadside stands, "
      "community supported agriculture programs, agritourism activities, and online sales. "
      "Projects must directly benefit agricultural producers and help them access new markets. "
      "Grants are capped at $500,000 and do not require matching funds."
    ),
    "max_amount": 500000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_agricultural_producer_benefit": True,
      "requires_us_organization": True,
      "eligible_applicants": ["agricultural_cooperative", "nonprofit", "producer_network", "local_government"],
    },
    "required_documents": [
      "Project proposal", "Budget narrative",
      "Producer benefit documentation", "Organizational financial statements",
      "Letters of support from producers",
    ],
    "application_url": "https://www.ams.usda.gov/services/grants/fmpp",
    "official_source_url": "https://www.ams.usda.gov",
    "slug": "farmers-market-promotion-program",
  },
  {
    "name": "Local Food Promotion Program (LFPP)",
    "agency": "USDA Agricultural Marketing Service",
    "category": "agricultural",
    "subcategory": "food_systems",
    "description": (
      "LFPP funds projects that develop, improve, and expand intermediary supply chain "
      "infrastructure and capacity that connects local and regional food producers to "
      "wholesale, retail, institutional, or other markets. "
      "Grants support food hubs, aggregation facilities, and distribution networks "
      "that increase regional food system capacity. Projects must benefit local agricultural producers."
    ),
    "max_amount": 500000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_local_food_focus": True,
      "requires_us_organization": True,
      "eligible_applicants": ["nonprofit", "cooperative", "local_government", "food_hub"],
    },
    "required_documents": [
      "Project narrative", "Budget and justification",
      "Supply chain analysis", "Organizational financial statements",
      "Producer partnership agreements",
    ],
    "application_url": "https://www.ams.usda.gov/services/grants/lfpp",
    "official_source_url": "https://www.ams.usda.gov",
    "slug": "local-food-promotion-program",
  },
  {
    "name": "Socially Disadvantaged Farmers and Ranchers Grant",
    "agency": "USDA National Institute of Food and Agriculture",
    "category": "agricultural",
    "subcategory": "equity",
    "description": (
      "This program funds cooperatives, associations, and other organizations to provide "
      "technical assistance, outreach, and education to socially disadvantaged farmers "
      "and ranchers including women, minorities, and other historically underserved groups. "
      "Projects help disadvantaged producers access USDA programs, capital, and markets. "
      "Grants prioritize organizations with demonstrated experience serving target populations."
    ),
    "max_amount": 5000000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_underserved_farmer_focus": True,
      "requires_us_organization": True,
      "eligible_applicants": ["cooperative", "nonprofit", "university", "state_agency"],
    },
    "required_documents": [
      "Project narrative", "Budget and justification",
      "Organizational capability statement", "Data on population served",
      "Partner letters", "Evaluation plan",
    ],
    "application_url": "https://www.nifa.usda.gov/grants/funding-opportunities/socially-disadvantaged-farmers-ranchers-policy-research-center",
    "official_source_url": "https://www.nifa.usda.gov",
    "slug": "socially-disadvantaged-farmers-grant",
  },
  {
    "name": "Urban Agriculture and Innovative Production Grants",
    "agency": "USDA National Institute of Food and Agriculture",
    "category": "agricultural",
    "subcategory": "urban",
    "description": (
      "UAIP grants support the development of urban farms, community gardens, rooftop gardens, "
      "hydroponic operations, and other innovative food production systems in urban areas. "
      "Competitive grants fund planning and implementation projects that improve food access, "
      "build community capacity, and strengthen local food systems in cities and suburbs. "
      "Projects must be located in urban or peri-urban areas and benefit local communities."
    ),
    "max_amount": 250000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_urban_location": True,
      "requires_us_organization": True,
      "eligible_applicants": ["nonprofit", "local_government", "educational_institution", "farmer"],
    },
    "required_documents": [
      "Project proposal", "Site plan or urban farm description",
      "Budget narrative", "Community benefit documentation",
      "Organizational financial statements",
    ],
    "application_url": "https://www.nifa.usda.gov/grants/funding-opportunities/urban-agriculture-innovative-production",
    "official_source_url": "https://www.nifa.usda.gov",
    "slug": "urban-agriculture-innovative-production",
  },
  {
    "name": "Gus Schumacher Nutrition Incentive Program (GusNIP)",
    "agency": "USDA National Institute of Food and Agriculture",
    "category": "agricultural",
    "subcategory": "nutrition",
    "description": (
      "GusNIP funds nutrition incentive programs that increase the purchase and consumption "
      "of fruits and vegetables by low-income consumers at the point of sale in grocery stores, "
      "farmers markets, and other retail food locations. "
      "Produce prescription programs that provide fresh produce to patients with diet-related "
      "diseases are also funded. Projects must leverage SNAP or other federal nutrition benefits."
    ),
    "max_amount": 1000000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_nutrition_incentive_focus": True,
      "requires_us_organization": True,
      "eligible_applicants": ["nonprofit", "cooperative", "local_government", "healthcare_org"],
    },
    "required_documents": [
      "Project narrative", "Budget and justification",
      "Retailer or healthcare partner agreements",
      "Evaluation plan", "Data management plan",
      "Organizational financial statements",
    ],
    "application_url": "https://www.nifa.usda.gov/grants/funding-opportunities/gus-schumacher-nutrition-incentive-program",
    "official_source_url": "https://www.nifa.usda.gov",
    "slug": "gus-schumacher-nutrition-incentive",
  },
  {
    "name": "Agricultural Microenterprise Development Program",
    "agency": "USDA Rural Development",
    "category": "agricultural",
    "subcategory": "small_farm",
    "description": (
      "This program provides grants to microenterprise development organizations that support "
      "small agricultural businesses and farms with 10 or fewer employees in rural areas. "
      "Funds support technical assistance, training, and microloans for small farm operations "
      "and food-related rural microenterprises. "
      "Recipients must serve rural areas and demonstrate experience assisting agricultural microenterprises."
    ),
    "max_amount": 50000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_rural": True,
      "max_employees": 10,
      "requires_agricultural_focus": True,
    },
    "required_documents": [
      "Organizational application", "Financial statements",
      "Technical assistance plan", "Rural area certification",
      "Agricultural microenterprise portfolio documentation",
    ],
    "application_url": "https://www.rd.usda.gov/programs-services/business-programs/rural-microentrepreneur-assistance-program",
    "official_source_url": "https://www.rd.usda.gov",
    "slug": "agricultural-microenterprise-development",
  },
  {
    "name": "Rural Energy for America Program (REAP)",
    "agency": "USDA Rural Development",
    "category": "agricultural",
    "subcategory": "energy",
    "description": (
      "REAP provides grants and loan guarantees to agricultural producers and rural small "
      "businesses to purchase and install renewable energy systems and make energy efficiency "
      "improvements. Eligible renewable energy systems include solar, wind, small hydropower, "
      "and biomass. Grants cover up to 25% of eligible project costs and loan guarantees "
      "cover up to 75%."
    ),
    "max_amount": 500000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_agricultural_producer_or_rural_business": True,
      "requires_rural": True,
      "requires_us_business": True,
    },
    "required_documents": [
      "Application form (RD 4280-B)", "Energy audit or assessment",
      "Technical report", "Financial statements",
      "Cost estimates or bids", "Environmental review documentation",
    ],
    "application_url": "https://www.rd.usda.gov/programs-services/energy-programs/rural-energy-america-program-renewable-energy-systems-energy-efficiency",
    "official_source_url": "https://www.rd.usda.gov",
    "slug": "rural-energy-for-america-reap",
  },

  # ── RESEARCH ─────────────────────────────────────────────────────────────────
  {
    "name": "NIH R01 Research Project Grant",
    "agency": "National Institutes of Health",
    "category": "research",
    "subcategory": "biomedical",
    "description": (
      "The NIH R01 is the flagship research project grant that supports a discrete, specified, "
      "circumscribed project in biomedical, behavioral, or clinical research conducted by "
      "an investigator with a defined set of aims and methods. "
      "Awards are typically made for four to five years and can be renewed competitively. "
      "Investigators must be affiliated with an eligible US institution and hold an advanced degree."
    ),
    "max_amount": 500000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_us_institution": True,
      "requires_advanced_degree": True,
      "industries": ["biomedical", "clinical", "behavioral_science"],
    },
    "required_documents": [
      "Research strategy", "Specific aims", "Biographical sketches (biosketch)",
      "Budget and justification", "Human subjects or vertebrate animals documentation",
      "Letters of support", "Resource sharing plan",
    ],
    "application_url": "https://grants.nih.gov/grants/funding/r01.htm",
    "official_source_url": "https://grants.nih.gov",
    "slug": "nih-r01-research-grant",
  },
  {
    "name": "NIH R21 Exploratory Research Grant",
    "agency": "National Institutes of Health",
    "category": "research",
    "subcategory": "biomedical",
    "description": (
      "The NIH R21 supports small, exploratory and developmental research projects with "
      "up to two years of funding and a total budget not exceeding $275,000 in direct costs. "
      "R21 grants are intended for high-risk, high-reward pilot studies that generate "
      "preliminary data to support future larger R01 applications. "
      "Preliminary data are not required but the proposed research must be innovative."
    ),
    "max_amount": 275000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_us_institution": True,
      "requires_advanced_degree": True,
      "industries": ["biomedical", "clinical", "behavioral_science"],
    },
    "required_documents": [
      "Research strategy (6-page limit)", "Specific aims",
      "Biographical sketches", "Budget and justification",
      "Human subjects documentation",
    ],
    "application_url": "https://grants.nih.gov/grants/funding/r21.htm",
    "official_source_url": "https://grants.nih.gov",
    "slug": "nih-r21-exploratory-research",
  },
  {
    "name": "NSF Research Grants",
    "agency": "National Science Foundation",
    "category": "research",
    "subcategory": "basic_science",
    "description": (
      "NSF provides research grants across all fields of fundamental science and engineering "
      "through its disciplinary directorates including biology, computer science, geosciences, "
      "mathematics, physics, and social sciences. "
      "Awards support individual investigator and collaborative projects that advance knowledge "
      "and have potential for broader societal impact. "
      "Applications are reviewed through a merit review process evaluating intellectual merit and broader impacts."
    ),
    "max_amount": 500000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_us_institution": True,
      "requires_advanced_degree": True,
      "industries": ["science", "technology", "engineering", "mathematics"],
    },
    "required_documents": [
      "Project description", "Project summary", "Biographical sketches",
      "Budget and budget justification", "Facilities and resources",
      "Data management plan",
    ],
    "application_url": "https://www.nsf.gov/funding",
    "official_source_url": "https://www.nsf.gov",
    "slug": "nsf-research-grants",
  },
  {
    "name": "DOE Office of Science Grants",
    "agency": "U.S. Department of Energy",
    "category": "research",
    "subcategory": "physical_science",
    "description": (
      "DOE Office of Science funds basic research in physics, chemistry, materials science, "
      "biology, computational science, and climate science that underpins US energy and "
      "national security missions. "
      "Programs include Advanced Scientific Computing Research, Basic Energy Sciences, "
      "Biological and Environmental Research, Fusion Energy Sciences, High Energy Physics, "
      "and Nuclear Physics. Awards are made to universities, national labs, and industry."
    ),
    "max_amount": 2000000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_us_institution": True,
      "requires_advanced_degree": True,
      "industries": ["physics", "chemistry", "materials_science", "computing", "energy"],
    },
    "required_documents": [
      "Technical proposal", "Budget and justification", "Biographical sketches",
      "Facilities and resources", "Letters of intent (if required)",
      "Human subjects or animal use documentation",
    ],
    "application_url": "https://science.osti.gov/grants",
    "official_source_url": "https://science.osti.gov",
    "slug": "doe-office-of-science-grants",
  },
  {
    "name": "NASA Space Grant",
    "agency": "National Aeronautics and Space Administration",
    "category": "research",
    "subcategory": "aerospace",
    "description": (
      "NASA Space Grant funds a national network of university consortia that support "
      "aerospace research, education, and public service through fellowships, scholarships, "
      "and collaborative research projects. "
      "Each state has a Space Grant consortium that awards funds to universities, faculty, "
      "and students pursuing aerospace science, technology, engineering, and mathematics. "
      "Programs develop the next generation of aerospace scientists and engineers."
    ),
    "max_amount": 900000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_us_institution": True,
      "industries": ["aerospace", "science", "technology", "engineering", "mathematics"],
    },
    "required_documents": [
      "Consortium application", "Research or education program proposal",
      "Budget narrative", "Biographical sketches",
      "Institutional letters of commitment",
    ],
    "application_url": "https://www.nasa.gov/stem/spacegrant",
    "official_source_url": "https://www.nasa.gov",
    "slug": "nasa-space-grant",
  },
  {
    "name": "DARPA Research Grants",
    "agency": "Defense Advanced Research Projects Agency",
    "category": "research",
    "subcategory": "defense",
    "description": (
      "DARPA funds high-risk, high-reward research that creates revolutionary capabilities "
      "for national defense in areas such as artificial intelligence, biotechnology, "
      "quantum computing, hypersonic systems, and electronic warfare. "
      "Program Managers identify specific research challenges and solicit proposals through "
      "Broad Agency Announcements. DARPA does not fund basic academic research; "
      "projects must have a clear transition path to military application."
    ),
    "max_amount": 2000000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_us_institution_or_company": True,
      "requires_defense_relevance": True,
      "industries": ["defense", "technology", "engineering", "computing", "biotechnology"],
    },
    "required_documents": [
      "Technical volume", "Management volume", "Cost/price volume",
      "Biographical sketches", "Facilities description",
      "Statement of work",
    ],
    "application_url": "https://www.darpa.mil/work-with-us/grants",
    "official_source_url": "https://www.darpa.mil",
    "slug": "darpa-research-grants",
  },
  {
    "name": "NOAA Sea Grant",
    "agency": "National Oceanic and Atmospheric Administration",
    "category": "research",
    "subcategory": "marine",
    "description": (
      "NOAA Sea Grant funds research, education, and extension programs that address "
      "the responsible use and stewardship of US coastal, marine, and Great Lakes resources. "
      "A national network of 34 university-based Sea Grant programs distributes federal "
      "funds to researchers and educators working on fisheries, aquaculture, coastal hazards, "
      "and ocean economy topics. Applicants must apply through their regional Sea Grant program."
    ),
    "max_amount": 300000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_us_institution": True,
      "requires_coastal_or_marine_focus": True,
      "industries": ["marine_science", "fisheries", "coastal_management", "aquaculture"],
    },
    "required_documents": [
      "Research proposal", "Project narrative", "Budget and justification",
      "Biographical sketches", "Letters of support",
      "Extension or outreach plan",
    ],
    "application_url": "https://seagrant.noaa.gov/apply",
    "official_source_url": "https://seagrant.noaa.gov",
    "slug": "noaa-sea-grant",
  },
  {
    "name": "ARPA-E Energy Innovation Grants",
    "agency": "U.S. Department of Energy",
    "category": "research",
    "subcategory": "energy",
    "description": (
      "ARPA-E funds transformational energy technology research that is too early for "
      "private investment but has the potential to radically change how the US generates, "
      "stores, and uses energy. "
      "Program Managers design focused programs targeting specific technical challenges "
      "and solicit proposals through open FOAs. "
      "ARPA-E prioritizes projects with very high potential impact and high technical risk."
    ),
    "max_amount": 5000000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_us_institution_or_company": True,
      "requires_energy_focus": True,
      "industries": ["energy", "technology", "engineering", "science"],
    },
    "required_documents": [
      "Concept paper (required for most FOAs)", "Full application",
      "Technical volume", "Budget and justification", "Biographical sketches",
      "Commercialization plan",
    ],
    "application_url": "https://arpa-e.energy.gov/technologies/programs",
    "official_source_url": "https://arpa-e.energy.gov",
    "slug": "arpa-e-energy-innovation-grants",
  },
  {
    "name": "NSF CAREER Award",
    "agency": "National Science Foundation",
    "category": "research",
    "subcategory": "basic_science",
    "description": (
      "The NSF Faculty Early Career Development Program is NSF's most prestigious award "
      "for early-career faculty who exemplify the role of teacher-scholars through "
      "outstanding research integrated with excellent education. "
      "Awards of up to $500,000 over five years support junior faculty developing a "
      "research program and educational activities that build a firm foundation for "
      "a lifetime of integrated contributions to research and education."
    ),
    "max_amount": 500000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_us_institution": True,
      "requires_junior_faculty": True,
      "requires_tenure_track": True,
      "industries": ["science", "technology", "engineering", "mathematics"],
    },
    "required_documents": [
      "Project description (15-page limit)", "Education activities description",
      "Biographical sketch", "Budget and justification",
      "Facilities and resources", "Data management plan",
    ],
    "application_url": "https://www.nsf.gov/funding/pgm_summ.jsp?pims_id=503214",
    "official_source_url": "https://www.nsf.gov",
    "slug": "nsf-career-award",
  },
  {
    "name": "DOD Basic Research Program",
    "agency": "U.S. Department of Defense",
    "category": "research",
    "subcategory": "defense",
    "description": (
      "DOD basic research programs at Army Research Office, Office of Naval Research, "
      "and Air Force Office of Scientific Research fund fundamental research in science "
      "and engineering that advances knowledge relevant to defense missions. "
      "Awards support university investigators exploring phenomena in areas including "
      "materials, chemistry, electronics, fluid dynamics, and cognitive sciences. "
      "Research results must be freely publishable."
    ),
    "max_amount": 1000000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_us_institution": True,
      "requires_advanced_degree": True,
      "industries": ["science", "engineering", "technology", "mathematics"],
    },
    "required_documents": [
      "White paper or full proposal", "Technical narrative",
      "Budget and justification", "Biographical sketches",
      "Facilities and resources",
    ],
    "application_url": "https://www.defense.gov/News/Contracts",
    "official_source_url": "https://www.defense.gov",
    "slug": "dod-basic-research-program",
  },
  {
    "name": "CDC Research Grants",
    "agency": "Centers for Disease Control and Prevention",
    "category": "research",
    "subcategory": "public_health",
    "description": (
      "CDC research grants fund studies that advance public health science and translate "
      "evidence into practice to prevent disease, disability, and death. "
      "Priority areas include chronic disease prevention, infectious disease surveillance, "
      "injury prevention, environmental health, and health disparities research. "
      "Awards are made to domestic and international universities, public health agencies, and nonprofits."
    ),
    "max_amount": 500000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_us_institution": True,
      "requires_public_health_focus": True,
      "industries": ["public_health", "medicine", "epidemiology"],
    },
    "required_documents": [
      "Research narrative", "Project summary", "Biographical sketches",
      "Budget and justification", "Human subjects documentation",
      "Evaluation and performance measurement plan",
    ],
    "application_url": "https://www.cdc.gov/grants/index.html",
    "official_source_url": "https://www.cdc.gov",
    "slug": "cdc-research-grants",
  },
  {
    "name": "USDA Agricultural Research Grants (AFRI)",
    "agency": "USDA National Institute of Food and Agriculture",
    "category": "research",
    "subcategory": "agriculture",
    "description": (
      "NIFA's Agriculture and Food Research Initiative is the largest competitive grants "
      "program for agricultural sciences, funding fundamental and applied research in "
      "plant and animal health, food safety, sustainable bioenergy, nutrition, and rural development. "
      "Awards range from small exploratory projects to large integrated research, education, "
      "and extension projects. Priority areas are updated annually through the Farm Bill."
    ),
    "max_amount": 500000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_us_institution": True,
      "requires_agricultural_or_food_focus": True,
      "eligible_applicants": ["university", "nonprofit", "state_agency", "small_business"],
    },
    "required_documents": [
      "Project narrative", "Project summary", "Biographical sketches",
      "Budget and justification", "Data management plan",
      "Logic model", "Human subjects or animal use documentation",
    ],
    "application_url": "https://www.nifa.usda.gov/grants/funding-opportunities/agriculture-food-research-initiative",
    "official_source_url": "https://www.nifa.usda.gov",
    "slug": "usda-afri-research-grants",
  },
  {
    "name": "EPA Science to Achieve Results (STAR) Grants",
    "agency": "Environmental Protection Agency",
    "category": "research",
    "subcategory": "environmental",
    "description": (
      "EPA STAR grants fund peer-reviewed environmental and public health research at "
      "universities and research institutions across the US. "
      "Priority research areas include air quality, climate change, water quality, "
      "human health risk assessment, and environmental justice. "
      "All STAR-funded research must undergo independent scientific peer review and "
      "results are made publicly available."
    ),
    "max_amount": 800000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_us_institution": True,
      "requires_environmental_or_health_focus": True,
      "eligible_applicants": ["university", "nonprofit_research_institution"],
    },
    "required_documents": [
      "Research narrative", "Project summary", "Biographical sketches",
      "Budget and justification", "Human subjects documentation",
      "Quality assurance project plan",
    ],
    "application_url": "https://www.epa.gov/research-grants/science-achieve-results-star-research-program",
    "official_source_url": "https://www.epa.gov",
    "slug": "epa-star-grants",
  },
  {
    "name": "NEH Scholarly Editions and Translations Grants",
    "agency": "National Endowment for the Humanities",
    "category": "research",
    "subcategory": "humanities",
    "description": (
      "NEH Scholarly Editions and Translations grants support the preparation of "
      "authoritative and annotated editions of texts and documents that are important "
      "to research in the humanities. "
      "Funded editions may include print or digital formats and cover materials ranging "
      "from ancient manuscripts to modern correspondence and historical documents. "
      "Projects must be based at US nonprofit institutions."
    ),
    "max_amount": 310000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_us_nonprofit_institution": True,
      "requires_humanities_focus": True,
      "industries": ["humanities", "history", "literature", "languages"],
    },
    "required_documents": [
      "Application narrative", "Work plan", "Biographical sketches",
      "Budget and justification", "Sample of editorial work",
      "Letters of recommendation",
    ],
    "application_url": "https://www.neh.gov/grants/research/scholarly-editions-and-translations-grants",
    "official_source_url": "https://www.neh.gov",
    "slug": "neh-scholarly-editions-grant",
  },
  {
    "name": "Smithsonian Institution Fellowships",
    "agency": "Smithsonian Institution",
    "category": "research",
    "subcategory": "humanities",
    "description": (
      "Smithsonian fellowships support research in residence at Smithsonian museums, "
      "research centers, and the National Zoo by graduate students, predoctoral students, "
      "postdoctoral researchers, and senior scholars. "
      "Fellows conduct independent research using Smithsonian collections, facilities, "
      "and staff expertise in disciplines including anthropology, art history, environmental "
      "science, evolutionary biology, and astrophysics."
    ),
    "max_amount": 55000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_advanced_degree_or_enrollment": True,
      "requires_research_alignment": True,
      "industries": ["natural_history", "art_history", "anthropology", "science", "humanities"],
    },
    "required_documents": [
      "Application form", "Research proposal",
      "Biographical sketch", "Three letters of recommendation",
      "Academic transcripts", "Writing sample",
    ],
    "application_url": "https://www.si.edu/ofg/fell",
    "official_source_url": "https://www.si.edu",
    "slug": "smithsonian-institution-fellowships",
  },
  {
    "name": "Howard Hughes Medical Institute Investigator Program",
    "agency": "Howard Hughes Medical Institute",
    "category": "research",
    "subcategory": "biomedical",
    "description": (
      "HHMI funds exceptional early- and mid-career biomedical scientists through its "
      "Investigator Program, providing long-term, flexible support that enables investigators "
      "to take intellectual risks and pursue pioneering research. "
      "Investigators are selected through a rigorous competition emphasizing the individual "
      "scientist over the proposed research. "
      "HHMI Investigators are employed by their host institutions but receive HHMI salary and research support."
    ),
    "max_amount": 1000000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_us_institution": True,
      "requires_advanced_degree": True,
      "requires_biomedical_focus": True,
      "industries": ["biomedical", "genetics", "neuroscience", "immunology", "biochemistry"],
    },
    "required_documents": [
      "Scientific biography", "Research plan",
      "Institutional letter of support", "Nomination letter",
      "Publications list", "Proposed budget",
    ],
    "application_url": "https://www.hhmi.org/programs/investigators",
    "official_source_url": "https://www.hhmi.org",
    "slug": "hhmi-investigator-program",
  },
  {
    "name": "Simons Foundation Research Grants",
    "agency": "Simons Foundation",
    "category": "research",
    "subcategory": "basic_science",
    "description": (
      "The Simons Foundation funds research in mathematics, theoretical physics, and "
      "the life sciences, with an emphasis on basic, discovery-driven science. "
      "Programs include the Simons Investigators Award for outstanding scientists, "
      "collaborative grants for large interdisciplinary teams, and fellowship programs "
      "for early-career researchers. "
      "The foundation prioritizes rigorous, curiosity-driven research with long time horizons."
    ),
    "max_amount": 500000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_advanced_degree": True,
      "requires_us_or_international_institution": True,
      "industries": ["mathematics", "physics", "life_sciences", "computing"],
    },
    "required_documents": [
      "Research proposal", "Biographical sketch",
      "Publications list", "Budget and justification",
      "Letters of reference",
    ],
    "application_url": "https://www.simonsfoundation.org/funding-opportunities",
    "official_source_url": "https://www.simonsfoundation.org",
    "slug": "simons-foundation-research-grants",
  },
  {
    "name": "American Cancer Society Research Grants",
    "agency": "American Cancer Society",
    "category": "research",
    "subcategory": "health",
    "description": (
      "The American Cancer Society funds a broad portfolio of cancer research through "
      "its intramural grants program, supporting investigators studying cancer biology, "
      "prevention, early detection, treatment, and survivorship. "
      "Research Scholar Grants support established investigators while Postdoctoral "
      "Fellowships and Institutional Research Grants support early-career researchers. "
      "All ACS-funded research must have the potential to reduce the burden of cancer."
    ),
    "max_amount": 750000,
    "is_recurring": True,
    "eligibility_criteria": {
      "requires_us_institution": True,
      "requires_cancer_focus": True,
      "requires_advanced_degree": True,
      "industries": ["oncology", "biomedical", "public_health"],
    },
    "required_documents": [
      "Research proposal", "Specific aims page",
      "Biographical sketch", "Budget and justification",
      "Institutional letter of support", "Human subjects or animal use documentation",
    ],
    "application_url": "https://www.cancer.org/research/we-fund-cancer-research/apply-for-a-grant.html",
    "official_source_url": "https://www.cancer.org",
    "slug": "american-cancer-society-research-grants",
  },
]


def sql_str(s: str) -> str:
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

out_path = "/Users/yonatanlivshits/Downloads/grant-finder/seed-batch-2.sql"
ag  = [g for g in GRANTS if g["category"] == "agricultural"]
res = [g for g in GRANTS if g["category"] == "research"]

lines = [
    "-- ============================================================",
    "-- seed-batch-2.sql  —  Agricultural (20) + Research (18)",
    f"-- {len(GRANTS)} grants total",
    "-- Run in Supabase SQL editor. Skips duplicates via ON CONFLICT.",
    "-- ============================================================",
    "",
    f"-- ── AGRICULTURAL ({len(ag)}) ───────────────────────────────────────", "",
]
for g in ag:
    lines += [grant_to_sql(g), ""]

lines += [f"-- ── RESEARCH ({len(res)}) ──────────────────────────────────────────", ""]
for g in res:
    lines += [grant_to_sql(g), ""]

with open(out_path, "w") as f:
    f.write("\n".join(lines))

# Checks
slugs = [g["slug"] for g in GRANTS]
dupes = [s for s in slugs if slugs.count(s) > 1]
print(f"✓ Wrote {len(GRANTS)} grants to {out_path}")
print(f"  Agricultural : {len(ag)}")
print(f"  Research     : {len(res)}")
print(f"  {'✗ DUPLICATE SLUGS: ' + str(set(dupes)) if dupes else '✓ All slugs unique'}")
