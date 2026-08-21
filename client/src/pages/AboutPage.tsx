import React from 'react';
import { SEOHead } from '../components/seo/SEOHead';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { IconBadge } from '../components/ui/IconBadge';
import { StatTile } from '../components/ui/StatTile';
import { ScrollGridShowcase } from '../components/ui/ScrollGridShowcase';
import { ReviewsSection } from '../components/ui/ReviewsSection';
import { ShieldCheck, Award, Target, Users, Cpu, Code2, Cloud } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const values = [
    { title: 'Engineering Excellence', desc: 'We write strict TypeScript code with 100% test coverage and robust error boundaries.', icon: ShieldCheck },
    { title: 'Design First Mindset', desc: 'Every interaction, glass card, and motion curve is calibrated for luxury editorial aesthetic.', icon: Award },
    { title: 'Measurable Business ROI', desc: 'We measure success by throughput latency, Lighthouse metrics, and lead conversions.', icon: Target },
    { title: 'Long-Term Partnership', desc: 'We operate as an extension of your CTO team from MVP build to global scaling.', icon: Users },
  ];

  const highlights = [
    { icon: Cpu, label: 'High-Throughput Architecture', desc: 'Microservices handling sub-10ms response times at 50,000+ transactions per second.' },
    { icon: Code2, label: 'Modern Full-Stack Stack', desc: 'React 19, TypeScript, Node.js, Express, MongoDB Atlas, and TailwindCSS.' },
    { icon: Cloud, label: 'Cloud Native & DevOps', desc: 'Automated CI/CD pipelines, Docker containerization, and AWS infrastructure.' },
  ];

  return (
    <div className="pt-32 max-w-7xl mx-auto px-6 space-y-24">
      <SEOHead title="About Build Your Thoughts | India's Premium Digital Engineering" canonical="https://www.buildyourthougths.in/about" />

      {/* Main Section Header */}
      <SectionHeader
        badge="About Build Your Thoughts"
        title="India's Premium Digital Engineering"
        subtitle="We engineer high-availability software platforms, intelligent microservices, and 3D web applications for visionary founders and enterprise leaders."
      />

      {/* Rich Story & Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <Badge variant="lime">Our Story & Mission</Badge>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-dark leading-tight">
            Architecting Scalable Enterprise Products Delivered in Record 5 Days
          </h2>
          <p className="text-slateText text-base md:text-lg leading-relaxed">
            Build Your Thoughts was established to eliminate slow, bloated legacy agency models. We combine high-performance backend architecture with React 19 visual design, Three.js 3D scenes, and headless backend infrastructure.
          </p>

          <div className="space-y-3 pt-2">
            {highlights.map((h, idx) => {
              const Icon = h.icon;
              return (
                <div key={idx} className="flex items-start gap-3.5 bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
                  <IconBadge icon={Icon} size="sm" className="mt-0.5" />
                  <div>
                    <h4 className="font-display text-sm font-bold text-dark">{h.label}</h4>
                    <p className="text-xs text-slateText leading-relaxed">{h.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hero Visual Card */}
        <div className="space-y-6">
          <div className="rounded-card overflow-hidden shadow-hover border border-dark/10 h-80 relative group">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
              alt="Engineering Team"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/30 to-transparent p-6 flex flex-col justify-end">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">High Precision Engineering</span>
              <p className="font-display text-lg font-bold text-white">Kota & Hyderabad Digital Innovation Hub</p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-4">
            <StatTile surface="onDark" value="100+" label="Apps Built" className="!bg-dark border-white/10 !p-4" />
            <StatTile surface="onDark" value="5 Days" label="Avg Delivery" className="!bg-dark border-white/10 !p-4" />
            <StatTile surface="onDark" value="99.99%" label="Uptime SLA" className="!bg-dark border-white/10 !p-4" />
          </div>
        </div>
      </div>

      {/* Core Values / Engineering Principles */}
      <section className="space-y-12">
        <SectionHeader badge="Values" title="Our Core Engineering Principles" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((v, idx) => {
            const Icon = v.icon;
            return (
              <Card key={idx} className="text-center p-8">
                <IconBadge icon={Icon} className="mx-auto mb-6" />
                <h3 className="font-display text-xl font-bold text-dark mb-3">{v.title}</h3>
                <p className="text-slateText text-sm leading-relaxed">{v.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Scroll-Driven Motion Image Grid Showcase (Positioned after Our Core Engineering Principles) */}
      <section className="pt-6">
        <ScrollGridShowcase />
      </section>

      {/* Client Reviews Section */}
      <section>
        <ReviewsSection />
      </section>
    </div>
  );
};
