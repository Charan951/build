import React, { useState, useEffect } from 'react';
import { SEOHead } from '../components/seo/SEOHead';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { IconBadge } from '../components/ui/IconBadge';
import { LeadForm } from '../components/ui/LeadForm';
import { Mail, Phone, MapPin } from 'lucide-react';
import { apiFetch } from '../services/api';

const PROJECT_TYPE_OPTIONS = [
  { label: 'Enterprise Software', value: 'Enterprise Software' },
  { label: 'AI & Machine Learning', value: 'AI & Machine Learning' },
  { label: 'Mobile App Engineering', value: 'Mobile App Engineering' },
  { label: 'Cloud & DevOps', value: 'Cloud & DevOps' },
  { label: 'UI/UX & Web Development', value: 'UI/UX & Web Development' },
];

const BUDGET_OPTIONS = [
  { label: '$10,000 - $25,000', value: '$10,000 - $25,000' },
  { label: '$25,000 - $50,000', value: '$25,000 - $50,000' },
  { label: '$50,000 - $100,000', value: '$50,000 - $100,000' },
  { label: '$100,000+', value: '$100,000+' },
];

export const ContactPage: React.FC = () => {
  const [settings, setSettings] = useState({
    address: 'Kota, Rajasthan, India',
    phone: '+91 98765 43210',
    email: 'hello@buildyourthoughts.com',
  });

  useEffect(() => {
    apiFetch('/settings')
      .then((data) => {
        if (data.success && data.data) {
          setSettings({
            address: data.data.address || 'Kota, Rajasthan, India',
            phone: data.data.phone || '+91 98765 43210',
            email: data.data.email || 'hello@buildyourthoughts.com',
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="pt-32 max-w-7xl mx-auto px-6 space-y-16">
      <SEOHead title="Contact & Consultation | Build Your Thoughts" canonical="https://buildyourthoughts.com/contact" />

      <SectionHeader
        badge="Start A Project"
        title="Let's Build Something Extraordinary Together"
        subtitle="Fill out the project inquiry form and our lead software architect will respond within 24 hours."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Contact Info */}
        <div className="lg:col-span-5 space-y-8 bg-dark text-white p-10 rounded-card border border-white/10">
          <h3 className="font-display text-3xl font-bold">Contact Details</h3>
          <p className="text-mutedOnDark text-sm leading-relaxed">
            Have a technical scope or enterprise inquiry? Reach out directly to our engineering office.
          </p>

          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-4">
              <IconBadge icon={Mail} tone="onDark" />
              <div>
                <span className="text-xs text-mutedOnDark block uppercase font-bold">Email Us</span>
                <a href={`mailto:${settings.email}`} className="font-bold text-white text-base hover:text-primary transition-colors">
                  {settings.email}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <IconBadge icon={Phone} tone="onDark" />
              <div>
                <span className="text-xs text-mutedOnDark block uppercase font-bold">Call Us</span>
                <a href={`tel:${settings.phone}`} className="font-bold text-white text-base hover:text-primary transition-colors">
                  {settings.phone}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <IconBadge icon={MapPin} tone="onDark" />
              <div>
                <span className="text-xs text-mutedOnDark block uppercase font-bold">Engineering Office</span>
                <span className="font-bold text-white text-base">{settings.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Project Inquiry Form */}
        <Card className="lg:col-span-7 p-10">
          <LeadForm
            variant="full"
            projectTypeOptions={PROJECT_TYPE_OPTIONS}
            budgetOptions={BUDGET_OPTIONS}
            buildPayload={(v) => ({
              name: v.name,
              email: v.email,
              phone: v.phone,
              company: v.company,
              projectType: v.projectType,
              budgetRange: v.budgetRange,
              message: v.message,
            })}
            submitLabel="Submit Inquiry"
          />
        </Card>
      </div>
    </div>
  );
};
