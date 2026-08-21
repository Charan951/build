import React from 'react';
import { Loader2 } from 'lucide-react';

/** Small spin icon for inline/button-level loading. Replaces the ad hoc
 * `<Loader2 className="animate-spin" />` copies scattered across crm/*Modal.tsx. */
export const SpinnerInline: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <Loader2 className={`animate-spin ${className}`} aria-hidden="true" />
);

/** Block-level skeleton for data-heavy list/detail pages while content loads.
 * Generalizes the pattern from PricingPlansSection's loading state. */
export const SpinnerSkeleton: React.FC<{
  lines?: number;
  className?: string;
  rounded?: string;
}> = ({ lines = 3, className = '', rounded = 'rounded-xl' }) => (
  <div className={`space-y-3 animate-pulse ${className}`} role="status" aria-label="Loading">
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className={`h-4 bg-slate-100 ${rounded} ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
    ))}
  </div>
);

/** A single skeleton card matching Card's shape — for grids of cards while loading. */
export const SpinnerCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`rounded-card border border-slate-200 bg-white p-8 space-y-4 animate-pulse ${className}`}
    role="status"
    aria-label="Loading"
  >
    <div className="h-5 w-24 bg-slate-100 rounded-full mx-auto" />
    <div className="h-8 w-32 bg-slate-100 rounded-lg mx-auto" />
    <div className="space-y-2 pt-2">
      <div className="h-3 w-full bg-slate-100 rounded-full" />
      <div className="h-3 w-full bg-slate-100 rounded-full" />
      <div className="h-3 w-2/3 bg-slate-100 rounded-full" />
    </div>
  </div>
);

export const Spinner = {
  Inline: SpinnerInline,
  Skeleton: SpinnerSkeleton,
  CardSkeleton: SpinnerCardSkeleton,
};
