import React, { useEffect, useState } from 'react';
import { SEOHead } from '../../components/seo/SEOHead';
import { Card } from '../../components/ui/Card';
import { IndianRupee, AlertTriangle, Users, FolderGit2, FileSignature, Receipt } from 'lucide-react';
import { apiFetch } from '../../services/api';

export const ReportsAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    apiFetch('/crm/analytics', { token })
      .then((res) => {
        if (res.success) setAnalytics(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statTiles = analytics
    ? [
        {
          label: 'Total Gross Revenue',
          value: `₹${(analytics.totalRevenue || 0).toLocaleString('en-IN')}`,
          icon: IndianRupee,
          accent: 'text-emerald-600',
          iconBg: 'bg-emerald-50',
        },
        {
          label: 'Outstanding Balance',
          value: `₹${(analytics.outstandingBalance || 0).toLocaleString('en-IN')}`,
          icon: AlertTriangle,
          accent: 'text-amber-600',
          iconBg: 'bg-amber-50',
        },
        {
          label: 'Active Clients',
          value: analytics.totalClients || 0,
          icon: Users,
          accent: 'text-dark',
          iconBg: 'bg-background',
        },
        {
          label: 'Active Workspaces',
          value: analytics.activeProjects || 0,
          icon: FolderGit2,
          accent: 'text-dark',
          iconBg: 'bg-background',
        },
      ]
    : [];

  const summaryRows = analytics
    ? [
        { label: 'Total Proposals Created', value: analytics.totalQuotations || 0, icon: FileSignature },
        { label: 'Total Invoices Issued', value: analytics.totalInvoices || 0, icon: Receipt },
      ]
    : [];

  return (
    <div className="pb-4 space-y-6">
      <SEOHead title="Financial Reports & Analytics | Admin Dashboard" />

      {loading ? (
        <div className="text-center py-12 text-slateText text-sm">Calculating executive analytics...</div>
      ) : !analytics ? (
        <Card className="p-12 text-center text-slateText text-sm">Failed to load financial analytics.</Card>
      ) : (
        <>
          {/* Executive Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statTiles.map((tile) => (
              <Card key={tile.label} className="h-full min-h-[128px] p-5 flex flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[11px] font-bold text-slateText uppercase tracking-wide leading-tight">{tile.label}</p>
                  <div className={`w-9 h-9 rounded-xl ${tile.iconBg} flex items-center justify-center ${tile.accent} shrink-0`}>
                    <tile.icon className="w-4.5 h-4.5" />
                  </div>
                </div>
                <p className={`font-display text-2xl font-bold ${tile.accent}`}>{tile.value}</p>
              </Card>
            ))}
          </div>

          {/* Business Summary */}
          <Card className="p-6 space-y-1">
            <h3 className="font-display text-base font-bold text-dark mb-3">Business Summary</h3>
            <div className="divide-y divide-dark/5">
              {summaryRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-background flex items-center justify-center text-dark shrink-0">
                      <row.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slateText">{row.label}</span>
                  </div>
                  <span className="font-display font-bold text-dark text-lg">{row.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
