"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRobots = exports.getSitemap = void 0;
const Project_1 = __importDefault(require("../models/Project"));
const Service_1 = __importDefault(require("../models/Service"));
const Blog_1 = __importDefault(require("../models/Blog"));
const getSitemap = async (req, res) => {
    try {
        const baseUrl = process.env.CLIENT_URL || 'https://buildyourthoughts.com';
        const projects = await Project_1.default.find({ status: 'published' }).select('slug updatedAt');
        const services = await Service_1.default.find({ isActive: true }).select('slug updatedAt');
        const blogs = await Blog_1.default.find({ isPublished: true }).select('slug updatedAt');
        const staticPages = ['', '/about', '/services', '/projects', '/blogs', '/contact'];
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
        staticPages.forEach((page) => {
            xml += `  <url>\n    <loc>${baseUrl}${page}</loc>\n    <changefreq>daily</changefreq>\n    <priority>${page === '' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
        });
        services.forEach((s) => {
            const lastMod = s.updatedAt ? new Date(s.updatedAt).toISOString() : new Date().toISOString();
            xml += `  <url>\n    <loc>${baseUrl}/services/${s.slug}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <priority>0.8</priority>\n  </url>\n`;
        });
        projects.forEach((p) => {
            const lastMod = p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString();
            xml += `  <url>\n    <loc>${baseUrl}/projects/${p.slug}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <priority>0.9</priority>\n  </url>\n`;
        });
        blogs.forEach((b) => {
            const lastMod = b.updatedAt ? new Date(b.updatedAt).toISOString() : new Date().toISOString();
            xml += `  <url>\n    <loc>${baseUrl}/blogs/${b.slug}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <priority>0.7</priority>\n  </url>\n`;
        });
        xml += `</urlset>`;
        res.header('Content-Type', 'application/xml');
        res.status(200).send(xml);
    }
    catch (error) {
        res.status(500).send('Error generating sitemap');
    }
};
exports.getSitemap = getSitemap;
const getRobots = (req, res) => {
    const baseUrl = process.env.CLIENT_URL || 'https://buildyourthoughts.com';
    const txt = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /dashboard\nDisallow: /api/\n\nSitemap: ${baseUrl}/sitemap.xml\n`;
    res.header('Content-Type', 'text/plain');
    res.status(200).send(txt);
};
exports.getRobots = getRobots;
