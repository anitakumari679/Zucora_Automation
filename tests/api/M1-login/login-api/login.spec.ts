import { test, expect } from '@playwright/test';
import { ApiConfig } from '../../../../config/api-config';
import { TestData } from '../../../../config/test-data';
import { ApiClient } from '../../../../fixtures/api-client';

// Valid Login Test

test('Verify user can login successfully', async ({ request }) => {
  const apiClient = new ApiClient(request);

  const response = await apiClient.post(
    `${ApiConfig.buildUrl(ApiConfig.endpoints.login)}`,
    {
      email: TestData.credentials.userEmail,
      password: TestData.password.userPassword
    }
  );
  const responseBody = await response.json();
  console.log(responseBody);
  expect(response.status()).toBe(200);
  console.log(responseBody);
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
});
