function requiredEnv(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }

  throw new Error(`Missing required environment variable. Set one of: ${keys.join(', ')}`);
}

const validPassword = requiredEnv('VALID_PASSWORD');

export const TestData = {
  urls: {
    baseUrl: process.env.PATIENT_URL || '',
  },
  credentials: {
    userEmail: requiredEnv('USER_EMAIL', ''),
    invalidEmail: process.env.INVALID_EMAIL || 'invalid.email@example.com',
    emptyEmail: process.env.EMPTY_EMAIL || '',
    incorrectEmail: process.env.INCORRECT_EMAIL || 'invalid.user@example.com',
    nonExistingEmail: process.env.NON_EXISTING_EMAIL || 'non.existing.user@example.com',
    invalidEmailFormat: process.env.INVALID_EMAIL_FORMAT || 'invalid.email.example.com',
    superAdminEmail: process.env.SUPER_ADMIN_EMAIL || '',
    csUserEmail: process.env.CS_USER || '',
  },
  password: {
    userPassword: validPassword,
    incorrectPassword: process.env.INCORRECT_PASSWORD || `${validPassword}__invalid`,
    emptyPassword: process.env.EMPTY_PASSWORD || '',
    superAdminPassword: process.env.SUPER_ADMIN_PASSWORD || '',
    csUserPassword: process.env.CS_USER_PASSWORD || '',
  },
  otp: {
    validOTP: process.env.OTP_CODE || '123456',
  },
  errorMessages: {
    invalidDob: process.env.INVALID_DOB_ERROR_MESSAGE || 'Use MM/DD/YYYY format',
    futureDob: process.env.FUTURE_DOB_ERROR_MESSAGE || 'Use MM/DD/YYYY format',
  },
  profile: {
    validEmail: process.env.VALID_PROFILE_EMAIL || '',
    newEmail: process.env.NEW_PROFILE_EMAIL || ''
  },
  forgotPassword: {
    url: process.env.FORGOT_PASSWORD_URL || '',
    invalidEmail: process.env.FORGOT_PASSWORD_INVALID_EMAIL || ''
  },
  gmail: {
    clientId: process.env.GMAIL_CLIENT_ID || process.env.CLIENT_ID || '',
    clientSecret: process.env.GMAIL_CLIENT_SECRET || process.env.CLIENT_SECRET || '',
    refreshTokken: process.env.GMAIL_REFRESH_TOKEN || process.env.REFRESH_TOKEN || '',
  },
  roleId:{
    adminRoleId: process.env.ONBOARDING_ROLE_ID || ''
  }
}
