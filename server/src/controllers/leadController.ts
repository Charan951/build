import { Request, Response } from 'express';
import Lead from '../models/Lead';
import Client from '../models/Client';
import { notifyAdmins } from '../services/socketService';
import { ClientAuthService } from '../services/clientAuthService';

// When a lead's stage flips to "Won", promote it into a Client record automatically
// so the sales team doesn't have to re-enter the same company/contact details by hand.
const promoteLeadToClientIfWon = async (lead: any): Promise<void> => {
  if (lead.status?.toLowerCase() !== 'won') return;
  if (!lead.email) return; // Client.billingEmail is required - nothing to promote with.

  const existing = await Client.findOne({ $or: [{ sourceLeadId: lead._id }, { billingEmail: lead.email }] });
  if (existing) return;

  try {
    const client = await Client.create({
      sourceLeadId: lead._id,
      companyName: lead.company || lead.name || 'New Client',
      billingEmail: lead.email,
      phone: lead.phone || '',
      totalRevenue: lead.estimatedValue || 0,
      status: 'active',
    });
    await ClientAuthService.provisionAndSendCredentials(client);
  } catch (err) {
    console.error('[leadController] Failed to auto-create client from won lead:', err);
  }
};

// Shared by the public contact-form handler below and by external ingestion
// paths (e.g. the Meta Lead Ads webhook) so every lead - regardless of origin -
// gets the same document shape and the same live admin notification.
export const createLeadInternal = async (data: Record<string, any>) => {
  const lead = await Lead.create(data);

  notifyAdmins('new_lead_received', {
    id: lead._id,
    name: lead.name,
    email: lead.email,
    projectType: lead.projectType,
    budgetRange: lead.budgetRange,
    source: lead.source,
    createdAt: lead.createdAt,
  });

  return lead;
};

export const createLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const lead = await createLeadInternal({
      ...req.body,
      ipAddress: req.ip || req.socket.remoteAddress,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! Our engineering team will contact you within 24 hours.',
      data: lead,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to submit project inquiry.' });
  }
};

export const importLeads = async (req: Request, res: Response): Promise<void> => {
  try {
    const { leads: leadsToImport } = req.body;
    if (!Array.isArray(leadsToImport) || leadsToImport.length === 0) {
      res.status(400).json({ success: false, message: 'No leads provided for import.' });
      return;
    }

    const createdLeads = await Lead.insertMany(
      leadsToImport.map((item: any) => ({
        name: item.Name || item.name || 'Unnamed Prospect',
        company: item.Company || item.company || '',
        email: item.Email || item.email || '',
        phone: item.Phone || item.phone || '',
        status: item.Stage || item.stage || item.status || 'New',
        source: item.Source || item.source || 'Other',
        estimatedValue: parseFloat(item['Estimated Value'] || item.estimatedValue || item.Value) || 0,
        followUpDate: item['Follow-up Date'] || item.followUpDate || '',
        assignedTo: item['Assigned To'] || item.assignedTo || 'Unassigned',
        notes: item.Notes || item.notes || '',
        wonAt: item['Won At'] || item.wonAt || null,
        convertedAt: item['Converted At'] || item.convertedAt || null,
        lostReason: item['Lost Reason'] || item.lostReason || '',
        createdAt: item['Created At'] || item.createdAt || new Date(),
      }))
    );

    res.status(201).json({
      success: true,
      message: `Successfully imported ${createdLeads.length} leads.`,
      count: createdLeads.length,
      data: createdLeads,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to import leads.' });
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
    const { status, stageId, estimatedValue, followUpDate, followUpTime, notes, source, assignedTo, company, phone, email, name, wonAt, convertedAt, lostReason } = req.body;
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (stageId !== undefined) updateData.stageId = stageId;
    if (estimatedValue !== undefined) updateData.estimatedValue = estimatedValue;
    if (followUpDate !== undefined) updateData.followUpDate = followUpDate;
    if (followUpTime !== undefined) updateData.followUpTime = followUpTime;
    if (notes !== undefined) updateData.notes = notes;
    if (source !== undefined) updateData.source = source;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (company !== undefined) updateData.company = company;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (name !== undefined) updateData.name = name;
    if (wonAt !== undefined) updateData.wonAt = wonAt;
    if (convertedAt !== undefined) updateData.convertedAt = convertedAt;
    if (lostReason !== undefined) updateData.lostReason = lostReason;

    const lead = await Lead.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found.' });
      return;
    }

    await promoteLeadToClientIfWon(lead);

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

export const getPipelineStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const allLeads = await Lead.find();

    const openLeads = allLeads.filter(
      (l) => l.status?.toLowerCase() !== 'won' && l.status?.toLowerCase() !== 'lost'
    );
    const openCount = openLeads.length;

    const pipelineValue = openLeads.reduce((acc, l) => acc + (l.estimatedValue || 0), 0);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const wonThisMonth = allLeads.filter(
      (l) =>
        l.status?.toLowerCase() === 'won' &&
        l.updatedAt &&
        new Date(l.updatedAt) >= startOfMonth
    );
    const wonMonthlyValue = wonThisMonth.reduce((acc, l) => acc + (l.estimatedValue || 0), 0);

    const closedWon = allLeads.filter((l) => l.status?.toLowerCase() === 'won').length;
    const closedLost = allLeads.filter((l) => l.status?.toLowerCase() === 'lost').length;
    const totalClosed = closedWon + closedLost;
    const winRate = totalClosed > 0 ? Math.round((closedWon / totalClosed) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        openCount,
        pipelineValue,
        wonMonthlyValue,
        winRate,
        totalLeads: allLeads.length
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
