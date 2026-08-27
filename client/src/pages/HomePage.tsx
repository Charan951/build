import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useAnimationFrame, useVelocity, useSpring, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  Cpu,
  Cloud,
  Smartphone,
  ShieldCheck,
  Zap,
  ChevronDown,
  Layers,
  Bot,
  Database,
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
import Lightfall from '../components/backgrounds/Lightfall/Lightfall';
import { apiFetch } from '../services/api';
import { Reveal, Stagger, StaggerItem } from '../components/ui/motion';

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

  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Plain ref, not state: toggled by IntersectionObserver so scrolling this
  // row off-screen doesn't need a re-render, just skips the per-frame write.
  const isVisibleRef = useRef(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry.isIntersecting;
    }, { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    // This row runs a perpetual JS-driven transform; once it's scrolled out of
    // view there's nothing on screen to update, so skip the work entirely
    // rather than burning a style write every frame forever. Same treatment
    // for a reduced-motion preference: this is non-essential, unstoppable
    // motion exactly like the CSS .animate-marquee rows, so it stays static
    // rather than perpetually scrolling for a vestibular-sensitive visitor.
    if (!isVisibleRef.current || prefersReducedMotion) return;

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
    <div ref={wrapperRef} className="overflow-hidden whitespace-nowrap flex w-full">
      <div ref={containerRef} className={`flex items-center whitespace-nowrap gap-12 will-change-transform ${className}`}>
        <div className="flex items-center gap-12 shrink-0">{children}</div>
        {/* Second copy exists only to complete the seamless loop illusion —
            hidden from assistive tech so screen readers don't read every item twice. */}
        <div className="flex items-center gap-12 shrink-0" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
};

const PACKAGE_SLIDES = [
  {
    icon: Smartphone,
    iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
    title: 'Customer Mobile Apps',
    desc: 'Native Android & iOS apps for your customers with intuitive UI/UX',
  },
  {
    icon: Store,
    iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
    title: 'Vendor/Seller Apps',
    desc: 'Dedicated apps for vendors to manage their inventory and orders',
  },
  {
    icon: Truck,
    iconBg: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    title: 'Delivery Partner Apps',
    desc: 'Apps for delivery partners with GPS tracking and route optimization',
  },
  {
    icon: Settings,
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    title: 'Master Admin Panel',
    desc: 'Comprehensive admin dashboard to manage entire platform',
  },
];

// Isolated in its own component so the 3s auto-advance interval only re-renders
// this small mobile-only carousel, not the entire HomePage tree.
const PackageCarousel: React.FC = () => {
  const [activePkg, setActivePkg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePkg((prev) => (prev + 1) % PACKAGE_SLIDES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const slide = PACKAGE_SLIDES[activePkg];
  const Icon = slide.icon;

  return (
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
            if (info.offset.x < -20) setActivePkg((prev) => (prev + 1) % PACKAGE_SLIDES.length);
            if (info.offset.x > 20) setActivePkg((prev) => (prev - 1 + PACKAGE_SLIDES.length) % PACKAGE_SLIDES.length);
          }}
        >
          <Card className="p-8 bg-white border border-slate-200/90 rounded-3xl text-center space-y-5 shadow-xl">
            <div className={`w-20 h-20 rounded-full border flex items-center justify-center mx-auto ${slide.iconBg}`}>
              <Icon className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-xl font-extrabold text-dark leading-snug">{slide.title}</h3>
              <p className="text-xs text-slateText leading-relaxed">{slide.desc}</p>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Indicator Dots */}
      <div className="flex justify-center items-center pt-2">
        {PACKAGE_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActivePkg(idx)}
            // The dot stays small visually, but the button's padding gives it a
            // ~32x32px hit area — the visible 8px dot alone fails the 24x24px
            // minimum touch-target size.
            className="p-3 -m-1 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-full"
            aria-label={`Go to package card ${idx + 1}`}
          >
            <span
              className={`block h-2 rounded-full transition-all duration-300 ${
                activePkg === idx ? 'w-7 bg-primary' : 'w-2 bg-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [techTab, setTechTab] = useState<'frontend' | 'backend' | 'cloud' | 'ai'>('frontend');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [projects, setProjects] = useState<any[]>([]);

  // Scroll marquee animation hooks
  const marqueeRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: marqueeRef,
    offset: ['start end', 'end start'],
    layoutEffect: false,
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
      <SEOHead title="Build Your Thoughts | Enterprise Software & AI Solutions Agency" canonical="https://www.buildyourthougths.in/" />

      {/* SECTION 3: Hero Section */}
      <section className="relative overflow-hidden bg-dark -mt-24 md:-mt-32 pt-24 md:pt-32 min-h-screen flex items-center">
        {/* Full-bleed Lightfall backdrop */}
        <div className="absolute inset-0">
          <Lightfall
            colors={['#CDFB47', '#A9E51F', '#65A30D']}
            backgroundColor="#0F1412"
            speed={0.4}
            streakCount={3}
            streakWidth={1}
            streakLength={1.2}
            glow={1}
            density={0.55}
            twinkle={0.8}
            zoom={3}
            backgroundGlow={0.35}
            opacity={0.9}
            mouseInteraction
            mouseStrength={0.4}
            mouseRadius={1}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-dark/10 via-dark/40 to-dark pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 w-full flex flex-col items-center text-center gap-7">
          <h1 className="font-display text-display font-black text-white leading-[1.05]">
            <span className="font-black">Build Your Dream App</span> <br />
            <span className="text-primary underline decoration-primary decoration-4 underline-offset-8 font-black">in Just 5 Days</span>
          </h1>

          <p className="text-bodyLg text-gray-300 max-w-2xl font-sans">
            Complete MVP applications with website, admin panel, Android &amp; iOS apps delivered in record time.
          </p>

          {/* Hero CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 w-full sm:w-auto">
            <Link to="/contact" className="w-full sm:w-auto">
              <Button variant="lime" size="lg" className="w-full justify-center gap-2.5 py-4 text-base font-bold shadow-soft">
                <Rocket className="w-5 h-5 text-dark" />
                Start Your Project
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/projects" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full justify-center gap-2.5 py-4 text-base font-bold bg-white/10 text-white border border-white/20 hover:bg-white/20 shadow-glass">
                <FolderGit2 className="w-5 h-5 text-white" />
                Explore Projects
                <ArrowUpRight className="w-5 h-5 text-gray-300" />
              </Button>
            </Link>
          </div>

          {/* Trust Stat Strip */}
          <div className="grid grid-cols-3 gap-2 sm:gap-0 w-full max-w-xl mt-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm divide-x divide-white/10 overflow-hidden">
            {[
              { value: '100+', label: 'Apps Built' },
              { value: '5 Days', label: 'Delivery' },
              { value: '24/7', label: 'Support' },
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center gap-1 px-3 py-4">
                <span className="font-display text-xl sm:text-2xl font-black text-primary">{stat.value}</span>
                <span className="text-[10px] sm:text-xs font-bold text-gray-300 uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
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
          <span className="text-xs font-black uppercase tracking-widest text-dark px-3 py-1 rounded-full bg-primary inline-block">
            Why Choose Us
          </span>
          <h2 className="font-display text-h2 font-black text-dark">
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
        <div className="bg-dark text-white rounded-card p-6 md:p-10 border border-white/10 shadow-2xl">
          <PlatformSolutionsCarousel />
        </div>
      </section>

      {/* SECTION: What You'll Get in Every Package (Placed right above Our Process) */}
      <section className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="font-display text-h2 font-black text-dark">
            What You'll Get in <span className="text-primary font-black">Every Package</span>
          </h2>
          <p className="text-base md:text-lg text-slateText max-w-2xl mx-auto">
            Complete solution with mobile apps, admin panels, and web platforms
          </p>
        </div>

        {/* MOBILE AUTO-SLIDING CAROUSEL (Visible on Mobile < 640px) */}
        <PackageCarousel />

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

        <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {workflow.map((item, idx) => (
            <StaggerItem key={idx} className="p-8 rounded-card bg-white border border-dark/10 relative overflow-hidden group">
              <span className="font-display text-h1 font-bold text-primary/40 absolute top-4 right-6 group-hover:text-primary transition-colors">
                {item.step}
              </span>
              <h3 className="font-display text-h3 font-bold text-dark mb-3 relative z-10">{item.title}</h3>
              <p className="text-slateText text-small leading-relaxed relative z-10">{item.desc}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* SECTION 10: Featured Projects Showcase with Mobile Card Stacking Animation */}
      <FeaturedProjectsSection projects={projects} />

      {/* SECTION 11: Industries */}
      <section className="max-w-7xl mx-auto px-6">
        <SectionHeader badge="Industries" title="Domains We Serve" subtitle="Specialized engineering across critical verticals." />
        <Stagger className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {industries.map((ind, idx) => {
            const Icon = ind.icon;
            return (
              <StaggerItem
                key={idx}
                className="p-6 rounded-card bg-white text-center flex flex-col items-center justify-center gap-3 border border-dark/10 hover:border-primary hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-dark flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-small font-bold text-dark">{ind.name}</span>
              </StaggerItem>
            );
          })}
        </Stagger>
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
              <div
                key={idx}
                className={`rounded-2xl bg-white border overflow-hidden transition-colors duration-300 ${isOpen ? 'border-primary/50' : 'border-dark/10'}`}
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${idx}`}
                  id={`faq-trigger-${idx}`}
                  className="w-full p-6 text-left font-display text-xl font-bold text-dark flex items-center justify-between gap-4 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-2xl"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${idx}`}
                      role="region"
                      aria-labelledby={`faq-trigger-${idx}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-slateText text-base font-sans leading-relaxed border-t border-dark/5 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 16: Final Contact CTA Banner */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-dark text-white rounded-[40px] p-12 md:p-20 text-center space-y-8 relative overflow-hidden border border-white/10">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(60% 80% at 50% 0%, rgba(205,251,71,0.16) 0%, rgba(205,251,71,0) 65%)',
            }}
          />
          <span className="relative inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-primary/20 text-primary border border-primary/40 shadow-sm mx-auto">
            Let's Build Together
          </span>
          <h2 className="relative font-display text-h1 font-bold max-w-3xl mx-auto">
            Ready to Transform Your Product Concept Into Reality?
          </h2>
          <p className="relative text-gray-400 text-lg md:text-xl max-w-xl mx-auto font-sans">
            Schedule an architectural consultation with our senior engineering team today.
          </p>
          <div className="relative pt-4 flex justify-center gap-4 flex-wrap">
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
