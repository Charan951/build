import React, { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SEOHead } from '../../components/seo/SEOHead';
import { useHotkey } from '../../hooks/useHotkey';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/FormField';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusPill } from '../../components/ui/StatusPill';
import { Spinner } from '../../components/ui/Spinner';
import {
  Plus,
  Phone,
  Search,
  Download,
  FolderKanban,
  Pencil,
  Trash2,
  Save,
  ChevronRight,
  Users,
  CheckSquare,
  Check,
} from 'lucide-react';
import { apiFetch } from '../../services/api';
import { CURRENCY_OPTIONS, timeAgo } from '../../utils/format';

const AVATAR_PALETTE = ['#CDFB47', '#7DD3FC', '#FDBA74', '#C4B5FD', '#6EE7B7', '#F9A8D4'];

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


const EMPTY_FORM = {
  companyName: '',
  billingEmail: '',
  phone: '',
  currency: 'INR',
};

export const ManageClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('q') || '');

  const [showModal, setShowModal] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const token = localStorage.getItem('adminToken');

  const fetchClients = () => {
    setLoading(true);
    setLoadError(false);
    Promise.all([
      apiFetch('/crm/clients', { token }),
      apiFetch('/crm/projects', { token }),
    ])
      .then(([clientsRes, projectsRes]) => {
        if (!clientsRes.success || !projectsRes.success) {
          setLoadError(true);
          return;
        }
        setClients(clientsRes.data || []);
        setProjects(projectsRes.data || []);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSelectMode) {
        setIsSelectMode(false);
        setSelectedClientIds([]);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isSelectMode]);

  useHotkey('/', () => searchInputRef.current?.focus());

  const openCreateModal = () => {
    setEditingClientId(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  };

  useHotkey('n', () => openCreateModal());

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

  const [deleteError, setDeleteError] = useState('');

  const requestDelete = (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation();
    setDeleteError('');
    setDeleteTarget(clientId);
  };

  const handleDelete = (clientId: string) => {
    setDeleteError('');
    apiFetch(`/crm/clients/${clientId}`, { method: 'DELETE', token })
      .then((res) => {
        if (res.success) {
          setDeleteTarget(null);
          fetchClients();
        } else {
          setDeleteError(res.error || res.message || 'Failed to delete client. Please try again.');
        }
      })
      .catch(() => setDeleteError('Failed to delete client. Please try again.'));
  };

  const toggleSelectMode = () => {
    setIsSelectMode((v) => !v);
    setSelectedClientIds([]);
  };

  const handleSelectToggle = (clientId: string) => {
    setSelectedClientIds((prev) =>
      prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]
    );
  };

  const requestBulkDelete = () => {
    if (selectedClientIds.length === 0) return;
    setDeleteError('');
    setBulkDeleteConfirmOpen(true);
  };

  const handleBulkDelete = () => {
    setBulkDeleting(true);
    Promise.allSettled(
      selectedClientIds.map((id) => apiFetch(`/crm/clients/${id}`, { method: 'DELETE', token }))
    )
      .then((results) => {
        const failedCount = results.filter(
          (r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)
        ).length;
        const succeededIds = selectedClientIds.filter((_, i) => {
          const r = results[i];
          return r.status === 'fulfilled' && r.value.success;
        });

        if (failedCount === 0) {
          setSelectedClientIds([]);
          setIsSelectMode(false);
          setBulkDeleteConfirmOpen(false);
        } else {
          setSelectedClientIds(selectedClientIds.filter((id) => !succeededIds.includes(id)));
          setDeleteError(
            `${succeededIds.length} of ${selectedClientIds.length} deleted — ${failedCount} failed. Try again for the rest.`
          );
        }
        fetchClients();
      })
      .finally(() => setBulkDeleting(false));
  };

  const clientProjects = (clientId: string) =>
    projects
      .filter((p) => (p.clientId?._id || p.clientId) === clientId)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const handleExportCsv = () => {
    if (filtered.length === 0) return;
    const rows = filtered.map((c) => {
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
    if (filtered.length === 0) return;
    const rows = filtered.map((c) => {
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

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filtered = clients.filter(
    (c) =>
      c.companyName?.toLowerCase().includes(normalizedSearch) ||
      c.billingEmail?.toLowerCase().includes(normalizedSearch) ||
      c.phone?.includes(normalizedSearch)
  );

  const isFiltering = normalizedSearch.length > 0;
  const filteredClientIds = new Set(filtered.map((c) => c._id));
  const scopedProjects = isFiltering ? projects.filter((p) => filteredClientIds.has(p.clientId?._id || p.clientId)) : projects;
  const totalProjects = scopedProjects.length;
  const ongoingProjects = scopedProjects.filter((p) => projectStage(p.status) === 'ongoing').length;
  const completedProjects = scopedProjects.filter((p) => projectStage(p.status) === 'completed').length;

  return (
    <div className="space-y-6">
      <SEOHead title="Clients & Contacts CRM | Admin Dashboard" />

      {/* Header */}
      <div className="flex items-center justify-end">
        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-operateMd bg-primary hover:bg-[#bce63b] text-dark font-bold text-xs shadow-md transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      {/* Stats Row — reflects the active search filter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-operateLg border border-dark/10 p-4">
          <p className="text-slateText text-[11px] font-semibold">{isFiltering ? 'Matching clients' : 'Total clients'}</p>
          <p className="font-display font-bold text-2xl text-dark mt-1">{filtered.length}</p>
        </div>
        <div className="bg-white rounded-operateLg border border-dark/10 p-4">
          <p className="text-slateText text-[11px] font-semibold">{isFiltering ? 'Their projects' : 'Total projects'}</p>
          <p className="font-display font-bold text-2xl text-dark mt-1">{totalProjects}</p>
        </div>
        <div className="bg-white rounded-operateLg border border-dark/10 p-4">
          <p className="text-slateText text-[11px] font-semibold">Ongoing</p>
          <p className="font-display font-bold text-2xl text-emerald-600 mt-1">{ongoingProjects}</p>
        </div>
        <div className="bg-white rounded-operateLg border border-dark/10 p-4">
          <p className="text-slateText text-[11px] font-semibold">Completed</p>
          <p className="font-display font-bold text-2xl text-blue-600 mt-1">{completedProjects}</p>
        </div>
      </div>

      {/* Search & Export Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slateText" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search by name or phone... (press / to focus)"
            aria-label="Search clients"
            value={searchTerm}
            onChange={(e) => {
              const value = e.target.value;
              setSearchTerm(value);
              setSearchParams(
                (prev) => {
                  const next = new URLSearchParams(prev);
                  if (value) next.set('q', value);
                  else next.delete('q');
                  return next;
                },
                { replace: true }
              );
            }}
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-dark/10 rounded-operateMd text-xs text-dark focus:outline-none focus:border-dark shadow-sm"
          />
          {!searchTerm && (
            <kbd className="hidden sm:flex absolute right-3.5 top-1/2 -translate-y-1/2 items-center justify-center w-4 h-4 rounded border border-dark/15 text-[9px] font-bold text-slateText/70 pointer-events-none">
              /
            </kbd>
          )}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportCsv}
            disabled={filtered.length === 0}
            title={isFiltering ? `Export the ${filtered.length} matching client(s)` : 'Export all clients'}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-operateMd bg-white border border-dark/15 hover:border-dark/30 text-dark font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" /> CSV{isFiltering ? ` (${filtered.length})` : ''}
          </button>
          <button
            onClick={handleExportJson}
            disabled={filtered.length === 0}
            title={isFiltering ? `Export the ${filtered.length} matching client(s)` : 'Export all clients'}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-operateMd bg-white border border-dark/15 hover:border-dark/30 text-dark font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" /> JSON{isFiltering ? ` (${filtered.length})` : ''}
          </button>
          <button
            onClick={toggleSelectMode}
            disabled={clients.length === 0}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-operateMd font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all ${
              isSelectMode ? 'bg-primary text-dark' : 'bg-white border border-dark/15 hover:border-dark/30 text-dark'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" /> {isSelectMode ? 'Exit' : 'Select'}
          </button>
        </div>
      </div>

      {isSelectMode && selectedClientIds.length > 0 && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center justify-between px-4 py-2.5 rounded-operateMd bg-dark text-white text-xs font-semibold"
        >
          <span>{selectedClientIds.length} client{selectedClientIds.length === 1 ? '' : 's'} selected</span>
          <button
            onClick={requestBulkDelete}
            className="focus-ring-inverse flex items-center gap-1.5 text-rose-300 hover:text-rose-200 font-bold rounded"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete selected
          </button>
        </div>
      )}

      {/* Client Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Spinner.CardSkeleton key={i} />
          ))}
        </div>
      ) : loadError ? (
        <EmptyState
          icon={Users}
          title="Couldn't load client accounts"
          description="Check your connection and try again."
          action={
            <button
              onClick={fetchClients}
              className="focus-ring px-4 py-2 rounded-operateMd bg-dark text-white text-xs font-bold hover:bg-dark/90"
            >
              Retry
            </button>
          }
          className="border-rose-200 bg-rose-50/40"
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={clients.length === 0 ? 'No client accounts yet' : 'No clients match your search'}
          description={
            clients.length === 0
              ? 'Click "Add Client" above to create the first one.'
              : 'Try a different name, email, or phone number.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((client) => {
            const initial = (client.companyName || '?').charAt(0).toUpperCase();
            const avatarColor = avatarColorFor(client.companyName || client._id);
            const cp = clientProjects(client._id);
            const latest = cp[0];
            const isSelected = selectedClientIds.includes(client._id);
            const handleActivate = () =>
              isSelectMode ? handleSelectToggle(client._id) : navigate(`/dashboard/clients/${client._id}`);
            return (
              <div
                key={client._id}
                role={isSelectMode ? 'checkbox' : 'link'}
                aria-checked={isSelectMode ? isSelected : undefined}
                aria-label={isSelectMode ? `Select ${client.companyName || 'client'}` : undefined}
                tabIndex={0}
                onClick={handleActivate}
                onKeyDown={(e) => {
                  if (e.target !== e.currentTarget) return;
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleActivate();
                  }
                }}
                className={`focus-ring text-left bg-white rounded-operateLg border transition-all p-5 cursor-pointer group relative ${
                  isSelectMode
                    ? isSelected
                      ? 'border-primary ring-2 ring-primary/40'
                      : 'border-dark/10 hover:border-dark/25'
                    : 'border-dark/10 hover:border-primary hover:shadow-lg'
                }`}
              >
                {isSelectMode ? (
                  <div
                    className={`absolute top-4 right-5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-primary border-primary' : 'border-dark/20 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-dark" />}
                  </div>
                ) : (
                  <>
                    {/* CRUD Actions */}
                    <div className="absolute top-4 right-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(client);
                        }}
                        aria-label="Edit Client"
                        className="focus-ring p-1.5 rounded-lg bg-white text-slateText hover:text-dark hover:bg-dark/5 shadow-sm border border-dark/10"
                        title="Edit Client"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => requestDelete(e, client._id)}
                        aria-label="Delete Client"
                        className="focus-ring p-1.5 rounded-lg bg-white text-slateText hover:text-rose-600 hover:bg-rose-50 shadow-sm border border-dark/10"
                        title="Delete Client"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slateText/40 absolute top-5 right-5" />
                  </>
                )}

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
                      <StatusPill
                        status={projectStage(latest.status)}
                        tone={
                          projectStage(latest.status) === 'completed'
                            ? 'info'
                            : projectStage(latest.status) === 'new'
                            ? 'purple'
                            : 'success'
                        }
                      />
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
                    className="focus-ring flex items-center gap-1 text-dark font-bold hover:underline rounded"
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
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setFormError('');
        }}
        title={editingClientId ? 'Edit Client' : 'Add New Client'}
        subtitle={editingClientId ? 'Update this client profile' : 'Create a new client profile'}
        maxWidth="lg"
      >
        {formError && (
          <div className="p-3 rounded-operateMd bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {formError}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Client Name"
            required
            placeholder="John Doe"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          />

          <Input
            label="Email (optional)"
            type="email"
            placeholder="client@example.com"
            hint="Used to send invoices, documents, and the client-portal invite. Leave it blank if you don't have one — you can add it any time."
            value={formData.billingEmail}
            onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
          />

          <Input
            label="Phone Number"
            placeholder="+1 (555) 123-4567"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <Select
            label="Invoice Currency"
            hint={`Invoices for this client will be shown in ${formData.currency}.`}
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
          >
            {CURRENCY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </Select>

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
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError('');
        }}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Delete client?"
        description="This client record will be permanently removed. This cannot be undone."
        confirmLabel="Delete"
        destructive
        error={deleteError}
      />

      <ConfirmDialog
        isOpen={bulkDeleteConfirmOpen}
        onClose={() => {
          setBulkDeleteConfirmOpen(false);
          setDeleteError('');
        }}
        onConfirm={handleBulkDelete}
        title={`Delete ${selectedClientIds.length} client${selectedClientIds.length === 1 ? '' : 's'}?`}
        description="These client records will be permanently removed. This cannot be undone."
        confirmLabel="Delete"
        destructive
        isSubmitting={bulkDeleting}
        error={deleteError}
      />
    </div>
  );
};
