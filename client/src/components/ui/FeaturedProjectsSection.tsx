import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Monitor,
  Smartphone,
  ExternalLink,
  Globe,
  ArrowUpRight
} from 'lucide-react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { SectionHeader } from './SectionHeader';

export interface ProjectItem {
  title: string;
  slug: string;
  tagline?: string;
  industry?: string;
  client?: string;
  category: string;
  summary: string;
  heroImage: string;
  techStack?: string[];
  websiteUrl?: string;
  playStoreUrl?: string;
  appStoreUrl?: string;
  location?: string;
}

const DEFAULT_FEATURED_PROJECTS: ProjectItem[] = [
  {
    title: 'Enterprise Fintech NeoBank Engine',
    slug: 'fintech-neobank-engine',
    tagline: 'Transforming Banking with High-Throughput Microservices',
    client: 'GlobalPay Solutions',
    industry: 'FinTech & Banking',
    category: 'Enterprise',
    summary: 'Architected and built a modern cloud-native banking API platform handling 50,000+ transactions per second with sub-10ms latency.',
    heroImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    techStack: ['Node.js', 'React', 'TypeScript', 'MongoDB', 'Redis', 'AWS'],
    websiteUrl: 'https://www.buildyourthougths.in/',
    playStoreUrl: 'https://play.google.com/store',
    appStoreUrl: 'https://apps.apple.com',
    location: 'Kota, India',
  },
  {
    title: 'AI Diagnostic Assistant Platform',
    slug: 'ai-diagnostic-assistant',
    tagline: 'Generative AI for Clinical Radiography Workflows',
    client: 'MedTech Innovation',
    industry: 'Healthcare AI',
    category: 'AI',
    summary: 'Built an FDA-compliant diagnostic portal using computer vision models to highlight abnormalities in MRI scans in real time.',
    heroImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    techStack: ['React 19', 'Python', 'PyTorch', 'MongoDB', 'Cloudinary', 'TailwindCSS'],
    websiteUrl: 'https://www.buildyourthougths.in/',
    playStoreUrl: 'https://play.google.com/store',
    appStoreUrl: 'https://apps.apple.com',
    location: 'San Francisco, USA',
  },
  {
    title: 'Multi-Vendor Hyperlocal Delivery Platform',
    slug: 'hyperlocal-delivery-platform',
    tagline: '5-Day Quick Commerce Engine & Driver Fleet Management',
    client: 'UrbanExpress Logistics',
    industry: 'E-Commerce & Logistics',
    category: 'Mobile',
    summary: 'End-to-end multi-app ecosystem including Customer iOS/Android app, Store Manager dashboard, and GPS-enabled Courier app.',
    heroImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80',
    techStack: ['React Native', 'Node.js', 'Express', 'MongoDB Atlas', 'Socket.io', 'Google Maps API'],
    websiteUrl: 'https://www.buildyourthougths.in/',
    playStoreUrl: 'https://play.google.com/store',
    appStoreUrl: 'https://apps.apple.com',
    location: 'Bangalore, India',
  },
];

interface FeaturedProjectsSectionProps {
  projects?: ProjectItem[];
  showHeadings?: boolean;
  showViewAllBtn?: boolean;
}

export const FeaturedProjectsSection: React.FC<FeaturedProjectsSectionProps> = ({
  projects,
  showHeadings = true,
  showViewAllBtn = true,
}) => {
  const navigate = useNavigate();
  const displayProjects =
    projects && projects.length > 0 ? projects : DEFAULT_FEATURED_PROJECTS;

  return (
    <section className="max-w-7xl mx-auto px-6 space-y-12">
      {showHeadings && (
        <SectionHeader
          badge="Projects"
          title="Our Latest Projects"
          subtitle="Recent technical solutions engineered for clients across FinTech, AI, and Mobile."
        />
      )}

      {/* ========================================================================= */}
      {/* MOBILE VIEW: Sticky Stacked Cards Animation ("One Card Over Another Card") */}
      {/* ========================================================================= */}
      <div className="block md:hidden relative space-y-0 pb-12">
        <p className="text-center text-xs font-bold uppercase tracking-wider text-primary mb-4 animate-pulse">
          ↓ Scroll down to view stacked cards
        </p>

        {displayProjects.map((proj, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            onClick={() => navigate(`/projects/${proj.slug}`)}
            className="sticky cursor-pointer group rounded-3xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden transition-all duration-300 transform active:scale-[0.98]"
            style={{
              // Sticky top offset creates an overlapping deck effect as you scroll down
              top: `${95 + idx * 16}px`,
              zIndex: idx + 10,
              marginBottom: idx === displayProjects.length - 1 ? '0px' : '44px',
            }}
          >
            {/* Card Content Body */}
            <div className="p-5 space-y-4 bg-white">
              <div className="flex items-center justify-between">
                <Badge variant="dark">{proj.category}</Badge>
                <span className="text-xs font-mono font-bold text-gray-400">
                  0{idx + 1} / 0{displayProjects.length}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-display text-lg font-extrabold text-dark group-hover:text-primary transition-colors leading-snug line-clamp-1">
                  {proj.title}
                </h3>
                <p className="text-xs font-semibold text-slateText line-clamp-1">
                  {proj.tagline || proj.industry}
                </p>
                {proj.location && (
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium pt-0.5">
                    <MapPin className="w-3 h-3 text-primary shrink-0" /> {proj.location}
                  </div>
                )}
              </div>

              <p className="text-slateText text-xs leading-relaxed line-clamp-2">
                {proj.summary}
              </p>

              {/* Tech Stack Box */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-dark uppercase tracking-wider">
                  <Monitor className="w-3.5 h-3.5 text-dark" /> TECH STACK
                </div>
                <p className="text-[11px] font-mono text-slateText font-medium leading-relaxed line-clamp-2">
                  {proj.techStack?.join(', ')}
                </p>
              </div>

              {/* Horizontal Single Line 3 Links Row */}
              <div className="flex flex-row items-center gap-1.5 w-full pt-1 flex-nowrap">
                {proj.playStoreUrl && (
                  <a
                    href={proj.playStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 min-w-0 px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-dark flex items-center justify-center gap-1 transition-all whitespace-nowrap"
                  >
                    <Smartphone className="w-3 h-3 shrink-0" /> <span className="truncate">Google Play</span>
                  </a>
                )}
                {proj.appStoreUrl && (
                  <a
                    href={proj.appStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 min-w-0 px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-dark flex items-center justify-center gap-1 transition-all whitespace-nowrap"
                  >
                    <Smartphone className="w-3 h-3 shrink-0" /> <span className="truncate">App Store</span>
                  </a>
                )}
                <a
                  href={proj.websiteUrl || 'https://www.buildyourthougths.in/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 min-w-0 px-2 py-1.5 rounded-xl bg-lime-50 text-dark border border-lime-300 hover:bg-lime-100 text-[10px] font-bold flex items-center justify-center gap-1 transition-all whitespace-nowrap"
                >
                  <Globe className="w-3 h-3 text-primary shrink-0" /> <span className="truncate">Website</span>
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP VIEW: Responsive 2 & 3 Column Grid */}
      {/* ========================================================================= */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayProjects.map((proj, idx) => (
          <div
            key={idx}
            onClick={() => navigate(`/projects/${proj.slug}`)}
            className="block h-full cursor-pointer group"
          >
            <Card className="p-6 flex flex-col justify-between h-full rounded-3xl border border-slate-200/90 hover:shadow-xl transition-all duration-300 space-y-4">
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="dark">{proj.category}</Badge>
                    <div className="w-7 h-7 rounded-full bg-dark text-white flex items-center justify-center group-hover:bg-primary group-hover:text-dark transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-display text-xl font-extrabold text-dark group-hover:text-primary transition-colors line-clamp-1">
                      {proj.title}
                    </h3>
                    <p className="text-sm font-semibold text-slateText line-clamp-1">
                      {proj.tagline || proj.industry}
                    </p>
                    {proj.location && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium pt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-primary" /> {proj.location}
                      </div>
                    )}
                  </div>

                  <p className="text-slateText text-sm leading-relaxed line-clamp-2">
                    {proj.summary}
                  </p>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-dark uppercase tracking-wider">
                      <Monitor className="w-4 h-4 text-dark" /> TECH STACK
                    </div>
                    <p className="text-xs font-mono text-slateText font-medium leading-relaxed line-clamp-2">
                      {proj.techStack?.join(', ')}
                    </p>
                  </div>
                </div>

                {/* Single Line Horizontal 3 Links Row */}
                <div className="flex flex-row items-center gap-2 pt-2 w-full flex-nowrap">
                  {proj.playStoreUrl && (
                    <a
                      href={proj.playStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 min-w-0 px-2.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-dark text-[11px] font-bold text-dark flex items-center justify-center gap-1 shadow-sm hover:shadow transition-all whitespace-nowrap"
                    >
                      <Smartphone className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Google Play</span> <ExternalLink className="w-3 h-3 text-gray-400 shrink-0" />
                    </a>
                  )}

                  {proj.appStoreUrl && (
                    <a
                      href={proj.appStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 min-w-0 px-2.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-dark text-[11px] font-bold text-dark flex items-center justify-center gap-1 shadow-sm hover:shadow transition-all whitespace-nowrap"
                    >
                      <Smartphone className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">App Store</span> <ExternalLink className="w-3 h-3 text-gray-400 shrink-0" />
                    </a>
                  )}

                  <a
                    href={proj.websiteUrl || 'https://www.buildyourthougths.in/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 min-w-0 px-2.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-primary text-[11px] font-bold text-dark flex items-center justify-center gap-1 shadow-sm hover:shadow transition-all whitespace-nowrap"
                  >
                    <Globe className="w-3.5 h-3.5 text-primary shrink-0" /> <span className="truncate">Website</span> <ExternalLink className="w-3 h-3 text-gray-400 shrink-0" />
                  </a>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {showViewAllBtn && (
        <div className="text-center pt-6">
          <Link to="/projects">
            <Button variant="secondary" size="lg">
              View All Projects
            </Button>
          </Link>
        </div>
      )}
    </section>
  );
};
