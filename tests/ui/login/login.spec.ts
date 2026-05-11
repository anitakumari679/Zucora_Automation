import { test, expect } from '@playwright/test';

test('Verify example page title', async ({ page }) => {
  await page.goto('https:google.com');
  await expect(page).toHaveTitle(/Google/);
});