import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useAnimationFrame, useVelocity, useSpring } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  Cpu,
  Cloud,
  Smartphone,
  Sparkles,
  ShieldCheck,
  Zap,
  ChevronDown,
  Layers,
  Bot,
  Database,
  CheckCircle2,
  Star,
  Building2,
  HeartPulse,
  Landmark,
  ShoppingBag,
  GraduationCap,
  Sprout,
  Rocket,
  FolderGit2,
  TrendingUp,
  Users,
  Store,
  Truck,
  Settings,
  Globe,
  ExternalLink,
  MapPin,
  Monitor
} from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/ui/SectionHeader';
import { PlatformSolutionsCarousel } from '../components/ui/PlatformSolutionsCarousel';
import { ReviewsSection } from '../components/ui/ReviewsSection';
import { PricingPlansSection } from '../components/ui/PricingPlansSection';
import { ServicesAccordion } from '../components/ui/ServicesAccordion';
import { FeaturedProjectsSection } from '../components/ui/FeaturedProjectsSection';
import { HeroCanvas } from '../components/3d/HeroCanvas';
import { apiFetch } from '../services/api';

interface AutoMarqueeProps {
  children: React.ReactNode;
  baseVelocity: number;
  className?: string;
}

const AutoScrollMarqueeRow: React.FC<AutoMarqueeProps> = ({ children, baseVelocity = -0.04, className = '' }) => {
  const baseX = useRef(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 2], { clamp: false });

  const containerRef = useRef<HTMLDivElement>(null);

  useAnimationFrame((_, delta) => {
    let moveBy = baseVelocity * (delta / 16);
    const vf = velocityFactor.get();

    if (baseVelocity < 0) {
      moveBy -= vf * 0.05;
    } else {
      moveBy += vf * 0.05;
    }

    baseX.current += moveBy;

    if (baseX.current <= -50) {
      baseX.current = 0;
    } else if (baseX.current >= 0) {
      baseX.current = -50;
    }

    if (containerRef.current) {
      containerRef.current.style.transform = `translateX(${baseX.current}%)`;
    }
  });

  return (
    <div className="overflow-hidden whitespace-nowrap flex w-full">
      <div ref={containerRef} className={`flex items-center whitespace-nowrap gap-12 will-change-transform ${className}`}>
        <div className="flex items-center gap-12 shrink-0">{children}</div>
        <div className="flex items-center gap-12 shrink-0">{children}</div>
      </div>
    </div>
  );
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [techTab, setTechTab] = useState<'frontend' | 'backend' | 'cloud' | 'ai'>('frontend');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [projects, setProjects] = useState<any[]>([]);
  const [activePkg, setActivePkg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePkg((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Scroll marquee animation hooks
  const marqueeRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: marqueeRef,
    offset: ['start end', 'end start'],
  });

  // Upper line moves LEFT on scroll down (5% -> -30%), RIGHT on scroll up
  // Lower line moves RIGHT on scroll down (-35% -> 5%), LEFT on scroll up
  const xUpper = useTransform(scrollYProgress, [0, 1], ['5%', '-30%']);
  const xLower = useTransform(scrollYProgress, [0, 1], ['-35%', '5%']);

  useEffect(() => {
    apiFetch('/projects?featured=true')
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setProjects(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const stats = [
    { value: '150+', label: 'Projects Delivered' },
    { value: '75+', label: 'Enterprise Clients' },
    { value: '12+', label: 'Countries Served' },
    { value: '99%', label: 'Client Satisfaction' },
  ];

  const services = [
    {
      title: 'Enterprise Software',
      slug: 'enterprise-software-engineering',
      desc: 'High-throughput microservices, API gateways, and distributed event-driven systems.',
      icon: Cpu,
      techs: ['Node.js', 'Express', 'TypeScript', 'MongoDB'],
    },
    {
      title: 'Generative AI & LLMs',
      slug: 'generative-ai-ml',
      desc: 'Custom RAG vector search, autonomous AI agents, and LLM fine-tuning pipelines.',
      icon: Bot,
      techs: ['Python', 'PyTorch', 'OpenAI', 'LangChain'],
    },
    {
      title: 'Mobile App Engineering',
      slug: 'mobile-app-engineering',
      desc: 'Cross-platform native iOS & Android applications with dynamic offline sync.',
      icon: Smartphone,
      techs: ['React Native', 'Flutter', 'iOS', 'Android'],
    },
    {
      title: 'Cloud Architecture & DevOps',
      slug: 'cloud-infrastructure-devops',
      desc: 'Terraform IaC, AWS infrastructure automation, and Kubernetes orchestration.',
      icon: Cloud,
      techs: ['AWS', 'Kubernetes', 'Docker', 'Terraform'],
    },
    {
      title: 'Custom Web Platforms',
      slug: 'custom-web-platforms',
      desc: 'Award-winning glassmorphism interfaces, Lenis smooth scrolling, and 3D WebGL scenes.',
      icon: Layers,
      techs: ['React 19', 'Three.js', 'R3F', 'Framer Motion'],
    },
    {
      title: 'Digital Transformation',
      slug: 'enterprise-software-engineering',
      desc: 'Legacy monolith modernization, cloud migration, and enterprise security auditing.',
      icon: ShieldCheck,
      techs: ['Node.js', 'MongoDB Atlas', 'JWT', 'Redis'],
    },
  ];

  const techStack = {
    frontend: ['React 19', 'TypeScript', 'Vite', 'TailwindCSS', 'Framer Motion', 'Three.js / R3F', 'Lenis Scroll'],
    backend: ['Node.js', 'Express.js', 'TypeScript', 'MongoDB Atlas', 'Mongoose', 'Redis', 'JWT Auth'],
    cloud: ['AWS EC2', 'AWS S3', 'Docker', 'Nginx', 'Cloudinary CDN', 'Vercel', 'Kubernetes'],
    ai: ['Python', 'PyTorch', 'OpenAI GPT-4', 'LangChain', 'Pinecone Vector DB', 'FastAPI'],
  };

  const workflow = [
    { step: '01', title: 'Discover', desc: 'Requirements analysis and system scope planning.' },
    { step: '02', title: 'Research', desc: 'Architecture design and technology selection.' },
    { step: '03', title: 'Design', desc: 'Editorial UX, glass UI tokens, and 3D mockups.' },
    { step: '04', title: 'Development', desc: 'Strict TypeScript modular code implementation.' },
    { step: '05', title: 'Testing', desc: 'Automated Vitest, Supertest, and E2E security audit.' },
    { step: '06', title: 'Deployment', desc: 'Production release on AWS EC2 & Vercel.' },
  ];

  const industries = [
    { name: 'Fintech & Banking', icon: Landmark },
    { name: 'Healthcare AI', icon: HeartPulse },
    { name: 'E-Commerce & Retail', icon: ShoppingBag },
    { name: 'EdTech & Learning', icon: GraduationCap },
    { name: 'AgriTech', icon: Sprout },
    { name: 'Enterprise SaaS', icon: Building2 },
  ];

  const faqs = [
    {
      q: 'What technologies do you specialize in?',
      a: 'We specialize in modern enterprise web & mobile tech stacks: React 19, TypeScript, Node.js, Express, MongoDB Atlas, Three.js, Framer Motion, Python AI models, and AWS Cloud infrastructure.',
    },
    {
      q: 'How long does a typical software project take to deliver?',
      a: 'Initial MVPs and phase-1 agency builds typically launch within 6 to 10 weeks depending on scope, with iterative weekly deployment milestones.',
    },
    {
      q: 'Do you provide ongoing support and maintenance after release?',
      a: 'Yes, we offer 24/7 SLA maintenance, automated security updates, continuous integration monitoring, and cloud cost optimization.',
    },
    {
      q: 'How does your Headless CMS work?',
      a: 'Our website comes integrated with a dedicated Node/Express + MongoDB Headless CMS allowing your team to manage Case Studies, Services, Technical Blogs, and Contact Leads in real time without touching code.',
    },
  ];

  return (
    <div className="pt-24 md:pt-32 space-y-20 md:space-y-28">
      <SEOHead title="Build Your Thoughts | Enterprise Software & AI Solutions Agency" />

      {/* SECTION 3: Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-dark leading-[1.12]">
              <span className="font-black">Build Your Dream App</span> <br />
              <span className="text-[#65A30D] underline decoration-primary decoration-4 font-black">in Just 5 Days</span>
            </h1>
            <p className="text-lg md:text-xl text-slateText max-w-2xl mx-auto lg:mx-0 font-sans leading-relaxed">
              Complete MVP applications with website, admin panel, Android & iOS apps delivered in record time.
            </p>

          {/* Main Hero CTA Buttons (Full 100% width on mobile, auto on tablet/desktop) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-4 w-full">
            <Link to="/contact" className="w-full sm:w-auto">
              <Button variant="lime" size="lg" className="w-full justify-center gap-2.5 py-4 text-base font-bold shadow-soft">
                <Rocket className="w-5 h-5 text-dark" />
                Start Your Project
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/projects" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full justify-center gap-2.5 py-4 text-base font-bold shadow-glass">
                <FolderGit2 className="w-5 h-5 text-dark" />
                Explore Projects
                <ArrowUpRight className="w-5 h-5 text-gray-500" />
              </Button>
            </Link>
          </div>

          {/* Mobile Highlights Card & Side-by-Side CTA Buttons (Visible on Mobile < 1024px) */}
          <div className="lg:hidden pt-4 space-y-4">
            {/* Highlights Grid with Increased Font Sizes */}
            <div className="grid grid-cols-3 gap-2 p-5 rounded-2xl bg-dark text-white border border-white/10 shadow-glass text-center">
              <div className="space-y-1">
                <span className="font-display text-2xl sm:text-3xl font-black text-primary block">100+</span>
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block">Apps Built</span>
              </div>
              <div className="space-y-1 border-x border-white/10 px-1">
                <span className="font-display text-2xl sm:text-3xl font-black text-primary block">5 Days</span>
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block">Delivery</span>
              </div>
              <div className="space-y-1">
                <span className="font-display text-2xl sm:text-3xl font-black text-primary block">24/7</span>
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block">Support</span>
              </div>
            </div>

            {/* Side-by-Side Action Buttons for Get Quotation & Start Your Journey with Icons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link to="/contact" className="w-full">
                <Button variant="primary" size="md" className="w-full justify-center gap-1.5 py-3.5 px-2 text-xs sm:text-sm font-bold border border-primary/40 bg-dark hover:bg-dark/80 text-white shadow-soft">
                  <Sparkles className="w-4 h-4 text-primary shrink-0" />
                  <span>Get Quotation</span>
                </Button>
              </Link>

              <Link to="/contact" className="w-full">
                <Button variant="lime" size="md" className="w-full justify-center gap-1.5 py-3.5 px-2 text-xs sm:text-sm font-bold shadow-soft">
                  <Rocket className="w-4 h-4 text-dark shrink-0" />
                  <span>Start Journey</span>
                  <ArrowRight className="w-3.5 h-3.5 text-dark shrink-0 hidden sm:inline" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Desktop 3D Canvas Scene */}
        <div className="hidden lg:block lg:col-span-5 relative">
          <HeroCanvas />
        </div>
        </div>
      </section>

      {/* SECTION 4: Dual-Line Auto & Scroll Marquee */}
      <section className="bg-dark py-14 overflow-hidden border-y border-white/10 space-y-6">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-primary/90 mb-2">
          Trusted by Technology Leaders & High-Growth Enterprises
        </p>

        {/* Upper Line - Moves LEFT continuously when idle & accelerates on scroll */}
        <AutoScrollMarqueeRow baseVelocity={-0.04} className="text-2xl md:text-3xl font-display font-extrabold text-gray-300/90 select-none">
          <span>APPLE DEVELOPER</span>
          <span className="text-primary">•</span>
          <span>AWS CLOUD</span>
          <span className="text-primary">•</span>
          <span>FIREBASE</span>
          <span className="text-primary">•</span>
          <span>GITHUB</span>
          <span className="text-primary">•</span>
          <span>GOOGLE PLAY</span>
          <span className="text-primary">•</span>
          <span>META</span>
          <span className="text-primary">•</span>
          <span>RAZORPAY</span>
          <span className="text-primary">•</span>
          <span>SHIPROCKET</span>
          <span className="text-primary">•</span>
          <span>STRIPE</span>
          <span className="text-primary">•</span>
        </AutoScrollMarqueeRow>

        {/* Lower Line - Moves RIGHT continuously when idle & accelerates on scroll */}
        <AutoScrollMarqueeRow baseVelocity={0.04} className="text-2xl md:text-3xl font-display font-extrabold text-gray-500/80 select-none">
          <span>STRIPE</span>
          <span className="text-primary">•</span>
          <span>SHIPROCKET</span>
          <span className="text-primary">•</span>
          <span>RAZORPAY</span>
          <span className="text-primary">•</span>
          <span>META</span>
          <span className="text-primary">•</span>
          <span>GOOGLE PLAY</span>
          <span className="text-primary">•</span>
          <span>GITHUB</span>
          <span className="text-primary">•</span>
          <span>FIREBASE</span>
          <span className="text-primary">•</span>
          <span>AWS CLOUD</span>
          <span className="text-primary">•</span>
          <span>APPLE DEVELOPER</span>
          <span className="text-primary">•</span>
        </AutoScrollMarqueeRow>
      </section>

      {/* SECTION 5: Why Build Your Thoughts Auto-Scrolling Carousel Section */}
      <section className="max-w-7xl mx-auto px-6 space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-[#65A30D] px-3 py-1 rounded-full bg-[#65A30D]/10 border border-[#65A30D]/20 inline-block">
            Why Choose Us
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-black text-dark tracking-tight">
            Why Build Your Thoughts?
          </h2>
          <p className="text-base md:text-lg text-slateText max-w-2xl mx-auto">
            We partner with visionary founders and enterprises to deliver high-performance digital platforms in record time.
          </p>
        </div>

        {/* Auto-Scroll Continuous Marquee Track */}
        <div className="overflow-hidden py-4 -mx-6 px-6">
          <AutoScrollMarqueeRow baseVelocity={-0.03} className="py-2">
            <div className="flex gap-6">
              <Card className="w-[300px] md:w-[340px] p-6 bg-white hover:border-primary transition-all duration-300 shadow-sm border border-slate-200/80 rounded-3xl space-y-4 shrink-0 whitespace-normal">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl font-extrabold text-dark">Lightning Fast Delivery</h3>
                <p className="text-sm text-slateText leading-relaxed">
                  Build Your Thoughts delivers complete digital solutions in 5 days — website, admin panel, Android & iOS apps.
                </p>
              </Card>

              <Card className="w-[300px] md:w-[340px] p-6 bg-white hover:border-primary transition-all duration-300 shadow-sm border border-slate-200/80 rounded-3xl space-y-4 shrink-0 whitespace-normal">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl font-extrabold text-dark">Trusted by 100+ Businesses</h3>
                <p className="text-sm text-slateText leading-relaxed">
                  Build Your Thoughts is your most trusted app development partner for high-growth enterprises and startups.
                </p>
              </Card>

              <Card className="w-[300px] md:w-[340px] p-6 bg-white hover:border-primary transition-all duration-300 shadow-sm border border-slate-200/80 rounded-3xl space-y-4 shrink-0 whitespace-normal">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl font-extrabold text-dark">Scalable Architecture</h3>
                <p className="text-sm text-slateText leading-relaxed">
                  Build Your Thoughts builds with modern cloud tech that seamlessly scales with your business from day one.
                </p>
              </Card>

              <Card className="w-[300px] md:w-[340px] p-6 bg-white hover:border-primary transition-all duration-300 shadow-sm border border-slate-200/80 rounded-3xl space-y-4 shrink-0 whitespace-normal">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl font-extrabold text-dark">Dedicated Support</h3>
                <p className="text-sm text-slateText leading-relaxed">
                  Build Your Thoughts provides round-the-clock 24/7 dedicated engineering support so your business never stops.
                </p>
              </Card>
            </div>
          </AutoScrollMarqueeRow>
        </div>
      </section>

      {/* SECTION 7: Our Services Accordion matching bhavyawebtech */}
      <section className="max-w-7xl mx-auto px-6 space-y-10">
        <SectionHeader
          badge="Explore all of BYT"
          title="Why Choose Build Your Thoughts?"
          subtitle="Build Your Thoughts transforms ideas into digital realities through custom design and enterprise engineering."
        />

        <ServicesAccordion />
      </section>

      {/* SECTION 8: Platform Solutions Automatic Carousel (Dark Background Container) */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-dark text-white rounded-card p-8 md:p-14 border border-white/10 shadow-2xl">
          <PlatformSolutionsCarousel />
        </div>
      </section>

      {/* SECTION: What You'll Get in Every Package (Placed right above Our Process) */}
      <section className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="font-display text-3xl md:text-5xl font-black text-dark tracking-tight">
            What You'll Get in <span className="text-primary font-black">Every Package</span>
          </h2>
          <p className="text-base md:text-lg text-slateText max-w-2xl mx-auto">
            Complete solution with mobile apps, admin panels, and web platforms
          </p>
        </div>

        {/* MOBILE AUTO-SLIDING CAROUSEL (Visible on Mobile < 640px) */}
        <div className="block sm:hidden max-w-sm mx-auto space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePkg}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x < -20) setActivePkg((prev) => (prev + 1) % 4);
                if (info.offset.x > 20) setActivePkg((prev) => (prev - 1 + 4) % 4);
              }}
            >
              <Card className="p-8 bg-white border border-slate-200/90 rounded-3xl text-center space-y-5 shadow-xl">
                {activePkg === 0 && (
                  <>
                    <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto">
                      <Smartphone className="w-9 h-9" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-display text-xl font-extrabold text-dark leading-snug">
                        Customer Mobile Apps
                      </h3>
                      <p className="text-xs text-slateText leading-relaxed">
                        Native Android & iOS apps for your customers with intuitive UI/UX
                      </p>
                    </div>
                  </>
                )}
                {activePkg === 1 && (
                  <>
                    <div className="w-20 h-20 rounded-full bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mx-auto">
                      <Store className="w-9 h-9" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-display text-xl font-extrabold text-dark leading-snug">
                        Vendor/Seller Apps
                      </h3>
                      <p className="text-xs text-slateText leading-relaxed">
                        Dedicated apps for vendors to manage their inventory and orders
                      </p>
                    </div>
                  </>
                )}
                {activePkg === 2 && (
                  <>
                    <div className="w-20 h-20 rounded-full bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center mx-auto">
                      <Truck className="w-9 h-9" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-display text-xl font-extrabold text-dark leading-snug">
                        Delivery Partner Apps
                      </h3>
                      <p className="text-xs text-slateText leading-relaxed">
                        Apps for delivery partners with GPS tracking and route optimization
                      </p>
                    </div>
                  </>
                )}
                {activePkg === 3 && (
                  <>
                    <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto">
                      <Settings className="w-9 h-9" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-display text-xl font-extrabold text-dark leading-snug">
                        Master Admin Panel
                      </h3>
                      <p className="text-xs text-slateText leading-relaxed">
                        Comprehensive admin dashboard to manage entire platform
                      </p>
                    </div>
                  </>
                )}
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Indicator Dots */}
          <div className="flex justify-center items-center gap-1.5 pt-2">
            {[0, 1, 2, 3].map((idx) => (
              <button
                key={idx}
                onClick={() => setActivePkg(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activePkg === idx ? 'w-7 bg-primary' : 'w-2 bg-slate-300'
                }`}
                aria-label={`Go to package card ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* DESKTOP 4-COLUMN GRID (Visible on Tablet/Desktop >= 640px) */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Customer Mobile Apps */}
          <Card className="p-8 bg-white border border-slate-200/90 rounded-3xl text-center space-y-5 hover:shadow-xl transition-all duration-300 group">
            <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <Smartphone className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-xl font-extrabold text-dark leading-snug">
                Customer <br /> Mobile Apps
              </h3>
              <p className="text-xs text-slateText leading-relaxed">
                Native Android & iOS apps for your customers with intuitive UI/UX
              </p>
            </div>
          </Card>

          {/* Card 2: Vendor/Seller Apps */}
          <Card className="p-8 bg-white border border-slate-200/90 rounded-3xl text-center space-y-5 hover:shadow-xl transition-all duration-300 group">
            <div className="w-20 h-20 rounded-full bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <Store className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-xl font-extrabold text-dark leading-snug">
                Vendor/Seller <br /> Apps
              </h3>
              <p className="text-xs text-slateText leading-relaxed">
                Dedicated apps for vendors to manage their inventory and orders
              </p>
            </div>
          </Card>

          {/* Card 3: Delivery Partner Apps */}
          <Card className="p-8 bg-white border border-slate-200/90 rounded-3xl text-center space-y-5 hover:shadow-xl transition-all duration-300 group">
            <div className="w-20 h-20 rounded-full bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <Truck className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-xl font-extrabold text-dark leading-snug">
                Delivery <br /> Partner Apps
              </h3>
              <p className="text-xs text-slateText leading-relaxed">
                Apps for delivery partners with GPS tracking and route optimization
              </p>
            </div>
          </Card>

          {/* Card 4: Master Admin Panel */}
          <Card className="p-8 bg-white border border-slate-200/90 rounded-3xl text-center space-y-5 hover:shadow-xl transition-all duration-300 group">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <Settings className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-xl font-extrabold text-dark leading-snug">
                Master Admin <br /> Panel
              </h3>
              <p className="text-xs text-slateText leading-relaxed">
                Comprehensive admin dashboard to manage entire platform
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* SECTION 9: Workflow Step-by-Step */}
      <section className="max-w-7xl mx-auto px-6">
        <SectionHeader
          badge="Our Process"
          title="Agile Delivery Pipeline"
          subtitle="From initial discovery to continuous cloud deployment."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {workflow.map((item, idx) => (
            <div key={idx} className="p-8 rounded-card bg-white border border-dark/10 relative overflow-hidden group">
              <span className="font-display text-5xl font-bold text-primary/40 absolute top-4 right-6 group-hover:text-primary transition-colors">
                {item.step}
              </span>
              <h3 className="font-display text-2xl font-bold text-dark mb-3 relative z-10">{item.title}</h3>
              <p className="text-slateText text-sm leading-relaxed relative z-10">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 10: Featured Projects Showcase with Mobile Card Stacking Animation */}
      <FeaturedProjectsSection projects={projects} />

      {/* SECTION 11: Industries */}
      <section className="max-w-7xl mx-auto px-6">
        <SectionHeader badge="Industries" title="Domains We Serve" subtitle="Specialized engineering across critical verticals." />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {industries.map((ind, idx) => {
            const Icon = ind.icon;
            return (
              <div key={idx} className="p-6 rounded-card bg-white text-center flex flex-col items-center justify-center gap-3 border border-dark/10 hover:border-primary transition-colors">
                <Icon className="w-8 h-8 text-dark" />
                <span className="text-sm font-bold text-dark">{ind.name}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION: Client Reviews & Testimonials Marquee */}
      <section className="max-w-7xl mx-auto px-6">
        <ReviewsSection />
      </section>

      {/* SECTION: Choose Your Startup Plan (Admin CRUD Powered) */}
      <section className="max-w-7xl mx-auto px-6">
        <PricingPlansSection />
      </section>

      {/* SECTION 15: FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-6">
        <SectionHeader badge="Questions" title="Frequently Asked Questions" />

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="rounded-2xl bg-white border border-dark/10 overflow-hidden">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-6 text-left font-display text-xl font-bold text-dark flex items-center justify-between gap-4"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-slateText text-base font-sans leading-relaxed border-t border-dark/5 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 16: Final Contact CTA Banner */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-dark text-white rounded-[40px] p-12 md:p-20 text-center space-y-8 relative overflow-hidden border border-white/10">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-primary/20 text-primary border border-primary/40 shadow-sm mx-auto">
            Let's Build Together
          </span>
          <h2 className="font-display text-4xl md:text-6xl font-bold max-w-3xl mx-auto leading-tight">
            Ready to Transform Your Product Concept Into Reality?
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto font-sans">
            Schedule an architectural consultation with our senior engineering team today.
          </p>
          <div className="pt-4 flex justify-center gap-4 flex-wrap">
            <Link to="/contact">
              <Button variant="lime" size="lg" className="gap-2">
                Start Your Project <Rocket className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
