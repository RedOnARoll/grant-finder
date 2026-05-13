-- ============================================================
-- seed-batch-2.sql  —  Agricultural (20) + Research (18)
-- 38 grants total
-- Run in Supabase SQL editor. Skips duplicates via ON CONFLICT.
-- ============================================================

-- ── AGRICULTURAL (20) ───────────────────────────────────────

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'USDA Value-Added Producer Grant (VAPG)',
  'USDA Rural Development',
  'agricultural',
  'marketing',
  'VAPG helps agricultural producers enter value-added markets by funding planning activities and working capital for processing, marketing, and distributing value-added agricultural products such as jams, cheeses, and specialty meats. Grants give priority to beginning farmers, socially disadvantaged producers, and mid-tier value chains.',
  250000,
  true,
  NULL,
  '{"requires_agricultural_producer": true, "requires_us_farmer": true, "requires_value_added_product": true}'::jsonb,
  '["Business plan", "Feasibility study", "Producer eligibility documentation", "Financial statements", "Budget narrative", "Letters of support"]'::jsonb,
  'https://www.rd.usda.gov/programs-services/business-programs/value-added-producer-grants',
  'https://www.rd.usda.gov',
  '[]'::jsonb,
  NULL,
  'usda-value-added-producer-grant'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Sustainable Agriculture Research and Education (SARE) Grants',
  'USDA National Institute of Food and Agriculture',
  'agricultural',
  'research',
  'SARE funds research and education projects that advance sustainable farming and ranching systems that are profitable, environmentally sound, and good for communities. Four regional SARE programs offer grants to farmers, researchers, educators, and agricultural professionals across the country. Projects must address economic, environmental, and social dimensions of sustainability.',
  400000,
  true,
  NULL,
  '{"requires_us_organization": true, "eligible_applicants": ["farmer", "researcher", "educator", "agricultural_professional"]}'::jsonb,
  '["Project proposal", "Budget narrative", "CV or resume", "Collaborator agreements", "Farmer cooperator letters"]'::jsonb,
  'https://www.sare.org/grants',
  'https://www.sare.org',
  '[]'::jsonb,
  NULL,
  'sare-sustainable-agriculture'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Beginning Farmer and Rancher Development Program',
  'USDA National Institute of Food and Agriculture',
  'agricultural',
  'training',
  'BFRDP funds organizations to develop and offer education, mentoring, and technical assistance programs for beginning farmers and ranchers with 10 or fewer years of experience. Programs help new agricultural producers develop the skills, knowledge, and networks needed to establish and grow successful farm operations. Priority is given to programs serving veterans, socially disadvantaged, and immigrant farmers.',
  250000,
  true,
  NULL,
  '{"requires_us_organization": true, "serves_beginning_farmers": true, "max_farming_experience_years": 10}'::jsonb,
  '["Project narrative", "Budget and budget justification", "Organizational capability statement", "Partner letters of commitment", "Logic model", "Evaluation plan"]'::jsonb,
  'https://www.nifa.usda.gov/grants/funding-opportunities/beginning-farmer-rancher-development-program',
  'https://www.nifa.usda.gov',
  '[]'::jsonb,
  NULL,
  'beginning-farmer-rancher-development'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Environmental Quality Incentives Program (EQIP)',
  'USDA Natural Resources Conservation Service',
  'agricultural',
  'conservation',
  'EQIP provides financial and technical assistance to farmers and ranchers to implement conservation practices that improve soil health, water quality, and wildlife habitat on working agricultural land. Payments cover a portion of the costs for installing conservation systems such as cover crops, nutrient management plans, and irrigation efficiency. Priority is given to projects addressing resource concerns in high-priority watersheds.',
  450000,
  true,
  NULL,
  '{"requires_agricultural_producer": true, "requires_us_farmer": true, "requires_owned_or_controlled_land": true}'::jsonb,
  '["NRCS application (CPA-1200)", "Farm operating plan", "Conservation plan", "Proof of land control", "Financial information"]'::jsonb,
  'https://www.nrcs.usda.gov/programs-initiatives/eqip-environmental-quality-incentives',
  'https://www.nrcs.usda.gov',
  '[]'::jsonb,
  NULL,
  'eqip-environmental-quality-incentives'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Conservation Stewardship Program (CSP)',
  'USDA Natural Resources Conservation Service',
  'agricultural',
  'conservation',
  'CSP rewards farmers and ranchers who maintain high levels of conservation performance and take on additional stewardship activities across their entire operation. Annual payments compensate producers for maintaining existing conservation systems and adopting new activities that address priority resource concerns. Contracts run for five years and are renewed based on continued performance.',
  40000,
  true,
  NULL,
  '{"requires_agricultural_producer": true, "requires_us_farmer": true, "requires_existing_conservation_activities": true, "requires_owned_or_controlled_land": true}'::jsonb,
  '["NRCS application", "Conservation performance assessment", "Farm operating plan", "Proof of land control", "Stewardship activity documentation"]'::jsonb,
  'https://www.nrcs.usda.gov/programs-initiatives/csp-conservation-stewardship-program',
  'https://www.nrcs.usda.gov',
  '[]'::jsonb,
  NULL,
  'conservation-stewardship-program'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Farm Storage Facility Loan Program',
  'USDA Farm Service Agency',
  'agricultural',
  'infrastructure',
  'The Farm Storage Facility Loan Program provides low-interest financing to build or upgrade on-farm storage and handling facilities for eligible commodities including grains, hay, fruits, vegetables, and aquaculture products. Loans help farmers reduce post-harvest losses and improve marketing flexibility by storing crops until prices improve. Terms range from 3 to 12 years depending on facility type.',
  500000,
  true,
  NULL,
  '{"requires_agricultural_producer": true, "requires_us_farmer": true, "requires_eligible_commodity": true}'::jsonb,
  '["FSA application (CCC-185)", "Construction plans or equipment quotes", "Farm operating plan", "Proof of production history", "Environmental compliance documentation"]'::jsonb,
  'https://www.fsa.usda.gov/programs-and-services/farm-loan-programs/farm-storage-facility-loans',
  'https://www.fsa.usda.gov',
  '[]'::jsonb,
  NULL,
  'farm-storage-facility-loan'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Specialty Crop Block Grant Program',
  'USDA Agricultural Marketing Service',
  'agricultural',
  'marketing',
  'The Specialty Crop Block Grant Program funds projects that enhance the competitiveness of specialty crops including fruits, vegetables, tree nuts, dried fruits, horticulture, and nursery crops. State departments of agriculture receive federal funds and award subgrants to eligible organizations for research, marketing, and food safety projects. Projects must solely benefit specialty crop producers.',
  200000,
  true,
  NULL,
  '{"requires_specialty_crop_focus": true, "requires_us_organization": true, "eligible_applicants": ["state_agency", "university", "nonprofit", "producer_group"]}'::jsonb,
  '["Project proposal", "Budget narrative", "Specialty crop benefit statement", "Organizational credentials", "Letters of support"]'::jsonb,
  'https://www.ams.usda.gov/services/grants/scbgp',
  'https://www.ams.usda.gov',
  '[]'::jsonb,
  NULL,
  'specialty-crop-block-grant'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Organic Agriculture Research and Extension Initiative',
  'USDA National Institute of Food and Agriculture',
  'agricultural',
  'research',
  'OREI funds research, extension, and education projects that advance organic farming systems, including organic production, marketing, and processing. Projects must address critical organic farmer and rancher needs and contribute to the development of a robust, science-based organic sector. Applicants must include a certified organic operation or operation transitioning to organic.',
  2000000,
  true,
  NULL,
  '{"requires_organic_focus": true, "requires_us_institution": true, "requires_organic_farmer_partner": true}'::jsonb,
  '["Project narrative", "Budget and justification", "CV for key personnel", "Organic certification documentation", "Partner letters", "Data management plan"]'::jsonb,
  'https://www.nifa.usda.gov/grants/funding-opportunities/organic-agriculture-research-extension-initiative',
  'https://www.nifa.usda.gov',
  '[]'::jsonb,
  NULL,
  'organic-agriculture-research-initiative'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Livestock Forage Disaster Program (LFP)',
  'USDA Farm Service Agency',
  'agricultural',
  'disaster_relief',
  'LFP provides compensation to eligible livestock producers who suffer grazing losses due to drought or fire on federally managed lands. Payments help ranchers offset the cost of purchasing supplemental feed when drought reduces normal grazing capacity on their land. Eligible producers must have suffered qualifying losses during a program year with a drought intensity of D2 or higher on the drought monitor.',
  0,
  true,
  NULL,
  '{"requires_livestock_producer": true, "requires_us_farmer": true, "requires_drought_or_fire_loss": true}'::jsonb,
  '["FSA application (CCC-855)", "Livestock inventory records", "Grazing lease or land ownership documentation", "Drought certification", "Agricultural records"]'::jsonb,
  'https://www.fsa.usda.gov/programs-and-services/disaster-assistance-program/livestock-forage',
  'https://www.fsa.usda.gov',
  '[]'::jsonb,
  NULL,
  'livestock-forage-disaster-program'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Emergency Livestock Assistance Program (ELAP)',
  'USDA Farm Service Agency',
  'agricultural',
  'disaster_relief',
  'ELAP provides emergency assistance to eligible livestock, honeybee, and farm-raised fish producers who suffer losses due to disasters not covered by other FSA programs. Covered losses include feed and grazing losses, livestock death losses, and costs associated with transporting water during drought. Producers must report losses to their local FSA office within 30 days of the disaster.',
  0,
  true,
  NULL,
  '{"requires_livestock_producer": true, "requires_us_farmer": true, "requires_eligible_disaster_loss": true}'::jsonb,
  '["FSA application (CCC-851)", "Loss documentation", "Livestock inventory records", "Veterinary records (if applicable)", "Agricultural operations records"]'::jsonb,
  'https://www.fsa.usda.gov/programs-and-services/disaster-assistance-program/emergency-livestock-assistance',
  'https://www.fsa.usda.gov',
  '[]'::jsonb,
  NULL,
  'emergency-livestock-assistance-program'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Noninsured Crop Disaster Assistance Program (NAP)',
  'USDA Farm Service Agency',
  'agricultural',
  'disaster_relief',
  'NAP provides financial assistance to producers of non-insurable crops — those not eligible for federal crop insurance — when low yields, loss of inventory, or prevented planting occur due to natural disasters. Coverage is available for crops grown for food, fiber, livestock feed, and specialty crops. Producers must apply for coverage at their local FSA office before the application closing date.',
  0,
  true,
  NULL,
  '{"requires_agricultural_producer": true, "requires_us_farmer": true, "requires_non_insurable_crop": true}'::jsonb,
  '["FSA application (CCC-471)", "Crop production records", "Acreage report", "Service fee payment", "Loss notice"]'::jsonb,
  'https://www.fsa.usda.gov/programs-and-services/disaster-assistance-program/noninsured-crop-disaster-assistance',
  'https://www.fsa.usda.gov',
  '[]'::jsonb,
  NULL,
  'noninsured-crop-disaster-assistance'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Agricultural Conservation Easement Program (ACEP)',
  'USDA Natural Resources Conservation Service',
  'agricultural',
  'conservation',
  'ACEP helps landowners, land trusts, and other entities protect, restore, and enhance wetlands and preserve working agricultural lands through conservation easements. The program pays landowners fair market value for voluntarily limiting development and other uses that are incompatible with agricultural production or wetland conservation. Easements are permanent and run with the land regardless of future ownership.',
  0,
  true,
  NULL,
  '{"requires_agricultural_land": true, "requires_landowner_or_entity": true, "requires_us_land": true}'::jsonb,
  '["NRCS application (CPA-1200)", "Deed and title documentation", "Appraisal", "Conservation easement deed draft", "Environmental assessment", "Baseline documentation report"]'::jsonb,
  'https://www.nrcs.usda.gov/programs-initiatives/acep-agricultural-conservation-easement-program',
  'https://www.nrcs.usda.gov',
  '[]'::jsonb,
  NULL,
  'agricultural-conservation-easement-program'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Regional Food System Partnerships Program',
  'USDA Agricultural Marketing Service',
  'agricultural',
  'food_systems',
  'RFSP funds partnerships that connect local and regional food producers with markets, supply chain partners, and consumers to build more resilient food systems. Grants support activities such as aggregation, distribution, food hubs, and market development that increase access to locally and regionally produced food. Projects must demonstrate collaboration between multiple food system stakeholders.',
  1000000,
  true,
  NULL,
  '{"requires_food_system_partnership": true, "requires_us_organization": true, "eligible_applicants": ["nonprofit", "cooperative", "local_government", "tribal_government"]}'::jsonb,
  '["Project narrative", "Partnership agreements", "Budget and justification", "Organizational capability statement", "Food system assessment", "Logic model"]'::jsonb,
  'https://www.ams.usda.gov/services/grants/rfsp',
  'https://www.ams.usda.gov',
  '[]'::jsonb,
  NULL,
  'regional-food-system-partnerships'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Farmers Market Promotion Program (FMPP)',
  'USDA Agricultural Marketing Service',
  'agricultural',
  'marketing',
  'FMPP provides competitive grants to support the development, improvement, and expansion of direct producer-to-consumer markets such as farmers markets, roadside stands, community supported agriculture programs, agritourism activities, and online sales. Projects must directly benefit agricultural producers and help them access new markets. Grants are capped at $500,000 and do not require matching funds.',
  500000,
  true,
  NULL,
  '{"requires_agricultural_producer_benefit": true, "requires_us_organization": true, "eligible_applicants": ["agricultural_cooperative", "nonprofit", "producer_network", "local_government"]}'::jsonb,
  '["Project proposal", "Budget narrative", "Producer benefit documentation", "Organizational financial statements", "Letters of support from producers"]'::jsonb,
  'https://www.ams.usda.gov/services/grants/fmpp',
  'https://www.ams.usda.gov',
  '[]'::jsonb,
  NULL,
  'farmers-market-promotion-program'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Local Food Promotion Program (LFPP)',
  'USDA Agricultural Marketing Service',
  'agricultural',
  'food_systems',
  'LFPP funds projects that develop, improve, and expand intermediary supply chain infrastructure and capacity that connects local and regional food producers to wholesale, retail, institutional, or other markets. Grants support food hubs, aggregation facilities, and distribution networks that increase regional food system capacity. Projects must benefit local agricultural producers.',
  500000,
  true,
  NULL,
  '{"requires_local_food_focus": true, "requires_us_organization": true, "eligible_applicants": ["nonprofit", "cooperative", "local_government", "food_hub"]}'::jsonb,
  '["Project narrative", "Budget and justification", "Supply chain analysis", "Organizational financial statements", "Producer partnership agreements"]'::jsonb,
  'https://www.ams.usda.gov/services/grants/lfpp',
  'https://www.ams.usda.gov',
  '[]'::jsonb,
  NULL,
  'local-food-promotion-program'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Socially Disadvantaged Farmers and Ranchers Grant',
  'USDA National Institute of Food and Agriculture',
  'agricultural',
  'equity',
  'This program funds cooperatives, associations, and other organizations to provide technical assistance, outreach, and education to socially disadvantaged farmers and ranchers including women, minorities, and other historically underserved groups. Projects help disadvantaged producers access USDA programs, capital, and markets. Grants prioritize organizations with demonstrated experience serving target populations.',
  5000000,
  true,
  NULL,
  '{"requires_underserved_farmer_focus": true, "requires_us_organization": true, "eligible_applicants": ["cooperative", "nonprofit", "university", "state_agency"]}'::jsonb,
  '["Project narrative", "Budget and justification", "Organizational capability statement", "Data on population served", "Partner letters", "Evaluation plan"]'::jsonb,
  'https://www.nifa.usda.gov/grants/funding-opportunities/socially-disadvantaged-farmers-ranchers-policy-research-center',
  'https://www.nifa.usda.gov',
  '[]'::jsonb,
  NULL,
  'socially-disadvantaged-farmers-grant'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Urban Agriculture and Innovative Production Grants',
  'USDA National Institute of Food and Agriculture',
  'agricultural',
  'urban',
  'UAIP grants support the development of urban farms, community gardens, rooftop gardens, hydroponic operations, and other innovative food production systems in urban areas. Competitive grants fund planning and implementation projects that improve food access, build community capacity, and strengthen local food systems in cities and suburbs. Projects must be located in urban or peri-urban areas and benefit local communities.',
  250000,
  true,
  NULL,
  '{"requires_urban_location": true, "requires_us_organization": true, "eligible_applicants": ["nonprofit", "local_government", "educational_institution", "farmer"]}'::jsonb,
  '["Project proposal", "Site plan or urban farm description", "Budget narrative", "Community benefit documentation", "Organizational financial statements"]'::jsonb,
  'https://www.nifa.usda.gov/grants/funding-opportunities/urban-agriculture-innovative-production',
  'https://www.nifa.usda.gov',
  '[]'::jsonb,
  NULL,
  'urban-agriculture-innovative-production'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Gus Schumacher Nutrition Incentive Program (GusNIP)',
  'USDA National Institute of Food and Agriculture',
  'agricultural',
  'nutrition',
  'GusNIP funds nutrition incentive programs that increase the purchase and consumption of fruits and vegetables by low-income consumers at the point of sale in grocery stores, farmers markets, and other retail food locations. Produce prescription programs that provide fresh produce to patients with diet-related diseases are also funded. Projects must leverage SNAP or other federal nutrition benefits.',
  1000000,
  true,
  NULL,
  '{"requires_nutrition_incentive_focus": true, "requires_us_organization": true, "eligible_applicants": ["nonprofit", "cooperative", "local_government", "healthcare_org"]}'::jsonb,
  '["Project narrative", "Budget and justification", "Retailer or healthcare partner agreements", "Evaluation plan", "Data management plan", "Organizational financial statements"]'::jsonb,
  'https://www.nifa.usda.gov/grants/funding-opportunities/gus-schumacher-nutrition-incentive-program',
  'https://www.nifa.usda.gov',
  '[]'::jsonb,
  NULL,
  'gus-schumacher-nutrition-incentive'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Agricultural Microenterprise Development Program',
  'USDA Rural Development',
  'agricultural',
  'small_farm',
  'This program provides grants to microenterprise development organizations that support small agricultural businesses and farms with 10 or fewer employees in rural areas. Funds support technical assistance, training, and microloans for small farm operations and food-related rural microenterprises. Recipients must serve rural areas and demonstrate experience assisting agricultural microenterprises.',
  50000,
  true,
  NULL,
  '{"requires_rural": true, "max_employees": 10, "requires_agricultural_focus": true}'::jsonb,
  '["Organizational application", "Financial statements", "Technical assistance plan", "Rural area certification", "Agricultural microenterprise portfolio documentation"]'::jsonb,
  'https://www.rd.usda.gov/programs-services/business-programs/rural-microentrepreneur-assistance-program',
  'https://www.rd.usda.gov',
  '[]'::jsonb,
  NULL,
  'agricultural-microenterprise-development'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Rural Energy for America Program (REAP)',
  'USDA Rural Development',
  'agricultural',
  'energy',
  'REAP provides grants and loan guarantees to agricultural producers and rural small businesses to purchase and install renewable energy systems and make energy efficiency improvements. Eligible renewable energy systems include solar, wind, small hydropower, and biomass. Grants cover up to 25% of eligible project costs and loan guarantees cover up to 75%.',
  500000,
  true,
  NULL,
  '{"requires_agricultural_producer_or_rural_business": true, "requires_rural": true, "requires_us_business": true}'::jsonb,
  '["Application form (RD 4280-B)", "Energy audit or assessment", "Technical report", "Financial statements", "Cost estimates or bids", "Environmental review documentation"]'::jsonb,
  'https://www.rd.usda.gov/programs-services/energy-programs/rural-energy-america-program-renewable-energy-systems-energy-efficiency',
  'https://www.rd.usda.gov',
  '[]'::jsonb,
  NULL,
  'rural-energy-for-america-reap'
) ON CONFLICT (slug) DO NOTHING;

-- ── RESEARCH (18) ──────────────────────────────────────────

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'NIH R01 Research Project Grant',
  'National Institutes of Health',
  'research',
  'biomedical',
  'The NIH R01 is the flagship research project grant that supports a discrete, specified, circumscribed project in biomedical, behavioral, or clinical research conducted by an investigator with a defined set of aims and methods. Awards are typically made for four to five years and can be renewed competitively. Investigators must be affiliated with an eligible US institution and hold an advanced degree.',
  500000,
  true,
  NULL,
  '{"requires_us_institution": true, "requires_advanced_degree": true, "industries": ["biomedical", "clinical", "behavioral_science"]}'::jsonb,
  '["Research strategy", "Specific aims", "Biographical sketches (biosketch)", "Budget and justification", "Human subjects or vertebrate animals documentation", "Letters of support", "Resource sharing plan"]'::jsonb,
  'https://grants.nih.gov/grants/funding/r01.htm',
  'https://grants.nih.gov',
  '[]'::jsonb,
  NULL,
  'nih-r01-research-grant'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'NIH R21 Exploratory Research Grant',
  'National Institutes of Health',
  'research',
  'biomedical',
  'The NIH R21 supports small, exploratory and developmental research projects with up to two years of funding and a total budget not exceeding $275,000 in direct costs. R21 grants are intended for high-risk, high-reward pilot studies that generate preliminary data to support future larger R01 applications. Preliminary data are not required but the proposed research must be innovative.',
  275000,
  true,
  NULL,
  '{"requires_us_institution": true, "requires_advanced_degree": true, "industries": ["biomedical", "clinical", "behavioral_science"]}'::jsonb,
  '["Research strategy (6-page limit)", "Specific aims", "Biographical sketches", "Budget and justification", "Human subjects documentation"]'::jsonb,
  'https://grants.nih.gov/grants/funding/r21.htm',
  'https://grants.nih.gov',
  '[]'::jsonb,
  NULL,
  'nih-r21-exploratory-research'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'NSF Research Grants',
  'National Science Foundation',
  'research',
  'basic_science',
  'NSF provides research grants across all fields of fundamental science and engineering through its disciplinary directorates including biology, computer science, geosciences, mathematics, physics, and social sciences. Awards support individual investigator and collaborative projects that advance knowledge and have potential for broader societal impact. Applications are reviewed through a merit review process evaluating intellectual merit and broader impacts.',
  500000,
  true,
  NULL,
  '{"requires_us_institution": true, "requires_advanced_degree": true, "industries": ["science", "technology", "engineering", "mathematics"]}'::jsonb,
  '["Project description", "Project summary", "Biographical sketches", "Budget and budget justification", "Facilities and resources", "Data management plan"]'::jsonb,
  'https://www.nsf.gov/funding',
  'https://www.nsf.gov',
  '[]'::jsonb,
  NULL,
  'nsf-research-grants'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'DOE Office of Science Grants',
  'U.S. Department of Energy',
  'research',
  'physical_science',
  'DOE Office of Science funds basic research in physics, chemistry, materials science, biology, computational science, and climate science that underpins US energy and national security missions. Programs include Advanced Scientific Computing Research, Basic Energy Sciences, Biological and Environmental Research, Fusion Energy Sciences, High Energy Physics, and Nuclear Physics. Awards are made to universities, national labs, and industry.',
  2000000,
  true,
  NULL,
  '{"requires_us_institution": true, "requires_advanced_degree": true, "industries": ["physics", "chemistry", "materials_science", "computing", "energy"]}'::jsonb,
  '["Technical proposal", "Budget and justification", "Biographical sketches", "Facilities and resources", "Letters of intent (if required)", "Human subjects or animal use documentation"]'::jsonb,
  'https://science.osti.gov/grants',
  'https://science.osti.gov',
  '[]'::jsonb,
  NULL,
  'doe-office-of-science-grants'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'NASA Space Grant',
  'National Aeronautics and Space Administration',
  'research',
  'aerospace',
  'NASA Space Grant funds a national network of university consortia that support aerospace research, education, and public service through fellowships, scholarships, and collaborative research projects. Each state has a Space Grant consortium that awards funds to universities, faculty, and students pursuing aerospace science, technology, engineering, and mathematics. Programs develop the next generation of aerospace scientists and engineers.',
  900000,
  true,
  NULL,
  '{"requires_us_institution": true, "industries": ["aerospace", "science", "technology", "engineering", "mathematics"]}'::jsonb,
  '["Consortium application", "Research or education program proposal", "Budget narrative", "Biographical sketches", "Institutional letters of commitment"]'::jsonb,
  'https://www.nasa.gov/stem/spacegrant',
  'https://www.nasa.gov',
  '[]'::jsonb,
  NULL,
  'nasa-space-grant'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'DARPA Research Grants',
  'Defense Advanced Research Projects Agency',
  'research',
  'defense',
  'DARPA funds high-risk, high-reward research that creates revolutionary capabilities for national defense in areas such as artificial intelligence, biotechnology, quantum computing, hypersonic systems, and electronic warfare. Program Managers identify specific research challenges and solicit proposals through Broad Agency Announcements. DARPA does not fund basic academic research; projects must have a clear transition path to military application.',
  2000000,
  true,
  NULL,
  '{"requires_us_institution_or_company": true, "requires_defense_relevance": true, "industries": ["defense", "technology", "engineering", "computing", "biotechnology"]}'::jsonb,
  '["Technical volume", "Management volume", "Cost/price volume", "Biographical sketches", "Facilities description", "Statement of work"]'::jsonb,
  'https://www.darpa.mil/work-with-us/grants',
  'https://www.darpa.mil',
  '[]'::jsonb,
  NULL,
  'darpa-research-grants'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'NOAA Sea Grant',
  'National Oceanic and Atmospheric Administration',
  'research',
  'marine',
  'NOAA Sea Grant funds research, education, and extension programs that address the responsible use and stewardship of US coastal, marine, and Great Lakes resources. A national network of 34 university-based Sea Grant programs distributes federal funds to researchers and educators working on fisheries, aquaculture, coastal hazards, and ocean economy topics. Applicants must apply through their regional Sea Grant program.',
  300000,
  true,
  NULL,
  '{"requires_us_institution": true, "requires_coastal_or_marine_focus": true, "industries": ["marine_science", "fisheries", "coastal_management", "aquaculture"]}'::jsonb,
  '["Research proposal", "Project narrative", "Budget and justification", "Biographical sketches", "Letters of support", "Extension or outreach plan"]'::jsonb,
  'https://seagrant.noaa.gov/apply',
  'https://seagrant.noaa.gov',
  '[]'::jsonb,
  NULL,
  'noaa-sea-grant'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'ARPA-E Energy Innovation Grants',
  'U.S. Department of Energy',
  'research',
  'energy',
  'ARPA-E funds transformational energy technology research that is too early for private investment but has the potential to radically change how the US generates, stores, and uses energy. Program Managers design focused programs targeting specific technical challenges and solicit proposals through open FOAs. ARPA-E prioritizes projects with very high potential impact and high technical risk.',
  5000000,
  true,
  NULL,
  '{"requires_us_institution_or_company": true, "requires_energy_focus": true, "industries": ["energy", "technology", "engineering", "science"]}'::jsonb,
  '["Concept paper (required for most FOAs)", "Full application", "Technical volume", "Budget and justification", "Biographical sketches", "Commercialization plan"]'::jsonb,
  'https://arpa-e.energy.gov/technologies/programs',
  'https://arpa-e.energy.gov',
  '[]'::jsonb,
  NULL,
  'arpa-e-energy-innovation-grants'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'NSF CAREER Award',
  'National Science Foundation',
  'research',
  'basic_science',
  'The NSF Faculty Early Career Development Program is NSF''s most prestigious award for early-career faculty who exemplify the role of teacher-scholars through outstanding research integrated with excellent education. Awards of up to $500,000 over five years support junior faculty developing a research program and educational activities that build a firm foundation for a lifetime of integrated contributions to research and education.',
  500000,
  true,
  NULL,
  '{"requires_us_institution": true, "requires_junior_faculty": true, "requires_tenure_track": true, "industries": ["science", "technology", "engineering", "mathematics"]}'::jsonb,
  '["Project description (15-page limit)", "Education activities description", "Biographical sketch", "Budget and justification", "Facilities and resources", "Data management plan"]'::jsonb,
  'https://www.nsf.gov/funding/pgm_summ.jsp?pims_id=503214',
  'https://www.nsf.gov',
  '[]'::jsonb,
  NULL,
  'nsf-career-award'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'DOD Basic Research Program',
  'U.S. Department of Defense',
  'research',
  'defense',
  'DOD basic research programs at Army Research Office, Office of Naval Research, and Air Force Office of Scientific Research fund fundamental research in science and engineering that advances knowledge relevant to defense missions. Awards support university investigators exploring phenomena in areas including materials, chemistry, electronics, fluid dynamics, and cognitive sciences. Research results must be freely publishable.',
  1000000,
  true,
  NULL,
  '{"requires_us_institution": true, "requires_advanced_degree": true, "industries": ["science", "engineering", "technology", "mathematics"]}'::jsonb,
  '["White paper or full proposal", "Technical narrative", "Budget and justification", "Biographical sketches", "Facilities and resources"]'::jsonb,
  'https://www.defense.gov/News/Contracts',
  'https://www.defense.gov',
  '[]'::jsonb,
  NULL,
  'dod-basic-research-program'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'CDC Research Grants',
  'Centers for Disease Control and Prevention',
  'research',
  'public_health',
  'CDC research grants fund studies that advance public health science and translate evidence into practice to prevent disease, disability, and death. Priority areas include chronic disease prevention, infectious disease surveillance, injury prevention, environmental health, and health disparities research. Awards are made to domestic and international universities, public health agencies, and nonprofits.',
  500000,
  true,
  NULL,
  '{"requires_us_institution": true, "requires_public_health_focus": true, "industries": ["public_health", "medicine", "epidemiology"]}'::jsonb,
  '["Research narrative", "Project summary", "Biographical sketches", "Budget and justification", "Human subjects documentation", "Evaluation and performance measurement plan"]'::jsonb,
  'https://www.cdc.gov/grants/index.html',
  'https://www.cdc.gov',
  '[]'::jsonb,
  NULL,
  'cdc-research-grants'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'USDA Agricultural Research Grants (AFRI)',
  'USDA National Institute of Food and Agriculture',
  'research',
  'agriculture',
  'NIFA''s Agriculture and Food Research Initiative is the largest competitive grants program for agricultural sciences, funding fundamental and applied research in plant and animal health, food safety, sustainable bioenergy, nutrition, and rural development. Awards range from small exploratory projects to large integrated research, education, and extension projects. Priority areas are updated annually through the Farm Bill.',
  500000,
  true,
  NULL,
  '{"requires_us_institution": true, "requires_agricultural_or_food_focus": true, "eligible_applicants": ["university", "nonprofit", "state_agency", "small_business"]}'::jsonb,
  '["Project narrative", "Project summary", "Biographical sketches", "Budget and justification", "Data management plan", "Logic model", "Human subjects or animal use documentation"]'::jsonb,
  'https://www.nifa.usda.gov/grants/funding-opportunities/agriculture-food-research-initiative',
  'https://www.nifa.usda.gov',
  '[]'::jsonb,
  NULL,
  'usda-afri-research-grants'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'EPA Science to Achieve Results (STAR) Grants',
  'Environmental Protection Agency',
  'research',
  'environmental',
  'EPA STAR grants fund peer-reviewed environmental and public health research at universities and research institutions across the US. Priority research areas include air quality, climate change, water quality, human health risk assessment, and environmental justice. All STAR-funded research must undergo independent scientific peer review and results are made publicly available.',
  800000,
  true,
  NULL,
  '{"requires_us_institution": true, "requires_environmental_or_health_focus": true, "eligible_applicants": ["university", "nonprofit_research_institution"]}'::jsonb,
  '["Research narrative", "Project summary", "Biographical sketches", "Budget and justification", "Human subjects documentation", "Quality assurance project plan"]'::jsonb,
  'https://www.epa.gov/research-grants/science-achieve-results-star-research-program',
  'https://www.epa.gov',
  '[]'::jsonb,
  NULL,
  'epa-star-grants'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'NEH Scholarly Editions and Translations Grants',
  'National Endowment for the Humanities',
  'research',
  'humanities',
  'NEH Scholarly Editions and Translations grants support the preparation of authoritative and annotated editions of texts and documents that are important to research in the humanities. Funded editions may include print or digital formats and cover materials ranging from ancient manuscripts to modern correspondence and historical documents. Projects must be based at US nonprofit institutions.',
  310000,
  true,
  NULL,
  '{"requires_us_nonprofit_institution": true, "requires_humanities_focus": true, "industries": ["humanities", "history", "literature", "languages"]}'::jsonb,
  '["Application narrative", "Work plan", "Biographical sketches", "Budget and justification", "Sample of editorial work", "Letters of recommendation"]'::jsonb,
  'https://www.neh.gov/grants/research/scholarly-editions-and-translations-grants',
  'https://www.neh.gov',
  '[]'::jsonb,
  NULL,
  'neh-scholarly-editions-grant'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Smithsonian Institution Fellowships',
  'Smithsonian Institution',
  'research',
  'humanities',
  'Smithsonian fellowships support research in residence at Smithsonian museums, research centers, and the National Zoo by graduate students, predoctoral students, postdoctoral researchers, and senior scholars. Fellows conduct independent research using Smithsonian collections, facilities, and staff expertise in disciplines including anthropology, art history, environmental science, evolutionary biology, and astrophysics.',
  55000,
  true,
  NULL,
  '{"requires_advanced_degree_or_enrollment": true, "requires_research_alignment": true, "industries": ["natural_history", "art_history", "anthropology", "science", "humanities"]}'::jsonb,
  '["Application form", "Research proposal", "Biographical sketch", "Three letters of recommendation", "Academic transcripts", "Writing sample"]'::jsonb,
  'https://www.si.edu/ofg/fell',
  'https://www.si.edu',
  '[]'::jsonb,
  NULL,
  'smithsonian-institution-fellowships'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Howard Hughes Medical Institute Investigator Program',
  'Howard Hughes Medical Institute',
  'research',
  'biomedical',
  'HHMI funds exceptional early- and mid-career biomedical scientists through its Investigator Program, providing long-term, flexible support that enables investigators to take intellectual risks and pursue pioneering research. Investigators are selected through a rigorous competition emphasizing the individual scientist over the proposed research. HHMI Investigators are employed by their host institutions but receive HHMI salary and research support.',
  1000000,
  true,
  NULL,
  '{"requires_us_institution": true, "requires_advanced_degree": true, "requires_biomedical_focus": true, "industries": ["biomedical", "genetics", "neuroscience", "immunology", "biochemistry"]}'::jsonb,
  '["Scientific biography", "Research plan", "Institutional letter of support", "Nomination letter", "Publications list", "Proposed budget"]'::jsonb,
  'https://www.hhmi.org/programs/investigators',
  'https://www.hhmi.org',
  '[]'::jsonb,
  NULL,
  'hhmi-investigator-program'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Simons Foundation Research Grants',
  'Simons Foundation',
  'research',
  'basic_science',
  'The Simons Foundation funds research in mathematics, theoretical physics, and the life sciences, with an emphasis on basic, discovery-driven science. Programs include the Simons Investigators Award for outstanding scientists, collaborative grants for large interdisciplinary teams, and fellowship programs for early-career researchers. The foundation prioritizes rigorous, curiosity-driven research with long time horizons.',
  500000,
  true,
  NULL,
  '{"requires_advanced_degree": true, "requires_us_or_international_institution": true, "industries": ["mathematics", "physics", "life_sciences", "computing"]}'::jsonb,
  '["Research proposal", "Biographical sketch", "Publications list", "Budget and justification", "Letters of reference"]'::jsonb,
  'https://www.simonsfoundation.org/funding-opportunities',
  'https://www.simonsfoundation.org',
  '[]'::jsonb,
  NULL,
  'simons-foundation-research-grants'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'American Cancer Society Research Grants',
  'American Cancer Society',
  'research',
  'health',
  'The American Cancer Society funds a broad portfolio of cancer research through its intramural grants program, supporting investigators studying cancer biology, prevention, early detection, treatment, and survivorship. Research Scholar Grants support established investigators while Postdoctoral Fellowships and Institutional Research Grants support early-career researchers. All ACS-funded research must have the potential to reduce the burden of cancer.',
  750000,
  true,
  NULL,
  '{"requires_us_institution": true, "requires_cancer_focus": true, "requires_advanced_degree": true, "industries": ["oncology", "biomedical", "public_health"]}'::jsonb,
  '["Research proposal", "Specific aims page", "Biographical sketch", "Budget and justification", "Institutional letter of support", "Human subjects or animal use documentation"]'::jsonb,
  'https://www.cancer.org/research/we-fund-cancer-research/apply-for-a-grant.html',
  'https://www.cancer.org',
  '[]'::jsonb,
  NULL,
  'american-cancer-society-research-grants'
) ON CONFLICT (slug) DO NOTHING;
