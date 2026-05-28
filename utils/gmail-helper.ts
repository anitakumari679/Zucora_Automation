import { google, gmail_v1 } from 'googleapis';
import { TestData } from '../config/test-data';

export type GetLatestOtpOptions = {
  /** Only accept emails received at or after this time (ms since epoch). Set just before calling login. */
  requestedAfterMs: number;
  /** Filter OTP emails sent to this inbox (optional). */
  recipientEmail?: string;
  /** Max wait time for the OTP email. */
  timeoutMs?: number;
  /** Delay between Gmail polls. */
  pollIntervalMs?: number;
};

export type GetLatestPasswordResetLinkOptions = {
  /** Only accept emails received at or after this time (ms since epoch). Set just before requesting reset. */
  requestedAfterMs: number;
  /** Filter password reset emails sent to this inbox (optional). */
  recipientEmail?: string;
  /** Max wait time for the password reset email. */
  timeoutMs?: number;
  /** Delay between Gmail polls. */
  pollIntervalMs?: number;
};  

export class GmailHelper {
  private static async getGmailClient() {
    if (
      !TestData.gmail.clientId ||
      !TestData.gmail.clientSecret ||
      !TestData.gmail.refreshTokken
    ) {
      throw new Error(
        'Missing Gmail OAuth env vars. Set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN in config/.env'
      );
    }

    const oAuth2Client = new google.auth.OAuth2(
      TestData.gmail.clientId,
      TestData.gmail.clientSecret
    );

    oAuth2Client.setCredentials({
      refresh_token: TestData.gmail.refreshTokken,
    });

    return google.gmail({ version: 'v1', auth: oAuth2Client });
  }

  /** Recursively collect text/plain and text/html bodies from nested MIME parts. */
  private static extractBodies(
    payload?: gmail_v1.Schema$MessagePart
  ): string[] {
    if (!payload) return [];

    const bodies: string[] = [];

    if (payload.body?.data) {
      bodies.push(
        Buffer.from(payload.body.data, 'base64').toString('utf-8')
      );
    }

    for (const part of payload.parts ?? []) {
      bodies.push(...this.extractBodies(part));
    }

    return bodies;
  }

  private static extractOtpFromMessage(
    message: gmail_v1.Schema$Message
  ): string | null {
    const bodies = this.extractBodies(message.payload);
    const combined = bodies.join('\n');

    // Prefer OTP shown in the verification block (Zucora template)
    const labeledMatch = combined.match(
      /one time code:\s*(\d{6})/i
    );
    if (labeledMatch) return labeledMatch[1];

    const matches = combined.match(/\b\d{6}\b/g) ?? [];
    if (!matches.length) return null;

    // Last 6-digit token is usually the OTP in HTML templates
    return matches[matches.length - 1];
  }

private static decodeHtmlEntities(value: string): string {
    return value
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }

  private static extractPasswordResetLinkFromMessage(
    message: gmail_v1.Schema$Message
  ): string | null {
    const bodies = this.extractBodies(message.payload);
    const combined = bodies.join('\n');

    const resetButtonMatch = combined.match(
      /href=["']([^"']+)["'][^>]*>\s*Reset My Password\s*</i
    );
    if (resetButtonMatch) {
      return this.decodeHtmlEntities(resetButtonMatch[1]);
    }

    const resetUrlMatch = combined.match(
      /https?:\/\/[^\s"'<>]+(?:reset|password)[^\s"'<>]*/i
    );
    if (resetUrlMatch) {
      return this.decodeHtmlEntities(resetUrlMatch[0]);
    }

    const fallbackUrlMatch = combined.match(/https?:\/\/[^\s"'<>]+/i);
    if (fallbackUrlMatch) {
      return this.decodeHtmlEntities(fallbackUrlMatch[0]);
    }

    return null;
  }

  private static async markAsRead(
    gmail: gmail_v1.Gmail,
    messageId: string
  ): Promise<void> {
    try {
      await gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: { removeLabelIds: ['UNREAD'] },
      });
    } catch {
      // Non-fatal: read-only Gmail scope still allows fetching OTP
    }
  }

  /**
   * Poll Gmail until the OTP email for the current login attempt arrives.
   * Pass `requestedAfterMs` immediately before calling the login API.
   */
  static async getLatestOtp(
    options: GetLatestOtpOptions
  ): Promise<string> {
    const {
      requestedAfterMs,
      recipientEmail,
      timeoutMs = 60_000,
      pollIntervalMs = 3_000,
    } = options;

    const gmail = await this.getGmailClient();
    const deadline = Date.now() + timeoutMs;
    let lastError = 'No OTP email found';

    while (Date.now() < deadline) {
      const queryParts = ['subject:"Login OTP"', 'newer_than:15m'];
      if (recipientEmail) {
        queryParts.push(`to:${recipientEmail}`);
      }

      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 10,
        q: queryParts.join(' '),
      });

      const messages = response.data.messages ?? [];

      const fullMessages: Array<{
        id: string;
        internalDate: number;
        message: gmail_v1.Schema$Message;
      }> = [];

      for (const msg of messages) {
        if (!msg.id) continue;

        const full = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'full',
        });

        const internalDate = Number(full.data.internalDate ?? 0);
        // Only emails that arrived after this login attempt (2s buffer for clock skew)
        if (internalDate < requestedAfterMs - 2_000) continue;

        fullMessages.push({
          id: msg.id,
          internalDate,
          message: full.data,
        });
      }

      // Newest matching email first
      fullMessages.sort((a, b) => b.internalDate - a.internalDate);

      for (const { id, message } of fullMessages) {
        const otp = this.extractOtpFromMessage(message);
        if (!otp) continue;

        await this.markAsRead(gmail, id);
        return otp;
      }

      lastError = `No OTP email after ${new Date(requestedAfterMs).toISOString()} (retrying…)`;
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }

    throw new Error(
      `${lastError}. Check Gmail inbox access and that OTP emails go to the account linked to GMAIL_REFRESH_TOKEN.`
    );
  }

   /**
   * Poll Gmail until the latest password reset email arrives, then return its reset link.
   * Pass `requestedAfterMs` immediately before calling the forgot-password API.
   */
  static async getLatestPasswordResetLink(
    options: GetLatestPasswordResetLinkOptions
  ): Promise<string> {
    const {
      requestedAfterMs,
      recipientEmail,
      timeoutMs = 60_000,
      pollIntervalMs = 3_000,
    } = options;

    const gmail = await this.getGmailClient();
    const deadline = Date.now() + timeoutMs;
    let lastError = 'No password reset email found';

    while (Date.now() < deadline) {
      const queryParts = ['subject:"Reset your password"', 'newer_than:15m'];
      if (recipientEmail) {
        queryParts.push(`to:${recipientEmail}`);
      }

      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 10,
        q: queryParts.join(' '),
      });

      const messages = response.data.messages ?? [];

      const fullMessages: Array<{
        id: string;
        internalDate: number;
        message: gmail_v1.Schema$Message;
      }> = [];

      for (const msg of messages) {
        if (!msg.id) continue;

        const full = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'full',
        });

        const internalDate = Number(full.data.internalDate ?? 0);
        if (internalDate < requestedAfterMs - 2_000) continue;

        fullMessages.push({
          id: msg.id,
          internalDate,
          message: full.data,
        });
      }

      fullMessages.sort((a, b) => b.internalDate - a.internalDate);

      for (const { id, message } of fullMessages) {
        const resetLink = this.extractPasswordResetLinkFromMessage(message);
        if (!resetLink) continue;

        await this.markAsRead(gmail, id);
        return resetLink;
      }

      lastError = `No password reset email after ${new Date(
        requestedAfterMs
      ).toISOString()} (retrying...)`;
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }

    throw new Error(
      `${lastError}. Check Gmail inbox access and that password reset emails go to the account linked to GMAIL_REFRESH_TOKEN.`
    );
  }
}
