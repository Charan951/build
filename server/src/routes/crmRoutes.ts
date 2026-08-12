import { Router } from 'express';
import multer from 'multer';
import { CRMController } from '../controllers/crmController';
import { ClientFileController } from '../controllers/clientFileController';
import { rbacGuard } from '../middleware/rbacGuard';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = Router();

// Files are stored inline in a MongoDB document (see ClientFile model), so the
// limit must stay safely under MongoDB's 16MB BSON document cap.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
});

// Clients CRUD
router.get('/clients', rbacGuard('clients.read'), CRMController.getClients);
router.post('/clients', rbacGuard('clients.create'), CRMController.createClient);
router.put('/clients/:id', rbacGuard('clients.update'), CRMController.updateClient);
router.delete('/clients/:id', rbacGuard('clients.delete'), CRMController.deleteClient);
router.post('/clients/:id/send-credentials', rbacGuard('clients.update'), CRMController.resendClientCredentials);

// Client Files (contracts, brand assets, ID/tax documents — not tied to a project)
router.get('/clients/:clientId/files', authenticateAdmin, ClientFileController.listFiles);
router.post('/clients/:clientId/files', authenticateAdmin, upload.single('file'), ClientFileController.uploadFile);
router.delete('/clients/files/:fileId', authenticateAdmin, ClientFileController.deleteFile);
router.get('/clients/files/:fileId/download', authenticateAdmin, ClientFileController.downloadFile);

// Quotations CRUD & Engine
router.get('/quotations', rbacGuard('quotations.read'), CRMController.getQuotations);
router.post('/quotations', rbacGuard('quotations.create'), CRMController.createQuotation);
router.post('/quotations/:id/approve', rbacGuard('quotations.approve'), CRMController.approveQuotation);

// Invoices & Payments CRUD
router.get('/invoices', rbacGuard('invoices.read'), CRMController.getInvoices);
router.post('/invoices/:id/payments', rbacGuard('payments.record'), CRMController.recordPayment);

// Project Workspace & Tasks CRUD
router.get('/projects', rbacGuard('projects.read'), CRMController.getProjects);
router.post('/projects', rbacGuard('projects.create'), CRMController.createProject);
router.put('/projects/:id', rbacGuard('projects.update'), CRMController.updateProject);
router.delete('/projects/:id', rbacGuard('projects.delete'), CRMController.deleteProject);
router.post('/projects/:id/tasks', rbacGuard('tasks.create'), CRMController.addTask);
router.put('/projects/:id/tasks/status', rbacGuard('tasks.update'), CRMController.updateTaskStatus);
router.delete('/projects/:id/tasks/:taskId', rbacGuard('tasks.update'), CRMController.deleteTask);
router.post('/projects/:id/updates', rbacGuard('projects.update'), CRMController.addProgressUpdate);
router.post('/projects/:id/client-tasks', rbacGuard('projects.update'), CRMController.addClientTask);
router.put('/projects/:id/client-tasks/:taskId', rbacGuard('projects.update'), CRMController.updateClientTask);
router.delete('/projects/:id/client-tasks/:taskId', rbacGuard('projects.update'), CRMController.deleteClientTask);
router.post('/projects/:id/team', rbacGuard('projects.update'), CRMController.addTeamMember);
router.delete('/projects/:id/team/:memberId', rbacGuard('projects.update'), CRMController.removeTeamMember);
router.post('/projects/:id/payments', rbacGuard('projects.update'), CRMController.addProjectPayment);
router.put('/projects/:id/payments/:paymentId', rbacGuard('projects.update'), CRMController.updateProjectPayment);
router.delete('/projects/:id/payments/:paymentId', rbacGuard('projects.update'), CRMController.deleteProjectPayment);
router.post('/projects/:id/team-payments', rbacGuard('projects.update'), CRMController.addTeamPayment);
router.delete('/projects/:id/team-payments/:paymentId', rbacGuard('projects.update'), CRMController.deleteTeamPayment);
router.post('/projects/:id/invoices', rbacGuard('invoices.read'), CRMController.createProjectInvoice);
router.put('/projects/:id/invoices/:invoiceId', rbacGuard('invoices.read'), CRMController.updateProjectInvoice);
router.delete('/projects/:id/invoices/:invoiceId', rbacGuard('invoices.read'), CRMController.deleteProjectInvoice);
router.get('/projects/:id/invoices/:invoiceId/pdf', CRMController.getInvoicePdf);
router.post('/projects/:id/quotations', rbacGuard('projects.update'), CRMController.createProjectQuotation);
router.get('/projects/:id/quotations/:quotationId', rbacGuard('projects.update'), CRMController.getProjectQuotation);
router.put('/projects/:id/quotations/:quotationId', rbacGuard('projects.update'), CRMController.updateProjectQuotation);
router.delete('/projects/:id/quotations/:quotationId', rbacGuard('projects.update'), CRMController.deleteProjectQuotation);
router.get('/projects/:id/quotations/:quotationId/pdf', CRMController.getProjectQuotationPdf);

// Meetings CRUD
router.get('/meetings', rbacGuard('meetings.read'), CRMController.getMeetings);
router.post('/meetings', rbacGuard('meetings.create'), CRMController.createMeeting);
router.put('/meetings/:id', rbacGuard('meetings.update'), CRMController.updateMeeting);
router.delete('/meetings/:id', rbacGuard('meetings.delete'), CRMController.deleteMeeting);

// Executive Reports & Financial Analytics
router.get('/analytics', rbacGuard('reports.view_revenue'), CRMController.getAnalytics);

export default router;
