import React from 'react';
import { Star, CheckCircle2, Quote } from 'lucide-react';
import { Card } from './Card';

interface Review {
  name: string;
  role: string;
  rating: number;
  quote: string;
  avatarColor: string;
}

const reviewsData: Review[] = [
  {
    name: 'Rohit Mehta',
    role: 'Founder, EduTech',
    rating: 5,
    quote: 'Build Your Thoughts built a complete platform for us with Android, iOS, and Web portal. They handled everything seamlessly right to deployment.',
    avatarColor: 'bg-gradient-to-tr from-amber-500 to-orange-400',
  },
  {
    name: 'Sanjay Patel',
    role: 'Co-Founder, GoDelivery',
    rating: 5,
    quote: 'We needed a fast delivery solution and BYT IT gave us exactly what we needed. The product is stable, fast, and scalable. Super technical support!',
    avatarColor: 'bg-gradient-to-tr from-blue-500 to-indigo-500',
  },
  {
    name: 'Priya Sharma',
    role: 'CTO, FinPay Global',
    rating: 5,
    quote: 'Truly a reliable partner for tech startups. Delivered customer mobile apps and master admin panel in record time.',
    avatarColor: 'bg-gradient-to-tr from-emerald-400 to-teal-600',
  },
  {
    name: 'Imran Ali',
    role: 'Director, HyperMarket',
    rating: 5,
    quote: 'Needed quick launch, which the team quickly delivered. Very professional service and high code quality.',
    avatarColor: 'bg-gradient-to-tr from-purple-500 to-pink-500',
  },
  {
    name: 'Hassan Mohammad',
    role: 'Director, LogisticsApp',
    rating: 5,
    quote: 'BYT IT was our trusted partner during our initial launch. Today we are growing internationally, and we are grateful for their contribution.',
    avatarColor: 'bg-gradient-to-tr from-rose-500 to-amber-500',
  },
];

const statsData = [
  { value: '169', label: 'Happy Clients' },
  { value: '178', label: 'Projects Delivered' },
  { value: '4.6', label: 'Average Rating' },
  { value: '5 Days', label: 'Average Delivery' },
];

export const ReviewsSection: React.FC = () => {
  return (
    <div className="space-y-12 py-4">
      {/* Title & Subtitle matching image copy 8 */}
      <div className="text-center space-y-3">
        <h2 className="font-display text-3xl md:text-5xl font-black text-dark tracking-tight">
          What Our <span className="text-primary font-black">Clients Say</span>
        </h2>
        <p className="text-base md:text-lg text-slateText max-w-2xl mx-auto">
          Real stories from real clients who trusted us with their vision and achieved remarkable success
        </p>
      </div>

      {/* Animated Reviews Carousel Marquee */}
      <div className="relative overflow-hidden py-4">
        {/* Fade gradients on edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee gap-6">
          {[...reviewsData, ...reviewsData].map((rev, idx) => (
            <Card
              key={idx}
              // Second half is a duplicate that only exists to complete the seamless
              // loop illusion — hide it from assistive tech so testimonials aren't
              // announced twice.
              {...(idx >= reviewsData.length ? { 'aria-hidden': true } : {})}
              className="w-[320px] md:w-[380px] p-6 bg-white border border-slate-200/90 rounded-card space-y-4 shrink-0 shadow-sm hover:shadow-lg transition-all duration-300 group"
            >
              {/* Stars & Verified */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-dark ml-1">5.0</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified Client
                </span>
              </div>

              {/* Quote Text */}
              <p className="text-xs text-slateText leading-relaxed italic relative pl-4 border-l-2 border-primary">
                "{rev.quote}"
              </p>

              {/* User Avatar & Info */}
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <div
                  className={`w-10 h-10 rounded-full text-white font-bold text-sm flex items-center justify-center shadow-md ${rev.avatarColor}`}
                >
                  {rev.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-display text-sm font-extrabold text-dark group-hover:text-primary transition-colors">
                    {rev.name}
                  </h4>
                  <p className="text-[11px] text-gray-500">{rev.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 4 Stat Counter Cards matching image copy 8 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 max-w-5xl mx-auto text-center">
        {statsData.map((st, i) => (
          <div
            key={i}
            className="p-6 rounded-card bg-white border border-slate-200/80 shadow-sm space-y-1 hover:border-primary transition-all duration-300"
          >
            <div className="font-display text-3xl md:text-4xl font-black text-dark tracking-tight">
              {st.value}
            </div>
            <div className="text-xs font-bold text-slateText uppercase tracking-wider">
              {st.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
