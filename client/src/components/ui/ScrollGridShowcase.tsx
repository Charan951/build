import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Star, Quote, Sparkles, Award } from 'lucide-react';
import { SectionHeader } from './SectionHeader';

// Layer 1 images (6 outer edge images)
const layer1Data = [
  { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80', tag: 'FinTech', title: 'Sub-10ms TPS Latency' },
  { url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80', tag: 'AI MedTech', title: 'FDA Compliant Portal' },
  { url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=80', tag: 'Logistics', title: '5-Day Delivery Engine' },
  { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80', tag: 'SaaS Platform', title: 'Enterprise Dashboard' },
  { url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80', tag: 'Cloud AWS', title: 'Zero Downtime Scaling' },
  { url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80', tag: 'Architecture', title: 'Strict Type-Safety' },
];

// Layer 2 images (6 inner column images)
const layer2Data = [
  { url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80', tag: 'UI/UX', title: 'Luxury Motion Aesthetics' },
  { url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80', tag: 'Team', title: 'Senior Tech Architects' },
  { url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80', tag: 'Agile', title: 'Rapid MVP Deployment' },
  { url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80', tag: 'Review', title: '5.0★ Client Rating' },
  { url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80', tag: 'Global', title: '100+ Enterprise Apps' },
  { url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80', tag: 'Impact', title: 'Scalable Growth ROI' },
];

// Layer 3 images (2 center column top & bottom)
const layer3Data = [
  { url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80', tag: 'Partnership', title: 'CTO Extension Model' },
  { url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80', tag: 'Quality', title: 'Unmatched Performance' },
];

export const ScrollGridShowcase: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
    layoutEffect: false,
  });

  // Main Build Your Thoughts card starts enlarged (2.2x scale) in the exact DEAD CENTER of the black card
  const centerScale = useTransform(scrollYProgress, [0, 0.5], [2.2, 1]);
  const centerRadius = useTransform(scrollYProgress, [0, 0.5], ['28px', '24px']);

  // Layer 1: Outer edge cards fade & scale in as you reach center
  const layer1Opacity = useTransform(scrollYProgress, [0.05, 0.5], [0, 1]);
  const layer1Scale = useTransform(scrollYProgress, [0.05, 0.5], [0.35, 1]);

  // Layer 2: Inner cards fade & scale in
  const layer2Opacity = useTransform(scrollYProgress, [0.1, 0.5], [0, 1]);
  const layer2Scale = useTransform(scrollYProgress, [0.1, 0.5], [0.45, 1]);

  // Layer 3: Center top/bottom cards
  const layer3Opacity = useTransform(scrollYProgress, [0.15, 0.5], [0, 1]);
  const layer3Scale = useTransform(scrollYProgress, [0.15, 0.5], [0.55, 1]);

  return (
    <div ref={containerRef} className="relative min-h-[145vh] bg-dark text-white rounded-[40px] overflow-hidden my-12">
      {/* Sticky viewport frame - Positioned 100% below floating navbar with clear 60px+ gap */}
      <div className="sticky top-44 md:top-52 h-[calc(100vh-13.5rem)] w-full flex flex-col justify-center items-center overflow-hidden px-3 pt-4 pb-4 md:px-6 md:pt-6 md:pb-6">
        {/* 5-Column x 3-Row Dynamic Grid Showcase - Positioned cleanly below floating navbar */}
        <div className="relative w-full max-w-7xl mx-auto h-[46vh] md:h-[50vh] max-h-[440px] min-h-[320px]">
          {/* Layer 1: Outer Edge Grid Cards */}
          <motion.div
            style={{ opacity: layer1Opacity, scale: layer1Scale }}
            className="absolute inset-0 grid grid-cols-3 md:grid-cols-5 grid-rows-3 gap-2.5 md:gap-4 z-10 pointer-events-auto"
          >
            {/* Top-Left */}
            <div className="col-start-1 row-start-1 rounded-2xl overflow-hidden border border-white/15 relative group bg-white/5">
              <img loading="lazy" src={layer1Data[0].url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-transparent to-transparent p-3 flex flex-col justify-end">
                <span className="text-[9px] font-mono text-primary uppercase font-bold">{layer1Data[0].tag}</span>
                <p className="text-[11px] font-bold text-white leading-tight">{layer1Data[0].title}</p>
              </div>
            </div>

            {/* Bottom-Left */}
            <div className="col-start-1 row-start-3 rounded-2xl overflow-hidden border border-white/15 relative group bg-white/5">
              <img loading="lazy" src={layer1Data[1].url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-transparent to-transparent p-3 flex flex-col justify-end">
                <span className="text-[9px] font-mono text-primary uppercase font-bold">{layer1Data[1].tag}</span>
                <p className="text-[11px] font-bold text-white leading-tight">{layer1Data[1].title}</p>
              </div>
            </div>

            {/* Top-Right */}
            <div className="col-start-3 md:col-start-5 row-start-1 rounded-2xl overflow-hidden border border-white/15 relative group bg-white/5">
              <img loading="lazy" src={layer1Data[2].url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-transparent to-transparent p-3 flex flex-col justify-end">
                <span className="text-[9px] font-mono text-primary uppercase font-bold">{layer1Data[2].tag}</span>
                <p className="text-[11px] font-bold text-white leading-tight">{layer1Data[2].title}</p>
              </div>
            </div>

            {/* Bottom-Right */}
            <div className="col-start-3 md:col-start-5 row-start-3 rounded-2xl overflow-hidden border border-white/15 relative group bg-white/5">
              <img loading="lazy" src={layer1Data[3].url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-transparent to-transparent p-3 flex flex-col justify-end">
                <span className="text-[9px] font-mono text-primary uppercase font-bold">{layer1Data[3].tag}</span>
                <p className="text-[11px] font-bold text-white leading-tight">{layer1Data[3].title}</p>
              </div>
            </div>

            {/* Mid-Left Outer */}
            <div className="hidden md:block col-start-1 row-start-2 rounded-2xl overflow-hidden border border-white/15 relative group bg-white/5">
              <img loading="lazy" src={layer1Data[4].url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-transparent to-transparent p-3 flex flex-col justify-end">
                <span className="text-[9px] font-mono text-primary uppercase font-bold">{layer1Data[4].tag}</span>
                <p className="text-[11px] font-bold text-white leading-tight">{layer1Data[4].title}</p>
              </div>
            </div>

            {/* Mid-Right Outer */}
            <div className="hidden md:block col-start-5 row-start-2 rounded-2xl overflow-hidden border border-white/15 relative group bg-white/5">
              <img loading="lazy" src={layer1Data[5].url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-transparent to-transparent p-3 flex flex-col justify-end">
                <span className="text-[9px] font-mono text-primary uppercase font-bold">{layer1Data[5].tag}</span>
                <p className="text-[11px] font-bold text-white leading-tight">{layer1Data[5].title}</p>
              </div>
            </div>
          </motion.div>

          {/* Layer 2: Inner Column Cards */}
          <motion.div
            style={{ opacity: layer2Opacity, scale: layer2Scale }}
            className="absolute inset-0 grid grid-cols-3 md:grid-cols-5 grid-rows-3 gap-2.5 md:gap-4 z-15 pointer-events-auto"
          >
            {/* Left Inner Top */}
            <div className="col-start-2 row-start-1 rounded-2xl overflow-hidden border border-white/20 relative group bg-white/5">
              <img loading="lazy" src={layer2Data[0].url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-transparent to-transparent p-3 flex flex-col justify-end">
                <span className="text-[9px] font-mono text-primary uppercase font-bold">{layer2Data[0].tag}</span>
                <p className="text-[11px] font-bold text-white leading-tight">{layer2Data[0].title}</p>
              </div>
            </div>

            {/* Left Inner Bottom */}
            <div className="col-start-2 row-start-3 rounded-2xl overflow-hidden border border-white/20 relative group bg-white/5">
              <img loading="lazy" src={layer2Data[1].url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-transparent to-transparent p-3 flex flex-col justify-end">
                <span className="text-[9px] font-mono text-primary uppercase font-bold">{layer2Data[1].tag}</span>
                <p className="text-[11px] font-bold text-white leading-tight">{layer2Data[1].title}</p>
              </div>
            </div>

            {/* Right Inner Top */}
            <div className="col-start-2 md:col-start-4 row-start-1 rounded-2xl overflow-hidden border border-white/20 relative group bg-white/5">
              <img loading="lazy" src={layer2Data[2].url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-transparent to-transparent p-3 flex flex-col justify-end">
                <span className="text-[9px] font-mono text-primary uppercase font-bold">{layer2Data[2].tag}</span>
                <p className="text-[11px] font-bold text-white leading-tight">{layer2Data[2].title}</p>
              </div>
            </div>

            {/* Right Inner Bottom */}
            <div className="col-start-2 md:col-start-4 row-start-3 rounded-2xl overflow-hidden border border-white/20 relative group bg-white/5">
              <img loading="lazy" src={layer2Data[3].url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-transparent to-transparent p-3 flex flex-col justify-end">
                <span className="text-[9px] font-mono text-primary uppercase font-bold">{layer2Data[3].tag}</span>
                <p className="text-[11px] font-bold text-white leading-tight">{layer2Data[3].title}</p>
              </div>
            </div>
          </motion.div>

          {/* Layer 3: Center Top & Bottom Cards */}
          <motion.div
            style={{ opacity: layer3Opacity, scale: layer3Scale }}
            className="absolute inset-0 grid grid-cols-3 md:grid-cols-5 grid-rows-3 gap-2.5 md:gap-4 z-20 pointer-events-auto"
          >
            {/* Center Top */}
            <div className="col-start-2 md:col-start-3 row-start-1 rounded-2xl overflow-hidden border border-primary/40 relative group bg-white/5 shadow-lg">
              <img loading="lazy" src={layer3Data[0].url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-transparent to-transparent p-3 flex flex-col justify-end">
                <span className="text-[9px] font-mono text-primary uppercase font-bold">{layer3Data[0].tag}</span>
                <p className="text-[11px] font-bold text-white leading-tight">{layer3Data[0].title}</p>
              </div>
            </div>

            {/* Center Bottom */}
            <div className="col-start-2 md:col-start-3 row-start-3 rounded-2xl overflow-hidden border border-primary/40 relative group bg-white/5 shadow-lg">
              <img loading="lazy" src={layer3Data[1].url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-transparent to-transparent p-3 flex flex-col justify-end">
                <span className="text-[9px] font-mono text-primary uppercase font-bold">{layer3Data[1]?.tag || 'Quality'}</span>
                <p className="text-[11px] font-bold text-white leading-tight">{layer3Data[1].title}</p>
              </div>
            </div>
          </motion.div>

          {/* Central Scaler Card */}
          <div className="absolute inset-0 grid grid-cols-3 md:grid-cols-5 grid-rows-3 gap-2.5 md:gap-4 z-30 pointer-events-auto">
            <div className="col-start-2 md:col-start-3 row-start-2 relative flex items-center justify-center">
              <motion.div
                style={{ scale: centerScale, borderRadius: centerRadius }}
                className="w-full h-full relative overflow-hidden border-2 border-primary shadow-2xl bg-dark group"
              >
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80"
                  alt="Build Your Thoughts Showcase"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-primary text-dark text-[10px] font-black uppercase font-mono tracking-wider">
                      BUILD YOUR THOUGHTS
                    </span>
                    <div className="flex items-center gap-1 text-primary">
                      <Star className="w-3.5 h-3.5 fill-primary" />
                      <span className="text-xs font-bold text-white">5.0</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-primary text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>INDIA'S PREMIUM DIGITAL ENGINEERING</span>
                    </div>
                    <p className="text-xs text-gray-200 font-medium leading-tight">
                      Architecting high-performance enterprise platforms, mobile applications, and 3D web experiences.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
