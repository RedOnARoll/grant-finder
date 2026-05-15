-- ============================================================
-- seed-benefits-b3-disability.sql  —  Disability Benefits (12 new)
-- SSDI (social-security-disability-insurance) and SSI
-- (supplemental-security-income) already exist and are updated
-- to type='benefit' by seed-step1-type-column.sql.
-- Run AFTER seed-step1-type-column.sql.
-- Skips duplicates via ON CONFLICT (slug) DO NOTHING.
-- ============================================================

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Ticket to Work',
  'Social Security Administration',
  'individual',
  'disability',
  'benefit',
  'The Ticket to Work program helps Social Security disability beneficiaries (SSDI and SSI recipients) explore employment by connecting them with approved Employment Networks and state Vocational Rehabilitation agencies that provide free career counseling, job placement assistance, and ongoing support services. Participation lets beneficiaries test their ability to work while keeping benefits protections in place during an initial trial period. The program is voluntary and open to beneficiaries between ages 18 and 64.',
  NULL,
  true,
  NULL,
  '["Must be receiving SSDI or SSI disability benefits", "Must be between 18 and 64 years of age", "Participation is voluntary — there is no penalty for not using the Ticket", "Must receive a Ticket assignment notice from SSA"]'::jsonb,
  '["Social Security disability award letter", "Government-issued photo ID", "Ticket to Work assignment notice from SSA"]'::jsonb,
  'https://choosework.ssa.gov/about/ticket-to-work',
  'https://choosework.ssa.gov/about/ticket-to-work',
  '[]'::jsonb,
  NULL,
  'ticket-to-work'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Plan to Achieve Self-Support (PASS)',
  'Social Security Administration',
  'individual',
  'disability',
  'benefit',
  'PASS allows SSI recipients to set aside income or resources for a defined period to pursue a specific work goal — such as education, vocational training, or starting a business — without those funds reducing SSI benefits or counting toward the resource limit. An approved PASS plan documents the work goal, the steps and timeline to achieve it, and the expenses to be set aside. A free PASS specialist at SSA reviews and approves plans collaboratively with the applicant.',
  NULL,
  true,
  NULL,
  '["Must be receiving SSI or be eligible for SSI if not for the income or resources being set aside", "Must have a feasible occupational goal that requires setting aside money or resources", "Must be able to achieve the work goal within a reasonable timeframe", "Must have income or resources above the SSI limits that can be set aside under the plan"]'::jsonb,
  '["SSI award letter or documentation of SSI eligibility", "SSA Form 545-BK (PASS Application)", "Documentation supporting the work goal (school acceptance letter, business plan, training enrollment, etc.)", "Itemized list of anticipated plan expenses"]'::jsonb,
  'https://www.ssa.gov/disabilityresearch/wi/pass.htm',
  'https://www.ssa.gov/disabilityresearch/wi/pass.htm',
  '[]'::jsonb,
  NULL,
  'plan-to-achieve-self-support'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Medicaid HCBS Waivers',
  'Centers for Medicare & Medicaid Services',
  'individual',
  'disability',
  'benefit',
  'Medicaid Home and Community-Based Services (HCBS) waivers allow states to provide long-term services and supports to people with disabilities and older adults in their homes and communities as an alternative to institutional care. Covered services vary by state waiver and may include personal care, respite care, adult day services, supported employment, home modifications, specialized therapies, and case management. Because each state designs its own waiver programs, eligibility rules, available services, and enrollment caps differ significantly across states.',
  NULL,
  true,
  NULL,
  '["Must meet Medicaid financial eligibility requirements for the state (income and asset limits vary)", "Must require a level of care that would otherwise necessitate nursing facility or institutional placement", "Must have a qualifying disability, chronic health condition, or age-related need", "Program-specific eligibility criteria and waiting lists vary by state and waiver type"]'::jsonb,
  '["Medicaid application and financial documentation (income, assets)", "Medical records documenting disability or level of care need", "Level of care assessment conducted by the state agency", "Government-issued photo ID", "Social Security number"]'::jsonb,
  'https://www.medicaid.gov/medicaid/home-community-based-services/index.html',
  'https://www.medicaid.gov/medicaid/home-community-based-services/index.html',
  '[]'::jsonb,
  NULL,
  'medicaid-hcbs-waivers'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Vocational Rehabilitation Services',
  'U.S. Department of Education / State Vocational Rehabilitation Agencies',
  'individual',
  'disability',
  'benefit',
  'The Vocational Rehabilitation (VR) program provides individualized services to help people with physical, mental, or cognitive disabilities prepare for, obtain, retain, or advance in competitive integrated employment. Funded through the federal Rehabilitation Act and administered by state VR agencies, services can include career counseling, job training, college tuition assistance, assistive technology, transportation, and job placement support. An Individualized Plan for Employment (IPE) is developed collaboratively between the counselor and the individual at no cost.',
  NULL,
  true,
  NULL,
  '["Must have a physical, mental, or cognitive disability that is a barrier to employment", "Must require VR services to prepare for, obtain, retain, or advance in employment", "Must be reasonably expected to benefit from VR services toward an employment outcome", "Must be a U.S. citizen or eligible non-citizen", "Priority given to individuals with the most significant disabilities when caseloads are full"]'::jsonb,
  '["Application to your state VR agency", "Documentation of disability from a licensed healthcare provider", "Government-issued photo ID", "Social Security number", "Employment and education history documentation"]'::jsonb,
  'https://rsa.ed.gov/about/states',
  'https://rsa.ed.gov/about/states',
  '[]'::jsonb,
  NULL,
  'vocational-rehabilitation-services'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Assistive Technology Act Programs',
  'Administration for Community Living, U.S. Department of Health and Human Services',
  'individual',
  'disability',
  'benefit',
  'The Assistive Technology Act funds a program in every state and territory to increase access to assistive technology (AT) devices and services for individuals with disabilities of all ages and disability types. State AT programs offer device demonstration centers, short-term device loan programs, device reutilization programs that redistribute pre-owned equipment at little or no cost, and alternative financing programs with low-interest loans to help people purchase AT. No single application or income threshold applies nationally — services vary by state program.',
  NULL,
  true,
  NULL,
  '["Must have a disability of any type (physical, sensory, cognitive, or other)", "Must reside in a state or territory with an AT Act program (all 50 states and territories qualify)", "Income and documentation requirements vary by the specific service or financing program accessed", "Services available to individuals, family members, caregivers, educators, and employers"]'::jsonb,
  '["Documentation of disability may be required for financing programs", "Proof of income may be required for some financing programs", "Requirements for device loans and demonstrations vary by state program"]'::jsonb,
  'https://at3center.net/state-at-programs/',
  'https://acl.gov/programs/assistive-technology/assistive-technology-act-programs',
  '[]'::jsonb,
  NULL,
  'assistive-technology-act-programs'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Independent Living Centers',
  'Administration for Community Living, U.S. Department of Health and Human Services',
  'individual',
  'disability',
  'benefit',
  'Centers for Independent Living (CILs) are consumer-controlled, community-based nonprofit organizations providing services and advocacy that help people with any type of significant disability live independently. The four core services are information and referral, independent living skills training, peer counseling, and individual and systems advocacy. With over 400 CILs nationwide, additional services often include benefits counseling, transition assistance from institutions or nursing homes, housing support, employment help, and assistive technology guidance.',
  NULL,
  true,
  NULL,
  '["Must have a significant disability (any type — physical, sensory, cognitive, or psychiatric)", "Services available to people of all ages, income levels, and backgrounds", "No income requirement for most core services", "CIL boards and staff must be majority individuals with disabilities"]'::jsonb,
  '["Intake application at your local CIL", "Documentation of disability may be requested for some specialized services"]'::jsonb,
  'https://acl.gov/programs/aging-and-disability-networks/centers-independent-living',
  'https://acl.gov/programs/aging-and-disability-networks/centers-independent-living',
  '[]'::jsonb,
  NULL,
  'independent-living-centers'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'ABLE Accounts',
  'U.S. Department of the Treasury / State ABLE Programs',
  'individual',
  'disability',
  'benefit',
  'ABLE (Achieving a Better Life Experience) accounts are tax-advantaged savings accounts that allow individuals with qualifying disabilities to save money without losing eligibility for federal means-tested benefits such as SSI and Medicaid, up to a $100,000 balance. Annual contributions up to the gift tax exclusion ($18,000 in 2024) can come from the account owner, family, and friends; withdrawals for qualified disability expenses (housing, education, transportation, health) are tax-free. Starting January 1, 2026, the age-of-onset limit expands from before age 26 to before age 46.',
  100000,
  true,
  NULL,
  '["Must have a disability with onset before age 26 (expanding to before age 46 starting January 1, 2026)", "Must meet SSI or SSDI disability criteria, or have a diagnosed condition on the SSA compassionate allowances list, or have a physician''s certification", "Must be a U.S. citizen or resident alien", "ABLE account balances above $100,000 may affect SSI cash benefits (not Medicaid)"]'::jsonb,
  '["Government-issued photo ID", "Social Security number", "Disability certification (SSI/SSDI award letter, or physician statement if self-certifying)", "State ABLE program enrollment form"]'::jsonb,
  'https://www.ablenrc.org/find-your-state-able-program/',
  'https://www.ablenrc.org',
  '[]'::jsonb,
  NULL,
  'able-accounts'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Traumatic Brain Injury State Grant Program',
  'Health Resources and Services Administration, U.S. Department of Health and Human Services',
  'individual',
  'disability',
  'benefit',
  'The TBI State Grant Program funds states and territories to develop and improve systems of services and support for individuals who have sustained a traumatic brain injury and their families. Funded activities include needs assessments, creating or expanding TBI registries, coordinating rehabilitation and long-term community services, and expanding specialized TBI programs. States use funds to fill gaps in existing service systems and improve access to care, rehabilitation, and community support for TBI survivors of all ages.',
  NULL,
  true,
  NULL,
  '["Must have sustained a traumatic brain injury", "Must reside in a state or territory with an active TBI State Grant program", "Specific services, eligibility, and intake criteria vary by state program", "Services available to individuals of all ages; some state programs focus on specific age groups"]'::jsonb,
  '["Medical documentation of TBI diagnosis", "Referral from a healthcare provider may be required by some state programs", "Proof of state residency"]'::jsonb,
  'https://www.hrsa.gov/grants/find-funding',
  'https://mchb.hrsa.gov/programs-impact/traumatic-brain-injury',
  '[]'::jsonb,
  NULL,
  'traumatic-brain-injury-state-grant'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Supported Employment Programs',
  'U.S. Department of Education / State Vocational Rehabilitation Agencies',
  'individual',
  'disability',
  'benefit',
  'Supported Employment helps individuals with the most significant disabilities — including intellectual disabilities, autism, traumatic brain injuries, and severe psychiatric disabilities — obtain and maintain competitive integrated employment through ongoing job coaching, customized job development, and workplace supports. Services follow a "place then train" model, focusing on real jobs at real wages alongside nondisabled coworkers before or instead of pre-employment training in segregated settings. Long-term support services are typically funded through Medicaid waiver programs after the initial VR funding period ends.',
  NULL,
  true,
  NULL,
  '["Must have a most significant disability requiring ongoing supported employment services to maintain employment", "Must be eligible for Vocational Rehabilitation services in their state", "Must have a goal of competitive integrated employment (real job, minimum wage or higher, alongside nondisabled workers)", "Priority given to individuals with intellectual disabilities, autism, TBI, or severe psychiatric disabilities"]'::jsonb,
  '["Application to and approval from state Vocational Rehabilitation agency", "Documentation of significant disability from a licensed provider", "Individualized Plan for Employment (IPE) developed with VR counselor", "Any prior employment or vocational assessment records"]'::jsonb,
  'https://rsa.ed.gov/about/states',
  'https://rsa.ed.gov/about/states',
  '[]'::jsonb,
  NULL,
  'supported-employment-programs'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'WIPA — Work Incentives Planning and Assistance',
  'Social Security Administration',
  'individual',
  'disability',
  'benefit',
  'WIPA provides free benefits counseling from certified Community Work Incentive Coordinators (CWICs) to Social Security disability beneficiaries who are working or considering work, helping them understand how employment affects their SSDI, SSI, Medicare, and Medicaid benefits. CWICs prepare detailed Benefits Summary and Analysis reports so beneficiaries can make informed decisions about returning to work without fear of prematurely losing health coverage or income benefits. Services are delivered through a national network of WIPA projects funded by SSA at no cost to the beneficiary.',
  NULL,
  true,
  NULL,
  '["Must be currently receiving SSDI or SSI disability benefits", "Must be working, recently started working, or actively considering employment", "Must be 14 years of age or older", "Priority given to beneficiaries ages 14–25 and those using the Ticket to Work program"]'::jsonb,
  '["Social Security award letter or proof of current SSDI/SSI benefits", "Recent work history information if currently employed", "Contact information for Employment Network or VR counselor if currently working with one"]'::jsonb,
  'https://choosework.ssa.gov/findhelp/',
  'https://choosework.ssa.gov/about/wipa',
  '[]'::jsonb,
  NULL,
  'wipa-work-incentives'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Veterans Disability Compensation',
  'U.S. Department of Veterans Affairs',
  'individual',
  'disability',
  'benefit',
  'VA Disability Compensation provides tax-free monthly payments to veterans who have a physical or mental health condition connected to their military service, with payment amounts determined by the combined VA disability rating (10% to 100%). Veterans may claim multiple service-connected conditions, each rated individually and combined into a single overall disability rating using VA''s combined ratings formula. Eligible veterans may also receive additional compensation for dependents, special monthly compensation for severe disabilities such as loss of limb or blindness, and priority access to VA health care.',
  NULL,
  true,
  NULL,
  '["Must have served on active duty in the military, naval, or air service", "Must have been discharged under conditions other than dishonorable", "Must have a current diagnosed physical or mental health condition", "Must establish a connection between the current condition and military service (in-service event, injury, or illness)", "Presumptive service connection available for certain conditions and exposures (Agent Orange, burn pits, radiation, etc.)"]'::jsonb,
  '["DD-214 Certificate of Release or Discharge from Active Duty", "Service treatment records", "Current medical records documenting the condition", "Buddy statements or lay evidence supporting the in-service event if applicable", "VA Form 21-526EZ (Application for Disability Compensation and Related Compensation Benefits)"]'::jsonb,
  'https://www.va.gov/disability/how-to-file-claim/',
  'https://www.va.gov/disability/',
  '[]'::jsonb,
  NULL,
  'veterans-disability-compensation'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Veterans Pension with Aid and Attendance',
  'U.S. Department of Veterans Affairs',
  'individual',
  'disability',
  'benefit',
  'VA Veterans Pension is a needs-based benefit providing monthly payments to wartime veterans with limited income and net worth who are permanently and totally disabled or aged 65 and older. The Aid and Attendance enhanced benefit offers additional monthly payments to pension recipients who need help with daily activities such as dressing, bathing, or eating, or who are in a nursing home or assisted living facility. The Housebound benefit provides a smaller allowance for veterans substantially confined to their home due to a permanent disability.',
  NULL,
  true,
  NULL,
  '["Must have served at least 90 days of active duty with at least one day during a qualifying wartime period", "Must have been discharged under other than dishonorable conditions", "Must be permanently and totally disabled (any age) or age 65 or older", "Must meet VA income and net worth limits (net worth limit is $155,356 for 2024)", "Aid and Attendance: must require assistance with daily living activities, be bedridden, or be in a nursing home or assisted living facility"]'::jsonb,
  '["DD-214 or other proof of wartime military service", "Medical evidence of permanent and total disability (if under age 65)", "Income and net worth documentation for all household members", "VA Form 21P-527EZ (Application for Pension Benefits)", "Medical documentation and physician statement supporting Aid and Attendance need"]'::jsonb,
  'https://www.va.gov/pension/how-to-apply/',
  'https://www.va.gov/pension/',
  '[]'::jsonb,
  NULL,
  'veterans-pension-aid-attendance'
) ON CONFLICT (slug) DO NOTHING;
