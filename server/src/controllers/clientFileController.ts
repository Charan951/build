import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/rbacGuard';
import ClientFile from '../models/ClientFile';

interface MulterRequest extends AuthenticatedRequest {
  file?: Express.Multer.File;
}

// Admin requests carry the target client in the URL (:clientId); client-portal
// requests carry no such param and are scoped to the token's own id instead.
const resolveClientId = (req: AuthenticatedRequest): string | null => {
  return (req.params as any).clientId || req.user?.id || null;
};

// Client-portal tokens always carry role 'client' (enforced by authenticateClient);
// anything else reaching here came through authenticateAdmin. Using the token's
// role (rather than the presence of a :clientId param, which download/delete
// routes don't have) keeps the admin-vs-client check correct on every route.
const isClientRequest = (req: AuthenticatedRequest): boolean => req.user?.role === 'client';

export const ClientFileController = {
  async listFiles(req: AuthenticatedRequest, res: Response) {
    try {
      const clientId = resolveClientId(req);
      if (!clientId) return res.status(400).json({ success: false, message: 'clientId is required.' });

      const files = await ClientFile.find({ clientId }).sort({ createdAt: -1 });
      return res.json({ success: true, data: files });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async uploadFile(req: MulterRequest, res: Response) {
    try {
      const clientId = resolveClientId(req);
      if (!clientId) return res.status(400).json({ success: false, message: 'clientId is required.' });
      if (!req.file) return res.status(400).json({ success: false, message: 'A file is required.' });

      const file = await ClientFile.create({
        clientId,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        fileData: req.file.buffer,
        uploadedBy: isClientRequest(req) ? 'client' : 'admin',
      });

      const { fileData, ...fileJson } = file.toObject();
      return res.status(201).json({ success: true, data: fileJson });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Failed to upload file.' });
    }
  },

  async deleteFile(req: AuthenticatedRequest, res: Response) {
    try {
      const file = await ClientFile.findById(req.params.fileId);
      if (!file) return res.status(404).json({ success: false, message: 'File not found.' });

      // Client-portal callers may only delete files scoped to their own account.
      if (isClientRequest(req) && String(file.clientId) !== req.user?.id) {
        return res.status(404).json({ success: false, message: 'File not found.' });
      }

      await file.deleteOne();
      return res.json({ success: true, message: 'File deleted successfully.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async downloadFile(req: AuthenticatedRequest, res: Response) {
    try {
      const file = await ClientFile.findById(req.params.fileId).select('+fileData');
      if (!file) return res.status(404).json({ success: false, message: 'File not found.' });

      if (isClientRequest(req) && String(file.clientId) !== req.user?.id) {
        return res.status(404).json({ success: false, message: 'File not found.' });
      }

      res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.fileName)}"`);
      res.removeHeader('X-Frame-Options');
      return res.send(file.fileData);
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to download file.' });
    }
  },
};
