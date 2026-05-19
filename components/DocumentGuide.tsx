"use client"

import { useState } from "react"
import { getDocumentGenerationAction } from "@/lib/document-generation"

// ─── Document categories ────────────────────────────────────────────────────

type DocCategory =
  | "application_form"
  | "photo_id"
  | "ssn"
  | "birth_certificate"
  | "income"
  | "tax"
  | "residency"
  | "energy_bill"
  | "bank"
  | "citizenship"
  | "disability"
  | "medical"
  | "school"
  | "marriage"
  | "lease"
  | "immunization"
  | "pregnancy"
  | "veteran"
  | "employment"
  | "tribal"
  | "transcript"
  | "fafsa"
  | "recommendation"
  | "snap_ebt"
  | "rental_history"
  | "housing_instability"
  | "mortgage_finance"
  | "budget"
  | "proposal"
  | "business_plan"
  | "business_registration"
  | "financial_statement"
  | "organizational_capacity"
  | "letters_of_support"
  | "work_samples"
  | "research_plan"
  | "biosketch"
  | "data_management"
  | "evaluation_plan"
  | "logic_model"
  | "match_funds"
  | "environmental_review"
  | "land_control"
  | "cost_estimates"
  | "certification"
  | "sam_uei"
  | "service_records"
  | "loss_documentation"
  | "community_needs"
  | "generic"

function categorize(doc: string): DocCategory {
  const d = doc.toLowerCase()
  if (!d.includes("fafsa") && (d.includes("application") || d.includes("enrollment form"))) return "application_form"
  if (d.includes("sam.gov") || d.includes("sam registration") || d.includes("uei") || d.includes("unique entity id")) return "sam_uei"
  if (d.includes("social security") && (d.includes("card") || d.includes("number"))) return "ssn"
  if (d.includes("birth certificate") || d.includes("identity and age") || d.includes("proof of age")) return "birth_certificate"
  if (d.includes("photo id") || d.includes("government-issued") || d.includes("driver") || d.includes("passport") || (d.includes("proof of identity") && !d.includes("age"))) return "photo_id"
  if (d.includes("income") || d.includes("pay stub") || d.includes("wages") || d.includes("earnings")) return "income"
  if (d.includes("tax return") || d.includes("w-2") || d.includes("w2") || d.includes("1040")) return "tax"
  if (d.includes("financial statement") || d.includes("audited financial") || d.includes("financial information") || d.includes("financial projections") || d.includes("personal financial statement") || d.includes("net worth statement")) return "financial_statement"
  if (d.includes("budget") || d.includes("cost/price volume")) return "budget"
  if (d.includes("business plan") || d.includes("operational plan") || d.includes("export marketing plan") || d.includes("commercialization plan") || d.includes("manufacturing services plan") || d.includes("replacement plan") || d.includes("strategic plan")) return "business_plan"
  if (d.includes("business registration") || d.includes("company registration") || d.includes("business license") || d.includes("articles of incorporation") || d.includes("principal office")) return "business_registration"
  if (d.includes("certification") || d.includes("certifications") || d.includes("irs determination") || d.includes("tax-exempt status") || d.includes("organic certification") || d.includes("cdfi certification") || d.includes("dbe certification") || d.includes("hubzone")) return "certification"
  if (d.includes("energy bill") || d.includes("utility bill") || d.includes("electric") || d.includes("gas bill") || d.includes("heating")) return "energy_bill"
  if (d.includes("residen") || d.includes("proof of address") || d.includes("proof of residence") || d.includes("current address")) return "residency"
  if (d.includes("bank statement") || d.includes("bank account")) return "bank"
  if (d.includes("citizenship") || d.includes("immigration") || d.includes("green card") || d.includes("naturalization") || d.includes("visa")) return "citizenship"
  if (d.includes("disability") || d.includes("award letter") || d.includes("ssi determination") || d.includes("ssa letter")) return "disability"
  if (d.includes("medical record") || d.includes("doctor") || d.includes("diagnosis")) return "medical"
  if (d.includes("fafsa") || d.includes("student aid report") || d.includes("sar)") || d.includes("financial aid")) return "fafsa"
  if (d.includes("transcript") || d.includes("academic record") || d.includes("sat/act") || d.includes("standardized test")) return "transcript"
  if (d.includes("school") || d.includes("enrollment") || d.includes("student")) return "school"
  if (d.includes("marriage certificate") || d.includes("marriage license")) return "marriage"
  if (d.includes("lease") || d.includes("rental agreement") || d.includes("mortgage")) return "lease"
  if (d.includes("immunization") || d.includes("vaccination") || d.includes("shot record")) return "immunization"
  if (d.includes("pregnancy") || d.includes("prenatal") || d.includes("due date")) return "pregnancy"
  if (d.includes("veteran") || d.includes("dd-214") || d.includes("military discharge") || d.includes("military service") || d.includes("va disability") || d.includes("va form")) return "veteran"
  if (d.includes("tribal enrollment") || d.includes("degree of indian blood") || d.includes("cdib") || d.includes("tribal membership") || d.includes("tribal enrollment card")) return "tribal"
  if (d.includes("letter of recommendation") || d.includes("letters of recommendation") || d.includes("recommendation from") || d.includes("letters from mentor") || d.includes("reference letter") || d.includes("counselor recommendation")) return "recommendation"
  if (d.includes("letter of support") || d.includes("letters of support") || d.includes("partner letter") || d.includes("partnership letter") || d.includes("letter of commitment") || d.includes("collaborator agreement") || d.includes("partner agreement") || d.includes("institutional letter") || d.includes("employer commitment")) return "letters_of_support"
  if (d.includes("project narrative") || d.includes("application narrative") || d.includes("program narrative") || d.includes("narrative application") || d.includes("project description") || d.includes("project summary") || d.includes("personal statement") || d.includes("personal essay") || d.includes("artist statement") || d.includes("career narrative") || d.includes("lay summary") || d.includes("statement of work") || d.includes("white paper") || d.includes("concept paper")) return "proposal"
  if (d.includes("research proposal") || d.includes("research plan") || d.includes("research strategy") || d.includes("specific aims") || d.includes("technical proposal") || d.includes("technical volume") || d.includes("technical narrative") || d.includes("technical report") || d.includes("technical feasibility") || d.includes("quality assurance project plan") || d.includes("human subjects") || d.includes("animal use") || d.includes("irb") || d.includes("iacuc") || d.includes("resource sharing")) return "research_plan"
  if (d.includes("data management") || d.includes("data sharing")) return "data_management"
  if (d.includes("evaluation plan") || d.includes("performance measurement") || d.includes("performance measures") || d.includes("performance metrics")) return "evaluation_plan"
  if (d.includes("logic model")) return "logic_model"
  if (d.includes("organizational capability") || d.includes("organizational capacity") || d.includes("organizational profile") || d.includes("organization description") || d.includes("organizational credentials") || d.includes("governance documentation") || d.includes("annual report") || d.includes("board resolution") || d.includes("facilities and resources") || d.includes("facilities description")) return "organizational_capacity"
  if (d.includes("biographical sketch") || d.includes("biographical sketches") || d.includes("biosketch") || d.includes("curriculum vitae") || d.includes("cv ") || d.includes("resume") || d.includes("scientific biography") || d.includes("artist biography") || d.includes("translator biography") || d.includes("publications list") || d.includes("publication history")) return "biosketch"
  if (d.includes("work sample") || d.includes("writing sample") || d.includes("text sample") || d.includes("translation sample") || d.includes("audio essay") || d.includes("portfolio") || d.includes("sample of editorial work")) return "work_samples"
  if (d.includes("match documentation") || d.includes("matching funds") || d.includes("service fee payment")) return "match_funds"
  if (d.includes("environmental") || d.includes("nepa") || d.includes("flood determination")) return "environmental_review"
  if (d.includes("proof of land control") || d.includes("land ownership") || d.includes("property ownership") || d.includes("proof of ownership") || d.includes("deed") || d.includes("title search") || d.includes("appraisal") || d.includes("site plan")) return "land_control"
  if (d.includes("cost estimate") || d.includes("contractor estimate") || d.includes("equipment quote") || d.includes("contractor invoice") || d.includes("product receipt") || d.includes("receipts for eligible") || d.includes("construction plans") || d.includes("technical specifications")) return "cost_estimates"
  if (d.includes("service completion") || d.includes("americorps") || d.includes("work history")) return "service_records"
  if (d.includes("loss documentation") || d.includes("loss notice") || d.includes("hardship") || d.includes("drought") || d.includes("death certificate") || d.includes("casualty")) return "loss_documentation"
  if (d.includes("needs assessment") || d.includes("community health needs") || d.includes("community benefit") || d.includes("population served") || d.includes("service area") || d.includes("economic impact") || d.includes("labor market") || d.includes("priority community") || d.includes("food system assessment")) return "community_needs"
  if (d.includes("ebt card") || (d.includes("snap") && d.includes("card"))) return "snap_ebt"
  if (d.includes("rental history") || d.includes("landlord reference")) return "rental_history"
  if (d.includes("housing instability") || d.includes("homelessness risk") || d.includes("unstable housing")) return "housing_instability"
  if (d.includes("mortgage pre-approval") || d.includes("proof of cash financing") || d.includes("cash financing") || (d.includes("mortgage") && d.includes("pre-approval"))) return "mortgage_finance"
  if (d.includes("proof of employment") || d.includes("employment verification") || d.includes("full-time employment") || d.includes("employer letter") || (d.includes("employed") && d.includes("profession"))) return "employment"
  return "generic"
}

// ─── Category info ──────────────────────────────────────────────────────────

interface DocInfo {
  what: string
  how: string // renamed from looksLike — "how to get it / what to look for"
}

const CATEGORY_INFO: Record<DocCategory, DocInfo> = {
  application_form: {
    what: "This is the application itself — you'll fill it out when you apply.",
    how: "You don't need to gather this in advance. When you click Apply Now below, you'll be taken directly to the form. Have your other documents ready so you can fill it out in one sitting.",
  },
  photo_id: {
    what: "A current, valid photo ID proving who you are.",
    how: "Use your state driver's license, state ID card, or US passport. It must show your photo and full legal name and must not be expired. If yours is expired, visit your local DMV to renew — most states offer same-day renewals.",
  },
  ssn: {
    what: "Your 9-digit Social Security Number, or the SSN card itself.",
    how: "Your SSN appears on your Social Security card, W-2 tax forms, and tax returns. If you need the physical card, you can request a free replacement online at ssa.gov or at any Social Security office — bring your photo ID.",
  },
  birth_certificate: {
    what: "An official government record proving your date and place of birth.",
    how: "You need a certified copy with a raised seal or color security paper — not a hospital record or photocopy. If you don't have one, order it from your state's vital records office (usually $10–$25). Processing takes 2–8 weeks, or faster in person.",
  },
  income: {
    what: "Documents proving how much money your household earns from all sources.",
    how: "Gather the most recent: pay stubs (last 30 days), employer letter on letterhead, or most recent tax return. For Social Security income, use your SSA award letter. For self-employment, use bank statements or a profit/loss summary. All income sources count — wages, tips, freelance, child support, retirement.",
  },
  tax: {
    what: "Your filed federal income tax return showing last year's income.",
    how: "You need IRS Form 1040 from the most recent tax year, including all schedules (A, B, C, etc.). If you don't have a copy, download a free transcript instantly at irs.gov/individuals/get-transcript — no printer needed, the PDF works.",
  },
  residency: {
    what: "A document proving you currently live at your address.",
    how: "Use a recent utility bill, bank statement, or official government mail — all must show your name and address and be dated within the last 60 days. A current lease or mortgage statement also works. Cell phone bills or credit card statements are usually not accepted.",
  },
  energy_bill: {
    what: "Your most recent bill from an energy provider (electric, gas, heating fuel, or propane).",
    how: "Find your latest bill from your electric company, gas company, or heating fuel supplier. It must show your name, service address, account number, and the amount due. If you pay through a landlord, ask them for a copy of the utility bill or a signed statement of your monthly energy costs.",
  },
  bank: {
    what: "Recent statements showing all money coming in and going out of your accounts.",
    how: "Print or download statements from your bank's website for the last 1–3 months. They must show your name, account number (last 4 digits is fine), and all transactions. Most banks let you download a PDF for free under 'Statements' or 'Documents' in online banking.",
  },
  citizenship: {
    what: "Proof that you are a US citizen or have a qualifying immigration status.",
    how: "US citizens: US passport, US birth certificate, or Certificate of Naturalization (Form N-550). Permanent residents: Permanent Resident Card (green card / Form I-551). Other statuses: Employment Authorization Card (Form I-766), refugee travel document, or visa with I-94 entry record. Must be current.",
  },
  disability: {
    what: "Official documentation confirming a physical or mental disability.",
    how: "The strongest proof is an SSA disability award letter or Supplemental Security Income (SSI) approval — download a free verification letter at ssa.gov. A doctor's letter on official letterhead works too: it must state your name, diagnosis, and how the condition limits daily activities.",
  },
  medical: {
    what: "Health records from a doctor, hospital, or clinic showing your medical history.",
    how: "Request records directly from your healthcare provider — by law, they must give you a copy within 30 days, often sooner. You have the right to them at no charge under HIPAA. Ask specifically for records related to the condition you're documenting.",
  },
  school: {
    what: "Proof that you or your child is currently enrolled in school.",
    how: "Get an enrollment verification letter from the school's registrar or main office — it's usually free and ready the same day. It must show the student's full name, school name, grade level, and current enrollment status. A current student ID card may also be accepted.",
  },
  marriage: {
    what: "Official documentation of your legal marriage.",
    how: "You need a certified copy from the county clerk or registrar where you married — religious or ceremonial certificates are not accepted. Certified copies cost $10–$30 and can usually be ordered online or in person. The document must have an official seal or stamp.",
  },
  lease: {
    what: "Your signed rental or ownership agreement for your current home.",
    how: "Use your current lease agreement signed by both you and your landlord, or your most recent mortgage statement from your lender. It must show your full name, the property address, and the current dates. If your lease is expired but you're still living there, ask your landlord for a new letter confirming your tenancy.",
  },
  immunization: {
    what: "A record of all vaccinations your child (or you) has received.",
    how: "Ask your pediatrician or family doctor for an official immunization record — they can print it on the spot. You can also request one from your state's immunization registry (most states have a free online portal). The record must show dates and vaccine names.",
  },
  pregnancy: {
    what: "A doctor's confirmation of your current pregnancy and expected due date.",
    how: "Ask your OB-GYN, midwife, or any licensed healthcare provider to write a letter on their official letterhead stating your name, your pregnancy status, and your estimated due date. A home pregnancy test is not accepted. If you don't have a doctor yet, a community health clinic can provide this.",
  },
  veteran: {
    what: "Your military discharge document proving your service record.",
    how: "You need Form DD-214 (Certificate of Release or Discharge from Active Duty) — specifically Member Copy 4, which contains the most complete information. If you've lost yours, request a free replacement at archives.gov/veterans/military-service-records — it takes 1–10 days online.",
  },
  employment: {
    what: "An official document proving you are employed in a qualifying profession.",
    how: "Ask your HR department or supervisor for an employment verification letter on official letterhead. It must include your name, employer name, job title, full-time status, and start date. Most HR departments can produce this same-day at no cost.",
  },
  tribal: {
    what: "Official documentation of your enrollment in a federally recognized Indian tribe.",
    how: "Your tribal enrollment card or Certificate of Degree of Indian Blood (CDIB) is issued by your tribe's enrollment office. If you need a replacement or don't have one, contact your tribe's enrollment department directly — this is a free service for tribal members.",
  },
  transcript: {
    what: "An official academic record showing your courses, grades, and degree(s) earned.",
    how: "Request official transcripts from your school's registrar office — 'official' means sealed or sent directly from the institution. Processing takes 1–5 business days and may cost $5–$15 per transcript. Most schools also offer electronic transcripts (eSCRIP or similar) that are delivered the same day.",
  },
  fafsa: {
    what: "The Free Application for Federal Student Aid — the government's financial need form.",
    how: "Complete the FAFSA online at studentaid.gov — it's free. You'll need your (and your parents', if dependent) Social Security number, tax return from 2 years prior, and bank account information. The Student Aid Report (SAR) is generated after submission and summarizes your eligibility. You can download your SAR from studentaid.gov.",
  },
  recommendation: {
    what: "Letters written by professors, supervisors, or mentors supporting your application.",
    how: "Ask recommenders at least 4–6 weeks before your deadline. Provide each person with your resume, the program description, and key talking points. Most programs accept letters sent directly from the recommender's institutional email via the program's online portal — they do not need to be physical letters.",
  },
  snap_ebt: {
    what: "Your EBT (Electronic Benefit Transfer) card that holds your SNAP food assistance balance.",
    how: "Your EBT card was mailed to you when you were approved for SNAP benefits. It works like a debit card at participating grocery stores and markets. If your card is lost or stolen, call the number on the back of the card or contact your state's EBT customer service — replacement is free and takes 3–5 days.",
  },
  rental_history: {
    what: "A record of your past rental experience and references from previous landlords.",
    how: "Collect contact information for landlords from your last 2–3 residences. Ask each landlord if they're willing to provide a reference. Some housing authorities have a specific form; others accept a simple letter confirming dates of tenancy and your standing as a tenant (on-time payments, no lease violations). If you have no rental history, a personal reference from an employer or social worker may be accepted.",
  },
  housing_instability: {
    what: "Documentation proving you are currently homeless, at risk of homelessness, or in unstable housing.",
    how: "Acceptable forms vary by program but typically include: a letter from a shelter or transitional housing provider, a letter from a social worker or case manager, an eviction notice, a utility shutoff notice, or a signed statement from a family/friend confirming you are doubling up with them. The program's intake worker can help you determine what will be accepted.",
  },
  mortgage_finance: {
    what: "A lender's letter confirming you qualify for a home loan, or bank records showing you have funds to purchase outright.",
    how: "For a mortgage pre-approval: contact a HUD-approved lender — they'll review your credit, income, and assets and issue a pre-approval letter (usually within 1–3 days, free of charge). For cash purchases: printouts of your bank or investment account statements showing liquid funds equal to the purchase price, dated within the last 60 days.",
  },
  budget: {
    what: "A line-item plan showing how much the project will cost and how the grant money will be used.",
    how: "Start from the grant's budget template if one is provided. Break costs into common categories such as personnel, fringe benefits, travel, equipment, supplies, contracts, and indirect costs. For the justification, write 1-2 sentences explaining each major cost and how you calculated it. Match the total exactly to the amount requested in the application.",
  },
  proposal: {
    what: "The written case for your project, need, goals, activities, timeline, and expected results.",
    how: "Use the grant instructions as your outline and answer each review criterion directly. Include the problem, who will be served, what you will do, when it will happen, who will manage it, and how success will be measured. Keep headings aligned with the funder's prompts and check page limits before uploading.",
  },
  business_plan: {
    what: "A document explaining how your business operates, makes money, serves customers, and will use the grant.",
    how: "Include your product or service, target market, competitors, revenue model, operations plan, team, milestones, and financial projections. For USDA, SBA, or economic-development grants, add jobs created/retained, rural or community impact, and how the grant fills a financing gap.",
  },
  business_registration: {
    what: "Proof that your business or organization legally exists and is allowed to operate.",
    how: "Download your formation document from your state's Secretary of State business search, such as Articles of Incorporation, Certificate of Formation, LLC filing, DBA, or business license. Also gather your IRS EIN confirmation letter (CP 575) if the funder asks for tax identification.",
  },
  financial_statement: {
    what: "Financial records showing the applicant's revenue, expenses, assets, debts, and overall financial condition.",
    how: "For organizations, prepare recent profit and loss statements, balance sheets, cash-flow statements, audits, or Form 990s. For individuals, use bank statements, tax returns, personal financial statements, and debt/asset summaries. Export PDFs from your accounting software or ask your accountant/bookkeeper for funder-ready copies.",
  },
  organizational_capacity: {
    what: "Evidence that your organization has the people, systems, experience, and authority to manage the grant.",
    how: "Gather a short organization history, staff roles, board list or resolution, prior grant experience, facilities description, annual report, and policies relevant to the project. If a board vote is required, put the grant name, authorized signer, and match commitment in the resolution.",
  },
  letters_of_support: {
    what: "Letters from partners, institutions, agencies, customers, or community groups confirming support or participation.",
    how: "Ask each partner for a signed letter on official letterhead. It should name the grant, describe the partner's role, list any cash/in-kind commitment, and include a contact person. Give partners a draft and request signatures at least 2 weeks before the deadline.",
  },
  work_samples: {
    what: "Examples of your creative, academic, technical, or professional work used to judge quality and fit.",
    how: "Follow the funder's format exactly: image count, audio/video length, page limits, file type, and naming rules. Choose recent work that matches the proposed project. Add a short description for each sample with title, date, medium, your role, and publication/exhibition/performance details if relevant.",
  },
  research_plan: {
    what: "The technical research section describing aims, methods, significance, risks, team, and expected outcomes.",
    how: "Use the funder's required headings, such as Specific Aims, Research Strategy, Human Subjects, Vertebrate Animals, Facilities, and References. Get institutional review office input early for IRB/IACUC or human-subjects sections. Confirm page limits and biosketch formats before submission.",
  },
  biosketch: {
    what: "A structured resume or biography showing the qualifications of key personnel.",
    how: "Use the funder's required format when specified. NIH and NSF biosketches have strict templates; download the current template from the agency site. Include positions, education, selected publications/products, relevant appointments, and project role. For arts grants, use an artist bio or resume focused on recent work.",
  },
  data_management: {
    what: "A plan for how project data will be collected, stored, protected, shared, and preserved.",
    how: "Describe data types, storage location, privacy/security controls, access rules, file formats, metadata, sharing timeline, and long-term preservation. Universities often have a research office or library data-services team that can review this before submission.",
  },
  evaluation_plan: {
    what: "A plan for measuring whether the project worked and reporting results to the funder.",
    how: "List the outcomes you will track, data sources, collection schedule, responsible staff, and reporting method. Use measurable indicators such as people served, jobs created, acres treated, students trained, energy saved, or prototypes completed. Tie each measure back to the project goals.",
  },
  logic_model: {
    what: "A one-page map connecting resources, activities, outputs, outcomes, and long-term impact.",
    how: "Build columns for Inputs, Activities, Outputs, Short-Term Outcomes, Long-Term Outcomes, and Assumptions. Use the same goals and metrics from your narrative and evaluation plan. Many agencies provide a logic-model template; use theirs when available.",
  },
  match_funds: {
    what: "Proof that you have required non-grant funding or in-kind support for the project.",
    how: "Collect bank statements, award letters, board-approved budget lines, signed partner commitments, or valuation worksheets for donated labor/equipment. The document should show the amount, source, whether it is cash or in-kind, and that the funds are committed during the grant period.",
  },
  environmental_review: {
    what: "Documentation showing the project has considered environmental impacts and required federal/state reviews.",
    how: "For construction, land, or infrastructure projects, contact the funding agency before starting work. You may need NEPA forms, floodplain/wetland checks, historic preservation review, environmental assessment, or categorical exclusion documentation. Keep maps, site photos, permits, and agency correspondence.",
  },
  land_control: {
    what: "Proof that you own, lease, or otherwise have legal control of the project site or property.",
    how: "Use a deed, title report, signed lease, easement, option agreement, grazing lease, purchase agreement, or owner authorization letter. The document must show the property address/legal description, parties, signatures, and term long enough to cover the grant project.",
  },
  cost_estimates: {
    what: "Third-party evidence supporting the prices in your budget, such as bids, quotes, invoices, or receipts.",
    how: "Request written quotes from vendors or contractors that include scope, quantities, unit costs, dates, and company contact information. For construction, get itemized estimates and any required plans/specs. Keep receipts or invoices for reimbursement programs.",
  },
  certification: {
    what: "An official certificate or determination proving a required status, such as nonprofit, DBE, HUBZone, organic, CDFI, or other eligibility status.",
    how: "Use the certificate issued by the responsible agency or certifier. For IRS tax-exempt status, download your determination letter or verification from irs.gov. For SBA/DBE/HUBZone/CDFI/organic certifications, log in to the certifier portal or contact the certifying office for a current letter.",
  },
  sam_uei: {
    what: "Your federal entity registration and Unique Entity ID used for federal grants.",
    how: "Register or renew at sam.gov. The process is free. You will need your legal business name, physical address, taxpayer/EIN information, banking details, and entity administrator. New registrations can take several days, so do this before the grant deadline.",
  },
  service_records: {
    what: "Documentation showing qualifying service, work history, AmeriCorps completion, or other required participation.",
    how: "Download service records from the relevant portal, such as My AmeriCorps for AmeriCorps awards, an HR system for employment history, or the agency that managed the service program. The document should show your name, role, dates, completion status, and hours or term served.",
  },
  loss_documentation: {
    what: "Evidence of a disaster, hardship, death, casualty, crop loss, or other qualifying loss event.",
    how: "Gather notices, insurance claims, death certificates, disaster declarations, FSA loss notices, lender letters, photos, receipts, repair estimates, or official agency certifications. Include dates and amounts, because many relief grants only cover losses within a specific event window.",
  },
  community_needs: {
    what: "Evidence that the community, population, or service area needs the proposed project.",
    how: "Use recent census data, local plans, surveys, public health assessments, labor market data, school/community records, letters from service providers, or program waitlists. Tie each data point to the people served and the problem your project addresses.",
  },
  generic: {
    what: "A program-specific document named by the funder.",
    how: "Open the official application instructions and search for this exact document name. The funder usually defines the required format, page limit, signatures, and upload field. If it is unclear, contact the grant officer listed in the notice and ask what evidence they accept for this item.",
  },
}

// ─── Visual document mockups ────────────────────────────────────────────────

function GrantDocMockup({ title, rows, note }: { title: string; rows: [string, string][]; note: string }) {
  return (
    <div className="rounded-lg border border-zinc-300 bg-white p-4 font-mono text-xs text-zinc-700 space-y-1">
      <div className="font-bold text-zinc-900 border-b border-zinc-200 pb-1 mb-2">{title}</div>
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-3">
          <span className="text-zinc-500">{label}:</span>
          <span className="text-right font-medium text-zinc-800">{value}</span>
        </div>
      ))}
      <div className="border-t border-zinc-200 pt-2 mt-2 text-[10px] text-zinc-400">{note}</div>
    </div>
  )
}

function DocVisual({ category }: { category: DocCategory }) {
  switch (category) {
    case "application_form":
      return (
        <div className="rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-4 font-mono text-xs text-zinc-500 space-y-1.5">
          <div className="text-zinc-700 font-semibold text-xs uppercase tracking-wide mb-2">Application Form</div>
          <div className="flex items-center gap-2"><span className="w-20 shrink-0">Name:</span><span className="flex-1 border-b border-zinc-300" /></div>
          <div className="flex items-center gap-2"><span className="w-20 shrink-0">Address:</span><span className="flex-1 border-b border-zinc-300" /></div>
          <div className="flex items-center gap-2"><span className="w-20 shrink-0">Income:</span><span className="flex-1 border-b border-zinc-300" /></div>
          <div className="flex items-center gap-2"><span className="w-20 shrink-0">Signature:</span><span className="flex-1 border-b border-zinc-300" /></div>
          <div className="text-blue-500 text-xs mt-1">→ You&apos;ll fill this out when you apply</div>
        </div>
      )

    case "photo_id":
      return (
        <div className="rounded-lg bg-gradient-to-br from-blue-800 to-blue-900 p-4 text-white font-mono text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-yellow-300 text-xs tracking-wider">DRIVER LICENSE</span>
            <span className="text-blue-300 text-[10px]">STATE OF —</span>
          </div>
          <div className="flex gap-3 mt-2">
            <div className="w-10 h-12 bg-blue-700 rounded border border-blue-500 flex items-center justify-center text-blue-400 text-[10px]">Photo</div>
            <div className="space-y-0.5">
              <div className="font-semibold">YOUR FULL NAME</div>
              <div className="text-blue-300">123 Main St, City ST</div>
              <div className="text-blue-300">DOB: 01/01/1990</div>
              <div className="text-yellow-300 text-[10px]">EXP: 01/01/2027</div>
            </div>
          </div>
        </div>
      )

    case "ssn":
      return (
        <div className="rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 p-4 text-white font-mono text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 text-[10px] uppercase tracking-widest">Social Security</span>
            <span className="text-slate-400 text-[10px]">Administration</span>
          </div>
          <div className="text-2xl font-bold tracking-widest text-center py-2">XXX-XX-XXXX</div>
          <div className="border-t border-slate-600 pt-2 font-semibold tracking-wide text-center text-sm">YOUR FULL LEGAL NAME</div>
        </div>
      )

    case "birth_certificate":
      return (
        <div className="rounded-lg border-4 border-double border-amber-700 bg-amber-50 p-4 text-xs text-amber-900 space-y-1 font-serif">
          <div className="text-center font-bold text-sm uppercase tracking-wide border-b border-amber-300 pb-2 mb-2">Certificate of Birth</div>
          <div className="flex justify-center mb-2">
            <div className="w-8 h-8 rounded-full border-2 border-amber-600 flex items-center justify-center text-amber-600 text-[10px] font-bold">SEAL</div>
          </div>
          <div><span className="font-semibold">Name:</span> Child&apos;s Full Name</div>
          <div><span className="font-semibold">Date of Birth:</span> Month DD, YYYY</div>
          <div><span className="font-semibold">Place of Birth:</span> City, State</div>
          <div className="text-amber-700 text-[10px] mt-1 italic">Certified Copy — Official State Seal Required</div>
        </div>
      )

    case "income":
      return (
        <div className="rounded-lg border border-zinc-300 bg-white p-4 font-mono text-xs space-y-1 text-zinc-700">
          <div className="font-bold text-zinc-900 border-b border-zinc-200 pb-1 mb-2">PAY STATEMENT</div>
          <div className="flex justify-between"><span>Employer:</span><span>ACME Corp</span></div>
          <div className="flex justify-between"><span>Period:</span><span>03/01–03/15/26</span></div>
          <div className="border-t border-zinc-200 my-1" />
          <div className="flex justify-between"><span>Gross Pay:</span><span>$2,500.00</span></div>
          <div className="flex justify-between text-red-500"><span>Federal Tax:</span><span>-$312.50</span></div>
          <div className="flex justify-between text-red-500"><span>FICA/Medicare:</span><span>-$191.25</span></div>
          <div className="flex justify-between font-bold text-green-700 border-t border-zinc-200 pt-1 mt-1"><span>Net Pay:</span><span>$1,996.25</span></div>
        </div>
      )

    case "tax":
      return (
        <div className="rounded-lg border border-zinc-300 bg-white p-4 font-mono text-xs text-zinc-700 space-y-1">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-1 mb-2">
            <span className="font-bold text-zinc-900">Form 1040</span>
            <span className="text-zinc-400 text-[10px]">Dept. of the Treasury — IRS</span>
          </div>
          <div className="text-zinc-500 text-[10px] mb-1">U.S. Individual Income Tax Return</div>
          <div className="flex justify-between"><span>Filing Status:</span><span>Single</span></div>
          <div className="flex justify-between"><span>Total Income:</span><span>$42,500</span></div>
          <div className="flex justify-between"><span>Adjusted Gross Income:</span><span>$40,200</span></div>
          <div className="flex justify-between font-bold border-t border-zinc-200 pt-1 mt-1"><span>Tax Due:</span><span>$4,522</span></div>
        </div>
      )

    case "residency":
    case "energy_bill":
      return (
        <div className="rounded-lg border border-zinc-300 bg-white p-4 font-mono text-xs text-zinc-700 space-y-1">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-1 mb-2">
            <span className="font-bold text-blue-700">{category === "energy_bill" ? "ELECTRIC BILL" : "UTILITY BILL"}</span>
            <span className="text-zinc-400 text-[10px]">Statement</span>
          </div>
          <div className="flex justify-between"><span>Account:</span><span>●●●●XXXXXX</span></div>
          <div className="flex justify-between"><span>Service Address:</span><span>123 Main St</span></div>
          <div className="flex justify-between"><span>City, State:</span><span>Anytown, ST</span></div>
          <div className="border-t border-zinc-200 my-1" />
          <div className="flex justify-between"><span>Statement Date:</span><span>04/01/2026</span></div>
          <div className="flex justify-between font-bold text-zinc-900"><span>Amount Due:</span><span>$124.38</span></div>
          <div className="flex justify-between text-zinc-400"><span>Due Date:</span><span>04/20/2026</span></div>
        </div>
      )

    case "bank":
      return (
        <div className="rounded-lg border border-zinc-300 bg-white p-4 font-mono text-xs text-zinc-700 space-y-1">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-1 mb-2">
            <span className="font-bold text-zinc-900">BANK STATEMENT</span>
            <span className="text-zinc-400 text-[10px]">Mar 1 – Mar 31</span>
          </div>
          <div className="flex justify-between"><span>Account:</span><span>●●●●●●1234</span></div>
          <div className="border-t border-zinc-200 my-1" />
          <div className="flex justify-between"><span>Opening Balance:</span><span>$1,250.00</span></div>
          <div className="flex justify-between text-green-700"><span>+ Deposits:</span><span>$3,200.00</span></div>
          <div className="flex justify-between text-red-500"><span>– Withdrawals:</span><span>-$2,847.22</span></div>
          <div className="flex justify-between font-bold border-t border-zinc-200 pt-1 mt-1"><span>Closing Balance:</span><span>$1,602.78</span></div>
        </div>
      )

    case "citizenship":
      return (
        <div className="rounded-lg bg-gradient-to-br from-red-700 to-blue-900 p-4 text-white font-mono text-xs space-y-2">
          <div className="flex items-center gap-2 border-b border-white/20 pb-2">
            <div className="text-[18px]">🇺🇸</div>
            <div>
              <div className="font-bold text-yellow-300 text-[11px]">UNITED STATES OF AMERICA</div>
              <div className="text-white/60 text-[10px]">Passport / Certificate of Naturalization</div>
            </div>
          </div>
          <div><span className="text-white/60">Surname: </span>DOE</div>
          <div><span className="text-white/60">Given Names: </span>JOHN</div>
          <div><span className="text-white/60">Nationality: </span>UNITED STATES</div>
          <div className="text-yellow-300 text-[10px] mt-1">Must not be expired</div>
        </div>
      )

    case "disability":
      return (
        <div className="rounded-lg border border-zinc-300 bg-white p-4 text-xs text-zinc-700 space-y-2">
          <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">SSA</div>
            <span className="font-bold text-zinc-900">Benefit Verification Letter</span>
          </div>
          <p className="text-[11px] text-zinc-600 leading-4">
            This letter is to certify that <span className="font-semibold">JOHN DOE</span> receives
            Supplemental Security Income (SSI) benefits in the amount of <span className="font-semibold">$943/month</span>.
          </p>
          <div className="text-zinc-400 text-[10px]">Social Security Administration • ssa.gov</div>
        </div>
      )

    case "school":
      return (
        <div className="rounded-lg border border-zinc-300 bg-white p-4 text-xs text-zinc-700 space-y-2">
          <div className="font-bold text-zinc-900 border-b border-zinc-200 pb-1">ENROLLMENT VERIFICATION</div>
          <p className="text-[11px] leading-4">
            This is to certify that <span className="font-semibold">STUDENT NAME</span> is currently enrolled
            as a <span className="font-semibold">full-time student</span> at <span className="font-semibold">University Name</span> for the
            Fall 2025 semester.
          </p>
          <div className="text-zinc-400 text-[10px]">Issued by: Office of the Registrar</div>
          <div className="border-t border-zinc-200 pt-1 text-zinc-500">_______________________<br />Registrar Signature</div>
        </div>
      )

    case "immunization":
      return (
        <div className="rounded-lg border border-zinc-300 bg-white p-4 font-mono text-xs text-zinc-700 space-y-1">
          <div className="font-bold text-zinc-900 border-b border-zinc-200 pb-1 mb-1">IMMUNIZATION RECORD</div>
          <div className="font-semibold text-[11px] mb-1">CHILD&apos;S NAME | DOB: 01/01/2022</div>
          {[["DTaP", "02/15/22"], ["Hib", "04/10/22"], ["IPV", "06/05/22"], ["MMR", "01/20/23"]].map(([v, d]) => (
            <div key={v} className="flex justify-between text-[11px]">
              <span className="text-zinc-600">{v}</span><span className="text-green-700">✓ {d}</span>
            </div>
          ))}
        </div>
      )

    case "pregnancy":
      return (
        <div className="rounded-lg border border-zinc-300 bg-white p-4 text-xs text-zinc-700 space-y-2">
          <div className="font-bold text-zinc-900 border-b border-zinc-200 pb-1">PHYSICIAN LETTER</div>
          <p className="text-[11px] leading-4">
            To Whom It May Concern,<br /><br />
            This letter certifies that <span className="font-semibold">PATIENT NAME</span> is currently
            pregnant with an estimated due date of <span className="font-semibold">Month DD, YYYY</span>.
          </p>
          <div className="border-t border-zinc-200 pt-2 text-[10px] text-zinc-500">
            Dr. Jane Smith, MD<br />
            License #: XXXXXXXXX<br />
            Date: MM/DD/YYYY
          </div>
        </div>
      )

    case "veteran":
      return (
        <div className="rounded-lg bg-gradient-to-br from-olive-700 to-zinc-800 bg-zinc-800 p-4 text-white font-mono text-xs space-y-1">
          <div className="flex items-center gap-2 border-b border-white/20 pb-2 mb-1">
            <div className="text-[16px]">⭐</div>
            <span className="font-bold text-yellow-300 tracking-wide">DD FORM 214</span>
          </div>
          <div className="text-white/70 text-[10px] mb-2">Certificate of Release from Active Duty</div>
          <div><span className="text-white/50">Name: </span>DOE, JOHN A.</div>
          <div><span className="text-white/50">Branch: </span>U.S. ARMY</div>
          <div><span className="text-white/50">Service Dates: </span>01/2018 – 01/2022</div>
          <div><span className="text-white/50">Character: </span>HONORABLE</div>
        </div>
      )

    case "employment":
      return (
        <div className="rounded-lg border border-zinc-300 bg-white p-4 text-xs text-zinc-700 space-y-2">
          <div className="font-bold text-zinc-900 border-b border-zinc-200 pb-1">EMPLOYMENT VERIFICATION</div>
          <p className="text-[11px] leading-4 text-zinc-600">To Whom It May Concern,</p>
          <p className="text-[11px] leading-4">This is to confirm that <span className="font-semibold">EMPLOYEE NAME</span> has been employed full-time as a <span className="font-semibold">JOB TITLE</span> with our organization since <span className="font-semibold">START DATE</span>.</p>
          <div className="border-t border-zinc-200 pt-2 text-[10px] text-zinc-500">
            Employer: ORGANIZATION NAME<br />
            HR Contact: _________________<br />
            Signature: _________________
          </div>
        </div>
      )

    case "tribal":
      return (
        <div className="rounded-lg bg-gradient-to-br from-amber-800 to-amber-900 p-4 text-white font-mono text-xs space-y-2">
          <div className="flex items-center gap-2 border-b border-white/20 pb-2">
            <div className="text-[16px]">⭐</div>
            <div>
              <div className="font-bold text-yellow-300 text-[11px]">TRIBAL ENROLLMENT CARD</div>
              <div className="text-white/60 text-[10px]">Federally Recognized Tribe</div>
            </div>
          </div>
          <div><span className="text-white/50">Name: </span>MEMBER NAME</div>
          <div><span className="text-white/50">Tribal #: </span>XXXX-XXXX</div>
          <div><span className="text-white/50">Blood Quantum: </span>X/X</div>
          <div className="text-yellow-300 text-[10px] mt-1">Issued by: Tribal Enrollment Office</div>
        </div>
      )

    case "transcript":
      return (
        <div className="rounded-lg border border-zinc-300 bg-white p-4 font-mono text-xs text-zinc-700 space-y-1">
          <div className="font-bold text-zinc-900 border-b border-zinc-200 pb-1 mb-1">OFFICIAL TRANSCRIPT</div>
          <div className="text-[11px] text-zinc-500">University Name · Student ID: XXXXXXX</div>
          {[["MATH 101", "A", "3.0"], ["ENG 201", "B+", "3.3"], ["BIO 150", "A-", "3.7"]].map(([c,g,q]) => (
            <div key={c} className="flex justify-between text-[11px]">
              <span>{c}</span><span>{g}</span><span className="text-zinc-400">{q}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-zinc-200 pt-1 mt-1 font-semibold text-[11px]">
            <span>Cumulative GPA:</span><span>3.45</span>
          </div>
          <div className="text-zinc-400 text-[10px] mt-1 italic">Official — Registrar Seal Required</div>
        </div>
      )

    case "fafsa":
      return (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-xs text-blue-900 space-y-2">
          <div className="flex items-center gap-2 border-b border-blue-200 pb-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-[10px] shrink-0">ED</div>
            <span className="font-bold">FAFSA — Student Aid Report</span>
          </div>
          <div className="flex justify-between"><span>EFC:</span><span className="font-semibold">$0</span></div>
          <div className="flex justify-between"><span>Dependency Status:</span><span>Independent</span></div>
          <div className="flex justify-between"><span>Pell Grant Eligible:</span><span className="text-green-700 font-semibold">Yes</span></div>
          <div className="text-blue-600 text-[10px] mt-1">Available at studentaid.gov after submitting FAFSA</div>
        </div>
      )

    case "recommendation":
      return (
        <div className="rounded-lg border border-zinc-300 bg-white p-4 text-xs text-zinc-700 space-y-2">
          <div className="font-bold text-zinc-900 border-b border-zinc-200 pb-1">LETTER OF RECOMMENDATION</div>
          <p className="text-[11px] leading-4">Dear Selection Committee,<br /><br />I write to enthusiastically recommend <span className="font-semibold">APPLICANT NAME</span> for this program. In my X years working with them, I have found them to be exceptionally...</p>
          <div className="border-t border-zinc-200 pt-2 text-[10px] text-zinc-500">
            Dr. Jane Smith, Professor<br />
            Department of [Field]<br />
            University Name
          </div>
        </div>
      )

    case "snap_ebt":
      return (
        <div className="rounded-lg bg-gradient-to-br from-green-700 to-green-800 p-4 text-white font-mono text-xs space-y-1">
          <div className="text-[10px] text-green-300 uppercase tracking-widest mb-1">EBT Card</div>
          <div className="text-lg font-bold tracking-widest">●●●● ●●●● ●●●● 1234</div>
          <div className="flex justify-between mt-1">
            <div><div className="text-green-300 text-[10px]">Name</div><div className="text-sm">CARDHOLDER NAME</div></div>
            <div><div className="text-green-300 text-[10px]">Expires</div><div className="text-sm">12/27</div></div>
          </div>
          <div className="text-green-300 text-[10px] mt-1">SNAP / Food Benefits</div>
        </div>
      )

    case "rental_history":
      return (
        <div className="rounded-lg border border-zinc-300 bg-white p-4 text-xs text-zinc-700 space-y-2">
          <div className="font-bold text-zinc-900 border-b border-zinc-200 pb-1">LANDLORD REFERENCE</div>
          <p className="text-[11px] leading-4">To Whom It May Concern,<br /><br /><span className="font-semibold">TENANT NAME</span> rented the property at <span className="font-semibold">123 Main St</span> from <span className="font-semibold">01/2023</span> to <span className="font-semibold">01/2025</span>. Rent was paid on time and the unit was left in good condition.</p>
          <div className="border-t border-zinc-200 pt-2 text-[10px] text-zinc-500">
            Landlord Signature: _____________<br />
            Phone: (XXX) XXX-XXXX
          </div>
        </div>
      )

    case "housing_instability":
      return (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-xs text-orange-900 space-y-2">
          <div className="font-bold border-b border-orange-200 pb-1">HOUSING STATUS DOCUMENTATION</div>
          <p className="text-[11px] leading-4">Examples of accepted documents:</p>
          <ul className="text-[11px] space-y-0.5 list-none">
            {["Shelter or transitional housing letter", "Eviction notice or court summons", "Utility shutoff notice", "Social worker / case manager letter", "Written statement from host (doubling up)"].map(item => (
              <li key={item} className="flex items-start gap-1"><span className="text-orange-500 mt-0.5">•</span>{item}</li>
            ))}
          </ul>
        </div>
      )

    case "mortgage_finance":
      return (
        <div className="rounded-lg border border-zinc-300 bg-white p-4 text-xs text-zinc-700 space-y-1">
          <div className="font-bold text-zinc-900 border-b border-zinc-200 pb-1">MORTGAGE PRE-APPROVAL</div>
          <div className="flex justify-between"><span>Borrower:</span><span>YOUR NAME</span></div>
          <div className="flex justify-between"><span>Approved Amount:</span><span className="font-semibold text-green-700">$XXX,XXX</span></div>
          <div className="flex justify-between"><span>Interest Rate:</span><span>X.XX%</span></div>
          <div className="flex justify-between"><span>Loan Type:</span><span>30-yr Fixed</span></div>
          <div className="flex justify-between"><span>Expiration:</span><span>90 days</span></div>
          <div className="text-zinc-400 text-[10px] mt-1">Issued by: [HUD-Approved Lender]</div>
        </div>
      )

    case "budget":
      return <GrantDocMockup title="PROJECT BUDGET" rows={[["Personnel", "$45,000"], ["Travel", "$3,200"], ["Supplies", "$8,750"], ["Total Request", "$56,950"]]} note="Line items must match the budget narrative." />
    case "proposal":
      return <GrantDocMockup title="PROJECT NARRATIVE" rows={[["Need", "Community problem"], ["Activities", "Work plan"], ["Timeline", "Milestones"], ["Outcomes", "Measurable results"]]} note="Follow the funder's required headings." />
    case "business_plan":
      return <GrantDocMockup title="BUSINESS PLAN" rows={[["Market", "Target customers"], ["Operations", "How work happens"], ["Revenue", "Sales model"], ["Use of Funds", "Grant-funded costs"]]} note="Include projections and community impact." />
    case "business_registration":
      return <GrantDocMockup title="STATE BUSINESS FILING" rows={[["Entity", "LLC / Corporation"], ["State ID", "XXXXXXXX"], ["Status", "Active"], ["Registered Agent", "Name / Address"]]} note="Download from your Secretary of State." />
    case "financial_statement":
      return <GrantDocMockup title="FINANCIAL STATEMENT" rows={[["Revenue", "$XXX,XXX"], ["Expenses", "$XX,XXX"], ["Assets", "$XXX,XXX"], ["Liabilities", "$XX,XXX"]]} note="Use current, complete accounting records." />
    case "organizational_capacity":
      return <GrantDocMockup title="ORGANIZATIONAL PROFILE" rows={[["Mission", "Service purpose"], ["Staff", "Key roles"], ["Experience", "Prior grants"], ["Governance", "Board / leadership"]]} note="Shows readiness to manage the award." />
    case "letters_of_support":
      return <GrantDocMockup title="LETTER OF SUPPORT" rows={[["Partner", "Organization name"], ["Role", "Contribution"], ["Commitment", "Cash / in-kind"], ["Signature", "Authorized signer"]]} note="Use letterhead and a real signature." />
    case "work_samples":
      return <GrantDocMockup title="WORK SAMPLE LIST" rows={[["Title", "Project name"], ["Date", "YYYY"], ["Medium", "Writing / image / audio"], ["Your Role", "Creator / collaborator"]]} note="Match file count, length, and format rules." />
    case "research_plan":
      return <GrantDocMockup title="RESEARCH PLAN" rows={[["Aims", "Specific goals"], ["Methods", "Approach"], ["Impact", "Significance"], ["Compliance", "IRB / IACUC if needed"]]} note="Use agency page limits and templates." />
    case "biosketch":
      return <GrantDocMockup title="BIOSKETCH / CV" rows={[["Education", "Degrees"], ["Positions", "Appointments"], ["Products", "Publications / work"], ["Role", "Project responsibility"]]} note="Use NIH/NSF format when required." />
    case "data_management":
      return <GrantDocMockup title="DATA MANAGEMENT PLAN" rows={[["Data Types", "Files collected"], ["Storage", "Secure location"], ["Sharing", "Access rules"], ["Retention", "Preservation period"]]} note="Address privacy and public access." />
    case "evaluation_plan":
      return <GrantDocMockup title="EVALUATION PLAN" rows={[["Outcome", "What changes"], ["Metric", "How measured"], ["Source", "Where data comes from"], ["Frequency", "Reporting schedule"]]} note="Tie measures to project goals." />
    case "logic_model":
      return <GrantDocMockup title="LOGIC MODEL" rows={[["Inputs", "Resources"], ["Activities", "What you do"], ["Outputs", "Counts"], ["Outcomes", "Results"]]} note="One-page project map." />
    case "match_funds":
      return <GrantDocMockup title="MATCH COMMITMENT" rows={[["Source", "Partner / account"], ["Type", "Cash / in-kind"], ["Amount", "$XX,XXX"], ["Period", "Grant dates"]]} note="Must be committed, not hoped for." />
    case "environmental_review":
      return <GrantDocMockup title="ENVIRONMENTAL REVIEW" rows={[["Site", "Project location"], ["Review", "NEPA / floodplain"], ["Finding", "Clearance status"], ["Agency", "Reviewer contact"]]} note="Do not start construction before clearance." />
    case "land_control":
      return <GrantDocMockup title="LAND CONTROL" rows={[["Property", "Address / parcel"], ["Document", "Deed / lease"], ["Term", "Start - end"], ["Owner", "Legal party"]]} note="Shows authority to use the site." />
    case "cost_estimates":
      return <GrantDocMockup title="VENDOR QUOTE" rows={[["Vendor", "Company name"], ["Item", "Equipment / service"], ["Quantity", "#"], ["Price", "$XX,XXX"]]} note="Use current written quotes or bids." />
    case "certification":
      return <GrantDocMockup title="CERTIFICATION LETTER" rows={[["Status", "Certified / approved"], ["Issuer", "Agency / certifier"], ["ID", "Certificate number"], ["Expires", "MM/DD/YYYY"]]} note="Use current official certification." />
    case "sam_uei":
      return <GrantDocMockup title="SAM.GOV ENTITY RECORD" rows={[["Entity", "Legal name"], ["UEI", "XXXXXXXXXXXX"], ["Status", "Active"], ["Expiration", "Registration date"]]} note="Federal grants require active registration." />
    case "service_records":
      return <GrantDocMockup title="SERVICE RECORD" rows={[["Participant", "Your name"], ["Program", "Service program"], ["Dates", "Start - end"], ["Status", "Completed"]]} note="Shows qualifying service or work history." />
    case "loss_documentation":
      return <GrantDocMockup title="LOSS DOCUMENTATION" rows={[["Event", "Disaster / hardship"], ["Date", "MM/DD/YYYY"], ["Amount", "$XX,XXX"], ["Evidence", "Notice / claim / photos"]]} note="Keep dates inside the eligible window." />
    case "community_needs":
      return <GrantDocMockup title="NEEDS ASSESSMENT" rows={[["Population", "Who is served"], ["Data Source", "Census / survey"], ["Need", "Problem measured"], ["Gap", "Unmet service"]]} note="Connect data to your project." />

    case "marriage":
    case "lease":
    case "medical":
    case "generic":
    default:
      return (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 flex items-center justify-center">
          <svg className="w-12 h-12 text-zinc-300" fill="none" viewBox="0 0 48 48">
            <rect x="8" y="4" width="32" height="40" rx="3" stroke="currentColor" strokeWidth="2" />
            <line x1="16" y1="16" x2="32" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="22" x2="32" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="28" x2="26" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      )
  }
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function DocumentGuide({
  documents,
  showGenerationActions = false,
}: {
  documents: string[]
  showGenerationActions?: boolean
}) {
  // Strip out the application form itself — that's what we're helping them fill out
  const filtered = documents.filter(doc => categorize(doc) !== "application_form")

  const [checked, setChecked] = useState<boolean[]>(filtered.map(() => false))
  const [expanded, setExpanded] = useState<boolean[]>(filtered.map(() => false))

  const checkableCount = filtered.length
  const checkedCount = checked.filter(Boolean).length

  if (filtered.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 p-6 text-center text-zinc-500 text-sm">
        No specific documents listed for this program.
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-zinc-900">Required Documents</h2>
        {checkableCount > 0 && (
          <span className="text-sm text-zinc-500">{checkedCount} of {checkableCount} ready</span>
        )}
      </div>

      {checkableCount > 0 && (
        <div className="mb-6 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-zinc-900 transition-all duration-300"
            style={{ width: `${(checkedCount / checkableCount) * 100}%` }}
          />
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((doc, i) => {
          const cat = categorize(doc)
          const info = CATEGORY_INFO[cat]
          const generationAction = showGenerationActions ? getDocumentGenerationAction(doc) : null

          return (
            <div
              key={i}
              className={`rounded-xl border transition-colors ${
                checked[i] ? "border-green-200 bg-green-50" : "border-zinc-200 bg-white"
              }`}
            >
              {/* Header row */}
              <div className="flex flex-wrap items-center gap-3 p-4">
                <button
                  type="button"
                  onClick={() => setChecked((prev) => prev.map((v, j) => (j === i ? !v : v)))}
                  className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    checked[i] ? "bg-green-600 border-green-600" : "border-zinc-300 hover:border-zinc-500"
                  }`}
                >
                  {checked[i] && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                <span className={`min-w-0 flex-1 text-sm font-medium ${checked[i] ? "line-through text-zinc-400" : "text-zinc-900"}`}>
                  {doc}
                </span>

                {generationAction && (
                  <button
                    type="button"
                    data-document-generator={generationAction.documentType}
                    data-document-name={doc}
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("grant-document-draft-request", {
                        detail: {
                          documentName: doc,
                          documentType: generationAction.documentType,
                        },
                      }))
                    }}
                    className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 transition-colors hover:border-amber-300 hover:bg-amber-100"
                  >
                    {generationAction.label}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setExpanded((prev) => prev.map((v, j) => (j === i ? !v : v)))}
                  className="shrink-0 text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors"
                >
                  {expanded[i] ? "Hide" : "What's this?"}
                  <svg className={`w-3.5 h-3.5 transition-transform ${expanded[i] ? "rotate-180" : ""}`} fill="none" viewBox="0 0 14 14">
                    <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* Expanded details */}
              {expanded[i] && (
                <div className="px-4 pb-4 border-t border-zinc-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <DocVisual category={cat} />
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">What it is</p>
                        <p className="text-sm text-zinc-700 leading-6">{info.what}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">How to get it</p>
                        <p className="text-sm text-zinc-700 leading-6">{info.how}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
