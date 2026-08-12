import { Request, Response } from 'express';
import Client from '../models/Client';
import Quotation from '../models/Quotation';
import Invoice from '../models/Invoice';
import ProjectWorkspace from '../models/ProjectWorkspace';
import Meeting from '../models/Meeting';
import { GoogleCalendarService } from '../services/googleCalendarService';
import RBACRole from '../models/RBACPermission';
import Lead from '../models/Lead';
import { QuotationEngine } from '../services/quotationEngine';
import { InvoiceEngine } from '../services/invoiceEngine';
import { EmailSystem } from '../services/emailSystem';
import { PdfService } from '../services/pdfService';
import { ClientAuthService } from '../services/clientAuthService';
import { notifyProjectRoom } from '../services/socketService';

export class CRMController {
  // --- CLIENTS CRUD ---
  public static async getClients(req: Request, res: Response) {
    try {
      const clients = await Client.find().sort({ createdAt: -1 });
      return res.json({ success: true, count: clients.length, data: clients });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async createClient(req: Request, res: Response) {
    try {
      const client = new Client(req.body);
      await client.save();

      // Auto-provision portal login credentials and email them, same as a
      // lead auto-promoted to a client on Won. Never let a delivery failure
      // block client creation itself.
      try {
        await ClientAuthService.provisionAndSendCredentials(client);
      } catch (credErr) {
        console.error('[crmController] Failed to provision client portal credentials:', credErr);
      }

      return res.status(201).json({ success: true, data: client });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async resendClientCredentials(req: Request, res: Response) {
    try {
      const client = await Client.findById(req.params.id);
      if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
      if (!client.billingEmail) {
        return res.status(400).json({ success: false, message: 'This client has no email on file to send credentials to.' });
      }

      const sent = await ClientAuthService.provisionAndSendCredentials(client);
      if (!sent) {
        return res.status(502).json({ success: false, message: 'Failed to send the credentials email. Check SMTP configuration.' });
      }
      return res.json({ success: true, message: 'Portal credentials sent.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async updateClient(req: Request, res: Response) {
    try {
      const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
      return res.json({ success: true, data: client });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async deleteClient(req: Request, res: Response) {
    try {
      const client = await Client.findByIdAndDelete(req.params.id);
      if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
      return res.json({ success: true, message: 'Client deleted successfully' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // --- QUOTATIONS CRUD & ENGINE ---
  public static async getQuotations(req: Request, res: Response) {
    try {
      const quotations = await Quotation.find().populate('clientId', 'companyName billingEmail').sort({ createdAt: -1 });
      return res.json({ success: true, count: quotations.length, data: quotations });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async createQuotation(req: Request, res: Response) {
    try {
      const { clientId, lineItems, discountType, discountValue, taxType, estimatedTimelineDays, terms } = req.body;
      
      const calc = QuotationEngine.calculateQuotation(lineItems || [], discountType, discountValue, taxType);
      
      const count = await Quotation.countDocuments();
      const quoteNum = `Q-2026-${(count + 1).toString().padStart(4, '0')}`;
      const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      const quote = new Quotation({
        quotationNumber: quoteNum,
        clientId,
        lineItems: calc.calculatedItems,
        subtotal: calc.subtotal,
        discountType,
        discountValue,
        discountAmount: calc.discountAmount,
        taxType,
        taxAmount: calc.taxAmount,
        grandTotal: calc.grandTotal,
        estimatedTimelineDays: estimatedTimelineDays || 30,
        terms,
        validUntil,
        version: 'v1.0',
        versionHistory: [{ version: 'v1.0', grandTotal: calc.grandTotal, updatedAt: new Date(), changesNote: 'Initial Quote Draft' }]
      });

      await quote.save();
      return res.status(201).json({ success: true, data: quote });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async approveQuotation(req: Request, res: Response) {
    try {
      const quote = await Quotation.findById(req.params.id);
      if (!quote) return res.status(404).json({ success: false, message: 'Quotation not found' });

      quote.status = 'approved';
      quote.approvedAt = new Date();
      await quote.save();

      // Auto-create Advance Invoice (30% of grandTotal)
      const advanceAmount = Math.round(quote.grandTotal * 0.3 * 100) / 100;
      const invCount = await Invoice.countDocuments();
      const invoiceNumber = InvoiceEngine.generateInvoiceNumber('INV', invCount + 1);

      const invCalc = InvoiceEngine.calculateInvoiceTaxes([
        { description: `Advance Payment for Proposal #${quote.quotationNumber}`, quantity: 1, price: advanceAmount }
      ]);

      const advanceInvoice = new Invoice({
        invoiceNumber,
        clientId: quote.clientId,
        quotationId: quote._id,
        type: 'advance',
        lineItems: invCalc.calculatedItems,
        subtotal: invCalc.subtotal,
        cgst: invCalc.cgst,
        sgst: invCalc.sgst,
        igst: invCalc.igst,
        totalAmount: invCalc.totalAmount,
        balanceDue: invCalc.totalAmount,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
      await advanceInvoice.save();

      return res.json({ success: true, message: 'Quotation approved and Advance Invoice created', data: { quote, advanceInvoice } });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // --- INVOICES & PAYMENTS CRUD ---
  public static async getInvoices(req: Request, res: Response) {
    try {
      const filter: any = {};
      if (req.query.projectId) filter.projectId = req.query.projectId;
      const invoices = await Invoice.find(filter)
        .populate('clientId', 'companyName billingEmail')
        .sort({ createdAt: -1 });
      return res.json({ success: true, count: invoices.length, data: invoices });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async recordPayment(req: Request, res: Response) {
    try {
      const { amount, paymentMode, transactionRef, notes } = req.body;
      const invoice = await Invoice.findById(req.params.id);
      if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

      invoice.payments.push({
        amount,
        paymentMode,
        transactionRef,
        paymentDate: new Date(),
        notes
      });

      invoice.amountPaid += amount;
      invoice.balanceDue = Math.max(0, invoice.totalAmount - invoice.amountPaid);
      if (invoice.balanceDue === 0) {
        invoice.status = 'paid';
      } else {
        invoice.status = 'partially_paid';
      }

      await invoice.save();

      // Update Client revenue & balance ledger
      const client = await Client.findById(invoice.clientId);
      if (client) {
        client.totalRevenue += amount;
        client.outstandingBalance = Math.max(0, client.outstandingBalance - amount);
        await client.save();
      }

      return res.json({ success: true, data: invoice });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  // --- PROJECT WORKSPACE & KANBAN CRUD ---
  public static async getProjects(req: Request, res: Response) {
    try {
      const projects = await ProjectWorkspace.find().populate('clientId', 'companyName').sort({ createdAt: -1 });
      return res.json({ success: true, count: projects.length, data: projects });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async createProject(req: Request, res: Response) {
    try {
      const project = new ProjectWorkspace(req.body);
      await project.save();
      return res.status(201).json({ success: true, data: project });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async updateProject(req: Request, res: Response) {
    try {
      const project = await ProjectWorkspace.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(
        'clientId',
        'companyName'
      );
      if (!project) return res.status(404).json({ success: false, message: 'Project workspace not found' });
      return res.json({ success: true, data: project });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async deleteProject(req: Request, res: Response) {
    try {
      const project = await ProjectWorkspace.findByIdAndDelete(req.params.id);
      if (!project) return res.status(404).json({ success: false, message: 'Project workspace not found' });
      return res.json({ success: true, message: 'Project deleted successfully' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async deleteTask(req: Request, res: Response) {
    try {
      const project = await ProjectWorkspace.findById(req.params.id);
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

      project.tasks = project.tasks.filter((t: any) => t._id?.toString() !== req.params.taskId) as any;
      await project.save();
      return res.json({ success: true, data: project });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async addProgressUpdate(req: Request, res: Response) {
    try {
      const project = await ProjectWorkspace.findById(req.params.id);
      if (!project) return res.status(404).json({ success: false, message: 'Project workspace not found' });

      project.progressUpdates.unshift(req.body);
      await project.save();
      notifyProjectRoom(String(project._id), 'progress_update_changed');
      return res.json({ success: true, data: project });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async addProjectPayment(req: Request, res: Response) {
    try {
      const project = await ProjectWorkspace.findById(req.params.id);
      if (!project) return res.status(404).json({ success: false, message: 'Project workspace not found' });

      project.payments.push(req.body);
      project.paidAmount = project.payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
      await project.save();

      // Every logged payment gets a matching paid invoice automatically, the
      // same way the reference app does it, so there's always a downloadable
      // receipt for money that's already been received.
      const amount = Number(req.body.amount) || 0;
      const client = await Client.findById(project.clientId);
      const existingCount = await Invoice.countDocuments({ projectId: project._id });
      const invoiceNumber = `INV-${project.projectName.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 12)}-${new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '')}-${existingCount + 1}`;

      const paymentTaxPercent = 18;
      const paymentTaxAmount = Math.round(amount * (paymentTaxPercent / 100) * 100) / 100;
      const paymentTotalAmount = Math.round((amount + paymentTaxAmount) * 100) / 100;

      const invoice = await Invoice.create({
        invoiceNumber,
        clientId: project.clientId,
        projectId: project._id,
        type: 'advance',
        lineItems: [
          {
            description: `Payment for ${project.projectName}`,
            quantity: 1,
            price: amount,
            taxPercent: paymentTaxPercent,
            amount,
          },
        ],
        subtotal: amount,
        igst: paymentTaxAmount,
        totalAmount: paymentTotalAmount,
        amountPaid: paymentTotalAmount,
        balanceDue: 0,
        status: 'paid',
        dueDate: new Date(),
        notes: req.body.note ? `${req.body.method || ''} · ${req.body.note}`.trim() : req.body.method || '',
        billToName: client?.companyName,
        billToEmail: client?.billingEmail,
        billToPhone: client?.phone,
      } as any);

      // Link the newly created invoice back onto the payment so the UI can
      // offer a direct "View Invoice" action for it.
      const justAddedPayment = project.payments[project.payments.length - 1] as any;
      justAddedPayment.invoiceId = invoice._id;
      await project.save();

      return res.json({ success: true, data: project });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async updateProjectPayment(req: Request, res: Response) {
    try {
      const project = await ProjectWorkspace.findById(req.params.id);
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

      const payment = project.payments.find((p: any) => p._id?.toString() === req.params.paymentId) as any;
      if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

      // Snapshot the pre-edit values into history before overwriting them.
      payment.history = payment.history || [];
      payment.history.unshift({
        amount: payment.amount,
        method: payment.method,
        note: payment.note,
        editedAt: new Date(),
      });

      const newAmount = req.body.amount !== undefined ? Number(req.body.amount) : payment.amount;
      payment.amount = newAmount;
      if (req.body.method !== undefined) payment.method = req.body.method;
      if (req.body.note !== undefined) payment.note = req.body.note;

      project.paidAmount = project.payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
      await project.save();

      // Keep the auto-generated invoice for this payment in sync so "View
      // Invoice" never shows a stale amount after an edit.
      if (payment.invoiceId) {
        const invoice = await Invoice.findById(payment.invoiceId);
        if (invoice) {
          const taxPercent = 18;
          const taxAmount = Math.round(newAmount * (taxPercent / 100) * 100) / 100;
          const totalAmount = Math.round((newAmount + taxAmount) * 100) / 100;
          invoice.lineItems = [
            {
              description: `Payment for ${project.projectName}`,
              quantity: 1,
              price: newAmount,
              taxPercent,
              amount: newAmount,
            } as any,
          ];
          invoice.subtotal = newAmount;
          invoice.totalAmount = totalAmount;
          invoice.amountPaid = totalAmount;
          invoice.balanceDue = 0;
          invoice.notes = payment.note ? `${payment.method || ''} · ${payment.note}`.trim() : payment.method || '';
          await invoice.save();
        }
      }

      return res.json({ success: true, data: project });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async deleteProjectPayment(req: Request, res: Response) {
    try {
      const project = await ProjectWorkspace.findById(req.params.id);
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

      project.payments = project.payments.filter((p: any) => p._id?.toString() !== req.params.paymentId) as any;
      project.paidAmount = project.payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
      await project.save();
      return res.json({ success: true, data: project });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async addTeamPayment(req: Request, res: Response) {
    try {
      const project = await ProjectWorkspace.findById(req.params.id);
      if (!project) return res.status(404).json({ success: false, message: 'Project workspace not found' });

      project.teamPayments.push(req.body);
      await project.save();
      return res.json({ success: true, data: project });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async deleteTeamPayment(req: Request, res: Response) {
    try {
      const project = await ProjectWorkspace.findById(req.params.id);
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

      project.teamPayments = project.teamPayments.filter(
        (p: any) => p._id?.toString() !== req.params.paymentId
      ) as any;
      await project.save();
      return res.json({ success: true, data: project });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  // --- PROJECT-SCOPED INVOICES (uses the top-level Invoice collection) ---
  public static async createProjectInvoice(req: Request, res: Response) {
    try {
      const project = await ProjectWorkspace.findById(req.params.id);
      if (!project) return res.status(404).json({ success: false, message: 'Project workspace not found' });

      const { lineItems, dueDate, notes, fromName, fromEmail, fromPhone, billToName, billToEmail, billToPhone } =
        req.body;

      const items = (lineItems || []).map((li: any) => ({
        description: li.description || '',
        quantity: li.qty || 1,
        price: li.rate || 0,
        amount: (li.qty || 1) * (li.rate || 0),
      }));
      const subtotal = items.reduce((sum: number, i: any) => sum + i.amount, 0);
      const tax = (lineItems || []).reduce(
        (sum: number, li: any) => sum + (li.qty || 1) * (li.rate || 0) * ((li.taxPercent || 0) / 100),
        0
      );
      const totalAmount = Math.round((subtotal + tax) * 100) / 100;

      const existingCount = await Invoice.countDocuments({ projectId: project._id });
      const invoiceNumber =
        req.body.invoiceNumber ||
        `INV-${project.projectName.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 12)}-${new Date()
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, '')}-${existingCount + 1}`;

      const invoice = await Invoice.create({
        invoiceNumber,
        clientId: project.clientId,
        projectId: project._id,
        type: 'milestone',
        lineItems: items,
        subtotal,
        igst: Math.round(tax * 100) / 100,
        totalAmount,
        amountPaid: 0,
        balanceDue: totalAmount,
        status: 'unpaid',
        dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        notes,
        fromName,
        fromEmail,
        fromPhone,
        billToName,
        billToEmail,
        billToPhone,
      } as any);

      notifyProjectRoom(String(project._id), 'invoice_changed');
      return res.status(201).json({ success: true, data: invoice });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async updateProjectInvoice(req: Request, res: Response) {
    try {
      const invoice = await Invoice.findById(req.params.invoiceId);
      if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

      if (req.body.markPaid) {
        const previousAmountPaid = invoice.amountPaid || 0;
        invoice.status = 'paid';
        invoice.amountPaid = invoice.totalAmount;
        invoice.balanceDue = 0;
        const client = await Client.findById(invoice.clientId);
        if (client) {
          client.totalRevenue += invoice.totalAmount - previousAmountPaid;
          client.outstandingBalance = Math.max(0, client.outstandingBalance - (invoice.totalAmount - previousAmountPaid));
          await client.save();
        }
      } else if (req.body.markDue) {
        const previousAmountPaid = invoice.amountPaid || 0;
        invoice.status = 'unpaid';
        invoice.amountPaid = 0;
        invoice.balanceDue = invoice.totalAmount;
        const client = await Client.findById(invoice.clientId);
        if (client && previousAmountPaid > 0) {
          client.totalRevenue = Math.max(0, client.totalRevenue - previousAmountPaid);
          client.outstandingBalance += previousAmountPaid;
          await client.save();
        }
      } else {
        const { lineItems, invoiceNumber, dueDate, notes, fromName, fromEmail, fromPhone, billToName, billToEmail, billToPhone } =
          req.body;

        if (lineItems) {
          const items = lineItems.map((li: any) => ({
            description: li.description || '',
            quantity: li.qty || 1,
            price: li.rate || 0,
            amount: (li.qty || 1) * (li.rate || 0),
          }));
          const subtotal = items.reduce((sum: number, i: any) => sum + i.amount, 0);
          const tax = lineItems.reduce(
            (sum: number, li: any) => sum + (li.qty || 1) * (li.rate || 0) * ((li.taxPercent || 0) / 100),
            0
          );
          invoice.lineItems = items;
          invoice.subtotal = subtotal;
          invoice.igst = Math.round(tax * 100) / 100;
          invoice.totalAmount = Math.round((subtotal + tax) * 100) / 100;
          invoice.balanceDue = invoice.status === 'paid' ? 0 : invoice.totalAmount;
        }
        if (invoiceNumber !== undefined) invoice.invoiceNumber = invoiceNumber;
        if (dueDate !== undefined) invoice.dueDate = dueDate;
        if (notes !== undefined) invoice.notes = notes;
        if (fromName !== undefined) invoice.fromName = fromName;
        if (fromEmail !== undefined) invoice.fromEmail = fromEmail;
        if (fromPhone !== undefined) invoice.fromPhone = fromPhone;
        if (billToName !== undefined) invoice.billToName = billToName;
        if (billToEmail !== undefined) invoice.billToEmail = billToEmail;
        if (billToPhone !== undefined) invoice.billToPhone = billToPhone;
      }

      await invoice.save();
      if (invoice.projectId) notifyProjectRoom(String(invoice.projectId), 'invoice_changed');
      return res.json({ success: true, data: invoice });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async deleteProjectInvoice(req: Request, res: Response) {
    try {
      const invoice = await Invoice.findByIdAndDelete(req.params.invoiceId);
      if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
      return res.json({ success: true, message: 'Invoice deleted successfully' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getInvoicePdf(req: Request, res: Response) {
    try {
      const invoice = await Invoice.findById(req.params.invoiceId).populate('clientId', 'companyName billingEmail phone');
      if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

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
      return res.status(500).json({ success: false, error: err.message || 'Failed to render invoice PDF.' });
    }
  }

  public static async createProjectQuotation(req: Request, res: Response) {
    try {
      const project = await ProjectWorkspace.findById(req.params.id).populate('clientId', 'companyName billingEmail');
      if (!project) return res.status(404).json({ success: false, message: 'Project workspace not found' });

      const client = project.clientId as any;
      const quotationNumber = `Q-${Date.now().toString().slice(-8)}`;

      project.quotations.push({
        quotationNumber,
        clientName: client?.companyName || '',
        clientEmail: client?.billingEmail || '',
        ...req.body,
      } as any);
      await project.save();
      const created = project.quotations[project.quotations.length - 1];
      return res.status(201).json({ success: true, data: created });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async getProjectQuotation(req: Request, res: Response) {
    try {
      const project = await ProjectWorkspace.findById(req.params.id);
      if (!project) return res.status(404).json({ success: false, message: 'Project workspace not found' });

      const quotation = project.quotations.find((q: any) => q._id?.toString() === req.params.quotationId) as any;
      if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found' });

      return res.json({ success: true, data: quotation, project: { _id: project._id, projectName: project.projectName } });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async updateProjectQuotation(req: Request, res: Response) {
    try {
      const project = await ProjectWorkspace.findById(req.params.id);
      if (!project) return res.status(404).json({ success: false, message: 'Project workspace not found' });

      const quotation = project.quotations.find((q: any) => q._id?.toString() === req.params.quotationId) as any;
      if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found' });

      Object.assign(quotation, req.body);
      await project.save();
      return res.json({ success: true, data: quotation });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async deleteProjectQuotation(req: Request, res: Response) {
    try {
      const project = await ProjectWorkspace.findById(req.params.id);
      if (!project) return res.status(404).json({ success: false, message: 'Project workspace not found' });

      project.quotations = project.quotations.filter(
        (q: any) => q._id?.toString() !== req.params.quotationId
      ) as any;
      await project.save();
      return res.json({ success: true, data: project });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async getProjectQuotationPdf(req: Request, res: Response) {
    try {
      const project = await ProjectWorkspace.findById(req.params.id);
      if (!project) return res.status(404).json({ success: false, message: 'Project workspace not found' });

      const quotation = project.quotations.find((q: any) => q._id?.toString() === req.params.quotationId) as any;
      if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found' });

      const pdfBuffer = await PdfService.renderProjectQuotationPdf({
        quotation: quotation.toObject ? quotation.toObject() : quotation,
        projectName: project.projectName,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${quotation.quotationNumber}.pdf"`);
      res.removeHeader('X-Frame-Options');
      return res.send(pdfBuffer);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Failed to render quotation PDF.' });
    }
  }

  public static async addTeamMember(req: Request, res: Response) {
    try {
      const project = await ProjectWorkspace.findById(req.params.id);
      if (!project) return res.status(404).json({ success: false, message: 'Project workspace not found' });

      project.teamMembers.push(req.body);
      await project.save();
      return res.json({ success: true, data: project });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async removeTeamMember(req: Request, res: Response) {
    try {
      const project = await ProjectWorkspace.findById(req.params.id);
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

      project.teamMembers = project.teamMembers.filter(
        (m: any) => m._id?.toString() !== req.params.memberId
      ) as any;
      await project.save();
      return res.json({ success: true, data: project });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  // --- CLIENT TO-DO LIST (visible in both the admin project view and the
  // client portal — unlike `tasks`, which stays internal-only) ---
  public static async addClientTask(req: Request, res: Response) {
    try {
      const project = await ProjectWorkspace.findById(req.params.id);
      if (!project) return res.status(404).json({ success: false, message: 'Project workspace not found' });

      project.clientTasks.push({ title: req.body.title, addedBy: 'admin' } as any);
      await project.save();
      notifyProjectRoom(String(project._id), 'client_task_changed');
      return res.json({ success: true, data: project });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async updateClientTask(req: Request, res: Response) {
    try {
      const project = await ProjectWorkspace.findById(req.params.id);
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

      const task = project.clientTasks.find((t: any) => t._id?.toString() === req.params.taskId) as any;
      if (!task) return res.status(404).json({ success: false, message: 'Client task not found' });

      task.status = req.body.status;
      await project.save();
      notifyProjectRoom(String(project._id), 'client_task_changed');
      return res.json({ success: true, data: project });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async deleteClientTask(req: Request, res: Response) {
    try {
      const project = await ProjectWorkspace.findById(req.params.id);
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

      project.clientTasks = project.clientTasks.filter(
        (t: any) => t._id?.toString() !== req.params.taskId
      ) as any;
      await project.save();
      notifyProjectRoom(String(project._id), 'client_task_changed');
      return res.json({ success: true, data: project });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async addTask(req: Request, res: Response) {
    try {
      const project = await ProjectWorkspace.findById(req.params.id);
      if (!project) return res.status(404).json({ success: false, message: 'Project workspace not found' });

      project.tasks.push(req.body);
      await project.save();
      return res.json({ success: true, data: project });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async updateTaskStatus(req: Request, res: Response) {
    try {
      const { taskId, status } = req.body;
      const project = await ProjectWorkspace.findById(req.params.id);
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

      const task = project.tasks.find((t: any) => t._id?.toString() === taskId);
      if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

      task.status = status;
      await project.save();
      return res.json({ success: true, data: project });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  // --- FINANCIAL & CONVERSION ANALYTICS ---
  public static async getAnalytics(req: Request, res: Response) {
    try {
      const totalClients = await Client.countDocuments();
      const totalInvoices = await Invoice.countDocuments();
      const paidInvoices = await Invoice.find({ status: 'paid' });
      const totalRevenue = paidInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);

      const pendingInvoices = await Invoice.find({ status: { $in: ['unpaid', 'partially_paid'] } });
      const outstandingBalance = pendingInvoices.reduce((acc, inv) => acc + inv.balanceDue, 0);

      const activeProjects = await ProjectWorkspace.countDocuments({ status: 'in_progress' });
      const totalQuotations = await Quotation.countDocuments();

      return res.json({
        success: true,
        data: {
          totalClients,
          totalInvoices,
          totalRevenue,
          outstandingBalance,
          activeProjects,
          totalQuotations
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // --- MEETINGS CRUD ---
  public static async getMeetings(req: Request, res: Response) {
    try {
      const filter: any = {};
      if (req.query.clientId) filter.clientId = req.query.clientId;
      const meetings = await Meeting.find(filter).populate('clientId', 'companyName').sort({ date: 1, time: 1 });
      return res.json({ success: true, count: meetings.length, data: meetings });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async createMeeting(req: Request, res: Response) {
    try {
      const { addGoogleMeet, ...meetingData } = req.body;

      if (addGoogleMeet) {
        const { meetLink, eventId } = await GoogleCalendarService.createMeetEvent({
          title: meetingData.title,
          description: meetingData.description,
          date: meetingData.date,
          time: meetingData.time,
          durationMinutes: meetingData.durationMinutes || 60,
          attendees: meetingData.attendees || [],
        });
        meetingData.meetingLink = meetLink;
        meetingData.googleEventId = eventId;
      }

      const meeting = new Meeting(meetingData);
      await meeting.save();
      await meeting.populate('clientId', 'companyName');
      return res.status(201).json({ success: true, data: meeting });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async updateMeeting(req: Request, res: Response) {
    try {
      const meeting = await Meeting.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(
        'clientId',
        'companyName'
      );
      if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });
      return res.json({ success: true, data: meeting });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async deleteMeeting(req: Request, res: Response) {
    try {
      const meeting = await Meeting.findByIdAndDelete(req.params.id);
      if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });
      if (meeting.googleEventId) {
        await GoogleCalendarService.deleteEvent(meeting.googleEventId);
      }
      return res.json({ success: true, data: meeting });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}
