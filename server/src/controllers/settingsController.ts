import { Request, Response } from 'express';
import Settings from '../models/Settings';

const DEFAULT_SETTINGS = {
  address: 'Kota, Rajasthan, India',
  phone: '+91 98765 43210',
  email: 'hello@buildyourthoughts.com',
  githubUrl: 'https://github.com',
  twitterUrl: 'https://twitter.com',
  linkedinUrl: 'https://linkedin.com',
  instagramUrl: 'https://instagram.com',
  facebookUrl: 'https://facebook.com',
};

export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(DEFAULT_SETTINGS);
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    // If DB is offline or empty, return default settings gracefully
    res.status(200).json({ success: true, data: DEFAULT_SETTINGS });
  }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { address, phone, email, githubUrl, twitterUrl, linkedinUrl, instagramUrl, facebookUrl } = req.body;
    let settings = await Settings.findOne();
    
    if (settings) {
      if (address !== undefined) settings.address = address;
      if (phone !== undefined) settings.phone = phone;
      if (email !== undefined) settings.email = email;
      if (githubUrl !== undefined) settings.githubUrl = githubUrl;
      if (twitterUrl !== undefined) settings.twitterUrl = twitterUrl;
      if (linkedinUrl !== undefined) settings.linkedinUrl = linkedinUrl;
      if (instagramUrl !== undefined) settings.instagramUrl = instagramUrl;
      if (facebookUrl !== undefined) settings.facebookUrl = facebookUrl;
      await settings.save();
    } else {
      settings = await Settings.create({
        address: address || DEFAULT_SETTINGS.address,
        phone: phone || DEFAULT_SETTINGS.phone,
        email: email || DEFAULT_SETTINGS.email,
        githubUrl: githubUrl || DEFAULT_SETTINGS.githubUrl,
        twitterUrl: twitterUrl || DEFAULT_SETTINGS.twitterUrl,
        linkedinUrl: linkedinUrl || DEFAULT_SETTINGS.linkedinUrl,
        instagramUrl: instagramUrl || DEFAULT_SETTINGS.instagramUrl,
        facebookUrl: facebookUrl || DEFAULT_SETTINGS.facebookUrl,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Company settings updated successfully.',
      data: settings,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update company settings.',
    });
  }
};
