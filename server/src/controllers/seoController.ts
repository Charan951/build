import { Request, Response } from 'express';
import Project from '../models/Project';
import Service from '../models/Service';
import Blog from '../models/Blog';

export const getSitemap = async (req: Request, res: Response): Promise<void> => {
  try {
    const baseUrl = process.env.CLIENT_URL || 'https://buildyourthoughts.com';

    const projects = await Project.find({ status: 'published' }).select('slug updatedAt');
    const services = await Service.find({ isActive: true }).select('slug updatedAt');
    const blogs = await Blog.find({ isPublished: true }).select('slug updatedAt');

    const staticPages = ['', '/about', '/services', '/projects', '/blogs', '/contact'];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    staticPages.forEach((page) => {
      xml += `  <url>\n    <loc>${baseUrl}${page}</loc>\n    <changefreq>daily</changefreq>\n    <priority>${page === '' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
    });

    services.forEach((s: any) => {
      const lastMod = s.updatedAt ? new Date(s.updatedAt).toISOString() : new Date().toISOString();
      xml += `  <url>\n    <loc>${baseUrl}/services/${s.slug}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    projects.forEach((p: any) => {
      const lastMod = p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString();
      xml += `  <url>\n    <loc>${baseUrl}/projects/${p.slug}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <priority>0.9</priority>\n  </url>\n`;
    });

    blogs.forEach((b: any) => {
      const lastMod = b.updatedAt ? new Date(b.updatedAt).toISOString() : new Date().toISOString();
      xml += `  <url>\n    <loc>${baseUrl}/blogs/${b.slug}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (error) {
    res.status(500).send('Error generating sitemap');
  }
};

export const getRobots = (req: Request, res: Response): void => {
  const baseUrl = process.env.CLIENT_URL || 'https://buildyourthoughts.com';
  const txt = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /dashboard\nDisallow: /api/\n\nSitemap: ${baseUrl}/sitemap.xml\n`;

  res.header('Content-Type', 'text/plain');
  res.status(200).send(txt);
};
