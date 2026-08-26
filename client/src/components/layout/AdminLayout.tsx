import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { OperateModeProvider } from '../ui/OperateModeContext';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { useHotkey } from '../../hooks/useHotkey';
import {
  LayoutDashboard,
  FolderGit2,
  Cpu,
  FileText,
  DollarSign,
  Sparkles,
  Inbox,
  Users,
  Receipt,
  Kanban,
  CalendarDays,
  BarChart3,
  FileSignature,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  PanelLeftClose,
  ChevronDown,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Content',
    icon: FileText,
    items: [
      { label: 'Projects', to: '/dashboard/projects', icon: FolderGit2 },
      { label: 'Services', to: '/dashboard/services', icon: Cpu },
      { label: 'Blogs', to: '/dashboard/blogs', icon: FileText },
      { label: 'Startup Plans', to: '/dashboard/plans', icon: DollarSign },
      { label: 'Platform Cards', to: '/dashboard/solutions', icon: Sparkles },
    ],
  },
  {
    label: 'Sales CRM',
    icon: Users,
    items: [
      { label: 'Leads Pipeline', to: '/dashboard/leads', icon: Inbox },
      { label: 'Proposals', to: '/dashboard/proposals', icon: FileSignature },
      { label: 'Clients & CRM', to: '/dashboard/clients', icon: Users },
      { label: 'Client Projects', to: '/dashboard/client-projects', icon: Kanban },
      { label: 'Meetings', to: '/dashboard/meetings', icon: CalendarDays },
      { label: 'Invoices & GST', to: '/dashboard/invoices', icon: Receipt },
      { label: 'Analytics', to: '/dashboard/reports', icon: BarChart3 },
    ],
  },
  {
    label: 'Settings',
    icon: SettingsIcon,
    items: [{ label: 'Contact Info', to: '/dashboard/settings', icon: SettingsIcon }],
  },
];

const easeOut = [0.16, 1, 0.3, 1] as const;

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Sidebar open/closed. Desktop: collapses to an icon rail. Mobile: off-canvas drawer.
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    NAV_GROUPS.forEach((g) => {
      initial[g.label] = g.items.some((item) => location.pathname === item.to);
    });
    return initial;
  });

  // Keep the group containing the active route expanded when navigating.
  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      NAV_GROUPS.forEach((g) => {
        if (g.items.some((item) => location.pathname === item.to)) {
          next[g.label] = true;
        }
      });
      return next;
    });
  }, [location.pathname]);

  // Auto-close the mobile drawer whenever the route changes.
  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, [location.pathname]);

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  // Only collapse the mobile off-canvas drawer on navigation; on desktop the
  // sidebar should stay expanded when a nav item is clicked.
  const closeOnMobile = () => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const activeLabel = useMemo(() => {
    if (location.pathname === '/dashboard') return 'Dashboard';
    for (const g of NAV_GROUPS) {
      const found = g.items.find((item) => item.to === location.pathname);
      if (found) return found.label;
    }
    return 'Dashboard';
  }, [location.pathname]);

  // The Leads Pipeline is a fixed-height kanban board: it manages its own
  // horizontal scroll internally, so the outer page shell must not add a
  // second (vertical) scroll container on top of it.
  const isFixedHeightPage =
    location.pathname === '/dashboard/leads' ||
    location.pathname === '/dashboard/proposals' ||
    location.pathname === '/dashboard/client-projects';

  // The quotation editor is a full-bleed canvas app (its own toolbar, side
  // panels, zoomable page canvas) - it must not inherit the shell's padding
  // or max-width constraint the way a normal content page does.
  const isFullBleedPage = /^\/dashboard\/client-projects\/[^/]+\/quotations\/[^/]+$/.test(location.pathname);

  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  useHotkey('?', () => setShortcutsOpen(true));

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
      isActive ? 'bg-primary text-dark shadow-sm' : 'text-dark/70 hover:bg-black/5 hover:text-dark'
    }`;

  return (
    <OperateModeProvider>
    <div data-operate-mode="true" className="h-[100dvh] w-full bg-[#F5F6F4] flex overflow-hidden">
      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar: fixed-height app-shell column, never scrolls with the page */}
      <motion.aside
        className={`fixed inset-y-0 left-0 z-40 h-full bg-white text-dark flex flex-col lg:relative transition-transform duration-300 border-r border-black/10 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        animate={{ width: sidebarOpen ? 264 : 76 }}
        initial={false}
        transition={{ duration: 0.28, ease: easeOut }}
      >
        <div className="flex items-center h-16 px-4 border-b border-black/10 shrink-0">
          {sidebarOpen ? (
            <Link to="/dashboard" className="flex items-center">
              <img src="/logo.svg" alt="Build Your Thoughts" className="h-6 w-auto" />
            </Link>
          ) : (
            <Link to="/dashboard" className="font-display text-lg font-bold text-primary w-full text-center">
              B.
            </Link>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto no-scrollbar py-4 px-3 space-y-1">
          <NavLink to="/dashboard" end className={navLinkClass} onClick={closeOnMobile} title={sidebarOpen ? undefined : 'Dashboard'}>
            <LayoutDashboard className="w-4.5 h-4.5 shrink-0" />
            <span
              className={`overflow-hidden whitespace-nowrap transition-opacity duration-150 ${
                sidebarOpen ? 'opacity-100' : 'opacity-0 w-0'
              }`}
            >
              Dashboard
            </span>
          </NavLink>

          {NAV_GROUPS.map((group) => {
            const isOpen = openGroups[group.label];
            const GroupIcon = group.icon;
            return (
              <div key={group.label} className="pt-1">
                <button
                  onClick={() => (sidebarOpen ? toggleGroup(group.label) : setSidebarOpen(true))}
                  title={sidebarOpen ? undefined : group.label}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide text-gray-500 hover:text-dark hover:bg-black/5 transition-colors"
                >
                  <GroupIcon className="w-4.5 h-4.5 shrink-0" />
                  <span
                    className={`flex-1 text-left overflow-hidden whitespace-nowrap transition-opacity duration-150 ${
                      sidebarOpen ? 'opacity-100' : 'opacity-0 w-0'
                    }`}
                  >
                    {group.label}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 shrink-0 transition-all duration-150 ${
                      isOpen ? 'rotate-180' : ''
                    } ${sidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {sidebarOpen && isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: easeOut }}
                      className="overflow-hidden"
                    >
                      <div className="ml-4 pl-3 border-l border-black/10 mt-1 space-y-0.5 pb-1">
                        {group.items.map((item) => (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            className={navLinkClass}
                            onClick={closeOnMobile}
                          >
                            <item.icon className="w-4 h-4 shrink-0" />
                            <span>{item.label}</span>
                          </NavLink>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          <a
            href="/portal"
            target="_blank"
            rel="noreferrer"
            title={sidebarOpen ? undefined : 'Client Portal'}
            className="flex items-center gap-3 px-3 py-2.5 mt-2 rounded-xl text-sm font-medium text-lime-600 hover:bg-black/5 transition-colors"
          >
            <ExternalLink className="w-4.5 h-4.5 shrink-0" />
            {sidebarOpen && <span>Client Portal</span>}
          </a>
        </nav>

        <div className="border-t border-black/10 p-3 shrink-0">
          <button
            onClick={handleLogout}
            title={sidebarOpen ? undefined : 'Logout'}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-rose-500/10 hover:text-rose-600 transition-colors"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main content column: header stays put, only this column scrolls */}
      <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden">
        <header className="h-16 shrink-0 bg-white border-b border-dark/10 flex items-center gap-3 px-4 sm:px-6 z-20">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle sidebar"
            className="p-2 rounded-lg hover:bg-dark/5 transition-colors text-dark"
          >
            {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-display text-base font-bold text-dark">{activeLabel}</span>
          {/* Labeled, bordered - not icon-only - so this is actually discoverable
              on a first visit rather than something you have to already know
              to look for (the prior icon-only version was flagged as too easy
              to miss for anyone who wants documentation before acting). */}
          <button
            onClick={() => setShortcutsOpen(true)}
            aria-label="Keyboard shortcuts and help"
            title="Keyboard shortcuts (?)"
            className="focus-ring ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-operateMd border border-dark/10 text-slateText hover:text-dark hover:border-dark/20 hover:bg-dark/[0.02] transition-colors text-xs font-semibold"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Help</span>
          </button>
        </header>

        <main
          className={`flex-1 no-scrollbar ${isFullBleedPage ? '' : 'px-4 sm:px-6 py-3 sm:py-4'} ${
            isFixedHeightPage || isFullBleedPage ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'
          }`}
        >
          <div
            className={
              isFullBleedPage
                ? 'flex-1 min-h-0 flex flex-col'
                : `max-w-[1400px] w-full mx-auto ${isFixedHeightPage ? 'flex-1 min-h-0 flex flex-col' : ''}`
            }
          >
            <Outlet />
          </div>
        </main>
      </div>

      <KeyboardShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
    </OperateModeProvider>
  );
};
