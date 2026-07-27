import React, { useState, useEffect } from 'react';
import { SEOHead } from '../components/seo/SEOHead';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    projectType: 'Enterprise Software',
    budgetRange: '$25,000 - $50,000',
    message: '',
  });

  const [settings, setSettings] = useState({
    address: 'Kota, Rajasthan, India',
    phone: '+91 98765 43210',
    email: 'hello@buildyourthoughts.com',
  });

  useEffect(() => {
    fetch('/api/v1/settings')
      .then((res) => res.json())
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

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/v1/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message);
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          projectType: 'Enterprise Software',
          budgetRange: '$25,000 - $50,000',
          message: '',
        });
      } else {
        setErrorMsg(data.message || 'Submission failed.');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 max-w-7xl mx-auto px-6 space-y-16">
      <SEOHead title="Contact & Consultation | Build Your Thoughts" />

      <SectionHeader
        badge="Start A Project"
        title="Let's Build Something Extraordinary Together"
        subtitle="Fill out the project inquiry form and our lead software architect will respond within 24 hours."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Contact Info */}
        <div className="lg:col-span-5 space-y-8 bg-dark text-white p-10 rounded-card border border-white/10">
          <h3 className="font-display text-3xl font-bold">Contact Details</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Have a technical scope or enterprise inquiry? Reach out directly to our engineering office.
          </p>

          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-primary flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-gray-400 block uppercase font-bold">Email Us</span>
                <a href={`mailto:${settings.email}`} className="font-bold text-white text-base hover:text-primary transition-colors">
                  {settings.email}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-primary flex items-center justify-center">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-gray-400 block uppercase font-bold">Call Us</span>
                <a href={`tel:${settings.phone}`} className="font-bold text-white text-base hover:text-primary transition-colors">
                  {settings.phone}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-primary flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-gray-400 block uppercase font-bold">Engineering Office</span>
                <span className="font-bold text-white text-base">{settings.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Project Inquiry Form */}
        <Card className="lg:col-span-7 p-10">
          {successMsg && (
            <div className="p-4 mb-6 rounded-form bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-sm font-semibold">{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 mb-6 rounded-form bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span className="text-sm font-semibold">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-dark mb-2">Your Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-3.5 rounded-form bg-background border border-dark/10 text-dark placeholder-gray-400 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-dark mb-2">Work Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@company.com"
                  className="w-full px-4 py-3.5 rounded-form bg-background border border-dark/10 text-dark placeholder-gray-400 text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-dark mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-3.5 rounded-form bg-background border border-dark/10 text-dark placeholder-gray-400 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-dark mb-2">Company / Organization</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Acme Corp"
                  className="w-full px-4 py-3.5 rounded-form bg-background border border-dark/10 text-dark placeholder-gray-400 text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-dark mb-2">Project Category</label>
                <select
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-form bg-background border border-dark/10 text-dark text-sm focus:outline-none focus:border-primary"
                >
                  <option value="Enterprise Software">Enterprise Software</option>
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="Mobile App Engineering">Mobile App Engineering</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                  <option value="UI/UX & Web Development">UI/UX & Web Development</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-dark mb-2">Estimated Budget</label>
                <select
                  value={formData.budgetRange}
                  onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-form bg-background border border-dark/10 text-dark text-sm focus:outline-none focus:border-primary"
                >
                  <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                  <option value="$25,000 - $50,000">$25,000 - $50,000</option>
                  <option value="$50,000 - $100,000">$50,000 - $100,000</option>
                  <option value="$100,000+">$100,000+</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-dark mb-2">Project Overview *</label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe your project goals, technical requirements, and timeline..."
                className="w-full px-4 py-3.5 rounded-form bg-background border border-dark/10 text-dark placeholder-gray-400 text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <Button variant="lime" size="lg" type="submit" disabled={loading} className="w-full gap-2">
              {loading ? 'Submitting Inquiry...' : 'Submit Inquiry'}
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
