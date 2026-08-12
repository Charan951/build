import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '../../components/seo/SEOHead';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Save, MapPin, Phone, Mail, Globe, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiFetch } from '../../services/api';

export const ManageSettingsPage: React.FC = () => {
  const [address, setAddress] = useState('Kota, Rajasthan, India');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState('hello@buildyourthoughts.com');
  const [githubUrl, setGithubUrl] = useState('https://github.com');
  const [twitterUrl, setTwitterUrl] = useState('https://twitter.com');
  const [linkedinUrl, setLinkedinUrl] = useState('https://linkedin.com');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/settings');
      if (data.success && data.data) {
        setAddress(data.data.address || 'Kota, Rajasthan, India');
        setPhone(data.data.phone || '+91 98765 43210');
        setEmail(data.data.email || 'hello@buildyourthoughts.com');
        setGithubUrl(data.data.githubUrl || 'https://github.com');
        setTwitterUrl(data.data.twitterUrl || 'https://twitter.com');
        setLinkedinUrl(data.data.linkedinUrl || 'https://linkedin.com');
      }
    } catch {
      setErrorMsg('Failed to load company settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const data = await apiFetch('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          address,
          phone,
          email,
          githubUrl,
          twitterUrl,
          linkedinUrl,
        }),
      });

      if (data.success) {
        setSuccessMsg('Company contact info successfully saved & updated live across website!');
      } else {
        setErrorMsg(data.message || 'Failed to update settings.');
      }
    } catch {
      setErrorMsg('Error connecting to server.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-4 space-y-8">
      <SEOHead title="Manage Company Contact Details | Admin" />

      {/* Back Button */}
      <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-slateText hover:text-dark font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Admin Dashboard
      </Link>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <Card className="p-8 bg-white border border-slate-200/90 rounded-3xl shadow-soft">
        {loading ? (
          <div className="py-12 text-center text-slateText font-medium">Loading settings...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Address */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-dark flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Office Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                rows={3}
                placeholder="e.g. 101 Innovation Hub, Kota, Rajasthan, India 324005"
                className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-dark font-medium text-dark bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Phone */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-dark flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" /> Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="+91 98765 43210"
                  className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-dark font-medium text-dark bg-slate-50/50"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-dark flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" /> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="hello@buildyourthoughts.com"
                  className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-dark font-medium text-dark bg-slate-50/50"
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h3 className="text-sm font-bold text-dark flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" /> Social Media Links (Optional)
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slateText">GitHub</label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com"
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-dark"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slateText">Twitter / X</label>
                  <input
                    type="url"
                    value={twitterUrl}
                    onChange={(e) => setTwitterUrl(e.target.value)}
                    placeholder="https://twitter.com"
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-dark"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slateText">LinkedIn</label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com"
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-dark"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex justify-end">
              <Button variant="lime" size="lg" type="submit" disabled={saving} className="gap-2 font-bold px-8">
                <Save className="w-4 h-4 text-dark" />
                {saving ? 'Saving Changes...' : 'Save Settings'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};
