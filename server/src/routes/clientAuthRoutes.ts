import { Router } from 'express';
import { clientLogin } from '../controllers/clientAuthController';
import { authLimiter } from '../middleware/securityMiddleware';

const router = Router();

router.post('/login', authLimiter, clientLogin);

export default router;
