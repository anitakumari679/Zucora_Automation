import { faker } from '@faker-js/faker';
import { test, expect } from '@playwright/test';
import { ApiConfig } from '../../../config/api-config';
import { TestData } from '../../../config/test-data';
import { ApiClient } from '../../../fixtures/api-client';
import { authStorage } from '../../../fixtures/auth-storage';
import { GmailHelper } from '../../../utils/gmail-helper';


test.describe('Forgot Password Module', () => {
test('@forgotPasswordRequest: Verify forgot password link functionality', async ({ request }) => {
  const apiClient = new ApiClient(request);

  const response = await apiClient.post(
    ApiConfig.buildUrl(ApiConfig.endpoints.forgot_password.forgotRequest),
    {
      email: TestData.credentials.userEmail,
    }
  );
  const responseBody = await response.json();

  expect(response.status()).toBe(200);
  expect(responseBody.success).toBe(true);
  expect(responseBody.message.title).toBe(
    'Password Reset Link Sent'
  );
});

test('@forgotPasswordUnregisteredEmail: Verify reset password request for unregistered email', async ({ request }) => {
  const apiClient = new ApiClient(request);

  const response = await apiClient.post(
    ApiConfig.buildUrl(ApiConfig.endpoints.forgot_password.forgotRequest),
    {
      email: TestData.credentials.nonExistingEmail,
    }
  );
  const responseBody = await response.json();

  expect(response.status()).toBe(202);
  expect(responseBody.success).toBe(true);
  expect(responseBody.info).toBeNull();
  expect(responseBody.message.title).toBe('Request Accepted');
  expect(responseBody.message.description).toBe(
    'If an account is associated with this email, a reset link has been sent.'
  );
  console.log('Message description:',responseBody.message.description);
  console.log('Correct response code returned:', response.status());
});


test('@forgotPasswordResetToken', async ({ request }) => {
  const apiClient = new ApiClient(request);
  const requestedAt = Date.now();
  const newPassword = `Admin@${faker.string.alphanumeric(8)}${faker.number.int({
    min: 10,
    max: 99,
  })}`;

  const response = await apiClient.post(
    ApiConfig.buildUrl(ApiConfig.endpoints.forgot_password.forgotRequest),
    {
      email: TestData.credentials.csUserEmail,
    }
  );
  const responseBody = await response.json();

  expect(response.status()).toBe(200);
  expect(responseBody.success).toBe(true);

  const resetLink = await GmailHelper.getLatestPasswordResetLink({
    requestedAfterMs: requestedAt,
    recipientEmail: TestData.credentials.csUserEmail,
  });

  expect(resetLink).toContain('/reset-password');
  expect(resetLink).toContain('token=');

  const resetUrl = new URL(resetLink);
  const resetToken = resetUrl.searchParams.get('token');
  console.log('Extracted reset token:', resetToken);
  expect(resetToken).toBeTruthy();

  const resetPasswordResponse = await apiClient.post(
    ApiConfig.buildUrl(ApiConfig.endpoints.forgot_password.resetPassword),
    {
      token: resetToken,
      new_password: newPassword,
    }
  );
  const resetPasswordBody = await resetPasswordResponse.json();

  expect(
    resetPasswordResponse.ok(),
    `Password reset failed: ${resetPasswordResponse.status()} ${JSON.stringify(
      resetPasswordBody
    )}`
  ).toBe(true);
  expect(resetPasswordResponse.status()).toBe(200);
  expect(resetPasswordBody.success).toBe(true);
  expect(resetPasswordBody.message.title).toBe(
    'Password Updated Successfully'
  );
  console.log('Password reset successful with new password:', newPassword);

});

test('@incorrectPassword: Verify attempt login with incorrect password', async ({ request }) => {
  const apiClient = new ApiClient(request);

  const response = await apiClient.post(
    `${ApiConfig.buildUrl(ApiConfig.endpoints.auth.login)}`,
    {
      email: TestData.credentials.userEmail,
      password: TestData.password.incorrectPassword
    }
  );
  const responseBody = await response.json();
  expect(response.status()).toBe(401);
  expect(responseBody.success).toBe(false);
  expect(responseBody.errors.title).toBe('Log In Unsuccessful');
  expect(responseBody.errors.description).toBe(
    'Check your email and password and try again.'
  );
});

test('@emptyPayload: Verify attempt login with empty payload', async ({ request }) => {
  const apiClient = new ApiClient(request);

  const response = await apiClient.post(
    `${ApiConfig.buildUrl(ApiConfig.endpoints.auth.login)}`,
    {
      email: TestData.credentials.emptyEmail,
      password: TestData.password.emptyPassword
    }
  );
  const responseBody = await response.json();
  expect(response.status()).toBe(400);
  expect(responseBody.success).toBe(false);
  expect(responseBody.errors.title).toBe('email should not be empty');
});

test('@nullPayload: Verify attempt login with null payload', async ({ request }) => {
  const apiClient = new ApiClient(request);

  const response = await apiClient.post(
    `${ApiConfig.buildUrl(ApiConfig.endpoints.auth.login)}`,
    {
      email: null,
      password: null
    }
  );
  const responseBody = await response.json();
  expect(response.status()).toBe(400);
  expect(responseBody.success).toBe(false);
  expect(responseBody.errors.title).toBe('email should not be empty');
});

test('@incorrectEmail: Verify attempt login with incorrect email payload', async ({ request }) => {
  const apiClient = new ApiClient(request);

  const response = await apiClient.post(
    `${ApiConfig.buildUrl(ApiConfig.endpoints.auth.login)}`,
    {
      email: TestData.credentials.incorrectEmail,
      password: TestData.password.userPassword
    }
  );
  const responseBody = await response.json();
  expect(response.status()).toBe(401);
  expect(responseBody.success).toBe(false);
  expect(responseBody.errors.title).toBe('Log In Unsuccessful');
  expect(responseBody.errors.description).toBe(
    'Check your email and password and try again.'
  );
});

test('@nonExistingEmail: Verify attempt login with non-existing email payload', async ({ request }) => {
  const apiClient = new ApiClient(request);

  const response = await apiClient.post(
    `${ApiConfig.buildUrl(ApiConfig.endpoints.auth.login)}`,
    {
      email: TestData.credentials.nonExistingEmail,
      password: TestData.password.userPassword
    }
  );
  const responseBody = await response.json();
  expect(response.status()).toBe(401);
  expect(responseBody.success).toBe(false);
  expect(responseBody.errors.title).toBe('Log In Unsuccessful');
  expect(responseBody.errors.description).toBe(
    'Check your email and password and try again.'
  );
});

test('@invalidEmailFormat: Verify attempt login with invalid email format payload', async ({ request }) => {
  const apiClient = new ApiClient(request);

  const response = await apiClient.post(
    `${ApiConfig.buildUrl(ApiConfig.endpoints.auth.login)}`,
    {
      email: TestData.credentials.invalidEmailFormat,
      password: TestData.password.userPassword
    }
  );
  const responseBody = await response.json();
  expect(response.status()).toBe(400);
  expect(responseBody.success).toBe(false);
  expect(responseBody.errors.title).toBe('Please provide a valid email address');
  expect(responseBody.errors.description).toBe('');
});

test('@invalidCreds: Verify attempt login with invalid credentials payload', async ({ request }) => {
  const apiClient = new ApiClient(request);

  const response = await apiClient.post(
    `${ApiConfig.buildUrl(ApiConfig.endpoints.auth.login)}`,
    {
      email: TestData.credentials.incorrectEmail,
      password: TestData.password.incorrectPassword
    }
  );
  const responseBody = await response.json();
  expect(response.status()).toBe(401);
  expect(responseBody.success).toBe(false);
  expect(responseBody.errors.title).toBe('Log In Unsuccessful');
  expect(responseBody.errors.description).toBe('Check your email and password and try again.');
});

test('@invalidContentType: Verify login returns unsupported media type for incorrect content type', async ({ request }) => {
  const apiClient = new ApiClient(request);

  const response = await apiClient.post(
    `${ApiConfig.buildUrl(ApiConfig.endpoints.auth.login)}`,
    {
      email: TestData.credentials.userEmail,
      password: TestData.password.userPassword,
    },
    {
      'Content-Type': 'text/plain',
    }
  );
  const responseBody = await response.json();
  expect(response.status()).toBe(415);
  console.log('Response body for invalid content type:', responseBody);
  expect(responseBody.success).toBe(false);
  expect(responseBody.errors.title).toBe('Unsupported Media Type');
  expect(responseBody.errors.description).toBe('Content-Type must be application/json.');
});

// Valid Login Test — credentials from USER_EMAIL / VALID_PASSWORD in env file

test('@validLogin: Verify login with valid credentials', async ({ request }) => {
  const apiClient = new ApiClient(request);
  const accountEmail = TestData.credentials.userEmail;
  const accountPassword = TestData.password.userPassword;

  const otpRequestedAt = Date.now();

  const response = await apiClient.post(
    `${ApiConfig.buildUrl(ApiConfig.endpoints.auth.login)}`,
    {
      email: accountEmail,
      password: accountPassword,
    }
  );
  const responseBody = await response.json();
  expect(
    response.status(),
    `login failed: ${response.status()} body=${JSON.stringify(responseBody)}`
  ).toBe(200);
  expect(responseBody.success).toBe(true);
  expect(responseBody.message.title)
    .toBe('Verification Code Sent');

  expect(responseBody.message.description)
    .toBe('A verification code has been sent to your email.');
  expect(responseBody.info).toBeDefined();
  expect(responseBody.info.expires_in).toBe(600);
  expect(responseBody.info.login_token).toBeDefined();
  expect(typeof responseBody.info.login_token)
    .toBe('string');
  expect(responseBody.info.login_token.length)
    .toBeGreaterThan(0);
  const otp = await GmailHelper.getLatestOtp({
    requestedAfterMs: otpRequestedAt,
    recipientEmail: accountEmail,
  });
  const loginToken = responseBody.info.login_token;

  const verifyOtpResponse = await apiClient.post(
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
  const verifyOtpResponseBody = await verifyOtpResponse.json();
  expect(
    verifyOtpResponse.status(),
    `verifyOtp failed: ${verifyOtpResponse.status()} body=${JSON.stringify(
      verifyOtpResponseBody
    )}`
  ).toBe(200);
  expect(verifyOtpResponseBody.success).toBe(true);
  expect(verifyOtpResponseBody.message.title).toBe('2FA Verified Successfully');
  expect(verifyOtpResponseBody.message.description).toBe(
    'Your identity has been successfully verified.'
  );
  expect(verifyOtpResponseBody.info).toBeDefined();

  const info = verifyOtpResponseBody.info;
  expect(info.user).toBeDefined();
  expect(info.user.email).toBe(accountEmail);
  expect(info.user.status).toBe('ACTIVE');
  expect(typeof info.user.id).toBe('string');
  expect(info.user.id.length).toBeGreaterThan(0);
  expect(typeof info.is_super_admin).toBe('boolean');
  expect(Array.isArray(info.roles)).toBe(true);
  expect(Array.isArray(info.custom_permissions)).toBe(true);
  authStorage.accessToken = info.access_token;
});

});
