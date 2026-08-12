import { Request, Response } from 'express';
import ProposalProject from '../models/ProposalProject';
import ProposalTemplate from '../models/ProposalTemplate';
import LeadProposal from '../models/LeadProposal';
import Lead from '../models/Lead';
import { AIContentService } from '../services/aiContentService';
import { PdfService } from '../services/pdfService';
import { EmailSystem } from '../services/emailSystem';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export class ProposalController {
  // Uploaded PDFs are stored directly in MongoDB (fileData) rather than Cloudinary:
  // this account's Cloudinary security settings block CDN delivery of raw PDF/ZIP
  // files even when signed/authenticated, so serving the bytes ourselves is the only
  // reliable option and keeps everything on our own domain (no cross-origin framing
  // issues either).
  private static sendStoredPdf(buffer: Buffer | undefined, title: string, res: Response) {
    if (!buffer) {
      return res.status(404).json({ success: false, message: 'No uploaded file found.' });
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${title.replace(/[^a-z0-9]/gi, '_')}.pdf"`);
    // helmet sets X-Frame-Options: SAMEORIGIN globally, which blocks this response from
    // being embedded in the admin app's <iframe> viewer (different port in dev = different
    // origin). This route is only ever loaded in our own trusted iframe.
    res.removeHeader('X-Frame-Options');
    return res.send(buffer);
  }

  // --- PROPOSAL PROJECTS CRUD ---
  public static async getProjects(req: Request, res: Response) {
    try {
      const projects = await ProposalProject.find().sort({ createdAt: -1 });
      return res.json({ success: true, count: projects.length, data: projects });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async createProject(req: Request, res: Response) {
    try {
      const project = await ProposalProject.create(req.body);
      return res.status(201).json({ success: true, data: project });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async updateProject(req: Request, res: Response) {
    try {
      const project = await ProposalProject.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!project) return res.status(404).json({ success: false, message: 'Proposal project not found.' });
      return res.json({ success: true, data: project });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async deleteProject(req: Request, res: Response) {
    try {
      const project = await ProposalProject.findByIdAndDelete(req.params.id);
      if (!project) return res.status(404).json({ success: false, message: 'Proposal project not found.' });
      await ProposalTemplate.deleteMany({ proposalProjectId: req.params.id });
      return res.json({ success: true, message: 'Proposal project deleted successfully.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // --- PROPOSAL TEMPLATES CRUD ---
  public static async getTemplates(req: Request, res: Response) {
    try {
      const filter: any = {};
      if (req.query.proposalProjectId) filter.proposalProjectId = req.query.proposalProjectId;
      const templates = await ProposalTemplate.find(filter).sort({ createdAt: -1 });
      return res.json({ success: true, count: templates.length, data: templates });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async getTemplateById(req: Request, res: Response) {
    try {
      const template = await ProposalTemplate.findById(req.params.id);
      if (!template) return res.status(404).json({ success: false, message: 'Proposal template not found.' });
      return res.json({ success: true, data: template });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async createTemplate(req: Request, res: Response) {
    try {
      const template = await ProposalTemplate.create({ ...req.body, kind: 'generated' });
      return res.status(201).json({ success: true, data: template });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // Upload a ready-made PDF as a template — no content generation needed, the
  // uploaded file is sent to leads as-is.
  public static async uploadTemplate(req: MulterRequest, res: Response) {
    try {
      const { proposalProjectId, title, type } = req.body;
      if (!proposalProjectId || !title) {
        return res.status(400).json({ success: false, message: 'proposalProjectId and title are required.' });
      }
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'A PDF file is required.' });
      }

      const template = await ProposalTemplate.create({
        proposalProjectId,
        title,
        type: type || 'custom',
        kind: 'uploaded',
        fileName: req.file.originalname,
        fileData: req.file.buffer,
      });

      // fileData is select:false, so strip it before returning (client never needs the bytes inline).
      const { fileData, ...templateJson } = template.toObject();
      return res.status(201).json({ success: true, data: templateJson });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Failed to upload proposal PDF.' });
    }
  }

  public static async updateTemplate(req: Request, res: Response) {
    try {
      const template = await ProposalTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!template) return res.status(404).json({ success: false, message: 'Proposal template not found.' });
      return res.json({ success: true, data: template });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async deleteTemplate(req: Request, res: Response) {
    try {
      const template = await ProposalTemplate.findByIdAndDelete(req.params.id);
      if (!template) return res.status(404).json({ success: false, message: 'Proposal template not found.' });
      return res.json({ success: true, message: 'Proposal template deleted successfully.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // --- AI GENERATION ---
  public static async aiGenerate(req: Request, res: Response) {
    try {
      const { instruction, projectName, type, currency } = req.body;
      if (!instruction || !String(instruction).trim()) {
        return res.status(400).json({ success: false, message: 'An instruction is required to generate content.' });
      }

      const result = await AIContentService.generateProposalContent({ instruction, projectName, type, currency });
      return res.json({ success: true, provider: result.provider, contentHtml: result.contentHtml });
    } catch (err: any) {
      return res.status(502).json({ success: false, message: err.message || 'AI content generation failed.' });
    }
  }

  // --- AI SECTION REFINE (rewrite a selected fragment in place) ---
  public static async aiRefineSection(req: Request, res: Response) {
    try {
      const { contentHtml, selectedHtml, instruction, projectName, type } = req.body;
      if (!instruction || !String(instruction).trim()) {
        return res.status(400).json({ success: false, message: 'An instruction is required to refine content.' });
      }
      if (!selectedHtml || !String(selectedHtml).trim()) {
        return res.status(400).json({ success: false, message: 'Select some content to refine first.' });
      }

      const result = await AIContentService.refineProposalSection({
        contentHtml: contentHtml || '',
        selectedHtml,
        instruction,
        projectName,
        type,
      });
      return res.json({ success: true, provider: result.provider, refinedHtml: result.refinedHtml });
    } catch (err: any) {
      return res.status(502).json({ success: false, message: err.message || 'AI content refine failed.' });
    }
  }

  // --- TEMPLATE PDF ---
  public static async getTemplatePdf(req: Request, res: Response) {
    try {
      const template = await ProposalTemplate.findById(req.params.id).select('+fileData');
      if (!template) return res.status(404).json({ success: false, message: 'Proposal template not found.' });

      if (template.kind === 'uploaded') {
        return ProposalController.sendStoredPdf(template.fileData, template.title, res);
      }

      const pdfBuffer = await PdfService.renderProposalPdf({
        title: template.title,
        contentHtml: template.contentHtml,
        branding: template.branding,
        meta: template.meta,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${template.title.replace(/[^a-z0-9]/gi, '_')}.pdf"`);
      return res.send(pdfBuffer);
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to render proposal PDF.' });
    }
  }

  // --- AD-HOC PDF PREVIEW (unsaved edits, used by the split-pane editor) ---
  public static async previewPdf(req: Request, res: Response) {
    try {
      const { title, contentHtml, branding, meta } = req.body;
      if (!contentHtml) {
        return res.status(400).json({ success: false, message: 'contentHtml is required to render a preview.' });
      }

      const pdfBuffer = await PdfService.renderProposalPdf({
        title: title || 'Proposal Preview',
        contentHtml,
        branding: branding || {},
        meta: meta || {},
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="preview.pdf"');
      return res.send(pdfBuffer);
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to render proposal PDF preview.' });
    }
  }

  // --- LEAD PROPOSALS ---
  public static async getLeadProposals(req: Request, res: Response) {
    try {
      const filter: any = {};
      if (req.query.leadId) filter.leadId = req.query.leadId;
      const proposals = await LeadProposal.find(filter).sort({ createdAt: -1 });
      return res.json({ success: true, count: proposals.length, data: proposals });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // Clone a template into a new (or reuse an existing draft) LeadProposal for a lead.
  public static async createLeadProposalFromTemplate(req: Request, res: Response) {
    try {
      const { leadId, templateId } = req.body;
      if (!leadId || !templateId) {
        return res.status(400).json({ success: false, message: 'leadId and templateId are required.' });
      }

      const lead = await Lead.findById(leadId);
      if (!lead) return res.status(404).json({ success: false, message: 'Lead not found.' });

      const template = await ProposalTemplate.findById(templateId).select('+fileData').populate('proposalProjectId');
      if (!template) return res.status(404).json({ success: false, message: 'Proposal template not found.' });

      const projectName = (template.proposalProjectId as any)?.name || '';

      const existingDraft = await LeadProposal.findOne({
        leadId,
        sourceTemplateId: templateId,
        status: 'draft',
      });

      if (existingDraft) {
        const { fileData, ...draftJson } = existingDraft.toObject();
        return res.json({ success: true, data: draftJson });
      }

      const leadProposal = await LeadProposal.create({
        leadId,
        sourceTemplateId: templateId,
        projectName,
        type: template.type,
        kind: template.kind,
        title: template.title,
        contentHtml: template.contentHtml,
        fileName: template.fileName,
        fileData: template.fileData,
        branding: template.branding,
        meta: template.meta,
        status: 'draft',
      });

      const { fileData, ...leadProposalJson } = leadProposal.toObject();
      return res.status(201).json({ success: true, data: leadProposalJson });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async updateLeadProposal(req: Request, res: Response) {
    try {
      const { title, contentHtml, branding, meta, projectName, type } = req.body;
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (contentHtml !== undefined) updateData.contentHtml = contentHtml;
      if (branding !== undefined) updateData.branding = branding;
      if (meta !== undefined) updateData.meta = meta;
      if (projectName !== undefined) updateData.projectName = projectName;
      if (type !== undefined) updateData.type = type;

      const leadProposal = await LeadProposal.findByIdAndUpdate(req.params.id, updateData, { new: true });
      if (!leadProposal) return res.status(404).json({ success: false, message: 'Lead proposal not found.' });
      return res.json({ success: true, data: leadProposal });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async getLeadProposalPdf(req: Request, res: Response) {
    try {
      const leadProposal = await LeadProposal.findById(req.params.id).select('+fileData');
      if (!leadProposal) return res.status(404).json({ success: false, message: 'Lead proposal not found.' });

      if (leadProposal.kind === 'uploaded') {
        return ProposalController.sendStoredPdf(leadProposal.fileData, leadProposal.title, res);
      }

      const pdfBuffer = await PdfService.renderProposalPdf({
        title: leadProposal.title,
        contentHtml: leadProposal.contentHtml,
        branding: leadProposal.branding,
        meta: leadProposal.meta,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${leadProposal.title.replace(/[^a-z0-9]/gi, '_')}.pdf"`);
      return res.send(pdfBuffer);
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to render proposal PDF.' });
    }
  }

  // Generate PDF, email it to the lead, and mark the proposal as sent.
  public static async sendLeadProposal(req: Request, res: Response) {
    try {
      const leadProposal = await LeadProposal.findById(req.params.id).select('+fileData');
      if (!leadProposal) return res.status(404).json({ success: false, message: 'Lead proposal not found.' });

      const lead = await Lead.findById(leadProposal.leadId);
      if (!lead) return res.status(404).json({ success: false, message: 'Lead not found.' });

      if (!lead.email) {
        return res.status(400).json({ success: false, message: 'This lead has no email address on file.' });
      }

      let pdfBuffer: Buffer;
      if (leadProposal.kind === 'uploaded') {
        if (!leadProposal.fileData) {
          return res.status(400).json({ success: false, message: 'No uploaded file found for this proposal.' });
        }
        pdfBuffer = leadProposal.fileData;
      } else {
        pdfBuffer = await PdfService.renderProposalPdf({
          title: leadProposal.title,
          contentHtml: leadProposal.contentHtml,
          branding: leadProposal.branding,
          meta: leadProposal.meta,
        });
      }

      const fileName = `${leadProposal.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;

      const emailResult = await EmailSystem.sendEmail({
        to: lead.email,
        subject: `Your proposal: ${leadProposal.title}`,
        body: `<p>Dear ${lead.name || 'Client'},</p>
<p>Greetings from Build Your Thoughts!</p>
<p>Thank you for giving us the opportunity to understand and discuss your project requirements.</p>
<p>Please find attached our detailed project proposal, prepared based on our discussions and your business requirements. The proposal outlines the proposed solution, scope of work, key features, deliverables, estimated timeline, and commercial details.</p>
<p>We invite you to review the proposal and share your feedback. If you have any questions or would like to discuss any aspect of the proposal, we would be happy to schedule a discussion at your convenience.</p>
<p>We look forward to the opportunity to collaborate with you and build a reliable, scalable, and high-quality solution that supports your business goals.</p>
<p>Warm Regards,<br/><strong>Build Your Thoughts</strong></p>`,
        attachments: [{ filename: fileName, content: pdfBuffer, contentType: 'application/pdf' }],
      });

      if (!emailResult.success) {
        return res.status(502).json({ success: false, message: 'Failed to send the proposal email. Check SMTP configuration.' });
      }

      leadProposal.status = 'sent';
      leadProposal.sentAt = new Date();
      await leadProposal.save();

      return res.json({ success: true, message: 'Proposal sent successfully.', data: leadProposal });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to send proposal.' });
    }
  }
}
