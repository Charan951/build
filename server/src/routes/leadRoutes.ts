import { Router } from 'express';
import { createLead, getLeads, updateLeadStatus, deleteLead } from '../controllers/leadController';
import { authenticateAdmin } from '../middleware/authMiddleware';
import { leadLimiter } from '../middleware/securityMiddleware';

const router = Router();

router.post('/', leadLimiter, createLead);
router.get('/', authenticateAdmin, getLeads);
router.patch('/:id/status', authenticateAdmin, updateLeadStatus);
router.delete('/:id', authenticateAdmin, deleteLead);

export default router;
