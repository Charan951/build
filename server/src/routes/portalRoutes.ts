import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { PortalController } from '../controllers/portalController';
import { ClientFileController } from '../controllers/clientFileController';
import { authenticateClient } from '../middleware/authMiddleware';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
});

// The PDF <iframe>/download link can't attach an Authorization header, so let
// it authenticate via a `token` query param instead, same pattern used for
// the proposal/invoice PDF routes.
const authenticateClientOrQueryToken = (req: Request, res: Response, next: NextFunction) => {
  const queryToken = req.query.token as string | undefined;
  if (queryToken && !req.headers.authorization) {
    req.headers.authorization = `Bearer ${queryToken}`;
  }
  return authenticateClient(req, res, next);
};

router.get('/invoices/:invoiceId/pdf', authenticateClientOrQueryToken, PortalController.getMyInvoicePdf);
router.get(
  '/projects/:id/quotations/:quotationId/pdf',
  authenticateClientOrQueryToken,
  PortalController.getMyProjectQuotationPdf
);
router.get('/files/:fileId/download', authenticateClientOrQueryToken, ClientFileController.downloadFile);

router.use(authenticateClient);

router.get('/me', PortalController.getMe);
router.get('/projects', PortalController.getMyProjects);
router.get('/projects/:id', PortalController.getMyProject);
router.post('/projects/:id/client-tasks', PortalController.addClientTask);
router.put('/projects/:id/client-tasks/:taskId', PortalController.updateClientTask);
router.get('/invoices', PortalController.getMyInvoices);
router.get('/meetings', PortalController.getMyMeetings);
router.post('/meetings', PortalController.requestMeeting);
router.get('/files', ClientFileController.listFiles);
router.post('/files', upload.single('file'), ClientFileController.uploadFile);
router.delete('/files/:fileId', ClientFileController.deleteFile);

export default router;
