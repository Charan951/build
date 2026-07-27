import React, { useEffect, useState } from 'react';
import { SEOHead } from '../components/seo/SEOHead';
import { SectionHeader } from '../components/ui/SectionHeader';
import { FeaturedProjectsSection, ProjectItem } from '../components/ui/FeaturedProjectsSection';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    fetch('/api/v1/projects')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setProjects(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const categories = ['All', 'Enterprise', 'AI', 'Mobile', 'Cloud', 'UI/UX'];

  const filteredProjects =
    selectedCategory === 'All'
      ? projects
      : projects.filter((p) => p.category === selectedCategory);

  return (
    <div className="pt-32 max-w-7xl mx-auto px-6 space-y-12">
      <SEOHead title="Featured Projects | Build Your Thoughts" />

      <SectionHeader
        badge="Portfolio"
        title="Flagship Projects & Engineering Impact"
        subtitle="Explore how we have engineered scalable digital solutions across Fintech, Healthcare AI, and SaaS."
      />

      {/* Category Filter Pills */}
      <div className="flex justify-center gap-3 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              selectedCategory === cat
                ? 'bg-dark text-primary shadow-soft'
                : 'bg-white text-dark border border-dark/10 hover:bg-primary/20'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Projects Showcase using FeaturedProjectsSection for Mobile Card Stacking & Desktop Card Grid */}
      <FeaturedProjectsSection
        projects={filteredProjects.length > 0 ? filteredProjects : undefined}
        showHeadings={false}
        showViewAllBtn={false}
      />
    </div>
  );
};
