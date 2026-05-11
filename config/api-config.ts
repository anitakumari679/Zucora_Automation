/**
 * API Configuration for backend services
 * These values are loaded from environment-specific .env files (qa.env or stg.env)
 * The environment is determined by the TEST_ENV variable
 */

import { loadEnvironment } from './env-config';

// Load environment-specific configuration
loadEnvironment();

const baseUri = (
  process.env.API_BASE_URI ||
  'https://api.stage.horizon.ths.agency/api/v1'
).replace(/\/$/, '');

const loginEndpoint = (
  process.env.API_LOGIN_ENDPOINT ||
  '/auth/login'
).startsWith('/')
  ? process.env.API_LOGIN_ENDPOINT || '/auth/login'
  : `/${process.env.API_LOGIN_ENDPOINT}`;

export const ApiConfig = {
  baseUri,
  endpoints: {
    login: loginEndpoint,
  },

  buildUrl: (endpoint: string) => {
    return `${baseUri}${endpoint}`;
  },
};