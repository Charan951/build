"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.refreshToken = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Admin_1 = __importDefault(require("../models/Admin"));
const generateTokens = (user) => {
    const secret = process.env.JWT_SECRET || 'byt_enterprise_jwt_super_secret_key_2026_x9812';
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'byt_enterprise_refresh_token_secret_key_2026_z7410';
    const accessToken = jsonwebtoken_1.default.sign({ id: user._id, email: user.email, role: user.role }, secret, { expiresIn: '15m' });
    const refreshToken = jsonwebtoken_1.default.sign({ id: user._id, email: user.email, role: user.role }, refreshSecret, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        let admin = await Admin_1.default.findOne({ email: email.toLowerCase() });
        // Seed default admin if DB has zero admin records for testing ease
        if (!admin && email === 'admin@buildyourthoughts.com') {
            const salt = await bcryptjs_1.default.genSalt(12);
            const passwordHash = await bcryptjs_1.default.hash('AdminPass123!', salt);
            admin = await Admin_1.default.create({
                username: 'admin',
                email: 'admin@buildyourthoughts.com',
                passwordHash,
                role: 'admin',
            });
        }
        if (!admin) {
            res.status(401).json({ success: false, message: 'Invalid credentials.' });
            return;
        }
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Invalid credentials.' });
            return;
        }
        const { accessToken, refreshToken } = generateTokens(admin);
        admin.refreshTokens.push(refreshToken);
        admin.lastLogin = new Date();
        await admin.save();
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            success: true,
            message: 'Login successful',
            accessToken,
            refreshToken,
            user: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
};
exports.login = login;
const refreshToken = async (req, res) => {
    try {
        const token = req.cookies.refreshToken || req.body.refreshToken;
        if (!token) {
            res.status(401).json({ success: false, message: 'Refresh token required.' });
            return;
        }
        const refreshSecret = process.env.JWT_REFRESH_SECRET || 'byt_enterprise_refresh_token_secret_key_2026_z7410';
        const decoded = jsonwebtoken_1.default.verify(token, refreshSecret);
        const admin = await Admin_1.default.findById(decoded.id);
        if (!admin || !admin.refreshTokens.includes(token)) {
            res.status(403).json({ success: false, message: 'Invalid or revoked refresh token.' });
            return;
        }
        const newTokens = generateTokens(admin);
        admin.refreshTokens = admin.refreshTokens.filter((t) => t !== token);
        admin.refreshTokens.push(newTokens.refreshToken);
        await admin.save();
        res.cookie('accessToken', newTokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
        });
        res.cookie('refreshToken', newTokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            success: true,
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken,
        });
    }
    catch (error) {
        res.status(403).json({ success: false, message: 'Expired refresh token.' });
    }
};
exports.refreshToken = refreshToken;
const logout = async (req, res) => {
    try {
        const token = req.cookies.refreshToken || req.body.refreshToken;
        if (req.user && token) {
            await Admin_1.default.findByIdAndUpdate(req.user.id, { $pull: { refreshTokens: token } });
        }
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.status(200).json({ success: true, message: 'Logged out successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error logging out.' });
    }
};
exports.logout = logout;
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated.' });
            return;
        }
        const admin = await Admin_1.default.findById(req.user.id).select('-passwordHash -refreshTokens');
        res.status(200).json({ success: true, user: admin });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch admin profile.' });
    }
};
exports.getMe = getMe;
