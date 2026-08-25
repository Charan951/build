import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import clientAuthRoutes from './routes/clientAuthRoutes';
import projectRoutes from './routes/projectRoutes';
import serviceRoutes from './routes/serviceRoutes';
import blogRoutes from './routes/blogRoutes';
import leadRoutes from './routes/leadRoutes';
import platformSolutionRoutes from './routes/platformSolutionRoutes';
import pricingPlanRoutes from './routes/pricingPlanRoutes';
import serviceCategoryRoutes from './routes/serviceCategoryRoutes';
import settingsRoutes from './routes/settingsRoutes';
import crmRoutes from './routes/crmRoutes';
import proposalRoutes from './routes/proposalRoutes';
import portalRoutes from './routes/portalRoutes';
import googleIntegrationRoutes from './routes/googleIntegrationRoutes';
import metaWebhookRoutes from './routes/metaWebhookRoutes';
import seoRoutes from './routes/seoRoutes';
import { corsOptions } from './config/cors';
import { errorHandler } from './middleware/errorHandler';

// override: true so this project's .env always wins over stray shell-level env vars
// (e.g. a global ~/.bashrc exporting same-named vars for a different project) -
// dotenv's default behavior silently keeps whatever is already in process.env.
dotenv.config({ override: true });

const app: Application = express();

// Security Middlewares
app.use(helmet({ contentSecurityPolicy: false })); // Allowed for R3F Canvas, WebSockets, and Cloudinary media
app.use(cors(corsOptions));
app.use(express.json({
  limit: '10mb',
  // Meta's webhook signature is computed over the exact raw bytes; stash them
  // for verification without adding a second body parser just for this route.
  verify: (req: any, _res, buf) => {
    if (req.url?.startsWith('/api/v1/integrations/meta/webhook')) {
      req.rawBody = buf;
    }
  },
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(mongoSanitize()); // Prevent MongoDB Operator Injection ($gt, $ne, etc.)

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/client-auth', clientAuthRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/service-categories', serviceCategoryRoutes);
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/platform-solutions', platformSolutionRoutes);
app.use('/api/v1/pricing-plans', pricingPlanRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/crm', crmRoutes);
app.use('/api/v1/proposals', proposalRoutes);
app.use('/api/v1/portal', portalRoutes);
app.use('/api/v1/integrations/google', googleIntegrationRoutes);
app.use('/api/v1/integrations/meta', metaWebhookRoutes);
app.use('/', seoRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Centralized error handler
app.use(errorHandler);

export default app;
