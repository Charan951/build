import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEOHead } from '../components/seo/SEOHead';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Clock, Share2, Copy } from 'lucide-react';

export const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<any>(null);

  useEffect(() => {
    if (slug) {
      fetch(`/api/v1/blogs/${slug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setBlog(data.data);
        })
        .catch(() => {});
    }
  }, [slug]);

  if (!blog) {
    return (
      <div className="pt-36 text-center max-w-4xl mx-auto px-6">
        <p className="text-xl font-bold text-dark mb-4">Loading Article...</p>
        <Link to="/blogs"><Button variant="secondary">Back to Blogs</Button></Link>
      </div>
    );
  }

  return (
    <div className="pt-32 max-w-4xl mx-auto px-6 space-y-12">
      <SEOHead title={blog.seoTitle || blog.title} description={blog.seoDescription || blog.excerpt} />

      <Link to="/blogs" className="inline-flex items-center gap-2 font-bold text-dark hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Articles
      </Link>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Badge variant="lime">{blog.category}</Badge>
          <span className="text-xs text-slateText flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {blog.readTime}</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-dark leading-tight">{blog.title}</h1>
        <div className="flex items-center justify-between pt-4 border-t border-dark/10">
          <div className="flex items-center gap-3">
            {blog.author?.avatar && <img src={blog.author.avatar} alt={blog.author.name} className="w-10 h-10 rounded-full object-cover" />}
            <div>
              <span className="font-bold text-sm text-dark block">{blog.author?.name}</span>
              <span className="text-xs text-slateText">{blog.author?.role}</span>
            </div>
          </div>
          <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="p-2.5 rounded-full bg-white border border-dark/10 hover:border-primary transition-colors text-dark" title="Copy Article Link">
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="h-96 rounded-card overflow-hidden border border-dark/10 shadow-hover">
        <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
      </div>

      <article className="prose prose-lg max-w-none text-slateText leading-relaxed space-y-6 font-sans">
        <div className="whitespace-pre-line text-lg text-dark/90 leading-relaxed font-sans">{blog.content}</div>
      </article>
    </div>
  );
};
