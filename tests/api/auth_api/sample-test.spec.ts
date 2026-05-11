import { test, expect } from '@playwright/test';

test('Verify example page title', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example/);
});