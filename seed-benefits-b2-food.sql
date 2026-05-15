-- ============================================================
-- seed-benefits-b2-food.sql  —  Food Benefits (13 new)
-- SNAP (snap-benefits) and WIC (wic-nutrition-program) already
-- exist in the DB and are updated to type='benefit' by
-- seed-step1-type-column.sql — not re-inserted here.
-- Run AFTER seed-step1-type-column.sql.
-- Skips duplicates via ON CONFLICT (slug) DO NOTHING.
-- ============================================================

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'National School Lunch Program',
  'U.S. Department of Agriculture',
  'individual',
  'food',
  'benefit',
  'The National School Lunch Program (NSLP) provides nutritionally balanced, free or reduced-price lunches to children at participating public and nonprofit private schools and residential child care institutions each school day. Children from households at or below 130% of the Federal Poverty Level receive free meals, while those between 130% and 185% qualify for reduced-price meals at no more than $0.40. The program served approximately 30 million students daily and is administered by state agencies through participating schools.',
  NULL,
  true,
  NULL,
  '["Must be enrolled in a participating school or residential care institution", "Free meals: household income at or below 130% of Federal Poverty Level", "Reduced-price meals: household income between 130% and 185% of Federal Poverty Level", "Automatic eligibility for households enrolled in SNAP, TANF, or FDPIR", "Children in foster care, Head Start, and some Medicaid programs are categorically eligible"]'::jsonb,
  '["School meal application (submitted by parent or guardian)", "Proof of household income if not categorically eligible", "SNAP, TANF, or FDPIR case number if applicable"]'::jsonb,
  'https://www.fns.usda.gov/nslp',
  'https://www.fns.usda.gov/nslp',
  '[]'::jsonb,
  NULL,
  'national-school-lunch-program'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'School Breakfast Program',
  'U.S. Department of Agriculture',
  'individual',
  'food',
  'benefit',
  'The School Breakfast Program (SBP) provides federal reimbursements to participating schools and residential child care institutions to offer free or reduced-price nutritious breakfasts to eligible children each school day. Children from low-income households receive free breakfast based on the same income thresholds used by the National School Lunch Program. Research consistently shows that students who eat breakfast perform better academically and have better attendance and health outcomes.',
  NULL,
  true,
  NULL,
  '["Must be enrolled in a participating school or residential care institution", "Free breakfast: household income at or below 130% of Federal Poverty Level", "Reduced-price breakfast: household income between 130% and 185% of Federal Poverty Level", "Automatic eligibility for households enrolled in SNAP, TANF, or FDPIR"]'::jsonb,
  '["School breakfast application (submitted by parent or guardian)", "Proof of household income if not categorically eligible", "SNAP, TANF, or FDPIR case number if applicable"]'::jsonb,
  'https://www.fns.usda.gov/sbp',
  'https://www.fns.usda.gov/sbp',
  '[]'::jsonb,
  NULL,
  'school-breakfast-program'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Child and Adult Care Food Program',
  'U.S. Department of Agriculture',
  'individual',
  'food',
  'benefit',
  'The Child and Adult Care Food Program (CACFP) provides federal reimbursements to licensed child care centers, family day care homes, after-school programs, and adult day care centers for serving nutritious meals and snacks to eligible participants. Children up to age 12 in day care and adults 60 and older in adult day programs benefit, with income-based eligibility determining reimbursement rates for participating facilities. The program helps over 4 million children and nearly 130,000 adults receive better nutrition each day.',
  NULL,
  true,
  NULL,
  '["Children: must be enrolled in a licensed child care center or family day care home (up to age 12; age 13 for migrant children; age 18 for children with disabilities)", "Adults: must be 60 years or older or functionally impaired, enrolled in a licensed adult day care center", "Must attend a CACFP-participating facility", "Income eligibility applies to family day care home participants and determines reimbursement tiers"]'::jsonb,
  '["Enrollment in a participating care facility", "Income documentation for family day care home participants", "Age and identity documentation as required by the facility"]'::jsonb,
  'https://www.fns.usda.gov/cacfp',
  'https://www.fns.usda.gov/cacfp',
  '[]'::jsonb,
  NULL,
  'child-adult-care-food-program'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Summer Food Service Program',
  'U.S. Department of Agriculture',
  'individual',
  'food',
  'benefit',
  'The Summer Food Service Program (SFSP) provides free meals to children 18 and under at approved community sites during summer months when school is not in session, addressing the nutrition gap low-income children face when school meal programs are unavailable. Any child 18 or younger can eat free at open sites — no income verification or paperwork is required at the point of service. Sites are located at schools, community centers, parks, libraries, and other accessible locations in areas where at least 50% of children qualify for free or reduced-price school meals.',
  NULL,
  true,
  NULL,
  '["Must be 18 years old or younger (up to age 21 for individuals with disabilities)", "Must visit an approved summer meal site during operating hours", "No income verification required at most open sites", "No documentation or registration required to receive a meal"]'::jsonb,
  '["No documentation required at open sites", "Some enrolled or closed sites may require proof of program enrollment"]'::jsonb,
  'https://www.fns.usda.gov/sfsp/find-site',
  'https://www.fns.usda.gov/sfsp',
  '[]'::jsonb,
  NULL,
  'summer-food-service-program'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Food Distribution Program on Indian Reservations',
  'U.S. Department of Agriculture',
  'individual',
  'food',
  'benefit',
  'The Food Distribution Program on Indian Reservations (FDPIR) provides monthly packages of USDA-purchased nutritious foods to income-eligible Native American households living on or near federally recognized Indian reservations and in Oklahoma. The program offers an alternative to SNAP and is distributed by Indian Tribal Organizations (ITOs) or state agencies, with packages tailored to reflect cultural food preferences. FDPIR serves approximately 90,000 people per month at over 100 distribution sites.',
  NULL,
  true,
  NULL,
  '["Must reside on a federally recognized Indian reservation, in approved areas near a reservation, or in Oklahoma", "Must meet income requirements similar to SNAP guidelines", "Must be a U.S. citizen or eligible non-citizen", "Households may not participate in both FDPIR and SNAP in the same month"]'::jsonb,
  '["Proof of identity for all household members", "Proof of tribal membership or residence on/near a reservation", "Proof of household income", "Social Security numbers for all household members (or documentation of exception)"]'::jsonb,
  'https://www.fns.usda.gov/fdpir',
  'https://www.fns.usda.gov/fdpir',
  '[]'::jsonb,
  NULL,
  'fdpir-food-distribution-indian-reservations'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'TEFAP — The Emergency Food Assistance Program',
  'U.S. Department of Agriculture',
  'individual',
  'food',
  'benefit',
  'TEFAP makes USDA-purchased commodity foods available at no cost to low-income Americans through a nationwide network of food banks, food pantries, and soup kitchens. States receive allocations of foods based on their low-income and unemployed populations and distribute them through local food bank networks, where recipients can collect food packages or receive prepared meals. The program distributes billions of pounds of food annually including canned goods, dairy, meat, poultry, and fresh produce.',
  NULL,
  true,
  NULL,
  '["Must meet income eligibility criteria set by the state (typically at or below 185% of Federal Poverty Level)", "Eligibility criteria and documentation requirements vary by state", "Some states or local agencies use an honor system without documentation requirements"]'::jsonb,
  '["Proof of income or participation in another means-tested benefit program (varies by state)", "Government-issued photo ID", "Proof of address (requirements vary by state and local agency)"]'::jsonb,
  'https://www.fns.usda.gov/tefap',
  'https://www.fns.usda.gov/tefap',
  '[]'::jsonb,
  NULL,
  'tefap-emergency-food-assistance'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Senior Farmers Market Nutrition Program',
  'U.S. Department of Agriculture',
  'individual',
  'food',
  'benefit',
  'The Senior Farmers Market Nutrition Program (SFMNP) provides low-income seniors with coupons or electronic benefits redeemable for fresh, locally grown fruits, vegetables, herbs, and honey at participating farmers markets, roadside stands, and community supported agriculture (CSA) programs. Annual benefits typically range from $20 to $50 per person and support both food access for seniors and revenue for local farmers. The program runs seasonally from roughly May through November in most states.',
  50,
  true,
  NULL,
  '["Must be 60 years of age or older (55 for Native American tribal members in some states)", "Must meet income requirements (generally at or below 185% of Federal Poverty Level)", "Must reside in a participating state or tribal area", "Benefits are distributed first-come, first-served until program funds are exhausted"]'::jsonb,
  '["Proof of age (government-issued ID or birth certificate)", "Proof of income or documentation of participation in another means-tested program"]'::jsonb,
  'https://www.fns.usda.gov/sfmnp',
  'https://www.fns.usda.gov/sfmnp',
  '[]'::jsonb,
  NULL,
  'senior-farmers-market-nutrition'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Commodity Supplemental Food Program',
  'U.S. Department of Agriculture',
  'individual',
  'food',
  'benefit',
  'The Commodity Supplemental Food Program (CSFP) improves the health of low-income seniors aged 60 and older by supplementing their diets with monthly packages of nutritious USDA-purchased foods such as canned fruits and vegetables, cheese, pasta, peanut butter, canned juice, and dry milk or cereal. The program operates through approximately 35 states and several Indian Tribal Organizations, distributing food through local agencies, food banks, and senior centers. Waiting lists exist in many areas due to high demand.',
  NULL,
  true,
  NULL,
  '["Must be 60 years of age or older", "Must meet income requirements (at or below 130% of Federal Poverty Level)", "Must reside in an area served by a CSFP distribution site", "Enrollment may be limited by available program capacity"]'::jsonb,
  '["Proof of age (government-issued ID or birth certificate)", "Proof of income (pay stubs, benefit award letters, or tax return)", "Government-issued photo ID", "Proof of address"]'::jsonb,
  'https://www.fns.usda.gov/csfp',
  'https://www.fns.usda.gov/csfp',
  '[]'::jsonb,
  NULL,
  'commodity-supplemental-food-program'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Meals on Wheels',
  'Administration for Community Living, U.S. Department of Health and Human Services',
  'individual',
  'food',
  'benefit',
  'Meals on Wheels, funded through the Older Americans Act and delivered by a national network of local programs, provides home-delivered nutritious meals to seniors who are unable to shop or prepare their own food, along with regular wellness checks and social interaction to reduce isolation. Services typically include hot daily meals, frozen weekend meals, and specialized dietary options for medical needs. The program serves adults 60 and older and often provides additional services such as grocery assistance, transportation, and home safety checks.',
  NULL,
  true,
  NULL,
  '["Must be 60 years of age or older", "Must have difficulty shopping for or preparing meals independently due to physical limitation, disability, or other need", "Must reside within the service area of a participating local program", "Priority given to individuals at greatest nutritional, social, or economic risk", "No income requirement for most programs (voluntary donations encouraged)"]'::jsonb,
  '["Intake application and needs assessment (completed with program coordinator)", "Doctor''s referral or medical documentation may be required by some programs", "Proof of age"]'::jsonb,
  'https://www.mealsonwheelsamerica.org/find-meals',
  'https://www.mealsonwheelsamerica.org',
  '[]'::jsonb,
  NULL,
  'meals-on-wheels'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Double Up Food Bucks',
  'Fair Food Network (USDA-supported)',
  'individual',
  'food',
  'benefit',
  'Double Up Food Bucks is a nutrition incentive program that matches SNAP dollars spent on fruits and vegetables at participating farmers markets and, in some states, grocery stores and co-ops — effectively doubling the purchasing power of SNAP recipients for fresh, locally grown produce. Participants earn matching tokens or digital credits on a dollar-for-dollar basis, with daily or seasonal limits varying by location. The program is funded through USDA Gus Schumacher Nutrition Incentive Program (GusNIP) grants and operates in over 25 states.',
  NULL,
  true,
  NULL,
  '["Must be an active SNAP recipient with a valid EBT card", "Must shop at a participating farmers market, grocery store, or co-op", "Program availability and match limits vary by state and site", "No additional application required beyond current SNAP enrollment"]'::jsonb,
  '["Active SNAP EBT card", "No separate application required"]'::jsonb,
  'https://www.doubleupfoodbucks.org/find-a-location/',
  'https://www.doubleupfoodbucks.org',
  '[]'::jsonb,
  NULL,
  'double-up-food-bucks'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Fresh Fruit and Vegetable Program',
  'U.S. Department of Agriculture',
  'individual',
  'food',
  'benefit',
  'The Fresh Fruit and Vegetable Program (FFVP) provides free fresh and dried fruits and vegetables to elementary school students outside of regular school meal service at selected high-poverty schools, helping children build healthier eating habits and expand their knowledge of diverse produce. Schools with the highest percentages of students enrolled in free and reduced-price meal programs are prioritized for selection by state agencies. The program operates in all 50 states and US territories.',
  NULL,
  true,
  NULL,
  '["Must be a student enrolled in a selected elementary school (typically K-8)", "Schools are selected by state agencies based on poverty level and SNAP/TANF enrollment concentration", "No individual income verification is required for students at point of service"]'::jsonb,
  '["No documentation required for students", "Schools apply to state agencies; contact your school''s administration to check participation"]'::jsonb,
  'https://www.fns.usda.gov/ffvp',
  'https://www.fns.usda.gov/ffvp',
  '[]'::jsonb,
  NULL,
  'fresh-fruit-vegetable-program'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Special Milk Program',
  'U.S. Department of Agriculture',
  'individual',
  'food',
  'benefit',
  'The Special Milk Program (SMP) provides reimbursements to schools, child care institutions, and eligible summer camps to offer free or reduced-price milk to children who do not have access to other federal school meal programs during their school day. It primarily serves children in half-day kindergarten and pre-K programs and split-session schools where some students miss school lunch. Schools and institutions that participate in the National School Lunch Program or School Breakfast Program may use SMP only for students not covered under those programs.',
  NULL,
  true,
  NULL,
  '["Must be enrolled in a participating school, child care institution, or eligible summer camp", "Free milk: household income at or below 185% of Federal Poverty Level", "Must attend a program that does not already provide access to federal school meals, or attend a half-day session without access to school lunch"]'::jsonb,
  '["Milk program application (submitted by parent or guardian)", "Proof of household income for free milk eligibility"]'::jsonb,
  'https://www.fns.usda.gov/smp',
  'https://www.fns.usda.gov/smp',
  '[]'::jsonb,
  NULL,
  'special-milk-program'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO grants (name, agency, category, subcategory, type, description, max_amount, is_recurring, deadline, eligibility_criteria, required_documents, application_url, official_source_url, form_numbers, processing_time_days, slug) VALUES (
  'Nutrition Services Incentive Program',
  'Administration for Community Living, U.S. Department of Health and Human Services',
  'individual',
  'food',
  'benefit',
  'The Nutrition Services Incentive Program (NSIP) provides performance-based grants to states, territories, and tribal organizations to purchase food for Older Americans Act nutrition programs, including congregate meal sites at senior centers and home-delivered meals for homebound older adults. Funds are allocated based on the number of meals served, rewarding programs that serve more seniors with more resources. NSIP supports approximately 1 million older Americans annually through a network of nutrition service providers.',
  NULL,
  true,
  NULL,
  '["Must be 60 years of age or older to access nutrition services funded by this program", "Congregate meals available at senior centers and community dining facilities", "Home-delivered meals available to homebound seniors who cannot attend congregate sites", "Spouse of an eligible older adult may also qualify regardless of age", "No income requirement; donations are accepted but not required"]'::jsonb,
  '["Registration with a local Area Agency on Aging or Older Americans Act nutrition provider", "Proof of age may be required at some programs", "Assessment of need for home delivery may be conducted by program staff"]'::jsonb,
  'https://acl.gov/programs/health-wellness/nutrition-services',
  'https://acl.gov/programs/health-wellness/nutrition-services',
  '[]'::jsonb,
  NULL,
  'nutrition-services-incentive-program'
) ON CONFLICT (slug) DO NOTHING;
