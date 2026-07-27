import { Router } from 'express';
import {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
} from '../controllers/blogController';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getBlogs);
router.get('/:slug', getBlogBySlug);
router.post('/', authenticateAdmin, createBlog);
router.put('/:id', authenticateAdmin, updateBlog);
router.delete('/:id', authenticateAdmin, deleteBlog);

export default router;
