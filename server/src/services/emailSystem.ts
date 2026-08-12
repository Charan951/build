import nodemailer, { Transporter } from 'nodemailer';

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

export interface EmailDispatchOptions {
  to: string;
  subject: string;
  body: string;
  attachmentUrl?: string;
  templateName?: string;
  attachments?: EmailAttachment[];
}

let cachedTransporter: Transporter | null = null;

const getTransporter = (): Transporter => {
  if (cachedTransporter) return cachedTransporter;

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return cachedTransporter;
};

export class EmailSystem {
  public static async sendEmail(options: EmailDispatchOptions): Promise<{ success: boolean; trackingId: string }> {
    const trackingId = `trk_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    try {
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error('[EmailSystem] SMTP is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in the environment.');
        return { success: false, trackingId };
      }

      const transporter = getTransporter();

      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: options.to,
        subject: options.subject,
        html: options.body,
        attachments: options.attachments?.map((a) => ({
          filename: a.filename,
          content: a.content,
          contentType: a.contentType,
        })),
      });

      return { success: true, trackingId };
    } catch (error: any) {
      console.error(`[EmailSystem] Failed to send email to ${options.to}: ${error?.message || error}`);
      return { success: false, trackingId };
    }
  }
}
