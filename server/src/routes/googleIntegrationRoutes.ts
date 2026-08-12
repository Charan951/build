import { Router } from 'express';
import { GoogleIntegrationController } from '../controllers/googleIntegrationController';

const router = Router();

router.get('/auth-url', GoogleIntegrationController.getAuthUrl);
router.get('/callback', GoogleIntegrationController.callback);
router.get('/status', GoogleIntegrationController.getStatus);
router.post('/disconnect', GoogleIntegrationController.disconnect);

export default router;
