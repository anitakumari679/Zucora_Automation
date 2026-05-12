import { defineConfig, devices } from '@playwright/test';
import { loadEnvironment, getEnvironment, getAdminBaseUrl} from './config/env-config';

// Environment is determined by TEST_ENV (dev | stg). Loads config/{dev|stg}.env
// Usage: TEST_ENV=dev npx playwright test
//        TEST_ENV=stg npx playwright test
loadEnvironment();

const currentEnv = getEnvironment();
console.log(`Running tests against ${currentEnv.toUpperCase()} environment`);

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  reporter: [
    ['html', { outputFolder: 'reports/html-report' }],
    ['json', { outputFile: 'reports/test-results.json' }],
    ['list'],
    ['allure-playwright'] 
  ],
  use: {
    baseURL: process.env.BASE_URL || getAdminBaseUrl(),
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'on',
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },
  timeout: 120000,
  expect: {
    timeout: 10000,
  },
  projects: [
    {
      name: 'api',
      testMatch: '**/api/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'ui-chromium',
      testMatch: '**/ui/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'ui-firefox',
      testMatch: '**/ui/**/*.spec.ts',
      use: { browserName: 'firefox' },
    },
    {
      name: 'ui-webkit',
      testMatch: '**/ui/**/*.spec.ts',
      use: { browserName: 'webkit' },
    },
  ],
  outputDir: 'reports/test-artifacts',
});