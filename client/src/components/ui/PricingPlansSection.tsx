import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Star, Sparkles, ArrowRight, Check, X } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { Badge } from './Badge';

export const PricingPlansSection: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/v1/pricing-plans')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setPlans(data.data);
        }
      })
      .catch(() => {});
  }, []);

  if (plans.length === 0) return null;

  return (
    <div className="space-y-12 py-4">
      {/* Title & Subtitle matching image copy 8 */}
      <div className="text-center space-y-3">
        <h2 className="font-display text-3xl md:text-5xl font-black text-dark tracking-tight">
          Choose Your <span className="text-primary font-black">Startup Plan</span>
        </h2>
        <p className="text-base md:text-lg text-slateText max-w-2xl mx-auto">
          Get everything you need to launch your million-dollar startup
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto px-2">
        {plans.map((plan) => (
          <motion.div
            key={plan._id}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3 }}
            className="flex"
          >
            <Card
              className={`p-8 md:p-10 bg-white border flex flex-col justify-between h-full w-full rounded-3xl relative transition-all duration-300 ${
                plan.isPopular
                  ? 'border-2 border-primary shadow-2xl scale-105 z-10'
                  : 'border-slate-200 shadow-md hover:shadow-xl'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge variant="lime" className="px-4 py-1 text-xs font-black shadow-md uppercase tracking-wider flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-dark" /> Most Popular
                  </Badge>
                </div>
              )}

              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="font-display text-2xl font-extrabold text-dark">{plan.name}</h3>

                  <div className="flex items-baseline justify-center gap-1">
                    <span className="font-display text-4xl md:text-5xl font-black text-dark tracking-tight">
                      {plan.price}
                    </span>
                  </div>

                  <span className="inline-block text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {plan.billingCycle || 'One-time payment'}
                  </span>
                </div>

                {plan.description && (
                  <p className="text-xs text-slateText text-center leading-relaxed">
                    {plan.description}
                  </p>
                )}

                {/* Features Checkmark & Exclude List */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  {plan.features?.map((f: string, i: number) => {
                    const lowerF = f.toLowerCase();
                    const isExcluded =
                      lowerF.startsWith('no ') ||
                      lowerF.startsWith('not ') ||
                      lowerF.startsWith('✕') ||
                      lowerF.startsWith('x ') ||
                      lowerF.startsWith('!') ||
                      lowerF.includes('not included') ||
                      lowerF.includes('no source code');

                    return (
                      <div key={i} className="flex items-start gap-3 text-xs">
                        {isExcluded ? (
                          <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                            <X className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                        <span className={`leading-snug pt-0.5 ${isExcluded ? 'text-slate-400 font-medium' : 'text-dark font-bold'}`}>
                          {f}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8 mt-auto">
                <Link to={`/contact?plan=${encodeURIComponent(plan.name)}`} className="block">
                  <Button
                    variant="lime"
                    size="lg"
                    className="w-full justify-center py-4 text-sm font-extrabold shadow-soft gap-2 font-display uppercase tracking-wider"
                  >
                    {plan.buttonText || 'Choose This Plan'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
