import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export const ProgressBar: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 25,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] bg-primary z-[10000] origin-left shadow-[0_0_10px_#CDFB47]"
    />
  );
};
