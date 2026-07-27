"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLead = exports.updateLeadStatus = exports.getLeads = exports.createLead = void 0;
const Lead_1 = __importDefault(require("../models/Lead"));
const createLead = async (req, res) => {
    try {
        const lead = await Lead_1.default.create({
            ...req.body,
            ipAddress: req.ip || req.socket.remoteAddress,
        });
        res.status(201).json({
            success: true,
            message: 'Thank you for reaching out! Our engineering team will contact you within 24 hours.',
            data: { id: lead._id },
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Failed to submit project inquiry.' });
    }
};
exports.createLead = createLead;
const getLeads = async (req, res) => {
    try {
        const leads = await Lead_1.default.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: leads.length, data: leads });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve leads.' });
    }
};
exports.getLeads = getLeads;
const updateLeadStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const lead = await Lead_1.default.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!lead) {
            res.status(404).json({ success: false, message: 'Lead not found.' });
            return;
        }
        res.status(200).json({ success: true, data: lead });
    }
    catch (error) {
        res.status(400).json({ success: false, message: 'Failed to update lead status.' });
    }
};
exports.updateLeadStatus = updateLeadStatus;
const deleteLead = async (req, res) => {
    try {
        const lead = await Lead_1.default.findByIdAndDelete(req.params.id);
        if (!lead) {
            res.status(404).json({ success: false, message: 'Lead not found.' });
            return;
        }
        res.status(200).json({ success: true, message: 'Lead successfully deleted.' });
    }
    catch (error) {
        res.status(400).json({ success: false, message: 'Failed to delete lead.' });
    }
};
exports.deleteLead = deleteLead;
