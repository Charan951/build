"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const serviceRoutes_1 = __importDefault(require("./routes/serviceRoutes"));
const blogRoutes_1 = __importDefault(require("./routes/blogRoutes"));
const leadRoutes_1 = __importDefault(require("./routes/leadRoutes"));
const platformSolutionRoutes_1 = __importDefault(require("./routes/platformSolutionRoutes"));
const pricingPlanRoutes_1 = __importDefault(require("./routes/pricingPlanRoutes"));
const serviceCategoryRoutes_1 = __importDefault(require("./routes/serviceCategoryRoutes"));
const seoRoutes_1 = __importDefault(require("./routes/seoRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Security Middlewares
app.use((0, helmet_1.default)({ contentSecurityPolicy: false })); // Allowed for R3F Canvas and Cloudinary media
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
// API Routes
app.use('/api/v1/auth', authRoutes_1.default);
app.use('/api/v1/projects', projectRoutes_1.default);
app.use('/api/v1/services', serviceRoutes_1.default);
app.use('/api/v1/service-categories', serviceCategoryRoutes_1.default);
app.use('/api/v1/blogs', blogRoutes_1.default);
app.use('/api/v1/leads', leadRoutes_1.default);
app.use('/api/v1/platform-solutions', platformSolutionRoutes_1.default);
app.use('/api/v1/pricing-plans', pricingPlanRoutes_1.default);
app.use('/', seoRoutes_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});
// Centralized error handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
