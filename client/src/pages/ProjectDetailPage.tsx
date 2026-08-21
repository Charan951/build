import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEOHead } from '../components/seo/SEOHead';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatTile } from '../components/ui/StatTile';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { ArrowLeft, FolderX, Quote } from 'lucide-react';
import { apiFetch } from '../services/api';

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<any>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'notfound'>('loading');

  useEffect(() => {
    if (!slug) return;
    setStatus('loading');
    apiFetch(`/projects/${slug}`)
      .then((data) => {
        if (data.success && data.data) {
          setProject(data.data);
          setStatus('ready');
        } else {
          setStatus('notfound');
        }
      })
      .catch(() => setStatus('notfound'));
  }, [slug]);

  if (status === 'loading') {
    return (
      <div className="pt-36 max-w-4xl mx-auto px-6">
        <Spinner.Skeleton lines={6} />
      </div>
    );
  }

  if (status === 'notfound' || !project) {
    return (
      <div className="pt-36 max-w-2xl mx-auto px-6">
        <EmptyState
          icon={FolderX}
          title="Case study not found"
          description="This project may have been moved or is no longer available."
          action={
            <Link to="/projects">
              <Button variant="secondary">Back to Projects</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="pt-32 max-w-6xl mx-auto px-6 space-y-16">
      <SEOHead
        title={`${project.title} | Project Detail`}
        description={project.summary}
        canonical={`https://buildyourthoughts.com/projects/${slug}`}
      />

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-dark p-8 rounded-card border border-white/10">
          {project.impactMetrics.map((m: any, i: number) => (
            <StatTile
              key={i}
              surface="onDark"
              value={m.value}
              label={m.label}
              description={m.description}
              className="!bg-transparent !border-0 !p-0"
            />
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
