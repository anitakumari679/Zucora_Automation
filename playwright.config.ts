import { defineConfig, devices } from '@playwright/test';
import { loadEnvironment, getEnvironment} from './config/env-config';

// Load environment-specific configuration
// Environment is determined by TEST_ENV variable (qa or stg)
// Usage: TEST_ENV=qa npx playwright test
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
    ['allure-playwright'] // ✅ Added for Allure report
  ],
  use: {
    baseURL: process.env.BASE_URL || getPatientBaseUrl(),
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
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' },
    },
  ],
  outputDir: 'reports/test-artifacts',
});