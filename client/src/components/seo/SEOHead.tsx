import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  schema?: object;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Enterprise Software Development & AI Solutions | Build Your Thoughts',
  description = 'Build enterprise software, mobile apps, AI solutions, and scalable digital products with Build Your Thoughts.',
  canonical = 'https://buildyourthoughts.com',
  ogImage = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
  schema,
}) => {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Build Your Thoughts',
    url: 'https://buildyourthoughts.com',
    logo: 'https://buildyourthoughts.com/logo.png',
    sameAs: [
      'https://twitter.com/buildyourthoughts',
      'https://linkedin.com/company/buildyourthoughts',
      'https://github.com/buildyourthoughts',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-800-555-0199',
      contactType: 'customer service',
      areaServed: 'Global',
      availableLanguage: 'English',
    },
  };

  return (
    <Helmet>
      {/* Title & Description */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph Tags */}
      <meta property="og:site_name" content="Build Your Thoughts" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Schema.org Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(schema || organizationSchema)}
      </script>
    </Helmet>
  );
};
