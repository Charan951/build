import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverEffect = true }) => {
  return (
    <motion.div
      whileHover={hoverEffect ? { y: -8 } : undefined}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`bg-white/80 backdrop-blur-glass border border-white/60 rounded-card p-8 shadow-glass ${
        hoverEffect ? 'hover:shadow-hover hover:border-primary/50' : ''
      } transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
};
