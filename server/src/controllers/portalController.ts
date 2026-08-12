import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/rbacGuard';
import Client from '../models/Client';
import ProjectWorkspace from '../models/ProjectWorkspace';
import Invoice from '../models/Invoice';
import Meeting from '../models/Meeting';
import { PdfService } from '../services/pdfService';
import { notifyProjectRoom } from '../services/socketService';

// Trims a project document down to the fields a client is allowed to see -
// internal team payments, expenses, and profit margins never leave the server
// for a client-portal request; task assignee emails and payment history edits
// are similarly stripped as internal-only detail.
const sanitizeProjectForClient = (project: any) => ({
  _id: project._id,
  projectName: project.projectName,
  description: project.description,
  projectType: project.projectType,
  status: project.status,
  budget: project.budget,
  paidAmount: project.paidAmount,
  startDate: project.startDate,
  targetDeliveryDate: project.targetDeliveryDate,
  healthScore: project.healthScore,
  domain: project.domain,
  hosting: project.hosting,
  progressUpdates: project.progressUpdates,
  clientTasks: project.clientTasks,
  milestones: project.milestones,
  tasks: (project.tasks || []).map((t: any) => ({
    _id: t._id,
    title: t.title,
    description: t.description,
    priority: t.priority,
    status: t.status,
    dueDate: t.dueDate,
  })),
  payments: (project.payments || []).map((p: any) => ({
    _id: p._id,
    amount: p.amount,
    method: p.method,
    date: p.date,
    note: p.note,
  })),
  quotations: (project.quotations || []).map((q: any) => ({
    _id: q._id,
    quotationNumber: q.quotationNumber,
    status: q.status,
    projectNameLabel: q.projectNameLabel,
    projectTypeLabel: q.projectTypeLabel,
    projectDuration: q.projectDuration,
    validUntil: q.validUntil,
    costTotal: q.costTotal,
    createdAt: q.createdAt,
  })),
  createdAt: project.createdAt,
});

export const PortalController = {
  async getMe(req: AuthenticatedRequest, res: Response) {
    try {
      const client = await Client.findById(req.user!.id);
      if (!client) return res.status(404).json({ success: false, message: 'Client not found.' });
      return res.json({
        success: true,
        data: { id: client._id, companyName: client.companyName, billingEmail: client.billingEmail },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async getMyProjects(req: AuthenticatedRequest, res: Response) {
    try {
      const projects = await ProjectWorkspace.find({ clientId: req.user!.id }).sort({ createdAt: -1 });
      return res.json({ success: true, data: projects.map(sanitizeProjectForClient) });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async getMyProject(req: AuthenticatedRequest, res: Response) {
    try {
      const project = await ProjectWorkspace.findById(req.params.id);
      if (!project || String(project.clientId) !== req.user!.id) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
      }
      return res.json({ success: true, data: sanitizeProjectForClient(project) });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async addClientTask(req: AuthenticatedRequest, res: Response) {
    try {
      const project = await ProjectWorkspace.findById(req.params.id);
      if (!project || String(project.clientId) !== req.user!.id) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
      }
      if (!req.body.title?.trim()) {
        return res.status(400).json({ success: false, message: 'A title is required.' });
      }
      project.clientTasks.push({ title: req.body.title.trim(), addedBy: 'client' } as any);
      await project.save();
      notifyProjectRoom(String(project._id), 'client_task_changed');
      return res.status(201).json({ success: true, data: sanitizeProjectForClient(project) });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async updateClientTask(req: AuthenticatedRequest, res: Response) {
    try {
      const project = await ProjectWorkspace.findById(req.params.id);
      if (!project || String(project.clientId) !== req.user!.id) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
      }
      const task = project.clientTasks.find((t: any) => t._id?.toString() === req.params.taskId) as any;
      if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

      task.status = req.body.status === 'done' ? 'done' : 'todo';
      await project.save();
      notifyProjectRoom(String(project._id), 'client_task_changed');
      return res.json({ success: true, data: sanitizeProjectForClient(project) });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  async getMyProjectQuotationPdf(req: AuthenticatedRequest, res: Response) {
    try {
      const project = await ProjectWorkspace.findById(req.params.id);
      if (!project || String(project.clientId) !== req.user!.id) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
      }

      const quotation = project.quotations.find((q: any) => q._id?.toString() === req.params.quotationId) as any;
      if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found.' });

      const pdfBuffer = await PdfService.renderProjectQuotationPdf({
        quotation: quotation.toObject ? quotation.toObject() : quotation,
        projectName: project.projectName,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${quotation.quotationNumber}.pdf"`);
      res.removeHeader('X-Frame-Options');
      return res.send(pdfBuffer);
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to render quotation PDF.' });
    }
  },

  async getMyInvoices(req: AuthenticatedRequest, res: Response) {
    try {
      const invoices = await Invoice.find({ clientId: req.user!.id }).sort({ createdAt: -1 });
      return res.json({ success: true, data: invoices });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async getMyInvoicePdf(req: AuthenticatedRequest, res: Response) {
    try {
      const invoice = await Invoice.findById(req.params.invoiceId).populate('clientId', 'companyName billingEmail phone');
      if (!invoice || String((invoice.clientId as any)?._id || invoice.clientId) !== req.user!.id) {
        return res.status(404).json({ success: false, message: 'Invoice not found.' });
      }
      const project = invoice.projectId ? await ProjectWorkspace.findById(invoice.projectId) : null;
      const pdfBuffer = await PdfService.renderInvoicePdf({
        invoice: invoice.toObject(),
        client: invoice.clientId as any,
        projectName: project?.projectName,
      });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${invoice.invoiceNumber}.pdf"`);
      res.removeHeader('X-Frame-Options');
      return res.send(pdfBuffer);
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to render invoice PDF.' });
    }
  },

  async getMyMeetings(req: AuthenticatedRequest, res: Response) {
    try {
      const meetings = await Meeting.find({ clientId: req.user!.id }).sort({ date: 1, time: 1 });
      return res.json({ success: true, data: meetings });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async requestMeeting(req: AuthenticatedRequest, res: Response) {
    try {
      const { title, date, time, description } = req.body;
      if (!title?.trim() || !date || !time) {
        return res.status(400).json({ success: false, message: 'Title, date, and time are required.' });
      }
      const meeting = await Meeting.create({
        title: title.trim(),
        clientId: req.user!.id,
        date,
        time,
        description: description ? `[Requested by client] ${description}` : '[Requested by client]',
      });
      return res.status(201).json({ success: true, data: meeting });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },
};
