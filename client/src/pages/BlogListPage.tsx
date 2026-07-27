import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '../components/seo/SEOHead';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ArrowRight, Clock } from 'lucide-react';

export const BlogListPage: React.FC = () => {
  const [blogs, setBlogs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/v1/blogs')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setBlogs(data.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="pt-32 max-w-7xl mx-auto px-6 space-y-16">
      <SEOHead title="Technical Blog & Articles | Build Your Thoughts" />

      <SectionHeader
        badge="Engineering Insights"
        title="Technical Articles & Architecture Deep-Dives"
        subtitle="Insights on React 19, Three.js WebGL performance, Node.js microservices, and AI fine-tuning."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map((b, idx) => (
          <Card key={idx} className="p-0 overflow-hidden flex flex-col justify-between group">
            <div className="h-52 overflow-hidden">
              <img src={b.coverImage} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between text-xs text-slateText">
                <Badge variant="lime">{b.category}</Badge>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {b.readTime}</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-dark group-hover:text-primary transition-colors line-clamp-2">{b.title}</h3>
              <p className="text-slateText text-sm line-clamp-3">{b.excerpt}</p>
              <div className="pt-4 border-t border-dark/10 flex items-center justify-between">
                <span className="text-xs font-bold text-dark">{b.author?.name}</span>
                <Link to={`/blogs/${b.slug}`} className="inline-flex items-center gap-1 font-bold text-xs text-dark hover:text-primary transition-colors">
                  Read Article <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
