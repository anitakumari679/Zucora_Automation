import { google } from 'googleapis';

const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

const gmail = google.gmail({
  version: 'v1',
  auth: oAuth2Client,
});

export class GmailHelper {
  static async getOtp(): Promise<string> {
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 1,
      q: 'is:unread',
    });

    const messages = response.data.messages;

    if (!messages?.length) {
      throw new Error('No emails found');
    }

    const messageId = messages[0].id!;

    const message =
      await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
      });

    const payload =
      message.data.payload?.parts?.[0]?.body?.data;

    if (!payload) {
      throw new Error('Email body empty');
    }

    const decodedBody = Buffer.from(
      payload,
      'base64'
    ).toString();

    const otpMatch =
      decodedBody.match(/\b\d{6}\b/);

    if (!otpMatch) {
      throw new Error('OTP not found');
    }

    return otpMatch[0];
  }
}