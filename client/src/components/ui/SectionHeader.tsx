import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { EASE_OUT, DURATION } from './motion';

interface SectionHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  badge,
  title,
  subtitle,
  align = 'center',
  className = '',
}) => {
  const reduce = useReducedMotion();
  const alignment = align === 'center' ? 'text-center mx-auto items-center' : 'text-left items-start';

  return (
    <div className={`flex flex-col max-w-3xl mb-16 ${alignment} ${className}`}>
      {badge && (
        <motion.span
          initial={reduce ? false : { opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DURATION.base, ease: EASE_OUT }}
          className="inline-block px-4 py-1.5 mb-4 rounded-full bg-primary/20 text-dark text-caption font-bold uppercase tracking-widest border border-primary/30"
        >
          {badge}
        </motion.span>
      )}
      <motion.h2
        initial={reduce ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: DURATION.slow, delay: 0.08, ease: EASE_OUT }}
        className="font-display text-h1 font-bold text-dark"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DURATION.slow, delay: 0.16, ease: EASE_OUT }}
          className={`mt-5 text-bodyLg text-slateText leading-relaxed font-sans text-measure ${align === 'center' ? 'mx-auto' : ''}`}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
};
