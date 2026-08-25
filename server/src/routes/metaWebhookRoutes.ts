import { Router } from 'express';
import { verifyWebhook, receiveWebhook } from '../controllers/metaWebhookController';

const router = Router();

// Unauthenticated by design - Meta calls these directly. Security comes from
// the verify-token handshake (GET) and the X-Hub-Signature-256 check (POST).
router.get('/webhook', verifyWebhook);
router.post('/webhook', receiveWebhook);

export default router;
