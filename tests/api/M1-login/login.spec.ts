import { test, expect } from '@playwright/test';
import { ApiConfig } from '../../../config/api-config';
import { TestData } from '../../../config/test-data';
import { ApiClient } from '../../../fixtures/api-client';
import { GmailHelper } from '../../../fixtures/otp-helper';

// Valid Login Test

test('Verify user can login successfully', async ({ request }) => {
  const apiClient = new ApiClient(request);

  const response = await apiClient.post(
    `${ApiConfig.buildUrl(ApiConfig.endpoints.auth.login)}`,
    {
      email: TestData.credentials.userEmail,
      password: TestData.password.userPassword
    }
  );
  const responseBody = await response.json();
  expect(response.status()).toBe(200);
  expect(responseBody.success).toBe(true);
  expect(responseBody.message.title)
    .toBe('OTP sent successfully.');

  expect(responseBody.message.description)
    .toBe('Please check your email for the verification code.');
  expect(responseBody.info).toBeDefined();
  expect(responseBody.info.expires_in).toBe(600);
  expect(responseBody.info.login_token).toBeDefined();
  expect(typeof responseBody.info.login_token)
    .toBe('string');
  expect(responseBody.info.login_token.length)
    .toBeGreaterThan(0);
  const otp = await GmailHelper.getOtp();

  console.log('OTP:', otp);
  // await request.post('/auth/verify-otp', {
  //   data: {
  //     otp,
  //     login_token,
  //   },
  // });
});
