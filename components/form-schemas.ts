// ── Field types ───────────────────────────────────────────────────────────────

export type TextField   = { type: "text";    key: string; label: string; placeholder?: string; hint?: string }
export type RadioField  = { type: "radio";   key: string; label: string; options: string[] }
export type SelectField = { type: "select";  key: string; label: string; options: string[] }
export type GroupRow    = { type: "row";     fields: Array<TextField | RadioField | SelectField> }
export type SectionHead = { type: "section"; label: string; sub?: string }
export type AnyField = TextField | RadioField | SelectField | GroupRow | SectionHead

// ── SF-424 ────────────────────────────────────────────────────────────────────

const SF424: AnyField[] = [
  { type: "section", label: "1 · Type of Submission" },
  { type: "radio", key: "submission_type", label: "", options: ["Application", "Pre-Application", "Changed/Corrected Application"] },
  { type: "section", label: "2 · Type of Application" },
  { type: "radio", key: "application_type", label: "", options: ["New", "Continuation", "Revision"] },
  { type: "text", key: "revision_type", label: "If Revision, select appropriate letter(s)", placeholder: "e.g. A, B, C, D, E, or F" },
  { type: "row", fields: [
    { type: "text", key: "date_received_state",   label: "3. Date Received by State", placeholder: "MM/DD/YYYY" },
    { type: "text", key: "state_app_identifier",  label: "State Application Identifier" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "date_received_federal", label: "4a. Date Received by Federal Agency", placeholder: "MM/DD/YYYY" },
    { type: "text", key: "federal_identifier",    label: "4b. Federal Identifier" },
  ]},
  { type: "section", label: "5 · Applicant Information" },
  { type: "text", key: "legal_name", label: "a. Legal Name of Applicant", placeholder: "Full legal name of the applying organization" },
  { type: "row", fields: [
    { type: "text", key: "dept_name", label: "b. Department Name" },
    { type: "text", key: "div_name",  label: "Division Name" },
  ]},
  { type: "text", key: "uei", label: "c. Unique Entity Identifier (UEI)", placeholder: "12-character alphanumeric UEI from SAM.gov" },
  { type: "text", key: "addr_street1", label: "d. Street Address 1", placeholder: "Street address" },
  { type: "text", key: "addr_street2", label: "Street Address 2", placeholder: "Suite, floor, unit (optional)" },
  { type: "row", fields: [
    { type: "text", key: "addr_city",   label: "City" },
    { type: "text", key: "addr_county", label: "County" },
    { type: "text", key: "addr_state",  label: "State / Province" },
    { type: "text", key: "addr_zip",    label: "Zip / Postal Code" },
  ]},
  { type: "text", key: "addr_country", label: "Country", placeholder: "USA" },
  { type: "section", label: "f · Primary Contact", sub: "Person to contact on matters involving this application" },
  { type: "row", fields: [
    { type: "text", key: "contact_first",  label: "First Name" },
    { type: "text", key: "contact_middle", label: "Middle Name" },
    { type: "text", key: "contact_last",   label: "Last Name" },
    { type: "text", key: "contact_suffix", label: "Suffix" },
  ]},
  { type: "text", key: "contact_title", label: "Title" },
  { type: "row", fields: [
    { type: "text", key: "contact_tel",   label: "Telephone Number", placeholder: "(555) 555-5555" },
    { type: "text", key: "contact_fax",   label: "Fax Number" },
    { type: "text", key: "contact_email", label: "Email Address" },
  ]},
  { type: "section", label: "6 · Employer Identification Number (EIN / TIN)" },
  { type: "text", key: "ein", label: "EIN / TIN", placeholder: "XX-XXXXXXX" },
  { type: "section", label: "7 · Type of Applicant" },
  { type: "select", key: "applicant_type", label: "Select the most appropriate type", options: [
    "State Government", "County Government", "City or Township Government",
    "Special District Government", "Regional Organization",
    "Indian/Native American Tribal Government (Federally Recognized)",
    "Indian/Native American Tribal Government (Other than Federally Recognized)",
    "Indian/Native American Tribally Designated Organization",
    "Public/State Controlled Institution of Higher Education",
    "Private Institution of Higher Education",
    "Individual", "For-Profit Organization (Other than Small Business)",
    "Small Business", "Nonprofit with 501C3 IRS Status", "Nonprofit without 501C3 IRS Status",
    "Other (specify below)",
  ]},
  { type: "text", key: "applicant_type_other", label: "If Other, specify" },
  { type: "section", label: "8 · Name of Federal Agency" },
  { type: "text", key: "federal_agency", label: "Federal Agency Name", placeholder: "e.g. Department of Health and Human Services" },
  { type: "section", label: "9 · CFDA Number & Program Title" },
  { type: "row", fields: [
    { type: "text", key: "cfda_number", label: "CFDA Number", placeholder: "XX.XXX" },
    { type: "text", key: "cfda_title",  label: "Program Title" },
  ]},
  { type: "section", label: "10 · Funding Opportunity" },
  { type: "row", fields: [
    { type: "text", key: "foa_number", label: "Funding Opportunity Number" },
    { type: "text", key: "foa_title",  label: "Title" },
  ]},
  { type: "section", label: "11 · Competition Identification" },
  { type: "row", fields: [
    { type: "text", key: "comp_id_number", label: "Competition ID Number" },
    { type: "text", key: "comp_id_title",  label: "Title" },
  ]},
  { type: "section", label: "12 · Areas Affected by Project" },
  { type: "text", key: "areas_affected", label: "Cities, counties, states, and/or countries", placeholder: "List all affected jurisdictions" },
  { type: "section", label: "13 · Descriptive Title of Applicant's Project" },
  { type: "text", key: "project_title", label: "Project Title", placeholder: "Brief descriptive title of the proposed project" },
  { type: "section", label: "14 · Congressional Districts" },
  { type: "row", fields: [
    { type: "text", key: "congress_applicant", label: "a. Applicant Congressional District", placeholder: "e.g. TX-05" },
    { type: "text", key: "congress_project",   label: "b. Program/Project Congressional Districts" },
  ]},
  { type: "section", label: "15 · Project Period" },
  { type: "row", fields: [
    { type: "text", key: "project_start", label: "Start Date", placeholder: "MM/DD/YYYY" },
    { type: "text", key: "project_end",   label: "End Date",   placeholder: "MM/DD/YYYY" },
  ]},
  { type: "section", label: "16 · Estimated Funding ($)" },
  { type: "row", fields: [
    { type: "text", key: "fund_federal",   label: "a. Federal",   placeholder: "0.00" },
    { type: "text", key: "fund_applicant", label: "b. Applicant", placeholder: "0.00" },
    { type: "text", key: "fund_state",     label: "c. State",     placeholder: "0.00" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "fund_local",   label: "d. Local",          placeholder: "0.00" },
    { type: "text", key: "fund_other",   label: "e. Other",          placeholder: "0.00" },
    { type: "text", key: "fund_income",  label: "f. Program Income", placeholder: "0.00" },
  ]},
  { type: "text", key: "fund_total", label: "g. TOTAL", placeholder: "0.00", hint: "Sum of a–f" },
  { type: "section", label: "17 · Delinquency on Federal Debt" },
  { type: "radio", key: "fed_debt", label: "Is the applicant delinquent on any Federal debt?", options: ["Yes", "No"] },
  { type: "text", key: "fed_debt_explanation", label: "If Yes, provide explanation", placeholder: "Explain the nature and status of the delinquency" },
  { type: "section", label: "18 · Authorized Representative" },
  { type: "row", fields: [
    { type: "text", key: "auth_prefix", label: "Prefix" },
    { type: "text", key: "auth_first",  label: "First Name" },
    { type: "text", key: "auth_middle", label: "Middle Name" },
    { type: "text", key: "auth_last",   label: "Last Name" },
    { type: "text", key: "auth_suffix", label: "Suffix" },
  ]},
  { type: "text", key: "auth_title", label: "Title" },
  { type: "row", fields: [
    { type: "text", key: "auth_tel",   label: "Telephone", placeholder: "(555) 555-5555" },
    { type: "text", key: "auth_fax",   label: "Fax" },
    { type: "text", key: "auth_email", label: "Email" },
  ]},
  { type: "text", key: "auth_signature",   label: "Signature of Authorized Representative", placeholder: "Type full legal name as signature" },
  { type: "text", key: "auth_date_signed", label: "Date Signed", placeholder: "MM/DD/YYYY" },
]

// ── SF-424A ───────────────────────────────────────────────────────────────────

const SF424A: AnyField[] = [
  { type: "section", label: "Section A · Budget Summary" },
  { type: "text", key: "grant_program", label: "Grant Program / Activity / Project", placeholder: "Name of the program" },
  { type: "row", fields: [
    { type: "text", key: "catalog_cfda",           label: "Catalog No. (CFDA)", placeholder: "XX.XXX" },
    { type: "text", key: "est_unobligated_fed",    label: "Unobligated Funds — Federal ($)" },
    { type: "text", key: "est_unobligated_nonfed", label: "Non-Federal ($)" },
    { type: "text", key: "new_revised_federal",    label: "New/Revised Budget — Federal ($)" },
    { type: "text", key: "new_revised_nonfed",     label: "Non-Federal ($)" },
    { type: "text", key: "total_budget",           label: "Total ($)" },
  ]},
  { type: "section", label: "Section B · Budget Categories" },
  { type: "row", fields: [
    { type: "text", key: "personnel",    label: "Personnel ($)" },
    { type: "text", key: "fringe",       label: "Fringe Benefits ($)" },
    { type: "text", key: "travel",       label: "Travel ($)" },
    { type: "text", key: "equipment",    label: "Equipment ($)" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "supplies",     label: "Supplies ($)" },
    { type: "text", key: "contractual",  label: "Contractual ($)" },
    { type: "text", key: "construction", label: "Construction ($)" },
    { type: "text", key: "other",        label: "Other ($)" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "total_direct", label: "Total Direct Charges ($)" },
    { type: "text", key: "indirect",     label: "Indirect Charges ($)" },
    { type: "text", key: "totals",       label: "Totals ($)" },
  ]},
  { type: "section", label: "Section C · Non-Federal Resources" },
  { type: "row", fields: [
    { type: "text", key: "nonfed_applicant", label: "Applicant ($)" },
    { type: "text", key: "nonfed_state",     label: "State ($)" },
    { type: "text", key: "nonfed_other",     label: "Other Sources ($)" },
    { type: "text", key: "nonfed_total",     label: "TOTAL ($)" },
  ]},
  { type: "section", label: "Section D · Forecasted Cash Needs" },
  { type: "row", fields: [
    { type: "text", key: "cash_fed_q1",    label: "Federal Q1 ($)" },
    { type: "text", key: "cash_fed_q2",    label: "Federal Q2 ($)" },
    { type: "text", key: "cash_fed_q3",    label: "Federal Q3 ($)" },
    { type: "text", key: "cash_fed_q4",    label: "Federal Q4 ($)" },
    { type: "text", key: "cash_fed_total", label: "Federal Total ($)" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "cash_nonfed_q1",    label: "Non-Fed Q1 ($)" },
    { type: "text", key: "cash_nonfed_q2",    label: "Non-Fed Q2 ($)" },
    { type: "text", key: "cash_nonfed_q3",    label: "Non-Fed Q3 ($)" },
    { type: "text", key: "cash_nonfed_q4",    label: "Non-Fed Q4 ($)" },
    { type: "text", key: "cash_nonfed_total", label: "Non-Fed Total ($)" },
  ]},
  { type: "section", label: "Section E · Future Federal Funds Needed" },
  { type: "row", fields: [
    { type: "text", key: "future_year1", label: "Future Period 1 ($)" },
    { type: "text", key: "future_year2", label: "Future Period 2 ($)" },
    { type: "text", key: "future_year3", label: "Future Period 3 ($)" },
  ]},
  { type: "section", label: "Section F · Other Budget Information" },
  { type: "text", key: "direct_charges",   label: "Direct Charges explanation", placeholder: "Describe direct charges if needed" },
  { type: "text", key: "indirect_charges", label: "Indirect Charges basis",     placeholder: "Rate, base, and period of availability" },
  { type: "text", key: "remarks",          label: "Remarks",                    placeholder: "Any other relevant budget information" },
]

// ── SF-424B ───────────────────────────────────────────────────────────────────

const SF424B: AnyField[] = [
  { type: "section", label: "Assurances — Non-Construction Programs" },
  { type: "text", key: "applicant_name",   label: "Applicant Name" },
  { type: "text", key: "cfda_number",      label: "CFDA Number(s)", placeholder: "If applicable" },
  { type: "text", key: "fed_award_title",  label: "Federal Award / Program Title" },
  { type: "text", key: "fed_award_number", label: "Federal Award Number" },
  { type: "radio", key: "acknowledgement", label: "By submitting this form, the applicant agrees to comply with all applicable assurances listed on the full SF-424B.", options: ["I acknowledge and agree"] },
  { type: "text", key: "auth_signature", label: "Authorized Representative Signature", placeholder: "Type full legal name as signature" },
  { type: "text", key: "auth_title",     label: "Title" },
  { type: "text", key: "auth_date",      label: "Date", placeholder: "MM/DD/YYYY" },
]

// ── SF-424C ───────────────────────────────────────────────────────────────────

const SF424C: AnyField[] = [
  { type: "section", label: "Section A · Budget Summary" },
  { type: "text", key: "grant_program", label: "Grant Program / Activity / Project", placeholder: "Name of the construction program" },
  { type: "row", fields: [
    { type: "text", key: "catalog_cfda",       label: "Catalog No. (CFDA)", placeholder: "XX.XXX" },
    { type: "text", key: "total_project_costs", label: "Total Project Costs ($)" },
    { type: "text", key: "federal_share",       label: "Federal Share ($)" },
    { type: "text", key: "nonfederal_share",    label: "Non-Federal Share ($)" },
  ]},
  { type: "section", label: "Section B · Construction Cost Categories" },
  { type: "row", fields: [
    { type: "text", key: "cost_admin_legal",  label: "a. Administrative & Legal ($)" },
    { type: "text", key: "cost_land",         label: "b. Land, Structures, Rights-of-Way ($)" },
    { type: "text", key: "cost_relocation",   label: "c. Relocation Expenses ($)" },
    { type: "text", key: "cost_arch_eng",     label: "d. Architectural & Engineering ($)" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "cost_other_arch",   label: "e. Other A&E Fees ($)" },
    { type: "text", key: "cost_inspection",   label: "f. Project Inspection Fees ($)" },
    { type: "text", key: "cost_site_work",    label: "g. Site Work ($)" },
    { type: "text", key: "cost_demolition",   label: "h. Demolition & Removal ($)" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "cost_construction", label: "i. Construction ($)" },
    { type: "text", key: "cost_equip_in",     label: "j. Equipment (in contract) ($)" },
    { type: "text", key: "cost_misc",         label: "k. Miscellaneous ($)" },
    { type: "text", key: "cost_subtotal",     label: "Subtotal (a–k) ($)", hint: "Sum of above" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "cost_contingencies", label: "Contingencies ($)" },
    { type: "text", key: "cost_equip_out",     label: "Equipment (not in contract) ($)" },
    { type: "text", key: "cost_total",         label: "Total Project Costs ($)", hint: "Subtotal + contingencies + equipment" },
  ]},
  { type: "section", label: "Section C · Remarks" },
  { type: "text", key: "remarks", label: "Remarks", placeholder: "Any additional budget information" },
  { type: "section", label: "Section D · Certification" },
  { type: "text", key: "auth_signature", label: "Authorized Representative Signature", placeholder: "Type full legal name as signature" },
  { type: "row", fields: [
    { type: "text", key: "auth_name",  label: "Print Name" },
    { type: "text", key: "auth_title", label: "Title" },
    { type: "text", key: "auth_date",  label: "Date", placeholder: "MM/DD/YYYY" },
  ]},
]

// ── SF-424D ───────────────────────────────────────────────────────────────────

const SF424D: AnyField[] = [
  { type: "section", label: "Assurances — Construction Programs" },
  { type: "text", key: "applicant_name",   label: "Applicant Name" },
  { type: "text", key: "cfda_number",      label: "CFDA Number(s)", placeholder: "If applicable" },
  { type: "text", key: "fed_award_title",  label: "Federal Award / Program Title" },
  { type: "text", key: "fed_award_number", label: "Federal Award Number" },
  { type: "radio", key: "acknowledgement", label: "By submitting this form, the applicant agrees to comply with all applicable assurances for construction programs listed on the full SF-424D.", options: ["I acknowledge and agree"] },
  { type: "text", key: "auth_signature", label: "Authorized Representative Signature", placeholder: "Type full legal name as signature" },
  { type: "text", key: "auth_title",     label: "Title" },
  { type: "text", key: "auth_date",      label: "Date", placeholder: "MM/DD/YYYY" },
]

// ── SF-LLL ────────────────────────────────────────────────────────────────────

const SFLLL: AnyField[] = [
  { type: "section", label: "Disclosure of Lobbying Activities" },
  { type: "row", fields: [
    { type: "text", key: "fed_action_type", label: "1. Type of Federal Action", placeholder: "Contract, grant, cooperative agreement, loan…" },
    { type: "text", key: "award_status",    label: "2. Status of Federal Action", placeholder: "Bid/offer/application, initial award, post-award" },
    { type: "text", key: "report_type",     label: "3. Report Type", placeholder: "Initial filing, material change" },
  ]},
  { type: "section", label: "4 · Reporting Entity" },
  { type: "radio", key: "entity_type", label: "Type", options: ["Prime", "Subawardee"] },
  { type: "text", key: "entity_name",    label: "Organization Name" },
  { type: "text", key: "entity_address", label: "Address" },
  { type: "row", fields: [
    { type: "text", key: "entity_city",  label: "City" },
    { type: "text", key: "entity_state", label: "State" },
    { type: "text", key: "entity_zip",   label: "Zip" },
  ]},
  { type: "text", key: "congressional_district", label: "Congressional District" },
  { type: "section", label: "5 · Prime Awardee (if reporting entity is subawardee)" },
  { type: "text", key: "prime_name",    label: "Prime Name" },
  { type: "text", key: "prime_address", label: "Prime Address" },
  { type: "section", label: "6–8 · Federal Award Details" },
  { type: "text", key: "fed_dept", label: "6. Federal Department / Agency" },
  { type: "row", fields: [
    { type: "text", key: "fed_program_name", label: "7a. Federal Program Name / Description" },
    { type: "text", key: "cfda_number",      label: "7b. CFDA Number" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "federal_action_number", label: "8a. Federal Action Number" },
    { type: "text", key: "award_amount",           label: "8b. Award Amount ($)" },
  ]},
  { type: "section", label: "9 · Lobbying Registrant" },
  { type: "text", key: "lobbyist_name",    label: "Name" },
  { type: "text", key: "lobbyist_address", label: "Address" },
  { type: "section", label: "10 · Individuals Performing Lobbying Activities" },
  { type: "text", key: "lobbyist_individuals", label: "Individual(s)", placeholder: "List all individuals, separated by commas" },
  { type: "text", key: "information_date",     label: "Information requested through (date)", placeholder: "MM/DD/YYYY" },
  { type: "text", key: "signature", label: "Signature" },
  { type: "row", fields: [
    { type: "text", key: "sig_name",  label: "Print Name" },
    { type: "text", key: "sig_title", label: "Title" },
    { type: "text", key: "sig_tel",   label: "Telephone" },
    { type: "text", key: "sig_date",  label: "Date" },
  ]},
]

// ── SF-3881 ───────────────────────────────────────────────────────────────────

const SF3881: AnyField[] = [
  { type: "section", label: "Type of Payment" },
  { type: "radio", key: "payment_type", label: "Select payment type", options: ["Vendor Payment", "Miscellaneous Payment", "Salary / Travel Payment"] },
  { type: "section", label: "Agency Information" },
  { type: "text", key: "agency_name", label: "Federal Agency Name" },
  { type: "row", fields: [
    { type: "text", key: "agency_id",       label: "Agency Identifier" },
    { type: "text", key: "agency_loc_code", label: "Agency Location Code (ALC)" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "agency_contact_name",  label: "Contact Name" },
    { type: "text", key: "agency_contact_phone", label: "Contact Phone", placeholder: "(555) 555-5555" },
  ]},
  { type: "section", label: "Payee / Company Information" },
  { type: "text", key: "payee_name",    label: "Payee / Company Name" },
  { type: "text", key: "payee_address", label: "Street Address" },
  { type: "row", fields: [
    { type: "text", key: "payee_city",  label: "City" },
    { type: "text", key: "payee_state", label: "State" },
    { type: "text", key: "payee_zip",   label: "Zip Code" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "payee_ein",   label: "EIN / Tax ID", placeholder: "XX-XXXXXXX" },
    { type: "text", key: "payee_phone", label: "Phone", placeholder: "(555) 555-5555" },
  ]},
  { type: "section", label: "Financial Institution (Bank) Information" },
  { type: "text", key: "bank_name",    label: "Financial Institution Name" },
  { type: "text", key: "bank_address", label: "Bank Street Address" },
  { type: "row", fields: [
    { type: "text", key: "bank_city",  label: "City" },
    { type: "text", key: "bank_state", label: "State" },
    { type: "text", key: "bank_zip",   label: "Zip Code" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "bank_routing",  label: "Routing / Transit Number (9 digits)", placeholder: "XXXXXXXXX" },
    { type: "text", key: "bank_account",  label: "Account Number" },
    { type: "select", key: "account_type", label: "Account Type", options: ["Checking", "Savings"] },
  ]},
  { type: "text", key: "lockbox_number", label: "Lockbox Number (if applicable)", placeholder: "Leave blank if not applicable" },
  { type: "section", label: "Authorization" },
  { type: "text", key: "auth_signature", label: "Authorized Signature", placeholder: "Type full legal name as signature" },
  { type: "row", fields: [
    { type: "text", key: "auth_name",  label: "Print Name" },
    { type: "text", key: "auth_title", label: "Title" },
    { type: "text", key: "auth_date",  label: "Date", placeholder: "MM/DD/YYYY" },
  ]},
]

// ── SF-270 ────────────────────────────────────────────────────────────────────

const SF270: AnyField[] = [
  { type: "section", label: "1 · Request Information" },
  { type: "row", fields: [
    { type: "select", key: "request_basis", label: "Basis of Request", options: ["Advance", "Reimbursement", "Both"] },
    { type: "text",   key: "period_from",   label: "Period Covered — From", placeholder: "MM/DD/YYYY" },
    { type: "text",   key: "period_to",     label: "To", placeholder: "MM/DD/YYYY" },
  ]},
  { type: "section", label: "2 · Federal Award Identification" },
  { type: "row", fields: [
    { type: "text", key: "federal_agency",        label: "Federal Agency" },
    { type: "text", key: "federal_award_number",  label: "Federal Award Number" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "cfda_number",   label: "CFDA Number", placeholder: "XX.XXX" },
    { type: "text", key: "program_title", label: "Federal Program Title" },
  ]},
  { type: "section", label: "3 · Recipient Organization" },
  { type: "text", key: "org_name",    label: "Organization Name" },
  { type: "text", key: "org_address", label: "Address" },
  { type: "row", fields: [
    { type: "text", key: "org_city",  label: "City" },
    { type: "text", key: "org_state", label: "State" },
    { type: "text", key: "org_zip",   label: "Zip" },
    { type: "text", key: "org_ein",   label: "EIN / TIN", placeholder: "XX-XXXXXXX" },
  ]},
  { type: "section", label: "4 · Financial Data ($)" },
  { type: "row", fields: [
    { type: "text", key: "total_outlays",      label: "Total Program Outlays to Date" },
    { type: "text", key: "less_cumulative",    label: "Less: Cumulative Program Income" },
    { type: "text", key: "net_outlays",        label: "Net Program Outlays" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "federal_share",      label: "Federal Share of Net Outlays" },
    { type: "text", key: "nonfederal_share",   label: "Non-Federal Share of Net Outlays" },
    { type: "text", key: "fed_payments_prior", label: "Federal Payments Previously Requested" },
  ]},
  { type: "text", key: "amount_requested", label: "Amount Requested ($)", hint: "Federal share minus prior payments" },
  { type: "section", label: "5 · Certification" },
  { type: "text", key: "remarks",        label: "Remarks", placeholder: "Any additional comments" },
  { type: "text", key: "auth_signature", label: "Authorized Representative Signature", placeholder: "Type full legal name as signature" },
  { type: "row", fields: [
    { type: "text", key: "auth_name",  label: "Print Name" },
    { type: "text", key: "auth_title", label: "Title" },
    { type: "text", key: "auth_tel",   label: "Telephone" },
    { type: "text", key: "auth_date",  label: "Date Signed", placeholder: "MM/DD/YYYY" },
  ]},
]

// ── SF-425 ────────────────────────────────────────────────────────────────────

const SF425: AnyField[] = [
  { type: "section", label: "1 · Federal Award Identification" },
  { type: "row", fields: [
    { type: "text", key: "federal_agency",      label: "Federal Agency" },
    { type: "text", key: "federal_award_number", label: "Federal Award / Grant Number" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "cfda_number",       label: "CFDA Number", placeholder: "XX.XXX" },
    { type: "text", key: "recipient_account", label: "Recipient Account / Loan Number" },
  ]},
  { type: "section", label: "2 · Recipient Organization" },
  { type: "text", key: "org_name",    label: "Organization Name" },
  { type: "text", key: "org_address", label: "Address" },
  { type: "row", fields: [
    { type: "text", key: "org_city",  label: "City" },
    { type: "text", key: "org_state", label: "State" },
    { type: "text", key: "org_zip",   label: "Zip" },
    { type: "text", key: "org_ein",   label: "EIN / TIN", placeholder: "XX-XXXXXXX" },
  ]},
  { type: "section", label: "3 · Report Info" },
  { type: "row", fields: [
    { type: "select", key: "report_type", label: "Report Type", options: ["Annual", "Final", "Quarterly", "Semi-Annual"] },
    { type: "select", key: "basis",       label: "Basis of Accounting", options: ["Cash", "Accrual"] },
    { type: "text",   key: "period_from", label: "Reporting Period — From", placeholder: "MM/DD/YYYY" },
    { type: "text",   key: "period_to",   label: "To", placeholder: "MM/DD/YYYY" },
  ]},
  { type: "section", label: "4 · Financial Data ($)" },
  { type: "row", fields: [
    { type: "text", key: "cash_on_hand_begin", label: "Federal Cash — Beginning Balance" },
    { type: "text", key: "cash_receipts",      label: "Cash Receipts this Period" },
    { type: "text", key: "cash_disbursements", label: "Cash Disbursements this Period" },
    { type: "text", key: "cash_on_hand_end",   label: "Federal Cash — End Balance" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "fed_expenditures",    label: "Federal Expenditures & Obligations" },
    { type: "text", key: "unobligated_balance", label: "Unobligated Balance" },
    { type: "text", key: "nonfed_share",        label: "Non-Federal Share of Expenditures" },
    { type: "text", key: "total_expenditures",  label: "Total Expenditures" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "indirect_base",  label: "Indirect Expense — Base ($)" },
    { type: "text", key: "indirect_rate",  label: "Rate (%)" },
    { type: "text", key: "indirect_total", label: "Amount ($)" },
  ]},
  { type: "text", key: "remarks", label: "Remarks", placeholder: "Explain any variance or unusual items" },
  { type: "section", label: "5 · Certification" },
  { type: "text", key: "auth_signature", label: "Authorized Representative Signature", placeholder: "Type full legal name as signature" },
  { type: "row", fields: [
    { type: "text", key: "auth_name",  label: "Print Name" },
    { type: "text", key: "auth_title", label: "Title" },
    { type: "text", key: "auth_tel",   label: "Telephone" },
    { type: "text", key: "auth_date",  label: "Date Signed", placeholder: "MM/DD/YYYY" },
  ]},
]

// ── SBA Form 912 ──────────────────────────────────────────────────────────────

const SBA912: AnyField[] = [
  { type: "section", label: "Personal Information" },
  { type: "row", fields: [
    { type: "text", key: "full_name",   label: "Full Name (Last, First, Middle)" },
    { type: "text", key: "dob",         label: "Date of Birth", placeholder: "MM/DD/YYYY" },
    { type: "text", key: "place_birth", label: "Place of Birth (City, State/Country)" },
  ]},
  { type: "row", fields: [
    { type: "text",   key: "ssn",         label: "Social Security Number", placeholder: "XXX-XX-XXXX" },
    { type: "select", key: "citizenship", label: "Citizenship Status", options: ["U.S. Citizen", "Permanent Resident", "Other"] },
  ]},
  { type: "section", label: "Residence History (Last 10 Years)" },
  { type: "text", key: "address_current", label: "Current Address (Street, City, State, Zip)" },
  { type: "row", fields: [
    { type: "text", key: "address_from1", label: "From", placeholder: "MM/YYYY" },
    { type: "text", key: "address_to1",   label: "To",   placeholder: "MM/YYYY or Present" },
    { type: "text", key: "address_1",     label: "Previous Address" },
  ]},
  { type: "section", label: "Employment / Business History (Last 10 Years)" },
  { type: "text", key: "employer_current", label: "Current Employer / Business Name & Address" },
  { type: "row", fields: [
    { type: "text", key: "employ_from1",  label: "From", placeholder: "MM/YYYY" },
    { type: "text", key: "employ_to1",    label: "To",   placeholder: "MM/YYYY or Present" },
    { type: "text", key: "employ_title1", label: "Title / Position" },
  ]},
  { type: "section", label: "Criminal History Disclosure" },
  { type: "radio", key: "arrested",  label: "Have you ever been charged with or arrested for any criminal offense (other than minor traffic violations)?", options: ["Yes", "No"] },
  { type: "radio", key: "convicted", label: "Have you ever been convicted, placed on pretrial diversion, or placed on any form of probation?", options: ["Yes", "No"] },
  { type: "text",  key: "criminal_explanation", label: "If Yes to either, provide details", placeholder: "Date, charge, location, disposition" },
  { type: "section", label: "Certification" },
  { type: "text", key: "auth_signature", label: "Signature", placeholder: "Type full legal name as signature" },
  { type: "text", key: "auth_date",      label: "Date", placeholder: "MM/DD/YYYY" },
]

// ── SBA Form 413 ──────────────────────────────────────────────────────────────

const SBA413: AnyField[] = [
  { type: "section", label: "Applicant Information" },
  { type: "row", fields: [
    { type: "text", key: "applicant_name", label: "Name" },
    { type: "text", key: "business_name",  label: "Business Name (if applicable)" },
    { type: "text", key: "statement_date", label: "Statement As of Date", placeholder: "MM/DD/YYYY" },
  ]},
  { type: "text", key: "home_address", label: "Home Address" },
  { type: "row", fields: [
    { type: "text", key: "home_phone",     label: "Home Phone",     placeholder: "(555) 555-5555" },
    { type: "text", key: "business_phone", label: "Business Phone", placeholder: "(555) 555-5555" },
  ]},
  { type: "section", label: "Assets ($)" },
  { type: "row", fields: [
    { type: "text", key: "cash",           label: "Cash on Hand & in Banks" },
    { type: "text", key: "savings",        label: "Savings Accounts" },
    { type: "text", key: "ira_retirement", label: "IRA / Retirement Funds" },
    { type: "text", key: "accounts_recv",  label: "Accounts & Notes Receivable" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "life_insurance", label: "Life Insurance (Cash Value)" },
    { type: "text", key: "stocks_bonds",   label: "Stocks & Bonds" },
    { type: "text", key: "real_estate",    label: "Real Estate (market value)" },
    { type: "text", key: "auto_other",     label: "Auto & Other Personal Property" },
  ]},
  { type: "text", key: "other_assets", label: "Other Assets (describe)", placeholder: "List other assets" },
  { type: "text", key: "total_assets",  label: "Total Assets ($)", hint: "Sum of all assets" },
  { type: "section", label: "Liabilities ($)" },
  { type: "row", fields: [
    { type: "text", key: "accounts_pay",  label: "Accounts Payable" },
    { type: "text", key: "notes_pay",     label: "Notes Payable to Banks & Others" },
    { type: "text", key: "installments",  label: "Installment Accounts (Auto, etc.)" },
    { type: "text", key: "taxes_payable", label: "Taxes Payable" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "mortgage",   label: "Mortgage on Real Estate" },
    { type: "text", key: "other_liab", label: "Other Liabilities (describe)", placeholder: "List other liabilities" },
    { type: "text", key: "total_liab", label: "Total Liabilities ($)" },
    { type: "text", key: "net_worth",  label: "Net Worth ($)", hint: "Total Assets − Total Liabilities" },
  ]},
  { type: "section", label: "Income & Expense Summary (Annual)" },
  { type: "row", fields: [
    { type: "text", key: "salary",       label: "Salary / Wages ($)" },
    { type: "text", key: "other_income", label: "Other Income ($)", placeholder: "Dividends, rental, etc." },
    { type: "text", key: "total_income", label: "Total Annual Income ($)" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "mortgage_pay",    label: "Mortgage / Rent Payments (monthly $)" },
    { type: "text", key: "installment_pay", label: "Installment Payments (monthly $)" },
    { type: "text", key: "other_expense",   label: "Other Payments / Expenses (monthly $)" },
  ]},
  { type: "section", label: "Certification" },
  { type: "text", key: "auth_signature", label: "Signature", placeholder: "Type full legal name as signature" },
  { type: "text", key: "auth_date",      label: "Date", placeholder: "MM/DD/YYYY" },
]

// ── SBA Form 1919 ─────────────────────────────────────────────────────────────

const SBA1919: AnyField[] = [
  { type: "section", label: "Section I · Loan Request" },
  { type: "row", fields: [
    { type: "text",   key: "loan_amount",  label: "Loan Amount Requested ($)", placeholder: "0.00" },
    { type: "select", key: "sba_program",  label: "SBA Program", options: ["7(a) Regular", "SBA Express", "Export Express", "CAPLines", "Community Advantage", "Other"] },
  ]},
  { type: "text", key: "loan_purpose", label: "Loan Purpose", placeholder: "Describe intended use of funds" },
  { type: "section", label: "Section II · Borrower Business Information" },
  { type: "text", key: "business_legal_name", label: "Legal Business Name" },
  { type: "text", key: "business_dba",        label: "Trade Name / DBA", placeholder: "If different from legal name" },
  { type: "text", key: "business_address",    label: "Business Street Address" },
  { type: "row", fields: [
    { type: "text", key: "business_city",  label: "City" },
    { type: "text", key: "business_state", label: "State" },
    { type: "text", key: "business_zip",   label: "Zip" },
    { type: "text", key: "business_phone", label: "Phone", placeholder: "(555) 555-5555" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "business_ein",    label: "EIN / Tax ID", placeholder: "XX-XXXXXXX" },
    { type: "text", key: "business_naics",  label: "NAICS Code" },
    { type: "text", key: "date_established", label: "Date Established", placeholder: "MM/DD/YYYY" },
    { type: "text", key: "fiscal_year_end", label: "Fiscal Year End (Month)" },
  ]},
  { type: "row", fields: [
    { type: "select", key: "business_type", label: "Business Type", options: ["Sole Proprietorship", "Partnership", "Corporation", "S Corporation", "LLC", "Other"] },
    { type: "text",   key: "business_desc", label: "Nature of Business" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "employees_current",   label: "# Employees (Current)" },
    { type: "text", key: "employees_projected", label: "# Employees (Projected, post-loan)" },
  ]},
  { type: "section", label: "Section III · Owner / Principal Information" },
  { type: "row", fields: [
    { type: "text", key: "owner_name",  label: "Owner Full Name" },
    { type: "text", key: "owner_title", label: "Title" },
    { type: "text", key: "owner_pct",   label: "Ownership (%)" },
    { type: "text", key: "owner_ssn",   label: "SSN", placeholder: "XXX-XX-XXXX" },
  ]},
  { type: "text", key: "owner_address", label: "Owner Home Address" },
  { type: "section", label: "Section IV · Affiliates" },
  { type: "text", key: "affiliate_name",         label: "Affiliate Business Name (if any)" },
  { type: "text", key: "affiliate_relationship", label: "Relationship to Applicant" },
  { type: "section", label: "Section V · Existing SBA Debt" },
  { type: "radio", key: "existing_sba_loans", label: "Does the applicant have any existing SBA loans?", options: ["Yes", "No"] },
  { type: "text",  key: "existing_debt_desc",  label: "If Yes, describe existing SBA loans", placeholder: "Loan number, balance, lender" },
  { type: "section", label: "Section VI · Eligibility Questions" },
  { type: "radio", key: "elig_us_business",    label: "Is the business primarily operating in the United States?", options: ["Yes", "No"] },
  { type: "radio", key: "elig_for_profit",     label: "Is the business a for-profit enterprise?", options: ["Yes", "No"] },
  { type: "radio", key: "elig_small_business", label: "Does the business meet SBA size standards?", options: ["Yes", "No"] },
  { type: "radio", key: "elig_debarred",       label: "Is the applicant presently debarred or suspended from federal programs?", options: ["Yes", "No"] },
  { type: "radio", key: "elig_delinquent",     label: "Is the applicant delinquent on any Federal debt or loan?", options: ["Yes", "No"] },
  { type: "text",  key: "elig_explanation",    label: "Explain any disqualifying answers above", placeholder: "Provide explanation as needed" },
  { type: "section", label: "Section VII · Certification" },
  { type: "text", key: "auth_signature", label: "Authorized Signature", placeholder: "Type full legal name as signature" },
  { type: "row", fields: [
    { type: "text", key: "auth_name",  label: "Print Name" },
    { type: "text", key: "auth_title", label: "Title" },
    { type: "text", key: "auth_date",  label: "Date", placeholder: "MM/DD/YYYY" },
  ]},
]

// ── SBA Form 1010C ────────────────────────────────────────────────────────────

const SBA1010C: AnyField[] = [
  { type: "section", label: "Section 1 · Loan Information" },
  { type: "row", fields: [
    { type: "select", key: "application_type", label: "Application Type", options: ["New Loan", "Existing Loan / Modification"] },
    { type: "select", key: "sba_program", label: "SBA Program", options: ["7(a) Regular", "SBA Express", "Export Express", "Community Advantage", "Other"] },
  ]},
  { type: "text", key: "sba_loan_number", label: "SBA Loan Number (if existing)", placeholder: "Leave blank for new applications" },
  { type: "row", fields: [
    { type: "text", key: "gross_loan_amount",     label: "Gross Loan Amount Requested ($)", placeholder: "0.00" },
    { type: "text", key: "sba_guaranteed_amount", label: "SBA Guaranteed Portion ($)",      placeholder: "0.00" },
    { type: "text", key: "loan_maturity",         label: "Loan Maturity (months)",          placeholder: "e.g. 120" },
  ]},
  { type: "text", key: "loan_purpose", label: "Loan Purpose", placeholder: "Describe the intended use of the loan" },
  { type: "row", fields: [
    { type: "select", key: "interest_rate_type", label: "Interest Rate Type", options: ["Fixed", "Variable"] },
    { type: "text",   key: "interest_rate",      label: "Interest Rate (%)", placeholder: "e.g. 7.50" },
  ]},
  { type: "section", label: "Section 2 · Use of Loan Proceeds ($)" },
  { type: "row", fields: [
    { type: "text", key: "proceeds_working_capital", label: "Working Capital",    placeholder: "0.00" },
    { type: "text", key: "proceeds_equipment",       label: "Equipment / Machinery", placeholder: "0.00" },
    { type: "text", key: "proceeds_real_estate",     label: "Real Estate",        placeholder: "0.00" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "proceeds_debt_refinance", label: "Debt Refinancing", placeholder: "0.00" },
    { type: "text", key: "proceeds_other",          label: "Other",            placeholder: "0.00" },
    { type: "text", key: "proceeds_total",          label: "Total",            placeholder: "0.00", hint: "Must equal gross loan amount" },
  ]},
  { type: "text", key: "proceeds_other_description", label: "If Other, describe", placeholder: "Describe other use of proceeds" },
  { type: "section", label: "Section 3 · Borrower Information" },
  { type: "text", key: "business_legal_name", label: "Legal Business Name", placeholder: "Full legal name as registered" },
  { type: "text", key: "business_dba",        label: "Trade Name / DBA",    placeholder: "If different from legal name" },
  { type: "text", key: "business_street",     label: "Business Street Address" },
  { type: "row", fields: [
    { type: "text", key: "business_city",  label: "City" },
    { type: "text", key: "business_state", label: "State" },
    { type: "text", key: "business_zip",   label: "Zip Code" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "business_phone", label: "Business Phone", placeholder: "(555) 555-5555" },
    { type: "text", key: "business_ein",   label: "EIN / Tax ID",   placeholder: "XX-XXXXXXX" },
    { type: "text", key: "business_naics", label: "NAICS Code",     placeholder: "6-digit code" },
  ]},
  { type: "row", fields: [
    { type: "select", key: "business_type",        label: "Business Type",     options: ["Sole Proprietorship", "Partnership", "Corporation", "S Corporation", "LLC", "Other"] },
    { type: "text",   key: "business_established", label: "Date Established",  placeholder: "MM/DD/YYYY" },
    { type: "text",   key: "fiscal_year_end",      label: "Fiscal Year End",   placeholder: "e.g. December 31" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "employees_current",   label: "Current # Employees" },
    { type: "text", key: "employees_projected", label: "Projected # Employees (post-loan)" },
  ]},
  { type: "section", label: "Section 4 · Principal / Owner" },
  { type: "row", fields: [
    { type: "text", key: "principal_name",      label: "Full Name" },
    { type: "text", key: "principal_title",     label: "Title" },
    { type: "text", key: "principal_ownership", label: "Ownership (%)" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "principal_ssn",     label: "Social Security Number", placeholder: "XXX-XX-XXXX" },
    { type: "text", key: "principal_address", label: "Home Address" },
  ]},
  { type: "section", label: "Section 5 · Collateral" },
  { type: "text", key: "collateral_description", label: "Collateral Description", placeholder: "Describe all assets pledged as collateral" },
  { type: "row", fields: [
    { type: "text", key: "collateral_value",     label: "Current Market Value ($)", placeholder: "0.00" },
    { type: "text", key: "collateral_liens",     label: "Existing Liens ($)",       placeholder: "0.00" },
    { type: "text", key: "collateral_net_value", label: "Net Collateral Value ($)", placeholder: "0.00" },
  ]},
  { type: "section", label: "Section 6 · Lender Information" },
  { type: "text", key: "lender_name", label: "Lender / Institution Name" },
  { type: "row", fields: [
    { type: "text", key: "lender_id",    label: "Lender ID (FIRS)", placeholder: "SBA-assigned lender ID" },
    { type: "text", key: "lender_phone", label: "Lender Phone",     placeholder: "(555) 555-5555" },
    { type: "text", key: "lender_email", label: "Lender Email" },
  ]},
  { type: "row", fields: [
    { type: "text", key: "lender_contact_name",  label: "Contact Person Name" },
    { type: "text", key: "lender_contact_title", label: "Contact Title" },
  ]},
  { type: "section", label: "Section 7 · Certification & Signature" },
  { type: "text", key: "cert_signature", label: "Authorized Signature", placeholder: "Type full legal name as signature" },
  { type: "row", fields: [
    { type: "text", key: "cert_name",  label: "Print Name" },
    { type: "text", key: "cert_title", label: "Title" },
    { type: "text", key: "cert_date",  label: "Date", placeholder: "MM/DD/YYYY" },
  ]},
]

// ── Registry ──────────────────────────────────────────────────────────────────

export const FORM_SCHEMAS: Record<string, { title: string; fields: AnyField[] }> = {
  // Standard Forms — universal federal grant application package
  "sf-424":    { title: "SF-424 — Application for Federal Assistance",          fields: SF424   },
  "sf-424a":   { title: "SF-424A — Budget Information (Non-Construction)",       fields: SF424A  },
  "sf-424b":   { title: "SF-424B — Assurances (Non-Construction Programs)",      fields: SF424B  },
  "sf-424c":   { title: "SF-424C — Budget Information (Construction Programs)",  fields: SF424C  },
  "sf-424d":   { title: "SF-424D — Assurances (Construction Programs)",          fields: SF424D  },
  "sf-lll":    { title: "SF-LLL — Disclosure of Lobbying Activities",            fields: SFLLL   },
  "sf-3881":   { title: "SF-3881 — ACH Vendor/Miscellaneous Payment Enrollment", fields: SF3881  },
  "sf-270":    { title: "SF-270 — Request for Advance or Reimbursement",         fields: SF270   },
  "sf-425":    { title: "SF-425 — Federal Financial Report",                     fields: SF425   },
  // SBA forms
  "sba-912":   { title: "SBA Form 912 — Statement of Personal History",          fields: SBA912  },
  "sba-413":   { title: "SBA Form 413 — Personal Financial Statement",           fields: SBA413  },
  "sba-1919":  { title: "SBA Form 1919 — Borrower Information Form",             fields: SBA1919 },
  "sba-1010c": { title: "SBA Form 1010C — Lender's Application for Guaranty",   fields: SBA1010C },
}
