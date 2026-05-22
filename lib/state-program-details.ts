// lib/state-program-details.ts
// Per-state program eligibility/benefit data. Last researched: 2026-05-22.
// Sources: KFF, CBPP, USDA FNS, ACF, HHS.
//
// Medicaid expansion status: non-expansion states as of 2025 are
//   AL, FL, GA, KS, MS, SC, SD, TN, TX, WY (WI expanded in 2024 to 100% FPL via waiver;
//   treated as expanded at 100%). All other states + DC expanded at 138% FPL.
// TANF: federal lifetime limit is 60 months; many states mirror this.
// SNAP BBCE: states without BBCE (strict 130% FPL gross limit):
//   AK, ID, MO, MS, MT, SD, TX, WY (all others use BBCE, typically 200% FPL).

export interface StateMedicaid {
  expanded: boolean;
  adultIncomeLimitPct: number; // % FPL for non-pregnant adults
  notes?: string;
}

export interface StateChip {
  incomeLimitPct: number; // % FPL upper limit for children
  programName?: string;   // state-specific branding if notable
}

export interface StateTanf {
  maxMonthlyBenefitFamily3: number; // dollars/month for family of 3
  timeLimitMonths: number;           // lifetime limit; federal default = 60
  notes?: string;
}

export interface StateSnap {
  bbce: boolean;               // broad-based categorical eligibility
  bbceIncomeLimitPct: number;  // gross income limit % FPL (130 = no BBCE)
}

export interface StateProgramDetail {
  medicaid: StateMedicaid;
  chip: StateChip;
  tanf: StateTanf;
  snap: StateSnap;
}

export const STATE_PROGRAM_DETAILS: Record<string, StateProgramDetail> = {
  AL: { medicaid: { expanded: false, adultIncomeLimitPct: 18,  notes: "Parents only; childless adults ineligible" }, chip: { incomeLimitPct: 312 }, tanf: { maxMonthlyBenefitFamily3: 215, timeLimitMonths: 60 }, snap: { bbce: false, bbceIncomeLimitPct: 130 } },
  AK: { medicaid: { expanded: true,  adultIncomeLimitPct: 138 }, chip: { incomeLimitPct: 175 }, tanf: { maxMonthlyBenefitFamily3: 923, timeLimitMonths: 60 }, snap: { bbce: false, bbceIncomeLimitPct: 130 } },
  AZ: { medicaid: { expanded: true,  adultIncomeLimitPct: 138 }, chip: { incomeLimitPct: 200 }, tanf: { maxMonthlyBenefitFamily3: 278, timeLimitMonths: 24,  notes: "State 24-month lifetime limit" }, snap: { bbce: true,  bbceIncomeLimitPct: 185 } },
  AR: { medicaid: { expanded: true,  adultIncomeLimitPct: 138 }, chip: { incomeLimitPct: 211 }, tanf: { maxMonthlyBenefitFamily3: 204, timeLimitMonths: 24,  notes: "State 24-month limit" }, snap: { bbce: true,  bbceIncomeLimitPct: 200 } },
  CA: { medicaid: { expanded: true,  adultIncomeLimitPct: 138, notes: "Medi-Cal; covers all adults regardless of immigration status" }, chip: { incomeLimitPct: 266, programName: "Healthy Kids / CHIP" }, tanf: { maxMonthlyBenefitFamily3: 1143, timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 200 } },
  CO: { medicaid: { expanded: true,  adultIncomeLimitPct: 138 }, chip: { incomeLimitPct: 260 }, tanf: { maxMonthlyBenefitFamily3: 551,  timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 200 } },
  CT: { medicaid: { expanded: true,  adultIncomeLimitPct: 138 }, chip: { incomeLimitPct: 323 }, tanf: { maxMonthlyBenefitFamily3: 829,  timeLimitMonths: 21,  notes: "State 21-month limit with extensions" }, snap: { bbce: true,  bbceIncomeLimitPct: 185 } },
  DE: { medicaid: { expanded: true,  adultIncomeLimitPct: 138 }, chip: { incomeLimitPct: 212 }, tanf: { maxMonthlyBenefitFamily3: 338,  timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 200 } },
  DC: { medicaid: { expanded: true,  adultIncomeLimitPct: 215, notes: "DC expanded above ACA floor" }, chip: { incomeLimitPct: 323 }, tanf: { maxMonthlyBenefitFamily3: 784,  timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 200 } },
  FL: { medicaid: { expanded: false, adultIncomeLimitPct: 26,  notes: "Parents only at very low FPL; childless adults ineligible" }, chip: { incomeLimitPct: 210, programName: "Florida KidCare" }, tanf: { maxMonthlyBenefitFamily3: 303,  timeLimitMonths: 48,  notes: "State 48-month lifetime limit" }, snap: { bbce: true,  bbceIncomeLimitPct: 200 } },
  GA: { medicaid: { expanded: false, adultIncomeLimitPct: 35,  notes: "Pathways waiver covers 100% FPL with work req; traditional expansion not adopted" }, chip: { incomeLimitPct: 247, programName: "PeachCare for Kids" }, tanf: { maxMonthlyBenefitFamily3: 280,  timeLimitMonths: 48,  notes: "State 48-month limit" }, snap: { bbce: true,  bbceIncomeLimitPct: 200 } },
  HI: { medicaid: { expanded: true,  adultIncomeLimitPct: 138 }, chip: { incomeLimitPct: 308 }, tanf: { maxMonthlyBenefitFamily3: 734,  timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 200 } },
  ID: { medicaid: { expanded: true,  adultIncomeLimitPct: 138 }, chip: { incomeLimitPct: 190 }, tanf: { maxMonthlyBenefitFamily3: 309,  timeLimitMonths: 24,  notes: "State 24-month limit" }, snap: { bbce: false, bbceIncomeLimitPct: 130 } },
  IL: { medicaid: { expanded: true,  adultIncomeLimitPct: 138 }, chip: { incomeLimitPct: 313 }, tanf: { maxMonthlyBenefitFamily3: 509,  timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 165 } },
  IN: { medicaid: { expanded: true,  adultIncomeLimitPct: 138, notes: "HIP 2.0 waiver" }, chip: { incomeLimitPct: 250 }, tanf: { maxMonthlyBenefitFamily3: 288,  timeLimitMonths: 24,  notes: "State 24-month limit" }, snap: { bbce: true,  bbceIncomeLimitPct: 200 } },
  IA: { medicaid: { expanded: true,  adultIncomeLimitPct: 138, notes: "Iowa Health and Wellness Plan" }, chip: { incomeLimitPct: 302 }, tanf: { maxMonthlyBenefitFamily3: 426,  timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 160 } },
  KS: { medicaid: { expanded: false, adultIncomeLimitPct: 38,  notes: "Parents only; childless adults ineligible" }, chip: { incomeLimitPct: 238 }, tanf: { maxMonthlyBenefitFamily3: 497,  timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 200 } },
  KY: { medicaid: { expanded: true,  adultIncomeLimitPct: 138 }, chip: { incomeLimitPct: 218 }, tanf: { maxMonthlyBenefitFamily3: 262,  timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 200 } },
  LA: { medicaid: { expanded: true,  adultIncomeLimitPct: 138 }, chip: { incomeLimitPct: 250 }, tanf: { maxMonthlyBenefitFamily3: 240,  timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 200 } },
  ME: { medicaid: { expanded: true,  adultIncomeLimitPct: 138 }, chip: { incomeLimitPct: 208 }, tanf: { maxMonthlyBenefitFamily3: 485,  timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 185 } },
  MD: { medicaid: { expanded: true,  adultIncomeLimitPct: 138 }, chip: { incomeLimitPct: 322 }, tanf: { maxMonthlyBenefitFamily3: 727,  timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 200 } },
  MA: { medicaid: { expanded: true,  adultIncomeLimitPct: 138, notes: "MassHealth; pre-ACA expansion state" }, chip: { incomeLimitPct: 300 }, tanf: { maxMonthlyBenefitFamily3: 832,  timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 200 } },
  MI: { medicaid: { expanded: true,  adultIncomeLimitPct: 138, notes: "Healthy Michigan Plan" }, chip: { incomeLimitPct: 212 }, tanf: { maxMonthlyBenefitFamily3: 492,  timeLimitMonths: 48,  notes: "State 48-month limit" }, snap: { bbce: true,  bbceIncomeLimitPct: 200 } },
  MN: { medicaid: { expanded: true,  adultIncomeLimitPct: 138, notes: "MinnesotaCare; pre-ACA expansion" }, chip: { incomeLimitPct: 275 }, tanf: { maxMonthlyBenefitFamily3: 532,  timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 165 } },
  MS: { medicaid: { expanded: false, adultIncomeLimitPct: 27,  notes: "Parents only at very low FPL; childless adults ineligible" }, chip: { incomeLimitPct: 209 }, tanf: { maxMonthlyBenefitFamily3: 170,  timeLimitMonths: 60 }, snap: { bbce: false, bbceIncomeLimitPct: 130 } },
  MO: { medicaid: { expanded: true,  adultIncomeLimitPct: 138, notes: "Voter initiative passed 2020; implemented 2021" }, chip: { incomeLimitPct: 300 }, tanf: { maxMonthlyBenefitFamily3: 292,  timeLimitMonths: 60 }, snap: { bbce: false, bbceIncomeLimitPct: 130 } },
  MT: { medicaid: { expanded: true,  adultIncomeLimitPct: 138 }, chip: { incomeLimitPct: 261 }, tanf: { maxMonthlyBenefitFamily3: 545,  timeLimitMonths: 60 }, snap: { bbce: false, bbceIncomeLimitPct: 130 } },
  NE: { medicaid: { expanded: true,  adultIncomeLimitPct: 138, notes: "Voter initiative; implemented 2020" }, chip: { incomeLimitPct: 238 }, tanf: { maxMonthlyBenefitFamily3: 440,  timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 165 } },
  NV: { medicaid: { expanded: true,  adultIncomeLimitPct: 138 }, chip: { incomeLimitPct: 200 }, tanf: { maxMonthlyBenefitFamily3: 406,  timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 200 } },
  NH: { medicaid: { expanded: true,  adultIncomeLimitPct: 138, notes: "NH Health Protection Program" }, chip: { incomeLimitPct: 312 }, tanf: { maxMonthlyBenefitFamily3: 908,  timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 185 } },
  NJ: { medicaid: { expanded: true,  adultIncomeLimitPct: 138 }, chip: { incomeLimitPct: 350 }, tanf: { maxMonthlyBenefitFamily3: 559,  timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 185 } },
  NM: { medicaid: { expanded: true,  adultIncomeLimitPct: 138 }, chip: { incomeLimitPct: 235 }, tanf: { maxMonthlyBenefitFamily3: 447,  timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 165 } },
  NY: { medicaid: { expanded: true,  adultIncomeLimitPct: 138, notes: "Pre-ACA expansion; robust coverage" }, chip: { incomeLimitPct: 400, programName: "Child Health Plus" }, tanf: { maxMonthlyBenefitFamily3: 789,  timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 200 } },
  NC: { medicaid: { expanded: true,  adultIncomeLimitPct: 138, notes: "Expanded December 2023" }, chip: { incomeLimitPct: 210 }, tanf: { maxMonthlyBenefitFamily3: 272,  timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 200 } },
  ND: { medicaid: { expanded: true,  adultIncomeLimitPct: 138 }, chip: { incomeLimitPct: 250 }, tanf: { maxMonthlyBenefitFamily3: 507,  timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 200 } },
  OH: { medicaid: { expanded: true,  adultIncomeLimitPct: 138 }, chip: { incomeLimitPct: 206 }, tanf: { maxMonthlyBenefitFamily3: 506,  timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 200 } },
  OK: { medicaid: { expanded: true,  adultIncomeLimitPct: 138, notes: "Expanded June 2021 via voter initiative" }, chip: { incomeLimitPct: 205 }, tanf: { maxMonthlyBenefitFamily3: 292,  timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 200 } },
  OR: { medicaid: { expanded: true,  adultIncomeLimitPct: 138 }, chip: { incomeLimitPct: 300 }, tanf: { maxMonthlyBenefitFamily3: 632,  timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 200 } },
  PA: { medicaid: { expanded: true,  adultIncomeLimitPct: 138 }, chip: { incomeLimitPct: 314 }, tanf: { maxMonthlyBenefitFamily3: 421,  timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 160 } },
  RI: { medicaid: { expanded: true,  adultIncomeLimitPct: 138 }, chip: { incomeLimitPct: 261 }, tanf: { maxMonthlyBenefitFamily3: 723,  timeLimitMonths: 48,  notes: "State 48-month limit" }, snap: { bbce: true,  bbceIncomeLimitPct: 185 } },
  SC: { medicaid: { expanded: false, adultIncomeLimitPct: 67,  notes: "Parents only; childless adults ineligible" }, chip: { incomeLimitPct: 209 }, tanf: { maxMonthlyBenefitFamily3: 266,  timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 200 } },
  SD: { medicaid: { expanded: true,  adultIncomeLimitPct: 138, notes: "Voter initiative passed 2022; implemented 2023" }, chip: { incomeLimitPct: 200 }, tanf: { maxMonthlyBenefitFamily3: 587,  timeLimitMonths: 60 }, snap: { bbce: false, bbceIncomeLimitPct: 130 } },
  TN: { medicaid: { expanded: false, adultIncomeLimitPct: 95,  notes: "TennCare; parents to 95% FPL; childless adults ineligible" }, chip: { incomeLimitPct: 250, programName: "CoverKids" }, tanf: { maxMonthlyBenefitFamily3: 185,  timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 200 } },
  TX: { medicaid: { expanded: false, adultIncomeLimitPct: 19,  notes: "Parents only at very low FPL; childless adults ineligible" }, chip: { incomeLimitPct: 201, programName: "CHIP" }, tanf: { maxMonthlyBenefitFamily3: 280,  timeLimitMonths: 60 }, snap: { bbce: false, bbceIncomeLimitPct: 130 } },
  UT: { medicaid: { expanded: true,  adultIncomeLimitPct: 138, notes: "Expanded 2020 after voter initiative" }, chip: { incomeLimitPct: 200 }, tanf: { maxMonthlyBenefitFamily3: 498,  timeLimitMonths: 36,  notes: "State 36-month limit" }, snap: { bbce: true,  bbceIncomeLimitPct: 185 } },
  VT: { medicaid: { expanded: true,  adultIncomeLimitPct: 138, notes: "Pre-ACA expansion; Green Mountain Care" }, chip: { incomeLimitPct: 312 }, tanf: { maxMonthlyBenefitFamily3: 640,  timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 185 } },
  VA: { medicaid: { expanded: true,  adultIncomeLimitPct: 138, notes: "Expanded January 2019" }, chip: { incomeLimitPct: 200 }, tanf: { maxMonthlyBenefitFamily3: 474,  timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 200 } },
  WA: { medicaid: { expanded: true,  adultIncomeLimitPct: 138 }, chip: { incomeLimitPct: 312 }, tanf: { maxMonthlyBenefitFamily3: 646,  timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 200 } },
  WV: { medicaid: { expanded: true,  adultIncomeLimitPct: 138 }, chip: { incomeLimitPct: 300 }, tanf: { maxMonthlyBenefitFamily3: 388,  timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 200 } },
  WI: { medicaid: { expanded: true,  adultIncomeLimitPct: 100, notes: "Badger Care Plus; covers adults to 100% FPL via 1115 waiver; no ACA expansion but full coverage below poverty" }, chip: { incomeLimitPct: 300 }, tanf: { maxMonthlyBenefitFamily3: 653,  timeLimitMonths: 60 }, snap: { bbce: true,  bbceIncomeLimitPct: 200 } },
  WY: { medicaid: { expanded: false, adultIncomeLimitPct: 54,  notes: "Parents only; childless adults ineligible" }, chip: { incomeLimitPct: 200 }, tanf: { maxMonthlyBenefitFamily3: 610,  timeLimitMonths: 60 }, snap: { bbce: false, bbceIncomeLimitPct: 130 } },
};
