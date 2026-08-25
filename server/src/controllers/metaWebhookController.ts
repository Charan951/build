import { Request, Response } from 'express';
import Lead from '../models/Lead';
import { createLeadInternal } from './leadController';
import { verifySignature, fetchLeadData, mapLeadFieldsToLeadSchema } from '../services/metaService';

/**
 * GET handshake Meta performs once when the Callback URL is saved in the
 * App Dashboard: echo back hub.challenge only if our shared verify token matches.
 */
export const verifyWebhook = (req: Request, res: Response): void => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.FB_WEBHOOK_VERIFY_TOKEN) {
    res.status(200).send(challenge);
    return;
  }
  res.sendStatus(403);
};

/**
 * POST delivery of `leadgen` change events. Meta expects a fast 2xx ack and
 * will retry on failure/timeout, so we ack first and process afterward.
 */
export const receiveWebhook = (req: Request, res: Response): void => {
  const signature = req.headers['x-hub-signature-256'] as string | undefined;
  const rawBody = (req as any).rawBody as Buffer | undefined;

  if (!verifySignature(rawBody, signature)) {
    res.sendStatus(401);
    return;
  }

  res.sendStatus(200);

  processLeadgenEvents(req.body).catch((err) => {
    console.error('[metaWebhookController] Failed to process leadgen webhook batch:', err);
  });
};

const processLeadgenEvents = async (body: any): Promise<void> => {
  const entries = Array.isArray(body?.entry) ? body.entry : [];

  for (const entry of entries) {
    const changes = Array.isArray(entry?.changes) ? entry.changes : [];
    for (const change of changes) {
      if (change?.field !== 'leadgen') continue;

      const leadgenId = change?.value?.leadgen_id;
      if (!leadgenId) continue;

      try {
        const existing = await Lead.findOne({ metaLeadId: leadgenId });
        if (existing) continue; // already ingested - Meta redelivers on retry/backoff

        const leadData = await fetchLeadData(leadgenId);
        const mapped = mapLeadFieldsToLeadSchema(leadData);
        await createLeadInternal(mapped);
      } catch (err) {
        console.error(`[metaWebhookController] Failed to ingest leadgen_id=${leadgenId}:`, err);
      }
    }
  }
};
