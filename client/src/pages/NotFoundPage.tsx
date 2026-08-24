import React from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '../components/seo/SEOHead';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center pt-32 pb-24 px-6">
      <SEOHead title="Page Not Found | Build Your Thoughts" noindex />
      <div className="max-w-lg text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8 text-dark" />
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-dark">Page not found</h1>
        <p className="text-slateText text-base leading-relaxed">
          The page you're looking for doesn't exist or may have moved. Check the URL, or head back to
          somewhere that does.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/">
            <Button variant="lime" className="gap-2 font-bold">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
