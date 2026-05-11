import { loadEnvironment } from './env-config';

// Load environment-specific configuration
loadEnvironment();

export const TestData = {
  urls: {
    patientUrl: process.env.PATIENT_URL || '',
  },
  credentials: {
    userEmail: process.env.PATIENT_EMAIL || 'ppqa+56418446@techindustan',
  
  },
  dob: {
    valid: process.env.VALID_DOB || '01/01/1991',
    invalid: process.env.INVALID_DOB || '1999/12/01',
    incorrect: process.env.INCORRECT_DOB || '01/01/1999',
    future: process.env.FUTURE_DOB || '01/01/2030',
    newPatientValid: process.env.NEW_PATIENT_VALID_DOB || '01/01/1980',
  },
  billCode: {
    valid: process.env.VALID_BILL_CODE || '69d34dc7-3',
    invalid: process.env.INVALID_BILL_CODE || '78rhyuf7r',
  },
  errorMessages: {
    invalidDob: process.env.INVALID_DOB_ERROR_MESSAGE || 'Use MM/DD/YYYY format',
    futureDob: process.env.FUTURE_DOB_ERROR_MESSAGE || 'Use MM/DD/YYYY format',
  },
  organization: {
    name: process.env.ORGANIZATION_NAME || '',
  },
  profile: {
    validEmail: process.env.VALID_PROFILE_EMAIL || '',
    newEmail: process.env.NEW_PROFILE_EMAIL || ''
  },
  forgotPassword: {
    url: process.env.FORGOT_PASSWORD_URL || '',
    invalidEmail: process.env.FORGOT_PASSWORD_INVALID_EMAIL || 'hk+99@patientpay.com'

  }
};
