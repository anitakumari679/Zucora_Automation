import { google } from 'googleapis';
import { TestData } from '../config/test-data';

export class GmailHelper {

  /**
   * Create authenticated Gmail client
   */
  private static async getGmailClient() {
    if (
      !TestData.gmail.clientId ||
      !TestData.gmail.clientSecret ||
      !TestData.gmail.refreshTokken
    ) {
      throw new Error(
        'Missing Gmail OAuth env vars. Set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN in your env file.'
      );
    }

    const oAuth2Client =
      new google.auth.OAuth2(
        TestData.gmail.clientId,
        TestData.gmail.clientSecret
      );

    oAuth2Client.setCredentials({
      refresh_token:
        TestData.gmail.refreshTokken,
    });

    return google.gmail({
      version: 'v1',
      auth: oAuth2Client,
    });
  }

  /**
   * Fetch latest unread OTP email
   */
  static async getLatestOtp(): Promise<string> {

    const gmail =
      await this.getGmailClient();

    // Wait for email delivery
    await new Promise(resolve =>
      setTimeout(resolve, 5000)
    );

    /**
     * Fetch latest unread OTP email
     */
    const response =
      await gmail.users.messages.list({
        userId: 'me',

        maxResults: 1,

        q: `
          subject:"Login OTP"
          is:unread
          newer_than:2m
        `,
      });

    const messages =
      response.data.messages;

    if (!messages?.length) {
      throw new Error(
        'No unread OTP email found'
      );
    }

    /**
     * Get email content
     */
    const message =
      await gmail.users.messages.get({
        userId: 'me',

        id: messages[0].id!,
      });

    let emailBody = '';

    /**
     * Handle multipart emails
     */
    const parts =
      message.data.payload?.parts;

    if (parts?.length) {

      for (const part of parts) {

        if (
          part.mimeType === 'text/plain' &&
          part.body?.data
        ) {

          emailBody =
            Buffer.from(
              part.body.data,
              'base64'
            ).toString();

          break;
        }
      }
    }

    /**
     * Fallback for non-multipart emails
     */
    if (
      !emailBody &&
      message.data.payload?.body?.data
    ) {

      emailBody =
        Buffer.from(
          message.data.payload.body.data,
          'base64'
        ).toString();
    }

    console.log('\n===== EMAIL BODY =====\n');
    console.log(emailBody);

    /**
     * Extract 6-digit OTP
     */
    const otpMatch =
      emailBody.match(/\b\d{6}\b/);

    if (!otpMatch) {
      throw new Error(
        'OTP not found in email'
      );
    }

    /**
     * Mark email as read
     */
    // await gmail.users.messages.modify({
    //   userId: 'me',

    //   id: messages[0].id!,

    //   requestBody: {
    //     removeLabelIds: ['UNREAD'],
    //   },
    // });

    console.log(
      `Latest OTP: ${otpMatch[0]}`
    );

    return otpMatch[0];
  }
}