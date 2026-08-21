import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
  'aria-hidden'?: boolean | 'true' | 'false';
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverEffect = true, onClick, ...rest }) => {
  // Callers that pass their own `bg-*` (e.g. dark CRM cards) opt out of the default
  // glass background so the two utility classes don't fight for the same property.
  const hasCustomBg = /\bbg-/.test(className);

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

  return (
    <motion.div
      onClick={onClick}
      {...rest}
      {...interactiveProps}
      whileHover={hoverEffect ? { y: -8 } : undefined}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`${hasCustomBg ? '' : 'bg-white/80 backdrop-blur-glass border border-white/60'} rounded-card p-8 shadow-glass ${
        hoverEffect ? 'hover:shadow-hover hover:border-primary/50' : ''
      } ${onClick ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2' : ''} transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
};
