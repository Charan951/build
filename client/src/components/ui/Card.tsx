import React from 'react';
import { motion } from 'framer-motion';
import { useOperateMode } from './OperateModeContext';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
  'aria-hidden'?: boolean | 'true' | 'false';
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverEffect = true, onClick, ...rest }) => {
  // Under /dashboard or /portal (OperateModeProvider), pick the tighter, flatter
  // Operate token set automatically instead of every one of ~20 admin pages
  // having to remember to override the Persuade-mode marketing card defaults.
  const isOperate = useOperateMode();

  // Callers that pass their own `bg-*` (e.g. dark CRM cards) opt out of the default
  // glass background so the two utility classes don't fight for the same property.
  const hasCustomBg = /\bbg-/.test(className);
  const hasCustomRadius = /\brounded-/.test(className);
  const hasCustomPadding = /\bp-\d|\bp[xy]-\d/.test(className);

  // A clickable card needs a real keyboard equivalent — without this, onClick-only
  // cards are invisible to keyboard and screen-reader users (WCAG 2.1.1).
  const interactiveProps = onClick
    ? {
        role: 'button' as const,
        tabIndex: 0,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        },
      }
    : {};

  // Operate mode: flat white surface, thin border, tight 16px radius, no glass/
  // blur, no lift-on-hover — a quiet bg shift instead, matching the row-hover
  // language already used across admin list pages rather than the marketing
  // card's "float toward the user" motion.
  const surfaceClasses = isOperate
    ? `${hasCustomBg ? '' : 'bg-white border border-dark/10'} ${hasCustomRadius ? '' : 'rounded-operateLg'} ${hasCustomPadding ? '' : 'p-5'} shadow-soft ${
        hoverEffect ? 'hover:bg-dark/[0.015] hover:border-dark/20' : ''
      }`
    : `${hasCustomBg ? '' : 'bg-white/80 backdrop-blur-glass border border-white/60'} rounded-card p-8 shadow-glass ${
        hoverEffect ? 'hover:shadow-hover hover:border-primary/50' : ''
      }`;

  return (
    <motion.div
      onClick={onClick}
      {...rest}
      {...interactiveProps}
      whileHover={hoverEffect && !isOperate ? { y: -8 } : undefined}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`${surfaceClasses} ${onClick ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2' : ''} transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
};
