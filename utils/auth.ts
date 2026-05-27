import { google } from 'googleapis';
import { loadEnvironment } from '../config/env-config';

// Load config/.env (shared secrets) + config/dev.env or config/stage.env
loadEnvironment();

function getEnv(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  throw new Error(
    `Missing env var. Set one of: ${keys.join(', ')} in config/.env`
  );
}

const CLIENT_ID = getEnv('GMAIL_CLIENT_ID', 'CLIENT_ID');
const CLIENT_SECRET = getEnv('GMAIL_CLIENT_SECRET', 'CLIENT_SECRET');

const REDIRECT_URI = 'http://localhost';

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

async function generateTokens() {
  try {
    const authCode = getEnv('GMAIL_AUTH_CODE', 'AUTH_CODE');
    const { tokens } = await oAuth2Client.getToken(authCode);

    console.log('\nTokens:\n');
    console.log(tokens);
  } catch (error) {
    console.error(error);
  }
}

generateTokens();
