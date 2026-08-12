import { Request, Response } from 'express';
import { GoogleCalendarService } from '../services/googleCalendarService';

export class GoogleIntegrationController {
  public static async getAuthUrl(req: Request, res: Response) {
    try {
      if (!GoogleCalendarService.isConfigured()) {
        return res.status(400).json({
          success: false,
          message: 'Google OAuth is not configured on the server yet.',
        });
      }
      const url = GoogleCalendarService.getAuthUrl();
      return res.json({ success: true, data: { url } });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async callback(req: Request, res: Response) {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const redirectTo = `${clientUrl}/dashboard/meetings`;
    try {
      const code = req.query.code as string;
      if (!code) {
        return res.redirect(`${redirectTo}?google=error&message=${encodeURIComponent('Missing authorization code.')}`);
      }
      await GoogleCalendarService.handleCallback(code);
      return res.redirect(`${redirectTo}?google=connected`);
    } catch (err: any) {
      return res.redirect(`${redirectTo}?google=error&message=${encodeURIComponent(err.message)}`);
    }
  }

  public static async getStatus(req: Request, res: Response) {
    try {
      const status = await GoogleCalendarService.getStatus();
      return res.json({ success: true, data: { ...status, configured: GoogleCalendarService.isConfigured() } });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async disconnect(req: Request, res: Response) {
    try {
      await GoogleCalendarService.disconnect();
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}
