"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteServiceCategory = exports.updateServiceCategory = exports.createServiceCategory = exports.getServiceCategoryBySlug = exports.getAllServiceCategoriesAdmin = exports.getServiceCategories = void 0;
const ServiceCategory_1 = __importDefault(require("../models/ServiceCategory"));
const initialCategories = [
    {
        num: '01',
        title: 'UI/UX & Product Design',
        slug: 'ui-ux-product-design',
        description: 'User-centric interfaces, design systems, interactive prototypes, and conversion-optimized user experience.',
        icon: 'Layout',
        order: 1,
        isActive: true,
        subServices: [
            { num: '01', title: 'UI/UX & PRODUCT DESIGN', slug: 'ui-ux-product-design' },
            { num: '02', title: 'DESIGN SYSTEMS & TOKENS', slug: 'design-systems-tokens' },
            { num: '03', title: 'INTERACTIVE PROTOTYPING', slug: 'interactive-prototyping' },
            { num: '04', title: 'MOBILE APP UI DESIGN', slug: 'mobile-app-ui-design' }
        ]
    },
    {
        num: '02',
        title: 'Web & Application Development',
        slug: 'web-application-development',
        description: 'Robust, scalable, and lightning-fast web development solutions engineered using the latest modern tech stacks.',
        icon: 'Code',
        order: 2,
        isActive: true,
        subServices: [
            { num: '01', title: 'REACT & NEXT.JS APPLICATION DEVELOPMENT', slug: 'react-nextjs-application-development' },
            { num: '02', title: 'MOBILE APP DEVELOPMENT (iOS & ANDROID)', slug: 'mobile-app-development' },
            { num: '03', title: 'CUSTOM WEB APPLICATION DEVELOPMENT', slug: 'custom-web-application-development' },
            { num: '04', title: 'SAAS PLATFORM DEVELOPMENT', slug: 'saas-platform-development' },
            { num: '05', title: 'API & BACKEND DEVELOPMENT', slug: 'api-backend-development' },
            { num: '06', title: 'PROGRESSIVE WEB APPS (PWA)', slug: 'progressive-web-apps' },
            { num: '07', title: 'FULL STACK PORTAL DEVELOPMENT', slug: 'full-stack-portal-development' },
            { num: '08', title: 'ENTERPRISE ERP & CRM DEVELOPMENT', slug: 'enterprise-erp-crm-development' },
            { num: '09', title: 'HIGH-PERFORMANCE REDESIGN', slug: 'high-performance-redesign' },
            { num: '10', title: 'E-COMMERCE & RETAIL PLATFORMS', slug: 'ecommerce-retail-platforms' },
            { num: '11', title: 'EVENT BOOKING SYSTEM DEVELOPMENT', slug: 'event-booking-system-development' },
            { num: '12', title: 'AI & AGENTIC INTEGRATION', slug: 'ai-agentic-integration' }
        ]
    },
    {
        num: '03',
        title: 'eCommerce & Conversion Systems',
        slug: 'ecommerce-conversion-systems',
        description: 'High-conversion online stores, multi-vendor marketplaces, and seamless payment integration engines.',
        icon: 'ShoppingCart',
        order: 3,
        isActive: true,
        subServices: [
            { num: '01', title: 'HYPERLOCAL MULTI-VENDOR PLATFORMS', slug: 'hyperlocal-multi-vendor-platforms' },
            { num: '02', title: 'CUSTOM CHECKOUT & PAYMENT GATEWAYS', slug: 'custom-checkout-payment-gateways' },
            { num: '03', title: 'INVENTORY & ORDER MANAGEMENT', slug: 'inventory-order-management' },
            { num: '04', title: 'MOBILE SHOPPING APPS (iOS & ANDROID)', slug: 'mobile-shopping-apps' }
        ]
    },
    {
        num: '04',
        title: 'AI & Agentic Solutions 🔥',
        slug: 'ai-agentic-solutions',
        description: 'Custom LLM integrations, RAG vector search, autonomous AI agents, and real-time computer vision models.',
        icon: 'Bot',
        order: 4,
        isActive: true,
        subServices: [
            { num: '01', title: 'CUSTOM AI AGENTS & RAG PIPELINES', slug: 'custom-ai-agents-rag-pipelines' },
            { num: '02', title: 'OPENAI & ANTHROPIC LLM INTEGRATIONS', slug: 'openai-anthropic-llm-integrations' },
            { num: '03', title: 'COMPUTER VISION & DIAGNOSTIC MODELS', slug: 'computer-vision-diagnostic-models' },
            { num: '04', title: 'EMBEDDED AI WORKFLOWS', slug: 'embedded-ai-workflows' }
        ]
    },
    {
        num: '05',
        title: 'Growth Marketing & Performance',
        slug: 'growth-marketing-performance',
        description: 'Data-driven SEO, conversion rate optimization, technical performance audit, and cloud infrastructure scaling.',
        icon: 'TrendingUp',
        order: 5,
        isActive: true,
        subServices: [
            { num: '01', title: 'TECHNICAL SEO & SPEED OPTIMIZATION', slug: 'technical-seo-speed-optimization' },
            { num: '02', title: 'CONVERSION RATE OPTIMIZATION (CRO)', slug: 'conversion-rate-optimization' },
            { num: '03', title: 'ANALYTICS & ATTRIBUTION ENGINE', slug: 'analytics-attribution-engine' },
            { num: '04', title: 'APP STORE OPTIMIZATION (ASO)', slug: 'app-store-optimization' }
        ]
    },
    {
        num: '06',
        title: 'Branding & Visual Identity',
        slug: 'branding-visual-identity',
        description: 'Brand strategy, logo creation, typography tokens, and complete brand design guidelines.',
        icon: 'Palette',
        order: 6,
        isActive: true,
        subServices: [
            { num: '01', title: 'LOGO & VISUAL IDENTITY DESIGN', slug: 'logo-visual-identity-design' },
            { num: '02', title: 'BRAND GUIDELINES & TYPOGRAPHY', slug: 'brand-guidelines-typography' },
            { num: '03', title: 'DIGITAL ASSET CREATION', slug: 'digital-asset-creation' },
            { num: '04', title: 'MARKETING COLLATERAL DESIGN', slug: 'marketing-collateral-design' }
        ]
    },
    {
        num: '07',
        title: 'Website Maintenance & AMC',
        slug: 'website-maintenance-amc',
        description: '24/7 technical monitoring, security patches, regular cloud backups, and SLA-backed engineering support.',
        icon: 'ShieldCheck',
        order: 7,
        isActive: true,
        subServices: [
            { num: '01', title: '24/7 SLA TECHNICAL SUPPORT', slug: 'sla-technical-support' },
            { num: '02', title: 'SECURITY PATCHES & AUDITS', slug: 'security-patches-audits' },
            { num: '03', title: 'PERFORMANCE & UPTIME MONITORING', slug: 'performance-uptime-monitoring' },
            { num: '04', title: 'CLOUD BACKUP MANAGEMENT', slug: 'cloud-backup-management' }
        ]
    },
    {
        num: '08',
        title: 'Video Production & Animation',
        slug: 'video-production-animation',
        description: '3D motion graphics, product demo walkthroughs, interactive UI animations, and video editing.',
        icon: 'Video',
        order: 8,
        isActive: true,
        subServices: [
            { num: '01', title: '3D MOTION GRAPHICS & RENDER', slug: 'motion-graphics-render' },
            { num: '02', title: 'PRODUCT DEMO & APP WALKTHROUGHS', slug: 'product-demo-walkthroughs' },
            { num: '03', title: 'INTERACTIVE UI ANIMATION', slug: 'interactive-ui-animation' },
            { num: '04', title: 'PROMOTIONAL VIDEO EDITING', slug: 'promotional-video-editing' }
        ]
    }
];
const seedInitialServiceCategories = async () => {
    const count = await ServiceCategory_1.default.countDocuments();
    if (count === 0) {
        await ServiceCategory_1.default.insertMany(initialCategories);
    }
};
const getServiceCategories = async (req, res) => {
    try {
        await seedInitialServiceCategories();
        const categories = await ServiceCategory_1.default.find({ isActive: true }).sort({ order: 1 });
        res.status(200).json({ success: true, count: categories.length, data: categories });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve service categories.' });
    }
};
exports.getServiceCategories = getServiceCategories;
const getAllServiceCategoriesAdmin = async (req, res) => {
    try {
        await seedInitialServiceCategories();
        const categories = await ServiceCategory_1.default.find().sort({ order: 1 });
        res.status(200).json({ success: true, count: categories.length, data: categories });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve service categories for admin.' });
    }
};
exports.getAllServiceCategoriesAdmin = getAllServiceCategoriesAdmin;
const getServiceCategoryBySlug = async (req, res) => {
    try {
        const category = await ServiceCategory_1.default.findOne({ slug: req.params.slug });
        if (!category) {
            res.status(404).json({ success: false, message: 'Service category not found.' });
            return;
        }
        res.status(200).json({ success: true, data: category });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve service category.' });
    }
};
exports.getServiceCategoryBySlug = getServiceCategoryBySlug;
const createServiceCategory = async (req, res) => {
    try {
        const category = await ServiceCategory_1.default.create(req.body);
        res.status(201).json({ success: true, data: category });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Failed to create service category.' });
    }
};
exports.createServiceCategory = createServiceCategory;
const updateServiceCategory = async (req, res) => {
    try {
        const category = await ServiceCategory_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!category) {
            res.status(404).json({ success: false, message: 'Service category not found.' });
            return;
        }
        res.status(200).json({ success: true, data: category });
    }
    catch (error) {
        res.status(400).json({ success: false, message: 'Failed to update service category.' });
    }
};
exports.updateServiceCategory = updateServiceCategory;
const deleteServiceCategory = async (req, res) => {
    try {
        const category = await ServiceCategory_1.default.findByIdAndDelete(req.params.id);
        if (!category) {
            res.status(404).json({ success: false, message: 'Service category not found.' });
            return;
        }
        res.status(200).json({ success: true, message: 'Service category deleted successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete service category.' });
    }
};
exports.deleteServiceCategory = deleteServiceCategory;
