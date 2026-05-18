-- ============================================================
-- grant-eligibility-docs-audit.sql
-- Official-source eligibility/document audit for grant rows.
-- Run in Supabase SQL editor after the seed files.
--
-- This file does not insert new grants. It only updates existing
-- grant slugs and removes rows found to be inactive, non-grant, or
-- not a current applicant-facing grant/scholarship program.
-- ============================================================

BEGIN;

-- High-confidence official-source corrections.
WITH audited_updates(slug, eligibility_criteria, required_documents) AS (
  VALUES
  (
    'sbir-phase-2-grant',
    '["Must be a for-profit U.S. small business with 500 or fewer employees, including affiliates","Must be more than 50% directly owned and controlled by U.S. citizens or permanent resident aliens, or by another eligible small business concern","Must have received a Phase I SBIR award and be invited or otherwise eligible to submit a Phase II proposal under the awarding agency''s solicitation","Work must follow the awarding agency''s SBIR Phase II solicitation and topic requirements"]'::jsonb,
    '["Agency-specific Phase II application package submitted through the required portal","Technical proposal or project narrative","Commercialization plan","Budget and budget justification","Biographical sketches or resumes for key personnel","Required SBIR certifications and representations"]'::jsonb
  ),
  (
    'sttr-phase-1-grant',
    '["Must be a for-profit U.S. small business with 500 or fewer employees, including affiliates","Must be more than 50% directly owned and controlled by U.S. citizens or permanent resident aliens, or by another eligible small business concern","Must formally collaborate with a U.S. nonprofit research institution","Small business must perform at least 40% of the research and development work","Research institution must perform at least 30% of the research and development work","Must meet the awarding agency''s STTR solicitation and topic requirements"]'::jsonb,
    '["Agency-specific STTR Phase I application package","Technical proposal or project narrative","Budget and budget justification","Biographical sketches or resumes for key personnel","Research institution commitment or cooperative agreement documentation as required by the agency","Required STTR certifications and representations"]'::jsonb
  ),
  (
    'sttr-phase-2-grant',
    '["Must meet STTR small business and research institution eligibility requirements","Must have completed or received a Phase I STTR award and be eligible to submit Phase II under the awarding agency''s solicitation","Small business must perform at least 40% of the research and development work","Research institution must perform at least 30% of the research and development work","Must meet the awarding agency''s Phase II solicitation and topic requirements"]'::jsonb,
    '["Agency-specific STTR Phase II application package","Technical proposal or project narrative","Commercialization plan","Budget and budget justification","Biographical sketches or resumes for key personnel","Research institution agreement or commitment documentation as required","Required STTR certifications and representations"]'::jsonb
  ),
  (
    'doe-small-business-clean-energy',
    '["Must meet SBIR/STTR small business eligibility requirements, including for-profit U.S. small business status and 500 or fewer employees, including affiliates","Must satisfy DOE SBIR/STTR Funding Opportunity Announcement requirements for the selected topic","For SBIR, the principal investigator is generally primarily employed by the small business during the project","For STTR, the small business must partner with a qualifying research institution and meet required work-share rules"]'::jsonb,
    '["DOE SBIR/STTR application package required by the current Funding Opportunity Announcement","Technical volume","Commercialization plan, if required by phase or solicitation","Budget and budget justification","Biographical sketches for key personnel","Letters of commitment or support, if required","Required certifications and forms listed in the DOE FOA"]'::jsonb
  ),
  (
    'usda-sbir',
    '["Must be a for-profit U.S. small business with 500 or fewer employees, including affiliates","Must meet federal SBIR ownership and control requirements","Research must address USDA/NIFA SBIR topic areas in the current solicitation","Principal investigator and performance requirements must comply with the current USDA/NIFA SBIR Request for Applications"]'::jsonb,
    '["Grants.gov application package for the current USDA/NIFA SBIR opportunity","SF-424 forms required by the opportunity","Project narrative or technical proposal","Budget and budget justification","Biographical sketches or resumes for key personnel","Required certifications and attachments listed in the current Request for Applications"]'::jsonb
  ),
  (
    'usda-rural-business-development-grant',
    '["Eligible applicants include rural public entities, Indian Tribes, and rural nonprofit corporations","Projects must benefit rural areas or towns outside the urbanized periphery of cities with populations of 50,000 or more","Funds must be used for eligible business opportunity or business enterprise grant purposes","Small and emerging private businesses assisted by the project must have fewer than 50 employees and less than $1 million in gross revenue"]'::jsonb,
    '["Application submitted to the USDA Rural Development state office","Forms and attachments required by the current USDA Rural Development application instructions","Project narrative or scope of work","Budget information","Evidence of applicant eligibility","Supporting documentation required by the state office or current notice"]'::jsonb
  ),
  (
    'usda-value-added-producer-grant',
    '["Eligible applicants include independent producers, agricultural producer groups, farmer or rancher cooperatives, and majority-controlled producer-based business ventures","Applicant must propose planning or working capital activities for producing and marketing a value-added agricultural product","Applicants must meet USDA Rural Development eligibility and matching-fund requirements in the current notice"]'::jsonb,
    '["Application submitted to USDA Rural Development","Forms required by the current notice or application package","Project proposal or work plan","Budget and budget narrative","Business plan or feasibility study where required, especially for working capital requests","Evidence of matching funds","Documentation of applicant and producer eligibility"]'::jsonb
  ),
  (
    'specialty-crop-block-grant',
    '["Eligible direct applicants to USDA AMS are state departments of agriculture or equivalent state agencies","Projects must enhance the competitiveness of specialty crops","Individual producers and organizations generally apply through state-administered subgrant processes, not directly to USDA AMS"]'::jsonb,
    '["State plan or application package submitted by the state agency to AMS","Project profile or narrative","Budget information","Assurances and certifications required by AMS","For subgrants, documents vary by state program"]'::jsonb
  ),
  (
    'step-export-assistance',
    '["Must be an eligible small business concern as defined by SBA","Must be organized or incorporated in the United States","Must be in good standing with the state of incorporation or organization","Must have been in business for at least one year, where required by SBA STEP rules","Must have sufficient resources to bear costs associated with trade","Must apply through a participating state or territory STEP awardee"]'::jsonb,
    '["Application submitted to the participating state or territory STEP office","Required documents vary by state STEP program","Commonly requested materials may include export plan, business information, budget for proposed export activity, and certifications required by the state"]'::jsonb
  ),
  (
    'state-small-business-credit-initiative',
    '["SSBCI funds are administered by states, territories, Tribal governments, and eligible jurisdictions through approved programs","Business eligibility, size standards, and documentation vary by the participating jurisdiction and program","Applicants must apply through their state or jurisdiction''s SSBCI-supported program, not directly to Treasury"]'::jsonb,
    '["Required documents vary by state or jurisdiction program","Treasury does not publish one universal business application document list for all SSBCI recipients"]'::jsonb
  ),
  (
    'socially-disadvantaged-farmers-grant',
    '["Eligible applicants are institutions or organizations specified in the current NIFA funding opportunity for the Socially Disadvantaged Farmers and Ranchers Policy Research Center","Projects must support policy research or related work serving socially disadvantaged farmers and ranchers as described in the current NIFA opportunity","Individuals are not verified as direct eligible applicants unless listed in the current funding opportunity"]'::jsonb,
    '["Grants.gov application package","SF-424 forms required by the opportunity","Project narrative","Budget and budget justification","Documentation and attachments required in the current NIFA Request for Applications"]'::jsonb
  ),
  (
    'urban-agriculture-innovative-production',
    '["Eligible applicants are listed in the current USDA/NIFA Urban Agriculture and Innovative Production funding opportunity and may include nonprofit organizations, local governments, Tribal governments, schools, and other entities specified in the opportunity","Projects must support urban, indoor, or other innovative agricultural production activities consistent with the current opportunity","Applicants must meet all requirements in the current NIFA Request for Applications"]'::jsonb,
    '["Grants.gov application package","SF-424 forms required by the opportunity","Project narrative","Budget and budget justification","Letters of support or commitment, if required by the current opportunity","Other attachments required by the current NIFA Request for Applications"]'::jsonb
  ),
  (
    'usda-afri-research-grants',
    '["Eligible applicants vary by AFRI program area and are specified in the current NIFA Request for Applications","Applicants may include colleges and universities, research institutions, federal agencies, national laboratories, private organizations, individuals, or other entities where permitted by the specific AFRI opportunity","Projects must address AFRI priorities and comply with the specific program-area requirements"]'::jsonb,
    '["Grants.gov application package","SF-424 forms required by the opportunity","Project narrative","Budget and budget justification","Biographical sketch or CV documents as required","Current and pending support, if required","Data management plan","Other attachments required by the current AFRI Request for Applications"]'::jsonb
  ),
  (
    'usda-biorefinery-biobased-product-grant',
    '["Eligible applicants include individuals, entities, Indian Tribes, state or local governments, corporations, farm cooperatives, farmer cooperative organizations, associations of agricultural producers, national laboratories, institutions of higher education, rural electric cooperatives, public power entities, or consortiums, as allowed by USDA Rural Development","Project must support development, construction, or retrofitting of commercial-scale biorefineries or eligible renewable chemical and biobased product manufacturing facilities","Applicant must meet USDA Rural Development program and financing requirements"]'::jsonb,
    '["Application materials required by USDA Rural Development for the program","Technical report or technical information requested by the program","Financial statements and credit information required by USDA Rural Development","Feasibility study or business plan where required","Environmental information required by USDA Rural Development","Evidence of matching funds or other financing, where required"]'::jsonb
  ),
  (
    'usda-organic-transition',
    '["Organic Transition Initiative assistance is delivered through multiple USDA programs rather than one single grant","Eligibility depends on the specific USDA organic transition program or service being used","Producers transitioning to organic production should use the requirements of the relevant USDA program, such as technical assistance, certification cost share, crop insurance, or market development support"]'::jsonb,
    '["Required documents vary by the specific USDA organic transition program","No single universal application document list verified for the Organic Transition Initiative page"]'::jsonb
  ),
  (
    'sare-sustainable-agriculture',
    '["Eligibility varies by SARE region and grant type","Eligible applicants may include farmers, ranchers, researchers, educators, graduate students, nonprofit organizations, or other applicants specified by the regional grant program","Projects must address sustainable agriculture and comply with the relevant regional call for proposals"]'::jsonb,
    '["Application through the relevant regional SARE grant system","Project proposal","Budget","Applicant and collaborator information","Additional attachments required by the specific region and grant type"]'::jsonb
  ),
  (
    'simons-foundation-research-grants',
    '["Eligibility varies by Simons Foundation funding opportunity and must be verified on the specific program page","Applicants are generally investigators or institutions submitting through the Simons Foundation grants portal, where permitted by the specific opportunity"]'::jsonb,
    '["Application materials vary by specific Simons Foundation funding opportunity","Use the requirements listed on the specific Simons Foundation program page and grants portal"]'::jsonb
  ),
  (
    'smithsonian-institution-fellowships',
    '["Eligibility varies by Smithsonian fellowship category","Graduate Student Fellowships are for students formally enrolled in a graduate program","Predoctoral Fellowships are for doctoral candidates who have completed preliminary requirements other than dissertation","Postdoctoral and Senior Fellowships require a doctoral degree or equivalent professional accomplishment","Applicants must propose research using Smithsonian collections, facilities, staff expertise, or research interests"]'::jsonb,
    '["Online application through the Smithsonian fellowship system","Research proposal","Curriculum vitae","Academic transcripts, where required for student or predoctoral categories","References or letters of recommendation","Additional materials required by the specific fellowship category"]'::jsonb
  ),
  (
    'vfw-voice-of-democracy-scholarship',
    '["Open to students in grades 9-12 enrolled in a public, private, parochial, or home study program in the United States, its territories or possessions, or in an overseas U.S. military or civilian school","Applicant must be a lawful U.S. permanent resident or have applied for permanent residence and intend to become a U.S. citizen","Foreign exchange students, students age 20 or older, previous Voice of Democracy first-place state winners, GED students, and adult education students are not eligible"]'::jsonb,
    '["Completed Voice of Democracy entry form","Original 3-to-5-minute audio essay","Typed essay transcript","Submission through a local participating VFW Post by the official deadline"]'::jsonb
  ),
  (
    'wosb-federal-contracting',
    '["Must be a small business according to SBA size standards","Must be at least 51% owned and controlled by women who are U.S. citizens","Women must manage day-to-day operations and make long-term decisions","For EDWOSB eligibility, applicants must also meet SBA economic disadvantage requirements"]'::jsonb,
    '["WOSB or EDWOSB certification through SBA''s certification process or approved third-party certifier","Documentation proving 51% woman ownership and control","Business formation and governance documents","SAM.gov registration","Financial documents required for EDWOSB applicants, if applying as economically disadvantaged"]'::jsonb
  ),
  (
    'sba-small-business-debt-relief',
    '["Eligible SBA borrowers with covered 7(a), 504, or Microloans received SBA debt-relief payments under COVID-19 relief authorities","Eligibility and payment duration depended on loan type, approval date, and later statutory changes","Program was COVID-19 relief and is no longer an open grant application program"]'::jsonb,
    '["No borrower application was generally required for automatic SBA debt-relief payments","Borrowers should contact their SBA lender for loan-specific records or status"]'::jsonb
  ),
  (
    'small-business-environmental-assistance',
    '["Small businesses seeking help understanding or complying with environmental regulations may use EPA and state small business environmental assistance resources","Eligibility, intake process, and confidentiality rules vary by state program"]'::jsonb,
    '["No standard federal grant application documents verified","Contact the relevant state Small Business Environmental Assistance Program for required intake information"]'::jsonb
  )
)
UPDATE grants
SET
  eligibility_criteria = audited_updates.eligibility_criteria,
  required_documents = audited_updates.required_documents
FROM audited_updates
WHERE grants.slug = audited_updates.slug
  AND grants.type = 'grant';

-- Rows whose official/source page did not verify stable universal criteria.
-- These stay in the catalog, but the old specific claims are replaced with
-- conservative source-check language so the site does not overstate eligibility.
UPDATE grants
SET
  eligibility_criteria = '["Eligibility could not be verified as a stable universal rule from the current official source. Check the current official opportunity, solicitation, request for proposals, or application portal before applying.","Do not rely on older criteria for this program unless the current official opportunity repeats them."]'::jsonb,
  required_documents = '["Required documents could not be verified as a stable universal list from the current official source.","Use only the document checklist in the current official opportunity, solicitation, request for proposals, or application portal."]'::jsonb
WHERE type = 'grant'
  AND slug IN (
    'ahrq-health-services-research-grant',
    'american-cancer-society-research-grants',
    'american-heart-association-innovative-project-award',
    'american-legion-legacy-scholarship',
    'amvets-national-scholarship',
    'artist-trust-gap-grants',
    'bezos-earth-fund-grants',
    'bloomberg-public-health-grants',
    'burroughs-wellcome-career-awards',
    'cartier-womens-initiative-award',
    'cdc-community-health-worker-training-grant',
    'cdc-research-grants',
    'cdc-rural-health-grant',
    'churchill-scholarship',
    'comcast-rise-grant',
    'darpa-research-grants',
    'dod-basic-research-program',
    'doe-office-of-science-grants',
    'doris-duke-arts-grants',
    'eileen-fisher-women-owned-business-grant',
    'epa-environmental-justice-cpsg',
    'exim-small-business-program',
    'gates-grand-challenges',
    'halstead-grant',
    'hewlett-foundation-environment-grants',
    'ifundwomen-general-grant',
    'moaa-scholarship',
    'nase-growth-grant',
    'new-music-usa-composer-assistance-program',
    'nsf-bio-research',
    'nsf-che-research',
    'nsf-cise-research',
    'nsf-dms-research',
    'nsf-eng-research',
    'nsf-geo-research',
    'nsf-sbe-research',
    'open-society-foundations-grants',
    'packard-foundation-conservation-grants',
    'pcori-research-awards',
    'rhodes-scholarship',
    'rockefeller-foundation-grants',
    'roddenberry-foundation-catalyst-fund',
    'rwjf-health-equity-grants',
    'rwjf-health-policy-fellowship',
    'schmidt-futures-innovation-fellows',
    'streetshares-veteran-small-business-award',
    'verizon-digital-ready-grant',
    'veteran-business-fund-grant',
    'westaf-nea-curation-initiative-grant'
  );

-- Rows the audit found should not remain in the grant catalog.
-- Reasons: inactive/closed historical programs, loans/tax incentives,
-- contracting certifications, non-grant investment programs, duplicate
-- superseded USDA programs, or no current official applicant-facing grant.
DELETE FROM saved_programs
WHERE program_type = 'grant'
  AND program_slug IN (
    'accion-opportunity-fund-grant',
    'chase-mission-main-street-grant',
    'community-navigator-pilot',
    'distressed-capital-access-program',
    'doe-solar-for-all-program',
    'girlboss-foundation-grant',
    'hivers-and-strivers-angel-fund',
    'hubzone-program',
    'jack-kent-cooke-graduate-arts-award',
    'javits-fellowship',
    'main-street-lending-program',
    'manufacturing-extension-partnership',
    'mbda-minority-business-grants',
    'opportunity-zone-business-investment',
    'paul-douglas-teacher-scholarship',
    'sams-club-small-business-grant',
    'sba-community-advantage-loans',
    'usda-rbeg'
  );

DELETE FROM grants
WHERE type = 'grant'
  AND slug IN (
    'accion-opportunity-fund-grant',
    'chase-mission-main-street-grant',
    'community-navigator-pilot',
    'distressed-capital-access-program',
    'doe-solar-for-all-program',
    'girlboss-foundation-grant',
    'hivers-and-strivers-angel-fund',
    'hubzone-program',
    'jack-kent-cooke-graduate-arts-award',
    'javits-fellowship',
    'main-street-lending-program',
    'manufacturing-extension-partnership',
    'mbda-minority-business-grants',
    'opportunity-zone-business-investment',
    'paul-douglas-teacher-scholarship',
    'sams-club-small-business-grant',
    'sba-community-advantage-loans',
    'usda-rbeg'
  );

COMMIT;
