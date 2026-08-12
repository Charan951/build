import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Projects', path: '/projects' },
    { name: 'Blogs', path: '/blogs' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 ease-out ${
        scrolled
          ? 'px-3 pt-3 md:px-4 md:pt-6 pb-2'
          : 'px-3 pt-3 md:px-0 md:pt-0 pb-0'
      }`}
    >
      <nav
        className={`w-full flex items-center justify-between transition-all duration-500 ease-out ${
          scrolled
            ? 'max-w-6xl h-[68px] md:h-[72px] px-5 md:px-6 rounded-full glass-nav text-white shadow-2xl border border-white/15 scale-[0.99]'
            : 'max-w-6xl md:max-w-full h-[68px] md:h-[80px] px-5 md:px-12 rounded-full md:rounded-none bg-dark/95 backdrop-blur-xl md:bg-dark text-white border border-white/15 md:border-b md:border-x-0 md:border-t-0 shadow-xl'
        }`}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <div className="bg-white rounded-xl px-3 py-1.5 group-hover:scale-105 transition-transform">
            <img src="/logo.svg" alt="Build Your Thoughts" className="h-7 md:h-8 w-auto" />
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 px-4 py-2 rounded-full border border-white/10">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-1.5 text-sm font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-gray-300 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-primary/10 rounded-full border border-primary/30"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/contact">
            <Button variant="lime" size="sm" className="gap-1.5">
              Start Project
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white hover:text-primary transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-4 top-24 z-40 bg-dark border border-white/10 rounded-card p-6 shadow-2xl flex flex-col gap-4 md:hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-lg font-medium px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === link.path ? 'bg-primary/20 text-primary' : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="lime" className="w-full">
                  Start Project
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
