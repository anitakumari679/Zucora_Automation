/**
 * API Configuration for backend services
 * These values are loaded from environment-specific .env files
 * The environment is determined by the TEST_ENV variable
 */

import { loadEnvironment } from './env-config';

// Load environment-specific configuration
loadEnvironment();

const baseUri = (
  process.env.API_BASE_URI ||
  'https://api.stage.horizon.ths.agency/api/v1'
).replace(/\/$/, '');

export const endpoints = {
  auth: {
    login: '/auth/login',
    resendOtp: '/auth/resend-otp',
    verifyOtp: '/auth/verify-otp',
    logout: '/auth/logout',
  },
  forgot_password: {
    forgotRequest: '/auth/password/reset-request',
    resetPassword: '/auth/password/reset',
    resetLinkCheck: '/auth/password/reset-check',
  },
  users: {
    profile: '/users/profile',
  },
};

export const ApiConfig = {
  baseUri,
  endpoints,

  buildUrl(endpoint: string): string {
    return `${baseUri}${
      endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    }`;
  },
};