import React from 'react';
import { LucideIcon } from 'lucide-react';

interface IconBadgeProps {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  /** 'dark' (default): solid Circuit Black chip, for use on light surfaces.
   * 'onDark': translucent white chip, for use when already on a dark surface
   * (e.g. ContactPage's dark info panel) where a second solid-dark chip
   * would disappear into the background. */
  tone?: 'dark' | 'onDark';
  className?: string;
}

const sizeMap = {
  sm: { box: 'w-9 h-9 rounded-xl', icon: 'w-4 h-4' },
  md: { box: 'w-12 h-12 rounded-2xl', icon: 'w-5 h-5' },
  lg: { box: 'w-16 h-16 rounded-2xl', icon: 'w-7 h-7' },
};

const toneMap = {
  dark: 'bg-dark text-primary',
  onDark: 'bg-white/10 text-primary',
};

/** Consistent square icon chip — replaces the inline-duplicated
 * `w-9 h-9 rounded-xl` / `w-12 h-12 rounded-2xl` chips in AboutPage and ContactPage. */
export const IconBadge: React.FC<IconBadgeProps> = ({ icon: Icon, size = 'md', tone = 'dark', className = '' }) => {
  const { box, icon } = sizeMap[size];
  return (
    <div className={`${box} ${toneMap[tone]} flex items-center justify-center shrink-0 ${className}`}>
      <Icon className={icon} />
    </div>
  );
};
