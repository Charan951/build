"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const LeadSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true, default: '' },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    projectType: { type: String, default: 'General Inquiry' },
    budgetRange: { type: String, default: 'Flexible' },
    message: { type: String, default: '' },
    status: { type: String, default: 'New' },
    stageId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'PipelineStage' },
    estimatedValue: { type: Number, default: 0 },
    source: { type: String, default: 'Other' },
    assignedTo: { type: String, default: 'Unassigned' },
    followUpDate: { type: Date },
    followUpTime: { type: String },
    notes: { type: String },
    wonAt: { type: Date },
    convertedAt: { type: Date },
    lostReason: { type: String },
    ipAddress: { type: String },
}, { timestamps: true });
LeadSchema.index({ name: 'text', company: 'text', email: 'text', phone: 'text' });
exports.default = mongoose_1.default.model('Lead', LeadSchema);
