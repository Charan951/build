"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const socketService_1 = require("./services/socketService");
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    await (0, db_1.connectDB)();
    const server = http_1.default.createServer(app_1.default);
    (0, socketService_1.initSocketServer)(server);
    server.listen(PORT, () => {
        console.log(`[Server] Build Your Thoughts API & Socket Engine running on http://localhost:${PORT}`);
    });
};
startServer();
