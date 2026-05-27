/**
 * Environment Configuration Utility
 * 
 * This module handles loading environment-specific configuration files.
 * The environment can be specified via the TEST_ENV environment variable.
 * 
 * Usage:
 *   TEST_ENV=dev npx playwright test    # Run tests against DEV environment
 *   TEST_ENV=stg npx playwright test   # Run tests against STG environment
 * 
 * Default environment is 'dev' if TEST_ENV is not specified.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

export type Environment = 'dev' | 'stg';

/**
 * Get the current environment from TEST_ENV variable
 * Defaults to 'dev' if not specified
 */
export function getEnvironment(): Environment {
  const env = process.env.TEST_ENV?.toLowerCase();
  if (env === 'stg' || env === 'stage' || env === 'staging') {
    return 'stg';
  }
  return 'dev';
}
/**
 * Get the environment file path based on the current environment
 */
export function getEnvFilePath(): string {
  const env = getEnvironment();
  const fileName = env === 'stg' ? 'stage.env' : 'dev.env';
  return path.resolve(__dirname, fileName);
}

/**
 * Load environment variables from the appropriate .env file
 * This should be called at the start of test execution
 */
export function loadEnvironment(): void {
  const sharedEnvPath = path.resolve(__dirname, '.env');
  dotenv.config({ path: sharedEnvPath, override: false });

  const envFilePath = getEnvFilePath();
  console.log(`Loading environment configuration from: ${envFilePath}`);
  dotenv.config({ path: envFilePath, override: true });
}

/**
 * Admin portal base URL: prefers BASE_URL from the loaded env file, then env-specific defaults.
 */
export function getAdminBaseUrl(): string {
  const fromEnv = process.env.BASE_URL?.trim().replace(/\/+$/, '');
  if (fromEnv) return fromEnv;
  const env = getEnvironment();
  return env === 'stg'
    ? 'https://stage.horizon.ths.agency'
    : 'https://dev.horizon.ths.agency';
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