import { Request, Response } from 'express';
import Blog from '../models/Blog';

const seedInitialBlogs = async () => {
  const count = await Blog.countDocuments();
  if (count === 0) {
    await Blog.create([
      {
        title: 'Architecting High-Throughput Node.js Microservices with MongoDB Atlas',
        slug: 'architecting-high-throughput-nodejs-mongodb',
        excerpt: 'A comprehensive guide on building zero-downtime, scalable Node.js microservices with distributed MongoDB connection pooling.',
        content: `
# Architecting High-Throughput Node.js Microservices

Building enterprise-grade Node.js services requires strict design patterns, non-blocking I/O event loops, and optimized database indexing.

## 1. Connection Pool Tuning
Always reuse MongoDB connection instances across serverless or containerized Express apps:

\`\`\`typescript
import mongoose from 'mongoose';

export const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI!, {
    maxPoolSize: 50,
    minPoolSize: 10,
  });
};
\`\`\`

## 2. Indexing Strategy
Compound indexes dramatically reduce query times on heavy read routes.
`,
        coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
        author: { name: 'Vikram Sharma', role: 'Principal Architect', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
        category: 'Engineering',
        tags: ['Node.js', 'MongoDB', 'Architecture', 'Performance'],
        readTime: '6 min read',
        isPublished: true,
        publishedAt: new Date(),
        seoTitle: 'High-Throughput Node.js Microservices | Build Your Thoughts',
        seoDescription: 'Learn how to architect high-throughput Node.js microservices with MongoDB Atlas and Redis caching.'
      },
      {
        title: 'Optimizing React 19 Canvas Performance for 60 FPS WebGL Animations',
        slug: 'optimizing-react-19-canvas-60fps-webgl',
        excerpt: 'How we achieved fluid 60 FPS performance on React Three Fiber particle scenes while maintaining low memory consumption.',
        content: `
# Optimizing React 19 Canvas Performance

Integrating 3D WebGL scenes into editorial marketing websites requires strict frame budgeting and memory disposal.

## Key Techniques:
- InstancedMesh for thousands of identical 3D geometries.
- OffscreenCanvas workers for heavy procedural particle calculations.
- Responsive DPR scaling to protect mobile GPU compute.
`,
        coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        author: { name: 'Anya Mehta', role: 'Lead Creative Technologist', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80' },
        category: 'Frontend & 3D',
        tags: ['React 19', 'Three.js', 'R3F', 'WebGL', 'Performance'],
        readTime: '8 min read',
        isPublished: true,
        publishedAt: new Date(),
        seoTitle: 'React 19 WebGL Performance Guide | Build Your Thoughts',
        seoDescription: 'Master 60 FPS 3D canvas animations in React 19 using React Three Fiber and Lenis smooth scrolling.'
      }
    ]);
  }
};

export const getBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    await seedInitialBlogs();
    const { category, tag } = req.query;
    const filter: any = { isPublished: true };

    if (category && category !== 'All') filter.category = category;
    if (tag) filter.tags = tag;

    const blogs = await Blog.find(filter).sort({ publishedAt: -1 });
    res.status(200).json({ success: true, count: blogs.length, data: blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch blogs.' });
  }
};

export const getBlogBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) {
      res.status(404).json({ success: false, message: 'Blog article not found.' });
      return;
    }
    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch blog article.' });
  }
};

export const createBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const blog = await Blog.create(req.body);
    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create blog.' });
  }
};

export const updateBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!blog) {
      res.status(404).json({ success: false, message: 'Blog article not found.' });
      return;
    }
    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update blog.' });
  }
};

export const deleteBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      res.status(404).json({ success: false, message: 'Blog article not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Blog deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete blog.' });
  }
};
