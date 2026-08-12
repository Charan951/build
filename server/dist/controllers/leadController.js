"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPipelineStats = exports.deleteLead = exports.updateLeadStatus = exports.getLeads = exports.importLeads = exports.createLead = void 0;
const Lead_1 = __importDefault(require("../models/Lead"));
const socketService_1 = require("../services/socketService");
const createLead = async (req, res) => {
    try {
        const lead = await Lead_1.default.create({
            ...req.body,
            ipAddress: req.ip || req.socket.remoteAddress,
        });
        // Trigger real-time socket alert to logged in admin users
        (0, socketService_1.notifyAdmins)('new_lead_received', {
            id: lead._id,
            name: lead.name,
            email: lead.email,
            projectType: lead.projectType,
            budgetRange: lead.budgetRange,
            createdAt: lead.createdAt,
        });
        res.status(201).json({
            success: true,
            message: 'Thank you for reaching out! Our engineering team will contact you within 24 hours.',
            data: lead,
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Failed to submit project inquiry.' });
    }
};
exports.createLead = createLead;
const importLeads = async (req, res) => {
    try {
        const { leads: leadsToImport } = req.body;
        if (!Array.isArray(leadsToImport) || leadsToImport.length === 0) {
            res.status(400).json({ success: false, message: 'No leads provided for import.' });
            return;
        }
        const createdLeads = await Lead_1.default.insertMany(leadsToImport.map((item) => ({
            name: item.Name || item.name || 'Unnamed Prospect',
            company: item.Company || item.company || '',
            email: item.Email || item.email || '',
            phone: item.Phone || item.phone || '',
            status: item.Stage || item.stage || item.status || 'New',
            source: item.Source || item.source || 'Other',
            estimatedValue: parseFloat(item['Estimated Value'] || item.estimatedValue || item.Value) || 0,
            followUpDate: item['Follow-up Date'] || item.followUpDate || '',
            assignedTo: item['Assigned To'] || item.assignedTo || 'Unassigned',
            notes: item.Notes || item.notes || '',
            wonAt: item['Won At'] || item.wonAt || null,
            convertedAt: item['Converted At'] || item.convertedAt || null,
            lostReason: item['Lost Reason'] || item.lostReason || '',
            createdAt: item['Created At'] || item.createdAt || new Date(),
        })));
        res.status(201).json({
            success: true,
            message: `Successfully imported ${createdLeads.length} leads.`,
            count: createdLeads.length,
            data: createdLeads,
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Failed to import leads.' });
    }
};
exports.importLeads = importLeads;
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
        const { status, stageId, estimatedValue, followUpDate, followUpTime, notes, source, assignedTo, company, phone, email, name, wonAt, convertedAt, lostReason } = req.body;
        const updateData = {};
        if (status !== undefined)
            updateData.status = status;
        if (stageId !== undefined)
            updateData.stageId = stageId;
        if (estimatedValue !== undefined)
            updateData.estimatedValue = estimatedValue;
        if (followUpDate !== undefined)
            updateData.followUpDate = followUpDate;
        if (followUpTime !== undefined)
            updateData.followUpTime = followUpTime;
        if (notes !== undefined)
            updateData.notes = notes;
        if (source !== undefined)
            updateData.source = source;
        if (assignedTo !== undefined)
            updateData.assignedTo = assignedTo;
        if (company !== undefined)
            updateData.company = company;
        if (phone !== undefined)
            updateData.phone = phone;
        if (email !== undefined)
            updateData.email = email;
        if (name !== undefined)
            updateData.name = name;
        if (wonAt !== undefined)
            updateData.wonAt = wonAt;
        if (convertedAt !== undefined)
            updateData.convertedAt = convertedAt;
        if (lostReason !== undefined)
            updateData.lostReason = lostReason;
        const lead = await Lead_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true });
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
const getPipelineStats = async (req, res) => {
    try {
        const allLeads = await Lead_1.default.find();
        const openLeads = allLeads.filter((l) => l.status?.toLowerCase() !== 'won' && l.status?.toLowerCase() !== 'lost');
        const openCount = openLeads.length;
        const pipelineValue = openLeads.reduce((acc, l) => acc + (l.estimatedValue || 0), 0);
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const wonThisMonth = allLeads.filter((l) => l.status?.toLowerCase() === 'won' &&
            l.updatedAt &&
            new Date(l.updatedAt) >= startOfMonth);
        const wonMonthlyValue = wonThisMonth.reduce((acc, l) => acc + (l.estimatedValue || 0), 0);
        const closedWon = allLeads.filter((l) => l.status?.toLowerCase() === 'won').length;
        const closedLost = allLeads.filter((l) => l.status?.toLowerCase() === 'lost').length;
        const totalClosed = closedWon + closedLost;
        const winRate = totalClosed > 0 ? Math.round((closedWon / totalClosed) * 100) : 0;
        res.status(200).json({
            success: true,
            data: {
                openCount,
                pipelineValue,
                wonMonthlyValue,
                winRate,
                totalLeads: allLeads.length
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getPipelineStats = getPipelineStats;
