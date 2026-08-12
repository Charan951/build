import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Client from '../models/Client';

export const clientLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const client = await Client.findOne({ billingEmail: String(email).toLowerCase().trim() }).select('+passwordHash');
    if (!client || !client.portalAccessEnabled) {
      res.status(401).json({ success: false, message: 'Invalid credentials.' });
      return;
    }

    const isMatch = await client.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials.' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'byt_enterprise_jwt_super_secret_key_2026_x9812';
    const accessToken = jwt.sign(
      { id: client._id, email: client.billingEmail, role: 'client' },
      secret,
      { expiresIn: '7d' }
    );

    client.lastPortalLogin = new Date();
    await client.save();

    res.status(200).json({
      success: true,
      accessToken,
      client: {
        id: client._id,
        companyName: client.companyName,
        email: client.billingEmail,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};
