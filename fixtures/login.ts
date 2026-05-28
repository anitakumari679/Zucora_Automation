import { test as base, expect, APIRequestContext } from '@playwright/test';
import { ApiConfig } from '../config/api-config';
import { TestData } from '../config/test-data';
import { ApiClient } from './api-client';
import { authStorage } from './auth-storage';
import { GmailHelper } from '../utils/gmail-helper';

type AuthSession = Awaited<ReturnType<APIRequestContext['storageState']>>;
type AuthCookie = AuthSession['cookies'][number];

export type LoginFixture = {
  /** Authenticated cookie/session state from `/auth/login` -> `/auth/verify` flow */
  authSession: AuthSession;
  /** Deprecated: kept temporarily so existing specs can migrate from bearer auth to cookie auth. */
  accessToken: string;
};

export type WorkerAuthFixture = {
  /** Shared API request context (cookies/session) */
  authRequest: APIRequestContext;
  /** Authenticated cookie/session state generated once per worker */
  workerAuthSession: AuthSession;
  /** Deprecated: kept temporarily so existing specs can migrate from bearer auth to cookie auth. */
  workerAccessToken: string;
};

export type BrowserAuthFixture = {
  /** Auth cookies from the browser context created with the saved login session. */
  authCookies: AuthCookie[];
};

/**
 * Full happy-path login + OTP verify (same steps as `@validLogin`).
 * Saves the secure auth cookies in the supplied request context.
 */
export async function performLoginAndSaveSession(
  request: APIRequestContext
): Promise<AuthSession> {
  const apiClient = new ApiClient(request);

  // OTP is issued for this account — verify must use the same email as login.
  const accountEmail = TestData.credentials.userEmail;
  const accountPassword = TestData.password.userPassword;

  const otpRequestedAt = Date.now();

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
  const otp = await GmailHelper.getLatestOtp({
    requestedAfterMs: otpRequestedAt,
    recipientEmail: accountEmail,
  });

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
  expect(verifyBody.message.title).toBe('2FA Verified Successfully');
  expect(verifyBody.message.description).toBe(
    'Your identity has been successfully verified.'
  );
  expect(verifyBody.info).toBeDefined();

  const info = verifyBody.info;
  if (info.user) {
    expect(info.user.email).toBe(accountEmail);
    expect(info.user.status).toBe('ACTIVE');
    expect(typeof info.user.id).toBe('string');
    expect(info.user.id.length).toBeGreaterThan(0);
  }

  const authSession = await request.storageState();
  const secureHttpOnlyCookies = authSession.cookies.filter(
    (cookie) => cookie.secure && cookie.httpOnly
  );

  expect(
    secureHttpOnlyCookies.length,
    `Expected login to store secure HttpOnly auth cookies. Cookies found: ${authSession.cookies
      .map((cookie) => cookie.name)
      .join(', ')}`
  ).toBeGreaterThan(0);

  return authSession;
}

/**
 * Cookie-based auth does not need an Authorization header.
 * Kept temporarily so existing specs can migrate without changing every call site at once.
 */
export function bearerAuthHeaders(_accessToken?: string): Record<string, string> {
  return {};
}

/**
 * Backward-compatible alias for old call sites.
 * The returned string is intentionally empty because auth now lives in secure cookies.
 */
export async function performLoginForAccessToken(
  request: APIRequestContext
): Promise<string> {
  await performLoginAndSaveSession(request);
  return '';
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
  authSession: async ({ request }, use) => {
    const session = await performLoginAndSaveSession(request);
    await use(session);
  },

  accessToken: async ({ request }, use) => {
    await performLoginAndSaveSession(request);
    authStorage.accessToken = null;
    await use('');
    authStorage.clear();
  },
});

/**
 * Login once per worker and reuse the same authenticated request context + cookies.
 * Use this when a spec file has multiple tests and you want OTP only once.
 */
export const testWithWorkerAuth = base.extend<LoginFixture, WorkerAuthFixture>({
  authRequest: [
    async ({ playwright }, use) => {
      const request = await playwright.request.newContext();
      await use(request);
      await request.dispose();
    },
    { scope: 'worker' },
  ],

  workerAuthSession: [
    async ({ authRequest }, use) => {
      const session = await performLoginAndSaveSession(authRequest);
      await use(session);
    },
    { scope: 'worker' },
  ],

  workerAccessToken: [
    async ({ workerAuthSession }, use) => {
      await use('');
    },
    { scope: 'worker' },
  ],

  authSession: async ({ workerAuthSession }, use) => {
    await use(workerAuthSession);
  },

  accessToken: async ({ workerAccessToken }, use) => {
    // Deprecated compatibility value; the authenticated request context carries cookies.
    await use(workerAccessToken);
  },
});

/**
 * Login once per worker, create each browser page with the saved cookie session,
 * and expose browser-context cookies for session assertions/debugging.
 */
export const testWithSavedSession = base.extend<
  LoginFixture & BrowserAuthFixture,
  WorkerAuthFixture
>({
  authRequest: [
    async ({ playwright }, use) => {
      const request = await playwright.request.newContext();
      await use(request);
      await request.dispose();
    },
    { scope: 'worker' },
  ],

  workerAuthSession: [
    async ({ authRequest }, use) => {
      const session = await performLoginAndSaveSession(authRequest);
      await use(session);
    },
    { scope: 'worker' },
  ],

  workerAccessToken: [
    async ({ workerAuthSession }, use) => {
      await use('');
    },
    { scope: 'worker' },
  ],

  authSession: async ({ workerAuthSession }, use) => {
    await use(workerAuthSession);
  },

  accessToken: async ({ workerAccessToken }, use) => {
    await use(workerAccessToken);
  },

  page: async ({ browser, authSession }, use) => {
    const context = await browser.newContext({ storageState: authSession });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  authCookies: async ({ page }, use) => {
    const cookies = await page.context().cookies();
    console.log(
      cookies.map(({ name, domain, path, expires, httpOnly, secure, sameSite }) => ({
        name,
        domain,
        path,
        expires,
        httpOnly,
        secure,
        sameSite,
      }))
    );
    await use(cookies);
  },
});

export { expect } from '@playwright/test';
