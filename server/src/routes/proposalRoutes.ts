import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { ProposalController } from '../controllers/proposalController';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = Router();

// Uploaded PDFs are stored inline in a MongoDB document (see proposalController),
// so the limit must stay safely under MongoDB's 16MB BSON document cap.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed.'));
    }
    cb(null, true);
  },
});

// Allows the PDF preview <iframe>/<embed> (which cannot send an Authorization header)
// to authenticate via a `token` query param, in addition to normal header-based auth.
const authenticateAdminOrQueryToken = (req: Request, res: Response, next: NextFunction) => {
  const queryToken = req.query.token as string | undefined;
  if (queryToken && !req.headers.authorization) {
    req.headers.authorization = `Bearer ${queryToken}`;
  }
  return authenticateAdmin(req, res, next);
};

// Proposal Projects CRUD
router.get('/projects', authenticateAdmin, ProposalController.getProjects);
router.post('/projects', authenticateAdmin, ProposalController.createProject);
router.put('/projects/:id', authenticateAdmin, ProposalController.updateProject);
router.delete('/projects/:id', authenticateAdmin, ProposalController.deleteProject);

// Proposal Templates CRUD
router.get('/templates', authenticateAdmin, ProposalController.getTemplates);
router.get('/templates/:id', authenticateAdmin, ProposalController.getTemplateById);
router.post('/templates', authenticateAdmin, ProposalController.createTemplate);
router.post('/templates/upload', authenticateAdmin, upload.single('file'), ProposalController.uploadTemplate);
router.put('/templates/:id', authenticateAdmin, ProposalController.updateTemplate);
router.delete('/templates/:id', authenticateAdmin, ProposalController.deleteTemplate);
router.get('/templates/:id/pdf', authenticateAdminOrQueryToken, ProposalController.getTemplatePdf);

// AI Generation
router.post('/ai-generate', authenticateAdmin, ProposalController.aiGenerate);
router.post('/ai-refine', authenticateAdmin, ProposalController.aiRefineSection);

// Ad-hoc PDF preview for unsaved editor content
router.post('/preview-pdf', authenticateAdmin, ProposalController.previewPdf);

// Lead Proposals
router.get('/lead-proposals', authenticateAdmin, ProposalController.getLeadProposals);
router.post('/lead-proposals', authenticateAdmin, ProposalController.createLeadProposalFromTemplate);
router.put('/lead-proposals/:id', authenticateAdmin, ProposalController.updateLeadProposal);
router.get('/lead-proposals/:id/pdf', authenticateAdminOrQueryToken, ProposalController.getLeadProposalPdf);
router.post('/lead-proposals/:id/send', authenticateAdmin, ProposalController.sendLeadProposal);

export default router;
