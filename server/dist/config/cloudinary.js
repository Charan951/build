"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'charan12',
    api_key: process.env.CLOUDINARY_API_KEY || '478681192216688',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'du1JrEvTmjfmDiDa-Yi9cfP4MWc',
    secure: true,
});
exports.default = cloudinary_1.v2;
