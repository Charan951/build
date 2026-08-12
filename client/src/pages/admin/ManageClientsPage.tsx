import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from '../../components/seo/SEOHead';
import { Button } from '../../components/ui/Button';
import {
  Plus,
  Phone,
  Search,
  Download,
  FolderKanban,
  Loader2,
  Pencil,
  Trash2,
  Save,
  ChevronRight,
} from 'lucide-react';
import { apiFetch } from '../../services/api';

const AVATAR_PALETTE = ['#CDFB47', '#7DD3FC', '#FDBA74', '#C4B5FD', '#6EE7B7', '#F9A8D4'];

const CURRENCY_OPTIONS = [
  { code: 'INR', label: 'INR — Indian Rupee (₹)' },
  { code: 'USD', label: 'USD — US Dollar ($)' },
  { code: 'EUR', label: 'EUR — Euro (€)' },
  { code: 'GBP', label: 'GBP — British Pound (£)' },
  { code: 'AUD', label: 'AUD — Australian Dollar (A$)' },
];

const avatarColorFor = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
};

const projectStage = (status?: string): 'new' | 'ongoing' | 'completed' => {
  if (status === 'planning') return 'new';
  if (status === 'completed') return 'completed';
  return 'ongoing';
};

const timeAgo = (dateStr?: string): string => {
  if (!dateStr) return '';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
};

const EMPTY_FORM = {
  companyName: '',
  billingEmail: '',
  phone: '',
  currency: 'INR',
};

export const ManageClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState(EMPTY_FORM);

  const token = localStorage.getItem('adminToken');

  const fetchClients = () => {
    setLoading(true);
    Promise.all([
      apiFetch('/crm/clients', { token }),
      apiFetch('/crm/projects', { token }),
    ])
      .then(([clientsRes, projectsRes]) => {
        if (clientsRes.success) setClients(clientsRes.data || []);
        if (projectsRes.success) setProjects(projectsRes.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const openCreateModal = () => {
    setEditingClientId(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (client: any) => {
    setEditingClientId(client._id);
    setFormData({
      companyName: client.companyName || '',
      billingEmail: client.billingEmail || '',
      phone: client.phone || '',
      currency: client.currency || 'INR',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    const isEdit = !!editingClientId;
    apiFetch(isEdit ? `/crm/clients/${editingClientId}` : '/crm/clients', {
      method: isEdit ? 'PUT' : 'POST',
      token,
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (res.success) {
          setShowModal(false);
          setFormData(EMPTY_FORM);
          setEditingClientId(null);
          fetchClients();
        } else {
          setFormError(res.error || res.message || 'Failed to save client.');
        }
      })
      .catch((err) => setFormError('Error saving client: ' + err.message))
      .finally(() => setSaving(false));
  };

  const handleDelete = (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation();
    if (!window.confirm('Delete this client? This cannot be undone.')) return;
    apiFetch(`/crm/clients/${clientId}`, { method: 'DELETE', token })
      .then((res) => {
        if (res.success) fetchClients();
      })
      .catch(() => {});
  };

  const clientProjects = (clientId: string) => projects.filter((p) => (p.clientId?._id || p.clientId) === clientId);

  const handleExportCsv = () => {
    if (clients.length === 0) return;
    const rows = clients.map((c) => {
      const cp = clientProjects(c._id);
      return {
        'Client Name': c.companyName || '',
        'Phone': c.phone || '',
        'Email': c.billingEmail || '',
        'Total Projects': cp.length,
        'Ongoing Projects': cp.filter((p) => projectStage(p.status) === 'ongoing').length,
        'Completed Projects': cp.filter((p) => projectStage(p.status) === 'completed').length,
        'Added': c.createdAt ? new Date(c.createdAt).toISOString().slice(0, 10) : '',
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');
    XLSX.writeFile(workbook, `clients-${new Date().toISOString().slice(0, 10)}.csv`, { bookType: 'csv' });
  };

  const handleExportJson = () => {
    if (clients.length === 0) return;
    const rows = clients.map((c) => {
      const cp = clientProjects(c._id);
      return {
        clientName: c.companyName || '',
        phone: c.phone || '',
        email: c.billingEmail || '',
        totalProjects: cp.length,
        ongoingProjects: cp.filter((p) => projectStage(p.status) === 'ongoing').length,
        completedProjects: cp.filter((p) => projectStage(p.status) === 'completed').length,
        addedAt: c.createdAt || '',
      };
    });
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clients-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filtered = clients.filter(
    (c) =>
      c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.billingEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm)
  );

  const totalProjects = projects.length;
  const ongoingProjects = projects.filter((p) => projectStage(p.status) === 'ongoing').length;
  const completedProjects = projects.filter((p) => projectStage(p.status) === 'completed').length;

  return (
    <div className="space-y-6">
      <SEOHead title="Clients & Contacts CRM | Admin Dashboard" />

      {/* Header */}
      <div className="flex items-center justify-end">
        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-dark/10 p-4">
          <p className="text-slateText text-[11px] font-semibold">Total clients</p>
          <p className="font-display font-bold text-2xl text-dark mt-1">{clients.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-dark/10 p-4">
          <p className="text-slateText text-[11px] font-semibold">Total projects</p>
          <p className="font-display font-bold text-2xl text-dark mt-1">{totalProjects}</p>
        </div>
        <div className="bg-white rounded-2xl border border-dark/10 p-4">
          <p className="text-slateText text-[11px] font-semibold">Ongoing</p>
          <p className="font-display font-bold text-2xl text-emerald-600 mt-1">{ongoingProjects}</p>
        </div>
        <div className="bg-white rounded-2xl border border-dark/10 p-4">
          <p className="text-slateText text-[11px] font-semibold">Completed</p>
          <p className="font-display font-bold text-2xl text-blue-600 mt-1">{completedProjects}</p>
        </div>
      </div>

      {/* Search & Export Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slateText" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportCsv}
            disabled={clients.length === 0}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white border border-dark/15 hover:border-dark/30 text-dark font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button
            onClick={handleExportJson}
            disabled={clients.length === 0}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white border border-dark/15 hover:border-dark/30 text-dark font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" /> JSON
          </button>
        </div>
      </div>

      {/* Client Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slateText text-sm font-semibold">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading client accounts...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-card border border-dark/10 p-12 text-center text-slateText text-sm">
          {clients.length === 0 ? 'No client accounts registered yet. Click "Add Client" above.' : 'No clients match your search.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((client) => {
            const initial = (client.companyName || '?').charAt(0).toUpperCase();
            const avatarColor = avatarColorFor(client.companyName || client._id);
            const cp = clientProjects(client._id);
            const latest = cp[0];
            return (
              <div
                key={client._id}
                onClick={() => navigate(`/dashboard/clients/${client._id}`)}
                className="text-left bg-white rounded-2xl border border-dark/10 hover:border-primary hover:shadow-lg transition-all p-5 cursor-pointer group relative"
              >
                {/* CRUD Actions */}
                <div className="absolute top-4 right-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(client);
                    }}
                    className="p-1.5 rounded-lg bg-white text-slateText hover:text-dark hover:bg-dark/5 shadow-sm border border-dark/10"
                    title="Edit Client"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, client._id)}
                    className="p-1.5 rounded-lg bg-white text-slateText hover:text-rose-600 hover:bg-rose-50 shadow-sm border border-dark/10"
                    title="Delete Client"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <ChevronRight className="w-4 h-4 text-slateText/40 absolute top-5 right-5" />

                <div className="flex items-center gap-3 min-w-0 pr-8">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-dark shrink-0"
                    style={{ backgroundColor: avatarColor }}
                  >
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-base font-bold text-dark truncate">{client.companyName}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slateText mt-0.5">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>{client.phone || 'No phone added'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-dark/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-dark font-semibold">
                    <FolderKanban className="w-3.5 h-3.5 text-slateText" />
                    <span>{cp.length} project{cp.length === 1 ? '' : 's'}</span>
                  </div>
                  {latest ? (
                    <div className="flex items-center gap-2">
                      <span className="text-dark font-semibold truncate max-w-[120px]">{latest.projectName}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${
                          projectStage(latest.status) === 'completed'
                            ? 'bg-blue-100 text-blue-700'
                            : projectStage(latest.status) === 'new'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {projectStage(latest.status)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slateText/60">No projects yet</span>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slateText/70">
                  <span>Added {timeAgo(client.createdAt)}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dashboard/client-projects/new?client=${client._id}`);
                    }}
                    className="flex items-center gap-1 text-primary font-bold hover:underline"
                  >
                    <Plus className="w-3 h-3" /> New Project
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal - fields mirror the reference "Add New Client" form */}
      {showModal && (
        <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-card p-8 max-w-lg w-full space-y-6 shadow-2xl">
            <div>
              <h2 className="font-display text-2xl font-bold text-dark">
                {editingClientId ? 'Edit Client' : 'Add New Client'}
              </h2>
              <p className="text-xs text-slateText mt-1">
                {editingClientId ? 'Update this client profile' : 'Create a new client profile'}
              </p>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-dark mb-1">
                  Client Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm focus:outline-none focus:border-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-dark mb-1">
                  Email <span className="font-normal text-slateText">(optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="client@example.com"
                  value={formData.billingEmail}
                  onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
                  className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm focus:outline-none focus:border-dark"
                />
                <p className="text-[10px] text-slateText mt-1 leading-relaxed">
                  Used to send invoices, documents, and the client-portal invite. Leave it blank if you don't have
                  one — you can add it any time.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-dark mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm focus:outline-none focus:border-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-dark mb-1">Invoice Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm focus:outline-none focus:border-dark font-semibold"
                >
                  {CURRENCY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slateText mt-1">
                  Invoices for this client will be shown in {formData.currency}.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark/5">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowModal(false);
                    setFormError('');
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="gap-2">
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Client'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
