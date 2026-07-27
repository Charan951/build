import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, Phone, MapPin, Instagram, Linkedin, Facebook, Twitter } from 'lucide-react';
import { apiFetch } from '../../services/api';

export const Footer: React.FC = () => {
  const [settings, setSettings] = useState({
    address: 'Kota, Rajasthan, India',
    phone: '+91 98765 43210',
    email: 'hello@buildyourthoughts.com',
    githubUrl: 'https://github.com',
    twitterUrl: 'https://twitter.com',
    linkedinUrl: 'https://linkedin.com',
    instagramUrl: 'https://instagram.com',
    facebookUrl: 'https://facebook.com',
  });

  useEffect(() => {
    apiFetch('/settings')
      .then((data) => {
        if (data.success && data.data) {
          setSettings({
            address: data.data.address || 'Kota, Rajasthan, India',
            phone: data.data.phone || '+91 98765 43210',
            email: data.data.email || 'hello@buildyourthoughts.com',
            githubUrl: data.data.githubUrl || 'https://github.com',
            twitterUrl: data.data.twitterUrl || 'https://twitter.com',
            linkedinUrl: data.data.linkedinUrl || 'https://linkedin.com',
            instagramUrl: data.data.instagramUrl || 'https://instagram.com',
            facebookUrl: data.data.facebookUrl || 'https://facebook.com',
          });
        }
      })
      .catch(() => {});
  }, []);

  const socialLinks = [
    { name: 'Instagram', icon: Instagram, href: settings.instagramUrl || 'https://instagram.com' },
    { name: 'LinkedIn', icon: Linkedin, href: settings.linkedinUrl || 'https://linkedin.com' },
    { name: 'Facebook', icon: Facebook, href: settings.facebookUrl || 'https://facebook.com' },
    { name: 'Twitter', icon: Twitter, href: settings.twitterUrl || 'https://twitter.com' },
  ];

  return (
    <footer className="bg-dark text-white pt-12 md:pt-24 pb-12 px-6 border-t border-white/10 rounded-t-[40px] mt-12 md:mt-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-16">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-dark font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-white">
              Build Your Thoughts
            </span>
          </div>
          <p className="text-gray-400 max-w-sm text-base leading-relaxed">
            Transforming ideas into intelligent enterprise digital experiences through high-performance engineering and world-class 3D motion design.
          </p>

          {/* Latest Social Links (Instagram, LinkedIn, Facebook, Twitter) */}
          <div className="flex items-center gap-3 pt-2">
            {socialLinks.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  title={item.name}
                  aria-label={item.name}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-primary hover:border-primary hover:bg-primary/10 hover:scale-110 transition-all duration-300 shadow-sm"
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Quick Links Column */}
        <div>
          <h4 className="font-display text-lg font-bold text-white mb-4 md:mb-6">Company</h4>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            <li><Link to="/services" className="hover:text-primary transition-colors">Services</Link></li>
            <li><Link to="/projects" className="hover:text-primary transition-colors">Projects</Link></li>
            <li><Link to="/blogs" className="hover:text-primary transition-colors">Technical Blogs</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* Dynamic Contact Details Column */}
        <div className="space-y-4">
          <h4 className="font-display text-lg font-bold text-white mb-4 md:mb-6">Get in Touch</h4>

          <div className="space-y-4 text-sm text-gray-300">
            {/* Address */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span className="text-gray-300 leading-relaxed">{settings.address}</span>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary shrink-0" />
              <a href={`tel:${settings.phone}`} className="text-gray-300 hover:text-primary transition-colors font-medium">
                {settings.phone}
              </a>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3 min-w-0">
              <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <a href={`mailto:${settings.email}`} className="text-gray-300 hover:text-primary transition-colors font-medium break-all min-w-0">
                {settings.email}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Dynamic "CALL FOR PROJECT" Auto-Scrolling Marquee Ticker */}
      {/* ========================================================================= */}
      <div className="w-full overflow-hidden border-y border-white/10 py-6 mb-12 bg-white/[0.02]">
        <a
          href={`tel:${settings.phone}`}
          className="block group cursor-pointer"
          title={`Call for Project: ${settings.phone}`}
        >
          <div className="animate-marquee flex items-center whitespace-nowrap gap-10 select-none">
            <div className="flex items-center gap-10 shrink-0">
              {[1, 2, 3, 4].map((i) => (
                <React.Fragment key={i}>
                  <span className="font-display text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-primary transition-colors">
                    CALL FOR PROJECT
                  </span>
                  <span className="font-display text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white group-hover:text-primary transition-colors">
                    {settings.phone}
                  </span>
                  <span className="text-primary text-2xl sm:text-4xl">•</span>
                </React.Fragment>
              ))}
            </div>
            <div className="flex items-center gap-10 shrink-0">
              {[1, 2, 3, 4].map((i) => (
                <React.Fragment key={i}>
                  <span className="font-display text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-primary transition-colors">
                    CALL FOR PROJECT
                  </span>
                  <span className="font-display text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white group-hover:text-primary transition-colors">
                    {settings.phone}
                  </span>
                  <span className="text-primary text-2xl sm:text-4xl">•</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </a>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-4">
        <p>© {new Date().getFullYear()} Build Your Thoughts. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors">Security</a>
        </div>
      </div>
    </footer>
  );
};
