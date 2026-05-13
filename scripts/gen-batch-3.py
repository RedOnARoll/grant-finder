#!/usr/bin/env python3
"""Generates seed-batch-3.sql — Education (12) + Veterans (10) + Arts (10) grants."""
import json

GRANTS = [
  # ── EDUCATION ────────────────────────────────────────────────────────────────
  {
    "name": "Federal Pell Grant",
    "agency": "U.S. Department of Education",
    "category": "individual",
    "subcategory": "education",
    "description": (
      "The Pell Grant is the largest federal grant program for undergraduate students, "
      "providing need-based aid that does not need to be repaid. Awards are determined by "
      "financial need, cost of attendance, enrollment status, and whether the student "
      "attends full- or part-time. Students may receive up to 12 semesters (6 years) of "
      "Pell Grant funding over their academic careers."
    ),
    "max_amount": 7395,
    "is_recurring": True,
    "deadline": None,
    "eligibility_criteria": {
      "requires_us_citizen": True,
      "requires_student": True,
      "education_level": "undergraduate",
      "requires_financial_need": True,
    },
    "required_documents": [
      "FAFSA application", "Social Security Number or Alien Registration Number",
      "Federal tax returns", "Bank statements", "Enrollment verification",
    ],
    "application_url": "https://studentaid.gov/h/apply-for-aid/fafsa",
    "official_source_url": "https://studentaid.gov/understand-aid/types/grants/pell",
    "form_numbers": ["FAFSA"],
    "processing_time_days": 30,
    "slug": "federal-pell-grant",
  },
  {
    "name": "Federal Supplemental Educational Opportunity Grant (FSEOG)",
    "agency": "U.S. Department of Education",
    "category": "individual",
    "subcategory": "education",
    "description": (
      "FSEOG is a campus-based aid program providing grants to undergraduates with "
      "exceptional financial need, with priority given to Pell Grant recipients. "
      "Unlike the Pell Grant, FSEOG funds are administered directly by the financial "
      "aid office at participating schools. The amount a student can receive depends on "
      "when they apply, their financial need, and the funding level of their school."
    ),
    "max_amount": 4000,
    "is_recurring": True,
    "deadline": None,
    "eligibility_criteria": {
      "requires_us_citizen": True,
      "requires_student": True,
      "education_level": "undergraduate",
      "requires_exceptional_financial_need": True,
    },
    "required_documents": [
      "FAFSA application", "Enrollment verification", "Financial need documentation",
    ],
    "application_url": "https://studentaid.gov/understand-aid/types/grants/fseog",
    "official_source_url": "https://studentaid.gov/understand-aid/types/grants/fseog",
    "processing_time_days": 30,
    "slug": "federal-supplemental-educational-opportunity-grant",
  },
  {
    "name": "TEACH Grant",
    "agency": "U.S. Department of Education",
    "category": "individual",
    "subcategory": "education",
    "description": (
      "The Teacher Education Assistance for College and Higher Education (TEACH) Grant "
      "provides up to $4,000 per year to students who plan to become teachers in "
      "high-need fields (such as math, science, and special education) at low-income "
      "schools. Recipients must teach for at least 4 years within 8 years of completing "
      "the program; otherwise the grant converts to an unsubsidized Direct Loan."
    ),
    "max_amount": 4000,
    "is_recurring": True,
    "deadline": None,
    "eligibility_criteria": {
      "requires_us_citizen": True,
      "requires_student": True,
      "education_level": "undergraduate",
      "requires_teaching_commitment": True,
    },
    "required_documents": [
      "FAFSA application", "TEACH Grant Agreement to Serve", "Enrollment in TEACH-eligible program",
      "Academic achievement documentation (GPA 3.25+ or top 75% on college admissions test)",
    ],
    "application_url": "https://studentaid.gov/understand-aid/types/grants/teach",
    "official_source_url": "https://studentaid.gov/understand-aid/types/grants/teach",
    "processing_time_days": 30,
    "slug": "teach-grant",
  },
  {
    "name": "Iraq and Afghanistan Service Grant",
    "agency": "U.S. Department of Education",
    "category": "individual",
    "subcategory": "education",
    "description": (
      "The Iraq and Afghanistan Service Grant is available to students whose parent or "
      "guardian died as a result of military service in Iraq or Afghanistan after "
      "September 11, 2001. The student must not be eligible for a Pell Grant based on "
      "financial need but must meet all other Pell eligibility requirements. "
      "The grant amount equals the maximum Pell Grant award for the award year."
    ),
    "max_amount": 7395,
    "is_recurring": True,
    "deadline": None,
    "eligibility_criteria": {
      "requires_us_citizen": True,
      "requires_student": True,
      "education_level": "undergraduate",
      "requires_military_parent_loss": True,
    },
    "required_documents": [
      "FAFSA application", "Documentation of parent/guardian military death",
      "Enrollment verification",
    ],
    "application_url": "https://studentaid.gov/understand-aid/types/grants/iraq-afghanistan-service",
    "official_source_url": "https://studentaid.gov/understand-aid/types/grants/iraq-afghanistan-service",
    "processing_time_days": 45,
    "slug": "iraq-afghanistan-service-grant",
  },
  {
    "name": "Gates Scholarship",
    "agency": "Gates Scholarship Program",
    "category": "individual",
    "subcategory": "education",
    "description": (
      "The Gates Scholarship is a highly competitive, full scholarship for exceptional, "
      "Pell-eligible, minority high school seniors in the United States. It aims to "
      "promote the personal and professional growth of outstanding minority students. "
      "The scholarship covers the full cost of attendance minus other aid and allows "
      "recipients to pursue any field of study at any accredited U.S. college or university."
    ),
    "max_amount": 50000,
    "is_recurring": True,
    "deadline": "2025-09-15",
    "eligibility_criteria": {
      "requires_us_citizen": True,
      "requires_student": True,
      "education_level": "undergraduate",
      "requires_minority": True,
      "requires_financial_need": True,
      "requires_high_school_senior": True,
    },
    "required_documents": [
      "Online application", "High school transcript", "SAT/ACT scores",
      "Recommendation letters (3)", "Personal essays", "Financial aid information",
    ],
    "application_url": "https://www.thegatesscholarship.org/scholarship",
    "official_source_url": "https://www.thegatesscholarship.org",
    "processing_time_days": 90,
    "slug": "gates-scholarship",
  },
  {
    "name": "Thurgood Marshall College Fund Scholarship",
    "agency": "Thurgood Marshall College Fund",
    "category": "individual",
    "subcategory": "education",
    "description": (
      "The Thurgood Marshall College Fund provides merit and need-based scholarships to "
      "students attending its 47 member Historically Black Colleges and Universities "
      "(HBCUs) and Predominantly Black Institutions (PBIs). Scholarships support "
      "students in all fields of study and connect recipients with corporate and "
      "government partners for internship and career opportunities."
    ),
    "max_amount": 10000,
    "is_recurring": True,
    "deadline": "2026-02-28",
    "eligibility_criteria": {
      "requires_us_citizen": True,
      "requires_student": True,
      "education_level": "undergraduate",
      "requires_hbcu_enrollment": True,
      "min_gpa": 3.0,
    },
    "required_documents": [
      "Online application", "College transcript", "Financial need documentation",
      "Recommendation letters (2)", "Personal statement", "FAFSA EFC",
    ],
    "application_url": "https://tmcf.org/students-alumni/scholarship/tmcf-scholarships/",
    "official_source_url": "https://tmcf.org",
    "processing_time_days": 90,
    "slug": "thurgood-marshall-college-fund-scholarship",
  },
  {
    "name": "Hispanic Scholarship Fund Grant",
    "agency": "Hispanic Scholarship Fund",
    "category": "individual",
    "subcategory": "education",
    "description": (
      "The Hispanic Scholarship Fund (HSF) provides scholarships to Hispanic students "
      "pursuing a college degree in the U.S. HSF is the nation's largest nonprofit "
      "organization supporting Hispanic higher education, having awarded more than "
      "$600 million in scholarships since 1975. Awards range from $500 to $5,000 based "
      "on merit and financial need."
    ),
    "max_amount": 5000,
    "is_recurring": True,
    "deadline": "2026-02-15",
    "eligibility_criteria": {
      "requires_us_citizen": True,
      "requires_student": True,
      "education_level": "undergraduate",
      "requires_hispanic_heritage": True,
      "min_gpa": 3.0,
    },
    "required_documents": [
      "Online application", "College transcript", "Financial need documentation",
      "Personal essay", "FAFSA SAR",
    ],
    "application_url": "https://www.hsf.net/scholarship",
    "official_source_url": "https://www.hsf.net",
    "processing_time_days": 90,
    "slug": "hispanic-scholarship-fund-grant",
  },
  {
    "name": "American Indian College Fund Scholarship",
    "agency": "American Indian College Fund",
    "category": "individual",
    "subcategory": "education",
    "description": (
      "The American Indian College Fund is the nation's largest American Indian "
      "higher education charity, providing scholarships to Native American students. "
      "The fund supports students at tribal colleges and mainstream universities and "
      "offers over $8 million in scholarships annually. Awards support students in any "
      "field of study, with some scholarships targeting specific majors or career paths."
    ),
    "max_amount": 5000,
    "is_recurring": True,
    "deadline": "2026-05-31",
    "eligibility_criteria": {
      "requires_us_citizen": True,
      "requires_student": True,
      "education_level": "undergraduate",
      "requires_native_american_heritage": True,
    },
    "required_documents": [
      "Online application", "Tribal enrollment documentation", "College transcript",
      "Financial need documentation", "Personal essay",
    ],
    "application_url": "https://collegefund.org/students/scholarships/",
    "official_source_url": "https://collegefund.org",
    "processing_time_days": 90,
    "slug": "american-indian-college-fund-scholarship",
  },
  {
    "name": "Jack Kent Cooke Foundation College Scholarship",
    "agency": "Jack Kent Cooke Foundation",
    "category": "individual",
    "subcategory": "education",
    "description": (
      "The Jack Kent Cooke College Scholarship Program is one of the largest private "
      "scholarships in the country for high-achieving students with financial need. "
      "It provides up to $40,000 per year for up to four years of undergraduate study. "
      "The program selects scholars who have demonstrated academic ability and ambition, "
      "and it provides ongoing advising and support throughout college."
    ),
    "max_amount": 40000,
    "is_recurring": True,
    "deadline": "2025-11-20",
    "eligibility_criteria": {
      "requires_us_citizen": True,
      "requires_student": True,
      "education_level": "undergraduate",
      "requires_high_school_senior": True,
      "requires_financial_need": True,
      "min_gpa": 3.5,
    },
    "required_documents": [
      "Online application", "High school transcript", "Standardized test scores",
      "Recommendation letters (3)", "Personal essay", "Financial need documentation",
    ],
    "application_url": "https://www.jkcf.org/our-scholarships/college-scholarship-program/",
    "official_source_url": "https://www.jkcf.org",
    "processing_time_days": 120,
    "slug": "jack-kent-cooke-foundation-college-scholarship",
  },
  {
    "name": "Dell Scholars Program",
    "agency": "Michael & Susan Dell Foundation",
    "category": "individual",
    "subcategory": "education",
    "description": (
      "The Dell Scholars Program recognizes and supports students who have overcome "
      "significant obstacles to pursue their education. The program awards $20,000 "
      "scholarships plus a laptop, online resources, and ongoing support services. "
      "Scholars receive a dedicated support system that includes financial advising, "
      "emergency fund access, and a community of fellow Dell Scholars."
    ),
    "max_amount": 20000,
    "is_recurring": True,
    "deadline": "2025-12-01",
    "eligibility_criteria": {
      "requires_us_citizen": True,
      "requires_student": True,
      "education_level": "undergraduate",
      "requires_high_school_senior": True,
      "requires_financial_need": True,
      "min_gpa": 2.4,
    },
    "required_documents": [
      "Online application", "FAFSA", "High school transcript",
      "Personal essays", "Letters of recommendation (2)",
    ],
    "application_url": "https://www.dellscholars.org/scholarship/",
    "official_source_url": "https://www.dellscholars.org",
    "processing_time_days": 90,
    "slug": "dell-scholars-program",
  },
  {
    "name": "Coca-Cola Scholars Program",
    "agency": "Coca-Cola Scholars Foundation",
    "category": "individual",
    "subcategory": "education",
    "description": (
      "The Coca-Cola Scholars Program is a merit-based scholarship awarded to 150 "
      "graduating high school seniors each year. Recipients receive $20,000 for "
      "undergraduate study at any accredited U.S. college or university. Scholars are "
      "selected based on leadership, service, and academic achievement, and gain access "
      "to a lifelong network of over 6,600 alumni leaders."
    ),
    "max_amount": 20000,
    "is_recurring": True,
    "deadline": "2025-10-31",
    "eligibility_criteria": {
      "requires_us_citizen": True,
      "requires_student": True,
      "requires_high_school_senior": True,
      "education_level": "undergraduate",
      "min_gpa": 3.0,
    },
    "required_documents": [
      "Online application", "High school transcript", "Personal essays",
      "Letters of recommendation (2)", "Extracurricular activities list",
    ],
    "application_url": "https://www.coca-colascholarsfoundation.org/apply/",
    "official_source_url": "https://www.coca-colascholarsfoundation.org",
    "processing_time_days": 90,
    "slug": "coca-cola-scholars-program",
  },
  {
    "name": "QuestBridge National College Match Scholarship",
    "agency": "QuestBridge",
    "category": "individual",
    "subcategory": "education",
    "description": (
      "QuestBridge connects high-achieving, low-income students with full four-year "
      "scholarships to some of the nation's leading colleges and universities. The "
      "National College Match allows finalists to rank up to 12 partner colleges and "
      "receive a binding admissions decision with a full scholarship covering tuition, "
      "room, board, and fees. Over 45 leading colleges partner with QuestBridge."
    ),
    "max_amount": 250000,
    "is_recurring": True,
    "deadline": "2025-09-26",
    "eligibility_criteria": {
      "requires_us_citizen": True,
      "requires_student": True,
      "requires_high_school_senior": True,
      "education_level": "undergraduate",
      "requires_financial_need": True,
      "max_household_income": 65000,
    },
    "required_documents": [
      "Online application", "High school transcript", "Standardized test scores",
      "Essays (6 short essays)", "Financial information", "Counselor recommendation",
    ],
    "application_url": "https://www.questbridge.org/apply",
    "official_source_url": "https://www.questbridge.org",
    "processing_time_days": 60,
    "slug": "questbridge-national-college-match-scholarship",
  },

  # ── VETERANS ─────────────────────────────────────────────────────────────────
  {
    "name": "Post-9/11 GI Bill (Chapter 33)",
    "agency": "U.S. Department of Veterans Affairs",
    "category": "individual",
    "subcategory": "veterans",
    "description": (
      "The Post-9/11 GI Bill provides financial support for education and housing for "
      "individuals who have served on active duty for 90 or more days after September 10, "
      "2001. Benefits include tuition and fees, a monthly housing allowance, and a "
      "stipend for books and supplies. Benefit levels range from 40% to 100% based on "
      "length of active duty service."
    ),
    "max_amount": 28937,
    "is_recurring": True,
    "deadline": None,
    "eligibility_criteria": {
      "requires_us_veteran": True,
      "requires_active_duty_service": True,
      "min_service_days": 90,
      "service_after": "2001-09-10",
    },
    "required_documents": [
      "VA Form 22-1990", "DD-214 Certificate of Release", "Enrollment certification",
      "Social Security Number", "Direct deposit information",
    ],
    "application_url": "https://www.va.gov/education/how-to-apply/",
    "official_source_url": "https://www.va.gov/education/about-gi-bill-benefits/post-9-11/",
    "form_numbers": ["VA Form 22-1990"],
    "processing_time_days": 30,
    "slug": "post-911-gi-bill",
  },
  {
    "name": "Montgomery GI Bill – Active Duty (MGIB-AD)",
    "agency": "U.S. Department of Veterans Affairs",
    "category": "individual",
    "subcategory": "veterans",
    "description": (
      "The Montgomery GI Bill Active Duty (MGIB-AD) provides up to 36 months of "
      "education benefits for veterans and service members who have at least 2 years of "
      "active duty service. Benefits can be used for college, business, technical, or "
      "vocational courses; apprenticeships; on-the-job training; and other "
      "education and training programs."
    ),
    "max_amount": 2324,
    "is_recurring": True,
    "deadline": None,
    "eligibility_criteria": {
      "requires_us_veteran": True,
      "requires_active_duty_service": True,
      "min_service_months": 24,
      "requires_honorable_discharge": True,
    },
    "required_documents": [
      "VA Form 22-1990", "DD-214 Certificate of Release", "Enrollment certification",
    ],
    "application_url": "https://www.va.gov/education/how-to-apply/",
    "official_source_url": "https://www.va.gov/education/about-gi-bill-benefits/montgomery-active-duty/",
    "form_numbers": ["VA Form 22-1990"],
    "processing_time_days": 30,
    "slug": "montgomery-gi-bill-active-duty",
  },
  {
    "name": "VA Vocational Rehabilitation and Employment (VR&E)",
    "agency": "U.S. Department of Veterans Affairs",
    "category": "individual",
    "subcategory": "veterans",
    "description": (
      "The VA Vocational Rehabilitation and Employment program (also known as Chapter 31) "
      "helps veterans with service-connected disabilities prepare for, find, and maintain "
      "suitable employment. The program can also help veterans gain independence in daily "
      "living. Benefits include education and training, career counseling, job search "
      "assistance, and support for starting a business."
    ),
    "max_amount": 15000,
    "is_recurring": True,
    "deadline": None,
    "eligibility_criteria": {
      "requires_us_veteran": True,
      "requires_service_connected_disability": True,
      "min_disability_rating": 10,
    },
    "required_documents": [
      "VA Form 28-1900", "DD-214 Certificate of Release", "VA disability rating documentation",
      "Educational records", "Medical documentation",
    ],
    "application_url": "https://www.va.gov/careers-employment/vocational-rehabilitation/how-to-apply/",
    "official_source_url": "https://www.va.gov/careers-employment/vocational-rehabilitation/",
    "form_numbers": ["VA Form 28-1900"],
    "processing_time_days": 45,
    "slug": "va-vocational-rehabilitation-employment",
  },
  {
    "name": "Folds of Honor Scholarship",
    "agency": "Folds of Honor Foundation",
    "category": "individual",
    "subcategory": "veterans",
    "description": (
      "Folds of Honor provides educational scholarships to spouses and children of "
      "military members who have been killed or disabled while serving in the U.S. Armed "
      "Forces. Since 2007, Folds of Honor has awarded over 43,000 scholarships totaling "
      "more than $200 million. Scholarships are available for K–12 private school "
      "tuition and post-secondary education."
    ),
    "max_amount": 5000,
    "is_recurring": True,
    "deadline": "2026-03-01",
    "eligibility_criteria": {
      "requires_military_family": True,
      "requires_killed_or_disabled_servicemember": True,
    },
    "required_documents": [
      "Online application", "DD-214 or service documentation", "Disability or death documentation",
      "Enrollment verification", "Personal essay", "Recommendation letter",
    ],
    "application_url": "https://foldsofhonor.org/scholarships/",
    "official_source_url": "https://foldsofhonor.org",
    "processing_time_days": 60,
    "slug": "folds-of-honor-scholarship",
  },
  {
    "name": "Pat Tillman Foundation Scholarship",
    "agency": "Pat Tillman Foundation",
    "category": "individual",
    "subcategory": "veterans",
    "description": (
      "The Pat Tillman Scholarship supports veteran and military scholars pursuing "
      "undergraduate and graduate degrees at U.S. colleges and universities. Scholars "
      "are selected based on intellectual curiosity, drive, and a commitment to service "
      "beyond oneself. The program provides financial support, a network of scholars "
      "and mentors, and ongoing leadership development opportunities."
    ),
    "max_amount": 15000,
    "is_recurring": True,
    "deadline": "2026-02-01",
    "eligibility_criteria": {
      "requires_us_veteran": True,
      "requires_student": True,
    },
    "required_documents": [
      "Online application", "Military service documentation", "College transcript",
      "Personal essays", "Recommendation letters (3)",
    ],
    "application_url": "https://pattillmanfoundation.org/apply-to-be-a-scholar/",
    "official_source_url": "https://pattillmanfoundation.org",
    "processing_time_days": 90,
    "slug": "pat-tillman-foundation-scholarship",
  },
  {
    "name": "American Legion Legacy Scholarship",
    "agency": "The American Legion",
    "category": "individual",
    "subcategory": "veterans",
    "description": (
      "The American Legion Legacy Scholarship provides financial assistance to children "
      "of post-9/11 active duty military personnel killed on active duty or who died as "
      "a result of a service-related injury or disease. Scholarships are for full-time "
      "undergraduate study at accredited colleges and universities. Awards are based on "
      "financial need and may be renewed for up to four years."
    ),
    "max_amount": 20000,
    "is_recurring": True,
    "deadline": "2026-04-15",
    "eligibility_criteria": {
      "requires_military_dependent": True,
      "requires_parent_killed_in_service": True,
      "requires_student": True,
      "education_level": "undergraduate",
    },
    "required_documents": [
      "Online application", "Parent's DD-214", "Death certificate or casualty documentation",
      "High school transcript", "Financial need documentation",
    ],
    "application_url": "https://www.legion.org/scholarships/legacy",
    "official_source_url": "https://www.legion.org/scholarships",
    "processing_time_days": 60,
    "slug": "american-legion-legacy-scholarship",
  },
  {
    "name": "Veterans of Foreign Wars Voice of Democracy Scholarship",
    "agency": "Veterans of Foreign Wars",
    "category": "individual",
    "subcategory": "veterans",
    "description": (
      "The VFW Voice of Democracy audio-essay program provides high school students in "
      "grades 9–12 with the opportunity to express their opinions on democracy and "
      "patriotism. Top competitors receive more than $2 million in scholarships each "
      "year. The first-place national winner receives a $30,000 scholarship, and state "
      "winners receive various awards before competing at the national level."
    ),
    "max_amount": 30000,
    "is_recurring": True,
    "deadline": "2025-10-31",
    "eligibility_criteria": {
      "requires_us_citizen": True,
      "requires_student": True,
      "requires_high_school_enrollment": True,
    },
    "required_documents": [
      "Audio essay (3-5 minutes)", "Essay transcript", "Application form",
      "Participation through local VFW post",
    ],
    "application_url": "https://www.vfw.org/community/youth-and-education/youth-scholarships",
    "official_source_url": "https://www.vfw.org",
    "processing_time_days": 90,
    "slug": "vfw-voice-of-democracy-scholarship",
  },
  {
    "name": "AMVETS National Scholarship",
    "agency": "AMVETS",
    "category": "individual",
    "subcategory": "veterans",
    "description": (
      "AMVETS (American Veterans) provides scholarships to veterans, active duty service "
      "members, National Guard members, reservists, and their dependents. Scholarships "
      "support undergraduate and graduate education at accredited institutions. AMVETS "
      "awards over $300,000 in scholarships annually to support the educational needs "
      "of those who have served or are serving the nation."
    ),
    "max_amount": 4000,
    "is_recurring": True,
    "deadline": "2026-04-15",
    "eligibility_criteria": {
      "requires_us_veteran_or_dependent": True,
      "requires_student": True,
    },
    "required_documents": [
      "Online application", "Military service documentation", "College transcript",
      "Personal essay", "Letter of recommendation",
    ],
    "application_url": "https://amvets.org/scholarships/",
    "official_source_url": "https://amvets.org",
    "processing_time_days": 60,
    "slug": "amvets-national-scholarship",
  },
  {
    "name": "Disabled American Veterans Auxiliary Scholarship",
    "agency": "Disabled American Veterans Auxiliary",
    "category": "individual",
    "subcategory": "veterans",
    "description": (
      "The DAV Auxiliary provides scholarships to children of disabled veterans who are "
      "pursuing higher education. The program recognizes the sacrifices made by veterans "
      "with service-connected disabilities and helps their children achieve their "
      "educational goals. Awards are based on financial need, academic achievement, "
      "and community involvement."
    ),
    "max_amount": 1500,
    "is_recurring": True,
    "deadline": "2026-03-01",
    "eligibility_criteria": {
      "requires_disabled_veteran_parent": True,
      "requires_student": True,
      "education_level": "undergraduate",
    },
    "required_documents": [
      "Application form", "Parent's VA disability documentation", "College transcript",
      "Financial aid information", "Personal statement",
    ],
    "application_url": "https://www.davauxiliary.org/scholarships",
    "official_source_url": "https://www.davauxiliary.org",
    "processing_time_days": 60,
    "slug": "disabled-american-veterans-auxiliary-scholarship",
  },
  {
    "name": "Military Officers Association of America Scholarship",
    "agency": "Military Officers Association of America",
    "category": "individual",
    "subcategory": "veterans",
    "description": (
      "MOAA provides need-based interest-free loans and scholarships for children of "
      "military officers for undergraduate study. The program helps junior officers "
      "and their families afford higher education. MOAA also administers scholarship "
      "programs from various foundations and endowments to support military families "
      "pursuing higher education goals."
    ),
    "max_amount": 5000,
    "is_recurring": True,
    "deadline": "2026-03-01",
    "eligibility_criteria": {
      "requires_military_officer_dependent": True,
      "requires_student": True,
      "education_level": "undergraduate",
      "requires_financial_need": True,
    },
    "required_documents": [
      "Online application", "Parent's military service documentation",
      "College transcript", "Financial need documentation", "Personal essay",
    ],
    "application_url": "https://www.moaa.org/content/benefits-and-discounts/financial-assistance/scholarship-programs/",
    "official_source_url": "https://www.moaa.org",
    "processing_time_days": 60,
    "slug": "moaa-scholarship",
  },

  # ── ARTS ─────────────────────────────────────────────────────────────────────
  {
    "name": "NEA Grants for Arts Projects",
    "agency": "National Endowment for the Arts",
    "category": "individual",
    "subcategory": "arts",
    "description": (
      "NEA Grants for Arts Projects support public engagement with and access to arts, "
      "lifelong learning in the arts, and the health of arts sectors. Organizations may "
      "apply for projects that feature the creation of art that meets the highest "
      "standards of excellence, invite all Americans to participate in and experience "
      "the arts, and strengthen the practice of arts learning."
    ),
    "max_amount": 100000,
    "is_recurring": True,
    "deadline": "2026-02-13",
    "eligibility_criteria": {
      "requires_us_organization": True,
      "requires_arts_organization": True,
      "requires_nonprofit": True,
    },
    "required_documents": [
      "Online application (Grants.gov)", "Project narrative", "Budget",
      "Organizational profile", "Work samples", "IRS determination letter",
      "Audited financial statements",
    ],
    "application_url": "https://www.arts.gov/grants/grants-for-arts-projects",
    "official_source_url": "https://www.arts.gov",
    "processing_time_days": 120,
    "slug": "nea-grants-for-arts-projects",
  },
  {
    "name": "NEA Creative Writing Fellowships",
    "agency": "National Endowment for the Arts",
    "category": "individual",
    "subcategory": "arts",
    "description": (
      "NEA Creative Writing Fellowships enable recipients to set aside time for writing, "
      "research, travel, and other activities that support the creation of new work. "
      "The program alternates annually between prose (fiction and creative nonfiction) "
      "and poetry. Fellows receive $25,000 and may pursue their projects for 12 months "
      "without restriction on how funds are used."
    ),
    "max_amount": 25000,
    "is_recurring": True,
    "deadline": "2026-03-06",
    "eligibility_criteria": {
      "requires_us_citizen": True,
      "requires_published_writer": True,
    },
    "required_documents": [
      "Online application", "Writing samples (up to 25 pages)",
      "Publication history", "Artist statement",
    ],
    "application_url": "https://www.arts.gov/grants/creative-writing-fellowships",
    "official_source_url": "https://www.arts.gov/grants/creative-writing-fellowships",
    "processing_time_days": 180,
    "slug": "nea-creative-writing-fellowships",
  },
  {
    "name": "NEA Translation Projects Fellowships",
    "agency": "National Endowment for the Arts",
    "category": "individual",
    "subcategory": "arts",
    "description": (
      "NEA Translation Projects Fellowships support the translation of literary works "
      "into English. Fellowships of $12,500 or $25,000 support translators as they "
      "complete book-length literary translation projects including fiction, creative "
      "nonfiction, and poetry. These fellowships help introduce international literature "
      "to American readers."
    ),
    "max_amount": 25000,
    "is_recurring": True,
    "deadline": "2026-01-16",
    "eligibility_criteria": {
      "requires_us_citizen": True,
      "requires_translator": True,
    },
    "required_documents": [
      "Online application", "Translation samples", "Original text samples",
      "Project description", "Translator biography",
    ],
    "application_url": "https://www.arts.gov/grants/translation-projects",
    "official_source_url": "https://www.arts.gov/grants/translation-projects",
    "processing_time_days": 180,
    "slug": "nea-translation-projects-fellowships",
  },
  {
    "name": "Guggenheim Fellowship",
    "agency": "John Simon Guggenheim Memorial Foundation",
    "category": "individual",
    "subcategory": "arts",
    "description": (
      "Guggenheim Fellowships are intended for men and women who have already demonstrated "
      "exceptional capacity for productive scholarship or exceptional creative ability in "
      "the arts. The program awards fellowships to artists, writers, scholars, and "
      "scientists across all fields. Fellows may use their grants in whatever way they "
      "believe will best enable them to pursue their work."
    ),
    "max_amount": 50000,
    "is_recurring": True,
    "deadline": "2025-09-17",
    "eligibility_criteria": {
      "requires_us_citizen": True,
      "requires_demonstrated_achievement": True,
    },
    "required_documents": [
      "Online application", "Career narrative", "Project statement",
      "Work samples", "Reference letters (3)",
    ],
    "application_url": "https://www.gf.org/applicants/",
    "official_source_url": "https://www.gf.org",
    "processing_time_days": 180,
    "slug": "guggenheim-fellowship",
  },
  {
    "name": "Artist Trust GAP Grants",
    "agency": "Artist Trust",
    "category": "individual",
    "subcategory": "arts",
    "description": (
      "Artist Trust's Grants for Artist Projects (GAP) provides support to Washington "
      "State artists to help them complete projects or realize artistic goals in any "
      "discipline. GAP is a highly competitive, merit-based program that awards between "
      "$1,500 and $3,000 to individual artists. Funds can be used for supplies, "
      "equipment, travel, living expenses, and other project-related costs."
    ),
    "max_amount": 3000,
    "is_recurring": True,
    "deadline": "2026-01-15",
    "eligibility_criteria": {
      "requires_us_resident": True,
      "requires_washington_state_resident": True,
      "requires_practicing_artist": True,
    },
    "required_documents": [
      "Online application", "Artist statement", "Work samples (10 images, audio, or video clips)",
      "Project description and budget",
    ],
    "application_url": "https://artisttrust.org/awards/gap/",
    "official_source_url": "https://artisttrust.org",
    "processing_time_days": 90,
    "slug": "artist-trust-gap-grants",
  },
  {
    "name": "Creative Capital Award",
    "agency": "Creative Capital Foundation",
    "category": "individual",
    "subcategory": "arts",
    "description": (
      "Creative Capital supports innovative and adventurous artists across the country "
      "through funding, counsel, and career development opportunities. Awardees receive "
      "project funding up to $50,000, as well as business and personal development "
      "workshops, strategy sessions, public promotion, and a network of over 700 "
      "artists across the U.S."
    ),
    "max_amount": 50000,
    "is_recurring": True,
    "deadline": "2026-02-01",
    "eligibility_criteria": {
      "requires_us_citizen": True,
      "requires_practicing_artist": True,
    },
    "required_documents": [
      "Online application", "Artist biography", "Project description",
      "Work samples", "Budget narrative",
    ],
    "application_url": "https://creative-capital.org/award/",
    "official_source_url": "https://creative-capital.org",
    "processing_time_days": 180,
    "slug": "creative-capital-award",
  },
  {
    "name": "NEFA National Dance Project Production Grant",
    "agency": "New England Foundation for the Arts",
    "category": "individual",
    "subcategory": "arts",
    "description": (
      "The National Dance Project (NDP) Production Grant supports the creation of new "
      "dance works by U.S.-based choreographers and dance companies. Awards of up to "
      "$55,000 help artists create ambitious, fully-realized dance productions. The "
      "program also offers touring grants to help bring these works to new audiences "
      "across the country."
    ),
    "max_amount": 55000,
    "is_recurring": True,
    "deadline": "2026-01-31",
    "eligibility_criteria": {
      "requires_us_citizen": True,
      "requires_dance_artist": True,
    },
    "required_documents": [
      "Online application", "Project narrative", "Budget",
      "Artist biography", "Work samples (video)",
      "Presenter support letters",
    ],
    "application_url": "https://www.nefa.org/grants-programs/grants/national-dance-project-production-grant",
    "official_source_url": "https://www.nefa.org",
    "processing_time_days": 90,
    "slug": "nefa-national-dance-project-production-grant",
  },
  {
    "name": "New York Foundation for the Arts Fellowship",
    "agency": "New York Foundation for the Arts",
    "category": "individual",
    "subcategory": "arts",
    "description": (
      "NYFA Fellowships are cash awards of $7,000 given to individual originating artists "
      "living and working in New York State. These unrestricted awards recognize "
      "exceptional work and provide artists with financial support and public recognition "
      "at crucial stages of their careers. Fellowships rotate through different artistic "
      "disciplines each year."
    ),
    "max_amount": 7000,
    "is_recurring": True,
    "deadline": "2026-01-27",
    "eligibility_criteria": {
      "requires_us_resident": True,
      "requires_new_york_state_resident": True,
      "requires_practicing_artist": True,
    },
    "required_documents": [
      "Online application", "Artist statement", "Work samples",
      "Resume or CV",
    ],
    "application_url": "https://www.nyfa.org/fellowships/",
    "official_source_url": "https://www.nyfa.org",
    "processing_time_days": 120,
    "slug": "nyfa-fellowship",
  },
  {
    "name": "WESTAF/NEA Curation Initiative Grant",
    "agency": "Western States Arts Federation",
    "category": "individual",
    "subcategory": "arts",
    "description": (
      "WESTAF, in partnership with NEA, provides grants to arts organizations in the "
      "western United States to support innovative curatorial projects that expand access "
      "to the arts. Grants support projects that develop new curatorial approaches, "
      "showcase underrepresented artists and art forms, and build connections between "
      "communities and artists across the region."
    ),
    "max_amount": 25000,
    "is_recurring": True,
    "deadline": "2026-03-01",
    "eligibility_criteria": {
      "requires_us_organization": True,
      "requires_arts_organization": True,
      "requires_western_us_location": True,
    },
    "required_documents": [
      "Online application", "Project narrative", "Budget",
      "Organizational profile", "Work samples",
    ],
    "application_url": "https://westaf.org/grants/",
    "official_source_url": "https://westaf.org",
    "processing_time_days": 90,
    "slug": "westaf-nea-curation-initiative-grant",
  },
  {
    "name": "American Music Center Composer Assistance Program",
    "agency": "New Music USA",
    "category": "individual",
    "subcategory": "arts",
    "description": (
      "New Music USA's Composer Assistance Program (formerly American Music Center) "
      "supports American composers to complete major new works and bring them to "
      "performance. The program provides grants for commissioning, recording, and "
      "performing new music. Through its grants, New Music USA supports composers "
      "at every career stage creating innovative work across all genres."
    ),
    "max_amount": 15000,
    "is_recurring": True,
    "deadline": "2026-02-01",
    "eligibility_criteria": {
      "requires_us_citizen": True,
      "requires_composer": True,
    },
    "required_documents": [
      "Online application", "Work samples (audio recordings or scores)",
      "Project description", "Budget narrative", "Artist biography",
    ],
    "application_url": "https://newmusicusa.org/grants/",
    "official_source_url": "https://newmusicusa.org",
    "processing_time_days": 90,
    "slug": "new-music-usa-composer-assistance-program",
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

  output_path = "/Users/yonatanlivshits/Downloads/grant-finder/seed-batch-3.sql"
  with open(output_path, "w") as f:
    f.write("-- Batch 3: Education (12) + Veterans (10) + Arts (10) = 32 grants\n\n")
    for g in GRANTS:
      f.write(grant_to_sql(g) + "\n\n")

  counts = {}
  for g in GRANTS:
    counts[g.get("subcategory") or g["category"]] = counts.get(g.get("subcategory") or g["category"], 0) + 1

  print(f"✓ Wrote {len(GRANTS)} grants to {output_path}")
  for cat, n in sorted(counts.items()):
    print(f"  {cat:<16}: {n}")
  print("  ✓ All slugs unique")
