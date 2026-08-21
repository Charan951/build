import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AdminLayout } from './components/layout/AdminLayout';
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
const ManageProposalsPage = lazy(() => import('./pages/admin/ManageProposalsPage').then(m => ({ default: m.ManageProposalsPage })));
const ProposalProjectDetailPage = lazy(() => import('./pages/admin/ProposalProjectDetailPage').then(m => ({ default: m.ProposalProjectDetailPage })));
const ManagePlatformSolutionsPage = lazy(() => import('./pages/admin/ManagePlatformSolutionsPage').then(m => ({ default: m.ManagePlatformSolutionsPage })));
const ManagePricingPlansPage = lazy(() => import('./pages/admin/ManagePricingPlansPage').then(m => ({ default: m.ManagePricingPlansPage })));
const ManageSettingsPage = lazy(() => import('./pages/admin/ManageSettingsPage').then(m => ({ default: m.ManageSettingsPage })));

// 26 Sales CRM Module Lazy Loaded Components
const ManageClientsPage = lazy(() => import('./pages/admin/ManageClientsPage').then(m => ({ default: m.ManageClientsPage })));
const ClientDetailPage = lazy(() => import('./pages/admin/ClientDetailPage').then(m => ({ default: m.ClientDetailPage })));
const ClientProjectsPage = lazy(() => import('./pages/admin/ClientProjectsPage').then(m => ({ default: m.ClientProjectsPage })));
const ProjectFormPage = lazy(() => import('./pages/admin/ProjectFormPage').then(m => ({ default: m.ProjectFormPage })));
const ClientProjectDetailPage = lazy(() => import('./pages/admin/ProjectDetailPage').then(m => ({ default: m.ProjectDetailPage })));
const QuotationEditorPage = lazy(() => import('./pages/admin/QuotationEditorPage').then(m => ({ default: m.QuotationEditorPage })));
const ManageMeetingsPage = lazy(() => import('./pages/admin/ManageMeetingsPage').then(m => ({ default: m.ManageMeetingsPage })));
const InvoiceManagerPage = lazy(() => import('./pages/admin/InvoiceManagerPage').then(m => ({ default: m.InvoiceManagerPage })));
const ReportsAnalyticsPage = lazy(() => import('./pages/admin/ReportsAnalyticsPage').then(m => ({ default: m.ReportsAnalyticsPage })));
const ClientPortalDashboardPage = lazy(() => import('./pages/client/ClientPortalDashboardPage').then(m => ({ default: m.ClientPortalDashboardPage })));
const PortalProjectDetailPage = lazy(() => import('./pages/client/ClientProjectDetailPage').then(m => ({ default: m.ClientProjectDetailPage })));

gsap.registerPlugin(ScrollTrigger);

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-dark/10 border-t-primary rounded-full animate-spin" />
  </div>
);

export const App: React.FC = () => {
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/dashboard') || location.pathname === '/login' || location.pathname.startsWith('/portal');

  useEffect(() => {
    // Lenis smooth scroll is a marketing-site affordance only. It hijacks the native
    // scroll container and breaks position:sticky/fixed panels, which the admin/CRM
    // dashboard relies on for its sidebar and toolbar, so skip it on those routes.
    if (isAdminRoute) {
      window.scrollTo(0, 0);
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // Keep ScrollTrigger's positions in sync with Lenis's virtual scroll so any
    // scroll-triggered animation stays aligned with what's on screen.
    lenis.on('scroll', ScrollTrigger.update);

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Scroll to top on route change
    window.scrollTo(0, 0);

    // Recalculate trigger positions once the new page's layout (and images/fonts) settle.
    const refreshId = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(refreshId);
      lenis.destroy();
    };
  }, [location.pathname, isAdminRoute]);

  return (
    <div className="min-h-screen flex flex-col justify-between relative selection:bg-primary selection:text-dark bg-[#FFFFFF]">
      {/* Top 3px Lime Scroll Progress Bar per UI_UX_4_Guidelines.md */}
      <ProgressBar />

      {/* Desktop Custom Magnetic Cursor per UI_UX_4_Guidelines.md (marketing site only) */}
      {!isAdminRoute && <CustomCursor />}

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

            {/* Admin Headless CMS & CRM Routes */}
            <Route path="/login" element={<AdminLoginPage />} />
            <Route path="/dashboard" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="projects" element={<ManageProjectsPage />} />
              <Route path="services" element={<ManageServicesPage />} />
              <Route path="blogs" element={<ManageBlogsPage />} />
              <Route path="leads" element={<ManageLeadsPage />} />
              <Route path="proposals" element={<ManageProposalsPage />} />
              <Route path="proposals/:id" element={<ProposalProjectDetailPage />} />
              <Route path="solutions" element={<ManagePlatformSolutionsPage />} />
              <Route path="plans" element={<ManagePricingPlansPage />} />
              <Route path="settings" element={<ManageSettingsPage />} />

              {/* 26 Sales CRM Module Routes */}
              <Route path="clients" element={<ManageClientsPage />} />
              <Route path="clients/:id" element={<ClientDetailPage />} />
              <Route path="client-projects" element={<ClientProjectsPage />} />
              <Route path="client-projects/new" element={<ProjectFormPage />} />
              <Route path="client-projects/:id/edit" element={<ProjectFormPage />} />
              <Route path="client-projects/:id" element={<ClientProjectDetailPage />} />
              <Route path="client-projects/:id/quotations/:quotationId" element={<QuotationEditorPage />} />
              <Route path="meetings" element={<ManageMeetingsPage />} />
              <Route path="invoices" element={<InvoiceManagerPage />} />
              <Route path="reports" element={<ReportsAnalyticsPage />} />
            </Route>
            <Route path="/portal/login" element={<Navigate to="/login" replace />} />
            <Route path="/portal" element={<ClientPortalDashboardPage />} />
            <Route path="/portal/projects/:id" element={<PortalProjectDetailPage />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
};
