"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const platformSolutionController_1 = require("../controllers/platformSolutionController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public routes
router.get('/', platformSolutionController_1.getPlatformSolutions);
// Protected Admin CRUD routes
router.get('/admin/all', authMiddleware_1.authenticateAdmin, platformSolutionController_1.getAllPlatformSolutionsAdmin);
router.post('/', authMiddleware_1.authenticateAdmin, platformSolutionController_1.createPlatformSolution);
router.put('/:id', authMiddleware_1.authenticateAdmin, platformSolutionController_1.updatePlatformSolution);
router.delete('/:id', authMiddleware_1.authenticateAdmin, platformSolutionController_1.deletePlatformSolution);
exports.default = router;
