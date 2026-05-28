import { test, expect } from '@playwright/test';
import { TestData } from '../../../config/test-data';

test('Verify login page', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveTitle(/Zucora/);
  await page.getByRole('textbox', { name: 'Email Address' }).fill(TestData.credentials.userEmail);
  await page.getByRole('textbox', { name: 'Password' }).fill(TestData.password.userPassword);
  await page.getByRole('button', { name: 'Log In' }).click();
});
