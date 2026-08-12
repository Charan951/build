import { Router } from 'express';
import { createLead, getLeads, updateLeadStatus, deleteLead, getPipelineStats, importLeads } from '../controllers/leadController';
import { StageController } from '../controllers/stageController';
import { authenticateAdmin } from '../middleware/authMiddleware';
import { leadLimiter } from '../middleware/securityMiddleware';

const router = Router();

// Pipeline Statistics
router.get('/stats', getPipelineStats);

// Pipeline Stages Configuration CRUD
router.get('/stages', StageController.getStages);
router.post('/stages', authenticateAdmin, StageController.createStage);
router.put('/stages/reorder', authenticateAdmin, StageController.reorderStages);
router.put('/stages/:id', authenticateAdmin, StageController.updateStage);
router.delete('/stages/:id', authenticateAdmin, StageController.deleteStage);

// Lead Ingestion & Management
router.post('/', leadLimiter, createLead);
router.post('/import', authenticateAdmin, importLeads);
router.get('/', getLeads);
router.patch('/:id/status', updateLeadStatus);
router.put('/:id', updateLeadStatus);
router.delete('/:id', deleteLead);

export default router;
