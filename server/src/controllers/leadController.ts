import { Request, Response } from 'express';
import Lead from '../models/Lead';

export const createLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const lead = await Lead.create({
      ...req.body,
      ipAddress: req.ip || req.socket.remoteAddress,
    });
    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! Our engineering team will contact you within 24 hours.',
      data: { id: lead._id },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to submit project inquiry.' });
  }
};

export const getLeads = async (req: Request, res: Response): Promise<void> => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: leads.length, data: leads });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve leads.' });
  }
};

export const updateLeadStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const lead = await Lead.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found.' });
      return;
    }
    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update lead status.' });
  }
};

export const deleteLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Lead successfully deleted.' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to delete lead.' });
  }
};
