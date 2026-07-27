import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import serviceRoutes from './routes/serviceRoutes';
import blogRoutes from './routes/blogRoutes';
import leadRoutes from './routes/leadRoutes';
import platformSolutionRoutes from './routes/platformSolutionRoutes';
import pricingPlanRoutes from './routes/pricingPlanRoutes';
import serviceCategoryRoutes from './routes/serviceCategoryRoutes';
import settingsRoutes from './routes/settingsRoutes';
import seoRoutes from './routes/seoRoutes';
import { corsOptions } from './config/cors';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app: Application = express();

// Security Middlewares
app.use(helmet({ contentSecurityPolicy: false })); // Allowed for R3F Canvas, WebSockets, and Cloudinary media
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(mongoSanitize()); // Prevent MongoDB Operator Injection ($gt, $ne, etc.)

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/service-categories', serviceCategoryRoutes);
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/platform-solutions', platformSolutionRoutes);
app.use('/api/v1/pricing-plans', pricingPlanRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/', seoRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Centralized error handler
app.use(errorHandler);

export default app;
