import React, { useEffect, useState } from 'react';
import { SEOHead } from '../components/seo/SEOHead';
import { SectionHeader } from '../components/ui/SectionHeader';
import { MediaCard } from '../components/ui/MediaCard';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Clock, Newspaper } from 'lucide-react';
import { apiFetch } from '../services/api';

export const BlogListPage: React.FC = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'empty'>('loading');

  useEffect(() => {
    apiFetch('/blogs')
      .then((data) => {
        if (data.success && data.data?.length > 0) {
          setBlogs(data.data);
          setStatus('ready');
        } else {
          setStatus('empty');
        }
      })
      .catch(() => setStatus('empty'));
  }, []);

  return (
    <div className="pt-32 max-w-7xl mx-auto px-6 space-y-16">
      <SEOHead title="Technical Blog & Articles | Build Your Thoughts" canonical="https://www.buildyourthougths.in/blogs" />

      <SectionHeader
        badge="Engineering Insights"
        title="Technical Articles & Architecture Deep-Dives"
        subtitle="Insights on React 19, Three.js WebGL performance, Node.js microservices, and AI fine-tuning."
      />

      {status === 'loading' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[0, 1, 2].map((i) => (
            <Spinner.CardSkeleton key={i} />
          ))}
        </div>
      )}

      {status === 'empty' && (
        <EmptyState icon={Newspaper} title="No articles yet" description="Check back soon for new technical deep-dives." />
      )}

      {status === 'ready' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((b, idx) => (
            <MediaCard
              key={idx}
              href={`/blogs/${b.slug}`}
              image={b.coverImage}
              imageAlt={b.title}
              badge={b.category}
              title={b.title}
              meta={b.author?.name}
            >
              <div className="flex items-center gap-1 text-xs text-mutedOnLight">
                <Clock className="w-3.5 h-3.5" /> {b.readTime}
              </div>
              <p className="text-slateText text-sm line-clamp-3">{b.excerpt}</p>
            </MediaCard>
          ))}
        </div>
      )}
    </div>
  );
};
