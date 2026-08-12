import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SEOHead } from '../../components/seo/SEOHead';
import { Card } from '../../components/ui/Card';
import {
  FolderGit2,
  Inbox,
  Users,
  IndianRupee,
  Plus,
  Bell,
} from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
import { apiFetch } from '../../services/api';

const GREETINGS = ['Good morning', 'Good afternoon', 'Good evening'];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return GREETINGS[0];
  if (hour < 18) return GREETINGS[1];
  return GREETINGS[2];
};

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState({ projects: 0, leads: 0, clients: 0, revenue: 0 });
  const [liveNotification, setLiveNotification] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('adminToken');
  const { subscribe, isConnected } = useSocket({ token });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    Promise.all([
      apiFetch('/projects'),
      apiFetch('/leads', { token }),
      apiFetch('/crm/analytics', { token }).catch(() => ({ success: false })),
    ])
      .then(([proj, ld, analytics]) => {
        setStats({
          projects: proj.count || 0,
          leads: ld.count || 0,
          clients: analytics.success ? analytics.data.totalClients || 0 : 0,
          revenue: analytics.success ? analytics.data.totalRevenue || 0 : 0,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, navigate]);

  useEffect(() => {
    const unsubscribe = subscribe('new_lead_received', (newLead: any) => {
      setLiveNotification(`New lead received: ${newLead.name} (${newLead.projectType})`);
      setStats((prev) => ({ ...prev, leads: prev.leads + 1 }));
      setTimeout(() => setLiveNotification(null), 6000);
    });
    return () => unsubscribe();
  }, [subscribe]);

  const statTiles = [
    { label: 'New Leads', value: stats.leads, icon: Inbox, to: '/dashboard/leads', accent: 'text-[#F97316]' },
    { label: 'Clients', value: stats.clients, icon: Users, to: '/dashboard/clients', accent: 'text-dark' },
    {
      label: 'Revenue Collected',
      value: `₹${stats.revenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      to: '/dashboard/invoices',
      accent: 'text-emerald-600',
    },
    { label: 'Case Studies', value: stats.projects, icon: FolderGit2, to: '/dashboard/projects', accent: 'text-dark' },
  ];

  return (
    <div className="pb-4 space-y-8">
      <SEOHead title="Admin Dashboard | Build Your Thoughts" />

      {/* Live Socket Toast */}
      {liveNotification && (
        <div className="fixed top-20 right-6 z-50 max-w-sm p-4 rounded-2xl bg-dark text-white flex items-start gap-3 shadow-2xl animate-in fade-in slide-in-from-top-2">
          <Bell className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
          <p className="text-xs font-semibold leading-relaxed">{liveNotification}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-dark">{getGreeting()}</h1>
            <span
              className="flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full bg-dark/5 text-slateText"
              title={isConnected ? 'Live updates connected' : 'Connecting to live updates...'}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              {isConnected ? 'Live' : 'Connecting'}
            </span>
          </div>
          <p className="text-slateText text-sm mt-1">Here's what's happening across your business today.</p>
        </div>
        <Link
          to="/dashboard/leads"
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-[#bce63b] text-dark text-xs font-bold shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" /> Add Lead
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statTiles.map((tile) => (
          <Link key={tile.label} to={tile.to} className="block h-full">
            <Card className="h-full min-h-[128px] p-5 flex flex-col justify-between hover:border-primary/50 transition-colors group">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-bold text-slateText uppercase tracking-wide leading-tight">{tile.label}</p>
                <div className="w-9 h-9 rounded-xl bg-background flex items-center justify-center text-dark/40 group-hover:text-dark transition-colors shrink-0">
                  <tile.icon className="w-4.5 h-4.5" />
                </div>
              </div>
              <p className={`font-display text-2xl font-bold ${tile.accent}`}>
                {loading ? '—' : tile.value}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
