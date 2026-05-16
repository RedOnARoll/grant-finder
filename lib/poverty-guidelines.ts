// 2025 Federal Poverty Guidelines (48 contiguous states + DC)
const FPL_BASE = 15_060
const FPL_PER_ADDITIONAL = 5_380

// Alaska and Hawaii have higher limits
const FPL_ALASKA_BASE = 18_810
const FPL_ALASKA_PER_ADDITIONAL = 6_730
const FPL_HAWAII_BASE = 17_310
const FPL_HAWAII_PER_ADDITIONAL = 6_190

export function getFederalPovertyLimit(householdSize: number, state?: string): number {
  const size = Math.max(1, Math.min(householdSize, 20))
  if (state === "AK") {
    return FPL_ALASKA_BASE + FPL_ALASKA_PER_ADDITIONAL * (size - 1)
  }
  if (state === "HI") {
    return FPL_HAWAII_BASE + FPL_HAWAII_PER_ADDITIONAL * (size - 1)
  }
  return FPL_BASE + FPL_PER_ADDITIONAL * (size - 1)
}

export function getIncomeLimit(householdSize: number, povertyPercent: number, state?: string): number {
  return Math.round(getFederalPovertyLimit(householdSize, state) * povertyPercent / 100)
}

export const HOUSEHOLD_SIZES = [1, 2, 3, 4, 5, 6, 7, 8]
