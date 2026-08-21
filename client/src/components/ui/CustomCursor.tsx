import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const CustomCursor: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  // Raw pointer position as motion values: updated directly on every mousemove
  // without going through React state, so we don't re-render the whole app
  // (and everything that subscribes to it) at mouse-move frequency.
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const ringSpringX = useSpring(mouseX, { stiffness: 350, damping: 25, mass: 0.5 });
  const ringSpringY = useSpring(mouseY, { stiffness: 350, damping: 25, mass: 0.5 });

  const wasHoveredRef = useRef(false);
  const hoverLabelRef = useRef<string | null>(null);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);

    const updateMousePosition = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      const target = e.target as HTMLElement | null;
      const clickable = target?.closest('button, a, input, select, textarea, [data-cursor]') ?? null;
      const nextHovered = !!clickable;
      const nextLabel = clickable?.getAttribute('data-cursor') ?? null;

      // Only trigger a React re-render when the hover state actually changes,
      // not on every pixel of mouse movement.
      if (nextHovered !== wasHoveredRef.current) {
        wasHoveredRef.current = nextHovered;
        setIsHovered(nextHovered);
      }
      if (nextLabel !== hoverLabelRef.current) {
        hoverLabelRef.current = nextLabel;
        setHoverLabel(nextLabel);
      }
    };

    window.addEventListener('mousemove', updateMousePosition, { passive: true });

    return () => {
      window.removeEventListener('resize', checkDesktop);
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, [mouseX, mouseY]);

  if (!isDesktop) return null;

  return (
    <>
      {/* Outer Lime Ring / Label */}
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none flex items-center justify-center rounded-full bg-primary/20 border border-primary text-dark font-bold text-[10px] uppercase tracking-wider backdrop-blur-sm"
        style={{ x: ringSpringX, y: ringSpringY, translateX: '-50%', translateY: '-50%' }}
        animate={{
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
        className="fixed top-0 left-0 z-[9999] pointer-events-none rounded-full bg-dark w-1.5 h-1.5"
        style={{ x: mouseX, y: mouseY, translateX: '-50%', translateY: '-50%' }}
        animate={{ opacity: isHovered ? 0 : 1 }}
        transition={{ duration: 0.05 }}
      />
    </>
  );
};
