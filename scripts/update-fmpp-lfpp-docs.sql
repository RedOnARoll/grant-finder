-- Update required_documents for FMPP and LFPP to match official 2026 application requirements.
-- Run in Supabase SQL editor.

UPDATE grants
SET required_documents = '["2026 FMPP and LFPP Project Narrative (docx)", "2026 FMPP and LFPP Turnkey Marketing and Promotion Project Narrative (docx)", "2026 FMPP and LFPP Turnkey Recruitment and Training Project Narrative (docx)", "2026 FMPP and LFPP Project Narrative Guide (pdf)", "Letter Verification for Cost Share Funds template (docx)", "Forms SF-424 and SF-424A", "Letter of Commitment from Partner and Collaborator template (docx)", "Evidence of Critical Resources and Infrastructure Letter Template (docx) [if applicable]", "Negotiated Indirect Cost Rate Agreement [if applicable]"]'::jsonb
WHERE slug IN ('farmers-market-promotion-program', 'local-food-promotion-program');
