import { google } from 'googleapis';
import GoogleIntegration from '../models/GoogleIntegration';

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.email',
];

const getOAuthClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `http://localhost:${process.env.PORT || 5000}/api/v1/integrations/google/callback`;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

export class GoogleCalendarService {
  static isConfigured(): boolean {
    return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  }

  static getAuthUrl(): string {
    const oauth2Client = getOAuthClient();
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent', // forces a refresh_token on every re-connect
      scope: SCOPES,
    });
  }

  static async handleCallback(code: string): Promise<{ email?: string }> {
    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      throw new Error(
        'Google did not return a refresh token. Disconnect access at myaccount.google.com/permissions and try connecting again.'
      );
    }

    oauth2Client.setCredentials(tokens);
    let email: string | undefined;
    try {
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const { data } = await oauth2.userinfo.get();
      email = data.email || undefined;
    } catch {
      // Non-fatal — connection still works without a stored email label.
    }

    await GoogleIntegration.deleteMany({});
    await GoogleIntegration.create({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date || Date.now() + 3600_000,
      connectedEmail: email,
      scope: tokens.scope,
    });

    return { email };
  }

  static async getStatus(): Promise<{ connected: boolean; email?: string }> {
    const record = await GoogleIntegration.findOne();
    if (!record) return { connected: false };
    return { connected: true, email: record.connectedEmail };
  }

  static async disconnect(): Promise<void> {
    await GoogleIntegration.deleteMany({});
  }

  private static async getAuthorizedClient() {
    const record = await GoogleIntegration.findOne();
    if (!record) throw new Error('Google Calendar is not connected.');

    const oauth2Client = getOAuthClient();
    oauth2Client.setCredentials({
      access_token: record.accessToken,
      refresh_token: record.refreshToken,
      expiry_date: record.expiryDate,
    });

    oauth2Client.on('tokens', async (tokens) => {
      const update: any = {};
      if (tokens.access_token) update.accessToken = tokens.access_token;
      if (tokens.expiry_date) update.expiryDate = tokens.expiry_date;
      if (Object.keys(update).length) {
        await GoogleIntegration.updateOne({ _id: record._id }, { $set: update });
      }
    });

    return oauth2Client;
  }

  /**
   * Creates a calendar event with an auto-generated Google Meet link and
   * returns the hangout link + event id (so the caller can store/delete it later).
   */
  static async createMeetEvent(params: {
    title: string;
    description?: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    durationMinutes: number;
    attendees: string[];
  }): Promise<{ meetLink: string; eventId: string }> {
    const auth = await this.getAuthorizedClient();
    const calendar = google.calendar({ version: 'v3', auth });

    const startDateTime = new Date(`${params.date}T${params.time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + params.durationMinutes * 60000);

    const { data } = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      sendUpdates: 'all', // emails every attendee a calendar invite with the Meet link
      requestBody: {
        summary: params.title,
        description: params.description,
        start: { dateTime: startDateTime.toISOString() },
        end: { dateTime: endDateTime.toISOString() },
        attendees: params.attendees.map((email) => ({ email })),
        conferenceData: {
          createRequest: {
            requestId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
    });

    const meetLink = data.hangoutLink;
    if (!meetLink || !data.id) {
      throw new Error('Google did not return a Meet link for this event.');
    }

    return { meetLink, eventId: data.id };
  }

  static async deleteEvent(eventId: string): Promise<void> {
    try {
      const auth = await this.getAuthorizedClient();
      const calendar = google.calendar({ version: 'v3', auth });
      await calendar.events.delete({ calendarId: 'primary', eventId, sendUpdates: 'all' });
    } catch {
      // Best-effort cleanup — don't block meeting deletion if the calendar event is already gone.
    }
  }
}
