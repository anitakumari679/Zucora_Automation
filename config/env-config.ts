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

export function getAdminCredentials(): { username: string; password: string } {
  return {
    username: process.env.ADMIN_USERNAME || '',
    password: process.env.ADMIN_PASSWORD || ''
  };
}

// Load environment on module import
loadEnvironment();