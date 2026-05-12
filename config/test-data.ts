import { loadEnvironment } from './env-config';

// Load environment-specific configuration
loadEnvironment();

export const TestData = {
  urls: {
    baseUrl: process.env.PATIENT_URL || '',
  },
  credentials: {
    userEmail: process.env.PATIENT_EMAIL || 'anita.kumari@techindustan.com'  
  },
  password: {
    userPassword: process.env.VALID_PASSWORD || 'Password@123'
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
  }
};
