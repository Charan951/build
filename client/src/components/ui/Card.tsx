import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverEffect = true, onClick }) => {
  // Callers that pass their own `bg-*` (e.g. dark CRM cards) opt out of the default
  // glass background so the two utility classes don't fight for the same property.
  const hasCustomBg = /\bbg-/.test(className);

  return (
    <motion.div
      onClick={onClick}
      whileHover={hoverEffect ? { y: -8 } : undefined}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`${hasCustomBg ? '' : 'bg-white/80 backdrop-blur-glass border border-white/60'} rounded-card p-8 shadow-glass ${
        hoverEffect ? 'hover:shadow-hover hover:border-primary/50' : ''
      } transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
};
