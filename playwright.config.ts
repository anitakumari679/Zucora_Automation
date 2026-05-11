import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    headless: true,
    browserName: 'chromium',
    screenshot: 'only-on-failure', trace: 'on-first-retry', video: 'on',
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },
  reporter: [
    ['list'],
    ['allure-playwright']
  ],
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium'
      }
    }
  ]
});