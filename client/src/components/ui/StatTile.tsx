import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatTileProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  delta?: string;
  description?: string;
  /** 'onDark' for stat rows on a Circuit Black surface (hero, CTA banners),
   * 'onLight' for stat rows on a white/background surface. */
  surface?: 'onDark' | 'onLight';
  className?: string;
}

/** One stat-card treatment, consolidating the independent implementations that
 * previously existed in HomePage, AboutPage's "Quick Metrics Bar",
 * ProjectDetailPage's metrics banner, and ReviewsSection's stat counters. */
export const StatTile: React.FC<StatTileProps> = ({ label, value, icon: Icon, delta, description, surface = 'onLight', className = '' }) => {
  const isDark = surface === 'onDark';
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1.5 text-center p-6 rounded-card ${
        isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-dark/10'
      } ${className}`}
    >
      {Icon && <Icon className={`w-5 h-5 mb-1 ${isDark ? 'text-primary' : 'text-dark'}`} />}
      <span className={`font-display text-2xl md:text-3xl font-black ${isDark ? 'text-primary' : 'text-dark'}`}>
        {value}
      </span>
      <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-mutedOnDark' : 'text-mutedOnLight'}`}>
        {label}
      </span>
      {delta && <span className="text-[11px] font-semibold text-emerald-600">{delta}</span>}
      {description && (
        <span className={`text-[11px] ${isDark ? 'text-mutedOnDark' : 'text-mutedOnLight'}`}>{description}</span>
      )}
    </div>
  );
};
