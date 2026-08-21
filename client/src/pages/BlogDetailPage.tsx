import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEOHead } from '../components/seo/SEOHead';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { ArrowLeft, Clock, Copy, FileX } from 'lucide-react';
import { apiFetch } from '../services/api';

export const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<any>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'notfound'>('loading');

  useEffect(() => {
    if (!slug) return;
    setStatus('loading');
    apiFetch(`/blogs/${slug}`)
      .then((data) => {
        if (data.success && data.data) {
          setBlog(data.data);
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

  if (status === 'notfound' || !blog) {
    return (
      <div className="pt-36 max-w-2xl mx-auto px-6">
        <EmptyState
          icon={FileX}
          title="Article not found"
          description="This article may have been moved or is no longer available."
          action={
            <Link to="/blogs">
              <Button variant="secondary">Back to Blogs</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const canonicalUrl = `https://www.buildyourthougths.in/blogs/${slug}`;
  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: blog.title,
        description: blog.seoDescription || blog.excerpt,
        image: blog.coverImage,
        datePublished: blog.publishedAt || blog.createdAt,
        dateModified: blog.updatedAt || blog.publishedAt || blog.createdAt,
        author: {
          '@type': 'Person',
          name: blog.author?.name || 'Build Your Thoughts',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Build Your Thoughts',
          logo: {
            '@type': 'ImageObject',
            url: 'https://www.buildyourthougths.in/logo.svg',
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.buildyourthougths.in/' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.buildyourthougths.in/blogs' },
          { '@type': 'ListItem', position: 3, name: blog.title, item: canonicalUrl },
        ],
      },
    ],
  };

  return (
    <div className="pt-32 max-w-4xl mx-auto px-6 space-y-12">
      <SEOHead
        title={blog.seoTitle || blog.title}
        description={blog.seoDescription || blog.excerpt}
        canonical={canonicalUrl}
        ogImage={blog.coverImage}
        schema={blogPostingSchema}
      />

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
            {blog.author?.avatar && <img src={blog.author.avatar} alt={blog.author.name} loading="lazy" className="w-10 h-10 rounded-full object-cover" />}
            <div>
              <span className="font-bold text-sm text-dark block">{blog.author?.name}</span>
              <span className="text-xs text-slateText">{blog.author?.role}</span>
            </div>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="focus-ring p-2.5 rounded-full bg-white border border-dark/10 hover:border-primary transition-colors text-dark"
            aria-label="Copy article link"
            title="Copy Article Link"
          >
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
