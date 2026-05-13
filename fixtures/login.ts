import { test as base, expect, APIRequestContext } from '@playwright/test';
import { ApiConfig } from '../config/api-config';
import { TestData } from '../config/test-data';
import { ApiClient } from './api-client';
import { authStorage } from './auth-storage';

export type LoginFixture = {
  /** JWT access token from `/auth/login` → `/auth/verify` flow */
  accessToken: string;
};

/**
 * Full happy-path login + OTP verify (same steps as `@validLogin`).
 * Returns `access_token` for use in other API calls.
 */
export async function performLoginForAccessToken(
  request: APIRequestContext
): Promise<string> {
  const apiClient = new ApiClient(request);

  // OTP is issued for this account — verify must use the same email as login.
  const accountEmail = TestData.credentials.superAdminEmail;
  const accountPassword = TestData.password.superAdminPassword;

  const loginResponse = await apiClient.post(
    `${ApiConfig.buildUrl(ApiConfig.endpoints.auth.login)}`,
    {
      email: accountEmail,
      password: accountPassword,
    }
  );
  const loginBody = await loginResponse.json();

  expect(
    loginResponse.status(),
    `login failed: ${loginResponse.status()} body=${JSON.stringify(loginBody)}`
  ).toBe(200);
  expect(loginBody.success).toBe(true);
  expect(loginBody.message.title).toBe('Verification Code Sent');
  expect(loginBody.message.description).toBe(
    'A verification code has been sent to your email.'
  );
  expect(loginBody.info).toBeDefined();
  expect(loginBody.info.expires_in).toBe(600);
  expect(loginBody.info.login_token).toBeDefined();
  expect(typeof loginBody.info.login_token).toBe('string');
  expect(loginBody.info.login_token.length).toBeGreaterThan(0);

  const loginToken = loginBody.info.login_token as string;
  const otp = String(TestData.otp.validOTP);

  const verifyResponse = await apiClient.post(
    `${ApiConfig.buildUrl(ApiConfig.endpoints.auth.verifyOtp)}`,
    {
      email: accountEmail,
      otp,
      meta: {
        ip: '127.0.0.1',
        device: 'postman',
      },
    },
    { login_token: loginToken }
  );
  const verifyBody = await verifyResponse.json();

  expect(
    verifyResponse.status(),
    `verifyOtp failed: ${verifyResponse.status()} body=${JSON.stringify(verifyBody)}`
  ).toBe(200);
  expect(verifyBody.success).toBe(true);
  expect(verifyBody.message.title).toBe('2FA verified successfully.');
  expect(verifyBody.message.description).toBe(
    'Your identity has been successfully verified.'
  );
  expect(verifyBody.info).toBeDefined();

  const info = verifyBody.info;
  expect(info.user).toBeDefined();
  expect(info.user.email).toBe(accountEmail);
  expect(info.user.status).toBe('ACTIVE');
  expect(typeof info.user.id).toBe('string');
  expect(info.user.id.length).toBeGreaterThan(0);

  expect(info.access_token).toBeDefined();
  expect(typeof info.access_token).toBe('string');
  expect(info.access_token.length).toBeGreaterThan(0);

  expect(typeof info.token_expired_at).toBe('number');
  expect(typeof info.last_active_at).toBe('number');
  expect(typeof info.is_super_admin).toBe('boolean');
  expect(Array.isArray(info.roles)).toBe(true);
  expect(Array.isArray(info.custom_permissions)).toBe(true);

  return info.access_token as string;
}

/** Headers for authenticated API calls */
export function bearerAuthHeaders(accessToken: string): Record<string, string> {
  return { Authorization: `Bearer ${accessToken}` };
}

/**
 * Use in other API specs:
 *
 * ```ts
 * import { test, expect, bearerAuthHeaders } from '../../fixtures/login';
 * import { ApiClient } from '../../fixtures/api-client';
 *
 * test('profile', async ({ request, accessToken }) => {
 *   const api = new ApiClient(request);
 *   await api.get(url, bearerAuthHeaders(accessToken));
 * });
 * ```
 */
export const test = base.extend<LoginFixture>({
  accessToken: async ({ request }, use) => {
    const token = await performLoginForAccessToken(request);
    authStorage.accessToken = token;
    await use(token);
    authStorage.clear();
  },
});

export { expect } from '@playwright/test';
