import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEOHead } from '../components/seo/SEOHead';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ArrowLeft, CheckCircle2, Quote } from 'lucide-react';
import { apiFetch } from '../services/api';

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    if (slug) {
      apiFetch(`/projects/${slug}`)
        .then((data) => {
          if (data.success) setProject(data.data);
        })
        .catch(() => {});
    }
  }, [slug]);

  if (!project) {
    return (
      <div className="pt-36 text-center max-w-4xl mx-auto px-6">
        <p className="text-xl font-bold text-dark mb-4">Loading Case Study...</p>
        <Link to="/projects">
          <Button variant="secondary">Back to Projects</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 max-w-6xl mx-auto px-6 space-y-16">
      <SEOHead title={`${project.title} | Project Detail`} description={project.summary} />

      <Link to="/projects" className="inline-flex items-center gap-2 font-bold text-dark hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </Link>

      <div className="space-y-6">
        <div className="flex gap-3">
          <Badge variant="lime">{project.category}</Badge>
          <Badge variant="dark">{project.industry}</Badge>
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-bold text-dark leading-tight">{project.title}</h1>
        <p className="text-xl text-slateText font-sans">{project.tagline}</p>
      </div>

      {/* Hero Image */}
      <div className="h-[450px] rounded-card overflow-hidden border border-dark/10 shadow-hover">
        <img src={project.heroImage} alt={project.title} className="w-full h-full object-cover" />
      </div>

      {/* Metrics Banner */}
      {project.impactMetrics && project.impactMetrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-dark text-white p-8 rounded-card border border-white/10">
          {project.impactMetrics.map((m: any, i: number) => (
            <div key={i} className="text-center space-y-1">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest block">{m.label}</span>
              <span className="font-display text-4xl font-bold text-primary block">{m.value}</span>
              {m.description && <span className="text-xs text-gray-400">{m.description}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Challenge & Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <Card className="space-y-4">
          <h3 className="font-display text-2xl font-bold text-dark">The Challenge</h3>
          <p className="text-slateText text-base leading-relaxed">{project.challenge}</p>
        </Card>
        <Card className="space-y-4">
          <h3 className="font-display text-2xl font-bold text-dark">The Solution</h3>
          <p className="text-slateText text-base leading-relaxed">{project.solution}</p>
        </Card>
      </div>

      {/* Testimonial Card */}
      {project.testimonial && (
        <Card className="bg-primary/10 border-primary/30 p-10 text-center space-y-4">
          <Quote className="w-10 h-10 text-dark mx-auto opacity-40" />
          <p className="font-display text-2xl font-bold text-dark max-w-2xl mx-auto">
            "{project.testimonial.quote}"
          </p>
          <div>
            <span className="font-bold text-dark block">{project.testimonial.author}</span>
            <span className="text-xs font-medium text-slateText">{project.testimonial.role}, {project.testimonial.company}</span>
          </div>
        </Card>
      )}
    </div>
  );
};
