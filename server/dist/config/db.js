"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/buildyourthoughts';
        const conn = await mongoose_1.default.connect(connStr);
        console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    }
    catch (error) {
        console.error(`[MongoDB Error] Failed to connect:`, error);
        // Don't exit process in dev mode to allow graceful API error handling
    }
};
exports.connectDB = connectDB;
