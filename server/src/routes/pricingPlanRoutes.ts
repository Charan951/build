import { Router } from 'express';
import {
  getPricingPlans,
  getAllPricingPlansAdmin,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
} from '../controllers/pricingPlanController';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', getPricingPlans);

// Protected Admin CRUD routes
router.get('/admin/all', authenticateAdmin, getAllPricingPlansAdmin);
router.post('/', authenticateAdmin, createPricingPlan);
router.put('/:id', authenticateAdmin, updatePricingPlan);
router.delete('/:id', authenticateAdmin, deletePricingPlan);

export default router;
