import React, { useEffect, useState } from 'react';
import { SEOHead } from '../components/seo/SEOHead';
import { SectionHeader } from '../components/ui/SectionHeader';
import { FeaturedProjectsSection, ProjectItem } from '../components/ui/FeaturedProjectsSection';
import { FilterPill } from '../components/ui/FilterPill';
import { Spinner } from '../components/ui/Spinner';
import { apiFetch } from '../services/api';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    apiFetch('/projects')
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setProjects(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', 'Enterprise', 'AI', 'Mobile', 'Cloud', 'UI/UX'];

  const filteredProjects =
    selectedCategory === 'All'
      ? projects
      : projects.filter((p) => p.category === selectedCategory);

  return (
    <div className="pt-32 max-w-7xl mx-auto px-6 space-y-12">
      <SEOHead title="Featured Projects | Build Your Thoughts" canonical="https://www.buildyourthougths.in/projects" />

      <SectionHeader
        as="h1"
        badge="Portfolio"
        title="Our Projects"
        subtitle="Explore how we have engineered scalable digital solutions across Fintech, Healthcare AI, and SaaS."
      />

      {/* Category Filter Pills */}
      <div className="flex justify-center gap-3 flex-wrap">
        {categories.map((cat) => (
          <FilterPill key={cat} active={selectedCategory === cat} onClick={() => setSelectedCategory(cat)}>
            {cat}
          </FilterPill>
        ))}
      </div>

      {/* Projects Showcase using FeaturedProjectsSection for Mobile Card Stacking & Desktop Card Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Spinner.CardSkeleton key={i} />
          ))}
        </div>
      ) : projects.length > 0 && filteredProjects.length === 0 ? (
        // Real projects exist but none match this category - show that
        // honestly instead of silently falling through to
        // FeaturedProjectsSection's unrelated sample fallback data, which
        // would look like a match for the filter the visitor just picked.
        <div className="py-16 text-center">
          <p className="text-lg font-semibold text-dark">No {selectedCategory} projects yet.</p>
          <p className="text-slateText text-sm mt-2">Check back soon, or explore another category above.</p>
        </div>
      ) : (
        <FeaturedProjectsSection
          projects={projects.length > 0 ? filteredProjects : undefined}
          showHeadings={false}
          showViewAllBtn={false}
        />
      )}
    </div>
  );
};
