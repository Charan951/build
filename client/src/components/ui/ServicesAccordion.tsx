import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  Code,
  Layout,
  ShoppingCart,
  Bot,
  TrendingUp,
  Palette,
  ShieldCheck,
  Video,
  ChevronDown,
  Cpu,
  Layers,
  Globe
} from 'lucide-react';

const iconMap: Record<string, any> = {
  Layout,
  Code,
  ShoppingCart,
  Bot,
  TrendingUp,
  Palette,
  ShieldCheck,
  Video,
  Cpu,
  Layers,
  Globe
};

interface SubService {
  num: string;
  title: string;
  slug: string;
}

interface ServiceCategory {
  _id?: string;
  id?: string;
  num: string;
  title: string;
  description: string;
  icon: string | any;
  subServices: SubService[];
}

const fallbackCategories: ServiceCategory[] = [
  {
    num: '01',
    title: 'UI/UX & Product Design',
    description: 'User-centric interfaces, design systems, interactive prototypes, and conversion-optimized user experience.',
    icon: 'Layout',
    subServices: [
      { num: '01', title: 'UI/UX & PRODUCT DESIGN', slug: 'mobile-app-engineering' },
      { num: '02', title: 'DESIGN SYSTEMS & TOKENS', slug: 'enterprise-software-engineering' },
      { num: '03', title: 'INTERACTIVE PROTOTYPING', slug: 'mobile-app-engineering' },
      { num: '04', title: 'MOBILE APP UI DESIGN', slug: 'mobile-app-engineering' }
    ]
  },
  {
    num: '02',
    title: 'Web & Application Development',
    description: 'Robust, scalable, and lightning-fast web development solutions engineered using the latest modern tech stacks.',
    icon: 'Code',
    subServices: [
      { num: '01', title: 'REACT & NEXT.JS APPLICATION DEVELOPMENT', slug: 'enterprise-software-engineering' },
      { num: '02', title: 'MOBILE APP DEVELOPMENT (iOS & ANDROID)', slug: 'mobile-app-engineering' },
      { num: '03', title: 'CUSTOM WEB APPLICATION DEVELOPMENT', slug: 'enterprise-software-engineering' },
      { num: '04', title: 'SAAS PLATFORM DEVELOPMENT', slug: 'enterprise-software-engineering' },
      { num: '05', title: 'API & BACKEND DEVELOPMENT', slug: 'enterprise-software-engineering' },
      { num: '06', title: 'PROGRESSIVE WEB APPS (PWA)', slug: 'mobile-app-engineering' },
      { num: '07', title: 'FULL STACK PORTAL DEVELOPMENT', slug: 'enterprise-software-engineering' },
      { num: '08', title: 'ENTERPRISE ERP & CRM DEVELOPMENT', slug: 'enterprise-software-engineering' },
      { num: '09', title: 'HIGH-PERFORMANCE REDESIGN', slug: 'cloud-infrastructure-devops' },
      { num: '10', title: 'E-COMMERCE & RETAIL PLATFORMS', slug: 'enterprise-software-engineering' },
      { num: '11', title: 'EVENT BOOKING SYSTEM DEVELOPMENT', slug: 'enterprise-software-engineering' },
      { num: '12', title: 'AI & AGENTIC INTEGRATION', slug: 'generative-ai-ml' }
    ]
  },
  {
    num: '03',
    title: 'eCommerce & Conversion Systems',
    description: 'High-conversion online stores, multi-vendor marketplaces, and seamless payment integration engines.',
    icon: 'ShoppingCart',
    subServices: [
      { num: '01', title: 'HYPERLOCAL MULTI-VENDOR PLATFORMS', slug: 'enterprise-software-engineering' },
      { num: '02', title: 'CUSTOM CHECKOUT & PAYMENT GATEWAYS', slug: 'enterprise-software-engineering' },
      { num: '03', title: 'INVENTORY & ORDER MANAGEMENT', slug: 'enterprise-software-engineering' },
      { num: '04', title: 'MOBILE SHOPPING APPS (iOS & ANDROID)', slug: 'mobile-app-engineering' }
    ]
  },
  {
    num: '04',
    title: 'AI & Agentic Solutions 🔥',
    description: 'Custom LLM integrations, RAG vector search, autonomous AI agents, and real-time computer vision models.',
    icon: 'Bot',
    subServices: [
      { num: '01', title: 'CUSTOM AI AGENTS & RAG PIPELINES', slug: 'generative-ai-ml' },
      { num: '02', title: 'OPENAI & ANTHROPIC LLM INTEGRATIONS', slug: 'generative-ai-ml' },
      { num: '03', title: 'COMPUTER VISION & DIAGNOSTIC MODELS', slug: 'generative-ai-ml' },
      { num: '04', title: 'EMBEDDED AI WORKFLOWS', slug: 'generative-ai-ml' }
    ]
  },
  {
    num: '05',
    title: 'Growth Marketing & Performance',
    description: 'Data-driven SEO, conversion rate optimization, technical performance audit, and cloud infrastructure scaling.',
    icon: 'TrendingUp',
    subServices: [
      { num: '01', title: 'TECHNICAL SEO & SPEED OPTIMIZATION', slug: 'cloud-infrastructure-devops' },
      { num: '02', title: 'CONVERSION RATE OPTIMIZATION (CRO)', slug: 'enterprise-software-engineering' },
      { num: '03', title: 'ANALYTICS & ATTRIBUTION ENGINE', slug: 'cloud-infrastructure-devops' },
      { num: '04', title: 'APP STORE OPTIMIZATION (ASO)', slug: 'mobile-app-engineering' }
    ]
  },
  {
    id: '06',
    num: '06',
    title: 'Branding & Visual Identity',
    description: 'Brand strategy, logo creation, typography tokens, and complete brand design guidelines.',
    icon: Palette,
    subServices: [
      { num: '01', title: 'LOGO & VISUAL IDENTITY DESIGN', slug: 'mobile-app-engineering' },
      { num: '02', title: 'BRAND GUIDELINES & TYPOGRAPHY', slug: 'mobile-app-engineering' },
      { num: '03', title: 'DIGITAL ASSET CREATION', slug: 'mobile-app-engineering' },
      { num: '04', title: 'MARKETING COLLATERAL DESIGN', slug: 'mobile-app-engineering' }
    ]
  },
  {
    id: '07',
    num: '07',
    title: 'Website Maintenance & AMC',
    description: '24/7 technical monitoring, security patches, regular cloud backups, and SLA-backed engineering support.',
    icon: ShieldCheck,
    subServices: [
      { num: '01', title: '24/7 SLA TECHNICAL SUPPORT', slug: 'cloud-infrastructure-devops' },
      { num: '02', title: 'SECURITY PATCHES & AUDITS', slug: 'cloud-infrastructure-devops' },
      { num: '03', title: 'PERFORMANCE & UPTIME MONITORING', slug: 'cloud-infrastructure-devops' },
      { num: '04', title: 'CLOUD BACKUP MANAGEMENT', slug: 'cloud-infrastructure-devops' }
    ]
  },
  {
    id: '08',
    num: '08',
    title: 'Video Production & Animation',
    description: '3D motion graphics, product demo walkthroughs, interactive UI animations, and video editing.',
    icon: Video,
    subServices: [
      { num: '01', title: '3D MOTION GRAPHICS & RENDER', slug: 'mobile-app-engineering' },
      { num: '02', title: 'PRODUCT DEMO & APP WALKTHROUGHS', slug: 'mobile-app-engineering' },
      { num: '03', title: 'INTERACTIVE UI ANIMATION', slug: 'mobile-app-engineering' },
      { num: '04', title: 'PROMOTIONAL VIDEO EDITING', slug: 'mobile-app-engineering' }
    ]
  }
];

export const ServicesAccordion: React.FC = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>(fallbackCategories);
  const [activeId, setActiveId] = useState<string>('02');

  useEffect(() => {
    apiFetch('/service-categories')
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setCategories(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const toggleCategory = (num: string) => {
    setActiveId((prev) => (prev === num ? '' : num));
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {categories.map((cat, idx) => {
        const catKey = cat._id || cat.num || String(idx);
        const isActive = activeId === cat.num;
        const IconComponent = typeof cat.icon === 'string' ? (iconMap[cat.icon] || Code) : (cat.icon || Code);

        return (
          <div key={catKey} className="space-y-3">
            {/* Pill Header Bar */}
            <div
              onClick={() => toggleCategory(cat.num)}
              className={`rounded-full px-6 md:px-8 py-4 md:py-5 flex items-center justify-between cursor-pointer transition-all duration-300 shadow-sm ${
                isActive
                  ? 'bg-dark text-white border-2 border-dark shadow-xl scale-[1.01]'
                  : 'bg-white text-dark border border-slate-200/90 hover:border-dark/40 hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-center gap-4 md:gap-6">
                <span className={`text-sm font-black tracking-wider ${isActive ? 'text-primary' : 'text-slateText'}`}>
                  {cat.num}
                </span>
                <h3 className={`font-display text-base md:text-xl font-bold ${isActive ? 'text-white' : 'text-dark'}`}>
                  {cat.title}
                </h3>
              </div>

              <div
                className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${
                  isActive
                    ? 'bg-primary text-dark'
                    : 'bg-slate-100 text-dark group-hover:bg-dark group-hover:text-white'
                }`}
              >
                {isActive ? (
                  <IconComponent className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </div>

            {/* Accordion Body Content */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="overflow-hidden px-2 md:px-6"
                >
                  <div className="py-4 space-y-6">
                    {/* Description Text */}
                    <p className="text-slateText text-xs md:text-sm text-center max-w-2xl mx-auto font-semibold leading-relaxed">
                      {cat.description}
                    </p>

                    {/* Sub-Services Pill Buttons Grid (2 Columns) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto">
                      {cat.subServices?.map((sub: SubService, subIdx: number) => (
                        <Link
                          key={`${cat.num}-${subIdx}-${sub.slug || 'sub'}`}
                          to={`/services/${sub.slug}`}
                          className="group/sub rounded-full border border-slate-200/90 bg-white hover:border-primary hover:bg-slate-50 px-5 py-3.5 flex items-center justify-between shadow-sm hover:shadow transition-all duration-200"
                        >
                          <div className="flex items-center gap-3 truncate pr-2">
                            <span className="text-[10px] font-mono font-bold text-slateText">
                              {sub.num}
                            </span>
                            <span className="text-[11px] font-black text-dark tracking-wide uppercase truncate group-hover/sub:text-primary transition-colors">
                              {sub.title}
                            </span>
                          </div>
                          <div className="w-7 h-7 rounded-full bg-slate-100 group-hover/sub:bg-primary flex items-center justify-center shrink-0 transition-colors">
                            <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 group-hover/sub:text-dark transition-colors" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
