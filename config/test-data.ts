import { loadEnvironment } from './env-config';

// Load environment-specific configuration
loadEnvironment();

export const TestData = {
  urls: {
    baseUrl: process.env.PATIENT_URL || '',
  },
  credentials: {
    userEmail:
      process.env.USER_EMAIL ||
      process.env.PATIENT_EMAIL ||
      'anita.kumari@techindustan.com',
    invalidEmail: process.env.INVALID_EMAIL || 'invalid.email@techindustan.com',
    emptyEmail: process.env.EMPTY_EMAIL || '',
    incorrectEmail: process.env.INCORRECT_EMAIL || 'anita.kumari+0098@techindustan.com',
    nonExistingEmail: process.env.NON_EXISTING_EMAIL || 'jj.thomson+0098@techindustan.com',
    invalidEmailFormat: process.env.INVALID_EMAIL_FORMAT || 'anita.kumari@techindustan.com.com',
    superAdminEmail: process.env.SUPER_ADMIN_EMAIL || 'super.admin@yopmail.com'
  },
  password: {
    userPassword: process.env.VALID_PASSWORD || 'Password@1234',
    incorrectPassword: process.env.INCORRECT_PASSWORD || 'Password@123335',
    emptyPassword: process.env.EMPTY_PASSWORD || '',
    superAdminPassword: process.env.SUPER_ADMIN_PASSWORD || 'Password@123'
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
}
