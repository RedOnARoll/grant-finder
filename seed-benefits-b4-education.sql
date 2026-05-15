-- ============================================================
-- seed-benefits-b4-education.sql  —  Education Benefits (10 new)
-- The following already exist and are updated to type='benefit'
-- by seed-step1-type-column.sql (no re-insert needed):
--   federal-pell-grant, federal-supplemental-educational-opportunity-grant,
--   teach-grant, iraq-afghanistan-service-grant, javits-fellowship,
--   nsf-graduate-research-fellowship, americorps-education-award
-- Run AFTER seed-step1-type-column.sql.
-- Skips duplicates via ON CONFLICT (slug) DO NOTHING.
-- ============================================================

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Bureau of Indian Education Scholarships',
  'Bureau of Indian Education, U.S. Department of the Interior',
  'individual',
  'education',
  'benefit',
  'The Bureau of Indian Education Higher Education Grant program provides financial assistance to eligible American Indian and Alaska Native students to pursue undergraduate and graduate degrees at accredited colleges and universities. Awards help cover tuition, fees, books, and living expenses, and are distributed through BIE directly or through federally recognized tribes participating in the program. Students must reapply annually and maintain satisfactory academic progress to retain funding.',
  NULL,
  true,
  NULL,
  '["Must be an enrolled member of a federally recognized Indian tribe eligible to receive BIE services", "Must demonstrate financial need as determined by the FAFSA", "Must be accepted or enrolled at an accredited institution of higher education", "Must maintain satisfactory academic progress (minimum GPA requirements apply)", "Must be a U.S. citizen or eligible non-citizen"]'::jsonb,
  '["Tribal enrollment documentation or Certificate of Degree of Indian Blood (CDIB)", "FAFSA application with Student Aid Report (SAR)", "Official acceptance letter from accredited college or university", "Official transcripts", "Financial need documentation"]'::jsonb,
  'https://www.bie.edu/topic/funding-opportunities',
  'https://www.bie.edu/topic/funding-opportunities',
  '[]'::jsonb,
  NULL,
  'bureau-of-indian-education-scholarships'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'TRIO Programs',
  'U.S. Department of Education',
  'individual',
  'education',
  'benefit',
  'TRIO is a group of eight federally funded outreach and student services programs designed to help low-income individuals, first-generation college students, and students with disabilities progress from middle school through graduate education. Programs include Talent Search (middle and high school outreach), Upward Bound (college prep for high schoolers), Student Support Services (college retention and graduation support), and the Ronald E. McNair Post-Baccalaureate Achievement Program (graduate school preparation). Services are provided by colleges and nonprofits that apply for and receive TRIO grants, so availability depends on which institutions in your area have programs.',
  NULL,
  true,
  NULL,
  '["Must be a low-income individual (family income at or below 150% of the Federal Poverty Level) and/or a first-generation college student (neither parent holds a four-year degree)", "Must be a U.S. citizen, permanent resident, or lawfully admitted for permanent residence", "Students with disabilities may qualify regardless of income or first-generation status", "Must meet the specific eligibility criteria of the individual TRIO program component", "Must enroll through an institution or organization that has an active TRIO grant"]'::jsonb,
  '["Application to the TRIO program at your institution or local provider", "Proof of household income", "Documentation of first-generation status (parents'' education records or self-certification)", "High school or college transcripts", "Documentation of disability if applying on that basis"]'::jsonb,
  'https://www2.ed.gov/about/offices/list/ope/trio/index.html',
  'https://www2.ed.gov/about/offices/list/ope/trio/index.html',
  '[]'::jsonb,
  NULL,
  'trio-programs'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'GEAR UP',
  'U.S. Department of Education',
  'individual',
  'education',
  'benefit',
  'Gaining Early Awareness and Readiness for Undergraduate Programs (GEAR UP) provides grants to states and college-school partnerships to support students in high-poverty schools in preparing for and accessing postsecondary education, beginning in 7th grade. Services include tutoring, mentoring, college visits, academic support, financial literacy education, and college application assistance that continue with the student cohort through high school graduation. Many state GEAR UP programs also offer college scholarships to participating students.',
  NULL,
  true,
  NULL,
  '["Must be enrolled in a participating GEAR UP school or program cohort, typically beginning in 7th grade", "Must attend a school where at least 50% of students qualify for free or reduced-price meals", "Services follow the cohort through high school", "GEAR UP scholarships (where offered) may have additional GPA and enrollment requirements"]'::jsonb,
  '["Enrollment in a participating GEAR UP school — no separate application typically required for services", "Scholarship applications where the program offers college funding"]'::jsonb,
  'https://www2.ed.gov/programs/gearup/index.html',
  'https://www2.ed.gov/programs/gearup/index.html',
  '[]'::jsonb,
  NULL,
  'gear-up-program'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'GAANN — Graduate Assistance in Areas of National Need',
  'U.S. Department of Education',
  'individual',
  'education',
  'benefit',
  'GAANN fellowships support doctoral students with exceptional financial need in academic areas of national need including biology, chemistry, computer science, engineering, mathematics, physics, and other Secretary-designated fields. Awards are made to graduate programs at eligible institutions, which then select fellows and administer stipends and tuition assistance. Fellows are typically expected to teach or conduct research as part of their academic preparation, and priority is given to students with exceptional academic merit alongside demonstrated need.',
  30000,
  true,
  NULL,
  '["Must be enrolled in a doctoral program at a GAANN-funded institution in a designated area of national need", "Must demonstrate exceptional financial need as determined by the institution", "Must be a U.S. citizen or permanent resident", "Must have a strong academic record and faculty support", "Specific fields and fellowship counts vary by institution award"]'::jsonb,
  '["Application to the GAANN fellowship program at a participating institution", "FAFSA demonstrating financial need", "Official transcripts", "Letters of recommendation", "Statement of purpose or research interests"]'::jsonb,
  'https://www2.ed.gov/programs/gaann/index.html',
  'https://www2.ed.gov/programs/gaann/index.html',
  '[]'::jsonb,
  NULL,
  'gaann-graduate-assistance'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'NIH Ruth L. Kirschstein National Research Service Award',
  'National Institutes of Health',
  'individual',
  'education',
  'benefit',
  'The Ruth L. Kirschstein NRSA program funds pre- and postdoctoral research training for individuals pursuing careers in biomedical, behavioral, or clinical research at NIH-eligible institutions. Individual fellowships (F30, F31, F32) provide stipends, tuition and fees, and training-related expenses directly to fellows, while institutional training grants (T32) support cohorts of trainees across research disciplines. Fellows are expected to pursue a research career in health-related fields after training and are subject to a payback obligation if they leave research.',
  NULL,
  true,
  NULL,
  '["Must be a U.S. citizen, non-citizen national, or have permanent resident status at the time of award", "Predoctoral (F31): must be enrolled in a research or health-professional doctorate at an accredited institution", "Postdoctoral (F32): must have received a doctoral degree within the past 5 years at time of award", "Must be sponsored by a principal investigator at an NIH-eligible institution", "Must not have prior NRSA postdoctoral support exceeding 3 years"]'::jsonb,
  '["NIH fellowship application submitted via grants.gov", "Research training plan", "Letters of recommendation from mentors and collaborators", "Personal statement and NIH biosketch", "Institutional letter of support from sponsoring organization"]'::jsonb,
  'https://researchtraining.nih.gov/programs/fellowships',
  'https://researchtraining.nih.gov/programs/fellowships',
  '[]'::jsonb,
  NULL,
  'nih-kirschstein-research-award'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Fulbright Program',
  'U.S. Department of State, Bureau of Educational and Cultural Affairs',
  'individual',
  'education',
  'benefit',
  'The Fulbright Program is the U.S. government''s flagship international educational exchange, providing grants for U.S. students, scholars, professionals, teachers, and artists to study, teach, and conduct research abroad, and for international participants to do the same in the United States. Student grants typically cover international travel, tuition, a monthly living stipend, and health insurance for one academic year. The program operates in more than 160 countries and is administered by the Institute of International Education (IIE) for student awards.',
  NULL,
  true,
  NULL,
  '["Must be a U.S. citizen at the time of application (for outgoing U.S. Fulbright grants)", "Must hold a bachelor''s degree or the equivalent before the grant period begins", "Must have sufficient language proficiency for the proposed host country and project", "Must not have held a Fulbright grant in the two years preceding the proposed start date", "Must have a compelling, feasible project proposal and a strong academic or professional record"]'::jsonb,
  '["Online application through the Fulbright program portal", "Official transcripts from all degree-granting institutions", "Three letters of recommendation", "Personal statement and statement of grant purpose", "Language evaluation form if applicable", "Affiliation letter from host institution if applicable"]'::jsonb,
  'https://us.fulbrightonline.org/',
  'https://eca.state.gov/fulbright',
  '[]'::jsonb,
  NULL,
  'fulbright-program'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Federal Work-Study',
  'U.S. Department of Education',
  'individual',
  'education',
  'benefit',
  'Federal Work-Study (FWS) provides part-time employment to undergraduate and graduate students with financial need, enabling them to earn money to help pay education expenses while enrolled at least half-time. Jobs are available on-campus and off-campus, with many off-campus positions at nonprofits, public agencies, or employers providing community services related to the student''s field of study. Work-Study wages do not count against the following year''s financial aid calculation, preserving aid eligibility.',
  NULL,
  true,
  NULL,
  '["Must demonstrate financial need as calculated from the FAFSA", "Must be enrolled at least half-time at a participating institution", "Must be a U.S. citizen or eligible non-citizen", "Must be making satisfactory academic progress as defined by the institution", "Must not be in default on any federal student loan or owe a refund on a federal grant"]'::jsonb,
  '["FAFSA (Free Application for Federal Student Aid)", "Enrollment verification at a participating college or university", "Government-issued photo ID", "Social Security number"]'::jsonb,
  'https://studentaid.gov/understand-aid/types/work-study',
  'https://studentaid.gov/understand-aid/types/work-study',
  '[]'::jsonb,
  NULL,
  'federal-work-study'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Scholarships for Disadvantaged Students',
  'Health Resources and Services Administration, U.S. Department of Health and Human Services',
  'individual',
  'education',
  'benefit',
  'The Scholarships for Disadvantaged Students (SDS) program awards grants to eligible health professions schools, which then provide scholarships to full-time students from disadvantaged backgrounds enrolled in medicine, nursing, dentistry, pharmacy, and other health professions programs. Scholarships cover tuition, reasonable educational expenses, and living costs for the period of health professions training. Recipient institutions select scholarship recipients based on financial need and disadvantaged background criteria.',
  NULL,
  true,
  NULL,
  '["Must be enrolled full-time in an eligible health professions program at a participating institution", "Must demonstrate exceptional financial need", "Must come from a disadvantaged background (low-income or from an educationally disadvantaged environment)", "Must be a U.S. citizen or permanent resident"]'::jsonb,
  '["FAFSA demonstrating exceptional financial need", "Application to the SDS program administered by the participating health professions school", "Documentation of disadvantaged background or low-income status", "Enrollment verification at the health professions institution"]'::jsonb,
  'https://bhw.hrsa.gov/funding/apply-scholarships/sds',
  'https://bhw.hrsa.gov/funding/apply-scholarships/sds',
  '[]'::jsonb,
  NULL,
  'scholarships-for-disadvantaged-students'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Public Service Loan Forgiveness',
  'U.S. Department of Education',
  'individual',
  'education',
  'benefit',
  'Public Service Loan Forgiveness (PSLF) forgives the remaining balance on federal Direct Loans for borrowers who have made 120 qualifying monthly payments while working full-time for a qualifying employer — federal, state, local, or tribal government organizations or eligible 501(c)(3) nonprofit organizations. Borrowers must be enrolled in an income-driven repayment plan and must submit annual Employment Certification Forms to track progress toward the 120-payment threshold. After 120 qualifying payments (10 years of full-time public service), the remaining balance is forgiven tax-free.',
  NULL,
  false,
  NULL,
  '["Must have federal Direct Loans (other federal loans must be consolidated into a Direct Consolidation Loan)", "Must work full-time (30 hours or more per week) for a qualifying employer: government agencies (federal, state, local, tribal) or eligible 501(c)(3) nonprofits", "Must be enrolled in a qualifying repayment plan (income-driven repayment strongly recommended)", "Must make 120 qualifying on-time monthly payments — payments do not need to be consecutive", "Part-time workers may qualify by combining hours from two qualifying employers totaling 30+ hours per week"]'::jsonb,
  '["PSLF Employment Certification Form (ECF) signed by authorized official at qualifying employer", "Most recent federal student loan statement from studentaid.gov", "Proof of employment at a qualifying government or nonprofit organization", "Documentation of enrollment in an income-driven repayment plan"]'::jsonb,
  'https://studentaid.gov/manage-loans/forgiveness-cancellation/public-service',
  'https://studentaid.gov/manage-loans/forgiveness-cancellation/public-service',
  '[]'::jsonb,
  NULL,
  'public-service-loan-forgiveness'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Adult Education and Family Literacy Act Grants',
  'U.S. Department of Education',
  'individual',
  'education',
  'benefit',
  'The Adult Education and Family Literacy Act (AEFLA), Title II of the Workforce Innovation and Opportunity Act, funds state grants to provide free or low-cost adult education services including basic literacy, high school equivalency (GED/HiSET), and English as a Second Language (ESL) instruction for adults who lack a high school diploma or basic English proficiency. Services are delivered through community colleges, community-based organizations, and public schools across every state and territory. Programs also include integrated education and training, workforce preparation, and transition support to postsecondary education or employment.',
  NULL,
  true,
  NULL,
  '["Must be 16 years of age or older", "Must not be currently enrolled in or required to be enrolled in secondary school", "Must lack a secondary school diploma or its recognized equivalent, or be an English language learner", "Must be a U.S. resident (citizen, permanent resident, or eligible non-citizen)", "Priority given to low-income individuals and participants in other federal poverty programs"]'::jsonb,
  '["Intake application at a local adult education provider (community college, school district, or CBO)", "Government-issued photo ID or other identity documentation", "Proof of residency", "Prior educational records if available (not required to enroll)"]'::jsonb,
  'https://www2.ed.gov/about/offices/list/ovae/pi/AdultEd/index.html',
  'https://www2.ed.gov/about/offices/list/ovae/pi/AdultEd/index.html',
  '[]'::jsonb,
  NULL,
  'adult-education-family-literacy'
) ON CONFLICT (slug) DO NOTHING;
