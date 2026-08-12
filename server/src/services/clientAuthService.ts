import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { IClient } from '../models/Client';
import { EmailSystem } from './emailSystem';

const generateReadablePassword = (): string => {
  // Avoid visually-ambiguous characters (0/O, 1/l/I) since this gets typed by hand.
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let pass = '';
  const bytes = crypto.randomBytes(12);
  for (let i = 0; i < 12; i++) pass += alphabet[bytes[i] % alphabet.length];
  return pass;
};

export const ClientAuthService = {
  /**
   * Generates a fresh password for a client, hashes and stores it, and emails
   * the plaintext (once) along with the portal login URL. No-ops (returns
   * false) if the client has no billing email to send it to.
   */
  async provisionAndSendCredentials(client: IClient): Promise<boolean> {
    if (!client.billingEmail) return false;

    const plainPassword = generateReadablePassword();
    const salt = await bcrypt.genSalt(12);
    client.passwordHash = await bcrypt.hash(plainPassword, salt);
    client.portalAccessEnabled = true;
    await client.save();

    const loginUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/portal/login`;

    const result = await EmailSystem.sendEmail({
      to: client.billingEmail,
      subject: `Your Client Portal access — ${client.companyName}`,
      body: `
        <p>Hello,</p>
        <p>A client portal account has been created for <strong>${client.companyName}</strong>. You can use it to track project progress, invoices, payments, and communicate directly with our team.</p>
        <p>
          <strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a><br/>
          <strong>Email:</strong> ${client.billingEmail}<br/>
          <strong>Temporary Password:</strong> ${plainPassword}
        </p>
        <p>For security, please log in and note this password somewhere safe — it will not be shown again. If you ever lose it, ask your account manager to resend it.</p>
        <p>Regards,<br/>Build Your Thoughts</p>
      `,
    });

    return result.success;
  },
};
