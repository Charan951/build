import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '../components/seo/SEOHead';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ArrowUpRight, ArrowRight, ChevronRight } from 'lucide-react';
import { apiFetch } from '../services/api';

interface SubService {
  num: string;
  title: string;
  slug: string;
}

interface ServiceCategory {
  _id?: string;
  num: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  subServices: SubService[];
}

export const ServicesPage: React.FC = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/service-categories')
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setCategories(data.data);
          setActiveCategorySlug(data.data[0].slug);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeCat = categories.find((c) => c.slug === activeCategorySlug) || categories[0];

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 space-y-16">
      <SEOHead title="Services & Capabilities | Build Your Thoughts" />

      <SectionHeader
        badge="Services & Capabilities"
        title="Explore all of Build Your Thoughts Services"
        subtitle="Build Your Thoughts transforms ideas into digital realities through custom design and enterprise engineering."
      />

      {/* Main Categories Card matching image copy 9 */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200/90 shadow-2xl p-6 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          {/* Left Column: Categories List */}
          <div className="lg:col-span-4 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-200/80 pr-0 lg:pr-8 pb-6 lg:pb-0">
            <span className="text-[11px] font-black uppercase tracking-widest text-slateText block mb-4">
              CATEGORIES
            </span>

            <div className="space-y-2">
              {categories.map((cat) => {
                const isActive = cat.slug === activeCategorySlug;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => setActiveCategorySlug(cat.slug)}
                    className={`w-full px-5 py-3.5 rounded-2xl flex items-center justify-between text-xs font-extrabold transition-all duration-300 ${
                      isActive
                        ? 'bg-primary text-dark shadow-md translate-x-1'
                        : 'bg-white text-dark hover:bg-slate-50 hover:text-primary'
                    }`}
                  >
                    <span className="truncate">{cat.title}</span>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'translate-x-1' : 'opacity-40'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Sub-Services & Capabilities Grid */}
          <div className="lg:col-span-8 space-y-8 flex flex-col justify-between">
            {activeCat && (
              <>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
                  <div>
                    <Link to={`/services/${activeCat.slug}`} className="group hover:underline">
                      <h2 className="font-display text-2xl md:text-3xl font-black text-dark group-hover:text-primary transition-colors flex items-center gap-2">
                        {activeCat.title} <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h2>
                    </Link>
                    <p className="text-xs text-slateText font-medium mt-1">
                      {activeCat.description}
                    </p>
                  </div>

                  <Link
                    to={`/services/${activeCat.slug}`}
                    className="px-5 py-2.5 rounded-full border border-dark text-xs font-bold text-dark hover:bg-dark hover:text-white transition-all flex items-center gap-2 shrink-0 shadow-sm"
                  >
                    View Category Page <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Sub-Services Pill Buttons Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeCat.subServices?.map((sub, idx) => (
                    <Link
                      key={idx}
                      to={`/services/${sub.slug}`}
                      className="group p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-primary hover:shadow-lg transition-all duration-300 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-primary/20 flex items-center justify-center shrink-0 transition-colors">
                          <ArrowUpRight className="w-4 h-4 text-dark group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-xs font-extrabold text-dark group-hover:text-primary transition-colors uppercase tracking-wider">
                          {sub.title}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
