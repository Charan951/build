import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from './Button';
import CoverflowGallery, { CoverflowSlide } from '../originkit/coverflowgallery';
import { apiFetch } from '../../services/api';

// Direction-aware crossfade for the info card below the gallery — shared by
// mobile and desktop so a "next" always slides the same way regardless of
// which control triggered it (pill tap, coverflow autoplay, or swipe).
const cardVariants = {
  enter: (direction: number) => ({ opacity: 0, x: direction >= 0 ? 24 : -24 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction >= 0 ? -24 : 24 }),
};

const reducedCardVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

// Staggered reveal for the feature chips — a small rise-in per chip instead
// of the whole list popping in as one flat block with the card.
const featureItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const reducedFeatureItemVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const featureContainerVariants = (stagger: number, reduced: boolean) => ({
  hidden: {},
  visible: {
    transition: reduced ? {} : { staggerChildren: stagger, delayChildren: 0.08 },
  },
});

export const PlatformSolutionsCarousel: React.FC = () => {
  const [solutions, setSolutions] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef<any>(null);
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    apiFetch('/platform-solutions')
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setSolutions(data.data);
          const hIdx = data.data.findIndex((item: any) => item.isHighlighted);
          if (hIdx !== -1) setActiveIndex(hIdx);
        }
      })
      .catch(() => {});
  }, []);

  // Restart timer on user interaction so manual navigation is never interrupted
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (solutions.length <= 1) return;
    timerRef.current = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % solutions.length);
    }, 3500);
  }, [solutions.length]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  // Keep the active pill scrolled into view in the horizontally-scrollable
  // bar, since the active index can change from something other than a
  // direct tap (autoplay tick, coverflow drag, mobile swipe).
  useEffect(() => {
    const pill = pillRefs.current[activeIndex];
    const container = pill?.parentElement;
    if (!pill || !container) return;
    const target =
      pill.offsetLeft - container.clientWidth / 2 + pill.clientWidth / 2;
    container.scrollTo({
      left: target,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }, [activeIndex, prefersReducedMotion]);

  if (solutions.length === 0) return null;

  // Shortest-path direction between two indices on a circular track, so the
  // crossfade always slides the way that feels natural even across the wrap.
  const goTo = (index: number) => {
    const forwardDistance = (index - activeIndex + solutions.length) % solutions.length;
    setDirection(forwardDistance <= solutions.length / 2 ? 1 : -1);
    setActiveIndex(index);
  };

  // Format solutions into CoverflowSlide format for desktop 3D view
  const coverflowSlides: CoverflowSlide[] = solutions.map((sol) => ({
    image: {
      src:
        sol.image ||
        sol.heroImage ||
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
      alt: sol.title,
    },
    title: sol.title,
    subtitle: sol.description,
    badge: sol.badge || 'Platform Solution',
    description: sol.description,
    slug: sol.slug,
    linkUrl: sol.ctaLink || '/contact',
  }));

  const activeSolution = solutions[activeIndex] || solutions[0];

  const handlePrev = () => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + solutions.length) % solutions.length);
    startTimer();
  };

  const handleNext = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % solutions.length);
    startTimer();
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-black uppercase tracking-widest text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20 inline-block">
          Platform Solutions
        </span>
        <h2 className="font-display text-2xl md:text-4xl font-black text-white tracking-tight">
          Our Platform Solutions
        </h2>
        <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto">
          Explore complete digital ecosystems designed for enterprise growth.
        </p>
      </div>

      {/* Horizontal Draggable / Scrollable Solution Buttons Bar — real gradient
          overlays at each edge (not a CSS mask, which renders unreliably
          across browsers with bordered/translucent children) so a partially
          -visible pill dissolves into the dark background instead of being
          hard-clipped mid-word when there are more categories than fit. */}
      <div className="relative max-w-4xl mx-auto">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 z-10 bg-gradient-to-r from-dark to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 z-10 bg-gradient-to-l from-dark to-transparent" />
        <div className="overflow-x-auto pb-2 px-2 no-scrollbar scrollbar-none flex items-center gap-2.5 justify-start sm:justify-center">
        {solutions.map((sol, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={sol._id || idx}
              ref={(el) => { pillRefs.current[idx] = el; }}
              onClick={() => {
                goTo(idx);
                startTimer();
              }}
              className={`relative px-4 py-2.5 rounded-full text-xs font-black tracking-wide whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-300 ${
                isActive
                  ? 'text-dark border-2 border-primary'
                  : 'text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activePlatformPill"
                  className="absolute inset-0 bg-primary rounded-full shadow-lg"
                  transition={
                    prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 30 }
                  }
                />
              )}
              <span className="relative z-10">{sol.title}</span>
            </button>
          );
        })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MOBILE RESPONSIVE AUTO-SLIDING TOUCH CAROUSEL (Visible on Mobile < 768px)*/}
      {/* ========================================================================= */}
      <div className="block md:hidden max-w-md mx-auto space-y-4">
        <div className="relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeSolution._id || activeIndex}
              custom={direction}
              variants={prefersReducedMotion ? reducedCardVariants : cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, info) => {
                if (info.offset.x < -20) {
                  handleNext();
                } else if (info.offset.x > 20) {
                  handlePrev();
                }
              }}
              className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-4 space-y-4 cursor-grab active:cursor-grabbing select-none"
            >
              {/* Image Header */}
              {(activeSolution.image || activeSolution.heroImage) && (
                <div className="relative h-36 rounded-2xl overflow-hidden border border-white/10">
                  <img
                    src={activeSolution.image || activeSolution.heroImage}
                    alt={activeSolution.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary text-dark font-mono shadow-md">
                      {activeSolution.badge || 'Platform Solution'}
                    </span>
                  </div>
                </div>
              )}

              {/* Title & Badge */}
              <div className="border-b border-white/10 pb-3">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                  {activeIndex + 1} of {solutions.length}
                </span>
                <h3 className="font-display text-xl font-extrabold text-white leading-tight">
                  {activeSolution.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-gray-300 text-xs leading-relaxed">
                {activeSolution.description}
              </p>

              {/* Key Features */}
              {activeSolution.features && activeSolution.features.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">
                    Key Features:
                  </span>
                  <motion.div
                    className="space-y-2"
                    variants={featureContainerVariants(0.035, !!prefersReducedMotion)}
                    initial="hidden"
                    animate="visible"
                  >
                    {activeSolution.features.map((feature: string, idx: number) => (
                      <motion.div
                        key={idx}
                        variants={prefersReducedMotion ? reducedFeatureItemVariants : featureItemVariants}
                        className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-2 rounded-xl text-xs font-bold text-gray-200"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate">{feature}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              )}

              {/* CTA Button */}
              <div className="pt-1">
                <Link to={activeSolution.ctaLink || '/contact'} className="block">
                  <Button
                    variant="lime"
                    size="md"
                    className="w-full justify-center py-3 text-xs font-black tracking-wider uppercase shadow-soft gap-2 text-dark"
                  >
                    <Sparkles className="w-4 h-4 shrink-0 text-dark" />
                    {activeSolution.ctaText || 'BOOK FREE CONSULTATION'}
                    <ArrowRight className="w-4 h-4 text-dark" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP INTERACTIVE 3D COVERFLOW GALLERY (Visible on Desktop >= 768px) */}
      {/* ========================================================================= */}
      <div className="hidden md:block space-y-6">
        {/* 3D Coverflow Gallery Component from Originkit */}
        <div className="h-[440px] w-full relative my-2">
          <CoverflowGallery
            slides={coverflowSlides}
            cardWidth={440}
            cardHeight={310}
            radius={12}
            tilt={16}
            sideTilt={8}
            gap={10}
            opacity={55}
            autoplay={true}
            showTitle={true}
            onSlideChange={(index) => goTo(index)}
          />
        </div>

        {/* Active Platform Feature Card & CTA */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeSolution._id || activeIndex}
            custom={direction}
            variants={prefersReducedMotion ? reducedCardVariants : cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="max-w-3xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl backdrop-blur-md"
          >
            <div className="border-b border-white/10 pb-4">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary text-dark font-mono">
                  {activeSolution.badge || 'Platform Solution'}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {activeIndex + 1} of {solutions.length}
                </span>
              </div>
              <h3 className="font-display text-2xl font-black text-white">{activeSolution.title}</h3>
            </div>

            <p className="text-gray-300 text-base leading-relaxed">
              {activeSolution.description}
            </p>

            {/* Key Features Grid */}
            {activeSolution.features && activeSolution.features.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                  Key Features Included:
                </span>
                <motion.div
                  className="grid grid-cols-2 gap-3"
                  variants={featureContainerVariants(0.05, !!prefersReducedMotion)}
                  initial="hidden"
                  animate="visible"
                >
                  {activeSolution.features.map((feature: string, idx: number) => (
                    <motion.div
                      key={idx}
                      variants={prefersReducedMotion ? reducedFeatureItemVariants : featureItemVariants}
                      className="flex items-center gap-2.5 bg-white/5 border border-white/5 px-4 py-2.5 rounded-2xl text-xs font-bold text-gray-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span>{feature}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}

            {/* Action CTA Button */}
            <div className="pt-2">
              <Link to={activeSolution.ctaLink || '/contact'} className="block">
                <Button
                  variant="lime"
                  size="lg"
                  className="w-full justify-center py-4 text-sm font-black tracking-wider uppercase shadow-soft gap-2 text-dark"
                >
                  <Sparkles className="w-4 h-4 shrink-0 text-dark" />
                  {activeSolution.ctaText || 'BOOK FREE CONSULTATION'}
                  <ArrowRight className="w-4 h-4 text-dark" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
