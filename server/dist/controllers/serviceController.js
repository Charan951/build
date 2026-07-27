"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteService = exports.updateService = exports.createService = exports.getServiceBySlug = exports.getServices = void 0;
const Service_1 = __importDefault(require("../models/Service"));
const ServiceCategory_1 = __importDefault(require("../models/ServiceCategory"));
const seedInitialServices = async () => {
    const count = await Service_1.default.countDocuments();
    if (count === 0) {
        await Service_1.default.create([
            {
                title: 'Enterprise Software Engineering',
                slug: 'enterprise-software-engineering',
                shortDescription: 'Scalable microservices, robust API architectures, and mission-critical enterprise platforms built for high throughput.',
                fullDescription: 'We design and construct complex digital systems that power enterprise operations with zero downtime, resilient data pipelines, and strict security compliance.',
                icon: 'Cpu',
                category: 'Engineering',
                features: ['Event-driven Architecture', 'Database Sharding & Optimization', 'REST & GraphQL API Gateways', 'Zero-Downtime CI/CD Pipelines'],
                benefits: ['99.999% High Availability', 'Sub-second API response times', 'Enterprise-grade Security Compliance'],
                techStack: ['Node.js', 'Express', 'TypeScript', 'MongoDB', 'Redis', 'Docker'],
                processSteps: [
                    { title: 'Architecture Review', description: 'Auditing legacy bottlenecks and mapping high-availability system specs.' },
                    { title: 'Modular Build', description: 'Developing decoupled microservices with strict TypeScript static typing.' }
                ],
                isActive: true,
                order: 1
            },
            {
                title: 'Generative AI & Machine Learning',
                slug: 'generative-ai-ml',
                tagline: 'Custom LLM fine-tuning, RAG pipelines, and intelligent AI automation engines.',
                shortDescription: 'Transform raw data into autonomous AI agents, fine-tuned LLMs, and predictive analytical engines.',
                fullDescription: 'Leverage cutting-edge machine learning and generative AI workflows to automate complex business processes and deliver personalized experiences.',
                icon: 'Bot',
                category: 'AI & Data',
                features: ['RAG Vector Search Systems', 'Custom LLM Fine-Tuning', 'Computer Vision & Speech API Integration', 'Prompt Engineering Architecture'],
                benefits: ['10x Operational Efficiency', 'Automated Customer Support', 'Intelligent Document Processing'],
                techStack: ['Python', 'PyTorch', 'OpenAI API', 'LangChain', 'Pinecone', 'MongoDB'],
                processSteps: [
                    { title: 'Data Ingestion', description: 'Cleaning, structuring, and embedding enterprise knowledge bases.' },
                    { title: 'Model Training', description: 'Fine-tuning models on domain-specific datasets.' }
                ],
                isActive: true,
                order: 2
            },
            {
                title: 'Cloud Infrastructure & DevOps',
                slug: 'cloud-infrastructure-devops',
                shortDescription: 'AWS/Azure cloud migration, Kubernetes container orchestration, and automated infrastructure as code.',
                fullDescription: 'Achieve cloud elasticity and automated deployments with enterprise DevOps practices and hardened infrastructure.',
                icon: 'Cloud',
                category: 'Infrastructure',
                features: ['Kubernetes Orchestration', 'Terraform Infrastructure as Code', 'AWS Cloud Architecture', 'Automated Monitoring & Alerts'],
                benefits: ['Reduced Cloud Spend by 40%', 'Instant Auto-scaling', 'Automated Disaster Recovery'],
                techStack: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'Nginx', 'GitHub Actions'],
                processSteps: [
                    { title: 'Cloud Audit', description: 'Optimizing infrastructure topology and cost boundaries.' }
                ],
                isActive: true,
                order: 3
            },
            {
                title: 'Mobile App Engineering',
                slug: 'mobile-app-engineering',
                shortDescription: 'High-performance native and cross-platform Android & iOS applications built with fluid animations and offline sync.',
                fullDescription: 'We architect award-winning mobile experiences for iOS and Android. From real-time push notification pipelines and offline data persistence to seamless payment gateway integrations, we build apps that scale to millions of active users.',
                icon: 'Smartphone',
                category: 'Mobile App',
                features: [
                    'iOS & Android Cross-Platform Development',
                    'Offline-First Architecture & Data Sync',
                    'Biometric Security & Encrypted Keychains',
                    'Push Notifications & Real-Time WebSockets',
                    'App Store & Play Store Express Release'
                ],
                benefits: [
                    'Delivered in 5 Days Record Time',
                    '60fps Hardware Accelerated UI Motion',
                    'Complete Admin Panel Integration'
                ],
                techStack: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase', 'GraphQL'],
                processSteps: [
                    { title: 'UI/UX Wireframing', description: 'Designing pixel-perfect mobile interfaces tailored for iOS and Android.' },
                    { title: 'Native Engine Build', description: 'Coding robust state machines and native bridge integrations.' },
                    { title: 'App Store Submission', description: 'Managing deployment, certificate signing, and app store compliance.' }
                ],
                isActive: true,
                order: 4
            },
            {
                title: 'Custom Web Platforms',
                slug: 'custom-web-platforms',
                shortDescription: 'Ultra-fast Next.js/Vite web applications, custom headless CMS portals, and high-conversion e-commerce engines.',
                fullDescription: 'Construct lightning-fast web applications designed for maximum conversion and search engine dominance. Powered by SSR, ISR, and modern edge CDN infrastructure.',
                icon: 'Code2',
                category: 'Web',
                features: [
                    'Next.js 14 / Vite React Server Components',
                    'Sub-second Core Web Vitals Optimization',
                    'Headless CMS & Admin Dashboard Integration',
                    'Stripe / Razorpay Payment Engine'
                ],
                benefits: [
                    'Instant Page Load Times',
                    '100/100 Lighthouse SEO Score',
                    'Responsive Cross-Browser Perfection'
                ],
                techStack: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Node.js', 'PostgreSQL'],
                processSteps: [
                    { title: 'Design Tokens', description: 'Establishing atomic typography, color system, and component library.' },
                    { title: 'Production Deploy', description: 'Deploying edge-cached web applications with zero cold starts.' }
                ],
                isActive: true,
                order: 5
            }
        ]);
    }
};
const getServices = async (req, res) => {
    try {
        await seedInitialServices();
        const services = await Service_1.default.find({ isActive: true }).sort({ order: 1 });
        res.status(200).json({ success: true, count: services.length, data: services });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch services.' });
    }
};
exports.getServices = getServices;
const getServiceBySlug = async (req, res) => {
    try {
        let service = await Service_1.default.findOne({ slug: req.params.slug });
        if (!service) {
            // 1. Check if slug matches a ServiceCategory (e.g. ui-ux-product-design)
            const category = await ServiceCategory_1.default.findOne({ slug: req.params.slug });
            if (category) {
                service = await Service_1.default.create({
                    title: category.title,
                    slug: category.slug,
                    category: 'Category Overview',
                    shortDescription: category.description,
                    fullDescription: `Build Your Thoughts provides high-impact, custom ${category.title} solutions tailored for high-growth startups and enterprises. Designed with modern standards and SLA-backed engineering precision.`,
                    icon: category.icon || 'Code2',
                    features: category.subServices?.map((sub) => sub.title) || [
                        'High Performance & Sub-second Response Speeds',
                        'Enterprise Security Compliance & Hardened Architecture'
                    ],
                    benefits: [
                        'Accelerated Time to Market',
                        '100/100 Core Web Vitals Performance',
                        'Dedicated Senior Engineering & Design Team'
                    ],
                    techStack: ['Figma', 'React 19', 'TypeScript', 'Node.js', 'TailwindCSS'],
                    processSteps: [
                        { title: 'Discovery & Wireframing', description: 'Mapping user journeys and high-fidelity prototypes.' },
                        { title: 'System Build & Tokens', description: 'Developing design tokens and production components.' },
                        { title: 'Production Rollout', description: 'Deploying edge-cached applications with continuous monitoring.' }
                    ],
                    isActive: true,
                    order: category.order || 1
                });
            }
            else {
                // 2. Auto-generate dedicated service page object for this unique sub-service
                const formattedTitle = req.params.slug
                    .split('-')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                service = await Service_1.default.create({
                    title: formattedTitle,
                    slug: req.params.slug,
                    category: 'Development & Engineering',
                    shortDescription: `Custom ${formattedTitle} solutions engineered for enterprise growth, high throughput, and seamless performance.`,
                    fullDescription: `Build Your Thoughts delivers end-to-end ${formattedTitle} services tailored for high-growth startups and enterprise clients. Built with modern cloud-native architecture, sub-second API speeds, and 99.999% uptime availability.`,
                    icon: 'Code2',
                    features: [
                        'High Performance & Sub-second Response Speeds',
                        'Enterprise Security Compliance & Hardened Architecture',
                        'Decoupled Microservices & Clean TypeScript Codebase',
                        '24/7 SLA Technical Monitoring & Disaster Recovery'
                    ],
                    benefits: [
                        'Accelerated Time to Market',
                        '100/100 Core Web Vitals Performance',
                        'Dedicated Senior Engineering & Support Team'
                    ],
                    techStack: ['React 19', 'TypeScript', 'Node.js', 'MongoDB', 'Redis', 'AWS', 'TailwindCSS'],
                    processSteps: [
                        { title: 'Architecture & Specifications', description: 'Auditing legacy bottlenecks and mapping high-availability system specs.' },
                        { title: 'Modular Agile Build', description: 'Developing decoupled microservices with strict static typing.' },
                        { title: 'Production Launch & SLA', description: 'Deploying edge-cached applications with 24/7 continuous monitoring.' }
                    ],
                    isActive: true,
                    order: 99
                });
            }
        }
        res.status(200).json({ success: true, data: service });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch service details.' });
    }
};
exports.getServiceBySlug = getServiceBySlug;
const createService = async (req, res) => {
    try {
        const service = await Service_1.default.create(req.body);
        res.status(201).json({ success: true, data: service });
    }
    catch (error) {
        res.status(400).json({ success: false, message: 'Failed to create service.' });
    }
};
exports.createService = createService;
const updateService = async (req, res) => {
    try {
        const service = await Service_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!service) {
            res.status(404).json({ success: false, message: 'Service not found.' });
            return;
        }
        res.status(200).json({ success: true, data: service });
    }
    catch (error) {
        res.status(400).json({ success: false, message: 'Failed to update service.' });
    }
};
exports.updateService = updateService;
const deleteService = async (req, res) => {
    try {
        const service = await Service_1.default.findByIdAndDelete(req.params.id);
        if (!service) {
            res.status(404).json({ success: false, message: 'Service not found.' });
            return;
        }
        res.status(200).json({ success: true, message: 'Service deleted.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete service.' });
    }
};
exports.deleteService = deleteService;
