"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leadController_1 = require("../controllers/leadController");
const stageController_1 = require("../controllers/stageController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const securityMiddleware_1 = require("../middleware/securityMiddleware");
const router = (0, express_1.Router)();
// Pipeline Statistics
router.get('/stats', leadController_1.getPipelineStats);
// Pipeline Stages Configuration CRUD
router.get('/stages', stageController_1.StageController.getStages);
router.post('/stages', authMiddleware_1.authenticateAdmin, stageController_1.StageController.createStage);
router.put('/stages/reorder', authMiddleware_1.authenticateAdmin, stageController_1.StageController.reorderStages);
router.put('/stages/:id', authMiddleware_1.authenticateAdmin, stageController_1.StageController.updateStage);
router.delete('/stages/:id', authMiddleware_1.authenticateAdmin, stageController_1.StageController.deleteStage);
// Lead Ingestion & Management
router.post('/', securityMiddleware_1.leadLimiter, leadController_1.createLead);
router.post('/import', authMiddleware_1.authenticateAdmin, leadController_1.importLeads);
router.get('/', leadController_1.getLeads);
router.patch('/:id/status', leadController_1.updateLeadStatus);
router.put('/:id', leadController_1.updateLeadStatus);
router.delete('/:id', leadController_1.deleteLead);
exports.default = router;
