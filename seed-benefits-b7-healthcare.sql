-- ============================================================
-- seed-benefits-b7-healthcare.sql  —  Healthcare Benefits (18 new)
-- The following already exist and are updated to type='benefit'
-- by seed-step1-type-column.sql:
--   hrsa-federally-qualified-health-center-grant,
--   samhsa-substance-abuse-prevention-treatment-grant,
--   hrsa-maternal-child-health-block-grant, nhsc-scholarship
-- Run AFTER seed-step1-type-column.sql.
-- Skips duplicates via ON CONFLICT (slug) DO NOTHING.
-- ============================================================

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Medicaid',
  'Centers for Medicare & Medicaid Services',
  'individual',
  'health',
  'benefit',
  'Medicaid is a joint federal-state health insurance program that provides free or low-cost comprehensive health coverage to millions of low-income adults, children, pregnant women, elderly adults, and people with disabilities. Coverage includes doctor visits, hospital care, prescription drugs, mental health services, long-term care, and preventive services, with specific benefits varying by state. Eligibility is based on income, household size, and other factors, and in states that expanded Medicaid under the ACA, most adults with income up to 138% of the Federal Poverty Level qualify.',
  NULL,
  true,
  NULL,
  '["Must meet income and household size requirements (varies by state; expansion states: up to 138% of FPL for adults)", "Children qualify at higher income levels than adults in most states", "Pregnant women qualify at higher income thresholds in all states", "Must be a U.S. citizen or qualifying non-citizen", "Must be a resident of the state in which you apply", "Specific categories include families, pregnant women, children, elderly, and individuals with disabilities"]'::jsonb,
  '["Completed Medicaid application (online, by phone, or in person)", "Proof of identity (government-issued ID)", "Proof of household income (pay stubs, tax returns, benefit letters)", "Social Security numbers for all household members", "Proof of state residency (utility bill, lease, or similar)", "Immigration documentation if applicable"]'::jsonb,
  'https://www.healthcare.gov/medicaid-chip/getting-medicaid-chip/',
  'https://www.medicaid.gov',
  '[]'::jsonb,
  NULL,
  'medicaid'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Medicare Parts A, B, C, and D',
  'Centers for Medicare & Medicaid Services',
  'individual',
  'health',
  'benefit',
  'Medicare is the federal health insurance program for people 65 and older, certain younger people with disabilities, and people with End-Stage Renal Disease or ALS. Part A covers inpatient hospital stays, skilled nursing facility care, hospice, and some home health; Part B covers outpatient medical services, preventive care, and medical equipment; Part C (Medicare Advantage) bundles A and B through private plans; and Part D covers prescription drugs. Most people do not pay a premium for Part A if they or their spouse paid Medicare taxes for at least 10 years.',
  NULL,
  true,
  NULL,
  '["Age 65 or older and a U.S. citizen or permanent resident for at least 5 years", "Under 65 with a qualifying disability and receiving SSDI benefits for 24 months", "Any age with End-Stage Renal Disease (ESRD) requiring dialysis or a kidney transplant", "Any age with Amyotrophic Lateral Sclerosis (ALS)", "Part A is premium-free for most people with sufficient work history; Part B has a standard monthly premium"]'::jsonb,
  '["Medicare enrollment application (auto-enrollment may apply at 65 if receiving Social Security)", "Government-issued photo ID", "Social Security number", "Documentation of disability (for under-65 enrollment)", "Part D enrollment requires selection of a plan during enrollment period"]'::jsonb,
  'https://www.medicare.gov/basics/get-started-with-medicare/sign-up',
  'https://www.medicare.gov',
  '[]'::jsonb,
  NULL,
  'medicare-parts-abcd'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'CHIP — Children''s Health Insurance Program',
  'Centers for Medicare & Medicaid Services',
  'individual',
  'health',
  'benefit',
  'CHIP provides low-cost or free health coverage to children in families that earn too much to qualify for Medicaid but cannot afford private insurance, with income eligibility typically ranging from 200% to 300% or higher of the Federal Poverty Level depending on the state. Coverage includes routine check-ups, immunizations, doctor and dental visits, hospital care, lab and X-ray services, and prescription drugs. In some states, CHIP also covers pregnant women and parents of eligible children.',
  NULL,
  true,
  NULL,
  '["Must be a child under age 19 (some states cover up to age 21)", "Family income must be within state-determined limits (typically 200%–300% of the Federal Poverty Level)", "Must be a U.S. citizen or qualifying non-citizen", "Must not be eligible for Medicaid or covered by employer-sponsored insurance in some states", "Some states also cover pregnant women and parents"]'::jsonb,
  '["CHIP application (online via HealthCare.gov or state agency)", "Proof of child''s identity and age (birth certificate)", "Proof of household income", "Social Security numbers for all household members", "Proof of residency"]'::jsonb,
  'https://www.healthcare.gov/medicaid-chip/childrens-health-insurance-program/',
  'https://www.medicaid.gov/chip/index.html',
  '[]'::jsonb,
  NULL,
  'chip-childrens-health-insurance'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'ACA Premium Tax Credits',
  'Internal Revenue Service / HealthCare.gov',
  'individual',
  'health',
  'benefit',
  'ACA Premium Tax Credits (also called Premium Tax Credits or PTCs) help low- and middle-income individuals and families afford health insurance purchased through the ACA Marketplace by reducing monthly premium costs. The credit amount is based on household income relative to the Federal Poverty Level — households earning between 100% and 400% of FPL are eligible, and under enhanced provisions through 2025, higher-income households may also qualify. Credits can be applied in advance to reduce monthly premiums or claimed as a lump sum when filing taxes.',
  NULL,
  true,
  NULL,
  '["Must purchase health insurance through the ACA Marketplace (HealthCare.gov or state exchange)", "Must not be eligible for affordable employer-sponsored coverage or government health programs (Medicaid, Medicare, CHIP)", "Household income generally between 100% and 400% of the Federal Poverty Level (enhanced subsidies through 2025 may extend higher)", "Must be a U.S. citizen, national, or lawfully present non-citizen", "Must file a federal income tax return for the year the credit is claimed"]'::jsonb,
  '["Application through HealthCare.gov or your state''s Marketplace", "Social Security numbers for all household members", "Proof of household income (pay stubs, most recent tax return)", "Proof of citizenship or immigration status", "IRS Form 8962 (Premium Tax Credit) filed with annual tax return"]'::jsonb,
  'https://www.healthcare.gov/lower-costs/',
  'https://www.irs.gov/affordable-care-act/individuals-and-families/premium-tax-credit-the-basics',
  '[]'::jsonb,
  NULL,
  'aca-premium-tax-credits'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Ryan White HIV/AIDS Program',
  'Health Resources and Services Administration, U.S. Department of Health and Human Services',
  'individual',
  'health',
  'benefit',
  'The Ryan White HIV/AIDS Program funds a comprehensive system of HIV primary medical care, medications, and essential support services for low-income people living with HIV who are uninsured or underinsured. Services include HIV medical care, antiretroviral drugs through the AIDS Drug Assistance Program (ADAP), mental health counseling, substance abuse treatment, case management, and transportation assistance. The program serves over 500,000 people annually through a network of grantees including health departments, community health centers, and AIDS service organizations.',
  NULL,
  true,
  NULL,
  '["Must have a documented HIV-positive diagnosis", "Must be a low-income individual who is uninsured or underinsured (typically income at or below 400% of Federal Poverty Level)", "Must be a U.S. citizen or eligible non-citizen", "Income thresholds and specific eligibility criteria vary by program part and local grantee"]'::jsonb,
  '["Documented HIV diagnosis (lab results or physician confirmation)", "Proof of household income", "Proof of insurance status (or lack thereof)", "Government-issued photo ID", "Social Security number or ITIN"]'::jsonb,
  'https://ryanwhite.hrsa.gov/need-help',
  'https://ryanwhite.hrsa.gov',
  '[]'::jsonb,
  NULL,
  'ryan-white-hivaids-program'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Indian Health Service',
  'U.S. Department of Health and Human Services',
  'individual',
  'health',
  'benefit',
  'The Indian Health Service (IHS) provides a comprehensive health service delivery system for approximately 2.6 million American Indians and Alaska Natives who are members of 574 federally recognized tribes. Services include primary care, dental, behavioral health, substance abuse treatment, pharmacy, and public health nursing, delivered through IHS-operated facilities, tribally operated programs under Self-Determination contracts, and urban Indian health organizations. Health services are provided at no direct cost to eligible patients as a result of treaty obligations and the federal trust responsibility to tribal nations.',
  NULL,
  true,
  NULL,
  '["Must be an enrolled member of a federally recognized Indian tribe or Alaska Native village, or the biological child of an enrolled member", "Must reside in an area served by an IHS facility, tribally operated health program, or urban Indian health organization", "No income requirement — IHS care is provided to eligible individuals regardless of income or insurance status"]'::jsonb,
  '["Proof of tribal membership (tribal enrollment card or CDIB — Certificate of Degree of Indian Blood)", "Government-issued photo ID", "Proof of residency in the service area", "Social Security number"]'::jsonb,
  'https://www.ihs.gov/forpatients/',
  'https://www.ihs.gov',
  '[]'::jsonb,
  NULL,
  'indian-health-service'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Federally Qualified Health Centers',
  'Health Resources and Services Administration, U.S. Department of Health and Human Services',
  'individual',
  'health',
  'benefit',
  'Federally Qualified Health Centers (FQHCs) are community-based health care providers that receive federal funding to provide primary care services in underserved areas to anyone, regardless of their ability to pay. FQHCs offer comprehensive services including primary care, dental, mental health and substance use disorder services, prenatal care, and pharmacy, on a sliding-fee scale based on income. There are over 1,400 FQHC grantees operating more than 14,000 service delivery sites across the United States, territories, and freely associated states.',
  NULL,
  true,
  NULL,
  '["Open to all individuals regardless of insurance status or ability to pay", "Services provided on a sliding-fee scale based on income (fees reduced or waived for those below 100% of Federal Poverty Level)", "Must visit an FQHC or Health Center Program look-alike site", "No residency or documentation requirements to receive care at most FQHCs"]'::jsonb,
  '["No documentation required to receive care at most FQHCs", "Income documentation may be requested to determine sliding-fee scale discount", "Insurance information if available (FQHCs accept Medicaid, Medicare, CHIP, and most insurance plans)", "Identification is helpful but not required at most sites"]'::jsonb,
  'https://findahealthcenter.hrsa.gov/',
  'https://bphc.hrsa.gov',
  '[]'::jsonb,
  NULL,
  'federally-qualified-health-centers'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Rural Health Clinics',
  'Centers for Medicare & Medicaid Services',
  'individual',
  'health',
  'benefit',
  'Rural Health Clinics (RHCs) are a CMS-designated provider type that receives enhanced Medicare and Medicaid reimbursement rates to support affordable primary care access in rural shortage areas. RHCs employ teams of physicians, nurse practitioners, and physician assistants and are required to be located in a rural area with a shortage of primary care providers. Patients — including Medicare and Medicaid beneficiaries — benefit from local access to comprehensive primary care services without traveling long distances to urban health centers.',
  NULL,
  true,
  NULL,
  '["Must reside in or seek care from a Rural Health Clinic located in a designated rural shortage area", "RHCs accept Medicare, Medicaid, and most private insurance", "Uninsured and underinsured patients may be served at reduced fees at many RHCs", "No income requirement to seek care, though ability to pay affects out-of-pocket costs"]'::jsonb,
  '["Medicare or Medicaid card if enrolled", "Private insurance information if applicable", "Government-issued photo ID", "Uninsured patients should ask about sliding-fee scale at the clinic"]'::jsonb,
  'https://www.cms.gov/Medicare/Provider-Enrollment-and-Certification/CertificationandComplianc/RHCs',
  'https://www.cms.gov/Medicare/Provider-Enrollment-and-Certification/CertificationandComplianc/RHCs',
  '[]'::jsonb,
  NULL,
  'rural-health-clinics'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Community Mental Health Block Grant',
  'Substance Abuse and Mental Health Services Administration',
  'individual',
  'health',
  'benefit',
  'The Community Mental Health Services Block Grant (MHBG) provides funding to states and territories to support comprehensive community mental health services for adults with serious mental illness and children with serious emotional disturbances. States use funds to support community mental health centers, crisis services, supported housing, assertive community treatment, and other evidence-based mental health interventions. Individuals access services through state-funded community mental health providers, often at reduced or no cost based on income.',
  NULL,
  true,
  NULL,
  '["Must have a serious mental illness (adults) or serious emotional disturbance (children and adolescents)", "Must be a resident of the state in which services are sought", "Priority given to individuals who are uninsured, underinsured, or involved in the criminal justice system", "Income-based sliding fee scales typically applied at community mental health centers"]'::jsonb,
  '["No documentation required to seek an intake appointment at a community mental health center", "Diagnosis documentation from a mental health provider may be requested", "Proof of income for sliding-fee scale determination", "Insurance information if applicable"]'::jsonb,
  'https://www.samhsa.gov/grants/block-grants/mhbg',
  'https://www.samhsa.gov/grants/block-grants/mhbg',
  '[]'::jsonb,
  NULL,
  'community-mental-health-block-grant'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Title X Family Planning',
  'Office of Population Affairs, U.S. Department of Health and Human Services',
  'individual',
  'health',
  'benefit',
  'Title X is the only federal grant program dedicated solely to providing comprehensive family planning and related preventive health services. Funded clinics offer contraceptive counseling and supplies, STI testing and treatment, cancer screenings, pregnancy testing, preconception health care, and referrals at no cost or on a sliding-fee scale for people with low incomes. Title X-funded sites serve approximately 2 million patients annually and are required to serve all patients regardless of their ability to pay.',
  NULL,
  true,
  NULL,
  '["Open to all individuals seeking family planning and reproductive health services regardless of age, sex, or income", "Services provided free of charge to clients with incomes at or below 100% of Federal Poverty Level", "Reduced fees (sliding scale) for clients with incomes between 100% and 250% of Federal Poverty Level", "Confidential services available to adolescents — parental consent is not required"]'::jsonb,
  '["No documentation required to receive services at most Title X clinics", "Income documentation may be requested to determine fee scale", "No insurance or identification required at most sites"]'::jsonb,
  'https://opa.hhs.gov/grant-programs/title-x-family-planning/title-x-service-grants',
  'https://opa.hhs.gov/grant-programs/title-x-family-planning',
  '[]'::jsonb,
  NULL,
  'title-x-family-planning'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Veterans Health Administration',
  'U.S. Department of Veterans Affairs',
  'individual',
  'health',
  'benefit',
  'The Veterans Health Administration (VHA) is the largest integrated health care system in the United States, operating over 1,200 facilities nationwide to provide comprehensive medical services to eligible veterans. Care includes primary care, mental health treatment, substance use disorder services, prosthetics, telehealth, dental (for eligible veterans), and long-term care, often at no or reduced cost depending on the veteran''s disability rating and income. Veterans are assigned to priority groups (1–8) based on their service-connected disability rating and income, which determines any copays.',
  NULL,
  true,
  NULL,
  '["Must have served in the active military, naval, or air service and been discharged under conditions other than dishonorable", "Most veterans with at least 24 months of continuous active duty service are eligible", "Service-connected disability rating of 50% or higher, or 10%–20% with financial hardship: free care for service-connected conditions", "Priority groups 1–8 determine cost-sharing; higher priority groups pay no or minimal copays", "Recent combat veterans qualify for 5 years of free care after separation regardless of income"]'::jsonb,
  '["DD-214 Certificate of Release or Discharge from Active Duty", "Government-issued photo ID", "Social Security number", "Financial information (for income-based priority group determination)", "VA enrollment application (Form 10-10EZ)"]'::jsonb,
  'https://www.va.gov/health-care/apply-for-va-healthcare/',
  'https://www.va.gov/health-care/',
  '[]'::jsonb,
  NULL,
  'veterans-health-administration'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'TRICARE',
  'Defense Health Agency, U.S. Department of Defense',
  'individual',
  'health',
  'benefit',
  'TRICARE is the health care program for active duty and retired uniformed service members, National Guard and Reserve members, and their families, providing comprehensive medical, dental, and pharmacy coverage worldwide. TRICARE offers several plan options including TRICARE Prime (HMO-style), TRICARE Select (PPO-style), and TRICARE for Life (Medicare supplement for retirees) with varying costs and network requirements. Most active duty members and their families have low or no cost-sharing for covered services.',
  NULL,
  true,
  NULL,
  '["Must be an active duty service member, retired service member, National Guard or Reserve member (on qualifying status), or an eligible family member or survivor", "Must be registered in the Defense Enrollment Eligibility Reporting System (DEERS)", "Eligibility category determines which TRICARE plan options are available", "Retirees at age 65 transition to TRICARE for Life as a Medicare supplement"]'::jsonb,
  '["Uniformed Services ID card or dependent ID card", "DEERS registration (typically automatic for active duty; family members must be registered)", "Medicare enrollment for TRICARE for Life (retirees 65+)"]'::jsonb,
  'https://www.tricare.mil/Plans',
  'https://www.tricare.mil',
  '[]'::jsonb,
  NULL,
  'tricare-military-health'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Hill-Burton Free or Reduced-Cost Health Care',
  'Health Resources and Services Administration, U.S. Department of Health and Human Services',
  'individual',
  'health',
  'benefit',
  'The Hill-Burton Program obligates hospitals and other health facilities that received federal construction grants or loans under the Hill-Burton Act to provide free or reduced-cost care to eligible patients. Obligated facilities must offer a certain amount of uncompensated services each year and cannot refuse care to someone unable to pay. To receive Hill-Burton free care, patients must apply and meet income guidelines — typically at or below the HHS Federal Poverty Level guidelines — at a participating facility.',
  NULL,
  true,
  NULL,
  '["Must meet income eligibility guidelines (at or below 100% of Federal Poverty Level for free care; reduced-cost care at higher incomes)", "Must apply for Hill-Burton free care at the facility before or within a reasonable time after receiving services", "Must receive care at a Hill-Burton obligated hospital, clinic, or health facility", "Hill-Burton obligations end when the facility''s obligation is fulfilled — facilities with remaining obligations are listed on the HRSA website"]'::jsonb,
  '["Application for Hill-Burton free care (submitted at the facility)", "Proof of household income (pay stubs, tax return, or benefit award letters)", "Government-issued photo ID", "Social Security number"]'::jsonb,
  'https://www.hrsa.gov/get-health-care/affordable/hill-burton/index.html',
  'https://www.hrsa.gov/get-health-care/affordable/hill-burton/index.html',
  '[]'::jsonb,
  NULL,
  'hill-burton-free-care'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  '340B Drug Pricing Program',
  'Health Resources and Services Administration, U.S. Department of Health and Human Services',
  'individual',
  'health',
  'benefit',
  'The 340B Drug Pricing Program requires pharmaceutical manufacturers participating in Medicaid to sell outpatient drugs at significantly reduced prices to eligible health care organizations (covered entities), which in turn use the savings to expand services or reduce costs for low-income and uninsured patients. Covered entities include FQHCs, Ryan White clinics, disproportionate-share hospitals, and other safety-net providers. Patients receiving care at 340B-covered entities — particularly the uninsured — often benefit from deeply discounted prescription drugs.',
  NULL,
  true,
  NULL,
  '["Must receive care at a 340B-covered entity (FQHC, Ryan White clinic, DSH hospital, etc.)", "Uninsured patients and those meeting the entity''s sliding-fee criteria benefit most from 340B pricing", "Individual patients do not enroll in 340B directly — access is through covered health care providers", "Coverage entities set their own policies for passing on drug discounts to patients"]'::jsonb,
  '["No separate application — access is through your health care provider at a 340B-covered entity", "Ask your provider or pharmacist if they are a 340B covered entity and if you qualify for reduced-cost medications"]'::jsonb,
  'https://www.hrsa.gov/opa/index.html',
  'https://www.hrsa.gov/opa/index.html',
  '[]'::jsonb,
  NULL,
  '340b-drug-pricing-program'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Extra Help — Medicare Part D Low Income Subsidy',
  'Social Security Administration / Centers for Medicare & Medicaid Services',
  'individual',
  'health',
  'benefit',
  'Extra Help (also called the Low Income Subsidy or LIS) assists Medicare beneficiaries with limited income and resources in paying Medicare Part D prescription drug plan premiums, deductibles, and copays, potentially saving over $5,000 per year. Full Extra Help eliminates the Part D premium (up to the benchmark amount), the deductible, and the coverage gap, with copays of $0–$4.70 for generics and $0–$11.80 for brand-name drugs in 2024. Beneficiaries who receive Medicaid, SSI, or Medicare Savings Program benefits are automatically enrolled.',
  5000,
  true,
  NULL,
  '["Must be enrolled in Medicare Part A and/or Part B", "Must meet income limits (individual income at or below $21,996/year; married couple at or below $29,820/year for full subsidy in 2024)", "Must meet resource limits (individual resources at or below $17,220; married couple at or below $34,360 in 2024)", "Automatic enrollment for Medicaid, SSI, or Medicare Savings Program recipients", "Annual redetermination required to maintain Extra Help"]'::jsonb,
  '["Application via Social Security Administration (SSA-1020 form, online, phone, or in-person)", "Medicare card", "Information about income (Social Security statements, pay stubs, tax returns)", "Information about resources (bank statements, investment accounts)", "Medicare Part D plan enrollment or intent to enroll"]'::jsonb,
  'https://www.ssa.gov/medicare/part-d-extra-help',
  'https://www.ssa.gov/medicare/part-d-extra-help',
  '[]'::jsonb,
  NULL,
  'extra-help-medicare-part-d'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Medicare Savings Programs',
  'Centers for Medicare & Medicaid Services / State Medicaid Agencies',
  'individual',
  'health',
  'benefit',
  'Medicare Savings Programs (MSPs) are state Medicaid programs that help low-income Medicare beneficiaries pay for Medicare premiums, deductibles, coinsurance, and copays. The four MSP levels — Qualified Medicare Beneficiary (QMB), Specified Low-Income Medicare Beneficiary (SLMB), Qualifying Individual (QI), and Qualified Disabled Working Individual (QDWI) — each cover different Medicare cost-sharing based on income. QMB participants may not be billed by Medicare providers for cost-sharing, even if the provider doesn''t accept Medicaid.',
  NULL,
  true,
  NULL,
  '["Must be enrolled in Medicare Part A", "Must meet state-specific income and resource limits (generally between 100% and 135% of Federal Poverty Level depending on MSP level)", "QMB: income at or below 100% FPL; SLMB: 100%–120% FPL; QI: 120%–135% FPL", "Resource limits apply in addition to income limits (limits vary by state)", "Must be a resident of the state in which you apply"]'::jsonb,
  '["Application through your state Medicaid agency (in person, online, or by mail)", "Medicare card", "Proof of income (Social Security award letter, pay stubs, tax return)", "Bank statements and other resource documentation", "Government-issued photo ID", "Proof of state residency"]'::jsonb,
  'https://www.medicare.gov/basics/costs/help/medicare-savings-programs',
  'https://www.medicare.gov/basics/costs/help/medicare-savings-programs',
  '[]'::jsonb,
  NULL,
  'medicare-savings-programs'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'PACE — Program of All-Inclusive Care for the Elderly',
  'Centers for Medicare & Medicaid Services',
  'individual',
  'health',
  'benefit',
  'PACE is a Medicare and Medicaid program that provides comprehensive medical and social services to frail elderly individuals (55+) who are certified as needing nursing home-level care but prefer to remain living in the community. PACE organizations provide all covered Medicare and Medicaid services — including primary care, hospital, dental, vision, hearing, prescription drugs, physical therapy, and personal care — through an interdisciplinary team at an adult day health center. There are no coverage gaps or deductibles, and most PACE participants have no monthly premium if they qualify for both Medicare and Medicaid.',
  NULL,
  true,
  NULL,
  '["Must be 55 years of age or older", "Must be certified by the state as needing nursing home-level care", "Must be able to live safely in the community with PACE services (not already in a nursing home)", "Must reside in a PACE program service area (programs operate in approximately 32 states)", "Must be eligible for Medicare, Medicaid, or both (private pay is available for those who do not qualify for Medicaid)"]'::jsonb,
  '["Medicare and/or Medicaid eligibility documentation", "Physician or health professional certification of nursing home level of care need", "Government-issued photo ID", "Proof of residency within the PACE program service area", "Financial information for Medicaid eligibility determination if not already enrolled"]'::jsonb,
  'https://www.medicare.gov/health-drug-plans/health-plans/your-coverage-options/pace',
  'https://www.medicaid.gov/medicaid/long-term-services-supports/pace/index.html',
  '[]'::jsonb,
  NULL,
  'pace-program'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Healthy Start Initiative',
  'Health Resources and Services Administration, U.S. Department of Health and Human Services',
  'individual',
  'health',
  'benefit',
  'Healthy Start provides community-based services to reduce infant mortality, improve birth outcomes, and address health disparities for pregnant women, infants, and families in communities with the highest rates of infant mortality and pregnancy-related deaths. Services include prenatal care coordination, health education, interconception care, home visiting, breastfeeding support, substance use screening, and referrals to mental health, domestic violence, and social services. The program operates in more than 100 communities across the United States, with a focus on African American, Native American, and other underserved populations.',
  NULL,
  true,
  NULL,
  '["Must reside in or near a Healthy Start-funded community", "Priority for pregnant women, recent mothers within 2 years postpartum, and infants up to 18 months", "Emphasis on women of color and families in communities with elevated infant mortality rates", "No income requirement; services are free to participants"]'::jsonb,
  '["No formal application required — enroll through your local Healthy Start program", "Proof of pregnancy or recent birth", "Proof of residence in or near the program service area may be requested"]'::jsonb,
  'https://mchb.hrsa.gov/programs-impact/healthy-start',
  'https://mchb.hrsa.gov/programs-impact/healthy-start',
  '[]'::jsonb,
  NULL,
  'healthy-start-initiative'
) ON CONFLICT (slug) DO NOTHING;
