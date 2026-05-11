/**
 * Environment Configuration Utility
 * 
 * This module handles loading environment-specific configuration files.
 * The environment can be specified via the TEST_ENV environment variable.
 * 
 * Usage:
 *   TEST_ENV=qa npx playwright test    # Run tests against QA environment
 *   TEST_ENV=stg npx playwright test   # Run tests against STG environment
 * 
 * Default environment is 'qa' if TEST_ENV is not specified.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

export type Environment = 'qa' | 'stg';

/**
 * Get the current environment from TEST_ENV variable
 * Defaults to 'qa' if not specified
 */
export function getEnvironment(): Environment {
  const env = process.env.TEST_ENV?.toLowerCase();
  if (env === 'stg' || env === 'stage' || env === 'staging') {
    return 'stg';
  }
  return 'qa';
}

/**
 * Get the environment file path based on the current environment
 */
export function getEnvFilePath(): string {
  const env = getEnvironment();
  return path.resolve(__dirname, `${env}.env`);
}

/**
 * Load environment variables from the appropriate .env file
 * This should be called at the start of test execution
 */
export function loadEnvironment(): void {
  const envFilePath = getEnvFilePath();
  console.log(`Loading environment configuration from: ${envFilePath}`);
  dotenv.config({ path: envFilePath });
}

/**
 * Get the admin portal URL based on current environment
 */
export function getAdminBaseUrl(): string {
  const env = getEnvironment();
  return env === 'stg' ? 'https://stage.horizon.ths.agency' : 'https://stage.horizon.ths.agency/';
}

/**
 * Get the admin username from environment variables
 */
export function getAdminUsername(): string {
  return process.env.ADMIN_USERNAME || '';
}

/**
 * Get the admin password from environment variables
 */
export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || '';
}

/**
 * Get the dunning partner ID from environment variables
 */
export function getDunningPartnerId(): string {
  return process.env.DUNNING_PARTNER_ID || '6103';
}

/**
 * Get the dunning organization ID from environment variables
 */
export function getDunningOrganizationId(): string {
  return process.env.DUNNING_ORGANIZATION_ID || '8108';
}

/**
 * Get the dunning practice ID from environment variables
 */
export function getDunningPracticeId(): string {
  return process.env.DUNNING_PRACTICE_ID || '8108';
}

/**
 * Get the dunning client ID from environment variables
 */
export function getDunningClientId(): string {
  return process.env.DUNNING_CLIENT_ID || 'mint';
}

/**
 * Get the dunning reminder bill age in days from environment variables
 */
export function getDunningReminderBillAgeDays(): number {
  return parseInt(process.env.DUNNING_REMINDER_BILL_AGE_DAYS || '37', 10);
}

/**
 * Get the default partner ID from environment variables
 */
export function getDefaultPartnerId(): string {
  return process.env.DEFAULT_PARTNER_ID || '13';
}

/**
 * Get admin credentials for the current environment
 * Credentials should be set via ADMIN_USERNAME and ADMIN_PASSWORD environment variables
 */
export function getAdminCredentials(): { username: string; password: string } {
  return {
    username: process.env.ADMIN_USERNAME || '',
    password: process.env.ADMIN_PASSWORD || ''
  };
}

/**
 * Get the practice management service URL based on current environment
 * Used for organization management API calls (delete organization, etc.)
 */
export function getPracticeManagementBaseUrl(): string {
  return process.env.PRACTICE_MANAGEMENT_BASE_URI || 'http://practice-management-service.pp-app-cluster.qa.internalpp.net';
}

/**
 * Get the bill status URL based on current environment
 */
export function getBillStatusUrl(): string {
  return process.env.BILL_STATUS_URL || '';
}

/**
 * Get CLEARGAGE payment processor configuration from environment variables
 * Used for configuring CLEARGAGE MIDs (payprocessorId: 11)
 * 
 * Required environment variables (must be set in qa.env or stg.env):
 * - CLEARGAGE_MERCHANT_ID: Merchant ID for CLEARGAGE
 * - CLEARGAGE_USER: User credential for CLEARGAGE
 * - CLEARGAGE_PASS: Password credential for CLEARGAGE
 * - CLEARGAGE_PAY_PROCESSOR_ID: Pay processor ID (default: 11)
 */
export function getCleargageConfig(): {
  merchantId: string;
  user: string;
  pass: string;
  payProcessorId: number;
} {
  return {
    merchantId: process.env.CLEARGAGE_MERCHANT_ID || '',
    user: process.env.CLEARGAGE_USER || '',
    pass: process.env.CLEARGAGE_PASS || '',
    payProcessorId: parseInt(process.env.CLEARGAGE_PAY_PROCESSOR_ID || '11', 10)
  };
}

// Load environment on module import
loadEnvironment();