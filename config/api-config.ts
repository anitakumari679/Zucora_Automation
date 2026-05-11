/**
 * API Configuration for backend services
 * These values are loaded from environment-specific .env files (qa.env or stg.env)
 * The environment is determined by the TEST_ENV variable
 */

import { loadEnvironment } from './env-config';

// Load environment-specific configuration
loadEnvironment();

export const ApiConfig = {
  // Base URIs for services
  starterBaseUri: process.env.STARTER_BASE_URI || 'https://qa-dunning-starter.patientpay.net',
  
  // API Endpoints (from Config/configurations.py)
  endpoints: {
  }
};

/**
 * Get the full URL for dunning starter
 */
export function getStarterUrl(organizationId: string): string {
  return `${ApiConfig.starterBaseUri}${ApiConfig.endpoints.starterElectronic.replace('{organizationId}', organizationId)}`;
}

/**
 * Get the full URL for dunning collector
 */
export function getCollectorUrl(practiceId: string): string {
  return `${ApiConfig.collectorBaseUri}${ApiConfig.endpoints.collectorCollect.replace('{practiceId}', practiceId)}`;
}

/**
 * Get the full URL for evict cache
 */
export function getEvictCacheUrl(): string {
  return `${ApiConfig.evictCacheBaseUri}${ApiConfig.endpoints.evictCache}`;
}

/**
 * Get tomorrow's date in YYYY-MM-DD format
 */
export function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a date is a weekday (Monday-Friday)
 */
export function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

/**
 * Get next weekday from a given date
 */
export function getNextWeekday(date: Date): Date {
  const result = new Date(date);
  while (!isWeekday(result)) {
    result.setDate(result.getDate() + 1);
  }
  return result;
}

/**
 * Get dunning run date (next weekday from tomorrow)
 * @deprecated Use calculateDunningDateFromEffectiveCreatedDate instead
 */
export function getDunningRunDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeekday = getNextWeekday(tomorrow);
  const year = nextWeekday.getFullYear();
  const month = String(nextWeekday.getMonth() + 1).padStart(2, '0');
  const day = String(nextWeekday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * US Holidays used for dunning date calculation
 * Must be kept in sync with RestUtils/utils/holidays.py
 */
const HOLIDAYS: Record<string, string[]> = {
  "2025": [
    "2025-01-01", "2025-01-20", "2025-05-26", "2025-07-04", "2025-09-01",
    "2025-11-27", "2025-11-28", "2025-12-24", "2025-12-25", "2025-12-26", "2025-12-31"
  ],
  "2026": [
    "2026-01-01", "2026-01-19", "2026-05-25", "2026-07-04", "2026-09-07",
    "2026-11-26", "2026-11-27", "2026-12-24", "2026-12-25", "2026-12-26", "2026-12-31"
  ],
  "2027": [
    "2027-01-01", "2027-01-18", "2027-05-31", "2027-07-04", "2027-09-06",
    "2027-11-25", "2027-11-26", "2027-12-24", "2027-12-25", "2027-12-26", "2027-12-31"
  ]
};

/**
 * Check if a date is a US holiday
 */
function isHoliday(date: Date): boolean {
  const year = String(date.getFullYear());
  const dateStr = formatDateToYYYYMMDD(date);
  const yearHolidays = HOLIDAYS[year] || [];
  return yearHolidays.includes(dateStr);
}

/**
 * Format date to YYYY-MM-DD string
 */
function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get next business day (skips weekends and holidays)
 * Equivalent to DunningRunDateUtil.is_weekday() + is_holiday() from pytest
 */
function getNextBusinessDay(date: Date): Date {
  const result = new Date(date);
  
  // Keep moving forward until we find a business day
  while (true) {
    // Check if it's a weekend (Saturday = 6, Sunday = 0)
    const dayOfWeek = result.getDay();
    if (dayOfWeek === 6) {
      // Saturday -> move to Monday
      result.setDate(result.getDate() + 2);
      continue;
    } else if (dayOfWeek === 0) {
      // Sunday -> move to Monday
      result.setDate(result.getDate() + 1);
      continue;
    }
    
    // Check if it's a holiday
    if (isHoliday(result)) {
      result.setDate(result.getDate() + 1);
      continue;
    }
    
    // Valid business day found
    break;
  }
  
  return result;
}

/**
 * Calculate dunning date from effective_created_date
 * This matches the pytest logic:
 *   initial_date = bill.effective_created_date + timedelta(days=1)
 *   dunning_date = DunningRunDateUtil.is_weekday(initial_date)
 *   dunning_date_final = DunningRunDateUtil.is_holiday(dunning_date)
 * 
 * @param effectiveCreatedDate - The effective_created_date from the database (YYYY-MM-DD format)
 * @returns The calculated dunning date in YYYY-MM-DD format
 */
export function calculateDunningDateFromEffectiveCreatedDate(effectiveCreatedDate: string): string {
  // Parse the effective_created_date
  const [year, month, day] = effectiveCreatedDate.split('-').map(Number);
  const baseDate = new Date(year, month - 1, day);
  
  // Add 1 day (equivalent to + timedelta(days=1))
  baseDate.setDate(baseDate.getDate() + 1);
  
  // Get next business day (skips weekends and holidays)
  const dunningDate = getNextBusinessDay(baseDate);
  
  return formatDateToYYYYMMDD(dunningDate);
}

