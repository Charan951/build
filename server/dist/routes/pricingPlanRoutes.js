"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pricingPlanController_1 = require("../controllers/pricingPlanController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public routes
router.get('/', pricingPlanController_1.getPricingPlans);
// Protected Admin CRUD routes
router.get('/admin/all', authMiddleware_1.authenticateAdmin, pricingPlanController_1.getAllPricingPlansAdmin);
router.post('/', authMiddleware_1.authenticateAdmin, pricingPlanController_1.createPricingPlan);
router.put('/:id', authMiddleware_1.authenticateAdmin, pricingPlanController_1.updatePricingPlan);
router.delete('/:id', authMiddleware_1.authenticateAdmin, pricingPlanController_1.deletePricingPlan);
exports.default = router;
