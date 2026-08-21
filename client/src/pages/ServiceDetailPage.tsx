import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { SEOHead } from '../components/seo/SEOHead';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LeadForm } from '../components/ui/LeadForm';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
  Smartphone,
  Cloud,
  Bot,
  Code2,
  ChevronRight,
  Check,
  Layers,
  Layout,
  Globe
} from 'lucide-react';

interface SubService {
  num: string;
  title: string;
  slug: string;
}

interface ServiceCategory {
  _id?: string;
  num: string;
  title: string;
  slug: string;
  description: string;
  subServices: SubService[];
}

export const ServiceDetailPage: React.FC = () => {
  const { slug: paramSlug, categorySlug } = useParams<{ slug?: string; categorySlug?: string }>();
  const activeSlug = paramSlug || categorySlug || 'ui-ux-product-design';

  const [service, setService] = useState<any>(null);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [parentCategory, setParentCategory] = useState<ServiceCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // 1. Fetch Service details by slug
    apiFetch(`/services/${activeSlug}`)
      .then((data) => {
        if (data.success && data.data) {
          setService(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // 2. Fetch Categories for sidebar sub-services list
    apiFetch('/service-categories')
      .then((data) => {
        if (data.success && data.data) {
          setCategories(data.data);
        }
      })
      .catch(() => {});
  }, [activeSlug]);

  useEffect(() => {
    if (categories.length > 0 && service) {
      // Find parent category matching service
      const matched = categories.find(
        (c) =>
          c.slug === activeSlug ||
          c.title.toLowerCase() === service.category?.toLowerCase() ||
          c.subServices?.some((sub) => sub.slug === activeSlug)
      ) || categories[0];
      setParentCategory(matched);
    }
  }, [categories, service, activeSlug]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center pt-32">
        <div className="w-10 h-10 border-4 border-dark/10 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="pt-36 max-w-4xl mx-auto px-6 text-center space-y-6 min-h-[60vh]">
        <h2 className="text-3xl font-display font-bold text-dark">Service Not Found</h2>
        <p className="text-slateText">The service capability you are looking for is unavailable.</p>
        <Link to="/services">
          <Button variant="lime" className="gap-2 font-bold">
            <ArrowLeft className="w-4 h-4" /> Back to All Services
          </Button>
        </Link>
      </div>
    );
  }

  const currentCategoryTitle = parentCategory?.title || service.category || 'UI/UX & Product Design';
  const sidebarSubServices = parentCategory?.subServices || [
    { num: '01', title: 'UI/UX & PRODUCT DESIGN', slug: 'ui-ux-product-design' },
    { num: '02', title: 'DESIGN SYSTEMS & TOKENS', slug: 'design-systems-tokens' },
    { num: '03', title: 'INTERACTIVE PROTOTYPING', slug: 'interactive-prototyping' },
    { num: '04', title: 'MOBILE APP UI DESIGN', slug: 'mobile-app-ui-design' }
  ];

  return (
    <div className="pt-24 pb-24 bg-background min-h-screen space-y-12">
      <SEOHead title={`${service.title} | Build Your Thoughts`} canonical={`https://buildyourthoughts.com/services/${activeSlug}`} />

      {/* Hero Header matching bhavyawebtech.com */}
      <div className="bg-dark text-white pt-28 pb-16 px-6 relative overflow-hidden border-b border-white/10 shadow-xl">
        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          {/* Breadcrumb Navigation */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-widest text-slateText">
            <Link to="/" className="hover:text-primary transition-colors">HOME</Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            <Link to="/services" className="hover:text-primary transition-colors">SERVICES</Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            <span className="text-primary">{currentCategoryTitle}</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            <span className="text-white truncate">{service.title}</span>
          </div>

          <div>
            <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">
              {service.title}
            </h1>
            <div className="w-20 h-1.5 bg-primary rounded-full mt-4" />
          </div>
        </div>
      </div>

      {/* Main 2-Column Body Layout */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT SIDEBAR COLUMN */}
          <div className="lg:col-span-4 space-y-8">
            {/* Sidebar Sub-Services Menu */}
            <div className="bg-white rounded-card border border-slate-200/90 shadow-soft p-6 space-y-6 sticky top-28">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[11px] font-black uppercase tracking-widest text-slateText block mb-1">
                  CATEGORY MENU
                </span>
                <h3 className="font-display text-lg font-black text-dark">
                  {currentCategoryTitle}
                </h3>
              </div>

              <div className="space-y-2">
                {sidebarSubServices.map((sub, idx) => {
                  const isCurrentActive =
                    sub.slug === activeSlug ||
                    sub.title.toLowerCase() === service.title.toLowerCase();

                  return (
                    <Link
                      key={idx}
                      to={`/services/${sub.slug}`}
                      className={`w-full px-4 py-3.5 rounded-2xl flex items-center justify-between text-xs font-bold transition-all duration-200 ${
                        isCurrentActive
                          ? 'bg-primary text-dark font-black shadow-md translate-x-1'
                          : 'bg-slate-50 text-dark hover:bg-dark hover:text-white'
                      }`}
                    >
                      <span className="truncate pr-2">{sub.title}</span>
                      <ChevronRight className={`w-4 h-4 shrink-0 ${isCurrentActive ? 'text-dark' : 'opacity-40'}`} />
                    </Link>
                  );
                })}
              </div>

              {/* Request a Proposal Form */}
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div>
                  <h4 className="font-display text-base font-black text-dark">Request a Proposal</h4>
                  <p className="text-xs text-slateText">Get a custom quote & architecture audit within 24 hours.</p>
                </div>

                <LeadForm
                  variant="compact"
                  messageLabel="Project Details"
                  messagePlaceholder="Brief details about your project scope..."
                  messageRequired={false}
                  submitLabel="Submit Request"
                  successDisplay="replace"
                  successReplaceMessage="Thank you! Our technical team will reach out to you shortly."
                  buildPayload={(v) => ({
                    name: v.name,
                    email: v.email,
                    phone: v.phone,
                    message: `Proposal Request for [${service?.title}]: ${v.message}`,
                    services: [service?.title || 'Custom Solution'],
                  })}
                />
              </div>
            </div>
          </div>

          {/* RIGHT MAIN CONTENT COLUMN */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Banner Mockup Image Card */}
            <div className="bg-white rounded-card border border-slate-200/90 shadow-soft overflow-hidden p-6 md:p-10 space-y-8">
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-dark relative shadow-inner">
                <img
                  src="https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=1200&q=80"
                  alt={service.title}
                  className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/40 to-transparent flex items-end p-8">
                  <div className="space-y-2">
                    <Badge variant="lime" className="text-dark font-black uppercase text-[10px]">
                      {currentCategoryTitle}
                    </Badge>
                    <h2 className="font-display text-2xl md:text-3xl font-black text-white">
                      Premium {service.title} Solutions
                    </h2>
                  </div>
                </div>
              </div>

              {/* Detailed Description */}
              <div className="space-y-4 text-slateText text-sm leading-relaxed font-sans">
                <p className="text-base text-dark font-bold leading-relaxed">
                  {service.shortDescription}
                </p>
                <p>
                  {service.fullDescription ||
                    `Elevate your digital presence with enterprise-grade ${service.title} services. At Build Your Thoughts, we engineer high-performing, scalable, and conversion-focused digital assets that drive tangible business growth and establish industry leadership.`}
                </p>
                <p>
                  Our approach to {service.title} combines innovative design systems with cutting-edge cloud technology, ensuring your platform is lightning-fast, ultra-secure, and optimized for maximum user engagement across all devices.
                </p>
              </div>

              {/* Technologies Grid */}
              {service.techStack && service.techStack.length > 0 && (
                <div className="pt-6 border-t border-slate-100">
                  <span className="text-xs font-black uppercase tracking-widest text-slateText block mb-3">
                    CORE TECH STACK & FRAMEWORKS
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {service.techStack.map((tech: string, i: number) => (
                      <span key={i} className="px-4 py-2 rounded-xl bg-slate-100 text-dark font-extrabold text-xs border border-slate-200/80">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Core Features Section */}
            <div className="space-y-6">
              <h3 className="font-display text-2xl font-black text-dark">
                Core Features & Capabilities
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(service.features?.length > 0 ? service.features : [
                  'Strategic Roadmap & Systems Architecture',
                  'Custom UI/UX Component System',
                  'High-Throughput API & Database Integration',
                  '100/100 Core Web Vitals & Speed Optimization'
                ]).map((feat: string, idx: number) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-dark" />
                    </div>
                    <h4 className="font-display text-base font-bold text-dark">{feat}</h4>
                    <p className="text-xs text-slateText">Engineered for high availability, security compliance, and zero cold starts.</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Why Partner With Us Section */}
            <div className="space-y-6">
              <h3 className="font-display text-2xl font-black text-dark">
                Why Partner With Build Your Thoughts?
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { title: 'High Availability SLA', desc: '99.999% uptime with cloud edge failover.' },
                  { title: 'Conversion UX Design', desc: 'Interfaces tuned for maximum lead velocity.' },
                  { title: 'Hardened Security', desc: 'Bank-grade encryption & OWASP compliance.' },
                  { title: 'Sub-second Latency', desc: 'Optimized asset delivery & zero latency.' },
                  { title: 'Responsive Cross-Device', desc: 'Pixel-perfect across desktop, tablet, and mobile.' },
                  { title: '24/7 SLA Support', desc: 'Dedicated senior engineers on standby.' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/90 space-y-2">
                    <div className="w-7 h-7 rounded-full bg-dark text-primary flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-dark">{item.title}</h4>
                    <p className="text-[11px] text-slateText">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Our Strategic Workflow Steps */}
            <div className="bg-white rounded-card border border-slate-200/90 shadow-soft p-8 space-y-8">
              <h3 className="font-display text-2xl font-black text-dark">
                Our Strategic Execution Workflow
              </h3>

              <div className="space-y-4">
                {[
                  { num: '01', title: 'In-Depth Requirement Analysis & Scoping', desc: 'Auditing legacy bottlenecks and mapping high-availability system architecture.' },
                  { num: '02', title: 'Wireframing, UX Design & Prototyping', desc: 'Crafting interactive prototypes and conversion-optimized user flows.' },
                  { num: '03', title: 'Agile Development & Sprint Execution', desc: 'Building modular microservices and frontend components with clean TypeScript code.' },
                  { num: '04', title: 'QA Testing, Security Audit & Production Launch', desc: 'Rigorous stress testing, security hardening, and zero-downtime deployment.' }
                ].map((step, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-4">
                    <span className="font-mono text-base font-black text-dark bg-primary px-3 py-1 rounded-xl shrink-0">
                      {step.num}
                    </span>
                    <div>
                      <h4 className="font-display text-base font-bold text-dark">{step.title}</h4>
                      <p className="text-xs text-slateText mt-1">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
