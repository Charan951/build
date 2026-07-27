import React from 'react';
import { SEOHead } from '../components/seo/SEOHead';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ShieldCheck, Award, Target, Users } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const values = [
    { title: 'Engineering Excellence', desc: 'We write strict TypeScript code with 100% test coverage and robust error boundaries.', icon: ShieldCheck },
    { title: 'Design First Mindset', desc: 'Every interaction, glass card, and motion curve is calibrated for luxury editorial aesthetic.', icon: Award },
    { title: 'Measurable Business ROI', desc: 'We measure success by throughput latency, Lighthouse metrics, and lead conversions.', icon: Target },
    { title: 'Long-Term Partnership', desc: 'We operate as an extension of your CTO team from MVP build to global scaling.', icon: Users },
  ];

  return (
    <div className="pt-32 max-w-7xl mx-auto px-6 space-y-24">
      <SEOHead title="About Build Your Thoughts | Enterprise Digital Agency" />

      <SectionHeader
        badge="About Build Your Thoughts"
        title="India's Premium Digital Engineering & Headless CMS Agency"
        subtitle="We build high-availability software platforms and 3D web applications for founders and global enterprises."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <Badge variant="lime">Our Story</Badge>
          <h2 className="font-display text-4xl font-bold text-dark">
            Transforming Ideas Into Scalable Products Since 2026
          </h2>
          <p className="text-slateText text-lg leading-relaxed">
            Build Your Thoughts was created to eliminate bloated, slow legacy software agency models. We combine high-performance Node.js microservices with React 19 visual design, Three.js 3D scenes, and fully manageable headless CMS engines.
          </p>
        </div>
        <div className="rounded-card overflow-hidden shadow-hover border border-dark/10 h-80">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
            alt="Engineering Team"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Core Values */}
      <section className="space-y-12">
        <SectionHeader badge="Values" title="Our Core Engineering Principles" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((v, idx) => {
            const Icon = v.icon;
            return (
              <Card key={idx} className="text-center p-8">
                <div className="w-12 h-12 rounded-2xl bg-dark text-primary flex items-center justify-center mx-auto mb-6">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl font-bold text-dark mb-3">{v.title}</h3>
                <p className="text-slateText text-sm leading-relaxed">{v.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
};
