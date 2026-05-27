import { test, expect } from '@playwright/test';
import { TestData } from '../../../config/test-data';
import { GmailHelper } from '../../../utils/gmail-helper';
test('Verify login page', async ({ page }) => {
  await page.goto('https://stage.horizon.ths.agency/login');
  await expect(page).toHaveTitle(/Zucora/);
  await page.getByRole('textbox', { name: 'Email Address' }).fill(TestData.credentials.userEmail);
  await page.getByRole('textbox', { name: 'Password' }).fill(TestData.password.userPassword);
  await page.getByRole('button', { name: 'Log In' }).click();
  const otp = await GmailHelper.getLatestOtp();
  console.log('OTP:', otp);
});