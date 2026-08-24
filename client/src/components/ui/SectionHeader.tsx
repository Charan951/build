import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { EASE_OUT, DURATION } from './motion';

interface SectionHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
  /**
   * Heading level to render. Defaults to 'h2' since this component is
   * reused for multiple sections on the same page (e.g. HomePage uses it
   * 4 times). Pass 'h1' only where this is the page's single main title -
   * e.g. list pages (Services/Projects/Blogs/Contact) that use it exactly
   * once, or the first usage on a page like About that uses it twice.
   */
  as?: 'h1' | 'h2';
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  badge,
  title,
  subtitle,
  align = 'center',
  className = '',
  as = 'h2',
}) => {
  const reduce = useReducedMotion();
  const alignment = align === 'center' ? 'text-center mx-auto items-center' : 'text-left items-start';
  const HeadingTag = motion[as];

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
      <HeadingTag
        initial={reduce ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: DURATION.slow, delay: 0.08, ease: EASE_OUT }}
        className="font-display text-h1 font-bold text-dark"
      >
        {title}
      </HeadingTag>
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
