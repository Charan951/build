import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getSettings);
router.put('/', authenticateAdmin, updateSettings);
router.post('/', authenticateAdmin, updateSettings);

export default router;
