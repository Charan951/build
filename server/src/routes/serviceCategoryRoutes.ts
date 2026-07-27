import { Router } from 'express';
import {
  getServiceCategories,
  getAllServiceCategoriesAdmin,
  getServiceCategoryBySlug,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
} from '../controllers/serviceCategoryController';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getServiceCategories);
router.get('/admin/all', authenticateAdmin, getAllServiceCategoriesAdmin);
router.get('/slug/:slug', getServiceCategoryBySlug);
router.post('/', authenticateAdmin, createServiceCategory);
router.put('/:id', authenticateAdmin, updateServiceCategory);
router.delete('/:id', authenticateAdmin, deleteServiceCategory);

export default router;
