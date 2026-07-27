"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.createProject = exports.getProjectBySlug = exports.getProjects = void 0;
const Project_1 = __importDefault(require("../models/Project"));
const defaultProjects = [
    {
        title: 'Enterprise Fintech NeoBank Engine',
        slug: 'fintech-neobank-engine',
        tagline: 'Transforming Banking with High-Throughput Microservices',
        client: 'GlobalPay Solutions',
        industry: 'Fintech & Banking',
        category: 'Enterprise',
        summary: 'Architected and built a modern cloud-native banking API platform handling 50,000+ transactions per second with sub-10ms latency.',
        heroImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        challenge: 'Legacy core banking infrastructure caused frequent downtime, slow batch processing, and inability to handle peak holiday traffic surges.',
        solution: 'Migrated monolithic database to distributed MongoDB Atlas clusters, implemented event-driven Node.js microservices with Redis caching and automated failover.',
        technicalArchitecture: 'Node.js, Express, TypeScript, MongoDB Atlas, Redis, Kafka, Docker, Kubernetes on AWS EC2.',
        impactMetrics: [
            { label: 'Throughput', value: '50K TPS', description: 'Sustained transaction speed' },
            { label: 'Latency', value: '< 8ms', description: '99.9th percentile response time' },
            { label: 'Uptime', value: '99.999%', description: 'Zero unplanned outages' }
        ],
        techStack: ['Node.js', 'React', 'TypeScript', 'MongoDB', 'Redis', 'AWS'],
        websiteUrl: 'https://www.buildyourthougths.in/',
        playStoreUrl: 'https://play.google.com/store',
        appStoreUrl: 'https://apps.apple.com',
        location: 'Kota, India',
        gallery: [
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'
        ],
        status: 'published',
        featured: true,
        order: 1
    },
    {
        title: 'AI Diagnostic Assistant Platform',
        slug: 'ai-diagnostic-assistant',
        tagline: 'Generative AI for Clinical Radiography Workflows',
        client: 'MedTech Innovation Health',
        industry: 'Healthcare AI',
        category: 'AI',
        summary: 'Built an FDA-compliant diagnostic portal using computer vision models to highlight abnormalities in MRI scans in real time.',
        heroImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
        challenge: 'Radiologists suffered from diagnostic backlog with average scan turnarounds exceeding 48 hours for non-emergency patients.',
        solution: 'Developed an end-to-end web portal in React 19 and Python FastAPI, incorporating real-time WebGL canvas rendering for DICOM images.',
        technicalArchitecture: 'React 19, Python, PyTorch, DICOM WebGL Renderer, MongoDB, Cloudinary CDN.',
        impactMetrics: [
            { label: 'Turnaround', value: '-75%', description: 'Reduced wait time from 48h to 12h' }
        ],
        techStack: ['React 19', 'Python', 'PyTorch', 'MongoDB', 'Cloudinary', 'TailwindCSS'],
        websiteUrl: 'https://www.buildyourthougths.in/',
        playStoreUrl: 'https://play.google.com/store',
        appStoreUrl: 'https://apps.apple.com',
        location: 'San Francisco, USA',
        gallery: [
            'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80'
        ],
        status: 'published',
        featured: true,
        order: 2
    },
    {
        title: 'Enterprise HRMS & Payroll System',
        slug: 'enterprise-hrms-payroll-system',
        tagline: 'Automated HR Operations, Attendance & Global Payroll',
        client: 'TalentOps Enterprise',
        industry: 'HR Technology',
        category: 'Enterprise',
        summary: 'End-to-end HR management suite with automated payroll processing, biometric attendance sync, employee self-service portal, and tax compliance.',
        heroImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
        challenge: 'Manual payroll calculations and fragmented employee records caused payroll processing delays and compliance risks.',
        solution: 'Architected an automated HRMS cloud platform with role-based access control, direct bank payout APIs, and real-time attendance tracking.',
        technicalArchitecture: 'React 19, Node.js, Express, MongoDB Atlas, Redis, AWS Lambda, Docker.',
        impactMetrics: [
            { label: 'Time Saved', value: '80%', description: 'Automated monthly payroll run' }
        ],
        techStack: ['React 19', 'Node.js', 'Express', 'MongoDB', 'Redis', 'AWS'],
        websiteUrl: 'https://www.buildyourthougths.in/',
        playStoreUrl: 'https://play.google.com/store',
        appStoreUrl: 'https://apps.apple.com',
        location: 'Bangalore, India',
        gallery: [],
        status: 'published',
        featured: true,
        order: 3
    },
    {
        title: 'Smart Hospital & EHR Management System',
        slug: 'smart-hospital-ehr-management',
        tagline: 'Connected Digital Health Ecosystem & Electronic Health Records',
        client: 'Apollo MedCare Network',
        industry: 'Healthcare',
        category: 'Enterprise',
        summary: 'Comprehensive hospital management platform integrating patient admission, OPD/IPD billing, pharmacy inventory, lab reports, and doctor scheduling.',
        heroImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
        challenge: 'Paper-based medical records and slow lab reporting caused long patient wait times and billing bottlenecks.',
        solution: 'Built a cloud EHR platform with instant digital lab dispatch, HL7/FHIR healthcare standards compliance, and real-time bed availability tracking.',
        technicalArchitecture: 'React 19, Python, FastAPI, PostgreSQL, Redis, Docker, GCP.',
        impactMetrics: [
            { label: 'Patient Queue', value: '-60%', description: 'Faster OPD registration' }
        ],
        techStack: ['React 19', 'Python', 'FastAPI', 'PostgreSQL', 'Docker', 'GCP'],
        websiteUrl: 'https://www.buildyourthougths.in/',
        playStoreUrl: 'https://play.google.com/store',
        appStoreUrl: 'https://apps.apple.com',
        location: 'Mumbai, India',
        gallery: [],
        status: 'published',
        featured: true,
        order: 4
    },
    {
        title: 'Hyperlocal E-Commerce & Retail Engine',
        slug: 'hyperlocal-ecommerce-retail-engine',
        tagline: 'Multi-Vendor E-Commerce Platform with Instant Checkout',
        client: 'ShopSmart Retail',
        industry: 'E-Commerce',
        category: 'Mobile',
        summary: 'Next-generation multi-vendor shopping platform featuring live product search, coupon engine, integrated payment gateways, and seller inventory sync.',
        heroImage: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80',
        challenge: 'Slow page speed and cart abandonment during flash sale events.',
        solution: 'Engineered a high-performance shopping app with sub-second page loads, Redis cart caching, and one-click Stripe payment gateway integration.',
        technicalArchitecture: 'Flutter, React Native, Node.js, MongoDB Atlas, Redis, Stripe.',
        impactMetrics: [
            { label: 'Sales Growth', value: '+140%', description: 'Increase in mobile checkout orders' }
        ],
        techStack: ['Flutter', 'React Native', 'Node.js', 'MongoDB', 'Stripe', 'Redis'],
        websiteUrl: 'https://www.buildyourthougths.in/',
        playStoreUrl: 'https://play.google.com/store',
        appStoreUrl: 'https://apps.apple.com',
        location: 'Delhi, India',
        gallery: [],
        status: 'published',
        featured: true,
        order: 5
    },
    {
        title: 'Global Event Ticketing & Management Portal',
        slug: 'global-event-ticketing-management',
        tagline: 'Live Event Management, Digital Passports & QR Access Control',
        client: 'EventXperience Global',
        industry: 'Event Tech',
        category: 'Enterprise',
        summary: 'End-to-end live event management platform with automated seat selection, instant QR ticket generation, organizer analytics, and check-in scanner apps.',
        heroImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
        challenge: 'Venue gate bottlenecks and counterfeit PDF tickets during mega concerts and corporate summits.',
        solution: 'Deployed encrypted dynamic QR code tickets with offline scanner apps that validate attendees in under 200 milliseconds.',
        technicalArchitecture: 'React 19, Next.js, Node.js, Express, MongoDB Atlas, WebSockets.',
        impactMetrics: [
            { label: 'Gate Speed', value: '200ms', description: 'Instant QR ticket verification' }
        ],
        techStack: ['React 19', 'Next.js', 'Node.js', 'MongoDB', 'WebSockets', 'AWS'],
        websiteUrl: 'https://www.buildyourthougths.in/',
        playStoreUrl: 'https://play.google.com/store',
        appStoreUrl: 'https://apps.apple.com',
        location: 'Dubai, UAE',
        gallery: [],
        status: 'published',
        featured: true,
        order: 6
    },
    {
        title: 'Agri Care & Precision Farming App',
        slug: 'agri-care-precision-farming',
        tagline: 'AI Crop Disease Detection & Smart Soil Health Monitoring',
        client: 'AgriTech Innovations',
        industry: 'AgriTech',
        category: 'Mobile',
        summary: 'Mobile application for farmers providing AI-driven crop disease diagnostics via photo scan, weather alerts, soil sensor telemetry, and direct marketplace connectivity.',
        heroImage: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80',
        challenge: 'Lack of real-time crop disease detection led to significant harvest losses for smallholder farmers.',
        solution: 'Trained lightweight computer vision models integrated into an offline-first mobile app that identifies leaf blights in seconds.',
        technicalArchitecture: 'Flutter, Python, TensorFlow Lite, FastAPI, MongoDB, GCP.',
        impactMetrics: [
            { label: 'Yield Increase', value: '+35%', description: 'Improved crop harvest recovery' }
        ],
        techStack: ['Flutter', 'Python', 'TensorFlow', 'FastAPI', 'MongoDB', 'GCP'],
        websiteUrl: 'https://www.buildyourthougths.in/',
        playStoreUrl: 'https://play.google.com/store',
        appStoreUrl: 'https://apps.apple.com',
        location: 'Pune, India',
        gallery: [],
        status: 'published',
        featured: true,
        order: 7
    },
    {
        title: 'Medic Care Teleconsultation & Pharmacy Platform',
        slug: 'medic-care-teleconsultation-pharmacy',
        tagline: 'Instant Doctor Video Consultation & Online Medicine Delivery',
        client: 'MedicCare Health',
        industry: 'Healthcare AI',
        category: 'AI',
        summary: 'Integrated telecare ecosystem providing 24/7 HD video doctor consultations, AI symptom checker, online prescription refills, and door-step medicine delivery.',
        heroImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
        challenge: 'Remote patients struggled with long specialist travel times and uncoordinated prescription fulfillment.',
        solution: 'Delivered an all-in-one telehealth platform with WebRTC video calling, automated AI symptom triaging, and local pharmacy delivery logistics.',
        technicalArchitecture: 'React Native, Node.js, WebRTC, OpenAI GPT-4 API, MongoDB Atlas, AWS.',
        impactMetrics: [
            { label: 'Consultations', value: '100K+', description: 'Video appointments completed' }
        ],
        techStack: ['React Native', 'Node.js', 'WebRTC', 'OpenAI GPT-4', 'MongoDB', 'AWS'],
        websiteUrl: 'https://www.buildyourthougths.in/',
        playStoreUrl: 'https://play.google.com/store',
        appStoreUrl: 'https://apps.apple.com',
        location: 'Hyderabad, India',
        gallery: [],
        status: 'published',
        featured: true,
        order: 8
    }
];
const seedInitialProjects = async () => {
    for (const proj of defaultProjects) {
        const existing = await Project_1.default.findOne({ slug: proj.slug });
        if (!existing) {
            await Project_1.default.create(proj);
        }
        else {
            // Update default URLs & fields if missing
            await Project_1.default.updateOne({ slug: proj.slug }, { $set: proj });
        }
    }
};
const getProjects = async (req, res) => {
    try {
        await seedInitialProjects();
        const { category, featured, status } = req.query;
        const filter = {};
        if (category && category !== 'All')
            filter.category = category;
        if (featured === 'true')
            filter.featured = true;
        if (status)
            filter.status = status;
        else
            filter.status = 'published'; // Default to public view
        const projects = await Project_1.default.find(filter).sort({ order: 1, createdAt: -1 });
        res.status(200).json({ success: true, count: projects.length, data: projects });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve projects.' });
    }
};
exports.getProjects = getProjects;
const getProjectBySlug = async (req, res) => {
    try {
        const project = await Project_1.default.findOne({ slug: req.params.slug });
        if (!project) {
            res.status(404).json({ success: false, message: 'Project not found.' });
            return;
        }
        res.status(200).json({ success: true, data: project });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve project details.' });
    }
};
exports.getProjectBySlug = getProjectBySlug;
const createProject = async (req, res) => {
    try {
        const project = await Project_1.default.create(req.body);
        res.status(201).json({ success: true, data: project });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Failed to create project.' });
    }
};
exports.createProject = createProject;
const updateProject = async (req, res) => {
    try {
        const project = await Project_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!project) {
            res.status(404).json({ success: false, message: 'Project not found.' });
            return;
        }
        res.status(200).json({ success: true, data: project });
    }
    catch (error) {
        res.status(400).json({ success: false, message: 'Failed to update project.' });
    }
};
exports.updateProject = updateProject;
const deleteProject = async (req, res) => {
    try {
        const project = await Project_1.default.findByIdAndDelete(req.params.id);
        if (!project) {
            res.status(404).json({ success: false, message: 'Project not found.' });
            return;
        }
        res.status(200).json({ success: true, message: 'Project deleted successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete project.' });
    }
};
exports.deleteProject = deleteProject;
