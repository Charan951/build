"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlatformSolution = exports.updatePlatformSolution = exports.createPlatformSolution = exports.getAllPlatformSolutionsAdmin = exports.getPlatformSolutions = void 0;
const PlatformSolution_1 = __importDefault(require("../models/PlatformSolution"));
const seedInitialPlatformSolutions = async () => {
    const count = await PlatformSolution_1.default.countDocuments();
    if (count === 0) {
        await PlatformSolution_1.default.create([
            {
                title: 'Food Delivery Platform',
                slug: 'food-delivery-platform',
                description: 'Build a restaurant network platform like Swiggy and Zomato with seamless ordering.',
                features: [
                    'Restaurant Management',
                    'Real-time Order Tracking',
                    'Delivery Boy Apps',
                    'Rating & Review System'
                ],
                ctaText: 'BOOK FREE CONSULTATION',
                ctaLink: '/contact',
                badge: 'On-Demand',
                isHighlighted: false,
                order: 1,
                isActive: true
            },
            {
                title: 'Ride Sharing Platform',
                slug: 'ride-sharing-platform',
                description: 'Create a cab network platform like OLA & Uber with advanced booking features.',
                features: [
                    'GPS Navigation Integration',
                    'Driver Management System',
                    'Dynamic Pricing',
                    'Multi-payment Options'
                ],
                ctaText: 'BOOK FREE CONSULTATION',
                ctaLink: '/contact',
                badge: 'Most Popular',
                isHighlighted: true,
                order: 2,
                isActive: true
            },
            {
                title: 'Grocery Platform',
                slug: 'grocery-platform',
                description: 'Build a comprehensive grocery platform like Grofers with fresh delivery features.',
                features: [
                    'Fresh Product Management',
                    'Scheduled Delivery',
                    'Subscription Services',
                    'Quality Assurance'
                ],
                ctaText: 'BOOK FREE CONSULTATION',
                ctaLink: '/contact',
                badge: 'Hyperlocal',
                isHighlighted: false,
                order: 3,
                isActive: true
            },
            {
                title: 'E-Commerce Marketplace',
                slug: 'ecommerce-marketplace',
                description: 'Multi-vendor e-commerce platform with automated inventory and instant checkout.',
                features: [
                    'Multi-Vendor Dashboard',
                    'Stripe & Razorpay Integration',
                    'Automated Inventory Alerts',
                    'Wishlist & Cart Engine'
                ],
                ctaText: 'BOOK FREE CONSULTATION',
                ctaLink: '/contact',
                badge: 'Enterprise',
                isHighlighted: false,
                order: 4,
                isActive: true
            },
            {
                title: 'HealthTech & Telemedicine',
                slug: 'healthtech-telemedicine',
                description: 'HIPAA-compliant doctor appointment and video consultation ecosystem.',
                features: [
                    'Doctor Appointment Booking',
                    'HD Video Teleconsultation',
                    'Digital Prescription System',
                    'Electronic Health Records (EHR)'
                ],
                ctaText: 'BOOK FREE CONSULTATION',
                ctaLink: '/contact',
                badge: 'Healthcare',
                isHighlighted: false,
                order: 5,
                isActive: true
            }
        ]);
    }
};
const getPlatformSolutions = async (req, res) => {
    try {
        await seedInitialPlatformSolutions();
        const solutions = await PlatformSolution_1.default.find({ isActive: true }).sort({ order: 1 });
        res.status(200).json({ success: true, count: solutions.length, data: solutions });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch platform solutions.' });
    }
};
exports.getPlatformSolutions = getPlatformSolutions;
const getAllPlatformSolutionsAdmin = async (req, res) => {
    try {
        const solutions = await PlatformSolution_1.default.find().sort({ order: 1 });
        res.status(200).json({ success: true, count: solutions.length, data: solutions });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch platform solutions for admin.' });
    }
};
exports.getAllPlatformSolutionsAdmin = getAllPlatformSolutionsAdmin;
const createPlatformSolution = async (req, res) => {
    try {
        const { title } = req.body;
        const slug = req.body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const solution = await PlatformSolution_1.default.create({ ...req.body, slug });
        res.status(201).json({ success: true, data: solution });
    }
    catch (error) {
        res.status(400).json({ success: false, message: 'Failed to create platform solution.' });
    }
};
exports.createPlatformSolution = createPlatformSolution;
const updatePlatformSolution = async (req, res) => {
    try {
        const solution = await PlatformSolution_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!solution) {
            res.status(404).json({ success: false, message: 'Platform solution not found.' });
            return;
        }
        res.status(200).json({ success: true, data: solution });
    }
    catch (error) {
        res.status(400).json({ success: false, message: 'Failed to update platform solution.' });
    }
};
exports.updatePlatformSolution = updatePlatformSolution;
const deletePlatformSolution = async (req, res) => {
    try {
        const solution = await PlatformSolution_1.default.findByIdAndDelete(req.params.id);
        if (!solution) {
            res.status(404).json({ success: false, message: 'Platform solution not found.' });
            return;
        }
        res.status(200).json({ success: true, message: 'Platform solution deleted.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete platform solution.' });
    }
};
exports.deletePlatformSolution = deletePlatformSolution;
