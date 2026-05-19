-- fix-eligibility-criteria.sql
-- Purpose: Replace placeholder eligibility_criteria values with real, accurate criteria
--          for all 49 grants in the grants table.
-- How to run: Execute this file against your Supabase project using the Supabase SQL editor,
--             psql CLI, or any compatible PostgreSQL client.
--             Example (psql): psql -h <host> -U <user> -d <database> -f fix-eligibility-criteria.sql

-- CDC Community Health Worker Training Grant
UPDATE grants SET eligibility_criteria = '["Must be a state or local health department, community-based organization, Federally Qualified Health Center, academic institution, or tribal organization","Must respond to a specific CDC Funding Opportunity Announcement (FOA) — check grants.gov for current opportunities","Must have demonstrated experience working with community health workers or in underserved communities","Must have active SAM.gov registration and a Unique Entity Identifier (UEI)","Priority given to organizations serving medically underserved or high-burden communities"]'::jsonb WHERE slug = 'cdc-community-health-worker-training-grant';

-- Export-Import Bank Small Business Program
UPDATE grants SET eligibility_criteria = '["Must be a US-based small business as defined by SBA size standards","Must export or actively seek to export US goods or services","The exported product or service must have at least 51% US content","Must be creditworthy or able to demonstrate repayment ability for loan products","Business must not be debarred, suspended, or otherwise excluded from federal programs"]'::jsonb WHERE slug = 'exim-small-business-program';

-- DOE Office of Science Grants
UPDATE grants SET eligibility_criteria = '["Must be affiliated with an eligible US institution — university, college, non-profit research institution, or national laboratory","Proposals must be submitted through the institution''s sponsored research office — individuals cannot apply directly","Principal Investigator must hold a doctoral degree or equivalent and be employed at the submitting institution","Research must align with DOE Office of Science priority areas such as basic energy sciences, biological and environmental research, fusion energy, high energy physics, or nuclear physics","Must have active SAM.gov registration and a Unique Entity Identifier (UEI)"]'::jsonb WHERE slug = 'doe-office-of-science-grants';

-- DARPA Research Grants
UPDATE grants SET eligibility_criteria = '["Must respond to a specific DARPA Broad Agency Announcement (BAA) or other solicitation — general applications are not accepted","US citizens, permanent residents, and US-incorporated companies and universities are eligible","Foreign nationals may participate on a case-by-case basis with appropriate government approvals","Small businesses, large businesses, universities, and non-profits are all eligible depending on the specific BAA","Research must be unclassified unless the specific BAA explicitly allows classified work"]'::jsonb WHERE slug = 'darpa-research-grants';

-- DOD Basic Research Program
UPDATE grants SET eligibility_criteria = '["Must respond to a specific DoD Broad Agency Announcement (BAA) or funding opportunity — unsolicited proposals are rarely accepted","US universities, colleges, and other non-profit research organizations are the primary eligible applicants","Small businesses and industry may be eligible depending on the specific BAA","Principal Investigator must have relevant research background and be employed at the submitting institution","Must comply with all applicable export control regulations"]'::jsonb WHERE slug = 'dod-basic-research-program';

-- CDC Research Grants
UPDATE grants SET eligibility_criteria = '["Must respond to a specific CDC Funding Opportunity Announcement (FOA) — eligibility varies by FOA","State and local health departments, universities, hospitals, non-profit organizations, and tribal organizations are commonly eligible","For-profit organizations may be eligible for some FOAs — check the specific announcement","Must have active SAM.gov registration and a Unique Entity Identifier (UEI)","Foreign institutions may apply for some FOAs but are ineligible for others — check the specific FOA"]'::jsonb WHERE slug = 'cdc-research-grants';

-- Veteran Business Fund Grant
UPDATE grants SET eligibility_criteria = '["Must be a US military veteran who owns at least 51% of the business","Must be a US citizen and honorably discharged or serving in the National Guard or Reserve","Business must be majority-owned and actively controlled by the veteran applicant","Must demonstrate a viable business plan and a clear need for grant funds","Must be a small business as defined by the SBA"]'::jsonb WHERE slug = 'veteran-business-fund-grant';

-- NASE Growth Grant
UPDATE grants SET eligibility_criteria = '["Must be a current member of the National Association for the Self-Employed (NASE) in good standing","Must own and operate a micro-business with fewer than 10 employees","Must be a US citizen or permanent resident","Must demonstrate a clear business need and provide a detailed plan for how funds will be used","Must not have received a NASE Growth Grant in the past 12 months"]'::jsonb WHERE slug = 'nase-growth-grant';

-- Comcast RISE Grant
UPDATE grants SET eligibility_criteria = '["Must be a small business that has been in operation for at least three years","Must be majority-owned (51% or more) by a person of color — Black, Indigenous, Hispanic, or other minority group","Must be located in a Comcast Business service area","Must have between 2 and 25 full-time equivalent employees","Must be a for-profit business — non-profits are not eligible"]'::jsonb WHERE slug = 'comcast-rise-grant';

-- Halstead Grant
UPDATE grants SET eligibility_criteria = '["Must be a jewelry business or studio — applicants must work primarily in jewelry design, fabrication, or related fine craft","Business must have been in operation for fewer than 3 years at the application deadline","Must be a for-profit business based in the United States","Previous Halstead Grant recipients are not eligible to apply again","Must submit a business essay and samples of work demonstrating jewelry craft"]'::jsonb WHERE slug = 'halstead-grant';

-- Verizon Small Business Digital Ready Grant
UPDATE grants SET eligibility_criteria = '["Must be a small business owner based in the United States","Must register for the free Verizon Small Business Digital Ready program and complete at least one course or coaching session","Cash grants are awarded to a subset of program participants via sweepstakes or competitive selection","Priority given to small businesses in underserved or under-resourced communities","No minimum revenue or employee count requirement to join the program"]'::jsonb WHERE slug = 'verizon-digital-ready-grant';

-- American Cancer Society Research Grants
UPDATE grants SET eligibility_criteria = '["Must hold a doctoral degree (PhD, MD, DO, DVM, or equivalent) by the grant start date","Must be affiliated with a US non-profit institution such as a university, hospital, or independent research center","US citizenship or permanent residency is required for most early-career grant mechanisms — international PIs may be eligible for some programs","Research must focus on cancer causation, prevention, early detection, treatment, or survivor outcomes","Institutional sign-off from a department chair or sponsored research office is required"]'::jsonb WHERE slug = 'american-cancer-society-research-grants';

-- Doris Duke Charitable Foundation Arts Grants
UPDATE grants SET eligibility_criteria = '["Most Doris Duke arts programs are by invitation or nomination only — unsolicited applications are not accepted for most mechanisms","Must be a performing artist with a significant professional track record in jazz, contemporary dance, theater, or folk arts","Must be a US citizen or permanent resident for most programs","The Doris Duke Artist Awards require artists to have an established body of work and active professional practice","Check the Doris Duke Charitable Foundation website for any open grant cycles or specific program requirements"]'::jsonb WHERE slug = 'doris-duke-arts-grants';

-- American Heart Association Innovative Project Award
UPDATE grants SET eligibility_criteria = '["Must hold a doctoral degree (MD, PhD, DO, or equivalent) and have completed postdoctoral training","Must be affiliated with a US non-profit institution (university, hospital, or research center)","Must be within 10 years of completing the first independent faculty or scientist appointment","The proposed project must be genuinely innovative and not a continuation of ongoing funded work","Research must be directly relevant to cardiovascular disease, stroke, or related vascular biology"]'::jsonb WHERE slug = 'american-heart-association-innovative-project-award';

-- Robert Wood Johnson Foundation Health Policy Fellowship
UPDATE grants SET eligibility_criteria = '["Must be a mid-career health professional with a doctoral degree (MD, PhD, DrPH, JD, or equivalent)","Must be a US citizen or permanent resident","Must have at least 5 years of relevant professional experience in health, public health, or health policy","Must demonstrate a commitment to improving health, health equity, or health policy in the United States","Must be able to take a 12-month leave from current employer to work in Washington, D.C."]'::jsonb WHERE slug = 'rwjf-health-policy-fellowship';

-- CDC Rural Health Grant
UPDATE grants SET eligibility_criteria = '["Must be a state or local health department, rural health network, Federally Qualified Health Center, or other eligible organization","Must respond to a specific CDC Funding Opportunity Announcement (FOA) — check grants.gov for current opportunities","Priority given to organizations serving federally designated rural areas or Health Professional Shortage Areas","Must have active SAM.gov registration and a Unique Entity Identifier (UEI)","Non-profit organizations, universities, and tribal health programs are commonly eligible"]'::jsonb WHERE slug = 'cdc-rural-health-grant';

-- Schmidt Futures Innovation Fellows
UPDATE grants SET eligibility_criteria = '["Applications are by nomination only — individuals cannot apply directly","Must be an exceptional early-career leader with demonstrated impact across multiple fields","Must be willing to take on ambitious cross-disciplinary projects that benefit humanity","Both US and international candidates are considered","Fellows typically come from science, technology, policy, entrepreneurship, or other high-impact fields"]'::jsonb WHERE slug = 'schmidt-futures-innovation-fellows';

-- Cartier Women's Initiative Award
UPDATE grants SET eligibility_criteria = '["Must be a woman who is the founder or co-founder of a for-profit business","Business must be in early stage — ideally between 1 and 3 years old at the time of application","Business must demonstrate a positive societal and/or environmental impact","All sectors and industries are eligible except weapons manufacturing and tobacco","Global program — women entrepreneurs from any country are eligible to apply"]'::jsonb WHERE slug = 'cartier-womens-initiative-award';

-- Eileen Fisher Women-Owned Business Grant
UPDATE grants SET eligibility_criteria = '["Must be a business majority-owned and led by a woman (51% or more ownership)","Business must have been in operation for at least three years at the time of application","Annual revenue must be under $1 million","Business must have a clear environmental sustainability or social justice mission","Both for-profit and non-profit organizations may apply"]'::jsonb WHERE slug = 'eileen-fisher-women-owned-business-grant';

-- IFundWomen General Grant
UPDATE grants SET eligibility_criteria = '["Must be a woman-owned or women-led business or social enterprise","Must be based in the United States","Must have an active IFundWomen profile — registration is free","Specific grant eligibility requirements vary by grant partner and campaign — check the IFundWomen grant marketplace for currently available grants","Business must demonstrate a social, environmental, or economic impact mission"]'::jsonb WHERE slug = 'ifundwomen-general-grant';

-- StreetShares Foundation Veteran Small Business Award
UPDATE grants SET eligibility_criteria = '["Must be a US military veteran, active-duty service member, or military spouse","Must own and operate a small business in the United States","Business must have been in operation for at least one year","Must submit a written business essay describing your story and how the award funds would be used","Must be a US citizen or permanent resident"]'::jsonb WHERE slug = 'streetshares-veteran-small-business-award';

-- AMVETS National Scholarship
UPDATE grants SET eligibility_criteria = '["Must be a US citizen","Must be accepted to or enrolled at an accredited US college, university, or vocational/technical school","Must have a minimum 3.0 GPA on a 4.0 scale for academic scholarship tracks","Preference given to AMVETS members, their dependents, and descendants — open to all eligible US students if not enough qualified applicants from AMVETS families","Must demonstrate financial need"]'::jsonb WHERE slug = 'amvets-national-scholarship';

-- Robert Wood Johnson Foundation Health Equity Grants
UPDATE grants SET eligibility_criteria = '["Must be a US non-profit organization, government agency, or public institution","Must respond to a specific RWJF funding opportunity or request for proposals — unsolicited proposals are generally not accepted","Proposals must address social determinants of health and advance health equity","Must demonstrate organizational capacity to implement the proposed work and manage grant funds","For-profit businesses are generally not eligible"]'::jsonb WHERE slug = 'rwjf-health-equity-grants';

-- Gates Grand Challenges
UPDATE grants SET eligibility_criteria = '["Researchers and organizations from any country are eligible — this is a global program","Must respond to a specific Gates Grand Challenges call or open challenge — check grandchallenges.org for current opportunities","Priority given to scientists and organizations in low- and middle-income countries","Individuals, universities, non-profits, businesses, and government agencies may apply","Proposed solutions must directly address the specific grand challenge focus area stated in the call"]'::jsonb WHERE slug = 'gates-grand-challenges';

-- Bloomberg Philanthropies Public Health Grants
UPDATE grants SET eligibility_criteria = '["Must respond to a specific Bloomberg Philanthropies funding opportunity or be invited to apply","Primarily funds government agencies, non-profit organizations, and academic institutions","Focus areas include tobacco control, road safety, obesity prevention, air quality, and data-driven public health","Global program — US and international organizations may be eligible depending on the initiative","Must demonstrate measurable public health impact and organizational capacity to implement the work"]'::jsonb WHERE slug = 'bloomberg-public-health-grants';

-- EPA Environmental Justice Collaborative Problem-Solving Grant
UPDATE grants SET eligibility_criteria = '["Must be a community-based non-profit organization or a partnership led by one","Must be working on environmental justice issues in a community that is disproportionately burdened by environmental hazards","Must have active SAM.gov registration and a Unique Entity Identifier (UEI)","State, local, and tribal government agencies may participate as partners but cannot serve as the lead applicant","Must respond to the specific EPA grant announcement on grants.gov — check for current open cycles"]'::jsonb WHERE slug = 'epa-environmental-justice-cpsg';

-- Bezos Earth Fund Grants
UPDATE grants SET eligibility_criteria = '["Must be a non-profit organization, research institution, government agency, or intergovernmental organization","Must be working on solutions to climate change, nature loss, or environmental justice","Must respond to a specific Bezos Earth Fund grant opportunity or be invited to apply — unsolicited proposals are not accepted","US and international organizations are eligible","Individuals and for-profit businesses are generally not eligible"]'::jsonb WHERE slug = 'bezos-earth-fund-grants';

-- Packard Foundation Conservation Grants
UPDATE grants SET eligibility_criteria = '["Must be a non-profit organization or scientific institution working in conservation science or marine science","Most funding is made by invitation — unsolicited applications are rarely accepted","Primary focus areas include oceans, land and freshwater conservation, and climate science","For-profit organizations, government agencies, and individuals are generally ineligible","Contact the Packard Foundation before submitting any application to confirm current funding priorities"]'::jsonb WHERE slug = 'packard-foundation-conservation-grants';

-- Hewlett Foundation Environment Grants
UPDATE grants SET eligibility_criteria = '["Must be a non-profit organization, academic institution, or intergovernmental body","Most grants are made by invitation only — unsolicited proposals are not accepted","Focus on climate and clean energy policy, particularly in the Western US and globally","US and international organizations are eligible","For-profit businesses and individuals are generally ineligible"]'::jsonb WHERE slug = 'hewlett-foundation-environment-grants';

-- Open Society Foundations Grants
UPDATE grants SET eligibility_criteria = '["Must respond to a specific Open Society Foundations grant program or funding opportunity","Primarily funds non-profit organizations, civil society groups, academic institutions, and independent media","Focus areas include democracy, human rights, justice reform, education, and public health","Global program — US and international organizations are eligible for most programs","Individual fellowships are available for some programs — most grants go to organizations"]'::jsonb WHERE slug = 'open-society-foundations-grants';

-- Rockefeller Foundation Grants
UPDATE grants SET eligibility_criteria = '["Must respond to a specific Rockefeller Foundation grant program or initiative","Primarily funds non-profit organizations, academic institutions, and international development organizations","Focus areas include food systems, health, power and climate, and economic opportunity","Global program — US and international organizations are eligible","Unsolicited proposals are generally not accepted — most funding is by invitation or through specific initiatives"]'::jsonb WHERE slug = 'rockefeller-foundation-grants';

-- American Legion Legacy Scholarship
UPDATE grants SET eligibility_criteria = '["Must be a child or grandchild of an active-duty service member killed in action on or after September 11, 2001, or a child of a 100% service-connected disabled veteran","Must be a high school graduate or hold a GED equivalent","Must be accepted to or enrolled in an accredited US college or university","Must be a US citizen","Financial need is considered in the selection process"]'::jsonb WHERE slug = 'american-legion-legacy-scholarship';

-- Military Officers Association of America Scholarship
UPDATE grants SET eligibility_criteria = '["Must be a dependent child (under age 24) of an active-duty, retired, or deceased commissioned officer of the US uniformed services","Must be a US citizen enrolled or accepted as a full-time undergraduate student at an accredited US institution","Must have a minimum 3.0 GPA on a 4.0 scale","Must demonstrate financial need","Graduate students and part-time students are not eligible"]'::jsonb WHERE slug = 'moaa-scholarship';

-- WESTAF/NEA Curation Initiative Grant
UPDATE grants SET eligibility_criteria = '["Must be a non-profit arts organization or tribal organization located in the 13-state Western US region served by WESTAF","Must have a demonstrated curatorial capacity and an established exhibition or public programming history","Must respond to the specific WESTAF grant announcement — check westaf.org for current opportunities","For-profit organizations, government agencies, and individuals applying directly are not eligible","Must show commitment to equitable representation in curatorial practice"]'::jsonb WHERE slug = 'westaf-nea-curation-initiative-grant';

-- Artist Trust GAP Grants
UPDATE grants SET eligibility_criteria = '["Must be a resident of Washington State at the time of application","Must be a practicing professional artist in any discipline including visual art, craft, design, film, music, theater, dance, literature, or interdisciplinary work","Must be a US citizen or permanent resident","Must not be enrolled as a full-time student at the time of application","Grants support artist development or career advancement — not for completion of academic degrees"]'::jsonb WHERE slug = 'artist-trust-gap-grants';

-- American Music Center Composer Assistance Program
UPDATE grants SET eligibility_criteria = '["Must be a US citizen or permanent resident","Must be an active composer of contemporary concert music, experimental music, or jazz with a public performance history","Must be affiliated with New Music USA as a member — membership is free","Must not be enrolled as a full-time student at the time of application","Funds support project-specific expenses such as recording sessions, score preparation, or concert production"]'::jsonb WHERE slug = 'new-music-usa-composer-assistance-program';

-- Roddenberry Foundation Catalyst Fund
UPDATE grants SET eligibility_criteria = '["Must be a US non-profit organization with active 501(c)(3) tax-exempt status","Must be working on a specific high-impact project in one of the Foundation''s focus areas: environment, science, or social justice","Most funding is by invitation or nomination — contact the Foundation before submitting any application","Priority given to smaller organizations and innovative projects that may be overlooked by larger funders","Must demonstrate a clear theory of change and measurable impact goals"]'::jsonb WHERE slug = 'roddenberry-foundation-catalyst-fund';

-- NSF Biological Sciences Research (BIO)
UPDATE grants SET eligibility_criteria = '["Must be affiliated with an eligible US institution — accredited college, university, non-profit research organization, or national laboratory","Proposals must be submitted through the institution''s sponsored research office — individual applications are not accepted","Principal Investigator must be employed at the submitting institution at the time of the award","Research must fall within NSF BIO priority areas: molecular and cellular biosciences, environmental biology, integrative organismal systems, or biological infrastructure","Must comply with NSF merit review criteria: Intellectual Merit and Broader Impacts"]'::jsonb WHERE slug = 'nsf-bio-research';

-- NSF Chemistry Research (CHE)
UPDATE grants SET eligibility_criteria = '["Must be affiliated with an eligible US institution — accredited college, university, non-profit research organization, or national laboratory","Proposals must be submitted through the institution''s sponsored research office","Principal Investigator must be employed at the submitting institution","Research must be in chemistry or closely related disciplines including physical, organic, inorganic, analytical, computational, or materials chemistry","Must comply with NSF merit review criteria: Intellectual Merit and Broader Impacts"]'::jsonb WHERE slug = 'nsf-che-research';

-- NSF Engineering Research (ENG)
UPDATE grants SET eligibility_criteria = '["Must be affiliated with an eligible US institution — accredited college, university, non-profit research organization, or national laboratory","Proposals must be submitted through the institution''s sponsored research office","Principal Investigator must be employed at the submitting institution","Research must be in engineering fields including chemical, civil, electrical, mechanical, or biomedical engineering","Must comply with NSF merit review criteria: Intellectual Merit and Broader Impacts"]'::jsonb WHERE slug = 'nsf-eng-research';

-- NSF Computer and Information Science Research (CISE)
UPDATE grants SET eligibility_criteria = '["Must be affiliated with an eligible US institution — accredited college, university, non-profit research organization, or national laboratory","Proposals must be submitted through the institution''s sponsored research office","Principal Investigator must be employed at the submitting institution","Research must be in computing, information science, or engineering — including AI, networking, cybersecurity, human-computer interaction, or software systems","Must comply with NSF merit review criteria: Intellectual Merit and Broader Impacts"]'::jsonb WHERE slug = 'nsf-cise-research';

-- NSF Social, Behavioral and Economic Sciences (SBE)
UPDATE grants SET eligibility_criteria = '["Must be affiliated with an eligible US institution — accredited college, university, non-profit research organization, or national laboratory","Proposals must be submitted through the institution''s sponsored research office","Principal Investigator must be employed at the submitting institution","Research must be in social, behavioral, or economic sciences — including sociology, economics, political science, psychology, linguistics, or anthropology","Must comply with NSF merit review criteria: Intellectual Merit and Broader Impacts"]'::jsonb WHERE slug = 'nsf-sbe-research';

-- NSF Mathematical Sciences Research (DMS)
UPDATE grants SET eligibility_criteria = '["Must be affiliated with an eligible US institution — accredited college, university, non-profit research organization, or national laboratory","Proposals must be submitted through the institution''s sponsored research office","Principal Investigator must be employed at the submitting institution","Research must be in pure or applied mathematics, statistics, or computational mathematics","Must comply with NSF merit review criteria: Intellectual Merit and Broader Impacts"]'::jsonb WHERE slug = 'nsf-dms-research';

-- NSF Geosciences Research (GEO)
UPDATE grants SET eligibility_criteria = '["Must be affiliated with an eligible US institution — accredited college, university, non-profit research organization, or national laboratory","Proposals must be submitted through the institution''s sponsored research office","Principal Investigator must be employed at the submitting institution","Research must be in geosciences including atmospheric science, earth sciences, ocean sciences, or polar programs","Must comply with NSF merit review criteria: Intellectual Merit and Broader Impacts"]'::jsonb WHERE slug = 'nsf-geo-research';

-- AHRQ Health Services Research Grant
UPDATE grants SET eligibility_criteria = '["Must respond to a specific AHRQ Funding Opportunity Announcement (FOA) — check grants.gov for current opportunities","Eligible applicants include US non-profit organizations, for-profit organizations, government agencies, universities, and hospitals","Principal Investigator must hold a doctoral degree or equivalent and have relevant research experience","Research must be in health services, clinical practice, health IT, care coordination, or patient safety — not basic biomedical research","Must have active SAM.gov registration and a Unique Entity Identifier (UEI)"]'::jsonb WHERE slug = 'ahrq-health-services-research-grant';

-- PCORI Research Awards
UPDATE grants SET eligibility_criteria = '["Must be a US healthcare provider, research institution, patient advocacy organization, health insurer, or other health-focused organization","Research must be patient-centered and focus on comparative clinical effectiveness — comparing two or more treatment or care options","Principal Investigator must have relevant clinical or health services research expertise","Patient and stakeholder engagement in the research design is required","Must respond to a specific PCORI funding announcement or merit review cycle — check pcori.org for current opportunities"]'::jsonb WHERE slug = 'pcori-research-awards';

-- Burroughs Wellcome Fund Career Awards
UPDATE grants SET eligibility_criteria = '["Must be a physician or scientist conducting biomedical or translational research","Must be affiliated with a US or Canadian non-profit research institution","Must be a US or Canadian citizen or permanent resident for most programs — check the specific career award for citizenship requirements","Must apply for the career stage award that matches your current position: predoctoral, postdoctoral, or early faculty","Research must be in basic biomedical, disease-oriented, or translational science"]'::jsonb WHERE slug = 'burroughs-wellcome-career-awards';

-- Rhodes Scholarship
UPDATE grants SET eligibility_criteria = '["Must be a US citizen (for the US constituency of the Rhodes Scholarship)","Must be between 18 and 24 years old at the time of application","Must have received or be on track to receive a bachelor''s degree by the following October","Must demonstrate exceptional intellectual achievement, leadership, character, and commitment to service","Must be willing to pursue a full-time graduate degree at the University of Oxford, England"]'::jsonb WHERE slug = 'rhodes-scholarship';

-- Churchill Scholarship
UPDATE grants SET eligibility_criteria = '["Must be a US citizen — permanent residents are not eligible","Must be between 19 and 26 years old at the time of application","Must hold a bachelor''s degree from a currently participating US college or university","Must have a minimum cumulative GPA of 3.7 on a 4.0 scale or equivalent","Must pursue a one-year graduate degree in a STEM field at Churchill College, University of Cambridge — must be nominated by your undergraduate institution"]'::jsonb WHERE slug = 'churchill-scholarship';
