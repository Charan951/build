import React from 'react';

interface FilterPillProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

/** One pill-filter implementation with aria-pressed — replaces the two
 * independent implementations in ServicesPage's category tabs and
 * ProjectsPage's category filters, neither of which exposed selection state
 * to assistive tech. */
export const FilterPill: React.FC<FilterPillProps> = ({ active, onClick, children, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`focus-ring px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-200 ${
      active
        ? 'bg-primary text-dark shadow-soft'
        : 'bg-white text-slateText border border-dark/10 hover:bg-primary/10 hover:text-dark'
    } ${className}`}
  >
    {children}
  </button>
);
