"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePricingPlan = exports.updatePricingPlan = exports.createPricingPlan = exports.getAllPricingPlansAdmin = exports.getPricingPlans = void 0;
const PricingPlan_1 = __importDefault(require("../models/PricingPlan"));
const seedInitialPricingPlans = async () => {
    const count = await PricingPlan_1.default.countDocuments();
    if (count === 0) {
        await PricingPlan_1.default.create([
            {
                name: 'Subscriptions Plan',
                price: '48,000',
                currency: '$',
                billingCycle: 'One-time payment',
                description: 'Ideal for early-stage validation and core mobile MVP launch.',
                features: [
                    'Permitted for Single domain',
                    'Android Customer App',
                    'Master Admin Panel',
                    'Website',
                    '3 Months Support',
                    'No Source Code Included',
                    'No Payment Gateway Integration'
                ],
                isPopular: false,
                buttonText: 'Get Started',
                buttonLink: '/contact',
                order: 1,
                isActive: true,
            },
            {
                name: 'Startup Plan',
                price: '89,000',
                currency: '$',
                billingCycle: 'One-time payment',
                description: 'Complete multi-app ecosystem for rapidly growing startup platforms.',
                features: [
                    'Permitted for Multiple domains',
                    'Android & iOS Apps for Customers',
                    'Android & iOS Apps for Sellers',
                    'Android & iOS Apps for Drivers',
                    'Master Admin Panel',
                    '6 Months Support',
                    'Complete Source Code Handover',
                    'Payment Gateway Integration'
                ],
                isPopular: true,
                buttonText: 'Choose This Plan',
                buttonLink: '/contact',
                order: 2,
                isActive: true,
            },
            {
                name: 'Enterprise Plan',
                price: '160,000',
                currency: '$',
                billingCycle: 'One-time payment',
                description: 'Full-scale custom engineering suite with dedicated architect team.',
                features: [
                    'Everything in Startup Plan',
                    'Dedicated Architect & Tech Lead',
                    'Advanced Analytical Dashboard',
                    '12 Months Enterprise Support',
                    'Priority SLA Support',
                    'Source Code Handover',
                    'Custom Gateway Integration'
                ],
                isPopular: false,
                buttonText: 'Contact Sales',
                buttonLink: '/contact',
                order: 3,
                isActive: true,
            },
        ]);
    }
    else {
        // Check if Subscriptions Plan needs updated features
        const subPlan = await PricingPlan_1.default.findOne({ name: 'Subscriptions Plan' });
        if (subPlan && subPlan.features.length === 6 && !subPlan.features.some(f => f.toLowerCase().startsWith('no '))) {
            subPlan.features = [
                'Permitted for Single domain',
                'Android Customer App',
                'Master Admin Panel',
                'Website',
                '3 Months Support',
                'No Source Code Included',
                'No Payment Gateway Integration'
            ];
            await subPlan.save();
        }
    }
};
const getPricingPlans = async (req, res) => {
    try {
        await seedInitialPricingPlans();
        const plans = await PricingPlan_1.default.find({ isActive: true }).sort({ order: 1 });
        res.status(200).json({ success: true, count: plans.length, data: plans });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch pricing plans.' });
    }
};
exports.getPricingPlans = getPricingPlans;
const getAllPricingPlansAdmin = async (req, res) => {
    try {
        const plans = await PricingPlan_1.default.find().sort({ order: 1 });
        res.status(200).json({ success: true, count: plans.length, data: plans });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch plans for admin.' });
    }
};
exports.getAllPricingPlansAdmin = getAllPricingPlansAdmin;
const createPricingPlan = async (req, res) => {
    try {
        const plan = await PricingPlan_1.default.create(req.body);
        res.status(201).json({ success: true, data: plan });
    }
    catch (error) {
        res.status(400).json({ success: false, message: 'Failed to create pricing plan.' });
    }
};
exports.createPricingPlan = createPricingPlan;
const updatePricingPlan = async (req, res) => {
    try {
        const plan = await PricingPlan_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!plan) {
            res.status(404).json({ success: false, message: 'Pricing plan not found.' });
            return;
        }
        res.status(200).json({ success: true, data: plan });
    }
    catch (error) {
        res.status(400).json({ success: false, message: 'Failed to update pricing plan.' });
    }
};
exports.updatePricingPlan = updatePricingPlan;
const deletePricingPlan = async (req, res) => {
    try {
        const plan = await PricingPlan_1.default.findByIdAndDelete(req.params.id);
        if (!plan) {
            res.status(404).json({ success: false, message: 'Pricing plan not found.' });
            return;
        }
        res.status(200).json({ success: true, message: 'Pricing plan deleted.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete pricing plan.' });
    }
};
exports.deletePricingPlan = deletePricingPlan;
