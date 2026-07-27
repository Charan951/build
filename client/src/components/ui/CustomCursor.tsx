import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const CustomCursor: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Desktop only check per UI_UX_4_Guidelines.md
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement | null;
      if (target) {
        const clickable = target.closest('button, a, input, select, textarea, [data-cursor]');
        if (clickable) {
          setIsHovered(true);
          const label = clickable.getAttribute('data-cursor');
          setHoverLabel(label);
        } else {
          setIsHovered(false);
          setHoverLabel(null);
        }
      }
    };

    window.addEventListener('mousemove', updateMousePosition);

    return () => {
      window.removeEventListener('resize', checkDesktop);
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);

  if (!isDesktop) return null;

  return (
    <>
      {/* Outer Lime Ring / Label */}
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none flex items-center justify-center rounded-full bg-primary/20 border border-primary text-dark font-bold text-[10px] uppercase tracking-wider backdrop-blur-sm"
        animate={{
          x: mousePosition.x - (isHovered ? 28 : 12),
          y: mousePosition.y - (isHovered ? 28 : 12),
          width: isHovered ? 56 : 24,
          height: isHovered ? 56 : 24,
          scale: isHovered ? 1.15 : 1,
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 25, mass: 0.5 }}
      >
        {hoverLabel && <span className="text-center px-1 font-extrabold">{hoverLabel}</span>}
      </motion.div>

      {/* Inner Solid Cursor Dot */}
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none rounded-full bg-dark"
        animate={{
          x: mousePosition.x - 3,
          y: mousePosition.y - 3,
          width: 6,
          height: 6,
          opacity: isHovered ? 0 : 1,
        }}
        transition={{ duration: 0.05 }}
      />
    </>
  );
};
