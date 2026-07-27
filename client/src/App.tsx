import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Lenis from '@studio-freight/lenis';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { ProgressBar } from './components/ui/ProgressBar';
import { CustomCursor } from './components/ui/CustomCursor';

// Lazy-loaded routes for code splitting per Performance_Optimization.md
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ServicesPage = lazy(() => import('./pages/ServicesPage').then(m => ({ default: m.ServicesPage })));
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage').then(m => ({ default: m.ServiceDetailPage })));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage').then(m => ({ default: m.ProjectsPage })));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage').then(m => ({ default: m.ProjectDetailPage })));
const BlogListPage = lazy(() => import('./pages/BlogListPage').then(m => ({ default: m.BlogListPage })));
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage').then(m => ({ default: m.BlogDetailPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));

const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const ManageProjectsPage = lazy(() => import('./pages/admin/ManageProjectsPage').then(m => ({ default: m.ManageProjectsPage })));
const ManageServicesPage = lazy(() => import('./pages/admin/ManageServicesPage').then(m => ({ default: m.ManageServicesPage })));
const ManageBlogsPage = lazy(() => import('./pages/admin/ManageBlogsPage').then(m => ({ default: m.ManageBlogsPage })));
const ManageLeadsPage = lazy(() => import('./pages/admin/ManageLeadsPage').then(m => ({ default: m.ManageLeadsPage })));
const ManagePlatformSolutionsPage = lazy(() => import('./pages/admin/ManagePlatformSolutionsPage').then(m => ({ default: m.ManagePlatformSolutionsPage })));
const ManagePricingPlansPage = lazy(() => import('./pages/admin/ManagePricingPlansPage').then(m => ({ default: m.ManagePricingPlansPage })));
const ManageSettingsPage = lazy(() => import('./pages/admin/ManageSettingsPage').then(m => ({ default: m.ManageSettingsPage })));

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-dark/10 border-t-primary rounded-full animate-spin" />
  </div>
);

export const App: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Initialize Lenis smooth scroll per UI_UX_4_Guidelines.md & Performance_Optimization.md
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Scroll to top on route change
    window.scrollTo(0, 0);

    return () => {
      lenis.destroy();
    };
  }, [location.pathname]);

  const isAdminRoute = location.pathname.startsWith('/dashboard') || location.pathname === '/login';

  return (
    <div className="min-h-screen flex flex-col justify-between relative selection:bg-primary selection:text-dark bg-[#FFFFFF]">
      {/* Top 3px Lime Scroll Progress Bar per UI_UX_4_Guidelines.md */}
      <ProgressBar />

      {/* Desktop Custom Magnetic Cursor per UI_UX_4_Guidelines.md */}
      <CustomCursor />

      {!isAdminRoute && <Navbar />}
      <main className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:slug" element={<ServiceDetailPage />} />
            <Route path="/services/:categorySlug/:slug" element={<ServiceDetailPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:slug" element={<ProjectDetailPage />} />
            <Route path="/blogs" element={<BlogListPage />} />
            <Route path="/blogs/:slug" element={<BlogDetailPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Admin Headless CMS Routes */}
            <Route path="/login" element={<AdminLoginPage />} />
            <Route path="/dashboard" element={<AdminDashboardPage />} />
            <Route path="/dashboard/projects" element={<ManageProjectsPage />} />
            <Route path="/dashboard/services" element={<ManageServicesPage />} />
            <Route path="/dashboard/blogs" element={<ManageBlogsPage />} />
            <Route path="/dashboard/leads" element={<ManageLeadsPage />} />
            <Route path="/dashboard/solutions" element={<ManagePlatformSolutionsPage />} />
            <Route path="/dashboard/plans" element={<ManagePricingPlansPage />} />
            <Route path="/dashboard/settings" element={<ManageSettingsPage />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
};
