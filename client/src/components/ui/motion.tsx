import React from 'react';
import { motion, useReducedMotion, Variants, Transition } from 'framer-motion';

/**
 * Shared motion layer: consistent easing/duration tokens + reveal primitives.
 * All motion here respects prefers-reduced-motion via framer-motion's useReducedMotion.
 *
 * Marketing pages: use <Reveal> / <Stagger> / <StaggerItem> for entrance choreography.
 * Admin/CRM pages: use <FadeIn> for restrained, fast, functional entrances (rows, tiles, modals).
 */

// ---- Timing tokens -------------------------------------------------------

export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1];

export const DURATION = {
  fast: 0.25,   // admin/CRM micro-feedback (row hover, toggle, tap)
  base: 0.45,   // default UI transitions
  slow: 0.7,    // marketing entrances
  hero: 0.9,    // hero-level reveals
} as const;

// ---- Marketing: scroll reveal stagger ------------------------------------

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASE_OUT },
  },
};

export const Reveal: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
  y?: number;
}> = ({ children, className, delay = 0, amount = 0.3, y = 28 }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: DURATION.slow, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
};

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export const Stagger: React.FC<{
  children: React.ReactNode;
  className?: string;
  amount?: number;
}> = ({ children, className, amount = 0.2 }) => {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={revealVariants}>
      {children}
    </motion.div>
  );
};

// ---- Admin/CRM: restrained, fast, functional -----------------------------

/**
 * FadeIn: for dense product UI (table rows, stat tiles, modals). Subtle, fast,
 * no scroll-hijacking. Per design-taste-frontend Section 13, dashboards get
 * light functional motion, not landing-page spectacle.
 */
export const FadeIn: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className, delay = 0 }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.fast, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
};

/** Row-level entrance for tables/lists, staggered by index but capped fast. */
export const rowTransition = (index: number): Transition => ({
  duration: DURATION.fast,
  delay: Math.min(index * 0.03, 0.3),
  ease: EASE_OUT,
});

/** Tap/hover micro-interaction props for buttons and interactive tiles. */
export const tapScale = { whileTap: { scale: 0.98 }, whileHover: { scale: 1.01 } };
export const tapScaleSubtle = { whileTap: { scale: 0.99 } };

export { motion, useReducedMotion };
