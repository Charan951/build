import { Router } from 'express';
import { login, refreshToken, logout, getMe } from '../controllers/authController';
import { authenticateAdmin } from '../middleware/authMiddleware';
import { authLimiter } from '../middleware/securityMiddleware';

const router = Router();

router.post('/login', authLimiter, login);
router.post('/refresh', refreshToken);
router.post('/logout', authenticateAdmin, logout);
router.get('/me', authenticateAdmin, getMe);

export default router;
