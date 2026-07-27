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
const ProjectSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    tagline: { type: String, required: true },
    client: { type: String, required: true },
    industry: { type: String, required: true },
    category: {
        type: String,
        enum: ['Enterprise', 'AI', 'Mobile', 'Cloud', 'UI/UX'],
        required: true,
    },
    summary: { type: String, required: true },
    heroImage: { type: String, required: true },
    challenge: { type: String, required: true },
    solution: { type: String, required: true },
    technicalArchitecture: { type: String, required: true },
    impactMetrics: [
        {
            label: { type: String, required: true },
            value: { type: String, required: true },
            description: { type: String },
        },
    ],
    techStack: [{ type: String }],
    gallery: [{ type: String }],
    websiteUrl: { type: String, default: 'https://www.buildyourthougths.in/' },
    playStoreUrl: { type: String, default: '' },
    appStoreUrl: { type: String, default: '' },
    location: { type: String, default: '' },
    testimonial: {
        quote: { type: String },
        author: { type: String },
        role: { type: String },
        company: { type: String },
        avatar: { type: String },
    },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
}, { timestamps: true });
exports.default = mongoose_1.default.model('Project', ProjectSchema);
