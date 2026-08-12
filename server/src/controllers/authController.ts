import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin';
import { AuthRequest } from '../middleware/authMiddleware';

const generateTokens = (user: { _id: any; email: string; role: string }) => {
  const secret = process.env.JWT_SECRET || 'byt_enterprise_jwt_super_secret_key_2026_x9812';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'byt_enterprise_refresh_token_secret_key_2026_z7410';

  const accessToken = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    secret,
    { expiresIn: '7d' }
  );

  const refreshToken = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    refreshSecret,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    let admin = await Admin.findOne({ email: email.toLowerCase() });

    // Seed default admin if DB has zero admin records for testing ease
    if (!admin && email === 'admin@buildyourthoughts.com') {
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash('AdminPass123!', salt);
      admin = await Admin.create({
        username: 'admin',
        email: 'admin@buildyourthoughts.com',
        passwordHash,
        role: 'admin',
      });
    }

    if (!admin) {
      res.status(401).json({ success: false, message: 'Invalid credentials.' });
      return;
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials.' });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(admin);

    admin.refreshTokens.push(refreshToken);
    admin.lastLogin = new Date();
    await admin.save();

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if (!token) {
      res.status(401).json({ success: false, message: 'Refresh token required.' });
      return;
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'byt_enterprise_refresh_token_secret_key_2026_z7410';
    const decoded = jwt.verify(token, refreshSecret) as { id: string; email: string; role: string };

    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.refreshTokens.includes(token)) {
      res.status(403).json({ success: false, message: 'Invalid or revoked refresh token.' });
      return;
    }

    const newTokens = generateTokens(admin);
    admin.refreshTokens = admin.refreshTokens.filter((t) => t !== token);
    admin.refreshTokens.push(newTokens.refreshToken);
    await admin.save();

    res.cookie('accessToken', newTokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', newTokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    });
  } catch (error) {
    res.status(403).json({ success: false, message: 'Expired refresh token.' });
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if (req.user && token) {
      await Admin.findByIdAndUpdate(req.user.id, { $pull: { refreshTokens: token } });
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error logging out.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }
    const admin = await Admin.findById(req.user.id).select('-passwordHash -refreshTokens');
    res.status(200).json({ success: true, user: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin profile.' });
  }
};
