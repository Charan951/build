import { Router } from 'express';
import {
  getPlatformSolutions,
  getAllPlatformSolutionsAdmin,
  createPlatformSolution,
  updatePlatformSolution,
  deletePlatformSolution,
} from '../controllers/platformSolutionController';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', getPlatformSolutions);

// Protected Admin CRUD routes
router.get('/admin/all', authenticateAdmin, getAllPlatformSolutionsAdmin);
router.post('/', authenticateAdmin, createPlatformSolution);
router.put('/:id', authenticateAdmin, updatePlatformSolution);
router.delete('/:id', authenticateAdmin, deletePlatformSolution);

export default router;
