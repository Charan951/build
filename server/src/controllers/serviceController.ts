import { Request, Response } from 'express';
import Service from '../models/Service';

const seedInitialServices = async () => {
  const count = await Service.countDocuments();
  if (count === 0) {
    await Service.create([
      {
        title: 'Enterprise Software Engineering',
        slug: 'enterprise-software-engineering',
        shortDescription: 'Scalable microservices, robust API architectures, and mission-critical enterprise platforms built for high throughput.',
        fullDescription: 'We design and construct complex digital systems that power enterprise operations with zero downtime, resilient data pipelines, and strict security compliance.',
        icon: 'Cpu',
        category: 'Engineering',
        features: ['Event-driven Architecture', 'Database Sharding & Optimization', 'REST & GraphQL API Gateways', 'Zero-Downtime CI/CD Pipelines'],
        benefits: ['99.999% High Availability', 'Sub-second API response times', 'Enterprise-grade Security Compliance'],
        techStack: ['Node.js', 'Express', 'TypeScript', 'MongoDB', 'Redis', 'Docker'],
        processSteps: [
          { title: 'Architecture Review', description: 'Auditing legacy bottlenecks and mapping high-availability system specs.' },
          { title: 'Modular Build', description: 'Developing decoupled microservices with strict TypeScript static typing.' }
        ],
        isActive: true,
        order: 1
      },
      {
        title: 'Generative AI & Machine Learning',
        slug: 'generative-ai-ml',
        tagline: 'Custom LLM fine-tuning, RAG pipelines, and intelligent AI automation engines.',
        shortDescription: 'Transform raw data into autonomous AI agents, fine-tuned LLMs, and predictive analytical engines.',
        fullDescription: 'Leverage cutting-edge machine learning and generative AI workflows to automate complex business processes and deliver personalized experiences.',
        icon: 'Bot',
        category: 'AI & Data',
        features: ['RAG Vector Search Systems', 'Custom LLM Fine-Tuning', 'Computer Vision & Speech API Integration', 'Prompt Engineering Architecture'],
        benefits: ['10x Operational Efficiency', 'Automated Customer Support', 'Intelligent Document Processing'],
        techStack: ['Python', 'PyTorch', 'OpenAI API', 'LangChain', 'Pinecone', 'MongoDB'],
        processSteps: [
          { title: 'Data Ingestion', description: 'Cleaning, structuring, and embedding enterprise knowledge bases.' },
          { title: 'Model Training', description: 'Fine-tuning models on domain-specific datasets.' }
        ],
        isActive: true,
        order: 2
      },
      {
        title: 'Cloud Infrastructure & DevOps',
        slug: 'cloud-infrastructure-devops',
        shortDescription: 'AWS/Azure cloud migration, Kubernetes container orchestration, and automated infrastructure as code.',
        fullDescription: 'Achieve cloud elasticity and automated deployments with enterprise DevOps practices and hardened infrastructure.',
        icon: 'Cloud',
        category: 'Infrastructure',
        features: ['Kubernetes Orchestration', 'Terraform Infrastructure as Code', 'AWS Cloud Architecture', 'Automated Monitoring & Alerts'],
        benefits: ['Reduced Cloud Spend by 40%', 'Instant Auto-scaling', 'Automated Disaster Recovery'],
        techStack: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'Nginx', 'GitHub Actions'],
        processSteps: [
          { title: 'Cloud Audit', description: 'Optimizing infrastructure topology and cost boundaries.' }
        ],
        isActive: true,
        order: 3
      },
      {
        title: 'Mobile App Engineering',
        slug: 'mobile-app-engineering',
        shortDescription: 'High-performance native and cross-platform Android & iOS applications built with fluid animations and offline sync.',
        fullDescription: 'We architect award-winning mobile experiences for iOS and Android. From real-time push notification pipelines and offline data persistence to seamless payment gateway integrations, we build apps that scale to millions of active users.',
        icon: 'Smartphone',
        category: 'Mobile App',
        features: [
          'iOS & Android Cross-Platform Development',
          'Offline-First Architecture & Data Sync',
          'Biometric Security & Encrypted Keychains',
          'Push Notifications & Real-Time WebSockets',
          'App Store & Play Store Express Release'
        ],
        benefits: [
          'Delivered in 5 Days Record Time',
          '60fps Hardware Accelerated UI Motion',
          'Complete Admin Panel Integration'
        ],
        techStack: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase', 'GraphQL'],
        processSteps: [
          { title: 'UI/UX Wireframing', description: 'Designing pixel-perfect mobile interfaces tailored for iOS and Android.' },
          { title: 'Native Engine Build', description: 'Coding robust state machines and native bridge integrations.' },
          { title: 'App Store Submission', description: 'Managing deployment, certificate signing, and app store compliance.' }
        ],
        isActive: true,
        order: 4
      },
      {
        title: 'Custom Web Platforms',
        slug: 'custom-web-platforms',
        shortDescription: 'Ultra-fast Next.js/Vite web applications, custom headless CMS portals, and high-conversion e-commerce engines.',
        fullDescription: 'Construct lightning-fast web applications designed for maximum conversion and search engine dominance. Powered by SSR, ISR, and modern edge CDN infrastructure.',
        icon: 'Code2',
        category: 'Web',
        features: [
          'Next.js 14 / Vite React Server Components',
          'Sub-second Core Web Vitals Optimization',
          'Headless CMS & Admin Dashboard Integration',
          'Stripe / Razorpay Payment Engine'
        ],
        benefits: [
          'Instant Page Load Times',
          '100/100 Lighthouse SEO Score',
          'Responsive Cross-Browser Perfection'
        ],
        techStack: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Node.js', 'PostgreSQL'],
        processSteps: [
          { title: 'Design Tokens', description: 'Establishing atomic typography, color system, and component library.' },
          { title: 'Production Deploy', description: 'Deploying edge-cached web applications with zero cold starts.' }
        ],
        isActive: true,
        order: 5
      }
    ]);
  }
};

export const getServices = async (req: Request, res: Response): Promise<void> => {
  try {
    await seedInitialServices();
    const services = await Service.find({ isActive: true }).sort({ order: 1 });
    res.status(200).json({ success: true, count: services.length, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch services.' });
  }
};

export const getServiceBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await Service.findOne({ slug: req.params.slug, isActive: true });
    if (!service) {
      res.status(404).json({ success: false, message: 'Service not found.' });
      return;
    }
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch service details.' });
  }
};

export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create service.' });
  }
};

export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) {
      res.status(404).json({ success: false, message: 'Service not found.' });
      return;
    }
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update service.' });
  }
};

export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      res.status(404).json({ success: false, message: 'Service not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Service deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete service.' });
  }
};
