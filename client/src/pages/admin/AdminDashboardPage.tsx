import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SEOHead } from '../../components/seo/SEOHead';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FolderGit2, Cpu, FileText, Inbox, LogOut, Plus, RefreshCw, Sparkles, DollarSign, Settings as SettingsIcon } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState({ projects: 0, services: 0, blogs: 0, leads: 0 });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const navigate = useNavigate();

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch dashboard stats
    Promise.all([
      fetch('/api/v1/projects').then((r) => r.json()),
      fetch('/api/v1/services').then((r) => r.json()),
      fetch('/api/v1/blogs').then((r) => r.json()),
      fetch('/api/v1/leads', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([proj, srv, blg, ld]) => {
        setStats({
          projects: proj.count || 0,
          services: srv.count || 0,
          blogs: blg.count || 0,
          leads: ld.count || 0,
        });
        if (ld.success) setRecentLeads(ld.data.slice(0, 5));
      })
      .catch(() => {});
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  return (
    <div className="pt-28 pb-16 max-w-7xl mx-auto px-6 space-y-12">
      <SEOHead title="Admin Dashboard | Build Your Thoughts Headless CMS" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark text-white p-8 rounded-card border border-white/10">
        <div>
          <Badge variant="lime" className="mb-2">Headless CMS Engine</Badge>
          <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-400 text-xs mt-1">Manage website content, case studies, blogs, and contact inquiries.</p>
        </div>
        <Button variant="ghost" onClick={handleLogout} className="text-white hover:text-rose-400 gap-2">
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex items-center gap-5 p-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 text-dark flex items-center justify-center font-bold">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slateText uppercase font-bold block">Case Studies</span>
            <span className="font-display text-3xl font-bold text-dark">{stats.projects}</span>
          </div>
        </Card>

        <Card className="flex items-center gap-5 p-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 text-dark flex items-center justify-center font-bold">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slateText uppercase font-bold block">Active Services</span>
            <span className="font-display text-3xl font-bold text-dark">{stats.services}</span>
          </div>
        </Card>

        <Card className="flex items-center gap-5 p-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 text-dark flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slateText uppercase font-bold block">Published Blogs</span>
            <span className="font-display text-3xl font-bold text-dark">{stats.blogs}</span>
          </div>
        </Card>

        <Card className="flex items-center gap-5 p-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 text-dark flex items-center justify-center font-bold">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slateText uppercase font-bold block">Total Leads</span>
            <span className="font-display text-3xl font-bold text-dark">{stats.leads}</span>
          </div>
        </Card>
      </div>

      {/* CMS Module Quick Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        <Link to="/dashboard/plans">
          <Card className="p-4 text-center hover:border-primary">
            <DollarSign className="w-6 h-6 text-dark mx-auto mb-2" />
            <h3 className="font-bold text-sm text-dark">Startup Plans</h3>
            <p className="text-[11px] text-slateText mt-0.5">Pricing tiers</p>
          </Card>
        </Link>

        <Link to="/dashboard/solutions">
          <Card className="p-4 text-center hover:border-primary">
            <Sparkles className="w-6 h-6 text-dark mx-auto mb-2" />
            <h3 className="font-bold text-sm text-dark">Platform Cards</h3>
            <p className="text-[11px] text-slateText mt-0.5">Solutions carousel</p>
          </Card>
        </Link>

        <Link to="/dashboard/projects">
          <Card className="p-4 text-center hover:border-primary">
            <FolderGit2 className="w-6 h-6 text-dark mx-auto mb-2" />
            <h3 className="font-bold text-sm text-dark">Projects</h3>
            <p className="text-[11px] text-slateText mt-0.5">Case studies</p>
          </Card>
        </Link>

        <Link to="/dashboard/services">
          <Card className="p-4 text-center hover:border-primary">
            <Cpu className="w-6 h-6 text-dark mx-auto mb-2" />
            <h3 className="font-bold text-sm text-dark">Services</h3>
            <p className="text-[11px] text-slateText mt-0.5">Capabilities</p>
          </Card>
        </Link>

        <Link to="/dashboard/blogs">
          <Card className="p-4 text-center hover:border-primary">
            <FileText className="w-6 h-6 text-dark mx-auto mb-2" />
            <h3 className="font-bold text-sm text-dark">Blogs</h3>
            <p className="text-[11px] text-slateText mt-0.5">Articles</p>
          </Card>
        </Link>

        <Link to="/dashboard/leads">
          <Card className="p-4 text-center hover:border-primary">
            <Inbox className="w-6 h-6 text-dark mx-auto mb-2" />
            <h3 className="font-bold text-sm text-dark">Lead Inbox</h3>
            <p className="text-[11px] text-slateText mt-0.5">Inquiries</p>
          </Card>
        </Link>

        <Link to="/dashboard/settings">
          <Card className="p-4 text-center hover:border-primary border-primary/40 bg-lime-50/20">
            <SettingsIcon className="w-6 h-6 text-dark mx-auto mb-2" />
            <h3 className="font-bold text-sm text-dark">Contact Info</h3>
            <p className="text-[11px] text-slateText mt-0.5">Address & Phone</p>
          </Card>
        </Link>
      </div>

      {/* Recent Leads Feed */}
      <Card className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-dark">Recent Contact Inquiries</h2>
          <Link to="/dashboard/leads" className="text-xs font-bold text-dark hover:text-primary">
            View All Leads →
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <p className="text-sm text-slateText py-4">No contact inquiries submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {recentLeads.map((lead, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-background border border-dark/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-dark text-base">{lead.name}</span>
                    <Badge variant="lime">{lead.projectType}</Badge>
                  </div>
                  <p className="text-xs text-slateText mt-1">{lead.email} • {lead.company || 'Private Inquiry'} • Budget: {lead.budgetRange}</p>
                </div>
                <Badge variant={lead.status === 'new' ? 'lime' : 'dark'}>{lead.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
